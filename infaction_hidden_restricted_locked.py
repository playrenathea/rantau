"""Infaction Hidden/Restricted A postprocessor — design lock 2026-11-22.
Separate access nodes, no mutation of geographic Place tree. Draft 13-Type
rank cutoffs remain explicit tuneable inputs.
"""
from __future__ import annotations
import hashlib,math

VERSION="hidden-restricted-A-city-permanent-gatehouse-2026-11-22"
PROBABILITY={0:0.,1:.05,2:.15,3:.35,4:.60,5:.80}
MINIMUM={"hidden":1,"restricted":2}
TARGET={"hidden":2,"restricted":3}
GATES={
"Prison":"Checkpoint","Factory":"Entry Yard","Fortress":"Gatehouse",
"Mine":"Entry Yard","Outpost":"Checkpoint","Palace":"Courtyard",
"Research Facility":"Checkpoint","Excavation Site":"Entry Yard",
"Shipyard":"Entry Yard","Citadel":"Gatehouse","Enclave":"Gatehouse",
"Estate":"Gatehouse","Military Base":"Checkpoint",
"Monastery":"Reception","Rebel Camp":"Checkpoint",
"Military District":"Checkpoint","Royal Quarter":"Gatehouse",
"City":"Gatehouse"}
TYPE_RANK={
"Government":(2,5,6),"Military":(3,10,4),"Religious":(4,3,8),
"Criminal":(12,12,7),"Revolutionary":(10,11,9),"Conspiracy":(13,13,2),
"Merchant":(1,2,11),"Clan":(8,9,3),"Cultural":(5,1,12),
"Outsider":(11,8,5),"Elite":(7,7,1),"Poor":(6,4,13),"Academic":(9,6,10)}
def roll(seed,place_id,purpose):
    data=f"{seed}:{place_id}:{purpose}:A-B-v1".encode()
    return int.from_bytes(hashlib.blake2b(data,digest_size=8).digest(),"big")/2**64
def probability(score):
    return PROBABILITY.get(min(score,6),.95)
def flags(faction):
    if not faction:return False,False,False
    types=faction["types"]
    return (min(TYPE_RANK[t][0] for t in types)>=10,
            max(TYPE_RANK[t][1] for t in types)>=10,
            min(TYPE_RANK[t][2] for t in types)<=4)
def _repair(rows,seed,mode,target):
    shortfall=max(0,target-sum(int(r[mode]) for r in rows))
    if not shortfall:return 0
    candidates=[r for r in rows if not r[mode] and r["p_"+mode]>0]
    candidates.sort(key=lambda r:(-math.log(max(1e-15,roll(seed,r["name"],"repair-"+mode)))/r["p_"+mode],r["id"]))
    for r in candidates[:shortfall]:
        r[mode]=True;r["reason_"+mode]="eligible_repair"
    return min(shortfall,len(candidates))
def _strong_fallback(rows,seed,mode,target):
    shortfall=max(0,target-sum(int(r[mode]) for r in rows))
    if not shortfall:return 0
    key="visible" if mode=="hidden" else "accessible_outsider"
    def qualifies(r):
        if r["ownership_kind"]!="single":return False
        if mode=="hidden":return r["identity_closed"] and r["activity_closed"]
        return r["activity_closed"] and r["exclusive"]
    candidates=[r for r in rows if not r[mode] and r[key]==4 and qualifies(r)]
    candidates.sort(key=lambda r:(roll(seed,r["name"],"strong-fallback-"+mode),r["id"]))
    for r in candidates[:shortfall]:
        r[mode]=True;r["reason_"+mode]="strong_faction_fallback"
    return min(shortfall,len(candidates))
def apply(places,ownership,seed,*,minimum=None,target=None,gate_types=None):
    minimum={**MINIMUM,**(minimum or {})}
    target={**TARGET,**(target or {})}
    gates=GATES if gate_types is None else gate_types
    rows=[];ids=set()
    for place in places:
        pid=str(place["id"])
        if pid in ids:raise ValueError(f"Duplicate Place id: {pid}")
        ids.add(pid)
        v=int(place["visible"]);a=int(place["accessible_outsider"])
        if v not in range(5) or a not in range(5):raise ValueError("Place nature must be 0..4")
        info=ownership.get(pid,{"kind":"none"})
        kind=info.get("kind","none")
        if kind not in ("single","dual","none"):raise ValueError("Invalid ownership kind")
        identity,activity,exclusive=flags(info.get("faction") if kind=="single" else None)
        hscore=4-v+int(activity)+2*int(identity)
        rscore=4-a+2*int(activity)+int(exclusive)
        ph=1.0 if v==0 else 0.0 if v==4 else probability(hscore)
        pr=1.0 if a==0 else 0.0 if a==4 else probability(rscore)
        h=roll(seed,place["name"],"hidden")<ph;r=roll(seed,place["name"],"restricted")<pr
        rows.append({"id":pid,"name":place["name"],"parent_id":place.get("parent_id"),
            "visible":v,"accessible_outsider":a,"ownership_kind":kind,
            "identity_closed":identity,"activity_closed":activity,"exclusive":exclusive,
            "hidden_score":hscore,"restricted_score":rscore,
            "p_hidden":ph,"p_restricted":pr,"hidden":h,"restricted":r,
            "reason_hidden":"nature_0" if v==0 else "roll" if h else None,
            "reason_restricted":"nature_0" if a==0 else "roll" if r else None})
    for mode in ("hidden","restricted"):
        _repair(rows,seed,mode,max(minimum[mode],target[mode]))
        _strong_fallback(rows,seed,mode,max(minimum[mode],target[mode]))
    access_nodes=[]
    for r in rows:
        if r["visible"]==0:assert r["hidden"]
        if r["accessible_outsider"]==0:assert r["restricted"]
        if r["visible"]==4 and r["hidden"]:assert r["reason_hidden"]=="strong_faction_fallback"
        if r["accessible_outsider"]==4 and r["restricted"]:assert r["reason_restricted"]=="strong_faction_fallback"
        label=gates.get(r["name"])
        # City has a permanent structural Gatehouse, independent of its
        # randomized Restricted state. Other Places retain gated-if-restricted.
        always_city = r["id"] == "city" and r["name"] == "City"
        if (always_city or r["restricted"]) and label:
            access_nodes.append({"id":"access:"+r["id"],
                "name":r["name"]+" "+label,"type":label,
                "from_parent_id":r["parent_id"],"to_place_id":r["id"],
                "relation":"access_via",
                "permanent":bool(always_city),
                "locked":bool(r["restricted"])})
    summary={"place_count":len(rows),"hidden":sum(r["hidden"] for r in rows),
             "restricted":sum(r["restricted"] for r in rows),
             "both":sum(r["hidden"] and r["restricted"] for r in rows),
             "access_nodes":len(access_nodes),
             "city_gatehouse_present":any(g["to_place_id"]=="city" for g in access_nodes),
             "hidden_strong_fallback":sum(r["reason_hidden"]=="strong_faction_fallback" for r in rows),
             "restricted_strong_fallback":sum(r["reason_restricted"]=="strong_faction_fallback" for r in rows)}
    if any(r["id"] == "city" for r in rows):
        assert sum(g["to_place_id"] == "city" and g["type"] == "Gatehouse"
                   for g in access_nodes) == 1, "City must have exactly one Gatehouse"
    summary.update({"hidden_target_met":summary["hidden"]>=target["hidden"],
                    "restricted_target_met":summary["restricted"]>=target["restricted"],
                    "hidden_minimum_met":summary["hidden"]>=minimum["hidden"],
                    "restricted_minimum_met":summary["restricted"]>=minimum["restricted"]})
    return {"version":VERSION,"seed":seed,"status":"DESIGN_LOCKED",
            "places":{r["id"]:r for r in rows},"access_nodes":access_nodes,
            "summary":summary,"parameters":{"minimum":minimum,"target":target,
                "closed_rank_min":10,"exclusive_rank_max":4,
                "probability":PROBABILITY,"type_rank_status":"PROVISIONAL"}}
