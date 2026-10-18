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
    // Map4 visual-quality proof: actual shader sky, physically lit procedural
    // textures, enhanced aircraft, facade meshes, 36 cloud volumes and draw range.
    const art=await page.evaluate(()=>{
      const materials=H4_MATERIALS;
      const detailedBuildings=planetaryWorldRegions[2].children.reduce((total,child)=>{
        let n=0;child.traverse(mesh=>{if(mesh.userData.h4Detailed)n++});
        return total+n;
      },0);
      return {
        textures:h4VisualQuality.textures,
        active:h4SkyDome.visible,
        skyShader:h4SkyDome.material.type,
        sun:h4SunHalo.visible,
        aircraft:racers.filter(r=>r.mesh.userData.h4DetailedCraft).length,
        cloudCount:h4Clouds.length,
        cloudsZones:h4CloudGroups.length,
        nearDetail:detailedBuildings,
        rockVertices:H4_MESHES.rock.attributes.position.count,
        rockType:H4_MESHES.rock.type,
        rockMap:!!materials.rock.map,
        steelMap:!!materials.steel.map,
        groundUV:!!planetaryWorldRegions[0].children[0].geometry.attributes.uv,
        groundMap:!!planetaryWorldRegions[0].children[0].material.map,
        playerEnhancements:h4GeoSwordArt.visible,
        tonemapMatches:renderer.toneMapping===THREE.ACESFilmicToneMapping,
        exposure:renderer.toneMappingExposure
      };
    });
    assert(art.textures>=7,'seven textures actually generated at runtime');
    assert.equal(art.active,true,'planet shader sky is visible');
    assert.equal(art.skyShader,'ShaderMaterial','custom gradient shader rendered');
    assert.equal(art.sun,true,'sun-halo sprite visible');
    assert.equal(art.aircraft,5,'all five rivals have enhanced 3D crafts');
    assert.equal(art.cloudCount,36,'36 layered atmospheric cloud forms');
    assert.equal(art.cloudsZones,4,'clouds span all regions');
    assert(art.nearDetail>=10,'industrial architectural panels built');
    assert(art.rockVertices>50,'rugged rock silhouettes use layered geometry');
    assert.equal(art.rockMap,true,'rock procedural textures');
    assert.equal(art.steelMap,true,'metal procedural textures');
    assert.equal(art.groundUV,true,'ground UV atlas tiling');
    assert.equal(art.groundMap,true,'ground uses texture');
    assert.equal(art.playerEnhancements,true,'map4 player craft art enabled');
    assert.equal(art.tonemapMatches,true,'planet-specific filmic tonemapping');
    assert(art.exposure>1.1,'planet uses dedicated tonal exposure');
    // W03 physical and strategic paths before phase-two arena.
    const canyon=await page.evaluate(()=>{
      const fast={laneX:H4_CANYON.fastCenter};
      const hunt={laneX:H4_CANYON.huntCenter};
      const main={laneX:0};
      const p=3700,dt=0.1,speed=2200;
      const firstRock=h4CanyonColliders[0];
      const segmentStart={routeProgress:firstRock.progress-450,
        laneX:firstRock.side,laneY:firstRock.altitude};
      const segmentEnd={routeProgress:firstRock.progress+450,
        laneX:firstRock.side,laneY:firstRock.altitude};
      const safeStart={...segmentStart,laneX:0,laneY:0};
      const safeEnd={...segmentEnd,laneX:0,laneY:0};
      const initial={progress:state.routeProgress,x:state.laneX,y:state.laneY};
      // The *same* visible rock volume must damage the player's shield.
      state.routeProgress=firstRock.progress+60;
      state.laneX=firstRock.side;state.laneY=firstRock.altitude;
      state.shield=100;state.powerShieldTimer=0;state.barrelRollTimer=0;
      state.h4CanyonCooldown=0;state.map4Phase=1;
      h4UpdateCanyonContacts(segmentStart,racers.map(r=>({
        routeProgress:r.routeProgress,laneX:r.laneX,laneY:r.laneY
      })));
      const afterImpact={shield:state.shield,speed:state.currentSpeed};
      state.routeProgress=initial.progress;state.laneX=initial.x;
      state.laneY=initial.y;state.shield=100;state.h4CanyonCooldown=0;
      return {
        routeFast:h4CanyonRoute(p,fast.laneX),
        routeHunt:h4CanyonRoute(p,hunt.laneX),
        routeMain:h4CanyonRoute(p,main.laneX),
        advanceFast:map4Advance(p,speed,dt,fast)-p,
        advanceMain:map4Advance(p,speed,dt,main)-p,
        advanceHunt:map4Advance(p,speed,dt,hunt)-p,
        rockCount:h4CanyonColliders.length,
        visualGroups:h4CanyonVisualGroups.length,
        visibleRockLink:firstRock.mesh.userData.h4CanyonCollider===firstRock,
        hit:h4SegmentBoxHit(segmentStart,segmentEnd,firstRock),
        missesCenter:!h4SegmentBoxHit(safeStart,safeEnd,firstRock),
        afterImpact,
        earlyHuntersEast:hunterTargets.filter(h=>h.baseLaneX>850).length,
        routeHud:document.getElementById('planetary-route-name')!==null
      };
    });
    assert.equal(canyon.routeFast,'FAST');
    assert.equal(canyon.routeHunt,'HUNT');
    assert.equal(canyon.routeMain,'MAIN');
    assert(canyon.advanceFast>canyon.advanceMain*1.17 &&
      canyon.advanceFast<canyon.advanceMain*1.19,'real 18% gorge speed gain');
    assert.equal(canyon.advanceHunt,canyon.advanceMain,
      'hunter flank does not receive unearned speed gain');
    assert.equal(canyon.rockCount,6,'three real two-pillar rock gates');
    assert.equal(canyon.visualGroups,1,'single persistent W03 canyon zone');
    assert.equal(canyon.visibleRockLink,true,'collision tied to visible rock');
    assert.equal(canyon.hit,true,'swept rock collision catches high speed');
    assert.equal(canyon.missesCenter,true,'safe central lane is clear');
    assert(canyon.afterImpact.shield<100,'canyon rock collision damages shield');
    assert(canyon.earlyHuntersEast>=4,'optional east route has more hunter encounters');
    assert.equal(canyon.routeHud,true,'flight lane HUD created');
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
        terrain:{
          positions:planetaryWorldRegions[0].children[0].geometry.attributes.position.count,
          colors:!!planetaryWorldRegions[0].children[0].geometry.attributes.color,
          sceneryOnly:planetaryWorldRegions[0].children[0].userData.h4TerrainSceneryOnly
        },
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
    assert(openSpace.terrain.positions>7000,'planet ground subdivided for relief');
    assert.equal(openSpace.terrain.colors,true,'planet ground has vertex palette');
    assert.equal(openSpace.terrain.sceneryOnly,true,'no invented terrain hitboxes');
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
    // W04: all three distinct combat pockets exist and spawn the shared 8
    // hunters in 3/3/2 formation. Both elites stay in the defense wing.
    const warfront=await page.evaluate(()=>{
      const ids=hunterTargets.map(h=>h.arenaPocketId);
      const perPocket=H4_ARENA_POCKETS.map(p=>({
        id:p.id,slots:p.slots.length,
        hunters:hunterTargets.filter(h=>h.arenaPocketId===p.id).length,
        elite:hunterTargets.filter(h=>h.arenaPocketId===p.id&&h.isElite).length
      }));
      const before=hunterTargets.map(h=>({
        id:h.id,x:h.laneX,y:h.laneY,z:h.routeProgress
      }));
      updateHunterTargets(0.3);
      const moved=hunterTargets.some((h,i)=>
        Math.abs(h.laneX-before[i].x)>0.1||
        Math.abs(h.laneY-before[i].y)>0.1||
        Math.abs(h.routeProgress-before[i].z)>0.1);
      const center=hunterTargets.find(h=>h.arenaPocketId==='CENTER'&&!h.isElite);
      const wreck=hunterTargets.find(h=>h.arenaPocketId==='WRECK'&&!h.isElite);
      const defense=hunterTargets.find(h=>h.arenaPocketId==='DEFENSE'&&h.isElite);
      const beforePlayer={points:state.hunterScore,kills:state.hunterKills};
      // Real background AI may have destroyed one of these targets in the
      // milliseconds between arena entry and test. Reuse the SAME target
      // slot before deterministic hit-attribution assertions (no new meshes).
      for(const target of [center,wreck,defense]){
        if(!target.alive)spawnHunterTarget(target,hunterTargets.indexOf(target));
        target.hp=12;
      }
      const centerHit=damageHunterTarget(center,12,'PLAYER');
      const wreckOwner=racers[1];
      const rivalBefore={points:wreckOwner.hunterScore,kills:wreckOwner.hunterKills};
      const wreckHit=damageHunterTarget(wreck,12,wreckOwner.name);
      const defenseHit=damageHunterTarget(defense,12,'PLAYER');
      updateHunterCompetitionHUD();
      const info=window.starbladeHunterTelemetry?.arena;
      return {
        groups:h4ArenaWarfrontGroups.length,
        meshCount:h4ArenaWarfrontStats.geometryCount,
        byPocket:h4ArenaWarfrontStats.byPocket.slice(),
        names:h4ArenaWarfrontGroups.map(g=>g.name),
        perPocket,moved,ids,
        hitSuccess:[centerHit.destroyed,wreckHit.destroyed,defenseHit.destroyed],
        playerScoreGain:state.hunterScore-beforePlayer.points,
        playerKillGain:state.hunterKills-beforePlayer.kills,
        playerPocketKills:{...state.hunterPocketKills},
        rivalScoreGain:wreckOwner.hunterScore-rivalBefore.points,
        rivalKillGain:wreckOwner.hunterKills-rivalBefore.kills,
        rivalPocketKills:{...wreckOwner.hunterPocketKills},
        telemetry:info,
        hunterCount:hunterTargets.length,
        hudText:document.getElementById('planetary-route-name').textContent
      };
    });
    assert.equal(warfront.groups,3,'three independent visible warfront groups');
    assert(warfront.meshCount>=28&&warfront.meshCount<80,'bounded set-piece geometry');
    assert(warfront.byPocket.every(n=>n>=8),'each pocket has unique scenery');
    assert.deepEqual(warfront.perPocket.map(p=>p.hunters),[3,3,2],
      'three center, three wreck, two defense hunters');
    assert.deepEqual(warfront.perPocket.map(p=>p.elite),[0,0,2],
      'elite fighters are in the defense wing');
    assert.equal(warfront.moved,true,'hunters fly real arena patrol routes');
    assert(warfront.hitSuccess.every(Boolean),'only actual fatal hits get kill credit');
    assert.equal(warfront.playerScoreGain,4,'center +1 and defense +3');
    assert.equal(warfront.playerKillGain,2,'only two player kills');
    assert.equal(warfront.playerPocketKills.CENTER,1);
    assert.equal(warfront.playerPocketKills.DEFENSE,1);
    assert.equal(warfront.rivalScoreGain,1,'rival gets equal normal kill points');
    assert.equal(warfront.rivalKillGain,1);
    assert.equal(warfront.rivalPocketKills.WRECK,1);
    assert.equal(warfront.hunterCount,8,'no extra invisible targets created');
    assert.deepEqual(warfront.telemetry.counts.map(p=>p.id),
      ['CENTER','WRECK','DEFENSE'],'arena telemetry exposes pockets');
    assert(warfront.telemetry.timeRemaining>0&&warfront.telemetry.timeRemaining<=60,
      'arena is still under exact 60 second budget');
    assert(warfront.hudText.includes('SAVAŞ CEPHESİ')||
        warfront.hudText.includes('GÜVENLİ ANA HAT'),
      'pocket HUD remains readable');
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
    // W05: six industrial complexes, explicit visible colliders and three
    // practical route choices. Test a 500m/frame pipe impact and two ways past.
    const industrial=await page.evaluate(()=>{
      const all=h4IndustrialColliders;
      const beam=all.find(c=>c.kind==='OVERHEAD_PIPE');
      const bridge=all.find(c=>c.kind==='TRANSFER_BRIDGE');
      const front={routeProgress:beam.progress-350,laneX:beam.side,laneY:beam.altitude};
      const back={routeProgress:beam.progress+350,laneX:beam.side,laneY:beam.altitude};
      const low={...front,laneY:H4_INDUSTRY.lowY};
      const lowAfter={...back,laneY:H4_INDUSTRY.lowY};
      const high={...front,laneY:H4_INDUSTRY.upperY};
      const highAfter={...back,laneY:H4_INDUSTRY.upperY};
      const speed=1800,dt=0.1,position=21000;
      const fast={laneX:H4_INDUSTRY.fastCenter,laneY:H4_INDUSTRY.lowY};
      const safe={laneX:0,laneY:H4_INDUSTRY.upperY};
      const hunt={laneX:H4_INDUSTRY.huntCenter,laneY:310};
      const preferred=['SPRINTER','HUNTER','BALANCED','ELITE','CAUTIOUS']
        .map(style=>({style,...h4IndustrialPreferredRoute(style)}));
      const avoidance=h4IndustrialAvoidance({
        routeProgress:bridge.progress-240},0,bridge.altitude);
      // Verify new solid bridges hurt actual ships and carry no invisible shell.
      state.routeProgress=beam.progress+40;
      state.laneX=beam.side;state.laneY=beam.altitude;
      state.shield=100;state.powerShieldTimer=0;state.barrelRollTimer=0;
      state.map4ImpactCooldown=0;state.map4Phase=3;
      updatePlanetaryBuildingContacts(front,racers.map(r=>({
        routeProgress:r.routeProgress,laneX:r.laneX,laneY:r.laneY
      })));
      const shieldAfterBeam=state.shield;
      return {
        stations:h4IndustrialStats.stations,
        meshes:h4IndustrialStats.meshes,
        colliders:h4IndustrialStats.physical,
        zones:h4IndustrialGroups.length,
        kinds:[...new Set(all.map(c=>c.kind))],
        link:beam.mesh.userData.h4Collider===beam,
        swept:h4SegmentBoxHit(front,back,beam,12),
        underClear:!h4SegmentBoxHit(low,lowAfter,beam,12),
        aboveClear:!h4SegmentBoxHit(high,highAfter,beam,12),
        speedFast:map4Advance(position,speed,dt,fast)-position,
        speedSafe:map4Advance(position,speed,dt,safe)-position,
        speedHunt:map4Advance(position,speed,dt,hunt)-position,
        routeLabels:[h4IndustrialRoute(position,fast.laneX,fast.laneY),
          h4IndustrialRoute(position,safe.laneX,safe.laneY),
          h4IndustrialRoute(position,hunt.laneX,hunt.laneY)],
        preferred,avoidance,shieldAfterBeam,
        room:H4_INDUSTRY.to-H4_INDUSTRY.from
      };
    });
    assert.equal(industrial.stations,6,'six complete industrial compounds');
    assert.equal(industrial.zones,6,'six persistent industrial groups');
    assert(industrial.meshes>=90&&industrial.meshes<150,'bounded industry mesh allocation');
    assert.equal(industrial.colliders,36,'physical solids authored with real geometry');
    assert(industrial.kinds.includes('OVERHEAD_PIPE')&&
      industrial.kinds.includes('TRANSFER_BRIDGE')&&
      industrial.kinds.includes('HUNTER_SIDE_TOWER'),
      'pipes, bridges and east towers genuinely collide');
    assert.equal(industrial.link,true,'collision registered on visible pipe mesh');
    assert.equal(industrial.swept,true,'high-speed swept collision cannot tunnel');
    assert.equal(industrial.underClear,true,'low fast route passes under overhead pipe');
    assert.equal(industrial.aboveClear,true,'high route passes above pipe');
    assert.deepEqual(industrial.routeLabels,['FAST_LOW','SAFE_UPPER','HUNTER_FLANK']);
    assert(industrial.speedFast>industrial.speedSafe*1.11 &&
      industrial.speedFast<industrial.speedSafe*1.13,
      'low route earns 12% actual progress, not cosmetic speed');
    assert.equal(industrial.speedSafe,industrial.speedHunt,
      'safe and combat flank both have normal base speed');
    assert.equal(industrial.preferred.length,5);
    assert(industrial.preferred[0].x<0,'sprinter chooses low pipeline');
    assert(industrial.preferred[1].x>0,'hunter chooses eastern factories');
    assert(industrial.preferred[4].y>800,'cautious pilot flies high');
    assert.equal(industrial.avoidance.avoiding,true,
      'AI proactively diverts around a visible transfer bridge');
    assert.notEqual(industrial.avoidance.y,290,
      'AI never plans directly through a bridge');
    assert(industrial.shieldAfterBeam<100,
      'visible pipe hurts player on real high-speed contact');
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
    assert.equal(await page.evaluate(()=>h4CanyonColliders.length),6,
      'restart reuses the same real canyon rock volumes');
    assert.equal(await page.evaluate(()=>h4ArenaWarfrontGroups.length),3,
      'restart never duplicates warfront scenery');
    assert.equal(await page.evaluate(()=>h4IndustrialGroups.length),6,
      'restart never duplicates industrial buildings');
    assert.deepEqual(await page.evaluate(()=>state.hunterPocketKills),
      {CENTER:0,WRECK:0,DEFENSE:0},'restart clears arena pocket kill counters');
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
    const map1Art=await page.evaluate(()=>({
      sky:h4SkyDome.visible,sun:h4SunHalo.visible,
      player:h4GeoSwordArt.visible,
      tonemapRestored:renderer.toneMapping===THREE.NoToneMapping,
      encodingRestored:renderer.outputEncoding===THREE.LinearEncoding,
      cloudParent:planetaryWorldGroup.visible
    }));
    assert.equal(map1Art.sky,false,'Map1 cannot see planet shader');
    assert.equal(map1Art.sun,false,'Map1 cannot see sun halo');
    assert.equal(map1Art.player,false,'Map1 GeoSword unchanged');
    assert.equal(map1Art.cloudParent,false,'planetary clouds hidden in Map1');
    assert.equal(map1Art.tonemapRestored,true,'Map1 tonemapping restored');
    assert.equal(map1Art.encodingRestored,true,'Map1 output encoding restored');
    const map1Boundary=await page.evaluate(()=>evaluateBoundaryFriction(0,0,18,0,0));
    assert.equal(map1Boundary.level,0,'Map1 boundary behavior unchanged');
    assert.equal(map1.racers,5);
    assert.equal(map1.combat,false);
    assert(map1.header.includes('TIME / GAP'),'Map1 header restored');
    await page.evaluate(()=>endGame(false));
    assert.equal(await page.locator('#gameover-screen').isVisible(),true);
    assert(!((await page.locator('#gameover-title').textContent()).includes('HARİTA 4')));
    assert.equal(errors.length,0,'browser JavaScript errors: '+errors.join(' | '));
    console.log('PASS: Map4 ART textured terrain, rugged rocks, real sky, 36 clouds, enhanced spacecraft, industrial facades and Map1 isolation');
  } finally {
    if (errors.length) console.error('Browser errors:',errors.join('\n'));
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
