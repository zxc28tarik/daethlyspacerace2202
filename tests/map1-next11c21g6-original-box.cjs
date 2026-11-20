/* NEXT11C21G6: original purple box, appearance only. Actual Chromium/WebGL. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21g6-evidence');fs.mkdirSync(out,{recursive:true});
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
   const all=itemBoxes.map(b=>{
    const m=[],l=[];b.mesh.traverse(o=>{
     if(o.isMesh)m.push(o);if(o.isLineSegments)l.push(o);
    });
    return {radius:b.radius,meshCount:m.length,edges:l.length,
     cubes:m.filter(x=>x.geometry.type==='BoxGeometry').map(x=>x.geometry.parameters),
     noAtom:!b.art&&!b.orbit&&!b.orbits,noClaim:b.claimed.size===0,
     center:b.mesh.position.distanceTo(makeCourseLocalGroup(
      b.routeProgress,b.laneX,b.laneY).position)<.0001,
     visual:[...m,...l].every(x=>x.userData.visualOnly&&x.userData.noCollider)};
   });
   const before=first.spin.scale.x,oldVisibility=first.mesh.visible;
   first.mesh.visible=true; // Force sampled pickup visible for animation QA.
   state.raceTime=.9;animateItemBoxes(.016);
   first.mesh.visible=oldVisibility;
   const fixture={energy:100,shield:100,itemTurboTimer:0,powerShieldTimer:0};
   return {count:all.length,originalBox:all.every(x=>x.meshCount===2&&
    x.edges===1&&x.cubes.length===1&&x.cubes[0].width===34&&
    x.cubes[0].height===34&&x.cubes[0].depth===34),
    noAtom:all.every(x=>x.noAtom),radius49:all.every(x=>x.radius===49),
    centered:all.every(x=>x.center),unclaimed:all.every(x=>x.noClaim),
    visual:all.every(x=>x.visual),
    coreRadius:first.core.geometry.parameters.radius,
    edgeSize:first.edge.geometry.boundingSphere?.radius||0,
    shared:[
     first.spin.geometry===last.spin.geometry,
     first.edge.geometry===last.edge.geometry,
     first.core.geometry===last.core.geometry,
     first.spin.material===last.spin.material],
    pulse:Math.abs(first.spin.scale.x-before),
    metalness:first.spin.material.metalness,
    probability:[chooseBalancedRaceItem(fixture,0),
      chooseBalancedRaceItem(fixture,.7),
      chooseBalancedRaceItem(fixture,.9999)]};
  });
  assert.equal(shape.count,49);
  assert(shape.originalBox&&shape.noAtom&&shape.radius49&&shape.centered);
  assert(shape.unclaimed&&shape.visual&&shape.shared.every(Boolean));
  assert.equal(shape.coreRadius,9);assert(shape.pulse>.001);
  assert(shape.metalness<=.2);
  assert.deepEqual(shape.probability,['HYPER_TURBO','SHIELD','ENERGY']);

  const studio=await page.evaluate(()=>{
   const stage=new THREE.Scene();stage.background=new THREE.Color(0x091021);
   stage.add(new THREE.HemisphereLight(0xd2dfff,0x151326,1.4));
   const lamp=new THREE.DirectionalLight(0xffffff,2.0);
   lamp.position.set(30,40,90);stage.add(lamp);
   const old=new THREE.Group();old.position.set(-49,0,0);
   const cube=new THREE.Mesh(new THREE.BoxGeometry(34,34,34),
    new THREE.MeshStandardMaterial({color:0x5a39b8,metalness:.35,
     roughness:.3,emissive:0x331e85,emissiveIntensity:.9,
     transparent:true,opacity:.9}));
   cube.rotation.set(.15,.15,.1);
   cube.add(new THREE.Mesh(new THREE.OctahedronGeometry(9,0),
    new THREE.MeshBasicMaterial({color:0x60eeff})));
   const edge=new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.BoxGeometry(36,36,36)),
    new THREE.LineBasicMaterial({color:0xffeaff}));
   old.add(cube,edge);stage.add(old);
   const polished=itemBoxes[0].mesh.clone(true);polished.position.set(49,0,0);
   polished.scale.setScalar(1);polished.children[0].scale.setScalar(1);
   stage.add(polished);
   const cam=new THREE.PerspectiveCamera(32,1600/900,.1,500);
   cam.position.set(0,17,175);cam.lookAt(0,0,0);
   renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
   renderer.render(stage,cam);const gl=renderer.getContext();gl.finish();
   const calls=renderer.info.render.calls,glError=gl.getError();
   const w=1600,h=900,raw=new Uint8Array(w*h*4),rgba=new Uint8ClampedArray(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const stride=w*4;
   for(let y=0;y<h;y++)rgba.set(raw.subarray(y*stride,(y+1)*stride),(h-1-y)*stride);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   return {calls,glError,aa:!!gl.getContextAttributes().antialias,
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert.equal(studio.calls,6);assert(studio.aa&&studio.glError===0);
  fs.writeFileSync(path.join(out,'old-box-vs-polished-box-1600x900.png'),
   Buffer.from(studio.png,'base64'));delete studio.png;

  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:25000});
  const game=await page.evaluate(()=>{
   state.paused=true;
   const b=itemBoxes[0],savedP=b.mesh.position.clone(),savedQ=b.mesh.quaternion.clone();
   const at=makeCourseLocalGroup(state.routeProgress+185,state.laneX+45,state.laneY+20);
   b.mesh.position.copy(at.position);b.mesh.quaternion.copy(at.quaternion);
   renderer.render(scene,camera);const gl=renderer.getContext();gl.finish();
   const err=gl.getError(),calls=renderer.info.render.calls;
   const w=1600,h=900,raw=new Uint8Array(w*h*4),rgba=new Uint8ClampedArray(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const stride=w*4;
   for(let y=0;y<h;y++)rgba.set(raw.subarray(y*stride,(y+1)*stride),(h-1-y)*stride);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   b.mesh.position.copy(savedP);b.mesh.quaternion.copy(savedQ);
   state.paused=false;const before=state.powerUpsCollected;
   const oldRandom=Math.random;let prize='';
   try{Math.random=()=>0;prize=grantRandomItem(b,state,true);}
   finally{Math.random=oldRandom;}
   state.paused=true;
   return {glError:err,calls,restored:b.mesh.position.distanceTo(savedP)<1e-4,
    shipParts:h4Ship19Race.userData.parts,prize,awarded:state.powerUpsCollected===before+1,
    laser:state.obstacleLaserTimer,hyper:state.itemTurboTimer,
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert.equal(game.glError,0);assert(game.restored);
  assert.equal(game.shipParts,189);assert.equal(game.prize,'HYPER_TURBO');
  assert(game.awarded&&game.laser===12&&game.hyper>0);
  fs.writeFileSync(path.join(out,'game-camera-restored-purple-box.png'),
   Buffer.from(game.png,'base64'));delete game.png;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {mode:state.activeMap,combat:h4Ship19Combat.userData.parts,
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],err:renderer.getContext().getError()};
  });
  assert.equal(map4.mode,'map4');assert.equal(map4.combat,249);
  assert.deepEqual(map4.colliders,[6,36,200]);assert.equal(map4.err,0);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21G6',shape,studio,game,map4,errors,
   note:'Left studio box reconstructs exact original C21F dimensions and colors; right is identical geometry with mild material polish. The game camera shot temporarily places ONE box 185m ahead, then restores its transform; route, collider and loot remain original.'};
  fs.writeFileSync(path.join(out,'original-box-art-acceptance.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21G6 ORIGINAL REWARD BOX WEBGL PASS '+JSON.stringify({
   items:shape.count,cubeRestored:shape.originalBox,drawCalls:studio.calls,
   randomPrize:game.prize,map4,errors}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});
