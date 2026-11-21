# Infaction v0.4.7 — Containment coverage refinement QA v6

**Current candidate mapping:** [JSON](../data/infaction_geography_proximity_containment_mapping_v0.4.7_refined_v6.json) · [full 118×118 matrix](../data/infaction_containment_matrix_v0.4.7_refined_v6.csv) · [nonzero directed relationships](../data/infaction_containment_edges_v0.4.7_refined_v6.csv).

**Status:** researched and structurally validated candidate, **not integrated in current generator**. Earlier `*_candidate_final*` files are superseded as mapping drafts; the original Book1/Proximity and official locked v0.4.7 spec are unchanged.

## QA principle

“Site has ≥2 potential children and ≥1 parent at C≥45” was too weak to be meaningful. A threshold of 45 is merely moderate eligibility and does not guarantee enough candidates coappear in a random world. Revised QA tracks mean and weakest tail, plus stronger C≥60 and C≥75 distributions; **coverage is a diagnostic, not a rule to invent relationships**.

| Metric across 50 Site candidates | C≥45 | C≥60 | C≥75 |
|---|---:|---:|---:|
| Mean eligible Location child types | 7.48 | 4.78 | 3.34 |
| Mean eligible Zone parent types | 4.86 | 3.18 | 1.98 |
| Sites with fewer than 3 potential child types | 0 | 3 | 18 |
| Sites with fewer than 2 potential parent types | 0 | 2 | 19 |
| Sites with fewer than 3 potential parent types | 2 | 19 | 36 |
| Sites with fewer than 4 potential parent types | 13 | 35 | 44 |

**At C≥45, only Military Base and Monastery have exactly 2 parent Zone candidates.** The remaining 48 have ≥3. We deliberately did not fill these two with implausible parent relations. Every Site has ≥4 plausible high-enough Location child candidates. The check is catalog-level and ignores co-occurrence/selection exclusions.

## Audit decisions

- Audited which weak-parent Sites had naturally compatible Zone parents. Expanded only where a coherent scope example exists: Village→Brewery, Academic District→Hospital, Residential District→University, Wilderness→Rebel Camp, Residential District→Slum, Residential District→Village, etc.
- Kept stronger and rarer contexts distinct. A low positive score can be boosted by a relevant faction narrative later; it is not automatically above grouping threshold.
- Multiple directions valid only under distinct scale/instance interpretations; never form an actual cycle within one generated world.
- Zero scores remain for implausible Farm↔Ship, Farm↔Shipyard, Farmland↔Dock, Inn→Ship and Ship→Dock.
- **Direction in processing:** use `C(Zone, Site)`, `C(Site, Location)`, `C(Zone, Location)`; Proximity is the original immutable symmetric matrix.

## Summary

- 118 Place types; 13,924 directional cells; 836 positive, 13,088 zero.
- 43 bidirectional-positive unordered pairs. Tested score integrality, bounds, diagonals and key cross-family zeros.
- **Not yet measured:** live world generation with this matrix, exact old→new Site distribution change, semantic error rate under the actual greedy Site algorithm, Stage 2 outside-option calibration, faction-context modulation. Do not label these as passed tests.

This mapping version is a practical candidate to use for controlled simulation, not a claim that all pairs have historical proof or that every Site appears in generated outputs.
