import test from 'node:test';
import assert from 'node:assert/strict';
import {pages,npcs,playerStart,createInteractionMemory,validate} from '../js/game/content/playtest-npcs.js';

test('three NPCs and canonical pages pass structural validation',()=>{
 assert.deepEqual(validate(),[]);
 assert.deepEqual(Object.keys(npcs),['harun','jali','ratih']);
});
test('all known relationships include both base pages',()=>{
 for(const [name,npc] of Object.entries(npcs))
 for(const [id,entry] of Object.entries(npc.memory))
 if(pages[id].type==='Relationship'&&entry.knowledge>0)
 for(const endpoint of [pages[id].a,pages[id].b])
 assert.ok(npc.memory[endpoint]?.knowledge>=1,name+' missing '+endpoint);
});
test('interest is sparse, prioritised and optional',()=>{
 for(const npc of Object.values(npcs)){
  const entries=Object.values(npc.memory);
  assert.ok(entries.filter(x=>x.interest).length<entries.length/2);
  assert.ok(entries.some(x=>x.interest?.priority===5));
  assert.ok(entries.some(x=>!x.attitude));
 }
});
test('comparison snapshot does not mutate source levels',()=>{
 const table=createInteractionMemory('ratih',playerStart);
 assert.equal(table.dimas__kawasan_industri.npcLevel,1);
 assert.equal(table.dimas__kawasan_industri.playerLevel,0);
 assert.equal(table.dimas__kawasan_industri.contra,null);
 assert.equal(table.dimas__kawasan_industri.unexploredBranch,null);
 assert.equal(table.dimas__kawasan_industri.pendingPlayerGain,0);
 table.dimas__kawasan_industri.pendingNpcGain=1;
 assert.equal(npcs.ratih.memory.dimas__kawasan_industri.knowledge,1);
});
test('validator catches orphan relationship and bad interest',()=>{
 const altered=structuredClone(npcs);
 delete altered.harun.memory.wira;
 altered.ratih.memory.dimas__kawasan_industri.interest.priority=9;
 const errors=validate({characters:altered});
 assert.ok(errors.some(x=>x.includes('Missing relationship base')));
 assert.ok(errors.some(x=>x.includes('Bad interest')));
});
