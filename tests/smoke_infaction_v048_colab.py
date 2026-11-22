"""End-to-end executable smoke test for Infaction v0.4.8.

Run from the repository root with internet access:
    python tests/smoke_infaction_v048_colab.py

Uses the same notebook cells as Colab, without requiring hosted Colab.
This is an executable test script, not a claim of observed execution.
"""
import json
from pathlib import Path

NOTEBOOK = Path("notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb")


def main():
    notebook = json.loads(NOTEBOOK.read_text(encoding="utf-8"))
    assert len(notebook["cells"]) == 4
    scope = {"__name__": "__main__"}
    # Cell 0 is documentation; cells 1–3 perform generation through export.
    for index in (1, 2, 3):
        source = "".join(notebook["cells"][index]["source"])
        exec(compile(source, f"Infaction_v048_cell_{index}", "exec"), scope)

    world = scope["scope"]["world"]
    placement = scope["scope"]["placed"]
    city = scope["scope"]["result"]
    sites = scope["site_result"]
    exported = scope["full_world"]
    seeds = scope["scope"]["SEEDS"]

    expected_stages = {
        "faction", "zone", "location", "function_repair", "placement",
        "city", "site", "site_postprocess", "access", "naming",
    }
    assert set(seeds) == expected_stages
    assert len(set(seeds.values())) == len(seeds)
    assert exported["generation_seeds"] == seeds
    assert exported["place_naming"]["vocabulary_version"] == "animal-place-flavor-v2-active-2026-11-22"
    assert exported["place_naming"]["impression_version"] == "impression-tags-v2-active-2026-11-22"
    assert "redundancy_suppressed" in exported["place_naming"]["summary"]
    by_id = {f["id"]: f for f in exported["factions"]}
    government = next(f for f in exported["factions"] if "Government" in f["types"])
    nodes = exported["places"]["nodes"]
    for node in nodes.values():
        naming = node["attributes"].get("naming", {})
        base = node["base_name"]
        role = node["generation_role"]
        ownership = node["attributes"].get("political_ownership", {"kind": "none", "factions": []})
        if role == "city":
            assert node["display_name"] == "The " + government["animal"] + "'s City"
            assert naming["flavor"] is None
        elif role in ("root", "land"):
            assert node["display_name"] == base
        elif ownership["kind"] == "single":
            animal = by_id[ownership["factions"][0]]["animal"]
            assert node["display_name"] == "The " + animal + "'s " + base
            assert naming["flavor"] is None
        elif ownership["kind"] == "dual":
            assert node["display_name"] == "The " + base
            assert naming["flavor"] is None
        else:
            assert ownership["kind"] == "none"
            assert node["display_name"] == base
            assert naming["flavor"] is None
    city_gate = [gate for gate in exported["access_nodes"]
                 if gate["to_place_id"] == "city"]
    assert len(city_gate) == 1
    assert city_gate[0]["type"] == "Gatehouse"
    assert city_gate[0]["permanent"] is True
    assert city_gate[0]["locked"] == nodes["city"]["attributes"]["hidden_restricted"]["restricted"]
    assert exported["generator_version"] == "0.4.8"
    assert len(exported["factions"]) == 6
    assert len(world["zone_generation"]["zones"]) in (7, 8, 9)
    assert world["location_generation"]["effective_pool"] == 71
    assert world["location_generation"]["missing_minimum"] == {}
    original_city_scores = {
        place: int(record["inside_city_original"])
        for place, record in scope["scope"]["MASTER"]["raw"]["place_catalog"].items()
    }
    assert len(original_city_scores) == 118
    assert "Town Hall" in original_city_scores
    assert (set(placement["zones"]) | set(placement["locations"])) <= set(original_city_scores)
    assert scope["_site_run_token"] == scope["scope"]["run_token"]
    assert all(site["parent_zone"] is None or site["parent_zone"] in placement["zones"]
               for site in sites["sites"])
    locations = placement["locations"]
    assert len(locations) >= world["location_generation"]["target"]
    assert len(locations) == len(set(locations))
    assert not set(locations).intersection({"Fortress", "Palace", "Mine", "Factory"})
    assert set(placement["placement"]) == set(locations)
    assert set(city["location_city"]) == set(locations)
    assert sites["grouped_location_count"] + sites["ungrouped_location_count"] == len(locations)
    proximity = scope["scope"]["SITE_AFFINITY"]
    for place in ("Ship", "Dock", "Farm", "Farmland"):
        if place in placement["placement"]:
            assignment = placement["placement"][place]
            if assignment["stage"] == 1:
                assert proximity[place][assignment["zone"]] > 0
    nodes = exported["places"]["nodes"]
    assert all(pid == "land" or node["parent_id"] in nodes
               for pid, node in nodes.items())
    assert all(node.get("display_name") for node in nodes.values())
    assert exported["hidden_restricted"]
    print("PASS: integrated v0.4.8 end-to-end world/export invariants")
    print("SEEDS:", seeds)
    print("PLACES:", exported["places"]["counts"])


if __name__ == "__main__":
    main()
