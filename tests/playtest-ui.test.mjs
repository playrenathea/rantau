import test from 'node:test';
import assert from 'node:assert/strict';
import {pages,npcs} from '../js/game/content/playtest-npcs.js';
import {information,locations,relations,npcs as uiNpcs,emojis} from '../js/playtest-data.js';
import {fresh,project,pack,parseSave,TEST_CHECKPOINT} from '../js/playtest-state.js';
import {createViews} from '../js/ui/views.js';
import {begin,beat,finish,setPlayerLocation} from '../js/game/conversation/persistent-sim.js';
const T=id=>({kind:'info',id}),E=value=>({kind:'emoji',value});
const views=s=>createViews({state:project(s),draft:[],picker:'info',pickerOpen:true,memoryFilter:'all'});

test('MVP reset checkpoint loads all three NPCs and consistent Memory Pages',()=>{
 const s=fresh();
 assert.equal(s.world.player.location,'terminal');
 assert.equal(s.world.player.knowledge.dimas__kawasan_industri,3);
 assert.equal(s.world.player.knowledge.kawasan_industri,3);
 assert.equal(s.world.player.knowledge.dimas,3);
 assert.deepEqual(Object.keys(s.world.npcs).sort(),['harun','jali','ratih']);
 assert.ok(uiNpcs.some(n=>n.id==='ratih'&&n.location==='pasar_induk'));
 assert.ok(emojis.includes('📍'));
 assert.equal(s.world.records.length,0);
 assert.equal(s.world.active,null);
});
test('existing Explorer and Memory layouts render actual playtest content',()=>{
 const s=fresh(),v=views(s);
 assert.match(v.explorer(),/Pak Harun/);
 assert.match(v.explorer(),/Bang Jali/);
 assert.match(v.explorer(),/id="saveMenu"/);
 assert.match(v.memory(),/Dimas/);
 assert.match(v.memory(),/Kawasan Industri/);
 assert.match(v.memory(),/Relationships/);
 assert.equal((v.memory().match(/data-memory-filter="Individual"/g)||[]).length,1);
 assert.equal(pages.dimas__kawasan_industri.type,'Relationship');
 assert.equal(information.length+relations.length,Object.keys(pages).length);
});
test('map exposes only known location Pages and Ratih appears at Pasar Induk',()=>{
 const s=fresh();
 s.mapOpen=true;
 const map=views(s).explorer();
 assert.match(map,/Pasar Induk/);
 assert.doesNotMatch(map,/Pelabuhan/);
 assert.doesNotMatch(map,/Kampung Halaman/);
 s.mapOpen=false;
 setPlayerLocation(s.world,'pasar_induk');
 assert.match(views(s).explorer(),/Bu Ratih/);
 assert.doesNotMatch(views(s).explorer(),/Pak Harun/);
});
test('a Player Relationship Page is available as a chat Topic',()=>{
 const s=fresh();begin(s.world,'harun');
 const chat=views(s).chat();
 assert.match(chat,/Dimas × Kawasan Industri/);
 assert.match(chat,/Pak Harun/);
});
test('chat and persistent progress survive export/import; reset returns checkpoint',()=>{
 const s=fresh();
 begin(s.world,'jali');
 beat(s.world,[]);
 const live=views(s).chat();
 assert.match(live,/Ratih/);
 const restored=parseSave(JSON.stringify(pack(s)));
 assert.equal(restored.world.active.npcId,'jali');
 assert.equal(restored.world.active.session.history.length,2);
 finish(restored.world);
 const again=parseSave(JSON.stringify(pack(restored)));
 assert.equal(again.world.npcs.jali.interactions,1);
 assert.ok(again.world.records.length===1);
 const reset=fresh();
 assert.equal(reset.world.npcs.jali.interactions,0);
 assert.equal(reset.world.records.length,0);
 assert.deepEqual(reset.world.player.knowledge,TEST_CHECKPOINT);
});
test('legacy saves cannot overwrite playtest checkpoint import',()=>{
 assert.throws(()=>parseSave(JSON.stringify({schemaVersion:1,knowledge:{},npcStates:{},location:'pasar'})),/bukan save/);
});
test('Ratih can receive Knowledge from informed checkpoint on visit',()=>{
 const s=fresh();
 setPlayerLocation(s.world,'pasar_induk');
 begin(s.world,'ratih');
 const res=beat(s.world,[T('dimas'),T('kawasan_industri')]);
 assert.equal(res.pending.dimas__kawasan_industri.npc,1);
 finish(s.world);
 assert.equal(s.world.npcs.ratih.knowledge.dimas__kawasan_industri,2);
});
