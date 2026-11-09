import test from 'node:test';
import assert from 'node:assert/strict';
import {createSession,resolveBeat,MODEL_CONFIG} from '../js/game/conversation/board-model.js';
import {npcs,testCheckpointKnowledge,validate} from '../js/game/content/playtest-npcs.js';

const T=id=>({kind:'info',id}),E=value=>({kind:'emoji',value});

test('signed Topic Attitude aligns positive expressions correctly',()=>{
 const h=resolveBeat(createSession('harun'),[T('perantau'),E('👍')]);
 const hostile=resolveBeat(createSession('harun'),[T('saman'),E('👍')]);
 assert.ok(h.reaction.deltaV>hostile.reaction.deltaV);
 assert.ok(h.reaction.deltaV>0);
});
test('alignment parameter changes the same universal calculation, not NPC data',()=>{
 const low={...MODEL_CONFIG,alignmentScale:0.20};
 const high={...MODEL_CONFIG,alignmentScale:0.40};
 for(const [npcId,page] of [['harun','perantau'],['ratih','dimas']]){
  const l=resolveBeat(createSession(npcId,testCheckpointKnowledge),[T(page),E('👍')],low);
  const h=resolveBeat(createSession(npcId,testCheckpointKnowledge),[T(page),E('👍')],high);
  assert.ok(h.reaction.deltaV>l.reaction.deltaV,npcId+' higher alignment must help');
 }
 const j1=resolveBeat(createSession('jali',testCheckpointKnowledge),[T('kawasan_industri'),E('👍')],low);
 const j2=resolveBeat(createSession('jali',testCheckpointKnowledge),[T('kawasan_industri'),E('👍')],high);
 assert.equal(j1.reaction.deltaV,j2.reaction.deltaV);
});
test('a knowledge deficit is less boring when Player asks',()=>{
 const knowledge={...testCheckpointKnowledge,kawasan_industri:1};
 const plain=resolveBeat(createSession('jali',knowledge),[T('kawasan_industri')]);
 const asked=resolveBeat(createSession('jali',knowledge),[T('kawasan_industri'),E('❓')]);
 assert.ok(plain.reaction.deltaD>asked.reaction.deltaD);
});
test('no NPC metadata edits required for three differentiated playtest roles',()=>{
 assert.deepEqual(validate(),[]);
 assert.equal(npcs.harun.memory.saman.openness,2);
 assert.equal(npcs.jali.initial.p,4);
 assert.equal(npcs.ratih.memory.dimas__kawasan_industri.interest.emoji,'📍');
 for(const npc of Object.values(npcs))
  assert.ok(Object.values(npc.memory).filter(page=>page.interest).length<=2);
});
