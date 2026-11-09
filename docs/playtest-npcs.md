# RANTAU — Three-NPC conversation content fixture

This fixture is intentionally **not connected to the currently playable UI**. The existing `js/data.js`, `js/engine.js`, views, save format and runtime behavior remain unchanged. The current world data is prototype placeholder content; this fixture describes the newer 1990s Rantau direction.

## Source

`js/game/content/playtest-npcs.js` exports:

- `pages`: canonical shared Memory Page catalog. Each relationship has `a`/`b` IDs pointing to basic pages.
- `npcs`: Harun, Jali, Ratih. Each has `initial: {v,d,p}` and a `memory` map of `pageId: {knowledge, openness, interest?, attitude?}`.
- `playerStart`: initial player Knowledge; missing pages mean level 0.
- `createInteractionMemory(npcId, playerLevels)`: fresh per-interaction comparison snapshot with pending +1 marks for either direction.
- `validate()`: integrity checks suitable for CI and content editing.

Interest is sparse and weighted with provisional priority 1–5; its emoji may be ❓, ❗, 📍, ⏳, or 👥. Attitude is optional; absent axes are **unspecified, not zero or neutral**. The numeric values are playtest fixtures, not finalized scoring formulas.

## Content goals

- **Harun (terminal):** histories of Saman, the migrant group, Wira returning home and Narto finding work in the market. The sensitive Saman pages have low Openness.
- **Jali (terminal):** city locations, networks, Ratih and Dimas, and an outstanding message for Ratih. High Openness with low Patience.
- **Ratih (Pasar Induk):** knows Dimas and the family relationship well, but little about his route to the industrial area. Information can flow in both directions.

The content deliberately has no scripted dialog, new action type, extra NPC psychology, or gameplay-specific reward override. NPC preference should eventually arise from existing weighted rules.

## Knowledge and pending gains

Every Relationship known at Knowledge >=1 requires both endpoint Pages to be known at Knowledge >=1. Relationship level **does not need to be <= either endpoint level**. A relationship can be well understood without comprehensive knowledge of both objects.

`createInteractionMemory` is a session-local snapshot; it does not mutate NPC/player Knowledge. `pendingPlayerGain` and `pendingNpcGain` start at 0 and can be marked independently for later bounded (+1 per page and actor) commit. `contra` and `unexploredBranch` start as **null = not evaluated**, not false. There are no fabricated contradictions in this fixture. A future branch-aware preprocessor should mark those once at session start based on real branch IDs/propositions. Branches cannot be pruned automatically for NPCs; leave NPC conflicting branches unresolved as agreed.

The existing `js/game/knowledge.js` contains branch/prune support intended for player-side knowledge. Do not reuse its pruning behavior on NPCs without explicit design approval.

## Integration boundary

Before UI activation: map canonical Page IDs into the future Memory UI, update initial player/world state with a versioned save migration, and connect the finalized response/learning engine. **None of these steps has been performed.**

Run `npm test` to include the content validation tests.
