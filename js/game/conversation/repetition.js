import {parseMessage} from './parser.js';

/** Four disjoint equivalence classes; emoji identity is intentionally ignored. */
export function repeatKey(tokensOrParsed) {
  const parsed = Array.isArray(tokensOrParsed) ? parseMessage(tokensOrParsed) : tokensOrParsed;
  if (parsed.kind === 'LISTEN') return 'LISTEN';
  if (parsed.kind === 'EMOJI_ONLY') return 'EMOJI_ONLY';
  const ids = [...new Set(parsed.topics.map(t => t.id))].sort();
  return parsed.kind + ':' + JSON.stringify(ids);
}

/** history contains messages prior to the current message; NPC messages are ignored. */
export function evaluateRepetition(currentTokens, history = []) {
  const key = repeatKey(currentTokens);
  const previousKeys = history.filter(m => m.from === 'player').map(m => repeatKey(m.tokens));
  const previousCount = previousKeys.reduce((n, item) => n + Number(item === key), 0);
  let previousStreak = 0;
  for (let i = previousKeys.length - 1; i >= 0 && previousKeys[i] === key; i--) previousStreak++;
  const occurrence = previousCount + 1;
  const streak = previousStreak + 1;
  const consecutive = streak >= 2;
  const cumulative = occurrence >= 3;
  return {key, kind:parseMessage(currentTokens).kind, occurrence, streak, consecutive, cumulative,
    negativeRepetition:consecutive || cumulative};
}
