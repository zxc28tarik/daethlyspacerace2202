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

 function shatteredCarrier(){
  // A dedicated high/medium/far wrecked battleship surface, authored in its
  // own local [-1,1] coordinates; no colliders or functional weapons.
  const lengthSegments=high?28:medium?16:9;
  const ringSides=high?14:medium?10:7;
  const hull=(t,angle)=>{
   const z=.77-t*1.49;
   const bow=Math.max(.18,Math.min(1,(t+.04)*5));
   const stern=Math.max(.33,Math.min(1,(1.11-t)*3));
   const width=(.20+.14*Math.sin(Math.PI*t*.98))*bow*stern;
   const heigh=.16+.045*Math.sin(Math.PI*t);
   const crumple=.018*Math.sin(t*57+angle*6.7)+
      (high?.012:medium?.007:0)*Math.sin(t*101-angle*13);
   return vec((width+crumple)*Math.cos(angle),
      -.01+(heigh+crumple*.3)*Math.sin(angle)+t*.035,
      z);
  };
  for(let k=0;k<lengthSegments;k++){
   const t=k/lengthSegments,next=(k+1)/lengthSegments;
   for(let j=0;j<ringSides;j++){
    const a=2*Math.PI*j/ringSides,b=2*Math.PI*(j+1)/ringSides;
    const inRupture=t>.42&&t<.61 && j>=2&&j<=Math.floor(ringSides*.47);
    if(inRupture)continue; // torn open plate exposes the ship's inner ribs
    const mat=inRupture?1:(k%9===0&&j%3===0?1:0);
    quad(mat,hull(t,a),hull(t,b),hull(next,b),hull(next,a));
   }
  }
  // Deep central fracture; broken face plates lean away from the breach.
  for(const sign of [-1,1]){
    panel(1,[vec(sign*.15,.21,.18),vec(sign*.33,.29,.04),
      vec(sign*.46,.08,-.06),vec(sign*.22,.12,-.20)],.025);
    panel(2,[vec(sign*.07,.045,.08),vec(sign*.25,-.12,-.06),
      vec(sign*.24,-.18,-.32),vec(sign*.065,-.04,-.16)],.025);
  }
  // Structural ribs and visible internal deck beams across the torn opening.
  for(let i=0;i<(high?11:medium?6:3);i++){
    const z=.24-i*.073;
    const w=.22+Math.sin(i*1.7)*.075;
    beam(i%4===0?2:1,vec(-w,-.13,z),vec(w,-.13,z),.011,high?8:5);
    if(high||medium){
     beam(2,vec(-w,-.13,z),vec(-w*.65,.20,z),.012,5);
     beam(2,vec(w,-.13,z),vec(w*.65,.20,z),.012,5);
    }
  }
  // Port wing mostly intact but scorched; starboard wing fractured in pieces.
  for(const sign of [-1,1]){
    panel(0,[vec(sign*.16,-.06,.28),
      vec(sign*.42,-.035,.24),vec(sign*.87,-.048,-.11),
      vec(sign*.92,-.085,-.24),vec(sign*.36,-.10,-.34),
      vec(sign*.16,-.075,-.22)],.060);
    if(sign>0){
      // jagged break and exposed spars instead of a perfect mirrored tip
      panel(1,[vec(.53,-.02,-.27),vec(.83,.06,-.38),
        vec(.99,-.19,-.48),vec(.67,-.12,-.51)],.026);
      beam(2,vec(.42,-.02,-.17),vec(1.03,.01,-.38),.015,7);
    }else{
      panel(1,[vec(-.70,-.02,.0),vec(-.95,.01,-.09),
        vec(-.83,-.06,-.21),vec(-.68,-.10,-.16)],.032);
      if(high)beam(2,vec(-.36,.0,.05),vec(-.86,-.045,-.14),.013,7);
    }
    if(medium||high){
      panel(2,[vec(sign*.25,.015,-.03),vec(sign*.39,.01,-.04),
        vec(sign*.65,.028,-.27),vec(sign*.46,.006,-.21)],.013);
      for(let j=0;j<(high?5:2);j++){
       const a=j/(high?5:2);
       beam(j%2?2:1,
        vec(sign*(.27+.35*a),-.002,.035-.18*a),
        vec(sign*(.37+.39*a),-.02,-.26-.17*a),.005,5);
      }
    }
  }
  // Stacked bridge sections; one side deliberately collapsed.
  const count=high?7:medium?4:2;
  for(let i=0;i<count;i++){
    const t=i/count,z=.43-t*.59;
    solid(i%3===0?1:0,-.055+t*.07,.19+t*.035,z,
      .19-t*.025,.05+.012*(i%3),.135,
      -.015*i);
  }
  if(high){
    for(let i=0;i<11;i++){
      const z=.36-i*.088;
      solid(i%3===0?2:0,.01,.255,z,.095,.018,.05);
    }
  }
  // Two scorched drive nozzles, each with a true faceted hollow opening,
  // a darker internal ring and discontinuous armored petals.
  for(const sign of [-1,1]){
    const cx=sign*.21,centerY=-.06;
    const ring=(z,r,n)=>{
      const pts=[];
      for(let i=0;i<n;i++){
       const a=2*Math.PI*i/n;
       pts.push(vec(cx+Math.cos(a)*r,centerY+Math.sin(a)*r,z));
      }
      return pts;
    };
    const n=high?24:medium?16:9;
    const front=ring(-.66,.135,n),rear=ring(-.81,.14,n),
      throat=ring(-.84,.08,n);
    for(let j=0;j<n;j++){
      if(high&&j%7===0)continue; // missing heatshield petal
      const next=(j+1)%n;
      quad(j%5===0?1:0,front[j],front[next],rear[next],rear[j]);
      quad(1,rear[j],rear[next],throat[next],throat[j]);
    }
    loop(2,throat,high?.008:.012);
    if(medium||high){
      const cap=ring(-.90,.04,n);
      for(let j=0;j<n;j++){
       if(j%6===0)continue;
       quad(3,throat[j],throat[(j+1)%n],cap[(j+1)%n],cap[j]);
      }
      for(let j=0;j<(high?8:4);j++){
       const a=j*Math.PI*2/(high?8:4);
       const p=i=>vec(cx+Math.cos(a)*i,centerY+Math.sin(a)*i,-.74);
       beam(2,p(.155),p(.205),.009,5);
      }
    }
  }
  // Detached armor/antenna fragments stay integrated in the flagship GLB.
  if(medium||high){
    for(let i=0;i<(high?14:6);i++){
      const side=i%2?1:-1,z=.48-i*.088;
      solid(i%4===0?2:1,side*(.40+(i%5)*.068),
        -.19+Math.sin(i*2.3)*.075,z,.08+(i%3)*.02,
        .023+(i%4)*.01,.14+(i%3)*.02,(i%4-1)*.11);
    }
  }
  // Destroyed bridge mast, etched radiator covers and burnt vent slots.
  if(high){
    beam(2,vec(-.08,.20,.22),vec(-.32,.42,.10),.014,7);
    beam(1,vec(.09,.19,-.17),vec(.24,.33,-.32),.011,7);
    for(let j=0;j<9;j++){
      const z=.20-j*.085;
      solid(j%4===0?1:2,-.17,.126,z,.063,.012,.024);
      solid(j%3===0?1:2,.17,.126,z,.063,.012,.024);
    }
  }
 }
 switch(model.recipe){
  case 'stratified_arch':arch();break;
  case 'radar_head':dish();break;
  case 'landed_fighter':fighter();break;
  case 'fractured_carrier':shatteredCarrier();break;
  default:throw Error('Unknown sculpt recipe: '+model.recipe);
 }
}
module.exports={build};
