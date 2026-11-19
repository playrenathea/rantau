# Current navigation MVP — World v0.11.0

[Unified Place specification](PLACE_GENERATOR.md) · [MVP](https://playrenathea.github.io/rantau/) · [Colab v0.11.0](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.11.0.ipynb).

The material below is historical or future-gameplay reference, not the active navigation MVP. Gate, NPCs, interaction and inventory are not active.

---

# Gesture grammar v0.11.1
Tap/left click selects default; hold/right click selects alternative when provided, otherwise the same default. Shared handler used for generic buttons, menu rows, item/Memory/Record entries, visibility, popup close/confirm, slots, nav and wait controls. Dedicated NPC card and grip retain their own behavior; input controls retain native editing. Eight deterministic handler checks and JS syntax passed; actual browser/device not tested.
