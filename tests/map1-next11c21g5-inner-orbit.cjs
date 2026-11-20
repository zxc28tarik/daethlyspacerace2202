/* NEXT11C21G5 — corrected once-upright inner energy ring color and angle.
 * Browser-native Three r128 WebGL, previous/new side-by-side, Map1 gameplay.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21g5-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Array.isArray(itemBoxes)&&itemBoxes.length===49,
   null,{timeout:30000});
  const shape=await page.evaluate(()=>{
   const shared=itemBoxes.map(b=>{
    const arr=[];b.art.traverse(o=>{if(o.isMesh)arr.push(o);});
    return {ringCount:b.orbits.length,
     children:arr.length,noMetal:arr.every(o=>
      o.material.metalness===undefined||o.material.metalness===0),
     noCage:arr.every(o=>!/cage|frame|metal|box/i.test(o.name)),
     collision:b.radius,ringColor:b.orbits[2].material.color.getHex(),
     ringOpacity:b.orbits[2].material.opacity};
   });
   const b=itemBoxes[0],inner=b.orbits[2],stateTime=state.raceTime;
   let lowestFacing=1,maxPitch=0,maxYaw=0,travel=0;
   const history=[];
   for(const secs of [0,3,9,21,42,90,180,300]){
    state.raceTime=secs;
    animateItemBoxes(.016);
    // The XY-plane torus faces the camera along local Z. With Euler
    // XYZ, the normal's Z component is cos(pitch)*cos(yaw).
    const facing=Math.abs(Math.cos(inner.rotation.x)*Math.cos(inner.rotation.y));
    lowestFacing=Math.min(lowestFacing,facing);
    maxPitch=Math.max(maxPitch,Math.abs(inner.rotation.x));
    maxYaw=Math.max(maxYaw,Math.abs(inner.rotation.y));
    history.push({time:secs,pitch:inner.rotation.x,yaw:inner.rotation.y,
     roll:inner.rotation.z,facing});
   }
   state.raceTime=stateTime;
   // Restore initial art pitch, consistent with screenshot and game start.
   inner.rotation.set(.72,-.32,-.25);
   const first=itemBoxes[0],last=itemBoxes[48];
   return {count:shared.length,
    fiveMeshes:shared.every(x=>x.children===5),
    threeRings:shared.every(x=>x.ringCount===3),
    noMetal:shared.every(x=>x.noMetal&&x.noCage),
    originalHitRadius:shared.every(x=>x.collision===49),
    oldInnerColor:0x6b90d6,newInnerColor:inner.material.color.getHex(),
    innerOpacity:inner.material.opacity,
    geometryShared:inner.geometry===last.orbits[2].geometry,
    materialShared:inner.material===last.orbits[2].material,
    ringSizes:b.orbits.map(o=>o.geometry.parameters.radius),
    initialRotation:[inner.rotation.x,inner.rotation.y,inner.rotation.z],
    lowestFacing,maxPitch,maxYaw,history};
  });
  assert.equal(shape.count,49);
  assert(shape.fiveMeshes&&shape.threeRings&&shape.noMetal&&shape.originalHitRadius);
  assert(shape.materialShared&&shape.geometryShared);
  assert.deepEqual(shape.ringSizes,[24,28,19]);
  assert.equal(shape.newInnerColor,0xa17bcb);
  assert.equal(shape.innerOpacity,.20);
  assert(shape.lowestFacing>=.56,'inner ring must never become edge-on');
  assert(shape.maxPitch<=.85&&shape.maxYaw<=.42);
  const studio=await page.evaluate(()=>{
   const displayScene=new THREE.Scene();displayScene.background=new THREE.Color(0x091021);
   displayScene.add(new THREE.HemisphereLight(0xd1e5ff,0x15142a,1.35));
   const light=new THREE.DirectionalLight(0xffffff,2);
   light.position.set(30,45,90);displayScene.add(light);
   const fill=new THREE.DirectionalLight(0x829bff,.6);
   fill.position.set(-35,12,-60);displayScene.add(fill);
   const old=itemBoxes[0].art.clone(true);
   const revised=itemBoxes[0].art.clone(true);
   old.position.set(-48,0,0);revised.position.set(48,0,0);
   const oldInner=old.getObjectByName('MAP1_REWARD_PICKUP_ORBIT_INNER');
   oldInner.material=oldInner.material.clone();
   oldInner.material.color.setHex(0x6b90d6);
   oldInner.rotation.set(.24,1.14,-.62);
   const newInner=revised.getObjectByName('MAP1_REWARD_PICKUP_ORBIT_INNER');
   newInner.rotation.set(.72,-.32,-.25);
   displayScene.add(old,revised);
   const studioCamera=new THREE.PerspectiveCamera(32,1600/900,.1,500);
   studioCamera.position.set(0,18,185);studioCamera.lookAt(0,0,0);
   renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
   renderer.render(displayScene,studioCamera);
   const gl=renderer.getContext();gl.finish();
   const glError=gl.getError(),calls=renderer.info.render.calls,aa=!!gl.getContextAttributes().antialias;
   const width=1600,height=900,row=width*4,raw=new Uint8Array(width*height*4);
   gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const rgba=new Uint8ClampedArray(raw.length);
   for(let y=0;y<height;y++)
    rgba.set(raw.subarray(y*row,(height-1-y)*row),(height-1-y)*row);
   // Re-read correct bottom-up orientation for every row.
   for(let y=0;y<height;y++)
    rgba.set(raw.subarray(y*row,(y+1)*row),(height-1-y)*row);
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   canvas.getContext('2d').putImageData(new ImageData(rgba,width,height),0,0);
   return {drawCalls:calls,aa,glError,
    oldColor:oldInner.material.color.getHex(),newColor:newInner.material.color.getHex(),
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert.equal(studio.drawCalls,10,'5 prior meshes + 5 updated meshes');
  assert(studio.aa&&studio.glError===0);
  assert.equal(studio.oldColor,0x6b90d6);
  assert.equal(studio.newColor,0xa17bcb);
  fs.writeFileSync(path.join(out,'upright-blue-vs-angled-violet-1600x900.png'),
   Buffer.from(studio.png,'base64'));delete studio.png;
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&
   state.activeMap===MAP_MODES.MAP1&&state.raceTime>2,
   null,{timeout:25000});
  const race=await page.evaluate(()=>{
   state.paused=true;
   const b=itemBoxes[0],savedP=b.mesh.position.clone(),savedQ=b.mesh.quaternion.clone();
   const destination=makeCourseLocalGroup(state.routeProgress+185,
    state.laneX+45,state.laneY+20);
   b.mesh.position.copy(destination.position);b.mesh.quaternion.copy(destination.quaternion);
   renderer.render(scene,camera);
   const gl=renderer.getContext();gl.finish();
   const err=gl.getError(),calls=renderer.info.render.calls,aa=!!gl.getContextAttributes().antialias;
   const width=1600,height=900,row=width*4,raw=new Uint8Array(width*height*4);
   gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const rgba=new Uint8ClampedArray(raw.length);
   for(let y=0;y<height;y++)
    rgba.set(raw.subarray(y*row,(y+1)*row),(height-1-y)*row);
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   canvas.getContext('2d').putImageData(new ImageData(rgba,width,height),0,0);
   b.mesh.position.copy(savedP);b.mesh.quaternion.copy(savedQ);
   return {glError:err,drawCalls:calls,aa,
    playerParts:h4Ship19Race.userData.parts,
    restored:b.mesh.position.distanceTo(savedP)<1e-5,
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert.equal(race.glError,0);assert(race.aa&&race.restored);
  assert.equal(race.playerParts,189);
  fs.writeFileSync(path.join(out,'game-camera-angled-violet-ring-1600x900.png'),
   Buffer.from(race.png,'base64'));delete race.png;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {mode:state.activeMap,combatShip:h4Ship19Combat.userData.parts,
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],glError:renderer.getContext().getError()};
  });
  assert.equal(map4.mode,'map4');assert.equal(map4.combatShip,249);
  assert.deepEqual(map4.colliders,[6,36,200]);assert.equal(map4.glError,0);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'inner-orbit-audit.json'),JSON.stringify({
   pass:true,revision:'NEXT11C21G5',shape,studio,race,map4,errors,
   captureNote:'Old tilted blue reference is recreated in test from original C21G4 Euler angles. Gameplay QA stages one collectible 185m ahead for visibility, restoring transform and retaining collider/loot state.'
  },null,2));
  console.log('NEXT11C21G5 INNER ORBIT WEBGL PASS '+JSON.stringify({
   items:shape.count,innerColor:shape.newInnerColor,
   minFacing:shape.lowestFacing,drawCalls:studio.drawCalls,map4,errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});