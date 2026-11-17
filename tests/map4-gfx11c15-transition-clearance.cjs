/* NEXT-11C15: READ-ONLY hypothetical lane transition clearance matrix.
 * Uses the original production swept collision algorithm and live 236
 * physical colliders. This is NOT pilot input, AI steering, or 300s flight.
 * No map geometry, route bonus, game-state rules, or factory relocation.
 */
'use strict';
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
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
    await page.goto(pathToFileURL(
      path.resolve(__dirname,'../index.html')).toString(),{
        waitUntil:'domcontentloaded',timeout:30000
      });
    await page.waitForFunction(()=>
      typeof h4SegmentBoxHit==='function' &&
      typeof h4Gfx11c14ScanCorridors==='function',
      null,{timeout:18000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>
      state.running&&state.raceTime>.05,null,{timeout:22000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });

    const snapshot=()=>page.evaluate(()=>{
      const markers=h4IndustrialGroups.flatMap(g=>
        g.children.filter(m=>
          m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER'));
      return {
        markers:markers.map(m=>({
          id:m.id,kind:m.userData.w05Kind,
          geometry:m.geometry.uuid,
          material:m.material.uuid,
          matrix:m.matrix.toArray()
        })),
        w02:h4Gfx11c3PhysicalMaterials.map(e=>({
          id:e.mesh.id,geometry:e.mesh.geometry.uuid,
          collider:[e.collider.progress,e.collider.side,
            e.collider.altitude,e.collider.halfSide,
            e.collider.halfUp,e.collider.halfDepth]
        })),
        colliders:planetaryBuildingColliders
          .concat(h4IndustrialColliders).map(c=>({
            progress:c.progress,side:c.side,altitude:c.altitude,
            halfDepth:c.halfDepth,halfSide:c.halfSide,
            halfUp:c.halfUp,kind:c.kind||''
          })),
        rules:{
          map:state.activeMap,
          rivals:racers.length,hunters:hunterTargets.length,
          arenaSeconds:MAP4_PHASES.arenaSeconds,
          limit:MAP4_RACE_RULES.realTimeLimit,
          altitude:MAP4_PHASES.orbitAltitude,
          canyon:h4CanyonColliders.length,
          industrial:h4IndustrialColliders.length,
          buildings:planetaryBuildingColliders.length
        }
      };
    });

    const before=await snapshot();
    assert.equal(before.markers.length,24);
    assert.equal(before.markers.filter(x=>x.kind==='BEACON').length,12);
    assert.equal(before.markers.filter(x=>x.kind==='HIGH_MARKER').length,12);
    assert.equal(before.w02.length,34);
    assert.equal(before.colliders.length,236);
    assert.equal(before.rules.rivals,5);
    assert.equal(before.rules.hunters,8);
    assert.equal(before.rules.arenaSeconds,60);
    assert.equal(before.rules.limit,300);
    assert.equal(before.rules.altitude,850);
    assert.equal(before.rules.canyon,6);

    const report=await page.evaluate(()=>{
      const from=22000,to=25200,step=40,padding=12;
      const tracks=[
        {id:'FAST_LOW',x:-800,y:-100},
        {id:'CENTRAL',x:0,y:350},
        {id:'HUNTER_FLANK',x:900,y:310},
        {id:'SAFE_UPPER',x:0,y:760}
      ];
      const colliders=planetaryBuildingColliders
        .concat(h4IndustrialColliders);
      const owners=new Map();
      planetaryWorldGroup.traverse(mesh=>{
        if(mesh.isMesh&&mesh.userData.h4Collider)
          owners.set(mesh.userData.h4Collider,mesh);
      });
      const identities=colliders.map((c,index)=>{
        const mesh=owners.get(c);
        return {
          index,label:mesh?.name||c.kind||'UNNAMED',
          source:index<planetaryBuildingColliders.length?
            'W01_BUILDING_COLLIDER':'W05_INDUSTRIAL_COLLIDER',
          progress:c.progress,
          ownerResolved:!!mesh
        };
      });
      const ownerCount=identities.filter(x=>x.ownerResolved).length;
      const constant=t=>[
        [from,t.x,t.y],[to,t.x,t.y]
      ];
      const coords=id=>{
        const t=tracks.find(x=>x.id===id);
        if(!t)throw new Error('Unknown track '+id);
        return [t.x,t.y];
      };
      const pathPoints=(start,begin,end,target)=>{
        const a=coords(start),b=coords(target);
        return [
          [from,...a],[begin,...a],[end,...b],[to,...b]
        ];
      };
      const scenarios=[
        ...tracks.map(t=>({id:'FIXED_'+t.id,points:constant(t)})),
        {id:'FAST_TO_CENTER_EARLY',
          points:pathPoints('FAST_LOW',22600,23200,'CENTRAL')},
        {id:'FAST_TO_CENTER_MID',
          points:pathPoints('FAST_LOW',23000,23600,'CENTRAL')},
        {id:'FAST_TO_CENTER_LATE',
          points:pathPoints('FAST_LOW',23500,24100,'CENTRAL')},
        {id:'FAST_TO_HUNTER_EARLY',
          points:pathPoints('FAST_LOW',22200,23500,'HUNTER_FLANK')},
        {id:'FAST_TO_UPPER_EARLY',
          points:pathPoints('FAST_LOW',22200,23500,'SAFE_UPPER')},
        {id:'CENTER_TO_HUNTER',
          points:pathPoints('CENTRAL',22900,23600,'HUNTER_FLANK')},
        {id:'CENTER_TO_UPPER',
          points:pathPoints('CENTRAL',23000,23600,'SAFE_UPPER')},
        {id:'CENTER_TO_FAST_AT_08',
          points:pathPoints('CENTRAL',23400,24000,'FAST_LOW')},
        {id:'FAST_TO_CENTER_AFTER_08',
          points:pathPoints('FAST_LOW',24000,24600,'CENTRAL')}
      ];
      const position=(points,p)=>{
        if(p<=points[0][0])return {
          routeProgress:p,laneX:points[0][1],laneY:points[0][2]
        };
        for(let i=1;i<points.length;i++){
          const a=points[i-1],b=points[i];
          if(p>b[0])continue;
          const t=Math.max(0,Math.min(1,
            (p-a[0])/(b[0]-a[0])));
          // Linear transition exposes exact swept-segment collision
          // without imposing an unverified steering-speed assumption.
          return {
            routeProgress:p,
            laneX:a[1]+(b[1]-a[1])*t,
            laneY:a[2]+(b[2]-a[2])*t
          };
        }
        const b=points[points.length-1];
        return {routeProgress:p,laneX:b[1],laneY:b[2]};
      };
      const sweptHits=(previous,current,coarse=true)=>{
        const lower=Math.min(previous.routeProgress,
          current.routeProgress)-25;
        const upper=Math.max(previous.routeProgress,
          current.routeProgress)+25;
        const hits=[];
        for(let index=0;index<colliders.length;index++){
          const c=colliders[index];
          if(coarse&&(c.progress+c.halfDepth<lower||
            c.progress-c.halfDepth>upper))continue;
          if(h4SegmentBoxHit(previous,current,c,padding))
            hits.push(index);
        }
        return hits;
      };
      const trace=scenario=>{
        const sections=[];
        const hitIds=new Set();
        let blockedSegments=0;
        let activeSpan=null;
        const riskSpans=[];
        for(let p=from;p<to;p+=step){
          const next=Math.min(to,p+step);
          const a=position(scenario.points,p);
          const b=position(scenario.points,next);
          const ids=sweptHits(a,b,true);
          // Independent full-array scan validates the game's ±25
          // broadphase is not dropping a collision during lane changes.
          const exhaustive=sweptHits(a,b,false);
          if(JSON.stringify(ids)!==JSON.stringify(exhaustive))
            throw new Error('Broadphase mismatch '+scenario.id+' '+p);
          const hit=ids.length>0;
          if(hit){
            blockedSegments++;
            for(const id of ids)hitIds.add(id);
            if(!activeSpan)activeSpan={
              from:p,to:next,colliderIds:new Set(ids)
            };
            else{
              activeSpan.to=next;
              for(const id of ids)activeSpan.colliderIds.add(id);
            }
          }else if(activeSpan){
            riskSpans.push({
              from:activeSpan.from,to:activeSpan.to,
              colliderIds:[...activeSpan.colliderIds]
            });
            activeSpan=null;
          }
          sections.push({
            from:p,to:next,
            xFrom:+a.laneX.toFixed(2),
            yFrom:+a.laneY.toFixed(2),
            xTo:+b.laneX.toFixed(2),
            yTo:+b.laneY.toFixed(2),
            colliderIds:ids
          });
        }
        if(activeSpan)riskSpans.push({
          from:activeSpan.from,to:activeSpan.to,
          colliderIds:[...activeSpan.colliderIds]
        });
        const maxSlope=scenario.points.slice(1).reduce((acc,b,i)=>{
          const a=scenario.points[i],dp=b[0]-a[0];
          return {
            x:Math.max(acc.x,Math.abs(b[1]-a[1])/dp),
            y:Math.max(acc.y,Math.abs(b[2]-a[2])/dp)
          };
        },{x:0,y:0});
        return {
          id:scenario.id,points:scenario.points,
          sampledSegments:sections.length,
          blockedSegments,
          blockedFraction:blockedSegments/sections.length,
          riskSpans,
          colliderIds:[...hitIds],
          obstacles:[...hitIds].map(i=>identities[i]),
          maxLateralChangePerProgress:maxSlope,
          sections
        };
      };
      const routes=scenarios.map(trace);
      const c14=h4Gfx11c14ScanCorridors({from,to,step});
      const c14Check=tracks.map(t=>{
        const fixed=routes.find(x=>x.id==='FIXED_'+t.id);
        const original=c14.tracks.find(x=>x.id===t.id);
        return {id:t.id,
          c14Hits:original.collidingSegments,
          c15Hits:fixed.blockedSegments,
          match:original.collidingSegments===fixed.blockedSegments};
      });
      const probe=tracks.map(t=>{
        const p={routeProgress:23800,laneX:t.x,laneY:t.y};
        const indexes=sweptHits(p,p,false);
        return {track:t.id,colliderIds:indexes,
          obstacles:indexes.map(i=>identities[i])};
      });
      return {
        contract:'NEXT-11C15 v1',
        method:'original h4SegmentBoxHit, swept waypoints, padding=12',
        readOnly:true,routeOrGeometryChanges:false,
        pilotSimulation:false,aiSteeringSimulation:false,
        dynamicsValidated:false,
        nativeGpuMeasured:false,
        limits:{from,to,step,padding,segments:(to-from)/step,
          buildingCount:planetaryBuildingColliders.length,
          industryCount:h4IndustrialColliders.length,
          navigationCount:h4IndustrialGroups.flatMap(g=>
            g.children.filter(m=>
              ['BEACON','HIGH_MARKER'].includes(m.userData.w05Kind)
            )).length,
          ownerCount},
        c14FixedCrossCheck:c14Check,
        sample08:probe,
        scenarios:routes
      };
    });
    assert.equal(report.readOnly,true);
    assert.equal(report.routeOrGeometryChanges,false);
    assert.equal(report.pilotSimulation,false);
    assert.equal(report.aiSteeringSimulation,false);
    assert.equal(report.dynamicsValidated,false);
    assert.deepEqual([
      report.limits.buildingCount,
      report.limits.industryCount,
      report.limits.ownerCount,
      report.limits.navigationCount
    ],[200,36,236,24]);
    assert.equal(report.scenarios.length,13);
    assert(report.c14FixedCrossCheck.every(x=>x.match),
      'fixed tracks must match the independent C14 scanner');
    for(const route of report.scenarios){
      assert.equal(route.sampledSegments,80);
      assert(route.blockedSegments>=0&&
        route.blockedSegments<=80);
      assert.equal(route.sections.length,80);
      assert(route.obstacles.every(x=>x.ownerResolved));
      assert(route.riskSpans.every(x=>
        x.from>=22000&&x.to<=25200&&x.to>x.from&&
        x.colliderIds.length>0));
      assert(route.sections.every(x=>
        x.to>x.from&&x.colliderIds.every(i=>i>=0&&i<236)));
    }
    const fast=report.sample08.find(x=>x.track==='FAST_LOW');
    assert.equal(fast.colliderIds.length,2,
      'known 08 FAST_LOW W01/VQ02 blockage remains physical');
    assert(fast.obstacles.every(x=>x.source==='W01_BUILDING_COLLIDER'));
    for(const track of ['CENTRAL','HUNTER_FLANK','SAFE_UPPER'])
      assert.equal(report.sample08.find(x=>x.track===track)
        .colliderIds.length,0);
    assert(report.scenarios.find(x=>x.id==='FIXED_FAST_LOW')
      .blockedSegments>0,'fast baseline must retain factory hazard');

    const after=await snapshot();
    assert.deepEqual(after,before,
      'C15 must not mutate physical meshes, route markers or game rules');
    assert.deepEqual(errors,[],errors.join('\n'));
    const summary=report.scenarios.map(s=>({
      id:s.id,blocked:s.blockedSegments,of:s.sampledSegments,
      firstRisk:s.riskSpans[0]||null,
      distinctObstacles:s.obstacles.length
    }));
    const result={
      ...report,
      interpretation:'Geometric test paths only; not verified steerable '+
        'in real time, not guaranteed safe, not real 300s pilot flight.',
      originalPhysicsAndRules:'PASS',
      summary
    };
    fs.writeFileSync(path.join(__dirname,
      'map4-next11c15-lane-transition-matrix.json'),
      JSON.stringify(result,null,2));
    console.log('NEXT11C15 TRANSITION CLEARANCE PASS',
      JSON.stringify({scenarioSummary:summary,
        c14FixedCrossCheck:report.c14FixedCrossCheck,
        sample08:report.sample08.map(x=>({
          id:x.track,colliderCount:x.colliderIds.length
        })),
        beforeAfterIntegrity:'PASS'}));
  }finally{
    await browser.close();
  }
})().catch(e=>{console.error(e);process.exitCode=1;});
