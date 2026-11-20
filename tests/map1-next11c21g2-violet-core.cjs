/* NEXT11C21G2 legacy visual acceptance, updated for the approved C21G3 removal of the metal cage. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21g2-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof startGame==='function'&&
   typeof itemBoxes!=='undefined'&&itemBoxes.length>40,null,{timeout:25000});
  const geometry=await page.evaluate(()=>{
   const first=itemBoxes[0],last=itemBoxes[itemBoxes.length-1];
   const all=itemBoxes.map(b=>{
    const meshes=[];b.art.traverse(x=>{if(x.isMesh)meshes.push(x);});
    return {id:b.id,radius:b.radius,amount:meshes.length,
     meshNames:meshes.map(x=>x.name),allVisual:meshes.every(x=>
      x.userData.visualOnly===true&&x.userData.noCollider===true),
     hasCubicGeometry:meshes.some(x=>x.geometry.type==='BoxGeometry'),
     collisionCentered:b.mesh.position.distanceTo(
      makeCourseLocalGroup(b.routeProgress,b.laneX,b.laneY).position)<1e-4
    };
   });
   const frame=first.spin,geom=frame.geometry;
   geom.computeBoundingSphere();
   return {amount:all.length,allSameCollider:all.every(x=>x.radius===49),
    allFiveMesh:all.every(x=>x.amount===5),
    noCage:all.every(x=>!x.meshNames.some(n=>n.includes('CAGE'))),
    noMetal:all.every(x=>!x.meshNames.some(n=>n.includes('METAL'))),
    zeroMetalness:all.every(x=>x.meshNames.length===5)&&
      [first.spin.material,first.core.material,...first.orbits.map(o=>o.material)].every(m=>
       !m.isMeshStandardMaterial||m.metalness===0),
    noBoxes:all.every(x=>!x.hasCubicGeometry),
    allVisual:all.every(x=>x.allVisual),
    colliderPositionsUnchanged:all.every(x=>x.collisionCentered),
    type:first.art.name,geometryName:geom.type,
    frameVertexCount:geom.getAttribute('position').count,
    frameRadius:geom.boundingSphere.radius,
    sharedFrameGeometry:frame.geometry===last.spin.geometry,
    sharedCrystalGeometry:first.spin.geometry===last.spin.geometry,
    sharedOrbitGeometry:first.orbit.geometry===last.orbit.geometry,
    ringRadius:first.orbit.geometry.parameters.radius,
    fineFloat:first.art.position.y===0,
    legacyRandomPrizes:(()=>{
      // Fixed full-energy fixture, not mutable live race energy.
      const ship={energy:100,shield:100,itemTurboTimer:0,powerShieldTimer:0};
      return [chooseBalancedRaceItem(ship,0),
        chooseBalancedRaceItem(ship,.7),
        chooseBalancedRaceItem(ship,.9999)];
    })()
   };
  });
  assert.equal(geometry.amount,49);
  assert(geometry.allSameCollider&&geometry.allFiveMesh&&geometry.noBoxes);
  assert(geometry.noCage&&geometry.noMetal&&geometry.zeroMetalness);
  assert(geometry.allVisual&&geometry.colliderPositionsUnchanged);
  assert.equal(geometry.type,'MAP1_VIOLET_CORE_PICKUP');
  assert.equal(geometry.geometryName,'OctahedronGeometry');
  assert(geometry.frameVertexCount>=18&&geometry.frameVertexCount<200);
  assert(geometry.frameRadius<19&&geometry.frameRadius>15);
  assert(geometry.sharedFrameGeometry&&geometry.sharedCrystalGeometry&&
   geometry.sharedOrbitGeometry);
  assert.equal(geometry.ringRadius,24);
  assert.deepEqual(geometry.legacyRandomPrizes,
   ['HYPER_TURBO','SHIELD','ENERGY']);
  const studio=await page.evaluate(()=>{
   const stage=new THREE.Scene();stage.background=new THREE.Color(0x091021);
   stage.add(new THREE.HemisphereLight(0xaecbff,0x101021,1.7));
   const key=new THREE.DirectionalLight(0xffffff,2.3);
   key.position.set(20,60,75);stage.add(key);
   const fill=new THREE.DirectionalLight(0x9382ff,.76);
   fill.position.set(-65,-25,-50);stage.add(fill);
   const old=new THREE.Group();old.position.x=-46;
   const oldCube=new THREE.Mesh(
    new THREE.BoxGeometry(34,34,34),
    new THREE.MeshStandardMaterial({
      color:0x493477,metalness:.52,roughness:.29,
      emissive:0x321a79,emissiveIntensity:.75,
      transparent:true,opacity:.76,depthWrite:false
    }));
   oldCube.rotation.set(.15,.15,.1);
   const oldEdge=new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(36,36,36)),
    new THREE.LineBasicMaterial({color:0xd5c1ff}));
   const oldCore=new THREE.Mesh(new THREE.OctahedronGeometry(9,0),
    new THREE.MeshBasicMaterial({color:0xa9f6ff}));
   oldCube.add(oldCore);
   const oldRing=new THREE.Mesh(new THREE.TorusGeometry(26,1.05,6,40),
    new THREE.MeshBasicMaterial({color:0xb28aff,transparent:true,
     opacity:.6,blending:THREE.AdditiveBlending,depthWrite:false,
     side:THREE.DoubleSide}));
   oldRing.rotation.set(.64,.34,.2);
   old.add(oldCube,oldEdge,oldRing);
   stage.add(old);
   const current=itemBoxes[0].art.clone(true);
   current.position.set(46,0,0);
   stage.add(current);
   const cam=new THREE.PerspectiveCamera(35,1600/900,.1,500);
   cam.position.set(0,25,180);cam.lookAt(0,0,0);
   renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
   renderer.render(stage,cam);
   const gl=renderer.getContext();gl.finish();
   const glError=gl.getError(),aa=!!gl.getContextAttributes().antialias;
   const w=1600,h=900,row=w*4,raw=new Uint8Array(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const rgba=new Uint8ClampedArray(raw.length);
   for(let y=0;y<h;y++)rgba.set(raw.subarray(y*row,(y+1)*row),(h-1-y)*row);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   return {glError,aa,drawCalls:renderer.info.render.calls,png:
    canvas.toDataURL('image/png').split(',')[1]};
  });
  assert.equal(studio.glError,0);assert(studio.aa);
  assert.equal(studio.drawCalls,9,'old cube draws four, new triple-ring crystal draws five');
  fs.writeFileSync(path.join(out,'old-box-left__violet-core-right-1600x900.png'),
   Buffer.from(studio.png,'base64'));delete studio.png;
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:25000});
  const gameplay=await page.evaluate(()=>{
   state.paused=true;
   const first=itemBoxes[0],oldPos=first.mesh.position.clone(),
    oldQuat=first.mesh.quaternion.clone();
   // Readability capture is explicitly STAGED at a visible 185m.
   // It changes no route/collision state and is restored immediately.
   const staged=makeCourseLocalGroup(
    state.routeProgress+185,state.laneX+45,state.laneY+20);
   first.mesh.position.copy(staged.position);
   first.mesh.quaternion.copy(staged.quaternion);
   renderer.render(scene,camera);
   const gl=renderer.getContext();gl.finish();
   const glError=gl.getError(),calls=renderer.info.render.calls;
   const w=1600,h=900,row=w*4,raw=new Uint8Array(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const rgba=new Uint8ClampedArray(raw.length);
   for(let y=0;y<h;y++)rgba.set(raw.subarray(y*row,(y+1)*row),(h-1-y)*row);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   first.mesh.position.copy(oldPos);first.mesh.quaternion.copy(oldQuat);
   return {glError,calls,px:1600*900,
    restored:first.mesh.position.distanceTo(oldPos)<1e-6,
    aa:!!gl.getContextAttributes().antialias,
    shipParts:h4Ship19Race.userData.parts,
    cameraStage:'actual game camera, one pickup temporarily staged 185m ahead',
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert.equal(gameplay.glError,0);assert(gameplay.aa);
  assert.equal(gameplay.shipParts,189);assert(gameplay.restored);
  assert(gameplay.calls>20);
  fs.writeFileSync(path.join(out,'map1-actual-camera-staged-pickup.png'),
   Buffer.from(gameplay.png,'base64'));delete gameplay.png;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,combatParts:h4Ship19Combat.userData.parts,
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    visibleRace:h4Ship19Race.visible,glError:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');assert.equal(map4.combatParts,249);
  assert.deepEqual(map4.physics,[6,36,200]);assert(!map4.visibleRace);
  assert.equal(map4.glError,0);assert.deepEqual(errors,[]);
  const report={pass:true,tag:'NEXT11C21G3-COMPAT',geometry,studio,gameplay,map4,errors,
   caveat:'Studio panel left is faithful reconstruction of previous C21G cube; right new model. In-game shot stages ONLY one visual pickup temporarily to evaluate legibility; original route/colliders and gameplay restored.'};
  fs.writeFileSync(path.join(out,'violet-core-art-qa.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21G3 NO METAL PICKUP WEBGL PASS '+JSON.stringify({
   items:geometry.amount,allFiveMesh:geometry.allFiveMesh,
   noMetal:geometry.noCage&&geometry.zeroMetalness,
   noBoxGeometry:geometry.noBoxes,crystalVertices:geometry.frameVertexCount,
   crystalRadius:geometry.frameRadius,sharedAssets:geometry.sharedFrameGeometry,
   oldVsNewCalls:studio.drawCalls,gameCalls:gameplay.calls,
   map4,errors}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});