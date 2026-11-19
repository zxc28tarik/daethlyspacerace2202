/* NEXT11C20N: deterministic 720p/1080p Chrome SwiftShader art budgets.
 * No FPS claims for native GPU: calls renderer.render + gl.finish.
 * The original index.html gameplay/geometry is never edited. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const outDir=path.join(__dirname,'next11c20n-perf');
fs.mkdirSync(outDir,{recursive:true});
const errors=[];
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  try{
    const page=await browser.newPage({
      viewport:{width:1280,height:720},deviceScaleFactor:1
    });
    page.on('pageerror',e=>errors.push(e.stack||e.message));
    const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
      {waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>
      typeof h4Ship20ZenitBuild==='function' &&
      typeof startGame==='function' &&
      !!h4Ship19Race &&
      !!h4Ship19Combat,
      null,{timeout:20000});
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running &&
      state.activeMap===MAP_MODES.MAP1 && state.raceTime>.02,
      null,{timeout:30000});
    // Freeze automatic game RAF, but do not change player state, AI,
    // collision rules, ship geometry or original renderer configuration.
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });
    const summary={
      id:'NEXT11C20N',
      host:'GitHub Actions Ubuntu Chromium, SwiftShader software GL',
      caveat:'This is NOT a physical GPU/FPS benchmark or end-user 5min test',
      sourceModelParts:189,
      samples:[]
    };
    const sample=async(map,width,height)=>{
      await page.setViewportSize({width,height});
      const record=await page.evaluate(({map,width,height})=>{
        if(!state.running)throw new Error('Map not running');
        const expected=map==='MAP1'?MAP_MODES.MAP1:MAP_MODES.MAP4;
        if(state.activeMap!==expected)throw new Error('Wrong active map: '+map);
        const originalPixelRatio=renderer.getPixelRatio();
        renderer.setPixelRatio(1);
        renderer.setSize(width,height);
        camera.aspect=width/height;
        camera.updateProjectionMatrix();
        const gl=renderer.getContext();
        const t=[];
        // Warm shader cache. gl.finish() synchronizes GPU command queue;
        // this is materially different from timing just JS submission.
        for(let k=0;k<3;k++){
          renderer.render(scene,camera);
          gl.finish();
        }
        for(let k=0;k<10;k++){
          const start=performance.now();
          renderer.render(scene,camera);
          gl.finish();
          t.push(performance.now()-start);
        }
        const sorted=[...t].sort((a,b)=>a-b);
        const perf={
          map,width,height,pixelRatio:renderer.getPixelRatio(),
          drawingBuffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],
          glAntialias:!!gl.getContextAttributes()?.antialias,
          calls:renderer.info.render.calls,
          triangles:renderer.info.render.triangles,
          geometryMemory:renderer.info.memory.geometries,
          textureMemory:renderer.info.memory.textures,
          medianMs:+((sorted[4]+sorted[5])/2).toFixed(2),
          p95Ms:+sorted[9].toFixed(2),
          frameTimesMs:t.map(x=>+x.toFixed(2)),
          originalPixelRatio,
          raceShipParts:h4Ship19Race.userData.parts,
          combatShipParts:h4Ship19Combat.userData.parts,
          raceShipOnly:h4Ship19Race.userData.raceOnly,
          activeMap:state.activeMap
        };
        // Read directly from WebGL framebuffer while the pixels still
        // exist. Avoid preserveDrawingBuffer:false compositor black PNG.
        if(width===1280){
          const px=new Uint8Array(width*height*4);
          gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,px);
          const flipped=new Uint8ClampedArray(px.length);
          const stride=width*4;
          for(let y=0;y<height;y++)
            flipped.set(px.subarray(y*stride,(y+1)*stride),
              (height-1-y)*stride);
          const canvas=document.createElement('canvas');
          canvas.width=width;canvas.height=height;
          canvas.getContext('2d').putImageData(
            new ImageData(flipped,width,height),0,0);
          perf.png=canvas.toDataURL('image/png').split(',')[1];
        }
        return perf;
      },{map,width,height});
      const png=record.png;
      delete record.png;
      assert.equal(record.raceShipParts,189);
      assert.equal(record.combatShipParts,249);
      assert.deepEqual(record.drawingBuffer,[width,height]);
      assert.equal(record.pixelRatio,1);
      assert(Number.isFinite(record.medianMs)&&record.medianMs>0);
      assert(Number.isFinite(record.p95Ms)&&record.p95Ms>0);
      assert(record.calls>0 && record.triangles>0 &&
        record.geometryMemory>0 && record.textureMemory>0,
        'real WebGL commands and GPU resources must be measured');
      if(png)fs.writeFileSync(
        path.join(outDir,map+'-actual-720p.png'),
        Buffer.from(png,'base64'));
      summary.samples.push(record);
      console.log('NEXT11C20N PERF '+JSON.stringify(record));
    };
    await sample('MAP1',1280,720);
    await sample('MAP1',1920,1080);
    await page.evaluate(()=>{
      state.running=false;state.paused=false;
      document.getElementById('gameover-screen').classList.add('hidden');
      document.getElementById('start-screen').classList.remove('hidden');
      selectMap(MAP_MODES.MAP4);
      startGame();
      state.paused=true;
    });
    assert.equal(await page.evaluate(()=>state.activeMap===MAP_MODES.MAP4),true);
    await sample('MAP4',1280,720);
    await sample('MAP4',1920,1080);
    summary.pageErrors=errors;
    assert.deepEqual(errors,[],errors.join('\n'));
    fs.writeFileSync(path.join(outDir,'perf-report.json'),
      JSON.stringify(summary,null,2));
    console.log('NEXT11C20N WEBGL PERF EVIDENCE PASS '+JSON.stringify({
      comparisons:summary.samples.length,
      maps:['MAP1','MAP4'],
      sizes:['1280x720','1920x1080'],
      nativeGpuValidated:false
    }));
  }finally{
    await browser.close();
  }
})().catch(e=>{
  fs.writeFileSync(path.join(outDir,'error.txt'),
    String(e.stack||e));
  console.error(e.stack||e);process.exitCode=1;
});
