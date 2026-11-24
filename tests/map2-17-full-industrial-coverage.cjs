// MAP2-17 split-and-paste full 985-mesh Map4 industrial district + coverage QA
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2_EXACT_MAP4_INDUSTRIAL_PART_'));
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
    const sourceMeshes=[];source.traverse(o=>{if(o.isMesh||o.isInstancedMesh)sourceMeshes.push(o)});

    const parts=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4IndustrialVisualPart&&o.name?.startsWith('MAP2_EXACT_MAP4_INDUSTRIAL_PART_'))parts.push(o);
    });
    const cloneMeshes=[];
    for(const root of parts)root.traverse(o=>{if(o.isMesh||o.isInstancedMesh)cloneMeshes.push(o)});

    const matKey=m=>Array.isArray(m)?m.map(x=>x.uuid).join(','):m?.uuid||'none';
    const sig=o=>(o.geometry?.uuid||'nogeo')+'|'+matKey(o.material);
    const sourceCounts=new Map(),cloneCounts=new Map();
    for(const o of sourceMeshes)sourceCounts.set(sig(o),(sourceCounts.get(sig(o))||0)+1);
    for(const o of cloneMeshes)cloneCounts.set(sig(o),(cloneCounts.get(sig(o))||0)+1);
    let identityMatch=true;
    if(sourceCounts.size!==cloneCounts.size)identityMatch=false;
    for(const [k,v] of sourceCounts)if(cloneCounts.get(k)!==v)identityMatch=false;

    const targetRows=parts.map(o=>({
      d:o.userData.map2TargetDistance,
      chunk:o.userData.sourceChunk,
      chunkCenter:o.userData.map2ChunkCenter,
      seg:map2Segment(o.userData.map2TargetDistance).kind
    }));
    const chunkCenters=[...new Set(targetRows.map(x=>x.chunkCenter))].sort((a,b)=>a-b);
    const chunkKinds=chunkCenters.map(c=>{
      const kinds=[];
      for(let x=-2500;x<=2500;x+=500)kinds.push(map2Segment(c+x).kind);
      return {c,kinds};
    });

    const allRoots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_')) allRoots.push(o);
      else if(o.userData?.map2ExactMap4CityClone&&o.name?.startsWith('MAP2_EXACT_MAP4_CITY_DISTRICT_AT_')) allRoots.push(o);
      else if(o.userData?.map2ExactMap4LandmarkClone&&o.name?.startsWith('MAP2_EXACT_MAP4_LANDMARK_')) allRoots.push(o);
      else if(o.userData?.map2ExactMap4CorridorClone&&o.name?.startsWith('MAP2_EXACT_MAP4_FINAL_CORRIDOR_AT_')) allRoots.push(o);
      else if(o.userData?.map2ExactMap4IndustrialVisualPart&&o.name?.startsWith('MAP2_EXACT_MAP4_INDUSTRIAL_PART_')) allRoots.push(o);
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

    let physical=0;
    for(const root of parts)root.traverse(o=>{
      if((o.isMesh||o.isInstancedMesh)&&(o.userData?.h4Collider||o.userData?.h4CityPhysical))physical++;
    });

    return {
      sourceMeshes:sourceMeshes.length,
      partRoots:parts.length,
      cloneMeshes:cloneMeshes.length,
      identityMatch,
      targetRows,
      chunkCenters,
      chunkKinds,
      physical,
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
  assert.equal(info.sourceMeshes,985,'source industrial group must remain 985 meshes');
  assert.equal(info.cloneMeshes,985,'all 985 source meshes must be pasted exactly once');
  assert(info.partRoots>=20,'industrial source should be split into many authored direct-child parts');
  assert.equal(info.identityMatch,true,'geometry/material multiset must remain identical to Map4 source');
  assert.equal(info.physical,0,'Map4 collision metadata must not leak into Map2');
  assert.equal(info.chunkCenters.length,5,'the 20 km source must be packed into five TECH chunks');
  assert(info.targetRows.every(x=>x.seg!=='FAST'),'every pasted industrial part must land outside FAST');
  assert(info.chunkKinds.every(x=>x.kinds.every(k=>k!=='FAST')),'each full industrial chunk window must stay TECH');
  assert(info.coverage.effectivePct>=70&&info.coverage.effectivePct<=80,
    'effective route building fill must stay in requested 70-80% band');
  assert.equal(info.stats?.exactMap4IndustrialVisualMeshes,985);
  assert.equal(info.stats?.exactMap4IndustrialVisualParts,info.partRoots);
  assert.equal(info.map4Visible,false);

  const evidence=path.join(__dirname,'map2-17-evidence');fs.mkdirSync(evidence,{recursive:true});
  const target=info.chunkCenters[Math.floor(info.chunkCenters.length/2)];
  await page.evaluate(p=>{state.routeProgress=Math.max(0,p-1500);state.laneX=0;state.laneY=80;state.paused=true;map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);},target);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-map4-industrial-parts-on-map2.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-17 all 985 Map4 industrial meshes + 70-80 effective coverage');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
