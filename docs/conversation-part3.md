# Rantau NPC interaction — Part 3: Action, Reaction, Ranking, Composer

Status: **standalone pure prototype**. Verified with local tests; not wired to live Chat, UI or saved state.

## Public interface

`js/game/conversation/response.js`:
- `generateActionCandidates({features,impact,world,npcState,history,config})`
- `generateReactionCandidates({features,impact,world,npcState,config})`
- `rankResponse({actions,reactions,config})`
- `composeNpcMessage(selection,{world,impact})`
- `planNpcResponse({features,impact,world,npcState,history,config})`

`npm test` runs tests from Parts 1–3 (Node 18+). `tests/conversation-part3.test.mjs` includes 243 input/state combinations.

## Current Action rules

Six actions: Answer, Ask, Inform, Express, Redirect, Withdraw. Eligibility is checked **before** score. Answer and Inform require actual known Memory Pages. Typed questions use a registered symmetric Relationship whose endpoint has the required Location, Time, Individual or Group type; neither endpoint nor Relationship knowledge can be missing or blocked.

Interest ❓ can trigger NPC Ask when Player Knowledge exceeds NPC by at least two levels; Interest ❗ favors Topic expression. The latter does not guarantee positive V: the Part 2 Alignment evaluator decides that.

Emoji-only questions ❓/📍/⏳/👥 refer to the **last Topic mentioned** in the immediately preceding NPC message, if one exists. This is a response interpretation, not cross-message Relationship creation; the Part 1 boundary rule remains unchanged.

Patience <= 0 forces terminal Withdraw. Otherwise pending questions have higher *priority tier* than ordinary initiative. Within a tier, the deterministic score combines base Action preference, relevance, Interest, Openness, Patience, Boring and recent NPC Action reuse.

## Reactions and composition

Reactions: Confused, Disagree, Exciting, Boring, Topic Attitude, Player Attitude. They are separate from Actions. Boring from *ordinary NPC Knowledge superiority* should not drown a fresh, answerable question. Boring from actual Player repetition remains recorded.

One eligible Action + at most one compatible Reaction compose a message. Secondary Action is **disabled**; previous illustrative architecture allowed two, but this phase must not advertise a secondary Action that the composer never emits. Part 4 can revisit composition.

Composer generates Topic/Emoji tokens and validates them with the same parser as Player input. Metadata records actual Action, Reaction, reason, target and whether a second Action was composed. A factual Action without sufficient Knowledge throws, rather than fabricating an answer.

## Required world adapter (later integration)

`world` must provide:
- `npcKnowledge` and `playerKnowledge`: visible Memory Page levels, including Relationship IDs
- `pages[id].type` or `types[id]`: category of an information endpoint
- `relationships`: registered `{id,a,b}` pairs
- `npcInterests[id]`: ❓ or ❗
- `topicAttitudes[id]`: NPC V/D attitude toward that page
- `npcPreferredTopics`: initiative and redirect options
- `openness`, optional `blocked` page IDs

This data is read-only. A thin adapter will be required between the current prototype's `data.js` and these records.

## Simulation findings

Early prototype over-selected Boring as the expression for direct questions because NPC Knowledge superiority outranked relevance; adjusted reaction compatibility to keep a fresh answer meaningful. Interest ❓ originally caused NPC to ask a less knowledgeable Player; gated it on Player Knowledge lead >= 2. Reactions no longer create a phantom second Action.

## Important limits and Part 4 handoff

No persistent state writes, Knowledge gains, Knowledge branches, contradiction/lying policy, complete-chat probability calibration, or real app integration. This is a deterministic Action/Reaction planner, **not a complete gameplay-ready NPC chat engine**.

The existing active `js/engine.js` remains unchanged intentionally. Preserve old browser saves, session lifetime, farewell, and other existing UI functions until explicit integration tests are ready.
