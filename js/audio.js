/* Deep Time: music and sound. Everything is generated live with the Web Audio API, so there are no audio files to load.
   Music is a slow generative score: a drone and soft notes whose key, scale and mood follow the stage, and which darkens
   when the world is in danger. Sound effects are short synthesized tones. Nothing starts until the first tap or key press,
   because browsers require that. No DOM access except through the Sound object's callers. */
const Sound=(function(){
'use strict';
const KEY='deeptime.audio';
let set={music:true,sfx:true,vol:.7};
try{const j=JSON.parse(localStorage.getItem(KEY));if(j&&typeof j==='object'){if('music' in j)set.music=!!j.music;if('sfx' in j)set.sfx=!!j.sfx;if(typeof j.vol==='number')set.vol=Math.min(1,Math.max(0,j.vol));}}catch(e){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(set));}catch(e){}}

/* mood per stage: root note (MIDI), scale steps, notes per minute, timbre, brightness 0..1, beat (civilization stages get a soft pulse) */
const SC={minp:[0,3,5,7,10],majp:[0,2,4,7,9],dor:[0,2,3,5,7,9,10],lyd:[0,2,4,6,7,9,11],aeo:[0,2,3,5,7,8,10],mix:[0,2,4,5,7,9,10],whole:[0,2,4,6,8,10]};
const MOOD=[
 {r:38,s:SC.whole,n:5,w:'sine',b:.25,beat:0},   // primordial: sparse, strange
 {r:40,s:SC.minp,n:7,w:'sine',b:.3,beat:0},     // colony: bubbly
 {r:41,s:SC.dor,n:8,w:'triangle',b:.4,beat:0},  // sea
 {r:43,s:SC.lyd,n:9,w:'triangle',b:.5,beat:0},  // shore
 {r:40,s:SC.aeo,n:9,w:'triangle',b:.45,beat:0}, // land, swamp
 {r:45,s:SC.mix,n:10,w:'triangle',b:.55,beat:0},// mammals
 {r:43,s:SC.majp,n:11,w:'triangle',b:.55,beat:.15},
 {r:45,s:SC.dor,n:12,w:'triangle',b:.6,beat:.3},
 {r:48,s:SC.mix,n:13,w:'sawtooth',b:.5,beat:.45},
 {r:46,s:SC.dor,n:14,w:'sawtooth',b:.6,beat:.6},
 {r:50,s:SC.lyd,n:12,w:'sine',b:.75,beat:.3},
 {r:47,s:SC.dor,n:10,w:'sine',b:.7,beat:.2},   // colony worlds: wide and quiet
 {r:52,s:SC.majp,n:9,w:'triangle',b:.9,beat:.1} // stellar: bright and vast
];
const mf=m=>440*Math.pow(2,(m-69)/12);
const LIFT=12; // small speakers barely reproduce notes below ~150 Hz, so everything sits an octave higher

let ac=null,master,musicBus,sfxBus,verb,verbSend,droneA,droneB,droneC,droneF,tensionG,timer=null;
let mood=MOOD[0],tension=0,tensionT=0,era=0,nextNote=0,nextBeat=0,beatN=0,lastTap=0,ready=false,started=false;

function impulse(c,secs,decay){
  const n=Math.floor(c.sampleRate*secs),b=c.createBuffer(2,n,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,decay);}
  return b;
}
function build(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{ac=new AC();}catch(e){return false;}
  const comp=ac.createDynamicsCompressor();comp.threshold.value=-18;comp.ratio.value=4;
  master=ac.createGain();master.gain.value=set.vol*1.1;master.connect(comp);comp.connect(ac.destination);
  musicBus=ac.createGain();musicBus.gain.value=set.music?1:0;musicBus.connect(master);
  sfxBus=ac.createGain();sfxBus.gain.value=set.sfx?1:0;sfxBus.connect(master);
  verb=ac.createConvolver();verb.buffer=impulse(ac,3.2,2.6);verbSend=ac.createGain();verbSend.gain.value=.45;verbSend.connect(verb);verb.connect(musicBus);
  // drone: root, fifth, and a dissonant partner that fades in with danger
  droneF=ac.createBiquadFilter();droneF.type='lowpass';droneF.frequency.value=900;droneF.Q.value=.7;
  const dg=ac.createGain();dg.gain.value=.3;droneF.connect(dg);dg.connect(musicBus);dg.connect(verbSend);
  const mk=(type,det,g)=>{const o=ac.createOscillator();o.type=type;o.detune.value=det;const gg=ac.createGain();gg.gain.value=g;o.connect(gg);gg.connect(droneF);o.start();return {o,g:gg};};
  droneA=mk('sawtooth',-6,.5);droneB=mk('sine',4,.8);droneC=mk('triangle',0,.0);
  tensionG=droneC.g;
  const lfo=ac.createOscillator();lfo.frequency.value=.07;const lg=ac.createGain();lg.gain.value=160;lfo.connect(lg);lg.connect(droneF.frequency);lfo.start();
  applyMood(true);
  return true;
}
function applyMood(now){
  if(!ac)return;const t=ac.currentTime,k=now?.01:3;
  const f=mf(mood.r+LIFT);
  droneA.o.frequency.setTargetAtTime(f,t,k);droneB.o.frequency.setTargetAtTime(f*1.5,t,k);
  droneC.o.frequency.setTargetAtTime(f*1.06,t,k); // a minor second above: uneasy
  droneF.frequency.setTargetAtTime(500+mood.b*900-tension*250,t,k);
}
function env(g,t,a,d,peak,end){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.setTargetAtTime(0,t+a,d);return t+a+d*5+(end||0);}
function padNote(t,midi,dur,vol){
  const f=mf(midi),o1=ac.createOscillator(),o2=ac.createOscillator(),g=ac.createGain(),fl=ac.createBiquadFilter();
  o1.type=mood.w;o2.type='sine';o1.frequency.value=f;o2.frequency.value=f*2.003;o1.detune.value=-5;
  fl.type='lowpass';fl.frequency.value=1100+mood.b*2800;fl.Q.value=.5;
  o1.connect(fl);o2.connect(fl);fl.connect(g);g.connect(musicBus);g.connect(verbSend);
  const end=env(g,t,.5+Math.random()*.6,dur*.35,vol);
  o1.start(t);o2.start(t);o1.stop(end);o2.stop(end);
}
function pluck(t,midi,vol){
  const f=mf(midi),o=ac.createOscillator(),g=ac.createGain();
  o.type='sine';o.frequency.setValueAtTime(f*(era<3?.8:1),t);if(era<3)o.frequency.exponentialRampToValueAtTime(f*1.5,t+.12); // watery blip
  o.connect(g);g.connect(musicBus);g.connect(verbSend);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0008,t+.7);
  o.start(t);o.stop(t+.8);
}
function noiseBuf(){if(noiseBuf.b)return noiseBuf.b;const n=ac.sampleRate,b=ac.createBuffer(1,n,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;return noiseBuf.b=b;}
function tick(t,vol,hp){
  const s=ac.createBufferSource();s.buffer=noiseBuf();const f=ac.createBiquadFilter();f.type='highpass';f.frequency.value=hp;const g=ac.createGain();
  s.connect(f);f.connect(g);g.connect(musicBus);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+.05);s.start(t);s.stop(t+.08);
}
function thump(t,vol){
  const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(42,t+.14);
  o.connect(g);g.connect(musicBus);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0005,t+.22);o.start(t);o.stop(t+.25);
}
function scaleNote(oct){const s=mood.s;return mood.r+LIFT+12*oct+s[Math.floor(Math.random()*s.length)];}
function schedule(){
  if(!ac||ac.state!=='running'||!set.music)return;
  const t=ac.currentTime;
  tension+=(tensionT-tension)*.25;
  tensionG.gain.setTargetAtTime(tension*.55,t,2);
  droneF.frequency.setTargetAtTime(500+mood.b*900-tension*250,t,2);
  while(nextNote<t+.6){
    const at=Math.max(nextNote,t+.02);
    const r=Math.random();
    if(r<.55)padNote(at,scaleNote(1+(Math.random()<.4?1:0)),6+Math.random()*4,.11*(1-tension*.3));
    else pluck(at,scaleNote(1+(Math.random()<.5?1:0)),.085*(1-tension*.5));
    if(tension>.5&&Math.random()<.4)padNote(at+.2,mood.r+LIFT+13,7,.08*tension); // a note that does not belong
    nextNote=at+(60/mood.n)*(.6+Math.random()*.9)*(1+tension*.4);
  }
  if(mood.beat>0){
    const step=60/(70+era*3)/2;
    while(nextBeat<t+.4){
      const at=Math.max(nextBeat,t+.02),k=beatN%8;
      if(k===0||k===4)thump(at,.16*mood.beat*2);
      if(k%2===1)tick(at,.05*mood.beat,6500);
      beatN++;nextBeat=at+step;
    }
  }else nextBeat=t;
}

/* sound effects */
function tone(f,dur,o){
  if(!ac||!set.sfx||ac.state!=='running')return;o=o||{};
  const t=ac.currentTime+(o.at||0),osc=ac.createOscillator(),g=ac.createGain();
  osc.type=o.type||'sine';osc.frequency.setValueAtTime(f,t);if(o.to)osc.frequency.exponentialRampToValueAtTime(o.to,t+dur);
  osc.connect(g);g.connect(sfxBus);if(o.verb){const s=ac.createGain();s.gain.value=o.verb;g.connect(s);s.connect(verbSend);}
  const v=o.v||.15;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+(o.a||.008));g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  osc.start(t);osc.stop(t+dur+.05);
}
function noise(dur,o){
  if(!ac||!set.sfx||ac.state!=='running')return;o=o||{};
  const t=ac.currentTime+(o.at||0),s=ac.createBufferSource();s.buffer=noiseBuf();s.loop=true;
  const f=ac.createBiquadFilter();f.type=o.f||'lowpass';f.frequency.setValueAtTime(o.from||400,t);if(o.to)f.frequency.exponentialRampToValueAtTime(o.to,t+dur);
  const g=ac.createGain();s.connect(f);f.connect(g);g.connect(sfxBus);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(o.v||.2,t+(o.a||.02));g.gain.exponentialRampToValueAtTime(.0005,t+dur);
  s.start(t);s.stop(t+dur+.05);
}
const pent=[0,2,4,7,9];
const SFX={
  tap(){const n=pent[Math.floor(Math.random()*5)],f=mf(mood.r+36+n);
    if(era<3)tone(f*.7,.16,{to:f*1.3,v:.09});            // a bubble
    else if(era<6)tone(f,.12,{type:'triangle',v:.1});       // wood
    else{tone(f*2,.07,{type:'square',v:.03});tone(f,.14,{v:.07});}},
  buy(){const f=mf(mood.r+36);tone(f,.12,{type:'triangle',v:.1});tone(f*1.5,.18,{type:'triangle',v:.1,at:.07});},
  adapt(){const f=mf(mood.r+36);[0,4,7,12].forEach((s,i)=>tone(f*Math.pow(2,s/12),.25,{type:'triangle',v:.09,at:i*.06,verb:.3}));},
  research(){const f=mf(mood.r+48);[0,7,12].forEach((s,i)=>tone(f*Math.pow(2,s/12),.3,{v:.08,at:i*.09,verb:.5}));},
  tab(){tone(mf(mood.r+48),.04,{type:'triangle',v:.04});},
  evolve(){const f=mf(mood.r+24);noise(1.2,{type:'bandpass',f:'bandpass',from:200,to:3000,v:.12,a:.3});
    [0,4,7,12,16].forEach((s,i)=>tone(f*Math.pow(2,s/12),1.6,{v:.08,at:.25+i*.12,a:.05,verb:.7,type:'triangle'}));},
  omen(){const f=mf(mood.r+24);tone(f,1.6,{v:.1,verb:.8,a:.05});tone(f*Math.pow(2,6/12),1.8,{v:.07,at:.3,verb:.8,a:.05});},
  alert(){const f=mf(mood.r+36);tone(f,.4,{v:.1,verb:.5});tone(f*1.335,.5,{v:.1,at:.22,verb:.5});},
  extinct(){noise(3,{from:300,to:50,v:.35,a:.1});tone(mf(mood.r),3.2,{to:mf(mood.r-12),v:.18,type:'sawtooth',a:.2,verb:.6});
    tone(mf(mood.r+7),2.6,{to:mf(mood.r-5),v:.1,type:'triangle',at:.4,verb:.6});},
  survive(){const f=mf(mood.r+24);[0,7,12,16].forEach((s,i)=>tone(f*Math.pow(2,s/12),2,{v:.08,at:i*.15,a:.06,verb:.8,type:'triangle'}));},
  mutate(){const f=mf(mood.r+60);[0,3,7,10,12].forEach((s,i)=>tone(f*Math.pow(2,s/12),.2,{v:.05,at:i*.05,verb:.6}));},
  migrate(){noise(1,{f:'bandpass',from:300,to:1800,v:.14,a:.25});},
  branch(){const f=mf(mood.r+36);tone(f,.3,{v:.09,verb:.4,type:'triangle'});tone(f*1.26,.35,{v:.09,at:.1,verb:.4,type:'triangle'});tone(f*1.5,.4,{v:.09,at:.2,verb:.4,type:'triangle'});},
  radiate(){const f=mf(mood.r+36);for(let i=0;i<7;i++)tone(f*Math.pow(2,pent[i%5]/12+(i>4?1:0)),.4,{v:.06,at:i*.07,verb:.6});},
  bad(){tone(mf(mood.r+24),.25,{to:mf(mood.r+17),v:.08,type:'triangle'});}
};
function sfx(name){
  if(!ready||!set.sfx)return;
  if(name==='tap'){const n=performance.now();if(n-lastTap<45)return;lastTap=n;}
  const f=SFX[name];if(f){try{f();}catch(e){}}
}

/* public */
function unlock(){
  if(ready){if(ac&&ac.state!=='running'){try{ac.resume();}catch(e){}if(ac.state==='running'&&nextNote<ac.currentTime)nextNote=ac.currentTime+.5;}return;}
  if(!build())return;ready=true;
  nextNote=ac.currentTime+.8;nextBeat=ac.currentTime+1;
  if(!timer)timer=setInterval(schedule,250);
  try{ac.resume();}catch(e){}
  started=true;
  setTimeout(()=>{if(ac&&ac.state==='running'&&set.sfx)SFX.survive();},350);
}
/* called often with the game state: sets the mood. cheap. */
function setMood(S){
  if(!S)return;
  const e=Math.max(0,Math.min(MOOD.length-1,S.era));
  let tn=0;
  const L=S.life;if(L&&L.ev){for(const ev of L.ev){const d=typeof EVD!=='undefined'&&EVD[ev.id];if(d&&d.sev){const w=d.big?1:d.sev>.3?.6:.3;tn=Math.max(tn,w);}}}
  tensionT=tn;
  if(e!==era||mood!==MOOD[e]){era=e;mood=MOOD[e];if(ac)applyMood(false);}
}
function config(p){
  if(p){
    if('music' in p)set.music=!!p.music;if('sfx' in p)set.sfx=!!p.sfx;if('vol' in p)set.vol=Math.min(1,Math.max(0,p.vol));
    persist();
    if(ac){const t=ac.currentTime;musicBus.gain.setTargetAtTime(set.music?1:0,t,.3);sfxBus.gain.setTargetAtTime(set.sfx?1:0,t,.05);master.gain.setTargetAtTime(set.vol*1.1,t,.05);}
  }
  return {music:set.music,sfx:set.sfx,vol:set.vol,ok:!!(window.AudioContext||window.webkitAudioContext)};
}
/* pause when the tab is hidden */
document.addEventListener('visibilitychange',()=>{if(!ac)return;if(document.hidden)ac.suspend();else if(ready)ac.resume();});
function state(){return ac?ac.state:'idle';}
return {unlock,setMood,config,sfx,state};
})();
