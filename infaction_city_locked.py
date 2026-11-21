"""Infaction City Placement — locked 2026-11-21.
Runs AFTER locked Location→Zone Placement. Does not mutate its result.
All zones share one city; 'Outside' means outside/around that city.
Standalone locations are the only locations sampled independently.
"""
import random

VERSION = "city-placement-locked-2026-11-21"
ZONE_CITY_OVERRIDES = {"Caravan Camp": 1, "Village": 1, "Necropolis": 1, "Rebel Camp": 1}
STANDALONE_OUTSIDE_PROBABILITY = {0: 1.00, 1: 0.65, 2: 0.40, 3: 0.15, 4: 0.00}

def city_place_world(placement, city_scores, seed=None):
    """Return non-mutating city overlay for a locked placement result.

    city_scores maps Place name to original Book1 Inside City score (0..4).
    Zone score uses the four approved overrides; Location score is unchanged.
    City score for a zone: 0.60*zone + 0.40*mean(direct child locations).
    If zone has no children, use zone score directly.

    All base-score-zero zones are Outside. Add exactly one more when
    R==0, or R==1 and N>=8, or R==2 and N==9 (N=total zones, R=zero zones).
    Extra = minimum 60:40 city score, random exact tie. No quota lottery.
    A standalone location is a placement[loc]['zone'] == None only.
    """
    zones=list(placement["zones"])
    locations=list(placement["locations"])
    assignments=placement["placement"]
    if len(zones) not in (7,8,9):
        raise ValueError("Locked generator expects 7–9 zones")
    if len(set(zones))!=len(zones) or len(set(locations))!=len(locations):
        raise ValueError("Duplicate place names")
    if set(assignments)!=set(locations):
        raise ValueError("Location assignments are incomplete")
    if not set(zones+locations)<=set(city_scores):
        raise ValueError("Missing original City Score for a generated Place")
    def score(place):
        x=int(city_scores[place])
        if x not in STANDALONE_OUTSIDE_PROBABILITY:
            raise ValueError("City Score must be an integer in 0..4")
        return x
    rng=random.Random((placement.get("seed") if seed is None else seed) + 4_100_009)
    zone_scores={z:ZONE_CITY_OVERRIDES.get(z,score(z)) for z in zones}
    children={z:[] for z in zones}
    standalone=[]
    for loc in locations:
        parent=assignments[loc]["zone"]
        if parent is None:
            standalone.append(loc)
        elif parent in children:
            children[parent].append(loc)
        else:
            raise ValueError("Location refers to an unknown parent zone")
    final_score={}
    for z in zones:
        locmean=sum(score(loc) for loc in children[z])/len(children[z]) if children[z] else zone_scores[z]
        final_score[z]=.6*zone_scores[z]+.4*locmean
    outside={z for z in zones if zone_scores[z]==0}
    n,r=len(zones),len(outside)
    needs_extra=(r==0) or (r==1 and n>=8) or (r==2 and n==9)
    extra=None
    if needs_extra:
        eligible=[z for z in zones if z not in outside]
        if eligible:
            best=min(final_score[z] for z in eligible)
            ties=[z for z in eligible if abs(final_score[z]-best)<1e-10]
            extra=rng.choice(ties)
            outside.add(extra)
    zone_output={z:{"city":"Outside" if z in outside else "Inside",
                    "base_city_score":zone_scores[z],
                    "weighted_city_score":round(final_score[z],8),
                    "children_count":len(children[z]),
                    "reason":"mandatory_0" if zone_scores[z]==0 else ("lowest_60_40" if z==extra else "inside")}
                 for z in zones}
    standalone_output={}
    for loc in standalone:
        base=score(loc)
        p=STANDALONE_OUTSIDE_PROBABILITY[base]
        standalone_output[loc]={"city":"Outside" if rng.random()<p else "Inside",
                                "base_city_score":base,"outside_probability":p}
    # Children inherit the zone's city; they are never resampled as standalone.
    location_city={loc:(standalone_output[loc]["city"] if loc in standalone_output
                       else zone_output[assignments[loc]["zone"]]["city"])
                   for loc in locations}
    assert len(zone_output)==n and len(location_city)==len(locations)
    assert all(zone_output[z]["city"]=="Outside" for z in zones if zone_scores[z]==0)
    assert all(v["city"] in ("Inside","Outside") for v in standalone_output.values())
    return {"version":VERSION,"seed":placement.get("seed",seed),
            "zones":zone_output,"standalone_locations":standalone_output,
            "location_city":location_city,"outside_zones":[z for z in zones if z in outside],
            "inside_zones":[z for z in zones if z not in outside],
            "outside_zone_count":len(outside),
            "zone_zero_count":r,"extra_outside_zone":extra}
