"""Infaction v4: concise display naming by political ownership only.

City: The [Government Animal]'s City.
Single Zone/Site/Location: The [Owner Animal]'s [Place].
Dual Zone/Site/Location: The [Place].
None Zone/Site/Location: [Place].
Root/Land: original name.

No Flavor or Impression input is needed. Place IDs, base names, ownership,
access-node labels, geographic parentage and Game World data stay unchanged.
Historical vocabulary remains archived separately for possible future use.
"""
from __future__ import annotations

VERSION = "infaction-place-naming-v4-no-place-flavor-2026-11-22"


def apply(world, vocabulary=None, impressions=None):
    """Apply display names to flat nodes and nested tree, preserving original IDs."""
    factions = world["factions"]
    byid = {f["id"]: f for f in factions}
    assert len(byid) == 6 and len({f["animal"] for f in factions}) == 6
    government = next(f for f in factions if "Government" in f["types"])
    geo = world["places"]["nodes"]
    stats = {"city": 0, "single": 0, "dual": 0, "none": 0,
             "unmodified": 0, "places_named": 0}

    for pid, node in geo.items():
        base = node.get("base_name", node["name"])
        node["base_name"] = base
        role = node["generation_role"]
        owner = node["attributes"].get(
            "political_ownership", {"kind": "none", "factions": []})
        kind = owner["kind"]
        animals = []
        if role == "city":
            animals = [government["animal"]]
            display = "The " + animals[0] + "'s " + base
            stats["city"] += 1
        elif role in ("root", "land"):
            display = base
        elif kind == "single":
            owners = owner["factions"]
            assert len(owners) == 1
            animals = [byid[owners[0]]["animal"]]
            display = "The " + animals[0] + "'s " + base
            stats["single"] += 1
        elif kind == "dual":
            owners = owner["factions"]
            assert len(owners) == 2 and len(set(owners)) == 2
            animals = [byid[i]["animal"] for i in owners]
            display = "The " + base
            stats["dual"] += 1
        else:
            assert kind == "none" and not owner["factions"]
            display = base
            stats["none"] += 1

        node["display_name"] = display
        node["attributes"]["naming"] = {
            "version": VERSION, "base_name": base, "display_name": display,
            "flavor": None, "weight": 0, "selected_flavor": None,
            "redundancy_suppressed": False, "impression_tags": [],
            "animal_ids": animals,
            "source": "government_city" if role == "city" else kind,
        }
        stats["places_named" if display != base else "unmodified"] += 1

    def update_tree(node):
        source = geo[node["id"]]
        node["base_name"] = source["base_name"]
        node["display_name"] = source["display_name"]
        node["attributes"]["naming"] = source["attributes"]["naming"]
        for child in node["children"]:
            update_tree(child)

    update_tree(world["places"]["tree"])
    # Structural access labels remain based on unchanged geographic names.
    for access in world.get("access_nodes", []):
        target = geo[access["to_place_id"]]
        assert access["name"].startswith(target["base_name"] + " ")

    world["status"]["place_naming"] = VERSION
    world["place_naming"] = {
        "version": VERSION,
        "vocabulary_version": None,
        "impression_version": None,
        "summary": stats,
    }
    assert all(n["name"] == n["base_name"] for n in geo.values())
    return world
