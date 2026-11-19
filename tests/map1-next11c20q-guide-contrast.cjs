/* NEXT11C20Q: original Map1 rail and ring fidelity, GPU-distance
   attenuation, Map4 isolation and real Chromium framebuffer evidence. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c20q-evidence');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[];
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error'&&/shader|glsl|webglprogram/i.test(m.text()))errors.push(m.text());});
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof startGame==='function' &&
   !!corridorGuideGroup && !!h4Ship19Race && !!h4Ship19Combat,
   null,{timeout:25000});
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running && state.activeMap===MAP_MODES.MAP1 &&
   state.raceTime>.02,null,{timeout:25000});
  await page.evaluate(()=>{
   state.paused=true;
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
  });
  const sample=async mode=>page.evaluate(mode=>{
   updateVisibleCorridor();
   renderer.render(scene,camera);
   const gl=renderer.getContext();gl.finish();
   const rails=corridorGuideGroup.children.filter(o=>o.name?.startsWith('MAP1_C20P_RAIL_SECTOR_'));
   const rings=corridorGuideGroup.children.filter(o=>o.name?.startsWith('MAP1_C20O_'));
   const positionCount=o=>o.geometry.getAttribute('position').count;
   const boundary=corridorGuideGroup.children.filter(o=>o.isLine && !o.isLineSegments);
   const expectedFrame=getRaceFrameAtDistance(0);
   const expectedRail=expectedFrame.center.clone()
    .addScaledVector(expectedFrame.right,getCorridorRadiusAt(0));
   const firstRail=rails[0].geometry.getAttribute('position');
   const firstRailError=new THREE.Vector3(
    firstRail.getX(0),firstRail.getY(0),firstRail.getZ(0)).distanceTo(expectedRail);
   const railMat=corridorGuideGroup.userData.railMaterial;
   const ringMat=corridorGuideGroup.userData.ringMaterial;
   const snap={
    mode, map:state.activeMap,guideChildren:corridorGuideGroup.children.length,
    railBatchCount:corridorGuideGroup.userData.railBatchCount,
    railOriginalCount:corridorGuideGroup.userData.railOriginalCount,
    railOriginalSegments:corridorGuideGroup.userData.railOriginalSegments,
    railSectorLength:corridorGuideGroup.userData.railSectorLength,
    ringBatchCount:corridorGuideGroup.userData.ringBatchCount,
    ringOriginalCount:corridorGuideGroup.userData.ringOriginalCount,
    rails:rails.length,rings:rings.length,boundaryCount:boundary.length,
    boundaryAttributesMatch:boundary.every(o=>
      o.geometry.getAttribute('routeDistance')?.count===positionCount(o)),
    majorAttributesMatch:rings.filter(r=>r.userData.ringKind==='major').every(o=>
      o.geometry.getAttribute('routeDistance')?.count===positionCount(o)),
    allGuideFadeShaders:['railMaterial','ringMaterial','majorRingMaterial',
      'boundaryHintMat','boundaryDangerMat'].every(k=>
        corridorGuideGroup.userData[k].isShaderMaterial),
    railVertices:rails.reduce((n,r)=>n+positionCount(r),0),
    allRailAttributesMatch:rails.every(r=>r.isLineSegments &&
      r.geometry.getAttribute('routeDistance')?.count===positionCount(r)),
    allMinorAttributesMatch:rings.filter(r=>r.userData.ringKind==='minor').every(
      r=>r.geometry.getAttribute('routeDistance')?.count===positionCount(r)),
    railSegmentsMeta:rails.reduce((n,r)=>n+r.userData.segmentCount,0),
    firstRailError, fade:corridorGuideGroup.userData.distanceFadeEnabled,
    shader:railMat.isShaderMaterial && ringMat.isShaderMaterial,
    railNear:railMat.uniforms.uNear.value,
    railFar:railMat.uniforms.uFar.value,
    railFloor:railMat.uniforms.uFloor.value,
    ringNear:ringMat.uniforms.uNear.value,
    ringFar:ringMat.uniforms.uFar.value,
    ringFloor:ringMat.uniforms.uFloor.value,
    playerProgress:state.routeProgress,
    railUniformProgress:railMat.uniforms.uProgress.value,
    ringUniformProgress:ringMat.uniforms.uProgress.value,
    majorOpacity:corridorGuideGroup.userData.majorRingMaterial.opacity,
    dangerOpacity:corridorGuideGroup.userData.boundaryDangerMat.opacity,
    parts:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts],
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    map1RaceVisible:h4Ship19Race.visible,map4CombatVisible:h4Ship19Combat.visible,
    calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
    buffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],glError:gl.getError()
   };
   const width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
   const raw=new Uint8Array(width*height*4);
   gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   const flipped=new Uint8ClampedArray(raw.length);
   for(let y=0;y<height;y++)
    flipped.set(raw.subarray(y*width*4,(y+1)*width*4),(height-1-y)*width*4);
   const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
   canvas.getContext('2d').putImageData(new ImageData(flipped,width,height),0,0);
   snap.png=canvas.toDataURL('image/png').split(',')[1];
   return snap;
  },mode);
  const map1=await sample('Map1');
  fs.writeFileSync(path.join(out,'map1-distance-faded-720p.png'),Buffer.from(map1.png,'base64'));
  delete map1.png;
  assert.equal(map1.railBatchCount,20);
  assert.equal(map1.railOriginalCount,16);
  assert.equal(map1.railSectorLength,2500);
  assert.equal(map1.rails,20);
  assert.equal(map1.railOriginalSegments,6960);
  assert.equal(map1.railSegmentsMeta,6960);
  assert.equal(map1.railVertices,13920);
  assert.equal(map1.guideChildren,46);
  assert.equal(map1.ringBatchCount,10);
  assert.equal(map1.rings,10);
  assert.equal(map1.ringOriginalCount,192);
  assert.equal(map1.allRailAttributesMatch,true);
  assert.equal(map1.allMinorAttributesMatch,true);
  assert.equal(map1.boundaryCount,16);
  assert.equal(map1.boundaryAttributesMatch,true);
  assert.equal(map1.majorAttributesMatch,true);
  assert.equal(map1.allGuideFadeShaders,true);
  assert.equal(map1.fade,true);
  assert.equal(map1.shader,true);
  assert(map1.firstRailError<.003,'all original route geometry must remain intact');
  assert.equal(map1.railNear,900);assert.equal(map1.railFar,4600);
  assert.equal(map1.railFloor,.12);
  assert.equal(map1.ringNear,600);assert.equal(map1.ringFar,3000);
  assert.equal(map1.ringFloor,.08);
  assert(Math.abs(map1.playerProgress-map1.railUniformProgress)<.01);
  assert(Math.abs(map1.playerProgress-map1.ringUniformProgress)<.01);
  assert(map1.majorOpacity>.69&&map1.dangerOpacity>=.15);
  assert.deepEqual(map1.parts,[189,249]);
  assert.deepEqual(map1.physics,[0,0,0]);
  assert.equal(map1.map1RaceVisible,true);
  assert.equal(map1.map4CombatVisible,false);
  assert.deepEqual(map1.buffer,[1280,720]);
  assert(map1.calls>0&&map1.triangles>1000);
  assert.equal(map1.glError,0);
  // True controlled A/B: identical pause, camera, ship, geometry and scene.
  // Only new major/boundary distance floors are disabled in the baseline.
  const ab=await page.evaluate(()=>{
    const gl=renderer.getContext(),w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
    const mats=corridorGuideGroup.userData;
    const keys=['majorRingMaterial','boundaryHintMat','boundaryDangerMat'];
    const originals=keys.map(k=>mats[k].uniforms.uFloor.value);
    const capture=()=>{
      renderer.render(scene,camera);gl.finish();
      const raw=new Uint8Array(w*h*4);
      gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
      const flipped=new Uint8ClampedArray(raw.length);
      for(let y=0;y<h;y++)
        flipped.set(raw.subarray(y*w*4,(y+1)*w*4),(h-1-y)*w*4);
      const cvs=document.createElement('canvas');cvs.width=w;cvs.height=h;
      cvs.getContext('2d').putImageData(new ImageData(flipped,w,h),0,0);
      return {raw,png:cvs.toDataURL('image/png').split(',')[1]};
    };
    try{
      keys.forEach(k=>{mats[k].uniforms.uFloor.value=1;});
      const reference=capture();
      keys.forEach((k,i)=>{mats[k].uniforms.uFloor.value=originals[i];});
      const clean=capture();
      let changedPixels=0,positiveBrightnessDifference=0,negativeBrightnessDifference=0;
      for(let i=0;i<reference.raw.length;i+=4){
        const diff=(reference.raw[i]-clean.raw[i])+
          (reference.raw[i+1]-clean.raw[i+1])+
          (reference.raw[i+2]-clean.raw[i+2]);
        if(Math.abs(diff)>3)changedPixels++;
        if(diff>0)positiveBrightnessDifference+=diff;
        else negativeBrightnessDifference-=diff;
      }
      return {referencePNG:reference.png,cleanPNG:clean.png,
        changedPixels,positiveBrightnessDifference,negativeBrightnessDifference,
        floors:originals,glError:gl.getError()};
    }finally{
      keys.forEach((k,i)=>{mats[k].uniforms.uFloor.value=originals[i];});
    }
  });
  fs.writeFileSync(path.join(out,'map1-fixed-camera-unfaded.png'),
    Buffer.from(ab.referencePNG,'base64'));
  fs.writeFileSync(path.join(out,'map1-fixed-camera-q-clean.png'),
    Buffer.from(ab.cleanPNG,'base64'));
  delete ab.referencePNG;delete ab.cleanPNG;
  assert.deepEqual(ab.floors,[.35,.22,.24],
    'Q keeps nonzero distant safety navigation visibility');
  assert(ab.changedPixels>10,'Q change must measurably affect actual pixels');
  assert(ab.positiveBrightnessDifference>ab.negativeBrightnessDifference,
    'Q must reduce distant brightness in the identical frozen frame');
  assert.equal(ab.glError,0);

  const dynamic=await page.evaluate(()=>{
   const previous=state.routeProgress;
   state.routeProgress=3210;updateVisibleCorridor();
   const rail=corridorGuideGroup.userData.railMaterial.uniforms.uProgress.value;
   const ring=corridorGuideGroup.userData.ringMaterial.uniforms.uProgress.value;
   const major=corridorGuideGroup.userData.majorRingMaterial.uniforms.uProgress.value;
   const hint=corridorGuideGroup.userData.boundaryHintMat.uniforms.uProgress.value;
   const danger=corridorGuideGroup.userData.boundaryDangerMat.uniforms.uProgress.value;
   state.routeProgress=previous;updateVisibleCorridor();
   return [rail,ring,major,hint,danger];
  });
  assert.deepEqual(dynamic,[3210,3210,3210,3210,3210],'all fade uniforms must follow player');
  await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
  });
  const map4=await sample('Map4');
  fs.writeFileSync(path.join(out,'map4-protected-720p.png'),Buffer.from(map4.png,'base64'));
  delete map4.png;
  assert.equal(map4.map1RaceVisible,false);
  assert.equal(map4.map4CombatVisible,true);
  assert.deepEqual(map4.physics,[6,36,200]);
  assert.deepEqual(map4.parts,[189,249]);
  assert.equal(map4.glError,0);
  assert.deepEqual(errors,[],errors.join('\n'));
  const report={pass:true,id:'NEXT11C20Q',map1,map4,ab,errors,
    note:'renderer calls from a frozen frame, NOT measured native GPU FPS'};
  fs.writeFileSync(path.join(out,'distance-clarity-qa.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C20Q REAL WEBGL A/B PASS '+JSON.stringify({
   railBatches:map1.rails,railSegments:map1.railOriginalSegments,
   ringBatches:map1.rings,map1Calls:map1.calls,map4Calls:map4.calls,
   parts:map1.parts,changedPixels:ab.changedPixels,brightnessReduction:ab.positiveBrightnessDifference-ab.negativeBrightnessDifference}));
 }finally{await browser.close();}
})().catch(err=>{
 fs.writeFileSync(path.join(out,'qa-error.txt'),String(err.stack||err));
 console.error(err.stack||err);process.exitCode=1;
});
