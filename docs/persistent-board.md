# Persistent multi-interaction playtest

The persistent simulator is now used by the browser MVP through `js/app.js` and
`js/playtest-state.js`. It is still separate from legacy `rantau.save.v1` and
legacy `js/engine.js`; browser playtest saves use `rantau.playtest.v1`.

The Player persists **Knowledge and location**. Each NPC persists its own **V/D relationship
toward the Player** and **Knowledge per Memory Page**. Patience resets from the NPC fixture
at the beginning of each encounter. Each active conversation has working V/D/P, a message
history, a per-Page Knowledge comparison, and pending +1 learning marks.

### Three independent balancing controls

1. **Calculation:** `js/game/conversation/board-model.js`. Simplify or correct
   only if a general rule or invariance is wrong.
2. **Global parameters:** `MODEL_CONFIG` in that file. Tune universal weights
   consistently across NPCs.
3. **NPC / Player content:** `js/game/content/playtest-npcs.js`.
   Change V/D/P, per-Page Knowledge/Openness, sparse Interest/Attitude, and
   starting Player Knowledge without changing the math.

### Running the sandbox

```bash
node simulations/persistent-board.mjs reset
node simulations/persistent-board.mjs status
node simulations/persistent-board.mjs begin harun
node simulations/persistent-board.mjs beat info:saman emoji:❓
node simulations/persistent-board.mjs beat info:perantau emoji:👍
node simulations/persistent-board.mjs beat info:saman emoji:❓
node simulations/persistent-board.mjs end
node simulations/persistent-board.mjs begin jali
node simulations/persistent-board.mjs beat
node simulations/persistent-board.mjs end
node simulations/persistent-board.mjs status
node simulations/persistent-board.mjs reset
```

The sandbox persists to `simulations/.persistent-world.json`, which is **gitignored**.
`--file PATH` lets different experiments keep independent saves. `reset` replaces
the entire world with the original newcomer fixture, including all Knowledge and NPC
relationships; `reset --preset informed` seeds an explicitly artificial midgame
Player Knowledge state to test NPC learning with Ratih. Do not confuse the informed
preset with the narrative starting state.

`demo` plays a short scripted Harun/Jali sequence on the currently persisted world,
then includes Ratih only if Pasar Induk is known; otherwise it does not invent access
to that location. It commits each encounter before starting the next.

`move pasar_induk` changes the Player location for scenario tests only, and requires
Knowledge Level >=1. It does **not** simulate final navigation, travel cost, or
world access.

### Commit semantics

- Within a chat, only working V/D/P, histories, and pending Page marks change.
- At `end`, permanent V/D changes are limited to ±3 on a first impression and
  ±1 on later encounters.
- Player or NPC Knowledge gains are committed at most +1 per Page per interaction
  if the initial Knowledge gap is at least two. Related base Pages are discovered
  at Level 1 when a new Relationship becomes known; this maintains the shared
  Knowledge invariant without granting extra relationship levels.
- NPC Knowledge is **not pruned** or resolved if conflicting. The actual
  contradiction/branch preprocessor and branch-dependent commit are still TBD.
- The response model's player-to-NPC teaching trigger is still preliminary.
  The persistent layer does not claim to solve it.
- The saved world includes current session state and history (can be restored
  mid-conversation) plus completed reports. Reset deletes the sandbox data by
  replacing it with a clean world.

### Tests

`tests/persistent-sim.test.mjs` covers commit, resume, reset, location,
first impression, per-Page caps, NPC learning, Relationship closure, and
reaction-only farewell. `tests/playtest-ui.test.mjs` checks the browser
checkpoint's UI state projection and JSON round trip. The existing
Explorer/Chat/Memory presentation is preserved, and no legacy save migration
is performed. Run `npm test` in Node.

## Reproducible multi-session balance comparison

Run `node simulations/persistent-comparison.mjs` for the 3 NPCs × 3 Player
policies (repeating a single input, repeated Listen, and a scenario-adaptive
rotation), **four encounters with up to six beats each**. Each policy starts
from the same independent **browser MVP test checkpoint**, never from another policy's
modified world. The policy is a scripted test input, not a new game action.

It prints JSON with session counts, total beats, V/D after repeated
encounters, Player/NPC Page gains, Patience exhaustion count, and the first
encounter transcript. Use it to spot where a rule or parameter has unusual
effects. It is a diagnostic comparison, **not** a proof of general balance.

Current baseline after the unified V/Patience/interpersonal Response simplification
(4 sessions × up to 6 beats; Page gains include basic awareness):

| NPC | Policy | Player Pages improved | NPC Pages improved | Final V | Final D |
| --- | --- | ---: | ---: | ---: | ---: |
| Harun | Spam | 0 | 0 | 0 | 8.035 |
| Harun | Listen | 1 | 0 | 0 | 8.035 |
| Harun | Adaptive | 5 | 0 | 7.485 | 6.507 |
| Jali | Spam | 1 | 0 | 1.454 | 9.153 |
| Jali | Listen | 3 | 0 | 1.454 | 9.153 |
| Jali | Adaptive | 4 | 0 | 5.156 | 8.517 |
| Ratih | Spam | 0 | 1 | 0 | 4.093 |
| Ratih | Listen | 0 | 0 | 0 | 4.153 |
| Ratih | Adaptive | 4 | 1 | 5.609 | 3.347 |

These are deterministic examples, not general balance proofs. The normal conversation
target is approximate (~7 beats); Jali remains naturally short with starting P=4.
Extreme abuse can end in 1–3 beats, while strong rapport can extend sessions.
The browser/UI save schema and NPC content fixture remain unchanged.

See `docs/balance-audit.md` for the pre-change historical table and the updated
social stress results. Browser Reset restores the test checkpoint; the standalone
CLI's plain `reset` represents the story's newcomer fixture, while
`reset --preset informed` uses the browser checkpoint.

The test is repeatable; changing `MODEL_CONFIG` versus a particular
NPC's Memory Page data produces different effects with the same scripts.
