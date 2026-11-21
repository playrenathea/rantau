# Infaction — CURRENT LOCKED BASELINE v0.4.7

**Status: CANONICAL CURRENT SPECIFICATION (LOCKED), 2026-11-21.**
This document supersedes older v0.4.x design-direction notes for the purpose of determining **what Infaction currently specifies**. Earlier Book1, checkpoints and code remain source references, not competing design versions. A spec lock is not proof that a historical notebook, City module or deployed MVP has already been migrated.

## Source precedence and frozen inputs
1. Immutable original Book1 data and the canonical `data/infaction_master_v0.4.json` are the reference for original affinity scores, scales, functions, Types, Base Names and Animals.
2. Approved overlays and mechanics in **this v0.4.7 specification** supersede earlier effective values, including any stale labels in the master Sheet or old Colab.
3. Keep historical Site checkpoint `checkpoint/infaction-site-before-rescale-2026-11-21` and original data unchanged for rollback.

## Pipeline
**Faction generation → Faction naming → Zone generation → Location generation → Function minimum repair → political alignment → political Location→Zone placement with post-choice exception → geographic Location→Zone or standalone placement → Inside/Outside City → Site grouping.**

### 1. Factions and names
- Seven candidate slots; F1 Government, F2 Revolutionary. F1 cannot contain Elite, Poor, Revolutionary or Outsider.
- Place Elite and Poor in distinct slots within F2–F6; Outsider may occupy F2–F7 subject to max two Types/slot; other available Types are distributed using the existing unique/slot sequence.
- Drop slot 7, leaving six Factions. Preserve locked weighting, ranking, unique Base Name/Animal handling, conflict priority and Base-specific grammar weighting as in v0.4.2 selection rules. Do not use a simplified alternative naming algorithm as production truth.

### 2. Zones
- Select 7–9 unique Zones, original Scale 4–5; six Faction-informed selections plus 1–3 supplemental.
- Preserve accepted Faction Type/Base alignment, randomized score, Function soft bonus/penalty, existing Zone score modifiers and Function thresholds.
- No arbitrary Zone child-capacity limit.

### 3. Locations — latest effective pool
- **71 eligible types**. Start from original 74 Scale 1–2 Location types, remove **Fortress, Palace, Mine, Factory** (effective Scale 2→3), add **Town Hall** (effective Scale 3→2); original Book1 scales remain intact.
- **Meeting Hall stays Scale 2**. Its 2→1 change was never approved.
- Target initial Location count: round/clamp Normal(25, sigma 2.5) into 20–30; one instance per Place.
- Preserve three locked selection stages: one Location per selected Zone, one Location per Faction, supplemental picks up to initial target, with established randomization, Function soft constraints and existing scoring.
- Active Location score modifiers **replace** legacy three special modifiers: Hideout −9, Camp −8, Tunnel −3, Crypt −2, Shelter −1, Research Facility +9. This changes selection scores, not underlying affinity data.
- **Function minimum repair**: after initial selection, count 14 Function coverages at raw Function affinity ≥75. For each deficient Function, draw uniformly from unused eligible Location names with that Function affinity ≥75; append (never replace), recalculate, repeat until all minima met. No hard 30 limit after repair; maximum quota stays soft.

### 4. Two geographic-affinity meanings — canonical
- **Proximity**, `P(A,B)=P(B,A)`: suitability to appear near one another or in the same geographic context. The existing immutable Book1 118×118 Place Affinity is the authoritative raw **Proximity** matrix.
- **Directional Containment**, `C(parent,child)`: suitability for a child to be located in, form part of, or be grouped into the same geographically coherent complex as its parent. The two directions are distinct; attachments such as Dock→Ship can be valid geographical grouping without literal internal architectural containment. Merely high Proximity does not prove Containment.
- Implement Containment as a **lightweight directional compatibility overlay informed by Proximity, effective Scale and targeted semantic compatibility** rather than transcribing 13,924 new scores manually. Same-effective-scale grouping can be valid.
- The **concept and required routing are LOCKED**. The precise derivation formula, hard exception inventory, score calibration and Outside-score adaptation have **not been selected/benchmarked**, so do not substitute made-up coefficients, mark them approved, or claim the new Containment route is operational. These are implementation parameters requiring a tested value, not a reason to downgrade the canonical architecture to a mere proposal.

### 5. Political alignment and Stage 1 placement
- Six Faction alignments + static Neutral v2; retain previously locked raw alignment, two-way normalization 50:50 A/B, Single/Dual thresholds and Exact→Mixed matching.
- Random uniform among eligible political Zones. Each Location has at most one parent; Zones have unlimited Location capacity.
- **Post-choice exception**: for Ship, Dock, Farm and Farmland only, if the selected political Zone's raw **Proximity** is zero, discard that assignment and defer to Stage 2. Do not pre-filter and retry alternate political Zones; do not generalize a physical cutoff to other Location types.

### 6. Stage 2 geographic placement
- Match only as-yet-unassigned Locations to generated Zone(s) or standalone Outside option.
- Retain approved A/B normalization (70% A, 30% B), argmax with random exact ties, no arbitrary zone capacity, and no Stage 1 relocation.
- **The geographic parent-child suitability signal is Directional Containment** instead of symmetric Proximity. The historical expression `Outside = 100 − max(raw Zone–Location proximity)` is a v0.4.6 numeric implementation and must be recalibrated with Containment, not blindly asserted as final v0.4.7 mathematics.
- `standalone` means no Zone parent; it does not force Outside City.

### 7. Inside/Outside City
- One City across all Zones. Zone City Score uses original Book1 and four approved overrides to 1: Caravan Camp, Village, Necropolis, Rebel Camp.
- Any Zone whose effective City Score is 0 is mandatory Outside. Let N = Zone count, R = count of such Zones. Add precisely one more Outside Zone when R=0, or R=1 and N≥8, or R=2 and N=9. Choose the nonmandatory Zone with minimum score `0.6 × Zone City Score + 0.4 × mean(direct child Location City Scores)`; if no direct children, score = Zone City Score. Random exact ties. No lottery/quota cap.
- Child Locations inherit their Zone City designation. Only standalone Locations roll independently: City score 0/1/2/3/4 → Inside probability 0%/35%/60%/85%/100%.

### 8. Site grouping
- Site candidate names are all effective Scale 2–4 types (50 types under current changes); exclude any name already used as a selected Zone, Location, or Site in a given world.
- Site grouping containers: direct children of each Zone, standalone Inside City pool, standalone Outside City pool. A container with fewer than 3 Locations is ineligible.
- Site→Zone preliminary raw **Containment** signal; historical threshold 45. For standalone containers, a Site's City Score must be ≥2 for Inside, ≤2 for Outside.
- Per candidate evaluate Site→Location directional **Containment**, sorted high→low; H2=second highest, L=lowest, gap=H2−L. Historical eligibility H2≥45, L≤35, gap≥15. Greedy highest gap; random exact ties; recompute after each Site. Include high-score Locations, exclude low-score, split ambiguous band by maximum allowed adjacent-score drop; Site has ≥2 children and ≥1 original Location remains in container. No fallback or forced Site count.
- **Greedy structure and semantics are LOCKED**. Numerical thresholds 45/35/15 refer to the historical Proximity-scale baseline and must pass calibration on the new Containment scores before being treated as a completed operational migration.

## Quality gates
- Preserve selected-world diversity, genre-plausible distribution, Function coverage with limited overlap, six Faction representation and affinity with Type+Base, and natural coappearance of close neighbors.
- Validate 71 Location eligibility, uniqueness, 14 Function hard minima post-repair, parent integrity, city inheritance, full Site type distribution, and directional semantic grouping.
- Use reproducible fixed seed cohorts and original 118×118 matrix as invariant source; compare against saved Site checkpoint and prior 1,000-world results. Interpret historical results as reference, not as current-v0.4.7 production output.
- Do not rewrite original Book1 or call an older v0.4.6 notebook the latest release.

## Version/status clarification
**v0.4.7 is the latest locked DESIGN SPECIFICATION, not a verified fully integrated executable build.** The old code paths use proximity for geographic placement and Site experiments; v0.4.7's directional overlay has no benchmarked numeric implementation yet. A runtime labeled v0.4.7 must conform to the full specification and pass tests before it is called released or verified. No unapproved numeric value is implied by this lock.

References: `decisions/INFACTION_TOWN_HALL_SCALE_2_DIRECTION_2026-11-21.md`, `decisions/INFACTION_PROXIMITY_CONTAINMENT_DIRECTION_2026-11-21.md`, `experiments/INFACTION_LOCATION_DIRECTION_FINAL_REPAIR_PLACEMENT_QA_2026-11-21.md`, `checkpoints/INFACTION_SITE_BASELINE_2026-11-21.md`.
