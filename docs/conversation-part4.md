# Rantau — Part 4: Full Dialogue, Strategy & Abuse Tests

Status: **simulation phase complete; balance remains provisional**. Standalone modules only; live Chat, existing saves, UI, and js/engine.js remain unchanged.

## Reproduction

- npm test: Parts 1–4 regression tests. Local suite passed **185/185** at handoff.
- node simulations/conversation-part4-report.mjs: 3 NPC configurations × 14 fixed strategies = **42 deterministic dialogues**, up to 10 Player turns each, plus one-turn stacking sensitivity.
- simulations/part4-harness.mjs: temporary session state, Knowledge testing, and bounded commitment.

## Mechanics tested

- Four Repeat keys, including universal Emoji-only and Listen.
- V-, D+, P- escalation from repetition; terminal Withdraw at exhausted Patience.
- Player Knowledge Gain requires NPC level advantage of at least two, relevant question/repeated Topic/adjacent Listen, and actual informative NPC Answer/Inform. Max +1 per page per interaction.
- Permanent Affect cap ±1 per variable; First Impression ±3, without a Knowledge exception.
- Soft stacking and optional negative overuse penalty.
- Three combinations of Knowledge, Interest, Openness, Topic Attitude, and initial V/D/P.
- Deterministic Action eligibility, Reaction composition, and contextual relationship recovery.

## Revisions after testing

1. response.js: unsolicited Inform and Redirect avoid topics already disclosed during the session, while direct Player questions remain answerable.
2. response.js: NPC that knows information but blocks disclosure selects Withdraw (🤫), not Confused (❓).
3. Test-only learning resolver: NPC Ask cannot award Knowledge merely by mentioning a Topic.
4. Test harness only supplies Mimicry metadata when an NPC Reaction was actually selected.

## Observed baseline (normal NPC initial V=5, D=5, P=8)

| Player policy | Result after up to 10 turns |
| --- | --- |
| Listen spam | Terminal at turn 7; V≈1.63, D≈8.38, P=0 |
| Vary Emoji-only | Terminal at turn 7; changing Emoji cannot bypass Repeat |
| Five positive Emoji stacked | Terminal at turn 7; V≈5.99, D=10, P=0 |
| Repeat same question | Answer may recur six times before terminal; Knowledge capped |
| Rotate four Topics | Survives 10 turns; P≈5.7 |
| Adaptive play | Survives 10 turns; P≈3.77, Player learns Militer +1 |
| Contextual recovery | V can first fall then recover, while D rises |

Stacking sensitivity, single turn, five positive Emoji: overuse cost 0 yields ΔV≈+0.623, ΔP≈-0.12; cost 0.25 yields ΔV≈-0.377, ΔP≈-1.12. **Negative overuse remains disabled by default**; tuning requires playtest.

## Unresolved gameplay concerns

1. Repeated Answer: NPC can repeat identical content when directly asked repeatedly. Repeat already has social costs, but feedback/content variety needs design testing.
2. Non-terminal Withdraw: NPC may repeat 🤫 without ending the conversation. That represents refusal, but escalation/variation is not final.
3. Cross-interaction farming: actual location regeneration, entry costs, save persistence and repeated short chats were not tested.
4. Knowledge branches, contradictions, propaganda and dependent facts are not modeled in the simplified test-only learning resolver.
5. Forty-two scripted dialogues do not prove no dominant strategy exists.
6. Real app integration, save migration and mobile UI tests remain outstanding.

## Experience priority

Prefer readable strategies, meaningful trade-offs, relevant NPC feedback and discoverable rules over realistic psychological simulation. Do not hide response-selection problems behind randomness.
