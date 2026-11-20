/* NEXT11C21G4 — three soft rings on the approved minimal, no-metal crystal.
   Real native Chromium/WebGL gallery; independent ring animation/physics QA. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21g4-evidence');fs.mkdirSync(out,{recursive:true});
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
   const first=itemBoxes[0],last=itemBoxes[48];
   const each=itemBoxes.map(b=>{
    const m=[];b.art.traverse(x=>{if(x.isMesh)m.push(x)});
    return {rings:b.orbits.length,total:m.length,
     noMetal:m.every(x=>x.material.metalness===undefined||
      x.material.metalness===0),noFrame:m.every(x=>
       !/cage|frame|metal|box/i.test(x.name)),
     visualOnly:m.every(x=>x.userData.visualOnly&&x.userData.noCollider),
     colliderRadius:b.radius,geometryNames:m.map(x=>x.geometry.type)};
   });
   const o=first.orbits,old=o.map(r=>r.rotation.clone()),
    oldArtY=first.art.position.y;
   const time=state.raceTime;state.raceTime=1.38;animateItemBoxes(.5);
   state.raceTime=time;
   const motion=o.map((r,i)=>[r.rotation.x-old[i].x,
    r.rotation.y-old[i].y,r.rotation.z-old[i].z]);
   return {count:itemBoxes.length,
    fiveMeshes:each.every(x=>x.total===5),
    threeRings:each.every(x=>x.rings===3),
    noMetal:each.every(x=>x.noMetal),
    noFrame:each.every(x=>x.noFrame),
    visualOnly:each.every(x=>x.visualOnly),
    collisions:each.every(x=>x.colliderRadius===49),
    radii:o.map(r=>r.geometry.parameters.radius),
    tubes:o.map(r=>r.geometry.parameters.tube),
    opacity:o.map(r=>r.material.opacity),
    ringOrder:o.map(r=>r.name),
    sameGeometries:o.every((r,i)=>r.geometry===last.orbits[i].geometry),
    sameMaterials:o.every((r,i)=>r.material===last.orbits[i].material),
    baseStillIdentical:o[0]===first.orbit,
    noBox:each.every(x=>!x.geometryNames.includes('BoxGeometry')),
    motion,visualFloat:first.art.position.y-oldArtY,
    shipParts:h4Ship19Race.userData.parts};
  });
  assert.equal(shape.count,49);
  assert(shape.fiveMeshes&&shape.threeRings&&shape.noMetal&&shape.noFrame);
  assert(shape.visualOnly&&shape.collisions&&shape.sameGeometries);
  assert(shape.sameMaterials&&shape.baseStillIdentical&&shape.noBox);
  assert.deepEqual(shape.radii,[24,28,19]);
  assert(shape.tubes.every(x=>x<=.52));
  assert(shape.opacity[1]<shape.opacity[0]&&shape.opacity[2]<shape.opacity[0]);
  assert(shape.opacity.every(x=>x<=.3));
  assert(shape.motion.every(x=>x.some(v=>Math.abs(v)>.05)));
  assert(shape.motion[1][0]<0&&shape.motion[2][2]<0);
  assert(Math.abs(shape.visualFloat)>0);
  assert.equal(shape.shipParts,189);
  const studio=await page.evaluate(()=>{
   const scene2=new THREE.Scene();scene2.background=new THREE.Color(0x091021);
   scene2.add(new THREE.HemisphereLight(0xd1e5ff,0x15142a,1.35));
   const key=new THREE.DirectionalLight(0xffffff,2);
   key.position.set(30,45,90);scene2.add(key);
   const fill=new THREE.DirectionalLight(0x829bff,.6);
   fill.position.set(-35,12,-60);scene2.add(fill);
   const one=itemBoxes[0].art.clone(true);
   const triple=itemBoxes[0].art.clone(true);
   one.position.set(-48,0,0);triple.position.set(48,0,0);
   const extras=one.children.filter(x=>
    x.name==='MAP1_REWARD_PICKUP_ORBIT_OUTER'||
    x.name==='MAP1_REWARD_PICKUP_ORBIT_INNER');
   for(const x of extras)one.remove(x);
   scene2.add(one,triple);
   const camera2=new THREE.PerspectiveCamera(32,1600/900,.1,500);
   camera2.position.set(0,18,185);camera2.lookAt(0,0,0);
   renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
   renderer.render(scene2,camera2);
   const gl=renderer.getContext();gl.finish();
   const calls=renderer.info.render.calls,aa=!!gl.getContextAttributes().antialias;
   const glError=gl.getError(),w=1600,h=900,row=w*4,raw=new Uint8Array(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const rgba=new Uint8ClampedArray(raw.length);
   for(let y=0;y<h;y++)
    rgba.set(raw.subarray(y*row,(y+1)*row),(h-1-y)*row);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   return {calls,aa,glError,oneMeshes:3,tripleMeshes:5,
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert.equal(studio.calls,8,'3 meshes original + 5 meshes updated');
  assert(studio.aa&&studio.glError===0);
  fs.writeFileSync(path.join(out,'single-vs-triple-ring-1600x900.png'),
   Buffer.from(studio.png,'base64'));delete studio.png;
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&
   state.activeMap===MAP_MODES.MAP1&&state.raceTime>2,
   null,{timeout:25000});
  const game=await page.evaluate(()=>{
   state.paused=true;
   const b=itemBoxes[0],previous=b.mesh.position.clone(),
    previousRotation=b.mesh.quaternion.clone();
   const pos=makeCourseLocalGroup(state.routeProgress+185,
    state.laneX+45,state.laneY+20);
   b.mesh.position.copy(pos.position);b.mesh.quaternion.copy(pos.quaternion);
   renderer.render(scene,camera);
   const gl=renderer.getContext();gl.finish();
   const err=gl.getError(),calls=renderer.info.render.calls;
   const w=1600,h=900,row=w*4,raw=new Uint8Array(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const rgba=new Uint8ClampedArray(raw.length);
   for(let y=0;y<h;y++)
    rgba.set(raw.subarray(y*row,(y+1)*row),(h-1-y)*row);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   b.mesh.position.copy(previous);b.mesh.quaternion.copy(previousRotation);
   return {error:err,calls,restored:b.mesh.position.distanceTo(previous)<1e-5,
    playerModel:h4Ship19Race.userData.parts,
    aa:!!gl.getContextAttributes().antialias,
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert(game.restored&&game.aa&&game.error===0);
  assert.equal(game.playerModel,189);
  fs.writeFileSync(path.join(out,'actual-game-camera-triple-rings-1600x900.png'),
   Buffer.from(game.png,'base64'));delete game.png;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {mode:state.activeMap,ship:h4Ship19Combat.userData.parts,
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],error:renderer.getContext().getError()};
  });
  assert.equal(map4.mode,'map4');assert.equal(map4.ship,249);
  assert.deepEqual(map4.colliders,[6,36,200]);assert.equal(map4.error,0);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21G4',shape,studio,game,map4,errors,
   note:'Studio left is current one-ring reference, right actual three-ring art. In-game capture stages one visual pickup 185m ahead, restores its transform immediately. Original collision course untouched.'};
  fs.writeFileSync(path.join(out,'triple-orbit-webgl-report.json'),
   JSON.stringify(report,null,2));
  console.log('NEXT11C21G4 TRIPLE ORBIT WEBGL PASS '+JSON.stringify({
   count:shape.count,rings:shape.radii,opacity:shape.opacity,
   newMeshes:5,studioCalls:studio.calls,map4,error:errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});