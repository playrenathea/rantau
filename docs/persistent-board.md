# Persistent multi-interaction playtest

This experimental sandbox is independent of `js/app.js`, the current browser UI,
`rantau.save.v1`, and the original `js/engine.js`.

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
first impression, per-Page caps, NPC learning, and Relationship closure.
Run `npm test` in Node. No production UI/UX or game-save migration.

## Reproducible multi-session balance comparison

Run `node simulations/persistent-comparison.mjs` for the 3 NPCs × 3 Player
policies (repeating a single input, repeated Listen, and a scenario-adaptive
rotation), **four encounters with up to six beats each**. Each policy starts
from an independent *informed midgame* fixture, never from another policy's
modified world. The policy is a scripted test input, not a new game action.

It prints JSON with session counts, total beats, V/D after repeated
encounters, Player/NPC Page gains, Patience exhaustion count, and the first
encounter transcript. Use it to spot where a rule or parameter has unusual
effects. It is a diagnostic comparison, **not** a proof of general balance.

Observed baseline (4 sessions × up to 6 beats, after the persistence layer
was implemented; counts include basic Page discovery from Relationships):

| NPC | Policy | Player Pages improved | NPC Pages improved | Final V | Final D |
| --- | --- | ---: | ---: | ---: | ---: |
| Harun | Spam | 3 | 0 | 0 | 10 |
| Harun | Listen | 4 | 0 | 0 | 10 |
| Harun | Adaptive | 3 | 0 | 2.812 | 7.347 |
| Jali | Spam | 1 | 0 | 1.426 | 10 |
| Jali | Listen | 2 | 0 | 1.833 | 10 |
| Jali | Adaptive | 4 | 0 | 5.676 | 9.05 |
| Ratih | Spam | 0 | 1 | 0 | 6.888 |
| Ratih | Listen | 0 | 0 | 0 | 7.018 |
| Ratih | Adaptive | 2 | 1 | 5.306 | 3.947 |

The test is repeatable; changing `MODEL_CONFIG` versus a particular
NPC's Memory Page data produces different effects with the same scripts.
