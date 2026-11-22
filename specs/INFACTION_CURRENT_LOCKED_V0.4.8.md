# Infaction — CURRENT LOCKED DESIGN BASELINE v0.4.8

**Status: CANONICAL DESIGN SPECIFICATION (LOCKED), 2026-11-22.**
This document supersedes older v0.4.x design-direction notes for the purpose of determining **what Infaction currently specifies**. Earlier Book1, checkpoints and code remain source references, not competing design versions. A spec lock is not proof that a historical notebook, City module or deployed MVP has already been migrated.

## Synced artifact locations
- Google Drive lock memo (Infaction folder): https://docs.google.com/document/d/1sSb04TJDXixo0vUoyl6nM5qZhdE6yt6c-zD886arJhs/edit
- MASTER Google Sheet, tab `v0.4.8 LOCK`: https://docs.google.com/spreadsheets/d/1hihvEPBM9FXZxzhjHRTGEqYg9jhCXiuONV8mIKj2pwc/edit
- Pinned v0.4.8 GitHub Colab source: https://github.com/playrenathea/rantau/blob/main/notebooks/Infaction_Site_Companion_v0.4.8_LOCKED.ipynb
- Colab-open GitHub URL: https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_Site_Companion_v0.4.8_LOCKED.ipynb
- Drive Colab bootstrap in `Infaction/Generator/Notebooks`: https://drive.google.com/file/d/1oglAA9CloTWDABMJ2Y45Tp5s7xN_UAf2/view
- Site postprocessor: https://github.com/playrenathea/rantau/blob/main/infaction_site_postprocess_v3.py
- Original Book1 and historical versions remain untouched.

## v0.4.8 lock decision (2026-11-22)
This is a **design lock** consolidating v0.4.7 selection, placement and City decisions with the finalized **Proximity Site postprocessing**. Containment is canceled, not a workstream. Do not replace Book1 affinity.

After Site greedy and targeted Farm/Ship family pruning:
1. Garden-first: the 12 blocked Garden child types are Manor, House, Palace, Inn, Meeting Hall, Embassy, Club, Bathhouse, Tavern, Gambling Den, Arena, Brothel. Temple, Gallery, Museum, Theater, Square are **allowed** alongside Grove, Well, Monument, Shrine.
2. If Garden retains >=2 nonblocked Locations, Garden stays; the blocked remainder can form separate Grounds when >=2; a singleton remainder returns direct to its original parent.
3. If Garden retains <2 nonblocked Locations, **all original children** move under Grounds instead; do not lose a valid Site merely because an earlier two-way split produced two singletons. Garden/Grounds output uses the **single original Garden** affinity profile; Grounds is not a selectable affinity row.
4. For canceled Farm/Ship family Sites, try unused non-Farm/Ship/Mine-related replacement Site in the *same container*, using standard original Proximity / City / H2 / Lowest / Gap / split checks and family compatibility. If none works, leave children direct. No forced replacement.
5. QA provenance: 2,000-world historical upstream simulation and postprocess validation are **not** a clean full v0.4.8 runtime test; prior outputs are regression baselines only. The hosted Colab notebook has not been independently clean-run. Maintain a visible distinction between locked design and verified executable release.

Current postprocessor: `infaction_site_postprocess_v3.py`. Colab companion: `notebooks/Infaction_Site_Grouping_Proximity_Checkpoint_Companion.ipynb` (historical upstream selection).

## Universal Place hierarchy — LOCKED 2026-11-22 (pre-Hidden/Restricted)

**Every geographic node is a Place.** This includes **The Land** (the root), **City**, all generated **Zones**, **Sites**, and **Locations**. Do not model City or The Land as non-Place wrapper objects in the world/player-facing hierarchy.

**Parent/child geography (conceptual tree):**
```text
The Land [Place: root]
├── City [Place]
│   ├── Inside Zone [Place]
│   │   ├── Site [Place, optional grouping]
│   │   │   └── Location(s) [Place]
│   │   └── direct Location(s) [Place]
│   ├── standalone Inside Site [Place, optional grouping]
│   │   └── standalone Inside Location(s) [Place]
│   └── standalone Inside Location(s) [Place]
├── Outside Zone [Place]
│   ├── Site [Place, optional grouping]
│   │   └── Location(s) [Place]
│   └── direct Location(s) [Place]
├── standalone Outside Site [Place, optional grouping]
│   └── standalone Outside Location(s) [Place]
└── standalone Outside Location(s) [Place]
```

- **City is a Place immediately beneath The Land.** All Inside Zones and Inside standalone Places belong under City. There is one City in the current generated world.
- **Outside is not a separate Place or Zone** in this topology: Outside Zones and Outside standalone Places are immediate children of The Land, alongside City.
- **Zone, Site, Location are *internal procedural-generation classifications*, not labels the player needs to know.** In the player-facing representation, expose named Places and their containing-place relationships without requiring knowledge of the generation class. The internal classifications can remain as generation provenance/diagnostics.
- **Sites are optional containers** formed from multiple Locations: when a Site groups direct Zone children, the Site remains under that Zone; when it groups standalone Locations, the Site is placed **directly beneath City (Inside) or The Land (Outside)**, without an intermediate Zone. Remaining ungrouped Locations stay direct children of their original parent.
- The current generator has a one-parent geographic hierarchy: each Place node (except The Land) has exactly one geographic parent, and no Site is required for a Location to exist. **No generated Site should create an extra phantom Zone.** This describes the existing grouping semantics rather than changing placement or affinity rules.
- Example player path: `The Land / City / Noble Quarter / Grounds / Palace`; the player only needs the Place names and hierarchy.
- **Hidden and Restricted remain UNDEFINED.** They are intentionally deferred to the next design discussion. Do not infer visibility, discovery, access control, inheritance, or rule interactions from this hierarchy lock; it provides the universal Place structure on which those separate properties can later be specified.

**Change scope:** conceptual/data-model and player-facing terminology lock only; no change to Book1, generation probabilities, Site formation thresholds, or v0.4.8 postprocessor.

## Neutral static v2.1 — 118/118 Place types LOCKED (2026-11-22)

- Canonical data: [`data/infaction_neutral_static_v2_locked.json`](../data/infaction_neutral_static_v2_locked.json), now labeled `neutral-static-v2.1` with **118** complete Place records. The previous **110** record objects remain unchanged.
- Historical 110-row file archived without edits: [`data/archive/infaction_neutral_static_v2_0_locked_110_original.json`](../data/archive/infaction_neutral_static_v2_0_locked_110_original.json).
- Eight approved added records (place: context adjustment → resulting Neutral): Catacombs −7 → 28.848; Town Hall 0 → 62.452; Excavation Site −7 → 42.650; Festival Grounds +5 → 71.281; Hospital +5 → 72.762; Ruins −17 → 42.636; Sanctuary 0 → 39.682; Shipyard −7 → 38.761.
- The original `Book1 Place Affinity` has complete 14 Function/13 Type/84 Base/Neutral raw data for all eight; [recovery file](../data/infaction_missing_8_place_affinity_book1_recovered.json) is source-only and original Book1 was not edited. The native Master Sheet `Recovered Scale 3 (8)` records the final values.
- Faction Type openness/closedness is a **new discussion, not yet locked**: one scalar may mediate identity/status visibility, action visibility, and outsider access, but specific 13 Type values and downstream Hidden/Restricted rules are not specified. Do not conflate Place-visible/accessible data or Neutral with player-level Hidden/Restricted statuses.

## Ownership preserve-first + Hidden/Restricted Access — DESIGN LOCKED 2026-11-22

**Scope:** post-generation overlay. Original Faction generation, selected Places, original Book1 affinity, City, Site and geographic Place parent-child structure are never modified. The Land and City remain Places; access nodes are *additional navigational intermediaries*, **not** original geographic Places.

**Political ownership (Zone + Site + Location):**
1. Recalculate the pre-extension 50:50 A/B political Single/Dual labels for the original Zone and Location scope. **Preserve any pre-existing Single/Dual owner(s) exactly**.
2. Calculate political affinity for ALL generated Zone + Site + Location Places together using source Book1 Type/Base and locked Neutral v2.1; A/B each normalized and blended 50:50. For original Faction-selected Zones and Locations ONLY, rebase all seven shares to 95% and add +5 percentage points to that selector Faction before Single/Dual test.
3. **Only for Places previously `none`**, adopt the newly valid Single or Dual label; otherwise remain `none`. A selected Faction is never automatically made owner. For newly grouped Sites no historical owner exists, so ownership can be established from this calculation.
4. Zone Single F1≥32%, lead≥7, F1>Neutral; Zone Dual F1≥26%, F2≥19%, top gap≤8, second-third gap≥3, F2>Neutral. Location thresholds Single F1≥28%, Dual F1≥23%, other conditions same. Site uses Location thresholds **provisionally** until the specific Site cutoff is explicitly finalized. City and The Land are excluded from political ownership computation.

**Hidden/Restricted — Algorithm A:**
- Independent statuses: Original Visible=0 → definitely Hidden, Accessible Outsider=0 → definitely Restricted.
- Nature 1–3: `hidden_score=4-Visible + ActivityClosed + 2*IdentityClosed`; `restricted_score=4-Accessible + 2*ActivityClosed + Exclusive`. Faction modifiers currently apply to Single ownership only; Dual and None receive no modifiers. Nature 4 is excluded from normal roll.
- Score-to-probability lookup: score 0→0%, 1→5%, 2→15%, 3→35%, 4→60%, 5→80%, 6+→95%. Stable seeded per-Place rolls; no cap on number of positive results.
- After rolls, **repair only shortages** with weighted eligible Nature 1–3 candidates: hard minima Hidden≥1, Restricted≥2, and soft targets Hidden≥2, Restricted≥3. Prefer targets whenever enough valid candidates exist; keep all above-target outcomes.
- If a target remains unmet, examine Nature=4 as **last-resort Strong Faction Override**: Single owner plus IdentityClosed AND ActivityClosed for Hidden; Single owner plus ActivityClosed AND Exclusive for Restricted. If no justified candidate exists, report unmet target rather than fabricating Hidden/Restricted.
- Current experimental Faction Type rank mapping is explicit in `infaction_hidden_restricted_locked.py`; for double-Type Faction, IdentityClosed if **both** Types identity ranks 10–13, ActivityClosed if **either** Type activity rank 10–13, Exclusive if **either** Type exclusivity rank 1–4. **Rank values/cutoffs are tuneable provisional inputs**, not separately approved as permanent Faction Type worldbuilding facts.

**Gate/Checkpoint/access node:**
- Only when a Place is Restricted *and* its nature mapping has an access label, insert one navigational access node between its geographic parent and destination, named `[Place] [Gate Name]`. Never modify the destination's original geographic `parent_id`.
- Current 18 mappings: Prison→Checkpoint, Factory→Entry Yard, Fortress→Gatehouse, Mine→Entry Yard, Outpost→Checkpoint, Palace→Courtyard, Research Facility→Checkpoint, Excavation Site→Entry Yard, Shipyard→Entry Yard, Citadel→Gatehouse, Enclave→Gatehouse, Estate→Gatehouse, Military Base→Checkpoint, Monastery→Reception, Rebel Camp→Checkpoint, Military District→Checkpoint, Royal Quarter→Gatehouse, City→Gatehouse. Restricted Places not in the mapping are direct Restricted without intermediary.
- Gatehouse / Checkpoint / Courtyard / Reception / Entry Yard are active label options; Passage remains a reserved vocabulary option, not forced into current map.

**QA (historical 2,000-world cohort, not hosted full v0.4.8):** original political Single/Dual decisions preserved 16,732 times (8,521 Single and 8,211 Dual), 7,233 previously None filled (5,031 Single / 2,202 Dual). Hidden mean 2.5105 (1–7); Hidden≥1 in 2,000/2,000 and ≥2 in 1,998/2,000. Restricted mean 6.678 (3–15); Restricted≥3 in 2,000/2,000. Access nodes mean 2.725. Nature=4 fallback passed synthetic positive/negative tests but was not triggered by those 2,000 historical worlds. Do not claim 100% universal guarantees outside tested cohort.

**Canonical artifacts:** `infaction_ownership_hidden_restricted_locked.py`, `infaction_hidden_restricted_locked.py`, and [Colab with complete World JSON](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb). One JSON includes all six Factions, every original Place, preserve-first ownership, Hidden/Restricted flags with reason, and separate access nodes.

**Runtime caveat:** This is a **design/overlay lock**. Colab's Faction/Zone/Location selection still uses historical v0.4.6 notebook, not the fully integrated current v0.4.8 generator. Full hosted Colab clean-run and complete 71-Location / Function repair / political exception integration remain **uncertified**. Do not silently label it as end-to-end v0.4.8 certified.

## Source precedence and frozen inputs
1. Immutable original Book1 data and the canonical `data/infaction_master_v0.4.json` are the reference for original affinity scores, scales, functions, Types, Base Names and Animals.
2. Approved overlays and mechanics in **this v0.4.8 specification** supersede earlier effective values, including any stale labels in the master Sheet or old Colab.
3. Keep historical Site checkpoint `checkpoint/infaction-site-before-rescale-2026-11-21` and original data unchanged for rollback.

## Pipeline
**Faction generation → Faction naming → Zone generation → Location generation → Function minimum repair → political alignment → political Location→Zone placement with post-choice exception → geographic Location→Zone or standalone placement → Inside/Outside City → Site grouping.**

### 1. Factions and names
- Seven candidate slots; F1 Government, F2 Revolutionary. F1 cannot contain Elite, Poor, Revolutionary or Outsider.
- Place Elite and Poor in distinct slots within F2–F6; Outsider may occupy F2–F7 subject to max two Types/slot; other available Types are distributed using the existing unique/slot sequence.
- Drop slot 7, leaving six Factions. Preserve locked weighting, ranking, unique Base Name/Animal handling, conflict priority and Base-specific grammar weighting as in v0.4.2 selection rules. Do not use a simplified alternative naming algorithm as production truth.

### 2. Zones
- Select 7–9 unique Zones, original Scale 4–5; six Faction-informed selections plus 1–3 supplemental.
- Preserve accepted Faction Type/Base alignment, randomized score, Function soft bonus/penalty, existing Zone score modifiers and Function thresholds.
- No arbitrary Zone child-capacity limit.

### 3. Locations — latest effective pool
- **71 eligible types**. Start from original 74 Scale 1–2 Location types, remove **Fortress, Palace, Mine, Factory** (effective Scale 2→3), add **Town Hall** (effective Scale 3→2); original Book1 scales remain intact.
- **Meeting Hall stays Scale 2**. Its 2→1 change was never approved.
- Target initial Location count: round/clamp Normal(25, sigma 2.5) into 20–30; one instance per Place.
- Preserve three locked selection stages: one Location per selected Zone, one Location per Faction, supplemental picks up to initial target, with established randomization, Function soft constraints and existing scoring.
- Active Location score modifiers **replace** legacy three special modifiers: Hideout −9, Camp −8, Tunnel −3, Crypt −2, Shelter −1, Research Facility +9. This changes selection scores, not underlying affinity data.
- **Function minimum repair**: after initial selection, count 14 Function coverages at raw Function affinity ≥75. For each deficient Function, draw uniformly from unused eligible Location names with that Function affinity ≥75; append (never replace), recalculate, repeat until all minima met. No hard 30 limit after repair; maximum quota stays soft.

### 4. Geographic affinity — Proximity only (direction updated 2026-11-21)
- **Proximity**, `P(A,B)=P(B,A)`, remains the sole geographic score. Preserve the immutable original Book1 118×118 Place Affinity matrix.
- **Directional Containment has been canceled** by the user's subsequent decision. It must not be used for Location→Zone or Site grouping, and no numerical Containment overlay should be introduced.
- Semantic edge cases use **targeted Farm Family and Ship Family rules**, applied after Site grouping. Preserve the existing Proximity-based eligibility, H2/lowest/gap ranking, and City filters for every other Place.
- The family allowlists and post-filter implementation are versioned at `experiments/infaction_targeted_farm_ship_site_filter_v2.json` and `experiments/infaction_targeted_farm_ship_site_prune_v2.py`. These enforce only explicitly targeted relationships; they do not rewrite Book1 or political/geographic placement.

### 5. Political alignment and Stage 1 placement
- Six Faction alignments + static Neutral v2; retain previously locked raw alignment, two-way normalization 50:50 A/B, Single/Dual thresholds and Exact→Mixed matching.
- Random uniform among eligible political Zones. Each Location has at most one parent; Zones have unlimited Location capacity.
- **Post-choice exception**: for Ship, Dock, Farm and Farmland only, if the selected political Zone's raw **Proximity** is zero, discard that assignment and defer to Stage 2. Do not pre-filter and retry alternate political Zones; do not generalize a physical cutoff to other Location types.

### 6. Stage 2 geographic placement
- Match only as-yet-unassigned Locations to generated Zone(s) or standalone Outside option.
- Retain approved A/B normalization (70% A, 30% B), argmax with random exact ties, no arbitrary zone capacity, and no Stage 1 relocation.
- Use the original symmetric **Proximity** for Zone–Location fit, including the existing `Outside = 100 − max(raw Zone–Location Proximity)` rule. Do not substitute Containment or recalibrate Outside on that basis.
- `standalone` means no Zone parent; it does not force Outside City.

### 7. Inside/Outside City
- One City across all Zones. Zone City Score uses original Book1 and four approved overrides to 1: Caravan Camp, Village, Necropolis, Rebel Camp.
- Any Zone whose effective City Score is 0 is mandatory Outside. Let N = Zone count, R = count of such Zones. Add precisely one more Outside Zone when R=0, or R=1 and N≥8, or R=2 and N=9. Choose the nonmandatory Zone with minimum score `0.6 × Zone City Score + 0.4 × mean(direct child Location City Scores)`; if no direct children, score = Zone City Score. Random exact ties. No lottery/quota cap.
- Child Locations inherit their Zone City designation. Only standalone Locations roll independently: City score 0/1/2/3/4 → Inside probability 0%/35%/60%/85%/100%.

### 8. Site grouping
- Site candidate names are all effective Scale 2–4 types (50 types under current changes); exclude any name already used as a selected Zone, Location, or Site in a given world.
- Site grouping containers: direct children of each Zone, standalone Inside City pool, standalone Outside City pool. A container with fewer than 3 Locations is ineligible.
- Site→Zone preliminary raw **Proximity** threshold ≥45. For standalone containers, a Site's City Score must be ≥2 for Inside, ≤2 for Outside.
- Per candidate evaluate raw **Proximity** to each Location, sorted high→low; H2=second highest, L=lowest, gap=H2−L. Eligibility H2≥45, L≤35, gap≥15. Greedy highest gap; random exact ties; recompute after each Site. Include high-score Locations, exclude low-score, split ambiguous band by maximum allowed adjacent-score drop; Site has ≥2 children and ≥1 original Location remains in container. No fallback or forced Site count.
- **Post-Site Farm Family / Ship Family filter:** apply the existing targeted rules after the regular greedy selection. Site types Farm/Dock/Shipyard must have valid Zone parents and child types; Location types Farm/Ship/Dock must have valid Site types, and when a Zone parent exists their raw Location–Zone Proximity must be >0. After pruning, recheck at least two children and second-highest retained Proximity ≥45. Invalid Sites are canceled and all children restored to their original direct container. Rejected individual children are restored, never deleted. Do not rerun the greedy search or impose a broad filter on other types.
- Preserve the original one-matrix Site algorithm; the targeted family post-filter is a separate, auditable layer.
- **Garden-first / Grounds-fallback (refined):** After Farm/Ship pruning, test **Garden first**. Flagged children (12 types): Manor, House, Palace, Inn, Meeting Hall, Embassy, Club, Bathhouse, Tavern, Gambling Den, Arena, Brothel. Five formerly flagged types — Temple, Gallery, Museum, Theater, Square — are now allowed in a relatively large public/cultural Garden along with Grove, Well, Monument, Shrine. If at least **two unflagged children** remain, keep Garden with those children; if the flagged remainder has at least two children, separately create **Grounds** with that remainder. If Garden would have fewer than two children, instead use **all original Garden children** as Grounds (Garden disappears, Grounds succeeds when >=2). When Garden survives but the flagged remainder has fewer than two, those flagged Locations become direct children of their original container. Never erase children or create an independently selectable Grounds profile; Grounds inherits Garden selection and original affinity. The split executes once per Garden Site; optional later replacement Gardens are processed once as well. The implementation is `infaction_site_postprocess_v3.py`.
- **Canceled-Site replacement (new):** For each Site canceled by the Farm/Ship family filter, try to select a replacement from the original Site catalog in the same parent container, using only Locations restored as direct children. Exclude all names already selected as Zone, Location, or Site in this world (including canceled Site names), and exclude direct Farm/Ship/Mine family Site types. Reapply original Site-to-parent/City, H2/Lowest/Gap, and split rules, plus the family child compatibility checks. Choose maximum eligible Gap, seeded random exact ties. Do not displace other completed Sites. If no eligible replacement exists, leave canceled; no forced count or fallback. Restore any excluded children without loss or duplication. This remains implemented in the Site postprocessor `infaction_site_postprocess_v3.py`.


## Quality gates
- Preserve selected-world diversity, genre-plausible distribution, Function coverage with limited overlap, six Faction representation and affinity with Type+Base, and natural coappearance of close neighbors.
- Validate 71 Location eligibility, uniqueness, 14 Function hard minima post-repair, parent integrity, city inheritance, full Site type distribution, and targeted Farm/Ship family relationships.
- Use reproducible fixed seed cohorts and original 118×118 matrix as invariant source; compare against saved Site checkpoint and prior 1,000-world results. Interpret historical results as reference, not as current-v0.4.8 production output.
- Do not rewrite original Book1 or call an older v0.4.6 notebook the latest release.

## Version/status clarification
**v0.4.8 is the latest locked DESIGN SPECIFICATION.** Geographic matching and Site grouping retain original Proximity, with the Farm/Ship family post-filter after Site grouping. The selection/repair changes of v0.4.7 have not been verified in the historical v0.4.6 executable. A runtime labeled fully integrated v0.4.8 must pass clean end-to-end tests across the full 71-Location selection, Function repair, placement, City and Site stages.

References: `decisions/INFACTION_TOWN_HALL_SCALE_2_DIRECTION_2026-11-21.md`, `experiments/INFACTION_FARM_SHIP_SITE_FILTER_REVIEW_2026-11-21.md`, `experiments/INFACTION_LOCATION_DIRECTION_FINAL_REPAIR_PLACEMENT_QA_2026-11-21.md`, `checkpoints/INFACTION_SITE_BASELINE_2026-11-21.md`.

## Animal-associated Place and City naming — DESIGN LOCKED 2026-11-22

Original source: [Infaction — Item & Location Vocabulary.xlsx](https://drive.google.com/file/d/16sv3x_1NjoGehj3WFcmdAgQXq81lG4-i/view), 109 words associated with 56 Animal labels. `data/infaction_animal_place_flavor_v1_locked.json` preserves the vocabulary and original Animal association lists and stores one global 0/1/3 Place naming weight per Flavor. 0 = Item-only / not selected for Place (six: Antenna, Mandible, Hide, Wool, Ivory, Wax), 1 = grammatically valid eccentric/contextual, 3 = broadly natural. Current calibration: 6/53/50 words for weights 0/1/3. All numeric rankings of word naturalness are pragmatic editorial weights, not separate Flavor × Place affinity scores.

Naming postprocessor `infaction_place_naming_locked.py` runs **only after final political ownership and access logic**: Single owner → `[Faction Animal]'s [weighted associated Flavor] [Place]`; Dual owner → weighted random from **shared Flavor intersection** → `[Flavor] [Place]`, if empty use base `[Place]`; None → original `[Place]`. City follows prior rule `[Government Animal]'s [associated Flavor] City` **as a naming convention without silently granting political ownership**. Do not decorate Gate/Checkpoint/access nodes: keep `[original Place] [Gate label]`.

All random decisions reproducibly keyed by seed and Place ID. One generic filter prevents repeating the same word already contained in base Place name (e.g. Den Gambling Den). No matrix, no anti-repeat quota, no category special rules for Baby Animal, Sounds, or Habitat. Keep `name` (base), stable Place ID, original political/geographic affiliations; add `base_name`, `display_name` and `attributes.naming` on flat and tree Place data. UI should show `display_name`, internal generators should use `name`/Place ID.

QA: 56/56 Animals have 2–13 eligible Flavor; 1,540 pairs → 417 overlap, 1,123 fallback (72.9%); synthetic 2,000-world / 72k-place stress workload found zero malformed names, zero Item-only leakage, zero duplicate full names. Full test method and explicit caveats in [naming QA report](../experiments/INFACTION_PLACE_NAMING_0_1_3_QA_2026-11-22.md). Historical v0.4.6 upstream selection and hosted runtime caveat remain unchanged.

---
## Six-segment Animal-Flavor Place naming — implemented 2026-11-22

**Latest naming rule (supersedes prior static 0/1/3 per-Flavor weight):** [109 original Animal association terms](../data/infaction_animal_place_flavor_v1_locked.json) are classified together with all **118** Book1 Place types in [multi-tag impression catalog](../data/infaction_place_impression_tags_v1.json). Six segments: **Power, Mystery, Nature, Community, Commerce, Prestige**; each Flavor and Place has 1–3 editorial tags. The original vocabulary's static `weight` remains historical provenance only; naming reads **dynamic pair-specific weights**: Item-only = 0; literal Flavor duplication in Place label = 0; nonempty Flavor/Place tag intersection = 3; otherwise = 1. Multiple overlaps **do not stack**.

**Single:** Flavor must belong to the faction's Animal; draw seeded weighted random using dynamic 1/3. `Animal's Flavor Place`.
**Dual:** Flavor must belong to **both** owner Animals **and have weight 3**; seeded random among these equally weighted candidates; if no match, original `Place` only. **None:** original Place. **City:** Government Animal + same dynamic 1/3 selection against City tags Power, Community, Commerce, Prestige. **Gate/access intermediary:** original undecorated Place name. Generated `Grounds` inherits the `Garden` impression tags; it is not a 119th selectable Place type.

**Safe integration:** [naming module](../infaction_place_naming_locked.py) runs after ownership and access in the [current Colab export](../notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb). Original `name`, IDs, geographic tree topology, affinity, ownership and gates are untouched. New `display_name`, `attributes.naming.weight` and `attributes.naming.impression_tags` are output-only. This is a naming-rule implementation, **not proof of a fully clean-run hosted v0.4.8 world generator**. Synthetic candidate QA covers 56 Animal × 118 Place, 1,540 Animal pairs × 118 Place, and 2,000 synthetic seed scenarios. See [QA](../experiments/INFACTION_IMPRESSION_TAG_NAMING_QA_2026-11-22.md).


### Naming v2 final accepted QA + source lock (2026-11-22)

Finalized the multi-tag naming rule after **actual historical generator replay** (16 archived seeds, 568 geographic Place rows): Single weight 3 = 72, Single weight 1 = 37, Dual weight 3 = 18, Dual plain = 63, None = 378. The replay regenerated Factions and Places from the v0.4.3 upstream notebook and reused archived Site placement plus locally reconstructed preserve-first ownership; **not** a clean integrated v0.4.8 Colab runtime. Example outputs: seed 8100023 → **Lion's Den City**, **Fang Military Base**, **Claw Prison**, **Pounce Barracks** (Dual); seed 8100013 → **Bear's Snout City**, **Hoof Artisan Quarter**, **Skull Rebel Camp**, **Wolf's Cub Military Base**; seed 8100005 → **Bear's Roar City**, **Beak Library**, **Beak Club**. Names are actual deterministic replay output, not hand-authored fiction.

Global editorial tag refinement before final lock: **22 Baby Animal terms → Nature tag** (avoids inflated Community matches); **Hiss → Mystery**; **Underworld → Mystery**. Individual source Flavor terms may receive multiple tags; these adjustments don't impose ad hoc name vetoes or change the 0/1/3 weight function. Not every weight-3 phrase is conventional (e.g., Beak Club); grammatical unusual names are permitted by design. Current 109 × 118 Flavor×Place table: weight 3 = **4,763**, weight 1 = **7,390**, weight 0 = **709**. [Final QA report](../experiments/INFACTION_IMPRESSION_TAG_NAMING_QA_2026-11-22.md).

**STATUS: DESIGN LOCKED + CODE COMMITTED + TAG TABLE MIRRORED TO DRIVE. Hosted full v0.4.8 integration verification is outstanding.**

## Executable integration checkpoint — 2026-11-22 (source wired, hosted clean-run pending)

The latest [World + Access + Naming Colab](../notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb) now applies [effective runtime integration](../infaction_v048_integrated_selection.py) before generation. This replaces the historical v0.4.6 upstream *behavior* for the specifically approved Location and Placement changes, without rewriting the archived notebook or source Book1:

- Effective 71 Location candidates = original 74 minus Fortress, Palace, Mine, Factory plus Town Hall recovered from the original Book1 affinity; Meeting Hall remains available.
- Replace legacy Location modifiers with Hideout -9, Camp -8, Tunnel -3, Crypt -2, Shelter -1, Research Facility +9.
- After the original three Location selection stages, repair each Function minimum at raw Function affinity >=75 using an unused qualifying Location drawn uniformly. Additional repair Locations may exceed the initial target cap of 30.
- A political Stage-1 candidate Zone is chosen before testing raw Proximity for Ship, Dock, Farm, Farmland; when that chosen Zone has Proximity 0, the Location moves to Stage 2 without retrying another political Zone.
- Retain locked City, Site grouping, family prune, Garden/Grounds and canceled-Site replacement, preserve-first ownership, Hidden/Restricted/access and impression-tag naming. The final World JSON adds a ten-stage `generation_seeds` manifest, with independent Site postprocessing and Function repair streams.

**QA level:** committed GitHub notebook/module, source readback and synchronized Google Sheet/Drive memo. A hosted Colab complete clean run and new integrated multi-seed cohort are NOT yet observed. Prior historical QA must not be presented as verification of this new path. GitHub Pages MVP remains an independent browser-JS runtime, not a recipient of this Python integration.

## Flavor v2 candidate expansion — staged 2026-11-22, NOT production-promoted

The locked naming dataset remains [Flavor v1 (109)](../data/infaction_animal_place_flavor_v1_locked.json) plus [Impression v1](../data/infaction_place_impression_tags_v1.json). An experimental **candidate** vocabulary is now staged in [Flavor v2 candidates (291)](../data/infaction_animal_place_flavor_v2_candidate.json) and [Impression v2 candidate tags](../data/infaction_place_impression_tags_v2_candidate.json). It contains **109 unchanged legacy entries plus 182 new candidates**, to curate toward ~200–250 final. This is not a request to raise the final target to 291.

New Flavor/Place Impression Tag cardinality may be **1–6 tags** (all six segments when semantically appropriate); the former editorial 1–3 cap no longer applies to Flavor naming. Weight behavior stays unchanged: 0 when ineligible, 1 no tag overlap, 3 at least one tag overlap, with no extra multiplier for multiple overlaps. Naming source validator now accepts variable vocabulary length and 1–6 Impression Tags; current Colab continues using production v1 data, so probabilities do not change yet.

The original Animal associations and all 109 original Impression Tag arrays remain unchanged. New Animal associations, tag assignments and eligibility are provisional and intentionally **not locked**. QA checks data completeness, valid Animal references, uniqueness, original-entry integrity and multi-tag support. Review imbalance before release (e.g. overly broad Animal mapping to Wolf/Dragon and some abstract word-to-Animal relationships). Duplicate brainstorming word Pride was collapsed to one candidate. **Redundancy/semantic overlap treatment explicitly deferred for the next design discussion**; no synonym suppression or production filtering added. Data inventory is also mirrored to the Master Sheet tab `Flavor v2 CANDIDATES`.

## Naming redundancy decision — LOCKED 2026-11-22

**Post-selection, not candidate filtering.** Use the unchanged Animal/Impression weighting to draw one eligible Flavor first. Then compare that selected word/phrase against the original Place base name using case-insensitive Unicode exact whole-word/phrase tokens, treating punctuation/spacing as token separators. If it occurs, suppress only the selected Flavor. **No reroll.** This is a literal string rule, not a synonym/semantic similarity rule. Singular/plural distinctions intentionally remain (Claw ≠ Claws); rare eccentric combinations remain acceptable. Do not impose any further phrase-quality filters.

- Single political ownership: redundant selected Flavor -> `[Animal]'s [Original Place]` (e.g., Wolf's Den). Always retain Animal prefix, even if no eligible Flavor exists.
- Dual: redundant selected Flavor -> `[Original Place]` (no Animal prefix); do not replace the Flavor or retry.
- None: original Place, unchanged.
- City: same Animal-prefix fallback using the Government Animal (`[Animal]'s City` when Flavor is suppressed).
- Nonredundant: preserve existing Single / Dual / City naming grammar and 0/1/3 weights. Item-only still ineligible.
- Log both `selected_flavor` and `redundancy_suppressed` for diagnosis; `flavor` is null and `weight` 0 if suppressed. Count suppressions in naming summary. Naming is idempotent on original base names, without editing Place IDs, geographic parents, ownership, or access node labels.

Implementation: [infaction_place_naming_locked.py](../infaction_place_naming_locked.py). Regression tests: [tests/test_infaction_naming_redundancy.py](../tests/test_infaction_naming_redundancy.py). Active Colab imports this Python module from GitHub at runtime; **Flavor v2 candidate vocabulary remains staged, not production-promoted**. Hosted Colab end-to-end run of this revision remains unverified.

## Flavor v2 activation — 2026-11-22

At user direction, all **291 staged Flavor words** (109 legacy + 182 new) are now the active naming vocabulary in the canonical Python/Colab pipeline. Source: [active Flavor v2](../data/infaction_animal_place_flavor_v2.json), [active Impression v2](../data/infaction_place_impression_tags_v2.json). The old v1 and v2 candidate sources are retained unchanged as historical rollback inputs. **291 is the active count**, not a declaration that editorial associations are final. Wolf/Dragon and other broadly associated Animals still warrant tuning; review may later reduce to the 200–250 aspirational range.

- Canonical [Colab](../notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb) final naming stage loads the active v2 files and asserts 291 Flavor records, 291 tag maps and the active version.
- Current naming engine uses 1–6 Impression Tags, existing 0/1/3 weights and exact-word post-selection redundancy suppression without reroll. Single and City keep their Animal prefix; Dual falls back to the base Place.
- [Browser naming lab](../infaction-flavor-v2-lab.html) fetches the active JSON and demonstrates Single/Dual/City/None names; [legacy web MVP index](../index.html) links to it. **The old JS world generator remains v0.3.x and does not implement the Python v0.4.8 world pipeline**. The lab is a connected naming preview, not a false claim of full JS engine parity.
- [CI workflow](../.github/workflows/infaction-flavor-v2-qa.yml) checks vocabulary, redundancy regressions, and headless integrated notebook. This workflow is committed; no completed GitHub Actions run or hosted Colab successful run has yet been confirmed. Static source/data QA and browser script syntax/regex cases have been verified.
- Master Sheet `v0.4.8 LOCK` contains the activation checkpoint; `Flavor v2 CANDIDATES` remains the curation table. Do not assert JS generator parity or certified end-to-end runtime before observing successful runs.

## Minimal Infaction MVP — 2026-11-22

Frontend entry point is [index.html](../index.html) with [infaction-mvp.js](../infaction-mvp.js) and [infaction-mvp.css](../infaction-mvp.css). The old v0.3.x selection GUI is preserved as [legacy-mvp.html](../legacy-mvp.html); it is no longer the root page. The first interaction is a single hold/long-press (650ms) or right-click of the intro, which directly enters the new MVP. The intro shows once per browser tab session; subsequent refreshes remain in MVP.

**Tabs:**
- **Explore** (default): expandable/collapsible The Land → City/Zone → Site → Location using the exported Place parent/child graph. Display the final named `display_name`, without generating aliases. Show Gate/Checkpoint as access nodes preceding their corresponding destination Place, and eye-slash and padlock for `hidden` and `restricted` flags.
- **Factions**: all 6 Factions with their Faction Types, and owned Zones/Sites/Locations; a Dual-owned Place appears under both owners, marked with its other owner. All values derive from the exported `political_ownership` attributes, not a manual ownership reconstruction.

The web viewer loads [data/infaction_current_world.json](../data/infaction_current_world.json) when the publisher successfully commits it; until that file exists it presents a JSON import UI, **not invented/demo data**. [Publishing workflow](../.github/workflows/publish-infaction-world.yml) is committed to generate a v0.4.8 world with v2 naming using `tests/smoke_infaction_v048_colab.py` and commit the output. The generated live file and hosted browser delivery have not yet been observed. JS syntax and a schema-compatible synthetic fixture have been executed and passed (tree, Gate, Shared Dual, intro context menu); fixture results are UI contract tests, not a claimed real generated world.

**Repository slug:** currently `playrenathea/rantau`. A GitHub repo rename to `playrenathea/infaction` is still an external admin operation not supported by the current connected GitHub actions. The user can rename it via repository Settings → General → Repository name. Hardcoded Colab/raw references must be migrated afterward.

## Browser-native reroll replaces static JSON import — 2026-11-22 (latest)

User explicitly rejected manual world-JSON upload and requested a new randomized world from the **original method** directly in GitHub Pages. The previous JSON-viewer/import plan and `publish-infaction-world.yml` workflow are **superseded and removed**. The current [Infaction homepage](../index.html) loads [infaction-mvp.js](../infaction-mvp.js) and uses [infaction-python-worker.js](../infaction-python-worker.js) for real Python generation on initial entry and each **↻ Reroll**.

The Web Worker loads Pyodide 0.27.7 (via a public JS CDN), fetches the original v0.4.8 notebook plus historical upstream notebooks, Book1 master JSON, integration/postprocess modules, active Flavor v2 data, and other approved source JSON directly from same-origin GitHub Pages assets. It patches only the archived notebook's unused `IPython.display` import for compatibility and routes the notebooks' raw GitHub `urllib.request.urlopen` reads to the exact prefetched, same-repository source files; core generation modules and rules are not reimplemented in JS. It executes the *same three notebook code cells*, including Faction, Zone, Location, Placement, City, Site, political ownership, access and naming, then serializes `full_world` into the existing Factions/Explore renderer. All ten generation-stage seeds are newly randomized on each generation. Interpreter/assets stay warm across rerolls, and generated temporary files are removed from the browser's WASM filesystem. A retry recovers asset download errors.

[GitHub Pages deploy workflow](../.github/workflows/pages.yml) stages these original files alongside UI, and runs `node tests/test_infaction_mvp.cjs` before deployment. GitHub Pages is the only hosting target; no Vercel/backend/user JSON upload. Note Pyodide's JavaScript runtime is supplied by a CDN, which does not imply a separate app host.

**Verification boundary:** Browser UI and Web Worker JavaScript compile and have passed simulated runtime tests (original-source asset prefetch contract, worker world message, right-click intro, Faction Dual, tree/Gate and Reroll). **An actual live GitHub Pages Pyodide→Python notebook→complete world JSON run has NOT been observed;** the hosted Pages deployment status is also not verified. Do not label end-to-end runtime certified until an actual generated export succeeds in-browser. If GitHub Pages is disabled, set repository Pages source to **GitHub Actions**.

Original repo slug remains `playrenathea/rantau`, pending admin rename to `playrenathea/infaction`; relative same-origin asset paths make browser generation portable through the rename.
