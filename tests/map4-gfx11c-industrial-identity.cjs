/* GFX11C: in-engine industrial identity visual QA (not human 7/10 acceptance).
 * Two same-camera A/B screenshots, 3 quality profiles, 6 sites, no collider change.
 * Software WebGL is NOT native GPU/VRAM benchmarking. */
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
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
   waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Gfx11cBuildIndustryIdentities==='function'&&
   typeof h4Gfx11cUpdateIndustryDetail==='function',null,{timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const native=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:native(cb);
  });
  const sample=async({progress,laneX=0,laneY,phase=3})=>page.evaluate(v=>{
   state.paused=true;state.routeProgress=v.progress;
   state.laneX=v.laneX;state.laneY=v.laneY;state.map4Phase=v.phase;
   const f=getRaceFrameAtDistance(v.progress);
   state.pos.copy(f.center).addScaledVector(f.right,v.laneX).addScaledVector(f.up,v.laneY);
   const q=new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
   playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
   camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
   camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
   updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
   renderer.render(scene,camera);
  },{progress,laneX,laneY,phase});
  const fixed=await page.evaluate(()=>({
   racers:racers.length,hunters:hunterTargets.length,
   canyon:h4CanyonColliders.length,industry:h4IndustrialColliders.length,
   buildings:planetaryBuildingColliders.length,
   overall:MAP4_RACE_RULES.realTimeLimit,arena:MAP4_PHASES.arenaSeconds,
   orbit:MAP4_PHASES.orbitAltitude,score:state.score,shots:state.hunterShots
  }));
  assert.deepEqual({racers:fixed.racers,hunters:fixed.hunters,
   canyon:fixed.canyon,industry:fixed.industry,overall:fixed.overall,
   arena:fixed.arena,orbit:fixed.orbit},
   {racers:5,hunters:8,canyon:6,industry:36,overall:300,arena:60,orbit:850});
  const init=await page.evaluate(()=>{
   const art=planetaryWorldRegions[2].getObjectByName('MAP4_GFX11C_SIX_FACTORY_IDENTITIES');
   const hero=art?.getObjectByName('MAP4_GFX11C_HERO_SILHOUETTES');
   const detail=art?.getObjectByName('MAP4_GFX11C_FACTORY_FINE_DETAIL');
   return {stats:{...h4Gfx11cIndustrialStats},art:Boolean(art),
    heroes:hero?.children.length,details:detail?.children.length,
    names:[...hero.children,...detail.children].map(x=>x.name),
    allVisualOnly:[...hero.children,...detail.children].every(x=>
     x.isInstancedMesh&&x.userData.visualOnly&&x.userData.h4Gfx11cIdentity),
    collisionIds:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length]};
  });
  assert.equal(init.art,true,'six factory identities exist');
  assert.equal(init.stats.stations,6);
  assert.equal(init.stats.heroBatches,5);
  assert.equal(init.stats.detailBatches,3);
  assert.equal(init.stats.instances,72);
  assert.equal(init.stats.newColliders,0);
  assert.equal(init.allVisualOnly,true);
  assert.equal(init.heroes,5);assert.equal(init.details,3);
  const cases=[];
  for(const c of [
   {name:'07-entry',progress:17200,laneY:260},
   {name:'08-factory',progress:23800,laneY:350},
   {name:'09-exit',progress:31600,laneY:450}
  ]){
   await sample(c);
   const old=await page.evaluate(()=>{
    const g=planetaryWorldRegions[2].getObjectByName('MAP4_GFX11C_SIX_FACTORY_IDENTITIES');
    g.visible=false;renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
   });
   const before=await page.screenshot({path:path.join(__dirname,
    'map4-gfx11c-'+c.name+'-before.png')});
   const improved=await page.evaluate(()=>{
    const g=planetaryWorldRegions[2].getObjectByName('MAP4_GFX11C_SIX_FACTORY_IDENTITIES');
    g.visible=true;renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
     visible:g.visible,station6PillarFade:h4Gfx11bCameraMask.active,
     signatureRoot:planetaryWorldRegions[2].userData.gfx04IndustrialVisuals.visible,
     colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length]};
   });
   const after=await page.screenshot({path:path.join(__dirname,
    'map4-gfx11c-'+c.name+'-after.png')});
   assert.equal(improved.visible,true);
   assert.equal(improved.signatureRoot,true,'industry is visible only during phase3');
   assert.deepEqual(improved.colliders,[fixed.canyon,fixed.industry,fixed.buildings]);
   assert(improved.calls>old.calls,'industrial hero models not rendered: '+c.name);
   assert(improved.calls<=old.calls+8,'unexpected rendering overhead: '+c.name);
   assert(improved.triangles>old.triangles+2000,'silhouette geometry not rendered: '+c.name);
   // GFX11C fixes 07/08 art quality. At 09 the six facility
   // signatures may be behind/off-camera: preserve the already-fixed
   // GFX11B pillar instead of demanding false art pixel differences.
   if(c.name!=='09-exit')
    assert(!before.equals(after),
     'GFX11C targeted industry art not visible: '+c.name);
   if(c.name==='09-exit')assert.equal(improved.station6PillarFade,true);
   cases.push({name:c.name,old,improved,
    screenshotChanged:!before.equals(after)});
  }
  // LOD profile must retain recognizable site shapes on LOW, but disable
  // 3 detail batches; this is an explicit quality/performance contract.
  await sample({progress:23800,laneY:350});
  const quality=[];
  for(const profile of ['HIGH','BALANCED','LOW']){
   const data=await page.evaluate(profile=>{
    h4Gfx10SetProfile(profile);updatePlanetaryWorld();renderer.render(scene,camera);
    const g=planetaryWorldRegions[2].getObjectByName('MAP4_GFX11C_SIX_FACTORY_IDENTITIES');
    return {preset:h4Gfx10ProfileName,
     hero:g.getObjectByName('MAP4_GFX11C_HERO_SILHOUETTES').visible,
     detail:g.getObjectByName('MAP4_GFX11C_FACTORY_FINE_DETAIL').visible,
     calls:renderer.info.render.calls};
   },profile);
   assert.equal(data.preset,profile);assert.equal(data.hero,true);
   assert.equal(data.detail,profile!=='LOW');
   quality.push(data);
  }
  await page.evaluate(()=>h4Gfx10SetProfile('HIGH'));
  // Arena warfront palette is varied with no additional mesh/draw calls.
  await sample({progress:13200,laneX:-1150,laneY:200,phase:2});
  const arena=await page.evaluate(()=>{
   const g=planetaryWorldRegions[1].getObjectByName('MAP4_GFX11B_ARENA_SKYLINE');
   const colors=g.children.map(x=>({
    name:x.name,instanceCount:x.count,colors:Boolean(x.instanceColor),
    first:x.getColorAt&&x.instanceColor?
      Array.from({length:Math.min(3,x.count)},(_,i)=>{
       const color=new THREE.Color();x.getColorAt(i,color);return color.getHex();
      }):[]
   }));
   return {arenaVisible:g.visible,industryHidden:
    !planetaryWorldRegions[2].userData.gfx04IndustrialVisuals.visible,
    colors};
  });
  assert.equal(arena.arenaVisible,true);
  assert.equal(arena.industryHidden,true);
  assert(arena.colors.every(x=>x.colors&&new Set(x.first).size>=2),
   'arena worn instance colors are not distinct');
  const final=await page.evaluate(()=>({
   racers:racers.length,hunters:hunterTargets.length,
   canyon:h4CanyonColliders.length,industry:h4IndustrialColliders.length,
   buildings:planetaryBuildingColliders.length,
   overall:MAP4_RACE_RULES.realTimeLimit,arena:MAP4_PHASES.arenaSeconds,
   orbit:MAP4_PHASES.orbitAltitude,score:state.score,shots:state.hunterShots
  }));
  assert.deepEqual(final,fixed,'any gameplay/physics changes');
  assert.equal(errors.length,0,'runtime page errors: '+errors.join('|'));
  console.log('GFX11C INDUSTRIAL IDENTITY PASS',
   JSON.stringify({init,cases,quality,arena,gameSignatureUnchanged:true,
    nativeGpuVerified:false,humanVisualApproval:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
