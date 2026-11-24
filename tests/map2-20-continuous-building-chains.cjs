// MAP2-20 — compact existing Map4 complexes into continuous building-road chains
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2CompactBuildingRoadChains'));
assert(html.includes('map2ChainCompacted'));

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
    const comp=window.starbladeMap2BuildingChainCompaction;
    const road=window.starbladeMap2BuildingRoad;
    const coreKnots=road.coreKnots||road.knots;
    const coreGroups=road.groups.filter(g=>!g.transition);
    const ranges=MAP2_SEGMENTS.filter(s=>s.kind==='TECH').map(s=>({from:s.from*MAP2_DISTANCE,to:s.to*MAP2_DISTANCE}));
    const chainRows=ranges.map(range=>{
      const knots=coreKnots.filter(k=>k.distance>=range.from&&k.distance<=range.to).sort((a,b)=>a.distance-b.distance);
      const gaps=[];let prev=range.from;
      for(const k of knots){gaps.push(k.distance-prev);prev=k.distance;}
      gaps.push(range.to-prev);
      return {
        from:range.from,to:range.to,count:knots.length,
        maxGap:Math.max(...gaps),minGap:Math.min(...gaps),
        gaps,first:knots[0]?.distance,last:knots[knots.length-1]?.distance
      };
    });

    const roots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ChainCompacted)roots.push({
        name:o.name,d:o.userData.map2TargetDistance,
        original:o.userData.map2ChainOriginalDistance,
        seg:map2Segment(o.userData.map2TargetDistance).kind
      });
    });
    const rootNames=new Set(roots.map(r=>r.name));
    const physical=window.starbladeMap2BuildingColliders||[];
    const fastPhysical=physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length;
    const knotDeviations=road.knots.filter(k=>Math.abs(k.x)>60||Math.abs(k.y+55)>42).length;

    return {
      comp,roadGroups:coreGroups.length,knots:coreKnots.length,totalKnots:road.knots.length,
      framed:window.starbladeMap2Layout?.visualStage?.routeBuildingFramedApertures,
      chainRows,compactedRoots:roots.length,uniqueRoots:rootNames.size,
      rootsTech:roots.every(r=>r.seg==='TECH'),
      physical:physical.length,fastPhysical,knotDeviations,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });
  console.log('MAP2-20 CONTINUOUS_CHAINS '+JSON.stringify(info));

  assert(info.comp,'chain compaction metadata must exist');
  assert.equal(info.comp.groups,60,'existing 60 logical building groups must be re-spaced, not duplicated');
  assert(info.comp.moved>=55,'nearly every TECH building group should participate in the new chain cadence');
  assert(info.comp.maxGapBefore>=3500,'pre-compaction route should contain multi-kilometre aperture gaps');
  assert(info.comp.maxGapAfter<=2250,'building aperture cadence must stay near 2 km or tighter');
  assert.equal(info.roadGroups,60,'MAP2-20 core must retain the original 60 real route groups');
  assert.equal(info.knots,60,'MAP2-20 core keeps one real aperture knot per original building group');
  assert(info.totalKnots>=info.knots,'later real-building handoffs may add extra knots without changing the MAP2-20 core');
  assert.deepEqual(info.chainRows.map(r=>r.count),[32,28],'both TECH chains keep their existing group counts');
  assert(info.chainRows.every(r=>r.maxGap<=2250),'no TECH chain may return to multi-kilometre empty flight');
  assert(info.rootsTech,'all longitudinally moved building roots must stay inside TECH');
  assert.equal(info.compactedRoots,122,'all 122 underlying copied Map4 roots should move as members of the 60 logical groups');
  assert.equal(info.uniqueRoots,info.compactedRoots);
  assert(info.framed>=55,'most compacted apertures must still be genuinely framed by building mass');
  assert.equal(info.fastPhysical,0,'FAST zones stay open');
  assert(info.physical>=50,'real building physics must remain substantial');
  assert(info.knotDeviations>=15,'building-defined road must still curve away from the obsolete centre line');
  assert.equal(info.stats?.chainCompactedGroups,60);
  assert.equal(info.stats?.chainLongitudinalMoves,info.comp.moved);
  assert(Math.abs(info.stats?.chainMaxGapAfter-info.comp.maxGapAfter)<1e-6);

  const evidence=path.join(__dirname,'map2-20-evidence');fs.mkdirSync(evidence,{recursive:true});
  const shot=info.chainRows[0].first+8000;
  await page.evaluate(d=>{state.routeProgress=d;state.laneX=0;state.laneY=-45;state.paused=true;map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);},shot);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-continuous-building-chain.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-20 continuous real-building road chains');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
