/* Deep Time: Earth. A geological clock, a baseline planet, and the conditions your lineage actually feels.
   No DOM access. Everything here is derived from S.era, S.life.p (progress through the era) and active events. */
const YA0=[3.8e9,6e8,4.8e8,3.75e8,2e8,3e6,12000,5000,266,76,50,-75,-1000]; // years ago at the start of each stage
const ERA_SECS=[60,60,80,100,120,100,80,80,80,80,80,80,80];            // minimum seconds of play a stage's geological clock takes
const MONEY_SC=2.2;                                                // earnings (in multiples of the evolve cost) that fill a stage clock
const GEO_READY=.985;
const clamp=(x,a,b)=>x<a?a:x>b?b:x;
const eraEndYa=e=>e<YA0.length-1?YA0[e+1]:-30000;
const pOfYa=(e,ya)=>(YA0[e]-ya)/(YA0[e]-eraEndYa(e));
function geoYa(S){const e=S.era,p=S.life?clamp(S.life.p,0,1):0;return YA0[e]+(eraEndYa(e)-YA0[e])*p;}
function fmtYa(ya){
  if(ya>=1e9)return (ya/1e9).toFixed(1)+' BYA';
  if(ya>=1e7)return Math.round(ya/1e6)+' MYA';
  if(ya>=1e6)return (ya/1e6).toFixed(1)+' MYA';
  if(ya>=1e4)return Math.round(ya).toLocaleString('en-US')+' years ago';
  const y=2025-ya;return y>=1?Math.round(y)+' CE':Math.round(1-y)+' BCE';
}
/* Baseline planet. Rows: [million years ago, temp C, O2 %, CO2 ppm, sea level m, volcanism 0-1, vegetation 0-1, ocean anoxia 0-1, aridity 0-1] */
const BASE=[
[3800,58,0,10000,0,.9,0,.8,.1],[3000,45,0,4000,0,.7,0,.7,.1],[2400,38,1,2500,0,.6,0,.6,.1],[2000,30,3,1500,0,.5,0,.5,.1],
[1000,22,5,1200,0,.4,0,.4,.1],[700,12,8,1500,-20,.45,0,.3,.1],[600,18,12,3000,20,.4,0,.3,.1],[540,21,15,4500,80,.4,.02,.3,.1],
[480,22,16,4500,200,.4,.05,.25,.1],[440,17,16,3500,60,.35,.12,.3,.15],[400,21,17,2500,150,.35,.35,.2,.2],[370,20,17,1500,100,.4,.55,.3,.2],
[340,18,23,700,60,.35,.8,.15,.2],[300,14,30,400,0,.3,.9,.1,.3],[270,19,26,600,30,.35,.7,.1,.45],[252,27,20,2000,100,.9,.4,.7,.5],
[230,24,16,1800,50,.5,.5,.3,.45],[200,25,17,1600,100,.6,.7,.35,.35],[150,24,22,1000,150,.4,.8,.3,.25],[100,27,23,1200,250,.5,.85,.35,.2],
[66,22,21,600,200,.7,.85,.25,.2],[50,27,22,900,150,.4,.9,.2,.2],[34,18,21,500,60,.3,.8,.1,.25],[15,18,21,350,80,.3,.8,.1,.25],
[3,16,21,280,25,.3,.65,.1,.3],[.02,10,21,230,-120,.3,.55,.1,.35],[.0117,14,21,262,-50,.3,.6,.1,.3],[.0003,14,21,277,0,.3,.6,.1,.3],
[.00007,14.4,21,310,0,.3,.55,.1,.3],[0,15.2,21,425,0,.3,.5,.1,.3]];
const EK=['temp','o2','co2','sea','volc','veg','anox','dry'];
function baseAt(ya){
  const m=ya/1e6;let i=0;while(i<BASE.length-2&&BASE[i+1][0]>m)i++;
  const a=BASE[i],b=BASE[i+1],u=clamp((a[0]-m)/(a[0]-b[0]||1),0,1),o={};
  EK.forEach((k,j)=>{o[k]=a[j+1]+(b[j+1]-a[j+1])*u;});return o;
}
/* Natural scale of each variable: a swing of this size counts as "one unit" of change. */
const ESCALE={temp:8,o2:8,co2:1500,sea:150,volc:.5,veg:.4,anox:.5,dry:.5};
/* How much the planet matters at each stage. Fully at stage 3 to 6, a little in the civilization stages. */
const EARTH_W=[.7,.9,1,1,1,.9,.25,.25,.25,.25,.25,.15,.1];
const ECO_W=[.4,.7,1,1,1,.8,0,0,0,0,0,0,0];

const marineOf=x=>clamp(.55+.35*(1-x.anox*1.2)+.15*clamp(x.sea/200,-1,1)-.12*Math.max(0,(x.temp-30)/10),.25,1.4);
const landOf=x=>clamp(.3+.9*x.veg-.3*x.dry,.15,1.4);
/* The planet as the lineage feels it right now. Cached, refreshed by the life tick. */
let EARTH_CACHE=null;
function earthCalc(S){
  const ya=geoYa(S),b=baseAt(ya),ref=baseAt(YA0[S.era]),d=(typeof eventDeltas==='function')?eventDeltas(S):{n:{},vis:{}};
  const E={ya:ya,ref:ref,vis:d.vis||{}};
  EK.forEach(k=>{E[k]=b[k]+(d.n[k]||0);});
  E.o2=clamp(E.o2,0,35);E.volc=clamp(E.volc,0,1);E.veg=clamp(E.veg,0,1);E.anox=clamp(E.anox,0,1);E.dry=clamp(E.dry,0,1);E.co2=Math.max(100,E.co2);
  E.ev=d.n;                 // event-only deltas, for acclimation
  E.dev={};EK.forEach(k=>{E.dev[k]=E[k]-ref[k];});
  E.marine=marineOf(E);E.land=landOf(E);E.rf={marine:marineOf(ref),land:landOf(ref)};
  E.climate=E.temp<8?'Frozen':E.temp<13?'Icehouse':E.temp<17?'Cool':E.temp<22?'Temperate':E.temp<28?'Warm greenhouse':E.temp<35?'Hothouse':'Scorching';
  return E;
}
function earthNow(S){if(!EARTH_CACHE||EARTH_CACHE.S!==S)EARTH_CACHE={S:S,E:earthCalc(S)};return EARTH_CACHE.E;}
function earthRefresh(S){EARTH_CACHE={S:S,E:earthCalc(S)};return EARTH_CACHE.E;}
/* Food as a lineage in a biome of the given kind would find it. */
function foodIndex(E,kind){
  if(kind==='sea')return E.marine;
  if(kind==='land')return E.land;
  if(kind==='fresh')return clamp((E.marine+E.land)/2+(.1-E.dry*.5),.2,1.4);
  return (E.marine+E.land)/2; // coast: both
}
function foodWord(f){return f>1.05?'Abundant':f>.85?'Good':f>.65?'Lean':f>.45?'Scarce':'Starving';}
/* The state of the geological clock (progress through the stage), advanced by life tick. */
function geoReady(S){return !S.life||S.life.p>=GEO_READY;}
function earthTrend(E,k){const v=E.dev[k]/ESCALE[k];return v>.25?'rising':v<-.25?'falling':'steady';}
