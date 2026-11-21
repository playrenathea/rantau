# Infaction — political placement direction lock (2026-11-21)

**Decision locked as NEW DESIGN DIRECTION; not yet applied to the previously locked runtime module.** Historical save point: [Site checkpoint](../checkpoints/INFACTION_SITE_BASELINE_2026-11-21.md). All other Political Placement rules remain unchanged.

## Exact requested exception
- Run the current political preparation and Stage 1 Exact → Mixed matching as before, with random uniform selection among politically eligible Zones.
- For a chosen Stage 1 **Location→Zone** relation, if it involves the Place type **Ship, Dock, Farm or Farmland** and its canonical raw geographic Place Affinity to that Zone **equals exactly 0**, do **not** lock that relation as Stage 1 placement. Leave the Location unplaced and forward it to the existing Stage 2 Geographic Placement without alteration.
- If raw geographic affinity >0, apply the usual political placement. Do not apply the condition to any other Place types; do not introduce a general geographic threshold, reorder political candidate rankings, or modify Stage 2.
- This is a surgical exception for implausible water/land and farmland context, not a claim that other 0-affinity political relations are errors. E.g. School→Necropolis geographic affinity =25 in canonical data and is intentionally unaffected, including possible Religious+Academic faction story connections.

## Existing direction retained
- Six factions + Neutral static political normalization A/B (50/50); Zone/Location Single/Dual/None thresholds; Exact then Mixed passes; if multiple eligible political Zones, choose random uniformly.
- Non-politically assigned Locations (including exceptions) move to geographic Stage 2: Outside=100−max raw zone affinity; A/B mix 70/30; no hard quotas or forced parent. Zone capacity unlimited.

## Implementation/QA status
- This document records the user's decision; **no modification to** `infaction_placement_locked.py`, canonical Book1/master, or baseline checkpoint in this commit.
- Once implemented in the next versioned runtime, QA should confirm all four singled-out Place types have 0 zero-affinity Stage-1 parent relations; other types' Stage-1 behavior remains identical (subject to the existing random stream); all excepted Locations are passed intact to Stage 2.
- Potential nuance before implementation: specify whether the geographic-0 exception filters candidate Zones *before uniform choice* or rejects a chosen pair *after choice*. Current user wording is 'if geographical affinity =0, don't make them a political child, let them enter the next stage', which most directly supports **post-choice rejection**. Filtering candidates upfront would introduce an implicit alternative-zone search. Preserve post-choice semantics unless user updates the decision.
