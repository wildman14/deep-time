/* Deep Time: ascension. After the Stellar Age your people choose what they become.
   Six paths: the machine, the cyborg, the uploaded mind, engineered evolution, the psionic mind, or staying natural.
   Every decision on the way (events, tech and civic branches, character marks, and deliberate cultivation) leans the people
   toward some paths. Any path can be chosen at the end, but a path that fits your history pays off better. No DOM access. */
const PATHS={
 cyborg:{n:'Cybernetic',people:'cyborgs',lean:'cybernetics',sym:'◈',
  d:'Graft machinery onto living bodies. Stronger hands, sharper eyes, and a network in every skull.',
  fx:{e:1.15,t:1.3,bad:.9},fxText:'Production ×1.15, tapping ×1.3, losses ×0.9',
  w:{tech:{C:1,M:.3},civ:{K:.6,X:.3},marks:{bold:1.5,curious:.8,ruthless:.5}},cost:'ins',
  more:'A surgeon-engineer shows you what a hand could be.'},
 machine:{n:'Synthetic',people:'machines',lean:'machine bodies',sym:'⬡',
  d:'Replace the body entirely. Robots that repair themselves, never tire, and never forget a skill.',
  fx:{e:1.35,c:.75,g:.9},fxText:'Production ×1.35, traits 10% cheaper, cohesion ×0.75',
  w:{tech:{C:1,M:.3},civ:{X:.6,D:.2},marks:{rational:1.5,ruthless:1,greedy:.6}},cost:'ins',
  more:'Foundries begin to build workers that outlast their makers.'},
 digital:{n:'Uploaded',people:'minds in the machine',lean:'uploading',sym:'∞',
  d:'Move consciousness into computers and AI. Minds that copy, merge, and run a thousand times faster.',
  fx:{e:1.2,i:1.5,bad:1.15},fxText:'Production ×1.2, insight ×1.5, losses ×1.15',
  w:{tech:{M:1,C:.4},civ:{X:.5,D:.2},marks:{rational:1.2,curious:1.5,wanderer:.5}},cost:'ins',
  more:'A mind is copied, and the copy insists it is the original.'},
 genetic:{n:'Engineered',people:'a people of designed life',lean:'engineered evolution',sym:'✦',
  d:'Evolve on purpose, with technology. Whole new bodies and minds designed and grown in a generation.',
  fx:{e:1.1,adv:.85,gain:1.3},fxText:'Production ×1.1, evolution cost ×0.85, event gains ×1.3',
  w:{tech:{S:1,M:.7},civ:{K:.4,X:.2},marks:{curious:1.2,generous:.8,wanderer:.6}},cost:'ins',
  more:'Genetic gardens turn out new kinds of people faster than the old kinds can adapt.'},
 psionic:{n:'Transcendent',people:'a people of one mind',lean:'the mind',sym:'☼',
  d:'Turn inward. Spiritual practice, shared thought, and a mind that reaches past the body.',
  fx:{c:1.6,e:1.1,luck:.1},fxText:'Cohesion ×1.6, production ×1.1, luck +10%',
  w:{tech:{M:.6,S:.3},civ:{D:1,K:.8},marks:{pious:1.5,merciful:1,generous:.6}},cost:'coh',
  more:'Meditation halls fill. Something between people begins to hum.'},
 natural:{n:'Natural',people:'the unchanged',lean:'staying natural',sym:'❦',
  d:'Stay as you are, with better tools. The oldest path: you remain exactly who you were.',
  fx:{bad:.7,gain:1.2,c:1.15},fxText:'Losses ×0.7, event gains ×1.2, cohesion ×1.15',
  w:{tech:{S:.8},civ:{K:.5,D:.6},marks:{cautious:1.5,rooted:1.2,merciful:.8,pious:.6}},cost:'coh',
  more:'Some insist that the shape you have is the shape worth keeping.'}
};
const PATH_IDS=['cyborg','machine','digital','genetic','psionic','natural'];
const LEAN_MAX=4;

/* a path's pull: branch counts, character marks, and deliberate cultivation */
function leanScore(S,id){
  const P=PATHS[id],cnt={tech:{},civ:{}};
  ['tech','civ'].forEach(kind=>{for(const nid in S[kind])if(S[kind][nid]&&NODES[kind][nid]){const b=NODES[kind][nid].branch;cnt[kind][b]=(cnt[kind][b]||0)+1;}});
  let sc=0;
  ['tech','civ'].forEach(kind=>{for(const b in P.w[kind])sc+=P.w[kind][b]*(cnt[kind][b]||0);});
  S.marks.forEach(m=>{sc+=P.w.marks[m]||0;});
  sc+=3*((S.lean&&S.lean[id])||0);
  return sc;
}
/* all paths ranked, each with a fit level: 2 natural fit, 1 possible, 0 against the grain */
function leanings(S){
  const rows=PATH_IDS.map(id=>({id:id,score:leanScore(S,id)}));
  const top=Math.max(1,...rows.map(r=>r.score));
  rows.forEach(r=>{r.rel=r.score/top;r.fit=(r.score>=top*.85&&r.score>=3)?2:r.score>=top*.45?1:0;r.lv=(S.lean&&S.lean[r.id])||0;});
  return rows.sort((a,b)=>b.score-a.score);
}
function fitOf(S,id){const r=leanings(S).find(x=>x.id===id);return r?r.fit:0;}
const FIT_WORD=['Against the grain','Possible','A natural fit'];

/* the effects of the chosen path. A path your history supports pays a little more. */
function pathFx(S){
  const P=PATHS[S.path];if(!P)return null;
  const f=Object.assign({},P.fx),bonus=[.95,1,1.1][S.pathFit==null?1:S.pathFit];
  f.e=(f.e||1)*bonus;return f;
}

/* deliberate cultivation: spend insight or cohesion to push your people along a path before the end */
function cultivateCost(S,id){
  const P=PATHS[id],lv=(S.lean&&S.lean[id])||0;
  const inc=P.cost==='coh'?cohPerSec(S):insightPerSec(S);
  return Math.max(1,Math.round(inc*80*(1+.7*lv)));
}
function cultivateState(S,id){
  if(S.era<11)return {ok:false,why:'Stage 12: '+ERAS[11].name};
  if(S.path)return {ok:false,why:'Already ascended'};
  const lv=(S.lean&&S.lean[id])||0;
  if(lv>=LEAN_MAX)return {ok:false,why:'As far as it goes',lv:lv};
  return {ok:true,cost:cultivateCost(S,id),res:PATHS[id].cost,lv:lv};
}
function cultivate(S,id){
  const st=cultivateState(S,id);if(!st.ok)return false;
  const key=st.res==='coh'?'coh':'ins';if(S[key]<st.cost)return false;
  S[key]-=st.cost;S.lean=S.lean||{};S.lean[id]=(S.lean[id]||0)+1;return true;
}

/* the ascension itself */
function canAscend(S){return !!S.won&&!S.path&&S.era===ERAS.length-1;}
function ascend(S,id){
  if(!PATHS[id]||S.path)return false;
  S.pathFit=fitOf(S,id);S.path=id;
  if(typeof lifeRecord==='function'&&S.life)lifeRecord(S,'milestone','Ascension: the '+S.name+' become '+PATHS[id].people+'.',{date:geoYa(S),big:1});
  return true;
}

const COLONY=[
 {id:'mars',n:'Mars',d:'Close, cold and red. A hard, fast start.',fx:[{buff:[1.4,60]}],t:'The first towns were glass domes on the red desert of Mars, and they grew from there.'},
 {id:'moons',n:'The ocean moons',d:'Warm seas under miles of ice. Slow and rich.',fx:[{ins:90}],t:'The first towns floated in dark oceans under the ice of the outer moons, lit by their own lamps.'},
 {id:'ark',n:'The Ark to another star',d:'A seed ship leaves the system. Its children will wait centuries.',fx:[{coh:110}],t:'A seed ship left for another star, and its children are still on the way.'}
];

const ENDINGS={
 cyborg:{title:'Flesh and steel',
  fit:'It was never one decision. Each implant was a small convenience, until the day nobody could say where the person ended and the tool began. They kept their faces, their names and their arguments, and gained everything else.',
  strain:'Your people took the implants with doubt, and some never forgave the surgeons. But the hands that held the star were stronger than any born hand, and in time the doubters wore the same steel.',
  end:'They go on as one family of many bodies, built partly by birth and partly by choice, and none of them is quite sure which part is which.'},
 machine:{title:'The long workshop',
  fit:'Their makers built bodies that did not tire, and then minds to run them. Skills passed from one body to the next as easily as a file. The old flesh was kept in museums, with affection and a little relief.',
  strain:'Your people did not want to become machines, but the work always needed doing and the machines did it better. Within a few generations the builders were what they had built.',
  end:'They keep building, repairing, and counting the stars, and they remember the people who made them.'},
 digital:{title:'The great computation',
  fit:'First one mind was copied, then ten thousand. The cities went quiet because the people no longer needed them. Inside the computing swarm around the star, they live in worlds of their own making, as many as they like, as fast as they like.',
  strain:'Not everyone wanted to cross over, and the first copies were frightened and strange. But the swarm was large and patient, and the ones who stayed behind slowly joined the ones who did not.',
  end:'Somewhere in the glow around the sun, a billion minds are thinking at once, and they are still arguing about whether they are the same people.'},
 genetic:{title:'Evolution on purpose',
  fit:'Your people did what nature never could and chose their own changes. Generation by generation they redesigned the body, the lungs, the mind, and the life span, faster than any species in the history of Earth. The family tree you carried out of the sea blossomed into a thousand kinds of people.',
  strain:'The first designs were clumsy and some were cruel, and your people argued fiercely over what was allowed. But the work went on, and the descendants were nothing like the ancestors, except in the oldest things.',
  end:'They are still changing, faster than anyone can write the history down.'},
 psionic:{title:'The quiet that hums',
  fit:'It began with a hush in the meditation halls. Then people stopped needing to speak. A thought passed along a row of strangers like a ripple on water, and the long loneliness of minds simply ended. Their machines still hum around the star, but the people have turned inward, to where the real work is.',
  strain:'Your people came to the mind late and by an unexpected road. The first of them to hear the others thought they were going mad. Then the madness spread, and turned out to be a kind of peace.',
  end:'They sit in the light of a star they own and hardly look at it. They are listening to each other.'},
 natural:{title:'The unchanged',
  fit:'They had every power in the sky, and chose to stay as they were. Their cities are full of old faces, and old songs, and children who learn to walk the way their ancestors did. They carry the sea in their blood, and do not apologize for it.',
  strain:'Your people took the long way around to the same answer: they were already enough. They kept the tools, kept the stars, and refused the rest.',
  end:'Of all the shapes that life took on this long road, theirs is the one that came all the way from the first cell without changing its mind.'}
};

/* the story shown at the end, built from the path, how well it fits, the first colony and the character of your people */
function epilogueText(S){
  const E=ENDINGS[S.path];if(!E)return null;
  const P=PATHS[S.path],ch=typeof character==='function'?character(S):{adj:[],marks:[]},fit=S.pathFit==null?1:S.pathFit;
  const colony=COLONY.find(c=>c.id===S.dest);
  let body=fit===0?E.strain:E.fit;
  let extra='';
  if(colony)extra+=' '+colony.t;
  if(ch.adj.length)extra+=' They were remembered as a '+ch.adj.join(' and ')+' people.';
  if(ch.marks.length)extra+=' History called them '+ch.marks.join(', ')+'.';
  return {title:E.title,kicker:'Ascension · '+P.n,body:body+extra,end:E.end,fit:fit};
}

/* What a path gives you once you have taken it: three upgrades each, shown on the portrait. */
const PERKS={
 cyborg:[['Neural Lace','A mesh under the skin joins every mind to the network.',{i:1.2,t:1.5}],['Exo-Limbs','Extra arms and legs for work no body could do.',{e:1.2,g:.9}],['Hive-Link','Every implant shares what it senses.',{c:1.2,e:1.2}]],
 machine:[['Self-Repair','Bodies mend themselves from raw metal.',{bad:.8,e:1.1}],['Fabricator Bodies','Every person can build the next one.',{g:.8}],['Machine Collective','Millions of bodies, one purpose.',{e:1.35}]],
 digital:[['Mind Copies','One person can work in a hundred places at once.',{i:1.3}],['Accelerated Time','A day of thought passes in a second.',{e:1.2,i:1.2}],['Substrate Worlds','Whole worlds are built in the swarm.',{gain:1.4,i:1.3}]],
 genetic:[['Designer Genome','Every child begins from a chosen design.',{e:1.15,adv:.9}],['Rapid Radiation','Many new kinds of people, tried at once.',{gain:1.3,e:1.1}],['Living Worlds','Planets grown, not built.',{e:1.3,bad:.85}]],
 psionic:[['Shared Dreams','Sleep becomes a place everyone visits.',{c:1.3}],['Distant Sight','A mind that sees what its eyes cannot.',{i:1.3,luck:.1}],['One Mind','Many people, one thought.',{c:1.5,e:1.2}]],
 natural:[['Elder Wisdom','The old are heard, and the young listen.',{c:1.2,bad:.85}],['Gardens of Home','Every world carries a piece of the first one.',{e:1.2,gain:1.2}],['Unbroken Line','A thousand generations, unchanged.',{e:1.3,bad:.8}]]
};
for(const id in PERKS)PERKS[id]=PERKS[id].map((p,i)=>({id:id+(i+1),path:id,tier:i,n:p[0],d:p[1],fx:p[2]}));
function perkList(S){return S.path?PERKS[S.path]:[];}
function perkFx(S){
  if(!S.perks||!S.path)return null;const f={};
  PERKS[S.path].forEach(p=>{if(S.perks[p.id])for(const k in p.fx){if(k==='luck')f.luck=(f.luck||0)+p.fx[k];else f[k]=(f[k]||1)*p.fx[k];}});
  return f;
}
function perkState(S,p){
  if(S.perks&&S.perks[p.id])return {ok:false,st:'owned'};
  if(p.tier>0&&!(S.perks&&S.perks[p.path+p.tier]))return {ok:false,st:'locked',why:'Needs the step before it'};
  const res=PATHS[p.path].cost==='coh'?'coh':'ins',inc=res==='coh'?cohPerSec(S):insightPerSec(S);
  return {ok:true,st:'ok',res:res,cost:Math.max(1,Math.round(inc*(160+140*p.tier)))};
}
function buyPerk(S,id){
  const p=perkList(S).find(x=>x.id===id);if(!p)return false;
  const st=perkState(S,p);if(!st.ok||S[st.res]<st.cost)return false;
  S[st.res]-=st.cost;S.perks=S.perks||{};S.perks[id]=true;return true;
}
