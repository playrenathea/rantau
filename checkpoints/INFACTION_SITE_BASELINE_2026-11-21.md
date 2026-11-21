# Infaction — Site checkpoint (2026-11-21)

**Status: SAVED BASELINE / rollback point.** No rescale, no changed affinities, no modified locked algorithms in this checkpoint. All rescale proposals are hypothetical until separately approved.

## Authoritative data
- Canonical snapshot: `data/infaction_master_v0.4.json` (GitHub blob SHA `4f6ab46cc5f63ca5ad67240077a12787ffbae862`). Place affinity: `raw.book1_original["Place Affinity"].rows` (118×118). Original Book1 archival data and approved overlays in same master. No competing affinity source.
- Locked world selection: Faction→Zone→Location; 36 Zone types, 74 Location types, 7–9 selected Zones, 20–30 selected Locations.
- Locked Location→Zone: `infaction_placement_locked.py`; locked Inside/Outside city: `infaction_city_locked.py`. Their outputs are inputs to Site experiments; do not change them during Site tuning.
- Active Colab: `notebooks/Infaction_Locked_City_Placement_v0.4.6.ipynb` (preflight+postprocessors). GitHub Pages legacy MVP is separate.

## Site baseline to preserve
- Candidate Site: all 50 types Scale 2,3,4 in canonical master; exclude a Site whose Place name was already used as selected Zone, selected Location, or previously selected Site within a world.
- Containers: Zone's directly assigned Locations, standalone Inside City pool, standalone Outside City pool, only if each has ≥3 Locations; Zone child is never counted as standalone.
- Preliminary filter: Site→Zone affinity ≥45; standalone Inside City Site score ≥2; standalone Outside City Site score ≤2.
- For each candidate, sort Site–Location affinities descending; H2=second-highest, L=lowest, candidate gap=H2−L. Eligible if H2≥45, L≤35, gap≥15. Greedy: choose highest eligible current gap, recalculate against remaining unassigned Locations, random tied candidates. Site holds at least two Locations; at least one remains in parent. Values ≥45 must enter, values ≤35 must stay outside, intermediate (35,45) use largest adjacent-score drop among allowed splits. No fallback or forced Sites.
- Historical local run (seed 8,100,000–8,100,999; 1,000 worlds): 4,510 eligible containers; 36,492 container–Site candidates pre-H2/Lowest/Gap; 10,906 eligible pre-greedy; 3,052 selected Sites; 994/1,000 worlds with Site; ~3.052 Sites/world; Site grouping sizes 2:1887,3:769,4:299,5:76,6:20,7:1. These are local experimental figures, NOT a locked output or independent proof of semantic containment.
- Earlier semantic audit flagged 494/3052 Sites for human review using a subjective 26-pair watchlist; **do not treat this as a true error rate**. Affinity measures relatedness/suitability and is symmetric: a high score does not prove physically directional containment. A Site can be a large but still recognizably normal complex.

## Next hypothesis: rescaling Place types
- Do NOT edit original Scale as the first experiment. Counterfactually evaluate proposed Scale adjustments against baseline selected worlds/Sites; distinguish Scale-feasibility from semantic plausibility. Proposed candidates for review (not approved): Fortress 2→3, Palace 2→3, Mine 2→3, Factory 2→3, Meeting Hall 2→1, Town Hall 3→2; optional Manor 2→3, Market 2→3, Prison 1→2, School 1→2, Courthouse 1→2, Mill 1→2.
- **Critical dependency:** current selection pool takes Locations from Scale 1–2. Any promotion from Scale 1→2 retains Location eligibility, but 2→3 can remove a Location type; 2→1 may remove Site eligibility; 3→2 may add a Location type. Test selection and distribution changes before approving raw rescale, and check Zone-pool interactions for 4/5 scales. Maintain current world generation and affinity data unmodified until approved.
- Measure: affected Location pool sizes and frequencies, any broken function quotas, changed Site pool and coverage, quality of scale-inversion flags (not automatically semantic errors), and samples. Run locked selection repeatedly on fixed seeds for both baseline and counterfactual before choosing.

## Rollback
The immutable checkpoint branch refers to the exact repository state at creation. To restore baseline, switch or compare against that branch; do **not** blindly revert later approved unrelated commits. All prospective rescale edits must be tracked separately.
