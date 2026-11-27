'use strict';
// MAP2-48 runtime acceptance test: no Map4 region/world creation for Map2.
const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({
   status:200,contentType:'text/javascript',body:three
  }));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({
   status:200,contentType:'text/javascript',body:''
  }));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  assert.equal(await page.evaluate(()=>planetaryWorldRegions.length),0,
   'Map4 must not be pre-created for the initial menu');
  await page.locator('#map-choice-2').click();
  await page.waitForFunction(()=>window.starbladeMap2IndependentAssets?.mode==='ARCHIVED_MAP2_SOURCES'&&
   window.starbladeMap2WideUrbanCourse&&map2Sections.length>0,null,{timeout:120000});
  const data=await page.evaluate(()=>{
   const lib=map2IndependentLibrary;
   const stationCopies=[];
   map2CourseGroup.traverse(o=>{
    if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_'))
      stationCopies.push(o);
   });
   const exact=stationCopies.filter(o=>lib.stations.some(src=>src.name===o.userData.sourceMap4Station));
   const checked=exact.slice(0,6).map(root=>{
    const source=lib.stations.find(s=>s.name===root.userData.sourceMap4Station);
    if(!source)return {valid:false,reason:'missing source'};
    const sm=[],cm=[];source.traverse(o=>{if(o.isMesh||o.isInstancedMesh)sm.push(o)});
    root.traverse(o=>{if(o.isMesh||o.isInstancedMesh)cm.push(o)});
    return {valid:sm.length===cm.length&&sm.every((m,i)=>
       cm[i].geometry===m.geometry&&cm[i].material===m.material),count:sm.length};
   });
   return {
    activeMap:state.activeMap,map4Regions:planetaryWorldRegions.length,
    map4Hidden:!planetaryWorldGroup.visible,source:window.starbladeMap2IndependentAssets,
    stationSources:lib.stations.length,citySource:lib.city.name,
    landmarkSources:lib.landmarks.length,corridorSources:lib.finalCorridors.length,
    industrialSource:lib.industrialVisuals.name,
    stationCopies:stationCopies.length,
    stationIdentity:checked,courseLength:MAP2_DISTANCE,
    meshCount:(()=>{let n=0;map2CourseGroup.traverse(o=>{if(o.isMesh||o.isInstancedMesh)n++});return n;})(),
    instanceCount:(()=>{let n=0;map2CourseGroup.traverse(o=>{if(o.isInstancedMesh)n+=o.count});return n;})(),
    visualStage:window.starbladeMap2Layout?.visualStage||null,
    gates:map2Gates.length,physical:(window.starbladeMap2BuildingColliders||[]).length,
    shieldMultiplier:typeof MAP2_TEST_SHIELD_MULTIPLIER==='undefined'?null:MAP2_TEST_SHIELD_MULTIPLIER,
    map4Enabled:MAP_AVAILABLE[MAP_MODES.MAP4]
   };
  });
  console.log('MAP2-48 DETACHED '+JSON.stringify(data));
  assert.equal(data.activeMap,'map2');
  assert.equal(data.map4Regions,0,'Map4 world must not exist for Map2');
  assert(data.map4Hidden);
  assert.equal(data.source.mode,'ARCHIVED_MAP2_SOURCES');
  assert.equal(data.source.roots,44);
  assert.equal(data.source.meshes,2269);
  assert.equal(data.stationSources,6);
  assert.equal(data.landmarkSources,8);
  assert(data.corridorSources>=20);
  assert.equal(data.industrialSource,'MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS');
  assert(data.stationCopies>=1);
  assert(data.stationIdentity.length>=1&&data.stationIdentity.every(x=>x.valid),
    'Map2 station visuals must still share geometry and material with library sources');
  // Same measurements in the untouched baseline game: this catches missing
  // facade trees or changed placement even when the new source loads.
  const reference=path.join(__dirname,'map2-48-evidence','baseline.html');
  assert(fs.existsSync(reference),'Baseline HTML must be saved before patching');
  const base=await browser.newPage({viewport:{width:1440,height:810}});
  await base.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({
   status:200,contentType:'text/javascript',body:three
  }));
  await base.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({
   status:200,contentType:'text/javascript',body:''
  }));
  await base.goto(pathToFileURL(reference).toString(),
   {waitUntil:'domcontentloaded',timeout:60000});
  await base.waitForFunction(()=>typeof map2BuildCourse==='function');
  await base.locator('#map-choice-2').click();
  await base.waitForFunction(()=>window.starbladeMap2WideUrbanCourse&&map2Sections.length>0,
   null,{timeout:120000});
  const baseline=await base.evaluate(()=>{
   let meshCount=0,instanceCount=0,stationCopies=0;
   map2CourseGroup.traverse(o=>{
    if(o.isMesh||o.isInstancedMesh)meshCount++;
    if(o.isInstancedMesh)instanceCount+=o.count;
    if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_'))
     stationCopies++;
   });
   return {meshCount,instanceCount,stationCopies,
    visualStage:window.starbladeMap2Layout?.visualStage||null,
    gates:map2Gates.length,physical:(window.starbladeMap2BuildingColliders||[]).length};
  });
  await base.close();
  console.log('MAP2-48 BASELINE '+JSON.stringify(baseline));
  assert.equal(data.meshCount,baseline.meshCount,'Exact same number of drawable meshes as original');
  assert.equal(data.instanceCount,baseline.instanceCount,'All instanced facade pieces preserved');
  assert.equal(data.stationCopies,baseline.stationCopies,'All exact Map4-derived station roots preserved');
  assert.deepEqual(data.visualStage,baseline.visualStage,'Every Map2 visual placement counter preserved');
  assert.equal(data.gates,baseline.gates);
  assert.equal(data.physical,baseline.physical);
  assert.equal(data.courseLength,175000);
  assert.equal(data.gates,59);
  assert(data.physical>=500);
  assert.equal(data.map4Enabled,false);
  assert.deepEqual(errors,[],'No JavaScript errors during detached load');

  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2',null,{timeout:120000});
  assert.equal(await page.evaluate(()=>planetaryWorldRegions.length),0);
  assert.equal(await page.locator('#map-choice-4').isDisabled(),true);

  const dir=path.join(__dirname,'map2-48-evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'detached-runtime.json'),JSON.stringify(data,null,2));
  for(const distance of [39000,90000,151000]){
   await page.evaluate(d=>{
    const f=getRaceFrameAtDistance(d),q=starbladeMap2BuildingPassageAt(d);
    state.paused=true;state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
    state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
    const rot=new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
    camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
    camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
    map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
   },distance);
   await page.waitForTimeout(220);
   await page.screenshot({path:path.join(dir,'independent-'+distance+'.png'),
     timeout:120000,animations:'disabled'});
  }
  console.log('PASS MAP2-48 independent full-runtime Map2 / Map4 not constructed');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
