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
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Next22gLook==='object',null,{timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,
   null,{timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const native=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:native(cb);
  });
  const render=async(progress,side,phase,enabled)=>page.evaluate(v=>{
   h4Next22gLook.enabled=v.enabled;
   state.paused=true;state.routeProgress=v.progress;
   state.laneX=v.side;state.laneY=195;state.map4Phase=v.phase;
   const f=getRaceFrameAtDistance(v.progress);
   state.pos.copy(f.center).addScaledVector(f.right,v.side).addScaledVector(f.up,195);
   const q=new THREE.Quaternion().setFromRotationMatrix(
    new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
   playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
   camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
   camera.quaternion.copy(q);camera.fov=75;camera.updateProjectionMatrix();
   updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
   renderer.render(scene,camera);
   const mat=planetaryWorldRegions[1].getObjectByName(
    'MAP4_NEXT22E_CARRIER_SPINE_RIBS').material;
   return {weight:h4Next22gLook.lastWeight,
    fog:scene.fog.color.getHex(),density:scene.fog.density,
    ambient:ambientLight.color.getHex(),key:nebulaLight1.color.getHex(),
    rim:nebulaLight2.color.getHex(),exposure:renderer.toneMappingExposure,
    material:mat.name,sculpted:mat.flatShading,
    glError:renderer.getContext().getError(),
    renderCalls:renderer.info.render.calls,
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length]};
  },{progress,side,phase,enabled});
  const cases=[];
  for(const [label,progress,side,phase] of [
   ['arena-west',13170,-850,2],
   ['arena-east',13520,850,2],
   ['canyon',8500,-500,1],
   ['industrial',24000,450,3]
  ]){
   const before=await render(progress,side,phase,false);
   const beforePNG=await page.screenshot({path:path.join(__dirname,
    'map4-next22g-'+label+'-before.png')});
   const after=await render(progress,side,phase,true);
   const afterPNG=await page.screenshot({path:path.join(__dirname,
    'map4-next22g-'+label+'-after.png')});
   const changed=!beforePNG.equals(afterPNG);
   assert.equal(before.weight,0);
   assert.equal(after.glError,0);
   assert.deepEqual(before.colliders,after.colliders);
   assert.deepEqual(after.colliders,[6,36,200]);
   assert.equal(after.material,'MAP4_NEXT22G_WARFRONT_RIB_STEEL');
   assert.equal(after.sculpted,true);
   if(phase===2){
    assert(after.weight>.3,'arena grade inactive');
    assert(changed,'arena visual grade produced no actual image difference');
    assert.notEqual(before.key,after.key);
    assert.notEqual(before.rim,after.rim);
   } else {
    assert.equal(after.weight,0);
    assert.equal(after.fog,before.fog,'grade leaked fog into '+label);
    assert.equal(after.key,before.key,'grade leaked key light into '+label);
    assert.equal(after.rim,before.rim,'grade leaked rim light into '+label);
    assert.equal(after.exposure,before.exposure,'grade leaked exposure');
   }
   assert.equal(errors.length,0,errors.join(' | '));
   cases.push({label,weight:after.weight,changed,
    callsBefore:before.renderCalls,callsAfter:after.renderCalls});
  }
  console.log('NEXT22G 4-VIEW PHASE ISOLATION WEBGL PASS',JSON.stringify(cases));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
