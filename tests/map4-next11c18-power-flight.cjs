/* NEXT11C18: actual game browser test for energy allocation and controls.
 * 4-phase rules/hard physical colliders remain untouched; Map1 is isolated.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
    {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4PowerTick==='function'&&
    typeof h4PowerChange==='function'&&typeof tryFirePlayerLasers==='function',
    null,{timeout:16000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.04,
    null,{timeout:20000});
  await page.evaluate(()=>{
    // Disable animation, not real input/physics functions.
    const raf=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    state.paused=false;
  });
  const initial=await page.evaluate(()=>{
    const cols=planetaryBuildingColliders.concat(h4IndustrialColliders);
    return {mode:state.h4Power.mode,
      profiles:Object.keys(H4_POWER_PROFILES),
      colliderCount:cols.length,canyon:h4CanyonColliders.length,
      markers:h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
        m.userData.w05Kind==='BEACON'||m.userData.w05Kind==='HIGH_MARKER')).length,
      originals:cols.map(c=>[
        c.progress,c.side,c.altitude,c.halfDepth,c.halfSide,c.halfUp
      ]),rivals:racers.length,hunters:hunterTargets.length,
      rules:[MAP4_PHASES.arenaSeconds,MAP4_RACE_RULES.realTimeLimit,
        MAP4_PHASES.orbitAltitude,H4_INDUSTRY.fastBonus,
        H4_CANYON.fastMultiplier]};});
  assert.equal(initial.mode,'BALANCED');
  assert.deepEqual(initial.profiles,['BALANCED','ENGINES','WEAPONS','SHIELDS']);
  assert.equal(initial.colliderCount,236);
  assert.equal(initial.canyon,6);
  assert.equal(initial.markers,24);
  assert.equal(initial.rivals,5);
  assert.equal(initial.hunters,8);
  assert.deepEqual(initial.rules,[60,300,850,1.12,1.18]);
  // A real KeyboardEvent must be able to swap allocations while flying.
  for(const [key,mode] of [['2','ENGINES'],['3','WEAPONS'],
    ['4','SHIELDS'],['1','BALANCED']]){
    await page.keyboard.press(key);
    assert.equal(await page.evaluate(()=>state.h4Power.mode),mode);
  }
  const engine=await page.evaluate(()=>{
    state.energy=20;state.h4Power.weapons=10;
    state.h4Power.shields=10;
    h4PowerChange('ENGINES');
    h4PowerTick(1,false,false,false);
    return {engine:state.energy,weapons:state.h4Power.weapons,
      shields:state.h4Power.shields};
  });
  assert.deepEqual(engine,{engine:38,weapons:13,shields:13});
  const weapons=await page.evaluate(()=>{
    h4PowerChange('WEAPONS');h4PowerTick(1,false,false,false);
    return {engine:state.energy,weapons:state.h4Power.weapons,
      shields:state.h4Power.shields};
  });
  assert.deepEqual(weapons,{engine:42,weapons:37,shields:16});
  const shots=await page.evaluate(()=>{
    state.running=true;state.finished=false;state.playerDNF=false;
    state.paused=false;state.h4Power.weapons=15;
    state.fireCooldown=0;
    const first=tryFirePlayerLasers();state.fireCooldown=0;
    const second=tryFirePlayerLasers();state.fireCooldown=0;
    const third=tryFirePlayerLasers();state.fireCooldown=0;
    const blocked=tryFirePlayerLasers();
    return {first,second,third,blocked,
      ammo:state.h4Power.weapons,denied:state.h4Power.shotsDenied};
  });
  assert.deepEqual(
    {first:shots.first,second:shots.second,third:shots.third,
      blocked:shots.blocked,ammo:shots.ammo},
    {first:true,second:true,third:true,blocked:false,ammo:0});
  assert(shots.denied>=1);
  const shield=await page.evaluate(()=>{
    state.shield=75;state.boundaryDamageRate=0;
    state.raceTime=70;state.h4Power.lastDamageAt=69;
    h4PowerChange('SHIELDS');h4PowerTick(1,false,false,false);
    const blocked=state.shield;
    state.h4Power.lastDamageAt=60;
    h4PowerTick(1,false,false,false);
    const healed=state.shield;
    applyPlayerDamage(5);
    const afterHit={shield:state.shield,lastDamageAt:state.h4Power.lastDamageAt};
    h4PowerTick(1,false,false,false);
    return {blocked,healed,afterHit,afterCooldownBlock:state.shield};
  });
  assert.equal(shield.blocked,75);
  assert(shield.healed>75&&shield.healed<=77);
  assert(shield.afterHit.shield<shield.healed);
  assert.equal(shield.afterCooldownBlock,shield.afterHit.shield);
  // Drift is a finite, paid post-boost maneuver and never immunity.
  const drift=await page.evaluate(()=>{
    h4PowerChange('ENGINES');
    state.energy=50;state.raceTime=84;
    state.h4Power.lastBoostAt=83.8;
    const first=h4PowerTryDrift();
    const second=h4PowerTryDrift();
    const stateAfter={first,second,energy:state.energy,
      timer:state.h4Power.driftTimer,count:state.h4Power.driftCount};
    h4PowerTick(.8,false,false,false);
    return {stateAfter,ended:state.h4Power.driftTimer};
  });
  assert.equal(drift.stateAfter.first,true);
  assert.equal(drift.stateAfter.second,false);
  assert.equal(drift.stateAfter.energy,42);
  assert(drift.stateAfter.timer>.7);
  assert.equal(drift.ended,0);
  // HUD and reset via actual game restart.
  const hud=await page.evaluate(()=>{
    h4PowerHud();
    return {panel:!document.getElementById('h4-power-panel')
      .classList.contains('hidden'),
      mode:document.getElementById('h4-power-mode').textContent,
      telemetry:window.starbladePowerTelemetry,
      engineLabel:document.getElementById('energy-caption').textContent};
  });
  assert(hud.panel);
  assert.equal(hud.mode,'MOTOR');
  assert.equal(hud.engineLabel,'MOTOR KAPASİTÖRÜ');
  assert(hud.telemetry.weapons>=0);
  const reset=await page.evaluate(()=>{
    startGame();
    return {mode:state.h4Power.mode,weapons:state.h4Power.weapons,
      shields:state.h4Power.shields,engine:state.energy,shield:state.shield};
  });
  assert.deepEqual(reset,{mode:'BALANCED',weapons:100,
    shields:100,engine:100,shield:100});
  const map1=await page.evaluate(()=>{
    state.running=false;
    selectMap(MAP_MODES.MAP1);
    startGame();
    h4PowerHud();
    const before=state.energy;
    keys.ShiftLeft=true;
    updateGame(1/30);
    keys.ShiftLeft=false;
    return {activeMap:state.activeMap,
      hidden:document.getElementById('h4-power-panel')
        .classList.contains('hidden'),
      marker:document.getElementById('energy-caption').textContent,
      statePower:state.h4Power.mode,
      laserAllowed:state.combatEnabled,
      delta:before-state.energy,
      physics:planetaryBuildingColliders.concat(h4IndustrialColliders)
        .map(c=>[c.progress,c.side,c.altitude,
          c.halfDepth,c.halfSide,c.halfUp])};
  });
  assert(map1.hidden,'Map1 cannot see Map4 energy HUD');
  assert.equal(map1.marker,'ENERGY (BOOST / LAZER)');
  assert.equal(map1.statePower,'BALANCED');
  assert.equal(map1.laserAllowed,false);
  assert(map1.delta>0,'Map1 boost must still cost original energy');
  assert.deepEqual(map1.physics,initial.original,
    'no geometry edits during flight/energy tests');
  assert.deepEqual(errors,[],errors.join('\n'));
  const result={status:'PASS',initial:{...initial,originals:undefined},
    engine,weapons,shots,shield,drift,hud,reset,
    map1:{...map1,physics:undefined},nativeGpuVerified:false,
    human300sFlight:false};
  fs.writeFileSync(path.join(__dirname,
    'map4-next11c18-power-flight-qa.json'),JSON.stringify(result,null,2));
  console.log('NEXT11C18 POWER AND FLIGHT PASS',JSON.stringify({
    modes:initial.profiles,engine,weapons,shots,shield,
    drift,map1:{hidden:map1.hidden,delta:map1.delta},
    geometryPreserved:true
  }));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
