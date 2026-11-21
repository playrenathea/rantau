# Infaction — Experiment A: Site-only A/B smoke test (2026-11-21)

## Decision boundary
**EXPERIMENT, NOT LOCKED.** The most recent accepted Site baseline is the saved **one-matrix** Site Grouping checkpoint. Proximity–Containment split and routing remain under exploration. This experiment does not alter master Book1, Site checkpoint, City, geographic placement modules, Colab, or MVP.

## Inputs
- Proximity P: canonical 118x118 original Place Affinity from `data/infaction_master_v0.4.json`, master blob `4f6ab46cc5f63ca5ad67240077a12787ffbae862`.
- Containment C: [v6 mapping candidate](../data/infaction_geography_proximity_containment_mapping_v0.4.7_refined_v6.json), directional 118x118.
- 50 candidate Site types, 36 Zones, effective 71 Location candidates.
- 1,000 paired seeds `8100000..8100999`. World source pools approximated in JS for isolated comparison; **not identical to locked Faction/Zone/Location, political assignment and City Colab runtime**. Zone sample is weighted from the approved catalog, Location sample weighted by original Proximity to selected Zones, and pre-Site parent/standalone pools assigned with a proximity-biased stochastic algorithm. Both A and B consume exactly the same pre-Site containers per seed.
- Baseline Site method: symmetric P Site↔Zone and Site↔child.
- Experiment A Site method: **C(Zone, Site)** for zone container eligibility, **C(Site, Location)** for child scoring; standalone City score screening preserved.
- Other Site rules intended to be unchanged: >=3 direct Locations/container; H2>=45, lowest<=35, gap H2-lowest>=15; greedy by largest gap; >=2 children and at least one Location retained; uniqueness and split by largest qualifying adjacent drop. This is a reconstructed smoke test, not a bit-for-bit replication of the source Python.
- No modifications to geographic placement, political dominance, City scoring or original Proximity source were made in this experiment.

## Paired proxy results

| KPI | Baseline P | Candidate C v6 |
|---|---:|---:|
| Selected Sites / 1,000 proxy worlds | 3865 | 3531 |
| Mean Sites/world | 3.865 | 3.531 |
| Worlds with at least one Site | 999 | 997 |
| Distinct Site types observed | 50/50 | 50/50 |
| Selected Site–Location memberships | 10678 | 8770 |
| Members with C=0 | 4215 (39.47%) | 0 (0.00%) |
| Mean H2-lowest gap of selected Sites | 50.14 | 72.96 |
| Site size=2 | 2145 | 2316 |
| Site size=3 | 970 | 835 |
| Site size=4 | 448 | 292 |
| Site size>=5 | 302 | 88 |

Numerical interpretation: selected Site total falls by **334 (-8.64%)**, membership falls **1908 (-17.87%)**, 2-Location grouping grows as a share, and average contrast gap increases by **22.81**. The C=0 audit is **not an independent validation** because C itself controls membership eligibility. This is a model-consistency metric, not measured physical truth.

## Examples
- Seed 8100001, P baseline: `Garden` in `Cultural District` groups `Meeting Hall, Arena, Brothel, Gambling Den`; new C-v6 avoids this grouping.
- Seed 8100000, P baseline: `Trading Post` in `Market District` groups `Shop, Office, Bookshop, Brothel`. C-v6 groups only `Shop, Office` there.
- Seed 8100000, C-v6: `Citadel` in `Military Base` groups `Guardhouse, Tower`.
- Seed 8100001, C-v6: `Palace` in `Government District` groups `Treasury, Office, Courthouse, Archive`.
- C-v6 appears to sharply change per-Site frequencies. Most frequent `Festival Grounds`: 373/1000 worlds vs baseline 183; `Rebel Camp`: 2 vs baseline 67? No, baseline top/bottom list did not report Rebel Camp: **do not assert baseline Rebel count**. All 50 observed but tail becomes extremely thin.

## Main issue isolated
The historical Site greedy criterion `gap = H2 - lowest` can be artificially inflated under a sparse containment matrix, where the lowest child frequently has C=0. Zeroes make many candidates appear high-contrast; they can dominate even when only 2 of many eligible Locations fit. This confounds affinity semantic improvement with an unrelated selection pressure. It may explain rise of size=2 and concentration in some Site types. **Do not change raw Containment scores solely to fix the contrast-greedy bias.**

## Next controlled tests (not run here)
1. A1: recompute the exact same paired-world test with gap ranking based on a coverage-aware score (e.g., H2 gap plus child-count or accepted-membership mass), **without changing eligibility thresholds**. Keep original greedy as control.
2. A2: test whether selective soft floors on credible rare relationships lower zero-gap artifacts without creating absurd pairs.
3. Run the *actual canonical locked* generation/placement/City pipeline and cache fixed seed worlds before any final judgement about number of Sites, Site diversity, political geography, Outside distribution, or functionality quotas. The current paired proxy results do not justify a new locked release.

## Verdict
**Do not lock C-v6 runtime replacement yet.** Early semantic improvement is promising, but 8.6% fewer Sites and the sparse-zero gap artifact are substantive regressions/risks. The original one-matrix Site baseline remains active.
