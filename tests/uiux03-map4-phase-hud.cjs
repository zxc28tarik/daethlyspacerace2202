/* UIUX-03: actual Map4 Chromium/WebGL overlay and four-phase HUD state acceptance.
 * Phase 2-4 visual snapshots explicitly use synthetic UI state over a live Map4
 * first-stage render. Gameplay rules, mission clocks and physical objects are untouched.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const dir=path.join(__dirname,'uiux03-evidence');
fs.mkdirSync(dir,{recursive:true});
const viewports=[
 {name:'desktop',width:1600,height:900},
 {name:'laptop',width:1280,height:720},
 {name:'compact',width:760,height:720},
 {name:'mobile',width:390,height:844}
];
const scenarios=[
 {phase:1,progress:4500,arena:0,altitude:50,score:2,kills:2,
  name:'valley',expected:'VADİ ÇIKIŞINA',expectPct:[35,37]},
 {phase:2,progress:12500,arena:25,altitude:90,score:7,kills:5,
  name:'arena',expected:'ARENA KAPISI AÇILANA',expectPct:[41,43]},
 {phase:3,progress:24000,arena:60,altitude:150,score:10,kills:8,
  name:'industry',expected:'SANAYİ ÇIKIŞINA',expectPct:[53,54]},
 {phase:4,progress:39000,arena:60,altitude:620,score:13,kills:9,
  name:'orbit',expected:'GEREKLİ İRTİFA',expectPct:[72,74]}
];
function overlaps(a,b){
 const dx=Math.min(a.right,b.right)-Math.max(a.left,b.left);
 const dy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);
 return dx>2&&dy>2;
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const report=[];
 try{
  for(const vp of viewports){
   const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
   const errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
    {waitUntil:'domcontentloaded',timeout:25000});
   await page.waitForFunction(()=>typeof state==='object'&&typeof updateMap4MissionHUD==='function',
     null,{timeout:30000});
   await page.locator('#map-choice-4').click();
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&
     state.raceTime>0.4&&document.body.dataset.uiPhase==='1',null,{timeout:30000});
   assert.equal(await page.locator('#planetary-zone-hud').isVisible(),true);
   assert.equal(await page.locator('#hunter-competition-hud').isVisible(),true);
   assert.equal(await page.locator('#ui-map4-goal-label').isVisible(),true);
   await page.screenshot({path:path.join(dir,vp.name+'-01-actual-valley.png')});
   await page.evaluate(()=>{
     window.uiux03Original={
      map4Phase:state.map4Phase,routeProgress:state.routeProgress,
      laneX:state.laneX,laneY:state.laneY,map4ArenaElapsed:state.map4ArenaElapsed,
      hunterScore:state.hunterScore,hunterKills:state.hunterKills,
      boundaryLevel:state.boundaryLevel,raceTime:state.raceTime,paused:state.paused
     };
     state.paused=true; // Hold physical world for isolated HUD testing.
   });
   for(const scenario of scenarios){
    const result=await page.evaluate(p=>{
     state.map4Phase=p.phase;
     state.routeProgress=p.progress;
     state.map4ArenaElapsed=p.arena;
     state.laneY=p.altitude;
     state.hunterScore=p.score;state.hunterKills=p.kills;
     state.boundaryLevel=0;
     updateMap4MissionHUD(true);
     const rect=id=>{
      const d=document.getElementById(id).getBoundingClientRect();
      return {left:d.left,top:d.top,right:d.right,bottom:d.bottom,width:d.width,height:d.height};
     };
     return {
      mode:document.body.dataset.uiMode,phase:document.body.dataset.uiPhase,
      label:document.getElementById('ui-map4-goal-label').textContent,
      value:document.getElementById('ui-map4-goal-value').textContent,
      context:document.getElementById('ui-map4-goal-context').textContent,
      directive:document.getElementById('ui-map4-phase-directive').textContent,
      progress:parseFloat(document.getElementById('ui-map4-progress-fill').style.width),
      ariaProgress:document.querySelector('.ui-map4-progress-rail').getAttribute('aria-valuenow'),
      ariaCurrent:[...document.querySelectorAll('[data-ui-stage][aria-current="step"]')]
         .map(e=>Number(e.dataset.uiStage)),
      completed:[...document.querySelectorAll('[data-ui-stage][data-ui-complete="true"]')]
         .map(e=>Number(e.dataset.uiStage)),
      score:document.getElementById('ui-map4-hunter-score').textContent,
      kills:document.getElementById('ui-map4-hunter-kills').textContent,
      competitionListDisplay:getComputedStyle(
       document.getElementById('hunter-competition-scores')).display,
      mission:rect('planetary-zone-hud'),
      flight:rect('ui-flight-metrics-panel'),
      competition:rect('hunter-competition-hud'),
      resource:rect('ui-resources-panel'),
      scorePanel:rect('ui-score-panel'),
      physicalState:{phase:state.map4Phase,progress:state.routeProgress,
       arena:state.map4ArenaElapsed,score:state.hunterScore,
       altitude:state.laneY}
     };
    },scenario);
    assert.equal(result.phase,String(scenario.phase));
    assert.equal(result.mode,'map4');
    assert.equal(result.label,scenario.expected);
    assert(result.progress>=scenario.expectPct[0]&&result.progress<=scenario.expectPct[1],
     scenario.name+' invalid progress '+JSON.stringify(result));
    assert.deepEqual(result.ariaCurrent,[scenario.phase]);
    assert.deepEqual(result.completed,
     Array.from({length:scenario.phase-1},(_,i)=>i+1));
    assert.equal(result.score,String(scenario.score));
    assert.equal(result.kills,String(scenario.kills));
    assert.equal(result.competitionListDisplay==='none',scenario.phase!==2,
     'arena scoreboard visibility');
    assert.equal(result.physicalState.progress,scenario.progress);
    assert.equal(result.physicalState.arena,scenario.arena);
    assert.equal(result.physicalState.altitude,scenario.altitude);
    assert(result.mission.left>=-2&&result.mission.right<=vp.width+2,
     vp.name+' mission outside viewport '+JSON.stringify(result.mission));
    assert(result.flight.left>=-2&&result.flight.right<=vp.width+2,
     vp.name+' flight outside viewport '+JSON.stringify(result.flight));
    assert(result.competition.left>=-2&&result.competition.right<=vp.width+2,
     vp.name+' scores outside viewport '+JSON.stringify(result.competition));
    assert(!overlaps(result.mission,result.flight),
     vp.name+' mission overlays flight at '+scenario.name+' '+JSON.stringify(result));
    assert(!overlaps(result.mission,result.competition),
     vp.name+' mission overlays competition at '+scenario.name+' '+JSON.stringify(result));
    assert(!overlaps(result.flight,result.competition),
     vp.name+' flight overlays competition at '+scenario.name+' '+JSON.stringify(result));
    assert(result.resource.bottom<=vp.height+2&&result.scorePanel.bottom<=vp.height+2,
     vp.name+' bottom cards cut off '+JSON.stringify(result));
    await page.screenshot({path:path.join(dir,
      vp.name+'-0'+scenario.phase+'-synthetic-'+scenario.name+'-hud.png')});
    report.push({vp:vp.name,stage:scenario.phase,
      metric:result.value,progress:result.progress,score:result.score,
      mission:result.mission,flight:result.flight,competition:result.competition});
   }
   const urgency=await page.evaluate(()=>{
     state.map4Phase=4;state.routeProgress=43000;state.laneY=860;
     state.raceTime=283;state.boundaryLevel=3;
     updateMap4MissionHUD(true);
     const result={
      value:document.getElementById('ui-map4-goal-value').textContent,
      directive:document.getElementById('ui-map4-phase-directive').textContent,
      urgent:document.getElementById('ui-map4-urgent').textContent,
      shown:!document.getElementById('ui-map4-urgent').classList.contains('hidden'),
      totalRemaining:window.deathlyUIPhaseTelemetry.totalRemaining,
      orbitTarget:window.deathlyUIPhaseTelemetry.orbitTarget
     };
     Object.assign(state,window.uiux03Original);
     updateMap4MissionHUD(true);
     return result;
   });
   assert.match(urgency.directive,/İRTİFA TAMAM/);
   assert(urgency.shown&&urgency.totalRemaining<=17.1);
   assert.equal(urgency.orbitTarget,850);
   assert.match(urgency.urgent,/SÜRE AZALIYOR/);
   // Start/return to Map1: phase-only markup must stop controlling the race HUD.
   await page.evaluate(()=>{state.paused=false;endGame(false);});
   assert.equal(await page.locator('#gameover-screen').isVisible(),true);
   await page.locator('#menu-btn').click();
   await page.locator('#map-choice-1').click();
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1'&&state.raceTime>0.05,
     null,{timeout:30000});
   assert.equal(await page.evaluate(()=>document.body.dataset.uiPhase),undefined);
   assert.equal(await page.locator('#rank-text').isVisible(),true);
   assert.deepEqual(errors,[],vp.name+' page errors');
   await page.close();
  }
  console.log('PASS UIUX03 '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});