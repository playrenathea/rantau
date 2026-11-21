# Infaction — same-seed Site comparison: original vs targeted family filter vs Containment v6

**Status: experiment, not locked.** The official baseline still uses one symmetric Book1 Place Affinity matrix. This report compares *three treatments of the same pre-Site proxy worlds*, seeds 8,100,000–8,100,999. The current canonical Python Faction→Zone→Location→Placement→City pipeline has **not** been executed in this test; pre-Site pools and Site greedy logic are reconstructed in JavaScript. The numbers are not canonical Colab production benchmarks.

## Treatments
1. **Original baseline:** single original Place Affinity for Site eligibility and child association, historical H2 / Lowest / Gap logic.
2. **Targeted filter:** exactly the same original Site choices as treatment 1, then post-filter only Farm / Dock / Shipyard Site type and Farm / Ship / Dock Location type according to [family rules v2](infaction_targeted_farm_ship_site_filter_v2.json). Recheck selected Site parent Zone affinity (>=45), child eligibility and >=2 remaining children whose original Site affinity >=45. Restore all rejected or canceled children to the original parent container; no new Site generation.
3. **Containment v6 replacement:** original Site greedy algorithm with directed C(Zone,Site) for zone-side eligibility and C(Site,Location) for child scoring, using [C-v6](../data/infaction_geography_proximity_containment_mapping_v0.4.7_refined_v6.json). No post-filter.

[Detailed machine-readable same-seed results](INFACTION_SITE_3WAY_BASELINE_TARGETED_CONTAINMENT_PROXY_2026-11-21.json).

## Results (1000 paired synthetic worlds)

| Metric | Original | Targeted | Containment v6 |
|---|---:|---:|---:|
| Selected Sites | 3,860 | 3,787 | 3,559 |
| Sites vs original | — | -1.89% | -7.80% |
| Worlds with >=1 Site | 997 | 997 | 999 |
| Site types observed | 50 | 49 | 50 |
| Grouped Location memberships | 10,695 | 10,474 | 8,824 |
| Grouped memberships vs original | — | -2.07% | -17.49% |
| Effective Site diversity (inverse Simpson) | 31.96 | 31.49 | 25.41 |
| Effective diversity vs original | — | -1.47% | -20.49% |
| Sites with exactly 2 child Locations | 2,145 | 2,111 | 2,341 |
| Sites with >=4 child Locations | 740 | 720 | 365 |
| Child pairs with C-v6 score=0 (self-referential diagnostic) | 4,391 | 4,261 | 0 |

Targeted filter: **73 canceled Sites**, **80 explicitly rejected member relations**, **102/1000 worlds affected**. These totals overlap in the sense that a rejected child from a canceled Site is restored with all the Site's children; do not add 73 and 80 as if they were independent world counts. 221 fewer grouped memberships than original means those Locations were returned direct to their source pool, not deleted. Cancellations by Site: Shipyard 33, Camp 15, Warehouse 6, Inn 5, Mine 5, Workshop 7, Brewery 2.

Targeted's **49/50 observed types** is a measured tail regression (identity not available from the currently saved top-ten aggregate, must be rechecked against detailed per-type output before accepting). Do not infer all 50 types are equally frequent or that the missing type is necessarily wrong.

## Important interpretation
- Original maximizes output coverage and retains greater diversity, but known semantically dubious Farm/Ship/Dock relationships may survive.
- Targeted removes the specific high-risk family relationships while retaining most coverage and variety, but **does not fix unrelated semantic oddities** such as Garden containing Gambling Den. A targeted filter's broader semantic quality was not audited independently.
- Containment v6 eliminates its own matrix-zero relationships, but this **is not independent semantic validation**. Sparse C drives more two-child Site groups and sharply reduces memberships and effective diversity.
- Benchmark measures structural consistency and output distribution; neither generated group quality nor faction nuance was evaluated by external human annotators.

## Preferred next step
Targeted filter is the leading **experiment**, not yet locked: inspect lost rare Site type and hard-coded allowlists for false exclusion; then run the same post-filter on *actual locked generated worlds* to quantify the real regression. Avoid replacing the entire affinity matrix before that validation. Keep original one-matrix Site baseline unchanged.
