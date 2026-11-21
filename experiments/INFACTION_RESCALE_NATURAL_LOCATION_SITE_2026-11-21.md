# Infaction — Rescale with natural Location distribution (experiment, 2026-11-21)

**Not locked.** This experiment does not change canonical master JSON, existing locked generator, or [Site checkpoint](../checkpoints/INFACTION_SITE_BASELINE_2026-11-21.md).

## Tested scenarios
1. Original 74 Location candidates + original special modifiers: Hideout −8, Camp −8, Shelter −2.
2. Original 74 candidates, remove only these three special modifiers.
3. Promote Fortress, Palace, Mine, Factory from Scale 2 to 3, removing their Location eligibility (70 candidates), special modifiers still enabled.
4. Same 70 candidates, **remove all three special modifiers**.

All four retain the pre-existing Function minimum/maximum soft bonus/penalty, Zone/Faction matching, and random parameters. The fourth is **not** a zero-Function-balancing/no-constraint simulation. 1,000 identical seeds 8100000–8100999, fixed local locked selection logic.

| Scenario | Pool | Effective location diversity | Function minima OK (worlds) | Function maxima OK (worlds) |
| --- | ---: | ---: | ---: | ---: |
| 74 original + modifiers | 74 | 68.629 | 1000 | 998 |
| 74 original no special modifiers | 74 | 68.081 | 1000 | 998 |
| 70 rescale + modifiers | 70 | 64.785 | 998 | 999 |
| **70 rescale, no special modifiers** | **70** | **64.313** | **999** | **996** |

Under 70 without specials: only one world misses Migration minimum by one. Four worlds exceed Migration max by one. The remaining 13 Function categories always respect minima and maxima in this sample. These are observed rates, not guarantees.

## Natural frequency red flags
After removing specials, Hideout occurs in **766/1000 worlds** and Camp **732/1000** (previous 74 baseline with specials: 586 and 550). Both are over the previous *soft* 60% appearance aspiration. Shelter: 600 occurrences. The most important issue is over-concentration, **not Function scarcity**. The top remaining candidates are Tunnel 643, Crypt 604, Barracks 581, Manor 558. Four promoted Place types disappear from Location pool by definition, so observed effective diversity cannot directly match the 74-candidate baseline without a substitute pool.

## Real Site rerun (same 1,000 world seeds)
All scenarios use the same Site candidate filter and greedy grouping: Scale 2–4; exclude already selected Zone/Location/Site names; Zone affinity ≥45; standalone Inside score ≥2, Outside ≤2; H2≥45, Lowest≤35, gap≥15. No Site fallback.

| Metric | 74 original + modifiers | 70 rescale + modifiers | 70 rescale, no special modifiers |
| --- | ---: | ---: | ---: |
| Generated Sites | 3,052 | 2,988 | **3,065** |
| Worlds with Site | 994 | 993 | **995** |
| Site→Location watchlist affected Sites | 494 | 383 | **370** |
| Watchlist relation occurrences | 858 | 641 | **614** |

The 26-pair watchlist is a **subjective semantic diagnostic, not a proven error rate**. Reductions in hits can come from removing large Place names from the Location pool. The experiment did not provide full manual review of all generated Site contents. The Size/Scale 1–5 is an **internal classification**; equal Scale can contain equal Scale; child Scale higher than Site is disallowed by proposed hierarchy interpretation, but the fixed Site algorithm itself was not changed by this experiment.

## Potential mini Location substitutes already in original dataset
Do **not** invent new Place types initially. Use existing 70 small types to maintain Function coverage, favoring the original affinity and Function tags:
- Fortress (Defense) → Barracks, Guardhouse, Training Ground, Armoury, Tower.
- Palace (Authority & Residence) → Treasury or Office/Courthouse for Authority; Manor or House for Residence. There is **no single perfect Palace replacement** in the pool.
- Mine (Resources) → Well, Mill, Farm for resources; Tunnel captures mining imagery but is tagged Logistics/Exploration rather than Resources in the source.
- Factory (Production) → Workshop, Forge, Mill, Printing House, Brewery.

Do not automatically change those Function tags. Any feature adjustment requires separate qualitative approval and distribution retesting.

## Recommendation / next experiment
1. Retain 70-candidate/no-special-modifier run as **experimental natural baseline**.
2. Diagnose why Hideout and Camp appear in >70% of worlds, especially their Zone/Faction/Function score contribution by selection stage.
3. Prefer **minimal per-stage or Function-context tuning** rather than restoring global fixed penalties, and measure full frequency distribution, Function quotas, Site count, and semantic samples against the natural baseline on identical seeds.
4. Optionally compare one narrower rescale at a time: Fortress, Palace, Mine, Factory independently. A rescale is worth retaining only if it creates recognizably better Site groupings after Location distributions are tuned.
5. Preserve original checkpoint; do not modify raw master or locked generator until user approval.

**Caveat:** this is local notebook-logic execution; no live hosted Colab test was observed.
