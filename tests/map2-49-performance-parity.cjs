'use strict';
// MAP2-49: matched-headless-browser A/B measurement, not a local user's FPS guarantee.
// Baseline HTML comes from the feature branch's merge base with main.
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const baseline=path.resolve(process.env.MAP2_BASELINE_HTML||'tests/map2-49-baseline.html');
const candidate=path.resolve('index.html');
const evidence=path.join(__dirname,'map2-49-evidence');
fs.mkdirSync(evidence,{recursive:true});
assert(fs.existsSync(baseline),'Provide a version-controlled Map2 baseline HTML');
function median(values){const a=[...values].sort((x,y)=>x-y);return (a[(a.length-1)>>1]+a[a.length>>1])/2;}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage',
  '--enable-precise-memory-info'
 ]});
 const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
 async function measure(file,variant,trial){
  const context=await browser.newContext({viewport:{width:1280,height:720}});
  const page=await context.newPage();
  const pageErrors=[];page.on('pageerror',e=>pageErrors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({
   status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({
   status:200,contentType:'text/javascript',body:''}));
  try{
   const launchTime=Date.now();
   await page.goto(pathToFileURL(file).toString(),{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>typeof map2BuildCourse==='function',null,{timeout:90000});
   const menuTime=Date.now()-launchTime;
   await page.locator('#map-choice-2').click();
   await page.waitForFunction(()=>state.activeMap==='map2'&&window.starbladeMap2WideUrbanCourse&&
    window.starbladeMap2Layout?.gates>=50,null,{timeout:150000});
   const courseTime=Date.now()-launchTime;
   await page.locator('#start-btn').click({timeout:150000});
   await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:150000});
   const playableTime=Date.now()-launchTime;
   // Steady in-game animation after a short warm-up; same software-GPU CI hardware.
   await page.waitForTimeout(600);
   const fps=await page.evaluate(()=>new Promise(resolve=>{
    let first=null,frames=0,prev=null,longest=0,sum=0;
    const tick=now=>{
     if(first===null)first=now;
     if(prev!==null){const dt=now-prev;longest=Math.max(longest,dt);sum+=dt;}
     prev=now;frames++;
     if(now-first>=4500)return resolve({
      fps:Math.round(1000*(frames-1)/(now-first)*10)/10,
      worstFrameMs:Math.round(longest*10)/10,
      sampledFrames:frames-1,durationMs:Math.round(now-first)
     });
     requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
   }));
   const stats=await page.evaluate(()=>{
    let mesh=0,instance=0;
    map2CourseGroup.traverse(o=>{if(o.isMesh||o.isInstancedMesh)mesh++;if(o.isInstancedMesh)instance+=o.count;});
    const gl=(typeof renderer!=='undefined'&&renderer?.info)?renderer.info:null;
    return {
     map4WorldRegions:planetaryWorldRegions.length,routeLength:MAP2_DISTANCE,
     gates:map2Gates.length,physical:(window.starbladeMap2BuildingColliders||[]).length,
     meshes:mesh,instances:instance,
     rendererGeometries:gl?.memory.geometries??null,
     rendererTextures:gl?.memory.textures??null,
     rendererDrawCalls:gl?.render.calls??null,
     jsHeapBytes:performance.memory?.usedJSHeapSize??null,
     independentSource:window.starbladeMap2IndependentAssets?.mode||'LEGACY_MAP4_SOURCE'
    };
   });
   assert.equal(stats.routeLength,175000);
   assert.equal(stats.gates,59);
   assert.equal(pageErrors.length,0,'Browser JavaScript errors: '+JSON.stringify(pageErrors));
   return {variant,trial,menuTimeMs:menuTime,courseTimeMs:courseTime,
    playableTimeMs:playableTime,fps,...stats};
  }finally{await context.close();}
 }
 try{
  const rows=[];
  for(let trial=1;trial<=2;trial++){
   for(const [variant,file] of [['baseline',baseline],['independent',candidate]]){
    const row=await measure(file,variant,trial);
    rows.push(row);
    console.log('MAP2-49 PERF SAMPLE '+JSON.stringify(row));
   }
  }
  const summary={note:'Software-rendered Chromium CI; FPS is comparative only, not player hardware FPS. GPU VRAM cannot be measured by this harness.',
   results:{},samples:rows};
  for(const variant of ['baseline','independent']){
   const arr=rows.filter(x=>x.variant===variant);
   summary.results[variant]={
    medianMenuTimeMs:median(arr.map(x=>x.menuTimeMs)),
    medianCourseTimeMs:median(arr.map(x=>x.courseTimeMs)),
    medianPlayableTimeMs:median(arr.map(x=>x.playableTimeMs)),
    medianFps:median(arr.map(x=>x.fps)),
    medianHeapBytes:arr.every(x=>x.jsHeapBytes!=null)?median(arr.map(x=>x.jsHeapBytes)):null,
    map4WorldRegions:arr[0].map4WorldRegions,meshes:arr[0].meshes,instances:arr[0].instances
   };
  }
  assert(summary.results.baseline.map4WorldRegions>=4,'Control build must construct hidden Map4');
  assert.equal(summary.results.independent.map4WorldRegions,0,'Independent Map2 must not build Map4');
  fs.writeFileSync(path.join(evidence,'comparison.json'),JSON.stringify(summary,null,2));
  console.log('PASS MAP2-49 A/B benchmark '+JSON.stringify(summary.results));
 }finally{await browser.close();}
})().catch(error=>{console.error(error.stack||error);process.exitCode=1;});
