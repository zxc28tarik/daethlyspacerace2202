/* NEXT-11C16: observe real Map4 player updateGame/input/physics only.
 * No game code patch, factory move, AI/bonus modifications or PR merge.
 * Scripted game ticks are NOT a human playtest or a full 300s flight.
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
      typeof updateGame==='function'&&
      typeof map4Advance==='function'&&
      typeof h4SegmentBoxHit==='function',
      null,{timeout:20000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>
      state.running&&state.raceTime>0.05,
      null,{timeout:22000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });
    const output=await page.evaluate(()=>{
      const dt=1/30; // fixed scripted key frames, not real-time wall-clock
      const from=22000,to=25200;
      const colliders=planetaryBuildingColliders.concat(h4IndustrialColliders);
      const identifiers=new Map();
      planetaryWorldGroup.traverse(mesh=>{
        if(mesh.isMesh&&mesh.userData.h4Collider)
          identifiers.set(mesh.userData.h4Collider,mesh.name||'UNNAMED');
      });
      const protectedSnapshot=()=>({
        colliders:colliders.map(c=>[
          c.progress,c.side,c.altitude,c.halfDepth,c.halfSide,c.halfUp,
          c.kind||''
        ]),
        markers:h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
          m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER')).map(m=>[
            m.id,m.geometry.uuid,m.material.uuid,...m.matrix.toArray()
        ]),
        w02:h4Gfx11c3PhysicalMaterials.map(e=>[
          e.mesh.id,e.mesh.geometry.uuid,
          e.collider.progress,e.collider.side,e.collider.altitude,
          e.collider.halfSide,e.collider.halfUp,e.collider.halfDepth
        ]),
        rules:[
          MAP4_PHASES.arenaSeconds,MAP4_PHASES.industryEnd,
          MAP4_PHASES.orbitAltitude,MAP4_RACE_RULES.realTimeLimit,
          H4_INDUSTRY.fastBonus,racers.length,hunterTargets.length,
          h4CanyonColliders.length
        ]
      });
      const before=protectedSnapshot();
      const configs=[
        {id:'FIXED_FAST_LOW',controlStart:null},
        {id:'EARLY_HUNTER_KEYS',controlStart:22200},
        {id:'LATE_HUNTER_KEYS',controlStart:23500}
      ];
      const hitsBetween=(a,b)=>{
        const lower=Math.min(a.routeProgress,b.routeProgress)-25;
        const upper=Math.max(a.routeProgress,b.routeProgress)+25;
        const hits=[];
        for(let i=0;i<colliders.length;i++){
          const c=colliders[i];
          if(c.progress+c.halfDepth<lower||
            c.progress-c.halfDepth>upper)continue;
          if(h4SegmentBoxHit(a,b,c,12))hits.push(i);
        }
        return hits;
      };
      const all=[];
      for(const config of configs){
        // Test starts independently at the same industrial scene pose.
        // It calls the ORIGINAL updateGame(dt) player control physics.
        Object.keys(keys).forEach(k=>keys[k]=false);
        state.running=true;state.paused=true;
        state.activeMap=MAP_MODES.MAP4;
        state.map4ArenaStarted=true;
        state.map4ArenaElapsed=MAP4_PHASES.arenaSeconds;
        state.map4Phase=3;
        state.routeProgress=from;
        state.laneX=-800;state.laneY=-100;
        state.raceTime=125;
        state.currentSpeed=RACE_SPEEDS.NORMAL;
        state.baseSpeed=RACE_SPEEDS.NORMAL;
        state.energy=100;state.shield=100;
        state.finished=false;state.playerDNF=false;state.dnf=false;
        state.map4ImpactCooldown=0;
        state.itemTurboTimer=0;state.powerShieldTimer=0;
        state.isFiring=false;state.roll=0;
        state.mouseX=W/2;state.mouseY=H/2;
        const frame=getRaceFrameAtDistance(from);
        state.pos.copy(frame.center)
          .addScaledVector(frame.right,state.laneX)
          .addScaledVector(frame.up,state.laneY);
        playerRig.position.copy(state.pos);
        const startTime=state.raceTime;
        const frames=[];
        const geometryEncountered=new Map();
        const impactEvents=[];
        const boundaryLevels={};
        let firstTargetProgress=null;
        let firstClearOfFastProgress=null;
        let advancedTicks=0;
        while(state.routeProgress<to&&!state.playerDNF&&
          !state.finished&&advancedTicks<1100){
          const prev={
            routeProgress:state.routeProgress,laneX:state.laneX,
            laneY:state.laneY
          };
          const enable=config.controlStart!==null&&
            state.routeProgress>=config.controlStart;
          keys['KeyD']=enable&&state.laneX<900;
          keys['ArrowUp']=enable&&state.laneY<310;
          keys['ShiftLeft']=false;keys['KeyW']=false;
          keys['KeyS']=false;keys['KeyF']=false;
          const prevCooldown=state.map4ImpactCooldown||0;
          const prevShield=state.shield;
          const inputD=!!keys['KeyD'];
          const inputUp=!!keys['ArrowUp'];
          updateGame(dt);
          advancedTicks++;
          const now={
            routeProgress:state.routeProgress,laneX:state.laneX,
            laneY:state.laneY
          };
          const ids=hitsBetween(prev,now);
          for(const id of ids)
            geometryEncountered.set(id,
              (geometryEncountered.get(id)||0)+1);
          const impacted=(state.map4ImpactCooldown||0)>prevCooldown;
          if(impacted)impactEvents.push({
            progress:+now.routeProgress.toFixed(1),
            time:+(state.raceTime-startTime).toFixed(2),
            colliders:ids,
            shieldBefore:prevShield,
            shieldAfter:state.shield
          });
          if(firstClearOfFastProgress===null&&
              h4IndustrialRoute(now.routeProgress,
                now.laneX,now.laneY)!=='FAST_LOW')
            firstClearOfFastProgress=now.routeProgress;
          if(firstTargetProgress===null&&
              now.laneX>=888&&now.laneY>=300)
            firstTargetProgress=now.routeProgress;
          boundaryLevels[state.boundaryLevel||0]=
            (boundaryLevels[state.boundaryLevel||0]||0)+1;
          if(advancedTicks===1||advancedTicks%10===0||
              ids.length||impacted)
            frames.push({
              tick:advancedTicks,progress:+now.routeProgress.toFixed(1),
              x:+now.laneX.toFixed(1),
              y:+now.laneY.toFixed(1),
              currentSpeed:+state.currentSpeed.toFixed(1),
              keyD:inputD,keyUp:inputUp,
              boundaryLevel:state.boundaryLevel||0,
              shield:+state.shield.toFixed(1),
              colliderIds:ids,impact:impacted
            });
          if(!Number.isFinite(now.routeProgress)||
              !Number.isFinite(now.laneX)||
              !Number.isFinite(now.laneY))
            throw new Error(config.id+' diverged');
        }
        Object.keys(keys).forEach(k=>keys[k]=false);
        const result={
          id:config.id,controlStart:config.controlStart,
          sample:{from,to,dt},
          gameTicks:advancedTicks,
          simulationSeconds:+(state.raceTime-startTime).toFixed(2),
          endProgress:+state.routeProgress.toFixed(2),
          endLaneX:+state.laneX.toFixed(2),
          endLaneY:+state.laneY.toFixed(2),
          reachedEnd:state.routeProgress>=to,
          playerDNF:!!state.playerDNF,
          finish:!!state.finished,
          firstExitFastProgress:firstClearOfFastProgress===null?
            null:+firstClearOfFastProgress.toFixed(2),
          firstHunterTargetProgress:firstTargetProgress===null?
            null:+firstTargetProgress.toFixed(2),
          boundaryLevels,
          impactEvents,
          geometricallyIntersectingFrames:
            [...geometryEncountered.values()].reduce((a,b)=>a+b,0),
          distinctColliders:[...geometryEncountered].map(([index,count])=>({
            index,name:identifiers.get(colliders[index])||'UNKNOWN',
            frameHits:count
          })),
          frames
        };
        all.push(result);
      }
      Object.keys(keys).forEach(k=>keys[k]=false);
      return {
        contract:'NEXT-11C16 scripted pilot control observation',
        analysisOnly:true,
        coreGameModified:false,
        actualFunction:'updateGame(dt) + original keyboard movement + map4Advance + original collision handler',
        scriptedInput:true,
        humanPilot:false,
        nativeGpuPerformance:false,
        full300sFlight:false,
        beforeAfterPhysicsIdentical:
          JSON.stringify(before)===JSON.stringify(protectedSnapshot()),
        invariants:{
          colliderCount:before.colliders.length,
          markerCount:before.markers.length,
          w02Count:before.w02.length,
          gameRules:before.rules,
          resolvedColliderOwners:colliders.filter(c=>identifiers.has(c)).length
        },
        scenarios:all
      };
    });
    assert.equal(output.analysisOnly,true);
    assert.equal(output.coreGameModified,false);
    assert.equal(output.beforeAfterPhysicsIdentical,true);
    assert.equal(output.scenarios.length,3);
    assert.equal(output.invariants.colliderCount,236);
    assert.equal(output.invariants.markerCount,24);
    assert.equal(output.invariants.w02Count,34);
    assert.equal(output.invariants.resolvedColliderOwners,236,
      'all W01/W05 owners must resolve from the full planetary scene');
    assert.equal(output.invariants.gameRules[0],60);
    assert.equal(output.invariants.gameRules[2],850);
    assert.equal(output.invariants.gameRules[3],300);
    assert.equal(output.invariants.gameRules[5],5);
    assert.equal(output.invariants.gameRules[6],8);
    for(const item of output.scenarios){
      assert(item.gameTicks>0);
      assert(item.frames.length>0);
      assert(item.endProgress>22000);
      assert(item.simulationSeconds>0);
      assert(item.gameTicks<1100);
    }
    const stable=output.scenarios[0];
    assert(Math.abs(stable.endLaneX+800)<0.01);
    assert(Math.abs(stable.endLaneY+100)<0.01);
    const early=output.scenarios[1];
    assert(early.frames.some(f=>f.keyD),
      'real keyboard control must be held by early case');
    assert(early.endLaneX>stable.endLaneX+200,
      'real updateGame must actually change lane X');
    assert.deepEqual(errors,[],errors.join('\n'));
    const artifact=path.join(__dirname,
      'map4-next11c16-scripted-pilot-input-traces.json');
    fs.writeFileSync(artifact,JSON.stringify(output,null,2));
    console.log('NEXT11C16 SCRIPTED REAL PLAYER UPDATE PASS',
      JSON.stringify({
        scenarios:output.scenarios.map(s=>({
          id:s.id,reachedEnd:s.reachedEnd,
          simSeconds:s.simulationSeconds,
          lastProgress:s.endProgress,lastX:s.endLaneX,lastY:s.endLaneY,
          firstExitFast:s.firstExitFastProgress,
          firstHunterTarget:s.firstHunterTargetProgress,
          impactEvents:s.impactEvents.length,
          sweptContactFrames:s.geometricallyIntersectingFrames,
          boundaryLevels:s.boundaryLevels,
          dnf:s.playerDNF
        })),
        beforeAfterPhysicsIdentical:output.beforeAfterPhysicsIdentical
      }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
