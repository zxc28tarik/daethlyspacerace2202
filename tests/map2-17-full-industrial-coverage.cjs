// MAP2-17 full 985-mesh Map4 industrial visual district reuse + coverage QA
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2_EXACT_MAP4_INDUSTRIAL_VISUAL_DISTRICT_AT_'));
assert(html.includes('MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS'));

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof buildPlanetaryWorld==='function');
  await page.locator('#map-choice-2').click(); await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const source=planetaryWorldRegions[2].children.find(o=>o.name==='MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS');
    const roots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4IndustrialVisualClone&&o.name?.startsWith('MAP2_EXACT_MAP4_INDUSTRIAL_VISUAL_DISTRICT_AT_'))roots.push(o);
    });
    const sm=[];source.traverse(o=>{if(o.isMesh||o.isInstancedMesh)sm.push(o)});
    let pairs=0,sameGeo=0,sameMat=0,physical=0;
    for(const root of roots){
      const cm=[];root.traverse(o=>{if(o.isMesh||o.isInstancedMesh)cm.push(o)});
      const n=Math.min(sm.length,cm.length);pairs+=n;
      for(let i=0;i<n;i++){
        if(sm[i].geometry===cm[i].geometry)sameGeo++;
        if(sm[i].material===cm[i].material)sameMat++;
        if(cm[i].userData?.h4Collider||cm[i].userData?.h4CityPhysical)physical++;
      }
    }

    // Same coverage definition as the pre-paste scan. FAST is intentionally open,
    // so effective road fill counts only structure-covered non-FAST samples.
    const allRoots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_')) allRoots.push(o);
      else if(o.userData?.map2ExactMap4CityClone&&o.name?.startsWith('MAP2_EXACT_MAP4_CITY_DISTRICT_AT_')) allRoots.push(o);
      else if(o.userData?.map2ExactMap4LandmarkClone&&o.name?.startsWith('MAP2_EXACT_MAP4_LANDMARK_')) allRoots.push(o);
      else if(o.userData?.map2ExactMap4CorridorClone&&o.name?.startsWith('MAP2_EXACT_MAP4_FINAL_CORRIDOR_AT_')) allRoots.push(o);
      else if(o.userData?.map2ExactMap4IndustrialVisualClone&&o.name?.startsWith('MAP2_EXACT_MAP4_INDUSTRIAL_VISUAL_DISTRICT_AT_')) allRoots.push(o);
    });
    scene.updateMatrixWorld(true);
    const boxes=allRoots.map(r=>new THREE.Box3().setFromObject(r)).filter(b=>!b.isEmpty());
    const step=250,threshold=650;
    let samples=0,covered=0,fastSamples=0,fastCovered=0,nonFastCovered=0;
    for(let d=0;d<=MAP2_DISTANCE;d+=step){
      samples++;
      const p=getRaceFrameAtDistance(d).center;
      const hit=boxes.some(b=>b.distanceToPoint(p)<=threshold);
      const fast=map2Segment(d).kind==='FAST';
      if(hit)covered++;
      if(fast){fastSamples++;if(hit)fastCovered++;}
      else if(hit)nonFastCovered++;
    }
    const root=roots[0]||null;
    const target=root?.userData.map2TargetDistance??null;
    const span=root?.userData.sourceSpan??null;
    const spanKinds=[];
    if(target!==null&&span!==null){
      for(let x=-span/2;x<=span/2;x+=1000)spanKinds.push(map2Segment(target+x).kind);
    }
    return {
      sourceMeshes:sm.length,roots:roots.length,pairs,sameGeo,sameMat,physical,
      target,span,spanKinds,
      coverage:{
        distance:MAP2_DISTANCE,step,threshold,samples,covered,
        rawPct:covered/samples*100,
        fastSamples,fastCovered,
        effectivePct:nonFastCovered/samples*100,
        nonFastPct:nonFastCovered/(samples-fastSamples)*100
      },
      stats:window.starbladeMap2Layout?.visualStage||null,
      map4Visible:planetaryWorldGroup.visible
    };
  });
  console.log('MAP2-17 FINAL '+JSON.stringify(info));
  assert.equal(info.sourceMeshes,985,'the complete Map4 industrial visual group must remain 985 meshes');
  assert.equal(info.roots,1,'paste the full industrial district exactly once');
  assert.equal(info.pairs,985);
  assert.equal(info.sameGeo,985,'all industrial geometry must be exact source geometry');
  assert.equal(info.sameMat,985,'all industrial materials must be exact source materials');
  assert.equal(info.physical,0,'Map4 collision metadata must not leak into Map2');
  assert(info.spanKinds.length>=20&&info.spanKinds.every(k=>k!=='FAST'),'the full 20 km industrial district must stay outside FAST zones');
  assert(info.coverage.effectivePct>=70&&info.coverage.effectivePct<=80,
    'effective route building fill must remain in the requested 70-80% band');
  assert(info.stats?.exactMap4IndustrialVisualClones===1);
  assert(info.stats?.exactMap4IndustrialVisualMeshes===985);
  assert.equal(info.map4Visible,false);

  const evidence=path.join(__dirname,'map2-17-evidence');fs.mkdirSync(evidence,{recursive:true});
  await page.evaluate(p=>{state.routeProgress=Math.max(0,p-1800);state.laneX=0;state.laneY=80;state.paused=true;map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);},info.target);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-full-map4-industrial-district-on-map2.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-17 full 985-mesh Map4 industrial district + 70-80 coverage');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
