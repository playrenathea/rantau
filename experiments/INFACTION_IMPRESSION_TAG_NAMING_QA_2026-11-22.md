# QA — Impression-tag Animal-Flavor naming v2 (2026-11-22)

Status: implementation/data static QA, not hosted-Colab execution. The test uses the actual GitHub MASTER Place catalogue, actual 109-word curated Animal vocabulary, and current tag mapping. Pair coverage is **exhaustive** for all Animal × Place and Animal-pair × Place options. A full runtime Colab seed execution was **not performed**.

## Inputs and validation
- 56 Animals; 109 Flavor words (103 eligible, six Item-only); 118 Book1 Place types.
- All Flavor and Place keys have 1–3 nonempty multi-tags. Invalid tag entries: 0.
- Segments: Power, Mystery, Nature, Community, Commerce, Prestige.
- Generated Grounds is a derived alias of Garden, not a source catalog row. City uses four broad tags (Power/Community/Commerce/Prestige) to support Government city naming.

## Exhaustive pairing counts
- Flavor × Place: weight 3 = 4763, weight 1 = 7390, weight 0 (Item-only or exact-word tautology) = 709. Eligible = 12153.
- Single Animal × Place: 6608 cases; dynamic weight coverage established exhaustively in initial QA; final editorial retuning requires regenerating this specific breakdown (not claimed here).
- Dual Animal pair × Place: 181720 cases (1540 distinct Animal pairs); candidate-space count was computed before editorial retuning; final runtime replay confirms weight-3-only selection and plain fallback. **These are candidate spaces, not actual ownership distributions.**
- Grammar format uses only single-token English nominal modifiers, possessive Animal prefix for Single/City, and plain modifier + Place for Dual; no animal/place token inserted in unknown positions. This demonstrates template validity, not a guarantee that every semantically unusual combination reads naturally.

## Editorial spot checks
- Egg Crypt = 1; Egg Garden = 3.
- Cub Treasury = 1; Cub Shelter = 3.
- Chick Noble Quarter = 1; Feather Palace = 3.
- Hiss Vault = 3; Hiss Tavern = 1.

## Runtime safety
- Original Place ID/name/topology, ownership, Access/Gate node names remain intact.
- Output data adds display_name and attributes.naming metadata.
- Seeded weighted selection is stable per Place ID independently of iteration order.
- Gate is always based on original place name.
- Existing v0.4.8 Colab remains a historical upstream v0.4.6 selection adapter. **Clean hosted end-to-end execution is not certified.**

## Source files
- data/infaction_animal_place_flavor_v1_locked.json
- data/infaction_place_impression_tags_v1.json
- infaction_place_naming_locked.py
- notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb


## Final replay QA (post-tuning, 2026-11-22)

**Runtime source:** Re-ran `Infaction_Faction_Naming_Zone_Location_Generator_v0.4.3_City_Experiment_Revised.ipynb` locally for 16 archived seeds from `worlds_sites_8100000_1000.json`; existing local replay reconstructs preserve-first ownership. Then reselected all display names with the **current** GitHub v2 six-impression-tag algorithm: same sorted weighted pool, BLAKE2b 64-bit per-seed/place RNG using `naming-v2`, and Dual weight-3 restriction. This is an actual upstream-generator replay, **not** a clean hosted full v0.4.8 integrated run.

**Final classification adjustments:** all 22 Baby Animal Flavor terms receive Nature tag (rather than globally broad Community); Hiss receives Mystery; Underworld is Mystery. These are editorial multi-tag revisions, not per-Place or per-ownership exceptions.

**Final exhaustive Flavor × Place status:** 109 × 118 = 12,862 pairs; weight 0: 709, weight 1: 7,390, weight 3: 4,763. All 109 Flavor and 118 Place rows have nonempty valid 1–3 tags. These numbers supersede pre-retuning values in earlier reports.

**16 replayed worlds:** 568 Place decisions; Single weight 3: 72; Single weight 1: 37; Dual weight 3: 18; Dual original/plain fallback: 63; None/plain: 378. All named Dual are weight 3 and each selected Flavor is associated with both owning Animals. No malformed naming template or direct word duplication detected by replay assertions. This is a 16-seed observed ownership distribution, not a general distribution claim.

### Actual name output excerpts (from replay, not authored examples)
- Seed 8100023, **Lion's Den City**: Fang Military Base (Dual, 3), Claw Fortress (Dual, 3), Claw Prison (Dual, 3), Pounce Barracks (Dual, 3), Claw Guardhouse (Dual, 3), Dolphin's Calf Refugee Camp (Single, 3).
- Seed 8100013, **Bear's Snout City**: Hoof Artisan Quarter (Dual, 3), Skull Rebel Camp (Dual, 3), Tail Stable (Dual, 3), Fur Treasury (Dual, 3), Wolf's Cub Military Base (Single, 1), Bear's Paw Palace (Single, 3).
- Seed 8100005, **Bear's Roar City**: Beak Library (Dual, 3), Beak Club (Dual, 3), Hare's Burrow Residential District (Single, 3), Bee's Honey Warehouse (Single, 3).
- Seed 8100007, **Elephant's Trumpet City**: Wing Noble Quarter (Dual, 3), Nest Underworld (Dual, 3), Owl's Eye Library (Single, 3).
- Seed 8100101, **Crocodile's Hiss City**: Hiss Vault (Dual, 3), Swan's Hiss Royal Quarter (Single, 1), Camel's Herd Refugee Camp (Single, 3).

**Editorial limitation:** even 3-weight tag overlap can yield an eccentric name (e.g., Nest Underworld, Beak Club). This is intentionally permitted as long as English compound grammar remains sound; no new per-Place veto rules have been added. Tag selection is a soft semantic weighting, not a guaranteed natural-language judge.

**Decision: NAMING V2 DESIGN LOCKED / IMPLEMENTED.** Stable source assets: `data/infaction_place_impression_tags_v1.json`, `infaction_place_naming_locked.py`, canonical Colab exporter. MASTER Google Sheet `Naming Impression Flavor` and `Naming Impression Place` mirrors were refreshed to match final mapping. Do not describe this as full v0.4.8 hosted runtime certification.
