/* Deep Time: interface for the Earth, lineage and history systems. Builds the Lineage, World and History tabs,
   the Earth bar, the event prompts, the tree and the history book. ui.js calls init() once, then refresh() and pump(). */
const LifeUI=(function(){
'use strict';
let A=null,hv='tree',onlyMajor=false;
const el=(t,cls,txt)=>{const e=document.createElement(t);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e;};
const $=s=>document.querySelector(s);
const sig={};
const pct=v=>(v>=0?'+':'')+Math.round(v*100)+'%';
const KIND_LABEL=FOSSIL_KINDS;
const OMEN_LABEL={promising:'Looks promising',worrying:'Looks costly',curious:'Effect unclear'};
let P_lin,P_wd,P_hs,earthBar,ec={};
const ln={},wd={},hs={};

function init(api){
  A=api;P_lin=$('#p-lineage');P_wd=$('#p-world');P_hs=$('#p-history');earthBar=$('#earthBar');
  // lineage skeleton
  ['head','axes','mut','br'].forEach(k=>{ln[k]=el('div','sec');P_lin.append(ln[k]);});
  ['cond','ev','eco','bio'].forEach(k=>{wd[k]=el('div','sec');P_wd.append(wd[k]);});
  hs.seg=el('div','seg3');[['tree','Tree'],['fossil','Fossils'],['book','Summary']].forEach(x=>{const b=el('button','',x[1]);b.type='button';b.dataset.v=x[0];b.addEventListener('click',()=>{hv=x[0];sig.hs='';refresh(true);});hs.seg.append(b);});
  hs.body=el('div','sec');P_hs.append(el('div','sec'));P_hs.firstChild.append(hs.seg);P_hs.append(hs.body);
  ['Temp','O₂','CO₂','Sea','Habitat','Omens'].forEach((k,i)=>{const s=el('span','ec');s.append(k+' ',el('b','','—'));earthBar.append(s);ec[i]=s;});
}
const speciesText=S=>{const m=S.life&&mainSp(S);return m?m.n:'';};

/* ---------- earth bar ---------- */
function bar(S){
  const L=S.life,E=earthNow(S),b=BIO[L.biome];
  const set=(i,t,cls)=>{const s=ec[i];s.firstChild.nodeValue=t[0];s.lastChild.textContent=t[1];s.className='ec'+(cls?' '+cls:'');};
  const arrow=k=>{const t=earthTrend(E,k);return t==='rising'?' ▲':t==='falling'?' ▼':'';};
  set(0,['Temp ',Math.round(E.temp)+'°C'+arrow('temp')]);
  set(1,['O₂ ',E.o2.toFixed(E.o2<10?1:0)+'%'+arrow('o2')]);
  set(2,['CO₂ ',E.co2>=1000?(E.co2/1000).toFixed(1)+'k':Math.round(E.co2)]);
  set(3,['Sea ',(E.sea>=0?'+':'')+Math.round(E.sea)+'m'+arrow('sea')]);
  set(4,['',b?b.n:'']);
  if(L.ev.length){const d=EVD[L.ev[0].id];const big=L.ev.some(e=>EVD[e.id].big);set(5,['Omens: ',evTitle(L.ev[0])],big?'warn':'ok');ec[5].hidden=false;}
  else ec[5].hidden=true;
}

/* ---------- lineage ---------- */
function reasonPills(T){
  const w=document.createElement('div');w.className='why';
  const s=T.slice().sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).slice(0,5);
  if(!s.length)w.append(el('span','pill','Nothing is pressing on you right now'));
  s.forEach(t=>w.append(el('span','pill '+(t.v>0?'pos':'neg'),t.l+' '+pct(t.v))));
  return w;
}
function lineageHead(S,force){
  const L=S.life,m=mainSp(S),key='h'+L.main+'|'+(m&&m.n)+'|'+L.biome+'|'+S.era+'|'+L.ended;
  if(force||sig.lh!==key){
    sig.lh=key;const h=ln.head;h.textContent='';
    const c=el('div','spcard');const r=el('div','row2');r.append(el('div','spname',m?m.n:'Your lineage'));
    const rn=el('button','mini','Rename');rn.type='button';rn.addEventListener('click',()=>renameModal(S,L.main));r.append(rn);c.append(r);
    ln.sub=el('p','sub');ln.fit=el('p','sub');ln.why=el('div');c.append(ln.sub,ln.fit,ln.why);h.append(c);
  }
  const f=mainFit(S),b=BIO[L.biome];
  ln.sub.textContent=ERAS[S.era].name+' · living in the '+b.n.toLowerCase()+' · '+Object.keys(L.colonized).length+' habitat'+(Object.keys(L.colonized).length===1?'':'s')+' settled';
  ln.fit.textContent='Fit with the world: '+(f.env>=1?'+':'')+Math.round((f.env-1)*100)+'% production'+(L.rec<.97?' · recovering ('+Math.round(L.rec*100)+'%)':'')+(L.surge>1.03?' · new niches +'+Math.round((L.surge-1)*100)+'%':'');
  const w=reasonPills(f.T);ln.why.textContent='';ln.why.append(w);
}
function axesBuild(S){
  const L=S.life,h=ln.axes;h.textContent='';ln.opts=[];
  const hh=el('div','sec-h');hh.append(el('h3','','Strategies'),el('span','k',S.era>MAX_GENOME_ERA?'Locked in':'One per row'));h.append(hh);
  h.append(el('p','sub','Every strategy has a price. What helps today can hurt when the world changes. The note under each one says how it would fare in the world as it is right now, not as it will be.'));
  AXES.forEach(ax=>{
    if(S.era<ax.min)return;
    const box=el('div','axis');box.append(el('h4','',ax.n));const og=el('div','opts');
    ax.o.forEach(o=>{
      const card=el('div','node');const btn=el('button','buy');btn.type='button';const bl=el('span','bl'),bc=el('span','bc');btn.append(bl,bc);
      const suit=el('div','suit');
      btn.addEventListener('click',()=>{const r=lifeBuyOpt(S,o.id);if(r){Sound.sfx('adapt');A.addLog((r==='switch'?'Changed course: ':'Adapted: ')+o.n+'. '+o.d);A.flash();A.save();A.refresh();}});
      card.append(el('h4','',o.n),el('p','',o.d),el('div','fx',fxText(o.fx)),suit,btn);og.append(card);ln.opts.push({o:o,card:card,btn:btn,bl:bl,bc:bc,suit:suit});
    });
    box.append(og);h.append(box);
  });
}
function axesUpdate(S){
  ln.opts.forEach(r=>{
    const st=optState(S,r.o);
    if(st.st==='owned'){r.card.className='node owned';r.bl.textContent='Chosen';r.bc.textContent='';r.btn.disabled=true;r.btn.classList.remove('can');}
    else if(st.st==='locked'){r.card.className='node locked';r.bl.textContent='Locked';r.bc.textContent=st.why;r.btn.disabled=true;r.btn.classList.remove('can');}
    else{const can=S.energy>=st.cost&&!S.life.ended;r.card.className='node';r.bl.textContent=st.st==='switch'?'Switch to this':'Adapt';r.bc.textContent=fmt(st.cost);r.btn.disabled=!can;r.btn.classList.toggle('can',can);}
    if(st.st!=='locked'){const d=optSuit(S,r.o);r.suit.className='suit '+(d>.02?'good':d<-.02?'bad':'');
      r.suit.textContent=(st.st==='owned'?'Right now it is ':'Right now it would be ')+(d>.02?'helping you':d<-.02?'hurting you':'about neutral');}
    else r.suit.textContent='';
  });
}
function mutBuild(S){
  const L=S.life,h=ln.mut;h.textContent='';
  const hh=el('div','sec-h');hh.append(el('h3','','Mutations'),el('span','k',L.mut.length+' / 10'));h.append(hh);
  h.append(el('p','sub','Chance changes in your lineage. Some help at once, some hurt, some do nothing, and a few only matter when the world changes. You rarely know which.'));
  if(L.mo){
    const box=el('div','mutcard');box.append(el('p','sub','<b>x</b>'.replace(/<[^>]+>/g,'')+'A mutation has appeared. Keep one, or let it pass.'));
    L.mo.ids.forEach(id=>{const d=MUTD[id];const b=el('button','mutopt');b.type='button';b.append(el('b','',d.n),el('span','',d.f),el('em',d.omen==='worrying'?'worry':d.omen==='curious'?'cur':'',OMEN_LABEL[d.omen]));
      b.addEventListener('click',()=>{if(takeMutation(S,id)){Sound.sfx('mutate');A.addLog('A mutation takes hold: '+d.n+'. '+d.f);A.save();A.refresh();}});box.append(b);});
    const sk=el('button','mini','Let it pass');sk.type='button';sk.addEventListener('click',()=>{skipMutation(S);A.refresh();});box.append(sk);h.append(box);
  }else h.append(el('p','sub',L.mut.length>=10?'Your lineage carries as many mutations as it can.':'No mutation is waiting. One will arise before long.'));
  L.mut.forEach(m=>{const d=MUTD[m.id];const r=el('div','branch2');const i=el('div');i.append(el('h4','',d.n),el('p','sub',m.rev?'Revealed: it matters '+REVEAL[d.cond]+'.':d.f));r.append(i,el('span','suit '+(m.rev?'good':''),m.rev?'Proven':OMEN_LABEL[d.omen]));h.append(r);});
}
function brStatus(sp){return sp.pop>.65?'Thriving':sp.pop>.35?'Holding on':'Declining';}
function brBuild(S){
  const L=S.life,h=ln.br;h.textContent='';
  const hh=el('div','sec-h');hh.append(el('h3','','Branches'),el('span','k','Chances: '+L.ch));h.append(hh);
  h.append(el('p','sub','Populations can split off into a new species in another habitat. They carry on without you, may thrive or fade, and give your lineage somewhere to survive if the main line fails. You gain a chance at each new stage, each new habitat and each catastrophe.'));
  const br=aliveBranches(S);
  if(!br.length)h.append(el('p','sub','No branches yet.'));
  br.forEach(sp=>{const r=el('button','branch2');r.type='button';r.style.cssText='appearance:none;background:none;border-left:0;border-right:0;border-bottom:0;color:inherit;text-align:left;width:100%;cursor:pointer';
    const i=el('div');const t=el('h4');t.append(el('i','',sp.n));i.append(t,el('p','sub',BIO[sp.bi].n+' · from '+spName(S,sp.p)));const pp=el('div','pop');pp.append(el('i'));pp.firstChild.style.width=Math.round(sp.pop*100)+'%';i.append(pp);
    r.append(i,el('span','suit '+(sp.pop>.65?'good':sp.pop<.35?'bad':''),brStatus(sp)));r.addEventListener('click',()=>speciesModal(S,sp.id));h.append(r);});
  if(S.era<=5){
    if(!L.vo.length||L.vo.some(v=>!VAR[v]))L.vo=offerVariants(S);
    h.append(el('h4','k','Found a new branch · costs '+fmt(branchCost(S))));
    const can=canBranch(S)&&S.energy>=branchCost(S);
    if(!L.vo.length)h.append(el('p','sub','There is nowhere new for a branch to go yet.'));
    const g=el('div','mutcard');
    L.vo.forEach(id=>{const v=VAR[id];const b=el('button','mutopt');b.type='button';b.disabled=!canBranch(S)||S.energy<branchCost(S);b.style.opacity=b.disabled?.6:1;
      b.append(el('b','',v.n),el('span','',v.d),el('em','cur',L.ch<1?'Needs a chance':aliveBranches(S).length>=LIVE_CAP?'Too many branches':S.energy<branchCost(S)?'Not enough '+ERAS[S.era].unit:variantBiomes(S,v).length+' habitats open'));
      b.addEventListener('click',()=>divergeModal(S,id));g.append(b);});
    const rf=el('button','mini','Show other options');rf.type='button';rf.addEventListener('click',()=>{L.vo=offerVariants(S);sig.br='';refresh(true);});g.append(rf);h.append(g);
  }
}
function lineage(S,force){
  const L=S.life;
  lineageHead(S,force);
  const ak=S.era+'|'+JSON.stringify(L.genome)+'|'+(L.ended?1:0);
  if(force||sig.ax!==ak){sig.ax=ak;axesBuild(S);}
  axesUpdate(S);
  const mk=L.mut.map(m=>m.id+m.rev).join(',')+'|'+(L.mo?L.mo.ids.join(','):'')+'|'+S.era;
  if(force||sig.mu!==mk){sig.mu=mk;mutBuild(S);}
  const bk=aliveBranches(S).map(s=>s.id+':'+Math.round(s.pop*10)).join(',')+'|'+L.ch+'|'+L.vo.join(',')+'|'+(S.energy>=branchCost(S)?1:0)+'|'+S.era;
  if(force||sig.br!==bk){sig.br=bk;brBuild(S);}
}

/* ---------- world ---------- */
function gaugeBuild(){
  const h=wd.cond;h.textContent='';wd.g={};
  const hh=el('div','sec-h');wd.date=el('span','k');hh.append(el('h3','','The planet'),wd.date);h.append(hh);
  wd.clim=el('p','sub');h.append(wd.clim);
  const g=el('div','gauges');
  [['temp','Temperature'],['o2','Oxygen'],['co2','Carbon dioxide'],['sea','Sea level'],['food','Food here'],['volc','Volcanism']].forEach(x=>{const t=el('div','gauge');const v=el('div','v');const s=el('div','sub');t.append(el('div','k',x[1]),v,s);g.append(t);wd.g[x[0]]={v:v,s:s};});
  h.append(g);
}
function gaugeUpdate(S){
  const L=S.life,E=earthNow(S),b=BIO[L.biome],G=wd.g;
  wd.date.textContent=fmtYa(E.ya);
  wd.clim.textContent=E.climate+'. '+(L.ev.length?'The world is changing around you.':'Conditions are steady for now.');
  const tr=k=>{const t=earthTrend(E,k);return t==='rising'?'rising':t==='falling'?'falling':'steady';};
  const cls=k=>{const t=earthTrend(E,k);return t==='rising'?'up':t==='falling'?'dn':'';};
  const set=(k,v,s,c)=>{G[k].v.textContent=v;G[k].s.textContent=s;G[k].s.className='sub '+(c||'');};
  set('temp',Math.round(E.temp)+'°C',tr('temp'),cls('temp'));
  set('o2',E.o2.toFixed(1)+'%',tr('o2'),cls('o2'));
  set('co2',Math.round(E.co2).toLocaleString('en-US')+' ppm',tr('co2'),cls('co2'));
  set('sea',(E.sea>=0?'+':'')+Math.round(E.sea)+' m',tr('sea'),cls('sea'));
  const f=foodIndex(E,b.kind)*b.food;set('food',foodWord(f),b.n);
  set('volc',E.volc>.65?'Violent':E.volc>.4?'Active':'Quiet',tr('volc'),cls('volc'));
}
function evBuild(S){
  const L=S.life,h=wd.ev;h.textContent='';
  const hh=el('div','sec-h');hh.append(el('h3','','Omens and events'));h.append(hh);
  if(!L.ev.length)h.append(el('p','sub','Nothing unusual is happening. Watch the sky and the water. Disasters rarely arrive without warning.'));
  L.ev.forEach(ev=>{const d=EVD[ev.id],u=clamp(ev.t/d.dur,0,1);const r=el('div','evrow'+(d.big?' big':''));
    r.append(el('b','',evTitle(ev)),el('span','sub',u<d.peak?'Signs are gathering. The cause is not yet clear.':u<1?'It has struck. The world is recovering.':''));
    const b=el('div','bar');const i=document.createElement('i');i.style.width=Math.round(u*100)+'%';b.append(i);r.append(b);h.append(r);});
  if(L.om.length){const ul=el('ul','omens');L.om.slice(0,4).forEach(o=>ul.append(el('li','',o.x)));h.append(ul);}
}
function ecoBuild(S){
  const L=S.life,h=wd.eco;h.textContent='';
  const hh=el('div','sec-h');hh.append(el('h3','','Ecosystem'));h.append(hh);
  if(!ECO_W[S.era]){h.append(el('p','sub','Your people have outgrown the old food web. Other species still live their own lives.'));return;}
  const s=ecoSummary(S);
  h.append(el('p','sub','Prey: <b>'.replace(/<[^>]+>/g,'')+s.prey+'. Predators: '+s.pred+'. Competition: '+s.comp+'. Arms race: '+s.arms+'.'));
  const rv=ecoAlive(L.eco);
  if(!rv.length)h.append(el('p','sub','The neighborhood is quiet. Other species will move into the empty niches.'));
  rv.forEach(r=>{const x=el('div','branch2');const i=el('div');const t=el('h4');t.append(el('i','',r.n));i.append(t,el('p','sub',r.taxon+' · '+ROLE_WORD[r.role]));x.append(i,el('span','suit '+(r.role==='predator'?'bad':''),r.ab>.7?'Common':r.ab>.35?'Present':'Rare'));h.append(x);});
}
function bioBuild(S){
  const L=S.life,h=wd.bio;h.textContent='';wd.rows=[];
  const hh=el('div','sec-h');hh.append(el('h3','','Habitats'),el('span','k',S.era>5?'Settled':'Move cost '+fmt(migCost(S))));h.append(hh);
  h.append(el('p','sub','Where you live decides what you eat, what eats you, and what the weather does to you. A move is dangerous. The first arrivals in a new habitat find empty niches, and you gain a chance to branch.'));
  const P=profOf(S);
  BIOMES.forEach(b=>{
    const reach=biomeReach(S,b.id,P),row=el('div','biome'+(L.biome===b.id?' here':''));
    const i=el('div');i.append(el('h4','',b.n),el('p','',b.d),el('p','',b.haz));const live=el('p','suit');i.append(live);
    const btn=el('button','buy');btn.type='button';const bl=el('span','bl'),bc=el('span','bc');btn.append(bl,bc);
    btn.addEventListener('click',()=>migrateTo(S,b.id));row.append(i,btn);h.append(row);wd.rows.push({b:b,reach:reach,live:live,btn:btn,bl:bl,bc:bc,row:row});
  });
}
function bioUpdate(S){
  const L=S.life,P=profOf(S),cost=migCost(S);
  wd.rows.forEach(r=>{
    const here=L.biome===r.b.id,reach=biomeReach(S,r.b.id,P);
    if(reach.ok||here){const f=fitCalc(S,P,r.b.id,L.mut).env;r.live.textContent='Suitability now: '+(f>1.1?'Excellent':f>1.03?'Good':f>.97?'Fair':f>.9?'Poor':'Hostile')+(L.colonized[r.b.id]?' · settled before':'');r.live.className='suit '+(f>1.03?'good':f<.97?'bad':'');}
    else{r.live.textContent=reach.why;r.live.className='suit';}
    if(here){r.bl.textContent='Here';r.bc.textContent='';r.btn.disabled=true;r.btn.classList.remove('can');}
    else if(!reach.ok||S.era>5||L.ended){r.bl.textContent='Closed';r.bc.textContent='';r.btn.disabled=true;r.btn.classList.remove('can');}
    else{const can=S.energy>=cost;r.bl.textContent='Move here';r.bc.textContent=fmt(cost)+' · '+Math.round(migOdds(S)*100)+'% safe';r.btn.disabled=!can;r.btn.classList.toggle('can',can);}
  });
}
function world(S,force){
  const L=S.life;
  if(force||!wd.g)gaugeBuild();
  gaugeUpdate(S);
  evBuild(S);
  const ek=L.eco.rv.map(r=>r.id+r.st+(r.ab>.7?2:r.ab>.35?1:0)).join(',')+'|'+S.era+'|'+L.biome;
  if(force||sig.eco!==ek){sig.eco=ek;ecoBuild(S);}
  const bk=S.era+'|'+L.biome+'|'+Object.keys(L.colonized).join(',')+'|'+BIOMES.filter(b=>geoYa(S)<=b.from).length+'|'+Object.keys(L.genome).join(',');
  if(force||sig.bio!==bk){sig.bio=bk;bioBuild(S);}
  bioUpdate(S);
}
function migrateTo(S,id){
  const r=lifeMigrate(S,id);if(!r)return;Sound.sfx(r.ok?'migrate':'bad');
  A.addLog((r.ok?'Migrated to the '+BIO[id].n.toLowerCase()+'. ':'A crossing failed. ')+r.text);A.save();
  A.openModal({kicker:'Migration',title:r.ok?(r.first?'A new world':'Arrival'):'The crossing failed',body:r.text,actions:[{label:'Continue',primary:true,fn:()=>{A.closeModal();sig.bio='';A.refresh();}}]});
  A.refresh();
}
function divergeModal(S,vid){
  const v=VAR[vid],bs=variantBiomes(S,v);if(!bs.length)return;
  A.openModal({kicker:'Divergence',title:v.n,body:v.d+' Where should this population settle? It will carry on without you.',
    actions:bs.map(b=>({label:BIO[b].n,desc:(S.life.colonized[b]?'You have lived here before. ':'New to your lineage. ')+BIO[b].haz,fn:()=>{
      const sp=lifeDiverge(S,vid,b);A.closeModal();
      if(sp){Sound.sfx('branch');S.life.vo=offerVariants(S);A.addLog('A new branch: the '+sp.n+' settle in the '+BIO[b].n.toLowerCase()+'.');A.save();}
      sig.br='';A.refresh();}})).concat([{label:'Cancel',fn:A.closeModal}])});
}
function renameModal(S,id){
  const sp=spById(S,id);if(!sp)return;
  A.openModal({kicker:'Rename species',title:sp.n,body:'Pick the name your people use. It will change everywhere in the tree, the fossil record and the history book.',
    input:{id:'rname',label:'Species name',placeholder:sp.o,max:28},
    actions:[{label:'Save name',primary:true,fn:()=>{const v=($('#rname').value||'').trim();if(v&&lifeRename(S,id,v)){A.addLog('The '+sp.o+' are now called the '+v+'.');A.save();}A.closeModal();sig.lh='';sig.br='';sig.hs='';A.refresh();}},{label:'Cancel',fn:A.closeModal}]});
  setTimeout(()=>{const i=$('#rname');if(i)i.value=sp.n;},40);
}
function speciesModal(S,id){
  const sp=spById(S,id);if(!sp)return;
  const par=sp.p?spById(S,sp.p):null,b=BIO[sp.bi];
  const trait=sp.tags.length?sp.tags.join(', '):'a generalist';
  const life=sp.st==='alive'?'Living now'+(sp.k==='branch'?' ('+brStatus(sp).toLowerCase()+')':' (main line)'):sp.st==='ancestor'?'Ancestor of the main line':'Extinct '+fmtYa(sp.d)+'. '+(sp.why||'');
  const body='Appeared '+fmtYa(sp.b)+(par?', descended from the '+par.n:'')+'. Lived in the '+(b?b.n.toLowerCase():'sea')+'. A '+trait+' kind of life. '+life;
  A.openModal({kicker:sp.st==='extinct'?'Fossil':'Species',title:sp.n,body:body,actions:[{label:'Rename',fn:()=>renameModal(S,id)},{label:'Close',primary:true,fn:A.closeModal}]});
}

/* ---------- history: tree, fossils, summary ---------- */
const SVGNS='http://www.w3.org/2000/svg';
const sv=(t,a)=>{const e=document.createElementNS(SVGNS,t);for(const k in a)e.setAttribute(k,a[k]);return e;};
function treeNode(S,compact){
  const L=S.life,T=treeLayout(S),ROW=38,LANE=18,W=22+T.lanes*LANE,n=T.rows.length;
  const wrap=el('div','treewrap');wrap.style.paddingLeft=(W+8)+'px';
  const svg=sv('svg',{width:W,height:n*ROW+8,viewBox:'0 0 '+W+' '+(n*ROW+8),'aria-hidden':'true'});
  const X=lane=>11+lane*LANE,Y=i=>4+i*ROW+ROW/2;
  const first={};T.rows.forEach((r,i)=>{if(r.t===0)first[r.sp.id]=i;});
  L.sp.forEach(sp=>{
    const s=T.span[sp.id];if(!s)return;
    let y1;if(sp.st==='extinct'&&s.r1!=null)y1=Y(s.r1);
    else if(sp.st==='ancestor'){const k=L.sp.find(x=>x.p===sp.id&&x.k==='main'&&!x.v);y1=k&&first[k.id]!=null?Y(first[k.id]):Y(n-1);}
    else y1=Y(n-1)+ROW/2-4;
    const cls=sp.st==='extinct'?'x':(sp.k==='main'&&!sp.v)||sp.st==='ancestor'||sp.id===L.main?'m':'b';
    const par=sp.p&&T.span[sp.p];
    if(par&&par.lane!==s.lane)svg.append(sv('path',{d:'M'+X(par.lane)+' '+Y(s.r0)+' H'+X(s.lane),class:'tl '+cls,fill:'none'}));
    svg.append(sv('line',{x1:X(s.lane),y1:Y(s.r0),x2:X(s.lane),y2:y1,class:'tl '+cls}));
    svg.append(sv('circle',{cx:X(s.lane),cy:Y(s.r0),r:3.6,class:'nd '+cls}));
    if(sp.st==='extinct'&&s.r1!=null){const x=X(s.lane),y=Y(s.r1);svg.append(sv('path',{d:'M'+(x-4)+' '+(y-4)+' L'+(x+4)+' '+(y+4)+' M'+(x+4)+' '+(y-4)+' L'+(x-4)+' '+(y+4),class:'tl xx'}));}
    if(sp.rad&&!compact)svg.append(sv('circle',{cx:X(s.lane),cy:Y(s.r0),r:7,class:'rad',fill:'none'}));
  });
  wrap.append(svg);
  T.rows.forEach(r=>{
    const sp=r.sp,b=el('button','trow'+(r.t?' x':''));b.type='button';
    const par=sp.p?spById(S,sp.p):null;
    const what=r.t?'Extinct':sp.rad?'Radiation':sp.p===0?'Founder':sp.k==='main'&&!sp.v?'Main line':'Branch from '+(par?par.n:'?');
    b.append(el('small','',fmtYa(r.ya)+' · '+what));
    const line=document.createElement('span');
    if(r.t){line.append('† ');line.append(el('i','',sp.n));line.append(' — '+(sp.why||''));}else line.append(el('i','',sp.n));
    b.append(line);b.addEventListener('click',()=>speciesModal(S,sp.id));wrap.append(b);
  });
  return wrap;
}
function fossilNode(S,limit){
  const ul=el('ul','fos');
  const list=S.life.fos.slice().map((f,i)=>({f:f,i:i})).sort((a,b)=>b.f.ya-a.f.ya||a.i-b.i).map(x=>x.f).filter(f=>!onlyMajor&&!limit||f.big||f.k==='milestone'||f.k==='extinction'||f.k==='radiation'||f.k==='biome'||f.k==='survival'||f.k==='adaptation'&&true&&limit);
  const use=limit?list.slice(0,limit):list;
  if(!use.length)ul.append(el('li','empty','Nothing has been recorded yet.'));
  use.forEach(f=>{const li=el('li',f.big?'big':'');const w=el('div');w.append(el('span','when',fmtYa(f.ya)),el('span','kind',KIND_LABEL[f.k]||f.k));li.append(w,el('div','',f.x));ul.append(li);});
  return ul;
}
function listOf(items,fallback){const ul=el('ul','biglist');if(!items.length)ul.append(el('li','',fallback));items.forEach(x=>ul.append(typeof x==='string'?el('li','',x):x));return ul;}
function tile(k,v,sub){const t=el('div','gauge');t.append(el('div','k',k),el('div','v',String(v)));if(sub)t.append(el('div','sub',sub));return t;}
function summaryNode(S,final,compact){
  const st=historyStats(S),L=S.life,box=el('div');box.style.display='grid';box.style.gap='14px';
  const top=st.outcome[0],sec=st.outcome[1];
  const v=el('div','verdict');v.append(el('div','k',final?'What your lineage became':'What your lineage is becoming'),el('h3','',top.n),el('p','sub',top.d));
  if(sec&&sec.s>.5)v.append(el('p','sub','Also: '+sec.n.toLowerCase()+'.'));
  v.append(el('p','sub',final?'Surviving for this long is the real prize. Intelligence is one road among many, and life has never needed to walk it.':'There is no finish line in evolution. Every outcome that survives is a success.'));
  if(S.path&&PATHS[S.path])v.append(el('p','sub','Beyond the biology: your people ascended as '+PATHS[S.path].people+' ('+PATHS[S.path].n+').'));
  box.append(v);
  const g=el('div','sgrid');
  g.append(tile('Time survived',fmtYa(st.from).replace(' ago','')+' → '+(st.to<1000?'now':fmtYa(st.to)),Math.round((st.from-st.to)/1e6).toLocaleString('en-US')+' million years'),
    tile('Species produced',st.total,st.branches+' branch species'),tile('Extinct',st.extinct,'in the fossil record'),tile('Still living',st.alive,'descendants today'),
    tile('Habitats settled',st.biomes.length,st.biomes.slice(0,3).join(', ')+(st.biomes.length>3?'…':'')),
    tile('Mass extinctions',st.mass+' met',st.massSurv+' survived ('+st.ms.intact+' intact, '+st.ms.handoff+' via a branch, '+st.ms.bottleneck+' as refugees)'));
  box.append(g);
  const sect=(h,node)=>{const s=el('div','sec');s.style.borderTop='0';s.style.paddingTop='0';s.append(el('h4','k',h),node);return s;};
  box.append(sect('Notable ancestors',listOf(st.ancestors.map(s=>fmtYa(s.b)+': the '+s.n),'None yet')));
  box.append(sect('Major adaptations',listOf(st.adaptations,'None chosen')));
  box.append(sect('Important mutations',listOf(st.mutations.map(m=>m.d.n+(m.rev?' (proved its worth '+REVEAL[m.d.cond]+')':' (still waiting to matter)')),'None')));
  box.append(sect('Major predators you faced',listOf(st.predators.slice(0,6).map(r=>'The '+r.taxon+' '+r.n+(r.st==='extinct'?' (gone)':'')),'None noted')));
  box.append(sect('Breakthroughs',listOf(st.firsts.slice(0,10).map(f=>fmtYa(f.ya)+': '+f.x),'None yet')));
  box.append(sect('Final descendants',listOf(st.final.map(s=>s.n+' ('+BIO[s.bi].n.toLowerCase()+')'),'None')));
  if(!compact){box.append(sect('Family tree',treeNode(S,true)));box.append(sect('Fossil record',fossilNode(S,0)));}
  return box;
}
function historyModal(S,o){
  o=o||{};const node=summaryNode(S,!!o.final,false);
  A.openModal({kicker:o.final?'The history of your lineage':'History book',title:o.title||('The '+S.name+' lineage'),node:node,wide:true,actions:o.actions||[{label:'Close',primary:true,fn:A.closeModal}]});
  const c=$('#card');if(c)c.scrollTop=0;
}
function rideOutModal(S){
  A.openModal({kicker:'Ride out the ages',title:'Let time run?',
    body:'Your lineage will carry on without your hand, through every remaining extinction and ice age to the present day. This ends your run here. You will keep the tree, the fossil record and a history of what your descendants became.',
    actions:[{label:'Let time run',danger:true,fn:()=>{
      A.closeModal();const C=rideOut(S);
      historyModal(C,{final:true,title:'The present day',actions:[
        {label:'Keep this history and end the run',primary:true,fn:()=>{A.closeModal();A.adopt(C);A.addLog('Your lineage rode out the ages to the present day.');}},
        {label:'Go back to playing',desc:'Nothing changes.',fn:A.closeModal}]});}},{label:'Keep playing',primary:true,fn:A.closeModal}]});
}
function history(S,force){
  const L=S.life;
  [...hs.seg.children].forEach(b=>b.setAttribute('aria-pressed',b.dataset.v===hv?'true':'false'));
  const key=hv+'|'+L.sp.length+'|'+L.sp.map(s=>s.st[0]+s.n).join('|').length+'|'+L.fos.length+'|'+onlyMajor+'|'+S.era+'|'+L.main+'|'+(hv==='book'?Math.floor(S.play/10):0);
  if(!force&&sig.hs===key)return;
  sig.hs=key;const h=hs.body;h.textContent='';
  if(hv==='tree'){
    const hh=el('div','sec-h');hh.append(el('h3','','Family tree'),el('span','k',aliveSp(S).length+' living · '+L.sp.filter(s=>s.st==='extinct').length+' extinct'));h.append(hh);
    h.append(el('p','sub','Oldest at the top. A cross marks an extinction. Tap a species to read about it or rename it.'),treeNode(S,false));
  }else if(hv==='fossil'){
    const hh=el('div','sec-h');hh.append(el('h3','','Fossil record'));const t=el('button','mini',onlyMajor?'Show everything':'Major events only');t.type='button';t.addEventListener('click',()=>{onlyMajor=!onlyMajor;sig.hs='';history(S,true);});hh.append(t);h.append(hh);
    h.append(fossilNode(S,0));
  }else{
    const hh=el('div','sec-h');hh.append(el('h3','','History book'));h.append(hh);
    h.append(summaryNode(S,!!L.ended,true));
    if(!L.ended&&S.era>=2&&S.era<=5){const r=el('button','btn');r.type='button';r.append(el('span','','Ride out the ages…'),el('small','','End the run here and let your lineage live out the rest of Earth’s history.'));r.addEventListener('click',()=>rideOutModal(S));h.append(r);}
    const b=el('button','btn');b.type='button';b.append(el('span','','Open the full history book'),el('small','','Statistics, the tree and every fossil in one scroll.'));b.addEventListener('click',()=>historyModal(S,{final:!!L.ended}));h.append(b);
  }
}

/* ---------- prompts and notices ---------- */
function pump(S){
  const L=S.life;if(!L||!L.q.length)return;
  while(L.q.length){
    const it=L.q[0];
    if(it.t==='ask'||(it.t==='result'&&it.res.big)){
      if(A.modalOpen())return;L.q.shift();
      Sound.sfx(it.t==='ask'?'alert':(it.res.main&&it.res.main.k==='intact'&&it.res.sev<.6?'survive':'extinct'));
      if(it.t==='ask')askModal(S,it.id);else resultModal(S,it.res);return;
    }
    L.q.shift();
    if(it.t==='clue'){Sound.sfx(it.big?'omen':'tab');A.toast(it.x);if(it.big)A.addLog('Omen: '+it.x);}
    else if(it.t==='note')A.toast(it.x);
    else if(it.t==='reveal'){Sound.sfx('mutate');const x='A hidden trait proves its worth: '+it.m.n+' mattered '+it.cond+'.';A.toast(x);A.addLog(x);}
    else if(it.t==='result'){const r=it.res;
      let x=r.n+'. '+r.x;if(r.lost.length)x+=' Lost: '+r.lost.map(s=>s.n).join(', ')+'.';if(r.main&&r.main.loss>0)x+=' Cost: '+fmt(r.main.loss)+' '+ERAS[S.era].unit+'.';
      A.addLog(x);A.toast(r.n+(r.lost.length?': '+r.lost.length+' branch'+(r.lost.length>1?'es':'')+' lost':' passed'));}
  }
}
function askModal(S,id){
  const d=EVD[id];
  A.openModal({kicker:'Warning signs · '+fmtYa(geoYa(S)),title:d.omen,body:d.ask.t+' Something terrible may be coming. What will your lineage do?',
    actions:Object.keys(PREP).map(k=>({label:PREP[k].n,desc:PREP[k].d,fn:()=>{answerEvent(S,id,k);A.addLog('Prepared for the worst: '+PREP[k].n.toLowerCase()+'.');A.closeModal();A.save();A.refresh();}}))});
}
function resultModal(S,r){
  const m=r.main,L=S.life,name=spName(S,L.main);
  let body=r.x+' About '+Math.round(r.sev*100)+'% of all species on Earth were lost.';
  if(m.k==='intact')body+=' The '+name+' came through with their numbers cut but their line unbroken.';
  else if(m.k==='handoff')body+=' Your main line collapsed. Only its kin, the '+name+', survived to carry the lineage on, and they are not quite the same.';
  else body+=' The '+name+' survived as a handful of refugees. Everything has to be rebuilt.';
  if(r.lost.length)body+=' Branches lost: '+r.lost.map(s=>s.n).join(', ')+'.';else body+=' Every branch of your family survived.';
  if(r.made.length)body+=' In the emptied world your survivors radiate into '+r.made.length+' new species: '+r.made.map(s=>s.n).join(', ')+'.';
  A.addLog(r.n+' ('+(m.k==='intact'?'main line intact':m.k==='handoff'?'a branch carried on':'bottleneck')+'). '+(r.lost.length?r.lost.length+' branches lost.':'No branch lost.')+(r.made.length?' '+r.made.length+' new species.':''));
  A.save();
  A.openModal({kicker:'Mass extinction · '+fmtYa(r.ya),title:r.n,body:body,actions:[{label:r.made.length?'See the new branches':'Continue',primary:true,fn:()=>{A.closeModal();sig.br='';sig.hs='';A.refresh();}}]});
}

function refresh(force){
  const S=A.S();if(!S||!S.life)return;
  earthBar.hidden=S.era>=11; // out among the worlds, the conditions of old Earth no longer describe your people
  bar(S);
  if(!P_lin.hidden)lineage(S,force);
  if(!P_wd.hidden)world(S,force);
  if(!P_hs.hidden)history(S,force);
}
function onTab(S,name){if(name==='lineage'||name==='world'||name==='history')refresh(true);}
function reset(){for(const k in sig)delete sig[k];ln.opts=null;wd.g=null;}
return {init,refresh,pump,onTab,reset,historyModal,speciesText,summaryNode};
})();
