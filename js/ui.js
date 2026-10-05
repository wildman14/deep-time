/* Deep Time: interface, save/load, main loop. */
(function(){
'use strict';
const KEY='deeptime.v1';
const $=s=>document.querySelector(s);
const el=(t,cls,txt)=>{const e=document.createElement(t);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
const pad=n=>String(n).padStart(2,'0');
const mmss=s=>{s=Math.floor(s);const h=Math.floor(s/3600),m=Math.floor(s%3600/60),r=s%60;return h?h+':'+pad(m)+':'+pad(r):m+':'+pad(r);};
const listJoin=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' and '+a[a.length-1];
const RM=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const speed=RM?.2:1;

let S=null,buyMode=1,modalOpen=false,pulse=0,anim=0,last=Date.now(),lastUI=0,lastSave=0,floaters=[],dirtyLog=true,charKey='';
let traitRows=[],upgRows=[];
let flash=0;
const tv={tech:'S',civ:'K'};
const treeRefs={tech:[],civ:[]},branchRefs={tech:[],civ:[]};
const IDS={tech:{tree:'#techTree',br:'#techBranches',bal:'#techBal',tab:'#tab-tech'},civ:{tree:'#civTree',br:'#civBranches',bal:'#civBal',tab:'#tab-civic'}};
const cv=$('#cv'),ctx=cv.getContext('2d');

function fit(){const r=cv.getBoundingClientRect();if(!r.width||!r.height)return;const d=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d);ctx.setTransform(d,0,0,d,0,0);setCtx(ctx,r.width,r.height);}
if(window.ResizeObserver)new ResizeObserver(fit).observe(cv);else window.addEventListener('resize',fit);

let tt=null;
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),4200);}
function save(){S.saved=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S));}catch(e){}}
function load(){try{const j=localStorage.getItem(KEY);if(j){const s=JSON.parse(j);if(s&&s.v===1)return s;}}catch(e){}return null;}
function addLog(x){S.log.unshift({t:S.play,x:x});if(S.log.length>80)S.log.length=80;dirtyLog=true;}

/* modal */
function openModal(m){
  modalOpen=true;const card=$('#card');card.textContent='';
  card.append(el('div','kicker',m.kicker||''));
  const h=el('h2','',m.title);h.id='mtitle';card.append(h);
  if(m.body)card.append(el('p','',m.body));
  let inp=null;
  if(m.input){const w=el('div');const l=el('label','',m.input.label);l.htmlFor=m.input.id;inp=document.createElement('input');inp.id=m.input.id;inp.type='text';inp.maxLength=m.input.max||18;inp.placeholder=m.input.placeholder||'';inp.autocomplete='off';w.append(l,inp);card.append(w);}
  const act=el('div','actions');let first=null;
  m.actions.forEach(a=>{const b=el('button','btn'+(a.primary?' primary':'')+(a.danger?' danger':''));b.type='button';b.append(el('span','',a.label));if(a.desc)b.append(el('small','',a.desc));b.addEventListener('click',()=>a.fn());act.append(b);if(first===null||a.primary)first=b;});
  card.append(act);
  if(inp)inp.addEventListener('keydown',e=>{if(e.key==='Enter'){const p=card.querySelector('.btn.primary');if(p)p.click();}});
  $('#modal').hidden=false;
  setTimeout(()=>{(inp||first).focus();},30);
}
function closeModal(){$('#modal').hidden=true;modalOpen=false;}

/* theme + build */
function applyTheme(){const E=ERAS[S.era],r=document.documentElement.style;r.setProperty('--h',E.h);r.setProperty('--ah',E.ah);r.setProperty('--s',(E.s||45)+'%');}
function renderSpecies(){const sp=$('#species');sp.textContent='';sp.append('The ',el('b','',S.name));if(S.lineage)sp.append(' · '+LINEAGES[S.lineage].n);}
function makeRow(name,desc){
  const root=el('div','row');const info=el('div');const h=el('h3','',name),p=el('p','',desc),meta=el('div','meta');info.append(h,p,meta);
  const btn=el('button','buy');btn.type='button';const bl=el('span','bl'),bc=el('span','bc');btn.append(bl,bc);root.append(info,btn);
  return {root,meta,btn,bl,bc};
}
function buildLists(){
  const e=S.era,E=ERAS[e];
  const tl=$('#traitList');tl.textContent='';traitRows=[];
  E.gens.forEach((g,i)=>{const r=makeRow(g.n,g.d);r.btn.addEventListener('click',()=>{const had=S.gens[gk(e,i)]||0;if(buyGen(S,e,i,buyMode)){flash=1;if(had===0)addLog(ERAS[e].gens[i].n+': '+LOOKS.g[e][i]);refresh();}});tl.append(r.root);traitRows.push(r);});
  const al=$('#adaptList');al.textContent='';upgRows=[];
  E.upg.forEach((u,j)=>{const r=makeRow(u.n,u.d);r.btn.addEventListener('click',()=>{if(buyUpg(S,e,j)){flash=1;addLog(ERAS[e].upg[j].n+': '+LOOKS.a[e][j]);refresh();}});al.append(r.root);upgRows.push(r);});
}
function buildStrata(){const ol=$('#strata');ol.textContent='';ERAS.forEach(E=>{const li=document.createElement('li');li.title=E.name;ol.append(li);});}
function buildBranches(kind){
  const T=TREES[kind],box=$(IDS[kind].br);box.textContent='';branchRefs[kind]=[];
  T.branches.forEach(b=>{
    const btn=el('button','branch');btn.type='button';btn.append(el('b','',b.name),el('span','',b.tag));
    const dots=el('div','dots');const ds=b.tiers.map(()=>{const i=document.createElement('i');dots.append(i);return i;});btn.append(dots);
    btn.addEventListener('click',()=>{tv[kind]=b.id;buildTree(kind);refresh();});
    box.append(btn);branchRefs[kind].push({b,btn,ds});
  });
}
function buildTree(kind){
  const T=TREES[kind],box=$(IDS[kind].tree);box.textContent='';treeRefs[kind]=[];
  const br=T.branches.find(b=>b.id===tv[kind]);
  br.tiers.forEach((opts,t)=>{
    const tier=el('div','tier');
    tier.append(el('div','tier-h','Tier '+(t+1)+' · Stage '+(T.gate[t]+1)+(opts.length>1?' · choose one':'')));
    const og=el('div','opts');const refs=[];
    opts.forEach(n=>{
      const card=el('div','node');const btn=el('button','buy');btn.type='button';const bl=el('span','bl'),bc=el('span','bc');btn.append(bl,bc);
      btn.addEventListener('click',()=>{
        const r=buyNode(S,kind,n.id);
        if(r){addLog((r==='switch'?'Changed course to ':kind==='tech'?'Researched ':'Adopted ')+n.n+'. '+LOOKS.n[n.branch]);flash=1;save();refresh();}
      });
      card.append(el('h4','',n.n),el('p','',n.d),el('div','fx',fxText(n.fx)),btn);og.append(card);refs.push({n,card,btn,bl,bc});
    });
    tier.append(og);box.append(tier);treeRefs[kind].push({tier,refs});
  });
}
function buildEra(){
  const E=ERAS[S.era];applyTheme();
  $('#stageNo').textContent='Stage '+pad(S.era+1)+' / '+pad(ERAS.length);
  $('#eraName').textContent=E.name;$('#eraWhen').textContent=E.when;$('#fig').textContent=E.fig;
  $('#tapLabel').textContent=E.tap+' '+E.unit;$('#stockK').textContent=E.unit;
  [...$('#strata').children].forEach((li,i)=>{li.className=i<S.era?'done':i===S.era?'now':'';});
  buildLists();renderSpecies();
}
function buildAll(){buildStrata();buildBranches('tech');buildBranches('civ');buildTree('tech');buildTree('civ');buildEra();}
function renderLog(){
  const ul=$('#logList');ul.textContent='';
  if(!S.log.length){ul.append(el('li','empty','Nothing has happened yet.'));}
  else S.log.forEach(l=>{const li=document.createElement('li');li.append(el('span','when',mmss(l.t)),el('span','',l.x));ul.append(li);});
  dirtyLog=false;
}
function renderChar(){
  const box=$('#charBox');box.textContent='';charKey=S.marks.join(',');
  if(!S.marks.length)return;
  box.append(el('div','k','Character'));
  const w=el('div','chips');
  S.marks.forEach(id=>{const m=MARKS[id];if(!m)return;const c=el('div','chip',m.n);c.append(' ',el('small','',fxText(m.fx)));w.append(c);});
  box.append(w);
}

function nodeButton(r,st,res,T){
  const can=res>=st.cost;
  if(st.st==='owned'){r.card.className='node owned';r.bl.textContent='Chosen';r.bc.textContent='';r.btn.disabled=true;r.btn.classList.remove('can');}
  else if(st.st==='locked'){r.card.className='node locked';r.bl.textContent='Locked';r.bc.textContent=st.why;r.btn.disabled=true;r.btn.classList.remove('can');}
  else{r.card.className='node';r.bl.textContent=st.st==='switch'?'Switch to this':T.verb;r.bc.textContent=fmt(st.cost);r.btn.disabled=!can;r.btn.classList.toggle('can',can);}
}
function refreshTrees(){
  ['tech','civ'].forEach(kind=>{
    const T=TREES[kind],res=S[resKey(kind)];
    $(IDS[kind].bal).textContent=(kind==='civ'&&S.era<1)?'Unlocks in stage 2':T.res+' '+fmt(res);
    branchRefs[kind].forEach(r=>{
      r.btn.setAttribute('aria-pressed',tv[kind]===r.b.id?'true':'false');
      r.b.tiers.forEach((opts,t)=>{
        const own=opts.some(n=>S[kind][n.id]);
        const open=!own&&opts.some(n=>nodeState(S,n).st==='ok');
        r.ds[t].className=own?'on':open?'open':'';
      });
    });
    treeRefs[kind].forEach(tr=>{
      let has=false;
      tr.refs.forEach(r=>{const st=nodeState(S,r.n);if(st.st==='owned')has=true;nodeButton(r,st,res,T);});
      tr.tier.classList.toggle('has',has);
    });
    $(IDS[kind].tab).dataset.alert=affordableNodes(S,kind)>0?'1':'0';
  });
}

function refresh(){
  const e=S.era,E=ERAS[e],ps=perSec(S),gm=globalMult(S),cost=advCostFor(S),ef=(S.focus==='society'&&e<1)?'balanced':S.focus;
  $('#stock').textContent=fmt(S.energy);$('#pps').textContent=fmt(ps,1);$('#age').textContent=mmss(S.play);
  $('#tapGain').textContent='+'+fmt(tapVal(S),1);
  $('#ins').textContent=fmt(S.ins);$('#insR').textContent='+'+fmt(insightPerSec(S),2)+'/s';
  if(e<1){$('#coh').textContent='—';$('#cohR').textContent='from stage 2';}
  else{$('#coh').textContent=fmt(S.coh);$('#cohR').textContent='+'+fmt(cohPerSec(S),2)+'/s';}
  $('#appr').textContent=S.approach?APPROACH[S.approach].n:'None';
  [...$('#focus').children].forEach(b=>{const f=b.dataset.f;b.setAttribute('aria-pressed',ef===f?'true':'false');if(f==='society')b.disabled=e<1;});
  $('#focusDesc').textContent=FOCUS[ef].d+(e<1?' Society unlocks in stage 2.':'');
  $('#apprDesc').textContent=S.approach?'Approach this stage: '+APPROACH[S.approach].n+'. '+APPROACH[S.approach].d:'Choose an approach for this stage.';
  const pct=Math.min(1,S.energy/cost);$('#meter').style.width=(pct*100).toFixed(1)+'%';$('#pct').textContent=Math.floor(pct*100)+'%';
  const eb=$('#evolveBtn'),ready=canEvolve(S);
  eb.disabled=!ready;eb.classList.toggle('ready',ready);
  if(S.won&&e===ERAS.length-1){$('#evoLabel').textContent='Ark launched';$('#evoCost').textContent='';}
  else{$('#evoLabel').textContent=E.next;$('#evoCost').textContent=fmt(cost)+' '+E.unit;}
  const b=$('#buff');if(S.buff.left>0){b.hidden=false;b.textContent='×'+S.buff.m+' · '+Math.ceil(S.buff.left)+'s';}else b.hidden=true;
  traitRows.forEach((r,i)=>{
    const n=S.gens[gk(e,i)]||0,mx=maxBuy(S,e,i),k=buyMode==='max'?Math.max(1,mx):buyMode,c=genCost(S,e,i,k),can=S.energy>=c;
    r.bl.textContent='Add ×'+k;r.bc.textContent=fmt(c);r.btn.classList.toggle('can',can);r.btn.disabled=!can;
    r.meta.textContent='Owned '+n+' · +'+fmt(genRate(e,i)*eraMult(S,e,i)*gm,2)+'/s each';
  });
  let got=0;
  upgRows.forEach((r,j)=>{
    const has=!!S.upg[gk(e,j)];if(has)got++;
    r.root.classList.toggle('done',has);
    if(has){r.bl.textContent='Acquired';r.bc.textContent='';r.btn.disabled=true;r.btn.classList.remove('can');}
    else{const c=upgCost(S,e,j),can=S.energy>=c;r.bl.textContent='Acquire';r.bc.textContent=fmt(c);r.btn.classList.toggle('can',can);r.btn.disabled=!can;}
  });
  $('#adaptCount').textContent=got+' / '+ERAS[e].upg.length;
  refreshTrees();
  if(charKey!==S.marks.join(','))renderChar();
  if(dirtyLog)renderLog();
}

/* actions */
function doTap(x,y){
  const v=tapVal(S);S.energy+=v;S.total+=v;S.taps++;pulse=1;
  const r=cv.getBoundingClientRect();
  floaters.push({x:x!=null?x:r.width*(.4+Math.random()*.2),y:y!=null?y:r.height*.45,t:0,txt:'+'+fmt(v,1)});
  if(floaters.length>24)floaters.shift();
}
function evolve(){
  const r=doEvolve(S);if(!r)return;
  if(r===2){addLog('The Interstellar Ark leaves orbit.');winModal();save();refresh();return;}
  addLog('Evolved into '+ERAS[S.era].name+'.');
  const sc=$('#scene');sc.classList.remove('flash');void sc.offsetWidth;sc.classList.add('flash');
  buildEra();refresh();introModal();save();
}
function introModal(){
  const E=ERAS[S.era];
  openModal({kicker:'Stage '+pad(S.era+1)+' of '+pad(ERAS.length)+' · '+E.when,title:E.name,body:E.intro,actions:[{label:'Continue',primary:true,fn:()=>{closeModal();afterIntro();}}]});
}
function afterIntro(){if(S.era===4&&!S.lineage)lineageModal();else approachModal();}
function lineageModal(){
  openModal({kicker:'A branch in the tree',title:'Choose your lineage',body:'Small mammals took many paths. The one you pick shapes everything after.',
    actions:Object.keys(LINEAGES).map(k=>({label:LINEAGES[k].n,desc:LINEAGES[k].d,fn:()=>{S.lineage=k;addLog('The '+S.name+' become '+LINEAGES[k].n+'s.');renderSpecies();refresh();save();approachModal();}}))});
}
function approachModal(){
  openModal({kicker:'Stage '+pad(S.era+1)+' · '+ERAS[S.era].name,title:'Choose your approach',body:'How will your people meet this stage? The choice holds until you evolve again.',
    actions:Object.keys(APPROACH).map(k=>({label:APPROACH[k].n,desc:APPROACH[k].d,fn:()=>{S.approach=k;addLog('Approach for '+ERAS[S.era].name+': '+APPROACH[k].n+'.');closeModal();refresh();save();}}))});
}
function winModal(){
  openModal({kicker:'Stage 11 complete',title:'Where will the Ark go?',body:'Everything your lineage learned is aboard. A star is the last choice you make as a single world.',
    actions:DESTS.map(d=>({label:d.n,desc:d.d,fn:()=>epilogue(d)}))});
}
function epilogue(d){
  const ch=character(S);let body=d.t;
  if(ch.adj.length)body+=' The Ark carried a '+listJoin(ch.adj)+' people.';
  if(ch.marks.length)body+=' They were remembered as '+listJoin(ch.marks)+'.';
  body+=' It took '+mmss(S.play)+' of play and '+S.taps.toLocaleString()+' taps to get here.';
  addLog('The Ark sets course for '+d.n+'.');save();
  openModal({kicker:'Epilogue · '+S.name,title:d.title,body:body,
    actions:[{label:'Keep playing',desc:'Your civilization keeps growing in orbit.',fn:()=>{closeModal();refresh();}},{label:'Begin a new life',primary:true,fn:resetGame}]});
}
function startModal(){
  openModal({kicker:'Deep Time',title:'Name your first cell',
    body:'You begin as a single cell in a young sea. Feed it, shape it with innovations and customs, and make the hard choices as they come. Carry your lineage from one cell to the stars.',
    input:{id:'sname',label:'Species name',placeholder:'Luma',max:18},
    actions:[{label:'Begin',primary:true,fn:()=>{const v=($('#sname').value||'').trim()||'Luma';S.name=v;addLog('The first cell of the '+v+' lineage divides.');renderSpecies();save();approachModal();}}]});
}
function resetGame(){S=newState();try{localStorage.removeItem(KEY);}catch(e){}floaters=[];dirtyLog=true;tv.tech='S';tv.civ='K';charKey='';buildAll();renderChar();refresh();startModal();}
function confirmReset(){
  openModal({kicker:'Start over',title:'Erase this lineage?',body:'Your progress will be deleted and you will begin again as a single cell.',
    actions:[{label:'Keep my lineage',primary:true,fn:closeModal},{label:'Erase and restart',danger:true,fn:resetGame}]});
}
function fireEvent(){
  const ev=pickEvent(S);
  if(!ev){S.evt=40;return;}
  if(ev.once)S.seen[ev.id]=true;
  openModal({kicker:(ev.once?'Decision':'Event')+' · '+ERAS[S.era].name,title:ev.title,body:ev.text,
    actions:ev.opts.map(o=>({label:o.l,desc:o.d,fn:()=>{
      const res=applyFx(S,o.fx).filter(Boolean);
      addLog(ev.title+': '+o.l+'. '+res.join(' '));S.evt=45+Math.random()*30;
      openModal({kicker:'Outcome',title:ev.title,body:res.join(' ')||'Nothing changed.',actions:[{label:'Continue',primary:true,fn:()=>{closeModal();refresh();}}]});
      refresh();save();
    }}))});
}
function awayGain(dt){
  S.buff.left=0;const capped=Math.min(dt,3600);const amt=perSec(S)*capped*.6;
  S.energy+=amt;S.total+=amt;S.ins+=insightPerSec(S)*capped*.6;S.coh+=cohPerSec(S)*capped*.6;S.play+=capped;S.evt=Math.max(S.evt,20);
  if(dt>30&&amt>0)toast('While you were away: +'+fmt(amt)+' '+ERAS[S.era].unit);
}

/* canvas feedback + loop */
function drawFloaters(dt){
  ctx.font='500 15px "DM Mono", monospace';ctx.textAlign='center';
  floaters=floaters.filter(f=>{f.t+=dt;if(f.t>1)return false;ctx.globalAlpha=1-f.t;ctx.fillStyle='#fff';ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=3;ctx.strokeText(f.txt,f.x,f.y-f.t*44);ctx.fillText(f.txt,f.x,f.y-f.t*44);ctx.globalAlpha=1;return true;});
}
function frame(){
  const now=Date.now();let dt=(now-last)/1000;last=now;
  if(dt>3){awayGain(dt);dt=0;}else if(dt>0)tick(S,dt);
  if(S.evt<=0&&!modalOpen)fireEvent();
  anim+=dt*speed;pulse=Math.max(0,pulse-dt*3);flash=Math.max(0,flash-dt*1.5);
  if(!document.hidden){try{const V=lookOf(S);V.flash=flash;drawScene(S.era,anim,ownedIn(S,S.era),pulse,S.lineage,V);drawFloaters(dt);}catch(e){}}
  if(now-lastUI>200){lastUI=now;refresh();}
  if(now-lastSave>5000){lastSave=now;save();}
  requestAnimationFrame(frame);
}

/* wiring */
$('#tap').addEventListener('click',()=>doTap());
cv.addEventListener('pointerdown',e=>{const r=cv.getBoundingClientRect();doTap(e.clientX-r.left,e.clientY-r.top);});
$('#evolveBtn').addEventListener('click',evolve);
$('#resetBtn').addEventListener('click',confirmReset);
document.addEventListener('keydown',e=>{
  if(e.code!=='Space'||modalOpen)return;
  const t=e.target;if(t&&t.matches&&t.matches('input,textarea,button,[role=tab]'))return;
  e.preventDefault();doTap();
});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&S)save();});
window.addEventListener('pagehide',()=>{if(S)save();});
$('#amt').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;buyMode=b.dataset.m==='max'?'max':+b.dataset.m;[...$('#amt').children].forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));refresh();});
$('#focus').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;S.focus=b.dataset.f;refresh();save();});
const tabs=['traits','adapt','tech','civic','log'];
tabs.forEach(n=>{$('#tab-'+n).addEventListener('click',()=>{tabs.forEach(m=>{const on=m===n;$('#tab-'+m).setAttribute('aria-selected',on?'true':'false');$('#p-'+m).hidden=!on;});if(n==='log')renderLog();});});

function start(data){
  const hot=data&&data.S;const saved=hot||load();
  if(saved){
    S=Object.assign(newState(),saved);
    S.buff=S.buff||{m:1,left:0};S.gens=S.gens||{};S.upg=S.upg||{};S.log=S.log||[];S.tech=S.tech||{};S.civ=S.civ||{};S.marks=S.marks||[];S.seen=S.seen||{};
    if(!FOCUS[S.focus])S.focus='balanced';
    if(!hot){const away=(Date.now()-(S.saved||Date.now()))/1000;if(away>30)awayGain(away);}
  }else S=newState();
  buildAll();fit();renderChar();refresh();renderLog();
  if(!saved)startModal();
  else if(!S.approach&&!hot)setTimeout(()=>{if(!modalOpen)approachModal();},400);
  last=Date.now();requestAnimationFrame(frame);
}
start({});
})();
