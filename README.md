# Rantau

Mobile-first text RPG — three-NPC conversation playtest MVP. Pure HTML, CSS, and JavaScript ES Modules; no build tools or external dependencies.

## Run

The code uses ES Modules. Serve the folder via HTTP, not by double-clicking `index.html` as a `file://` page. For example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. For phone testing, use the GitHub Pages site at `https://playrenathea.github.io/rantau/` when published.

## Files

- `index.html`: application entry point
- `css/style.css`: UI styling
- `js/app.js`: application controller, navigation, event handling, modal actions and session flow
- `js/ui/views.js`: pure HTML renderers for Explorer, Chat and Memory (receives current UI state)
- `js/playtest-data.js`: translates canonical Rantau Memory Pages into the existing Explorer/Chat/Memory UI
- `js/game/content/playtest-npcs.js`: canonical Harun/Jali/Ratih NPC and Knowledge data, plus the playtest checkpoint
- `js/game/conversation/board-model.js`: active playtest Reaction/Response model
- `js/game/conversation/persistent-sim.js`: per-NPC V/D/Knowledge and Player Knowledge persistence
- `js/playtest-state.js`: browser playtest JSON import/export/reset, separate from legacy saves
- `js/data.js`, `js/engine.js`, `js/state.js`: preserved **legacy prototype** code (not active in the playtest UI)
- `js/game/recent-actions.js`: immutable 10-action summary log
- `js/game/location.js`: location generator interface and static fallback
- `js/game/interaction.js`: temporary session and bounded outcome interface
- `js/game/action-flow.js`: one-action/one-location-regeneration coordinator
- `js/game/knowledge.js`: Memory Page branch choices, pruning and regression
- `js/game/learning.js`: Knowledge eligibility, Listen adjacency and +1 cap
- `js/game/questions.js`: Where/When/Who filtering on ordinary information relationships

## Current scope

Explorer/Chat/Memory keep their existing layout. The browser entrypoint now uses the three Rantau playtest NPCs, the board-model reaction/response resolver, per-interaction Knowledge marking and commit, and a repeatable Terminal test checkpoint. The dot-menu has Export JSON, Import, and **Reset ke Save Point**.

This is a prototype, **not** the finished NPC engine. Branching beliefs, accurate affect math, full information progression, all world locations, persistent NPC travel, and account-based premium access are not implemented yet. Information entries and dialogue are placeholder data and should not be treated as canonical lore.

## Save separation

Content is source-controlled in GitHub. Browser playtest progress is stored separately under `rantau.playtest.v1` with manual JSON export/import (`schemaVersion: 2`). The old `rantau.save.v1` key is not overwritten or migrated. Reset in the Explorer dot-menu restores the **test checkpoint**, not the story's canonical first minute. The test checkpoint includes Terminal, access to Pasar Induk, and Knowledge of Dimas/Kawasan Industri so all three NPCs can be tested immediately.

## Refactor policy

Keep the existing layout and CSS stable while iterating. UI rendering belongs in `js/ui/views.js`; input/navigation and side effects belong in `js/app.js`; playtest NPC behavior belongs in `js/game/conversation/board-model.js`; the new save bridge belongs in `js/playtest-state.js`. Legacy files and saves are retained for reference.

## NPC playtest: starting and resetting

Open [Rantau Playtest](https://playrenathea.github.io/rantau/) after GitHub Pages has published the commit. The default checkpoint begins at Terminal with Harun and Jali; Pasar Induk is already discovered so Ratih can be reached via Map. All three use one Reaction/Response model and a common Memory Page catalogue. The browser commits Knowledge/V/D when the conversation ends.

Open the **⋯** menu in Explorer to Export JSON, Import a playtest save, or **Reset ke Save Point**. Existing v1 save files are intentionally not imported into this v2 playtest. For repeatable scripted comparisons run `node simulations/persistent-comparison.mjs`. See `docs/balance-audit.md`.

## Legacy architecture notes

The following description documents the older isolated modules; the browser MVP is now wired to the new three-NPC model.

## Prepared game lifecycle (not yet wired to the UI)

The new `js/game/` modules provide extension points for the agreed rules while leaving today's playable prototype unchanged. A location entry and a finished NPC interaction each count as **one action**; either generates **only the active location** after its action is logged. The action history keeps the last 10 summaries, not message transcripts. During a chat, working values are temporary; the final outcome is computed by an injected model and capped to +/-1 per numeric variable. First impression can allow +/-3 on caller-designated NPC affect variables. No particular conversion formula, spawn weights, knowledge formula, or first-impression detection is chosen yet.

These modules do **not** run on navigation/chat yet. There is deliberately **no save schema migration**; UI, current NPC mechanics, and local saves behave as before. Once the math and data shape are agreed, connect the modules with a versioned save migration and replace the placeholder model in a controlled step. See [game architecture](docs/game-architecture.md).
