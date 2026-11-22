"""Infaction Place naming: six-segment multi-tag dynamic weighted selector.

Original Animal associations from the 109-term vocabulary are preserved.
Place and Flavor receive 1-3 impression tags; intersection gives weight 3,
no intersection gives 1, Item-only/not-grammatical gives 0.
Dual ownership requires shared Animal association AND weight 3.
Original geographic name, IDs, access gates, ownership and topology unchanged.
"""
from __future__ import annotations
import hashlib

VERSION = "animal-place-naming-v2-impression-tags-2026-11-22"
SEGMENTS = frozenset(("Power", "Mystery", "Nature", "Community", "Commerce", "Prestige"))
CITY_TAGS = ("Power", "Community", "Commerce", "Prestige")

def _unit(seed, place_id, purpose="flavor"):
    raw = f"{seed}:{place_id}:{purpose}:naming-v2".encode("utf8")
    return int.from_bytes(hashlib.blake2b(raw, digest_size=8).digest(), "big") / 2**64

def _dynamic_weight(term, base_name, place_tags, flavor_tags):
    if term["suitable_for"] == "Item":
        return 0
    if term["word"].lower() in base_name.lower().split():
        return 0
    return 3 if set(flavor_tags[term["word"]]).intersection(place_tags) else 1

def _pick(seed, place_id, animal_ids, records, base_name, place_tags, flavor_tags,
          dual=False):
    pool = []
    for term in records:
        if not all(a in term["animals"] for a in animal_ids):
            continue
        weight = _dynamic_weight(term, base_name, place_tags, flavor_tags)
        if weight == 0 or (dual and weight != 3):
            continue
        pool.append((term["word"], weight))
    pool.sort(key=lambda x: x[0])
    if not pool:
        return None, 0
    target = _unit(seed, place_id) * sum(w for _, w in pool)
    for word, weight in pool:
        target -= weight
        if target < 0:
            return word, weight
    return pool[-1]

def apply(world, vocabulary, impressions):
    records = vocabulary["records"]
    f_tags = impressions["flavor_tags"]
    p_tags = impressions["place_tags"]
    assert len(records) == 109 and len(f_tags) == 109 and len(p_tags) == 118
    assert set(f_tags) == {r["word"] for r in records}
    assert set(impressions["segments"]) == SEGMENTS
    assert len(set(p_tags)) == 118
    assert all(1 <= len(tags) <= 3 and len(tags) == len(set(tags))
               and set(tags).issubset(SEGMENTS)
               for tags in list(f_tags.values()) + list(p_tags.values()))
    assert all(r["suitable_for"] in ("Both", "Location", "Item") for r in records)
    factions = world["factions"]
    byid = {f["id"]: f for f in factions}
    assert len(byid) == 6 and len({f["animal"] for f in factions}) == 6
    government = next(f for f in factions if "Government" in f["types"])
    geo = world["places"]["nodes"]
    seed = world["seed"]
    stats = {
        "city": 0, "single": 0, "dual_with_overlap": 0,
        "dual_without_overlap": 0, "none": 0, "places_named": 0,
        "unmodified": 0, "city_weight_3": 0, "city_weight_1": 0,
        "single_weight_3": 0, "single_weight_1": 0,
    }
    for pid, node in geo.items():
        base = node.get("base_name", node["name"])
        node["base_name"] = base
        role = node["generation_role"]
        owner = node["attributes"].get(
            "political_ownership", {"kind": "none", "factions": []})
        kind = owner["kind"]
        flavor = None
        weight = 0
        animals = []
        place_key = impressions["derived_place_aliases"].get(base, base)
        if role == "city":
            tags = list(CITY_TAGS)
        elif role in ("zone", "site", "location"):
            tags = p_tags[place_key]
        else:
            tags = []
        if role == "city":
            animals = [government["animal"]]
            flavor, weight = _pick(seed, pid, animals, records, base, tags, f_tags)
            display = animals[0] + "'s " + flavor + " " + base if flavor else base
            stats["city"] += 1
            if flavor:
                stats["city_weight_" + str(weight)] += 1
        elif role in ("root", "land"):
            display = base
        elif kind == "single":
            faction_ids = owner["factions"]
            assert len(faction_ids) == 1
            animals = [byid[faction_ids[0]]["animal"]]
            flavor, weight = _pick(seed, pid, animals, records, base, tags, f_tags)
            display = animals[0] + "'s " + flavor + " " + base if flavor else base
            stats["single"] += 1
            if flavor:
                stats["single_weight_" + str(weight)] += 1
        elif kind == "dual":
            faction_ids = owner["factions"]
            assert len(faction_ids) == 2 and len(set(faction_ids)) == 2
            animals = [byid[i]["animal"] for i in faction_ids]
            flavor, weight = _pick(
                seed, pid, animals, records, base, tags, f_tags, dual=True)
            display = flavor + " " + base if flavor else base
            stats["dual_with_overlap" if flavor else "dual_without_overlap"] += 1
            assert weight in (0, 3)
        else:
            assert kind == "none" and not owner["factions"]
            display = base
            stats["none"] += 1
        node["display_name"] = display
        node["attributes"]["naming"] = {
            "version": VERSION, "base_name": base, "display_name": display,
            "flavor": flavor, "weight": weight,
            "impression_tags": list(tags), "animal_ids": animals,
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
    # Gate/Checkpoint objects retain original geographic labels.
    for access in world.get("access_nodes", []):
        target = geo[access["to_place_id"]]
        assert access["name"].startswith(target["base_name"] + " ")
    world["status"]["place_naming"] = VERSION
    world["place_naming"] = {
        "version": VERSION, "vocabulary_version": vocabulary["version"],
        "impression_version": impressions["version"], "summary": stats,
    }
    assert all(n["name"] == n["base_name"] for n in geo.values())
    return world
