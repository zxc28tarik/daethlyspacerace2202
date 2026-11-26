/* NEXT11C20S: controlled real Chromium WebGL AA/motion-shimmer quality budget.
   Render same actual Map1 scene at native MSAA 1x and internal 2x
   downsampled reference. Pure diagnostic -- no production renderer changes,
   no fake FPS / native GPU claims. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c20s-evidence');
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
  const report={pass:false,id:'NEXT11C20S',
   context:'GitHub Actions Chromium / SwiftShader software WebGL',
   caveat:'Offscreen 2x supersampled 2D-downsample comparison is diagnostic ONLY. Not production game FPS or an enabled new quality mode.',
   baseline,records:[],errors};
  for(const spec of cases){
   const result=await page.evaluate(({width,height,location})=>{
    const gl=renderer.getContext();
    const qualities=[{label:'native-msaa',factor:1},{label:'2x-reference',factor:2}];
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
    const first=outputs[0].pixels,second=outputs[1].pixels;
    let changed=0,absChange=0;
    for(let i=0;i<first.length;i+=4){
     const delta=Math.abs(first[i]-second[i])+
      Math.abs(first[i+1]-second[i+1])+Math.abs(first[i+2]-second[i+2]);
     if(delta>5)changed++;
     absChange+=delta;
    }
    const keys=outputs.map(q=>{
     const {pixels,...rest}=q;return rest;
    });
    return {location,width,height,qualities:keys,changedPixels:changed,
     totalRGBDelta:absChange};
   },spec);
   const [native,reference]=result.qualities;
   assert.deepEqual(native.internal,[spec.width,spec.height]);
   assert.deepEqual(reference.internal,[spec.width*2,spec.height*2]);
   assert(native.antialias&&reference.antialias);
   assert(native.lines>100&&reference.lines>100,
     'actual course guide lines should render at both resolutions');
   assert(native.calls>0&&reference.calls>0);
   assert(native.lit.lit>1000&&reference.lit.lit>1000);
   assert(native.errors.every(e=>e===0)&&reference.errors.every(e=>e===0));
   assert(result.changedPixels>100,'A/B must exercise true subpixel quality difference');
   const compose=await page.evaluate(({width,height,left,right})=>{
    const compose=document.createElement('canvas');
    compose.width=width*2;compose.height=height+28;
    const ctx=compose.getContext('2d');
    const a=new Image(),b=new Image();
    return Promise.all([new Promise(ok=>{a.onload=ok;a.src='data:image/png;base64,'+left;}),
                        new Promise(ok=>{b.onload=ok;b.src='data:image/png;base64,'+right;})])
     .then(()=>{
       ctx.fillStyle='#101b30';ctx.fillRect(0,0,compose.width,28);
       ctx.fillStyle='#ffffff';ctx.font='bold 13px sans-serif';
       ctx.fillText('Original native MSAA (runtime)',12,19);
       ctx.fillText('2x internal supersampled (diagnostic only)',width+12,19);
       ctx.drawImage(a,0,28);ctx.drawImage(b,width,28);
       return compose.toDataURL('image/png').split(',')[1];
     });
   },{width:spec.width,height:spec.height,left:native.png,right:reference.png});
   const prefix='map1-'+spec.location+'-'+spec.width+'x'+spec.height;
   fs.writeFileSync(path.join(out,prefix+'-native-vs-2x-reference.png'),
    Buffer.from(compose,'base64'));
   delete native.png;delete reference.png;
   report.records.push(result);
   console.log('NEXT11C20S MEASURE '+JSON.stringify({
    location:spec.location,resolution:spec.width+'x'+spec.height,
    changedPixels:result.changedPixels,
    nativeJitter:native.shimmerMeanLitPixels,
    referenceJitter:reference.shimmerMeanLitPixels,
    nativeRenderMs:native.renderTimesMs,
    referenceRenderMs:reference.renderTimesMs,
    calls:[native.calls,reference.calls],lines:[native.lines,reference.lines]
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
  console.log('NEXT11C20S CHROMIUM QUALITY BASELINE PASS '+JSON.stringify({
   res:['720p','1080p'],locations:[12500,27500],
   aaEnabled:baseline.antialias,ABCaptures:report.records.length,
   originalRailSegments:baseline.railSegments,parts:[189,249],
   runtimeChanged:false,nativeGPUValidated:false}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'qa-error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
