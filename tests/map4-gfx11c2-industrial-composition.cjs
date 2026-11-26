/* NEXT11C2: same-camera industrial palette A/B in actual WebGL renderer.
 * Existing physical geometry/AABB, game balance and asset budgets untouched.
 * Browser software GPU proves screenshots only, not native FPS or aesthetics.
 */
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
 const errors=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',route=>
   route.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',route=>
   route.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
   waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Gfx11c2SetPalette==='function',null,{timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
  });
  const stats=await page.evaluate(()=>{
   const knownKinds=new Set(['SILO','REFINERY','SERVICE_DECK','CARGO_PLATFORM',
    'SUPPORT','OVERHEAD_PIPE','TRANSFER_BRIDGE','HUNTER_SIDE_TOWER',
    'BEACON','SIGNAL','ALARM','HIGH_MARKER']);
   const all=h4Gfx11c2OriginalMaterials;
   const byFamily=[0,0,0],groups=new Set();
   for(const item of all){
    if(!knownKinds.has(item.kind))throw new Error('unexpected kind '+item.kind);
    if(item.mesh.material!==item.styled)
     throw new Error('initial contrast material not bound');
    if(item.wasCollider!== (item.mesh.userData.h4Collider||null))
     throw new Error('solid collider reference changed');
    byFamily[Math.floor(item.station/2)]++;
    groups.add(item.styled);
   }
   return {
    ...h4Gfx11c2Stats,byFamily,materialReferences:groups.size,
    originalMeshCount:h4IndustrialGroups.reduce((n,g)=>{
     g.traverse(o=>{if(o.isMesh)n++;});return n;
    },0),
    fixed:{rivals:racers.length,hunters:hunterTargets.length,
     canyon:h4CanyonColliders.length,industrial:h4IndustrialColliders.length,
     buildings:planetaryBuildingColliders.length,
     raceLimit:MAP4_RACE_RULES.realTimeLimit,
     arenaSeconds:MAP4_PHASES.arenaSeconds,
     orbitAltitude:MAP4_PHASES.orbitAltitude},
    g11cInstances:h4Gfx11cIndustrialStats.instances,
    g11cBatches:h4Gfx11cIndustrialStats.heroBatches+
     h4Gfx11cIndustrialStats.detailBatches
   };
  });
  assert.equal(stats.paletteFamilies,3);
  assert.equal(stats.colorsPerFamily,3);
  assert(stats.curated>=80,'expected at least 80 original W05 meshes curated');
  assert(stats.physicalRecolored>0&&stats.visualRecolored>0);
  assert.deepEqual(stats.byFamily.map(x=>x>0),[true,true,true]);
  assert.equal(stats.materialReferences,9);
  assert.equal(stats.newMeshes,0);assert.equal(stats.newColliders,0);
  assert.equal(stats.addedDrawCalls,0);
  assert.equal(stats.g11cInstances,72);assert.equal(stats.g11cBatches,8);
  assert.deepEqual(stats.fixed,
   {rivals:5,hunters:8,canyon:6,industrial:36,buildings:200,
    raceLimit:300,arenaSeconds:60,orbitAltitude:850});
  const setup=spec=>page.evaluate(p=>{
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
  },spec);
  const cases=[];
  for(const item of [
   {id:'07-entry',progress:17200,laneX:0,laneY:260,phase:3},
   {id:'08-factory',progress:23800,laneX:0,laneY:350,phase:3},
   {id:'09-exit',progress:31600,laneX:0,laneY:450,phase:3}
  ]){
   await setup(item);
   const prior=await page.evaluate(()=>{
    h4Gfx11c2SetPalette(false);
    renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     geos:renderer.info.memory.geometries};
   });
   const before=await page.screenshot({path:path.join(__dirname,
    'map4-gfx11c2-'+item.id+'-before.png')});
   const afterState=await page.evaluate(()=>{
    h4Gfx11c2SetPalette(true);
    renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     geos:renderer.info.memory.geometries,
     maskActive:h4Gfx11bCameraMask.active,
     maskMaterial:h4Gfx11bCameraMask.mesh.material.name};
   });
   const after=await page.screenshot({path:path.join(__dirname,
    'map4-gfx11c2-'+item.id+'-after.png')});
   if(item.id!=='09-exit')
    assert(!before.equals(after),'contrast grade not visible '+item.id);
   assert.equal(afterState.calls,prior.calls,
    'materials-only pass must not add draw calls '+item.id);
   assert.equal(afterState.triangles,prior.triangles,
    'materials-only pass must not add geometry '+item.id);
   assert.equal(afterState.geos,prior.geos);
   if(item.id==='09-exit'){
    assert.equal(afterState.maskActive,true,
     'NEXT11B exit camera mask must remain active');
    assert.equal(afterState.maskMaterial,'MAP4_GFX11B_CAMERA_NEAR_FADE');
   }
   cases.push({id:item.id,prior,after:afterState,
    screenshotChanged:!before.equals(after)});
  }
  const final=await page.evaluate(()=>{
   const collidersPreserved=h4Gfx11c2OriginalMaterials.every(
    item=>item.wasCollider===(item.mesh.userData.h4Collider||null));
   const matsPreserved=h4Gfx11c2OriginalMaterials.every(
    item=>item.mesh.material===item.styled);
   const zone=planetaryWorldRegions[2];
   const got={total:h4Gfx11c2OriginalMaterials.length,
    collidersPreserved,matsPreserved,
    sceneRoot:zone.getObjectByName('MAP4_GFX11C_SIX_FACTORY_IDENTITIES')!==undefined,
    standing:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    maps:[racers.length,hunterTargets.length],
    stage3Group:zone.userData.gfx04IndustrialVisuals.visible};
   state.map4Phase=2;updatePlanetaryWorld();
   got.arenaFutureFactoryHidden=!zone.userData.gfx04IndustrialVisuals.visible;
   return got;
  });
  assert(final.collidersPreserved&&final.matsPreserved);
  assert.deepEqual(final.standing,[6,36,200]);assert.deepEqual(final.maps,[5,8]);
  assert.equal(final.stage3Group,true);
  assert.equal(final.arenaFutureFactoryHidden,true);
  assert.equal(errors.length,0,errors.join(' / '));
  console.log('GFX11C2 COMPOSITION PASS',JSON.stringify({
   curated:stats.curated,solidMaterialOnly:stats.physicalRecolored,
   visualMaterialOnly:stats.visualRecolored,families:stats.byFamily,
   callsAdded:0,meshesAdded:0,collidersAdded:0,
   cases,final,visual7of10Approved:false,nativeGpuVerified:false
  }));
 }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
