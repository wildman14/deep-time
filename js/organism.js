/* Deep Time: visible evolution. Overlays that grow on the existing creature art from the genome (V.gn),
   plus the Earth's mood (V.env) and the habitat foreground (V.biome). Pure drawing, uses the helpers in art.js.
   gn: sz hue armor horn spikes eyes jaws claws fins wing fur camo venom stocky slim spots filt burrow brain social */
const NOGN={sz:1,hue:0,armor:0,horn:0,spikes:0,eyes:0,jaws:0,claws:0,fins:0,wing:0,fur:0,camo:0,venom:0,stocky:0,slim:0,spots:0,filt:0,burrow:0,brain:0,social:0};
function tintCol(hex,deg,sat){
  if(!deg&&!sat)return hex;
  const n=parseInt(hex.slice(1),16),r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255,mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;
  let h=0,s=0;const d=mx-mn;
  if(d){s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60;}
  return 'hsl('+Math.round((h+deg+360)%360)+','+Math.round(s*100*(sat==null?1:sat))+'%,'+Math.round(l*100)+'%)';
}
/* spots drawn inside an ellipse (rx,ry) at the origin; used for venom warning marks and camouflage mottling */
function mottle(rx,ry,n,col,seed,rad){for(let k=0;k<n;k++){const a=rnd(seed+k)*TAU,d=Math.sqrt(rnd(seed+k+40))*.85;dot(Math.cos(a)*rx*d,Math.sin(a)*ry*d,rad*(.6+rnd(seed+k+80)*.8),col);}}

function orgCell(cx,cy,R,t,g){
  if(g.camo)for(let k=0;k<9;k++){const a=rnd(k+200)*TAU,d=R*.7*rnd(k+210);dot(cx+Math.cos(a)*d,cy+Math.sin(a)*d,R*.09,'rgba(30,60,50,.45)');}
  if(g.venom)for(let k=0;k<7;k++){const a=k/7*TAU+t*.2;dot(cx+Math.cos(a)*R*.62,cy+Math.sin(a)*R*.62,R*.07,'#ffd23f');}
  if(g.spots)for(let k=0;k<5;k++)dot(cx+Math.cos(k*1.3)*R*.5,cy+Math.sin(k*1.3)*R*.4,R*.06,'rgba(255,255,255,.5)');
  if(g.armor){c.strokeStyle='rgba(235,240,245,.9)';c.lineWidth=R*.07;for(let k=0;k<6;k++){const a=k/6*TAU+.2;c.beginPath();c.arc(cx,cy,R*1.04,a,a+.75);c.stroke();}}
  if(g.spikes){c.strokeStyle='rgba(255,230,160,.9)';c.lineWidth=2;for(let k=0;k<14;k++){const a=k/14*TAU;line(cx+Math.cos(a)*R,cy+Math.sin(a)*R,cx+Math.cos(a)*R*1.28,cy+Math.sin(a)*R*1.28,'rgba(255,230,160,.9)',2);}}
  if(g.horn){poly([[cx-R*.15,cy-R],[cx,cy-R*1.5],[cx+R*.15,cy-R]],'rgba(240,235,220,.9)');}
  if(g.eyes){const er=R*(g.eyes>1?.2:.12);dot(cx+R*.4,cy-R*.25,er*1.5,'#f5fbff');dot(cx+R*.43,cy-R*.25,er*.8,'#06141a');}
  if(g.fins)for(let k=0;k<10;k++){const a=Math.PI+(k-4.5)*.12;line(cx+Math.cos(a)*R,cy+Math.sin(a)*R,cx+Math.cos(a)*R*1.5+Math.sin(t*8+k)*3,cy+Math.sin(a)*R*1.5,'rgba(190,255,245,.8)',1.4);}
  if(g.filt)for(let k=0;k<16;k++){const a=k/16*TAU;line(cx+Math.cos(a)*R,cy+Math.sin(a)*R,cx+Math.cos(a)*R*1.18,cy+Math.sin(a)*R*1.18,'rgba(160,255,200,.6)',1);}
}
function orgColony(cx,cy,Rm,t,g,pos){
  const n=pos.length;
  if(g.armor){c.strokeStyle='rgba(240,235,225,.85)';c.lineWidth=5;for(let k=0;k<10;k++){const a=k/10*TAU;c.beginPath();c.arc(cx,cy,Rm*1.02,a,a+.4);c.stroke();}}
  if(g.spikes||g.venom)for(let i=Math.max(0,n-14);i<n;i++){const q=pos[i],dx=q[0]-cx,dy=q[1]-cy,d=Math.hypot(dx,dy)||1;line(q[0],q[1],q[0]+dx/d*q[2]*2.1,q[1]+dy/d*q[2]*2.1,g.venom?'rgba(255,210,60,.9)':'rgba(255,240,200,.85)',2);}
  if(g.camo)for(let i=0;i<n;i+=3){const q=pos[i];dot(q[0],q[1],q[2]*.45,'rgba(70,40,60,.35)');}
  if(g.eyes)for(let i=Math.max(0,n-5);i<n;i++){const q=pos[i];dot(q[0],q[1],q[2]*(g.eyes>1?.5:.3),'#f8fbff');dot(q[0]+1,q[1],q[2]*.2,'#10060f');}
  if(g.fins&&g.slim)for(let k=0;k<4;k++)line(cx-Rm*(1+k*.1),cy+(k-1.5)*8,cx-Rm*(1.5+k*.2),cy+(k-1.5)*8,'rgba(255,230,240,.5)',2);
}
/* fish: local frame, body is an ellipse 40 by 16*sl centred on the origin, facing +x */
function orgFish(g,sl,t,col){
  c.save();
  if(g.armor){for(let k=0;k<7;k++){const x=-24+k*8;poly([[x,-14*sl+2],[x+4,-19*sl],[x+8,-14*sl+2]],'rgba(225,230,235,.95)');}c.strokeStyle='rgba(230,235,240,.85)';c.lineWidth=2;c.beginPath();c.ellipse(0,0,40,16*sl,0,Math.PI*1.1,Math.PI*1.9);c.stroke();ell(26,-2,12,10*sl,0,'rgba(235,240,245,.45)');}
  if(g.camo)mottle(34,12*sl,10,'rgba(30,60,80,.5)',300,3.2);
  if(g.venom)for(let k=0;k<6;k++)dot(-26+k*9,Math.sin(k*2)*5*sl,2.4,'#ffd23f');
  if(g.spots)for(let k=0;k<4;k++)dot(-14+k*10,-4+(k%2)*6,1.8,'rgba(255,255,255,.7)');
  if(g.spikes)for(let k=0;k<6;k++){const x=-18+k*9;poly([[x,-15*sl],[x+2,-24*sl],[x+4,-15*sl]],'#f0e6c8');}
  if(g.horn)poly([[30,-12*sl],[40,-26*sl],[36,-9*sl]],'#f5ecd0');
  if(g.fins){poly([[-58,0],[-84,-26+Math.sin(t*6)*5],[-84,26+Math.sin(t*6)*5]],'rgba(255,225,140,.55)');poly([[6,-14*sl],[24,-34],[28,-14*sl]],'rgba(255,225,140,.5)');}
  if(g.filt)for(let k=0;k<5;k++)line(36,-4+k*2.2,48,-8+k*4,'rgba(200,255,220,.7)',1.2);
  if(g.jaws){poly([[36,-1],[54,-12],[52,8]],'#04121f');for(let k=0;k<4;k++)poly([[40+k*3,-4+k*0],[42+k*3,-11+k],[44+k*3,-3]],'#fff');for(let k=0;k<3;k++)poly([[42+k*3,4],[44+k*3,10],[46+k*3,3]],'#fff');}
  if(g.eyes){const er=g.eyes>1?6.5:4.2;dot(24,-4,er+1.5,'#f6fbff');dot(25,-4,er*.62,'#04121f');dot(26.5,-5.5,er*.2,'#fff');}
  if(g.brain)ell(14,-9*sl,7,4,0,'rgba(255,170,220,.45)');
  c.restore();
}
/* tetrapod: body ellipse 46 by 16, head at (52,-4), tail to the left */
function orgQuad(g,t,col){
  c.save();
  if(g.armor){for(let k=0;k<8;k++){const x=-34+k*9;poly([[x,-14],[x+4.5,-21],[x+9,-14]],'#c9ccc0');}c.strokeStyle='rgba(215,220,205,.7)';c.lineWidth=2.2;c.beginPath();c.ellipse(0,0,46,16,0,Math.PI*1.08,Math.PI*1.92);c.stroke();}
  if(g.camo)mottle(40,12,12,'rgba(30,50,20,.5)',320,3.4);
  if(g.venom)for(let k=0;k<7;k++)dot(-34+k*10,Math.sin(k*2)*5,2.6,'#ffd23f');
  if(g.spots)for(let k=0;k<5;k++)dot(-26+k*11,-3+(k%2)*5,2,'rgba(255,255,255,.65)');
  if(g.spikes)for(let k=0;k<7;k++){const x=-34+k*10;poly([[x,-14],[x+2.5,-24],[x+5,-14]],'#efe3c0');}
  if(g.horn){poly([[56,-12],[62,-28],[66,-10]],'#f3ead2');poly([[48,-13],[50,-26],[55,-12]],'#f3ead2');}
  if(g.claws)for(const lx of [-26,28]){for(let k=0;k<3;k++)line(lx+k*3-3,28,lx+k*3-2,33,'#efe7d0',1.8);}
  if(g.jaws){poly([[62,-3],[74,-1],[62,4]],'#10200c');for(let k=0;k<3;k++)poly([[63+k*3,-1],[65+k*3,4],[67+k*3,0]],'#fff');}
  if(g.eyes){const er=g.eyes>1?5.5:3.8;dot(58,-8,er+1.4,'#fbfff4');dot(59,-8,er*.6,'#10200c');}
  if(g.fins){c.fillStyle='rgba(240,200,120,.6)';c.beginPath();c.moveTo(-40,0);c.lineTo(-70,-14+Math.sin(t*4)*3);c.lineTo(-96,0);c.lineTo(-70,14);c.closePath();c.fill();}
  if(g.brain)ell(46,-13,7,4,0,'rgba(255,170,220,.4)');
  c.restore();
}
/* small mammal: body 27 by 15, head at (31,-7), tail curling up behind */
function orgMammal(g,t,col){
  c.save();
  if(g.wing){
    const fl=Math.sin(t*5)*.25,mem=g.wing<2;
    c.fillStyle=mem?'rgba(70,45,40,.8)':'rgba(235,235,240,.9)';c.strokeStyle=mem?'rgba(120,80,70,.9)':'rgba(180,185,200,.95)';c.lineWidth=1.6;
    c.beginPath();c.moveTo(-6,-10);c.quadraticCurveTo(-18,-46-fl*40,-48,-36-fl*50);c.quadraticCurveTo(-32,-26,-34,-12);c.quadraticCurveTo(-20,-18,-6,-10);c.fill();c.stroke();
    if(!mem)for(let k=0;k<5;k++)line(-8-k*8,-12-k*2,-24-k*7,-34-k*3-fl*35,'rgba(150,155,175,.9)',1.2);
  }
  if(g.armor){for(let k=0;k<6;k++){const x=-20+k*7;ell(x,-11,4.4,3,0,'#b9b3a2');}}
  if(g.camo)mottle(22,11,10,'rgba(50,35,20,.5)',340,2.6);
  if(g.venom)for(let k=0;k<5;k++)dot(-16+k*8,-1+Math.sin(k)*4,2.1,'#ffd23f');
  if(g.spots)for(let k=0;k<4;k++)dot(-12+k*8,-3+(k%2)*5,1.6,'rgba(255,255,255,.65)');
  if(g.spikes)for(let k=0;k<7;k++){const x=-22+k*6.5;poly([[x,-14],[x+1.8,-22],[x+3.6,-14]],'#f0e4c0');}
  if(g.horn)poly([[40,-14],[45,-30],[48,-11]],'#f3ead2');
  if(g.claws)for(const lx of [-12,10])for(let k=0;k<3;k++)line(lx+k*2.2,17,lx+k*2.2+1,21,'#efe7d0',1.4);
  if(g.jaws){for(let k=0;k<3;k++)poly([[47+k*2.5,-6],[48.5+k*2.5,-1],[50+k*2.5,-6]],'#fff');}
  if(g.eyes>1){dot(37,-9,4.6,'#fffdf2');dot(37.6,-9,2.6,'#000');}
  if(g.brain)ell(30,-14,6,3.4,0,'rgba(255,170,220,.4)');
  c.restore();
}
/* ---------- the mood of the world ---------- */
function envFx(t,V){
  const v=V.env;if(!v)return;
  let any=false;for(const k in v)if(v[k]>.01){any=true;break;}
  if(!any)return;
  if(v.murk>.01){c.fillStyle='rgba(40,70,28,'+(.32*v.murk)+')';c.fillRect(0,0,W,H);}
  if(v.haze>.01){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(150,90,50,'+(.42*v.haze)+')');g.addColorStop(1,'rgba(120,70,40,'+(.18*v.haze)+')');c.fillStyle=g;c.fillRect(0,0,W,H);}
  if(v.red>.01){glow(W*.5,H*1.05,W*.8,'255,70,20',.38*v.red);c.fillStyle='rgba(200,40,10,'+(.16*v.red)+')';c.fillRect(0,0,W,H);}
  if(v.heat>.01){c.fillStyle='rgba(255,150,40,'+(.14*v.heat)+')';c.fillRect(0,0,W,H);c.strokeStyle='rgba(255,220,160,'+(.12*v.heat)+')';c.lineWidth=1.5;for(let k=0;k<6;k++){const y=H*(.55+.07*k);c.beginPath();for(let x=0;x<=W;x+=14)c.lineTo(x,y+Math.sin(x*.05+t*3+k)*3);c.stroke();}}
  if(v.ice>.01){c.fillStyle='rgba(200,230,255,'+(.2*v.ice)+')';c.fillRect(0,0,W,H);const g=c.createRadialGradient(W/2,H/2,H*.25,W/2,H/2,W*.65);g.addColorStop(0,'rgba(220,240,255,0)');g.addColorStop(1,'rgba(220,240,255,'+(.35*v.ice)+')');c.fillStyle=g;c.fillRect(0,0,W,H);
    for(let i=0;i<26;i++){const x=(rnd(i+500)*W+Math.sin(t*.8+i)*14+t*6)%W,y=((rnd(i+520)*H+t*(14+rnd(i)*10))%H);dot(x,y,1+rnd(i+540)*1.6,'rgba(255,255,255,'+(.7*v.ice)+')');}}
  if(v.ash>.01)for(let i=0;i<30;i++){const x=(rnd(i+600)*W+Math.sin(t*.5+i)*18)%W,y=(rnd(i+640)*H+t*(20+rnd(i+680)*24))%H;dot(x,y,1.2+rnd(i+700)*2,'rgba(150,145,140,'+(.7*v.ash)+')');}
  if(v.dark>.01){c.fillStyle='rgba(2,2,12,'+(.62*v.dark)+')';c.fillRect(0,0,W,H);}
  if(v.flash>.05){c.fillStyle='rgba(255,245,210,'+(.55*v.flash*(.6+.4*Math.sin(t*20)))+')';c.fillRect(0,0,W,H);}
}
/* ---------- the habitat, drawn at the edges so the creature stays clear ---------- */
function biomeFx(e,t,V){
  const b=V.biome;if(!b||e>5||b===(typeof DEFAULT_BIOME!=='undefined'?DEFAULT_BIOME[e]:''))return;
  c.save();
  const bot=H;
  switch(b){
  case 'vent':for(const x of [W*.06,W*.9]){poly([[x-14,bot],[x-6,bot-H*.2],[x+6,bot-H*.2],[x+14,bot]],'#1b1210');for(let k=0;k<5;k++){const u=(t*.4+k*.2+x)%1;dot(x+Math.sin(u*8+k)*6,bot-H*.2-u*H*.4,2+u*5,'rgba(60,50,45,'+(.5*(1-u))+')');}glow(x,bot-H*.2,H*.12,'255,120,40',.35);}break;
  case 'shallow':for(let k=0;k<4;k++){const x=W*(.1+.25*k)+Math.sin(t*.4+k)*10;poly([[x,0],[x+26,0],[x+80,bot],[x-10,bot]],'rgba(255,250,200,.06)');}c.fillStyle='rgba(235,215,150,.35)';c.fillRect(0,bot-H*.05,W,H*.05);break;
  case 'open':{const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'rgba(0,10,40,.05)');g.addColorStop(1,'rgba(0,5,25,.4)');c.fillStyle=g;c.fillRect(0,0,W,H);break;}
  case 'reef':{const cols=['rgba(255,110,140,.85)','rgba(255,170,70,.85)','rgba(190,110,255,.8)','rgba(90,220,200,.8)'];for(let k=0;k<9;k++){const x=W*(.03+.11*k),h=H*(.07+.06*rnd(k+9));for(let q=0;q<3;q++)ell(x+q*8,bot-h*.5,5,h*(.6+.2*q),Math.sin(t+k+q)*.05,cols[(k+q)%4]);}break;}
  case 'fresh':case 'wetland':case 'swamp':for(let k=0;k<22;k++){const x=W*(rnd(k+11)),h=H*(.08+.12*rnd(k+31));line(x,bot,x+Math.sin(t*1.2+k)*5,bot-h,'rgba(70,120,50,.8)',2.4);if(k%3===0)ell(x+Math.sin(t*1.2+k)*5,bot-h,2.6,6,0,'rgba(110,70,40,.85)');}
    if(b==='swamp'){const g=c.createLinearGradient(0,H*.6,0,H);g.addColorStop(0,'rgba(210,230,200,0)');g.addColorStop(1,'rgba(210,230,200,.2)');c.fillStyle=g;c.fillRect(0,H*.6,W,H*.4);}break;
  case 'river':c.strokeStyle='rgba(200,235,255,.25)';c.lineWidth=2;for(let k=0;k<8;k++){const y=H*(.25+.09*k),x0=((t*60+k*70)%(W+120))-60;c.beginPath();c.moveTo(x0,y);c.lineTo(x0+60,y);c.stroke();}break;
  case 'tidal':c.fillStyle='rgba(200,170,120,.35)';c.fillRect(0,bot-H*.1,W,H*.1);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;c.beginPath();for(let x=0;x<=W;x+=12)c.lineTo(x,bot-H*.1+Math.sin(x*.05+t*2)*3);c.stroke();break;
  case 'shore':for(let k=0;k<5;k++)ell(W*(.65+.07*k),bot-H*.03,W*.06,H*.05,0,'rgba(60,60,70,.8)');break;
  case 'forest':for(const x of [W*.04,W*.95]){c.fillStyle='rgba(20,34,18,.85)';c.fillRect(x-W*.02,0,W*.04,H);dot(x,H*.1,H*.14,'rgba(25,60,28,.85)');dot(x+(x<W/2?W*.04:-W*.04),H*.3,H*.1,'rgba(25,60,28,.8)');}break;
  case 'mount':poly([[0,bot],[W*.18,H*.62],[W*.3,H*.78],[W*.5,H*.55],[W*.75,H*.8],[W*.9,H*.66],[W,bot]],'rgba(40,45,60,.75)');poly([[W*.18-12,H*.66],[W*.18,H*.62],[W*.18+12,H*.66]],'rgba(240,245,255,.8)');poly([[W*.5-14,H*.6],[W*.5,H*.55],[W*.5+14,H*.6]],'rgba(240,245,255,.8)');break;
  case 'desert':c.fillStyle='rgba(222,180,100,.65)';c.beginPath();c.moveTo(0,bot);for(let x=0;x<=W;x+=20)c.lineTo(x,bot-H*.08-Math.sin(x*.012)*H*.03);c.lineTo(W,bot);c.fill();line(W*.88,bot-H*.05,W*.88,bot-H*.22,'rgba(40,90,40,.9)',6);line(W*.88,bot-H*.15,W*.84,bot-H*.2,'rgba(40,90,40,.9)',4);break;
  case 'grass':for(let k=0;k<50;k++){const x=W*rnd(k+3),h=H*(.05+.07*rnd(k+4));line(x,bot,x+Math.sin(t*1.5+k)*4,bot-h,'rgba(150,170,60,.8)',2);}break;
  case 'tundra':c.fillStyle='rgba(240,245,255,.7)';c.fillRect(0,bot-H*.07,W,H*.07);for(let i=0;i<20;i++){const x=(rnd(i+800)*W+t*12)%W,y=(rnd(i+830)*H+t*18)%H;dot(x,y,1.3,'rgba(255,255,255,.75)');}break;
  }
  c.restore();
}
