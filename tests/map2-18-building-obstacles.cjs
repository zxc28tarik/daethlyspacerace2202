// MAP2-18 real Map4 building obstacle/chokepoint QA
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2BuildPhysicalMap4BuildingObstacles'));
assert(html.includes('map2PhysicalBuilding'));
assert(html.includes('passageHalfX=45'));

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof courseSegmentTouch==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const building=window.starbladeMap2BuildingColliders||[];
    const visibleAuthored=(mesh,rootName)=>{
      let n=mesh;
      while(n){
        if(!n.visible)return false;
        if(n.name===rootName)return true;
        n=n.parent;
      }
      return false;
    };
    const rows=building.map(o=>{
      const a={routeProgress:o.routeProgress-o.halfDepth-25,laneX:o.laneX,laneY:o.laneY};
      const b={...a,routeProgress:o.routeProgress+o.halfDepth+25};
      const hit=courseSegmentTouch(o,a,b,12.5);
      const pa={routeProgress:o.routeProgress-o.halfDepth-25,laneX:o.passageX,laneY:o.passageY};
      const pb={...pa,routeProgress:o.routeProgress+o.halfDepth+25};
      const passageBlocked=building.some(q=>courseSegmentTouch(q,pa,pb,12.5));

      const frame=getRaceFrameAtDistance(o.routeProgress);
      const physicalPoint=frame.center.clone()
        .addScaledVector(frame.right,o.laneX)
        .addScaledVector(frame.up,o.laneY);
      const meshBox=new THREE.Box3().setFromObject(o.mesh);
      const visualDistance=meshBox.isEmpty()?Infinity:meshBox.distanceToPoint(physicalPoint);
      return {
        d:o.routeProgress,x:o.laneX,y:o.laneY,hx:o.halfX,hy:o.halfY,hd:o.halfDepth,
        hit,passageBlocked,seg:map2Segment(o.routeProgress).kind,
        visible:visibleAuthored(o.mesh,o.sourceRoot),physical:!!o.mesh?.userData?.map2PhysicalBuilding,
        visualDistance,sourceRoot:o.sourceRoot,passageX:o.passageX,passageY:o.passageY
      };
    });

    const centerlineBlocked=building.filter(o=>{
      const a={routeProgress:o.routeProgress-o.halfDepth-25,laneX:0,laneY:0};
      return courseSegmentTouch(o,a,{...a,routeProgress:o.routeProgress+o.halfDepth+25},12.5);
    }).length;
    const lowLaneBlocked=building.filter(o=>{
      const a={routeProgress:o.routeProgress-o.halfDepth-25,laneX:0,laneY:-150};
      return courseSegmentTouch(o,a,{...a,routeProgress:o.routeProgress+o.halfDepth+25},12.5);
    }).length;
    const overhead=building.filter(o=>o.laneY>110).length;
    const left=building.filter(o=>o.laneX<-100).length;
    const right=building.filter(o=>o.laneX>100).length;
    const centre=building.length-left-right;
    const bins=new Set(building.map(o=>Math.floor(o.routeProgress/420)));

    const gantryIntrusions=map2Gates.filter(g=>g.kind==='GANTRY').flatMap(g=>{
      const a={routeProgress:g.distance-220,laneX:g.laneX,laneY:-215};
      const b={...a,routeProgress:g.distance+220};
      return building.filter(o=>courseSegmentTouch(o,a,b,12.5)).map(o=>({
        gate:g.distance,
        obstacle:o.routeProgress,
        hd:o.halfDepth,
        x:o.laneX,y:o.laneY,hx:o.halfX,hy:o.halfY,
        sourceRoot:o.sourceRoot,
        visual:o.mesh?.name||''
      }));
    });

    // Count actual direction changes in the deliberately preserved passage.
    const ordered=[...building].sort((a,b)=>a.routeProgress-b.routeProgress);
    let signChanges=0,lastSign=0;
    for(const o of ordered){
      const s=Math.sign(o.passageX);
      if(s&&lastSign&&s!==lastSign)signChanges++;
      if(s)lastSign=s;
    }

    const road=window.starbladeMap2BuildingRoad;
    const buildingRoadDeviations=road?.knots?.filter(k=>Math.abs(k.x)>60||Math.abs(k.y+55)>42).length||0;
    const retiredCount=window.starbladeMap2RetiredLegacyObstacles||0;
    const retiredVisible=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2RetiredForBuildingRoute)retiredVisible.push({
        name:o.name,visible:o.visible
      });
    });
    return {
      buildingRoadActive:!!road,
      buildingRoadDeviations,
      count:building.length,
      totalObstacles:map2Obstacles.length,
      originalObstacleEstimate:map2Obstacles.length-building.length,
      retiredCount,retiredVisible,
      rows,
      bins:bins.size,centerlineBlocked,lowLaneBlocked,overhead,left,right,centre,signChanges,gantryIntrusions,
      stats:window.starbladeMap2Layout?.visualStage||null,
      fast:building.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length
    };
  });
  console.log('MAP2-18 BUILDING_PHYSICS '+JSON.stringify(info));

  assert(info.count>=30,'real Map4 building masses should add a substantial physical layer');
  if(info.retiredCount>0){
    assert.equal(
      info.originalObstacleEstimate+info.retiredCount,382,
      'MAP2-25 may replace only explicitly retired legacy route obstacles'
    );
    assert(info.retiredVisible.length>=info.retiredCount,
      'retired legacy obstacles must be tagged on their visible source meshes');
    assert(info.retiredVisible.every(x=>x.visible===false),
      'a retired legacy collider may not leave a visible generic obstacle behind');
    assert.equal(info.stats?.throughBuildingRetiredLegacyObstacles,info.retiredCount);
  }else{
    assert.equal(info.originalObstacleEstimate,382,'MAP2-18 must preserve the established legacy obstacle layer before MAP2-25 retirement');
  }
  assert.equal(info.fast,0,'FAST zones must remain free of building-derived colliders');
  assert(info.bins>=20,'building physics should be distributed across many route slices');
  assert(info.rows.every(x=>x.seg==='TECH'&&x.hit),'every derived building collider must be physically hittable in TECH');
  assert(info.rows.every(x=>!x.passageBlocked),'the deliberate narrow passage must remain open');
  assert(info.rows.every(x=>x.visible&&x.physical),'colliders must come from visible real building meshes');
  assert.equal(info.gantryIntrusions.length,0,'real building placement must not close authored GANTRY low passages');
  assert(info.rows.every(x=>x.visualDistance<=95),'physics must stay inside/very close to rendered building mass');
  if(info.buildingRoadActive){
    assert(info.buildingRoadDeviations>=8,'building-defined road must depart repeatedly from the obsolete centre line');
  }else{
    assert(info.centerlineBlocked>=2,'real buildings must force multiple departures from the centre line');
  }
  assert(info.overhead>=20,'real Map4 architecture must also create substantial vertical/overhead pressure');
  assert(info.left>=5&&info.right>=5,'real building obstacles must pressure both sides of the route');
  assert(info.signChanges>=4,'preserved passage must change side repeatedly to create slalom pressure');
  assert.equal(info.stats?.map4BuildingColliders,info.count);
  assert.equal(info.stats?.map4BuildingColliderBins,info.bins);

  const evidence=path.join(__dirname,'map2-18-evidence');fs.mkdirSync(evidence,{recursive:true});
  const sample=info.rows.find(x=>Math.abs(x.x)<180)||info.rows[0];
  await page.evaluate(p=>{
    state.routeProgress=Math.max(0,p-900);state.laneX=0;state.laneY=-40;
    state.paused=true;map2UpdateVisibility(state.routeProgress);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  },sample.d);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-real-building-chokepoint.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-18 real Map4 buildings are physical chokepoints');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
