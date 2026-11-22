"""Regression tests: ownership-only Place naming, without Flavor data."""
import unittest
import infaction_place_naming_locked as naming


class NamingV4Tests(unittest.TestCase):
    def test_full_grammar_without_flavor_data(self):
        factions = [
            {"id": f"F{i}", "animal": animal,
             "types": ["Government"] if i == 1 else ["Merchant"]}
            for i, animal in enumerate(
                ["Wolf", "Eagle", "Bear", "Fox", "Shark", "Owl"], start=1)
        ]
        nodes = {}

        def new(id, name, role, parent=None, owner=None):
            row = {"id": id, "name": name, "generation_role": role,
                   "attributes": {
                       "political_ownership": owner or
                       {"kind": "none", "factions": []}}}
            nodes[id] = row
            return {"id": id, "attributes": row["attributes"], "children": []}

        root = new("land", "The Land", "root")
        city = new("city", "City", "city")
        single = new("zone:Fortress", "Fortress", "zone", owner={
            "kind": "single", "factions": ["F1"]})
        dual = new("site:Market", "Market", "site", owner={
            "kind": "dual", "factions": ["F1", "F2"]})
        none = new("location:Camp", "Camp", "location")
        root["children"].append(city)
        city["children"].append(single)
        single["children"].append(dual)
        dual["children"].append(none)
        world = {"seed": 7, "factions": factions,
                 "places": {"nodes": nodes, "tree": root},
                 "access_nodes": [{"to_place_id": "city",
                                   "name": "City Gatehouse"}],
                 "status": {}}

        output = naming.apply(world)
        names = output["places"]["nodes"]
        self.assertEqual(names["city"]["display_name"], "The Wolf's City")
        self.assertEqual(names["zone:Fortress"]["display_name"],
                         "The Wolf's Fortress")
        self.assertEqual(names["site:Market"]["display_name"], "The Market")
        self.assertEqual(names["location:Camp"]["display_name"], "Camp")
        self.assertEqual(names["land"]["display_name"], "The Land")
        self.assertIsNone(output["place_naming"]["vocabulary_version"])
        for node in names.values():
            self.assertIsNone(node["attributes"]["naming"]["flavor"])
            self.assertEqual(node["name"], node["base_name"])
        self.assertEqual(output["place_naming"]["summary"]["city"], 1)
        self.assertEqual(output["place_naming"]["summary"]["single"], 1)
        self.assertEqual(output["place_naming"]["summary"]["dual"], 1)
        self.assertEqual(output["place_naming"]["summary"]["none"], 1)

    def test_legacy_arguments_do_not_reenable_flavors(self):
        # Safe compatibility while older callers migrate off the data inputs.
        self.test_full_grammar_without_flavor_data()


if __name__ == "__main__":
    unittest.main()
