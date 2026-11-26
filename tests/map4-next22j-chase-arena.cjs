'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Next22jDefenseTowerGeometry==='function'&&
   typeof h4Next22jFracturedOuterWingGeometry==='function',null,{timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const native=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:native(cb);
  });
  const signature=await page.evaluate(()=>{
   const zone=planetaryWorldRegions[1];
   const g=zone.getObjectByName('MAP4_GFX11B_ARENA_SKYLINE');
   const names=g.children.map(c=>c.name);
   const counts=g.children.map(c=>c.count);
   const geometry=g.children.map(c=>c.geometry.type);
   const ranges=[];
   const dummy=new THREE.Matrix4();
   const position=new THREE.Vector3();
   const orientation=new THREE.Quaternion();
   const scale=new THREE.Vector3();
   let maxPositionError=0,maxStageOverflow=0,minSideAbs=Infinity;
   g.children.forEach((mesh,family)=>{
    const spec=family===0?{base:12740,mod:8,step:119,row:53}:
     family===1?{base:12690,mod:13,step:83,row:41}:
     family===2?{base:12780,mod:11,step:88,row:47}:
     {base:12850,mod:5,step:140,row:29};
    let lo=Infinity,hi=-Infinity;
    for(let i=0;i<mesh.count;i++){
     const progress=spec.base+(i%spec.mod)*spec.step+
      Math.floor(i/spec.mod)*spec.row;
     const sign=i%2?-1:1;
     const pocket=i%3;
     const side=pocket===0?sign*(710+(i*53)%370):
      pocket===1?-(1300+(i*73)%520):
      1320+(i*71)%520;
     const expected=h4WorldPosition(progress,side,
      family===0?-305+(i%4)*50:
      family===1?-430+(420+(i*67)%510)*.50:
      family===2?-365+(i%3)*90:190+(i%3)*110);
     mesh.getMatrixAt(i,dummy);
     dummy.decompose(position,orientation,scale);
     maxPositionError=Math.max(maxPositionError,position.distanceTo(expected));
     maxStageOverflow=Math.max(maxStageOverflow,
      Math.max(0,MAP4_PHASES.introEnd-progress,progress-MAP4_PHASES.arenaEnd));
     minSideAbs=Math.min(minSideAbs,Math.abs(side));
     lo=Math.min(lo,progress);hi=Math.max(hi,progress);
    }
    ranges.push({name:mesh.name,min:lo,max:hi});
   });
   const art=zone.getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
   return {names,counts,geometry,ranges,maxPositionError,
    maxStageOverflow,minSideAbs,
    oldBatches:h4Gfx11bArenaStats.batches,
    oldInstances:h4Gfx11bArenaStats.instances,
    newerBatches:art.children.length,
    newerInstances:art.children.reduce((n,c)=>n+c.count,0),
    allVisualOnly:g.children.every(x=>x.userData.visualOnly&&
     x.userData.h4Gfx11bArenaVisualOnly),
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    racers:racers.length,hunters:hunterTargets.length};
  });
  assert.deepEqual(signature.counts,[16,26,22,10]);
  assert.deepEqual(signature.geometry,
   ['ExtrudeGeometry','LatheGeometry','ExtrudeGeometry','SphereGeometry']);
  assert.equal(signature.oldBatches,4);
  assert.equal(signature.oldInstances,74);
  assert.equal(signature.newerBatches,5);
  assert.equal(signature.newerInstances,112);
  assert.equal(signature.allVisualOnly,true);
  assert.equal(signature.maxStageOverflow,0,'Arena skyline leaks beyond arena');
  assert(signature.maxPositionError<.02,'Instance not on curated combat route');
  assert(signature.minSideAbs>=700,'Arena central shooting line obstructed');
  assert.deepEqual(signature.colliders,[6,36,200]);
  assert.equal(signature.racers,5);assert.equal(signature.hunters,8);
  const cases=[];
  for(const [label,progress,side] of [
   ['center',12600,0],['wreck',12690,-1150],['defense',12940,1150]]){
   const sample=await page.evaluate(({progress,side})=>{
    state.paused=true;state.routeProgress=progress;
    state.laneX=side;state.laneY=185;state.map4Phase=2;
    state.cameraMode='CHASE';state.yaw=state.pitch=state.roll=0;
    const f=getRaceFrameAtDistance(progress);
    state.pos.copy(f.center).addScaledVector(f.right,side)
     .addScaledVector(f.up,185);
    const q=new THREE.Quaternion().setFromRotationMatrix(
     new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
    // Same settled Map4 CHASE local position used by updateGame,
    // instead of earlier tests' idealized (0,5,17) camera.
    const offset=new THREE.Vector3(-1.65,5.5,18.5);
    camera.position.copy(state.pos).add(offset.applyQuaternion(q));
    camera.quaternion.copy(q);
    camera.fov=68;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
    const g=planetaryWorldRegions[1].getObjectByName('MAP4_GFX11B_ARENA_SKYLINE');
    g.visible=false;renderer.render(scene,camera);
    return {visible:planetaryWorldRegions[1].visible,
     calls:renderer.info.render.calls,
     colliderCount:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length]};
   },{progress,side});
   const before=await page.screenshot({path:path.join(__dirname,
    'map4-next22j-'+label+'-chase-before.png')});
   const after=await page.evaluate(()=>{
    const g=planetaryWorldRegions[1].getObjectByName('MAP4_GFX11B_ARENA_SKYLINE');
    g.visible=true;renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     glError:renderer.getContext().getError()};
   });
   const image=await page.screenshot({path:path.join(__dirname,
    'map4-next22j-'+label+'-chase-after.png')});
   assert.equal(sample.visible,true);
   assert.equal(after.glError,0);
   assert.deepEqual(sample.colliderCount,signature.colliders);
   assert(after.calls>sample.calls&&after.calls<=sample.calls+4,
    'Draw-call budget or visibility regression: '+label);
   cases.push({label,changed:!before.equals(image),
    callsBefore:sample.calls,callsAfter:after.calls,triangles:after.triangles});
  }
  assert(cases.every(c=>c.changed),
   'At least one genuine Map4 chase view lacks warfront skyline');
  assert.equal(errors.length,0,errors.join(' | '));
  console.log('NEXT22J THREE-CHASE 74-SKYLINE WEBGL PASS',
   JSON.stringify({signature,cases,softwareWebGL:true}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
