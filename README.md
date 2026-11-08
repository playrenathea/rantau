# Rantau

Mobile-first text RPG — prototype MVP 0.1. Pure HTML, CSS, and JavaScript ES Modules; no build tools or external dependencies.

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
- `js/data.js`: **temporary** world, NPC, information, and relationship content
- `js/engine.js`: **placeholder** grammar evaluation and NPC response logic
- `js/state.js`: local browser save and JSON import/export (unchanged v1)
- `js/game/recent-actions.js`: immutable 10-action summary log
- `js/game/location.js`: location generator interface and static fallback
- `js/game/interaction.js`: temporary session and bounded outcome interface
- `js/game/action-flow.js`: one-action/one-location-regeneration coordinator

## Current scope

Explorer with expandable location tree and current location, prototype NPC interactions via token composer, basic response engine, Memory pages, local browser saves, import/export.

This is a prototype, **not** the finished NPC engine. Branching beliefs, accurate affect math, full information progression, all world locations, persistent NPC travel, and account-based premium access are not implemented yet. Information entries and dialogue are placeholder data and should not be treated as canonical lore.

## Save separation

Content is source-controlled in GitHub. Player progress is stored in this browser's `localStorage` under `rantau.save.v1`, with manual JSON export/import. Future account entitlements are intentionally outside the local save model.

## Refactor policy

Keep the current UX and save format stable while iterating. UI rendering belongs in `js/ui/views.js`; input/navigation and side effects belong in `js/app.js`; NPC behavior belongs in `js/engine.js`; save logic belongs in `js/state.js`. The CSS retains some legacy prototype rules and is intentionally left visually unchanged until there are browser-level regression tests.

## Prepared game lifecycle (not yet wired to the UI)

The new `js/game/` modules provide extension points for the agreed rules while leaving today's playable prototype unchanged. A location entry and a finished NPC interaction each count as **one action**; either generates **only the active location** after its action is logged. The action history keeps the last 10 summaries, not message transcripts. During a chat, working values are temporary; the final outcome is computed by an injected model and capped to +/-1 per numeric variable. First impression can allow +/-3 on caller-designated NPC affect variables. No particular conversion formula, spawn weights, knowledge formula, or first-impression detection is chosen yet.

These modules do **not** run on navigation/chat yet. There is deliberately **no save schema migration**; UI, current NPC mechanics, and local saves behave as before. Once the math and data shape are agreed, connect the modules with a versioned save migration and replace the placeholder model in a controlled step. See [game architecture](docs/game-architecture.md).
