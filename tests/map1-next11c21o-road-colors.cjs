/* NEXT11C21O — original 5-sector race-road palette, zero geometry changes.
 * Real Chromium/WebGL before/after chase AND staged in-world road close-up.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21o-evidence');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[];
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   route=>route.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>itemBoxes.length===49&&asteroids.length===320&&
   raceRoadGroup.userData.sectors.length===5,null,{timeout:30000});
  const initial=await page.evaluate(()=>{
   const sectors=raceRoadGroup.userData.sectors;
   const palette=Array.from(MAP1_C21O_ROAD_PALETTE);
   const members=sectors.map((group,i)=>{
    const [surface,left,right,dash]=group.children;
    return {
     i,start:group.userData.start,end:group.userData.end,
     childCount:group.children.length,
     meshType:surface.type,materialType:surface.material.type,
     opacity:surface.material.opacity,blending:surface.material.blending,
     tone:surface.material.color.getHex(),
     faceVertices:surface.geometry.attributes.position.count,
     edges:[left.type,right.type,left.material.color.getHex(),
      right.material.color.getHex(),left.geometry.attributes.position.count,
      right.geometry.attributes.position.count],
     edgeOpacity:left.material.opacity,
     dash:[dash.type,dash.material.color.getHex(),dash.material.opacity,
      dash.geometry.attributes.position.count]
    };
   });
   return {map:state.activeMap,palette,members,
    sectorGroups:sectors.length,groupChildren:raceRoadGroup.children.length,
    originals:[itemBoxes.length,asteroids.length,
     staticObstacles.filter(x=>x.type==='BARRIER').length,
     wreckageModules.length],ringBatches:corridorGuideGroup.userData.ringBatchCount,
    ringCount:corridorGuideGroup.userData.ringOriginalCount,
    ship:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts],
    fog:[scene.fog.color.getHex(),scene.fog.density]};
  });
  assert.equal(initial.map,'map1');
  assert.deepEqual(initial.originals,[49,320,97,8]);
  assert.deepEqual(initial.ship,[189,249]);
  assert.deepEqual([initial.ringBatches,initial.ringCount],[10,192]);
  assert.deepEqual(initial.palette,
   [0x49bfce,0x709bc8,0xb48abf,0x6aba9e,0xcfa57e]);
  assert.equal(initial.sectorGroups,5);
  for(const s of initial.members){
   assert.deepEqual([s.start,s.end,s.childCount],
    [s.i*10000,(s.i+1)*10000,4]);
   assert.equal(s.meshType,'Mesh');assert.equal(s.materialType,'MeshBasicMaterial');
   assert.equal(s.tone,initial.palette[s.i]);
   assert.equal(s.opacity,.115);
   assert.equal(s.edgeOpacity,.74);
   assert.deepEqual(s.edges.slice(0,4),
    ['LineSegments','LineSegments',initial.palette[s.i],initial.palette[s.i]]);
   assert.deepEqual(s.dash.slice(0,3),['LineSegments',0xffffff,.33]);
   assert(s.faceVertices>0&&s.faceVertices%6===0);
  }
  assert.deepEqual(initial.fog,[0x0d0e21,.00044]);

  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:30000});
  const ab=await page.evaluate(()=>{
   state.paused=true;
   const sectors=raceRoadGroup.userData.sectors;
   const oldPalette=[0x16e7ff,0x43a5ff,0xe87eff,0x44ffaf,0xffb467];
   const newPalette=Array.from(MAP1_C21O_ROAD_PALETTE);
   const gl=renderer.getContext(),w=1600,h=900,stride=w*4;
   const cameraSave={position:camera.position.clone(),
    quaternion:camera.quaternion.clone(),up:camera.up.clone()};
   const apply=(arr)=>{
    sectors.forEach((group,i)=>{
     for(const mesh of group.children.slice(0,3))
      mesh.material.color.setHex(arr[i]);
    });
   };
   const frame=()=>{
    renderer.render(scene,camera);gl.finish();
    const err=gl.getError(),calls=renderer.info.render.calls,
     raw=new Uint8Array(w*h*4),flipped=new Uint8ClampedArray(w*h*4);
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    for(let y=0;y<h;y++)
     flipped.set(raw.subarray(y*stride,(y+1)*stride),(h-1-y)*stride);
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').putImageData(new ImageData(flipped,w,h),0,0);
    return {err,calls,canvas,pixels:flipped,
     png:canvas.toDataURL('image/png').split(',')[1]};
   };
   const capture=()=>{
    let before,after;
    apply(oldPalette);before=frame();
    apply(newPalette);after=frame();
    let changed=0,peak=0;
    for(let i=0;i<before.pixels.length;i+=4){
     const delta=Math.max(
      Math.abs(before.pixels[i]-after.pixels[i]),
      Math.abs(before.pixels[i+1]-after.pixels[i+1]),
      Math.abs(before.pixels[i+2]-after.pixels[i+2]));
     if(delta>=3)changed++;peak=Math.max(peak,delta);
    }
    const sideBySide=document.createElement('canvas');
    sideBySide.width=1600;sideBySide.height=900;
    const ctx=sideBySide.getContext('2d');
    ctx.drawImage(before.canvas,400,0,800,900,0,0,800,900);
    ctx.drawImage(after.canvas,400,0,800,900,800,0,800,900);
    return {old:{err:before.err,calls:before.calls,png:before.png},
     now:{err:after.err,calls:after.calls,png:after.png},
     comparison:sideBySide.toDataURL('image/png').split(',')[1],
     changed,peak};
   };
   let chase,inspection;
   try{
    chase=capture(); // Real original game camera, unchanged
    // Camera-only inspection of actual road mesh under the player's lane.
    // No extra road, game state, light or geometry is created.
    const p=state.routeProgress+340;
    const f=getRaceFrameAtDistance(p);
    const road=f.center.clone()
     .addScaledVector(f.up,-190*COURSE_WIDTH_SCALE*
      getCorridorRadiusAt(p)/state.tubeRadius);
    camera.position.copy(road).addScaledVector(f.up,220)
     .addScaledVector(f.tangent,-330);
    camera.up.copy(f.up);
    camera.lookAt(road);
    inspection=capture();
   }finally{
    apply(newPalette);
    camera.position.copy(cameraSave.position);
    camera.quaternion.copy(cameraSave.quaternion);
    camera.up.copy(cameraSave.up);
   }
   return {chase,inspection,
    restored:sectors.every((g,i)=>g.children.slice(0,3).every(m=>
     m.material.color.getHex()===newPalette[i])),
    cameraRestored:camera.position.distanceTo(cameraSave.position)<1e-6&&
     camera.quaternion.angleTo(cameraSave.quaternion)<1e-6,
    aa:!!gl.getContextAttributes().antialias};
  });
  assert(ab.aa&&ab.restored&&ab.cameraRestored);
  for(const key of ['chase','inspection']){
   const v=ab[key];
   assert.equal(v.old.err,0);assert.equal(v.now.err,0);
   assert.equal(v.old.calls,v.now.calls,'Pigment changes cannot add drawcalls');
   const slug=key==='chase'?'chase':'road-inspection';
   fs.writeFileSync(path.join(out,'c21o-'+slug+'-old-road.png'),
    Buffer.from(v.old.png,'base64'));
   fs.writeFileSync(path.join(out,'c21o-'+slug+'-coherent-road.png'),
    Buffer.from(v.now.png,'base64'));
   fs.writeFileSync(path.join(out,'c21o-'+slug+'-same-camera.png'),
    Buffer.from(v.comparison,'base64'));
   delete v.old.png;delete v.now.png;delete v.comparison;
  }
  assert(ab.inspection.changed>200&&ab.inspection.peak>=3,
   'Controlled in-world road inspection must measure visual differences');
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,roadVisible:raceRoadGroup.visible,
    racingShip:h4Ship19Race.userData.parts,combatShip:h4Ship19Combat.userData.parts,
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],err:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');assert.equal(map4.roadVisible,false);
  assert.deepEqual([map4.racingShip,map4.combatShip],[189,249]);
  assert.deepEqual(map4.physics,[6,36,200]);assert.equal(map4.err,0);
  const returned=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,roadVisible:raceRoadGroup.visible,
    palette:raceRoadGroup.userData.sectors.map(x=>x.children[0].material.color.getHex()),
    ringCount:corridorGuideGroup.userData.ringOriginalCount,
    err:renderer.getContext().getError()};
  });
  assert.equal(returned.map,'map1');assert.equal(returned.roadVisible,true);
  assert.deepEqual(returned.palette,initial.palette);
  assert.equal(returned.ringCount,192);assert.equal(returned.err,0);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21O',initial,ab,map4,returned,errors,
   note:'Exactly 5 pre-existing race-road surface and edge colors changed. Same 5 sector meshes, road vertices, route coordinates, two edge lines per sector, center dashes, turn arrows, collider logic, 153 minor/39 major rings and bonus systems unchanged. Chase and road inspection use actual scene, material A/B at identical camera.'};
  fs.writeFileSync(path.join(out,'race-road-palette-regression.json'),
   JSON.stringify(report,null,2));
  console.log('NEXT11C21O ROAD COLOR COHESION WEBGL PASS '+JSON.stringify({
   sectors:initial.sectorGroups,roadFaceVertices:initial.members.map(x=>x.faceVertices),
   chasePixels:ab.chase.changed,inspectionPixels:ab.inspection.changed,
   peakDelta:ab.inspection.peak,drawCalls:[ab.inspection.old.calls,ab.inspection.now.calls],
   map4:map4.physics,errors}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});
