## Current MVP — restored UI + unified Place navigation

Original intro, visual styles, gesture grammar, time header and footer tabs retained. The live MVP now uses World v0.11.0 (`world-place-generator.js`) and Place v0.1.0; no Gate or NPCs. Location lists parent, siblings and children; map remains a full-visibility prototype preview, with current location marked. Hidden destinations deliberately exposed for spatial testing. Existing save identity preserved on migration; location, tab and progress persist on reload; obsolete `intro=1` query no longer resets. Inventory tabs retained but empty. Travel duration and hidden discovery out of scope.

# Current navigation MVP — World v0.11.0

[Unified Place specification](PLACE_GENERATOR.md) · [MVP](https://playrenathea.github.io/rantau/) · [Colab v0.11.0](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.11.0.ipynb).

The material below is historical or future-gameplay reference, not the active navigation MVP. Gate, NPCs, interaction and inventory are not active.

---

# Current — World Generator v0.10.0

Current pinned Colab notebook: [v0.10.0](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.10.0.ipynb) (source commit a4d1193cdc0039e1f1bb840a43f268d7150fd21b; both JS modules). Historical versions below are retained.

## Zone vocabulary v0.5.0 / World Generator v0.10.0

39 canonical Zone Types: retain all 34; add Forest, Ruined Quarter, Cavern, Entertainment Quarter, Necropolis. Harbor is canonical, Port removed from Location vocabulary; Forest, Cave, Ruins promoted (Cave → Cavern, Ruins → Ruined Quarter). 70 Location profiles. Canonical labels in all regions (retire regional aliases). Existing Zone algorithm, 5–8 budget, Government public anchor, strict Inside majority, mandatory public Outside and Inside Authority/Commerce/Residence unchanged. New region weights and affinities editorial. Location algorithm remains v0.1 prototype with compatible data only; distributed-only Location influence, soft uniqueness, flexible hierarchy and Sites are pending. Existing saves retain Zone types and regenerate Location layer; archived snapshots remain historical.

Validation: {"n":300,"invalid":0,"legacyChanges":0,"counts":{"Administrative District":127,"Upper Town":44,"Necropolis":49,"Stronghold":57,"Refugee Camp":56,"Market District":92,"Military District":48,"Ruined Quarter":111,"Palace District":161,"Monastery":73,"Lower Town":145,"Underground City":52,"Citadel":95,"Cavern":45,"Noble Quarter":36,"Entertainment Quarter":84,"Artisan Quarter":102,"Cultural District":28,"Underworld":53,"Estate":36,"Industrial District":17,"Rebel Camp":61,"Academic District":42,"Residential District":136,"Military Camp":25,"Temple District":17,"Warehouse District":9,"Slum":55,"Enclave":39,"Forest":12,"Academy":33,"Harbor":44,"Foreign Quarter":33,"Farming Village":21,"Caravan Camp":27,"Freeport":39,"Farmland":5,"Mining Settlement":9,"Mining Grounds":4},"newWorlds":216}.

## World Generator v0.9.0
Location Framework v0.1.0, seeded influence and read-only Map preview. See [LOCATION_GENERATOR.md](LOCATION_GENERATOR.md).

## Current World Generator v0.8.0
Locked Zone Framework v0.4.0. [Specification](ZONE_GENERATOR.md) · [Colab](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_World_Generator_v0.8.0.ipynb).

## World Generator v0.6.0
Balanced 5–8 zone framework; see [ZONE_GENERATOR.md](ZONE_GENERATOR.md).

## Zone Framework update (World Generator v0.5.0)
Permanent Zone Generation added. See [ZONE_GENERATOR.md](ZONE_GENERATOR.md) and [Colab notebook](notebooks/Infaction_World_Generator_v0.5.0.ipynb). Gate gameplay is unchanged.

## World Generator update (v0.4.0)
Faction naming now uses P8 Tuned / Top 13. See [WORLD_GENERATOR.md](WORLD_GENERATOR.md).

# Infaction — Enter the City MVP
Static browser prototype. Open index.html or serve via GitHub Pages. Long press reveals alternatives (keyboard: Arrow Up). Local save. Prototype faction and NPC generation uses a reduced vocabulary, not the production generator. Rantau backup: legacy-rantau.
