# Current navigation MVP — World v0.11.0

[Unified Place specification](PLACE_GENERATOR.md) · [MVP](https://playrenathea.github.io/rantau/) · [Colab v0.11.0](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.11.0.ipynb).

The material below is historical or future-gameplay reference, not the active navigation MVP. Gate, NPCs, interaction and inventory are not active.

---

# Interaction MVP v0.9.0
Implements Design Reference §7F: fixed NPC menu Talk / Trade / Force / Observe; nested tap/hold rows and right-click alternatives; Trade tap lists NPC offers, hold builds player offer, hold Offer exposes Threaten/Beg. Existing Gate paths remain under Talk, Trade or Force. Default card Glance; Talk chat; default Force physical threat, never kill; Observe Glance/Inspect. Request on default Stay/Leave/Move, alternatives Threaten/Beg/Force. Manually closed narrative popup after NPC actions, including failed actions. Provisional resolver uses existing trait/trust/heat; no finalized social/physical skills, witness simulation, general offer builder or complete Item/Knowledge/Quest generation. Some subject-specific offers ignore modifier because their requirements are fixed. Source syntax checked; physical gestures/browser not tested.
