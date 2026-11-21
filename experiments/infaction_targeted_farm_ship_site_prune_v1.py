"""Infaction experimental post-Site prune for Farm and Ship/Dock families.

This does NOT modify the locked one-matrix Site generator, placement, or Book1.
Expected input: a list of Site records with:
    {"site": "Farm", "container": "z:Farmland", "children": ["House", ...]}
or a standalone container "inside"/"outside".
Each input child must be unique across all Site records.
"""
from __future__ import annotations
from collections import Counter
from typing import Any

VERSION = "farm-ship-site-prune-experiment-v1"


def prune_sites(
    site_records: list[dict[str, Any]],
    rules: dict[str, Any],
    *,
    proximity: dict[str, dict[str, float]] | None = None,
    enforce_zone_child_proximity: bool = True,
) -> dict[str, Any]:
    """Filter ONLY targeted Farm/Ship/Dock Site relationships.

    Undo invalid grouping by returning children to their original direct
    Zone/standalone container. A Site survives iff it retains >=2 children
    and, if it is a targeted Site under a Zone, that Zone is on the list.
    Does not run an alternate greedy Site search.

    If provided, the original symmetric proximity is used to forbid a
    targeted anchor Location with zero original Proximity to its Zone.
    This check is post-Site only; political placement remains untouched.
    """
    site_parents = {k: set(v) for k, v in rules["site_parent_zone"].items()}
    site_children = {k: set(v) for k, v in rules["site_children"].items()}
    loc_sites = {k: set(v) for k, v in rules["location_valid_site"].items()}
    target_sites = set(rules["site_types_targeted"])
    target_locs = set(rules["location_types_targeted"])
    if not target_sites.issubset(site_parents) or not target_sites.issubset(site_children):
        raise ValueError("Missing targeted Site allowlists")
    if not target_locs.issubset(loc_sites):
        raise ValueError("Missing targeted Location allowlists")
    if enforce_zone_child_proximity and proximity is None:
        raise ValueError("Canonical proximity must be provided for Zone/Location check")

    retained: list[dict[str, Any]] = []
    direct: dict[str, list[str]] = {}
    canceled: list[dict[str, Any]] = []
    removed: list[dict[str, str]] = []
    used_sites: set[str] = set()
    seen_children: set[str] = set()
    initial_children = 0

    def restore(container: str, child: str) -> None:
        direct.setdefault(container, []).append(child)

    for original in site_records:
        site, container = original["site"], original["container"]
        children = list(original["children"])
        if site in used_sites:
            raise ValueError(f"Site reused: {site}")
        used_sites.add(site)
        if len(children) < 2 or len(set(children)) != len(children):
            raise ValueError(f"Invalid input Site children: {site}")
        if not (container.startswith("z:") or container in ("inside", "outside")):
            raise ValueError(f"Unrecognized container: {container}")
        for child in children:
            if child in seen_children:
                raise ValueError(f"Location assigned twice: {child}")
            seen_children.add(child)
        initial_children += len(children)
        zone = container[2:] if container.startswith("z:") else None

        # If this Site type is incompatible with its Zone, cancel in full.
        if site in target_sites and zone is not None and zone not in site_parents[site]:
            for child in children:
                restore(container, child)
            canceled.append({"site": site, "container": container,
                             "reason": "invalid_site_zone", "children": children})
            continue

        eligible: list[str] = []
        rejected: list[str] = []
        for child in children:
            reason = None
            if site in target_sites and child not in site_children[site]:
                reason = "invalid_site_child"
            elif child in target_locs and site not in loc_sites[child]:
                reason = "invalid_location_site"
            elif (
                enforce_zone_child_proximity
                and zone is not None
                and child in target_locs
                and float(proximity.get(child, {}).get(zone, 0)) <= 0
            ):
                reason = "target_location_zone_zero_proximity"
            if reason is not None:
                rejected.append(child)
                removed.append({"site": site, "container": container,
                                "child": child, "reason": reason})
            else:
                eligible.append(child)

        if len(eligible) < 2:
            for child in children:
                restore(container, child)
            canceled.append({"site": site, "container": container,
                             "reason": "fewer_than_two_children", "children": children})
        else:
            for child in rejected:
                restore(container, child)
            retained.append({**original, "children": eligible})

    # Each selected Location is still present exactly once; no Site created.
    after = [child for record in retained for child in record["children"]]
    after += [child for values in direct.values() for child in values]
    if Counter(after) != Counter(seen_children):
        raise AssertionError("Pruning lost or duplicated a selected Location")
    if len(retained) + len(canceled) != len(site_records):
        raise AssertionError("Pruning changed total Site record accounting")
    return {
        "version": VERSION,
        "sites": retained,
        "direct_restored": direct,
        "canceled": canceled,
        "removed_memberships": removed,
        "stats": {
            "input_sites": len(site_records),
            "surviving_sites": len(retained),
            "canceled_sites": len(canceled),
            "input_children": initial_children,
            "surviving_grouped_children": sum(len(s["children"]) for s in retained),
            "direct_restored_children": sum(map(len, direct.values())),
            "removed_memberships": len(removed),
        },
    }
