"""Infaction post-generation political ownership + Hidden/Restricted lock (2026-11-22).

Preserve old Zone/Location Single/Dual; fill None only from new joint
Zone/Site/Location ownership computation with Faction selection +5pp.
Then run the approved lightweight A probability, minimum repair and guarded
Nature=4 Strong Faction Override. Original geographic parentage never changes.

Status: design-locked extension; historical upstream Colab generator is v0.4.6.
Faction-Type rankings and the experimental Site threshold remain provisional.
"""
from __future__ import annotations
from collections import Counter
from math import prod

VERSION = "infaction-access-ownership-design-lock-2026-11-22"

def _rebase(matrix):
    result=[]
    for row in matrix:
        s=sum(row)
        result.append([100*x/s for x in row] if s else [100/len(row)]*len(row))
    return result

def _scores(items, factions, reference, neutral):
    raw=[]
    for role,name,_selector in items:
        source="Garden" if role=="site" and name=="Grounds" else name
        ref=reference[source]
        values=[]
        for f in factions:
            ts=f["types"]
            a=float(ref["type"][ts[0]])
            b=float(ref["type"][ts[1]]) if len(ts)>1 else a
            c=float(ref["base"][f["base"]])
            values.append(((a+b+c)/3+(a*b*c)**(1/3))/2)
        values.append(float(neutral[source]))
        raw.append(values)
    A=_rebase(raw)
    totals=[sum(r[j] for r in raw) for j in range(7)]
    B=_rebase([[100*x/totals[j] if totals[j] else 0 for j,x in enumerate(r)] for r in raw])
    return [[(x+y)/2 for x,y in zip(a,b)] for a,b in zip(A,B)]

def _classify(row,role):
    order=sorted(range(6),key=lambda i:(-row[i],i))
    f1,f2,f3=(row[i] for i in order[:3])
    single=(32 if role=="zone" else 28)
    dual=(26 if role=="zone" else 23)
    if f1>=single and f1-f2>=7 and f1>row[6]:
        return {"kind":"single","factions":[f"F{order[0]+1}"]}
    if f1>=dual and f2>=19 and f1-f2<=8 and f2-f3>=3 and f2>row[6]:
        return {"kind":"dual","factions":sorted([f"F{order[0]+1}",f"F{order[1]+1}"])}
    return {"kind":"none","factions":[]}

def source_reference(master):
    """Full 118-Place original Book1 Type and Base, not narrow Zone/Location maps."""
    rows=master["raw"]["book1_original"]["Place Affinity"]["rows"]
    h=rows[1]
    result={}
    for r in rows[2:]:
        if not r or not r[0]: continue
        result[r[0]]={
            "type":{h[j]:float(r[j]) for j in range(15,28)},
            "base":{h[j]:float(r[j]) for j in range(29,113)}
        }
    if len(result)!=118:raise AssertionError("Expected 118 complete Book1 Place affinities")
    return result

def preserve_ownership(full_world, original_ref, neutral):
    world=full_world["generation_details"]
    factions=full_world["factions"]
    z=world["zone_generation"]["zones"]
    l=world["location_generation"]["locations"]
    sites=world["site_grouping"]["sites"]
    items=[("zone",r["place"],r.get("selected_by") if r.get("selected_by") in [f["id"] for f in factions] else None) for r in z]
    items += [("site",r["name"],None) for r in sites]
    items += [("location",r["place"],r.get("parts",{}).get("faction") if r.get("stage")=="faction" else None) for r in l]
    original=[r for r in items if r[0]!="site"]
    base_scores=_scores(original,factions,original_ref,neutral)
    old={name:{"role":role,"kind":_classify(score,role)["kind"],
               "factions":_classify(score,role)["factions"],"scores":score}
         for (role,name,_),score in zip(original,base_scores)}
    new_scores=_scores(items,factions,original_ref,neutral)
    final={};counts=Counter()
    for (role,name,selector),initial in zip(items,new_scores):
        updated=list(initial)
        if selector is not None:
            updated=[.95*x for x in initial]
            updated[[f["id"] for f in factions].index(selector)]+=5
        if abs(sum(updated)-100)>1e-7:raise AssertionError("Political probability drift")
        candidate=_classify(updated,role)
        prior=old.get(name,{"kind":"none","factions":[]})
        if prior["kind"]!="none":
            chosen={"kind":prior["kind"],"factions":list(prior["factions"])}
            counts["preserved_"+prior["kind"]]+=1
            provenance="prior_locked"
        elif candidate["kind"]!="none":
            chosen=candidate
            counts["filled_"+candidate["kind"]]+=1
            provenance="new_only_when_prior_none"
        else:
            chosen=candidate
            counts["still_none"]+=1
            provenance="unowned"
        if prior["kind"]!="none" and (chosen["kind"]!=prior["kind"] or chosen["factions"]!=prior["factions"]):
            raise AssertionError("Old ownership mutated")
        final[name]={"role":role,"kind":chosen["kind"],"factions":chosen["factions"],
                     "provenance":provenance,"selector_bonus_faction":selector,
                     "original":prior if role!="site" else None,
                     "new_pre_bonus":initial,"new_post_bonus":updated,
                     "new_candidate":candidate}
    return {"version":VERSION,"places":final,"counts":dict(counts),
            "site_threshold":"temporary Location threshold pending specific lock"}

def attach_access(full_world, ownership, neutral, master, access_module):
    """Compute access statuses on finished Place nodes; never mutate geography."""
    catalog=master["raw"]["place_catalog"]
    byid={f["id"]:f for f in full_world["factions"]}
    places=[];ownership_by_id={}
    for pid,node in full_world["places"]["nodes"].items():
        if pid=="land":continue
        name=node["name"]
        role=node["generation_role"]
        c={"visible":4,"accessible_outsider":1} if role=="city" else catalog[name]
        places.append({"id":pid,"name":name,"parent_id":node["parent_id"],
                       "visible":int(c["visible"]),"accessible_outsider":int(c["accessible_outsider"])})
        record=ownership["places"].get(name,{"kind":"none","factions":[]})
        fac=byid[record["factions"][0]] if record["kind"]=="single" else None
        ownership_by_id[pid]={"kind":record["kind"],"faction":fac}
        if role in ("zone","site","location"):
            node["attributes"]["political_ownership"]=record
    result=access_module.apply(places,ownership_by_id,full_world["seed"])
    for pid,data in result["places"].items():
        full_world["places"]["nodes"][pid]["attributes"]["hidden_restricted"]=data
    def add_tree_status(node):
        nid=node["id"]
        src=full_world["places"]["nodes"][nid]["attributes"]
        for key in ("political_ownership","hidden_restricted"):
            if key in src:node["attributes"][key]=src[key]
        for child in node["children"]:add_tree_status(child)
    add_tree_status(full_world["places"]["tree"])
    full_world["political_ownership"]=ownership
    full_world["hidden_restricted"]=result
    full_world["access_nodes"]=result["access_nodes"]
    full_world["status"]["political_ownership"]="preserve-first; 5pp fill-None only"
    full_world["status"]["hidden_restricted"]="design locked; experimental Faction-Type rank parameters"
    geo=full_world["places"]["nodes"]
    assert all(pid=="land" or n["parent_id"] in geo for pid,n in geo.items())
    assert len(result["places"])==len(geo)-1
    assert result["summary"]["hidden_minimum_met"]
    assert result["summary"]["restricted_minimum_met"]
    assert all(x["to_place_id"] in geo for x in result["access_nodes"])
    assert len({x["id"] for x in result["access_nodes"]})==len(result["access_nodes"])
    return full_world
