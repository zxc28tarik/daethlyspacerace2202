// MAP2-15 exact Map4 city district reuse QA
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2_EXACT_MAP4_CITY_DISTRICT_AT_'));
assert(html.includes("MAP4_CITY02_REAL_URBAN_DISTRICT"));
assert(html.includes('map2CloneExactMap4CityDistrict'));

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
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const roots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4CityClone&&o.name?.startsWith('MAP2_EXACT_MAP4_CITY_DISTRICT_AT_'))roots.push(o);
    });
    const source=h4City02DistrictGroup;
    const sm=[];source.traverse(o=>{if(o.isMesh||o.isInstancedMesh)sm.push(o)});
    let pairs=0,sameGeo=0,sameMat=0,sameNames=0,physicalFlags=0;
    for(const clone of roots){
      const cm=[];clone.traverse(o=>{if(o.isMesh||o.isInstancedMesh)cm.push(o)});
      const n=Math.min(sm.length,cm.length);pairs+=n;
      for(let i=0;i<n;i++){
        if(sm[i].geometry===cm[i].geometry)sameGeo++;
        if(sm[i].material===cm[i].material)sameMat++;
        if(sm[i].name===cm[i].name)sameNames++;
        if(cm[i].userData?.h4Collider||cm[i].userData?.h4CityPhysical)physicalFlags++;
      }
    }
    const placed=roots.map(o=>({
      d:o.userData.map2TargetDistance,
      side:o.userData.map2TargetSide,
      seg:map2Segment(o.userData.map2TargetDistance).kind,
      left:map2Segment(o.userData.map2TargetDistance-1800).kind,
      right:map2Segment(o.userData.map2TargetDistance+1800).kind
    }));
    return {
      sourceName:source?.name||null,sourceMeshes:sm.length,roots:roots.length,
      pairs,sameGeo,sameMat,sameNames,physicalFlags,placed,
      stats:window.starbladeMap2Layout?.visualStage||null,
      map4Visible:planetaryWorldGroup.visible,
      cityVisible:!!source?.visible
    };
  });
  console.log('MAP2-15 CITY '+JSON.stringify(info));
  assert.equal(info.sourceName,'MAP4_CITY02_REAL_URBAN_DISTRICT');
  assert(info.sourceMeshes>=90,'final Map4 city district should contain the full authored urban mesh set');
  assert(info.roots>=4,'Map2 should receive multiple full Map4 city districts');
  assert(info.pairs>=info.sourceMeshes*info.roots,'all city mesh trees must be cloned');
  assert.equal(info.sameGeo,info.pairs,'city clones must share exact source geometry');
  assert.equal(info.sameMat,info.pairs,'city clones must share exact source materials');
  assert.equal(info.sameNames,info.pairs,'city clone child identities must remain intact');
  assert.equal(info.physicalFlags,0,'Map4 city collision metadata must not become Map2 collision');
  assert(info.placed.every(x=>x.seg!=='FAST'&&x.left!=='FAST'&&x.right!=='FAST'),'city districts must stay out of FAST zones');
  assert.equal(info.map4Visible,false,'hidden authoritative Map4 world must remain hidden');
  assert(info.stats?.exactMap4CityDistrictClones===info.roots);
  assert(info.stats?.exactMap4CityMeshes===info.pairs);

  const evidence=path.join(__dirname,'map2-15-evidence');fs.mkdirSync(evidence,{recursive:true});
  const target=info.placed[0].d;
  await page.evaluate(p=>{state.routeProgress=Math.max(0,p-1450);state.laneX=0;state.laneY=80;state.paused=true;map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);},target);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-map4-city-district-on-map2.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-15 exact Map4 city district reuse');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
