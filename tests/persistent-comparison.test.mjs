import test from 'node:test';
import assert from 'node:assert/strict';
import {runComparison} from '../simulations/persistent-comparison.mjs';

test('three NPCs times three policies are reproducible and independent',()=>{
 const a=runComparison({sessions:2,beatsPerSession:4});
 const b=runComparison({sessions:2,beatsPerSession:4});
 assert.equal(a.length,9);
 assert.deepEqual(a,b);
 for(const row of a){
  assert.equal(row.sessions,2);
  assert.ok(row.turns<=8);
  assert.ok(row.finalV>=0&&row.finalV<=10);
  assert.ok(row.finalD>=0&&row.finalD<=10);
 }
});
test('informed Ratih can learn from Player; adaptive play yields Knowledge both ways',()=>{
 const rows=runComparison({sessions:4,beatsPerSession:6});
 const ratih=rows.find(x=>x.npcId==='ratih'&&x.policy==='adaptive');
 assert.ok(ratih.npcLearned.some(x=>x.pageId==='dimas__kawasan_industri'));
 assert.ok(ratih.playerLearned.length>0);
});
test('Jali adaptive strategy gains more pages and preserves more Valence than spam',()=>{
 const rows=runComparison({sessions:4,beatsPerSession:6}).filter(x=>x.npcId==='jali');
 const varied=rows.find(x=>x.policy==='adaptive');
 const spam=rows.find(x=>x.policy==='spam');
 assert.ok(varied.playerLearned.length>spam.playerLearned.length);
 assert.ok(varied.finalV>spam.finalV);
});
