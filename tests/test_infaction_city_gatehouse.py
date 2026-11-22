"""City Gatehouse must exist regardless of randomized Restricted state.

Run: python -m unittest discover -s tests -p 'test_infaction_city_gatehouse.py' -v
"""
import unittest
import infaction_hidden_restricted_locked as access


class CityGateTests(unittest.TestCase):
    def test_city_gate_always_exists_across_seeds(self):
        city=[{"id":"city","name":"City","parent_id":"land",
               "visible":4,"accessible_outsider":1}]
        for seed in range(100):
            result=access.apply(city,{"city":{"kind":"none","faction":None}},
                                seed,minimum={"hidden":0,"restricted":0},
                                target={"hidden":0,"restricted":0})
            gates=[g for g in result["access_nodes"] if g["to_place_id"]=="city"]
            self.assertEqual(len(gates),1)
            self.assertEqual(gates[0]["name"],"City Gatehouse")
            self.assertEqual(gates[0]["type"],"Gatehouse")
            self.assertTrue(gates[0]["permanent"])
            self.assertEqual(gates[0]["locked"],result["places"]["city"]["restricted"])
            self.assertTrue(result["summary"]["city_gatehouse_present"])

    def test_other_gates_remain_restriction_conditional(self):
        places=[{"id":"city","name":"City","parent_id":"land",
                 "visible":4,"accessible_outsider":1},
                {"id":"location:Prison","name":"Prison","parent_id":"city",
                 "visible":4,"accessible_outsider":4}]
        ownership={p["id"]:{"kind":"none","faction":None} for p in places}
        result=access.apply(places,ownership,7,
                            minimum={"hidden":0,"restricted":0},
                            target={"hidden":0,"restricted":0})
        self.assertEqual(len([g for g in result["access_nodes"]
                              if g["to_place_id"]=="city"]),1)
        self.assertFalse(any(g["to_place_id"]=="location:Prison"
                             for g in result["access_nodes"]))

if __name__=="__main__":
    unittest.main()
