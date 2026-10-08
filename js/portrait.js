/* Deep Time: the portrait. Draws your people as a person you can read: the form you designed, the clothes of the age,
   and, from stage 12, the shape you are growing into or the path you took. Pure drawing, no game state.
   Drawn small in the corner of the scene from the first settlements on, and large in the Form tab.
   Uses the drawing helpers from art.js (c, dot, ell, poly, line, ring, rect, glow). */
function shade(hex,k){ // k<0 darker, k>0 lighter
  const n=parseInt(hex.slice(1),16),r=n>>16&255,g=n>>8&255,b=n&255,t=k<0?0:255,a=Math.abs(k);
  const m=v=>Math.round(v+(t-v)*a);return 'rgb('+m(r)+','+m(g)+','+m(b)+')';
}
function withCtx(ctx2,w,h,fn){const pc=c,pw=W,ph=H;c=ctx2;W=w;H=h;try{fn();}finally{c=pc;W=pw;H=ph;}}

/* clothes by stage: [main, trim] */
function attireFor(e){
  if(e<=5)return {k:'fur',a:'#6b4a34',b:'#a07850'};
  if(e===6)return {k:'hide',a:'#8a6240',b:'#c9a56d'};
  if(e===7)return {k:'tunic',a:'#7a2f3a',b:'#e0b94a'};
  if(e===8)return {k:'coat',a:'#2d3a55',b:'#bfa66a'};
  if(e===9)return {k:'jacket',a:'#3b4552',b:'#d8dde6'};
  if(e===10)return {k:'suit',a:'#e6e9f0',b:'#e0663f'};
  if(e===11)return {k:'colony',a:'#9a5b3c',b:'#f0c878'};
  return {k:'light',a:'#f0d27a',b:'#fff6d0'};
}

/* the person. Origin at the middle of the chest, about 100 units tall, y up is negative.
   The body plan changes the whole head, not just the colors: a cat, a lizard, a bird, an insect and a fish-person
   do not share a skull. */
function drawPerson(t,V,opt){
  opt=opt||{};
  const F=V.form,e=V.era==null?6:V.era,sk=SKINS[F.skin].c,tn=SKINS[F.tone==null?F.skin:F.tone].c,ey=EYES[F.eyes].c,skD=shade(sk,-.35),skL=shade(sk,.3),hairC=shade(tn,-.35);
  const body=F.body||'primate',cover=F.cover||'smooth',build=F.build;
  let hw=build==='sturdy'?24:build==='tall'?19:20,hh=build==='tall'?29:build==='sturdy'?22:25;
  const sw=build==='sturdy'?46:build==='tall'?34:38;
  if(body==='feline'){hw*=1.1;hh*=.9;}else if(body==='reptile'){hw*=1.15;hh*=.8;}else if(body==='avian'){hw*=.88;hh*=.95;}else if(body==='insect'){hw*=1.0;hh*=.92;}else if(body==='aqua'){hw*=.95;hh*=1.08;}
  const br=Math.sin(t*1.6)*.8,at=attireFor(e),hy=-12+br*.4;
  const path=V.path,lean=V.lean||{},perks=V.perks||{};
  let lp=null,lk=0;
  if(!path){let top=0;for(const id in lean)if(lean[id]>top){top=lean[id];lp=id;}lk=lp?Math.min(.6,top/6):0;}
  const pid=path||lp,pk=path?1:lk;
  const robot=pid==='machine'&&pk>0,holo=pid==='digital'&&pk>0;
  const ex=hw*.42,ey0=hy-3;
  c.save();
  if(holo)c.globalAlpha=1-.35*pk;
  /* behind the head */
  if(F.extra==='frill'){c.fillStyle=shade(tn,-.1);c.beginPath();c.moveTo(0,hy+10);for(let k=0;k<=12;k++){const a=Math.PI*(1.05+k/12*.9),r=hw+20+(k%2)*5;c.lineTo(Math.cos(a)*r*1.1,hy+4+Math.sin(a)*(hh+10+(k%2)*4));}c.closePath();c.fill();c.strokeStyle=shade(tn,-.5);c.lineWidth=1;for(let k=1;k<12;k+=1){const a=Math.PI*(1.05+k/12*.9);line(Math.cos(a)*hw,hy+Math.sin(a)*hh*.9,Math.cos(a)*(hw+18)*1.05,hy+4+Math.sin(a)*(hh+12),'rgba(0,0,0,.25)',1);}}
  if(F.extra==='mantle'){ell(0,hy+20,hw+20,hh*.9,0,shade(sk,-.5));for(let k=0;k<16;k++){const a=Math.PI+k/15*Math.PI;line(Math.cos(a)*(hw+8),hy+14+Math.sin(a)*(hh*.6),Math.cos(a)*(hw+22),hy+16+Math.sin(a)*(hh*.8),shade(sk,-.55),2.4);}}
  if(F.hair==='long')ell(0,hy+10,hw+7,hh+12,0,hairC);
  if(F.hair==='mane'){for(let k=0;k<22;k++){const a=k/22*Math.PI*2;line(Math.cos(a)*hw*.8,hy+Math.sin(a)*hh*.8,Math.cos(a)*(hw+13+(k%3)*3),hy+Math.sin(a)*(hh+12+(k%3)*3),hairC,3.2);}}
  if(pid==='cyborg'&&perks.cyborg2&&path){for(const s of [-1,1]){c.strokeStyle='#8b94a3';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(s*sw*.7,20);c.lineTo(s*(sw+16),6+Math.sin(t*2+s)*3);c.lineTo(s*(sw+26),-14+Math.sin(t*2.4+s)*4);c.stroke();dot(s*(sw+26),-14+Math.sin(t*2.4+s)*4,3,'#ff7a3a');}}
  if(pid==='psionic'&&pk>0){const R=hh+16;for(let k=0;k<3;k++)ring(0,hy-hh-12,(R-14)*(.5+.5*k/2)+Math.sin(t*2+k)*1.5,'rgba(235,215,255,'+(.55*pk*(1-k*.25))+')',1.8);glow(0,hy,70,'200,170,255',.25*pk);}
  /* extra arms (the second pair sits lower and a little forward) */
  if(F.arms==='four'){for(const s of [-1,1]){c.strokeStyle=robot?'#9aa3b2':skD;c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(s*sw*.62,30);c.quadraticCurveTo(s*(sw+10),36+Math.sin(t*1.8+s)*2,s*(sw*.55),50);c.stroke();dot(s*sw*.55,50,4.5,robot?'#9aa3b2':sk);}}
  /* shoulders and clothes */
  c.fillStyle=robot?'#9aa3b2':skD;c.beginPath();c.ellipse(0,44+br,sw,24,0,Math.PI,0);c.fill();
  c.fillStyle=at.a;c.beginPath();c.ellipse(0,46+br,sw+1,24,0,Math.PI,0);c.fill();
  switch(at.k){
  case 'fur':for(let k=0;k<10;k++){const x=-sw+8+k*(sw*2-16)/9;poly([[x-4,28],[x,36],[x+4,28]],at.b);}break;
  case 'hide':line(-sw+6,24,sw-10,48,at.b,4);for(let k=0;k<5;k++)dot(-sw+10+k*13,28+k*5,1.6,'#4b3322');break;
  case 'tunic':rect(-3,22,6,26,at.b);line(-sw+4,24,sw-4,24,at.b,3);break;
  case 'coat':poly([[-10,22],[0,48],[-18,48]],at.b);poly([[10,22],[0,48],[18,48]],at.b);for(let k=0;k<3;k++)dot(0,30+k*7,1.8,'#d8c58a');break;
  case 'jacket':poly([[-14,20],[0,34],[-4,22]],at.b);poly([[14,20],[0,34],[4,22]],at.b);line(0,34,0,48,at.b,2);break;
  case 'suit':c.strokeStyle='#bfc6d4';c.lineWidth=7;c.beginPath();c.ellipse(0,22,hw*.8,7,0,0,Math.PI*2);c.stroke();rect(-sw*.55,34,13,9,at.b);for(let k=0;k<3;k++)dot(sw*.35+k*5,38,2,'#5ec2ff');break;
  case 'colony':c.strokeStyle='#d8b070';c.lineWidth=6;c.beginPath();c.ellipse(0,22,hw*.85,7,0,0,Math.PI*2);c.stroke();line(-sw+8,30,sw-8,30,at.b,2);rect(sw*.2,34,18,8,'#5a2e1c');break;
  case 'light':for(let k=0;k<4;k++){c.strokeStyle='rgba(255,246,208,'+(.45-k*.08)+')';c.lineWidth=2;c.beginPath();c.moveTo(-sw+6+k*3,28+k*5);c.quadraticCurveTo(0,20+k*6+Math.sin(t*2+k)*2,sw-6-k*3,28+k*5);c.stroke();}glow(0,34,46,'255,230,150',.25);break;
  }
  /* covering on the shoulders */
  if(!robot){
    if(cover==='fur')for(let k=0;k<14;k++){const a=Math.PI+k/13*Math.PI;line(Math.cos(a)*sw*.95,44+Math.sin(a)*22,Math.cos(a)*(sw+4),44+Math.sin(a)*24,shade(sk,-.15),2);}
    if(cover==='scales')for(let k=0;k<6;k++)for(let q=0;q<3;q++){c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1;c.beginPath();c.arc(-sw*.7+k*sw*.28,24+q*5+(k%2)*2.5,3,0,Math.PI);c.stroke();}
    if(cover==='feathers')for(let k=0;k<7;k++){ell(-sw*.75+k*sw*.25,26+(k%2)*3,5,2.2,.4*(k-3)/3,shade(sk,.1));}
  }
  /* neck */
  c.fillStyle=robot?'#7d8696':sk;c.fillRect(-7,hy+hh-6,14,24);
  /* ears */
  const ear=F.ears||'round',earTall=(body==='feline')?1:0;
  if(ear!=='none')for(const s of [-1,1]){
    if(ear==='pointed'||body==='feline'&&ear!=='frill'){const tl=ear==='large'?30:ear==='pointed'?26:20;poly([[s*(hw-4),hy-hh*.55],[s*(hw+(body==='feline'?4:8)),hy-hh-tl*(body==='feline'?.7:.5)],[s*(hw*.25),hy-hh+3]],sk);poly([[s*(hw-8),hy-hh*.6],[s*(hw+1),hy-hh-tl*.4],[s*(hw*.4),hy-hh+3]],skD);}
    else if(ear==='frill'){for(let k=0;k<5;k++){const a=-.5+k*.35;line(s*(hw-1),hy-4,s*(hw+14+Math.cos(a)*6),hy-4+Math.sin(a)*18-6,shade(tn,-.1),2.2);line(s*(hw+14+Math.cos(a)*6),hy-4+Math.sin(a)*18-6,s*(hw-1),hy-4,'rgba(255,255,255,.12)',1);}}
    else {const ew=ear==='large'?15:7,eh=ear==='large'?19:10;ell(s*(hw+1),hy-2,ew*.55,eh*.55,0,sk);ell(s*(hw+1),hy-2,ew*.28,eh*.28,0,skD);}
  }
  /* head */
  c.fillStyle=robot?'#a9b2c2':sk;c.beginPath();
  if(body==='avian')c.ellipse(0,hy,hw,hh,0,0,Math.PI*2);
  else if(body==='insect'){c.moveTo(0,hy-hh);c.bezierCurveTo(hw*1.25,hy-hh*.9,hw*1.1,hy+hh*.5,0,hy+hh);c.bezierCurveTo(-hw*1.1,hy+hh*.5,-hw*1.25,hy-hh*.9,0,hy-hh);}
  else if(body==='aqua'){c.ellipse(0,hy-2,hw,hh*1.02,0,0,Math.PI*2);}
  else c.ellipse(0,hy,hw,hh,0,0,Math.PI*2);
  c.fill();
  if(!robot){c.fillStyle='rgba(0,0,0,.1)';c.beginPath();c.ellipse(hw*.3,hy+4,hw*.75,hh*.9,0,-1.2,1.6);c.fill();}
  /* covering on the head */
  if(!robot){
    if(cover==='fur'){c.strokeStyle=shade(sk,-.2);c.lineWidth=1.2;for(let k=0;k<26;k++){const a=Math.PI*(.1+k/26*1.8),r=hw*.93;line(Math.cos(a)*r,hy+Math.sin(a)*hh*.93,Math.cos(a)*(r-4),hy+Math.sin(a)*(hh*.93-4),c.strokeStyle,1.2);}}
    if(cover==='scales'){c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=1;for(let k=0;k<7;k++)for(let q=0;q<5;q++){const x=-hw*.8+k*hw*.27+(q%2)*hw*.13,y=hy-hh*.7+q*hh*.32;if((x*x)/(hw*hw)+((y-hy)*(y-hy))/(hh*hh)<.8){c.beginPath();c.arc(x,y,3.2,0,Math.PI);c.stroke();}}}
    if(cover==='feathers')for(let q=0;q<4;q++)for(let k=0;k<5;k++){const x=-hw*.7+k*hw*.35+(q%2)*hw*.17,y=hy-hh*.8+q*hh*.2;if((x*x)/(hw*hw)+((y-hy)*(y-hy))/(hh*hh)<.75)ell(x,y,4,2,.2,shade(sk,.12));}
    if(cover==='chitin'){c.strokeStyle='rgba(0,0,0,.28)';c.lineWidth=1.2;c.beginPath();c.moveTo(0,hy-hh);c.lineTo(0,hy-hh*.2);c.moveTo(-hw*.6,hy-hh*.5);c.quadraticCurveTo(-hw*.2,hy-hh*.2,-hw*.1,hy+2);c.moveTo(hw*.6,hy-hh*.5);c.quadraticCurveTo(hw*.2,hy-hh*.2,hw*.1,hy+2);c.stroke();c.fillStyle='rgba(255,255,255,.25)';c.beginPath();c.ellipse(-hw*.35,hy-hh*.45,hw*.22,hh*.14,-.5,0,Math.PI*2);c.fill();}
  }
  /* aquatic gills and fins */
  if(body==='aqua'&&!robot){for(const s of [-1,1])for(let k=0;k<3;k++)line(s*(hw-2),hy+4+k*4,s*(hw-9),hy+6+k*4,'rgba(0,0,0,.35)',1.4);poly([[-5,hy-hh],[0,hy-hh-13],[5,hy-hh]],shade(tn,-.05));}
  /* markings */
  if(F.marks==='stripes'&&!robot)for(const s of [-1,1])for(let k=0;k<3;k++)line(s*(hw-2),hy-8+k*7,s*(hw-12),hy-5+k*7,shade(tn,-.45),2.4);
  if(F.marks==='spots'&&!robot)for(let k=0;k<9;k++)dot(Math.sin(k*2.3)*hw*.7,hy-hh*.3+(k%4)*7,1.6,shade(tn,.3));
  if(F.marks==='glow'&&!robot){const gp=.5+.35*Math.sin(t*2.2);for(const s of [-1,1]){c.strokeStyle='rgba('+(F.eyes%2?'120,255,200':'120,200,255')+','+gp+')';c.lineWidth=1.8;c.beginPath();c.moveTo(s*(hw-3),hy-10);c.quadraticCurveTo(s*(hw-9),hy+2,s*(hw-6),hy+14);c.stroke();}}
  /* crown on top */
  if(F.hair==='crest'){const cc=body==='avian'?shade(tn,0):hairC;poly([[-4,hy-hh+1],[0,hy-hh-15],[4,hy-hh+1]],cc);for(const s of [-1,1])poly([[s*3,hy-hh+2],[s*11,hy-hh-9],[s*10,hy-hh+4]],cc);}
  if(F.hair==='mane'||F.hair==='long'){c.fillStyle=hairC;c.beginPath();c.ellipse(0,hy-hh*.55,hw+1,hh*.55,0,Math.PI,0);c.fill();}
  /* eyes */
  const blink=(t%4.2)<.12,slit=(body==='feline'||body==='reptile'||body==='aqua'),px=Math.sin(t*.7)*.8;
  const eyeAt=(x,y,r)=>{
    if(blink){ell(x,y,r*1.05,.9,0,skD);return;}
    ell(x,y,r*1.05,r,0,'#f7f4ec');
    dot(x+px,y,r*.62,ey);
    if(slit)ell(x+px,y,r*.2,r*.58,0,'#0a0a0a');else dot(x+px,y,r*.3,'#0a0a0a');
    dot(x-1,y-r*.28,.9,'#fff');
  };
  if(!robot){
    const set=F.eyeset||'two';
    if(set==='compound'||body==='insect'&&set==='two'){for(const s of [-1,1]){const r=hw*.42;ell(s*hw*.5,hy-hh*.12,r,r*1.25,s*.2,shade(ey,-.4));ell(s*hw*.5,hy-hh*.12,r*.85,r*1.1,s*.2,ey);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.8;for(let k=-2;k<=2;k++)line(s*hw*.5+k*3,hy-hh*.12-r,s*hw*.5+k*3,hy-hh*.12+r,'rgba(0,0,0,.22)',.8);ell(s*hw*.4,hy-hh*.3,r*.25,r*.4,0,'rgba(255,255,255,.4)');}}
    else if(set==='one'){const r=hw*.52;ell(0,ey0-1,r*1.05,r,0,'#f7f4ec');if(!blink){dot(px,ey0-1,r*.62,ey);if(slit)ell(px,ey0-1,r*.18,r*.6,0,'#0a0a0a');else dot(px,ey0-1,r*.32,'#0a0a0a');dot(-2,ey0-r*.4,1.3,'#fff');}else ell(0,ey0-1,r*1.05,1,0,skD);}
    else{
      const wide=body==='aqua'?1.18:body==='avian'?1.05:1,r=body==='feline'?5.6:5.2;
      for(const s of [-1,1]){eyeAt(s*ex*wide,set==='four'?ey0+5:ey0,set==='four'?r*.85:r);if(set==='four')eyeAt(s*ex*wide*.8,ey0-8,r*.7);}
      if(set==='three')eyeAt(0,hy-hh*.55,r*.75);
    }
    for(const s of [-1,1])if(F.eyeset!=='compound'&&body!=='insect')line(s*ex-6,ey0-8,s*ex+5,ey0-9,skD,1.6);
  }
  /* mouth */
  const mo=F.mouth||'mouth',my=hy+hh*.55;
  if(!robot){
    if(mo==='snout'){ell(0,hy+hh*.32,hw*.5,hh*.34,0,shade(sk,.14));dot(-3.4,hy+hh*.2,1.4,'rgba(0,0,0,.6)');dot(3.4,hy+hh*.2,1.4,'rgba(0,0,0,.6)');c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=1.3;c.beginPath();c.moveTo(0,hy+hh*.32);c.lineTo(0,hy+hh*.5);c.moveTo(-7,hy+hh*.52);c.quadraticCurveTo(0,hy+hh*.62,7,hy+hh*.52);c.stroke();if(body==='feline')for(const s of [-1,1])for(let k=0;k<3;k++)line(s*hw*.4,hy+hh*.3+k*2,s*(hw+10),hy+hh*.2+k*5-2,'rgba(255,255,255,.55)',.8);}
    else if(mo==='beak'){poly([[-8,hy+2],[0,hy+hh*.75],[8,hy+2]],shade(tn,.1));poly([[-8,hy+2],[0,hy+hh*.1],[8,hy+2]],shade(tn,.28));dot(-2.5,hy+4,.9,'rgba(0,0,0,.6)');dot(2.5,hy+4,.9,'rgba(0,0,0,.6)');}
    else if(mo==='mandibles'){const o=3+Math.sin(t*2)*1.2;for(const s of [-1,1]){c.strokeStyle=shade(tn,-.2);c.lineWidth=3.2;c.lineCap='round';c.beginPath();c.moveTo(s*4,hy+hh*.55);c.quadraticCurveTo(s*(10+o),hy+hh*.9,s*(3+o*.4),hy+hh+4);c.stroke();}c.strokeStyle='rgba(0,0,0,.4)';c.lineWidth=1.2;c.beginPath();c.moveTo(-3,hy+hh*.5);c.lineTo(3,hy+hh*.5);c.stroke();}
    else{poly([[-2,hy+1],[0,hy+8],[2.2,hy+1]],skD);c.strokeStyle=shade(sk,-.55);c.lineWidth=1.8;c.beginPath();c.moveTo(-6,hy+15);c.quadraticCurveTo(0,hy+(opt.talk?19:18),6,hy+15);c.stroke();}
  }
  /* extras */
  if(F.extra==='horns')for(const s of [-1,1]){c.fillStyle='#efe3c2';c.beginPath();c.moveTo(s*(hw-6),hy-hh+3);c.quadraticCurveTo(s*(hw+16),hy-hh-4,s*(hw+10),hy-hh-24);c.quadraticCurveTo(s*(hw+4),hy-hh-9,s*(hw-14),hy-hh+5);c.fill();}
  if(F.extra==='tusks')for(const s of [-1,1])poly([[s*5,hy+hh*.55],[s*8,hy+hh*.55+12],[s*9.5,hy+hh*.55]],'#f7efd7');
  if(F.extra==='antennae')for(const s of [-1,1]){const sw2=Math.sin(t*2.4+s)*3;c.strokeStyle=shade(tn,-.2);c.lineWidth=2;c.beginPath();c.moveTo(s*5,hy-hh+1);c.quadraticCurveTo(s*(10+sw2),hy-hh-14,s*(16+sw2*1.5),hy-hh-26);c.stroke();dot(s*(16+sw2*1.5),hy-hh-27,2.6,shade(tn,.25));}
  if(F.extra==='spines')for(let k=-3;k<=3;k++)poly([[k*5-2,hy-hh+2-Math.abs(k)*.6],[k*5,hy-hh-9+Math.abs(k)*1.6],[k*5+2,hy-hh+2-Math.abs(k)*.6]],shade(tn,-.15));
  if(F.extra==='mantle'&&at.k!=='light')for(let k=0;k<7;k++){const a=Math.PI+(k+.5)/7*Math.PI;line(Math.cos(a)*(hw+2),hy+hh*.55+Math.sin(a)*8,Math.cos(a)*(hw+9),hy+hh*.55+4+Math.sin(a)*10,shade(sk,-.5),3);}
  /* the path */
  if(pid&&pk>0)pathOverlay(pid,pk,t,{hw:hw,hh:hh,hy:hy,sw:sw,ex:ex,ey0:ey0,sk:sk,ey:ey},perks,!!path);
  c.restore();
}

/* what the path looks like on a person. k is how far along (0..1), full once chosen. perks only show after ascending. */
function pathOverlay(id,k,t,g,perks,done){
  const {hw,hh,hy,sw,ex,ey0}=g,P=n=>done&&perks[id+n];
  c.save();c.globalAlpha=Math.max(.35,k);
  switch(id){
  case 'cyborg':{
    c.fillStyle='#8b94a3';c.beginPath();c.ellipse(ex,ey0,8,8.5,0,0,Math.PI*2);c.fill();
    dot(ex,ey0,4,'#1a0a0a');dot(ex,ey0,2.6+.6*Math.sin(t*3),'#ff3b3b');glow(ex,ey0,16,'255,60,60',.45);
    c.fillStyle='#6f7886';c.beginPath();c.moveTo(-hw+1,hy-hh*.5);c.lineTo(-hw+13,hy-hh*.6);c.lineTo(-hw+13,hy+hh*.1);c.lineTo(-hw+1,hy+hh*.2);c.closePath();c.fill();
    for(let q=0;q<3;q++)line(-hw+3,hy-hh*.4+q*6,-hw+11,hy-hh*.45+q*6,'#2e3540',1);
    c.strokeStyle='#ffb15a';c.lineWidth=1.4;c.beginPath();c.moveTo(-hw+13,hy-5);c.lineTo(-hw+20,hy+12);c.lineTo(-sw*.5,36);c.stroke();
    line(hw*.1,hy+hh-2,hw*.8,hy+hh+8,'#8b94a3',3);
    if(P(1)){c.strokeStyle='rgba(90,240,255,'+(.5+.3*Math.sin(t*3))+')';c.lineWidth=1.3;c.beginPath();c.moveTo(-6,hy-hh+2);c.lineTo(-2,hy-hh*.5);c.lineTo(4,hy-hh*.8);c.lineTo(9,hy-hh*.3);c.stroke();dot(-2,hy-hh*.5,1.6,'#9ff3ff');}
    if(P(3)){for(let q=0;q<3;q++)ring(0,hy-hh-6,10+q*7+((t*14)%7),'rgba(255,150,60,'+(.5-q*.14)+')',1.5);line(0,hy-hh,0,hy-hh-14,'#8b94a3',2);dot(0,hy-hh-15,2.4,'#ff7a3a');}
    break;}
  case 'machine':{
    c.fillStyle='rgba(158,168,184,.95)';c.beginPath();c.ellipse(0,hy+6,hw-1,hh*.78,0,0,Math.PI*2);c.fill();
    for(const q of [-1,1])line(q*hw*.45,hy-hh*.3,q*hw*.45,hy+hh*.9,'rgba(40,50,64,.7)',1);
    line(-hw+3,hy+10,hw-3,hy+10,'rgba(40,50,64,.7)',1);
    c.fillStyle='#11161e';c.fillRect(-hw+2,ey0-6,hw*2-4,11);
    const vx=(Math.sin(t*1.2)*.5+.5)*(hw*2-16);c.fillStyle='rgba(80,230,255,.9)';c.fillRect(-hw+6+vx*.1,ey0-3,hw*2-12,5);glow(0,ey0,34,'80,230,255',.28);
    line(-8,hy+19,8,hy+19,'#2d3642',2);for(let q=0;q<4;q++)line(-6+q*4,hy+17,-6+q*4,hy+21,'#2d3642',1);
    for(const q of [-1,1])dot(q*(hw-4),hy-hh*.4,1.6,'#5c6678');
    if(P(1))for(let q=0;q<4;q++){const u=(t*.8+q*.25)%1;dot(Math.sin(q*5)*hw*.7,hy+hh*.5-u*hh,1.4,'rgba(255,220,120,'+(1-u)+')');}
    if(P(2)){c.strokeStyle='#8b94a3';c.lineWidth=4;c.beginPath();c.moveTo(sw*.6,26);c.lineTo(sw+8,10+Math.sin(t*2)*3);c.lineTo(sw+14,-8);c.stroke();poly([[sw+11,-8],[sw+17,-8],[sw+14,-14]],'#ff7a3a');}
    if(P(3)){for(let q=0;q<3;q++){line(-hw+4+q*14,hy-hh,-hw+4+q*14,hy-hh-9-q*3,'#8b94a3',2);dot(-hw+4+q*14,hy-hh-10-q*3,1.8,'#5ec2ff');}}
    break;}
  case 'digital':{
    c.globalAlpha=.9;for(let y=-60;y<50;y+=4)line(-sw,y+((t*20)%4),sw,y+((t*20)%4),'rgba(120,255,190,'+(.12+.1*Math.sin(y*.3+t*3))+')',1);
    glow(0,hy,60,'80,255,170',.2);
    ring(0,hy,hh+8+Math.sin(t*2)*1.5,'rgba(120,255,190,.35)',1.2);
    const gy=Math.floor(t*3)%7;c.fillStyle='rgba(120,255,190,.25)';c.fillRect(-hw-6+((gy*3)%5),hy-hh+gy*7,hw*2+10,3);
    if(P(1))for(const s of [-1,1]){c.globalAlpha=.22;ell(s*(hw+16),hy+4,hw*.9,hh*.9,0,'#78ffbe');}
    if(P(2))for(let q=0;q<2;q++)ring(0,hy,hh+16+q*8,'rgba(255,255,255,'+(.3-q*.1)+')',1);
    if(P(3)){c.globalAlpha=.7;for(let q=0;q<5;q++){const a=t*.8+q*1.26;dot(Math.cos(a)*(sw+10),hy+Math.sin(a)*14+14,2.4,'#9affd0');}}
    break;}
  case 'genetic':{
    const hu=(t*40)%360;c.globalAlpha=.28*Math.max(.5,k);const gr=c.createLinearGradient(-hw,hy-hh,hw,hy+hh);gr.addColorStop(0,'hsl('+hu+',90%,65%)');gr.addColorStop(1,'hsl('+(hu+120)%360+',90%,65%)');c.fillStyle=gr;c.beginPath();c.ellipse(0,hy,hw,hh,0,0,Math.PI*2);c.fill();
    c.globalAlpha=Math.max(.35,k);c.strokeStyle='rgba(130,255,210,.85)';c.lineWidth=1.4;
    for(const s of [-1,1]){c.beginPath();for(let q=0;q<=10;q++){const y=hy-hh*.6+q*hh*.13,x=s*(hw*.62)+Math.sin(q*1.1+t*2)*3;if(q)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
    for(let q=0;q<4;q++)line(-7+q*0,hy+hh+1+q*3,7,hy+hh+1+q*3,'rgba(130,255,210,.5)',1);
    poly([[-3,hy-hh],[0,hy-hh-12],[3,hy-hh]],'rgba(130,255,210,.9)');
    if(P(1))for(const s of [-1,1]){c.strokeStyle='rgba(255,150,230,.9)';c.beginPath();for(let q=0;q<8;q++){const y=hy-hh*.2+q*5,x=s*(hw*.3)+Math.sin(q+t*2)*3;if(q)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
    if(P(2)){for(const s of [-1,1]){dot(s*ex,ey0-12,2.6,'#f7f4ec');dot(s*ex,ey0-12,1.3,g.ey);}}
    if(P(3))for(let q=0;q<5;q++){const a=-Math.PI*.85+q*.42;line(Math.cos(a)*hw,hy+Math.sin(a)*hh,Math.cos(a)*(hw+9),hy+Math.sin(a)*(hh+9),'#6fcf6a',2);dot(Math.cos(a)*(hw+10),hy+Math.sin(a)*(hh+10),2.2,'#ff9ad2');}
    break;}
  case 'psionic':{
    const gp=.6+.4*Math.sin(t*2.4);dot(0,hy-hh*.45,3.4,'rgba(255,255,255,'+gp+')');glow(0,hy-hh*.45,18,'210,170,255',.6*gp);
    ring(0,hy-hh-14,15,'rgba(255,240,170,'+(.8*k)+')',2.2);
    for(let q=0;q<6;q++){const a=t*.6+q*1.05;dot(Math.cos(a)*(hw+20),hy+Math.sin(a)*22,2.2,'rgba(235,215,255,.85)');}
    if(P(1))for(let q=0;q<3;q++)ring(0,hy,(t*18+q*20)%60+hh,'rgba(220,190,255,'+(.35*(1-((t*18+q*20)%60)/60))+')',1.4);
    if(P(2)){for(const s of [-1,1]){c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.beginPath();c.moveTo(s*ex,ey0);c.lineTo(s*80,ey0-18+Math.sin(t*2)*4);c.stroke();}}
    if(P(3)){c.globalAlpha=.22;for(const s of [-1,0,1])if(s)ell(s*(hw+14),hy+3,hw*.9,hh*.9,0,'#d7b8ff');}
    break;}
  case 'natural':{
    for(let q=0;q<9;q++){const a=-Math.PI*.95+q*.22;const x=Math.cos(a)*(hw+1),y=hy+Math.sin(a)*(hh+1);ell(x,y,4,2,a+1.2,'#5fb25a');if(q%3===1)dot(x*1.05,y*1.05-2,1.6,'#f5d76b');}
    c.strokeStyle='rgba(120,200,110,.55)';c.lineWidth=1.5;c.beginPath();c.arc(0,hy,hh+7,Math.PI*1.05,Math.PI*1.95);c.stroke();
    if(P(1))for(let q=0;q<3;q++)line(-8+q*8,hy-hh-2,-8+q*8+Math.sin(q)*2,hy-hh*.78,'#e8e0c8',2);
    if(P(2))for(let q=0;q<5;q++){const a=Math.PI*.1+q*.55;dot(Math.cos(a)*(sw-2),30+Math.sin(a)*8,2.4,['#ff9ad2','#f5d76b','#fff'][q%3]);}
    if(P(3))for(let q=0;q<3;q++)ring(0,hy-8,hh+14+q*5,'rgba(190,150,100,'+(.35-q*.09)+')',1.5);
    break;}
  }
  c.restore();
}

/* corner portrait on the scene. From the first settlements on. */
function drawPortrait(e,t,V){
  if(!V.form||e<6)return;
  const r=Math.max(46,U()*.16),cx=W-r-10,cy=H-r-10;
  c.save();
  c.beginPath();c.arc(cx,cy,r,0,TAU);c.clip();
  const g=c.createRadialGradient(cx,cy-r*.3,r*.1,cx,cy,r);
  const hb=e>=11?'rgba(70,40,20,.88)':e>=9?'rgba(10,20,40,.88)':e>=7?'rgba(30,20,20,.86)':'rgba(25,15,10,.86)';
  g.addColorStop(0,e>=11?'rgba(150,100,60,.9)':'rgba(70,70,80,.7)');g.addColorStop(1,hb);c.fillStyle=g;c.fillRect(cx-r,cy-r,r*2,r*2);
  c.translate(cx,cy+r*.12);const s=r/60;c.scale(s,s);
  drawPerson(t,Object.assign({},V,{era:e}));
  c.restore();
  c.save();c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2;c.beginPath();c.arc(cx,cy,r,0,TAU);c.stroke();c.restore();
}
/* the large preview in the Form tab */
function drawFormPreview(ctx2,w,h,t,S){
  withCtx(ctx2,w,h,()=>{
    c.clearRect(0,0,w,h);
    const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#1c2a36');g.addColorStop(1,'#0b1117');c.fillStyle=g;c.fillRect(0,0,w,h);
    glow(w/2,h*.45,h*.5,'255,200,150',.12);
    c.save();c.translate(w/2,h*.56);const s=h/118;c.scale(s,s);
    const V={form:S.form,era:Math.max(S.era,6),path:S.path,lean:S.lean,perks:S.perks};drawPerson(t,V);c.restore();
  });
}

/* hints for the silhouette scenes (hominids): ears, crown, horns and the shape of the body plan */
function formHead(F,r,col){
  if(!F)return;
  const b=F.body||'primate',e=F.ears||'round';
  if(e==='pointed'||b==='feline'){poly([[-r*.8,-r*.5],[-r*1.1,-r*2],[-r*.1,-r*.8]],col);poly([[r*.8,-r*.5],[r*1.1,-r*2],[r*.1,-r*.8]],col);}
  else if(e==='frill'){for(const s of [-1,1])for(let k=0;k<3;k++)line(s*r*.9,-r*.2,s*r*(1.5+k*.2),-r*(.2+k*.5),col,1.6);}
  else if(e!=='none'){const m=e==='large'?1.6:.9;dot(-r*.95,-r*.3,r*.5*m,col);dot(r*.95,-r*.3,r*.5*m,col);}
  if(F.hair==='crest'||b==='avian')poly([[-r*.3,-r*.9],[0,-r*2],[r*.3,-r*.9]],col);
  if(F.hair==='mane'||F.extra==='mantle')for(let k=0;k<9;k++){const a=Math.PI+k/8*Math.PI;line(Math.cos(a)*r*.8,Math.sin(a)*r*.8,Math.cos(a)*r*1.5,Math.sin(a)*r*1.5,col,2);}
  if(F.extra==='horns')for(const s of [-1,1])poly([[s*r*.6,-r*.7],[s*r*1.4,-r*1.9],[s*r*.2,-r*.95]],'#efe3c2');
  if(F.extra==='antennae'||b==='insect')for(const s of [-1,1])line(s*r*.3,-r*.8,s*r*1.2,-r*2.2,col,1.4);
  if(F.extra==='spines')for(let k=-2;k<=2;k++)poly([[k*r*.35-1,-r*.85],[k*r*.35,-r*1.5],[k*r*.35+1,-r*.85]],col);
  if(F.extra==='frill'){for(let k=0;k<7;k++){const a=Math.PI*(1.1+k/6*.8);line(Math.cos(a)*r*.8,Math.sin(a)*r*.8,Math.cos(a)*r*1.9,Math.sin(a)*r*1.9,col,1.8);}}
  if(b==='avian'||F.mouth==='beak')poly([[r*.7,-r*.1],[r*1.7,r*.2],[r*.7,r*.5]],'#e2b04a');
  if(F.arms==='four'){line(0,r*3.2,r*1.6,r*4.4,col,2.2);}
}
