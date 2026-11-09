# Rantau — Board-game NPC Reaction & Response Model (experimental)

**Status:** active in the three-NPC browser playtest via `js/app.js`, but formula parameters remain provisional. The legacy `js/game/conversation/response.js` and `js/engine.js` are intentionally untouched.

## Inputs

- Canonical NPC table: `../content/playtest-npcs.js`, with V/D/P and per-Memory-Page Knowledge, Openness, optional Interest (emoji + priority 1–5), optional signed V/D attitude.
- Player token sequence: Topic and Emoji, using the existing parser, adjacency and Count grammar.
- Session: working V/D/P, initial Knowledge comparison and pending +1 flags, and a Player/NPC message history.
- Branch/Contra flags: the content fixture currently stores `null` (unassessed). Do not treat this as proof of no contradiction. A real branch preprocessor is still required.

## One beat

`resolveBeat(session,playerTokens,config)` performs:

1. Extract feature Counts / Relationship adjacency / Player Repeat Key.
2. Evaluate existing Emoji profile events: NPC-directed effects, conditionals, topic Alignment, Mimicry, ASK, and modifiers.
3. Calculate V/D from the same evidence, including Repeat and whole-message Stacking; use final ΔV to update Patience and prioritize interpersonal expressions.
4. Form actual message candidates from known NPC Memory Pages, optional attitudes and interests; a Relationship is rendered as its two known endpoint Topics.
5. Score candidates using Page disclosure, Knowledge, ASK evidence, Warm Up of Player-mentioned Topics, and recency-weighted Cool Down of the precise NPC output combination.
6. Select the highest-scoring candidate. Fully unknown explicit Player Topics have an emoji-only Confused response; exhausted Patience terminates with 💤.
7. Mark, but do not commit, potential +1 Knowledge changes. Record both messages. The persistent layer commits gains on farewell/end. Reaction-only farewell has no NPC response and no invisible Knowledge gains.

No classifying Player strategies; no Answer/Ask/Inform/Redirect/Withdraw action ranking; the candidate's `mode` metadata records whether the selected message communicates information or asks a question, solely for the learning trigger.

### Reaction formula, schematic

`ΔV = saturate(emoji V+) + saturate(emoji V−) + normalized Page-Count-weighted alignment + mimicry − repeat − stackBackfire − contra`

`ΔD = saturate(emoji D+) + saturate(emoji D−) + knowledgeGap + repeat`

`patienceCost = max(0, beatCost − engagement) + socialCost × max(0, −ΔV)`

Each beat uses current V/D. Repeat's decayed pressure is applied to ΔV **once**, before the same ΔV is used by both P and interpersonal Response; stacking has the same property. This prevents flattering spam from escaping repetition cost and avoids counting negative evidence in multiple patience subformulas. Patience never rises from this formula; highly engaging beats can have zero cost. Stacking is counted over the **entire message**, not merely a contiguous Emoji group. Repetition pressure is the sum of geometrically decayed previous instances sharing the existing four-class Player Repeat Key.

### Response formula, schematic

`Score(message) = Base(K, Page O adjusted by working V/D, Interest, Attitude, ASK) + WarmUp(Player Topic overlaps and Page Count) − CoolDown(exact output combination)`

- **Warm Up** applies to all message candidates containing a Player-mentioned Topic; relationship candidates can benefit from their endpoint Topics and Relationship Count.
- **Cool Down** uses recency-weighted exact output signatures. A Topic-only response, Topic+❓, Topic+👎, Emoji-only reaction and silence have distinguishable signatures. Both Player Repeat and NPC Cool Down share the *same exponential recency principle*, but have different keys and consequences.
- **Typed ASK** uses existing 📍/⏳/👥 filters and known relationship endpoints. It cannot fabricate unknown Topics.
- **Gap is not an automatic Emoji.** Removed the gap-derived 💤/💡 response shortcuts, which could misrepresent who was actually learning or bored.
- **Interest** is sparse and boosts its explicit Emoji candidate, not both Topic-only and Topic+Emoji versions of the same Page. An Interest question does not teach Knowledge.
- **Openness** remains Page-specific. Its response contribution uses existing V/D state; it is not a new stored attribute.
- **Interpersonal candidates** (positive/negative Emoji-only and Silence) use final ΔV as their relevance evidence and compete with Topics under exactly the same Base + Warm Up − Cool Down ranking. High D uses 😡, low D uses 😟 for the negative expression; no additional Mood or Action state.

## Learning and unresolved scope

`pendingPlayerGain` can be set to 1 when the NPC actually emits an information-bearing Page and a learning trigger exists (ASK, prior repetition, or adjacent Listen), subject to the at-least-two-level gap. `pendingNpcGain` is a preliminary direction-specific mark for a discussed NPC question-interest Page where Player Knowledge is higher by two levels. Neither side's Knowledge level changes mid-session. The persistent layer in `persistent-sim.js` now commits marked gains at interaction end.

These are *provisional triggers* and do not yet cover every branch-discovery/disclosure nuance or every form of Player-to-NPC teaching. The persistent finalizer caps gains to +1 per Page per session, maintains Relationship endpoint awareness, and never automatically prunes NPC branches. Fully authored branch discovery is still open.

## Test

`tests/board-model.test.mjs` verifies three NPCs, known/unknown Topic eligibility, low-openness information, typed question initiative, both Knowledge directions, repeat recency, cooldown key distinction, line-wide Emoji stacking and deterministic selection.

Use `npm test` in a Node environment to run all repository tests. This model is now imported by `js/app.js` through the persistent layer; the visible Explorer/Chat/Memory layout is reused, with a separate playtest save key and no legacy save migration.

## Calibration priorities

1. **Harun:** asking about low-O Saman should not guarantee immediate revelation; varying Topic and building rapport should let the Player obtain related information later.
2. **Jali:** high Knowledge and O, low P: opportunities to learn compete with limited beats.
3. **Ratih:** a specific typed question should arise from sparse Interest; learning should be directed from Player to NPC when the Knowledge gap and a valid trigger permit it.
4. Check whether any single Emoji sequence dominates across all three NPCs, whether repeated Topics exhaust P too quickly, and whether Warm Up / Cool Down cause meaningful rather than cosmetic changes.

No numerical balance claim is made until larger strategy simulations and UI-level checks are performed.

## Topic Attitude scale correction

Authored NPC Topic Attitude values use signed axes (-1..1), with missing
axes unspecified. The shared Emoji comparator expects 0..10 values before
normalization. The board-model converts the signed values *once at the
input boundary* using `5 + 5 × signedValue`. This fixes previously
inverted Alignment and is tested in
`tests/balance-calibration.test.mjs`. The calculation otherwise
continues to use the same Emoji profile effects.

See `docs/balance-audit.md` for the latest 3 NPC × 3 policy baseline,
parameter sensitivity results, and resettable browser checkpoint.

## Simplification pass — social consequence (2026-11-09)

One numerical output, **final ΔV**, now serves three purposes: update working V,
accelerate P exhaustion when negative, and strengthen already-supported
interpersonal Emoji/Silence candidates. No new state, route, scripted response,
or per-NPC exception was added. The earlier P formula with separate Repeat
Annoyance and Stacking cost is gone. Default beat cost is provisionally 0.95;
Repeat contributes 0.42 to the existing V penalty, and Stacking backfire is
0.27. Social-to-P and social-to-response strengths are provisional 3.2 and 7.5.

The universal NPC response score remains `Base + Warm Up − Cool Down`.
Existing candidate duplication and gap-derived Emoji shortcuts were removed.
After P is exhausted, farewell is inert. See `tests/social-response.test.mjs`
for abuse, aligned spam, Emoji stacking, normal/engaging duration and
topic continuity regression coverage.

**Still provisional:** Knowledge transfer and branch/contra resolution are
separate unfinished work. This pass intentionally does not invent rules for them.
