"""Regression tests for post-selection exact-word Flavor redundancy.
Run from repo root: python -m unittest tests.test_infaction_naming_redundancy
"""
import unittest
import infaction_place_naming_locked as naming


class RedundancyTests(unittest.TestCase):
    def test_whole_word_case_and_punctuation(self):
        self.assertTrue(naming._is_redundant("Den", "Gambling Den"))
        self.assertTrue(naming._is_redundant("den", "Gambling-DEN"))
        self.assertTrue(naming._is_redundant("Den", "Den"))
        self.assertTrue(naming._is_redundant("Hunting Ground", "Old Hunting-Ground"))
        self.assertFalse(naming._is_redundant("Ant", "Plantation"))
        self.assertFalse(naming._is_redundant("Cat", "Catacombs"))
        self.assertFalse(naming._is_redundant("Claw", "Claws"))
        self.assertFalse(naming._is_redundant("Den", "Hidden"))

    def test_post_selection_no_reroll(self):
        self.assertEqual(naming._post_selection("Den", 3, "Gambling Den"),
                         (None, 0, True))
        self.assertEqual(naming._post_selection("Claw", 1, "Gambling Den"),
                         ("Claw", 1, False))

    def test_redundant_remains_eligible_before_roll(self):
        term = {"word": "Den", "suitable_for": "Location"}
        self.assertEqual(naming._dynamic_weight(
            term, "Gambling Den", ["Nature"], {"Den": ["Nature"]}), 3)

    def test_selected_redundant_does_not_pick_next(self):
        records = [
            {"word": "Den", "suitable_for": "Location", "animals": ["Wolf"]},
            {"word": "Fang", "suitable_for": "Both", "animals": ["Wolf"]},
        ]
        tags = {"Den": ["Nature"], "Fang": ["Power"]}
        original = naming._unit
        try:
            naming._unit = lambda *args, **kwargs: 0.0
            picked, weight = naming._pick(
                13, "site:Den", ["Wolf"], records, "Den", ["Nature"], tags)
        finally:
            naming._unit = original
        self.assertEqual(picked, "Den")
        self.assertEqual(weight, 3)
        self.assertEqual(naming._post_selection(picked,weight,"Den"),
                         (None,0,True))
        self.assertEqual("Wolf's " + "Den", "Wolf's Den")

    def test_six_tag_overlap_still_weight_three(self):
        term={"word":"Trace","suitable_for":"Both"}
        tags={"Trace":["Power","Mystery","Nature","Community","Commerce","Prestige"]}
        self.assertEqual(naming._dynamic_weight(term,"Tower",["Power"],tags),3)
        self.assertEqual(naming._dynamic_weight(term,"Tower",[],tags),1)


if __name__ == "__main__":
    unittest.main()
