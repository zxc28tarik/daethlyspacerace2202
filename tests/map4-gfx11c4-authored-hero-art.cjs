/* NEXT-11C4 — three independently sculpted industrial hero architecture models.
 * Three same-camera 1600x900 comparisons, quality profile/physics gate.
 * Hardware GPU FPS and 7/10 aesthetics still require human validation.
 */
'use strict';
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
   waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Gfx11c4BuildHeroArchitecture==='function',
   null,{timeout:15000});
  await page.locator('#map-choice-4').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const request=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:request(cb);
  });
  const baseline=await page.evaluate(()=>{
   const hero=h4Gfx11c4HeroRoot;
   const stats={...h4Gfx11c4Stats};
   const parts=hero.children.map(mesh=>({
    name:mesh.name,
    isInstancedMesh:mesh.isInstancedMesh,
    count:mesh.count,
    collider:!!mesh.userData.h4Collider,
    visualOnly:mesh.userData.visualOnly,
    noCollider:mesh.userData.noCollider,
    uniqueColor:mesh.material.vertexColors,
    triangles:mesh.geometry.getAttribute('position').count/3,
    attributes:Object.keys(mesh.geometry.attributes),
    bounds:mesh.geometry.boundingBox.getSize(new THREE.Vector3()).toArray(),
    vertexCount:mesh.geometry.getAttribute('position').count,
    instancesColored:!!mesh.instanceColor
   }));
   return {stats,parts,colliders:[
    h4CanyonColliders.length,h4IndustrialColliders.length,
    planetaryBuildingColliders.length],
    gameplay:{rivals:racers.length,hunters:hunterTargets.length,
     seconds:MAP4_RACE_RULES.realTimeLimit,
     arenaSeconds:MAP4_PHASES.arenaSeconds,
     orbit:MAP4_PHASES.orbitAltitude,
     score:state.score,shots:state.hunterShots},
    previousWork:{industrialInstances:h4Gfx11cIndustrialStats.instances,
     oldPropsHidden:h4Gfx11c3LegacyVisuals.every(x=>!x.visible),
     solidMeshesProtected:h4Gfx11c3PhysicalMaterials.every(x=>
      x.mesh.userData.h4Collider===x.collider &&
      x.mesh.geometry===x.originalGeometry)}
   };
  });
  assert.deepEqual(baseline.colliders,[6,36,200]);
  assert.deepEqual(baseline.gameplay,{
   rivals:5,hunters:8,seconds:300,arenaSeconds:60,
   orbit:850,score:0,shots:0});
  assert.equal(baseline.stats.architectureFamilies,3);
  assert.equal(baseline.stats.heroBatches,3);
  assert.equal(baseline.stats.heroInstances,12);
  assert.equal(baseline.stats.newColliders,0);
  assert.equal(baseline.stats.originalCollisionMeshesChanged,0);
  assert.equal(baseline.parts.length,3);
  assert.equal(baseline.previousWork.industrialInstances,72);
  assert.equal(baseline.previousWork.oldPropsHidden,true);
  assert.equal(baseline.previousWork.solidMeshesProtected,true);
  assert(baseline.stats.bakedPrimitives>=55,'authored assembly missing parts');
  assert.equal(new Set(baseline.parts.map(m=>m.vertexCount)).size,3,
   'three model families should have different authored profiles');
  for(const mesh of baseline.parts){
   assert.equal(mesh.isInstancedMesh,true);
   assert.equal(mesh.count,4);
   assert.equal(mesh.collider,false);
   assert.equal(mesh.visualOnly,true);
   assert.equal(mesh.noCollider,true);
   assert.equal(mesh.uniqueColor,true);
   assert.equal(mesh.instancesColored,true);
   assert(mesh.triangles>500,'hero detail missing '+mesh.name);
   assert(mesh.attributes.includes('position')&&mesh.attributes.includes('normal')&&
    mesh.attributes.includes('color'));
  }
  const setCamera=spec=>page.evaluate(p=>{
   state.paused=true;state.routeProgress=p.progress;
   state.laneX=p.laneX;state.laneY=p.laneY;state.map4Phase=p.phase;
   const f=getRaceFrameAtDistance(p.progress);
   state.pos.copy(f.center).addScaledVector(f.right,p.laneX)
    .addScaledVector(f.up,p.laneY);
   const q=new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
   playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
   camera.position.copy(state.pos)
    .add(new THREE.Vector3(0,5,17).applyQuaternion(q));
   camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
   h4Gfx10SetProfile('HIGH');
   updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
   renderer.render(scene,camera);
  },spec);
  const cases=[];
  for(const spec of [
   {id:'07-entry',progress:17200,laneX:0,laneY:260,phase:3},
   {id:'08-factory',progress:23800,laneX:0,laneY:350,phase:3},
   {id:'09-exit',progress:31600,laneX:0,laneY:450,phase:3}
  ]){
   await setCamera(spec);
   const old=await page.evaluate(()=>{
    h4Gfx11c4SetHeroVisible(false);
    renderer.render(scene,camera);
    return {drawCalls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     geometries:renderer.info.memory.geometries,
     textures:renderer.info.memory.textures};
   });
   const oldShot=await page.screenshot({path:path.join(__dirname,
    'map4-gfx11c4-'+spec.id+'-before.png')});
   const improved=await page.evaluate(()=>{
    h4Gfx11c4SetHeroVisible(true);
    renderer.render(scene,camera);
    return {drawCalls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     geometries:renderer.info.memory.geometries,
     textures:renderer.info.memory.textures,
     visible:h4Gfx11c4HeroRoot.visible,
     maskActive:h4Gfx11bCameraMask.active,
     maskName:h4Gfx11bCameraMask.mesh.material.name,
     futureFactories:planetaryWorldRegions[2].userData.gfx04IndustrialVisuals.visible,
     colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length]};
   });
   const newShot=await page.screenshot({path:path.join(__dirname,
    'map4-gfx11c4-'+spec.id+'-after.png')});
   assert.equal(improved.visible,true);
   assert.equal(improved.drawCalls-old.drawCalls,3,
    'one batched draw call per family: '+spec.id);
   assert(improved.triangles-old.triangles>3000,
    'detailed multi-part architecture not rendered: '+spec.id);
   assert(improved.triangles-old.triangles<140000,
    'visual-only hero art exceeds triangle ceiling: '+spec.id);
   assert.equal(improved.geometries,old.geometries,
    'three authored geometries should be resident before toggle');
   assert.equal(improved.textures,old.textures);
   assert.deepEqual(improved.colliders,baseline.colliders);
   assert.equal(improved.futureFactories,true);
   if(spec.id!=='09-exit')
    assert(!oldShot.equals(newShot),'hero must be visible at '+spec.id);
   if(spec.id==='09-exit'){
    assert.equal(improved.maskActive,true);
    assert.equal(improved.maskName,'MAP4_GFX11B_CAMERA_NEAR_FADE');
   }
   cases.push({id:spec.id,old,improved,screenChanged:!oldShot.equals(newShot)});
  }
  const profileProof=[];
  await setCamera({progress:23800,laneX:0,laneY:350,phase:3});
  for(const name of ['HIGH','BALANCED','LOW']){
   const datum=await page.evaluate(preset=>{
    h4Gfx10SetProfile(preset);updatePlanetaryWorld();
    renderer.render(scene,camera);
    return {name:h4Gfx10ProfileName,
     heroVisible:h4Gfx11c4HeroRoot.visible,
     oldIndustryVisible:planetaryWorldRegions[2].userData.gfx04IndustrialVisuals.visible,
     calls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles};
   },name);
   assert.equal(datum.name,name);
   assert.equal(datum.heroVisible,name!=='LOW');
   assert.equal(datum.oldIndustryVisible,true);
   profileProof.push(datum);
  }
  assert(profileProof[2].triangles<profileProof[1].triangles,
   'LOW must save dense 3D hero geometry');
  await page.evaluate(()=>h4Gfx10SetProfile('HIGH'));
  const phases=[];
  for(const spec of [
   {id:'arena',progress:13200,laneX:0,laneY:190,phase:2},
   {id:'orbit',progress:47500,laneX:0,laneY:1300,phase:4}
  ]){
   await setCamera(spec);
   const phase=await page.evaluate(()=>({
    name:state.map4Phase,hero:h4Gfx11c4HeroRoot.visible,
    protectedSolids:h4Gfx11c3PhysicalMaterials.every(x=>
     x.mesh.userData.h4Collider===x.collider &&
     x.mesh.geometry===x.originalGeometry),
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    futureFactories:planetaryWorldRegions[2].userData.gfx04IndustrialVisuals.visible
   }));
   assert.equal(phase.hero,false);
   assert.equal(phase.protectedSolids,true);
   assert.deepEqual(phase.colliders,[6,36,200]);
   if(spec.phase===2)assert.equal(phase.futureFactories,false);
   phases.push({id:spec.id,...phase});
  }
  assert.equal(errors.length,0,'browser errors:\n'+errors.join('\n'));
  console.log('NEXT11C4 AUTHORED HERO ART PASS',JSON.stringify({
   baseline,cases,profiles:profileProof,phases,
   nativeGpuFpsVerified:false,humanAesthetic7of10Approved:false
  }));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
