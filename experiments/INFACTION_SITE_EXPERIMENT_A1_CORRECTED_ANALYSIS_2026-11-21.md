# Infaction — Site Experiment A1: corrected split, ranking sensitivity (2026-11-21)

**Experiment only; no changes to locked Site baseline or generator.**

## Data
- [Full 1,000-seed paired proxy outputs](../experiments/INFACTION_SITE_EXPERIMENT_A1_CORRECTED_SPLIT_PAIRED_PROXY_2026-11-21.json) — seeds 8,100,000–8,100,999.
- Data sources: master original 118×118 Place Affinity (Proximity), and C-v6 candidate mapping at `data/infaction_geography_proximity_containment_mapping_v0.4.7_refined_v6.json`.
- All methods consume identical reconstructed pre-Site Zone/Location pools. Reconstructed world selection is **NOT** the locked Python Colab generator. No user approval to promote this research into locked data is implied.
- First A1 test had an invalid split-bound calculation `k<=n-1-excluded` and was discarded. Correct requirement is `k<=min(n-1,n-excluded)`, with `k>=max(2,count(score>=45))`. The corrected test is authoritative for this experiment.

## Numeric results

| Method | Sites | Child assignments | Effective diversity (inverse Simpson) | 2-child Sites | Sites with 4+ children | World coverage |
|---|---:|---:|---:|---:|---:|---:|
| P_gap | 3860 | 10695 | 31.96 | 2145 | 740 | 997/1000 |
| C_gap | 3559 | 8824 | 25.41 | 2341 | 365 | 999/1000 |
| C_H2 | 3558 | 8827 | 25.34 | 2336 | 366 | 999/1000 |
| C_gap8 | 3484 | 8861 | 25.41 | 2184 | 436 | 999/1000 |
| C_gap16 | 3469 | 8900 | 25.32 | 2115 | 449 | 999/1000 |
| C_gap32 | 3450 | 8920 | 25.28 | 2055 | 465 | 999/1000 |
| C_mass20 | 3485 | 8867 | 25.29 | 2181 | 437 | 999/1000 |
| C_mass40 | 3477 | 8898 | 25.22 | 2136 | 445 | 999/1000 |
| C_coverFirst | 3450 | 8926 | 25.29 | 2049 | 465 | 999/1000 |

Differences:
- C_gap vs P_gap: Sites -7.80%; grouped child memberships -17.49%; effective Site diversity -20.49%.
- C_gap16 vs C_gap: Sites -2.53%; grouped child memberships 0.86%; effective Site diversity -0.35%.
- All methods observed 50 types (at least once). This does not prove that tails are well represented.

## Interpretation
1. Pure containment improves conformity to its own directional map: no grouped child has C=0. This is **tautological/self-referential** as a quality measure, not independent semantic proof.
2. Sparse C values exaggerate H2-lowest contrast, especially when lowest=0, promoting narrow high-contrast Site candidates and reducing child coverage.
3. Candidate rank bonuses for child count or child-score mass partially reverse size=2 preference but do **not** recover baseline Site diversity or total grouped child coverage. C_gap16 raises membership count 76 while reducing Site count 90; diversity 25.32 vs 25.41.
4. This rules out **ranking-only** as the main fix; likely next focus is how sparse directional affinity interacts with candidate eligibility and available natural child grouping, not indiscriminate changes to all zero entries.
5. The old Site checkpoint was measured using a different pre-Site generator/pool: do not confuse its historical 3,052 Site count with this synthetic proxy's 3,860.

## Decision
- **Keep single-matrix Site grouping LOCKED.**
- Keep proximity/containment split experimental.
- Do not lock C-v6 or any A1 ranking algorithm.
- Next efficient test: compare a restrained *proximity-guided soft-context path* or targeted C coverage changes for naturally plausible relationships vs C-only, using same cached worlds, ensuring hard implausible pairs (Farm/Ship etc.) remain zero. To avoid overfitting, separate discovery cohort and validation cohort.
- Before production promotion, reproduce on the actual Python locked Faction→Zone→Location→Placement→City pipeline, including latest effective 71 Location pool and repair.
