/* Deep Time: history. The fossil record, the phylogenetic tree layout, what your lineage became,
   the end-of-run summary, and the "ride out the ages" ending. No DOM access. */
const FOSSIL_KINDS={species:'New species',branch:'Divergence',radiation:'Radiation',extinction:'Extinction',catastrophe:'Catastrophe',adaptation:'Adaptation',
 mutation:'Mutation',biome:'New habitat',milestone:'Milestone',predator:'Arms race',survival:'Survival'};
function lifeRecord(S,kind,txt,o){
  const L=S.life;if(!L)return;o=o||{};
  L.fos.push({ya:o.date!=null?o.date:geoYa(S),k:kind,x:txt,sp:o.sp||0,big:o.big?1:0});
  if(L.fos.length>320){const i=L.fos.findIndex(f=>!f.big&&f.k!=='milestone');L.fos.splice(i<0?0:i,1);}
}
/* ---------- the tree ---------- */
function treeLayout(S){
  const L=S.life,ev=[];
  L.sp.forEach(sp=>{ev.push({ya:sp.b,t:0,sp:sp});if(sp.st==='extinct'&&sp.d!=null)ev.push({ya:sp.d,t:1,sp:sp});});
  ev.sort((a,b)=>b.ya-a.ya||a.t-b.t||a.sp.id-b.sp.id);
  const used={};let maxLane=0;const span={};
  ev.forEach((e,i)=>{
    const sp=e.sp;
    if(e.t===0){
      let ln=0;
      if(sp.v||sp.k==='branch'){ln=1;while(used[ln])ln++;used[ln]=sp.id;}
      maxLane=Math.max(maxLane,ln);span[sp.id]={lane:ln,r0:i,r1:null};
    }else{const s=span[sp.id];if(s){s.r1=i;if(s.lane>0)delete used[s.lane];}}
    e.i=i;
  });
  // the main line continues across ancestors: free lane 0 stays occupied
  return {rows:ev,span:span,lanes:maxLane+1};
}
/* ---------- what your lineage became ---------- */
const OUTCOME_TEXT={
 marine:['Dominant Marine Predators','Your descendants rule the water, hunting everything that swims.'],
 megaherb:['Massive Herbivores','Your line grew huge and green-eating, shaping whole landscapes by sheer weight.'],
 smalldiv:['A Swarm of Small Animals','Your lineage spread into a thousand small niches, too many to count.'],
 flyers:['Flying Specialists','Your descendants took to the air and never came back down.'],
 extremo:['Extreme-Environment Specialists','You thrive in places that would kill nearly anything else.'],
 terrapex:['Apex Terrestrial Predators','On land, nothing hunts your descendants.'],
 social:['Social Organisms','Your lineage found its strength in groups.'],
 intel:['Thinking, Building People','Your descendants learned to think, to make and to remember.'],
 fossil:['Living Fossils','Little changed, and unbroken through disaster after disaster. A survivor is a success.'],
 engineer:['Ecosystem Engineers','Your descendants rebuild their surroundings to suit them.'],
 general:['Incredibly Successful Generalists','No single trick, but a place in nearly every habitat.']
};
function outcomes(S){
  const L=S.life,P=profOf(S),alive=aliveSp(S),br=aliveBranches(S),e=S.era,nb=Object.keys(L.colonized).length,g=Object.keys(L.genome).length;
  const flyers=br.filter(s=>s.pr.fly>.5).length,small=alive.filter(s=>s.pr.size<0).length;
  const sc={
   marine:P.aq*P.carn*(1.2+Math.max(0,P.size))*(e<=3?1:.4),
   megaherb:P.herb*(Math.max(0,P.size)+.3)*(1-P.aq)*1.3,
   smalldiv:Math.min(1.4,alive.length/7)*(P.size<0?1.1:.55),
   flyers:P.fly*1.2+flyers*.25,
   extremo:P.ext*1.3+br.filter(s=>s.pr.ext>.5).length*.2,
   terrapex:(1-P.aq)*P.carn*(.9+Math.max(0,P.size))*(e>=3?1:0),
   social:P.social*1.1+br.filter(s=>s.pr.social>.5).length*.15,
   intel:e>=6?1.6:e===5?.5+P.brain*.5:P.brain*.9,
   fossil:(L.stats.massSurv>=2&&g<=3)?.4+.2*L.stats.massSurv-.1*g:0,
   engineer:e>=6?.9:P.burrow*P.social*1.4+P.herb*Math.max(0,P.size)*.4*P.social,
   general:P.tol*1.1*Math.min(1,nb/5)+(g<=4?.1:0)
  };
  return Object.keys(sc).map(k=>({id:k,n:OUTCOME_TEXT[k][0],d:OUTCOME_TEXT[k][1],s:sc[k]})).sort((a,b)=>b.s-a.s);
}
function historyStats(S){
  const L=S.life,alive=aliveSp(S),chain=L.sp.filter(s=>s.k==='main'||s.st==='ancestor').sort((a,b)=>b.b-a.b);
  const preds=L.eco.rv.filter(r=>r.role==='predator'),first=L.sp[0];
  return {
    from:first?first.b:YA0[0],to:geoYa(S),
    total:L.sp.length,extinct:L.sp.filter(s=>s.st==='extinct').length,alive:alive.length,
    branches:L.sp.filter(s=>s.k==='branch'||s.v).length,
    adaptations:Object.keys(L.genome).map(a=>OPTS[L.genome[a]]).filter(Boolean).map(o=>o.n),
    biomes:Object.keys(L.colonized).map(b=>BIO[b]?BIO[b].n:b),
    mass:L.stats.mass,massSurv:L.stats.massSurv,ms:L.stats.ms,
    ancestors:chain.slice(0,12),mutations:L.mut.map(m=>({d:MUTD[m.id],rev:m.rev})).filter(m=>m.d),
    predators:preds,final:alive,
    firsts:L.fos.filter(f=>f.k==='adaptation'||f.k==='biome'||f.k==='milestone'||f.k==='radiation'||f.k==='survival'),
    outcome:outcomes(S)
  };
}
/* ---------- ride out the ages ---------- */
/* Let the lineage run on its own to the present day. Works on a copy and returns it. */
function rideOut(S){
  const C=JSON.parse(JSON.stringify(S)),L=C.life;L.q=[];
  C.energy=Math.max(C.energy,1);
  let guard=0;
  while(guard++<4000){
    lifeStep(C,2);
    if(L.p>=1){
      if(C.era>=5)break;
      C.era++;lifeOnEvolve(C,true);
    }
  }
  C.era=Math.min(C.era,5);L.p=1;
  const alive=aliveSp(C),m=mainSp(C);
  lifeRecord(C,'milestone','The present day. '+alive.length+(alive.length===1?' species of your lineage survives':' species of your lineage survive')+', among them the '+(m?m.n:'unknown')+'.',{date:0,big:1});
  L.ended='ride';L.q=[];
  return C;
}
