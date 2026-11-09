import test from 'node:test';
import assert from 'node:assert/strict';
import {repeatKey} from '../js/game/conversation/repetition.js';
import {npcs,playerStart} from '../js/game/content/playtest-npcs.js';
import {createSession,resolveBeat,responseKey,recencyPressure} from '../js/game/conversation/board-model.js';

const T=id=>({kind:'info',id});
const E=value=>({kind:'emoji',value});
const says=(r)=>r.tokens.map(t=>t.id??t.value);
test('NPC fixtures are consumable by the isolated board model',()=>{
 for(const npcId of Object.keys(npcs)){
  const session=createSession(npcId);
  const result=resolveBeat(session,[]);
  assert.ok(Array.isArray(result.tokens));
  assert.ok(Number.isFinite(result.state.p));
  assert.equal(session.history.length,2);
 }
});
test('a completely unknown explicit Topic yields emoji-only confusion',()=>{
 const r=resolveBeat(createSession('ratih'),[T('saman'),E('❓')]);
 assert.deepEqual(says(r),['❓']);
});
test('Harun rewards rapport on Perantau and can reveal a Saman relationship',()=>{
 const session=createSession('harun');
 const early=resolveBeat(session,[T('perantau'),E('👍')]);
 assert.ok(says(early).includes('perantau'));
 resolveBeat(session,[T('kampung_halaman'),E('🙂')]);
 const later=resolveBeat(session,[T('saman'),E('❓')]);
 assert.ok(says(later).includes('saman'));
 assert.equal(session.memory.saman__narto.pendingPlayerGain,1);
 assert.equal(npcs.harun.memory.saman__narto.knowledge,4);
});
test('Ratih can initiate a typed question about a known relationship',()=>{
 const r=resolveBeat(createSession('ratih'),[]);
 assert.deepEqual(says(r),['dimas','kawasan_industri','📍']);
 assert.equal(r.pending.dimas__kawasan_industri,undefined);
});
test('NPC interest emphasis can transmit Knowledge; typed question cannot',()=>{
 const jali=resolveBeat(createSession('jali'),[]);
 assert.deepEqual(says(jali),['ratih','pesan_jali','❗']);
 assert.equal(jali.pending.ratih__pesan_jali?.player,1);
 const ratih=resolveBeat(createSession('ratih'),[]);
 assert.deepEqual(says(ratih),['dimas','kawasan_industri','📍']);
 assert.equal(ratih.pending.dimas__kawasan_industri,undefined);
});
test('Warm Up preserves topic while Cool Down changes Ratih response form',()=>{
 const session=createSession('ratih');
 const first=resolveBeat(session,[]);
 const second=resolveBeat(session,[T('dimas'),T('kawasan_industri')]);
 assert.deepEqual(says(first),['dimas','kawasan_industri','📍']);
 assert.deepEqual(says(second),['dimas','kawasan_industri']);
});
test('Jali location question can mark a pending Player knowledge gain',()=>{
 const session=createSession('jali');
 const r=resolveBeat(session,[T('kawasan_industri'),E('❓')]);
 assert.deepEqual(says(r),['kawasan_industri']);
 assert.equal(r.pending.kawasan_industri.player,1);
});
test('higher Player Knowledge on Ratih interested page can mark NPC learning',()=>{
 const player={...playerStart,dimas:5,kawasan_industri:4,dimas__kawasan_industri:4};
 const session=createSession('ratih',player);
 const r=resolveBeat(session,[T('dimas'),T('kawasan_industri')]);
 assert.equal(r.pending.dimas__kawasan_industri?.npc,1);
 assert.equal(session.memory.dimas__kawasan_industri.npcLevel,1);
});
test('repeat pressure increases with frequency and decays with distance',()=>{
 const hist=[{from:'player',tokens:[T('saman')]},{from:'npc',tokens:[E('🙂')]}];
 const immediate=recencyPressure(repeatKey([T('saman')]),hist,'player',0.6);
 const spaced=recencyPressure(repeatKey([T('saman')]),[...hist,
  {from:'player',tokens:[T('perantau')]}],'player',0.6);
 assert.equal(immediate,1);
 assert.ok(spaced<immediate);
});
test('cooldown distinguishes specific emoji expressions of the same topic',()=>{
 assert.notEqual(responseKey([T('dimas'),E('📍')]),
  responseKey([T('dimas'),E('❓')]));
 assert.equal(responseKey([T('dimas'),T('kawasan_industri')]),
  responseKey([T('kawasan_industri'),T('dimas')]));
});
test('emoji stacking across the entire message incurs more cost',()=>{
 const single=resolveBeat(createSession('jali'),[E('🙂')]);
 const stack=resolveBeat(createSession('jali'),[E('🙂'),E('👍'),E('❤️'),E('🙏')]);
 assert.ok(stack.reaction.stacking>single.reaction.stacking);
 assert.ok(stack.reaction.patienceCost>single.reaction.patienceCost);
});
test('response ranking is deterministic and sessions are isolated',()=>{
 const a=resolveBeat(createSession('harun'),[T('perantau')]);
 const b=resolveBeat(createSession('harun'),[T('perantau')]);
 assert.deepEqual(a.tokens,b.tokens);
 assert.equal(a.choice.key,b.choice.key);
});
