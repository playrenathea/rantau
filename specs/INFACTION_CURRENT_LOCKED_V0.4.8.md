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
