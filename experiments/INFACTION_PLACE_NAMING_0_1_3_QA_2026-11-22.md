# Infaction Animal-Flavor Place Naming — lock + QA (2026-11-22)

## Locked source and scope
- Source vocabulary: [Infaction — Item & Location Vocabulary.xlsx](https://drive.google.com/file/d/16sv3x_1NjoGehj3WFcmdAgQXq81lG4-i/view), tab/section `ANIMAL ASSOCIATION VOCABULARY`. **All 109 original words and their curated Animal associations preserved**; 56 Animal labels.
- Frozen production-friendly data: [`data/infaction_animal_place_flavor_v1_locked.json`](../data/infaction_animal_place_flavor_v1_locked.json).
- Naming implementation: [`infaction_place_naming_locked.py`](../infaction_place_naming_locked.py).
- Runtime entry: [Colab World + Access + Naming](https://colab.research.google.com/github/playrenathea/rantau/blob/main/notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb).
- This is a post-ownership **display-only naming overlay**. Does not change Faction generator, political ownership, Place IDs, base names, relationship geometry, numeric affinities, Hidden, Restricted or access nodes.

## Naming algorithm
1. Global per-Flavor `Location Weight` is exactly 0/1/3, stored once per word. No Place-by-Flavor affinity matrix, no category-specific Baby/Sound/Habitat exclusion and no anti-repeat quota.
2. **0**: Item-only label; ineligible for Place names. Six items: Antenna, Mandible, Hide, Wool, Ivory, Wax.
3. **1**: Grammatically permissible but eccentric/contextual, e.g. Whisker, Snout, Piglet, Tadpole, Nymph, Grunt, Purr. **3**: broad/general use, e.g. Fang, Claw, Wing, Feather, Howl, Den, Pack, Nest. 53 words weight 1, 50 words weight 3, 6 words weight 0. All are initial editable editorial weights under locked simple algorithm.
4. **Single owner**: take Animal from that Faction, weighted-select associated eligible Flavor, output `[Animal]'s [Flavor] [Base Place]`.
5. **Dual owner**: intersect the eligible Flavor sets of both Faction Animals, weighted-select Flavor, output `[Flavor] [Base Place]`. If no overlap, leave `[Base Place]` unchanged; do not invent associations.
6. **No owner**: keep `[Base Place]`.
7. **City**: historic convention `[Government Animal]'s [associated Flavor] City`, independently of City's political ownership. This is a naming convention, **not** a new ownership assignment.
8. For all Place roles, one generic redundancy safeguard excludes words already present as a whole token in the base Place name (e.g. prevents `Den Gambling Den`). If candidates empty, base-only fallback.
9. Independent reproducible seeded weighted sampling using blake2b keyed on seed, Place ID, purpose. No reroll of ownership and no changing Place names used as lookup keys. Preserve `name` and `base_name`; new `display_name` and `attributes.naming` on flat and tree Place structures.
10. **Gate/Checkpoint** access-node labels stay unmodified `[Base Place] [Gate Label]`, not `[Faction Name]...`; also unchanged `to_place_id` and `from_parent_id`.

## QA evidence
**Exhaustive static checks** on 109 original words × all 56 original Animal × 118 original Place types + City:
- 109 valid words, 103 Place-eligible, six Item-only excluded.
- 56/56 Faction Animals covered, 2–13 eligible Flavor choices per Animal.
- 353 direct Animal-Flavor associations and 42,007 eligible Animal–Flavor–Place combinations, considering 119 base Place labels.
- 1,540 possible Animal pairs: 417 have at least one shared eligible Flavor; **1,123 have no overlap** (72.9%). This is explicitly acceptable and triggers base-name fallback.
- One identical-word redundancy found in raw pairing (`Den Gambling Den`); prevented by the single generic duplicate-token filter.
- No malformed source vocabulary labels, unsupported Animal references, or missing Animal coverage found.

**2,000 synthetic seeded worlds** using the original 56 Animal, original 118 Place names, six unique Animal factions per world, 36 sampled Place names per world, and a synthetic 50% Single / 30% Dual / 20% None ownership distribution. This is a naming stress workload, **not** an end-to-end 2,000-world replay of the locked political generator.
- 72,000 Place naming cases + 2,000 City naming cases.
- 35,911 Single, 21,614 Dual, 14,475 None cases.
- 15,837 Dual cases used no-overlap fallback.
- 2,000/2,000 City names successfully generated; 41,688 decorated original Place names.
- Zero format-pattern violations, zero Item-only Flavor leakage, zero exact display-name collisions. Five potentially repetitive `Den Gambling Den` cases in preliminary run were eliminated by the generic same-word exclusion in the final module.
- Example output patterns: `Stag's Antler Guardhouse`, `Lion's Growl Printing House`, `Wing Residential District`, `Octopus's Ink City`. Examples are illustrative patterns, not claims from complete full-runtime QA.

## Remaining caveats / status
- **Editorial naturalness** is subjective. 0/1/3 tuning is sufficient as a simple first lock, not a guarantee that all grammatically valid flavor combinations sound idiomatic.
- The complete Colab remains built on historical **v0.4.6** Faction/Zone/Location selection. No hosted Colab clean-run or full end-to-end v0.4.8 certification is claimed.
- The *naming overlay* and its data weights are **DESIGN LOCKED**. Individual Flavor weight tuning can be revised explicitly if subsequent examples justify it.
