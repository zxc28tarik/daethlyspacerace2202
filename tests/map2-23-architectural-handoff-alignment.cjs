// MAP2-23 — architecture faces successive real openings instead of reading as roadside rows
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2AlignArchitecturalHandoffs'));
assert(html.includes('map2ArchitecturalAligned'));

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
    const align=window.starbladeMap2ArchitecturalAlignment;
    const road=window.starbladeMap2BuildingRoad;
    const physical=window.starbladeMap2BuildingColliders||[];
    const alignedRoots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ArchitecturalAligned)alignedRoots.push({
        name:o.name,
        d:o.userData.map2TargetDistance,
        yaw:o.userData.map2ArchitecturalYaw,
        targetX:o.userData.map2ArchitecturalFacingX,
        targetD:o.userData.map2ArchitecturalFacingDistance,
        transition:!!o.userData.map2TransitionRoadClone,
        exactStation:!!o.userData.map2ExactMap4Clone,
        exactCity:!!o.userData.map2ExactMap4CityClone,
        exactLandmark:!!o.userData.map2ExactMap4LandmarkClone,
        exactCorridor:!!o.userData.map2ExactMap4CorridorClone,
        exactIndustrial:!!o.userData.map2ExactMap4IndustrialVisualPart
      });
    });

    const groups=road.groups.filter(g=>g.open);
    const blocked=groups.filter(g=>{
      const a={routeProgress:g.d-110,laneX:g.x,laneY:g.y};
      const b={...a,routeProgress:g.d+110};
      return physical.some(o=>courseSegmentTouch(o,a,b,12.5));
    });
    const techRanges=MAP2_SEGMENTS.filter(s=>s.kind==='TECH').map(s=>({from:s.from*MAP2_DISTANCE,to:s.to*MAP2_DISTANCE}));
    const maxGap=Math.max(...techRanges.map(range=>{
      const ks=road.knots.filter(k=>k.distance>=range.from&&k.distance<=range.to).sort((a,b)=>a.distance-b.distance);
      let prev=range.from,max=0;
      for(const k of ks){max=Math.max(max,k.distance-prev);prev=k.distance;}
      return Math.max(max,range.to-prev);
    }));

    const records=align.groups||[];
    let signChecks=0,signMatches=0;
    for(let i=0;i<records.length-1;i++){
      const a=records[i],b=records[i+1];
      if(map2Segment(a.distance).kind!=='TECH'||map2Segment(b.distance).kind!=='TECH')continue;
      if(b.distance-a.distance>1800)continue;
      const dx=b.x-a.x;
      if(Math.abs(dx)<55||Math.abs(a.yaw)<.02)continue;
      signChecks++;
      if(Math.sign(a.yaw)===Math.sign(dx))signMatches++;
    }

    const yawAbs=records.map(r=>Math.abs(THREE.MathUtils.radToDeg(r.yaw)));
    const substantial=yawAbs.filter(v=>v>=4).length;
    const strong=yawAbs.filter(v=>v>=8).length;
    const framed=groups.filter(g=>g.framed).length;
    const sourcesOk=alignedRoots.every(r=>r.exactStation||r.exactCity||r.exactLandmark||r.exactCorridor||r.exactIndustrial);
    return {
      align,
      records:records.length,
      alignedRoots:alignedRoots.length,
      transitionAligned:alignedRoots.filter(r=>r.transition).length,
      substantial,strong,maxYaw:yawAbs.length?Math.max(...yawAbs):0,
      signChecks,signMatches,signRatio:signChecks?signMatches/signChecks:1,
      groups:groups.length,framed,blocked:blocked.length,maxGap,
      physical:physical.length,
      fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      sourcesOk,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });

  console.log('MAP2-23 ARCH_ALIGNMENT '+JSON.stringify(info));

  assert.equal(info.records,118,'all 118 real building route groups should receive architectural orientation records');
  assert(info.align.aligned>=80,'most building groups should receive a non-trivial orientation adjustment');
  assert(info.substantial>=25,'many groups should visibly turn at least four degrees');
  assert(info.strong>=8,'several handoffs should create strong architectural turns');
  assert(info.maxYaw<=20.01,'building yaw must remain believable');
  assert(info.maxYaw>=8,'at least one strong canyon/factory handoff should exist');
  assert(info.align.facingPairs>=25,'many adjacent shells should toe toward one another');
  assert(info.signChecks>=15,'enough lateral handoffs must be measurable');
  assert(info.signRatio>=.72,'building yaw should usually face the next lateral opening');
  assert(info.transitionAligned>=40,'most transition W05 buildings should participate in architectural alignment');
  assert(info.sourcesOk,'alignment may only act on copied real Map4 building roots');
  assert.equal(info.groups,118,'no building-road group may be lost after orientation');
  assert(info.framed>=108,'most openings must remain strongly framed after rotation');
  assert.equal(info.blocked,0,'rotating architecture may not close its own real route aperture');
  assert(info.maxGap<=1550,'MAP2-22 dense building handoff cadence must remain');
  assert(info.physical>=150,'real building physics must remain dense');
  assert.equal(info.fastPhysical,0,'FAST sectors remain free of building collision');
  assert.equal(info.stats?.architecturalAlignedGroups,info.align.aligned);
  assert.equal(info.stats?.architecturalYawTurns,info.align.yawTurns);
  assert(Math.abs(info.stats?.architecturalMaxYawDeg-info.align.maxYawDeg)<1e-6);
  assert.equal(info.stats?.architecturalFacingPairs,info.align.facingPairs);

  const evidence=path.join(__dirname,'map2-23-evidence');fs.mkdirSync(evidence,{recursive:true});
  const strongest=info.align.groups.slice().sort((a,b)=>Math.abs(b.yaw)-Math.abs(a.yaw))[0];
  await page.evaluate(d=>{
    const road=window.starbladeMap2BuildingRoad;
    const k=road.knots.reduce((best,x)=>Math.abs(x.distance-d)<Math.abs(best.distance-d)?x:best,road.knots[0]);
    state.routeProgress=Math.max(0,d-650);state.laneX=k.x;state.laneY=k.y;state.paused=true;
    map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  },strongest.distance);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-architectural-handoff-alignment.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-23 architectural building handoff alignment');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
