"""Infaction Place naming postprocessor (2026-11-22 design lock).

Uses original curated 109 Animal association words with global 0/1/3 weights.
Does not alter Place identities, ownership, geography, access node names, nor
Faction naming. City always uses Government Animal, NOT a political-owner claim.

Output: place nodes keep .name as original/base_name and gain .display_name.
Tree nodes gain matching .display_name; never decorate access nodes.
"""
from __future__ import annotations
import hashlib

VERSION = "animal-place-naming-v1-2026-11-22"

def _unit(seed, place_id, purpose="flavor"):
    raw = f"{seed}:{place_id}:{purpose}:naming-v1".encode("utf8")
    return int.from_bytes(hashlib.blake2b(raw, digest_size=8).digest(), "big") / 2**64

def _pick(seed, place_id, animal_ids, terms):
    """Deterministic weighted random from intersection of eligible Flavor sets."""
    pool = [
        (term["word"], int(term["weight"]))
        for term in terms
        if int(term["weight"]) > 0
        and all(animal in term["animals"] for animal in animal_ids)
    ]
    pool.sort(key=lambda x: x[0])
    if not pool:
        return None
    total = sum(weight for _, weight in pool)
    target = _unit(seed, place_id) * total
    for word, weight in pool:
        target -= weight
        if target < 0:
            return word
    return pool[-1][0]

def apply(world, vocabulary):
    records = vocabulary["records"]
    assert len(records) == 109, "Expected 109 original Animal-associated vocabulary entries"
    assert len({r["word"] for r in records}) == len(records), "Duplicate Flavor"
    assert all(r["weight"] in (0, 1, 3) for r in records), "Unexpected Flavor weight"
    assert all((r["suitable_for"] == "Item") == (r["weight"] == 0) for r in records), "Item-only Flavor leaked to Place names"
    factions = world["factions"]
    byid = {f["id"]: f for f in factions}
    assert len(byid) == 6 and len({f["animal"] for f in factions}) == 6
    government = next(f for f in factions if "Government" in f["types"])
    geo = world["places"]["nodes"]
    seed = world["seed"]
    stats = {"city": 0, "single": 0, "dual_with_overlap": 0,
             "dual_without_overlap": 0, "none": 0, "places_named": 0,
             "unmodified": 0}
    for pid, node in geo.items():
        base = node["name"]
        node["base_name"] = base
        role = node["generation_role"]
        owner = node["attributes"].get("political_ownership", {"kind": "none", "factions": []})
        kind = owner["kind"]
        flavor = None
        animal_ids = []
        if role == "city":
            # Existing City rule: Government Animal possessive + Animal Flavor + City.
            animal_ids = [government["animal"]]
            flavor = _pick(seed, pid, animal_ids, records)
            display = f"{animal_ids[0]}'s {flavor} {base}" if flavor else base
            stats["city"] += 1
        elif role == "root":
            display = base
        elif kind == "single":
            faction_id = owner["factions"][0]
            animal_ids = [byid[faction_id]["animal"]]
            flavor = _pick(seed, pid, animal_ids, records)
            display = f"{animal_ids[0]}'s {flavor} {base}" if flavor else base
            stats["single"] += 1
        elif kind == "dual":
            faction_ids = owner["factions"]
            assert len(faction_ids) == 2 and len(set(faction_ids)) == 2
            animal_ids = [byid[faction_id]["animal"] for faction_id in faction_ids]
            flavor = _pick(seed, pid, animal_ids, records)
            display = f"{flavor} {base}" if flavor else base
            stats["dual_with_overlap" if flavor else "dual_without_overlap"] += 1
        else:
            assert kind == "none" and not owner["factions"]
            display = base
            stats["none"] += 1
        node["display_name"] = display
        node["attributes"]["naming"] = {
            "version": VERSION, "base_name": base, "display_name": display,
            "flavor": flavor, "animal_ids": animal_ids,
            "source": "government_city" if role == "city" else kind,
        }
        stats["places_named" if display != base else "unmodified"] += 1
    def update_tree(node):
        source = geo[node["id"]]
        node["display_name"] = source["display_name"]
        node["base_name"] = source["base_name"]
        node["attributes"]["naming"] = source["attributes"]["naming"]
        for child in node["children"]:
            update_tree(child)
    update_tree(world["places"]["tree"])
    # Navigation access nodes remain [original Place] [Gate/Checkpoint/etc].
    for access in world.get("access_nodes", []):
        dest = geo[access["to_place_id"]]
        assert access["name"].startswith(dest["base_name"] + " ")
        assert dest["display_name"] not in access["name"] or dest["display_name"] == dest["base_name"]
    world["status"]["place_naming"] = VERSION
    world["place_naming"] = {"version": VERSION,
        "vocabulary_version": vocabulary["version"], "summary": stats}
    assert all(geo[k]["name"] == geo[k]["base_name"] for k in geo)
    assert all(x in geo for x in world["places"]["spatial_relations"][0].values()
               if isinstance(x, str) and x in geo) if world["places"]["spatial_relations"] else True
    return world
