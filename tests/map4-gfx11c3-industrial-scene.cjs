/* NEXT11C3 — literal same-camera old/new W05 industrial composition QA.
 * Validates visual-only replacement, original solid mesh/collider identity,
 * phase gating, atmosphere scope and renderer budget. NOT human 7/10 signoff.
 */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
   waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Gfx11c3BuildComposition==='function',null,{
   timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running && state.raceTime>.05,null,{
   timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const nativeRaf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:nativeRaf(cb);
  });
  const before=await page.evaluate(()=>{
   const legacy=h4Gfx11c3LegacyVisuals;
   const solids=h4Gfx11c3PhysicalMaterials;
   const hero=h4Gfx11c3ArchBatch;
   return {
    stats:{...h4Gfx11c3Stats},
    oldInstances:legacy.length,
    allOldOnlyVisual:legacy.every(m=>m.isMesh&&!m.userData.h4Collider&&
     m.userData.h4Gfx11c3ReplacedVisual),
    oldHidden:legacy.every(m=>!m.visible),
    solids:solids.length,
    allSolidsOriginal:solids.every(x=>
     x.mesh.userData.h4Collider===x.collider &&
     x.mesh.geometry===x.originalGeometry &&
     x.mesh.material===x.styled),
    uniqueSolids:new Set(solids.map(x=>x.collider)).size,
    gantry:{
     isInstancedMesh:hero.isInstancedMesh,
     instances:hero.count,
     originalGeometry:hero.geometry===H4_GFX06C_GEO.cargoCrane,
     noCollider:hero.userData.noCollider,
     visualOnly:hero.userData.visualOnly,
     batches:1,
     hasInstanceColors:!!hero.instanceColor
    },
    gameplay:{
     rivals:racers.length,hunters:hunterTargets.length,
     canyon:h4CanyonColliders.length,
     industrial:h4IndustrialColliders.length,
     physical:planetaryBuildingColliders.length,
     seconds:MAP4_RACE_RULES.realTimeLimit,
     arenaSeconds:MAP4_PHASES.arenaSeconds,
     orbital:MAP4_PHASES.orbitAltitude,
     score:state.score,hunterShots:state.hunterShots
    },
    g11cArt:h4Gfx11cIndustrialStats.instances
   };
  });
  assert.equal(before.stats.sites,6);
  assert.equal(before.stats.legacyHidden,18);
  assert(before.solids>=20);
  assert.equal(before.stats.solidRegraded,before.solids);
  assert.equal(before.allOldOnlyVisual,true);
  assert.equal(before.oldHidden,true);
  assert.equal(before.allSolidsOriginal,true);
  assert.equal(before.uniqueSolids,before.solids);
  assert.equal(before.gantry.isInstancedMesh,true);
  assert.equal(before.gantry.instances,6);
  assert.equal(before.gantry.originalGeometry,true);
  assert.equal(before.gantry.noCollider,true);
  assert.equal(before.gantry.visualOnly,true);
  assert.equal(before.gantry.hasInstanceColors,true);
  assert.equal(before.stats.newColliders,0);
  assert.equal(before.g11cArt,72);
  assert.deepEqual(before.gameplay,{
   rivals:5,hunters:8,canyon:6,industrial:36,physical:200,
   seconds:300,arenaSeconds:60,orbital:850,score:0,hunterShots:0
  });
  const frame=({progress,laneX=0,laneY,phase=3})=>page.evaluate(p=>{
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
   updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
   renderer.render(scene,camera);
  },{progress,laneX,laneY,phase});
  const rendered=[];
  for(const spec of [
   {id:'07-industry-entry',progress:17200,laneY:260},
   {id:'08-industry-factory',progress:23800,laneY:350},
   {id:'09-industry-exit',progress:31600,laneY:450}
  ]){
   await frame(spec);
   const a=await page.evaluate(()=>{
    h4Gfx11c3SetComposition(false);
    h4UpdateCinematicAtmosphere(8);renderer.render(scene,camera);
    return {
     calls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     geometry:renderer.info.memory.geometries,
     fog:scene.fog.color.getHex(),density:scene.fog.density,
     sunOpacity:h4SunHalo.material.opacity,
     exposure:renderer.toneMappingExposure,
     oldPropsVisible:h4Gfx11c3LegacyVisuals.filter(x=>x.visible).length,
     solidsRestored:h4Gfx11c3PhysicalMaterials.every(x=>
      x.mesh.material===x.original)
    };
   });
   const imageA=await page.screenshot({path:path.join(__dirname,
    'map4-gfx11c3-'+spec.id+'-before.png')});
   const b=await page.evaluate(()=>{
    h4Gfx11c3SetComposition(true);
    h4UpdateCinematicAtmosphere(8);renderer.render(scene,camera);
    return {
     calls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     geometry:renderer.info.memory.geometries,
     fog:scene.fog.color.getHex(),density:scene.fog.density,
     sunOpacity:h4SunHalo.material.opacity,
     exposure:renderer.toneMappingExposure,
     oldPropsVisible:h4Gfx11c3LegacyVisuals.filter(x=>x.visible).length,
     solidsStyled:h4Gfx11c3PhysicalMaterials.every(x=>
      x.mesh.material===x.styled),
     archVisible:h4Gfx11c3ArchBatch.visible,
     pillarFadeActive:h4Gfx11bCameraMask.active,
     pillarMaterial:h4Gfx11bCameraMask.mesh.material.name
    };
   });
   const imageB=await page.screenshot({path:path.join(__dirname,
    'map4-gfx11c3-'+spec.id+'-after.png')});
   assert.equal(a.oldPropsVisible,18);
   assert.equal(a.solidsRestored,true);
   assert.equal(b.oldPropsVisible,0);
   assert.equal(b.solidsStyled,true);
   assert.equal(b.archVisible,true);
   assert(!imageA.equals(imageB),'same-camera image did not change: '+spec.id);
   assert(b.calls<=a.calls+1,
    'arch should replace redundant legacy scene, not increase call count: '+spec.id);
   assert(b.triangles<=a.triangles+7000,
    'new sculpture must not inflate scene triangles: '+spec.id);
   assert.equal(b.geometry,a.geometry,
    'reused authored crane geometry cannot allocate extra GPU geometry');
   assert(b.exposure<a.exposure,
    'sector 3 light/exposure should be reduced: '+spec.id);
   if(spec.id==='09-industry-exit'){
    assert.equal(b.pillarFadeActive,true,'previous camera mask must survive');
    assert.equal(b.pillarMaterial,'MAP4_GFX11B_CAMERA_NEAR_FADE');
   }
   rendered.push({id:spec.id,before:a,after:b,pixelChanged:true});
  }
  // Arena and final ascent cannot inherit industrial color grading or
  // decorative gantry visibility. Existing continuous ground stays visible.
  const phases=[];
  for(const spec of [
   {id:'arena',progress:13200,laneX:0,laneY:190,phase:2},
   {id:'orbit',progress:48500,laneX:0,laneY:1200,phase:4}
  ]){
   await frame(spec);
   const status=await page.evaluate(()=>{
    h4Gfx11c3SetComposition(true);
    h4UpdateCinematicAtmosphere(8);renderer.render(scene,camera);
    return {
     industrialRegion:planetaryWorldRegions[2].visible,
     industrialParentVisible:planetaryWorldRegions[2].
      userData.gfx04IndustrialVisuals.visible,
     arch:h4Gfx11c3ArchBatch.visible,
     phase:state.map4Phase,
     protectedColliders:h4Gfx11c3PhysicalMaterials.every(
      item=>item.mesh.userData.h4Collider===item.collider &&
        item.mesh.geometry===item.originalGeometry),
     solids:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length]
    };
   });
   assert.equal(status.protectedColliders,true);
   assert.deepEqual(status.solids,[6,36,200]);
   if(spec.phase===2)assert.equal(status.industrialParentVisible,false);
   phases.push({id:spec.id,...status});
  }
  const final=await page.evaluate(()=>({
   active:h4Gfx11c3Stats.enabled,
   legacyStillHidden:h4Gfx11c3LegacyVisuals.every(x=>!x.visible),
   collisionFixed:h4Gfx11c3PhysicalMaterials.every(
    item=>item.mesh.userData.h4Collider===item.collider),
   h1:h4CanyonColliders.length,h2:h4IndustrialColliders.length,
   h3:planetaryBuildingColliders.length,
   fpsMeasuredOnNativeGpu:false,humanScore7of10Approved:false
  }));
  assert(final.active&&final.legacyStillHidden&&final.collisionFixed);
  assert.deepEqual([final.h1,final.h2,final.h3],[6,36,200]);
  assert.equal(errors.length,0,errors.join(' | '));
  console.log('NEXT11C3 INDUSTRIAL SCENE PASS',JSON.stringify({
   curated:before.stats,protectedSolidMeshes:before.solids,
   initial:before.gameplay,gantry:before.gantry,rendered,phases,final
  }));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
