/* Deep Time: species. Procedural names, the species registry, branches off the main line, and radiations.
   A species: {id,n,o,p,b,d,k,e,bi,pr,pop,st,why,tags,mu,vd,rad}
   st: 'alive' | 'ancestor' (the main line became something new) | 'extinct'. No DOM access. */
const SP_CAP=140,LIVE_CAP=10;

/* ---------- names ---------- */
function rng(L){let t=(L.rs=(L.rs+0x6D2B79F5)>>>0);t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;}
const pick=(L,a)=>a[Math.floor(rng(L)*a.length)];
const ROOT={armor:['Lorica','Hoplo','Thorac','Scuto'],predator:['Rapto','Carno','Gnatho','Odonto'],herb:['Phyllo','Herbi','Chloro','Gramino'],filter:['Cribro','Sipho','Rheo','Planc'],
small:['Micro','Nano','Pusillo','Mini'],large:['Mega','Giga','Magno','Titano'],swift:['Tacho','Velo','Dromeo','Cursori'],venom:['Toxi','Veno','Viru','Sting'],
camo:['Crypto','Umbro','Latho','Pseudo'],flight:['Ptero','Aero','Volu','Anemo'],burrow:['Fosso','Tunni','Chthono','Cunicu'],aquatic:['Thalasso','Hydro','Pelago','Nauti'],
terrestrial:['Geo','Terra','Choro','Campo'],social:['Greg','Socio','Agmi','Cooperi'],brain:['Sapi','Cogi','Mento','Neo'],extreme:['Thermo','Cryo','Acido','Halo'],
generalist:['Panto','Omni','Poly','Versi'],herbivore:['Phyllo','Herbi']};
const EPI={armor:['loricatus','scutatus','clypeatus'],predator:['ferox','rapax','vorax','carnifex'],herb:['pascens','viridis','herbarum'],filter:['colans','sessilis','plancticus'],
small:['minutus','pusillus','parvus','exiguus'],large:['grandis','gigas','magnus','immanis'],swift:['celer','velox','cursor'],venom:['toxicus','venenatus','virulentus'],
camo:['occultus','latens','umbratilis'],flight:['volans','aereus','alatus'],burrow:['fossor','cuniculus','subterraneus'],aquatic:['marinus','pelagicus','aquaticus'],
terrestrial:['terrestris','campester','agrestis'],social:['gregarius','sociabilis','communis'],brain:['sagax','astutus','callidus','cogitans'],extreme:['extremus','ardens','glacialis','profundus'],
generalist:['vulgaris','versatilis','adaptabilis']};
const EPI_BIOME={vent:'ardens',shallow:'litoralis',open:'abyssalis',reef:'recifalis',fresh:'lacustris',river:'riparius',tidal:'maritimus',shore:'rupicola',swamp:'palustris',wetland:'paludosus',forest:'sylvestris',mount:'montanus',desert:'arenicola',grass:'campestris',tundra:'borealis'};
const SUFX=[['coccus','monas','bacter','ella','ium'],['zoa','ella','ites','cystis','phyton'],['aspis','ichthys','lepis','steus','ites'],['stega','saurus','batrachus','pteryx','herpeton'],
['therium','mys','odon','ictis','lestes'],['pithecus','ops','therium','anthus','pus']];
function tagsOfProf(P){
  const t=[];const a=(k,v)=>{if(v>0)t.push([k,v]);};
  a('predator',P.carn-.45);a('herb',P.herb-.45);a('filter',P.filt-.45);a('armor',P.armor-.3);a('venom',P.venom-.3);a('camo',P.camo-.3);a('swift',P.fast-.3);
  a('flight',P.fly-.3);a('burrow',P.burrow-.3);a('social',P.social-.3);a('brain',P.brain-.3);a('extreme',P.ext-.3);a('generalist',P.tol-.6);
  a('small',-P.size-.3);a('large',P.size-.3);a('aquatic',P.aq-.8);a('terrestrial',.3-P.aq);
  return t.sort((x,y)=>y[1]-x[1]).map(x=>x[0]);
}
function nameTaken(S,n){return S.life.sp.some(s=>s.n===n)||S.life.eco.rv.some(r=>r.n===n);}
function makeName(S,o){
  const L=S.life,e=clamp(o.era!=null?o.era:S.era,0,5),tags=(o.tags&&o.tags.length?o.tags:['generalist']);
  for(let tries=0;tries<12;tries++){
    const sx=pick(L,SUFX[e]);let genus;
    const stem=(S.name||'Luma').replace(/[^A-Za-z]/g,'');
    if(stem.length>=3&&rng(L)<.3){const s=stem.charAt(0).toUpperCase()+stem.slice(1).toLowerCase();genus=s.replace(/[aeiouy]+$/,'')+sx;}
    else{const r1=ROOT[tags[0]]||ROOT.generalist;let g=pick(L,r1);if(tags[1]&&rng(L)<.5){const r2=(ROOT[tags[1]]||[]);if(r2.length)g=g.replace(/[aeiou]+$/,'')+pick(L,r2).toLowerCase();}genus=g.replace(/(.)\1\1/g,'$1$1')+sx;}
    genus=genus.charAt(0).toUpperCase()+genus.slice(1);
    const et=[];(tags[1]?[tags[1],tags[0]]:[tags[0]]).forEach(t=>{if(EPI[t])et.push(pick(L,EPI[t]));});
    if(o.biome&&EPI_BIOME[o.biome]&&rng(L)<.4)et.unshift(EPI_BIOME[o.biome]);
    const n=genus+' '+(et[0]||pick(L,EPI.generalist));
    if(!nameTaken(S,n))return n;
  }
  return 'Species '+(L.sp.length+1);
}
const spById=(S,id)=>{const a=S.life.sp;for(let i=0;i<a.length;i++)if(a[i].id===id)return a[i];return null;};
const spName=(S,id)=>{const s=spById(S,id);return s?s.n:'an unknown species';};
const mainSp=S=>spById(S,S.life.main);
const aliveSp=S=>S.life.sp.filter(s=>s.st==='alive');
const aliveBranches=S=>S.life.sp.filter(s=>s.st==='alive'&&s.k==='branch');

function newSp(S,o){
  const L=S.life,P=o.pr||profOf(S),pr={};PKEYS.forEach(k=>{pr[k]=Math.round(P[k]*100)/100;});
  const tags=tagsOfProf(P);
  const sp={id:L.sp.length+1,n:o.n||makeName(S,{tags:tags,era:S.era,biome:o.bi||L.biome}),p:o.p||0,b:o.b!=null?o.b:geoYa(S),d:null,k:o.k||'branch',e:S.era,bi:o.bi||L.biome,pr:pr,pop:o.pop!=null?o.pop:.6,st:'alive',why:'',tags:tags.slice(0,2),mu:L.mut.map(m=>m.id),vd:o.vd||null,rad:!!o.rad,v:o.v||''};
  sp.o=sp.n;L.sp.push(sp);return sp;
}
function killSp(S,sp,why,ya){
  if(sp.st!=='alive')return;
  sp.st='extinct';sp.d=ya!=null?ya:geoYa(S);sp.why=why||'';sp.pop=0;
  S.life.stats.ext++;
}
/* The main line becomes a new species at each stage. The old one is kept as an ancestor. */
function speciateMain(S,why){
  const L=S.life,old=mainSp(S),ya=geoYa(S);
  if(old){old.st='ancestor';old.d=ya;old.why=why||'Became '+'its descendant';}
  const sp=newSp(S,{p:old?old.id:0,k:'main',bi:L.biome,pop:.9,b:ya});
  L.main=sp.id;return sp;
}
/* ---------- branches ---------- */
const VARIANTS=[
{id:'armored',n:'Armored kin',dp:{armor:.6,fast:-.2},min:1,d:'A heavily plated population.'},
{id:'swift',n:'Swift kin',dp:{fast:.6,armor:-.2},min:2,d:'Leaner and faster, easier to bite.'},
{id:'giant',n:'Giant kin',dp:{size:.6},min:2,d:'Bigger bodies, bigger appetites.'},
{id:'dwarf',n:'Dwarf kin',dp:{size:-.6,r:.2},min:1,d:'Small, quick to breed.'},
{id:'aquatic',n:'Water-bound kin',dp:{aq:.6},min:2,d:'Staying in the water for good.'},
{id:'landed',n:'Land-bound kin',dp:{aq:-.6},min:3,d:'Committing to dry land.'},
{id:'burrower',n:'Burrowing kin',dp:{burrow:.7},min:3,d:'Dig in and wait out trouble.'},
{id:'hunter',n:'Hunting kin',dp:{carn:.6,herb:-.3,filt:-.3},min:2,d:'Meat eaters, living on others.'},
{id:'grazer',n:'Grazing kin',dp:{herb:.6,carn:-.3},min:3,d:'Plant eaters, tied to the green.'},
{id:'keen',n:'Sharp-sensed kin',dp:{sense:.6},min:1,d:'Better at noticing, worse at brawling.'},
{id:'hardy',n:'Extremophile kin',dp:{ext:.6,tol:-.1},min:0,d:'Happiest where nothing else is.'},
{id:'social',n:'Herding kin',dp:{social:.6},min:2,d:'Living in groups.'},
{id:'flyer',n:'Flying kin',dp:{fly:.7},min:4,d:'Taking to the air.'},
{id:'thinker',n:'Clever kin',dp:{brain:.5},min:3,d:'Expensive brains, clever habits.'},
{id:'filterer',n:'Filtering kin',dp:{filt:.6,carn:-.2},min:1,max:3,d:'Sieving the water.'},
{id:'venomous',n:'Venomous kin',dp:{venom:.7},min:2,d:'A poisonous bite.'}
];
const VAR={};VARIANTS.forEach(v=>{VAR[v.id]=v;});
function variantProf(S,v){const P=profOf(S),Q={};const L=S.life;PKEYS.forEach(k=>{Q[k]=P[k]+(v.dp[k]||0);Q[k]=k==='size'?clamp(Q[k],-1,1):clamp(Q[k],0,1);});return Q;}
function variantBiomes(S,v){
  const Q=variantProf(S,v);return BIOMES.filter(b=>biomeReach(S,b.id,Q).ok).map(b=>b.id);
}
function branchCost(S){return Math.round(upgCost(S,Math.min(S.era,10),1)*.8);}
function offerVariants(S){
  const L=S.life,P=profOf(S);
  const ok=VARIANTS.filter(v=>S.era>=v.min&&(v.max==null||S.era<=v.max)&&Object.keys(v.dp).some(k=>k==='size'?(v.dp[k]>0?P[k]<.7:P[k]>-.7):(v.dp[k]>0?P[k]<.8:P[k]>.2))&&variantBiomes(S,v).length);
  const out=[];while(out.length<3&&ok.length){out.push(ok.splice(Math.floor(Math.random()*ok.length),1)[0].id);}
  return out;
}
function canBranch(S){const L=S.life;return S.era<=5&&L.ch>0&&aliveBranches(S).length<LIVE_CAP&&L.sp.length<SP_CAP;}
function branchOff(S,vid,biome,free,rad,parentId){
  const L=S.life,v=VAR[vid];if(!v)return null;
  if(!free){if(!canBranch(S)||S.energy<branchCost(S))return null;}
  const Q=variantProf(S,v),bi=biome||variantBiomes(S,v)[0];if(!bi||!biomeReach(S,bi,Q).ok)return null;
  if(!free){S.energy-=branchCost(S);L.ch--;}
  const par=parentId?spById(S,parentId):mainSp(S);
  const sp=newSp(S,{p:par?par.id:0,k:'branch',pr:Q,bi:bi,pop:.55,vd:v.dp,v:vid,rad:rad});
  if(!rad)lifeRecord(S,'branch','The '+sp.n+' diverge from the '+spName(S,sp.p)+' and settle in the '+BIO[bi].n.toLowerCase()+'.',{sp:sp.id});
  L.colonized[bi]=1;L.ver++;return sp;
}
function worstTerm(T){let w=null;T.forEach(t=>{if(t.v<0&&(!w||t.v<w.v))w=t;});return w;}
function causeText(w){
  if(!w)return 'Slowly faded away.';
  if(w.k==='pred')return 'Hunted out by faster predators.';if(w.k==='comp')return 'Out-competed for food.';
  if(w.k==='shock')return 'Could not keep pace with sudden change.';if(w.k==='food')return 'Starved when food ran short.';
  if(w.k==='anox')return 'Suffocated as the water lost oxygen.';if(w.k==='heat')return 'Could not cope with the temperature.';
  if(w.k==='dry')return 'Dried out in the drought.';if(w.k==='acid')return 'Shells dissolved in the acid sea.';
  if(w.k==='sea')return 'Lost its habitat as sea level shifted.';if(w.k==='o2')return 'Ran short of oxygen.';if(w.k==='volc')return 'Poisoned by volcanic fallout.';
  return 'Struggled in the '+w.l.toLowerCase()+' and faded.';
}
/* One step over all branches (about six seconds). Returns notes for the log. */
function branchStep(S){
  const L=S.life,notes=[];
  aliveBranches(S).forEach(sp=>{
    const b=BIO[sp.bi]||BIO.shallow,r=fitCalc(S,sp.pr,sp.bi,sp.mu.map(id=>({id:id}))),f=r.env;
    const crowd=L.sp.filter(x=>x.st==='alive'&&x.bi===sp.bi).length;
    const tgt=clamp(.5+3*(f-.97),0,1)*b.cap/(1+.2*Math.max(0,crowd-1));
    sp.pop=clamp(sp.pop+(tgt-sp.pop)*.08+(Math.random()-.5)*.01,0,1);
    sp.fit=f;sp.low=sp.pop<.06?(sp.low||0)+1:0;
    if(sp.low>=3){killSp(S,sp,causeText(worstTerm(r.T)));notes.push({k:'extinct',sp:sp});}
    else if(sp.pop>.8&&f>1.05&&Math.random()<.012&&aliveBranches(S).length<LIVE_CAP&&L.sp.length<SP_CAP){
      const v=pick2(offerVariants(S));if(v){const kid=branchOff(S,v,null,true,false,sp.id);if(kid){notes.push({k:'speciate',sp:kid,from:sp});}}
    }
  });
  return notes;
}
const pick2=a=>a.length?a[Math.floor(Math.random()*a.length)]:null;
function diversityBonus(S){
  const L=S.life;let d=0;aliveBranches(S).forEach(s=>{d+=s.pop*.012;});
  return clamp(d,0,.12)+Math.min(.05,.006*Math.max(0,Object.keys(L.colonized).length-1));
}
/* Adaptive radiation: survivors rush into empty niches and the tree suddenly branches. */
function radiate(S,n,label){
  const L=S.life,made=[];
  for(let i=0;i<n&&aliveBranches(S).length<LIVE_CAP&&L.sp.length<SP_CAP;i++){
    const v=pick2(offerVariants(S));if(!v)break;
    const par=pick2(aliveSp(S));const kid=branchOff(S,v,null,true,true,par?par.id:0);if(kid)made.push(kid);
  }
  return made;
}
