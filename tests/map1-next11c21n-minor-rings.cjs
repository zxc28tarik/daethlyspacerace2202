/* NEXT11C21N — Same original Map1 rails/rings; quieter minor blue only.
 * Real Chromium/WebGL same-game-camera old/new PNG + Map4 isolation.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21n-evidence');fs.mkdirSync(out,{recursive:true});
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
   corridorGuideGroup.userData.ringBatchCount===10,null,{timeout:30000});
  const initial=await page.evaluate(()=>{
   const data=corridorGuideGroup.userData;
   const mats=[data.railMaterial,data.ringMaterial,data.majorRingMaterial,
    data.boundaryHintMat,data.boundaryDangerMat];
   const group=corridorGuideGroup.children.filter(x=>x.userData?.ringKind);
   const minor=group.filter(x=>x.userData.ringKind==='minor');
   const major=group.filter(x=>x.userData.ringKind==='major');
   const ringMaterials=new Set(group.map(x=>x.material));
   return {
    map:state.activeMap,
    grade:MAP1_C21N_MINOR_RING_GRADE,
    ringBatches:data.ringBatchCount,ringCount:data.ringOriginalCount,
    railBatchCount:data.railBatchCount,rails:data.railOriginalCount,
    railSegments:data.railOriginalSegments,
    ringCounts:[minor.reduce((n,x)=>n+x.userData.ringCount,0),
     major.reduce((n,x)=>n+x.userData.ringCount,0)],
    ringGroupCounts:[minor.length,major.length],
    guideChildren:corridorGuideGroup.children.length,
    tint:data.ringMaterial.uniforms.uColor.value.getHex(),
    opacity:data.ringMaterial.uniforms.uOpacity.value,
    matOpacity:data.ringMaterial.opacity,
    distance:[data.ringMaterial.uniforms.uNear.value,
     data.ringMaterial.uniforms.uFar.value,data.ringMaterial.uniforms.uFloor.value],
    untouchedCriticalGuides:{
     rail:[data.railMaterial.uniforms.uColor.value.getHex(),
      data.railMaterial.uniforms.uOpacity.value],
     major:[data.majorRingMaterial.uniforms.uColor.value.getHex(),
      data.majorRingMaterial.uniforms.uOpacity.value],
     hint:[data.boundaryHintMat.uniforms.uColor.value.getHex(),
      data.boundaryHintMat.uniforms.uOpacity.value],
     danger:[data.boundaryDangerMat.uniforms.uColor.value.getHex(),
      data.boundaryDangerMat.uniforms.uOpacity.value]
    },
    originalRingMeshes:group.every(x=>x.geometry.getAttribute('routeDistance')&&
     x.geometry.type==='BufferGeometry'&&x.type==='LineSegments'&&
     x.userData.visualOnly&&x.userData.noCollider),
    allMinorSameMaterial:minor.every(x=>x.material===data.ringMaterial),
    allMajorSameMaterial:major.every(x=>x.material===data.majorRingMaterial),
    sourceMaterials:ringMaterials.size,
    originalObjects:[asteroids.length,staticObstacles.filter(x=>x.type==='BARRIER').length,
     wreckageModules.length,itemBoxes.length],
    ships:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts],
    fog:[scene.fog.color.getHex(),scene.fog.density]
   };
  });
  assert.equal(initial.map,'map1');
  assert.deepEqual(initial.originalObjects,[320,97,8,49]);
  assert.deepEqual(initial.ships,[189,249]);
  assert.deepEqual(initial.ringCounts,[153,39]);
  assert.deepEqual(initial.ringGroupCounts,[5,5]);
  assert.deepEqual([initial.ringBatches,initial.ringCount,initial.railBatchCount,
   initial.rails,initial.railSegments,initial.guideChildren],
   [10,192,20,16,6960,46]);
  assert(initial.originalRingMeshes&&initial.allMinorSameMaterial&&
   initial.allMajorSameMaterial&&initial.sourceMaterials===2);
  assert.deepEqual([initial.tint,initial.opacity,initial.matOpacity],
   [0x557fc4,.26,.26]);
  assert.deepEqual(initial.distance,[600,3000,.08]);
  assert.deepEqual(initial.untouchedCriticalGuides,{
   rail:[0x17adcf,.58],major:[0x00e7ed,.85],
   hint:[0xffba65,.20],danger:[0xff6e67,.25]});
  assert.deepEqual(initial.fog,[0x0d0e21,.00044]);

  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:30000});
  const ab=await page.evaluate(()=>{
   state.paused=true;
   const guide=corridorGuideGroup.userData.ringMaterial;
   const source=guide.uniforms.uColor.value.clone();
   const alpha=guide.uniforms.uOpacity.value;
   const previousOpacity=guide.opacity;
   const gl=renderer.getContext(),w=1600,h=900,stride=w*4;
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
   let before,after;
   try {
    // Old baseline C21M: exact same guide geometry, 0x406dff and 0.30.
    guide.uniforms.uColor.value.setHex(0x406dff);
    guide.uniforms.uOpacity.value=.30;guide.opacity=.30;
    before=frame();
    guide.uniforms.uColor.value.copy(source);
    guide.uniforms.uOpacity.value=alpha;guide.opacity=previousOpacity;
    after=frame();
   }finally{
    guide.uniforms.uColor.value.copy(source);
    guide.uniforms.uOpacity.value=alpha;guide.opacity=previousOpacity;
   }
   let changed=0,peak=0,sum=0;
   for(let i=0;i<before.pixels.length;i+=4){
    const delta=Math.max(
     Math.abs(before.pixels[i]-after.pixels[i]),
     Math.abs(before.pixels[i+1]-after.pixels[i+1]),
     Math.abs(before.pixels[i+2]-after.pixels[i+2]));
    if(delta>=3)changed++;
    peak=Math.max(peak,delta);sum+=delta;
   }
   const sideBySide=document.createElement('canvas');
   sideBySide.width=1600;sideBySide.height=900;
   const ctx=sideBySide.getContext('2d');
   ctx.drawImage(before.canvas,400,0,800,900,0,0,800,900);
   ctx.drawImage(after.canvas,400,0,800,900,800,0,800,900);
   return {before:{err:before.err,calls:before.calls,png:before.png},
    after:{err:after.err,calls:after.calls,png:after.png},
    comparison:sideBySide.toDataURL('image/png').split(',')[1],
    changed,peak,sum,
    restored:guide.uniforms.uColor.value.equals(source)&&
     guide.uniforms.uOpacity.value===alpha&&guide.opacity===previousOpacity,
    aa:!!gl.getContextAttributes().antialias};
  });
  assert(ab.aa&&ab.restored);
  assert.equal(ab.before.err,0);assert.equal(ab.after.err,0);
  assert.equal(ab.before.calls,ab.after.calls,'Material retone must not add drawcalls');
  assert(ab.changed>200&&ab.peak>=3,
   'Minor ring subtle blue change must show up at game camera');
  fs.writeFileSync(path.join(out,'c21n-old-minor-ring-map1.png'),
   Buffer.from(ab.before.png,'base64'));
  fs.writeFileSync(path.join(out,'c21n-harmonized-minor-ring-map1.png'),
   Buffer.from(ab.after.png,'base64'));
  fs.writeFileSync(path.join(out,'c21n-same-camera-side-by-side.png'),
   Buffer.from(ab.comparison,'base64'));
  delete ab.before.png;delete ab.after.png;delete ab.comparison;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,guideVisible:corridorGuideGroup.visible,
    ships:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts],
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],err:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');assert.equal(map4.guideVisible,false);
  assert.deepEqual(map4.ships,[189,249]);
  assert.deepEqual(map4.colliders,[6,36,200]);assert.equal(map4.err,0);
  const returned=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,guideVisible:corridorGuideGroup.visible,
    tint:corridorGuideGroup.userData.ringMaterial.uniforms.uColor.value.getHex(),
    opacity:corridorGuideGroup.userData.ringMaterial.uniforms.uOpacity.value,
    fog:[scene.fog.color.getHex(),scene.fog.density],
    err:renderer.getContext().getError()};
  });
  assert.equal(returned.map,'map1');assert.equal(returned.guideVisible,true);
  assert.deepEqual([returned.tint,returned.opacity],[0x557fc4,.26]);
  assert.deepEqual(returned.fog,[0x0d0e21,.00044]);
  assert.equal(returned.err,0);assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21N',initial,ab,map4,returned,errors,
   note:'Exactly 153 original noncritical minor rings recolored in one existing shader uniform, all same coordinates/number, same 10 ring batches, 20 rail batches. 39 critical cyan major rings and all 16 amber/red warning guides untouched. No new mesh, physics, game logic, drawcalls, shaders or texture.'};
  fs.writeFileSync(path.join(out,'minor-ring-cohesion-regression.json'),
   JSON.stringify(report,null,2));
  console.log('NEXT11C21N MINOR RING COHESION WEBGL PASS '+JSON.stringify({
   minorRings:initial.ringCounts[0],majorRings:initial.ringCounts[1],
   changedPixels:ab.changed,peakDelta:ab.peak,
   drawCalls:[ab.before.calls,ab.after.calls],map4:map4.colliders,errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
