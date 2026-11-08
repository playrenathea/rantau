# Rantau

Mobile-first text RPG — prototype MVP 0.1. Pure HTML, CSS, and JavaScript ES Modules; no build tools or external dependencies.

## Run

The code uses ES Modules. Serve the folder via HTTP, not by double-clicking `index.html` as a `file://` page. For example:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. For phone testing, use a static HTTPS deployment such as GitHub Pages (not yet enabled).

## Files

- `index.html`: application entry point
- `css/style.css`: UI styling
- `js/app.js`: page rendering, navigation, token composer
- `js/data.js`: **temporary** world, NPC, information, and relationship content
- `js/engine.js`: **placeholder** grammar evaluation and NPC response logic
- `js/state.js`: local browser save and JSON import/export

## Current scope

Explorer with expandable location tree and current location, prototype NPC interactions via token composer, basic response engine, Memory pages, local browser saves, import/export.

This is a prototype, **not** the finished NPC engine. Branching beliefs, accurate affect math, full information progression, all world locations, persistent NPC travel, and account-based premium access are not implemented yet. Information entries and dialogue are placeholder data and should not be treated as canonical lore.

## Save separation

Content is source-controlled in GitHub. Player progress is stored in this browser's `localStorage` under `rantau.save.v1`, with manual JSON export/import. Future account entitlements are intentionally outside the local save model.
