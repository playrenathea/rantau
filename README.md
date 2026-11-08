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
- `js/state.js`: local browser save and JSON import/export

## Current scope

Explorer with expandable location tree and current location, prototype NPC interactions via token composer, basic response engine, Memory pages, local browser saves, import/export.

This is a prototype, **not** the finished NPC engine. Branching beliefs, accurate affect math, full information progression, all world locations, persistent NPC travel, and account-based premium access are not implemented yet. Information entries and dialogue are placeholder data and should not be treated as canonical lore.

## Save separation

Content is source-controlled in GitHub. Player progress is stored in this browser's `localStorage` under `rantau.save.v1`, with manual JSON export/import. Future account entitlements are intentionally outside the local save model.

## Refactor policy

Keep the current UX and save format stable while iterating. UI rendering belongs in `js/ui/views.js`; input/navigation and side effects belong in `js/app.js`; NPC behavior belongs in `js/engine.js`; save logic belongs in `js/state.js`. The CSS retains some legacy prototype rules and is intentionally left visually unchanged until there are browser-level regression tests.
