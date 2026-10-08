/* Deep Time: ecosystem. The rest of life, as a handful of populations instead of thousands of animals.
   Four guilds (producers feed prey, prey feed predators, competitors share your food) and a few named rivals.
   Predators and prey drive each other into an arms race. No DOM access. */
const RIVALS={
0:[['wandering microbe','competitor',['generalist']],['grazing protist','predator',['predator']],['viral swarm','predator',['small']]],
1:[['sponge','competitor',['filter']],['drifting jelly','predator',['venom']],['soft-bodied worm','prey',['burrow']]],
2:[['trilobite','prey',['armor']],['sea scorpion','predator',['predator','large']],['armored placoderm','predator',['armor','predator']],['shelled nautiloid','competitor',['armor']],['jawless filter fish','competitor',['filter']]],
3:[['giant amphibian','predator',['predator','large']],['armored millipede','prey',['small','terrestrial']],['lungfish','competitor',['aquatic']],['early reptile','competitor',['terrestrial']],['giant dragonfly','predator',['flight','predator']]],
4:[['raptor dinosaur','predator',['predator','swift']],['pterosaur','predator',['flight']],['small reptile','prey',['small']],['insect swarm','prey',['small','flight']],['rival mammal','competitor',['generalist']]],
5:[['sabre-toothed cat','predator',['predator','large']],['giant sloth','prey',['large','herb']],['terror bird','predator',['swift']],['rodent horde','competitor',['small']]]};
const ROLE_WORD={predator:'predator',prey:'prey',competitor:'rival'};
function ecoNew(){return {prey:1,pred:.3,comp:.3,def:.2,atk:.2,rv:[]};}
function ecoAlive(eco){return eco.rv.filter(r=>r.st==='alive');}
function ecoSpawn(S,role){
  const L=S.life,eco=L.eco,e=Math.min(S.era,5),pool=(RIVALS[e]||[]).filter(r=>(!role||r[1]===role)&&!eco.rv.some(x=>x.st==='alive'&&x.taxon===r[0]));
  if(!pool.length)return null;
  const t=pool[Math.floor(Math.random()*pool.length)];
  const r={id:eco.rv.length+1,n:makeName(S,{tags:t[2],era:e,biome:L.biome}),taxon:t[0],role:t[1],ab:.4,edge:.3+Math.random()*.2,st:'alive',ya:geoYa(S)};
  eco.rv.push(r);return r;
}
/* One ecosystem step (about six seconds). Returns short notes for the log. */
function ecoStep(S){
  const L=S.life,eco=L.eco,e=S.era,notes=[];
  if(!ECO_W[e])return notes;
  const E=earthNow(S),b=BIO[L.biome]||BIO.shallow,prod=foodIndex(E,b.kind)*b.food,j=()=>(Math.random()-.5)*.012;
  eco.prey=clamp(eco.prey+.10*eco.prey*(prod-.8*eco.prey)-.08*eco.pred*eco.prey*(1-eco.def)+j(),.05,1.6);
  eco.pred=clamp(eco.pred+.07*eco.pred*(eco.prey*(.6+eco.atk)-.7)+j(),.03,1.6);
  eco.comp=clamp(eco.comp+.05*eco.comp*(prod*.9-eco.comp)+.004+j(),.03,1.5);
  const d0=eco.def,a0=eco.atk;
  if(eco.pred>.5&&eco.def<.9&&Math.random()<.07)eco.def=Math.min(.9,eco.def+.04);
  if(eco.def>eco.atk+.08&&eco.atk<.9&&Math.random()<.07)eco.atk=Math.min(.9,eco.atk+.04);
  if(Math.floor(eco.def*5)>Math.floor(d0*5)){notes.push({k:'arms',x:'Prey in the '+b.n.toLowerCase()+' have evolved sturdier defenses.'});}
  if(Math.floor(eco.atk*5)>Math.floor(a0*5)){notes.push({k:'arms',x:'Predators are getting faster and sharper. Defense matters more now.'});}
  ecoAlive(eco).forEach(r=>{
    const tgt=r.role==='predator'?eco.pred:r.role==='prey'?eco.prey:eco.comp;
    r.ab=clamp(r.ab+(tgt*.9-r.ab)*.1+j()*2,0,1.5);r.edge=clamp(r.edge+((r.role==='predator'?eco.atk:eco.def)-r.edge)*.01,0,1);
    if(r.ab<.1&&Math.random()<.25){r.st='extinct';r.dy=geoYa(S);notes.push({k:'rivalx',x:'The '+r.taxon+' '+r.n+' has disappeared from the '+b.n.toLowerCase()+'.',r:r});}
  });
  const n=ecoAlive(eco).length;
  if(n<5&&Math.random()<(n<3?.035:.012)){
    const r=ecoSpawn(S);if(r)notes.push({k:'rival',x:'A new '+ROLE_WORD[r.role]+' appears: the '+r.taxon+' '+r.n+'.',r:r});
  }
  return notes;
}
/* A catastrophe hits the web of life. sev 0..1. Rivals die, populations crash, niches open. */
function ecoShock(S,sev,d){
  const eco=S.life.eco;d=d||{};
  eco.prey=clamp(eco.prey*(1-sev*(d.prey!=null?d.prey:.6)),.05,1.6);
  eco.pred=clamp(eco.pred*(1-sev*(d.pred!=null?d.pred:.7)),.03,1.6);
  eco.comp=clamp(eco.comp*(1-sev*(d.comp!=null?d.comp:.5)),.03,1.5);
  eco.def*=1-.4*sev;eco.atk*=1-.4*sev;
  let killed=[];ecoAlive(eco).forEach(r=>{if(Math.random()<sev*(.9-.4*r.edge)){r.st='extinct';r.dy=geoYa(S);killed.push(r);}});
  return killed;
}
function ecoSummary(S){
  const eco=S.life.eco;
  const w=(x,a,b,c)=>x>1.0?a:x>.55?b:c;
  return {prey:w(eco.prey,'Teeming','Healthy','Thin'),pred:w(eco.pred,'Dangerous','Present','Rare'),comp:w(eco.comp,'Crowded','Some rivals','Few rivals'),arms:eco.def+eco.atk>1.1?'Fierce':eco.def+eco.atk>.7?'Escalating':'Early'};
}
