/* NEXT-11C14 full industrial swept-collider route clearance map
 * zero new physics/guidance, map-phase isolation, graphics tiers.
 * Software WebGL proves visual difference, not native GPU or art approval.
 */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');

(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  const page=await browser.newPage({
    viewport:{width:1600,height:900},deviceScaleFactor:1
  });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  try{
    const three=fs.readFileSync(
      require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
      waitUntil:'domcontentloaded',timeout:30000
    });
    await page.waitForFunction(()=>
      typeof h4Gfx11c14ScanCorridors==='function' &&
      typeof h4SegmentBoxHit==='function',null,{timeout:18000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>.05,
      null,{timeout:22000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });








    const takeSnapshot=()=>page.evaluate(()=>{
      const markers=h4IndustrialGroups.flatMap(g=>
        g.children.filter(m=>m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER'));
      const c=planetaryBuildingColliders.concat(h4IndustrialColliders);
      return {
        markers:markers.map(m=>({
          id:m.id,geometry:m.geometry.uuid,material:m.material.uuid,
          matrix:m.matrix.toArray(),kind:m.userData.w05Kind
        })),
        physicalW02:h4Gfx11c3PhysicalMaterials.map(e=>({
          id:e.mesh.id,geometry:e.mesh.geometry.uuid,
          collider:[e.collider.progress,e.collider.side,
            e.collider.altitude,e.collider.halfSide,
            e.collider.halfUp,e.collider.halfDepth]
        })),
        physics:c.map((x,i)=>({
          i,p:x.progress,x:x.side,y:x.altitude,
          halfSide:x.halfSide,halfUp:x.halfUp,halfDepth:x.halfDepth,
          kind:x.kind||''
        })),
        gameplay:{
          phase:state.map4Phase,
          map:state.activeMap,
          rivals:racers.length,hunters:hunterTargets.length,
          totalSeconds:MAP4_RACE_RULES.realTimeLimit,
          arenaSeconds:MAP4_PHASES.arenaSeconds,
          exitAltitude:MAP4_PHASES.orbitAltitude
        },
        rendering:{
          textures:renderer.info.memory.textures,
          geometries:renderer.info.memory.geometries
        }
      };
    });
    await page.evaluate(()=>{state.map4Phase=3;state.paused=true;});
    const before=await takeSnapshot();
    assert.equal(before.markers.length,24);
    assert.equal(before.markers.filter(x=>x.kind==='BEACON').length,12);
    assert.equal(before.markers.filter(x=>x.kind==='HIGH_MARKER').length,12);
    assert.equal(before.physicalW02.length,34);
    assert.equal(before.physics.length,236);
    assert.equal(before.gameplay.rivals,5);
    assert.equal(before.gameplay.hunters,8);
    assert.equal(before.gameplay.totalSeconds,300);
    assert.equal(before.gameplay.arenaSeconds,60);
    assert.equal(before.gameplay.exitAltitude,850);
    const result=await page.evaluate(()=>{
      const from=14080,to=33920,step=75;
      const result=h4Gfx11c14ScanCorridors({from,to,step});
      const direct={};
      for(const track of H4_GFX11C14_TRACKS){
        const sample={routeProgress:23800,laneX:track.x,laneY:track.y};
        const all=planetaryBuildingColliders.concat(h4IndustrialColliders);
        direct[track.id]=all.flatMap((c,i)=>
          h4SegmentBoxHit(sample,sample,c,12)?[i]:[]);
      }
      const attemptedAi=h4IndustrialAvoidance(
        {routeProgress:23000},-800,-100);
      return {result,direct,attemptedAi};
    });
    const scan=result.result;
    assert.equal(scan.constraints.from,14080);
    assert.equal(scan.constraints.to,33920);
    assert.equal(scan.constraints.step,75);
    assert.equal(scan.constraints.padding,12);
    assert.equal(scan.constraints.markerCount,24);
    assert.equal(scan.constraints.readOnly,true);
    assert.equal(scan.constraints.approvalRequired,true);
    assert.deepEqual(scan.constraints.physics,[6,36,200]);
    assert.deepEqual(scan.tracks.map(x=>x.id),[
      'FAST_LOW','CENTRAL','HUNTER_FLANK','SAFE_UPPER'
    ]);
    assert.deepEqual(scan.tracks.map(x=>x.actualRoute),[
      'FAST_LOW','CENTRAL','HUNTER_FLANK','SAFE_UPPER'
    ]);
    assert.equal(scan.factory08.length,4);
    for(const track of scan.tracks){
      assert(track.sampledSegments>=260&&track.sampledSegments<=270);
      assert(track.collidingSegments>=0&&
        track.collidingSegments<=track.sampledSegments);
      assert(Math.abs(track.blockedFraction-
        track.collidingSegments/track.sampledSegments)<1e-8);
      for(const span of track.riskSpans){
        assert(span.from>=14080&&span.to<=33920);
        assert(span.to>span.from);
        assert(span.colliderIds.length>0);
        assert.equal(span.colliderNames.length,span.colliderIds.length);
      }
      for(const obstacle of track.primaryObstacles){
        assert(['W01_BUILDING_COLLIDER',
          'W05_INDUSTRIAL_COLLIDER'].includes(obstacle.source));
        assert(obstacle.collidingSegments>=1);
      }
    }
    for(const point of scan.factory08){
      const direct=result.direct[point.track];
      const indexes=point.obstacles.map(obstacle=>obstacle.index);
      assert.deepEqual(indexes,direct,
        'scanner must use same swept AABB truth as real game');
    }
    // Reproduce 08 pilot camera obstruction as an actual route collision,
    // rather than deciding physics from a screenshot.
    const fast=scan.factory08.find(x=>x.track==='FAST_LOW');
    assert(fast.obstacles.length>=1,
      '08 FAST_LOW should expose original physical obstacle');
    assert(fast.obstacles.some(obstacle=>
      obstacle.parentPath.includes('FACTORY')),
      '08 physics risk provenance should be factory landmark');
    // The scan MUST NOT silently make the player a different class or
    // change the map into an auto-corrected flight corridor.
    assert.equal(scan.stats.modifiedPhysics,0);
    assert.equal(scan.stats.modifiedRoutes,0);
    assert.equal(scan.stats.modifiedModels,0);
    assert.equal(scan.stats.approvalRequired,true);
    assert(scan.stats.realCollisionChecks>0);
    assert(typeof result.attemptedAi.avoiding==='boolean');
    const after=await takeSnapshot();
    assert.deepEqual(after.markers,before.markers);
    assert.deepEqual(after.physicalW02,before.physicalW02);
    assert.deepEqual(after.physics,before.physics);
    assert.deepEqual(after.gameplay,before.gameplay);
    assert.deepEqual(errors,[],errors.join('\n'));
    const artifact={
      contract:'NEXT-11C14 v1',
      note:'Read-only game collision volume audit; not a real 300s flight',
      allRoutes:scan,
      aiW05AvoidanceSample:result.attemptedAi,
      verifiedFast08SameAsRuntime:true,
      changesToGameplay:false,
      userPhysicalRepositionPermission:false,
      nativeGpuPerformanceTested:false,
      beforeAfterIntegrity:'PASS',
      caps:{landmarks:34,navigation:24,
        industryPhysics:36,buildingPhysics:200}
    };
    fs.writeFileSync(path.join(__dirname,
      'map4-next11c14-flight-lane-collision-map.json'),
      JSON.stringify(artifact,null,2));
    console.log('NEXT11C14 ROUTE COLLIDER AUDIT PASS',JSON.stringify({
      byRoute:scan.tracks.map(x=>({
        id:x.id,blocked:x.collidingSegments,
        segments:x.sampledSegments,spans:x.riskSpans.length,
        major:x.primaryObstacles.slice(0,5).map(y=>({
          label:y.label,source:y.source,segments:y.collidingSegments
        }))
      })),
      factory08:scan.factory08.map(x=>({
        track:x.track,obstacles:x.obstacles.map(y=>({
          label:y.label,source:y.source,path:y.parentPath
        }))
      })),
      phaseRulesUnchanged:true,materialAndPhysicsUnchanged:true
    }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
