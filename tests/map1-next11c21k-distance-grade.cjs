/* NEXT11C21K — Map1 only atmospheric depth + coherent original rocks.
 * Real Chromium WebGL old/new same-camera evidence and Map4 isolation.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21k-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
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
  await page.waitForFunction(()=>Array.isArray(asteroids)&&asteroids.length===320&&
   itemBoxes.length===49&&wreckageModules.length===8,null,{timeout:30000});
  const checks=await page.evaluate(()=>{
   const fog=scene.fog,grade=MAP1_C21K_DISTANCE_GRADE;
   const materials=Object.fromEntries(Object.entries(asteroidMaterials)
    .map(([size,mat])=>[size,{
     color:mat.color.getHex(),flatShading:mat.flatShading,
     metalness:mat.metalness,roughness:mat.roughness,vertexColors:mat.vertexColors
    }]));
   const edges=Object.fromEntries(Object.entries(asteroidEdgeMaterials)
    .map(([size,mat])=>[size,{color:mat.color.getHex(),opacity:mat.opacity}]));
   const fade=(density,d)=>Math.exp(-Math.pow(density*d,2));
   const geometrySample=[0,2,4,155,319].map(i=>{
    const a=asteroids[i],geo=a.mesh.geometry;
    const ref=new THREE.DodecahedronGeometry(a.radius,1),
     old=ref.getAttribute('position'),now=geo.getAttribute('position');
    let error=0;
    for(let v=0;v<old.count;v++)error=Math.max(error,
     Math.abs(old.getX(v)-now.getX(v)),
     Math.abs(old.getY(v)-now.getY(v)),
     Math.abs(old.getZ(v)-now.getZ(v)));
    ref.dispose();return {index:i,error,vertexCount:now.count,
     radius:a.radius,cls:a.sizeClass};
   });
   return {
    map:state.activeMap,grade,fog:{color:fog.color.getHex(),density:fog.density},
    colorMaterial:materials,edges,
    originalObjects:{
     asteroids:asteroids.length,
     barriers:staticObstacles.filter(o=>o.type==='BARRIER').length,
     wrecks:wreckageModules.length,
     wreckColliders:staticObstacles.filter(o=>o.type==='WRECK_BOX').length,
     boxes:itemBoxes.length,
     allBoxesOriginal:itemBoxes.every(b=>b.radius===49&&
      b.spin.geometry.parameters.width===34),
     rockPositionsUnchanged:geometrySample.every(x=>x.error===0),
     samples:geometrySample
    },
    visibility:{
     previous1500:fade(.00055,1500),
     revised1500:fade(grade.density,1500),
     previous2400:fade(.00055,2400),
     revised2400:fade(grade.density,2400)
    },
    noExtraObjects:!scene.children.some(x=>
     String(x.name||'').includes('NEXT11C21K'))
   };
  });
  assert.equal(checks.map,'map1');
  assert.equal(checks.fog.color,0x0d0e21);
  assert.equal(checks.fog.density,.00044);
  assert.deepEqual([checks.colorMaterial.SMALL.color,
   checks.colorMaterial.MEDIUM.color,checks.colorMaterial.LARGE.color],
   [0xb0b3be,0xa09aa7,0xa3928a]);
  assert(checks.originalObjects.rockPositionsUnchanged);
  assert(checks.originalObjects.allBoxesOriginal&&checks.noExtraObjects);
  assert.deepEqual([checks.originalObjects.asteroids,
   checks.originalObjects.barriers,checks.originalObjects.wrecks,
   checks.originalObjects.wreckColliders,checks.originalObjects.boxes],
   [320,97,8,32,49]);
  assert(Object.values(checks.edges).every(x=>x.opacity<=.18));
  assert(checks.visibility.revised1500>checks.visibility.previous1500*1.2);
  assert(checks.visibility.revised2400>checks.visibility.previous2400*1.7);
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:25000});
  const comparison=await page.evaluate(()=>{
   state.paused=true;
   // Visual QA ONLY: move existing three original asteroids and one
   // original orange barrier into three *different* distance bands.
   // Restore all transforms, visibility, and materials in finally.
   const refs=[asteroids[0].mesh,asteroids[2].mesh,asteroids[4].mesh,
    staticObstacles.find(o=>o.type==='BARRIER').mesh];
   const saved=refs.map(mesh=>({
    mesh,position:mesh.position.clone(),rotation:mesh.quaternion.clone(),
    visible:mesh.visible}));
   const places=[
    [720,-125,8],[1360,92,35],[2120,-52,-6],[1510,175,-55]
   ];
   saved.forEach(({mesh},i)=>{
    const [d,lx,ly]=places[i];
    const g=makeCourseLocalGroup(state.routeProgress+d,
     state.laneX+lx,state.laneY+ly);
    mesh.position.copy(g.position);mesh.quaternion.copy(g.quaternion);
    mesh.visible=true;
   });
   const oldPalette={
    SMALL:[0xa6abb6,0xa4b4c3,.17],
    MEDIUM:[0x948e9b,0x9c94aa,.14],
    LARGE:[0x9b8881,0xbda192,.14]
   };
   const oldFog=scene.fog.color.clone(),oldDensity=scene.fog.density;
   const saveColor={},saveEdge={};
   for(const key of ['SMALL','MEDIUM','LARGE']){
    saveColor[key]=asteroidMaterials[key].color.clone();
    saveEdge[key]={
     color:asteroidEdgeMaterials[key].color.clone(),
     opacity:asteroidEdgeMaterials[key].opacity};
   }
   const gl=renderer.getContext(),w=1600,h=900;
   const frame=()=>{
    renderer.render(scene,camera);gl.finish();
    const err=gl.getError(),calls=renderer.info.render.calls,
     pixels=new Uint8Array(w*h*4),flipped=new Uint8ClampedArray(w*h*4),
     stride=w*4;
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
    for(let y=0;y<h;y++)
     flipped.set(pixels.subarray(y*stride,(y+1)*stride),
      (h-1-y)*stride);
    const c=document.createElement('canvas');c.width=w;c.height=h;
    c.getContext('2d').putImageData(new ImageData(flipped,w,h),0,0);
    return {err,calls,canvas:c,png:c.toDataURL('image/png').split(',')[1]};
   };
   let old,newer;
   try{
    scene.fog.color.setHex(0x09051d);
    scene.fog.density=.00055;
    for(const key of Object.keys(oldPalette)){
     const [rock,edge,alpha]=oldPalette[key];
     asteroidMaterials[key].color.setHex(rock);
     asteroidEdgeMaterials[key].color.setHex(edge);
     asteroidEdgeMaterials[key].opacity=alpha;
    }
    old=frame();
    scene.fog.color.copy(oldFog);scene.fog.density=oldDensity;
    for(const key of Object.keys(saveColor)){
     asteroidMaterials[key].color.copy(saveColor[key]);
     asteroidEdgeMaterials[key].color.copy(saveEdge[key].color);
     asteroidEdgeMaterials[key].opacity=saveEdge[key].opacity;
    }
    newer=frame();
   }finally{
    scene.fog.color.copy(oldFog);scene.fog.density=oldDensity;
    for(const key of Object.keys(saveColor)){
     asteroidMaterials[key].color.copy(saveColor[key]);
     asteroidEdgeMaterials[key].color.copy(saveEdge[key].color);
     asteroidEdgeMaterials[key].opacity=saveEdge[key].opacity;
    }
    saved.forEach(x=>{
     x.mesh.position.copy(x.position);
     x.mesh.quaternion.copy(x.rotation);
     x.mesh.visible=x.visible;
    });
   }
   // Side-by-side crops (actual resolution per half, not stretched).
   const canvas=document.createElement('canvas');
   canvas.width=1600;canvas.height=900;
   const ctx=canvas.getContext('2d');
   ctx.drawImage(old.canvas,400,0,800,900,0,0,800,900);
   ctx.drawImage(newer.canvas,400,0,800,900,800,0,800,900);
   return {old:{err:old.err,calls:old.calls,png:old.png},
    improved:{err:newer.err,calls:newer.calls,png:newer.png},
    composite:canvas.toDataURL('image/png').split(',')[1],
    restored:saved.every(x=>
     x.mesh.position.distanceTo(x.position)<.00001&&
     x.mesh.quaternion.angleTo(x.rotation)<.00001&&
     x.mesh.visible===x.visible),
    rendererAA:!!gl.getContextAttributes().antialias,
    playableModel:h4Ship19Race.userData.parts,
    gradeRestored:scene.fog.color.getHex()===MAP1_C21K_DISTANCE_GRADE.fogColor&&
     Math.abs(scene.fog.density-MAP1_C21K_DISTANCE_GRADE.density)<1e-9};
  });
  assert(comparison.rendererAA&&comparison.restored&&comparison.gradeRestored);
  assert.equal(comparison.playableModel,189);
  assert.equal(comparison.old.err,0);assert.equal(comparison.improved.err,0);
  assert.equal(comparison.old.calls,comparison.improved.calls,
   'Distance grade and mineral tint cannot add render calls');
  fs.writeFileSync(path.join(out,'map1-c21k-before-1600x900.png'),
   Buffer.from(comparison.old.png,'base64'));
  fs.writeFileSync(path.join(out,'map1-c21k-after-1600x900.png'),
   Buffer.from(comparison.improved.png,'base64'));
  fs.writeFileSync(path.join(out,'map1-c21k-same-camera-side-by-side.png'),
   Buffer.from(comparison.composite,'base64'));
  const drawCalls=comparison.improved.calls;
  delete comparison.old.png;delete comparison.improved.png;
  delete comparison.composite;

  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {mode:state.activeMap,ship:h4Ship19Combat.userData.parts,
    phys:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    fogColor:scene.fog.color.getHex(),fogDensity:scene.fog.density,
    aa:!!renderer.getContext().getContextAttributes().antialias,
    glError:renderer.getContext().getError()};
  });
  assert.equal(map4.mode,'map4');assert.equal(map4.ship,249);
  assert.deepEqual(map4.phys,[6,36,200]);
  assert.notEqual(map4.fogColor,0x0d0e21);
  assert(map4.fogDensity<.0003&&map4.aa&&map4.glError===0);
  const map1Return=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {mode:state.activeMap,fogColor:scene.fog.color.getHex(),
    fogDensity:scene.fog.density,objects:[asteroids.length,itemBoxes.length],
    glError:renderer.getContext().getError()};
  });
  assert.equal(map1Return.mode,'map1');
  assert.equal(map1Return.fogColor,0x0d0e21);
  assert.equal(map1Return.fogDensity,.00044);
  assert.deepEqual(map1Return.objects,[320,49]);
  assert.equal(map1Return.glError,0);assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21K',checks,comparison,
   studioDrawCalls:drawCalls,map4,map1Return,errors,
   note:'A/B images are real 1600x900 native Chromium/WebGL frames from IDENTICAL player camera/staged original objects. BEFORE uses C21J fog and meteor colors; AFTER uses C21K. Images are reverted to real scene with original hazard transforms. No gameplay physics, item appearance, hazard placements or Map4 visuals changed.'};
  fs.writeFileSync(path.join(out,'distance-grade-regression.json'),
   JSON.stringify(report,null,2));
  console.log('NEXT11C21K DISTANCE GRADE WEBGL PASS '+JSON.stringify({
   fogBefore:.00055,fogAfter:checks.fog.density,
   transmission:checks.visibility,
   drawCalls,allObjects:checks.originalObjects,
   map4:{ship:map4.ship,colliders:map4.phys},errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});
