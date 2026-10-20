/* GFX-01B: three sculpted science-fiction environment meshes.
   Authored programmatic geometry — art-ready placeholders, NOT hand-made Blender art.
   Current mesh generation uses tri/quad/solid/panel callbacks from gfx01-assets. */
'use strict';
const vec=(x,y,z)=>[x,y,z];
function build({model,lod,tri,quad,solid,panel}){
 const high=lod===0,medium=lod===1;
 const density=high?1:medium?.57:.31;
 function beam(mat,a,b,r=.018,sides=6){
  const d=b.map((q,i)=>q-a[i]),length=Math.hypot(...d);
  if(length<1e-5)return;
  const axis=d.map(x=>x/length);
  let ref=Math.abs(axis[1])<.93?[0,1,0]:[1,0,0];
  let u=[axis[1]*ref[2]-axis[2]*ref[1],axis[2]*ref[0]-axis[0]*ref[2],axis[0]*ref[1]-axis[1]*ref[0]];
  const m=Math.hypot(...u);u=u.map(x=>x/m);
  const v=[axis[1]*u[2]-axis[2]*u[1],axis[2]*u[0]-axis[0]*u[2],axis[0]*u[1]-axis[1]*u[0]];
  for(let j=0;j<sides;j++){
   const t=2*Math.PI*j/sides,n=2*Math.PI*(j+1)/sides;
   const p=(origin,angle)=>origin.map((value,i)=>value+r*(u[i]*Math.cos(angle)+v[i]*Math.sin(angle)));
   quad(mat,p(a,t),p(a,n),p(b,n),p(b,t));
  }
 }
 function loop(mat,pts,r=.012){
  for(let i=0;i<pts.length;i++)beam(mat,pts[i],pts[(i+1)%pts.length],r,high?7:5);
 }
 function arch(){
  // Continuous, faceted erosion shell with a genuinely open centre, varying
  // chamfer, cut terraces and independent rock foundations.
  const seg=high?28:medium?16:9;
  const get=(theta,r,face)=>{
   const shelf=Math.sin(theta*7.2+.9)*.012+Math.cos(theta*12.2)*.01;
   const x=(r+shelf)*Math.cos(theta)+Math.sin(theta*4.2)*.007;
   const y=.055+(r*1.08+shelf*.7)*Math.sin(theta);
   const z=(face?-.18:.18)+Math.cos(theta*5.4+face)*.027;
   return vec(x,y,z);
  };
  for(let i=0;i<seg;i++){
   const t=Math.PI*i/seg,u=Math.PI*(i+1)/seg;
   const innerA=get(t,.315,0),innerB=get(u,.315,0);
   const innerC=get(t,.315,1),innerD=get(u,.315,1);
   const outerA=get(t,.56,0),outerB=get(u,.56,0);
   const outerC=get(t,.56,1),outerD=get(u,.56,1);
   quad(i%9===0?1:0,innerA,innerB,outerB,outerA);
   quad(i%11===0?1:0,outerC,outerD,innerD,innerC);
   quad(0,outerA,outerB,outerD,outerC);
   quad(1,innerC,innerD,innerB,innerA);
   if(high&&i%3===0){
    const m=(t+u)*.5,ca=get(m,.58,0),cb=get(m,.58,1);
    beam(1,ca,cb,.012,5);
   }
  }
  // Slanted buttresses give the arch weight while preserving an open passage.
  for(const side of [-1,1]){
   const off=side*.423;
   const pieces=high?9:medium?5:3;
   for(let j=0;j<pieces;j++){
    const h=.57/pieces,y=-.5+h*(j+.5);
    const taper=1+(pieces-j)*.023;
    solid((j+Math.abs(side))%7===0?1:0,off+side*.015*Math.sin(j*2.1),
      y,side*.02,.23*taper,h*1.025,.42+Math.sin(j*1.13)*.026,side*.018);
   }
   if(medium||high){
    solid(1,off+side*.115,-.405,-.035,.18,.19,.49,side*.05);
    solid(0,off+side*.125,-.29,.17,.19,.25,.24,-side*.06);
   }
  }
  if(high){
   for(let i=0;i<13;i++){
    const angle=Math.PI*(i+.5)/13;
    const p=get(angle,.57,0);
    solid(i%5===0?1:0,p[0],p[1]+.026,p[2]-.045,.06,.03,.12,
      (i%3-1)*.18);
   }
   // Distinct carved ridge edges (no endless evenly spaced bars).
   for(let i=0;i<7;i++){
    const angle=Math.PI*(i+.3)/7;
    beam(1,get(angle,.32,0),get(angle,.55,0),.009,5);
   }
  }
 }
 function dish(){
  const seg=high?40:medium?24:12,rings=high?12:medium?7:4;
  solid(0,0,-.32,0,.34,.28,.28);
  for(const side of [-1,1]){
   beam(0,vec(side*.27,-.43,-.20),vec(side*.22,.055,0),.028);
   beam(0,vec(side*.27,-.43,.20),vec(side*.22,.055,0),.028);
   solid(1,side*.29,-.42,.17,.10,.10,.12);
  }
  solid(0,0,-.115,0,.13,.28,.14);
  const ring=(radius)=>{
   const arr=[];
   for(let j=0;j<seg;j++){
    const t=j*2*Math.PI/seg;
    arr.push(vec(radius*Math.cos(t),.095+.18*(radius/.5)**2,
      radius*Math.sin(t)*.82));
   }
   return arr;
  };
  const contours=Array.from({length:rings+1},(_,i)=>ring(i*.5/rings));
  for(let i=0;i<rings;i++)for(let j=0;j<seg;j++){
   const n=(j+1)%seg;
   quad(i===rings-1?1:0,contours[i][j],contours[i][n],contours[i+1][n],contours[i+1][j]);
  }
  loop(1,contours[rings],high?.022:.028);
  if(high){
   for(let i=0;i<12;i++){
    const angle=i*Math.PI/6;
    const p=vec(.48*Math.cos(angle),.285,.395*Math.sin(angle));
    beam(0,vec(0,.07,0),p,.008,5);
   }
   for(let j=0;j<8;j++){
    const theta=j*Math.PI/4;
    const r=.51;
    beam(1,vec(r*Math.cos(theta),.14,r*.82*Math.sin(theta)),
      vec(r*Math.cos(theta),.24,r*.82*Math.sin(theta)),.011,5);
   }
  }
  solid(2,0,.12,0,.12,.11,.12);
  beam(0,vec(0,.18,0),vec(.04,.34,.02),.015,high?8:5);
  if(high||medium){
   loop(1,ring(.32),.009);
   for(let side of [-1,1])beam(0,vec(side*.2,-.24,0),vec(side*.40,.16,0),.017);
  }
 }
 function fighter(){
  const rings=high?15:medium?10:6,n=high?10:medium?8:6;
  function body(t,a){
   const z=.58-t*1.26;
   const w=.045+.24*Math.pow(Math.max(0,1-Math.abs(t-.53)*1.7),.72);
   const h=.04+.12*Math.sin(Math.PI*Math.min(.95,t+.06));
   return vec(Math.cos(a)*w, -.045+Math.sin(a)*h,z);
  }
  for(let i=0;i<rings;i++){
   const a=i/rings,b=(i+1)/rings;
   for(let j=0;j<n;j++){
    const theta=2*Math.PI*j/n,phi=2*Math.PI*(j+1)/n;
    quad(0,body(a,theta),body(a,phi),body(b,phi),body(b,theta));
   }
  }
  // Real swept wings, panel seams and stabilizer fins, not huge square slabs.
  for(const side of [-1,1]){
   const wing=[
    vec(side*.17,-.09,.12),vec(side*.30,-.085,.06),
    vec(side*.81,-.045,-.31),vec(side*.76,-.052,-.45),
    vec(side*.34,-.07,-.27),vec(side*.16,-.086,-.26)
   ];
   panel(0,wing,.055);
   if(medium||high){
    panel(0,[vec(side*.15,.0,-.39),vec(side*.23,.23,-.47),
      vec(side*.43,.15,-.55),vec(side*.29,-.03,-.54)],.03);
    beam(2,vec(side*.36,-.024,-.12),vec(side*.76,-.02,-.36),
      .014,high?8:5);
    solid(2,side*.22,-.04,-.56,.19,.18,.18);
   }
   if(high){
    beam(0,vec(side*.34,.002,-.29),vec(side*.7,.012,-.41),.008,5);
    for(let j=0;j<3;j++){
     const x=side*(.39+j*.12),z=-.22-j*.075;
     solid(j===1?2:0,x,-.018,z,.07,.012,.12,side*.12);
    }
   }
  }
  // Detailed canopy, cockpit rail and two rings of turbine nozzle segments.
  const glass=[
   vec(-.15,.066,.21),vec(.15,.066,.21),
   vec(.18,.155,-.08),vec(0,.197,-.18),
   vec(-.18,.155,-.08)
  ];
  panel(1,glass,.045);
  if(high){
   beam(0,vec(-.15,.08,.19),vec(-.13,.15,-.09),.012,5);
   beam(0,vec(.15,.08,.19),vec(.13,.15,-.09),.012,5);
   beam(0,vec(-.13,.15,-.09),vec(.13,.15,-.09),.012,5);
   for(const side of [-1,1])solid(0,side*.19,-.05,.43,.05,.04,.24);
  }
  for(const side of [-1,1]){
   const cx=side*.17,pts=[];
   for(let i=0;i<(high?20:medium?12:8);i++){
    const angle=2*Math.PI*i/(high?20:medium?12:8);
    pts.push(vec(cx+.083*Math.cos(angle),-.048+.074*Math.sin(angle),-.66));
   }
   loop(2,pts,.017);
   if(high){
    const pts2=pts.map(p=>vec(p[0],p[1],-.695));
    loop(0,pts2,.010);
    for(let i=0;i<pts.length;i+=4)beam(2,pts[i],pts2[i],.012,5);
   }
  }
 }
 switch(model.recipe){
  case 'stratified_arch':arch();break;
  case 'radar_head':dish();break;
  case 'landed_fighter':fighter();break;
  default:throw Error('Unknown sculpt recipe: '+model.recipe);
 }
}
module.exports={build};
