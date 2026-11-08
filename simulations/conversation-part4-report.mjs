import {simulateInteraction,POLICIES,SAMPLE_WORLD} from './part4-harness.mjs';
import {DEFAULT_IMPACT_CONFIG} from '../js/game/conversation/impact.js';
const worlds={
 normal:SAMPLE_WORLD,
 hostile:{...SAMPLE_WORLD,openness:2,topicAttitudes:{militer:{v:1,d:9}},npcInterests:{militer:'❗'}},
 curious:{...SAMPLE_WORLD,openness:9,npcInterests:{militer:'❓'},
   npcKnowledge:{...SAMPLE_WORLD.npcKnowledge,militer:1}}
};
console.log('SCENARIO\tTURNS\tV\tD\tP\tKNOWLEDGE\tACTIONS\tREPEATS');
for(const [npc,world] of Object.entries(worlds)){
 for(const [name,policy] of Object.entries(POLICIES)){
  const initial=npc==='hostile'?{v:2,d:8,p:6}:npc==='curious'?{v:7,d:3,p:9}:{v:5,d:5,p:8};
  const r=simulateInteraction(policy,{turns:10,world,initial});
  console.log([npc+'/'+name,r.turns,...['v','d','p'].map(k=>r.state[k].toFixed(2)),
   r.knowledgeGains.join(',')||'-',JSON.stringify(r.actions),r.log.filter(x=>x.repeat).length].join('\t'));
 }
}
console.log('\nSTACKING EXPERIMENT (one turn):');
for(const cost of [0,0.25,0.5,1]){
 const cfg={...DEFAULT_IMPACT_CONFIG,
   stacking:{...DEFAULT_IMPACT_CONFIG.stacking,overuseCost:cost,overusePatience:cost}};
 const r=simulateInteraction(POLICIES.stack,{turns:1,impactConfig:cfg});
 console.log('overuse cost '+cost+': ΔV '+(r.state.v-5).toFixed(3)+
  ', ΔD '+(r.state.d-5).toFixed(3)+', ΔP '+(r.state.p-8).toFixed(3));
}
