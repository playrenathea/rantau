# Infaction Flavor v2 — activation and QA checkpoint (2026-11-22)

## Active implementation
- Production Python naming: `infaction_place_naming_locked.py` with postselection exact whole-word redundancy fallback; no reroll and singular/plural stay distinct.
- Canonical Colab: `notebooks/Infaction_v0.4.8_World_Access_HOTFIX_20261122.ipynb` now reads active `data/infaction_animal_place_flavor_v2.json` and `data/infaction_place_impression_tags_v2.json` (291 terms, 56 Animal types).
- Web: `infaction-flavor-v2-lab.html` reads the active data and is linked from the legacy `index.html`. This is **not full parity** with old JS world generator v0.3.x.
- MASTER Sheet / spec / Google Doc are updated. GitHub Actions workflow `.github/workflows/infaction-flavor-v2-qa.yml` committed.

## Executed QA (functions runtime, active GitHub JSON)

1. Active dataset: **291 unique Flavor words**, **291 Impression mappings**, **56 Animal types**, all tag arrays length 1–6; **PASS**. Counts by tag cardinality: 1=112, 2=152, 3=12, 4=10, 5=5.
2. Actual browser naming lab JavaScript compiled and executed with a mock DOM and active fetched JSON; **PASS** for Single, Dual, City and None.
3. Forced redundant **Den** against **Gambling Den** using controlled random draw: **PASS** Single `Wolf's Gambling Den`, Dual `Gambling Den`, and both report no reroll.
4. Exact-word tokenizer cases for punctuation, case and singular/plural distinctions: **PASS**.
5. Deterministic JavaScript naming sampler: **10,000 runs, zero structural failures**. This is a browser-side simulation, **not** a Python Colab world-generation execution.
6. Paired 19,660 randomly generated distinct-Animal+Place cases, with same input sample for v1 and v2: shareable tag-matched Flavor absent in Dual **v1 86.74%**, **v2 42.15%**. Good expansion but **Dual still often falls back to plain Place name**. This is a modeling result under random Animal/Place pairs, **not** a measured full-world ownership frequency.

## Incomplete verification

- Python regression tests `tests/test_infaction_naming_redundancy.py`, candidate QA `tests/qa_infaction_flavor_v2_candidate.py` and headless full-world smoke `tests/smoke_infaction_v048_colab.py` are committed and referenced by the CI workflow but **no completed GitHub Actions run has been observed**.
- Hosted Colab clean run through final JSON download is **not yet verified**. Do not mark end-to-end green or claim GitHub Pages publication verified.
- New Animal associations remain editorially provisional. Legacy data and staged candidate inputs remain intact for rollback and curation.

## Interpretation

The broad v2 candidate expansion substantially improves Dual Flavor feasibility compared with v1 without changing the 0/1/3 rules; however it also over-associates certain words/Animals. Future tuning should improve association quality without claiming all 291 associations are curated.
