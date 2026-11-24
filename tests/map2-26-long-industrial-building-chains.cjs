// MAP2-26 — long continuous real Map4 industrial building chains
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2AddLongIndustrialBuildingBridges'));
assert(html.includes('map2LongChainBridge'));

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
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const summary=window.starbladeMap2LongBuildingChains;
    const bridgeModules=window.starbladeMap2ChainBridgeModules||[];
    const route=window.starbladeMap2ThroughRoute;
    const physical=window.starbladeMap2BuildingColliders||[];
    const bridgeRoots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2LongChainBridge&&o.name?.includes('_CHAINBRIDGE_')){
        bridgeRoots.push({
          name:o.name,
          exact:!!o.userData.map2ExactMap4Clone,
          d:o.userData.map2TargetDistance,
          visible:o.visible,
          module:o.userData.map2ThroughBuildingModule
        });
      }
    });

    const blocked=[];
    for(const m of bridgeModules){
      let prev=null,hit=false;
      for(let d=m.entrance.distance;d<=m.exit.distance+1;d+=65){
        const q=starbladeMap2BuildingPassageAt(Math.min(d,m.exit.distance));
        const now={routeProgress:Math.min(d,m.exit.distance),laneX:q.x,laneY:q.y};
        if(prev&&physical.some(o=>courseSegmentTouch(o,prev,now,12.5))){hit=true;break;}
        prev=now;
      }
      if(hit)blocked.push(m.id);
    }

    const retired=window.starbladeMap2RetiredLegacyObstacles||0;
    const retiredVisible=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2RetiredForBuildingRoute)retiredVisible.push({name:o.name,visible:o.visible});
    });

    return {
      summary,
      bridges:bridgeModules.length,
      bridgeRoots:bridgeRoots.length,
      allExact:bridgeRoots.every(r=>r.exact),
      allTech:bridgeRoots.every(r=>map2Segment(r.d).kind==='TECH'),
      allVisible:bridgeRoots.every(r=>r.visible),
      moduleCount:route.modules.length,
      routeAnchors:route.routeAnchors.length,
      moduleAnchors:route.moduleAnchors.length,
      bridgeAnchorCount:bridgeModules.reduce((n,m)=>n+m.points.length,0),
      bridgeFramed:bridgeModules.reduce((n,m)=>n+m.points.filter(p=>p.framed).length,0),
      blocked,
      physical:physical.length,
      fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      retired,retiredVisible,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });

  console.log('MAP2-26 LONG_CHAINS '+JSON.stringify(info));

  assert(info.summary,'long-chain summary must be published');
  assert(info.bridges>=20,'substantial real Map4 bridge architecture must be added');
  assert.equal(info.bridgeRoots,info.bridges,'each accepted bridge module must have one visible exact Map4 station root');
  assert(info.allExact,'all long-chain bridge roots must be exact Map4 W05 station clones');
  assert(info.allTech,'bridge buildings may only live in TECH');
  assert(info.allVisible,'accepted bridge architecture must remain visible');
  assert(info.moduleCount>=135,'through-building module count must materially exceed MAP2-25 baseline 115');
  assert(info.routeAnchors>=635,'real aperture navigation density must materially exceed MAP2-25 baseline 577');
  assert(info.bridgeAnchorCount>=info.bridges*3,'every bridge needs entry/interior/exit real aperture anchors');
  assert(info.bridgeFramed>=Math.floor(info.bridgeAnchorCount*.55),'most bridge aperture anchors should be architecturally framed');
  assert(info.summary.coveragePct>=62,'actual through-building TECH coverage must rise well above the 50.54% baseline');
  assert(info.summary.maxGap<=900,'no remaining real module EXIT->ENTRY gap should exceed 900m');
  assert(info.summary.badLinks<=12,'only a small residual set of difficult architectural handoffs may remain');
  assert(info.summary.longest?.span>=10000,'at least one continuous real-building chain should exceed 10km');
  assert(info.summary.longest?.count>=12,'longest chain should contain many real building modules');
  assert.equal(info.blocked.length,0,'new bridge buildings may not close their own real route tubes');
  assert(info.physical>=150,'real building physics remains substantial');
  assert.equal(info.fastPhysical,0,'FAST remains free of building collision');
  assert(info.retired<=20,'legacy cleanup remains selective, not a broad deletion pass');
  assert(info.retiredVisible.every(x=>x.visible===false),'retired generic obstacles must not remain visually present');
  assert.equal(info.stats?.longChainBridgeModules,info.bridges);
  assert.equal(info.stats?.longChainBridgeClones,info.bridges);
  assert(Math.abs(info.stats?.longChainCoveragePct-info.summary.coveragePct)<1e-6);
  assert(Math.abs(info.stats?.longChainLongestSpan-info.summary.longest.span)<1e-6);
  assert.equal(info.stats?.longChainBadLinksAfter,info.summary.badLinks);

  // Full deterministic fleet after the architecture becomes materially denser.
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
      name:r.name,finished:r.finished,dnf:r.dnf,progress:r.routeProgress,
      stats:{...r.aiStats}
    }))};
  });
  console.log('MAP2-26 FLEET '+JSON.stringify(fleet));
  assert.equal(fleet.rivals.filter(r=>r.finished).length,5,'all five rivals should finish the denser 175km architecture');
  assert(fleet.rivals.every(r=>r.stats.map2GateExits===fleet.gates),'68/68 hard-safety gates remain intact');
  assert(fleet.rivals.every(r=>(r.stats.obstacleHits||0)===0),'new building bridges may not cause generic obstacle strikes');
  assert(fleet.rivals.every(r=>(r.stats.map2BuildingRouteSeconds||0)>55),'all rivals must keep following the real building route');
  assert(fleet.rivals.every(r=>(r.stats.map2ThroughBuildingSeconds||0)>40),'all rivals must spend substantial time inside real building modules');

  const evidence=path.join(__dirname,'map2-26-evidence');fs.mkdirSync(evidence,{recursive:true});
  await page.evaluate(()=>{
    const s=window.starbladeMap2LongBuildingChains;
    const d=Math.max(0,(s.longest?.from||40000)+900);
    state.routeProgress=d;
    const q=starbladeMap2BuildingPassageAt(d);
    state.laneX=q.x;state.laneY=q.y;state.paused=true;
    map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  });
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-long-real-building-chain.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-26 long continuous real Map4 building chains');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});