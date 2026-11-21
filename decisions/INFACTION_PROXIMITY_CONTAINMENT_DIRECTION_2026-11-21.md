# Infaction — Proximity vs Directional Containment Decision History (2026-11-21)

**Status: HISTORICAL DECISION RECORD. Superseded as the CURRENT baseline by [Infaction v0.4.7 LOCKED specification](../specs/INFACTION_CURRENT_LOCKED_V0.4.7.md).** The architectural decision is part of current v0.4.7; numeric Containment implementation remains unverified.
This decision follows the accepted 71-Location selection direction, append-only Function repair, political geographic-zero exception, locked Location→Zone placement and locked Inside/Outside City placement, plus the saved Site grouping baseline. It **does not** amend the immutable Book1 source or silently replace historical locked modules, Colab, or MVP.

## Reason
The existing canonical Book1 raw Place Affinity (118×118) measures symmetric geographic/semantic relatedness and is currently reused for selection, geographic placement and Site grouping. Relatedness/proximity is not proof that one Place can physically contain another. Example: Inn↔Ship can be contextually related without Ship being inside Inn.

## Two distinct affinity concepts — accepted

1. **Proximity Affinity**, P(A,B)=P(B,A): suitability for Places to be near one another, co-occur in a geographic setting, or share location-related context. Preserve the original canonical 118×118 raw Place Affinity unchanged and use it as the Proximity baseline. Proximity alone never certifies parent–child containment.
2. **Containment Affinity**, C(parent,child), generally C(A,B)≠C(B,A): suitability for the child to belong to/lie within the parent, or for both to function as one valid geographic complex or grouping. A physical attachment such as a ship moored at a dock can qualify as valid geographic grouping without literal building-within-building containment. Direction matters.

Containment will initially be implemented as a **lightweight directional compatibility overlay derived using Proximity plus effective Scale and targeted semantic exceptions**, rather than manually authoring an independent 118×118 matrix from scratch. This is an implementation approach, not a finalized formula. Do not fabricate numeric containment scores or imply that scale alone guarantees containment. Same-scale grouping may remain valid.

## Intended process routing — accepted direction

- Faction generation and naming: unchanged Faction Type/Base/Animal sources; neither geographic affinity used directly.
- Zone generation: unchanged Faction and Function scoring.
- Location generation Zone Stage: **Proximity** between candidate Location and selected Zone (retain scoring and randomization).
- Location generation supplemental stage: **Proximity** against existing Locations and Zones (retain other factors and randomization).
- Location generation Faction Stage and Function minimum repair: unchanged non-geographic scoring and eligibility.
- Political alignment, Single/Dual dominance and Exact/Mixed political matching: unchanged political affinities.
- **Post-political geographic-zero exception**: for Ship, Dock, Farm, Farmland, retain the already-approved raw **Proximity > 0** check against the randomly selected political Zone. If zero, reject *after selection* and defer to Geographic Placement; do not pre-filter or reassign on this pass.
- **Stage 2 Geographic Location→Zone Placement**: intended to use directional **Containment(Location's parent Zone, child Location)** in place of symmetric raw Place Affinity. Preserve the existing A/B 70:30, Outside option, and matching mechanics unless separately approved. The precise way to derive the Outside score under a new containment scale must be validated before implementation, rather than silently assumed.
- **Site Grouping**: intended to use directional Containment for Site→Zone preliminary compatibility and Site→Location child compatibility. Preserve existing candidate pool logic, greedy structure, grouping thresholds, and City filters until a controlled A/B test justifies adjusting them. Numerical threshold calibration on the derived scale is **not yet approved**.
- **Inside/Outside City**: unchanged City Score and inheritance, not a geographic affinity operation.

## Illustrative semantics, NOT numeric data or hard-coded rules

- Farmland→Farm: suitable; Farm→Farmland: generally not.
- Harbor→Dock; Shipyard→Ship: suitable.
- Dock→Ship: valid *attachment/grouping* (moored), not literal building containment.
- Inn→Ship: unsuitable as a child even if Proximity is appreciable.
- Hunting Grounds↔Farm may have proximity without automatically implying containment.
- Site→child direction must not be inferred by reversing the symmetric raw Place Affinity matrix.

## Lock boundary / next validation
- **Locked now:** two affinity semantics, directional containment, original matrix retained as proximity, overlay-first approach, intended routing, preservation of historical baselines.
- **Not yet locked:** derived Containment score formula, full exception list, calibration/thresholds, Outside-score derivation, semantic QA criteria, implementation version.
- No production code, canonical JSON/Sheet, notebooks, or MVP are changed by this decision document.
- Run matched-seed controlled simulations (including 71-Location direction) comparing current Site coverage/diversity and qualitative directional containment; verify Geographic Placement distribution and Function quotas before promoting new implementation.

## Related baselines
- `checkpoints/INFACTION_SITE_BASELINE_2026-11-21.md`
- `decisions/INFACTION_TOWN_HALL_SCALE_2_DIRECTION_2026-11-21.md`
- `infaction_placement_locked.py`
- `infaction_city_locked.py`
