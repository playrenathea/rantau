"""Regression for Infaction v3 Place naming grammar.

Run: python -m unittest discover -s tests -p 'test_infaction_naming_rules.py' -v
"""
import unittest
import infaction_place_naming_locked as naming


class NamingV3Tests(unittest.TestCase):
    def make_world(self):
        ids=["F1","F2","F3","F4","F5","F6"]
        animals=["Wolf","Eagle","Bear","Fox","Shark","Owl"]
        factions=[{"id":id,"animal":a,"types":["Government"] if i==0 else ["Merchant"]}
                  for i,(id,a) in enumerate(zip(ids,animals))]
        children=[]
        nodes={}
        def node(id,name,role,owners=None):
            record={"id":id,"name":name,"generation_role":role,
                    "attributes":{"political_ownership":owners or {"kind":"none","factions":[]}}}
            nodes[id]=record
            return {"id":id,"children":[],"attributes":record["attributes"]}
        root=node("land","The Land","root")
        city=node("city","City","city");root["children"].append(city)
        single=node("zone:Fortress","Fortress","zone",{"kind":"single","factions":["F1"]})
        dual=node("site:Market","Market","site",{"kind":"dual","factions":["F1","F2"]})
        none=node("location:Camp","Camp","location")
        city["children"].append(single)
        single["children"].append(dual)
        dual["children"].append(none)
        return {"seed":123,"factions":factions,
                "places":{"nodes":nodes,"tree":root},
                "access_nodes":[],
                "status":{}}
    
    def impressions(self):
        place_tags={"Place"+str(i):["Nature"] for i in range(118)}
        # Only City is selected; zone/site/location don't need tag lookups
        place_tags.update({"Fortress":["Power"],"Market":["Commerce"],"Camp":["Nature"]})
        return {"segments":list(naming.SEGMENTS),
                "flavor_tags":{"Fang":["Power"],"Claw":["Power"]},
                "place_tags":place_tags,
                "derived_place_aliases":{}}

    def test_grammar_and_city_flavor_only(self):
        world=self.make_world()
        data={"version":"test","records":[
             {"word":"Fang","animals":["Wolf"],"suitable_for":"Both"},
             {"word":"Claw","animals":["Wolf"],"suitable_for":"Both"}]}
        imp=self.impressions()
        # Function requires exactly 118 place tags in production.
        imp["place_tags"]={k:v for k,v in list(imp["place_tags"].items())[:115]}
        imp["place_tags"].update({"Fortress":["Power"],"Market":["Commerce"],"Camp":["Nature"]})
        assert len(imp["place_tags"])==118
        # Production data requires >=109 entries; build harmless test entries
        # compatible with the assertions without altering weighted City choices.
        for i in range(107):
            word="Dummy"+str(i)
            data["records"].append({"word":word,"animals":["Bear"],"suitable_for":"Both"})
            imp["flavor_tags"][word]=["Nature"]
        fixed=naming.apply(world,data,imp)
        nodes=fixed["places"]["nodes"]
        self.assertTrue(nodes["city"]["display_name"].startswith("Wolf's "))
        self.assertTrue(nodes["city"]["display_name"].endswith(" City"))
        self.assertIn(nodes["city"]["attributes"]["naming"]["flavor"],("Fang","Claw"))
        self.assertEqual(nodes["zone:Fortress"]["display_name"],"The Wolf's Fortress")
        self.assertEqual(nodes["site:Market"]["display_name"],"The Market")
        self.assertEqual(nodes["location:Camp"]["display_name"],"Camp")
        self.assertEqual(nodes["land"]["display_name"],"The Land")
        for id in ("zone:Fortress","site:Market","location:Camp"):
            self.assertIsNone(nodes[id]["attributes"]["naming"]["flavor"])
        self.assertEqual(fixed["place_naming"]["summary"]["city"],1)
        self.assertEqual(fixed["place_naming"]["summary"]["single"],1)
        self.assertEqual(fixed["place_naming"]["summary"]["none"],1)

if __name__ == "__main__":
    unittest.main()
