/* MAP4-CITY02 — visual/physical acceptance for the ACTUAL city entrance.
 * WebGL Chromium; phase entry is moved near completion, but remaining flight
 * runs through the real game loop. Screenshot = actual rendered scene.
 */
'use strict';
const {chromium}=require('playwright'),fs=require('fs'),path=require('path');
const assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const dir=path.join(__dirname,'map4-city02-evidence');fs.mkdirSync(dir,{recursive:true});
const url=pathToFileURL(path.resolve(__dirname,'../index.html')).toString();
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:768},deviceScaleFactor:1});
  const jsErrors=[];page.on('pageerror',e=>jsErrors.push(e.message));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof map4EnterArena==='function'&&
   typeof h4City02DistrictGroup!=='undefined',null,{timeout:30000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&state.raceTime>.1,
   null,{timeout:30000});
  // Enter through the REAL route transition, rather than calling a fictional
  // arena-rendering function or snapping the camera onto a surface.
  await page.evaluate(()=>{state.routeProgress=MAP4_PHASES.introEnd-2;
   state.laneX=0;state.laneY=175;});
  await page.waitForFunction(()=>state.map4Phase===2&&state.map4ArenaStarted,
   null,{timeout:30000});
  await page.waitForTimeout(1350);
  const scene=await page.evaluate(()=>{
   const city=h4City02DistrictGroup;
   const mainCorridor=[12550,12800,13100,13400,13700,13950].every(progress=>{
    const point={routeProgress:progress,laneX:0,laneY:175};
    return !h4CityArenaColliders.some(c=>
       Math.abs(c.progress-progress)<c.halfDepth+15&&
       Math.abs(c.side)<c.halfSide+15&&
       Math.abs(c.altitude-175)<c.halfUp+15);
   });
   const nextPhasePollution=planetaryBuildingColliders.some(c=>
      h4CityArenaColliders.includes(c));
   const windows=city.children.find(c=>c.name==='H4_CITY02_INSTANCED_STREET_WINDOWS');
   const roadTiles=city.children.filter(c=>c.name.startsWith('H4_CITY02_DRIVABLE_MAIN_AVENUE'));
   const cameraInBuilding=h4CityArenaBuildings.some(m=>
      new THREE.Box3().setFromObject(m).containsPoint(camera.position));
   return {
    phase:state.map4Phase,seconds:state.map4ArenaElapsed,
    pilot:[state.routeProgress,state.laneX,state.laneY],
    speed:state.currentSpeed,
    camera:camera.position.toArray(),
    cityVisible:!!city&&city.visible&&planetaryWorldRegions[1].visible,
    physicalCity:h4CityArenaBuildings.length,colliders:h4CityArenaColliders.length,
    windows:windows?.count,roads:roadTiles.length,openMainStreet:mainCorridor,
    oldWarfrontHidden:h4ArenaWarfrontGroups.every(g=>!g.visible),
    oldGiantWreckHidden:!h4Next22kArenaWreckGroup.visible,
    oldGiantSkylineHidden:!h4Gfx11bArenaSkylineGroup.visible,
    oldRegionSkylineHidden:!h4SceneryGroups[1].near.visible&&
       !h4SceneryGroups[1].far.visible,
    noIndustrialColliderLeaks:!nextPhasePollution,
    cameraInBuilding
   };
  });
  assert.equal(scene.phase,2,'must actually be inside phase 2');
  assert(scene.seconds>0&&scene.seconds<60);
  assert.equal(scene.cityVisible,true,'real city district must be onscreen');
  assert.equal(scene.physicalCity,54);
  assert.equal(scene.colliders,54);
  assert.equal(scene.windows,486);
  assert.equal(scene.roads,10);
  assert.equal(scene.openMainStreet,true,'open flyable avenue required');
  assert.equal(scene.oldWarfrontHidden,true,'old warfront wall MUST NOT render');
  assert.equal(scene.oldGiantWreckHidden,true,'old wreck must not hover before pilot');
  assert.equal(scene.oldGiantSkylineHidden,true,'old giant skyline must not occlude city');
  assert.equal(scene.oldRegionSkylineHidden,true);
  assert.equal(scene.noIndustrialColliderLeaks,true);
  assert.equal(scene.cameraInBuilding,false);
  await page.screenshot({path:path.join(dir,'01-real-city-entrance.png')});
  const begin=await page.evaluate(()=>({
   pos:state.pos.toArray(),progress:state.routeProgress}));
  await page.keyboard.down('w');
  await page.waitForFunction(p=>state.routeProgress>p+75,begin.progress,
   {timeout:15000});
  await page.keyboard.up('w');
  await page.waitForTimeout(400);
  await page.screenshot({path:path.join(dir,'02-moving-through-urban-avenue.png')});
  const movement=await page.evaluate(()=>({
   progress:state.routeProgress,pos:state.pos.toArray(),
   inside:map4CityArenaDistance(state)<MAP4_CITY_ARENA.radius,
   phase:state.map4Phase}));
  assert(movement.progress>begin.progress+75,'W must move through the city');
  assert.equal(movement.inside,true);
  assert.equal(movement.phase,2,'flying must NOT skip 60s battle');
  await page.keyboard.down('s');
  await page.waitForFunction(p=>state.routeProgress<p-20,movement.progress,
   {timeout:12000});
  await page.keyboard.up('s');
  const reversed=await page.evaluate(()=>state.routeProgress);
  assert(reversed<movement.progress-20);
  assert.deepEqual(jsErrors,[]);
  const data={scene,begin,movement,reversed,errors:jsErrors};
  fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(data,null,2));
  console.log('PASS MAP4 CITY02 '+JSON.stringify(data));
  await page.close();
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
