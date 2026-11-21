"""Infaction locked Location -> Zone placement baseline, 2026-11-21.
Pure postprocessor: never mutates faction, zone or location generation.
No forbidden pairs, physical cutoff, quotas, or fallback.
"""
from __future__ import annotations
import math
import random

VERSION = "placement-locked-2026-11-21"
RULES = {"political_A": .5, "political_B": .5,
         "geographic_A": .7, "geographic_B": .3,
         "single_zone": 32, "single_location": 28,
         "dual_zone": 26, "dual_location": 23}

def _row_rebase(rows):
    out = []
    for row in rows:
        s = sum(row)
        out.append([100.0*x/s for x in row] if s > 0 else [100.0/len(row)]*len(row))
    return out

def two_way(raw):
    """Return A and B (each row sums to 100) from nonnegative rows.
    B column-normalizes before row-rebasing, including Outside as a column.
    Zero-total columns have zero contribution. A fully zero row falls back to
    a uniform share to avoid a division by zero; normally Outside prevents it.
    """
    if not raw: return [], []
    if not raw[0]: raise ValueError("Need at least one column")
    if any(len(row) != len(raw[0]) or any(x < 0 for x in row) for row in raw):
        raise ValueError("Expected rectangular nonnegative matrix")
    a = _row_rebase(raw)
    totals = [sum(row[j] for row in raw) for j in range(len(raw[0]))]
    contrib = [[100.0*x/totals[j] if totals[j]>0 else 0.0
                for j,x in enumerate(row)] for row in raw]
    return a, _row_rebase(contrib)

def _score_faction(f, ref):
    types = f["types"]
    t1 = float(ref["type"][types[0]])
    t2 = float(ref["type"][types[1]]) if len(types)>1 else t1
    base = float(ref["base"][f["base"]])
    return ((t1+t2+base)/3 + (t1*t2*base)**(1/3))/2

def _label(row, kind):
    order = sorted(range(6), key=lambda i: (-row[i],i))
    f1,f2,f3 = (row[i] for i in order[:3])
    neutral = row[6]
    if (f1 >= (32 if kind=="Zone" else 28) and f1-f2 >= 7 and f1>neutral):
        return {"kind":"single", "factions":[order[0]]}
    if (f1 >= (26 if kind=="Zone" else 23) and f2>=19 and
        f1-f2<=8 and f2-f3>=3 and f2>neutral):
        return {"kind":"dual", "factions":sorted(order[:2])}
    return {"kind":"none", "factions":[]}

def place_world(world, zone_data, location_data, neutral_affinity, seed=None):
    """Input:
    world.factions [{types:[...],base:...}],
    world.zone_generation.zones [{place:...}],
    world.location_generation.locations [{place:...}].
    zone_data.zones[zone] and location_data.locations[location] carry 'type'/'base'.
    location_data.locations[loc]['place'][zone] is geographic raw affinity.
    neutral_affinity is a {place:score} mapping of the *locked static v2* values.
    Output carries input world by reference plus new labels and per-location results.
    """
    factions = world["factions"]
    if len(factions)!=6: raise ValueError("Exactly 6 factions required")
    zones=[z["place"] for z in world["zone_generation"]["zones"]]
    locs=[l["place"] for l in world["location_generation"]["locations"]]
    places=[("Zone",p) for p in zones]+[("Location",p) for p in locs]
    raw=[]
    for kind,name in places:
        ref=(zone_data["zones"] if kind=="Zone" else location_data["locations"])[name]
        raw.append([_score_faction(f,ref) for f in factions]+[float(neutral_affinity[name])])
    pa,pb=two_way(raw)
    political=[[.5*x+.5*y for x,y in zip(a,b)] for a,b in zip(pa,pb)]
    labels={name:_label(v,kind) for (kind,name),v in zip(places,political)}
    political_details={name:{"role":kind,"raw":r,"A":a,"B":b,"AB":s,
                              "label":labels[name]}
                       for (kind,name),r,a,b,s in zip(places,raw,pa,pb,political)}
    rng=random.Random(seed if seed is not None else world.get("seed",0))
    assignments={}
    for pass_name in ("exact","mixed"):
        for loc in locs:
            if loc in assignments: continue
            l=labels[loc]
            if l["kind"]=="none": continue
            candidates=[]
            for zone in zones:
                z=labels[zone]
                if z["kind"]=="none" or not set(l["factions"]) & set(z["factions"]):
                    continue
                exact=l==z
                mixed=l["kind"]!=z["kind"]
                if (pass_name=="exact" and exact) or (pass_name=="mixed" and mixed):
                    candidates.append(zone)
            if candidates:
                assignments[loc]={"zone":rng.choice(candidates), "stage":1,
                                  "reason":pass_name, "candidates":candidates}
    remaining=[loc for loc in locs if loc not in assignments]
    if remaining:
        geo=[[float(location_data["locations"][loc]["place"][z]) for z in zones]
             for loc in remaining]
        if any(x<0 for row in geo for x in row):
            raise ValueError("Negative affinity is not supported: no forbidden metric")
        with_outside=[row+[100.0-max(row)] for row in geo]
        ga,gb=two_way(with_outside)
        for i,loc in enumerate(remaining):
            final=[.7*x+.3*y for x,y in zip(ga[i],gb[i])]
            top=max(final)
            ties=[j for j,v in enumerate(final) if abs(v-top)<1e-10]
            chosen=rng.choice(ties)
            zone=zones[chosen] if chosen<len(zones) else None
            assignments[loc]={"zone":zone,"stage":2,
                "reason":"outside" if zone is None else "affinity",
                "raw_affinity":with_outside[i][chosen],
                "A":ga[i][chosen],"B":gb[i][chosen],"score":final[chosen],
                "candidates":list(zones)+["Outside"]}
    return {"version":VERSION,"seed":world.get("seed",seed),
            "factions":factions,"zones":zones,"locations":locs,
            "political":political_details,"placement":assignments,
            "outside":[loc for loc in locs if assignments[loc]["zone"] is None],
            "by_zone":{zone:[loc for loc in locs if assignments[loc]["zone"]==zone]
                       for zone in zones}}
