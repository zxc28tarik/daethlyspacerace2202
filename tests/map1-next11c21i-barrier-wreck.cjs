/* NEXT11C21I — original hazard and wreckage geometry, surface art ONLY.
 * Native WebGL QA: topology, real 1600x900 A/B images, prize and Map4 guard.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21i-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof startGame==='function'&&
   Array.isArray(staticObstacles)&&staticObstacles.length>80&&
   Array.isArray(wreckageModules)&&wreckageModules.length===8,
   null,{timeout:30000});
  const physical=await page.evaluate(()=>{
   const barriers=staticObstacles.filter(o=>o.type==='BARRIER');
   const gateParts=staticObstacles.filter(o=>o.type==='WRECK_BOX');
   const stats=barriers.map(o=>{
    const group=o.mesh,meshes=group.children.filter(c=>c.isMesh),
     edges=group.children.filter(c=>c.isLineSegments);
    const toruses=meshes.filter(c=>c.geometry.type==='TorusGeometry');
    const hull=meshes.find(c=>c.geometry.type==='OctahedronGeometry'||
     c.geometry.type==='IcosahedronGeometry');
    return {radius:o.radius,route:o.routeProgress,meshCount:meshes.length,
     lines:edges.length,toruses:toruses.length,
     originalHalo:toruses.every(t=>t.geometry.parameters.radius===o.radius*1.02&&
      t.geometry.parameters.tube===3.5),
     originalCore:hull&&hull.geometry.parameters.radius===o.radius*
      (hull.geometry.type==='OctahedronGeometry'?.85:.82),
     hullTexture:hull&&hull.material.map===courseHazardPaint,
     roughness:hull&&hull.material.roughness,
     opacity:toruses[0]&&toruses[0].material.opacity,
     durability:o.durability,max:o.maxDurability,
     samePhysicsPosition:group.position.distanceTo(
      makeCourseLocalGroup(o.routeProgress,o.laneX,o.laneY).position)<1e-4
    };
   });
   const gates=wreckageModules.map((g,i)=>{
    const meshes=[],lines=[];
    g.group.traverse(o=>{if(o.isMesh)meshes.push(o);
      if(o.isLineSegments)lines.push(o)});
    const surfaces=meshes.filter(o=>o.material?.map===courseWreckPaint);
    return {i,mode:g.mode,distance:g.distance,parts:g.parts.length,
     renderChildren:g.group.children.length,meshCount:meshes.length,
     lineCount:lines.length,paintCount:surfaces.length,
     sameOpening:g.opening.x===0 &&
      g.opening.hx===116&&[78,98].includes(g.opening.hy),
     partsAllBox:g.parts.every(x=>x.type==='WRECK_BOX'&&
      x.halfX>=0&&x.halfY>=0&&x.halfDepth===82.5),
     location:g.group.position.distanceTo(
      makeCourseLocalGroup(g.distance,0,0).position)<1e-4};
   });
   const textures=[courseHazardPaint,courseWreckPaint].map(tex=>{
    const d=tex.image.data;
    let lo=255,hi=0,opaque=true;
    for(let i=0;i<d.length;i+=4){
     lo=Math.min(lo,d[i]);hi=Math.max(hi,d[i]);
     if(d[i+3]!==255)opaque=false;
    }
    return {name:tex.name,w:tex.image.width,h:tex.image.height,
     noRNG:!makeCourseHazardPaintMap.toString().includes('Math.random'),
     alphaOpaque:opaque,min:lo,max:hi,version:tex.version,
     isDataTexture:tex.isDataTexture,shared:tex.userData.shared,
     deterministic:tex.userData.deterministic};
   });
   return {barrierCount:barriers.length,gateColliderCount:gateParts.length,
    gateCount:wreckageModules.length,barrier:stats,gate:gates,textures,
    originalItemBoxes:itemBoxes.length===49&&itemBoxes.every(b=>
     b.radius===49&&b.spin.geometry.type==='BoxGeometry'),
    rockCount:asteroids.length};
  });
  assert(physical.barrierCount>=75);
  assert.equal(physical.gateColliderCount,32);assert.equal(physical.gateCount,8);
  assert(physical.barrier.every(b=>b.meshCount===3&&b.lines===1&&
   b.toruses===2&&b.originalHalo&&b.originalCore&&b.hullTexture&&
   b.roughness>=.72&&b.opacity<=.85&&b.samePhysicsPosition&&
   b.max===3&&b.durability===3));
  assert(physical.gate.every(g=>g.parts===4&&g.paintCount>=10&&
   g.renderChildren===16&&g.sameOpening&&g.partsAllBox&&g.location));
  assert(physical.textures.every(t=>t.w===64&&t.h===64&&t.noRNG&&
   t.alphaOpaque&&t.isDataTexture&&t.shared&&t.deterministic&&t.max-t.min>45));
  assert(physical.originalItemBoxes&&physical.rockCount===320);

  const studio=await page.evaluate(()=>{
   const sc=new THREE.Scene();sc.background=new THREE.Color(0x0a1020);
   sc.add(new THREE.HemisphereLight(0xc3d7ff,0x1b1e28,1.35));
   const key=new THREE.DirectionalLight(0xffffff,2.0);
   key.position.set(45,75,170);sc.add(key);
   const o=staticObstacles.find(o=>o.type==='BARRIER');
   const old=o.mesh.clone(true),now=o.mesh.clone(true);
   old.position.set(-103,0,0);now.position.set(103,0,0);
   old.quaternion.identity();now.quaternion.identity();
   // Preserve actual geometry; reconstruct ONLY original materials on left.
   old.children.forEach(x=>{
    if(x.isLineSegments)x.material=new THREE.LineBasicMaterial({
     color:0xffc07a,transparent:true,opacity:.9});
    else if(x.geometry.type==='TorusGeometry')
     x.material=new THREE.MeshBasicMaterial({color:0xff623e,
      side:THREE.DoubleSide});
    else x.material=new THREE.MeshStandardMaterial({
     color:0x493943,metalness:.72,roughness:.38,flatShading:true});
   });
   sc.add(old,now);
   const cam=new THREE.PerspectiveCamera(40,1600/900,.1,800);
   cam.position.set(0,35,380);cam.lookAt(0,0,0);
   renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
   renderer.render(sc,cam);const gl=renderer.getContext();gl.finish();
   const aa=!!gl.getContextAttributes().antialias,err=gl.getError(),
    calls=renderer.info.render.calls;
   const w=1600,h=900,row=w*4,raw=new Uint8Array(w*h*4),
    rgba=new Uint8ClampedArray(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   for(let y=0;y<h;y++)rgba.set(raw.subarray(y*row,(y+1)*row),(h-1-y)*row);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   return {aa,err,calls,png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert(studio.aa&&studio.err===0);
  assert.equal(studio.calls,8);
  fs.writeFileSync(path.join(out,'original-vs-weathered-barrier-1600x900.png'),
    Buffer.from(studio.png,'base64'));delete studio.png;

  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:30000});
  const race=await page.evaluate(()=>{
   state.paused=true;
   const barrier=staticObstacles.find(o=>o.type==='BARRIER');
   const gate=wreckageModules[0].group;
   const moved=[barrier.mesh,gate].map(group=>({
    group,p:group.position.clone(),q:group.quaternion.clone(),v:group.visible}));
   const b=makeCourseLocalGroup(state.routeProgress+280,
    state.laneX+85,state.laneY+24);
   const g=makeCourseLocalGroup(state.routeProgress+640,0,0);
   barrier.mesh.position.copy(b.position);barrier.mesh.quaternion.copy(b.quaternion);
   gate.position.copy(g.position);gate.quaternion.copy(g.quaternion);
   barrier.mesh.visible=true;gate.visible=true;
   renderer.render(scene,camera);
   const gl=renderer.getContext();gl.finish();
   const err=gl.getError(),calls=renderer.info.render.calls;
   const w=1600,h=900,row=w*4,raw=new Uint8Array(w*h*4),
    rgba=new Uint8ClampedArray(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   for(let y=0;y<h;y++)rgba.set(raw.subarray(y*row,(y+1)*row),(h-1-y)*row);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   moved.forEach(({group,p,q,v})=>{
    group.position.copy(p);group.quaternion.copy(q);group.visible=v;});
   return {err,calls,restored:moved.every(({group,p})=>
    group.position.distanceTo(p)<1e-5),
    shipParts:h4Ship19Race.userData.parts,
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert(race.err===0&&race.restored);
  assert.equal(race.shipParts,189);
  fs.writeFileSync(path.join(out,'map1-camera-refined-barrier-and-wreck.png'),
   Buffer.from(race.png,'base64'));delete race.png;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {mode:state.activeMap,ship:h4Ship19Combat.userData.parts,
    colliderSizes:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],glError:renderer.getContext().getError()};
  });
  assert.equal(map4.mode,'map4');assert.equal(map4.ship,249);
  assert.deepEqual(map4.colliderSizes,[6,36,200]);assert.equal(map4.glError,0);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'barrier-wreck-visual-only-acceptance.json'),
   JSON.stringify({pass:true,revision:'NEXT11C21I',physical,studio,race,map4,errors,
    caveat:'Studio left uses original pre-C21I barrier materials on EXACT same meshes as the refined right. Race screenshot stages ONE barrier and ONE existing gate solely for legibility, then restores their transforms. Physics positions, RNG, clearances, health and size are unchanged.'},null,2));
  console.log('NEXT11C21I BARRIER WRECK SURFACE WEBGL PASS '+JSON.stringify({
   barriers:physical.barrierCount,gates:physical.gateCount,
   gateColliders:physical.gateColliderCount,studioDraws:studio.calls,
   allOriginalPickups:physical.originalItemBoxes,
   geometryUnchanged:physical.barrier.every(b=>b.originalCore&&b.originalHalo),
   map4,errors}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});
