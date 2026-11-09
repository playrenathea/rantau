# Rantau — Board-game NPC Reaction & Response Model (experimental)

**Status:** isolated, playable-engine integration **not performed**. The formula parameters are test hypotheses, not agreed design values. The old `js/game/conversation/response.js` and live `js/engine.js` are intentionally untouched.

## Inputs

- Canonical NPC table: `../content/playtest-npcs.js`, with V/D/P and per-Memory-Page Knowledge, Openness, optional Interest (emoji + priority 1–5), optional signed V/D attitude.
- Player token sequence: Topic and Emoji, using the existing parser, adjacency and Count grammar.
- Session: working V/D/P, initial Knowledge comparison and pending +1 flags, and a Player/NPC message history.
- Branch/Contra flags: the content fixture currently stores `null` (unassessed). Do not treat this as proof of no contradiction. A real branch preprocessor is still required.

## One beat

`resolveBeat(session,playerTokens,config)` performs:

1. Extract feature Counts / Relationship adjacency / Player Repeat Key.
2. Evaluate existing Emoji profile events: NPC-directed effects, conditionals, topic Alignment, Mimicry, ASK, and modifiers.
3. Calculate working V/D/P and per-beat engagement and annoyance.
4. Form actual message candidates from known NPC Memory Pages, optional attitudes and interests; a Relationship is rendered as its two known endpoint Topics.
5. Score candidates using Page disclosure, Knowledge, ASK evidence, Warm Up of Player-mentioned Topics, and recency-weighted Cool Down of the precise NPC output combination.
6. Select the highest-scoring candidate. Fully unknown explicit Player Topics have an emoji-only Confused response; exhausted Patience terminates with 💤.
7. Mark, but do not commit, potential +1 Knowledge changes. Record both messages.

No classifying Player strategies; no Answer/Ask/Inform/Redirect/Withdraw action ranking; the candidate's `mode` metadata records whether the selected message communicates information or asks a question, solely for the learning trigger.

### Reaction formula, schematic

`ΔV = saturate(emoji V+) + saturate(emoji V−) + alignment + mimicry − repeat − stackBackfire − contra`

`ΔD = saturate(emoji D+) + saturate(emoji D−) + knowledgeGap + repeat`

`patienceCost = max(0, beatCost + repeatAnnoyance + stackBackfire − engagement)`

Each beat uses current V/D. Patience never rises from this formula; highly engaging beats can have zero cost. Stacking is counted over the **entire message**, not merely a contiguous Emoji group. Repetition pressure is the sum of geometrically decayed previous instances sharing the existing four-class Player Repeat Key.

### Response formula, schematic

`Score(message) = Base(K, Page O adjusted by working V/D, Interest, Attitude, ASK) + WarmUp(Player Topic overlaps and Page Count) − CoolDown(exact output combination)`

- **Warm Up** applies to all message candidates containing a Player-mentioned Topic; relationship candidates can benefit from their endpoint Topics and Relationship Count.
- **Cool Down** uses recency-weighted exact output signatures. A Topic-only response, Topic+❓, Topic+👎, Emoji-only reaction and silence have distinguishable signatures. Both Player Repeat and NPC Cool Down share the *same exponential recency principle*, but have different keys and consequences.
- **Typed ASK** uses existing 📍/⏳/👥 filters and known relationship endpoints. It cannot fabricate unknown Topics.
- **Boring** is weak evidence when NPC Knowledge exceeds Player by at least two levels; ASK, Interest and positive Alignment remove that candidate. It is never an automatic result of low Player Knowledge.
- **Interest** is sparse; baseline priority competes with Warm Up and Cool Down. An Interest question does not teach Knowledge.
- **Openness** remains Page-specific. Its response contribution uses existing V/D state; it is not a new stored attribute.

## Learning and unresolved scope

`pendingPlayerGain` can be set to 1 when the NPC actually emits an information-bearing Page and a learning trigger exists (ASK, prior repetition, or adjacent Listen), subject to the at-least-two-level gap. `pendingNpcGain` is a preliminary direction-specific mark for a discussed NPC question-interest Page where Player Knowledge is higher by two levels. Neither side's Knowledge level changes mid-session. There is **no commit implementation** in this model.

These are *provisional triggers* and do not yet cover every branch-discovery/disclosure nuance or every form of Player-to-NPC teaching. The existing `js/game/learning.js` governs the established +1 cap; it will need to be composed with a future session finalizer, without prematurely applying branch pruning to NPCs.

## Test

`tests/board-model.test.mjs` verifies three NPCs, known/unknown Topic eligibility, low-openness information, typed question initiative, both Knowledge directions, repeat recency, cooldown key distinction, line-wide Emoji stacking and deterministic selection.

Use `npm test` in a Node environment to run all repository tests. This experimental code is NOT imported by `js/app.js` or `js/data.js`; no UI, UX or save migration is included.

## Calibration priorities

1. **Harun:** asking about low-O Saman should not guarantee immediate revelation; varying Topic and building rapport should let the Player obtain related information later.
2. **Jali:** high Knowledge and O, low P: opportunities to learn compete with limited beats.
3. **Ratih:** a specific typed question should arise from sparse Interest; learning should be directed from Player to NPC when the Knowledge gap and a valid trigger permit it.
4. Check whether any single Emoji sequence dominates across all three NPCs, whether repeated Topics exhaust P too quickly, and whether Warm Up / Cool Down cause meaningful rather than cosmetic changes.

No numerical balance claim is made until larger strategy simulations and UI-level checks are performed.
