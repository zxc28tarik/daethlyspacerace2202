/* Browser smoke tests for Map 1 and Map 4. Only repository code is tested. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {if (msg.type()==='error' && !/font|tailwind|network/i.test(msg.text())) errors.push(msg.text())});
  try {
    const three = fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**', route =>
      route.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',route=>
      route.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
      waitUntil:'domcontentloaded',timeout:25000
    });
    await page.waitForFunction(() => typeof selectMap === 'function' &&
      typeof state === 'object' && typeof THREE === 'object',null,{timeout:15000});
    assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'false');
    await page.locator('#map-choice-4').click();
    assert.equal(await page.locator('#start-btn').isEnabled(),true,'Map4 selectable');
    await page.locator('#start-btn').click();
    try {
      await page.waitForFunction(() => state.running && state.raceTime>0.06,null,{timeout:25000});
    } catch(err) {
      console.error('Game loop diagnostics',await page.evaluate(()=>({
        map:state.activeMap,running:state.running,paused:state.paused,
        time:state.raceTime,zones:planetaryWorldRegions.length,
        terrainVisible:planetaryWorldGroup.visible,
        scriptsError:typeof updateGame,
        webgl:renderer.getContext().getParameter(renderer.getContext().VERSION)
      })),errors);
      throw err;
    }
    assert.equal(await page.locator('#start-screen').isVisible(),false);
    const alive = await page.evaluate(() => hunterTargets.filter(h=>h.alive).length);
    assert.equal(alive,8,'8 live hunters after starting Map4');
    const runtime = await page.evaluate(() => ({
      running:state.running,mode:state.activeMap,
      rivals:racers.length,projectiles:hunterRivalShots.length,
      raceTime:state.raceTime
    }));
    assert.equal(runtime.mode,'map4');
    assert.equal(runtime.running,true);
    assert.equal(runtime.rivals,5);
    assert(runtime.raceTime>0,'time advances');
    const planetary=await page.evaluate(()=>({
      zones:planetaryWorldRegions.length,
      worldVisible:planetaryWorldGroup.visible,
      corridorVisible:corridorGuideGroup.visible,
      starsVisible:starField.visible,
      width:getCorridorRadiusAt(12000),
      strategyCount:new Set(racers.map(r=>r.hunterStrategy)).size,
      zoneName:document.getElementById('planetary-zone-name').textContent
    }));
    assert.equal(planetary.zones,4,'four distinct planetary zones');
    const openSpace=await page.evaluate(()=>{
      const probe=[0,12500,13500,22000,45000].map(progress=>({
        progress,radius:map4AirspaceRadius(progress),
        profile:map4BoundaryProfile(progress)
      }));
      const opening=map4BoundaryProfile(0);
      const warn=evaluateBoundaryFriction(opening.safeRadius+25,0,18,0,0);
      const caution=evaluateBoundaryFriction(opening.softRadius+75,0,18,0,0);
      const pressure=evaluateBoundaryFriction(opening.outsideRadius+40,0,18,0,0);
      const limiter={routeProgress:0,laneX:10000,laneY:0,vx:150,vy:0};
      clampToSoftBoundary(limiter);
      return {
        probe,warn,caution,pressure,limiter,
        scenery:h4WideScenery,
        worldSize:h4GroundStrip(PLANETARY_REGIONS[0]).geometry.attributes.position.array,
        cameraFar:camera.far,
        light:nebulaLight1.color.getHex(),
        firstPositions:racers.map(r=>Math.hypot(r.laneX,r.laneY))
      };
    });
    assert.equal(Math.round(openSpace.probe[0].radius),3700,
      'wide starting airspace');
    assert(openSpace.probe[2].radius>3900,
      'larger 60 second hunter arena');
    assert(openSpace.probe[3].radius>=3300,'industrial area stays broad');
    assert(openSpace.probe[4].radius>=3400,'orbital ascent stays broad');
    assert(openSpace.probe[0].profile.safeRadius>2900,
      'no-penalty opening radius over 2.9k');
    assert.equal(openSpace.warn.level,1,'first ring is warning only');
    assert.equal(openSpace.warn.factor,1,'warning never slows');
    assert.equal(openSpace.warn.damagePerSecond,0,'warning never damages');
    assert(openSpace.caution.level>=2&&openSpace.caution.factor<1,
      'outer zone applies gradual slowdown');
    assert.equal(openSpace.pressure.level,4,'true pressure at far boundary');
    assert(openSpace.pressure.damagePerSecond>0,'far boundary damages');
    assert(openSpace.limiter.laneX<4400&&openSpace.limiter.laneX>4200,
      'hard clamp only at distant outer edge');
    assert.deepEqual(openSpace.scenery.byRegion,[66,44,58,58],
      'layered scenery across four zones');
    assert.equal(openSpace.scenery.total,226,'bounded one-time scenery allocation');
    assert(openSpace.cameraFar>10000,'planet draw distance increased');
    assert(openSpace.firstPositions.every(x=>x>150),'six ships start in wider formation');
    assert.equal(openSpace.light,0xffdbb0,'planetary daylight active');
    const content=await page.evaluate(()=>{
      const initialProgress=state.routeProgress;
      const byRegion=h4WorldContentStats.byRegion.slice();
      const nameSet=new Set(h4WorldLandmarks.map(x=>x.name));
      const zoneProbe=[6000,13200,23800,42600].map((progress,i)=>{
        state.routeProgress=progress;
        updatePlanetaryWorld();
        const point=h4WorldLandmarks.find(x=>x.zone===i&&x.group.visible);
        return {regionVisible:planetaryWorldRegions[i].visible,
          landmarkVisible:!!point,
          label:document.getElementById('planetary-landmark-name').textContent};
      });
      state.routeProgress=initialProgress;
      updatePlanetaryWorld();
      return {byRegion,total:h4WorldContentStats.landmarks,
        meshes:h4WorldContentStats.decorMeshes,names:nameSet.size,
        zones:zoneProbe};
    });
    assert.equal(content.total,12,'12 named landmark groups');
    assert.deepEqual(content.byRegion,[3,3,3,3],'three landmarks in each zone');
    assert.equal(content.names,12,'every landmark has a distinct identity');
    assert(content.meshes>=55 && content.meshes<200,'bounded additional geometry');
    assert(content.zones.every(z=>z.regionVisible&&z.landmarkVisible),
      'visible landmarks throughout all four sectors');
    assert(content.zones.every(z=>z.label.includes('YAKIN NOKTA')),
      'nearby landmark names on HUD');
    assert.equal(planetary.worldVisible,true,'planet landscape visible');
    assert.equal(planetary.corridorVisible,false,'neon race tube hidden');
    assert.equal(planetary.starsVisible,false,'old stars hidden');
    assert(planetary.width>1000,'wider free-flight space');
    assert.equal(planetary.strategyCount,5,'five rival strategies');
    assert(planetary.zoneName.includes('VADİ'),'planet zone HUD');
    const scored=await page.evaluate(()=>{
      const normal=hunterTargets.find(h=>h.alive&&!h.isElite);
      const elite=hunterTargets.find(h=>h.alive&&h.isElite);
      normal.hp=12;elite.hp=12;
      damageHunterTarget(normal,12,'PLAYER');
      damageHunterTarget(elite,12,'PLAYER');
      return {kills:state.hunterKills,points:state.hunterScore};
    });
    assert.equal(scored.kills,2,'two real credited kills');
    assert.equal(scored.points,4,'normal 1 + elite 3 points');
    assert.equal(await page.locator('#laser-status').textContent().then(t=>t.includes('HAZIR')),true);
    await page.screenshot({path:path.resolve(__dirname,'map4-running.png')});
    // Phase 1 should normally take around forty seconds at nonboost speed.
    const nominal=await page.evaluate(()=>({
      intro:MAP4_PHASES.introEnd/(RACE_SPEEDS.NORMAL*MAP4_PHASES.introSpeed),
      arena:MAP4_PHASES.arenaSeconds,
      industry:(MAP4_PHASES.industryEnd-MAP4_PHASES.introEnd)/
        (RACE_SPEEDS.NORMAL*MAP4_PHASES.industrialSpeed),
      ascent:(RACE_ROUTE_NOMINAL_DISTANCE-MAP4_PHASES.industryEnd)/
        (RACE_SPEEDS.NORMAL*MAP4_PHASES.ascentSpeed)
    }));
    assert(nominal.intro>34 && nominal.intro<48,'intro near 40s');
    assert.equal(nominal.arena,60,'arena is fixed 60 seconds');
    assert(nominal.intro+nominal.arena+nominal.industry+nominal.ascent>240 &&
      nominal.intro+nominal.arena+nominal.industry+nominal.ascent<300,
      'normal map duration 4–5 minutes');
    // Enter zone two, check every pilot is held in the battle area.
    await page.evaluate(()=>{state.routeProgress=MAP4_PHASES.introEnd-2;});
    await page.waitForFunction(()=>state.map4Phase===2,null,{timeout:14000});
    const anchor=await page.evaluate(()=>state.routeProgress);
    await page.waitForTimeout(300);
    assert(Math.abs((await page.evaluate(()=>state.routeProgress))-anchor)<0.01,
      'no forward progress during arena');
    assert.equal(await page.evaluate(()=>racers.every(r=>r.routeProgress===MAP4_PHASES.introEnd
      || r.finished || r.dnf)),true,'five AI pilots held in arena');
    await page.screenshot({path:path.resolve(__dirname,'map4-arena.png')});
    await page.evaluate(()=>{state.map4ArenaElapsed=MAP4_PHASES.arenaSeconds-0.08;});
    await page.waitForFunction(()=>state.map4Phase===3,null,{timeout:12000});
    assert(await page.evaluate(()=>map4SpeedFactor(20000)>0),'forward progress unlocked in phase 3');
    const building=await page.evaluate(()=> {
      const collider=planetaryBuildingColliders[0];
      state.routeProgress=collider.progress;
      state.map4Phase=3;
      state.laneX=collider.side;
      state.laneY=collider.altitude;
      state.shield=100;
      state.map4ImpactCooldown=0;
      updatePlanetaryBuildingContacts({routeProgress:collider.progress-10,laneX:collider.side,
        laneY:collider.altitude},racers.map(r=>({routeProgress:r.routeProgress,
        laneX:r.laneX,laneY:r.laneY})));
      return {shield:state.shield,colliders:planetaryBuildingColliders.length};
    });
    assert(building.colliders>0,'industrial buildings have collision volumes');
    assert(building.shield<100,'industrial collision damages player shield');
    // Phase four: crossing the finish plane low is not enough; must rise into orbit.
    await page.evaluate(()=>{
      state.shield=100;
      state.routeProgress=RACE_ROUTE_NOMINAL_DISTANCE-5;
      state.laneX=0;state.laneY=0;
      state.map4Phase=4;state.map4ImpactCooldown=0;
    });
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>state.finished),false,'low flight cannot finish');
    await page.evaluate(()=>{
      state.routeProgress=RACE_ROUTE_NOMINAL_DISTANCE-2;
      state.laneY=MAP4_PHASES.orbitAltitude+100;
    });
    await page.waitForFunction(()=>state.finished,null,{timeout:14000});
    assert(await page.evaluate(()=>state.finishTime<MAP4_RACE_RULES.realTimeLimit),
      'orbital ascent crossing qualifies on time');
    // End mission and restart; test deadline DNF separately.
    await page.evaluate(()=>endGame(true));
    assert.equal(await page.evaluate(()=>
      window.starbladeHunterFinal.standings.find(x=>x.id==='PLAYER').validFinish),true,
      'on-time orbital ascender appears as qualified');
    await page.locator('#restart-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>0.05,null,{timeout:15000});
    // The 300-second real deadline disqualifies runners regardless of points.
    await page.evaluate(() => {state.raceTime=299.96;state.paused=false;});
    try {
      await page.waitForFunction(() => !state.running,null,{timeout:12000});
    } catch (error) {
      console.error('Deadline diagnostic', await page.evaluate(() => ({
        running:state.running,paused:state.paused,realClock:state.raceTime,
        finished:state.finished,playerDNF:state.playerDNF,map:state.activeMap,
        gameOverHidden:document.getElementById('gameover-screen').classList.contains('hidden')
      })), errors);
      throw error;
    }
    assert.equal(await page.locator('#gameover-screen').isVisible(),true,
      'deadline must show results; browser errors: '+errors.join(' | '));
    const result=await page.evaluate(() => window.starbladeHunterFinal);
    assert.equal(result.realTimeLimit,300);
    assert.equal(result.standings.length,6);
    assert(result.standings.every(e=>!e.validFinish),'no invented finish');
    assert.equal(await page.locator('#race-standings-list > div').count(),6);
    await page.screenshot({path:path.resolve(__dirname,'map4-results.png')});
    // Restart same map clears old targets, timers and stats.
    await page.locator('#restart-btn').click();
    await page.waitForTimeout(220);
    assert.equal(await page.locator('#gameover-screen').isVisible(),false);
    const restart=await page.evaluate(()=>({
      mode:state.activeMap,hunters:hunterTargets.length,
      gameTime:state.raceTime,playerKills:state.hunterKills
    }));
    assert.equal(restart.mode,'map4');
    assert.equal(restart.hunters,8);
    assert.equal(await page.evaluate(()=>h4WorldLandmarks.length),12,
      'restart reuses one-time world compositions');
    assert.equal(await page.evaluate(()=>h4WideScenery.total),226,
      'restart does not duplicate terrain and skyline');
    assert(restart.gameTime<4,'timer reset');
    assert.equal(restart.playerKills,0);
    assert.equal(await page.evaluate(()=>state.map4Phase),1,'four phase reset');
    assert.equal(await page.evaluate(()=>state.map4ArenaStarted),false,'arena reset');
    assert.equal(await page.evaluate(()=>state.hunterScore),0,'score reset');
    // Force an end for menu navigation, verify Map1 regressions.
    await page.evaluate(() => endGame(false));
    await page.locator('#menu-btn').click();
    assert.equal(await page.locator('#start-screen').isVisible(),true);
    await page.locator('#map-choice-1').click();
    assert.equal(await page.locator('#map4-instructions').isVisible(),false);
    await page.locator('#start-btn').click();
    await page.waitForTimeout(250);
    const map1=await page.evaluate(()=>({
      map:state.activeMap,hunters:hunterTargets.length,
      racers:racers.length,combat:state.combatEnabled,
      terrainVisible:planetaryWorldGroup.visible,
      corridorVisible:corridorGuideGroup.visible,
      flightRadius:getCorridorRadiusAt(8000),
      cameraFar:camera.far,
      light:nebulaLight1.color.getHex(),
      header:document.getElementById('race-standings-head').textContent
    }));
    assert.equal(map1.map,'map1');
    assert.equal(map1.hunters,0);
    assert.equal(map1.terrainVisible,false,'planetary terrain hidden in Map1');
    assert.equal(await page.locator('#planetary-zone-hud').isVisible(),false,
      'landmark HUD hidden in Map1');
    assert.equal(map1.corridorVisible,true,'Map1 corridor restored');
    assert(map1.flightRadius<500,'Map1 narrow flight restored');
    assert.equal(map1.cameraFar,4500,'Map1 draw distance restored');
    assert.equal(map1.light,0xff55aa,'Map1 lighting restored');
    const map1Boundary=await page.evaluate(()=>evaluateBoundaryFriction(0,0,18,0,0));
    assert.equal(map1Boundary.level,0,'Map1 boundary behavior unchanged');
    assert.equal(map1.racers,5);
    assert.equal(map1.combat,false);
    assert(map1.header.includes('TIME / GAP'),'Map1 header restored');
    await page.evaluate(()=>endGame(false));
    assert.equal(await page.locator('#gameover-screen').isVisible(),true);
    assert(!((await page.locator('#gameover-title').textContent()).includes('HARİTA 4')));
    assert.equal(errors.length,0,'browser JavaScript errors: '+errors.join(' | '));
    console.log('PASS: Map4 W02 large airspace, four-stage soft edges, panoramic scenery, no Map1 regression');
  } finally {
    if (errors.length) console.error('Browser errors:',errors.join('\n'));
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
