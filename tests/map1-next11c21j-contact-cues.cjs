/* NEXT11C21J: subtle Map1 contact/near-miss 2D cues ONLY.
 * Validate in real Chromium+WebGL, no new 3D geometry or game changes.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21j-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof startGame==='function'&&
   Array.isArray(itemBoxes)&&itemBoxes.length===49&&
   Array.isArray(asteroids)&&asteroids.length===320&&
   Array.isArray(wreckageModules)&&wreckageModules.length===8,
   null,{timeout:30000});
  const sceneBefore=await page.evaluate(()=>({
   asteroids:asteroids.length,
   boxes:itemBoxes.length,
   barrier:staticObstacles.filter(o=>o.type==='BARRIER').length,
   gate:wreckageModules.length,
   gateColliders:staticObstacles.filter(o=>o.type==='WRECK_BOX').length,
   noNewContactObjects:scene.children.every(x=>
    !/CONTACT_CUE|NEAR_MISS_RING|C21J/i.test(x.name||'')),
   noExtraHUD:!document.getElementById('map1-contact-overlay'),
   originalBox:itemBoxes.every(b=>b.radius===49&&
    b.spin.geometry.type==='BoxGeometry'),
   originalMeteor:asteroids.every(a=>
    a.mesh.geometry.type==='DodecahedronGeometry'),
   cueCount:Object.assign({},map1ContactCue.count)
  }));
  assert(sceneBefore.noNewContactObjects&&sceneBefore.noExtraHUD);
  assert(sceneBefore.originalBox&&sceneBefore.originalMeteor);
  assert.deepEqual(sceneBefore.cueCount,{NEAR:0,ASTEROID:0,BARRIER:0,SHIELD:0});
  assert.equal(sceneBefore.asteroids,320);
  assert.equal(sceneBefore.boxes,49);
  assert.equal(sceneBefore.gate,8);assert.equal(sceneBefore.gateColliders,32);
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:30000});
  const functionTest=await page.evaluate(()=>{
   state.paused=true;
   const priorData={score:state.score,energy:state.energy,
    barrierHits:state.barrierHits,asteroidHits:state.asteroidHits,
    nearMisses:state.nearMisses};
   state.energy=53;
   const a=asteroids.find(a=>a.active&&a.routeProgress>500);
   const claimed=a.nearMissClaimed,last=a.hitTimes.PLAYER;
   // Simulate just one true near-miss, keeping every other asteroid
   // outside the short crossing interval and preserving their state.
   const prevCourse=state.routeProgress,prevLaneX=state.laneX,
    prevLaneY=state.laneY,oldTime=state.raceTime;
   state.routeProgress=a.routeProgress+.001;
   state.laneX=a.laneX+a.radius+10+25;
   state.laneY=a.laneY;
   a.nearMissClaimed=false;
   delete a.hitTimes.PLAYER;
   const prevMisses=state.nearMisses,beforeScore=state.score,
    beforeEnergy=state.energy;
   updatePlayerNearMisses(a.routeProgress-.001);
   const afterMiss={count:state.nearMisses-prevMisses,
    score:state.score-beforeScore,energy:state.energy-beforeEnergy,
    cue:map1ContactCue.kind,side:map1ContactCue.side};
   // Reset only the mock's gameplay fields; no changes to actual run.
   state.score=priorData.score;state.energy=priorData.energy;
   state.nearMisses=priorData.nearMisses;state.routeProgress=prevCourse;
   state.laneX=prevLaneX;state.laneY=prevLaneY;state.raceTime=oldTime;
   a.nearMissClaimed=claimed;
   if(last===undefined)delete a.hitTimes.PLAYER;
   else a.hitTimes.PLAYER=last;
   const countAfterMiss=map1ContactCue.count.NEAR;
   const blockedRepeat=triggerMap1ContactCue('NEAR',state.laneX+100);
   const blockedCounter=map1ContactCue.count.NEAR;
   // The short directional warning is visual-only even when simulated
   // separately from physics for screenshot capture.
   const scoreboard={score:state.score,energy:state.energy,
    barrierHits:state.barrierHits,asteroidHits:state.asteroidHits,
    nearMisses:state.nearMisses};
   return {afterMiss,countAfterMiss,blockedRepeat,blockedCounter,
    scoreboard,priorData};
  });
  assert(functionTest.afterMiss.count>=1,'near miss gameplay remains active');
  assert(functionTest.afterMiss.score>=300);
  assert(functionTest.afterMiss.energy>=5);
  assert.equal(functionTest.afterMiss.cue,'NEAR');
  assert.equal(functionTest.blockedRepeat,false);
  assert.equal(functionTest.countAfterMiss,functionTest.blockedCounter);
  assert.deepEqual(functionTest.scoreboard,functionTest.priorData);

  const shots=[];
  for(const kind of ['NEAR','ASTEROID','BARRIER','SHIELD']){
   const event=await page.evaluate(kind=>{
    map1ContactCue.at=-100;
    if(kind==='NEAR')map1ContactCue.lastNearAt=-100;
    const before=JSON.stringify({
     score:state.score,energy:state.energy,
     radius:itemBoxes[0].radius,
     asteroidHits:state.asteroidHits,
     barrierHits:state.barrierHits});
    const result=triggerMap1ContactCue(kind,state.laneX+68);
    render2DTacticalReticle(0);
    const fx=fxCanvas,ctx=fx.getContext('2d'),
     rgba=ctx.getImageData(0,0,fx.width,fx.height).data;
    let sidePaint=0;
    // Visual cues occupy the right-hand perimeter, not reticle.
    for(let y=Math.floor(fx.height*.32);y<fx.height*.75;y+=6)
     for(let x=fx.width-55;x<fx.width-8;x+=4){
      const i=(y*fx.width+x)*4;
      if(rgba[i+3]>0)sidePaint++;
     }
    renderer.render(scene,camera);
    const err=renderer.getContext().getError();
    return {result,sidePaint,err,kind:map1ContactCue.kind,
     age:state.raceTime-map1ContactCue.at,
     count:map1ContactCue.count[kind],
     unchanged:before===JSON.stringify({
      score:state.score,energy:state.energy,
      radius:itemBoxes[0].radius,
      asteroidHits:state.asteroidHits,
      barrierHits:state.barrierHits})};
   },kind);
   assert(event.result&&event.sidePaint>200&&event.unchanged,
    'Expected visible cue with no game state change: '+JSON.stringify(event));
   assert.equal(event.err,0);assert.equal(event.kind,kind);
   const filename='map1-'+kind.toLowerCase()+'-subtle-side-cue-1600x900.png';
   await page.screenshot({path:path.join(out,filename)});
   shots.push({filename,...event});
  }
  const fading=await page.evaluate(()=>{
   const saved=state.raceTime;
   map1ContactCue.at=state.raceTime-map1ContactCue.duration-0.1;
   render2DTacticalReticle(0);
   const inactive=state.raceTime-map1ContactCue.at>map1ContactCue.duration;
   const noObjects=scene.children.every(x=>!String(x.name||'').includes('CONTACT'));
   state.raceTime=saved;
   return {inactive,noObjects,amount:Object.assign({},map1ContactCue.count)};
  });
  assert(fading.inactive&&fading.noObjects);
  assert.deepEqual(fading.amount,{NEAR:2,ASTEROID:1,BARRIER:1,SHIELD:1});

  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   const before=JSON.stringify(map1ContactCue.count);
   const refused=triggerMap1ContactCue('ASTEROID',100);
   render2DTacticalReticle(0);
   renderer.render(scene,camera);
   return {mode:state.activeMap,ship:h4Ship19Combat.userData.parts,
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    refused,countersUnchanged:before===JSON.stringify(map1ContactCue.count),
    glError:renderer.getContext().getError()};
  });
  assert.equal(map4.mode,'map4');assert.equal(map4.ship,249);
  assert.deepEqual(map4.colliders,[6,36,200]);assert.equal(map4.refused,false);
  assert(map4.countersUnchanged&&map4.glError===0);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21J',sceneBefore,functionTest,
   shots,fading,map4,errors,
   note:'No new particle, 3D mesh, collectible ring or collision code. Contact cue is a Canvas2D edge-only visual. Existing near-miss +300/+5 was invoked and preserved, manually staged cues alter zero gameplay fields. Map4 rejects cues.'};
  fs.writeFileSync(path.join(out,'contact-cue-visual-regression.json'),
   JSON.stringify(report,null,2));
  console.log('NEXT11C21J MAP1 CONTACT VISUAL WEBGL PASS '+JSON.stringify({
   hazards:[sceneBefore.asteroids,sceneBefore.barrier,sceneBefore.gate],
   boxes:sceneBefore.boxes,shots:shots.length,nearMiss:functionTest.afterMiss,
   fade:true,map4,errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});