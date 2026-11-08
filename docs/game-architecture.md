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

## Knowledge and question scaffolding (not wired)

- `knowledge.js`: pure Memory Page branch operations. Example page: `{branches:[{id:"A",level:4}],pruned:[]}`. `visibleLevel(page)` is the maximum retained branch level, not a separately saved number. A page with 2+ live branches cannot advance. `selectBranch` prunes the others and calculates regression **only when the player chooses**; a discovery does not regress knowledge. Pruned branches never return as new options. A later encounter with a pruned branch is classified as contradiction.
- `learning.js`: Knowledge NPC and player are compared via their **highest visible levels**, with NPC needing a lead of at least 2. Learning needs at least one trigger: earlier relevant question, repeated topic, or an adjacent Listen. Listen applies only to the immediately preceding and following **NPC message**, not the whole chat. Each Memory Page may gain at most +1 per interaction; **no first-impression exception for Knowledge**.
- `questions.js`: `Where` -> Location, `When` -> Time, `Who` -> Individual, searching symmetric pairs in ordinary relationships; the operator doesn't invent knowledge or automatically grant a correct answer.

### Agreed semantics and visual distinction

- **Blue**: no contradiction; qualifying information can advance the current branch if the Memory Page is not branched.
- **Orange**: contradictory information; on qualifying exposure, a truly new, unpruned alternative can be discovered. Finding it does not immediately lower Knowledge, and the player resolves it later inside the Memory Page. While unresolved, all branches remain valid as player understandings and the visible level is their maximum; ordinary advancement is blocked.
- On resolution, every discarded branch and knowledge dependent on it is removed. Regression is based on the retained branch's level and can be zero.
- The Knowledge gate (NPC level - player visible level >= 2) also applies to branch discovery. Question/repetition/adjacent Listen triggers apply to both.
- Question operators and the Individual information type are contracts only. The sample world data does not yet model NPCs as `Individual` information entries.

### Still open rather than guessed

- The representation of facts/dependencies inside a branch and how their pruning propagates.
- How exact prior questions/repetitions are detected and scoped in chat.
- Whether additional unresolved branches can be discovered while a page is already branched.
- How a particular NPC response is classified as contradictory, aligned, false, or unknown, and how source knowledge supports that.
- Actual conversion from temporary conversational state into permanent Knowledge outcomes.
- Data migration and UI integration. The current prototype's chat and knowledge displays continue unchanged.

Next design focus: **natural, intuitive core Chat experience**: turn-taking, response patterns, affordances for asking/repeating/listening, feedback on learning, NPC conversational initiative, and how the composer/picker behaves. Prototype and compare sample exchanges before locking any additional math.
