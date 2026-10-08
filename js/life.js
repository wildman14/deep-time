/* Deep Time: life. Glues the Earth, genome, ecosystem, species, events and history together.
   Owns S.life (the saved state of all the new systems), the per-tick simulation, and the hooks engine.js calls.
   No DOM access. */
const LIFE_V=1;
function lifeNew(){
  const seed=(Math.random()*4294967296)>>>0;
  return {v:LIFE_V,p:0,lastTot:0,sub:0,e6:0,ver:1,genome:{},mut:[],mo:null,mt:100,bias:null,biome:'vent',colonized:{vent:1},sp:[],main:0,
    eco:ecoNew(),acc:{},ev:[],done:{},om:[],nextEv:80,quiet:0,fos:[],q:[],ch:1,rec:1,surge:1,fit:1,
    stats:{ext:0,mass:0,massSurv:0,ms:{intact:0,handoff:0,bottleneck:0},ev:0},rs:seed,seed:seed,ended:null,legacy:0,vo:[]};
}
/* Make sure S.life exists and has every field. Old saves from before this update get sensible defaults. */
function lifeInit(S){
  const T=lifeNew();
  if(!S.life||typeof S.life!=='object'){S.life=T;S.life.legacy=S.era>0||S.total>0?1:0;}
  const L=S.life;
  for(const k in T)if(L[k]===undefined||L[k]===null)L[k]=T[k];
  ['genome','colonized','done','acc'].forEach(k=>{if(typeof L[k]!=='object')L[k]=T[k];});
  ['mut','sp','ev','om','fos','q','vo'].forEach(k=>{if(!Array.isArray(L[k]))L[k]=T[k];});
  L.stats=Object.assign(T.stats,L.stats);L.stats.ms=Object.assign({intact:0,handoff:0,bottleneck:0},L.stats.ms||{});
  if(!L.eco||typeof L.eco.prey!=='number')L.eco=ecoNew();if(!Array.isArray(L.eco.rv))L.eco.rv=[];
  L.p=clamp(+L.p||0,0,1);L.fit=+L.fit||1;L.rec=clamp(+L.rec||1,.2,1);L.surge=Math.max(1,+L.surge||1);
  L.q=[];L.ver++;
  if(!BIO[L.biome]||(S.era>0&&!biomeExists(L.biome,YA0[S.era])))L.biome=DEFAULT_BIOME[Math.min(S.era,10)];
  if(L.legacy&&!L.sp.length){
    // a run that began before this update: give it a founder, a place in the tree, and a starting history
    L.p=.5;L.lastTot=S.total;L.biome=DEFAULT_BIOME[Math.min(S.era,10)];L.colonized={};L.colonized[L.biome]=1;
    for(let e=0;e<=S.era;e++)L.fos.push({ya:YA0[e],k:'milestone',x:e===0?'The first cell of the '+S.name+' lineage divides.':'The lineage enters the age of '+ERAS[e].name.toLowerCase()+'.',sp:0,big:0});
    const sp=newSp(S,{n:S.name,k:'main',bi:L.biome,pop:.9,b:YA0[S.era]});L.main=sp.id;L.fos.reverse();L.fos.sort((a,b)=>b.ya-a.ya);
  }else if(!L.sp.length){lifeFound(S);}
  if(!mainSp(S)&&L.sp.length){const a=L.sp.filter(s=>s.st==='alive');if(a.length)L.main=a[0].id;else{const sp=newSp(S,{k:'main',bi:L.biome,pop:.5});L.main=sp.id;}}
  L.legacy=0;earthRefresh(S);L.fit=mainFit(S).env;
  return L;
}
/* The very first species. Called when the player names it, and safe to call again. */
function lifeFound(S){
  const L=S.life;
  if(!L.sp.length){
    const sp=newSp(S,{n:S.name,k:'main',bi:L.biome,pop:.9,b:YA0[0]});L.main=sp.id;
    lifeRecord(S,'milestone','The first cell of the '+S.name+' lineage divides in a warm sea.',{date:YA0[0],big:1});
  }else if(L.sp.length===1&&L.sp[0].b===YA0[0]){L.sp[0].n=L.sp[0].o=S.name;L.fos.forEach(f=>{if(f.k==='milestone'&&f.ya===YA0[0])f.x='The first cell of the '+S.name+' lineage divides in a warm sea.';});}
}
function lifeRename(S,id,name){
  const sp=spById(S,id);name=(name||'').trim().slice(0,28);if(!sp||!name)return false;
  const old=sp.n;L_renameText(S,old,name);sp.n=name;return true;
}
function L_renameText(S,from,to){S.life.fos.forEach(f=>{if(f.x.indexOf(from)>=0)f.x=f.x.split(from).join(to);});S.log.forEach(l=>{if(l.x.indexOf(from)>=0)l.x=l.x.split(from).join(to);});}

/* ---------- the clock ---------- */
function lifeClock(S,dt,virtual){
  const L=S.life;
  let dp=dt/ERA_SECS[S.era];
  if(!virtual){const cost=advCost(S.era)*MONEY_SC,dTot=Math.max(0,S.total-L.lastTot);L.lastTot=S.total;dp=Math.min(Math.max(dp,dTot/cost),dt*.04);}
  L.p=Math.min(1,L.p+dp);
}
const REVEAL={cold:'in the cold',hot:'in the heat',lowO2:'as the air thinned',dry:'through the drought',dark:'in the dark',volc:'in the fallout',famine:'through the famine',extinction:'when the world was dying'};
function lifeSim(S,dt){
  const L=S.life;L.sub+=dt;L.quiet=Math.max(0,L.quiet-dt);
  let guard=0;
  while(L.sub>=.25&&guard++<64){
    L.sub-=.25;const h=.25;
    const E=earthRefresh(S);
    eventStep(S,h);
    const P=profOf(S),tau=40/(1+.5*P.r+.4*P.tol),k=1-Math.exp(-h/tau);
    ['temp','o2','sea','co2','anox','dry','volc'].forEach(key=>{L.acc[key]=(L.acc[key]||0)+((E.ev[key]||0)-(L.acc[key]||0))*k;});
    const f=mainFit(S).env;L.fit+=(f-L.fit)*.2;
    L.rec=Math.min(1,L.rec+.0065*h);L.surge=1+(L.surge-1)*Math.exp(-h/90);
    L.mut.forEach(m=>{if(m.rev)return;const d=MUTD[m.id];if(d&&d.cond&&condMet(d.cond,E)){m.rev=1;
      lifeRecord(S,'mutation','The '+spName(S,L.main)+' discover what their '+d.n.toLowerCase()+' is for: it matters '+REVEAL[d.cond]+'.',{});L.q.push({t:'reveal',m:d,cond:REVEAL[d.cond]});}});
    L.e6+=h;
    if(L.e6>=6){L.e6=0;
      ecoStep(S).forEach(n=>{
        if(n.k==='rival'){if(n.r.role==='predator'){lifeRecord(S,'predator',n.x,{});L.q.push({t:'note',x:n.x});}}
        else if(n.k==='rivalx'){if(n.r.role==='predator')lifeRecord(S,'predator',n.x,{});}
        else if(n.k==='arms'){if(L.armsE!==S.era){L.armsE=S.era;lifeRecord(S,'predator',n.x,{});L.q.push({t:'note',x:n.x});}}
      });
      branchStep(S).forEach(n=>{
        if(n.k==='extinct'){lifeRecord(S,'extinction','The '+n.sp.n+' die out. '+n.sp.why,{sp:n.sp.id});L.q.push({t:'note',x:'The '+n.sp.n+' have died out.'});}
        else if(n.k==='speciate'){lifeRecord(S,'branch','The '+n.from.n+' flourish and a new species, the '+n.sp.n+', splits off.',{sp:n.sp.id});L.q.push({t:'note',x:'A new branch: the '+n.sp.n+'.'});}
      });
      L.ver++; // diversity bonus may have changed
    }
    L.mt-=h;
    if(L.mt<=0&&!L.mo&&S.era<=5&&L.mut.length<10){L.mo={ids:mutationOffer(S)};L.mt=110+Math.random()*70;if(L.mo.ids.length)L.q.push({t:'note',x:'A mutation has appeared in your lineage. See the Lineage tab.',mut:1});else L.mo=null;}
    else if(L.mt<=0&&L.mo)L.mt=30;
  }
}
function lifeStep(S,dt){lifeClock(S,dt,true);lifeSim(S,dt);}
function lifeTick(S,dt){const L=S.life;if(!L||L.ended)return;lifeClock(S,dt,false);lifeSim(S,dt);}

/* ---------- stage change ---------- */
function lifeOnEvolve(S,virtual){
  const L=S.life;if(!L)return;
  L.p=0;L.lastTot=S.total;L.ch++;L.ver++;
  const prev=mainSp(S),oldBiome=L.biome;
  const moved=oldBiome!==DEFAULT_BIOME[Math.min(S.era-1,10)];
  if(!moved||!biomeExists(L.biome,YA0[S.era])||S.era>5||!biomeReach(S,L.biome,profOf(S)).ok){L.biome=DEFAULT_BIOME[Math.min(S.era,10)];if(L.biome!==oldBiome)L.colonized[L.biome]=1;}
  const sp=speciateMain(S,'');
  if(prev){prev.why='Gave rise to the '+sp.n+'.';}
  lifeRecord(S,'milestone','The lineage enters the age of '+ERAS[S.era].name.toLowerCase()+'.',{big:1});
  lifeRecord(S,'species','The '+sp.n+' appear, descended from the '+(prev?prev.n:'first cell')+'.',{sp:sp.id});
  if(!virtual)L.q.push({t:'note',x:'A new species of your lineage: the '+sp.n+'.'});
}
/* ---------- mutations ---------- */
function mutationOffer(S){
  const L=S.life,have={};L.mut.forEach(m=>{have[m.id]=1;});
  const pool=MUTS.filter(m=>!have[m.id]&&m.min<=S.era);
  const w=m=>m.kind==='situational'?2:1,out=[];
  while(out.length<3&&pool.length){
    let r=Math.random()*pool.reduce((a,m)=>a+w(m),0),i=0;for(;i<pool.length-1;i++){r-=w(pool[i]);if(r<=0)break;}
    out.push(pool.splice(i,1)[0].id);
  }
  return out;
}
function takeMutation(S,id){
  const L=S.life;if(!L.mo||L.mo.ids.indexOf(id)<0||L.mut.length>=10)return false;
  const d=MUTD[id];L.mut.push({id:id,rev:0});L.mo=null;L.ver++;
  lifeRecord(S,'mutation','A mutation arises among the '+spName(S,L.main)+': '+d.f.toLowerCase().replace(/\.$/,'')+'.',{});
  return true;
}
function skipMutation(S){const L=S.life;if(!L.mo)return false;L.mo=null;return true;}
/* ---------- choices ---------- */
const FIRSTS={armor:'First armored descendant appears.',venom:'First venomous descendant appears.',camo:'The first well-camouflaged descendants appear.',speed:'The first fast-moving descendants appear.',
 burrow:'The first burrowing descendants appear.',glide:'The first gliding descendants leave the ground.',wings:'The first true flyers take to the air.',eyes:'The first keen-eyed descendants appear.',
 large:'The first giant descendants appear.',small:'A line of tiny, fast-breeding descendants appears.',pred:'The first dedicated predators appear in the family.',herb:'The first dedicated plant-eaters appear in the family.',
 filter:'The first filter feeders appear in the family.',omni:'The first omnivores appear in the family.',brain:'The first large-brained descendants appear.',social:'The first social groups form.',
 terrestrial:'The first fully terrestrial descendants appear.',aquatic:'A water-bound specialist line appears.',endo:'The first warm-blooded descendants appear.',ecto:'A cold-blooded, energy-thrifty line appears.',
 extreme:'The first extreme-environment specialists appear.',general:'A line of broad generalists appears.',fast:'A fast-breeding line appears.',care:'Parental care evolves in the family.',chem:'The first sensing chemistry evolves.',echo:'The first descendants that hear in the dark appear.'};
function lifeBuyOpt(S,id){
  const r=buyOpt(S,id);if(!r)return false;
  const o=OPTS[id];lifeRecord(S,'adaptation',(FIRSTS[id]||'A major adaptation appears: '+o.n+'.')+' ('+spName(S,S.life.main)+')',{sp:S.life.main});
  const sp=mainSp(S);if(sp){sp.pr=Object.assign({},sp.pr);const P=profOf(S);PKEYS.forEach(k=>{sp.pr[k]=Math.round(P[k]*100)/100;});}
  return r;
}
function migCost(S){return Math.round(advCostFor(S)*.04*(1+.15*Object.keys(S.life.colonized).length));}
function migOdds(S){const P=profOf(S);return clamp(.62+.12*P.fast+.08*P.tol+.05*Math.max(0,P.size)+.08*P.fly+.06*P.social-(BIO[S.life.biome].kind===BIO.shallow.kind?0:0),.35,.95);}
function lifeMigrate(S,id){
  const L=S.life,P=profOf(S),b=BIO[id],r=biomeReach(S,id,P);
  if(!b||!r.ok||id===L.biome||S.era>5)return null;
  const cost=migCost(S);if(S.energy<cost)return null;
  S.energy-=cost;const first=!L.colonized[id],ok=Math.random()<migOdds(S),m=mods(S);
  if(!ok){const loss=S.energy*.12*m.bad;S.energy-=loss;return {ok:false,first:first,text:'The crossing to the '+b.n.toLowerCase()+' failed. Many died on the way, and you stayed where you were.'};}
  L.biome=id;L.colonized[id]=1;const sp=mainSp(S);if(sp)sp.bi=id;L.ver++;
  if(first){L.ch++;L.surge=Math.max(L.surge,1.15);lifeRecord(S,'biome','The '+spName(S,L.main)+' colonize the '+b.n.toLowerCase()+' for the first time.',{big:1,sp:L.main});}
  else lifeRecord(S,'biome','The '+spName(S,L.main)+' return to the '+b.n.toLowerCase()+'.',{sp:L.main});
  return {ok:true,first:first,text:first?'The '+b.n.toLowerCase()+' are new to your lineage. The first arrivals find empty niches and no one who knows them.':'You are back in the '+b.n.toLowerCase()+'.'};
}
function lifeDiverge(S,vid,biome){
  const sp=branchOff(S,vid,biome,false,false);if(!sp)return null;S.life.ver++;return sp;
}
/* ---------- numbers the economy reads ---------- */
let FXC=null;
function lifeFx(S){
  const L=S.life;if(!L)return null;
  const key=L.ver+'|'+S.era+'|'+Math.round(L.fit*200)+'|'+Math.round(L.rec*40)+'|'+Math.round(L.surge*40);
  if(FXC&&FXC.S===S&&FXC.key===key)return FXC.fx;
  const fx=genomeFx(S);
  fx.e=(fx.e||1)*L.fit*(.4+.6*L.rec)*L.surge*(1+diversityBonus(S));
  FXC={S:S,key:key,fx:fx};return fx;
}
/* ---------- how it looks ---------- */
function hueOf(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))%360;return h;}
function lifeVisual(S){
  const L=S.life,P=profOf(S),m=mainSp(S),has=id=>L.mut.some(x=>x.id===id);
  const hue=(m?hueOf(m.o||m.n):0)%70-35+(has('pigment')?50:0);
  return {sz:clamp(1+.2*P.size,.8,1.3),hue:hue,
   armor:P.armor>.45?1:0,horn:(P.size>.5||(P.herb>.5&&P.size>.1))?1:0,spikes:(P.venom>.45||has('bristles'))?1:0,
   eyes:P.sense>.75?2:P.sense>.3?1:0,jaws:P.carn>.55?1:0,claws:(P.burrow>.4||P.carn>.75)?1:0,fins:P.fast>.5?1:0,
   wing:P.fly>.5?(P.fly>.9?2:1):0,fur:P.endo>.5?1:0,camo:P.camo>.45?1:0,venom:P.venom>.45?1:0,
   stocky:P.size>.3?1:0,slim:(P.fast>.5||P.size<-.4)?1:0,spots:has('markings')?1:0,filt:P.filt>.6?1:0,burrow:P.burrow>.4?1:0,brain:P.brain>.5?1:0,social:P.social>.5?1:0};
}
let LVC=null;
function lifeLook(S){
  const L=S.life;if(!L)return {};
  const E=earthNow(S);
  if(!LVC||LVC.S!==S||LVC.v!==L.ver||LVC.e!==S.era)LVC={S:S,v:L.ver,e:S.era,gn:lifeVisual(S)};
  return {gn:LVC.gn,env:E.vis,biome:L.biome,ya:E.ya};
}
