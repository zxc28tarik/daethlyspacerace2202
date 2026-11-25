'use strict';
// MAP2-42: widened TECH course is bounded by real Map4 architecture, not guide lines.
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
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&window.starbladeMap2WideUrbanCourse,null,{timeout:90000});

  const info=await page.evaluate(()=>{
   state.paused=true;scene.updateMatrixWorld(true);
   const sys=window.starbladeMap2WideUrbanCourse;
   const world=window.starbladeMap2WorldCity;
   const physical=(window.starbladeMap2BuildingColliders||[]).filter(o=>o.map2WideUrbanFrontage);
   let wrongSource=0,visualBatches=0,primaryHits=0,branchHits=0;
   map2CourseGroup.traverse(o=>{
    if(!o.userData?.map2WideUrbanFrontage||!o.isInstancedMesh)return;
    visualBatches++;
    const original=h4City02DistrictGroup.getObjectByName(o.name.replace('MAP2_WIDE_URBAN_FRONTAGE_',''));
    if(!original||original.geometry!==o.geometry||original.material!==o.material)wrongSource++;
   });

   for(const o of physical){
    let prev=null;
    const from=Math.max(0,o.routeProgress-o.halfDepth-90);
    const to=Math.min(MAP2_DISTANCE,o.routeProgress+o.halfDepth+90);
    for(let d=from;d<=to+1;d+=85){
     const dd=Math.min(d,to);
     if(map2Segment(dd).kind!=='TECH'){prev=null;continue;}
     const q=starbladeMap2BuildingPassageAt(dd);
     const node={routeProgress:dd,laneX:q.x,laneY:q.y};
     if(prev&&courseSegmentTouch(o,prev,node,14))primaryHits++;
     prev=node;
    }
   }

   const complexes=[
    ...(window.starbladeMap2PlayablePassages?.complexes||[]),
    ...(window.starbladeMap2FullGapSystem?.extraComplexes||[])
   ];
   for(const complex of complexes)for(const p of complex.passages||[]){
    for(let i=1;i<(p.nodes||[]).length;i++){
     const a=p.nodes[i-1],b=p.nodes[i];
     for(const o of physical){
      if(Math.max(a.routeProgress,b.routeProgress)<o.routeProgress-o.halfDepth-20||
         Math.min(a.routeProgress,b.routeProgress)>o.routeProgress+o.halfDepth+20)continue;
      if(courseSegmentTouch(o,a,b,14))branchHits++;
     }
    }
   }

   const fastPhysical=physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length;
   const sides={left:0,right:0};
   for(const r of sys.physicalRecords)r.side<0?sides.left++:sides.right++;
   const innerEdges=sys.visualRecords.map(r=>Math.abs(r.x)-r.width/2);
   return {
    visualInstances:sys.visualInstances,physicalColliders:sys.physicalColliders,
    batches:sys.batches,visualBatches,wrongSource,primaryHits,branchHits,fastPhysical,
    skippedForRoute:sys.skippedForRoute,movedOutward:sys.movedOutward,sides,
    minInnerEdge:Math.min(...innerEdges),maxInnerEdge:Math.max(...innerEdges),
    worldFrontage:world.frontage.length,lateralScale:world.lateralScale,
    map4Hidden:!planetaryWorldGroup.visible
   };
  });

  const dir=path.join(__dirname,'map2-42-evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'wide-urban-course.json'),JSON.stringify(info,null,2));
  console.log('MAP2-42 METRICS '+JSON.stringify(info));

  assert(info.visualInstances>450,'near frontage should remain visually continuous');
  assert(info.physicalColliders>150,'widened TECH area needs substantial physical containment');
  assert(info.batches>0&&info.visualBatches>0);
  assert.equal(info.wrongSource,0,'all frontage visuals must reuse exact Map4 geometry/material');
  assert.equal(info.primaryHits,0,'MAP2-42 must not block the primary through-building route');
  assert.equal(info.branchHits,0,'MAP2-42 must preserve validated 2/3-way passage branches');
  assert.equal(info.fastPhysical,0,'FAST sectors must stay physically open');
  assert(info.sides.left>70&&info.sides.right>70);
  assert(info.minInnerEdge<500&&info.maxInnerEdge<560,'frontage should visually define the widened corridor');
  assert(info.worldFrontage>1500&&info.lateralScale===2&&info.map4Hidden);
  for(const d of [39000,69000,90000,122000,151000,169000]){
   await page.evaluate(d=>{
    const q=starbladeMap2BuildingPassageAt(d);
    const f=getRaceFrameAtDistance(d);
    state.paused=true;state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
    state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
    const rot=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
    camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
    camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
    map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
   },d);
   await page.waitForTimeout(220);
   await page.screenshot({path:path.join(dir,'flight-'+d+'.png'),timeout:120000,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-42 widened urban course / preserved passages');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
