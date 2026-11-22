/* MAP4-CITY01: real Map4 WebGL flight inside a three-axis sphere.
 * Arena entry and 60s completion are accelerated by controlled mission-state
 * setup; the actual forward/reverse movement runs through requestAnimationFrame.
 * No claim of a full 5-minute playthrough or native-GPU benchmark.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const evidence=path.join(__dirname,'map4-city01-evidence');
fs.mkdirSync(evidence,{recursive:true});
const url=pathToFileURL(path.resolve(__dirname,'../index.html')).toString();
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof MAP4_CITY_ARENA==='object'&&
   typeof map4ConstrainCityArena==='function'&&
   typeof map4EnterArena==='function',null,{timeout:30000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&state.raceTime>.15,
   null,{timeout:30000});
  const start=await page.evaluate(()=>{
   state.routeProgress=MAP4_PHASES.introEnd;
   state.laneX=0;state.laneY=150;
   state.map4ArenaStarted=false;state.map4ArenaElapsed=0;
   map4EnterArena();
   updatePlanetaryWorld();updateMap4MissionHUD(true);
   return {
    phase:state.map4Phase,arena:map4CityArenaActive(),
    radius:MAP4_CITY_ARENA.radius,
    buildings:h4CityArenaBuildings.length,
    colliders:h4CityArenaColliders.length,
    collidersWithMeshes:h4CityArenaBuildings.filter(m=>m.userData.h4Collider).length,
    geometry:hunterTargets.map(h=>({scale:h.mesh.scale.x,
      nominalScale:h.isElite?1.55:1.25,radius:h.radius,elite:h.isElite})),
    remaining:MAP4_PHASES.arenaSeconds-state.map4ArenaElapsed,
    mission:document.querySelector('#ui-map4-phase-directive').textContent,
    name:document.getElementById('planetary-zone-name').textContent
   };
  });
  assert.equal(start.arena,true);
  assert.equal(start.phase,2);
  assert.equal(start.remaining,60);
  assert.equal(start.buildings,54);
  assert.equal(start.colliders,54);
  assert.equal(start.collidersWithMeshes,54);
  assert(start.geometry.every(h=>Math.abs(h.scale/h.nominalScale-1.7)<1e-6));
  assert(start.geometry.every(h=>h.radius>=27.2));
  assert(start.mission.includes('W İLERİ / S GERİ'));
  assert.match(start.name,/ŞEHR/);
  await page.screenshot({path:path.join(evidence,'01-city-free-flight.png')});
  const before=await page.evaluate(()=>state.routeProgress);
  await page.keyboard.down('w');
  await page.waitForFunction(p=>state.routeProgress>p+20,before,{timeout:14000});
  await page.keyboard.up('w');
  const afterForward=await page.evaluate(()=>state.routeProgress);
  assert(afterForward>before+20,'W must actually move ship forward');
  await page.keyboard.down('s');
  await page.waitForFunction(p=>state.routeProgress<p-14,afterForward,{timeout:14000});
  await page.keyboard.up('s');
  const afterReverse=await page.evaluate(()=>state.routeProgress);
  assert(afterReverse<afterForward-14,'S must reverse longitudinal movement');
  const sphere=await page.evaluate(()=>{
   const mock={routeProgress:MAP4_CITY_ARENA.centerProgress,
    laneX:MAP4_CITY_ARENA.radius*2,laneY:MAP4_CITY_ARENA.centerY,
    currentSpeed:175,arenaDirection:1};
   const next=map4ConstrainCityArena(mock,MAP4_CITY_ARENA.centerProgress);
   const dist=map4CityArenaDistance(mock,next);
   return {clamped:dist<=MAP4_CITY_ARENA.radius-
      MAP4_CITY_ARENA.craftMargin+1e-4,
    dist,rad:MAP4_CITY_ARENA.radius,clampX:mock.laneX,
    currentPlayer:map4CityArenaDistance(state)};
  });
  assert(sphere.clamped,'sphere must constrain real 3d route space');
  assert(sphere.currentPlayer<sphere.rad,'player must remain inside sphere');
  const underground=await page.evaluate(()=>{
   const mock={routeProgress:MAP4_CITY_ARENA.centerProgress,
     laneX:0,laneY:-2500,currentSpeed:175,arenaDirection:1};
   const next=map4ConstrainCityArena(mock,MAP4_CITY_ARENA.centerProgress);
   return {altitude:mock.laneY,floor:MAP4_CITY_ARENA.minAltitude,
     sphereDistance:map4CityArenaDistance(mock,next),
     radius:MAP4_CITY_ARENA.radius};
  });
  assert(underground.altitude>=underground.floor,
   'arena must prevent underground city flight');
  assert(underground.sphereDistance<=underground.radius,
   'city floor may not push the craft outside the arena sphere');
  await page.screenshot({path:path.join(evidence,'02-city-after-movement.png')});
  // Test near/far lock policy without fake game kills. Retain render objects
  // after measuring; the actual lock finder must refuse all far targets.
  const range=await page.evaluate(()=>{
   const original=hunterTargets.map(h=>({h,p:h.mesh.position.clone()}));
   const base=state.pos.clone();
   for(const target of hunterTargets){
    target.mesh.position.copy(base).add(new THREE.Vector3(0,0,4000));
   }
   state.lockedTarget=null;
   findMagneticLockTarget();
   const refusesFar=state.lockedTarget===null;
   for(const o of original)o.h.mesh.position.copy(o.p);
   const h=hunterTargets.find(o=>o.alive);
   const newSphereRadius=h.radius;
   return {
    refusesFar,lockRange:MAP4_HUNTER_TARGETING.maxLockDistance,
    laserReach:MAP4_HUNTER_TARGETING.projectileRange,
    meshScale:MAP4_HUNTER_TARGETING.visualScale,
    laserTarget:h.id,newSphereRadius
   };
  });
  assert(range.refusesFar,'far hunter must not magnetic-lock');
  assert(range.lockRange<range.laserReach);
  assert(range.lockRange<=900);
  assert(range.laserReach<=1050);
  await page.evaluate(()=>{
   state.map4ArenaElapsed=MAP4_PHASES.arenaSeconds-.06;
  });
  await page.waitForFunction(()=>state.map4Phase===3 &&
   state.map4ArenaElapsed>=MAP4_PHASES.arenaSeconds,null,{timeout:14000});
  const exit=await page.evaluate(()=>{
   return {phase:state.map4Phase,seconds:state.map4ArenaElapsed,
    arena:map4CityArenaActive(),
    speedFactor:map4SpeedFactor(state.routeProgress),
    progress:state.routeProgress,visibleCity:h4Gfx11bArenaSkylineGroup.visible};
  });
  assert.equal(exit.phase,3);
  assert.equal(exit.arena,false);
  assert(exit.speedFactor>0,'forward movement must resume for industry');
  assert.deepEqual(errors,[]);
  const report={start,before,afterForward,afterReverse,sphere,range,exit,errors};
  fs.writeFileSync(path.join(evidence,'report.json'),JSON.stringify(report,null,2));
  console.log('PASS MAP4-CITY01 '+JSON.stringify(report));
  await page.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
