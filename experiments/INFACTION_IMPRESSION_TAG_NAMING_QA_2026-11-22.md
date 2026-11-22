# QA — Impression-tag Animal-Flavor naming v2 (2026-11-22)

Status: implementation/data static QA, not hosted-Colab execution. The test uses the actual GitHub MASTER Place catalogue, actual 109-word curated Animal vocabulary, and current tag mapping. Pair coverage is **exhaustive** for all Animal × Place and Animal-pair × Place options. A full runtime Colab seed execution was **not performed**.

## Inputs and validation
- 56 Animals; 109 Flavor words (103 eligible, six Item-only); 118 Book1 Place types.
- All Flavor and Place keys have 1–3 nonempty multi-tags. Invalid tag entries: 0.
- Segments: Power, Mystery, Nature, Community, Commerce, Prestige.
- Generated Grounds is a derived alias of Garden, not a source catalog row. City uses four broad tags (Power/Community/Commerce/Prestige) to support Government city naming.

## Exhaustive pairing counts
- Flavor × Place: weight 3 = 5463, weight 1 = 6690, weight 0 (Item-only or exact-word tautology) = 709. Eligible = 12153.
- Single Animal × Place: 6608 cases; at least one weight 3 = 5681; only weight 1 = 927; no eligible candidates = 0.
- Dual Animal pair × Place: 181720 cases (1540 distinct Animal pairs); at least one shared weight 3 = 28310; shared Animal flavor of any eligible weight = 49206; no shared weight 3 => plain name = 153410. **These are candidate spaces, not actual ownership distributions.**
- Grammar format uses only single-token English nominal modifiers, possessive Animal prefix for Single/City, and plain modifier + Place for Dual; no animal/place token inserted in unknown positions. This demonstrates template validity, not a guarantee that every semantically unusual combination reads naturally.

## Editorial spot checks
- Egg Crypt: weight 1
- Egg Garden: weight 3
- Cub Treasury: weight 1
- Cub Shelter: weight 3
- Chick Noble Quarter: weight 1
- Feather Palace: weight 3
- Hiss Vault: weight 3
- Hiss Tavern: weight 1
- Pounce Fortress: weight 3
- Nymph Prison: weight 1

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
