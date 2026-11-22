"""Infaction v0.4.8 effective-selection and post-choice compatibility layer.

Keeps archived notebooks and Book1 immutable. Installs the approved 71-Location
effective pool, current modifiers, Function hard-minimum repair, and only the
four named political zero-Proximity exceptions.
"""
from __future__ import annotations

import copy
import random

VERSION = "infaction-v0.4.8-integrated-selection-2026-11-22"
EFFECTIVE_REMOVED = frozenset(("Fortress", "Palace", "Mine", "Factory"))
LOCATION_MODIFIERS = {
    "Hideout": -9, "Camp": -8, "Tunnel": -3, "Crypt": -2,
    "Shelter": -1, "Research Facility": 9,
}
POLITICAL_ZERO_EXCEPTIONS = frozenset(("Ship", "Dock", "Farm", "Farmland"))


def install_location_generation(ns, recovered, proximity, repair_seed):
    """Install only the approved selection changes in a historical generator namespace.

    Reuses the exact historical 3-stage score and random-choice mechanics, with
    the effective candidate pool and modifier replacement. Repair always samples
    uniformly among unused qualifying Location names and may exceed target 30.
    """
    records = {r["place"]: r for r in recovered["records"]}
    assert "Town Hall" in records
    original = ns["LOCATION_DATA"]["locations"]
    assert len(original) == 74
    assert EFFECTIVE_REMOVED.issubset(original)
    assert "Town Hall" not in original
    effective = copy.deepcopy({k: v for k, v in original.items()
                               if k not in EFFECTIVE_REMOVED})
    town = records["Town Hall"]
    effective["Town Hall"] = {
        "function": copy.deepcopy(town["function"]),
        "type": copy.deepcopy(town["type"]),
        "base": copy.deepcopy(town["base"]),
        "place": copy.deepcopy(proximity["Town Hall"]),
        "score": town["score"],
    }
    assert len(effective) == 71 and "Meeting Hall" in effective
    assert all(set(v["place"]) >= set(proximity) for v in effective.values())
    ns["LOCATION_DATA"] = {**ns["LOCATION_DATA"], "location_count": 71,
                           "locations": effective}
    ns["LOCATION_CANDIDATES"] = effective
    ns["LOCATION_SCORE_MODIFIERS"] = dict(LOCATION_MODIFIERS)
    original_generate = ns["generate_locations"]
    quotas = ns["LOCATION_QUOTAS"]
    assert len(quotas) == 14
    def integrated_generate(world, seed=None, target=None):
        initial = original_generate(world, seed=seed, target=target)
        chosen = [r["place"] for r in initial["locations"]]
        counts = dict(initial["function_counts"])
        rng = random.Random(repair_seed)
        while True:
            deficient = [k for k, q in quotas.items() if counts[k] < q["min"]]
            if not deficient:
                break
            function = deficient[0]
            unused = sorted(
                name for name, ref in effective.items()
                if name not in chosen and ref["function"][function] >= 75
            )
            if not unused:
                raise AssertionError(
                    f"Function repair impossible: {function}, counts={counts}"
                )
            picked = rng.choice(unused)
            chosen.append(picked)
            for key, score in effective[picked]["function"].items():
                if score >= 75:
                    counts[key] += 1
            initial["locations"].append({
                "sequence": len(chosen), "place": picked, "stage": "function_repair",
                "score": None, "modifier": 0,
                "parts": {"deficient_function": function,
                          "uniform_unused_eligible": len(unused)},
            })
        initial["function_counts"] = counts
        initial["missing_minimum"] = {
            k: q["min"]-counts[k] for k, q in quotas.items()
            if counts[k] < q["min"]
        }
        initial["excess_maximum"] = {
            k: counts[k]-q["max"] for k, q in quotas.items()
            if counts[k] > q["max"]
        }
        initial["effective_pool"] = 71
        initial["initial_target"] = initial["target"]
        initial["repair_count"] = len(chosen)-initial["target"]
        assert not initial["missing_minimum"]
        assert len(chosen) == len(set(chosen))
        assert 20 <= initial["target"] <= 30
        return initial
    ns["generate_locations"] = integrated_generate
    return {"version": VERSION, "eligible_location_count": len(effective),
            "function_count": len(quotas),
            "modifiers": dict(LOCATION_MODIFIERS)}


def install_political_exception(placement_module, original_source):
    """Patch only the political selected-Zone zero-Proximity exception.

    A rejected stage-1 chosen Zone is NOT replaced by another political Zone.
    The Location proceeds to the original stage-2 geographic calculation.
    """
    source = original_source
    anchor1 = '    assignments={}\n    for pass_name in ("exact","mixed"):'
    replacement1 = '    assignments={}\n    political_rejected=set()\n    for pass_name in ("exact","mixed"):'
    anchor2 = '            if loc in assignments: continue'
    replacement2 = '            if loc in assignments or loc in political_rejected: continue'
    anchor3 = '''            if candidates:
                assignments[loc]={"zone":rng.choice(candidates), "stage":1,
                                  "reason":pass_name, "candidates":candidates}'''
    replacement3 = '''            if candidates:
                chosen_zone=rng.choice(candidates)
                if (loc in ("Ship","Dock","Farm","Farmland") and
                    float(location_data["locations"][loc]["place"][chosen_zone]) == 0):
                    political_rejected.add(loc)
                    continue
                assignments[loc]={"zone":chosen_zone, "stage":1,
                                  "reason":pass_name, "candidates":candidates}'''
    for old, new in ((anchor1, replacement1), (anchor2, replacement2),
                     (anchor3, replacement3)):
        if source.count(old) != 1:
            raise AssertionError("Historical placement source changed at approved exception")
        source = source.replace(old, new)
    exec(compile(source, "infaction_placement_v048_effective.py", "exec"),
         placement_module.__dict__)
    placement_module.VERSION = VERSION
    return {"version": VERSION, "exception_names": sorted(POLITICAL_ZERO_EXCEPTIONS)}
