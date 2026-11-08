# NPC Conversation — Part 1: Grammar, Repeat, Counts

Status: tested standalone modules; **not connected to live chat**. Preserve the placeholder engine until Part 2–3 integration.

Run from repository root: `npm test` (Node.js 18+).

## Contracts

- Input tokens: `{kind:"info",id}` and `{kind:"emoji",value}`. Empty array is Listen.
- Consecutive Emojis become one Emoji Group; the group retains order, first/last position, left/right Topic, and whether it can address the NPC / previous NPC message.
- Internal relationship: only two directly adjacent Topic tokens (no Emoji between them); resolve only registered symmetric relationship Memory Pages.
- Cross-message relationship: previous NPC message **must end in a Topic**; connect that Topic to the **first Topic mentioned by Player**, even if Player starts with Emoji. A prior NPC message ending with Emoji disables this boundary.
- If both boundary Topic IDs are equal, increment that Topic once more, giving two mentions in total at the boundary (one ordinary Player mention, one continuation).
- Keep a multiset of Memory Page counts and derived proportions, not only a unique set. Unregistered relationship pairs do not create Memory Pages.
- The four mutually distinct repetition keys:
  1. TOPIC_ONLY: unique specific Topic set, no Emoji;
  2. TOPIC_EMOJI: unique specific Topic set, at least one Emoji; ignore Emoji identity and order;
  3. EMOJI_ONLY: all Emoji-only messages share the same key;
  4. LISTEN: all empty messages share one key.
- Ignore NPC messages for repetition; trigger when current Player key equals previous Player key **or** reaches third cumulative occurrence in this conversation.
- Repetition is only detected here, **not applied to V/D/Patience or response rankings**. That is Part 2/3.

## Modules

- `js/game/conversation/parser.js`: `parseMessage(tokens)`
- `js/game/conversation/repetition.js`: `repeatKey(tokens)`, `evaluateRepetition(currentTokens, previousHistory)`
- `js/game/conversation/features.js`: `extractFeatures({playerTokens,previousNpcTokens,playerHistory,relationId})`

`previousNpcTokens` must be the immediately preceding NPC message, not a search backward for a message containing a Topic. `playerHistory` must exclude the current Player message.

## Integration safeguards

- Current `js/engine.js` remains unchanged; current UI is still a prototype and is **not yet compliant** with these new semantics.
- The UI currently prevents duplicate Topic IDs and duplicate Emoji values within one outgoing draft. The parser does not rely on this constraint for correctness.
- No save migration needed for these pure modules; later conversation-session integration must preserve existing `rantau.save.v1` data.
- No V/D/P math, question resolution, Knowledge gain, Action/Reaction ranking, or NPC message generation belongs in Part 1.

## Tests

`tests/conversation-part1.test.mjs` covers repeat equivalence classes, consecutive/cumulative cases, Emoji Group positions, adjacency and strict boundary behavior, multiset totals/proportions, Listen/Emoji-only, and multi-turn examples.

Any edits to Part 2–4 must keep these tests green.
