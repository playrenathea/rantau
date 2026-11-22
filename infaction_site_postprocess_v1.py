"""Post-Site overlay: rename Garden to Grounds and replace Sites canceled by Farm/Ship filter.
Original Book1 Proximity unchanged. This is applied AFTER the existing family prune v2.
No replacement is forced; only unused, non-family candidates passing original greedy criteria.
"""
from __future__ import annotations
import random

GARDEN_TO_GROUNDS_FLAGS = frozenset({
    "Manor","House","Palace","Inn","Temple","Meeting Hall","Square","Embassy",
    "Club","Gallery","Bathhouse","Theater","Tavern","Museum","Gambling Den",
    "Arena","Brothel"
})
# Exclude direct Farm/Ship/Mine thematic Site types, rather than blacklisting
# generic associated facilities (Inn, Warehouse, Workshop, etc.) everywhere.
REPLACEMENT_EXCLUDED_FAMILY = frozenset({
    "Farm","Farmland","Ship","Dock","Shipyard","Harbor",
    "Mine","Mining Region","Mining Settlement","Excavation Site"
})
VERSION = "site-postprocess-garden-grounds-family-replacement-v1"

def _candidate(site, container, members, proximity, city_scores):
    if len(members)<3:return None
    if container.startswith("z:"):
        if float(proximity[site][container[2:]])<45:return None
    elif container=="inside":
        if int(city_scores[site])<2:return None
    elif container=="outside":
        if int(city_scores[site])>2:return None
    else:raise ValueError(f"Unknown container {container}")
    ranks=sorted(((float(proximity[site][loc]),loc) for loc in members),key=lambda p:(-p[0],p[1]))
    h2=ranks[1][0]; low=ranks[-1][0]; gap=h2-low
    if h2<45 or low>35 or gap<15:return None
    hi=sum(score>=45 for score,_ in ranks)
    mid=sum(35<score<45 for score,_ in ranks)
    cuts=list(range(max(2,hi),min(hi+mid,len(members)-1)+1))
    if not cuts:return None
    drop=max(ranks[i-1][0]-ranks[i][0] for i in cuts)
    cut=next(i for i in cuts if ranks[i-1][0]-ranks[i][0]==drop)
    return dict(site=site,container=container,children=[loc for _,loc in ranks[:cut]],
                gap=gap,h2=h2,low=low)

def apply_garden_and_replacements(pre_sites, family_result, direct_pools,
                                  zone_names, location_names, candidates,
                                  proximity, city_scores, family_rules, seed):
    """direct_pools: ungrouped locations keyed z:<Zone>, inside, outside.

    If direct_pools already contains restored children, pass family_result with
    direct_restored={} to prevent double restoration. This helper checks exact
    Location preservation and never mutates placement or City assignments.
    """
    pools={key:list(ls) for key,ls in direct_pools.items()}
    for container,restored in family_result["direct_restored"].items():
        pools.setdefault(container,[]).extend(restored)
    kept=[dict(record) for record in family_result["sites"]]
    forbidden=set(zone_names)|set(location_names)|{s["site"] for s in pre_sites}
    available=set(candidates)-forbidden-REPLACEMENT_EXCLUDED_FAMILY-{"Grounds"}
    renamed=[];grounds_used="Grounds" in forbidden
    def rename_garden(records):
        nonlocal grounds_used
        for record in records:
            flags=sorted(GARDEN_TO_GROUNDS_FLAGS.intersection(record["children"]))
            if record["site"]=="Garden" and flags:
                if grounds_used:raise ValueError("Grounds already used as a Place")
                record["site"]="Grounds"
                grounds_used=True
                renamed.append({"container":record["container"],"flagged_children":flags})
    rename_garden(kept)
    rng=random.Random(seed+771101)
    replacements=[];unreplaced=[]
    for canceled in family_result["canceled"]:
        container=canceled["container"]
        members=pools.get(container,[])
        options=[]
        for name in sorted(available):
            candidate=_candidate(name,container,members,proximity,city_scores)
            if candidate is None:continue
            zone=container[2:] if container.startswith("z:") else None
            children=[]
            for child in candidate["children"]:
                if child in family_rules["location_types_targeted"]:
                    if name not in family_rules["location_valid_site"].get(child,[]):continue
                    if zone is not None and float(proximity[child][zone])<=0:continue
                children.append(child)
            if len(children)<2:continue
            if sorted((float(proximity[name][l]) for l in children),reverse=True)[1]<45:continue
            candidate["children"]=children
            options.append(candidate)
        if not options:
            unreplaced.append({"site":canceled["site"],"container":container,
                               "reason":"no_valid_unused_unrelated_site"})
            continue
        maxgap=max(item["gap"] for item in options)
        chosen=rng.choice([item for item in options if item["gap"]==maxgap])
        assert len(chosen["children"])<len(members)
        pools[container]=[l for l in members if l not in set(chosen["children"])]
        available.remove(chosen["site"])
        chosen["replaces"]=canceled["site"]
        kept.append(chosen)
        replacements.append({"old":canceled["site"],"new":chosen["site"],
                             "container":container,"children":chosen["children"]})
    rename_garden(kept)
    grouped=[loc for site in kept for loc in site["children"]]
    direct=[loc for values in pools.values() for loc in values]
    assert len(grouped)==len(set(grouped))
    assert len(grouped)+len(direct)==len(location_names)
    assert set(grouped).isdisjoint(direct)
    assert set(grouped)|set(direct)==set(location_names)
    assert len(set(site["site"] for site in kept))==len(kept)
    assert all(site["site"] not in REPLACEMENT_EXCLUDED_FAMILY
               for site in kept if "replaces" in site)
    return {"version":VERSION,"sites":kept,"direct_pools":pools,
            "renamed_gardens":renamed,"replacements":replacements,
            "unreplaced":unreplaced,
            "excluded_replacement_site_types":sorted(REPLACEMENT_EXCLUDED_FAMILY)}
