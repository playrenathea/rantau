# Infaction v0.4.7 — Full Proximity + Directional Containment Mapping (Research Pass 1)

**Scope:** All 118 original Book1 Place names; 13,924 directed cells. **Status:** complete candidate mapping for review, **not an approved formula/runtime update**. This is the mapping requested before tuning and implementing Containment. No original Book1, baseline generator, City, Site or locked spec was modified.

## Deliverables
- [Machine-readable full map](../data/infaction_geography_proximity_containment_mapping_v0.4.7_draft.json): all original/effective scales, role tags, row/column names and full 118×118 Containment matrix plus rationale categories, reviewed reciprocal scenarios and source URLs. Existing original 118×118 Proximity is referenced by canonical master blob SHA, not rewritten.
- [118×118 Containment matrix (CSV)](../data/infaction_containment_matrix_v0.4.7_draft.csv): parent rows × child columns.
- [Directed valid edges (CSV)](../data/infaction_containment_directed_edges_v0.4.7_draft.csv): 711 nonzero rows including original Proximity, effective parent/child Scale, basis, and review notes.

## Semantics
- **Proximity P(A,B):** symmetric geographic relatedness, closeness or natural coappearance, sourced exactly from immutable Book1.
- **Containment C(A,B):** directed parent→child relationship; encompasses a physically included feature, integrated complex, same precinct, or valid attachment such as ship moored at dock. It is *not* simply the numerical symmetric Proximity mirrored into a new table.
- **Same-scale and reverse-positive are possible.** Inverse values can reflect different meanings or sizes of A and B. A real generated world **must not** instantiate mutually enclosing A↔B or longer parent cycles. Choose a coherent single scope for each instantiated Place.

## Method
1. The canonical original 118×118 Proximity and the effective Scale changes already accepted for v0.4.7 were read; the original Book1 values were not altered.
2. Places grouped into broad narrative/location archetypes (civic, military, residential, rural, maritime, religious, academic, commerce, industry, etc.) using concrete place names.
3. 76 potential parent archetypes received curated core and context-dependent typical children; the remainder have no supported parent edges unless there is a reviewed exception. 340 nonzero core edges, 334 contextual edges, 26 explicitly reviewed-direction edges, and 11 weak inferred edges (manual review needed). In total **711/13,924 directed cells >0**; zero means **not established**, not universal physical impossibility.
4. Scores 0–100 are a *first-pass research heuristic*, informed by original Proximity plus parent/child effective Scale and contextual rules; they are **not calibrated empirical probabilities**. Scale reversal is possible for explicitly scoped contexts; never use hard nominal-scale cutoff as the only criterion.
5. **37 reciprocal-positive pairs** result. **12 pairs have named two-direction scope scenarios**; another 25 are heuristic/contextual and should not automatically count as approved reversible evidence.

## High-value checks (P=existing Book1, C=new candidate)
| Parent → Child | P | C | Interpretation |
|---|---:|---:|---|
| Farmland → Farm | 100 | 98 | Agricultural region has farms |
| Farm → Farmland | 100 | 76 | An expanded farm holding includes its fields |
| Harbor → Dock | 100 | 95 | Dock in harbor |
| Shipyard → Ship | 75 | 85 | Ship in working shipyard |
| Dock → Ship | 90 | 93 | Moored attachment/grouping |
| Ship → Dock | 90 | 0 | Reverse not ordinary |
| Inn → Ship | 50 | 0 | Related by proximity; not part of inn |
| Village → Manor | 75 | 90 | Manor house inside village |
| Manor → Village | 75 | 62 | Large manor estate includes tenant village |
| Harbor → Shipyard | 100 | 94 | Shipyard within harbor |
| Shipyard → Harbor | 100 | 58 | Huge shipbuilding precinct encloses harbor basin |
| Hunting Grounds → Farm | 55 | 25 | Rare or expanded-scope exception, not default |
| Citadel → Military Base | 90? | 92 | Citadel with military installation; check original P in CSV |
| Military Base → Citadel | 90? | 64 | Larger campus with inner citadel; check original P in CSV |

The last two Proximity values are *not asserted here*; use the canonical source/CSV for exact values.

## Interpretive reference categories (not numerical source data)
- **History / medieval manors:** Worcestershire Archive & Archaeology's discussion of manor estates and villages supports variable scope; a manor can encompass several settlements. https://www.explorethepast.co.uk/2014/06/manorial-documents-register-project-june-2014-the-landscape-of-the-manor/
- **Historic fortifications:** English Heritage's Castle Acre description and Historic England castle precinct studies show larger defensible sites with buildings and facilities within baileys. https://production.english-heritage.org.uk/visit/places/castle-acre-castle-and-bailey-gate/history/description/
- **Port history:** Boston Public Library maritime industrial research associates waterfront docks with warehouses and shipping. https://guides.bpl.org/maritimeindustry/facilities
- **Games / modular spatial nesting:** D&D Beyond's *Everything's a Dungeon* treats settlements, streets, neighborhoods and rooms as navigation contexts of different scope. https://www.dndbeyond.com/posts/1645-everythings-a-dungeon-a-different-approach-to
- **Game worldbuilding:** Ubisoft world director describes authenticity, contrasts and exploratory character of AC Odyssey's geography. https://www.ubisoft.com/en-gb/game/assassins-creed/news/2zOk4Z7OoI5COWAh6NRsfS/inside-the-studio-with-world-director-benjamin-hall
- **Fictional layered city:** Minas Tirith illustrates nested urban rings, inner citadel, dwellings and military facilities. https://tolkiengateway.net/wiki/Minas_Tirith

This is **selective comparative research**, not an exhaustive review of all historic works/games ever created. All numerical C scores are modeled proposals rather than measurements from these references.

## Important caveats and next gate
- The candidate map supplies **structural eligibility and draft strengths**, not conditional probabilities or a verified replacement for the old proximity-based geographic placement.
- Compare output in same-seed cohorts only after inspecting directional anomalies, calibrating Site H2/Lowest/Gap, and recalibrating Stage 2's Outside score against C.
- Do not automatically create physical relationships from strong P when C=0. The 711 curated/nonzero edges are intended to prevent examples such as an Inn containing a Ship.
- No source Book1 affinity values, existing 71-Location locked direction, Function minimum repair, or City rules change at this mapping stage.
