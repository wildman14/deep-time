/* Deep Time: your people's form. From the savanna age on you shape what your creature looks like, and from the first
   settlements on it is shown in a portrait in the corner of the scene. Choices are mostly cosmetic, with small effects.
   No DOM access. */
const FORM_UNLOCK=5; // stage 6, Savanna Fire: your people stand up and become people
const SKINS=[
 {n:'Sand',c:'#e7c093'},{n:'Amber',c:'#cf9560'},{n:'Umber',c:'#9a6038'},{n:'Ebony',c:'#5e3b27'},
 {n:'Moss',c:'#8fb87a'},{n:'Tide',c:'#7ab0cf'},{n:'Dusk',c:'#a98ad3'},{n:'Ember',c:'#d8715c'}];
const EYES=[{n:'Amber',c:'#e8a830'},{n:'Green',c:'#5fd06a'},{n:'Sky',c:'#5fb4ff'},{n:'Violet',c:'#b07cff'},{n:'Crimson',c:'#ff5a5a'},{n:'Silver',c:'#dfe6ee'}];
const FORM_AXES=[
 {id:'body',n:'Body plan',o:[['primate','Primate','Hands, a flat face, a long childhood.',{i:1.03}],['feline','Feline','A hunter\'s face: sharp ears, soft steps.',{t:1.05}],['reptile','Reptile','Cold-blooded patience and a heavy brow.',{bad:.95}],['avian','Avian','Light bones, bright eyes, a beak.',{luck:.03}],['insect','Insectoid','Faceted eyes and mandibles. A hive mind\'s shape.',{g:.97}],['aqua','Aquatic','Gills and wide-set eyes. Born to the water.',{e:1.02}]]},
 {id:'cover',n:'Covering',o:[['smooth','Smooth','Bare skin.'],['fur','Fur','Short, dense fur.'],['scales','Scales','Overlapping scales.'],['feathers','Feathers','Fine feathers.'],['chitin','Chitin','A hard, glossy shell.']]},
 {id:'build',n:'Build',o:[['slight','Slight','Light and quick.',{i:1.03,bad:1.04}],['sturdy','Sturdy','Broad and hard to knock down.',{bad:.93}],['tall','Tall','Long limbs and a long view.',{e:1.04}]]},
 {id:'eyeset',n:'Eyes',o:[['two','Two','A pair.'],['three','Three','A third eye on the brow.'],['four','Four','Two pairs, one above the other.'],['one','One','A single great eye.'],['compound','Compound','Faceted domes on each side.']]},
 {id:'mouth',n:'Mouth',o:[['mouth','Mouth','Lips and teeth.'],['snout','Snout','A muzzle with nostrils.'],['beak','Beak','A hard, pointed beak.'],['mandibles','Mandibles','Hooked jaws that open sideways.']]},
 {id:'ears',n:'Ears',o:[['round','Round','Small and close.'],['large','Large','Wide, listening ears.'],['pointed','Pointed','Tall and alert.'],['none','None','No outer ears.'],['frill','Frills','Fans of thin spines.']]},
 {id:'hair',n:'Crown',o:[['bald','Bare','Nothing on top.'],['crest','Crest','A ridge of stiff hair or feather.'],['mane','Mane','A thick ruff around the head.'],['long','Long','Hair that falls past the shoulders.']]},
 {id:'marks',n:'Markings',o:[['none','Plain','Unmarked.'],['stripes','Stripes','Dark bars across the face.'],['spots','Spots','Pale flecks.'],['glow','Glow','Faint light under the skin.']]},
 {id:'extra',n:'Feature',o:[['none','None','Nothing added.'],['horns','Horns','Curved horns.',{t:1.05}],['mantle','Mantle','A thick fur mantle.',{bad:.95}],['tusks','Tusks','Two short tusks.',{luck:.03}],['antennae','Antennae','Two feelers that never stop moving.',{i:1.03}],['spines','Spines','A row of spines over the head.',{bad:.97}],['frill','Neck frill','A wide frill behind the head.',{c:1.04}]]},
 {id:'arms',n:'Arms',o:[['two','Two','The usual pair.'],['four','Four','A second pair of arms.',{g:.97}]]}
];
const FORM_AX={};FORM_AXES.forEach(a=>{a.o=a.o.map(o=>({id:o[0],n:o[1],d:o[2],fx:o[3]||null}));FORM_AX[a.id]=a;});
const BODY_DEF={primate:{cover:['smooth','fur'],mouth:'mouth'},feline:{cover:['fur'],mouth:'snout'},reptile:{cover:['scales'],mouth:'snout'},avian:{cover:['feathers'],mouth:'beak'},insect:{cover:['chitin'],mouth:'mandibles'},aqua:{cover:['smooth','scales'],mouth:'mouth'}};
function randomForm(){
  const pick=a=>a[Math.floor(Math.random()*a.length)],body=pick(Object.keys(BODY_DEF)),d=BODY_DEF[body];
  return {skin:Math.floor(Math.random()*SKINS.length),eyes:Math.floor(Math.random()*EYES.length),tone:Math.floor(Math.random()*SKINS.length),
    body:body,cover:pick(d.cover),mouth:Math.random()<.8?d.mouth:pick(['mouth','snout','beak','mandibles']),
    eyeset:pick(['two','two','two','three','four','one','compound']),
    build:pick(['slight','sturdy','tall']),hair:pick(['bald','crest','mane','long']),ears:pick(['round','large','pointed','none','frill']),
    marks:pick(['none','none','stripes','spots','glow']),extra:pick(['none','none','horns','mantle','tusks','antennae','spines','frill']),arms:Math.random()<.2?'four':'two'};
}
/* a form from an older save or a half-written one */
function formFix(F){
  const D=randomForm();F=F&&typeof F==='object'?F:{};
  const out={};
  out.skin=(F.skin>=0&&F.skin<SKINS.length)?F.skin|0:D.skin;
  out.eyes=(F.eyes>=0&&F.eyes<EYES.length)?F.eyes|0:D.eyes;
  out.tone=(F.tone>=0&&F.tone<SKINS.length)?F.tone|0:D.tone;
  FORM_AXES.forEach(a=>{out[a.id]=a.o.some(o=>o.id===F[a.id])?F[a.id]:D[a.id];});
  return out;
}
function formFx(S){
  if(!S.form||S.era<FORM_UNLOCK)return null;
  const f={};
  FORM_AXES.forEach(a=>{const o=a.o.find(x=>x.id===S.form[a.id]);if(o&&o.fx)for(const k in o.fx){if(k==='luck')f.luck=(f.luck||0)+o.fx[k];else f[k]=(f[k]||1)*o.fx[k];}});
  return f;
}
const formOpen=S=>S.era>=FORM_UNLOCK;
/* a one-line description of how your people look, for the log and the history */
function formText(S){
  const F=S.form;if(!F)return '';
  const g=(a)=>FORM_AX[a].o.find(o=>o.id===F[a]).n.toLowerCase();
  const b=g('body');return (/^[aeiou]/.test(b)?'an ':'a ')+b+' with '+g('cover')+' ('+SKINS[F.skin].n.toLowerCase()+' tones), '+EYES[F.eyes].n.toLowerCase()+' eyes ('+g('eyeset')+'), a '+g('build')+' build'+(F.extra!=='none'?', '+g('extra'):'')+(F.arms==='four'?', four arms':'');
}
