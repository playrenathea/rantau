# Infaction — targeted Farm + Ship/Dock Site filter experiment (2026-11-21)

**EXPERIMENTAL; NOT LOCKED; original one-matrix Site grouping is still the baseline.**
Do not replace the main Place Affinity, change Political Placement, or route general Site scoring through Containment v6.

## Inputs
- [Curated, context-aware family allowlists v2](infaction_targeted_farm_ship_site_filter_v2.json) (the Farm and maritime families overlap with general locations such as Stable, Warehouse and Inn, without requiring their unrelated use elsewhere to be restricted).
- [Pure Python post-Site prune implementation](infaction_targeted_farm_ship_site_prune_v2.py).
- [Nine deterministic QA cases with exact input and expected output](INFACTION_FARM_SHIP_FILTER_V2_FINAL_RULE_QA_2026-11-21.json).
- Original source remains canonical Book1 118×118 Proximity in `data/infaction_master_v0.4.json`, as used by the historical locked Site algorithm.

## Scope
- Protect **Site types** `Farm`, `Dock`, `Shipyard`: prune children outside their dedicated plausible child list and cancel whole Site when its selected Zone is not a plausible parent.
- Protect **Location types** `Farm`, `Ship`, `Dock` in *any* Site: reject if that Site cannot coherently contain them, or if they have zero original affinity to the Site's Zone.
- The supporting names `Mill`, `Stable`, `House`, `Warehouse`, `Outpost`, etc. are allowed as family facilities, **not globally restricted** when encountered elsewhere.
- `Farmland` and `Harbor` act as relevant Zone candidates, not additional Site types under the current nominal scale.
- All unrelated Site types, candidate eligibility scoring, Gap ranking, matching, and City rules stay unchanged.

## Post-grouping transaction order
1. Existing one-matrix Site generator proposes the Site and children without modification.
2. **Site→Zone**: if a Site has a Zone parent, original `P(Site,Zone) >= 45` must still hold. For Site=Farm/Dock/Shipyard, the parent must also be on the allowlist. If it fails, **cancel Site** and return all children to their original direct parent.
3. **Site→Location**: drop any child not allowed for Farm/Dock/Shipyard, or Farm/Ship/Dock Locations in a wrong type of Site. For the three protected Location types, also require original `P(Location,Zone) > 0` if the Site has a parent Zone. The unrelated world locations remain untouched.
4. Recalculate **retained child H2**, requiring `>=45` and **at least two retained children**. If either fails, **cancel Site** and restore *every* original child to the exact original Zone/standalone pool. If valid, restore only removed children as direct children of the same original container.
5. Do not force a replacement Site, move an orphan to another Zone, reassign a politically placed Location, or rerun greedy grouping. Require no losses, duplicates or cycles in Site membership.

## Examples of tested transactions
- Farm / Farmland with Mill + Stable + Ship → keep Farm(Mill,Stable), return Ship.
- Dock / Harbor with Ship + Farm → cancel Dock entirely; return both children.
- Shipyard / Caravan Camp with Ship + Dock + Warehouse → cancel Site because parent Zone is not a supported shipyard context even though raw P=55.
- Inn / Harbor with Tavern + Stable + Ship → remove Ship, then H2 of remaining children falls below 45, so cancel Inn and restore all children.
- Shipyard / Harbor with Mill + Tailor + Dock → retain all three (sawmill/sailmaking can be shipyard facilities).

## QA evidence and limits
- 9/9 deterministic cases passed, checking zone eligibility, contextual child filtering, H2 after pruning, cancellation and restoration.
- Catalog audit showed Farm and Dock retain all original ≥45 Zone candidates; Shipyard loses Caravan Camp. The filtered families cut a small set of otherwise high-P but semantically questionable children.
- **Not yet done:** actual Python execution of postprocessor against saved canonical Site world outputs; 1,000-world impact metrics; performance, Site frequency and total membership changes.
- These checks are static and scenario QA, not a claim that full-world generation has been run.

**Next:** once canonical post-Site results are accessible, apply the exact same filter to fixed-seed saved Site records to measure cancellations, reattached child Locations and per-type distribution. Baseline remains unchanged until explicitly accepted.
