/** Pure parsing of Rantau chat tokens. Never interprets emoji meanings. */
export function parseMessage(tokens) {
  if (!Array.isArray(tokens)) throw new TypeError('Message tokens must be an array');
  const sequence = [];
  const topics = [];
  const emojiGroups = [];
  for (const [index, token] of tokens.entries()) {
    if (token?.kind === 'info' && typeof token.id === 'string' && token.id.length) {
      const item = {kind:'topic', id:token.id, tokenIndex:index};
      topics.push(item); sequence.push(item);
    } else if (token?.kind === 'emoji' && typeof token.value === 'string' && token.value.length) {
      const prev = sequence[sequence.length - 1];
      if (prev?.kind === 'emojiGroup') {
        prev.emojis.push(token.value);
        prev.tokenIndices.push(index);
      } else {
        const item = {kind:'emojiGroup', emojis:[token.value], tokenIndices:[index]};
        emojiGroups.push(item); sequence.push(item);
      }
    } else throw new TypeError('Invalid chat token at index ' + index);
  }
  for (const [index, group] of sequence.entries()) {
    if (group.kind !== 'emojiGroup') continue;
    const before = sequence[index - 1], after = sequence[index + 1];
    group.leftTopicId = before?.kind === 'topic' ? before.id : null;
    group.rightTopicId = after?.kind === 'topic' ? after.id : null;
    group.atStart = index === 0;
    group.atEnd = index === sequence.length - 1;
    group.targetsNpc = group.atStart || group.atEnd;
    group.referencesPreviousNpc = group.atStart;
  }
  return {
    kind: topics.length ? (emojiGroups.length ? 'TOPIC_EMOJI' : 'TOPIC_ONLY')
      : (emojiGroups.length ? 'EMOJI_ONLY' : 'LISTEN'),
    sequence, topics, emojiGroups,
    firstTopicId: sequence[0]?.kind === 'topic' ? sequence[0].id : null,
    lastTopicId: sequence.at(-1)?.kind === 'topic' ? sequence.at(-1).id : null,
    hasEmoji: emojiGroups.length > 0
  };
}
