"""Site grouping checkpoint (original Book1 Proximity). EXPERIMENTAL.
Runs after Location->Zone and City. This is NOT v0.4.7's still-uncalibrated
directional Containment implementation. Never mutate locked parent assignments.
"""
from __future__ import annotations
import random

VERSION = "site-proximity-checkpoint-2026-11-21"

def group_sites(placement, city, proximity, candidates, city_scores, seed=None):
    zones=list(placement["zones"]); locations=list(placement["locations"])
    assigns=placement["placement"]
    if len(set(zones))!=len(zones) or len(set(locations))!=len(locations):
        raise ValueError("Duplicated input Place")
    if set(assigns)!=set(locations) or set(city["location_city"])!=set(locations):
        raise ValueError("Missing placement or City assignment")
    if any(name not in proximity for name in set(zones+locations)|set(candidates)):
        raise ValueError("Missing source Place affinity")
    pool={("zone",z):[] for z in zones}
    pool[("standalone","Inside")]=[]
    pool[("standalone","Outside")]=[]
    for loc in locations:
        zone=assigns[loc]["zone"]
        key=("zone",zone) if zone is not None else ("standalone",city["location_city"][loc])
        if key not in pool: raise ValueError("Unrecognized parent Zone")
        pool[key].append(loc)
    initial={f"{k[0]}:{k[1]}":list(v) for k,v in pool.items()}
    used=set(zones)|set(locations)
    available=sorted(set(candidates)-used)
    rng=random.Random((placement.get("seed",0) if seed is None else seed)+6400009)
    result=[]
    while True:
        choices=[]
        for parent,members in pool.items():
            if len(members)<3: continue
            for site in available:
                if parent[0]=="zone":
                    if float(proximity[site][parent[1]])<45:continue
                else:
                    score=int(city_scores[site])
                    if parent[1]=="Inside" and score<2:continue
                    if parent[1]=="Outside" and score>2:continue
                ranking=sorted(((float(proximity[site][x]),x) for x in members),
                               key=lambda pair:(-pair[0],pair[1]))
                h2=ranking[1][0]; lowest=ranking[-1][0]; gap=h2-lowest
                if h2<45 or lowest>35 or gap<15:continue
                hi=sum(x>=45 for x,_ in ranking)
                mid=sum(35<x<45 for x,_ in ranking)
                cuts=range(max(2,hi),min(hi+mid,len(members)-1)+1)
                cuts=list(cuts)
                if not cuts:continue
                bestdrop=max(ranking[i-1][0]-ranking[i][0] for i in cuts)
                cut=min(i for i in cuts if ranking[i-1][0]-ranking[i][0]==bestdrop)
                children=[x for _,x in ranking[:cut]]
                choices.append({"site":site,"parent":parent,"children":children,
                                "gap":gap,"h2":h2,"lowest":lowest,"split_drop":bestdrop})
        if not choices:break
        best=max(v["gap"] for v in choices)
        winner=rng.choice([v for v in choices if abs(v["gap"]-best)<1e-10])
        key=winner["parent"]; site=winner["site"]; childset=set(winner["children"])
        pool[key]=[x for x in pool[key] if x not in childset]
        available.remove(site)
        result.append({"name":site,"parent_zone":key[1] if key[0]=="zone" else None,
                       "city":city["zones"][key[1]]["city"] if key[0]=="zone" else key[1],
                       "children":winner["children"],
                       "scores":{k:winner[k] for k in ("gap","h2","lowest","split_drop")}})
    grouped=[x for s in result for x in s["children"]]
    ungrouped=[x for v in pool.values() for x in v]
    assert len(grouped)==len(set(grouped))
    assert set(grouped).isdisjoint(ungrouped)
    assert set(grouped)|set(ungrouped)==set(locations)
    assert len(result)==len(set(x["name"] for x in result))
    for site in result:
        assert len(site["children"])>=2
        assert site["name"] not in used
        for loc in site["children"]:
            assert assigns[loc]["zone"]==site["parent_zone"]
            assert city["location_city"][loc]==site["city"]
    return {"version":VERSION,
            "status":"EXPERIMENTAL Proximity checkpoint, not v0.4.7 Containment",
            "seed":placement.get("seed",seed), "sites":result,
            "initial_containers":initial,
            "direct_locations_by_zone":{z:pool[("zone",z)] for z in zones},
            "standalone_ungrouped_inside":pool[("standalone","Inside")],
            "standalone_ungrouped_outside":pool[("standalone","Outside")],
            "grouped_location_count":len(grouped),
            "ungrouped_location_count":len(ungrouped)}
