"""Infaction naming v3: city-only Animal Flavor, simple ownership names.

City: [Government Animal]'s [Flavor] City; existing weighted Impression
selection and post-selection exact-word redundancy apply only to City.
Owned Zone/Site/Location: Single = The [Animal]'s [Place],
Dual = The [Place], None = [Place]. Root/The Land unchanged.
All Place IDs, topology, access labels and source names remain unchanged.
"""
from __future__ import annotations
import hashlib
import re

VERSION = "infaction-place-naming-v3-city-flavor-2026-11-22"
SEGMENTS = frozenset(("Power", "Mystery", "Nature", "Community", "Commerce", "Prestige"))
CITY_TAGS = ("Power", "Community", "Commerce", "Prestige")

def _unit(seed, place_id, purpose="flavor"):
    raw = f"{seed}:{place_id}:{purpose}:naming-v2".encode("utf8")
    return int.from_bytes(hashlib.blake2b(raw, digest_size=8).digest(), "big") / 2**64

def _dynamic_weight(term, base_name, place_tags, flavor_tags):
    if term["suitable_for"] == "Item":
        return 0
    return 3 if set(flavor_tags[term["word"]]).intersection(place_tags) else 1

def _is_redundant(flavor, base_name):
    """Case-insensitive exact word/phrase match; plural remains intentionally distinct."""
    if not flavor:
        return False
    tokens = re.findall(r"[^\W_]+", base_name.casefold(), flags=re.UNICODE)
    flavor_tokens = re.findall(r"[^\W_]+", flavor.casefold(), flags=re.UNICODE)
    return bool(flavor_tokens) and any(
        tokens[i:i+len(flavor_tokens)] == flavor_tokens
        for i in range(len(tokens)-len(flavor_tokens)+1)
    )


def _post_selection(flavor, weight, base_name):
    """Drop a selected redundant Flavor, never reroll or remove the Animal prefix."""
    if _is_redundant(flavor, base_name):
        return None, 0, True
    return flavor, weight, False


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
    assert len(records) >= 109 and len(f_tags) == len(records) and len(p_tags) == 118
    assert len({r["word"] for r in records}) == len(records), "Duplicate Flavor words"
    assert set(f_tags) == {r["word"] for r in records}
    assert set(impressions["segments"]) == SEGMENTS
    assert len(set(p_tags)) == 118
    assert all(1 <= len(tags) <= len(SEGMENTS) and len(tags) == len(set(tags))
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
        "redundancy_suppressed": 0,
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
        redundant = False
        picked_flavor = None
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
            picked_flavor = flavor
            flavor, weight, redundant = _post_selection(flavor, weight, base)
            display = animals[0] + "'s " + (flavor + " " if flavor else "") + base
            stats["city"] += 1
            if flavor:
                stats["city_weight_" + str(weight)] += 1
        elif role in ("root", "land"):
            display = base
        elif kind == "single":
            faction_ids = owner["factions"]
            assert len(faction_ids) == 1
            animals = [byid[faction_ids[0]]["animal"]]
            display = "The " + animals[0] + "'s " + base
            stats["single"] += 1
        elif kind == "dual":
            faction_ids = owner["factions"]
            assert len(faction_ids) == 2 and len(set(faction_ids)) == 2
            animals = [byid[i]["animal"] for i in faction_ids]
            display = "The " + base
            stats["dual_without_overlap"] += 1
        else:
            assert kind == "none" and not owner["factions"]
            display = base
            stats["none"] += 1
        stats["redundancy_suppressed"] += int(redundant)
        node["display_name"] = display
        node["attributes"]["naming"] = {
            "version": VERSION, "base_name": base, "display_name": display,
            "flavor": flavor, "weight": weight,
            "selected_flavor": picked_flavor, "redundancy_suppressed": redundant,
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
