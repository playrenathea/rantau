# Infaction v0.4.7 — Proximity + Directional Containment Mapping: Refinement and QA

**Status: research mapping completed / candidate for numeric integration. Not a generator release or new approved numerical LOCK.** This file is a concise snapshot of the latest v0.4.7 mapping pass. Original Book1 and existing v0.4.x runtime remain untouched.

## Canonical artifacts for this mapping pass
- [Latest research mapping JSON](../data/infaction_geography_proximity_containment_mapping_v0.4.7_candidate_final.json)
- [Full directional containment matrix CSV](../data/infaction_containment_matrix_v0.4.7_candidate_final.csv)
- [Readable nonzero directional edges CSV](../data/infaction_containment_edges_v0.4.7_candidate_final.csv)

Earlier `*_draft*` and `*_refined_v3*` files are historical iterations, **not the current mapping**.

## Ground rules applied
- Existing immutable Book1 `118×118 Place Affinity` remains **symmetric Proximity**. This work did not overwrite it.
- **C(parent,child)** is non-symmetric by default; same effective Scale permits both directions **when the Place meanings support it**, not universally.
- Different Scale prefers **larger parent → smaller child**, without forbidding special inverse readings that have a coherent scope interpretation.
- **0 is valid** for implausible pairs. Rare-but-plausible connections receive low positive scores, suitable for eventual faction/context tuning. Do not transform arbitrary 0s into positive relations just to maximize coverage.
- Same physical world instance must be an **acyclic parent graph** even where both pair directions in the *generic mapping* are positive.
- **Correct processing orientation**: geographic Zone assignment uses `C(Zone, Location)`, Zone→Site eligibility uses `C(Zone, Site)`, and Site child eligibility uses `C(Site, Location)`. This is distinct from old symmetric Site↔Zone threshold checks. It fixes a potential wrong-direction implementation trap.

## Iteration audit
1. First research mapping: 711 positive edges; 37 reciprocal pairs. Large class-based zero areas contained false negatives (Bank→Vault, Ship→Hideout, etc.), and some scale inversions lacked explanation.
2. Second pass: reviewed cross-family zeroes (Farm/Ship/Dock), reinstated plausible facility relationships (Bank→Vault, Courthouse→Archive, Ship as faction-driven Hideout, Prison ship), and removed unsupported raw-Scale inversions.
3. Third pass: high-Proximity/zero audit reinstated physical relations like Treasury→Vault, Slum→Sewer, Tavern↔Gambling Den, and Harbor→Tavern. A high Proximity with zero directional Containment is acceptable if only adjacency is supported.
4. Fourth pass: Site-eligibility audit revealed a missing Embassy parent profile; added realistic Embassy→Office/Meeting Hall/Archive/Guardhouse etc.
5. Fifth pass: corrected Zone→Site lookup direction and explicitly supported Necropolis/Rebel Camp/Refugee Camp/Slum inside appropriate Zones, while retaining contextual/rare weighting.

## Structural QA results
| Check | Result |
|---|---:|
| Original Place types | 118 |
| Directed matrix cells | 13,924 |
| Nonzero directed relationships | 786 |
| Zero cells | 13,138 |
| Reciprocal-positive unordered pairs | 43 |
| Reciprocal equal-effective-Scale pairs | 25 |
| Reciprocal different-effective-Scale pairs | 18 |
| Nonzero reverse-scale directed links | 22 |
| Site candidates from effective Scale 2–4 | 50 |
| Sites with ≥2 potential Location children with score≥45 | **50/50** |
| Sites with ≥1 potential Zone parent with score≥45 | **50/50** |
| Minimum high-score child choices across Site types | 4 |
| Minimum high-score Zone choices across Site types | 1 |
| Score integer range [0,100], diagonal zeros and selected cross-family forbiddens | **PASS** |

**Interpretation:** all 50 Site types are structurally possible, not guaranteed to appear at a particular frequency in a generated world. The old H2/Lowest/Gap Site selection may still suppress some; this is not a dynamic 1,000-world test.

## Illustrative semantics
- `Farmland→Farm` and `Farm→Farmland` both plausible under differing meaning of *farm* (farmstead vs whole holding).
- `Village→Manor` (a manor house in village) and `Manor→Village` (landed manor encompassing tenant village) both possible; interpret scope explicitly.
- `Harbor→Shipyard`, `Shipyard→Harbor` reflect distinct potential scales (public port vs mega shipbuilding complex with private harbor).
- `Dock→Ship` is a valid geographic berth attachment, `Ship→Dock` zero.
- `Ship→Hideout`, `Ship→Prison`, `Ship→Black Market` rare but defensible for pirate, criminal, revolutionary or transport factions.
- `Inn→Ship`, `Farm→Ship`, `Ship→Farm`, `Farm→Shipyard`, `Farmland→Dock` remain zero.

## Source and interpretation limits
- The initial source for proximity and effective scales is [master](../data/infaction_master_v0.4.json), original Book1 table `raw.book1_original["Place Affinity"].rows`.
- Historical comparators: manor estates described by UK National Archives (<https://www.nationalarchives.gov.uk/help-with-your-research/research-guides/manors/>), East Midlands Historic Environment Research Framework (<https://researchframeworks.org/emherf/regional-overview/medieval-period/>), and Sheldon Manors (<https://www.sheldonmanors.org.uk/guide/what-is-a-manor>). RPG location hierarchy also discussed at <https://cros.land/rpg-setting-generator-and-world-building-tool/>.
- These are **conceptual reference points**; the 0–100 containment scores are subjective designed estimates, not measurements from cited texts. Fiction/game contexts inform generic plausibility, not blanket permission for all fantasy exceptions.
- **Not executed:** latest mapping against 1,000 fully generated matched-seed worlds, Site frequency distribution, geographic Outside-score calibration or exact current Colab source. These must be addressed before replacing numeric runtime logic.

## Recommended next controlled integration
Freeze the current candidate mapping file as the *research result*, then run the **same world seeds** through geographic placement + Site grouping under both existing symmetric Proximity and the new directed C, with Stage-2 Outside score recalibrated, comparing quotas, amount of standalone Locations, Site eligibility, Site sizes, semantically anomalous placements, and Faction-context edge use. Do not silently change the v0.4.7 approved model or immutable original data during this exercise.
