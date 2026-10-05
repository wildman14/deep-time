/* Deep Time: canvas scenes, one per stage. Pure drawing, no game state.
   Every scene receives V, a plain description of what the player owns:
     V.a[0..2]  adaptations bought this stage (0 or 1)
     V.g[0..2]  how many of each trait are owned this stage
     V.n        ids of owned tech and civic nodes, e.g. V.n.S3a
     V.b        how many nodes are owned per branch (S, M, C, K, D, X)
     V.flash    0..1, a short burst right after buying something */
let c=null,W=640,H=400;
function setCtx(ctx,w,h){c=ctx;W=w;H=h;}
const TAU=Math.PI*2;
const rnd=i=>{const x=Math.sin(i*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const U=()=>Math.min(W,H);
const NOLOOK={a:[0,0,0],g:[0,0,0],n:{},b:{S:0,M:0,C:0,K:0,D:0,X:0},flash:0};
function grad(stops){const g=c.createLinearGradient(0,0,0,H);stops.forEach(s=>g.addColorStop(s[0],s[1]));c.fillStyle=g;c.fillRect(0,0,W,H);}
function glow(x,y,r,rgb,a){const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba('+rgb+','+a+')');g.addColorStop(1,'rgba('+rgb+',0)');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,TAU);c.fill();}
function dot(x,y,r,col){c.fillStyle=col;c.beginPath();c.arc(x,y,Math.max(0,r),0,TAU);c.fill();}
function ell(x,y,rx,ry,rot,col){c.fillStyle=col;c.beginPath();c.ellipse(x,y,Math.max(0,rx),Math.max(0,ry),rot||0,0,TAU);c.fill();}
function poly(pts,col){c.fillStyle=col;c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.closePath();c.fill();}
function line(x1,y1,x2,y2,col,w){c.strokeStyle=col;c.lineWidth=w||1;c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();}
function ring(x,y,r,col,w){c.strokeStyle=col;c.lineWidth=w||1;c.beginPath();c.arc(x,y,Math.max(0,r),0,TAU);c.stroke();}
function rect(x,y,w,h,col){c.fillStyle=col;c.fillRect(x,y,w,h);}
function gear(x,y,r,rot,col){
  c.save();c.translate(x,y);c.rotate(rot);c.fillStyle=col;c.beginPath();
  for(let k=0;k<20;k++){const a=k/20*TAU,rr=(k%2)?r*.8:r;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}
  c.closePath();c.fill();c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.arc(0,0,r*.32,0,TAU);c.fill();c.restore();
}

/* ---------- Stage 1: a single cell ---------- */
function s0(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#053540'],[1,'#030f14']]);
  for(let i=0;i<70;i++){const sp=.3+rnd(i+9);const x=(rnd(i)*W+t*7*sp)%W;const y=(rnd(i+3)*H+Math.sin(t*.6+i)*8+H)%H;dot(x,y,.8+rnd(i+5)*2,'rgba(127,240,223,'+(.15+rnd(i+7)*.5)+')');}
  const cx=W*.5,cy=H*.56,R=U()*.15*(1+Math.min(.4,o/150))*(1+.04*Math.sin(t*2)+p*.18);
  glow(cx,cy,R*3,'80,230,210',.35+(A[2]?.2:0));
  const nf=G[0]>0?Math.min(5,1+Math.floor(G[0]/3)):0,sp=A[2]?14:9;
  c.strokeStyle='#7ff0df';c.lineWidth=2;c.lineCap='round';
  for(let f=0;f<nf;f++){const a=Math.PI+(f-(nf-1)/2)*.5;const dx=Math.cos(a),dy=Math.sin(a);c.beginPath();for(let k=0;k<=16;k++){const s=k/16;const w=Math.sin(s*8-t*sp+f)*R*.16*s;const x=cx+dx*(R+R*1.9*s)-dy*w;const y=cy+dy*(R+R*1.9*s)+dx*w;if(k)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
  c.fillStyle='rgba(110,240,220,.16)';c.strokeStyle='#7ff0df';c.lineWidth=2.5;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();c.stroke();
  if(A[0]){ring(cx,cy,R*1.1,'rgba(200,255,248,.9)',3.5);for(let i=0;i<24;i++){const a=i/24*TAU+t*.08,x2=cx+Math.cos(a)*R*1.32,y2=cy+Math.sin(a)*R*1.32;line(cx+Math.cos(a)*R*1.1,cy+Math.sin(a)*R*1.1,x2,y2,'rgba(200,255,248,.85)',1.6);dot(x2,y2,R*.035,'#eafffb');}}
  dot(cx+R*.15,cy-R*.1,R*.32,'rgba(180,255,245,.35)');
  const cn=G[1]>0?Math.min(8,1+Math.floor(G[1]/2)):0;
  for(let i=0;i<cn;i++){const a=i*2.4+t*.18,r=R*(.28+rnd(i+1)*.4),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;ell(x,y,R*.17,R*.095,a,'#52d97a');ell(x,y,R*.1,R*.045,a,'#2c9c4f');}
  const mn=G[2]>0?Math.min(8,1+Math.floor(G[2]/2)):0;
  for(let i=0;i<mn;i++){const a=i*2.1+1+t*.14,r=R*(.25+rnd(i+30)*.45),x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r,q=a+1;ell(x,y,R*.16,R*.085,q,'#ff9a4a');c.strokeStyle='#b4531c';c.lineWidth=1.2;c.beginPath();c.moveTo(x-Math.cos(q)*R*.1,y-Math.sin(q)*R*.1);c.quadraticCurveTo(x,y+R*.05,x+Math.cos(q)*R*.1,y+Math.sin(q)*R*.1);c.stroke();}
  if(A[1])for(let i=0;i<12;i++){const a=t*(1.1+rnd(i)*.8)+i*.52,r=R*(.35+.3*Math.sin(t*1.3+i));dot(cx+Math.cos(a)*r,cy+Math.sin(a)*r,R*.04,'#fff7a6');}
  if(A[2]){c.setLineDash([R*.16,R*.12]);c.lineDashOffset=-t*60;ring(cx,cy,R*1.5,'rgba(255,255,255,.65)',2);c.setLineDash([]);}
}

/* ---------- Stage 2: a colony ---------- */
function s1(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#3a1030'],[1,'#13060f']]);
  for(let i=0;i<40;i++){const x=rnd(i)*W+Math.sin(t*.5+i)*6;const y=H-((rnd(i+3)*H+t*14*(.4+rnd(i+8)))%H);dot(x,y,1+rnd(i+5)*2.5,'rgba(255,170,200,'+(.12+rnd(i+7)*.3)+')');}
  const cx=W*.5,cy=H*.56,r=U()*.042*(1+p*.12),n=16+Math.min(24,o),pos=[];
  for(let i=0;i<n;i++){const a=i*2.39996,rad=Math.sqrt(i+.5)*r*1.6;pos.push([cx+Math.cos(a)*rad+Math.sin(t*1.2+i)*2,cy+Math.sin(a)*rad+Math.cos(t*1.1+i)*2,r*(.86+.14*Math.sin(t*2+i))]);}
  const Rm=Math.sqrt(n+.5)*r*1.6+r*1.5;
  if(G[2]>0){c.fillStyle='rgba(255,245,235,.10)';c.strokeStyle='rgba(255,245,235,.85)';c.lineWidth=3.5;c.beginPath();for(let k=0;k<=60;k++){const a=k/60*TAU,rad=Rm*(1+.05*Math.sin(a*9));const x=cx+Math.cos(a)*rad,y=cy+Math.sin(a)*rad;if(k)c.lineTo(x,y);else c.moveTo(x,y);}c.closePath();c.fill();c.stroke();}
  if(A[0])for(let i=3;i<n;i++)line(pos[i][0],pos[i][1],pos[i-3][0],pos[i-3][1],'rgba(255,255,255,.6)',3);
  if(G[1]>0){for(let i=1;i<n;i++){const pa=pos[i],pb=pos[i-1];const al=.35+.35*Math.sin(t*3+i*.7);line(pa[0],pa[1],pb[0],pb[1],'rgba(255,236,120,'+al+')',2);}
    for(let k=0;k<4;k++){const i=1+Math.floor(((t*2+k*3)%(n-1))),pa=pos[i],pb=pos[i-1],u=(t*2+k*3)%1;dot(pb[0]+(pa[0]-pb[0])*u,pb[1]+(pa[1]-pb[1])*u,r*.14,'#fff6b0');}}
  for(let i=n-1;i>=0;i--){const q=pos[i];let hue=330+(i%7)*8;
    if(G[0]>0)hue=i<n*.3?8:i<n*.65?42:185;
    c.fillStyle='hsla('+hue+',80%,66%,.62)';c.strokeStyle='hsla('+hue+',90%,86%,.85)';c.lineWidth=1.5;c.beginPath();c.arc(q[0],q[1],q[2],0,TAU);c.fill();c.stroke();dot(q[0]+q[2]*.15,q[1]-q[2]*.1,q[2]*.35,'hsla('+hue+',90%,92%,.5)');}
  if(A[1]){for(let i=Math.max(0,n-12);i<n;i++){const q=pos[i],dx=q[0]-cx,dy=q[1]-cy,d=Math.hypot(dx,dy)||1;line(q[0]+dx/d*q[2],q[1]+dy/d*q[2],q[0]+dx/d*q[2]*1.9,q[1]+dy/d*q[2]*1.9,'rgba(255,230,240,.8)',1.6);}
    for(let k=0;k<16;k++){const u=(t*.18+k/16)%1,a=k*1.7,d=Rm*(2.3-1.5*u);dot(cx+Math.cos(a)*d,cy+Math.sin(a)*d,2.2,'rgba(150,255,170,'+(.8*(1-u))+')');}}
  if(A[2])for(let i=Math.max(0,n-8);i<n;i++){const q=pos[i],dx=q[0]-cx,dy=q[1]-cy,d=Math.hypot(dx,dy)||1,ex=q[0]+dx/d*q[2]*.45,ey=q[1]+dy/d*q[2]*.45;dot(ex,ey,q[2]*.38,'#fff');dot(ex+dx/d*q[2]*.1,ey+dy/d*q[2]*.1,q[2]*.18,'#10060f');}
}

/* ---------- Stage 3: a fish ---------- */
function fish(x,y,s,dir,t,col,F){
  F=F||{};const sl=F.slim?.74:1;
  c.save();c.translate(x,y);c.scale(dir*s,s);const w=Math.sin(t*6+x*.01)*7;
  const fc=F.fins?F.fc:col,k=F.fins?1.35:1;
  c.fillStyle=col;c.beginPath();c.ellipse(0,0,40,16*sl,0,0,TAU);c.fill();
  poly([[-34,0],[-62*k,-15*k+w],[-62*k,15*k+w]],fc);poly([[-8,-14*sl],[8,-27*k],[18,-14*sl]],fc);poly([[4,12*sl],[-8,24*k],[14,14*sl]],fc);
  if(F.fins)poly([[10,8*sl],[22,22],[26,8*sl]],fc);
  if(F.spine){line(-34,0,30,-1,'rgba(255,255,255,.8)',2.4);for(let k2=0;k2<8;k2++){const px=-28+k2*8;line(px,-8*sl,px,8*sl,'rgba(255,255,255,.55)',1.4);}}
  if(F.gills){c.strokeStyle='#ff5f73';c.lineWidth=2.2;for(let k2=0;k2<3;k2++){c.beginPath();c.moveTo(16-k2*5,-9*sl);c.quadraticCurveTo(11-k2*5,0,16-k2*5,9*sl);c.stroke();}}
  if(F.jaw){poly([[36,0],[52,-8],[50,6]],'#04121f');poly([[40,-3],[44,-9],[46,-3]],'#fff');poly([[45,-1],[49,-7],[50,0]],'#fff');poly([[42,3],[46,8],[48,2]],'#fff');}
  if(F.lat)for(let k2=0;k2<11;k2++)dot(-30+k2*6.3,1,1.2,'rgba(255,255,255,.75)');
  dot(24,-3,3,'#04121f');c.restore();
  if(F.lat)for(let k2=0;k2<2;k2++){const u=((t*.6)+k2*.5)%1;ring(x,y,u*95*s,'rgba(160,225,255,'+(.5*(1-u))+')',2);}
  if(F.slim)for(let k2=0;k2<3;k2++)line(x-dir*(48*s),y+(k2-1)*8*s,x-dir*(88*s+k2*10*s),y+(k2-1)*8*s,'rgba(200,235,255,'+(.45-k2*.1)+')',2);
}
function s2(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#0c4a7a'],[1,'#041528']]);
  for(let k=0;k<5;k++){const x=W*(.1+.2*k)+Math.sin(t*.3+k)*20;poly([[x,0],[x+30,0],[x+90+k*10,H],[x-40,H]],'rgba(180,225,255,.05)');}
  for(let i=0;i<9;i++){const x=((t*(18+rnd(i)*14)+rnd(i+1)*W)%(W+160))-80;const y=H*.14+rnd(i+2)*H*.5+Math.sin(t+i)*5;fish(x,y,.28+rnd(i+3)*.25,1,t+i,'rgba(120,190,255,.32)');}
  for(let i=0;i<40;i++){const x=(rnd(i)*W+t*6)%W;const y=(rnd(i+3)*H+Math.sin(t*.4+i)*6+H)%H;dot(x,y,1.2,'rgba(200,240,255,.35)');}
  c.fillStyle='#030d1a';c.beginPath();c.moveTo(0,H);for(let x=0;x<=W;x+=20)c.lineTo(x,H*.9-Math.abs(Math.sin(x*.02))*H*.06);c.lineTo(W,H);c.fill();
  const s=U()/190*(1+Math.min(.5,o/120))*(1+p*.12);
  const fx=W*.5+Math.sin(t*.7)*W*.05,fy=H*.5+Math.sin(t*1.3)*6;
  fish(fx,fy,s,1,t,'#8fd0ff',{slim:A[0],fins:A[1],lat:A[2],gills:G[0]>0,spine:G[1]>0,jaw:G[2]>0,fc:'#ffd166'});
  if(G[0]>0)for(let k=0;k<Math.min(8,G[0]);k++){const u=(t*.4+k*.17)%1;dot(fx+50*s+Math.sin(u*9+k)*6,fy-u*H*.4,2+k%3,'rgba(220,245,255,'+(.7*(1-u))+')');}
}

/* ---------- Stage 4: a tetrapod on the shore ---------- */
function quad(x,y,s,t,col,eye,F){
  F=F||{};
  c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle=col;c.lineCap='round';
  if(F.legs){c.lineWidth=7;[[-26,0,F.wrist],[-12,Math.PI,0],[14,Math.PI,0],[28,0,F.wrist]].forEach(l=>{const sw=Math.sin(t*3+l[1])*5;c.lineWidth=l[2]?11:7;c.beginPath();c.moveTo(l[0],8);c.lineTo(l[0]+sw,26);c.stroke();if(l[2])ell(l[0]+sw,27,8,3.5,0,col);});}
  else{[-24,-6,14,30].forEach((lx,i)=>{const w=F.wrist&&lx>0;ell(lx,w?18:16,w?8:4,w?14:10,.5*(i%2?-1:1)+Math.sin(t*3+i)*.2,col);});}
  c.lineWidth=8;c.beginPath();c.moveTo(-40,0);c.quadraticCurveTo(-70,10+Math.sin(t*2)*4,-92,-2+Math.sin(t*2)*6);c.stroke();
  ell(0,0,46,16,0,col);ell(52,-4,17,11,.1,col);dot(58,-8,2.6,eye);
  if(F.lungs){ell(-4,0,22,8,0,'rgba(255,140,170,.6)');ell(-4,0,14,4,0,'rgba(255,190,205,.6)');for(let k=0;k<3;k=k+1){const u=(t*.7+k/3)%1;dot(70+u*12,-12-u*24,2+u*3,'rgba(255,255,255,'+(.6*(1-u))+')');}}
  if(F.scales){c.fillStyle='rgba(20,60,20,.55)';for(let k=0;k<9;k++){c.beginPath();c.arc(-34+k*9,-9+(k%2)*5,3,0,Math.PI);c.fill();}}
  if(F.ear){ring(38,-9,5,'#2a1a10',2);dot(38,-9,2,'#2a1a10');for(let k=0;k<3;k++){const u=(t*.8+k/3)%1;c.strokeStyle='rgba(255,255,255,'+(.6*(1-u))+')';c.lineWidth=2;c.beginPath();c.arc(70,-26,8+u*28,Math.PI*.75,Math.PI*1.25);c.stroke();}}
  c.restore();
}
function s3(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#2c4a66'],[.55,'#e8a56a'],[1,'#e8a56a']]);
  glow(W*.78,H*.4,H*.45,'255,200,120',.7);dot(W*.78,H*.4,H*.07,'#ffe2a8');
  c.fillStyle='#2a5d75';c.fillRect(0,H*.56,W,H*.44);
  c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1.5;
  for(let k=0;k<5;k++){c.beginPath();for(let x=0;x<=W;x+=12){const y=H*.6+k*H*.045+Math.sin(x*.03+t*1.2+k)*3;if(x)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}
  c.fillStyle='#c79a63';c.beginPath();c.moveTo(W*.22,H);c.quadraticCurveTo(W*.4,H*.72,W*.62,H*.69);c.lineTo(W,H*.67);c.lineTo(W,H);c.fill();
  c.fillStyle='rgba(60,35,15,.25)';c.beginPath();c.moveTo(W*.22,H);c.quadraticCurveTo(W*.4,H*.8,W*.62,H*.77);c.lineTo(W,H*.75);c.lineTo(W,H);c.fill();
  const s=U()/190*(1+Math.min(.5,o/120))*(1+p*.1),qx=W*.6,qy=H*.63;
  if(A[0])for(let k=0;k<5;k++)ell(qx-70*s-k*32*s,qy+34*s+(k%2)*6*s,7*s,3.4*s,0,'rgba(70,40,15,.55)');
  if(G[2]>0){const nx=W*.84,ny=H*.84,m=Math.min(6,G[2]);ell(nx,ny,W*.07,H*.03,0,'#6b4a2a');ell(nx,ny-2,W*.055,H*.02,0,'#8a6238');for(let k=0;k<m;k++){const ex=nx+(k-(m-1)/2)*W*.017,ey=ny-H*.018-(k%2)*H*.012;ell(ex,ey,W*.011,H*.019,0,'#f5ead2');dot(ex-W*.003,ey-H*.006,W*.003,'rgba(255,255,255,.8)');}}
  quad(qx,qy,s,t,'#79b36f','#10200c',{lungs:G[0]>0,legs:G[1]>0,wrist:A[0],scales:A[1],ear:A[2]});
}

/* ---------- Stage 5: a small mammal at night ---------- */
function mammal(x,y,s,t,col,eye,F){
  F=F||{};
  c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle=col;c.lineCap='round';c.lineWidth=7;
  c.beginPath();c.moveTo(-22,2);c.bezierCurveTo(-52,4,-62,-24,-40+Math.sin(t*2)*4,-44);c.stroke();
  ell(0,0,27,15,0,col);ell(31,-7,13,10,0,col);
  poly([[24,-15],[26,-30],[34,-16]],col);poly([[34,-15],[40,-28],[43,-13]],col);poly([[41,-8],[56,-3],[41,-2]],col);
  if(F.fur){c.strokeStyle='#e0cba6';c.lineWidth=1.6;for(let k=0;k<14;k++){const fx=-22+k*3.8,fy=-13+Math.abs(k-7)*.5;c.beginPath();c.moveTo(fx,fy);c.lineTo(fx+2,fy-6);c.stroke();}c.strokeStyle=col;}
  if(F.nv){poly([[38,-9],[110,-34],[110,16]],'rgba(160,240,255,.16)');dot(36,-9,5.5,'rgba(160,245,255,.45)');}
  dot(36,-9,2.8,F.nv?'#b8fbff':eye);dot(36,-9,1.1,'#000');
  c.lineWidth=5;c.strokeStyle=col;[-12,10].forEach(lx=>{c.beginPath();c.moveTo(lx,10);c.lineTo(lx+3,18);c.stroke();});
  c.restore();
}
function s4(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#0e2d1c'],[1,'#04100a']]);
  glow(W*.8,H*.2,H*.32,'190,220,255',.5);dot(W*.8,H*.2,H*.05,'#e9f1ff');
  for(let k=0;k<3;k++){const x=W*(.1+.33*k);c.fillStyle='#071a0f';c.fillRect(x,0,W*.07,H);dot(x+W*.035,H*.12,H*.16,'#0a2616');dot(x-W*.02,H*.26,H*.1,'#0a2616');}
  c.strokeStyle='#0a1d12';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(-10,H*.82);c.lineTo(W+10,H*.74);c.stroke();
  for(let i=0;i<22;i++){const x=rnd(i)*W+Math.sin(t*.6+i*2)*14,y=H*.2+rnd(i+4)*H*.6+Math.cos(t*.5+i)*10;const a=.3+.7*Math.max(0,Math.sin(t*1.5+i*3));glow(x,y,7,'220,255,150',a*.6);dot(x,y,1.4,'rgba(240,255,190,'+a+')');}
  const s=U()/170*(1+Math.min(.5,o/120))*(1+p*.1),mx=W*.52,my=H*.775-17*s,col='#b79a76',eye=LCOL[lin]||'#e8e0c0';
  if(A[1]){const bx=W*.84,by=H*.77;ell(bx,by+4,W*.09,H*.045,0,'#1a120a');ell(bx,by,W*.06,H*.03,0,'#2a1c10');ell(bx,by+2,W*.032,H*.017,0,'#050302');glow(bx,by+2,W*.05,'255,170,80',.45+.1*Math.sin(t*3));}
  if(A[2]){mammal(W*.18,H*.755-10*s,s*.6,t+1,'#5e4c3a',eye);mammal(W*.33,H*.73-10*s,s*.52,t+2,'#5e4c3a',eye);for(let k=0;k<3;k++){const u=(t*.7+k/3)%1;c.strokeStyle='rgba(255,255,255,'+(.55*(1-u))+')';c.lineWidth=2;c.beginPath();c.arc(mx+56*s,my-8*s,10+u*40,-.7,.7);c.stroke();}}
  const m=G[2]>0?Math.min(3,G[2]):0;for(let k=0;k<m;k++)mammal(mx-50*s-k*34*s,my+9*s,s*.42,t+k*.7,col,eye);
  if(G[0]>0)glow(mx,my,70*s,'255,140,70',.32);
  mammal(mx,my,s,t,col,eye,{fur:G[1]>0,nv:A[0]});
}

/* ---------- Stage 6: a hominin band ---------- */
function hominid(x,y,s,t,col,arm,F){
  F=F||{};const up=F.up!==false;
  c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle=col;c.lineCap='round';const sw=Math.sin(t*1.2)*1.5;
  c.lineWidth=7;c.beginPath();c.moveTo(0,-30);c.lineTo(-8,0);c.moveTo(0,-30);c.lineTo(8,0);c.stroke();
  if(up){
    c.lineWidth=10;c.beginPath();c.moveTo(0,-30);c.lineTo(sw,-62);c.stroke();dot(sw+3,-72,8.5,col);
    c.lineWidth=5;c.beginPath();c.moveTo(sw,-58);c.lineTo(15,-44+(arm||0));c.moveTo(sw,-58);c.lineTo(-12,-42);c.stroke();
  }else{
    c.lineWidth=10;c.beginPath();c.moveTo(0,-30);c.lineTo(18,-46);c.stroke();dot(28,-49,8.5,col);
    c.lineWidth=5;c.beginPath();c.moveTo(16,-44);c.lineTo(22,-6);c.moveTo(10,-42);c.lineTo(12,-5);c.stroke();
  }
  if(F.tool&&up){line(16,-44+(arm||0),24,-108,'#3b2616',3);poly([[20,-104],[25,-124],[30,-103]],'#c9c2b0');}
  if(F.bubble){const bx=up?10:30,by=up?-104:-76;ell(bx,by,26,13,0,'rgba(255,255,255,.9)');poly([[bx-10,by+10],[bx-4,by+16],[bx,by+9]],'rgba(255,255,255,.9)');for(let k=0;k<3;k++)dot(bx-12+k*12,by,2.4+Math.max(0,Math.sin(t*4+k))*1.4,'#2a1a14');}
  c.restore();
}
function s5(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#2a1230'],[.45,'#c4562e'],[.75,'#ffb05a'],[1,'#ffb05a']]);
  glow(W*.3,H*.62,H*.55,'255,170,80',.7);dot(W*.3,H*.62,H*.09,'#ffd9a0');
  c.fillStyle='#1a0b08';c.beginPath();c.moveTo(0,H*.74);c.quadraticCurveTo(W*.4,H*.68,W,H*.76);c.lineTo(W,H);c.lineTo(0,H);c.fill();
  c.strokeStyle='#0d0504';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(W*.12,H*.78);c.quadraticCurveTo(W*.13,H*.6,W*.15,H*.5);c.stroke();
  ell(W*.13,H*.48,W*.11,H*.05,0,'#0d0504');
  const fx=W*.66,fy=H*.8;
  if(G[2]>0){
    const fl=Math.sin(t*13)*.5+.5;glow(fx,fy-8,H*.35,'255,150,60',.4+.2*fl);
    for(let i=0;i<6;i++){const hh=H*(.07+.05*Math.sin(t*9+i*2)+.03*rnd(i))*(1+p*.4);const bx=fx+(i-3)*5;poly([[bx-5,fy],[bx+Math.sin(t*7+i)*4,fy-hh],[bx+5,fy]],i%2?'#ffd067':'#ff8a2a');}
    c.fillStyle='#2b130a';c.fillRect(fx-22,fy-2,44,6);
    for(let i=0;i<10;i++){const u=(t*.5+i*.1)%1;dot(fx+Math.sin(u*9+i)*10,fy-u*H*.35,1.4,'rgba(255,190,90,'+(1-u)+')');}
  }else{
    for(let i=0;i<7;i++){const a=i/7*TAU;ell(fx+Math.cos(a)*18,fy+Math.sin(a)*4,7,4,0,'#33241e');}
    glow(fx,fy,H*.07,'255,110,50',.14);
  }
  const s=U()/165*(1+Math.min(.4,o/150)),up=G[0]>0,tool=G[1]>0;
  if(G[1]>0){for(let k=0;k<5;k++)ell(W*.33+(k%3)*14*s+(k>2?7:0),H*.865-(k>2?7*s:0),9*s,5*s,k*.4,'#7d6a60');}
  if(A[1]){hominid(W*.12,H*.86,s*.9,t+1.5,'#150806',0,{up,tool:true});hominid(W*.9,H*.85,s*.85,t+.4,'#150806',-6,{up,tool:true});
    for(let k=0;k<3;k++)ell(W*.78,H*.78+k*H*.035,W*.018,H*.014,0,'#7a1e14');line(W*.75,H*.76,W*.81,H*.76,'#2a1a10',3);}
  hominid(W*.5,H*.82,s,t,'#150806',0,{up,tool,bubble:A[2]});
  if(o>=8)hominid(W*.82,H*.84,s*.85,t+1,'#150806',-6,{up,tool,bubble:A[2]&&Math.sin(t*.9)>0});
  if(o>=20)hominid(W*.38,H*.86,s*.7,t+2,'#150806',0,{up});
  if(A[0]){const hx=W*.5+18*s,hy=H*.82-40*s;ell(hx,hy,5*s,3.5*s,.4,'#9c8b80');for(let k=0;k<5;k++){const u=(t*2.4+k*.2)%1;dot(hx+Math.sin(k*3+t*8)*8*s,hy-u*26*s,1.6,'rgba(235,220,200,'+(1-u)+')');}
    for(let k=0;k<4;k++)ell(W*.5+(k-1.5)*10*s,H*.87,3.4*s,2.2*s,0,'#d9c9b8');}
}

/* ---------- Stage 7: a farming village ---------- */
function s6(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#1c2a52'],[.5,'#e59a6a'],[.62,'#f7d28b'],[1,'#f7d28b']]);
  glow(W*.8,H*.52,H*.4,'255,220,140',.7);dot(W*.8,H*.52,H*.06,'#fff0c4');
  c.fillStyle='#3a3b58';c.beginPath();c.moveTo(0,H*.62);for(let x=0;x<=W;x+=20)c.lineTo(x,H*.58-Math.sin(x*.012+1)*H*.05);c.lineTo(W,H);c.lineTo(0,H);c.fill();
  c.fillStyle='#2c3a2f';c.beginPath();c.moveTo(0,H*.68);for(let x=0;x<=W;x+=20)c.lineTo(x,H*.66-Math.sin(x*.02+3)*H*.03);c.lineTo(W,H);c.lineTo(0,H);c.fill();
  c.fillStyle='#6f5a24';c.fillRect(0,H*.74,W,H*.26);
  c.strokeStyle='rgba(240,205,100,.28)';c.lineWidth=2;for(let k=-10;k<=10;k++){c.beginPath();c.moveTo(W*.5+k*8,H*.74);c.lineTo(W*.5+k*W*.1,H);c.stroke();}
  if(G[1]>0){c.strokeStyle='rgba(60,38,12,.6)';c.lineWidth=3;for(let k=-8;k<=8;k++){c.beginPath();c.moveTo(W*.5+k*7,H*.76);c.lineTo(W*.5+k*W*.085,H);c.stroke();}
    const sc=U()/210,ox=W*.36+Math.sin(t*.25)*W*.14,oy=H*.88,dir=Math.cos(t*.25)>0?1:-1;
    c.save();c.translate(ox,oy);c.scale(dir*sc,sc);ell(0,0,28,12,0,'#3a2616');ell(28,-4,10,7,0,'#3a2616');line(28,-9,32,-18,'#e8dcc0',3);
    [[-16,1],[-6,0],[10,1],[20,0]].forEach(l=>line(l[0],8,l[0]+Math.sin(t*3+l[1]*3)*3,22,'#2a1a0c',4));
    line(-28,0,-70,4,'#2a1a0c',3);poly([[-70,4],[-84,18],[-62,16]],'#4a4a50');c.restore();}
  if(A[0])for(let k=0;k<44;k++){const x=W*(.02+.96*rnd(k+40)),y=H*(.78+.2*rnd(k+41)),hh=7+8*y/H;line(x,y,x+Math.sin(t*1.2+k)*1.6,y-hh,'#f0c850',1.6);dot(x+Math.sin(t*1.2+k)*1.6,y-hh,2.2,'#ffe07a');}
  if(A[1]){for(let j=0;j<2;j++){c.strokeStyle='#4aa8e8';c.lineWidth=7-j*1.5;c.beginPath();for(let x=0;x<=W;x+=12){const y=H*(.82+j*.1)+Math.sin(x*.018+j*2)*5;if(x)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();
    c.setLineDash([10,9]);c.lineDashOffset=-t*26;c.strokeStyle='#d2eeff';c.lineWidth=2;c.beginPath();for(let x=0;x<=W;x+=12){const y=H*(.82+j*.1)+Math.sin(x*.018+j*2)*5;if(x)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();c.setLineDash([]);}}
  const hn=2+(G[2]>0?Math.min(6,1+Math.floor(G[2]/2)):0),hw=W*.055,hh=H*.06;
  for(let i=0;i<hn;i++){const x=W*.05+i*(W*.098),y=H*.7+(i%2)*H*.025;
    c.fillStyle='#5b3b25';c.fillRect(x,y-hh,hw,hh);poly([[x-4,y-hh],[x+hw/2,y-hh-H*.055],[x+hw+4,y-hh]],'#c9a15a');c.fillStyle='#2a170c';c.fillRect(x+hw*.38,y-hh*.55,hw*.24,hh*.55);
    if(i%3===0)for(let k=0;k<5;k++){const u=(t*.25+k/5+i*.13)%1;dot(x+hw/2+Math.sin(u*6+i)*5,y-hh-H*.06-u*H*.2,3+u*8,'rgba(200,200,210,'+(.35*(1-u))+')');}}
  if(G[0]>0){const gx=W*.87,gy=H*.72;line(gx-14,gy,gx-14,gy+H*.07,'#3a2412',4);line(gx+14,gy,gx+14,gy+H*.07,'#3a2412',4);ell(gx,gy-H*.015,W*.045,H*.05,0,'#a8783e');poly([[gx-W*.055,gy-H*.04],[gx,gy-H*.12],[gx+W*.055,gy-H*.04]],'#d8b062');for(let k=0;k<3;k++)dot(gx-10+k*10,gy+H*.09,3.5,'#e8c34a');}
  if(A[2]){const px=W*.74,py=H*.9;line(px,py,px,py-H*.2,'#4a3220',5);for(let k=0;k<4;k++)line(px-8,py-H*.04*(k+1.2),px+8,py-H*.04*(k+1.2),'#f4e3b8',2);line(px-9,py-H*.03,px+9,py-H*.17,'#f4e3b8',2);for(let k=0;k<3;k++){rect(px+14,py-6-k*7,22,6,'#b7845a');}}
}

/* ---------- Stage 8: a walled kingdom ---------- */
function s7(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#1b1235'],[.6,'#8a3b5c'],[1,'#e58a6a']]);
  for(let i=0;i<40;i++)dot(rnd(i)*W,rnd(i+1)*H*.45,.9,'rgba(255,255,255,'+(.2+.4*Math.abs(Math.sin(t+i)))+')');
  glow(W*.2,H*.5,H*.4,'255,170,120',.5);
  c.fillStyle='#2a1a3a';c.beginPath();c.moveTo(0,H*.7);for(let x=0;x<=W;x+=20)c.lineTo(x,H*.66-Math.sin(x*.015+2)*H*.06);c.lineTo(W,H);c.lineTo(0,H);c.fill();
  if(G[1]>0){const ay=H*.82,ah=H*.2,aw=W*.032,n=7;c.fillStyle='#3a2a4a';for(let k=0;k<=n;k++)c.fillRect(W*.005+k*aw,ay-ah*.45,aw*.2,ah*.45);
    c.strokeStyle='#3a2a4a';c.lineWidth=aw*.2;for(let k=0;k<n;k++){c.beginPath();c.arc(W*.005+k*aw+aw*.6,ay-ah*.45,aw*.4,Math.PI,0);c.stroke();}
    c.fillRect(0,ay-ah*.45-aw*.3,n*aw+aw,aw*.3);rect(0,ay-ah*.45-aw*.26,n*aw+aw,aw*.09,'#6fc8ff');dot(((t*40)%(n*aw+aw)),ay-ah*.45-aw*.22,2,'#e8f8ff');}
  const col='#0f0a1c',bw=W*.4,bx=W*.3;c.fillStyle=col;c.fillRect(bx,H*.56,bw,H*.26);
  for(let i=0;i<10;i++)c.fillRect(bx+i*bw/10+2,H*.56-H*.02,bw/10-4,H*.025);
  const tw=(x,w,h)=>{c.fillStyle=col;c.fillRect(x,H*.82-h,w,h);for(let i=0;i<4;i++)c.fillRect(x+i*w/4,H*.82-h-H*.02,w/4-2,H*.025);c.fillStyle='#ffcf7a';c.fillRect(x+w*.4,H*.82-h*.7,w*.2,h*.12);};
  tw(bx-W*.05,W*.09,H*.36);tw(bx+bw-W*.04,W*.09,H*.36);
  if(o>=12){tw(bx+bw*.25,W*.06,H*.3);tw(bx+bw*.62,W*.06,H*.3);}
  c.fillStyle=col;c.fillRect(W*.46,H*.82-H*.46,W*.08,H*.46);poly([[W*.45,H*.82-H*.46],[W*.5,H*.82-H*.58],[W*.55,H*.82-H*.46]],col);
  c.fillStyle='#ffcf7a';c.fillRect(W*.495,H*.82-H*.38,W*.012,H*.06);
  c.strokeStyle='#cfc3d8';c.lineWidth=1.5;c.beginPath();c.moveTo(W*.5,H*.82-H*.58);c.lineTo(W*.5,H*.82-H*.68);c.stroke();
  const fy=H*.82-H*.68;poly([[W*.5,fy],[W*.5+W*.07+Math.sin(t*3)*3,fy+H*.02+Math.sin(t*3+1)*2],[W*.5,fy+H*.05]],A[0]?'#f2c14e':'#e0566b');
  c.fillStyle='#0a0614';c.fillRect(0,H*.82,W,H*.18);
  for(let i=0;i<14;i++){const x=rnd(i)*W,y=H*.84+rnd(i+2)*H*.14;dot(x,y,1.6,'rgba(255,207,122,'+(.4+.4*Math.abs(Math.sin(t*.8+i)))+')');}
  if(A[1]){const wy=H*.74,wh=H*.08,wx=W*.16,ww=W*.68;rect(wx,wy,ww,wh,'#51486a');for(let i=0;i<22;i++)rect(wx+i*ww/22+1,wy-H*.02,ww/22-3,H*.022,'#51486a');
    c.fillStyle='#0a0614';c.beginPath();c.moveTo(W*.46,wy+wh);c.lineTo(W*.46,wy+wh*.4);c.arc(W*.5,wy+wh*.4,W*.04,Math.PI,0);c.lineTo(W*.54,wy+wh);c.fill();
    for(let k=0;k<6;k++)line(wx+k*ww/6,wy+wh*.3,wx+k*ww/6+ww/12,wy+wh*.3,'rgba(255,255,255,.12)',1);}
  if(G[2]>0){const x0=W*.77,w0=W*.16,y0=H*.82,h0=H*.15;rect(x0,y0-h0,w0,h0,'#241838');poly([[x0-3,y0-h0],[x0+w0/2,y0-h0-H*.05],[x0+w0+3,y0-h0]],'#31234c');
    c.fillStyle='#2f2250';c.beginPath();c.arc(x0+w0/2,y0-h0-H*.05,w0*.2,Math.PI,0);c.fill();rect(x0+w0/2-1,y0-h0-H*.05-w0*.2-H*.025,2,H*.025,'#cfc3d8');
    for(let k=0;k<5;k++)rect(x0+6+k*(w0-14)/4,y0-h0+4,5,h0-4,'#46376a');
    rect(x0+w0/2-6,y0-h0*.55,12,h0*.55,'#ffcf7a');glow(x0+w0/2,y0-h0*.3,w0*.5,'255,200,110',.35);}
  if(G[0]>0){const m=Math.min(4,1+Math.floor(G[0]/3)),cols=['#e0566b','#f2c14e','#4aa8e8','#7ad07a'];for(let k=0;k<m;k++){const x=W*(.1+.22*k),y=H*.92,w=W*.1;rect(x,y-H*.035,w,H*.035,'#3b2a24');for(let q=0;q<5;q++)poly([[x-4+q*(w+8)/5,y-H*.075],[x-4+(q+1)*(w+8)/5,y-H*.075],[x+(q+1)*w/5,y-H*.04],[x+q*w/5,y-H*.04]],q%2?'#f4ead8':cols[k%4]);
    for(let q=0;q<4;q++)dot(x+8+q*(w-12)/3,y-H*.042,3,cols[(k+q)%4]);}}
  if(A[0])for(let k=0;k<7;k++){const u=(t*.28+k/7)%1,x=W*(.14+.72*rnd(k+5)),y=H*.84-u*H*.4,r=3.4+rnd(k)*2;c.globalAlpha=Math.sin(u*Math.PI);dot(x,y,r,'#f2c14e');dot(x-r*.25,y-r*.25,r*.4,'#fff1b0');c.globalAlpha=1;}
  if(A[2]){const lx=W*.22,ly=H*.82;rect(lx-4,ly-H*.2,8,H*.2,'#d8cde6');rect(lx-9,ly-H*.2,18,4,'#d8cde6');rect(lx-9,ly-4,18,4,'#d8cde6');
    const by=ly-H*.25,sw=Math.sin(t*1.4)*.05;c.save();c.translate(lx,by);c.rotate(sw);line(-22,0,22,0,'#f2c14e',2.5);line(0,0,0,H*.05,'#f2c14e',2.5);for(const sx of [-22,22]){line(sx,0,sx-8,12,'#f2c14e',1);line(sx,0,sx+8,12,'#f2c14e',1);ell(sx,12,10,3,0,'#f2c14e');}c.restore();}
}

/* ---------- Stage 9: an industrial town ---------- */
function s8(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#2a2c33'],[.7,'#8a7a63'],[1,'#a89476']]);
  c.fillStyle='#3a3d44';c.beginPath();c.moveTo(0,H*.7);for(let x=0;x<=W;x+=20)c.lineTo(x,H*.64-Math.sin(x*.011+.5)*H*.07);c.lineTo(W,H);c.lineTo(0,H);c.fill();
  for(let k=0;k<4;k++){const x=W*(.04+.045*k),y=H*.82,w=W*.032;rect(x,y-H*.05,w,H*.05,'#1d1a1e');poly([[x-2,y-H*.05],[x+w/2,y-H*.085],[x+w+2,y-H*.05]],'#26222a');if(A[2])rect(x+w*.3,y-H*.035,w*.4,H*.02,'#ffcf7a');}
  c.fillStyle='#14130f';c.fillRect(0,H*.82,W,H*.18);
  if(G[2]>0){const fx=W*.34,fw=W*.4,fy=H*.82,fh=H*.3;
    [W*.4,W*.52,W*.66].forEach((x,k)=>{for(let i=0;i<14;i++){const a=(t*.4+i/14+k*.3)%1;dot(x+a*70+Math.sin(a*6+k)*8,fy-fh-a*H*.25,8+a*30,'rgba(48,48,56,'+(.38*(1-a))+')');}});
    rect(fx,fy-fh,fw,fh,'#1b1a1f');for(let i=0;i<5;i++)poly([[fx+i*fw/5,fy-fh],[fx+i*fw/5,fy-fh-H*.07],[fx+(i+1)*fw/5,fy-fh]],'#1b1a1f');
    [W*.4,W*.52,W*.66].forEach(x=>rect(x-W*.012,fy-fh-H*.14,W*.024,H*.2,'#141317'));
    for(let r=0;r<3;r++)for(let k=0;k<12;k++){const lit=A[2]&&Math.sin(t*.7+k*1.7+r*3)>-.7;rect(fx+W*.02+k*W*.031,fy-fh*.8+r*H*.07,W*.019,H*.04,lit?'#ffb85a':'#2c2a30');}}
  if(G[0]>0){const ex=W*.14,ey=H*.76;ell(ex,ey,W*.07,H*.05,0,'#3a2c26');rect(ex+W*.03,ey-H*.12,W*.016,H*.1,'#2a2020');
    const wr=H*.05;ring(ex-W*.04,ey+H*.02,wr,'#7a7a82',3);for(let k=0;k<6;k++){const a=t*2+k*TAU/6;line(ex-W*.04,ey+H*.02,ex-W*.04+Math.cos(a)*wr,ey+H*.02+Math.sin(a)*wr,'#7a7a82',2);}
    for(let k=0;k<7;k++){const u=(t*.5+k/7)%1;dot(ex+W*.038+Math.sin(u*5+k)*6,ey-H*.12-u*H*.28,4+u*11,'rgba(235,235,240,'+(.55*(1-u))+')');}}
  c.fillStyle='#3a362c';c.fillRect(0,H*.88,W,3);
  if(G[1]>0){c.fillStyle='#2a2620';for(let x=((t*30)%16)-16;x<W;x+=16)c.fillRect(x,H*.88+3,8,5);
    const tx=((t*70)%(W+340))-300;c.fillStyle='#24242b';
    c.fillRect(tx+240,H*.88-H*.07,50,H*.07);c.fillRect(tx+270,H*.88-H*.11,12,H*.04);dot(tx+252,H*.88,4,'#111');dot(tx+276,H*.88,4,'#111');
    for(let k=0;k<3;k++){c.fillStyle='#24242b';c.fillRect(tx+k*80,H*.88-H*.06,70,H*.06);dot(tx+k*80+14,H*.88,4,'#111');dot(tx+k*80+56,H*.88,4,'#111');}
    dot(tx+276+Math.sin(t*5)*3,H*.88-H*.14-((t*3)%1)*10,5,'rgba(200,200,205,.5)');}
  if(A[0]){const bx=W*.82,by=H*.86;rect(bx,by-H*.05,W*.05,H*.05,'#6a5236');rect(bx+W*.052,by-H*.05,W*.05,H*.05,'#7a5f40');rect(bx+W*.026,by-H*.1,W*.05,H*.05,'#5c4630');gear(bx+W*.014,by-H*.12,H*.03,t*.6,'rgba(210,200,180,.85)');gear(bx+W*.075,by-H*.12,H*.022,-t*.8,'rgba(210,200,180,.75)');}
  if(A[1]){const n=6;for(let k=0;k<n;k++){const x=W*(.04+k*.19),y=H*.9,nx=W*(.04+(k+1)*.19);line(x,y,x,H*.7,'#1a1410',3);line(x-9,H*.725,x+9,H*.725,'#1a1410',2.5);line(x-7,H*.752,x+7,H*.752,'#1a1410',2);
    if(k<n-1){for(const yy of [H*.725,H*.752]){c.strokeStyle='rgba(20,15,10,.75)';c.lineWidth=1;c.beginPath();c.moveTo(x,yy);c.quadraticCurveTo((x+nx)/2,yy+H*.03,nx,yy);c.stroke();}}}}
  if(A[2]){for(let k=0;k<5;k++){const x=W*(.1+k*.2),y=H*.88;line(x,y,x,y-H*.1,'#1a1410',3);dot(x,y-H*.1,4,'#ffe6a0');glow(x,y-H*.1,H*.13,'255,200,110',.55);}}
}

/* ---------- Stage 10: a connected city ---------- */
function s9(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#050a1c'],[1,'#17264f']]);
  for(let i=0;i<50;i++)dot(rnd(i)*W,rnd(i+1)*H*.5,.8,'rgba(255,255,255,'+(.2+.3*Math.abs(Math.sin(t*.7+i)))+')');
  dot(((t*20)%(W+40))-20,H*.12+Math.sin(t*.5)*6,2,'#cfe9ff');
  glow(W*.5,H,W*.55,'60,120,255',.35);
  const n=18,bw=W/n,tops=[];
  for(let i=0;i<n;i++){const h=H*(.2+rnd(i+5)*.38)*(1+Math.min(.25,o/160));const x=i*bw;c.fillStyle='#0a1128';c.fillRect(x+1,H-h,bw-2,h);tops.push([x+bw/2,H-h]);
    for(let r=0;r<Math.floor(h/14);r++)for(let k=0;k<3;k++){const lit=rnd(i*50+r*3+k)>.45&&Math.sin(t*.5+i+r*k)>-.8;if(lit)dot(x+bw*.2+k*bw*.3,H-h+8+r*14,1.4,'rgba(255,220,130,.8)');}}
  if(G[0]>0){c.strokeStyle='rgba(90,240,255,.65)';c.lineWidth=1.4;const m=Math.min(14,3+G[0]);for(let k=0;k<m;k++){const x=W*rnd(k+60),y=H*(.9+.08*rnd(k+61)),l=W*(.06+.1*rnd(k+62));c.beginPath();c.moveTo(x,y);c.lineTo(x+l*.5,y);c.lineTo(x+l*.5,y-H*.03);c.lineTo(x+l,y-H*.03);c.stroke();dot(x+l,y-H*.03,2.2,'#bff8ff');}
    for(let k=0;k<Math.min(10,G[0]);k++){const t2=tops[(k*3)%n];rect(t2[0]-5,t2[1]-4,10,4,'rgba(90,240,255,.8)');}}
  if(G[1]>0){const dx=W*.06,dw=W*.2,dy=H*.88,dh=H*.12;rect(dx,dy-dh,dw,dh,'#0c1530');for(let r=0;r<4;r++)for(let k=0;k<10;k++){const on=Math.sin(t*3+k*1.3+r*2.1)>0;rect(dx+6+k*(dw-12)/10,dy-dh+8+r*dh*.2,(dw-12)/10-3,3,on?'#6dff9c':'#16402a');}}
  c.lineWidth=1;
  const m=G[2]>0?Math.min(10,1+G[2]):0;
  for(let i=0;i<m;i++){const a=tops[(i*2)%n],b=tops[(i*2+5)%n];const mx=(a[0]+b[0])/2,my=Math.min(a[1],b[1])-H*.18;
    c.strokeStyle='rgba(110,230,255,.3)';c.beginPath();c.moveTo(a[0],a[1]);c.quadraticCurveTo(mx,my,b[0],b[1]);c.stroke();
    const u=(t*.4+i*.13)%1;const x=(1-u)*(1-u)*a[0]+2*(1-u)*u*mx+u*u*b[0],y=(1-u)*(1-u)*a[1]+2*(1-u)*u*my+u*u*b[1];dot(x,y,2.4+p*2,'#9ff3ff');}
  if(A[1]){for(let k=0;k<n;k++){const x=k*bw+bw*.5;const u=(t*.5+rnd(k)*3)%1;line(x,H,x,H*.2,'rgba(120,230,255,.12)',1.5);dot(x,H-u*H*.8,2.2,'rgba(190,250,255,.9)');}
    for(let k=0;k<5;k++){const u=(t*.35+k*.2)%1;dot(u*W,H*.97,2.6,'rgba(190,250,255,.9)');line(0,H*.97,W,H*.97,'rgba(120,230,255,.12)',1.5);}}
  if(A[0]){for(let k=0;k<3;k++){const px=W*(.2+.3*k),py=H*(.2+.07*(k%2)),pw=W*.16,ph=H*.13;c.fillStyle='rgba(90,220,255,.12)';c.strokeStyle='rgba(120,240,255,.8)';c.lineWidth=1.5;c.fillRect(px,py,pw,ph);c.strokeRect(px,py,pw,ph);for(let q=0;q<3;q++)line(px+8,py+10+q*10,px+pw*(.4+.4*rnd(k*5+q)),py+10+q*10,'rgba(160,250,255,.7)',2);
    const u=(t*.8+k*.3)%1;ring(px+pw*.7,py+ph*.7,u*18,'rgba(200,255,255,'+(.7*(1-u))+')',1.5);}}
  if(A[2]){const L=[4,5,5,3],x0=W*.36,sp=W*.09,hh=H*.04;const pts=[];L.forEach((cnt,li)=>{const row=[];for(let q=0;q<cnt;q++)row.push([x0+li*sp,H*.26+(q-(cnt-1)/2)*hh*1.1+H*.12]);pts.push(row);});
    for(let li=0;li<L.length-1;li++)pts[li].forEach((a,i)=>pts[li+1].forEach((b,j)=>{const al=.1+.25*Math.max(0,Math.sin(t*2+i+j+li));line(a[0],a[1],b[0],b[1],'rgba(255,170,230,'+al+')',1);}));
    pts.forEach((row,li)=>row.forEach((a,i)=>dot(a[0],a[1],3.2,'rgba(255,190,240,'+(.6+.4*Math.sin(t*3+i+li))+')')));}
}

/* ---------- Stage 11: orbit ---------- */
function s10(t,o,p,lin,V){
  const A=V.a,G=V.g;
  grad([[0,'#000000'],[1,'#060a22']]);
  for(let i=0;i<160;i++)dot(rnd(i)*W,rnd(i+1)*H,.5+rnd(i+2)*1.1,'rgba(255,255,255,'+(.2+.6*Math.abs(Math.sin(t*(.4+rnd(i+3))+i)))+')');
  const mxx=W*.12,myy=H*.2,mr=H*.06;
  dot(mxx,myy,mr,'#cfd3dc');dot(W*.1,H*.18,H*.012,'#aab0bd');dot(W*.14,H*.23,H*.009,'#aab0bd');
  if(G[2]>0){const m=Math.min(8,2+G[2]);for(let k=0;k<m;k++){const a=k*2.4,r=mr*.7*rnd(k+3);dot(mxx+Math.cos(a)*r,myy+Math.sin(a)*r,1.8,'rgba(255,225,140,'+(.6+.4*Math.sin(t*2+k))+')');}
    c.fillStyle='#e8e8ee';c.beginPath();c.arc(mxx+mr*.2,myy-mr*.55,mr*.22,Math.PI,0);c.fill();glow(mxx+mr*.2,myy-mr*.6,mr*.9,'255,225,140',.4);line(mxx+mr*.2,myy-mr*.55,mxx+mr*.2,myy-mr*1.5,'rgba(255,240,170,.45)',2);}
  const R=W,cx=W*.5,cy=H*.84+R;
  glow(cx,H*.84,W*.6,'110,190,255',.18);
  const g=c.createRadialGradient(cx,cy-R*.35,R*.2,cx,cy,R);g.addColorStop(0,'#2a6db3');g.addColorStop(.8,'#16407a');g.addColorStop(1,'#0a2552');
  c.fillStyle=g;c.beginPath();c.arc(cx,cy,R,0,TAU);c.fill();
  c.strokeStyle='rgba(127,196,255,.75)';c.lineWidth=3;c.stroke();
  for(let i=0;i<30;i++){const a=-Math.PI/2+(rnd(i)-.5)*.5;const r=R-rnd(i+1)*H*.12;dot(cx+Math.cos(a)*r,cy+Math.sin(a)*r,1,'rgba(255,220,140,.7)');}
  const sc=1+Math.min(.5,o/80);
  const sat=(x,y,rot,s)=>{c.save();c.translate(x,y);c.rotate(rot);c.scale(s,s);c.fillStyle='#cfd6e6';c.fillRect(-14,-4,28,8);c.fillStyle='#3d6ad6';c.fillRect(-46,-3,28,6);c.fillRect(18,-3,28,6);c.fillStyle='#9aa4bd';c.fillRect(-3,-12,6,24);c.restore();};
  const ns=G[0]>0?Math.min(8,G[0]):0;
  for(let k=0;k<ns;k++){const a=t*(.25+k*.03)+k*1.3,x=W*.5+Math.cos(a)*W*(.2+.04*(k%4)),y=H*.4+Math.sin(a)*H*(.1+.03*(k%3));sat(x,y,Math.sin(a)*.2,.55*sc*(.8+.4*(Math.sin(a)>0?1:0)));
    if(A[1])for(let q=1;q<6;q++){const pa=a-q*.05;dot(W*.5+Math.cos(pa)*W*(.2+.04*(k%4)),H*.4+Math.sin(pa)*H*(.1+.03*(k%3)),2.6-q*.35,'rgba(110,190,255,'+(.7-q*.1)+')');}}
  if(G[1]>0){const sx=W*.5+Math.sin(t*.2)*W*.32,sy=H*.38+Math.cos(t*.2)*H*.06;c.save();c.translate(sx,sy);c.rotate(Math.sin(t*.2)*.15);c.scale(sc,sc);
    c.strokeStyle='#cfd6e6';c.lineWidth=3;c.beginPath();c.arc(0,0,22,0,TAU);c.stroke();line(-22,0,22,0,'#9aa4bd',3);line(0,-22,0,22,'#9aa4bd',3);
    c.fillStyle='#cfd6e6';c.fillRect(-9,-9,18,18);c.fillStyle='#3d6ad6';c.fillRect(-64,-3,36,6);c.fillRect(28,-3,36,6);
    if(A[1])for(let q=1;q<7;q++)dot(-66-q*7,0,3.2-q*.4,'rgba(110,190,255,'+(.8-q*.11)+')');
    if(A[2]){glow(0,0,46,'160,230,255',.55+.2*Math.sin(t*4));dot(0,0,7,'#f4fdff');ring(0,0,12+Math.sin(t*3)*2,'rgba(200,245,255,.8)',2);}
    c.restore();}
  else if(A[2]){const sx=W*.5,sy=H*.38;glow(sx,sy,60,'160,230,255',.55+.2*Math.sin(t*4));dot(sx,sy,8,'#f4fdff');}
  if(A[1]&&!ns&&!(G[1]>0)){const a=t*.3,ox=W*.5+Math.cos(a)*W*.3,oy=H*.4+Math.sin(a)*H*.1;sat(ox,oy,Math.sin(a)*.2,.7*sc);
    for(let q=1;q<8;q++){const pa=a-q*.05;dot(W*.5+Math.cos(pa)*W*.3,H*.4+Math.sin(pa)*H*.1,3.2-q*.35,'rgba(110,190,255,'+(.8-q*.1)+')');}}
  if(A[0]){const T=14,u=(t%T)/T;
    if(u<.55){const k=u/.55;const rx=W*.82+k*W*.06,ry=H*.86-k*k*H*1.0;
      c.save();c.translate(rx,ry);c.rotate(.12);poly([[-3,-14],[3,-14],[3,6],[-3,6]],'#e8ecf5');poly([[-3,-14],[0,-24],[3,-14]],'#e0566b');poly([[-3,6],[3,6],[0,16+Math.random()*6]],'#ffb85a');c.restore();
      for(let i=0;i<8;i++){const kk=Math.max(0,k-i*.012);dot(W*.82+kk*W*.06-1,H*.86-kk*kk*H*1.0+14+i*3,3+i*.7,'rgba(255,255,255,'+(.25-i*.025)+')');}}
    else if(u>.7&&u<.95){const k=(u-.7)/.25,ry=H*.1+k*H*.76,rx=W*.16;c.save();c.translate(rx,ry);poly([[-3,-14],[3,-14],[3,6],[-3,6]],'#e8ecf5');poly([[-3,-14],[0,-24],[3,-14]],'#e0566b');line(-3,6,-9,14,'#cfd6e6',2);line(3,6,9,14,'#cfd6e6',2);if(k<.9)poly([[-3,6],[3,6],[0,16+Math.random()*6]],'#ffb85a');c.restore();}}
}

/* ---------- ambient layers for the tech and civic branches ---------- */
function ambient(t,V){
  const n=V.b,N=V.n;
  if(n.S){const col=N.S5a?'143,240,255':N.S5b?'255,243,160':N.S3a?'166,227,107':N.S3b?'255,179,107':N.S1b?'255,200,80':'255,224,138';
    for(let i=0;i<n.S*7;i++){const sp=.035+rnd(i+90)*.05,u=(t*sp+rnd(i+91))%1,x=(rnd(i+92)*W+Math.sin(t*.7+i)*8)%W,y=H-u*H*.75;dot(x,y,1.2+rnd(i+93)*1.6+(N.S1b?.8:0),'rgba('+col+','+(.6*Math.sin(u*Math.PI))+')');}}
  if(n.M){const k=3+n.M*2,col=N.M1b?'255,159,216':N.M3b?'255,205,125':'159,216,255',pts=[];
    for(let i=0;i<k;i++)pts.push([W*(.12+.76*rnd(i+100))+Math.sin(t*.3+i)*6,H*(.07+.28*rnd(i+101))+Math.cos(t*.35+i)*5]);
    for(let i=0;i<k;i++)for(let j=i+1;j<=i+2&&j<k;j++)line(pts[i][0],pts[i][1],pts[j][0],pts[j][1],'rgba('+col+',.28)',1);
    pts.forEach((q,i)=>dot(q[0],q[1],1.6+(i%3===0?1:0)+(N.M1b?Math.max(0,Math.sin(t*2+i)):0),'rgba('+col+',.85)'));
    if(N.M5b)for(let k2=0;k2<3;k2++){const u=(t*.3+k2/3)%1;ring(W*.88,H*.14,u*U()*.2,'rgba(255,225,160,'+(.5*(1-u))+')',1.5);}}
  if(n.C){const m=n.C;for(let i=0;i<m;i++){const r=U()*(.03+.012*rnd(i+120));gear(W*(.05+.9*(i+.5)/m),H-U()*.045,r,t*(i%2?.45:-.45)+i,'rgba(215,205,185,.34)');}}
  if(n.K){const m=n.K+1,rep=!!N.K3b;for(let i=0;i<m;i++){const xa=W*(.08+.84*rnd(i+110)),ya=H*(.62+.22*rnd(i+111)),xb=W*(.08+.84*rnd(i+112)),yb=H*(.62+.22*rnd(i+113)),mx=(xa+xb)/2,my=Math.min(ya,yb)-H*(rep?.14:.08);
    c.strokeStyle='rgba(255,159,184,.3)';c.lineWidth=1.4;c.beginPath();c.moveTo(xa,ya);c.quadraticCurveTo(mx,my,xb,yb);c.stroke();
    const u=(t*.3+i*.2)%1,x=(1-u)*(1-u)*xa+2*(1-u)*u*mx+u*u*xb,y=(1-u)*(1-u)*ya+2*(1-u)*u*my+u*u*yb;dot(x,y,2.2,'rgba(255,190,205,.9)');dot(xa,ya,2,'rgba(255,159,184,.8)');}}
  if(n.D){const hx=W*.84,hy=H*.2,k=Math.min(4,n.D);for(let i=0;i<k;i++)ring(hx,hy,U()*(.05+.035*i)*(1+.04*Math.sin(t*1.5+i)),'rgba(255,241,184,'+(.14+.08*Math.sin(t+i))+')',1.5);
    if(N.D3a)for(let i=0;i<16;i++){const a=i/16*TAU+t*.05;line(hx+Math.cos(a)*U()*.07,hy+Math.sin(a)*U()*.07,hx+Math.cos(a)*U()*.17,hy+Math.sin(a)*U()*.17,'rgba(255,241,184,.18)',1.5);}
    if(N.D3b){for(let s=0;s<2;s++){c.strokeStyle='rgba(190,225,255,.3)';c.lineWidth=1.2;c.beginPath();for(let i=0;i<=6;i++){const a=i/6*TAU+t*(s?.08:-.06),r=U()*(.1+.05*s);const x=hx+Math.cos(a)*r,y=hy+Math.sin(a)*r;if(i)c.lineTo(x,y);else c.moveTo(x,y);}c.stroke();}}}
  if(n.X){const m=n.X;for(let i=0;i<m;i++){const y=H*(.5+.06*i),xa=W*.04,xb=W*.96,my=y-H*.12;c.strokeStyle='rgba(255,211,107,.2)';c.lineWidth=1.2;c.beginPath();c.moveTo(xa,y);c.quadraticCurveTo(W*.5,my,xb,y);c.stroke();
    for(let q=0;q<2;q++){const u=(t*.22+i*.17+q*.5)%1,x=(1-u)*(1-u)*xa+2*(1-u)*u*W*.5+u*u*xb,yy=(1-u)*(1-u)*y+2*(1-u)*u*my+u*u*y;dot(x,yy,2.6,'#ffd36b');dot(x-.7,yy-.7,1,'#fff3c0');}}}
}
function flashFx(V){
  if(V.flash>0){const f=V.flash;glow(W*.5,H*.55,U()*(.25+.6*(1-f)),'255,255,255',.28*f);ring(W*.5,H*.55,(1-f)*U()*.7,'rgba(255,255,255,'+(.7*f)+')',3);}
}

const SCENES=[s0,s1,s2,s3,s4,s5,s6,s7,s8,s9,s10];
const LCOL={hunter:'#ff9d5c',herd:'#f2d27a',thinker:'#7ad0ff'};
function drawScene(e,t,o,p,lin,V){V=V||NOLOOK;SCENES[e](t,o,p,lin,V);ambient(t,V);flashFx(V);}
