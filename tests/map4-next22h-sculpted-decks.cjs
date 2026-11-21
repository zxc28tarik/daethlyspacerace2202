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
 const page=await browser.newPage({viewport:{width:1440,height:810},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
   waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Next22hFracturedDeckGeometry==='function',
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
   const group=planetaryWorldRegions[1].getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
   const deck=group.getObjectByName('MAP4_NEXT22E_SHATTERED_SERVICE_DECKS');
   const rib=group.getObjectByName('MAP4_NEXT22E_CARRIER_SPINE_RIBS');
   const extrude=deck.geometry;
   const dims=new THREE.Box3().setFromBufferAttribute(extrude.attributes.position);
   return {instances:group.children.reduce((sum,c)=>sum+c.count,0),
    batches:group.children.length,
    deck:extrude.type,deckVertices:extrude.attributes.position.count,
    holeCount:extrude.parameters?.shapes?.holes?.length,
    width:dims.max.x-dims.min.x,
    depth:dims.max.z-dims.min.z,
    thickness:dims.max.y-dims.min.y,
    material:deck.material.name,
    rib:rib.geometry.type,
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length],
    racers:racers.length,hunters:hunterTargets.length};
  });
  assert.equal(init.instances,112);
  assert.equal(init.batches,5);
  assert.equal(init.deck,'ExtrudeGeometry');
  assert.equal(init.holeCount,1);
  assert(init.deckVertices>70,'deck has genuine topology');
  assert(init.width>0.85&&init.depth>0.80&&init.thickness<.18,
   'deck must be a broad horizontal shape with a pierced interior');
  assert.equal(init.material,'MAP4_NEXT22H_FRACTURED_SERVICE_METAL');
  assert.equal(init.rib,'ExtrudeGeometry');
  assert.deepEqual(init.colliders,[6,36,200]);
  assert.equal(init.racers,5);assert.equal(init.hunters,8);
  const frames=[];
  for(const [label,progress,side] of [
   ['center',12600,0],['wreck',12750,-1150],['defense',13000,1150]]){
   const setup=await page.evaluate(({progress,side})=>{
    state.paused=true;state.routeProgress=progress;
    state.laneX=side;state.laneY=190;state.map4Phase=2;
    const f=getRaceFrameAtDistance(progress);
    state.pos.copy(f.center).addScaledVector(f.right,side).addScaledVector(f.up,190);
    const q=new THREE.Quaternion().setFromRotationMatrix(
     new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
    camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
    camera.quaternion.copy(q);camera.fov=75;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
    const g=planetaryWorldRegions[1].getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
    g.visible=false;renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,visible:planetaryWorldRegions[1].visible};
   },{progress,side});
   const before=await page.screenshot({path:path.join(__dirname,
    'map4-next22h-'+label+'-before.png')});
   const after=await page.evaluate(()=>{
    const g=planetaryWorldRegions[1].getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
    g.visible=true;renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,glError:renderer.getContext().getError(),
     colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length]};
   });
   const image=await page.screenshot({path:path.join(__dirname,
    'map4-next22h-'+label+'-after.png')});
   assert.equal(setup.visible,true,'arena group invisible '+label);
   assert.deepEqual(after.colliders,init.colliders);
   assert.equal(after.glError,0);
   assert(after.calls>=setup.calls&&after.calls<=setup.calls+5,
    'unexpected rendering budget '+label);
   frames.push({label,changed:!before.equals(image),oldCalls:setup.calls,
    newCalls:after.calls});
  }
  assert(frames.some(f=>f.changed),'No warfront art visible from tested viewpoints');
  assert.equal(errors.length,0,errors.join(' | '));
  console.log('NEXT22H THREE-POCKET WEBGL PASS',JSON.stringify({init,frames}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
