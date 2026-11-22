> **CURRENT INFACTION BASELINE — v0.4.8 DESIGN LOCKED (2026-11-22)**  
> [Canonical v0.4.8 specification](specs/INFACTION_CURRENT_LOCKED_V0.4.8.md). Supersedes the v0.4.7 design direction, while preserving prior checkpoints. The single Book1 symmetric Proximity matrix governs geographic affinity; **Containment is canceled**. Site postprocessing: targeted Farm/Ship family prune, Garden-first/Grounds fallback with 12 flagged child types, optional valid non-family replacement for canceled Sites. [Site postprocessor v3](infaction_site_postprocess_v3.py) · [Colab Site companion](notebooks/Infaction_Site_Grouping_Proximity_Checkpoint_Companion.ipynb). **DESIGN LOCK ≠ full v0.4.8 runtime verification**: the companion still executes historical upstream selection, and live hosted-Colab clean run has not been verified.

# Infaction — Active Data & Experiment Workflow (2026-11-21)

**Use this section before running or interpreting any new Infaction world-generation experiment.** It supersedes stale status statements lower in this historical README; it does **not** change locked mechanics, data, the existing MVP, or historical notebooks.

## One source per kind of data

| Purpose | Current authoritative input | Rule |
| --- | --- | --- |
| Canonical generation snapshot and ALL Place↔Place affinity | **[Master JSON](data/infaction_master_v0.4.json)**, `raw.book1_original["Place Affinity"].rows` (118×118), `active.zone_selection`, `raw.location_selection`; [native master Sheet](https://docs.google.com/spreadsheets/d/1hihvEPBM9FXZxzhjHRTGEqYg9jhCXiuONV8mIKj2pwc/edit) is the editable source | Load **one master JSON** for experiments. [Original Book1 JSON](data/infaction_book1_original_unmodified.json) is an immutable integrity archive only. Never use the Location 74×118 subset for Site↔Site/Zone. |
| Approved selection/placement behavior | Most recent locked generation notebook plus [Placement module](infaction_placement_locked.py), [City module](infaction_city_locked.py), and [specification](https://docs.google.com/document/d/15AVs2_mh66o-M8YnetGeLZqB2HuXRm04ZqIhNWWHT6s/edit) | Locked algorithms and overlays take precedence over historical experiments. Read the **actual executed code**, not just README claims. |
| Neutral locked overlay | [Neutral Static v2](data/infaction_neutral_static_v2_locked.json) | Overlay; do not overwrite original Book1. |
| City Score locked overlay | [Original City Score JSON](data/infaction_city_score_original_locked.json) plus four approved Zone-only overrides in [City module](infaction_city_locked.py) | No alternate City data source. |
| Colab execution | [City Colab v0.4.6](notebooks/Infaction_Locked_City_Placement_v0.4.6.ipynb), which calls the locked Location→Zone postprocessor after selection | Notebook includes inherited older generation cells; verify versions loaded and run clean start-to-finish before claiming current operational QA. |
| Historical/experimental sources | Older notebooks, `Location Place Affinity` subset, and existing GitHub Pages runtime | Reference only; not sources for complete Site benchmarks. Do not edit MVP unless specifically requested. |

**Verified 2026-11-21:** `data/infaction_master_v0.4.json` is valid, ~1.54 MB, blob SHA `4f6ab46cc5f63ca5ad67240077a12787ffbae862`. The connected GitHub file-content endpoint may return an empty body on this large file; **use GitHub blob-by-SHA to inspect it** (or normal raw GitHub HTTP when executing in Colab), and reject empty content rather than treating it as an empty dataset. All nine original Book1 tables match the archival JSON; the complete 118×118 affinity is valid, and embedded 36-Zone/74-Location generator data exactly matches master `active` and `raw` snapshots. The [master loader](notebooks/Infaction_Master_Data_Loader_v0.4.ipynb) and [City Colab](notebooks/Infaction_Locked_City_Placement_v0.4.6.ipynb) now include mandatory preflight. Full live Colab execution remains unverified unless a clean-runtime execution is actually observed.

## Mandatory short experiment checklist

1. **Pin inputs:** record source file paths, commit/blob SHAs, current locked code versions, seed range, candidate scope, and every approved overlay. Do not silently switch sources.
2. **Preflight full input:** assert 118 unique Place row/column labels in the same order, 13,924 finite values within 0–100, diagonal 100, symmetric matrix, and 50 candidate Site types (27 Scale 2, 8 Scale 3, 15 Scale 4). Validate every generated Zone/Location name resolves. If a check fails: **STOP; do not tune**.
3. **Generate once, compare fairly:** run locked Faction→Zone→Location→Political/Geographic Placement→City. Cache the same worlds in memory for all candidate Site methods; use fixed documented seeds and separate random streams for Site comparisons.
4. **Separate phases:** (a) base-container eligibility: Zone and standalone Inside/Outside pools with ≥3 direct Locations; (b) Site→container plausibility; (c) Site→Location `H2`, minimum `L`, contrast `G=H2-L`; (d) candidate tuning; (e) actual greedy grouping with no overlapping assignments. Never count a Zone child as standalone.
5. **Report denominator + quality:** number of worlds, eligible containers, candidate Site types, qualifying candidates, greedy Sites/world, grouping size, ungrouped remainder, semantic anomalies, examples, and runtime. Clearly label measured results vs hypotheses and **partial** experiments.
6. **No data edits during exploration:** keep tuning and QA local. When the user authorizes lock, change the smallest required files, document source/seed/QA, verify readback, and keep historical files. Never add a new affinity dataset merely because a convenient subset omits rows.
7. **Completion gate:** static/structural validation, local execution, and live Colab execution are distinct QA levels. Never claim live Colab execution unless observed. Fail fast on absent/empty canonical data or drift; compare current code execution statistics separately from historical experiment distributions.

**Site direction:** original Proximity Site greedy + targeted Farm Family / Ship Family post-filter. No directional Containment. [Executable Site companion](notebooks/Infaction_Site_Grouping_Proximity_Checkpoint_Companion.ipynb). v0.4.7 selection/repair integration requires separate validation. Previous 27-site benchmark findings are **partial** and must not be promoted to all 50 candidates. The existing Location→Zone and City decisions remain locked.

---

## Infaction City Placement — LOCKED (2026-11-21)

City Placement is a **separate, non-mutating postprocessor** after locked Location→Zone placement. [City engine](infaction_city_locked.py), [original Book1 City Score dataset](data/infaction_city_score_original_locked.json) (four Zone-only placement overrides inside engine), and [Colab v0.4.6](notebooks/Infaction_Locked_City_Placement_v0.4.6.ipynb) ([Open in Colab](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_Locked_City_Placement_v0.4.6.ipynb)). All Zones are in or around the **same main City**. Mandatory Zone base score 0 is Outside; an additional lowest-score Zone is placed Outside only according to the approved R/N adaptive rule. The extra candidate uses 60% Zone + 40% mean of its direct child Location City scores. Only standalone Locations get independent Outside rolls for scores 0–4: 100%, 65%, 40%, 15%, 0%; their Inside probabilities are complements. Children inherit their parent's City status; no Locations are discarded or resampled. See Google Drive master specification and sheet tab `City Placement LOCKED`. The historical generator, standalone Placement notebook v0.4.5 and GitHub Pages MVP remain unchanged. **Site Grouping is next, not yet implemented.**

## Location Placement — LOCKED 2026-11-21 (new independent module)

[Run approved Placement Colab](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_Locked_Placement_v0.4.5.ipynb) · [Python placement engine](infaction_placement_locked.py) · [Native master Sheet, Placement Rules LOCKED tab](https://docs.google.com/spreadsheets/d/1hihvEPBM9FXZxzhjHRTGEqYg9jhCXiuONV8mIKj2pwc/edit) · [Canonical specification](https://docs.google.com/document/d/15AVs2_mh66o-M8YnetGeLZqB2HuXRm04ZqIhNWWHT6s/edit).

After existing Faction/Zone/Location generation, Faction–Place alignment uses Raw=mean(arithmetic mean(T1,T2,Base), geometric mean(T1,T2,Base)); six Factions plus locked static Neutral v2; A normalizes within Place; B normalizes each Faction/Neutral across selected Places and then each Place. Political score=50% A +50% B. Single/Dual labels use specified Zone/Location thresholds (see Sheet and code), no forced category or quotas.

**Stage 1 Political Placement:** exact Single↔Single same Faction or Dual↔Dual same pair first; mixed Single↔Dual or Dual↔Single sharing a Faction second. If multiple eligible Zones, choose a random Zone per Location. Single Location has one parent; Zone capacity unlimited. No general physical threshold, forbidden metric, or exclusions. Unusual politically explained relationships intentionally remain.

**Stage 2 Geographic Affinity Placement:** process only Stage 1 unplaced Locations. Add Outside=100-max(raw geographic affinity across generated Zones). Normalize A by Location; normalize B by Zone (including Outside) and rebase by Location. Final score=70% A +30% B; highest scoring Zone/Outside wins; exact ties are random. Stage 1 assignments are immutable. Empty Zones and Outside Locations are valid.

**Runtime boundaries:** This Python module and its independent Colab are a separate *approved Placement generator*. The legacy GitHub Pages **Rantau MVP runtime and its existing source files remain unchanged**, so the page is **not** currently rendering these new placements. No Vercel deployment. Prior QA reported averages (1k worlds) 3.68 Stage1, 18.21 Stage2 inside, 2.98 Outside / world; repeat QA for the standalone integration before promoting to active MVP.

---

## Infaction v0.4.x — canonical master, Book1-first

**Source precedence:** original **Book1.xlsx** (immutable source) → documented and approved tuning/overrides → effective locked generator. Earlier pre-v0.4 notebooks must NEVER overwrite Book1. [Native Google Sheets master](https://docs.google.com/spreadsheets/d/1hihvEPBM9FXZxzhjHRTGEqYg9jhCXiuONV8mIKj2pwc/edit) · [master JSON](data/infaction_master_v0.4.json) · [original Book1 JSON](data/infaction_book1_original_unmodified.json) · [unaltered Book1 archive on Drive](https://drive.google.com/file/d/1FF2o-wCyAxdI5DvqiJ-YaMRxuBsTJS4t/view) · [XLSX master on Drive](https://drive.google.com/file/d/1qcCqz0aNTN8NKIjj3phCEtURJMK7kOPC/view) · [Colab master loader](notebooks/Infaction_Master_Data_Loader_v0.4.ipynb).

Full source audit verified **22,762 unchanged source affinity values**; **164 previously embedded Zone affinity differences** (100 Base, 30 Type, 34 Function) are preserved in `overlay.zone_affinity_overrides`, not written over Book1. `raw.zone_selection` is the original; `active.zone_selection` preserves effective v0.4.1 selections. Exact original Function Scores and Book1's nine sheets are archived; Function minima/maxima, Zone and Location modifiers, City scores, 20%/60% randomness, and all current selection formulas are explicit. Selection v0.4.2 locked; City v0.4.3 approved experiment; Location placement not implemented. **Editing the Sheet alone does not automatically synchronize JSON/notebooks—update all surfaces together.**

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
