# Infaction — Town Hall Scale 3→2 approved direction (2026-11-21)

**Approved for NEW generation direction** after comparative QA, **not an edit to the immutable Book1 original**. Historical rollback remains `checkpoint/infaction-site-before-rescale-2026-11-21`. This record adds to the previous experimental direction: Fortress, Palace, Mine, Factory 2→3 (removing them from Location candidates); six Location score adjustments Hideout −9, Camp −8, Tunnel −3, Crypt −2, Shelter −1, Research Facility +9; final append-only random Function minimum repair. As a result new Location eligibility is **71** kinds, including Town Hall at internal Scale 2. Town Hall remains eligible as Site (Scale 2–4).

## Controlled A/B test
- **1,000 worlds**, seeds 8100000–8100999, same generator, modifiers, and Function repair; change ONLY Town Hall candidate eligibility/scale from 3→2.
- Town Hall raw Function, Type, Base and 118 Place affinities obtained from **canonical master `data/infaction_master_v0.4.json`** original Place Affinity row; no invented scores. Four already promoted Scale2→3 Places excluded in both versions.
- Baseline (70): 24,869 selected Locations; frequency max **60.0%**, min **11.0%**; effective diversity **65.306**; all Function minima met in 1000/1000; all maxima in 999/1000 (one Migration excess); 2 worlds repaired / 2 appended.
- Trial (71): 24,872 selected Locations; frequency max **59.4%** (Tunnel), min **10.4%** (Mortuary); effective diversity **66.245**; Town Hall appears **322/1000 worlds = 32.2%**; all Function minima met in 1000/1000; all maxima in 1000/1000; 4 worlds repaired / 5 appended; no world above 30 Locations observed, though repair has no hard maximum.
- Other Location frequencies shift under unchanged seeds due additional candidate changing the random-draw stream. Biggest changes measured: Market −6.2 percentage points; Courthouse −5.7; Brewery −5.2; Cemetery −5.0; Dormitory +4.9; Office −4.5; Workshop −4.5; Inn −4.0.

## Decision / scope
- **Accept Town Hall 3→2** in new direction; keep canonical original Scale=3 as unmodified provenance and implement as a documented **selection-effective scale overlay** in the next versioned generator. The new effective 71-Location pool is the intended input for subsequent Site experiments.
- Not enough evidence to change any other Scale. Meeting Hall 2→1 remains **proposal**, not approved or applied.
- QA only proves the tested sample; held-out or full integration tests are not yet claimed. Old locked module/Colab and master data remain untouched, as does Site save point.

## Reproduction
Local script: `/mnt/data/infaction_town_hall_rescale_1000.py`; output `/mnt/data/infaction_town_hall_rescale_1000.json`. The path describes the conversation experiment environment; source files are not automatically part of the GitHub repository.
