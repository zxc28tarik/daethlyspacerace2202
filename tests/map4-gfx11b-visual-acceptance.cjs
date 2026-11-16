/* NEXT11B in-engine visual regression proof.
 * Stage 2 retains hidden future factories; four instanced, collider-free
 * warfront silhouettes visibly populate arena. Stage 3 camera-near solid
 * support fades WITHOUT changing its mesh, collider or physics volume. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try{
const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{waitUntil:'domcontentloaded',timeout:30000});
await page.waitForFunction(()=>typeof h4Gfx11bUpdateCameraMask==='function'&&
 typeof h4Gfx11bBuildArenaSkyline==='function',null,{timeout:18000});
await page.locator('#map-choice-4').click();await page.locator('#start-btn').click();
await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:20000});
await page.evaluate(()=>{state.paused=true;
 const native=window.requestAnimationFrame.bind(window);
 window.requestAnimationFrame=callback=>callback&&callback.name==='animate'?0:native(callback);
});
const setup=async sc=>page.evaluate(sc=>{
 state.paused=true;state.routeProgress=sc.progress;
 state.laneX=sc.laneX;state.laneY=sc.laneY;state.map4Phase=sc.phase;
 const frame=getRaceFrameAtDistance(sc.progress);
 state.pos.copy(frame.center).addScaledVector(frame.right,sc.laneX)
   .addScaledVector(frame.up,sc.laneY);
 const q=new THREE.Quaternion().setFromRotationMatrix(
   new THREE.Matrix4().makeBasis(frame.right,frame.up,frame.tangent.clone().negate()));
 playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
 camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
 camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
 updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
 renderer.render(scene,camera);
},sc);
const signature=()=>page.evaluate(()=>({
 competitors:racers.length,hunters:hunterTargets.length,
 canyon:h4CanyonColliders.length,industrial:h4IndustrialColliders.length,
 authoredBuildingColliders:planetaryBuildingColliders.length,
 deadline:MAP4_RACE_RULES.realTimeLimit,arena:MAP4_PHASES.arenaSeconds,
 orbit:MAP4_PHASES.orbitAltitude,score:state.score,
 hunterShots:state.hunterShots}));
const fixed=await signature();
assert.deepEqual({canyon:fixed.canyon,industrial:fixed.industrial,deadline:fixed.deadline,
 arena:fixed.arena,orbit:fixed.orbit,competitors:fixed.competitors,hunters:fixed.hunters},
 {canyon:6,industrial:36,deadline:300,arena:60,orbit:850,competitors:5,hunters:8});
assert(fixed.authoredBuildingColliders>=190);
const gallery=[];
for(const sc of [
 {name:'arena-center',progress:13000,laneX:0,laneY:90,phase:2},
 {name:'arena-wreck',progress:13200,laneX:-1150,laneY:200,phase:2},
 {name:'arena-defense',progress:13400,laneX:1140,laneY:250,phase:2}
]){
 await setup(sc);
 const off=await page.evaluate(()=>{
  const group=planetaryWorldRegions[1].getObjectByName('MAP4_GFX11B_ARENA_SKYLINE');
  assertPresent=Boolean(group);
  if(!group)throw new Error('missing warfront batch');
  group.visible=false;
  renderer.render(scene,camera);
  return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
 });
 const before=await page.screenshot({path:path.join(__dirname,'map4-gfx11b-'+sc.name+'-before.png')});
 const on=await page.evaluate(()=>{
  const group=planetaryWorldRegions[1].getObjectByName('MAP4_GFX11B_ARENA_SKYLINE');
  group.visible=true;
  renderer.render(scene,camera);
  return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
    batches:group.children.length,instances:group.children.reduce((n,x)=>n+x.count,0),
    metadata:group.children.every(x=>x.userData.visualOnly&&
     x.userData.h4Gfx11bArenaVisualOnly && x.isInstancedMesh),
    futureFactoryHidden:planetaryWorldRegions[2].userData.gfx04IndustrialVisuals.visible===false,
    groundVisible:planetaryWorldRegions[1].children[0].visible,
    collisions:[h4CanyonColliders.length,h4IndustrialColliders.length,planetaryBuildingColliders.length]};
 });
 const after=await page.screenshot({path:path.join(__dirname,'map4-gfx11b-'+sc.name+'-after.png')});
 assert.equal(on.batches,4,'four shared GPU warfront batches');
 assert.equal(on.instances,74,'74 visual only instances');
 assert.equal(on.metadata,true,'every new instance is non-physical');
 assert.equal(on.futureFactoryHidden,true,'future refinery stays invisible in arena');
 assert.equal(on.groundVisible,true,'continuous ground remains visible');
 assert.deepEqual(on.collisions,[fixed.canyon,fixed.industrial,fixed.authoredBuildingColliders]);
 assert(on.calls>=off.calls+3,'warfront batches actually render '+sc.name);
 assert(on.triangles>off.triangles+300,'warfront geometry actually rendered '+sc.name);
 assert(!before.equals(after),'arena image must visibly change '+sc.name);
 gallery.push({name:sc.name,off,on,screenshotChanged:!before.equals(after)});
}
// The blocker is a physically solid, preexisting support, NEVER deleted.
await setup({progress:31600,laneX:0,laneY:450,phase:3});
const pillar=await page.evaluate(()=>{
 const mask=h4Gfx11bCameraMask;
 const collider=mask.mesh.userData.h4Collider;
 return {near:mask.bounds.distanceToPoint(camera.position),
  fadeActive:mask.active,fadeMaterial:mask.mesh.material===mask.faded,
  colliderPreserved:planetaryBuildingColliders.includes(collider),
  collider:{progress:collider?.progress,side:collider?.side,altitude:collider?.altitude,
   halfSide:collider?.halfSide,halfUp:collider?.halfUp,halfDepth:collider?.halfDepth},
  color:mask.mesh.material.color.getHex(),opacity:mask.mesh.material.opacity};
});
assert(pillar.near<100,'camera is actually near the sixth solid pillar');
assert.equal(pillar.fadeActive,true);
assert.equal(pillar.fadeMaterial,true);
assert.equal(pillar.colliderPreserved,true);
assert.equal(pillar.collider.progress,31590);
assert.equal(pillar.collider.side,0);
assert.equal(pillar.collider.altitude,280);
const flat=await page.evaluate(()=>{
 const mask=h4Gfx11bCameraMask;
 mask.mesh.material=mask.original;
 renderer.render(scene,camera);
 return {opacity:mask.mesh.material.opacity};
});
const opaqueImage=await page.screenshot({path:path.join(__dirname,'map4-gfx11b-industrial-exit-opaque.png')});
await page.evaluate(()=>{const mask=h4Gfx11bCameraMask;
 mask.mesh.material=mask.faded;renderer.render(scene,camera);});
const readableImage=await page.screenshot({path:path.join(__dirname,'map4-gfx11b-industrial-exit-readable.png')});
assert(!opaqueImage.equals(readableImage),'camera occluder fade must change actual pixels');
const restored=await page.evaluate(()=>{
 const mask=h4Gfx11bCameraMask;
 camera.position.add(new THREE.Vector3(500,500,500));
 h4Gfx11bUpdateCameraMask();
 return {hidden:mask.active,original:mask.mesh.material===mask.original,
  near:mask.bounds.distanceToPoint(camera.position)};
});
assert.equal(restored.hidden,false,'fade disabled far from pillar');
assert.equal(restored.original,true,'original PBR material restored');
assert.deepEqual(await signature(),fixed,'visual corrections changed physics/AI/deadlines');
assert.equal(errors.length,0,'page errors: '+errors.join(' / '));
console.log('GFX11B VISUAL ACCEPTANCE PASS',JSON.stringify({
 gallery,pillar,restored,unmodifiedGameSignature:fixed,
 hasHumanApproval:false,realGpuVerified:false
}));
}finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
