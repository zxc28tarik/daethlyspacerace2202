/* NEXT11C20T: controlled real Chromium WebGL AA/motion-shimmer quality budget.
   Render same actual Map1 scene at native MSAA 1x and internal 2x
   downsampled reference. Pure diagnostic -- no production renderer changes,
   no fake FPS / native GPU claims. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c20t-evidence');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[];
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1280,height:720},
   deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('console',m=>{if(m.type()==='error'&&/shader|webglprogram/i.test(m.text()))errors.push(m.text());});
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof startGame==='function' &&
   !!corridorGuideGroup&&!!h4Ship19Race&&!!h4Ship19Combat,
   null,{timeout:25000});
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1 &&
   state.raceTime>.02,null,{timeout:30000});
  await page.evaluate(()=>{
   state.paused=true;
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
  });
  const baseline=await page.evaluate(()=>{
   const gl=renderer.getContext();
   return {antialias:!!gl.getContextAttributes().antialias,
    isWebGL2:typeof WebGL2RenderingContext!=='undefined' &&
      gl instanceof WebGL2RenderingContext,
    playerParts:h4Ship19Race.userData.parts,
    combatParts:h4Ship19Combat.userData.parts,
    ringBatches:corridorGuideGroup.userData.ringBatchCount,
    rings:corridorGuideGroup.userData.ringOriginalCount,
    railSegments:corridorGuideGroup.userData.railOriginalSegments,
    railBatches:corridorGuideGroup.userData.railBatchCount,
    guideDrawables:corridorGuideGroup.children.length,
    map:state.activeMap,
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length]};
  });
  assert.equal(baseline.antialias,true,'existing renderer must have WebGL MSAA enabled');
  assert.deepEqual([baseline.playerParts,baseline.combatParts],[189,249]);
  assert.deepEqual([baseline.ringBatches,baseline.rings],[10,192]);
  assert.deepEqual([baseline.railSegments,baseline.railBatches],[6960,20]);
  assert.equal(baseline.guideDrawables,46);
  assert.deepEqual(baseline.physics,[0,0,0]);

  // One evaluate per fixed viewport/location to bound retained framebuffer memory.
  // ±6m samples move only the diagnostic camera/progress, not actual gameplay.
  const cases=[
   {width:1280,height:720,location:12500},
   {width:1280,height:720,location:27500},
   {width:1920,height:1080,location:12500},
   {width:1920,height:1080,location:27500}
  ];
  const report={pass:false,id:'NEXT11C20T',
   context:'GitHub Actions Chromium / SwiftShader software WebGL',
   caveat:'1.25x/1.5x/2x internal-resolution diagnostic comparisons ONLY: not production game FPS, not native physical-GPU performance, not temporal AA. Camera motion contributes to the pixel-change metric.',
   baseline,records:[],errors};
  for(const spec of cases){
   const result=await page.evaluate(({width,height,location})=>{
    const gl=renderer.getContext();
    const qualities=[
      {label:'native-msaa',factor:1},
      {label:'1.25x-reference',factor:1.25},
      {label:'1.5x-reference',factor:1.5},
      {label:'2x-reference',factor:2}
    ];
    const progressOffsets=[-6,0,6];
    function renderQuality(quality,progress){
      const internalW=width*quality.factor,internalH=height*quality.factor;
      renderer.setPixelRatio(1);
      renderer.setSize(internalW,internalH,false);
      camera.aspect=width/height;
      camera.updateProjectionMatrix();
      const frame=getRaceFrameAtDistance(progress);
      camera.position.copy(frame.center)
        .addScaledVector(frame.tangent,-350)
        .addScaledVector(frame.up,115);
      camera.up.copy(frame.up);
      camera.lookAt(frame.center.clone().addScaledVector(frame.tangent,1000));
      camera.updateMatrixWorld(true);
      state.routeProgress=progress;
      updateVisibleCorridor();
      // renderer.render is the original game renderer. No synthetic drawing.
      const t0=performance.now();
      renderer.render(scene,camera);gl.finish();
      const elapsed=performance.now()-t0;
      const attr=gl.getContextAttributes();
      const raw=new Uint8Array(internalW*internalH*4);
      gl.readPixels(0,0,internalW,internalH,gl.RGBA,gl.UNSIGNED_BYTE,raw);
      const err=gl.getError();
      const upsideDown=new Uint8ClampedArray(raw.length);
      const row=internalW*4;
      for(let y=0;y<internalH;y++)
        upsideDown.set(raw.subarray(y*row,(y+1)*row),(internalH-1-y)*row);
      const source=document.createElement('canvas');
      source.width=internalW;source.height=internalH;
      source.getContext('2d').putImageData(new ImageData(upsideDown,internalW,internalH),0,0);
      let finalCanvas=source;
      if(quality.factor!==1){
       finalCanvas=document.createElement('canvas');
       finalCanvas.width=width;finalCanvas.height=height;
       const ctx=finalCanvas.getContext('2d');
       ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
       ctx.drawImage(source,0,0,width,height);
      }
      const pixels=finalCanvas.getContext('2d').getImageData(0,0,width,height).data;
      return {pixels,png:progress===location?
        finalCanvas.toDataURL('image/png').split(',')[1]:null,
        elapsed,internal:[internalW,internalH],
        calls:renderer.info.render.calls,lines:renderer.info.render.lines,
        triangles:renderer.info.render.triangles,
        antialias:!!attr.antialias,glError:err};
    }
    const outputs=[];
    for(const q of qualities){
     const samples=[];
     for(const offset of progressOffsets)
      samples.push(renderQuality(q,location+offset));
     const brightness=f=>{let lit=0,lum=0;
      for(let k=0;k<f.length;k+=4){
       const v=(f[k]+f[k+1]+f[k+2])/3;
       if(v>12){lit++;lum+=v;}
      }
      return {lit,meanLitBrightness:lit?lum/lit:0};
     };
     let jitterAll=0,jitterLit=0,nLit=0;
     for(let step=0;step<2;step++){
      const a=samples[step].pixels,b=samples[step+1].pixels;
      for(let i=0;i<a.length;i+=4){
       const va=(a[i]+a[i+1]+a[i+2])/3;
       const vb=(b[i]+b[i+1]+b[i+2])/3;
       const delta=Math.abs(va-vb);
       jitterAll+=delta;
       if(va>12||vb>12){jitterLit+=delta;nLit++;}
      }
     }
     outputs.push({
      quality:q.label,
      shimmerMeanAllPixels:+(jitterAll/(width*height*2)).toFixed(5),
      shimmerMeanLitPixels:+(jitterLit/Math.max(1,nLit)).toFixed(5),
      lit:brightness(samples[1].pixels),
      renderTimesMs:samples.map(s=>+s.elapsed.toFixed(2)),
      internal:samples[1].internal,
      calls:samples[1].calls,lines:samples[1].lines,
      triangles:samples[1].triangles,
      antialias:samples[1].antialias,
      errors:samples.map(s=>s.glError),
      png:samples[1].png,
      pixels:samples[1].pixels
     });
    }
    const first=outputs[0].pixels;
    const comparisons=[];
    for(let q=1;q<outputs.length;q++){
      const second=outputs[q].pixels;
      let changed=0,absChange=0;
      for(let i=0;i<first.length;i+=4){
        const delta=Math.abs(first[i]-second[i])+
          Math.abs(first[i+1]-second[i+1])+Math.abs(first[i+2]-second[i+2]);
        if(delta>5)changed++;
        absChange+=delta;
      }
      comparisons.push({quality:outputs[q].quality,
        pixelAreaFactor:qualities[q].factor*qualities[q].factor,
        changedPixels:changed,totalRGBDelta:absChange,
        shimmerImprovementPct:+(100*(1-outputs[q].shimmerMeanLitPixels/
          Math.max(.00001,outputs[0].shimmerMeanLitPixels))).toFixed(2)});
    }
    const keys=outputs.map(q=>{
      const {pixels,...rest}=q;return rest;
    });
    return {location,width,height,qualities:keys,comparisons};

   },spec);
   assert.equal(result.qualities.length,4);
   const factors=[1,1.25,1.5,2];
   const native=result.qualities[0];
   for(let i=0;i<4;i++){
     const q=result.qualities[i];
     assert.deepEqual(q.internal,[spec.width*factors[i],spec.height*factors[i]]);
     assert(q.antialias===true,'the original GL context must request antialiasing');
     assert(q.lines>100 && q.calls>0);
     assert(q.lit.lit>1000);
     assert(q.errors.every(e=>e===0),'no WebGL failures at any supersample factor');
     assert(q.renderTimesMs.every(t=>Number.isFinite(t)&&t>=0));
   }
   assert(result.qualities.every(q=>q.calls===native.calls),
      'supersampling must not add geometric objects/draw calls');
   assert(result.qualities.every(q=>q.lines===native.lines),
      'supersampling must not remove original rail geometry');
   assert.equal(result.comparisons.length,3);
   for(let i=0;i<3;i++){
     assert(result.comparisons[i].changedPixels>100,
        'the same original scene must contain visible subpixel differences');
     assert.equal(result.comparisons[i].pixelAreaFactor,factors[i+1]**2);
   }

   const mosaic=await page.evaluate(async ({width,height,encoded})=>{
     const canvas=document.createElement('canvas');
     canvas.width=width*2;canvas.height=height*2+56;
     const ctx=canvas.getContext('2d');
     ctx.fillStyle='#081323';ctx.fillRect(0,0,canvas.width,canvas.height);
     const images=await Promise.all(encoded.map(raw=>new Promise((resolve,reject)=>{
       const picture=new Image();picture.onload=()=>resolve(picture);
       picture.onerror=reject;picture.src='data:image/png;base64,'+raw;
     })));
     const labels=[
       'ORIGINAL 1.00x MSAA','REFERENCE 1.25x (1.56x pixels)',
       'REFERENCE 1.50x (2.25x pixels)','REFERENCE 2.00x (4.00x pixels)'
     ];
     for(let i=0;i<images.length;i++){
       const x=(i%2)*width,y=Math.floor(i/2)*(height+28);
       ctx.fillStyle='#d9ecff';ctx.font='bold 14px sans-serif';
       ctx.fillText(labels[i],x+12,y+20);
       ctx.drawImage(images[i],x,y+28,width,height);
     }
     return canvas.toDataURL('image/png').split(',')[1];
   },{width:spec.width,height:spec.height,
      encoded:result.qualities.map(q=>q.png)});
   const prefix='map1-'+spec.location+'-'+spec.width+'x'+spec.height;
   fs.writeFileSync(path.join(out,prefix+'-four-levels.png'),
      Buffer.from(mosaic,'base64'));
   for(const quality of result.qualities)delete quality.png;
   report.records.push(result);
   console.log('NEXT11C20T FOUR-LEVELS '+JSON.stringify({
     location:spec.location,resolution:spec.width+'x'+spec.height,
     baselineShimmer:native.shimmerMeanLitPixels,
     comparisons:result.comparisons,
     calls:result.qualities.map(q=>q.calls),
     lines:result.qualities.map(q=>q.lines),
     sampledMs:result.qualities.map(q=>q.renderTimesMs)
   }));
  }
  await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
  });
  const map4=await page.evaluate(()=>{
   renderer.setPixelRatio(1);
   renderer.setSize(1280,720,false);
   camera.aspect=1280/720;camera.updateProjectionMatrix();
   renderer.render(scene,camera);
   return {map:state.activeMap,parts:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts],
    raceVisible:h4Ship19Race.visible,combatVisible:h4Ship19Combat.visible,
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length],calls:renderer.info.render.calls};
  });
  assert.deepEqual(map4.parts,[189,249]);
  assert.deepEqual(map4.colliders,[6,36,200]);
  assert.equal(map4.raceVisible,false);
  assert.equal(map4.combatVisible,true);
  assert(map4.calls>0);
  assert.deepEqual(errors,[],errors.join('\n'));
  report.map4=map4;
  report.pass=true;
  fs.writeFileSync(path.join(out,'aa-motion-report.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C20T CHROMIUM QUALITY BASELINE PASS '+JSON.stringify({
   res:['720p','1080p'],locations:[12500,27500],qualityFactors:[1,1.25,1.5,2],
   aaEnabled:baseline.antialias,ABCaptures:report.records.length*4,
   originalRailSegments:baseline.railSegments,parts:[189,249],
   runtimeChanged:false,nativeGPUValidated:false}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'qa-error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
