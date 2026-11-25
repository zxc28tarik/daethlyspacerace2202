'use strict';
// MAP2-44: physical city shell must match the doubled-width road and preserve real passages.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);

(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
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
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&
    window.starbladeMap2PhysicalConsistency,null,{timeout:90000});

  const info=await page.evaluate(()=>{
   state.paused=true;scene.updateMatrixWorld(true);
   const seal=window.starbladeMap2PhysicalConsistency;
   const sys=window.starbladeMap2WideUrbanCourse;
   const physical=(window.starbladeMap2BuildingColliders||[]).filter(o=>
    o.map2WideUrbanFrontage||o.map2WideUrbanEscapeShell
   );
   const front=physical.filter(o=>o.map2WideUrbanFrontage);
   const shells=physical.filter(o=>o.map2WideUrbanEscapeShell);
   const innerEdges=front.map(o=>Math.abs(o.laneX)-o.halfX);
   const outerEdges=front.map(o=>Math.abs(o.laneX)+o.halfX);
   const boundary=2*BOUNDARY_RULES.maxRadius;
   const sideCounts={
    left:front.filter(o=>o.laneX<0).length,
    right:front.filter(o=>o.laneX>0).length
   };

   // Independent conservative route check using the real player-size audit radius.
   let primaryHits=0,branchHits=0;
   const complexes=[
    ...(window.starbladeMap2PlayablePassages?.complexes||[]),
    ...(window.starbladeMap2FullGapSystem?.extraComplexes||[])
   ];
   for(const o of physical){
    const from=Math.max(0,o.routeProgress-o.halfDepth-100);
    const to=Math.min(MAP2_DISTANCE,o.routeProgress+o.halfDepth+100);
    let prev=null;
    for(let d=from;d<=to+1;d+=72){
     const dd=Math.min(d,to);
     if(map2Segment(dd).kind!=='TECH'){prev=null;continue;}
     const q=starbladeMap2BuildingPassageAt(dd);
     const node={routeProgress:dd,laneX:q.x,laneY:q.y};
     if(prev&&courseSegmentTouch(o,prev,node,seal.shipRadius))primaryHits++;
     prev=node;
    }
    for(const complex of complexes){
     if(complex.to<from||complex.from>to)continue;
     for(const p of complex.passages||[]){
      for(let i=1;i<(p.nodes||[]).length;i++){
       const a=p.nodes[i-1],b=p.nodes[i];
       if(Math.max(a.routeProgress,b.routeProgress)<from||
          Math.min(a.routeProgress,b.routeProgress)>to)continue;
       if(courseSegmentTouch(o,a,b,seal.shipRadius))branchHits++;
      }
     }
    }
   }

   return {
    ...seal,
    physicalCount:physical.length,
    frontageCount:front.length,
    shellCount:shells.length,
    recordCount:sys.physicalRecords.length,
    minInnerEdge:Math.min(...innerEdges),
    maxInnerEdge:Math.max(...innerEdges),
    minOuterEdge:Math.min(...outerEdges),
    boundary,
    sideCounts,
    primaryHits,branchHits,
    map4Hidden:!planetaryWorldGroup.visible
   };
  });

  const dir=path.join(__dirname,'map2-44-evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'physical-consistency.json'),JSON.stringify(info,null,2));
  console.log('MAP2-44 METRICS '+JSON.stringify(info));

  assert(info.frontageCount>170,'TECH frontage needs dense physical continuity');
  assert(info.sideCounts.left>80&&info.sideCounts.right>80,'both city sides must remain physical');
  assert(info.expanded>160,'most widened frontage blocks should be outer-sealed');
  assert(info.maxSealInnerDrift<0.01,'outer sealing must not narrow the playable inner road');
  assert(info.minOuterCoverageMargin>=20,'physical frontage must extend beyond reachable lateral edge');
  assert(info.minOuterEdge>info.boundary+20,'frontage outer face must cover the doubled boundary');
  assert(info.maxLongitudinalGap<=12,'no longitudinal outside-bypass gap may remain');
  assert(info.minBrakeDepthMargin>120,'frontage depth should exceed boost-to-brake reaction distance');
  assert(info.brakingDistance>500&&info.brakingDistance<650,'braking audit must reflect current race speeds');
  assert.equal(info.playerRadiusPrimaryHits,0,'player-sized primary route must remain clear');
  assert.equal(info.playerRadiusBranchHits,0,'player-sized alternate routes must remain clear');
  assert.equal(info.primaryHits,0,'independent primary route audit must stay clear');
  assert.equal(info.branchHits,0,'independent alternate route audit must stay clear');
  assert.equal(info.fastPhysical,0,'FAST sectors must not gain physical city barriers');
  assert.equal(info.shellCount,info.stitches,'escape-shell accounting must match physical objects');
  assert.equal(info.physicalCount,info.recordCount,'physical record list must stay synchronized');
  assert(info.map4Hidden,'Map4 source world must remain hidden and unchanged');

  for(const shot of [
   {d:41000,x:720,name:'tech-left-edge'},
   {d:74000,x:-720,name:'tech-right-edge'},
   {d:128000,x:720,name:'late-tech-edge'}
  ]){
   await page.evaluate(({d,x})=>{
    const f=getRaceFrameAtDistance(d);
    const q=starbladeMap2BuildingPassageAt(d);
    state.paused=true;state.routeProgress=d;state.laneX=x;state.laneY=q.y;
    state.pos.copy(f.center).addScaledVector(f.right,x).addScaledVector(f.up,q.y);
    const rot=new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
    camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
    camera.quaternion.copy(rot);camera.fov=70;camera.updateProjectionMatrix();
    map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
   },shot);
   await page.waitForTimeout(220);
   await page.screenshot({path:path.join(dir,shot.name+'.png'),timeout:120000,animations:'disabled'});
  }

  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-44 physical shell / alternative path consistency');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
