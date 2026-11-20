# Infaction — Zone + Location Selection Laboratory v0.2.0

## Active scope

Original UI skin, Hold/Don't Tap intro, hold gesture and bottom navigation retained. Location now shows selection-only lists, not spatial travel. Reload persists current stage/seed. Interaction contains no NPCs. No geography, visibility, placement, Site or mandatory Location in this experiment. The previous Place spatial generator is preserved in the repository.

## Data

Editable workbook: https://docs.google.com/spreadsheets/d/1uxvNhDWZJ5w6jrWJzsT6vr4vvd5wkkIa_TNQMK9x6fI/edit . Active experiment tabs: `Selection - Function A`, `Selection - Function B`, `Selection - Controls`, `Selection - QA`. Source Faction Type+Neutral and Faction Base affinities are retained in legacy active Place tabs. Browser uses embedded data snapshot; **editing the workbook does not automatically publish to GitHub Pages**. During experiments, synchronize the data snapshot and refresh script query versions before testing the MVP.

## Generation

Counts: Zone 6–9, Location 20–30 (triangular, preselected). Zone eligible Scale 4–5; Location eligible Scale 1–2. Global Type uniqueness. Separate Zone and Location A-supply accounting. Initial anchor: Authority × actual Government (including paired Type and Base). Subsequent priority: select Function and Faction independently by highest **relative unmet demand** `(demandShare − observedSupplyShare)/demandShare`; ties random. Function universal demand: Residence 4, Commerce 4, Production 2, Authority 2, Security 1, Culture 2. Faction target: each of six actual Factions 1, Neutral 1.5 (provisional). Combine Type(s)+Base geometric mean, neutral from its single Type column. Candidate score: `(F + A + sqrt(F*A) + uniformRandom) / 4`, where F/A are B/100. Highest score wins; update A-supply normalized per selected Place. All scoring B and supply A profiles are prepared before the selection loop; compile() caches fixed mapping transforms for repeated universes.

## Effective affinity B

Function A is editable 0–100. New six functions are initially migrated by max of thematic old columns: Residence ← Residence/Privilege/Poverty/Migration; Commerce ← Commerce (Underworld manual 75); Production ← Production/Logistics/Agriculture/Extraction; Authority ← Authority; Security ← Defense; Culture ← Religion/Knowledge/Culture. This migration is editorially provisional; actual Function A values are user-editable. Bias remains stored, but current tuning weights leave it inactive. `B_i = clamp(w1*A_i + w2*A_i*d + w3*100*d + w4*100*A_i/sum(A) + w5*(100*A_i/sum(A))*d,0,100)`, `d=legacyBias*scale`; weights currently `[0.85,0,0,0.15,0]` and bias scale 1. Faction Type and Base effective affinities use the same preprocessing, independently. No special-case multiplier in the selection loop.

## 750-seed holdout — seeds 90000–90749

| Metric | Original | Tuned |
| --- | ---: | ---: |
| Effective Zone diversity (exp Shannon) | 20.34 | 29.58 |
| Zone Types seen / eligible | 38/38 | 38/38 |
| Effective Location diversity (exp Shannon) | 43.05 | 50.94 |
| Location Types seen / eligible | 64/74 | 73/74 |
| Zone Function demand TV error | 0.1401 | 0.1364 |
| Location Function demand TV error | 0.2235 | 0.0740 |
| Zone Faction demand TV error | 0.0965 | 0.0455 |
| Location Faction demand TV error | 0.0645 | 0.0335 |
| Universes missing Outsider | 139 | 0 |
| Mean Zone count | 7.548 | 7.548 |
| Mean Location count | 25.085 | 25.085 |
| Script runtime, 750 worlds, tool isolate | 5648 ms | 2419 ms |

TV error = half the sum of absolute percentage differences between normalized demand and supply; not a gameplay-quality score. Runtime results reflect the JS tool environment, not an actual mobile browser benchmark. The narrowed Culture vocabulary and social-settlement Residence remapping are responsible for much of the improvement, in addition to revised unmet-need priority; these changes must be considered together rather than interpreted as one isolated causal weight.

## Known limitations

* 73 of 74 eligible Location types selected in the holdout; not all types are equally probable. The generator does not enforce target appearance rates.
* Neutral target 1.5 and Function demand weights remain provisional, not validated against gameplay.
* Current MVP is selection-only. Spatial plausibility, containment, access, hidden discovery, NPC interactions and location travel are not tested here.
* This is engine/synthetic testing; not a live browser interaction test.
* Existing saves generated before the Outsider fix can retain their original six factions to preserve continuity; new universes use the corrected generator.


## Iteration v0.3.0

Data schema unchanged. Six-function affinity A and Place Bias remain numeric columns in existing Sheets. Static `selection-data.js` is the published snapshot of those two existing ranges (126 rows); no runtime mapping from 15 legacy Functions or per-Place conditions. To publish subsequent tuning from the workbook, regenerate that snapshot. Scoring simplified to `(F + A + R) / 3`. Weights: `[0.75,0.35,0,0.25,0]` (A, A×Bias, Bias, A distribution, distribution×Bias). Values of Bias may be negative for lower prevalence or positive for higher prevalence. Bias affects selection B, not supply A. Normalized A supply profiles are cached per Place, while actual Faction supply profiles are prepared once per Universe. Raw-A semantic corrections: Pawnshop, Auction House, Bank, Monument no longer represent Residence; other six-function A values retained. Selection remains independent Zone/Location, with no Site, placement or mandatory Location. See `Selection - Type Audit` and `Selection - Pair Audit` in the workbook for the prior 1800-seed audit.

### Final outlier pass

Six high-frequency Locations (Auction House, Bank, Brothel, Gaming House, Trading Post, Shelter) received small negative Bias adjustments, plus Underworld Zone −0.08. These remain pure database values and do not change the generator. Aggressive corrections were rejected because they displaced the excessive frequency to other Commerce Types. Chosen small adjustments improve effective Location diversity with negligible demand error change in comparison batches. See newer QA stats below once evaluated.

## Final v0.3 holdout — 1,800 fresh seeds (400000–401799)

This section supersedes interim v0.3 tuning notes. Existing database layout is unchanged; only existing numeric columns for Function A, Bias, and five A→B weights were edited. The final published `selection-data.js` is a snapshot of the existing sheet rows, and is explicitly cache-busted in `index.html`.

| KPI | v0.2 | v0.3 final |
|---|---:|---:|
| Effective Zone diversity | 29.51 | **31.43** |
| Effective Location diversity | 51.04 | **57.51** |
| Zone types covered | 38/38 | 38/38 |
| Location types covered | 73/74 | **74/74** |
| Zone Function TV error | 0.1378 | 0.1378 |
| Location Function TV error | 0.0762 | **0.0753** |
| Zone Faction TV error | **0.0455** | 0.0473 |
| Location Faction TV error | **0.0327** | 0.0346 |
| Structural failures (duplicates/count/anchor/Outsider/Gov) | 0 | 0 |

Frequency examples (% of universes): Bookshop 88.7→53.4, Apothecary 84.1→54.9, Clinic 4.2→16.2, Library 2.9→11.9, Temple 2.8→12.4, Farm 17.7→33.7, Dock 7.3→26.8, Factory 2.9→16.0, Sewer 0→3.1. Tavern remains common at 78.1% and Shop at 84.2%. Government/Authority still receives the opening anchor in each pool.

Implementation: `score=(F+A+R)/3` (R uniform[0,1]); `B=clamp(.75*A+.35*A*Bias+.25*100*A/sum(A),0,100)`; `Bias` is the existing signed numeric `Places` column. Supply uses normalized raw A, not B. Six Function A rows come from the existing `Selection - Function A` tab snapshot, not on-the-fly conversion of the 15 legacy Functions. Current Faction Type/Base A values are unchanged and are transformed with the same B model. Per-Place function supply normalization is precomputed in cached compile(); per-Universe actual Faction supply normalization is precomputed once. Neutral demand stays 1.5 provisional.

Qualitative caveat: Zone/Location relationships are still deliberately independent. Palace District→Palace and University→Library are not mandatory yet; optimizing these needs later placement / mandatory pairing rather than special-case selection. Unconditional co-occurrence changes are not evidence of causality.

Recommendation: hold the score and weights constant pending review of several representative generated worlds. If additional tuning is needed, edit existing numeric A/Bias values rather than adding generation rules. Live Google Sheet edits still require publishing a new `selection-data.js` snapshot.


## Iteration 1 — Location functional redundancy (qualitative-first, 2026-11-20)

**Scope:** One diagnosed root problem: several commercial Location profiles incorrectly supplied Culture. No changes to generator algorithm, weighting, Bias, Function demand, or Faction data. Only `Selection - Function A` values: Apothecary Culture **100 → 0**, Gaming House Culture **100 → 50**. The two changes remove an implausibly strong Culture role from a medical retailer and moderate, rather than eliminate, the social-cultural role of a gambling venue. Same values are mirrored in published `selection-data.js` snapshot; schema unchanged.

**Qualitative examples:** In seed 510354, the initial selection had Bookshop, Tavern, Gaming House, Apothecary, Market and Brewery clustered in Commerce/Culture; other seeds likewise showed overlapping venues. The narrower edit targets that specific issue, not all Commerce repetition. Sample held-out worlds were inspected; some individual outcomes changed substantially, and not every world is improved. Do not overinterpret distribution metrics as gameplay-quality judgments.

**Holdout:** 1,800 new seeds **560000–561799**, paired on the same 6 generated Factions per seed. Baseline v0.3 vs two-cell edit:

| Metric | Before | After |
|---|---:|---:|
| Effective Location Type diversity | 57.566 | 58.137 |
| Location Function TV demand error | 0.0745 | 0.0659 |
| Location Faction TV demand error | 0.0345 | 0.0339 |
| Mean pairwise Location Function cosine similarity | 0.3896 | 0.3844 |
| Location pairs with cosine >=0.85 | 8.00% | 7.72% |
| Commerce+Culture-strong Locations per Universe | 5.582 | 4.856 |
| Distinct primary Function categories per Universe | 5.442 | 5.497 |
| Strong Function coverage (>=75 A) | 5.999/6 | 5.999/6 |
| Zone effective diversity | 31.440 | 31.440 |
| Zone Function TV / Faction TV | 0.1373 / 0.0491 | same |
| Location Types sampled | 74/74 | 74/74 |
| Structural failures | 0 | 0 |

Important caveats: this fixes an overbroad Culture mapping for **two** places, not the full structural issue of nearly interchangeable Commerce venues. Apothecary increases in frequency from 53.2% to 66.4% because it now supplies fewer Function categories and affects deficit selection differently; Gaming House rises from 55.1% to 60.4%. Scores are measured on the edited raw-A profiles in each variant, so cosine similarity can move just from relabeling the vector. Faction/Zone stay effectively invariant because the two edited Place Types are Location-only. The selection process is deterministic for a fixed seed and has not been made more complex.

**Decision:** Keep, as a small verified semantic improvement. **Next problem (await review):** Are highly frequent near-substitutes within Commerce (Shop, Market, Trading Post, Auction House, etc.) crowding out distinctive Location gameplay roles? If yes, first audit additional A semantics and the Function taxonomy, not dynamic anti-duplication penalties. Stop here pending user's go-ahead.

## Iteration 2 — Commerce Location Differentiation (2026-11-20)

**Root problem:** Multiple commercial venues are scored as Production even though their specific role is trading or logistics rather than producing goods. Under the 6-Function model, their misleading Production contribution makes several commerce profiles artificially interchangeable and can displace genuine production sites. Original 15-Function source confirms Trading Post Logistics=0.5, Black Market Logistics=0.5 (neither has direct Production). There is no new category, column, rule, eligibility constraint, or runtime algorithm.

**Two numeric changes in existing Selection - Function A tab:**
- Trading Post Production A: **50 → 0** (Commerce remains 100; Residence remains 50).
- Black Market Production A: **50 → 25** (Commerce remains 100; recognizes minor logistics contribution while no longer treating it as a significant production site).
All Faction Type and Base affinities unchanged, and existing weight/Bias values unchanged.

**Reasoning from qualitative samples:** Shop, Black Market and Apothecary had identical or very similar Function A vectors while their Faction affinities differed meaningfully; similarly Market and Gaming House shared Function vectors. They should not automatically be penalized as duplicates: faction alignment can make them serve different political contexts. No new runtime co-occurrence penalty was introduced. The raw Function mapping, rather than a general diversity bonus, was the smallest sound lever. Changing Shop Production to zero was rejected because its modeled appearance rose to ~93–95% in preliminary tests. Changing Black Market Production to zero was rejected because its modeled appearance rose to ~67–70% and excessively displaced other venues. We selected a milder correction.

**Holdout: 1,750 fresh seeds 700000–701749, same seed set for baseline and candidate.**

| KPI | Before (Iteration 1 baseline) | After |
|---|---:|---:|
| Effective Zone Type diversity | 31.486 | 31.486 |
| Effective Location Type diversity | 58.022 | **58.762** |
| Zone Function / Faction TV errors | 0.1375 / 0.0495 | same |
| Location Function demand TV error | 0.0663 | **0.0639** |
| Location Faction demand TV error | **0.0338** | 0.0342 |
| Mean Location Function cosine overlap | 0.3839 | **0.3779** |
| Strong Function coverage (out of 6) | 6.000 | 5.999 |
| Strong Production locations per Universe | 4.810 | **5.112** |
| Commerce-strong locations per Universe | 8.597 | **8.272** |
| Distinct primary Functions per Universe | 5.498 | 5.510 |
| Mean effective affinity to prioritized Faction (B 0–100) | 49.81 | 50.03 |
| Locations with prioritized Faction fit below 50 | 53.00% | 52.49% |
| Types ever selected | 38 Zone / 74 Location | same |
| Structural/Outsider/determinism failures | 0 | 0 |

**Frequency (% universes):** Trading Post 60.3→68.6, Black Market 53.3→57.1, Shop 84.0→79.1, Farm 34.3→39.1, Factory 14.0→16.3, Workshop 36.7→40.7, Tavern 73.8→71.9.

**Limitations:** Higher output diversity and lower cosine similarity may partly arise directly from edited Function vectors rather than meaningful gameplay variation. Co-occurrence/placement remains out of scope. Commerce still contains legitimately distinct institutions; do not pursue uniform probability. 53% of Location selections currently have priority Faction affinity below 50, but since this includes Neutral and randomly generated six-way Faction combinations, it is a **diagnostic lead, not a validated defect or target**.

**Decision:** KEEP the two-cell Function A correction. The generator stays unchanged. Next proposed problem, requiring approval before action: **Faction Type + Base Name alignment sensitivity**—test whether actual Type/Base combinations reliably influence selected Place identities without assuming that low absolute affinity itself indicates failure.

## Iteration 3 — Faction Type × Base Name sensitivity and Neutral calibration (2026-11-20)

Two separate problems investigated **without expanding the production data schema**.

### A. Faction identity diagnostics
Across 450 unchanged-seed controlled worlds, permuting only the **Base Names** of the six actual generated Factions changed Zone selections in **79.6%** of worlds and Location selections in **100%** (mean Jaccard set distance 0.452 Zone / 0.623 Location); swapping Faction Types among factions 2–6 produced 78.0% / 99.8% changed and mean set distance 0.413 / 0.604. These counterfactuals reuse the same seed and city, and the same six Faction slots; the effects are contextual and propagate through greedy selection. Average absolute B-affinity change for the original selected Place/Faction pairs was 5.15 points (Base swap) and 8.83 points (Type swap). **Interpretation:** Base Names already have a meaningful influence on selection even if Type affects scores more. Do not strengthen Base mechanically without a clear qualitative failure.

The actionable imbalance was **Neutral priority**: v0.3 Neutral target 1.50 made Neutral the prioritized faction in roughly 29.6% of selected Locations even though normalized Neutral supply was only 18.8%; this crowded the opportunities to prioritize the six actual Factions. A lower neutral target improves this mismatch while preserving 6-Faction supply accounting.

**Decision: KEEP neutralDemand=1.40**, via existing Selection - Controls B14 only; engine default synchronized. No other weights, faction mapping, Function A, Bias, or scoring logic changed.

**Independent holdout: 1,500 seeds 1030000–1031499, same seeds for 1.35/1.40/1.50.**

| KPI | v0.3 Neutral 1.50 | KEEP Neutral 1.40 |
|---|---:|---:|
| Effective Zone diversity | 31.34 | 31.42 |
| Effective Location diversity | 58.72 | 59.36 |
| Zone Function TV error | 0.1395 | 0.1398 |
| Zone Faction TV error | **0.0484** | 0.0519 |
| Location Function TV error | 0.0623 | **0.0610** |
| Location Faction TV error | 0.0346 | **0.0310** |
| Neutral Location priority frequency | 29.6% | **18.1%** |
| Neutral Location normalized supply | 18.8% | 18.4% |
| Distinct actual factions prioritized per world (Location pool) | 4.27 / 6 | **4.50 / 6** |
| Structural errors | 0 | 0 |

Neutral 1.35 was also tested: Location Faction TV 0.0304, Location diversity 59.56, but Neutral priority dropped to 13.2% while supply was 18.2%; 1.40 keeps the gap small without unnecessarily suppressing Neutral.

### B. Logical close-neighbor co-occurrence diagnostics
Existing directed `Place - Place` matrix was inspected, not changed. The appropriate existing Zone→Location affinity is already high (**95**) for Harbor→Dock, University→Library, Monastery→Temple, Mining Grounds→Mine, Palace District→Palace, and many other logical pairs. A trial lightweight per-Location additive preference from the currently selected Zones (max, mean, or mean of top-two directed link affinities) was tested across 300 paired worlds at several weights. It increased the share of selected Locations with >=85 mapping to at least one Zone, but **did not consistently improve the important semantic pairs**; e.g., max link weight 0.5 yielded Harbor→Dock 31.6→46.5%, while University→Library 12.8→7.7% and Monastery→Temple 20.9→14.0%. Higher weights also worsened demand balance and/or Type diversity. `max` saturated quickly because many Location types already match at least one of ~7 Zones.

**Decision: REJECT the neighbor-bonus experiment, keep the existing matrix and selection algorithm intact.** Actual physical proximity has not been measured because placement and Site are intentionally out of scope. The next bounded problem is to evaluate a simple Zone→Location conditional selection/mandatory phase *when placement begins*, rather than forcing co-occurrence through generalized probability bonuses.

### Regression checklist
- Universe variety: Zone and Location effective diversity both stable/improved.
- Fictional frequency: no additional Type-specific bias changes; distribution retains nonuniformity.
- Function coverage/overlap: no modifications to Function A; Location function TV slightly improved.
- Faction Type+Base: validated by paired counterfactuals; Neutral calibration improves actual-Faction opportunities.
- Logical neighbors: documented that static affinity alone cannot enforce contextual co-occurrence, and the tested shortcut was not reliable.
