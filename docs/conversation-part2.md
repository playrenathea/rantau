# Rantau NPC interaction — Part 2: Impact, Alignment & Knowledge

Status: standalone experimental evaluation modules. They are **not wired into the live chat**, and none of the numeric baseline weights are final balance decisions. Existing save and UI remain untouched.

## Core files

- `emoji-profiles.js`: 24 Player Emoji (21 established + 📍 ⏳ 👥), data-driven Topic/NPC effects, ASK, special modifiers.
- `alignment.js`: V/D vector comparison. Unspecified axes are ignored, **not neutral**.
- `knowledge-eval.js`: NPC Awareness, Contra, relative Knowledge, and NPC Interests ❓ / ❗.
- `emoji-eval.js`: sequenced targets, conditional ASK, Mimicry, special signals, Openness inversion, learning triggers.
- `impact.js`: pure grouped accumulation, saturation, optional overuse, temporary V/D/P state and trace.
- `tests/conversation-part2.test.mjs`: automated regression tests.

Run: `npm test`.

## Math, default baselines, and interpretation

Per evidence: `{family,groupId,target,axis,value,reason}`.

For Emoji groups, positive and negative contributions on each axis are independently soft-capped using `c*tanh(x/c)`, then combined. An optional overuse cost applies when many different Emoji express the same signed V or D against the same target. Default overuse cost = 0; reversal is opt-in for experimentation.

For Repeat, use the finalized Part 1 four-key detector. Repeated Player messages contribute progressively to V-, D+, P- and the Boring reaction. **Both Emoji-only and Listen can repeat.**

A Topic-attitude match must not be defeated by an incidental NPC-directed reading of the same end-of-message Emoji. Baseline therefore gives NPC-directed effects weight 0.35 of their Emoji-only strength when Topic is present. This is a test parameter, not a universal semantic rule.

Knowledge evaluation uses Player minus NPC level. For awareness=0, Confused is independent of the general gap classification. Contra and NPC Interest can coexist with Knowledge gaps. Interest ❗ only grants a positive discussion signal when the Player attitude is actually aligned (>0.5 similarity).

All impact is resolved from a single working-state snapshot and clamped 0–10. The module never writes permanent NPC state.

## Simulation observations

With baseline settings:
- Matching Militer (NPC Topic V=1,D=9) via `Militer 👎`: ΔV ≈ +0.073.
- Opposing the same NPC Topic attitude via `Militer ❤️`: ΔV ≈ -0.073.
- Player Knowledge 5 vs NPC 2: ΔD = -0.150 (Exciting). With NPC Interest ❓, ΔD = -0.300 (two independent sources for **one** eventual reaction candidate).
- Five aligned positive Emoji in a group: ΔV ≈ +0.623, instead of unrestricted linear stacking.
- Six consecutive `🙂` Emoji-only messages lead to decreasing V and rapidly declining Patience after the repeat threshold.

These demonstrate directional behavior, **not validated game balance**.

## Deferred to Part 3

The module emits ASK, Openness, learning and reaction signals, but does not select an Action or NPC message. Actual Learning requires the NPC's emitted information, question/listen context, Knowledge branch rules and per-interaction caps. Mimicry requires prior NPC Emoji target metadata from the Action/Reaction Composer. The current standalone evaluator accepts this metadata explicitly.

No single generic formula should replace distinct game semantics: Knowledge gating, Repeat triggers and V/D comparison remain different operations.

## Existing app safety

Do not activate these modules in `js/engine.js` until Action/Reaction ranking (Part 3) is tested. No modifications to `js/state.js`, `js/app.js` or `rantau.save.v1` are required for this phase. The old prototype chat is unchanged.
