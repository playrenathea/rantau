import test from 'node:test';
import assert from 'node:assert/strict';
import {npcs,playerStart} from '../js/game/content/playtest-npcs.js';
import {
 PLAYER_START,createWorld,begin,beat,finish,resetWorld,setPlayerLocation,
 validateKnowledge,serializeWorld,restoreWorld
} from '../js/game/conversation/persistent-sim.js';
const T=id=>({kind:'info',id});
const E=value=>({kind:'emoji',value});

test('Player is a separate persistent object, NPC relationships are independent',()=>{
 const world=createWorld();
 assert.deepEqual(world.player.knowledge,playerStart);
 assert.equal(world.player.location,PLAYER_START.location);
 assert.equal(world.npcs.harun.v,3);
 assert.equal(world.npcs.ratih.d,3);
 assert.equal(world.active,null);
});
test('only informed Player Pages are valid message tokens',()=>{
 const world=createWorld();
 begin(world,'jali');
 assert.throws(()=>beat(world,[T('kawasan_industri'),E('❓')]),/does not know/);
 assert.ok(beat(world,[]).tokens.length);
});
test('working NPC effect is not persistent until finish, and first impression caps at three',()=>{
 const world=createWorld();
 const active=begin(world,'harun');
 assert.equal(active.firstImpression,true);
 for(let i=0;i<3;i++)beat(world,[T('saman'),E('❓')]);
 assert.equal(world.npcs.harun.v,3);
 const old=world.npcs.harun.d;
 const finalWorking=world.active.session.state.d;
 const report=finish(world);
 assert.ok(Math.abs(world.npcs.harun.d-old)<=3+1e-9);
 assert.ok(Math.abs(world.npcs.harun.d-old-(Math.max(-3,Math.min(3,finalWorking-old))))<1e-9);
 assert.equal(report.beats,3);
 assert.equal(world.npcs.harun.interactions,1);
 assert.equal(world.active,null);
 const again=begin(world,'harun');
 assert.equal(again.firstImpression,false);
 assert.equal(again.session.state.p,npcs.harun.initial.p);
 assert.deepEqual(again.session.history,[]);
});
test('learned Relationship creates the missing base awareness at commit only',()=>{
 const world=createWorld();
 begin(world,'jali');
 const r=beat(world,[]);
 assert.equal(r.pending.ratih__pesan_jali.player,1);
 assert.equal(world.player.knowledge.ratih,undefined);
 assert.equal(world.player.knowledge.ratih__pesan_jali,undefined);
 const committed=finish(world);
 assert.ok(committed.learnedByPlayer.includes('ratih__pesan_jali'));
 assert.deepEqual(new Set(committed.discoveredByPlayer),new Set(['ratih','pesan_jali']));
 assert.deepEqual(committed.discoveredByNpc,[]);
 assert.equal(world.player.knowledge.ratih__pesan_jali,1);
 assert.equal(world.player.knowledge.ratih,1);
 assert.equal(world.player.knowledge.pesan_jali,1);
 assert.deepEqual(validateKnowledge(world.player.knowledge),[]);
});
test('subsequent session uses persisted Player Knowledge and NPC status',()=>{
 const world=createWorld();
 begin(world,'jali');beat(world,[]);finish(world);
 const firstJali=world.npcs.jali.v;
 begin(world,'jali');
 assert.equal(world.active.session.memory.ratih.playerLevel,1);
 assert.equal(world.active.session.memory.ratih__pesan_jali.playerLevel,1);
 beat(world,[T('ratih'),E('👥')]);finish(world);
 assert.ok(Math.abs(world.npcs.jali.v-firstJali)<=1+1e-9);
 assert.equal(world.npcs.jali.interactions,2);
});
test('NPC knowledge gains remain in that NPC and appear next session',()=>{
 const enhanced={...playerStart,dimas:3,kawasan_industri:3,dimas__kawasan_industri:3};
 const world=createWorld({playerKnowledge:{...enhanced,pasar_induk:1},playerLocation:'pasar_induk'});
 begin(world,'ratih');
 const r=beat(world,[T('dimas'),T('kawasan_industri')]);
 assert.equal(r.pending.dimas__kawasan_industri?.npc,1);
 assert.equal(world.npcs.ratih.knowledge.dimas__kawasan_industri,1);
 const summary=finish(world);
 assert.ok(summary.learnedByNpc.includes('dimas__kawasan_industri'));
 assert.equal(world.npcs.ratih.knowledge.dimas__kawasan_industri,2);
 begin(world,'ratih');
 assert.equal(world.active.session.memory.dimas__kawasan_industri.npcLevel,2);
});
test('interaction cap prevents earning multiple levels on one Page',()=>{
 const world=createWorld();
 begin(world,'jali');
 for(let i=0;i<4;i++)beat(world,[]);
 const report=finish(world);
 assert.equal(new Set(report.learnedByPlayer).size,report.learnedByPlayer.length);
 for(const id of report.learnedByPlayer)assert.equal(world.player.knowledge[id],1);
});
test('save round-trip includes an active interaction and resumes it',()=>{
 const world=createWorld();
 begin(world,'harun');beat(world,[T('saman'),E('❓')]);
 const restored=restoreWorld(serializeWorld(world));
 assert.deepEqual(restored,world);
 assert.equal(restored.active.session.history.length,2);
 beat(restored,[T('perantau'),E('👍')]);
 const outcome=finish(restored);
 assert.equal(outcome.beats,2);
});
test('reset is deterministic and independent of any persisted run',()=>{
 const world=createWorld();
 begin(world,'jali');beat(world,[]);finish(world);
 const reset=resetWorld();
 assert.deepEqual(reset,createWorld());
 assert.equal(reset.records.length,0);
 assert.equal(reset.npcs.jali.interactions,0);
 assert.equal(reset.player.knowledge.ratih,undefined);
});
test('NPCs must be encountered at their locations, without inventing travel cost',()=>{
 const world=createWorld();
 assert.throws(()=>setPlayerLocation(world,'pasar_induk'),/not discovered/);
 begin(world,'jali');beat(world,[]);finish(world);
 assert.throws(()=>setPlayerLocation(world,'pasar_induk'),/not discovered/);
 const enhanced=createWorld({playerKnowledge:{...playerStart,pasar_induk:1}});
 assert.throws(()=>begin(enhanced,'ratih'),/not terminal/);
 assert.equal(setPlayerLocation(enhanced,'pasar_induk'),'pasar_induk');
 assert.equal(enhanced.player.location,'pasar_induk');
 begin(enhanced,'ratih');
 assert.equal(enhanced.active.npcId,'ratih');
});
test('invalid or incomplete saved knowledge is rejected',()=>{
 const world=createWorld();
 world.player.knowledge.saman__wira=1;
 assert.throws(()=>restoreWorld(serializeWorld(world)),/missing basic Page/);
 assert.throws(()=>createWorld({playerKnowledge:{terminal:1,saman__wira:1}}),/missing basic Page/);
});
test('commit does not modify source NPC or starting Player fixtures',()=>{
 const world=createWorld();
 begin(world,'jali');beat(world,[]);finish(world);
 assert.equal(npcs.jali.memory.ratih__pesan_jali.knowledge,4);
 assert.equal(playerStart.ratih__pesan_jali,undefined);
});
