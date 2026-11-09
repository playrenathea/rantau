# Rantau NPC MVP — Balancing audit (2026-11-09)

**Purpose:** complete the three checks before playtesting through the browser
(1) calculation correctness/simplicity, (2) global numeric parameters, and
(3) Player/NPC numeric data. This is a **baseline**, not a final balance claim.

## 1. Calculation audit

- **Fixed a real scale mismatch.** Per-Page authored Topic Attitude is a
  signed direction in [-1, 1], with omitted axes unspecified. The shared
  Emoji evaluator normalizes Topic Attitude from [0, 10]. The board-model
  now converts at the data boundary (signed -> 5+5*value), so 👍 matching
  Harun's positive attitude to Perantau actually improves Alignment.
  Previously it could look misaligned even when the directions matched.
- Alignment contributions are now weighted by existing Memory Page Counts
  and normalized once, not separately boosted for every matching token.
- An NPC being more knowledgeable than the Player does not, by itself,
  produce the negative Dominance/Boring effect when the Player is asking,
  the Page has Interest, or the expressed attitude aligns. No additional
  mental state or intent classifier was created.
- **Farewell:** reuses the same Reaction calculation but skips Response,
  Cool Down, and learning, so clicking the existing farewell Emoji cannot
  award invisible Knowledge from an NPC output the player never saw.
- The algorithm still uses one universal Player grammar, one Page table,
  one V/D/P update, and one candidate-ranking equation:
  `score = base + warmUp - coolDown`.
- Repeat remains recency-weighted rather than fixed consecutive/third-turn
  thresholds. Emoji stacking is based on the whole message.

Open caveats: the NPC-to-Player and Player-to-NPC Knowledge eligibility
logic is not a full branch/consequence engine. Contradiction/branch tags
are currently unassessed, NPC pruning remains disabled, and the typed
ASK/knowledge-transfer rules are provisional. This audit does not resolve
those open design decisions.

## 2. Global parameters: earlier sensitivity check (historical)

Nine deterministic scenarios were run for **Harun, Jali, and Ratih**:
each with Spam, Listen, and Adaptive scripted Player policies,
four encounters each, up to six beats per encounter, using the **same
canonical browser test checkpoint** for initial Player Knowledge.
Each policy starts from a fresh independent world.

Parameter sweeps examined:
- Alignment scale: 0.20, **0.28**, 0.40, 0.55
- Cool Down strength: 1.2, 1.5, **1.8**, 2.2, 2.6
- Interest strength: 0.22, 0.28, **0.32**, 0.40, 0.50
- Repeat Patience cost: 0.25, **0.42**, 0.60, 0.85

Bold values were the earlier baseline, **not current social-consequence tuning**.
After correcting the Alignment scale bug, increasing Alignment further
increased reputation gains for matching strategies but risked making
rapport too easy. The current value 0.28 allows substantial differentiation
without the stronger boost seen at 0.55. The current Cool Down 1.8
maintains Ratih's Topic continuity while varying her response format.
Interest 0.32 avoids permanently locking Harun to Perantau; higher
weights suppressed useful Saman-related responses.

### Historical baseline before social-consequence simplification

| NPC | Player policy | Player Pages improved | NPC Pages improved | Final V | Final D | Sessions with P exhausted |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Harun | Spam | 3 | 0 | 0.000 | 10.000 | 0 |
| Harun | Listen | 4 | 0 | 0.000 | 10.000 | 0 |
| Harun | Adaptive | 3 | 0 | 7.969 | 6.507 | 0 |
| Jali | Spam | 1 | 0 | 1.426 | 10.000 | 4 |
| Jali | Listen | 4 | 0 | 1.833 | 10.000 | 4 |
| Jali | Adaptive | 6 | 0 | 5.676 | 8.570 | 0 |
| Ratih | Spam | 0 | 1 | 0.000 | 6.888 | 0 |
| Ratih | Listen | 0 | 0 | 0.000 | 7.018 | 0 |
| Ratih | Adaptive | 4 | 1 | 7.546 | 3.347 | 0 |

A Page improved may include automatically discovered basic awareness
(K1) after learning a Relationship; therefore these numbers count Pages
that advanced or were discovered, **not total Knowledge levels gained**.

Interpretation:
- Harun's repeated Listen can harvest more Pages but destroys reputation;
  adaptive play instead leaves a strong relationship. This is a *trade-off*,
  not an error the engine must automatically eliminate.
- Jali rewards good use of scarce Patience.
- Ratih rewards Player-to-NPC teaching and keeps information flowing
  in the opposite direction.
- There is **no global policy winner on every objective**, but the three
  scripts are too small to establish comprehensive balance.

## 3. NPC and Player fixture audit

No arbitrary numerical NPC retuning was necessary after repairing the
general formula. A particular NPC table should **not** compensate for
a model bug.

| NPC | Initial V/D/P | Focus | Sparse interest priorities |
| --- | --- | --- | --- |
| Harun | 3 / 6 / 8 | Closed Saman pages, open perantau histories | Perantau ❗ 5; Wira–Pulang ❗ 2 |
| Jali | 6 / 8 / 4 | Open city contacts, scarce time | Pesan Ratih ❗ 5; Pelabuhan ❗ 4 |
| Ratih | 4 / 3 / 7 | Family knowledge, missing Dimas location | Dimas–Industri 📍 5; Pesan Jali ❓ 3 |

- All authored Relationship Pages have both Page endpoints at Knowledge
  Level >=1 for the same NPC.
- Interest and Topic Attitude are optional, never interpreted as neutral
  when absent.
- Each NPC has only two authored Interests; no action-specific behavior.
- The story's true novice Player Knowledge remains in `playerStart`.
- The **MVP reset checkpoint** lives in `testCheckpointKnowledge` and
  additionally seeds Pasar Induk K1, Kawasan Industri K3, Dimas K3,
  and Dimas–Kawasan Industri K3. This is explicitly a testing shortcut
  that enables reaching Ratih and testing bidirectional transfer.

## Browser integration / reset

The existing Explorer/Chat/Memory layout, CSS and dot-menu are reused.
The entrypoint now imports `js/playtest-data.js` and
`js/playtest-state.js` for the new model. The dot-menu retains Export
JSON and Import and has **Reset ke Save Point**. It restores the same
checkpoint, NPC tables and clean interaction history with no new hidden
state. JSON saves use `rantau.playtest.v1` localStorage and schema v2;
the legacy `rantau.save.v1` key is untouched.

Test files: `tests/board-model.test.mjs`,
`tests/balance-calibration.test.mjs`,
`tests/persistent-sim.test.mjs`,
`tests/persistent-comparison.test.mjs` and
`tests/playtest-ui.test.mjs`.

Browser-level visual/interaction automation and complete Node suite
are **not yet verified**. Direct module/test-harness checks and model
simulations passed at the time of this audit.

## 4. Latest social-consequence simplification — supersedes the historical baseline

**Model change:** final ΔV (including whole-message Stacking and exponentially
decayed Repeat) now drives working V, the extra Patience cost from a negative
reaction, and the relative priority of interpersonal Emoji/Silence candidates.
No additional emotional state, type of NPC action, or NPC-specific exception.
A single `score = Base + Warm Up − Cool Down` still chooses the output.
Duplicate full Interest bonus on Topic-only candidates and gap-derived 💡/💤
automatic reactions were removed. Farewell has no reaction after P has reached 0.

**Provisional baseline values:** beatCost 0.95, repeatCost contribution 0.42,
stackBackfire 0.27, socialCost 3.2, socialResponse 7.5. No NPC numbers were
changed. The earlier sensitivity sweep does not validate these new numbers;
they are an explicitly provisional playtest checkpoint.

### Latest 4-session comparison, 6-beat cap per session

| NPC | Policy | Player Pages improved | NPC Pages improved | Final V | Final D | Sessions with P exhausted |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Harun | Spam | 0 | 0 | 0.000 | 8.035 | 4 |
| Harun | Listen | 1 | 0 | 0.000 | 8.035 | 4 |
| Harun | Adaptive | 5 | 0 | 7.485 | 6.507 | 0 |
| Jali | Spam | 1 | 0 | 1.454 | 9.153 | 4 |
| Jali | Listen | 3 | 0 | 1.454 | 9.153 | 4 |
| Jali | Adaptive | 4 | 0 | 5.156 | 8.517 | 4 |
| Ratih | Spam | 0 | 1 | 0.000 | 4.093 | 4 |
| Ratih | Listen | 0 | 0 | 0.000 | 4.153 | 4 |
| Ratih | Adaptive | 4 | 1 | 5.609 | 3.347 | 0 |

The comparison policy `adaptive` is a fixed test script; it is not a proof of
optimality. Jali naturally finishes earlier with initial P=4, so a six-beat
comparison marks even its adaptive sessions as exhausted.

### Longer uninterrupted representative sessions

| NPC | Abusive insult | Emoji stacking (6) | Neutral rotating Topics | Relevant/engaging rotation |
| --- | ---: | ---: | ---: | ---: |
| Harun | 3 beats | 1 beat | 8 beats | Longer than neutral |
| Jali | 2 beats | 1 beat | About 4 beats | About 6 beats |
| Ratih | 3 beats | 1 beat | About 7 beats | Longer than neutral |

These are deterministic probes, not strict conversation-length rules. In
particular Jali is intentionally impatient. The social-response regression
checks cover personal reaction, early exit, repeated aligned flattery,
stacking and viable ASK. Unfinished Knowledge branch/contra mechanics are
intentionally unchanged.
