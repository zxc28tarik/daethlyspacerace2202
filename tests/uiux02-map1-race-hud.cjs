/* UIUX-02 — Map1 race-focused HUD structure and real WebGL screen checks. */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const out=path.join(__dirname,'uiux02-evidence');fs.mkdirSync(out,{recursive:true});
const viewports=[{width:1600,height:900,name:'desktop'},
 {width:1366,height:768,name:'laptop'},
 {width:1280,height:720,name:'hd'},
 {width:390,height:844,name:'narrow'}];
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 const report=[];
 try{
  for(const vp of viewports){
   const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
     {waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof state==='object'&&typeof selectMap==='function',null,{timeout:20000});
   assert.equal(await page.evaluate(()=>document.body.dataset.uiMode),'map1');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.raceTime>.08,null,{timeout:30000});
   const selectors=['#ui-flight-metrics-panel','#rank-text','#distance-text','#race-time-text',
    '#speed-text','#item-status','#ui-resources-panel','#shield-text','#energy-text',
    '#ui-score-panel','#laser-status','#stage-text'];
   for(const q of selectors)assert.equal(await page.locator(q).isVisible(),true,q+' is not visible in '+vp.name);
   const sig=await page.evaluate(()=>{
    const b=q=>{let r=document.querySelector(q).getBoundingClientRect();return{
     x:r.x,y:r.y,w:r.width,h:r.height,right:r.right,bottom:r.bottom};};
    const style=q=>{let x=getComputedStyle(document.querySelector(q));
     return {fontSize:x.fontSize,display:x.display,visibility:x.visibility};};
    return {
     mode:document.body.dataset.uiMode,
     metrics:b('#ui-flight-metrics-panel'),score:b('#ui-score-panel'),
     resources:b('#ui-resources-panel'),radar:style('#ui-radar-panel'),
     rank:style('#rank-text'),speed:style('#speed-text'),
     rankText:document.querySelector('#rank-text').textContent,
     active:document.querySelector('#active-bonus-status').dataset.uiActive,
     energy:state.energy,colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
       planetaryBuildingColliders.length],racers:racers.length,
     items:itemBoxes.length,
     width:innerWidth,height:innerHeight
    };
   });
   assert.equal(sig.mode,'map1');
   assert.equal(sig.radar.display,'none','Map1 compact radar intentionally hidden');
   assert.equal(sig.colliders[0],6);assert.equal(sig.colliders[1],36);
   assert.equal(sig.racers,5);assert.equal(sig.items,49);
   assert(sig.metrics.x>=0&&sig.metrics.right<=vp.width+2,'race metrics horizontal fit '+JSON.stringify(sig));
   assert(sig.metrics.bottom<sig.resources.y,'race metrics must not overlap resources '+JSON.stringify(sig));
   assert(sig.resources.right<=sig.score.x+2,'bottom cards should not overlap '+JSON.stringify(sig));
   assert(sig.score.right<=vp.width+2,'score card fit '+JSON.stringify(sig));
   assert(parseFloat(sig.rank.fontSize)>=12,'rank must be legible');
   await page.screenshot({path:path.join(out,vp.name+'-map1-default.png')});
   await page.evaluate(()=>{
     state.itemTurboTimer=6.5;state.lastPowerUpTimer=1;
     state.energy=75;
     updateHUD(false);
   });
   const bonus=await page.evaluate(()=>({
     item:document.querySelector('#item-status').textContent,
     itemOn:document.querySelector('#item-status').dataset.uiActive,
     bonus:document.querySelector('#active-bonus-status').textContent,
     bonusOn:document.querySelector('#active-bonus-status').dataset.uiActive,
     energy:document.querySelector('#energy-text').textContent,
     energyWidth:document.querySelector('#energy-bar').style.width
   }));
   assert.equal(bonus.itemOn,'true','active item should be emphasized');
   assert.equal(bonus.bonusOn,'true','boost state should be visible');
   assert.match(bonus.bonus,/HYPER/);
   assert.match(bonus.item,/HYPER/);
   assert.equal(bonus.energyWidth,'75%');
   await page.screenshot({path:path.join(out,vp.name+'-map1-reward.png')});
   // Verify map selection preserves unchanged Map4 HUD.
   await page.evaluate(()=>endGame(false));
   await page.locator('#menu-btn').click();
   await page.locator('#map-choice-4').click();
   assert.equal(await page.evaluate(()=>document.body.dataset.uiMode),'map4');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&state.raceTime>.05,null,{timeout:30000});
   for(const q of ['#hunter-competition-hud','#ui-flight-metrics-panel','#shield-text','#h4-power-panel']){
     assert.equal(await page.locator(q).isVisible(),true,q+' missing in Map4');
   }
   const map4=await page.evaluate(()=>({rivals:racers.length,hunters:hunterTargets.length,
      phase:state.map4Phase,world:planetaryWorldRegions.length}));
   assert.equal(map4.rivals,5);assert.equal(map4.hunters,8);assert.equal(map4.world,4);
   await page.screenshot({path:path.join(out,vp.name+'-map4-regression.png')});
   assert.deepEqual(errors,[],'JavaScript errors '+vp.name);
   report.push({viewport:vp.name,metrics:sig.metrics,resources:sig.resources,
     score:sig.score,reward:bonus.item,map4});
   await page.close();
  }
  console.log('PASS UIUX-02 '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
