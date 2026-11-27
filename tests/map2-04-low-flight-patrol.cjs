'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){if(m[1].trim())new vm.Script(m[1]);}
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
try{
const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
const page=await browser.newPage({viewport:{width:1280,height:720}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForFunction(()=>typeof selectMap==='function'&&typeof map2BuildCourse==='function');
assert(await page.locator('#map-choice-4').isDisabled());
assert(await page.locator('#ui-side-map4').isDisabled());
const original=await page.evaluate(()=>({map:state.activeMap,length:RACE_ROUTE_NOMINAL_DISTANCE,asteroids:asteroids.length,solids:staticObstacles.length,items:itemBoxes.length,arc:raceRouteCurve.getLength(),map4Built:planetaryWorldRegions.length}));
assert.equal(original.map,'map1');assert.equal(original.length,50000);
await page.evaluate(()=>selectMap('map4'));
assert.equal(await page.evaluate(()=>state.activeMap),'map1');
await page.locator('#map-choice-2').click();
const layout=await page.evaluate(()=>{
  const result=window.starbladeMap2Layout;
  const fast=MAP2_SEGMENTS.filter(s=>s.kind==='FAST');
  const allClear=map2Gates.every(g=>{
    const a={routeProgress:g.distance-220,laneX:g.laneX,laneY:g.laneY};
    const b={...a,routeProgress:g.distance+220};
    return !map2Obstacles.some(o=>courseSegmentTouch(o,a,b,12.5));
  });
  const allAlternativesClear=map2Gates.every(g=>g.openings.every(p=>{
    const a={routeProgress:g.distance-g.depth/2-40,laneX:p.x,laneY:p.y};
    const b={...a,routeProgress:g.distance+g.depth/2+40};
    return !map2Obstacles.some(o=>courseSegmentTouch(o,a,b,12.5));
  }));
  const gantryOpen=map2Gates.filter(g=>g.kind==='GANTRY').every(g=>{
    const a={routeProgress:g.distance-220,laneX:g.laneX,laneY:-215};
    return !map2Obstacles.some(o=>courseSegmentTouch(o,a,{...a,routeProgress:g.distance+220},12.5));
  });
  const centerBlocked=map2Gates.filter(g=>g.kind==='DUAL_FACTORY').every(g=>{
    const a={routeProgress:g.distance-220,laneX:0,laneY:-38};
    return map2Obstacles.some(o=>courseSegmentTouch(o,a,{...a,routeProgress:g.distance+220},12.5));
  });
  const kitInstances=[0,0,0,0]; let shared=true;
  map2CourseGroup.traverse(o=>{if(o.userData.map2KitStyle!==undefined){
    const k=o.userData.map2KitStyle;kitInstances[k]++;shared=shared&&o.geometry===h4Vis02Kits[k]&&o.material===h4Vis02Mat;
  }});
  const solidHit=map2Gates.every(g=>{
    const o=map2Obstacles.find(o=>o.routeProgress===g.distance);
    return courseSegmentTouch(o,{routeProgress:g.distance-240,laneX:o.laneX,laneY:o.laneY},
      {routeProgress:g.distance+240,laneX:o.laneX,laneY:o.laneY},12.5);
  });
  return {...result,allClear,allAlternativesClear,gantryOpen,centerBlocked,kitInstances,shared,solidHit,fastClear:!map2Obstacles.some(o=>fast.some(s=>o.routeProgress-o.halfDepth<s.to*MAP2_DISTANCE&&o.routeProgress+o.halfDepth>s.from*MAP2_DISTANCE)),
    map4Built:planetaryWorldRegions.length,sceneVisible:map2CourseGroup.visible};
});
assert.equal(layout.distance,175000);assert(Math.abs(layout.actualArc/layout.map1Arc-3.5)<.001);
assert(layout.closure<.01);assert(layout.structures>200);assert(layout.gates>50);
assert(layout.allClear,'every opening should pass a pilot-sized sphere');
assert(layout.allAlternativesClear);assert(layout.gantryOpen);assert(layout.centerBlocked);assert(layout.shared);assert.deepEqual(layout.kitInstances,layout.kitCounts);assert(layout.kitCounts.every(n=>n>0));assert(layout.openings>layout.gates);assert.equal(layout.gateKinds.length,4);
assert(layout.solidHit,'solid factory panels should collide');assert(layout.fastClear);
assert.equal(layout.map4Built,original.map4Built);assert(layout.sceneVisible);
assert.deepEqual(layout.segments.filter(s=>s.kind==='FAST').map(s=>Math.round((s.to-s.from)*100)),[15,10]);
await page.locator('#map-choice-1').click();
const restored=await page.evaluate(()=>({map:state.activeMap,length:RACE_ROUTE_NOMINAL_DISTANCE,asteroids:asteroids.length,solids:staticObstacles.length,items:itemBoxes.length,arc:raceRouteCurve.getLength(),map4Built:planetaryWorldRegions.length}));
assert.deepEqual(restored,original);
await page.locator('#map-choice-2').click();
await page.locator('#start-btn').click();
await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
assert.equal(await page.evaluate(()=>racers.length),5);
assert.equal(await page.evaluate(()=>tryFirePlayerLasers()),false);
const decisions=await page.evaluate(()=>{
    const dual=map2Gates.find(g=>g.kind==='DUAL_FACTORY');
    const make=(x,y)=>({routeProgress:dual.distance-1200,laneX:x,laneY:y,currentSpeed:RACE_SPEEDS.NORMAL,
        vx:0,vy:0,radius:12.5,profile:'BALANCED',aiStats:{}});
    const left=make(-105,-38),right=make(105,-38);
    const l=map2PilotPlan(left,dual,480).gatePlan,r=map2PilotPlan(right,dual,480).gatePlan;
    left.laneX=105;
    const held=map2PilotPlan(left,dual,480).gatePlan.openingIndex===l.openingIndex;
    const safe=map2Gates.every(g=>g.openings.every((p,i)=>{
        const pilot=make(p.x,p.y);pilot.routeProgress=g.distance-1200;
        const q=map2PilotPlan(pilot,g,480).gatePlan;
        const a={routeProgress:g.distance-g.depth/2-40,laneX:q.x,laneY:q.y};
        return !map2Obstacles.some(o=>courseSegmentTouch(o,a,{...a,routeProgress:g.distance+g.depth/2+40},12.5));
    }));
    let sharp=0,straight=0;
    for(let d=0;d<MAP2_DISTANCE;d+=250){
        const sev=map2TurnSeverity(d,RACE_SPEEDS.NORMAL);
        if(sev>.23)sharp++;
        if(sev<.035)straight++;
    }
    const late=make(240,100);late.routeProgress=dual.distance-dual.depth/2-180;late.currentSpeed=RACE_SPEEDS.BOOST;
    return {left:l.openingIndex,right:r.openingIndex,held,safe,sharp,straight,lateBrake:map2PilotPlan(late,dual,480).gatePlan.shouldBrake};
});
assert.equal(decisions.left,0);assert.equal(decisions.right,1);assert(decisions.held);
assert(decisions.safe);assert(decisions.sharp>0);assert(decisions.straight>0);assert(decisions.lateBrake);
console.log('PASS MAP2-03 aperture and curvature decisions',JSON.stringify(decisions));
// MAP2-04 retired: high flight must not create an overhead fighter, warn or deal patrol damage.
const retired=await page.evaluate(()=>{
  state.paused=true;state.routeProgress=40000;state.laneY=350;
  const notice=updateRaceHudWarning();
  return {fighter:!!scene.getObjectByName('MAP2_OVERHEAD_PATROL'),
    patrolTelemetry:window.starbladeMap2Patrol,
    activePatrol:state.map2Patrol,
    hasAirWarning:!!notice&&/DEVRİYE|ALÇAL.*ÇATI/.test(notice.title+' '+notice.detail)};
});
assert.equal(retired.fighter,false);
assert.equal(retired.patrolTelemetry,null);
assert.equal(retired.activePatrol,null);
assert.equal(retired.hasAirWarning,false);
console.log('PASS MAP2-04 overhead patrol and altitude alerts retired',JSON.stringify(retired));

// Exercise actual updateGame, contact checks, energy, and finishing for the whole fleet.
// The player is marked finished only in this harness, to isolate pilot AI from manual driving.
// Pausing rendering-driven simulation avoids double stepping.
const fleet=await page.evaluate(()=>{
    state.paused=true;state.finished=true;state.finishTime=0;state.maxPostFinishWait=1000;
    // Explicit deterministic starting formation; no invulnerability, no position skips.
    racers.forEach((r,i)=>{
        const angle=i*2*Math.PI/5;
        r.routeProgress=0;r.laneX=Math.cos(angle)*105;r.laneY=Math.sin(angle)*105;
        r.vx=0;r.vy=0;r.targetX=r.laneX;r.targetY=r.laneY;
        r.map2GateChoice=null;positionRacerOnRoute(r);
    });
    let frames=0;
    for(;frames<12000&&state.running&&!racers.every(r=>r.finished||r.dnf);frames++){
        updateGame(1/30);
    }
    return {frames,gates:map2Gates.length,rivals:racers.map(r=>({
        name:r.name,finished:r.finished,dnf:r.dnf,shield:r.shield,progress:r.routeProgress,
        energy:r.energy,stats:{...r.aiStats},finishTime:r.finishTime
    }))};
});
console.log('MAP2-03 fleet result',JSON.stringify(fleet));
assert.equal(fleet.rivals.length,5);
assert(fleet.rivals.every(r=>Number.isFinite(r.progress)&&r.energy>=0&&r.energy<=100));
assert(fleet.rivals.filter(r=>r.finished).length>=4,'at least four rivals finish the complete physical course');
assert(fleet.rivals.filter(r=>r.finished).every(r=>r.stats.map2GateExits===fleet.gates));
assert(fleet.rivals.some(r=>r.stats.map2DualOpening0>0));
assert(fleet.rivals.some(r=>r.stats.map2DualOpening1>0));
assert(fleet.rivals.every(r=>r.stats.map2CurveBrakeSeconds>0&&r.stats.map2FastBoostSeconds>0));
assert(await page.evaluate(()=>racers.every(r=>!r.map2Patrol||r.map2Patrol.hits===0)),'normal low pilots must not take patrol damage');

const evidence=path.join(__dirname,'map2-04-evidence');fs.mkdirSync(evidence,{recursive:true});
await page.screenshot({path:path.join(evidence,'map2-start.png')});
assert.deepEqual(errors,[]);
console.log('PASS MAP2-03 industrial geometry/selection/launch and full fleet',JSON.stringify(layout));
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
