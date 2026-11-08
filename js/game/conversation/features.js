import {parseMessage} from './parser.js';
import {evaluateRepetition} from './repetition.js';

/**
 * Returns a Memory Page multiset and the evidence events that produced it.
 * relationId(a,b) must return a registered symmetrical relationship ID or null.
 * The last NPC message must be supplied exactly, never searched backward.
 */
export function extractFeatures({playerTokens, previousNpcTokens = null, playerHistory = [], relationId}) {
  if (typeof relationId !== 'function') throw new TypeError('relationId callback is required');
  const parsed = parseMessage(playerTokens);
  const prevNpc = previousNpcTokens === null ? null : parseMessage(previousNpcTokens);
  const counts = Object.create(null);
  const events = [];
  const add = (pageId, source, a = null, b = null) => {
    if (!pageId) return;
    counts[pageId] = (counts[pageId] || 0) + 1;
    events.push({pageId, source, ...(a ? {a} : {}), ...(b ? {b} : {})});
  };
  for (const topic of parsed.topics) add(topic.id,'player-topic');
  for (let i=0; i < parsed.sequence.length-1; i++) {
    const a=parsed.sequence[i], b=parsed.sequence[i+1];
    if (a.kind === 'topic' && b.kind === 'topic') add(relationId(a.id,b.id),'internal-adjacency',a.id,b.id);
  }
  // Cross-message adjacency exists only when the ACTUAL last NPC token and
  // ACTUAL first Player token are topics. Emoji groups are hard boundaries.
  if (prevNpc?.lastTopicId && parsed.firstTopicId) {
    const a=prevNpc.lastTopicId, b=parsed.firstTopicId;
    if (a === b) add(b,'boundary-continuation',a,b);
    else add(relationId(a,b),'boundary-relation',a,b);
  }
  const total = Object.values(counts).reduce((a,b)=>a+b,0);
  const proportions = Object.fromEntries(Object.entries(counts).map(([id,count])=>[id,total ? count/total : 0]));
  return {parsed, previousNpc:prevNpc, counts:{...counts}, proportions, total, events,
    repetition:evaluateRepetition(playerTokens,playerHistory)};
}
