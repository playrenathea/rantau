# Infaction — cheap rescale counterfactual (2026-11-21)

**Checkpoint (unaltered):** [Site baseline](../checkpoints/INFACTION_SITE_BASELINE_2026-11-21.md), frozen branch `checkpoint/infaction-site-before-rescale-2026-11-21` at commit `00420c0bdf3d920581ffcf0783f0e53c9565efce`.

## Scope and method
- Hypothesis, **not approved scale edits**: promote Fortress, Palace, Mine, Factory from Scale 2 to Scale 3. The locked Location selection pool is Scale 1–2, so remove these four types **only in memory** from `LOCATION_CANDIDATES`. All other scoring rules and world generation inputs unchanged. Compare 1,000 fixed seeds 8100000..8100999. The old Scale and algorithms in GitHub remain untouched.
- Separately relabel the previously selected 3,052 Site groupings to measure *scale-direction diagnostics*. This is a static annotation test, **not a full rerun of Site grouping** and **not a semantic ground-truth assessment**. Also explored a broader 12-change proposal as static annotation only.
- Source: existing locked v0.4.3 selection notebook whose active 36 Zone and 74 Location data have been matched to canonical JSON `data/infaction_master_v0.4.json`. Only temporary in-memory removal; no new affinity table.

## Measured selection impact (1,000 worlds)
| Metric | Baseline | Four promotions |
| --- | ---: | ---: |
| Candidate Location types | 74 | 70 |
| Distinct Location types selected | 74 | 70 |
| Total selected Locations | 24,867 | 24,867 |
| Effective Location diversity, exp(Shannon entropy) | 68.629 | 64.785 |
| Worlds meeting every Function minimum | 1,000/1,000 | 998/1,000 |
| Worlds meeting every Function maximum | 998/1,000 | 999/1,000 |
| World Location selections affected | — | 1,000/1,000 |
| Mean Location names shared per world across both runs | — | 11.834 out of 24.867 |

Selected type appearances eliminated from 1,000 worlds: Palace 584, Fortress 551, Mine 326, Factory 230. Most increased other types: Prison +152, Treasury +128, Well +106, Barracks +99, Courthouse +89, Guardhouse +80, Farm +75. The entire Location candidate loop consumes RNG draws for every available candidate, so removing candidates also reshuffles draws; the change is not merely replacing instances of the four promoted types. Zone output is unchanged under this isolated test; both runs had 8,010 Zones.

## Scale annotation of old Site groupings (not regenerated)
- Original: 1,074 Site–Location links had equal numeric Scale (871 Sites); 0 links had Location numerically bigger than Site, due original selection hierarchy (Site Scale 2–4, Location Scale 1–2).
- Promote four: 899 equal-scale links (784 Sites) and **178 links** (178 Sites) with Location Scale > Site Scale, mostly Garden→Palace (51), Meeting Hall→Palace (32), Embassy→Palace (27), Outpost→Fortress (25), Barracks→Fortress (15).
- Promoting the Place's Scale alone does **not** rewrite prior Site–Location affinities or prove/repair containment. It makes a scale-direction check possible, but also exposes inversions. If the generator subsequently removes those Locations from selection, the world and Site distribution must be regenerated; cannot reuse the 3,052 grouping counts as post-rescale outputs.
- Broad 12-change static annotation, **NOT simulated through world generation**: 438 links (393 Sites) numerically inverse; lowering Meeting Hall Scale 2→1 would exclude 85 previously selected Meeting Hall Sites from the Scale 2–4 Site pool. Town Hall 3→2 could newly enter the Location pool, but its effect was NOT simulated here.

## Decision
**Do not edit raw Scale yet.** The proposed four promotions significantly disrupt Location diversity and all sampled world compositions. The Site improvement hypothesis remains unproved. If further tuning is desired, test an explicit hypothetical *hierarchy plausibility* rule or a per-instance effective/nominal Scale without changing Location eligibility, compare semantic validity and Site coverage on **the same** generated worlds first. Do not confuse new scale labels with actual containment accuracy.

## QA limits
Local Python notebook logic was executed for 1,000 common seeds. Live hosted Colab was not executed; Site selection after rescale was not run and must not be claimed. All data files and original selected-world algorithms in the repo remain unchanged.
