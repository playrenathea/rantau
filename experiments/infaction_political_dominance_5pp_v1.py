"""Political dominance overlay: Zone + Site + Location, source-backed and auditable.

Does NOT change locked placement. Uses original 50:50 A/B, then Faction-selector
5 percentage-point contribution with 95% rebasing, BEFORE Single/Dual tests.
Site threshold is provisional Location thresholds until separately approved.
No fabricated Type/Base affinities for missing Scale-3 Places.
"""
from __future__ import annotations
from collections import Counter
from math import prod

VERSION="political-dominance-zone-site-location-5pp-experiment-v1"
ROLE_THRESHOLDS={
  "zone":{"single_min":32,"dual_min":26},
  "location":{"single_min":28,"dual_min":23},
  "site":{"single_min":28,"dual_min":23}, # provisional
}
def _row_rebase(matrix):
    out=[]
    for row in matrix:
        s=sum(row)
        out.append([100*x/s for x in row] if s else [100/len(row)]*len(row))
    return out

def two_way(raw):
    a=_row_rebase(raw)
    totals=[sum(row[j] for row in raw) for j in range(len(raw[0]))]
    b0=[[100*x/totals[j] if totals[j] else 0 for j,x in enumerate(row)] for row in raw]
    return a,_row_rebase(b0)

def affinity(faction, ref):
    types=faction["types"]
    t1=float(ref["type"][types[0]])
    t2=float(ref["type"][types[1]]) if len(types)>1 else t1
    b=float(ref["base"][faction["base"]])
    return .5*((t1+t2+b)/3+(t1*t2*b)**(1/3))

def classify(row,kind):
    order=sorted(range(6),key=lambda i:(-row[i],i))
    top,second,third=(row[i] for i in order[:3])
    neutral=row[6]
    rules=ROLE_THRESHOLDS[kind]
    if top>=rules["single_min"] and top-second>=7 and top>neutral:
        return {"kind":"single","factions":[f"F{order[0]+1}"]}
    if (top>=rules["dual_min"] and second>=19 and top-second<=8
            and second-third>=3 and second>neutral):
        return {"kind":"dual","factions":sorted([f"F{order[0]+1}",f"F{order[1]+1}"])}
    return {"kind":"none","factions":[]}

def calculate(world, site_grouping, zone_refs, location_refs, neutral_affinity,
              extra_site_refs=None, require_complete=False):
    factions=world["factions"]
    if len(factions)!=6:raise ValueError("Need exactly six factions")
    zitems=world["zone_generation"]["zones"]
    litems=world["location_generation"]["locations"]
    sitems=site_grouping["sites"]
    picked_zone={r["place"]:r.get("selected_by") for r in zitems}
    picked_location={
        r["place"]:r.get("parts",{}).get("faction")
        if r.get("stage")=="faction" else None for r in litems}
    # Every Site uses its own original Place Type/Base profile, except
    # derived Grounds uses Garden, which is its single source affinity row.
    site_refs={**location_refs,**zone_refs,**(extra_site_refs or {})}
    records=[]
    for kind,items,refmap in (("zone",zitems,zone_refs),("site",sitems,site_refs),
                              ("location",litems,location_refs)):
        for r in items:
            name=r["place"] if kind!="site" else r["name"]
            key=("Garden" if kind=="site" and name=="Grounds" else name)
            reference=refmap.get(key)
            chosen=(picked_zone.get(name) if kind=="zone" else
                    picked_location.get(name) if kind=="location" else None)
            records.append({"name":name,"role":kind,"reference_place":key,
                            "selector_bonus_faction":chosen,"reference":reference})
    missing=[r["name"] for r in records if r["reference"] is None]
    if missing and require_complete:
        raise ValueError("Missing original Type/Base affinity for: "+", ".join(missing))
    eligible=[r for r in records if r["reference"] is not None]
    if not eligible:raise ValueError("No source-backed Places")
    # A/B denominator is deliberately across the union Zone+Site+Location.
    raw=[[affinity(f,r["reference"]) for f in factions]+[
        float(neutral_affinity[r["reference_place"]])] for r in eligible]
    a,b=two_way(raw)
    final={}
    for r,rawrow,arow,brow in zip(eligible,raw,a,b):
        pre=[.5*x+.5*y for x,y in zip(arow,brow)]
        owner=r["selector_bonus_faction"]
        after=[.95*x for x in pre]
        if owner:
            if owner not in [f["id"] for f in factions]:
                raise ValueError("Unknown selection faction: "+str(owner))
            after[[f["id"] for f in factions].index(owner)]+=5
        if abs(sum(after)-100)>1e-8:raise AssertionError("Affinity sum drift")
        final[r["name"]]={"role":r["role"],"source_place":r["reference_place"],
            "selector_bonus_faction":owner,"raw":rawrow,"A":arow,"B":brow,
            "before_selector_bonus":pre,"after_selector_bonus":after,
            "dominance":classify(after,r["role"])}
    return {"version":VERSION,
        "status":"complete" if not missing else "partial_missing_source_affinity",
        "normalization_scope":"all source-backed Zone+Site+Location in current world",
        "threshold_note":"Site currently uses Location thresholds provisionally",
        "selection_bonus":"95% pre-ownership share + 5pp to selecting Faction",
        "places":final,"missing_source_places":missing,
        "counts":{"scored":len(final),"missing":len(missing),
          "single":sum(v["dominance"]["kind"]=="single" for v in final.values()),
          "dual":sum(v["dominance"]["kind"]=="dual" for v in final.values()),
          "none":sum(v["dominance"]["kind"]=="none" for v in final.values())}}
