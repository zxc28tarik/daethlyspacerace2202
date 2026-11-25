'use strict';
// MAP2-41: world coverage, exact Map4 frontage, lateral-only wider flight, visual samples.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&window.starbladeMap2WorldCity,null,{timeout:90000});
  const info=await page.evaluate(()=>{
   state.paused=true;scene.updateMatrixWorld(true);
   const r=window.starbladeMap2WorldCity;
   const ground=map2CourseGroup.getObjectByName('MAP2_CONTINUOUS_WORLD_TERRAIN');
   const box=new THREE.Box3().setFromObject(ground),ray=new THREE.Raycaster();
   let misses=0,badPads=0,cityBatches=0,wrongSource=0;
   const source=h4City02DistrictGroup;
   for(let d=0;d<MAP2_DISTANCE;d+=500){
    const f=getRaceFrameAtDistance(d);
    for(const x of [-8000,0,8000]){
     const p=f.center.clone().addScaledVector(f.right,x);p.y=4000;
     ray.set(p,new THREE.Vector3(0,-1,0));ray.far=20000;
     if(!ray.intersectObject(ground).length)misses++;
    }
   }
   map2CourseGroup.traverse(o=>{
    if(o.userData?.map2GroundPad){
     const m=o.children.find(x=>x.isMesh);if(m&&Math.abs(new THREE.Box3().setFromObject(m).min.y-r.floorY)>2)badPads++;
    }
    if(o.userData?.map2WorldCity){
     cityBatches++;
     const original=source.getObjectByName(o.name.replace('MAP2_WORLD_CITY_',''));
     if(!original||original.geometry!==o.geometry||original.material!==o.material||!o.isInstancedMesh)wrongSource++;
    }
   });
   const gaps=[];
   for(const side of [-1,1])for(const row of [0,1]){
    const a=r.frontage.filter(x=>x.side===side&&x.row===row).map(x=>x.d).sort((a,b)=>a-b);
    gaps.push(Math.max(...a.slice(1).map((d,i)=>d-a[i]),MAP2_DISTANCE-a[a.length-1]+a[0]));
   }
   const test={laneX:900,laneY:0,routeProgress:45000,vx:20,vy:0};
   clampToSoftBoundary(test);
   const vertical={laneX:0,laneY:900,routeProgress:45000,vx:0,vy:20};
   clampToSoftBoundary(vertical);
   map2UpdateVisibility(20);
   return {r,misses,badPads,cityBatches,wrongSource,gaps,box:{min:box.min,max:box.max},
    horizontal:test.laneX,vertical:vertical.laneY,map4Hidden:!planetaryWorldGroup.visible,
    wrap:map2Sections[map2Sections.length-1].visible,gates:map2Gates.length,
    fastPhysical:(window.starbladeMap2BuildingColliders||[]).filter(o=>map2Segment(o.routeProgress).kind==='FAST').length};
  });
  assert.equal(info.misses,0);assert.equal(info.badPads,0);assert.equal(info.wrongSource,0);
  assert(info.r.frontage.length>1500);assert(info.cityBatches>0);
  assert(info.gaps.every(x=>x<=421));assert.equal(info.r.lateralScale,2);
  // MAP2-43: verify the adaptive near skyline without changing physical FAST areas.
  const n=info.r.naturalRead;
  assert(n&&n.records.length>800,'continuous adaptive facade records missing');
  assert(n.openSectorRecords>230&&n.bendRecords>0,'open sectors and bends must be covered');
  assert(n.records.every(r=>Number.isFinite(r.clearance)&&Number.isFinite(r.yaw)
    &&r.depth>=420&&r.height>=580),'invalid frontage transform');
  assert(n.minClearance>=n.flightEnvelope-1,'visual facade intersects reachable flight envelope');
  for(const side of [-1,1])for(const seg of info.r.naturalRead.records.filter(r=>r.side===side&&r.kind!=='TECH')){
    assert(seg.clearance>=n.flightEnvelope-1,'open-sector facade encroachment');
  }
  console.log('MAP2-43 METRICS '+JSON.stringify({records:n.records.length,
    openSectorRecords:n.openSectorRecords,bendRecords:n.bendRecords,
    minClearance:n.minClearance,flightEnvelope:n.flightEnvelope}));
  assert(Math.abs(info.horizontal/info.vertical-2)<.01);
  assert(info.map4Hidden&&info.wrap);assert.equal(info.gates,68);assert.equal(info.fastPhysical,0);
  const dir=path.join(__dirname,'map2-41-evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'world-city.json'),JSON.stringify(info,null,2));
  for(const d of [1500,8200,18000,34300,35700,42000,69000,95600,103000,113100,114400,135000,169000]){
   await page.evaluate(d=>{
    const q=map2Segment(d).kind==='TECH'?starbladeMap2BuildingPassageAt(d):{x:0,y:0};
    const f=getRaceFrameAtDistance(d);
    state.paused=true;state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
    state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
    const rot=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
    camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
    camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
    map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
   },d);
   await page.waitForTimeout(250);
   await page.screenshot({path:path.join(dir,'flight-'+d+'.png'),timeout:120000,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-41 world terrain / city / width');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
