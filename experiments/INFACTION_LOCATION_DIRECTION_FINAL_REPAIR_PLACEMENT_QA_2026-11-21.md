# Infaction — final Location direction & Placement QA (2026-11-21)

**Experimental direction accepted for further work; historical locked snapshot untouched.** Previous checkpoint: [Site baseline](../checkpoints/INFACTION_SITE_BASELINE_2026-11-21.md). No direct changes to canonical master, locked modules, or Colab notebooks.

## Location configuration
- Rescale: Fortress, Palace, Mine, Factory from Scale 2→3 for eligibility, hence 70 rather than 74 Location types.
- Special Location score adjustments **replacing** old three: Hideout −9, Camp −8, Tunnel −3, Crypt −2, Shelter −1, Research Facility +9. These are Location selection score deltas, not Function affinity edits. Original Function soft balancing and other selection stages unchanged.
- After Location Generation: for each Function below its minimum, choose **uniform random** from unused Location candidates having Function affinity ≥75; append the selection; recount and repeat until all minimums satisfied. Do not replace a previously chosen Location and do not impose a hard 30 cap. Allow infrequent Function maximum overage as decided.
- QA uses 2,000 world seeds 8100000..8100999 and 9100000..9100999. Code script: local `infaction_location_final_repair_placement_qa.py` / data `infaction_location_repair_placement_qa_2000.json` generated in conversation environment. They are **not** linked as repo files.

## Actual Location QA
| KPI | Result |
|---|---:|
| Worlds | 2,000 |
| Zones | 16,030 |
| Target Location total (prior to repair) | 49,953 |
| Final Location total | 49,958 |
| Worlds requiring repair | 5 (0.25%) |
| Appended Locations | 5 |
| World minimum Function quota passed before / after | 1,995 / **2,000** |
| World maximum Function quota passed before / after | 1,999 / 1,999 |
| Remaining minimum deficits | **0** |
| Maximum violations | Migration +1 in one world |
| Selected Location appearance max | Barracks 1,194/2,000 = **59.7%** |
| Selected Location appearance min | Mortuary 219/2,000 = **10.95%** |
| Effective diversity | 65.340 (from 70 eligible types) |
| Location max per world | 30 (31 allowed, not observed) |
| Duplicate Location names | 0 |

Five repair cases: 8100707 Exploration→Crypt; 8100786 Exploration→Tunnel; 9100237 Exploration→Tunnel; 9100261 Migration→Ship; 9100375 Exploration→Tunnel. 30-location worlds did not need repair in these samples; upper bound not coded by final pass.

## Placement QA on same 2,000 generated worlds
Used locally validated replica of original locked Placement and City Placement postprocessors (not direct execution of GitHub modules or hosted Colab). The original algorithms do not mutate selection.
| KPI | Result |
|---|---:|
| Location placements | 49,958 |
| Directly inside selected Zone | 43,597 = 87.27% |
| Standalone Location (no Zone) | 6,361 = 12.73% |
| Standalone Inside City | 4,664 |
| Standalone Outside City | 1,697 |
| Placement stage 1 (political) | 6,868 |
| Placement stage 2 (affinity incl. Outside) | 43,090 |
| Invalid Zone references | 0 |
| Missing/duplicate assignments | 0 |
| City standalone keys mismatch | 0 |
| Location assignment changes from final repair (among 109 pre-existing Location slots in 5 repaired worlds) | 1 |

Outside Zone counts across worlds: exactly 1: 739; 2: 920; 3: 338; 4: 3. No zero Outside Zone.

## Decision and remaining limitations
- Location selection plus hard-minimum **append-only final repair** passes the requested QA, and can be treated as the **new design direction**.
- Placement integration passes structural checks. **Qualitative placement plausibility**, source-locked module exact-code regression, hosted Colab smoke test, and Site re-generation under final Location direction remain separate work.
- This note records the design direction and test, **not** a claim that locked runtime or canonical Scale were committed. Preserve the old checkpoint; deploy versioned implementation only when ready for baseline promotion.
