/* Deep Time: biomes. Each habitat has its own food, predators, hazards and the traits that suit it.
   aff: trait weights (profile keys, see genome.js). hz(P,D,E): hazard/opportunity term from Earth deviations D. */
const BIOMES=[
{id:'vent',n:'Hydrothermal vents',kind:'sea',from:3.8e9,food:.8,pm:.5,cap:.8,era:0,
 d:'Hot, mineral-rich chimneys on the sea floor. Little food, almost no predators.',haz:'Starved of light. Only the tough thrive.',
 hz:(P,D)=>.07*P.ext-.03*(1-P.tol)},
{id:'shallow',n:'Shallow seas',kind:'sea',from:3.8e9,food:1,pm:1,cap:1,era:0,
 d:'Warm, sunlit and crowded. The cradle of most early life.',haz:'Shrinks when sea level falls.',
 hz:(P,D)=>{const s=clamp(D.sea/150,-2,2);return s<0?.08*s:.02*s;}},
{id:'open',n:'Open ocean',kind:'sea',from:1.0e9,food:.85,pm:1.1,cap:1,era:1,
 d:'Endless blue water. Food drifts, and nowhere to hide.',haz:'Low-oxygen water spreads here first.',
 hz:(P,D)=>.05*P.fast+.03*Math.max(0,P.size)-.04*P.burrow-.05*clamp(D.anox/.5,0,2)},
{id:'reef',n:'Reefs',kind:'sea',from:5.4e8,food:1.15,pm:1.2,cap:.9,era:1,
 d:'Living walls of coral and sponge. Rich, complex and full of teeth.',haz:'Bleaches in heat and dissolves in acid seas.',
 hz:(P,D)=>.05*P.camo+.04*P.armor+.03*P.sense-.07*clamp(D.temp/8,0,2)-.05*clamp(D.co2/1500,0,2)},
{id:'fresh',n:'Lakes and ponds',kind:'fresh',from:5e8,food:.9,pm:.7,cap:.7,era:2,
 d:'Still fresh water, cut off from the sea. Few rivals, small space.',haz:'Dries out in drought.',
 hz:(P,D)=>.04*P.tol+.03*P.r-.08*clamp(D.dry/.5,0,2)},
{id:'river',n:'Rivers',kind:'fresh',from:4.5e8,food:1,pm:.9,cap:.8,era:2,
 d:'Moving water that carries food to you and you to new places.',haz:'Floods and droughts.',
 hz:(P,D)=>.05*P.fast+.03*P.burrow-.06*clamp(D.dry/.5,0,2)},
{id:'tidal',n:'Tidal flats',kind:'coast',from:4.3e8,food:1.1,pm:.8,cap:.8,era:2,
 d:'Mud and pools that drown and drain twice a day. Rich pickings for the tolerant.',haz:'Punishes the fragile whenever sea level swings.',
 hz:(P,D)=>.06*P.tol-.05*Math.abs(clamp(D.sea/150,-2,2))*(1-P.tol)},
{id:'shore',n:'Rocky shore',kind:'coast',from:4.5e8,food:.95,pm:.8,cap:.7,era:2,
 d:'Waves, rock and tide pools between two worlds.',haz:'Battered by storms.',
 hz:(P,D)=>.04*P.armor+.03*Math.max(0,P.size)+.03*P.social},
{id:'swamp',n:'Swamps',kind:'coast',from:3.6e8,food:1.1,pm:.9,cap:.9,era:3,
 d:'Warm, stagnant, choked with plants. Low-oxygen water and ambushes.',haz:'Disease thrives in the heat.',
 hz:(P,D)=>.04*P.camo+.03*P.venom+.03*P.tol-.04*clamp(D.temp/8,0,2)*(1-P.tol)},
{id:'wetland',n:'Floodplains',kind:'coast',from:3e8,food:1.1,pm:.8,cap:.9,era:3,
 d:'Seasonal marsh and meadow. Green, rich and wet.',haz:'Vanishes in drought.',
 hz:(P,D)=>.04*P.herb+.03*P.r-.06*clamp(D.dry/.5,0,2)},
{id:'forest',n:'Forest',kind:'land',from:3.85e8,food:1.05,pm:1.1,cap:1,era:3,
 d:'Layers of green and shade. Plenty to eat, plenty to hide in.',haz:'Burns in drought.',
 hz:(P,D)=>.05*P.sense+.04*P.fly+.04*P.camo+.03*P.brain-.07*clamp(D.dry/.5,0,2)},
{id:'mount',n:'Highlands',kind:'land',from:4e8,food:.7,pm:.7,cap:.6,era:3,
 d:'Thin air, cold nights and few rivals.',haz:'Cold and volcanic ash.',
 hz:(P,D)=>.04*P.endo+.04*P.fast+.03*P.armor-.04*clamp(D.volc/.5,0,2)},
{id:'desert',n:'Deserts',kind:'land',from:3e8,food:.6,pm:.7,cap:.6,era:3,
 d:'Heat, sand and distance. Whatever lives here is built for it.',haz:'Overheats the large and warm-blooded.',
 hz:(P,D)=>.06*P.burrow+.05*P.tol+.04*P.camo-.05*Math.max(0,P.size)-.04*clamp(D.temp/8,0,2)*P.endo},
{id:'grass',n:'Grassland',kind:'land',from:3.5e7,food:1,pm:1.2,cap:1,era:4,
 d:'Open plains of grass. Great herds, great distances, nowhere to hide.',haz:'Fire and drought sweep it clean.',
 hz:(P,D)=>.05*P.fast+.05*P.social+.04*P.herb+.03*Math.max(0,P.size)-.06*clamp(D.dry/.5,0,2)},
{id:'tundra',n:'Tundra',kind:'land',from:3.4e7,food:.55,pm:.6,cap:.6,era:4,
 d:'Frozen ground and long dark winters. Little lives here, little hunts it.',haz:'Brutal for anything cold-blooded.',
 hz:(P,D)=>.08*P.endo+.04*Math.max(0,P.size)+.05*P.tol-.08*(1-P.endo)}
];
const BIO={};BIOMES.forEach(b=>{BIO[b.id]=b;});
const DEFAULT_BIOME=['vent','shallow','shallow','tidal','forest','grass','grass','grass','grass','grass','grass','grass','grass'];
const biomeExists=(id,ya)=>BIO[id]&&ya<=BIO[id].from;
/* Can this lineage get to this biome now? Water-bound and land-bound lineages reach different places. */
function biomeReach(S,id,P){
  const b=BIO[id];if(!b)return {ok:false,why:'Unknown'};
  const ya=geoYa(S),e=S.era;
  if(ya>b.from)return {ok:false,why:'Does not exist yet ('+fmtYa(b.from)+')'};
  if(e>5)return {ok:false,why:'Your people have settled'};
  if(e<b.era&&b.id!=='tidal'&&b.id!=='shore')return {ok:false,why:'Beyond your reach for now'};
  if(b.kind==='sea'||b.kind==='fresh'){if(P.aq<.35&&e>3)return {ok:false,why:'Too far from the water'};}
  else if(b.kind==='land'){if(e<3||P.aq>.75)return {ok:false,why:'You cannot leave the water yet'};}
  else{if(e<2)return {ok:false,why:'You cannot reach the shore yet'};if(b.era>=3&&e<3)return {ok:false,why:'You cannot leave the water yet'};}
  return {ok:true};
}
