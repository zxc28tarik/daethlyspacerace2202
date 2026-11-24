// MAP2-22 — real Map4 transition buildings hand off one authored complex to the next
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2AddTransitionBuildingHandoffs'));
assert(html.includes('map2TransitionRoadClone'));

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
    const road=window.starbladeMap2BuildingRoad;
    const transitions=window.starbladeMap2TransitionBuildings||[];
    const transitionGroups=road.groups.filter(g=>g.transition);
    const roots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2TransitionRoadClone&&o.name?.includes('_HANDOFF_'))roots.push({
        name:o.name,d:o.userData.map2TargetDistance,
        exact:!!o.userData.map2ExactMap4Clone,
        source:o.userData.sourceMap4Station,
        seg:map2Segment(o.userData.map2TargetDistance).kind,
        boundary:!!o.userData.map2TransitionBoundary
      });
    });
    const physical=window.starbladeMap2BuildingColliders||[];
    const techRanges=MAP2_SEGMENTS.filter(s=>s.kind==='TECH').map(s=>({from:s.from*MAP2_DISTANCE,to:s.to*MAP2_DISTANCE}));
    const gapRows=techRanges.map(range=>{
      const knots=road.knots.filter(k=>k.distance>=range.from&&k.distance<=range.to).sort((a,b)=>a.distance-b.distance);
      const gaps=[];let prev=range.from;
      for(const k of knots){gaps.push(k.distance-prev);prev=k.distance;}
      gaps.push(range.to-prev);
      return {count:knots.length,maxGap:Math.max(...gaps),minGap:Math.min(...gaps),gaps};
    });
    const blocked=transitionGroups.filter(g=>{
      if(!g.open)return true;
      const a={routeProgress:g.d-115,laneX:g.x,laneY:g.y};
      const b={...a,routeProgress:g.d+115};
      return physical.some(o=>courseSegmentTouch(o,a,b,12.5));
    });
    const boundaries=transitions.filter(t=>t.boundary);
    const seqCounts={};
    for(const t of transitions)seqCounts[t.sequence]=(seqCounts[t.sequence]||0)+1;
    const sourceSet=[...new Set(roots.map(r=>r.source).filter(Boolean))];
    const stats=window.starbladeMap2Layout?.visualStage;
    return {
      transitionCount:transitions.length,
      transitionGroups:transitionGroups.length,
      openTransitionGroups:transitionGroups.filter(g=>g.open).length,
      framedTransitionGroups:transitionGroups.filter(g=>g.framed).length,
      roadKnots:road.knots.length,coreKnots:(road.coreKnots||[]).length,transitionKnots:(road.transitionKnots||[]).length,
      roots:roots.length,allExact:roots.every(r=>r.exact),allTech:roots.every(r=>r.seg==='TECH'),
      boundaries:boundaries.length,seqCounts,sourceSet,
      maxGap:Math.max(...gapRows.map(r=>r.maxGap)),gapRows,
      blocked:blocked.length,
      physical:physical.length,fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      stats
    };
  });

  console.log('MAP2-22 TRANSITION_HANDOFFS '+JSON.stringify(info));

  assert.equal(info.transitionCount,58,'every adjacent core building pair inside TECH should receive one real handoff building');
  assert.equal(info.transitionGroups,58);
  assert(info.openTransitionGroups>=56,'nearly every handoff station must expose a real pilot-sized aperture');
  assert(info.framedTransitionGroups>=50,'handoff apertures should usually be framed by real W05 building mass');
  assert.equal(info.coreKnots,60,'the 60 authored MAP2-21 core knots remain intact');
  assert(info.transitionKnots>=56,'transition building apertures become active route knots');
  assert(info.roadKnots>=116,'core + handoff buildings should more than double route guidance density');
  assert.equal(info.roots,58,'one exact Map4 W05 root per handoff');
  assert(info.allExact,'every transition root must be an exact Map4 station clone');
  assert(info.allTech,'handoff buildings must remain inside TECH sectors');
  assert(info.boundaries===6,'three sequence boundaries per TECH chain should also be bridged');
  assert(info.sourceSet.length===6,'all six real W05 station sources should be reused across handoffs');
  assert(info.maxGap<=1550,'TECH building-to-building handoff gap should stay around 1.5 km or tighter');
  assert.equal(info.blocked,0,'real building physics may not seal its own handoff aperture');
  assert.equal(info.fastPhysical,0,'FAST sectors stay free of building-derived collision');
  assert(info.physical>=80,'denser real-building handoffs should increase meaningful physical architecture');
  assert.equal(info.stats?.transitionBuildingClones,58);
  assert(info.stats?.transitionBuildingKnots>=56);
  assert(info.stats?.transitionMaxGapBefore>=1900);
  assert(info.stats?.transitionMaxGapAfter<=1550);

  const evidence=path.join(__dirname,'map2-22-evidence');fs.mkdirSync(evidence,{recursive:true});
  await page.evaluate(()=>{
    const t=(window.starbladeMap2TransitionBuildings||[]).find(x=>x.boundary)||(window.starbladeMap2TransitionBuildings||[])[10];
    state.routeProgress=Math.max(0,t.distance-700);state.laneX=t.x;state.laneY=t.y;state.paused=true;
    map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  });
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-building-to-building-handoff.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-22 real Map4 transition buildings reduce empty TECH flight');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
