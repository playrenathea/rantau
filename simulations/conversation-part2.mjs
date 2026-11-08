import {extractFeatures} from '../js/game/conversation/features.js';
import {calculateImpact,DEFAULT_IMPACT_CONFIG} from '../js/game/conversation/impact.js';
const T=id=>({kind:'info',id}),E=value=>({kind:'emoji',value});
const scenarios=[
 {name:'Respect on high D',tokens:[E('🙏')],npcState:{v:7,d:8,p:8}},
 {name:'Respect on low V',tokens:[E('🙏')],npcState:{v:3,d:8,p:8}},
 {name:'Challenge on low D',tokens:[E('👎')],npcState:{v:5,d:3,p:8}},
 {name:'Challenge on high D',tokens:[E('👎')],npcState:{v:5,d:8,p:8}},
 {name:'Player superior knowledge',tokens:[T('militer')],npcState:{v:5,d:5,p:8},playerKnowledge:{militer:5},npcKnowledge:{militer:2}},
 {name:'NPC superior knowledge',tokens:[T('militer')],npcState:{v:5,d:5,p:8},playerKnowledge:{militer:2},npcKnowledge:{militer:5}},
 {name:'Interest ? plus player knowledge',tokens:[T('militer')],npcState:{v:5,d:5,p:8},npcInterests:{militer:'❓'},playerKnowledge:{militer:5},npcKnowledge:{militer:2}},
 {name:'Alignment with topic',tokens:[T('militer'),E('👎')],npcState:{v:5,d:5,p:8},npcKnowledge:{militer:2},playerKnowledge:{militer:2},topicAttitudes:{militer:{v:1,d:9}}},
 {name:'Opposition to topic',tokens:[T('militer'),E('❤️')],npcState:{v:5,d:5,p:8},npcKnowledge:{militer:2},playerKnowledge:{militer:2},topicAttitudes:{militer:{v:1,d:9}}},
 {name:'Positive emoji stack',tokens:[E('🙂'),E('❤️'),E('🥺'),E('🙏'),E('👍')],npcState:{v:5,d:5,p:8}}
];
console.log('SCENARIO\tΔV\tΔD\tΔP\tREACTIONS');
for(const scenario of scenarios){
 const features=extractFeatures({playerTokens:scenario.tokens,relationId:()=>null});
 const result=calculateImpact({features,config:DEFAULT_IMPACT_CONFIG,...scenario});
 console.log([scenario.name,...['v','d','p'].map(k=>result.delta[k].toFixed(3)),result.reactionSignals.map(s=>s.kind).join(',')].join('\t'));
}
const spam=[E('🙂')],history=[];
let state={v:5,d:5,p:8};
console.log('\nREPEATED EMOJI-ONLY');
for(let i=1;i<=6;i++){
 const features=extractFeatures({playerTokens:spam,playerHistory:history,relationId:()=>null});
 const result=calculateImpact({features,npcState:state});
 console.log(`turn ${i}: repeat=${features.repetition.negativeRepetition}, V=${result.nextState.v.toFixed(2)}, D=${result.nextState.d.toFixed(2)}, P=${result.nextState.p.toFixed(2)}`);
 state=result.nextState;history.push({from:'player',tokens:spam});
}
