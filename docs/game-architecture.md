# Rantau game lifecycle — preparatory contracts

Status: **scaffold only**. Nothing here is wired into the currently playable UI. Existing `js/engine.js` remains the temporary NPC math, and `rantau.save.v1` is unchanged.

## Data flow

```
User enters location
  -> one enter_location action
  -> record in recentActions (last 10)
  -> generate only destination LocationInstance

User talks to NPC
  -> temporary InteractionSession (working state, messages)
  -> player/NPC exchange; no permanent commits yet
  -> conversation ends
  -> injected outcome model -> bounded changes (first-impression exception)
  -> [future integration: apply to long-term state]
  -> one interact_npc action, containing outcome summary
  -> record in recentActions (last 10)
  -> generate current LocationInstance, not all locations
  -> discard InteractionSession details
```

## File roles

- `recent-actions.js`: `recordAction(last10, action) -> nextLast10`. Action types: `enter_location`, `interact_npc`. A completed conversation is **one** action regardless of its message count. No transcript retention.
- `location.js`: `generateLocationInstance({locationId,longTermState,recentActions,generator})`. Generator receives only the selected location and context. Returns `{locationId,locationIds,npcIds,eventIds}`. The current default generator is a deterministic static fallback, **not** the final spawn model.
- `interaction.js`: `beginInteraction` returns temporary working state, and `finishInteraction(session,{calculateChanges,affectKeys})` calls an external mathematical model and bounds requested deltas. It returns only a summary, not transcript. Numeric deltas are keyed by groups, e.g. `{npc:{v:0.8,d:-2},knowledge:{pasar:1}}`.
- `action-flow.js`: `completeAction({longTermState,recentActions,action,generator})` appends exactly one action and regenerates exactly one location. Its `longTermState` input is **already committed**; the eventual integration layer performs the permanent commit before invoking it.

## Invariants already agreed

1. Only the entered/active location is generated, never the whole world.
2. Entering a location is one action.
3. Completing an NPC interaction is one action, *including* refreshing the same location.
4. Latest completed action is included before location generation.
5. Last 10 actions are short summaries; the 11th drops the oldest.
6. Chat working values may vary freely; conversion to permanent state is capped **per variable** at +/-1.
7. First impression may allow affect changes up to +/-3, but only for designated NPC affect variables. Other variables stay capped at +/-1.
8. Temporary transcript is discarded after the interaction; long-term facts/relationships live elsewhere.

## Intentionally undecided

- Working-to-permanent conversion formula, fractional/rounding rules, and other modeling.
- Exact list of NPC/player/world variables and how nested knowledge/beliefs change.
- First-impression detection and whether more actor dimensions will be relevant.
- NPC spawn probabilities, eligibility, exclusions, and consistency rules.
- Whether a current active session should be recoverable after reload.
- Save schema v2/migration and whether a LocationInstance is saved or rebuilt.

## Integration checklist (later)

1. Define the long-term state and change-application contract.
2. Integrate temporary interaction state with the chat controller.
3. Define `calculateChanges` and first-impression identification.
4. Connect action completion to the location generator and UI renderer.
5. Migrate existing saves safely; never silently reset old progress.
6. Test location entry, farewell, empty Listen, first impression, 10-action eviction, and save/import/export.
