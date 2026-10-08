/* Deep Time: genome. Strategy choices with real tradeoffs, mutations with hidden futures,
   and the fit calculation that decides how well a body suits the world it lives in. No DOM access.
   Profile keys: size(-1..1) aq(0..1) endo herb carn filt armor venom camo fast fly burrow sense brain social r tol ext (0..1) */
const PKEYS=['size','aq','endo','herb','carn','filt','armor','venom','camo','fast','fly','burrow','sense','brain','social','r','tol','ext'];
function baseProf(e){
  const P={};PKEYS.forEach(k=>{P[k]=0;});
  P.aq=e<=2?1:e===3?.5:0;P.endo=e>=4?1:0;P.r=.4;P.tol=.3;
  if(e<=1)P.filt=.5;else{P.herb=.3;P.carn=.3;}
  return P;
}
/* One option per axis at most. [id, name, description, profile change, effects, first stage, last stage] */
const AXES=[
{id:'size',n:'Body size',min:1,o:[
 ['small','Small Body','Breed fast, hide easily, eat little. Yields less.',{size:-1,r:.25},{g:.9,bad:.88,e:.94}],
 ['large','Large Body','Predators think twice. You need more food and shocks hit harder.',{size:1},{e:1.1,t:1.2,g:1.1,bad:1.15},2]]},
{id:'diet',n:'Diet',min:1,o:[
 ['filter','Filter Feeding','Strain the water and wait. Steady, but you eat only what drifts by.',{filt:1,carn:-.3,herb:-.3},{e:1.07,bad:.92,t:.85},1,3],
 ['pred','Predation','Hunt for dense, rich meals. Needs prey, and prey fight back.',{carn:1,herb:-.3,filt:-.3},{t:1.5,e:1.05,bad:1.1},2],
 ['herb','Herbivory','Eat what cannot run. Tied to the green world.',{herb:1,carn:-.3,filt:-.3},{e:1.1,g:.95,t:.9},3],
 ['omni','Omnivory','Eat almost anything. Never the best at any one meal.',{herb:.35,carn:.35},{e:1.03,bad:.88},2]]},
{id:'defense',n:'Defense',min:1,o:[
 ['armor','Armor','Plates or shell. Safer, heavier and hungrier. Shells dissolve in acid seas.',{armor:1,fast:-.3},{bad:.82,g:.95,e:.92}],
 ['venom','Venom','A bite that ends arguments. Costly to make.',{venom:1},{t:1.3,bad:.9,i:.95},2],
 ['camo','Camouflage','Be hard to see. Patience over power.',{camo:1},{bad:.86,e:.96}]]},
{id:'move',n:'Movement',min:2,o:[
 ['speed','Speed','Fast fins or legs. Burns energy.',{fast:1},{t:1.3,luck:.05,e:.95}],
 ['burrow','Burrowing','Dig in. Safe, and a little cramped.',{burrow:1},{bad:.76,e:.94},3],
 ['glide','Gliding Membranes','Skin stretched between the limbs. A cheap start on flight.',{fly:.7},{t:1.15,e:1.05},4],
 ['wings','Feathered Wings','True flight. Costly, and it loves thick air.',{fly:1,size:-.3},{e:1.12,t:1.2,g:1.15},4]]},
{id:'sense',n:'Senses',min:0,o:[
 ['chem','Chemical Sense','Smell the whole sea. Slow, reliable, cheap.',{sense:.6},{i:1.08,e:1.03}],
 ['eyes','Keen Eyes','See far and sharply. Needs light, and costs a little feeding time.',{sense:1},{i:1.12,t:1.1,e:.97},1],
 ['echo','Echo and Hearing','Read the dark by sound.',{sense:.7,camo:.2},{i:1.1,bad:.93},3]]},
{id:'habitat',n:'Habitat',min:2,o:[
 ['aquatic','Aquatic Specialist','Own the water. Tied to its level and its air.',{aq:1},{e:1.07,t:1.05}],
 ['terrestrial','Terrestrial Specialist','Leave the water behind for good.',{aq:-1},{e:1.05,bad:1.05},3]]},
{id:'metab',n:'Metabolism',min:3,o:[
 ['ecto','Cold-blooded Efficiency','Barely eat. Slow in the cold.',{endo:-1},{g:.9,bad:1.05,e:.97}],
 ['endo','Warm-blooded Drive','Always active, always hungry.',{endo:1},{e:1.1,g:1.08}]]},
{id:'mind',n:'Mind',min:2,o:[
 ['brain','Large Brain','Clever and expensive. Slows production, quickens insight.',{brain:1},{i:1.25,e:.93,adv:.95}]]},
{id:'society',n:'Behavior',min:2,o:[
 ['social','Social Groups','Strength in numbers, and more mouths to share with.',{social:1},{c:1.2,bad:.9,e:.95}]]},
{id:'repro',n:'Reproduction',min:0,o:[
 ['fast','Fast Breeders','Many offspring, little care. Quick to adapt.',{r:1},{e:1.05,bad:.88,i:.92,c:.92}],
 ['care','Parental Care','Few offspring, well raised.',{r:-.4},{c:1.15,i:1.08,e:.94}]]},
{id:'tol',n:'Tolerance',min:0,o:[
 ['general','Generalist','Broad tolerance, no peak.',{tol:.5},{bad:.9,e:.95}],
 ['extreme','Extremophile','Thrive where others cannot.',{ext:1,tol:-.2},{e:1.07,t:1.05}]]}
];
const OPTS={};
AXES.forEach(a=>{a.o=a.o.map(o=>{const x={id:o[0],axis:a.id,n:o[1],d:o[2],p:o[3],fx:o[4],min:o[5]!=null?o[5]:a.min,max:o[6]!=null?o[6]:5};OPTS[x.id]=x;return x;});});
const MAX_GENOME_ERA=5;

/* Mutations. cond: the world that makes a latent mutation pay off. sv: bonus to surviving mass extinctions. */
const MUTS=[
{id:'mito',n:'Efficient Respiration',kind:'beneficial',omen:'promising',f:'Cells that squeeze more from every meal.',fx:{e:1.06},min:0},
{id:'senses',n:'Sharper Senses',kind:'beneficial',omen:'promising',f:'A finer web of sensors.',fx:{i:1.08},min:1},
{id:'embryo',n:'Hardy Offspring',kind:'beneficial',omen:'promising',f:'Young that shrug off small shocks.',fx:{bad:.92},min:1},
{id:'brittle',n:'Brittle Structure',kind:'harmful',omen:'worrying',f:'Something fragile in the framework.',fx:{bad:1.1},min:1},
{id:'sluggish',n:'Sluggish Metabolism',kind:'harmful',omen:'worrying',f:'A slow furnace.',fx:{e:.95},min:0},
{id:'costly',n:'Costly Genome',kind:'harmful',omen:'worrying',f:'Every copy takes more effort.',fx:{g:1.06},min:0},
{id:'pigment',n:'Pigment Variant',kind:'neutral',omen:'curious',f:'A new color in the family.',fx:{},min:0,vis:'hue'},
{id:'markings',n:'Odd Markings',kind:'neutral',omen:'curious',f:'Spots appear on some of the young.',fx:{},min:1,vis:'spots'},
{id:'bristles',n:'Extra Bristles',kind:'neutral',omen:'curious',f:'Stiff hairs, for no reason anyone can see.',fx:{},min:0,vis:'bristles'},
{id:'antifreeze',n:'Antifreeze Proteins',kind:'situational',omen:'curious',f:'A strange chemistry in the blood.',fx:{e:.98},cond:'cold',bonus:.14,sv:.06,min:0},
{id:'heatshock',n:'Heat-shock Proteins',kind:'situational',omen:'curious',f:'Proteins that refuse to unravel.',fx:{e:.98},cond:'hot',bonus:.14,sv:.06,min:0},
{id:'oxybind',n:'Oxygen-binding Pigment',kind:'situational',omen:'promising',f:'A pigment that grabs oxygen greedily.',fx:{e:.97},cond:'lowO2',bonus:.15,sv:.08,min:1},
{id:'thickhide',n:'Thick Hide',kind:'situational',omen:'worrying',f:'Heavy, slow to grow, and costly.',fx:{e:.97,g:1.03},cond:'dry',bonus:.13,sv:.06,min:3},
{id:'radrepair',n:'Radiation Repair',kind:'situational',omen:'curious',f:'DNA that fixes itself, oddly well.',fx:{e:.98},cond:'dark',bonus:.12,sv:.08,min:0},
{id:'fatstore',n:'Fat Storage',kind:'situational',omen:'curious',f:'Surplus is kept, not spent.',fx:{e:.97},cond:'famine',bonus:.14,sv:.1,min:1},
{id:'acidtol',n:'Acid Tolerance',kind:'situational',omen:'curious',f:'Tissue that does not mind a sour world.',fx:{},cond:'volc',bonus:.12,sv:.06,min:0},
{id:'dormancy',n:'Deep Dormancy',kind:'situational',omen:'worrying',f:'A body that can switch itself nearly off. Looks like laziness.',fx:{e:.95},cond:'extinction',bonus:.16,sv:.22,min:0}
];
const MUTD={};MUTS.forEach(m=>{MUTD[m.id]=m;});
function condMet(c,E){
  const D=E.dev,v=E.vis||{};
  switch(c){
    case 'cold':return D.temp<=-4;case 'hot':return D.temp>=4;case 'lowO2':return D.o2<=-4||D.anox>=.3;
    case 'dry':return D.dry>=.25;case 'dark':return (v.dark||0)>=.3;case 'volc':return D.volc>=.25;
    case 'famine':return Math.min(E.marine,E.land)<.55;case 'extinction':return (v.ext||0)>0;
  }return false;
}

/* ---------- profile and effects ---------- */
function profCalc(S){
  const L=S.life,P=baseProf(S.era);
  const add=p=>{for(const k in p)P[k]+=p[k];};
  if(L){for(const ax in L.genome){const o=OPTS[L.genome[ax]];if(o)add(o.p);}if(L.bias)add(L.bias);}
  PKEYS.forEach(k=>{P[k]=k==='size'?clamp(P[k],-1,1):clamp(P[k],0,1);});
  return P;
}
function profOf(S){const L=S.life;if(!L)return baseProf(S.era);if(!L._pc||L._pc.v!==L.ver||L._pc.e!==S.era)L._pc={v:L.ver,e:S.era,P:profCalc(S)};return L._pc.P;}
function genomeFx(S){
  const L=S.life,m={};if(!L)return m;
  const add=fx=>{for(const k in fx){if(k==='luck')m.luck=(m.luck||0)+fx[k];else m[k]=(m[k]||1)*fx[k];}};
  for(const ax in L.genome){const o=OPTS[L.genome[ax]];if(o)add(o.fx);}
  L.mut.forEach(x=>{const d=MUTD[x.id];if(d)add(d.fx);});
  return m;
}
const countGenome=S=>S.life?Object.keys(S.life.genome).length:0;
function optCost(S,o){
  const L=S.life,n=Object.keys(L.genome).length,sw=L.genome[o.axis]&&L.genome[o.axis]!==o.id;
  return Math.round(400*Math.pow(8,S.era)*(1+.35*n)*mods(S).upg*(sw?.7:1));
}
function optState(S,o){
  const L=S.life;
  if(L.genome[o.axis]===o.id)return {st:'owned',cost:0};
  if(S.era>MAX_GENOME_ERA)return {st:'locked',why:'Your people have outgrown biology',cost:0};
  if(S.era<o.min)return {st:'locked',why:'Stage '+(o.min+1)+': '+ERAS[o.min].name,cost:0};
  if(S.era>o.max)return {st:'locked',why:'No longer possible',cost:0};
  return {st:L.genome[o.axis]?'switch':'ok',cost:optCost(S,o)};
}
function buyOpt(S,id){
  const o=OPTS[id];if(!o)return false;const st=optState(S,o);
  if(st.st!=='ok'&&st.st!=='switch')return false;
  if(S.energy<st.cost)return false;
  S.energy-=st.cost;S.life.genome[o.axis]=o.id;S.life.ver++;return st.st;
}

/* ---------- fit: how well this body suits this world ---------- */
function defenseOf(P){return clamp(.25*P.armor+.2*P.fast+.15*P.camo+.15*P.venom+.2*Math.max(0,P.size)+.15*P.social+.2*P.burrow+.1*P.sense+.1*P.brain,0,1);}
function fitCalc(S,P,biomeId,muts){
  const E=earthNow(S),D=E.dev,e=S.era,L=S.life,b=BIO[biomeId]||BIO.shallow,T=[];
  const W=EARTH_W[e]||.25,add=(k,l,v,w)=>{v*=(w==null?W:w);if(Math.abs(v)>.003)T.push({k:k,l:l,v:v});};
  const tn=clamp(D.temp/8,-2,2),on=clamp(D.o2/8,-2,2),sn=clamp(D.sea/150,-2,2),terr=1-P.aq;
  const an=clamp(D.anox/.5,0,2),dn=clamp(D.dry/.5,0,2),vn=clamp(D.volc/.5,0,2),ac=clamp(D.co2/1500,0,2);
  if(e>=1){
    add('heat','Temperature',P.endo*(tn>0?-.07*tn*(1+.6*Math.max(0,P.size)):-.06*tn)+(1-P.endo)*(tn>0?.05*tn:.08*tn*(1-.5*P.tol)));
    if(e>=2)add('o2','Oxygen',(on>0?on*(.05*Math.max(0,P.size)+.05*P.fly+.02*P.brain):on*(.08*P.endo+.05*Math.max(0,P.size)+.05*P.fly)+(-on)*.04*Math.max(0,-P.size))*(on<0?1-.4*P.tol:1));
    add('sea','Sea level',.06*sn*P.aq-.03*sn*terr);
    add('anox','Ocean oxygen',-.11*an*P.aq*(1-.5*P.tol)*(1-.3*P.burrow)*(1-.4*Math.max(0,-P.size))+.05*an*P.ext);
    add('acid','Ocean acidity',-.06*ac*P.armor*P.aq);
    add('volc','Volcanism',-.08*vn*(1-P.tol)*(1-.7*P.ext)+.07*vn*P.ext);
    if(e>=3)add('dry','Drought',-.08*dn*terr*(1+.5*Math.max(0,P.size)+.4*P.herb)*(1-.4*P.burrow-.3*P.tol));
  }
  const f=foodIndex(E,b.kind)*b.food,fr=foodIndex({marine:E.rf.marine,land:E.rf.land},b.kind)*b.food;
  add('food','Food supply',.14*(f-fr)*((P.herb>.5||P.filt>.5)?1.2:P.carn>.5?.5:.9));
  add('biome',b.n,b.hz(P,D));
  if(L){
    const a=L.acc||{},sh=Math.sqrt(['temp','o2','sea','co2','anox','dry','volc'].reduce((s,k)=>{const x=((E.ev[k]||0)-(a[k]||0))/ESCALE[k];return s+x*x;},0));
    add('shock','Sudden change',-.12*clamp(sh-.35,0,2.5)*(1-.45*P.tol)*(1-.25*P.r));
    const ew=ECO_W[e]||0,eco=L.eco;
    if(ew&&eco){
      const spec=clamp((Math.max(P.herb,P.carn,P.filt)-.35)/.65,0,1),pp=eco.pred*(.5+eco.atk)*b.pm;
      add('pred','Predators',-.16*Math.max(0,pp-.8*defenseOf(P)-.1),ew);
      add('prey','Prey',.12*(eco.prey-.8)*P.carn,ew);
      add('comp','Competitors',-.09*eco.comp*(1-.5*spec),ew);
    }
  }
  (muts||[]).forEach(m=>{const d=MUTD[m.id];if(d&&d.cond&&condMet(d.cond,E))add('mut',d.n,d.bonus,1);});
  let raw=0;T.forEach(t=>{raw+=t.v;});
  return {env:clamp(1+raw,.6,1.4),T:T};
}
function mainFit(S){const L=S.life;return fitCalc(S,profOf(S),L.biome,L.mut);}
/* How the world would treat you if you took (or dropped) this option, all else equal. */
function optSuit(S,o){
  const L=S.life,cur=L.genome[o.axis]===o.id,P0=baseProf(S.era);
  const P=profOf(S),Q={};PKEYS.forEach(k=>{Q[k]=P[k];});
  const sw=(g,sgn)=>{const x=OPTS[g];if(x)for(const k in x.p)Q[k]+=sgn*x.p[k];};
  if(cur)sw(o.id,-1);else{if(L.genome[o.axis])sw(L.genome[o.axis],-1);sw(o.id,1);}
  PKEYS.forEach(k=>{Q[k]=k==='size'?clamp(Q[k],-1,1):clamp(Q[k],0,1);});
  const a=fitCalc(S,P,L.biome,L.mut).env,b=fitCalc(S,Q,L.biome,L.mut).env;
  return cur?a-b:b-a;
}
