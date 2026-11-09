import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,resolveBeat} from '../js/game/conversation/board-model.js';
import {testCheckpointKnowledge} from '../js/game/content/playtest-npcs.js';
const T=id=>({kind:'info',id}),E=value=>({kind:'emoji',value});

test('bare adjacency without an NPC question does not teach the NPC',()=>{
 const s=createSession('ratih',testCheckpointKnowledge);
 const result=resolveBeat(s,[T('dimas'),T('kawasan_industri')]);
 assert.equal(result.pending.dimas__kawasan_industri,undefined);
});
test('an NPC question followed by matching Player answer teaches the Relationship',()=>{
 const s=createSession('ratih',testCheckpointKnowledge);
 const question=resolveBeat(s,[]);
 assert.deepEqual(question.tokens.map(x=>x.value??x.id),['dimas','kawasan_industri','📍']);
 const reply=resolveBeat(s,[T('dimas'),T('kawasan_industri')]);
 assert.equal(reply.pending.dimas__kawasan_industri?.npc,1);
});
test('one known endpoint does not count as teaching a Relationship',()=>{
 const s=createSession('ratih',testCheckpointKnowledge);
 resolveBeat(s,[]);
 const result=resolveBeat(s,[T('dimas')]);
 assert.equal(result.pending.dimas__kawasan_industri,undefined);
});
test('existing lightbulb marker can explicitly indicate new information',()=>{
 const s=createSession('ratih',testCheckpointKnowledge);
 const r=resolveBeat(s,[T('dimas'),T('kawasan_industri'),E('💡')]);
 assert.equal(r.pending.dimas__kawasan_industri?.npc,1);
});
test('suppress ASK is not itself a question and cancels question in same group',()=>{
 const alone=resolveBeat(createSession('jali',testCheckpointKnowledge),
  [T('kawasan_industri'),E('💤')]);
 const suppressed=resolveBeat(createSession('jali',testCheckpointKnowledge),
  [T('kawasan_industri'),E('❓'),E('💤')]);
 const asked=resolveBeat(createSession('jali',testCheckpointKnowledge),
  [T('kawasan_industri'),E('❓')]);
 const score=(r)=>r.ranked.find(c=>c.pageId==='kawasan_industri'&&c.key==='topic:kawasan_industri')?.base;
 assert.equal(score(alone),score(suppressed));
 assert.ok(score(asked)>score(suppressed));
});
test('NPC questions never teach Player simply because they contain Topic tokens',()=>{
 const s=createSession('ratih');
 const r=resolveBeat(s,[]);
 assert.equal(r.pending.dimas__kawasan_industri,undefined);
});
