/* NEXT11B diagnostic: find exact arena visibility regression and identify
 * the industrial exit camera occluder in the actual WebGL scene.
 * This probes production geometry/camera without changing physics/AI. */
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
await page.waitForFunction(()=>typeof state==='object'&&typeof h4Gfx09SafeChase==='function',null,{timeout:15000});
await page.locator('#map-choice-4').click();await page.locator('#start-btn').click();
await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:25000});
await page.evaluate(()=>{state.paused=true;const normal=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:normal(cb)});
const data=[];
for(const scenario of [
 {name:'arena-center',phase:2,progress:13000,laneY:90},
 {name:'arena-wreck',phase:2,progress:13200,laneY:200},
 {name:'arena-defense',phase:2,progress:13400,laneY:250},
 {name:'industrial-exit',phase:3,progress:31600,laneY:450}
]){
 const obs=await page.evaluate(s=>{
  state.paused=true;state.routeProgress=s.progress;state.laneX=0;state.laneY=s.laneY;state.map4Phase=s.phase;
  const frame=getRaceFrameAtDistance(s.progress);
  state.pos.copy(frame.center).addScaledVector(frame.up,s.laneY);
  const q=new THREE.Quaternion().setFromRotationMatrix(
   new THREE.Matrix4().makeBasis(frame.right,frame.up,frame.tangent.clone().negate()));
  playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
  camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
  camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
  updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
  renderer.render(scene,camera);
  const industry=planetaryWorldRegions[2],models=industry.userData.gfx04IndustrialVisuals;
  const measure=()=>({calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
   regions:planetaryWorldRegions.map(z=>z.visible),industryGroupVisible:models.visible,
   industryChildren:models.children.length,rootVisible:planetaryWorldGroup.visible});
  const before=measure();
  if(s.phase===2){
   models.visible=true;renderer.render(scene,camera);
   const restored=measure();models.visible=false;
   return {name:s.name,phase:s.phase,progress:s.progress,before,restored,
     names:models.children.slice(0,20).map(x=>x.name),camera:camera.position.toArray()};
  }
  const ray=new THREE.Raycaster(),directions=[
   [0,0],[-.3,0],[.3,0],[0,-.3],[0,.3]];
  const rays=[];
  for(const [x,y] of directions){
   ray.setFromCamera(new THREE.Vector2(x,y),camera);
   rays.push({ndc:[x,y],hits:ray.intersectObject(planetaryWorldGroup,true)
    .filter(x=>x.object.isMesh)
    .slice(0,6).map(x=>({name:x.object.name,geom:x.object.geometry?.name,
     material:x.object.material?.name||'',distance:x.distance,
     parent:x.object.parent?.name,point:x.point.toArray()}))});
  }
  const near=[];
  scene.updateMatrixWorld(true);
  const testBox=new THREE.Box3();
  industry.traverse(x=>{
   if(!x.isMesh || !x.visible)return;
   let parentsVisible=true;for(let p=x.parent;p;p=p.parent)
    if(!p.visible)parentsVisible=false;
   if(!parentsVisible)return;
   testBox.setFromObject(x);
   const dist=testBox.distanceToPoint(camera.position);
   if(dist<600)near.push({name:x.name,geometry:x.geometry?.name,
    material:x.material?.name||'',parent:x.parent?.name,
    distance:Math.round(dist),contains:testBox.containsPoint(camera.position),
    center:testBox.getCenter(new THREE.Vector3()).toArray().map(y=>Math.round(y)),
    boxSize:testBox.getSize(new THREE.Vector3()).toArray().map(y=>Math.round(y))});
  });
  near.sort((a,b)=>a.distance-b.distance);
  return {name:s.name,phase:s.phase,progress:s.progress,before,
   camera:camera.position.toArray(),statePos:state.pos.toArray(),
   rays,near:near.slice(0,16),nearCount:near.length};
 },scenario);
 data.push(obs);
 console.log('GFX11B DIAG',JSON.stringify(obs));
 await page.screenshot({path:path.join(__dirname,'map4-gfx11b-'+scenario.name+'-before.png')});
 if(scenario.phase===2){
  const x=await page.evaluate(()=>{const grp=planetaryWorldRegions[2].userData.gfx04IndustrialVisuals;grp.visible=true;renderer.render(scene,camera);return renderer.info.render.calls;});
  await page.screenshot({path:path.join(__dirname,'map4-gfx11b-'+scenario.name+'-unhide.png')});
  await page.evaluate(()=>planetaryWorldRegions[2].userData.gfx04IndustrialVisuals.visible=false);
 }
}
assert.equal(data.length,4);assert.equal(errors.length,0,errors.join(' | '));
console.log('NEXT11B DIAGNOSTIC PASS',JSON.stringify({cases:data.length,errors:errors.length}));
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
