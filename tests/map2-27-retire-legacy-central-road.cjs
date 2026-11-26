// MAP2-27 — legacy central-road scaffolding retirement under real Map4 chains
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2RetireLegacyCentralRoadScaffolding'));
assert(html.includes('REAL_BUILDINGS_REPLACE_LEGACY_CENTRAL_ROAD'));

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
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const retirement=window.starbladeMap2LegacyRoadRetirement;
    const route=window.starbladeMap2ThroughRoute;
    const chains=window.starbladeMap2LongBuildingChains;
    const physical=window.starbladeMap2BuildingColliders||[];
    const remainingCityTurns=map2Obstacles.filter(o=>/^MAP2_CITY_TURN_/.test(o.mesh?.name||o.name||''));
    const remainingGate=map2Obstacles.filter(o=>/^MAP2_(?:HANGAR|GANTRY|DUAL_FACTORY|MACHINE_SLOT)_/.test(o.mesh?.name||o.name||''));
    const tagged=[];
    const guides=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2RetiredByMAP227)tagged.push({name:o.name,visible:o.visible,guide:!!o.userData.map2LegacyGuideHidden});
      if(o.name==='MAP2_APERTURE_CORNERS')guides.push({
        visible:o.visible!==false,
        retired:!!o.userData.map2RetiredByMAP227,
        d:Number(o.userData?.map2TargetDistance??o.userData?.map2Distance??o.userData?.routeProgress)
      });
    });
    const retiredNames=new Set(retirement?.retired?.map(r=>r.name)||[]);
    const retiredStillPhysical=map2Obstacles.filter(o=>retiredNames.has(o.mesh?.name||o.name||''));
    const techGateObstacles=remainingGate.filter(o=>map2Segment(o.routeProgress).kind==='TECH');
    return {
      retirement,
      totalObstacles:map2Obstacles.length,
      remainingCityTurns:remainingCityTurns.length,
      remainingGate:remainingGate.length,
      techGateObstacles:techGateObstacles.length,
      taggedCount:tagged.length,
      taggedHidden:tagged.filter(x=>x.visible===false).length,
      taggedVisible:tagged.filter(x=>x.visible!==false).length,
      guideCount:guides.length,
      guideHidden:guides.filter(g=>!g.visible).length,
      guideVisible:guides.filter(g=>g.visible).length,
      retiredStillPhysical:retiredStillPhysical.length,
      physical:physical.length,
      fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      chainCoverage:chains?.coveragePct,
      longest:chains?.longest,
      modules:route?.modules?.length,
      anchors:route?.routeAnchors?.length,
      gates:map2Gates.length,
      map4Hidden:!planetaryWorldGroup.visible,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });

  console.log('MAP2-27 LEGACY_RETIREMENT '+JSON.stringify(info));
  const r=info.retirement;
  assert(r,'retirement metadata must exist');
  assert.equal(r.philosophy,'REAL_BUILDINGS_REPLACE_LEGACY_CENTRAL_ROAD');
  assert(r.retiredCount>=20,'a substantial obsolete CITY_TURN layer should leave long real-building chains');
  assert(r.retiredCount<=90,'retirement must remain classified/selective');
  assert(r.retired.every(x=>/^MAP2_CITY_TURN_/.test(x.name)),'only CITY_TURN legacy obstacle class may be retired');
  assert(r.retired.every(x=>x.buildingPhysicsNearby>=1),'every retired turn must have real Map4 replacement physics nearby');
  assert.equal(info.retiredStillPhysical,0,'retired central-road obstacles may not remain in collision list');
  assert.equal(info.taggedVisible,0,'retired legacy meshes/guides may not remain visible');
  assert(info.taggedHidden>=r.retiredCount,'each retired physical object needs a hidden/tagged visual source');
  assert(r.gatePreserved>=250,'all hard-safety gate collision pieces remain preserved');
  assert(info.remainingGate>=250,'gate obstacle layer remains physically present');
  assert.equal(info.gates,68,'68 authored safety gates remain');
  assert(r.guidesHidden>=60,'most artificial aperture-corner guides inside long chains should be removed');
  assert(info.guideHidden>=r.guidesHidden,'guide hiding must be visible in scene graph');
  assert(info.guideVisible<=25,'only boundary/non-dense guide lines should remain visible');
  assert(info.physical>=200,'real Map4 building physics remains the dominant replacement layer');
  assert.equal(info.fastPhysical,0,'FAST remains clear of building collision');
  assert(info.chainCoverage>=65,'MAP2-26 real building-chain coverage must remain');
  assert(info.longest?.span>=39000,'39km-class real building chain must survive retirement');
  assert(info.modules>=168&&info.anchors>=736,'through-building density must remain intact');
  assert(info.map4Hidden,'Map4 source scene remains hidden');
  assert.equal(info.stats?.legacyRoadTurnsRetired,r.retiredCount);
  assert.equal(info.stats?.legacyRoadMeshesHidden,r.hiddenMeshes);
  assert.equal(info.stats?.legacyApertureGuidesHidden,r.guidesHidden);
  assert.equal(info.stats?.legacyRoadObstaclesBefore-r.retiredCount,info.stats?.legacyRoadObstaclesAfter);
  assert.equal(info.stats?.legacyRoadGateObstaclesPreserved,r.gatePreserved);

  // Full deterministic fleet proves that replacing generic center-road turns with
  // real Map4 architecture did not turn the 175km course into a dead end.
  const fleet=await page.evaluate(()=>{
    state.paused=true;state.finished=true;state.finishTime=0;state.maxPostFinishWait=1000;
    racers.forEach((r,i)=>{
      const angle=i*2*Math.PI/5;
      r.routeProgress=0;r.laneX=Math.cos(angle)*105;r.laneY=Math.sin(angle)*105;
      r.vx=0;r.vy=0;r.targetX=r.laneX;r.targetY=r.laneY;
      r.map2GateChoice=null;positionRacerOnRoute(r);
    });
    let frames=0;
    for(;frames<12500&&state.running&&!racers.every(r=>r.finished||r.dnf);frames++)updateGame(1/30);
    return {frames,gates:map2Gates.length,rivals:racers.map(r=>({
      name:r.name,finished:r.finished,dnf:r.dnf,progress:r.routeProgress,stats:{...r.aiStats}
    }))};
  });
  console.log('MAP2-27 FLEET '+JSON.stringify(fleet));
  assert.equal(fleet.rivals.filter(x=>x.finished).length,5,'all five rivals finish after legacy-road retirement');
  assert(fleet.rivals.every(x=>x.stats.map2GateExits===fleet.gates),'68/68 hard-safety gates still work');
  assert(fleet.rivals.every(x=>(x.stats.obstacleHits||0)===0),'retirement/replacement may not introduce generic obstacle strikes');
  assert(fleet.rivals.every(x=>(x.stats.map2BuildingRouteSeconds||0)>55),'real building route remains primary TECH navigation');

  const evidence=path.join(__dirname,'map2-27-evidence');fs.mkdirSync(evidence,{recursive:true});
  await page.evaluate(()=>{
    const rr=window.starbladeMap2LegacyRoadRetirement;
    const d=rr.retired[Math.floor(rr.retired.length/2)]?.d||50000;
    state.routeProgress=Math.max(0,d-450);
    const q=starbladeMap2BuildingPassageAt(state.routeProgress);
    state.laneX=q.x;state.laneY=q.y;state.paused=true;
    map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  });
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-real-buildings-without-central-road-scaffold.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-27 real buildings replace legacy central-road scaffolding');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});