// MAP2-17 measure current Map4-derived route coverage and industrial source extent
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof buildPlanetaryWorld==='function');
  await page.locator('#map-choice-2').click(); await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const report=await page.evaluate(()=>{
    const roots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_')) roots.push(o);
      else if(o.userData?.map2ExactMap4CityClone&&o.name?.startsWith('MAP2_EXACT_MAP4_CITY_DISTRICT_AT_')) roots.push(o);
      else if(o.userData?.map2ExactMap4LandmarkClone&&o.name?.startsWith('MAP2_EXACT_MAP4_LANDMARK_')) roots.push(o);
      else if(o.userData?.map2ExactMap4CorridorClone&&o.name?.startsWith('MAP2_EXACT_MAP4_FINAL_CORRIDOR_AT_')) roots.push(o);
    });
    scene.updateMatrixWorld(true);
    const boxes=roots.map(r=>new THREE.Box3().setFromObject(r)).filter(b=>!b.isEmpty());
    const step=250,threshold=650;
    let samples=0,covered=0,fastSamples=0,fastCovered=0;
    for(let d=0;d<=MAP2_DISTANCE;d+=step){
      samples++;
      const p=getRaceFrameAtDistance(d).center;
      const hit=boxes.some(b=>b.distanceToPoint(p)<=threshold);
      if(hit)covered++;
      if(map2Segment(d).kind==='FAST'){fastSamples++;if(hit)fastCovered++;}
    }
    const source=planetaryWorldRegions[2].children.find(o=>o.name==='MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS');
    const box=source?new THREE.Box3().setFromObject(source):null;
    const sphere=source?new THREE.Sphere():null;
    if(box&&sphere)box.getBoundingSphere(sphere);
    let meshes=0,instanced=0;
    if(source)source.traverse(o=>{if(o.isMesh||o.isInstancedMesh){meshes++;if(o.isInstancedMesh)instanced++;}});
    return {
      distance:MAP2_DISTANCE,step,threshold,samples,covered,
      coveragePct:covered/samples*100,
      fastSamples,fastCovered,fastCoveragePct:fastSamples?fastCovered/fastSamples*100:0,
      roots:roots.length,
      source:{
        found:!!source,meshes,instanced,
        boxSize:box?box.getSize(new THREE.Vector3()).toArray():null,
        sphereRadius:sphere?sphere.radius:null,
        regionFrom:PLANETARY_REGIONS[2].from,
        regionTo:PLANETARY_REGIONS[2].to,
        regionSpan:PLANETARY_REGIONS[2].to-PLANETARY_REGIONS[2].from
      }
    };
  });
  console.log('MAP2-17 COVERAGE '+JSON.stringify(report));
 } finally { await browser.close(); }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
