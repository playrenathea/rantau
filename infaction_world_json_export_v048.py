"""Lossless Infaction JSON export: six full Faction records and universal Place tree.
The Land and City are Places. Zone/Site/Location are internal generation roles.
No changes to generator selection, affinities or placement.
"""
from __future__ import annotations
from collections import Counter
import json

EXPORT_VERSION = "world-place-tree-export-v0.4.8-2026-11-22"

def build_world_export(world, placement, city, site_grouping, place_catalog=None):
    zone_rows = world["zone_generation"]["zones"]
    location_rows = world["location_generation"]["locations"]
    zones = list(placement["zones"])
    locations = list(placement["locations"])
    assert len(world["factions"]) == 6, "Expected six factions"
    assert len(zones) == len(set(zones)) and len(locations) == len(set(locations))
    assert {r["place"] for r in zone_rows} == set(zones)
    assert {r["place"] for r in location_rows} == set(locations)
    assert set(placement["placement"]) == set(locations)
    assert set(city["location_city"]) == set(locations)
    catalog = place_catalog or {}
    nodes = {}
    def add(id, name, kind, parent, attributes=None):
        if id in nodes: raise ValueError(f"Duplicate Place: {id}")
        nodes[id] = {"id":id,"name":name,"place":True,
                     "generation_role":kind,"parent_id":parent,
                     "children_ids":[],"attributes":attributes or {}}
        if parent is not None:
            if parent not in nodes: raise ValueError(f"Missing parent: {parent}")
            nodes[parent]["children_ids"].append(id)
    add("land","The Land","root",None)
    add("city","City","city","land")
    zone_by_name = {r["place"]:r for r in zone_rows}
    loc_by_name = {r["place"]:r for r in location_rows}
    for z in zones:
        state = city["zones"][z]["city"]
        parent = "city" if state == "Inside" else "land"
        add("zone:"+z,z,"zone",parent,
            {"generation":zone_by_name[z],"city_assignment":city["zones"][z],
             "catalog":catalog.get(z,{})})
    site_children = {}
    for site in site_grouping["sites"]:
        name=site["name"]
        z=site["parent_zone"]
        state=site["city"]
        if z is None:
            parent="city" if state=="Inside" else "land"
        else:
            if z not in zones: raise ValueError(f"Unknown Site Zone: {z}")
            if state != city["zones"][z]["city"]: raise ValueError(f"Site City mismatch: {name}")
            parent="zone:"+z
        add("site:"+name,name,"site",parent,
            {"site_selection":site,"city":state,"catalog":catalog.get("Garden" if name=="Grounds" else name,{}),
             "affinity_profile":"Garden" if name=="Grounds" else name})
        if len(site["children"])<2: raise ValueError(f"Invalid Site size: {name}")
        for loc in site["children"]:
            if loc in site_children: raise ValueError(f"Location grouped twice: {loc}")
            site_children[loc]="site:"+name
    for loc in locations:
        a=placement["placement"][loc]
        z=a["zone"]
        state=city["location_city"][loc]
        parent=site_children.get(loc)
        if parent is None:
            parent="zone:"+z if z is not None else ("city" if state=="Inside" else "land")
        if z is not None:
            if z not in zones: raise ValueError(f"Invalid Location Zone: {loc}")
            if state != city["zones"][z]["city"]: raise ValueError(f"Location City mismatch: {loc}")
        if parent.startswith("site:"):
            site_parent=nodes[parent]["parent_id"]
            expected=("zone:"+z if z is not None else ("city" if state=="Inside" else "land"))
            if site_parent!=expected: raise ValueError(f"Location/Site parent mismatch: {loc}")
        add("location:"+loc,loc,"location",parent,
            {"generation":loc_by_name[loc],"placement":a,"city":state,
             "standalone":z is None,
             "standalone_city_assignment":city.get("standalone_locations",{}).get(loc),
             "catalog":catalog.get(loc,{})})
    assert len(nodes)==2+len(zones)+len(locations)+len(site_grouping["sites"])
    assert Counter(ch for n in nodes.values() for ch in n["children_ids"])==Counter(set(nodes)-{"land"})
    for id,node in nodes.items():
        seen={id}; current=node
        while current["parent_id"] is not None:
            pid=current["parent_id"]
            if pid in seen: raise ValueError("Geographic cycle")
            seen.add(pid); current=nodes[pid]
        if current["id"]!="land": raise ValueError("Disconnected Place")
    def tree(id):
        n=nodes[id]
        return {"id":id,"name":n["name"],"generation_role":n["generation_role"],
                "attributes":n["attributes"],"children":[tree(ch) for ch in n["children_ids"]]}
    relations=[{"parent_id":n["parent_id"],"child_id":n["id"],"relation":"contains"}
               for n in nodes.values() if n["parent_id"] is not None]
    return {
        "schema_version":EXPORT_VERSION,"seed":world["seed"],
        "generator_version":world.get("version"),"source":world.get("source"),
        "status":{"design_spec":"0.4.8 LOCKED",
                  "upstream_runtime":"historical v0.4.6 selection; NOT fully integrated v0.4.8",
                  "site_runtime":site_grouping.get("status"),
                  "hidden":"not defined","restricted":"not defined"},
        "factions":world["factions"],
        "places":{"root_id":"land","city_id":"city","nodes":nodes,
                  "tree":tree("land"),"spatial_relations":relations,
                  "counts":{"all_places":len(nodes),"zones":len(zones),
                            "sites":len(site_grouping["sites"]),"locations":len(locations),
                            "standalone_locations":sum(placement["placement"][x]["zone"] is None for x in locations)}},
        "generation_details":{"zone_generation":world["zone_generation"],
                              "location_generation":world["location_generation"],
                              "location_placement":placement,"city_assignment":city,
                              "site_grouping":site_grouping}
    }

def save_world_json(result, path):
    with open(path,"w",encoding="utf-8") as f:
        json.dump(result,f,ensure_ascii=False,indent=2,allow_nan=False)
    with open(path,encoding="utf-8") as f:
        verified=json.load(f)
    if len(verified["places"]["nodes"])!=verified["places"]["counts"]["all_places"]:
        raise AssertionError("JSON roundtrip Place integrity failed")
    return path
