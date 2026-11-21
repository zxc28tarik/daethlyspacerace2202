'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1440,height:810},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
   waitUntil:'domcontentloaded',timeout:30000
  });
  await page.waitForFunction(()=>typeof h4Next22fBrokenRibGeometry==='function',
   null,{timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const native=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:native(cb);
  });
  const init=await page.evaluate(()=>{
   const zone=planetaryWorldRegions[1];
   const root=zone.getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
   const g=root?.getObjectByName('MAP4_NEXT22E_CARRIER_SPINE_RIBS');
   return {exists:Boolean(root),batches:root?.children.length,
    count:root?.children.map(x=>x.count),
    geometryIsExtrusion:g?.geometry.type==='ExtrudeGeometry',
    vertices:g?.geometry.attributes.position.count,
    noColliders:root?.children.every(x=>x.userData.noCollider&&
     x.userData.visualOnly&&!x.userData.h4Collider),
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],racers:racers.length,
    hunters:hunterTargets.length};
  });
  assert.equal(init.exists,true);
  assert.equal(init.batches,5);
  assert.deepEqual(init.count,[28,24,18,24,18]);
  assert.equal(init.geometryIsExtrusion,true);
  assert(init.vertices>60,'Rib must be a genuine sculpted 3D arch');
  assert.equal(init.noColliders,true);
  const frames=[];
  for(const [tag,progress,side] of [['west',12600,-850],['east',12640,850]]){
   const result=await page.evaluate(({progress,side})=>{
    state.paused=true;state.routeProgress=progress;
    state.laneX=side;state.laneY=170;state.map4Phase=2;
    const f=getRaceFrameAtDistance(progress);
    state.pos.copy(f.center).addScaledVector(f.right,side)
     .addScaledVector(f.up,170);
    const q=new THREE.Quaternion().setFromRotationMatrix(
     new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
    camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
    camera.quaternion.copy(q);camera.fov=75;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
    const root=planetaryWorldRegions[1].getObjectByName(
     'MAP4_NEXT22E_WARFRONT_COMPOSITION');
    const before=[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length];
    root.visible=false;renderer.render(scene,camera);
    const oldCalls=renderer.info.render.calls;
    return {oldCalls,rootVisible:root.visible,before,zoneVisible:planetaryWorldRegions[1].visible};
   },{progress,side});
   const before=await page.screenshot({path:path.join(__dirname,
    'map4-next22f-'+tag+'-before.png')});
   const afterStats=await page.evaluate(()=>{
    const root=planetaryWorldRegions[1].getObjectByName(
     'MAP4_NEXT22E_WARFRONT_COMPOSITION');
    root.visible=true;
    renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     after:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length],glError:renderer.getContext().getError()};
   });
   const after=await page.screenshot({path:path.join(__dirname,
    'map4-next22f-'+tag+'-after.png')});
   assert.equal(result.zoneVisible,true,'arena zone not visible');
   assert.deepEqual(result.before,init.colliders);
   assert.deepEqual(afterStats.after,init.colliders);
   assert.equal(afterStats.glError,0);
   assert(afterStats.calls>result.oldCalls,'new warfront invisible '+tag);
   assert(afterStats.calls<=result.oldCalls+5,'excess draw calls '+tag);
   frames.push({tag,changed:!before.equals(after),oldCalls:result.oldCalls,
    improvedCalls:afterStats.calls,triangles:afterStats.triangles});
  }
  assert(frames.every(f=>f.changed),
   'No A/B screenshot change in one or more actual arena viewpoints');
  assert.equal(errors.length,0,errors.join(' | '));
  console.log('NEXT22F TWO-VIEW WEBGL A/B PASS',JSON.stringify({init,frames}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
