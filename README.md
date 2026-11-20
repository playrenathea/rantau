### Approved Zone City Placement experiment — v0.4.3 (not yet the active web MVP)

The Zone City Placement overlay is saved as [v0.4.3 City Experiment Revised](notebooks/Infaction_Faction_Naming_Zone_Location_Generator_v0.4.3_City_Experiment_Revised.ipynb); the locked selection generator remains **v0.4.2**. Strict Outside Zone types: Cavern, Farmland, Hunting Grounds, Mining Region, Mining Settlement, Wilderness. Caravan Camp, Village, Necropolis, Rebel Camp are flexible score 1. If no strict Outside, exactly one flexible Zone with the lowest Inside City score is moved Outside (random ties); if more than three strict Outside, randomly move excess Inside to leave three. On 3,000 worlds, **raw mandatory counts** before adjustment: 0=793, 1=1328, 2=728, 3=143, 4=8, 5+=0; final Outside counts 1=2121, 2=728, 3=151. [Notebook on Drive](https://drive.google.com/file/d/1Sk42KZ6Y0s-J3FaPKkfnn5aAEteMwQ7h/view), [final City QA](https://drive.google.com/file/d/1y0bQx2zXYU-Koa9-xyFk0TcxvmNKPkKG/view), [raw mandatory QA](https://drive.google.com/file/d/16ThrbEbvUF3PlfbzmRnHXDSXcYk5OaU7/view). Location matching, Influence and weighted Zone/Location City proposal are **not yet implemented**.

## Locked standalone Infaction Zone + Location MVP — v0.4.2 (21 November 2026)

[Run v0.4.2 in Colab](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_Faction_Naming_Zone_Location_Generator_v0.4.2.ipynb) · [Drive Colab](https://colab.research.google.com/drive/1dgJIyF-z5abtu0mIbff7Odm2FbJy14aK) · [Current specification](https://docs.google.com/document/d/15AVs2_mh66o-M8YnetGeLZqB2HuXRm04ZqIhNWWHT6s/edit) · [3k Location QA](https://drive.google.com/file/d/1w08_X98XuEKt0a8AaWZhUYQP353sUCV_/view).

This standalone notebook preserves the locked Zone v0.4.1 model and adds Location Selection: 74 unique Scale 1–2 types, 20–30 Locations (mean 25, pilot sigma 2.5), one for each Zone then one for each Faction, followed by context/Function-based supplemental greedy. Random weights Zone 20%, Faction 60%. Location Function Covert 0–3. Location score modifiers Hideout -8, Camp -8, Shelter -2, all others 0. No spatial placement, parenting, visibility, or ownership implemented.

Independent local QA on 3,000 seeds: all location sets unique, effective Location diversity 68.466/74, Function minima 99.833%, maxima 99.833%, maximum individual Location frequency Hideout **60.667%** (slightly exceeds soft 60% aspiration). Historical standalone Zone v0.4.1 remains available. This is **not a deployment of the existing Rantau web UI**; its separate World v0.11.0 engine and vocabulary remain untouched.

---

## Locked standalone Infaction Zone MVP — v0.4.1 (20 November 2026)

[Run the v0.4.1 notebook in Colab](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_Faction_Naming_Zone_Generator_v0.4.1.ipynb) · [Drive notebook](https://colab.research.google.com/drive/1gPB8RWn2uAs_j3gjxKdoOKv26btMp6qO) · [Current specification](https://docs.google.com/document/d/15AVs2_mh66o-M8YnetGeLZqB2HuXRm04ZqIhNWWHT6s/edit) · [10k held-out QA](https://drive.google.com/file/d/1EO_kOUyt1sFJwOpQ8ZPbaz7SqHfWBN7Z/view).

The **standalone** Infaction Faction/Naming/Zone generator v0.4.1 locks A (penalties only for Function affinity >=75), Soft MAX = mean(mean, max), Function bonus 75%, penalty 100% / 200% when over maximum, and nine per-Type score modifiers: Royal Quarter -7; Entertainment District -4; Rebel Camp -4; Military Base -3; Market District -2; Cultural District -1; Estate +2; Mining Settlement +4; Caravan Camp +7. Historical v0.4.0 is preserved.

Held-out QA (10,000 worlds): Zone appearance 5.33%–38.85% (empirical, not hard guarantees); minimum Function success 99.95%; maximum Function success 100%. The **GitHub Pages Rantau web runtime** continues to use its separate World v0.11.0 model and 39-Zone vocabulary; it has **not** been switched to the standalone Infaction generator. Do not interpret the standalone lock as a deployed change to the live web UI.

---

## Calibrated selection lab (current)

Active selection-only MVP: [SELECTION_EXPERIMENT.md](SELECTION_EXPERIMENT.md). The holdout summary and current A→B settings are documented there. Original intro and CSS remain unchanged.


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
