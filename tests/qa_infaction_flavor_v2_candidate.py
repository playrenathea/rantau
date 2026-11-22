"""Read-only QA for Flavor v2 candidate staging.

Run: python tests/qa_infaction_flavor_v2_candidate.py
This does NOT change the locked production v1 naming dataset.
"""
import json
from collections import Counter
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
def read(path):
    return json.loads((ROOT/path).read_text(encoding="utf-8"))

def main():
    legacy=read("data/infaction_animal_place_flavor_v1_locked.json")
    v2=read("data/infaction_animal_place_flavor_v2_candidate.json")
    t1=read("data/infaction_place_impression_tags_v1.json")
    t2=read("data/infaction_place_impression_tags_v2_candidate.json")
    records=v2["records"]
    words=[r["word"] for r in records]
    assert len(records)==291 and len(set(words))==len(words)
    assert v2["legacy_count"]==109 and v2["added_count"]==182
    assert all({k:r[k] for k in ("word","category","animals","suitable_for","weight")}
               =={k:legacy["records"][i][k] for k in
                   ("word","category","animals","suitable_for","weight")}
               for i,r in enumerate(records[:109]))
    assert all(t2["flavor_tags"][k]==v
               for k,v in t1["flavor_tags"].items())
    assert t2["place_tags"]==t1["place_tags"]
    assert len(t2["flavor_tags"])==len(records)
    allowed=set(t2["segments"])
    animals=set(a for r in legacy["records"] for a in r["animals"])
    for r in records:
        assert r["suitable_for"] in ("Both","Location","Item")
        assert r["animals"] and set(r["animals"])<=animals
        assert len(r["animals"])==len(set(r["animals"]))
        assert 1<=len(t2["flavor_tags"][r["word"]])<=len(allowed)
        assert len(t2["flavor_tags"][r["word"]])==len(set(t2["flavor_tags"][r["word"]]))
        assert set(t2["flavor_tags"][r["word"]])<=allowed
    assert any(len(tags)>3 for tags in t2["flavor_tags"].values())
    counts=Counter(a for r in records for a in r["animals"])
    assert len(counts)==56 and min(counts.values())>=1
    assert v2["production_default_unchanged"] is True
    assert "CANDIDATE" in v2["status"]
    print("PASS: candidate v2 data integrity; production v1 untouched")
    print("Vocabulary:",len(records),"legacy:",109,"new:",182)
    print("Animal coverage:",len(counts),"minimum:",min(counts.values()),"maximum:",max(counts.values()))
    print("Tag cardinality:",dict(sorted(Counter(len(x) for x in t2["flavor_tags"].values()).items())))
    print("NOTE: Editorial association QA, redundancy and candidate pruning remain pending.")
if __name__=="__main__":
    main()
