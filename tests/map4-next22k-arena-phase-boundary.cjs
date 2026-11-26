'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 const page=await browser.newPage({viewport:{width:1600,height:900}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Next22kPhaseVisibility==='object',
   null,{timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const native=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:native(cb);
  });
  const stages=[
   {tag:'early-canyon',progress:10500,phase:1,visible:false},
   {tag:'approach',progress:12050,phase:1,visible:true},
   {tag:'arena-center',progress:12800,phase:2,visible:true},
   {tag:'arena-defense',progress:13500,phase:2,visible:true},
   {tag:'industry-entry',progress:14040,phase:3,visible:false},
   {tag:'industry-nearby',progress:16000,phase:3,visible:false},
   {tag:'industry-deep',progress:24000,phase:3,visible:false}
  ];
  const results=[];
  for(const c of stages){
   const x=await page.evaluate(c=>{
    state.paused=true;state.routeProgress=c.progress;
    state.map4Phase=c.phase;state.laneX=0;state.laneY=185;
    state.cameraMode='CHASE';state.yaw=state.pitch=state.roll=0;
    const f=getRaceFrameAtDistance(c.progress);
    state.pos.copy(f.center).addScaledVector(f.up,185);
    const q=new THREE.Quaternion().setFromRotationMatrix(
     new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
    camera.position.copy(state.pos).add(
     new THREE.Vector3(-1.65,5.5,18.5).applyQuaternion(q));
    camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
    renderer.render(scene,camera);
    const skyline=planetaryWorldRegions[1].getObjectByName(
     'MAP4_GFX11B_ARENA_SKYLINE');
    const wreck=planetaryWorldRegions[1].getObjectByName(
     'MAP4_NEXT22E_WARFRONT_COMPOSITION');
    return {visibleSkyline:skyline.visible,visibleWreck:wreck.visible,
     sameLifecycle:skyline.visible===wreck.visible,
     actualArenaRegionVisible:planetaryWorldRegions[1].visible,
     instancesSkyline:skyline.children.reduce((n,x)=>n+x.count,0),
     instancesWreck:wreck.children.reduce((n,x)=>n+x.count,0),
     updates:h4Next22kPhaseVisibility.updates,
     culled:h4Next22kPhaseVisibility.culledOutsideArena,
     lastVisible:h4Next22kPhaseVisibility.lastVisible,
     renderCalls:renderer.info.render.calls,
     colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length],error:renderer.getContext().getError()};
   },c);
   assert.equal(x.visibleSkyline,c.visible,c.tag+' skyline phase regression');
   assert.equal(x.visibleWreck,c.visible,c.tag+' 112 wreck instances leaked');
   assert.equal(x.lastVisible,c.visible);
   assert(x.sameLifecycle);
   assert.equal(x.instancesSkyline,74);
   assert.equal(x.instancesWreck,112);
   assert.equal(x.error,0);
   assert.deepEqual(x.colliders,[6,36,200]);
   // Crucial boundary: region still rendered, but BOTH arena groups culled.
   if(c.tag==='industry-entry'||c.tag==='industry-nearby')
    assert.equal(x.actualArenaRegionVisible,true,
     'test must prove hide independent from region visibility');
   results.push({stage:c.tag,visible:x.visibleWreck,regionVisible:x.actualArenaRegionVisible,
    calls:x.renderCalls});
   if(c.tag==='arena-center'||c.tag==='industry-entry'){
    const before=await page.evaluate(()=>{
     h4Next22kArenaWreckGroup.visible=false;
     h4Gfx11bArenaSkylineGroup.visible=false;
     renderer.render(scene,camera);
     return renderer.info.render.calls;
    });
    const beforePng=await page.screenshot({path:path.join(__dirname,
     'map4-next22k-'+c.tag+'-before.png')});
    const after=await page.evaluate(c=>{
     h4Next22kArenaWreckGroup.visible=c.visible;
     h4Gfx11bArenaSkylineGroup.visible=c.visible;
     renderer.render(scene,camera);
     return renderer.info.render.calls;
    },c);
    const afterPng=await page.screenshot({path:path.join(__dirname,
     'map4-next22k-'+c.tag+'-after.png')});
    if(c.visible){
     assert(after>before,'visible arena art contributed no draw calls');
     assert(!beforePng.equals(afterPng),'visible art has no screen impact');
    }else{
     assert.equal(after,before,'industry art leaked into render');
     assert(beforePng.equals(afterPng),'industry render changed despite hidden art');
    }
   }
  }
  assert.equal(errors.length,0,errors.join(' | '));
  console.log('NEXT22K STAGE BOUNDARY AND TWO-ART-GROUP WEBGL PASS',
   JSON.stringify(results));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
