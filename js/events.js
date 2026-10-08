/* Deep Time: Earth events. Eruptions, ice ages, anoxia, impacts, and the great extinctions.
   Every event is a timeline: omens first, a peak that resolves who survives, then recovery.
   keys: [progress 0..1, changes]. Earth keys (temp o2 co2 sea volc veg anox dry) change the planet itself;
   the rest (dark haze red ice heat ash murk ext flash) only tint the scene. No DOM access. */
const VISK=['dark','haze','red','ice','heat','ash','murk','ext','flash'];
const EVDEFS=[
/* ---- anchored, historical: each fires once, at its place in deep time ---- */
{id:'gox',n:'The Great Oxidation',omen:'A strange tang in the water',big:1,era:0,date:2.4e9,dur:90,peak:.55,sev:.5,
 sel:{ext:.35,tol:.2,burrow:.1,size:-.1},bh:{vent:.15,shallow:-.1},eco:{prey:.5,pred:.5,comp:.6},
 keys:[[0,{}],[.4,{o2:3,co2:-600,temp:-4,murk:.4,haze:.2}],[.7,{o2:5,co2:-1200,temp:-6,murk:.5,ext:1}],[1,{}]],
 clues:[[.05,'The water tastes different. Something new is being breathed out.'],[.3,'Rust-colored bands form where the iron in the sea is running out.'],[.5,'Oxygen is accumulating, and to most of life it is a poison.']],
 ask:{at:.3,t:'Oxygen is building up around you. For most of the living world it is a toxin.'},
 res:'Oxygen poisoned much of the anaerobic world.'},
{id:'snowball',n:'Snowball Earth',omen:'The seas are cooling',big:1,era:0,date:7e8,dur:100,peak:.6,sev:.55,
 sel:{ext:.3,tol:.25,size:-.2,r:.15},bh:{vent:.2,shallow:-.15},eco:{prey:.6,pred:.6,comp:.5},
 keys:[[0,{}],[.3,{temp:-10,sea:-30,ice:.4,haze:.1}],[.6,{temp:-24,sea:-80,ice:1,dark:.15,ext:1}],[.85,{temp:-12,sea:-40,ice:.6}],[1,{}]],
 clues:[[.05,'Ice creeps down from the poles, further than ever before.'],[.3,'The shallows are freezing at the edges. Food is thinning.'],[.5,'Ice has reached the equator. The sea is a sheet of white.']],
 ask:{at:.3,t:'The ice is advancing and the seas are closing over.'},
 res:'Ice sealed the surface of the sea. Only refuges near warm vents and under thin ice kept life going.'},
{id:'ordovician',n:'The End-Ordovician Extinction',omen:'The seas are draining and cooling',big:1,era:2,date:4.45e8,dur:100,peak:.6,sev:.7,
 sel:{aq:-.18,filt:-.15,tol:.25,ext:.15,size:-.1},bh:{reef:-.15,shallow:-.12,open:.03,fresh:.1,river:.08},eco:{prey:.7,pred:.7,comp:.6},
 keys:[[0,{}],[.3,{temp:-3,sea:-60,ice:.3,haze:.1}],[.6,{temp:-7,sea:-150,anox:.2,ice:.7,murk:.2,ext:1}],[1,{}]],
 clues:[[.05,'The water is cooler than it has been for a long time.'],[.3,'Shallow seas are draining away and the warm shelves are narrowing.'],[.5,'Ice sheets are growing over the south. Reefs are dying in cold water.']],
 ask:{at:.3,t:'Glaciers are locking up the water and the shallow seas are draining away.'},
 res:'An ice age drained the shallow seas where most animals lived, then the sea warmed and lost its oxygen.'},
{id:'devonian',n:'The Late Devonian Extinction',omen:'Murky, airless water',big:1,era:3,date:3.72e8,dur:90,peak:.6,sev:.6,
 sel:{armor:-.15,aq:-.15,tol:.2,size:-.1,burrow:.1},bh:{reef:-.2,shallow:-.1,fresh:.05,forest:.0},eco:{prey:.6,pred:.65,comp:.55},
 keys:[[0,{}],[.4,{anox:.3,o2:-2,murk:.4}],[.65,{anox:.55,o2:-3,temp:2,murk:.6,ext:1}],[1,{}]],
 clues:[[.05,'Rivers are carrying a flood of silt and nutrients into the sea.'],[.3,'The water turns green and thick. Fish are gasping near the surface.'],[.5,'Dead zones are spreading across the shallow seas.']],
 ask:{at:.3,t:'The seas are turning green and stale, and the reefs are choking.'},
 res:'Oxygen-starved water spread across the seas and the great reefs collapsed.'},
{id:'carbon',n:'The Rainforest Collapse',omen:'The great swamps are drying',big:1,era:3,date:3.05e8,dur:80,peak:.55,sev:.45,
 sel:{aq:-.1,herb:-.2,tol:.15,size:-.1,burrow:.1},bh:{swamp:-.2,wetland:-.2,forest:-.15,desert:.05},eco:{prey:.5,pred:.4,comp:.4},
 keys:[[0,{}],[.4,{dry:.25,veg:-.2,o2:-3}],[.65,{dry:.4,veg:-.4,o2:-6,temp:2,ext:1}],[1,{}]],
 clues:[[.05,'The air is drier. The great swamps are shrinking.'],[.3,'The tallest trees are dying back in dry spells.'],[.5,'Forest has broken into scattered islands of green.']],
 ask:{at:.3,t:'The climate is drying and the great coal forests are breaking apart.'},
 res:'The coal forests fractured. Species tied to wet swamps lost ground to those that could live dry.'},
{id:'permian',n:'The End-Permian Extinction',omen:'Red skies and sour rain',big:1,era:3,date:2.52e8,dur:150,peak:.62,sev:.9,
 sel:{aq:-.2,tol:.25,ext:.2,size:-.2,burrow:.15,fly:-.1,endo:-.05},bh:{reef:-.2,shallow:-.12,open:-.1,forest:-.1,fresh:.04},eco:{prey:.8,pred:.85,comp:.8},
 keys:[[0,{}],[.2,{volc:.25,haze:.2,red:.1}],[.45,{volc:.55,temp:5,co2:1500,haze:.45,red:.4,ash:.3,dry:.15}],[.65,{volc:.7,temp:11,co2:3500,o2:-6,anox:.5,dry:.3,haze:.6,red:.5,ash:.3,heat:.5,ext:1}],[.85,{temp:6,co2:1500,anox:.3,heat:.3}],[1,{}]],
 clues:[[.05,'The ground trembles in the north. A glow shows behind the hills.'],[.22,'A haze hangs over the land and the rain tastes of acid.'],[.4,'The sky is red by day. The air is hot, and thin.'],[.55,'The sea is warm, stale and silent. Whole communities have vanished.']],
 ask:{at:.3,t:'Enormous eruptions are poisoning the air. Everything is getting hotter and thinner.'},
 res:'Flood basalts burned for hundreds of thousands of years. The seas lost their oxygen. The worst extinction in Earth history.'},
{id:'triassic',n:'The End-Triassic Extinction',omen:'The continents are splitting',big:1,era:3,date:2.03e8,dur:90,peak:.6,sev:.6,
 sel:{size:-.15,tol:.2,fly:.05,aq:-.1,armor:-.05},bh:{reef:-.15,shallow:-.08,forest:-.05},eco:{prey:.65,pred:.65,comp:.6},
 keys:[[0,{}],[.4,{volc:.3,temp:2,co2:700,haze:.2,red:.15}],[.65,{volc:.55,temp:5,co2:1800,anox:.3,haze:.35,red:.3,heat:.3,ext:1}],[1,{}]],
 clues:[[.05,'New rifts are opening where the great continent is tearing in two.'],[.3,'Fumes drift from the rift valleys. The sea is sour.'],[.5,'Many of the old reef builders and top predators are gone.']],
 ask:{at:.3,t:'A supercontinent is cracking open, and lava is pouring from the cracks.'},
 res:'As the continent split, flood basalts changed the air and the sea.'},
{id:'kpg',n:'The Chicxulub Impact',omen:'A new light in the sky',big:1,era:4,date:6.6e7,dur:120,peak:.55,sev:.75,
 sel:{size:-.35,burrow:.25,tol:.3,r:.2,carn:-.15,herb:-.1,aq:.1,endo:-.1},bh:{open:.03,forest:-.15,grass:-.05,fresh:.08,river:.06},eco:{prey:.8,pred:.9,comp:.7},
 keys:[[0,{}],[.2,{}],[.5,{flash:1,dark:.4,ash:.3}],[.6,{dark:1,ash:.7,temp:-4,veg:-.2,haze:.5,ext:1}],[.8,{dark:.7,temp:-8,veg:-.4,haze:.4,ash:.4}],[1,{}]],
 clues:[[.05,'A bright new star hangs in the evening sky and grows each night.'],[.2,'The star is a streak now, brighter than the moon.'],[.4,'The ground is shaking. Birds and insects have gone silent.'],[.58,'The sky has gone black. Ash falls like snow and the plants are dying.']],
 ask:{at:.25,t:'A burning object is growing in the sky, and it is coming this way.'},
 res:'An asteroid struck the Earth. Sunlight vanished for months, and the food chain collapsed.'},
{id:'toba',n:'The Toba Supereruption',omen:'Smoke on the horizon',big:1,era:5,date:7.4e4,dur:80,peak:.55,sev:.35,
 sel:{size:-.1,tol:.25,social:.15,brain:.1},bh:{grass:-.05},eco:{prey:.4,pred:.4,comp:.3},
 keys:[[0,{}],[.4,{volc:.4,haze:.2,ash:.2}],[.6,{volc:.7,dark:.6,ash:.8,temp:-5,haze:.5,ext:1}],[.85,{dark:.3,temp:-3,ash:.3}],[1,{}]],
 clues:[[.05,'A distant mountain smokes, and the smoke is spreading.'],[.3,'Gray ash drifts down on the savanna. Streams run cloudy.'],[.5,'The sun is a pale disc. The grass is dying under a gray blanket.']],
 ask:{at:.3,t:'A far volcano is erupting on a scale no one has seen.'},
 res:'A supervolcano blanketed half the world in ash. Human numbers fell to a few thousand.'},
/* ---- recurring: they come and go as the planet changes ---- */
{id:'eruption',n:'Volcanic eruption',omen:'Ash on the horizon',rec:1,era:[0,10],dur:40,peak:.55,sev:.12,w:1.2,
 sel:{tol:.15,ext:.15,burrow:.05},bh:{mount:-.05},eco:{prey:.15,pred:.15,comp:.1},
 keys:[[0,{}],[.4,{volc:.3,ash:.4,haze:.25,red:.15}],[.6,{volc:.4,ash:.7,haze:.4,temp:-1.5,dark:.2}],[1,{}]],
 clues:[[.1,'A column of smoke is rising in the distance.'],[.45,'Ash is falling, and the light has turned amber.']],res:'Ash fell across the land and the water.'},
{id:'warming',n:'Warming period',omen:'The water feels warmer',rec:1,era:[0,10],dur:80,peak:.5,sev:.1,w:1,
 sel:{tol:.15,size:-.1,endo:-.1,ext:.05},bh:{reef:-.1,tundra:-.1},eco:{},
 keys:[[0,{}],[.4,{temp:3,co2:250,heat:.25}],[.7,{temp:4.5,co2:350,heat:.4}],[1,{}]],
 clues:[[.1,'The days are warmer than anyone remembers.'],[.5,'The heat is settling in. Food that loved the cold is moving away.']],res:'A long warm spell shifted where life could thrive.'},
{id:'icehouse',n:'Ice age',omen:'Colder winters',rec:1,era:[0,7],dur:90,peak:.5,sev:.12,w:1,
 sel:{endo:.12,size:.05,tol:.15,ext:.05},bh:{tundra:.05,reef:-.1,shallow:-.05},eco:{},
 need:(S,E)=>E.temp<28,
 keys:[[0,{}],[.4,{temp:-4,sea:-30,ice:.3}],[.7,{temp:-6,sea:-60,ice:.6}],[1,{}]],
 clues:[[.1,'The winters are longer and the frost comes early.'],[.5,'Ice is spreading from the poles and the sea is falling.']],res:'The world cooled for a long age and the sea sank.'},
{id:'drought',n:'Long drought',omen:'The rains are failing',rec:1,era:[3,10],dur:70,peak:.5,sev:.1,w:1,
 sel:{burrow:.12,tol:.12,size:-.1,camo:.05},bh:{desert:.05,forest:-.08,wetland:-.12,grass:-.05},eco:{prey:.15},
 keys:[[0,{}],[.4,{dry:.3,veg:-.1}],[.7,{dry:.45,veg:-.15}],[1,{}]],
 clues:[[.1,'The rains came late this year.'],[.5,'Rivers have shrunk to chains of pools.']],res:'A drought shrank the green and dried out the pools.'},
{id:'oxyrise',n:'Oxygen surge',omen:'The air feels richer',rec:0,era:[1,5],dur:60,peak:.5,sev:0,w:.7,boon:1,
 keys:[[0,{}],[.5,{o2:4}],[1,{}]],clues:[[.2,'The air is rich and sweet. Everything is growing larger.']],res:'More oxygen let bodies grow larger and more active.'},
{id:'oxyfall',n:'Oxygen decline',omen:'The air feels thin',rec:1,era:[2,5],dur:70,peak:.5,sev:.1,w:.8,
 sel:{size:-.15,endo:-.12,fly:-.12,tol:.1},bh:{},eco:{},
 keys:[[0,{}],[.5,{o2:-4.5}],[1,{}]],clues:[[.15,'Breathing takes more effort than it used to.']],res:'Falling oxygen punished the large and the very active.'},
{id:'anoxia',n:'Ocean anoxia',omen:'Dead water in the deep',rec:1,era:[0,5],dur:70,peak:.5,sev:.13,w:.9,
 sel:{aq:-.15,tol:.1,ext:.1,burrow:.1},bh:{open:-.1,shallow:-.06,reef:-.06,fresh:.05},eco:{prey:.2,pred:.2},
 keys:[[0,{}],[.4,{anox:.3,murk:.3}],[.65,{anox:.45,murk:.4}],[1,{}]],
 clues:[[.1,'The deep water smells of rot.'],[.45,'Fish are crowding into the shallows, gasping.']],res:'Stagnant, airless water spread through the seas.'},
{id:'sealow',n:'Falling seas',omen:'The shoreline is retreating',rec:1,era:[0,5],dur:80,peak:.5,sev:.09,w:.8,
 sel:{aq:-.1,tol:.12,fast:.05},bh:{shallow:-.12,tidal:-.1,reef:-.1,shore:-.04},eco:{},
 keys:[[0,{}],[.5,{sea:-70}],[1,{}]],clues:[[.15,'The tide line is further out every season.']],res:'The sea fell and left shallow habitats high and dry.'},
{id:'searise',n:'Rising seas',omen:'The tides run higher',rec:0,era:[0,5],dur:80,peak:.5,sev:0,w:.8,boon:1,
 keys:[[0,{}],[.5,{sea:90}],[1,{}]],clues:[[.15,'The tides creep higher up the shore.']],res:'Shallow seas spread over the land, opening new habitat.'},
{id:'bloom',n:'Habitat expansion',omen:'A flush of green',rec:0,era:[0,5],dur:60,peak:.5,sev:0,w:.7,boon:1,
 keys:[[0,{}],[.5,{veg:.15,anox:-.1}],[1,{}]],clues:[[.15,'New growth is spreading where there was bare ground.']],res:'New ground opened up and life spread into it.'},
{id:'reefdie',n:'Reef collapse',omen:'Bleached and brittle reefs',rec:1,era:[2,5],dur:60,peak:.5,sev:.1,w:.6,
 need:(S,E)=>E.ya<BIO.reef.from,
 sel:{tol:.1,armor:-.08,camo:-.05},bh:{reef:-.5},eco:{prey:.25,pred:.2,comp:.2},
 keys:[[0,{}],[.5,{temp:2,co2:500,murk:.2}],[1,{}]],clues:[[.15,'The reefs are turning pale.']],res:'The reefs died back and everything that lived on them lost its home.'},
{id:'impact',n:'Comet strike',omen:'A streak across the sky',rec:1,era:[0,5],dur:60,peak:.5,sev:.15,w:.5,
 sel:{burrow:.15,tol:.1,size:-.1},bh:{open:.04,shallow:-.06,shore:-.05},eco:{prey:.3,pred:.3,comp:.2},
 keys:[[0,{}],[.4,{flash:.8,dark:.2}],[.55,{dark:.5,ash:.4,temp:-2,haze:.3}],[1,{}]],
 clues:[[.1,'A bright streak crosses the sky and vanishes.'],[.45,'A distant boom rolls over the water.']],res:'A comet struck. Waves and dust spread out from the impact.'},
{id:'collapse',n:'Ecosystem collapse',omen:'The prey are vanishing',rec:1,era:[2,5],dur:60,peak:.5,sev:.1,w:.6,
 sel:{carn:-.18,social:.05,tol:.12},bh:{},eco:{prey:.6,pred:.3,comp:.2},
 keys:[[0,{}],[.5,{veg:-.08,murk:.1}],[1,{}]],clues:[[.15,'The usual prey are scarcer every week.']],res:'A food web unraveled. Hunters lost their prey, and whoever could switch food did best.'}
];
const EVD={};EVDEFS.forEach(d=>{EVD[d.id]=d;});
const SCHED=EVDEFS.filter(d=>d.date);
const RECUR=EVDEFS.filter(d=>!d.date);
SCHED.forEach(d=>{d.p0=Math.max(0,pOfYa(d.era,d.date)-.03);});
const PREP={
 disperse:{n:'Spread out',d:'Scatter across more habitats. Costs 6% of your stock.'},
 shelter:{n:'Shelter and wait',d:'Hole up. Best for small, burrowing bodies. Production is halved while you wait.'},
 gamble:{n:'Bet on the aftermath',d:'Slightly worse odds now, but a bigger burst of new species afterward.'}
};

function lerpKeys(keys,u){
  let i=0;while(i<keys.length-2&&keys[i+1][0]<u)i++;
  const a=keys[i],b=keys[Math.min(i+1,keys.length-1)],f=b[0]>a[0]?clamp((u-a[0])/(b[0]-a[0]),0,1):1,o={};
  const ks={};for(const k in a[1])ks[k]=1;for(const k in b[1])ks[k]=1;
  for(const k in ks){const x=a[1][k]||0,y=b[1][k]||0;o[k]=x+(y-x)*f;}return o;
}
function eventDeltas(S){
  const L=S.life,n={},vis={};if(!L)return {n:n,vis:vis};
  L.ev.forEach(ev=>{const d=EVD[ev.id];if(!d)return;const o=lerpKeys(d.keys,clamp(ev.t/d.dur,0,1));
    for(const k in o){if(VISK.indexOf(k)>=0)vis[k]=Math.max(vis[k]||0,o[k]);else n[k]=(n[k]||0)+o[k];}});
  return {n:n,vis:vis};
}
const bigActive=S=>S.life.ev.some(e=>EVD[e.id]&&EVD[e.id].big);
function evTitle(ev){const d=EVD[ev.id];return ev.t/d.dur<d.peak?d.omen:d.n;}

function startEvent(S,id){
  const L=S.life,d=EVD[id];if(!d||L.ev.some(e=>e.id===id))return null;
  const ev={id:id,t:0,ci:0,asked:0,res:0,prep:null};L.ev.push(ev);L.stats.ev++;
  return ev;
}
function survP(S,d,P,biome,mu,prep,isMain){
  let adj=0;for(const k in d.sel)adj+=.75*d.sel[k]*P[k];
  const E=earthNow(S);
  (mu||[]).forEach(m=>{const x=MUTD[m.id||m];if(x&&x.sv)adj+=x.sv*(!x.cond||condMet(x.cond,E)?1:.25);});
  adj+=(d.bh&&d.bh[biome])||0;
  if(isMain){
    adj+=Math.min(.12,.03*Math.max(0,Object.keys(S.life.colonized).length-1));
    if(prep==='disperse')adj+=.08+.06*P.fast+.05*P.fly;
    else if(prep==='shelter')adj+=.06+.1*Math.max(P.burrow,Math.max(0,-P.size));
    else if(prep==='gamble')adj-=.05;
    adj+=.14;
  }
  return clamp(1-d.sev+adj,.03,.97);
}
function resolveEvent(S,ev){
  const L=S.life,d=EVD[ev.id],m=mods(S),big=!!d.big,res={id:d.id,n:d.n,big:big,x:d.res,lost:[],kept:[],made:[],rivals:[],main:null,ya:d.date||geoYa(S),sev:d.sev};
  if(d.boon){L.surge=Math.max(L.surge,1.08);L.ch+=d.id==='searise'||d.id==='bloom'?1:0;res.boon=true;}
  if(d.eco&&d.sev>0)res.rivals=ecoShock(S,d.sev*(big?1:.6),d.eco);
  aliveBranches(S).forEach(sp=>{
    const p=survP(S,d,sp.pr,sp.bi,sp.mu.map(id=>({id:id})),null,false);
    const dieP=big?1-p:Math.max(0,(1-p)-.12)*.7;
    if(d.sev>0&&Math.random()<dieP){killSp(S,sp,(big?'Lost in '+d.n+'.':causeFor(d)),res.ya);res.lost.push(sp);}
    else{if(d.sev>0)sp.pop*=.5+.5*p;res.kept.push({sp:sp,p:p});}
  });
  const P=profOf(S),pm=survP(S,d,P,L.biome,L.mut,ev.prep,true),old=mainSp(S);
  res.p=pm;
  if(big){
    L.stats.mass++;const r=Math.random();
    if(r<pm){
      const loss=S.energy*d.sev*.3*(1-pm)*m.bad;S.energy-=loss;L.rec=clamp(1-d.sev*(1-pm)*.8,.4,1);L.stats.ms.intact++;
      res.main={k:'intact',loss:loss};
    }else{
      const alive=res.kept.slice().sort((a,b)=>b.sp.pop*b.p-a.sp.pop*a.p)[0];
      if(alive){
        const loss=S.energy*d.sev*.5*m.bad;S.energy-=loss;L.rec=.5;L.stats.ms.handoff++;
        const nu=alive.sp;
        if(old)killSp(S,old,'Collapsed in '+d.n+'. Its kin the '+nu.n+' carried the line on.',res.ya);
        nu.k='main';L.main=nu.id;L.biome=nu.bi;L.bias=Object.assign({},nu.vd||{});L.ver++;
        res.main={k:'handoff',loss:loss,sp:nu};
      }else{
        const loss=S.energy*Math.min(.7,d.sev*.65)*m.bad;S.energy-=loss;L.rec=.35;L.stats.ms.bottleneck++;
        if(old)old.pop=.08;res.main={k:'bottleneck',loss:loss};
      }
    }
    L.stats.massSurv++;
    if(d.sev>=.5){
      const n=2+Math.floor(d.sev*3)+(ev.prep==='gamble'?1:0)+(res.main.k==='bottleneck'?-1:0);
      res.made=radiate(S,Math.max(1,n),d.n);
      L.surge=Math.max(L.surge,1.2+.25*d.sev+(ev.prep==='gamble'?.15:0));
    }
    L.ch+=1;L.quiet=45;
    const a=aliveSp(S).length;
    lifeRecord(S,'extinction',d.n+'. '+(res.lost.length?plural(res.lost.length,'branch')+' of the lineage vanish'+(res.lost.length===1?'es':'')+(res.lost.length<=3?': '+listNames(res.lost)+'.':'.'):'No branch is lost.')+' '+
      ({intact:'The '+spName(S,L.main)+' come through intact.',handoff:'The main line collapses. The '+spName(S,L.main)+' carry the lineage on.',bottleneck:'The '+spName(S,L.main)+' survive as a handful of refugees.'})[res.main.k],{big:1,date:res.ya});
    if(res.made.length)lifeRecord(S,'radiation','Adaptive radiation: '+plural(res.made.length,'new species')+' spread into the emptied niches: '+listNames(res.made)+'.',{big:1,date:res.ya});
  }else{
    if(d.sev>0){const loss=S.energy*d.sev*.5*(1-pm)*m.bad;if(loss>0){S.energy-=loss;res.main={k:'minor',loss:loss};}}
    if(res.lost.length)lifeRecord(S,'extinction',d.n+': '+listNames(res.lost)+' did not survive.',{});
    else if(d.rec&&d.sev>=.1)lifeRecord(S,'catastrophe',d.n+'. '+d.res,{});
  }
  L.q.push({t:'result',res:res});if(L.q.length>20)L.q.shift();
  L.stats.log=L.stats.log||0;
  return res;
}
const causeFor=d=>d.id==='drought'?'Dried out in the drought.':d.id==='icehouse'?'Could not endure the ice age.':d.id==='warming'?'Overheated in the warm spell.':d.id==='anoxia'?'Suffocated in stagnant water.':d.id==='eruption'?'Smothered by volcanic ash.':d.id==='reefdie'?'Lost its reef.':d.id==='sealow'?'Left stranded by the falling sea.':d.id==='collapse'?'Starved when the food web collapsed.':'Did not survive '+d.n.toLowerCase()+'.';
const plural=(n,w)=>n+' '+(n===1?w:w==='branch'?'branches':w==='new species'?'new species':w+'s');
const listNames=a=>{const n=a.map(s=>s.n);return n.length<2?n.join(''):n.slice(0,-1).join(', ')+' and '+n[n.length-1];};

function answerEvent(S,id,prep){
  const L=S.life,ev=L.ev.find(e=>e.id===id);if(!ev||ev.prep)return false;
  ev.prep=prep;
  if(prep==='disperse'){S.energy-=S.energy*.06*mods(S).bad;}
  else if(prep==='shelter'){L.rec=Math.min(L.rec,.5);}
  return true;
}
/* Advance every active event by dt seconds and start new ones. Called from the life tick. */
function eventStep(S,dt){
  const L=S.life,E=earthNow(S);
  for(let i=L.ev.length-1;i>=0;i--){
    const ev=L.ev[i],d=EVD[ev.id];if(!d){L.ev.splice(i,1);continue;}
    ev.t+=dt;const u=ev.t/d.dur;
    while(d.clues&&ev.ci<d.clues.length&&u>=d.clues[ev.ci][0]){const x=d.clues[ev.ci][1];ev.ci++;L.om.unshift({id:d.id,x:x,ya:geoYa(S)});if(L.om.length>8)L.om.pop();L.q.push({t:'clue',x:x,big:!!d.big,id:d.id});}
    if(d.big&&d.ask&&!ev.asked&&u>=d.ask.at){ev.asked=1;L.q.push({t:'ask',id:d.id});}
    if(!ev.res&&u>=d.peak){ev.res=1;resolveEvent(S,ev);}
    if(u>=1)L.ev.splice(i,1);
  }
  if(S.era>5&&!SCHED.some(d=>d.era===S.era))return;
  const big=bigActive(S);
  for(const d of SCHED){if(d.era===S.era&&!L.done[d.id]&&L.p>=d.p0&&!big){L.done[d.id]=1;startEvent(S,d.id);L.nextEv=Math.max(L.nextEv,60);return;}}
  L.nextEv-=dt;
  if(L.nextEv>0||big||L.ev.length>=2||L.quiet>0)return;
  const pool=RECUR.filter(d=>S.era>=d.era[0]&&S.era<=d.era[1]&&(!d.need||d.need(S,E))&&!L.ev.some(e=>e.id===d.id));
  if(pool.length){
    const w=pool.map(d=>(d.w||1)*(d.id==='eruption'?.4+E.volc*2:1)*(d.rec?1:.8));
    let r=Math.random()*w.reduce((a,b)=>a+b,0),k=0;for(;k<pool.length-1;k++){r-=w[k];if(r<=0)break;}
    startEvent(S,pool[k].id);
  }
  L.nextEv=70+Math.random()*60;
}
