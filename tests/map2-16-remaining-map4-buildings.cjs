// MAP2-16 remaining exact Map4 building transfer QA
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2_EXACT_MAP4_LANDMARK_'));
assert(html.includes('MAP2_EXACT_MAP4_FINAL_CORRIDOR_AT_'));

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
    const expected=[
      'MAP4_STONEGATE_1950','MAP4_OBSERVATION_10100','MAP4_REFINERY_17200',
      'MAP4_FACTORY_23800','MAP4_POWER_31600','MAP4_OUTPOST_36200',
      'MAP4_SPACEPORT_42600','MAP4_LAUNCH_48300'
    ];
    const landmarks=[];
    const corridors=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4LandmarkClone&&o.name?.startsWith('MAP2_EXACT_MAP4_LANDMARK_'))landmarks.push(o);
      if(o.userData?.map2ExactMap4CorridorClone&&o.name?.startsWith('MAP2_EXACT_MAP4_FINAL_CORRIDOR_AT_'))corridors.push(o);
    });
    let landmarkPairs=0,landmarkGeo=0,landmarkMat=0,landmarkPhysical=0;
    const landmarkRows=[];
    for(const clone of landmarks){
      const srcName=clone.userData.sourceMap4Landmark;
      const entry=h4WorldLandmarks.find(x=>x.group?.name===srcName);
      const sm=[],cm=[];entry.group.traverse(o=>{if(o.isMesh||o.isInstancedMesh)sm.push(o)});
      clone.traverse(o=>{if(o.isMesh||o.isInstancedMesh)cm.push(o)});
      const n=Math.min(sm.length,cm.length);landmarkPairs+=n;
      for(let i=0;i<n;i++){
        if(sm[i].geometry===cm[i].geometry)landmarkGeo++;
        if(sm[i].material===cm[i].material)landmarkMat++;
        if(cm[i].userData?.h4Collider||cm[i].userData?.h4CityPhysical)landmarkPhysical++;
      }
      landmarkRows.push({name:srcName,meshes:cm.length,d:clone.userData.map2TargetDistance,seg:map2Segment(clone.userData.map2TargetDistance).kind});
    }
    const sourceCorridor=planetaryWorldRegions[3].children.filter(o=>o.name==='MAP4_GFX07_CORRIDOR_STRUCTURE');
    let sourceCorridorMeshes=0;sourceCorridor.forEach(r=>r.traverse(o=>{if(o.isMesh||o.isInstancedMesh)sourceCorridorMeshes++}));
    let corridorMeshes=0,corridorPhysical=0;
    corridors.forEach(r=>r.traverse(o=>{if(o.isMesh||o.isInstancedMesh){corridorMeshes++;if(o.userData?.h4Collider) corridorPhysical++;}}));
    return {
      expected,landmarkRows,landmarkRoots:landmarks.length,landmarkPairs,landmarkGeo,landmarkMat,landmarkPhysical,
      corridorRoots:corridors.length,sourceCorridorRoots:sourceCorridor.length,sourceCorridorMeshes,corridorMeshes,corridorPhysical,
      corridorTargets:corridors.map(x=>({d:x.userData.map2TargetDistance,seg:map2Segment(x.userData.map2TargetDistance).kind})),
      stats:window.starbladeMap2Layout?.visualStage||null,
      map4Visible:planetaryWorldGroup.visible
    };
  });
  console.log('MAP2-16 REMAINING '+JSON.stringify(info));
  assert.equal(info.landmarkRoots,8,'all eight remaining building-like Map4 landmarks must transfer');
  assert.deepEqual(info.landmarkRows.map(x=>x.name).sort(),info.expected.slice().sort());
  assert.equal(info.landmarkPairs,355,'exact selected landmark mesh total should stay 355');
  assert.equal(info.landmarkGeo,info.landmarkPairs,'landmark geometry identity must remain exact');
  assert.equal(info.landmarkMat,info.landmarkPairs,'landmark material identity must remain exact');
  assert.equal(info.landmarkPhysical,0,'Map4 landmark collision metadata must not register in Map2');
  assert(info.landmarkRows.every(x=>x.seg!=='FAST'),'landmark centres must stay outside FAST');
  assert.equal(info.corridorRoots,1,'full final corridor set should transfer as one cluster');
  assert(info.sourceCorridorRoots>=20,'final Map4 corridor source set must be substantial');
  assert.equal(info.corridorMeshes,info.sourceCorridorMeshes,'all final corridor structure meshes must transfer');
  assert.equal(info.corridorPhysical,0);
  assert(info.corridorTargets.every(x=>x.seg!=='FAST'));
  assert.equal(info.stats?.exactMap4LandmarkClones,8);
  assert.equal(info.stats?.exactMap4LandmarkMeshes,355);
  assert.equal(info.stats?.exactMap4CorridorClusters,1);
  assert.equal(info.stats?.exactMap4CorridorMeshes,info.sourceCorridorMeshes);
  assert.equal(info.map4Visible,false);

  const evidence=path.join(__dirname,'map2-16-evidence');fs.mkdirSync(evidence,{recursive:true});
  const target=info.landmarkRows.find(x=>x.name==='MAP4_SPACEPORT_42600').d;
  await page.evaluate(p=>{state.routeProgress=Math.max(0,p-1300);state.laneX=0;state.laneY=80;state.paused=true;map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);},target);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-spaceport-on-map2.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-16 remaining exact Map4 buildings');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
