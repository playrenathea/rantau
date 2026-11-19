# Current navigation MVP — World v0.11.0

[Unified Place specification](PLACE_GENERATOR.md) · [MVP](https://playrenathea.github.io/rantau/) · [Colab v0.11.0](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.11.0.ipynb).

The material below is historical or future-gameplay reference, not the active navigation MVP. Gate, NPCs, interaction and inventory are not active.

---

# Inventory MVP v0.10.0
Design Reference §7G. Inventory omits Location/time/log; tabs Item, Memory, Record. Existing Gate quantities and quest flags are source of truth; persistent inventory substate holds equipment, tab, visibility and optional memory entries. Existing uniform owners migrate to worn; new purchases are not auto-equipped; player must wear it for uniform entry. Hold/Wear one each, quantity-one item cannot occupy both. Item Hold menu exactly Hold/Wear/Consume; default tap opens confirmation for Wear (wearable), Consume (consumable), or Hold (other items); Cancel leaves state unchanged; explicit Hold menu actions execute without second confirmation. No consumable exists in Gate. Visibility normal/display/conceal persisted for all tabs; NPC detection not yet wired. Memory recall and conflict choice/Cut UI support optional memory entries but no generated conflicts in Gate. Records derive from actual quest flags (entry completion screen remains unchanged). Craft/Research deferred. JS syntax verified, browser not tested.
