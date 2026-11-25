'use strict';
// MAP2-45 — widened rival decisions + physics bins + real renderer/culling evidence.
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
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{
    waitUntil:'domcontentloaded',timeout:60000
  });
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&
    typeof map2PerformanceSnapshot==='function'&&
    typeof map2ObstacleCandidates==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&
    window.starbladeMap2PhysicsBins?.obstacles>100&&
    window.starbladeMap2PhysicalConsistency,null,{timeout:90000});

  const base=await page.evaluate(()=>{
    state.paused=true;
    const dummy={routeProgress:12000,currentSpeed:RACE_SPEEDS.NORMAL,radius:12.5};
    const scoreWide=scoreRacingLane(480,0,dummy,[],null,30);
    const scoreTooFar=scoreRacingLane(600,0,dummy,[],null,30);
    let missingFromCenterBin=0;
    for(const o of map2Obstacles){
      const idx=THREE.MathUtils.clamp(
        Math.floor(o.routeProgress/MAP2_PHYSICS_BIN_SIZE),0,map2ObstacleBins.length-1);
      if(!map2ObstacleBins[idx].includes(o))missingFromCenterBin++;
    }
    return {
      x500:raceLaneEnvelopeMetric(500,0),
      y250:raceLaneEnvelopeMetric(0,250),
      diagonal:raceLaneEnvelopeMetric(400,180),
      scoreWide,scoreTooFar,
      bins:{...window.starbladeMap2PhysicsBins},
      missingFromCenterBin,
      obstacles:map2Obstacles.length,
      fastPhysical:(window.starbladeMap2BuildingColliders||[])
        .filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      map4Hidden:!planetaryWorldGroup.visible
    };
  });

  assert(Math.abs(base.x500-250)<1e-6,'Map2 X must use 2x horizontal envelope');
  assert(Math.abs(base.y250-250)<1e-6,'Map2 Y scale must remain unchanged');
  assert(base.diagonal>250&&base.diagonal<300);
  assert(base.scoreWide>-1e5,'a widened horizontal AI lane must be considered valid');
  assert(base.scoreTooFar<=-1e6,'AI still needs a conservative outer safety margin');
  assert.equal(base.missingFromCenterBin,0,'every Map2 obstacle must exist in its center route bin');
  assert(base.bins.bins>80&&base.bins.maxOccupancy<base.obstacles*.35,
    'route bins should keep local collider occupancy far below the full obstacle set');
  assert.equal(base.fastPhysical,0);
  assert(base.map4Hidden);

  const samples=await page.evaluate(()=>{
    const out=[];
    for(const d of [4500,28500,47000,100500,147000]){
      const f=getRaceFrameAtDistance(d);
      const q=map2Segment(d).kind==='TECH'?starbladeMap2BuildingPassageAt(d):{x:0,y:-55};
      state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
      state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
      const rot=new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
      camera.quaternion.copy(rot);camera.fov=70;camera.updateProjectionMatrix();
      map2UpdateVisibility(d);
      scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
      renderer.render(scene,camera);
      out.push({d,...map2PerformanceSnapshot()});
    }
    return out;
  });
  console.log('MAP2-45 RENDER '+JSON.stringify(samples));
  assert(samples.every(x=>x.visibility.visibleSections>0&&
    x.visibility.visibleSections<x.visibility.totalSections),
    'section culling should keep only a route neighborhood active');
  assert(samples.every(x=>x.visibility.behind>=1700&&x.visibility.behind<=2050&&
    x.visibility.ahead>=8400&&x.visibility.ahead<=9300));
  assert(samples.every(x=>x.instancing.visibleBatches<x.instancing.totalBatches&&
    x.instancing.visibleInstances<x.instancing.totalInstances),
    'instanced city should be culled by hidden route sections');
  assert(samples.every(x=>Number.isFinite(x.renderer.calls)&&x.renderer.calls>0&&
    Number.isFinite(x.renderer.triangles)&&x.renderer.triangles>0));

  const fleet=await page.evaluate(()=>{
    state.paused=true;state.finished=true;state.finishTime=0;state.maxPostFinishWait=1000;
    map2RebuildObstacleBins();
    const xs=[420,-420,340,-340,0],ys=[-40,-65,-85,-55,-70];
    racers.forEach((r,i)=>{
      const angle=i*2*Math.PI/5;
      r.routeProgress=0;r.laneX=Math.cos(angle)*105;r.laneY=Math.sin(angle)*105;
      r.vx=0;r.vy=0;r.targetX=xs[i];r.targetY=ys[i];
      r.map2GateChoice=null;r.map2GapChoices={};
      positionRacerOnRoute(r);
    });
    let frames=0;
    for(;frames<14000&&state.running&&!racers.every(r=>r.finished||r.dnf);frames++)
      updateGame(1/30);
    const perf=map2PerformanceSnapshot();
    return {
      frames,gates:map2Gates.length,perf,
      rivals:racers.map(r=>({
        name:r.name,profile:r.profile,finished:r.finished,dnf:r.dnf,
        shield:r.shield,progress:r.routeProgress,energy:r.energy,
        finishTime:r.finishTime,stats:{...r.aiStats}
      }))
    };
  });
  console.log('MAP2-45 FLEET '+JSON.stringify(fleet));

  assert.equal(fleet.rivals.length,5);
  assert(fleet.rivals.every(r=>Number.isFinite(r.progress)&&
    Number.isFinite(r.energy)&&r.energy>=0&&r.energy<=100));
  assert(fleet.rivals.filter(r=>r.finished).length>=4,
    'at least four rivals must finish the full 175 km physical city race');
  assert(fleet.rivals.filter(r=>r.finished).every(r=>
    r.stats.map2GateExits===fleet.gates));
  assert(fleet.rivals.every(r=>(r.stats.map2BuildingLookAheadMax||0)>=630),
    'all rivals should plan copied-building routes beyond measured braking distance');
  assert(fleet.rivals.some(r=>(r.stats.map2MaxAbsTargetX||0)>320),
    'widened Map2 must produce real wide horizontal targets');
  assert(fleet.rivals.some(r=>(r.stats.map2WideLaneSeconds||0)>.15),
    'at least one rival must physically use the widened horizontal airspace');
  assert(fleet.rivals.some(r=>(r.stats.map2MultiPassageTargets||0)>0),
    'rivals must continue using validated alternate building passages');

  const p=fleet.perf.physicsBins;
  assert(p.queries>1000,'full race should exercise binned collision queries');
  assert(p.averageCandidates<base.obstacles*.28,
    'average narrow-phase candidate count must stay well below full obstacle scan');
  assert(p.maxCandidates<base.obstacles*.45,
    'even worst local bin query should avoid scanning most Map2 colliders');

  const dir=path.join(__dirname,'map2-45-evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'rivals-performance.json'),
    JSON.stringify({base,samples,fleet},null,2));
  await page.screenshot({path:path.join(dir,'map2-45-final.png'),
    timeout:120000,animations:'disabled'});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-45 rivals + performance');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
