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
