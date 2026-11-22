/* UIUX-06: six truthful map slots and mode-specific race results QA.
 * Browser/WebGL starts both maps for real; synthetic result states are only
 * used to exercise win/finish/late/DNF UI, not as evidence of a full race.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const DIR=path.join(__dirname,'uiux06-evidence');fs.mkdirSync(DIR,{recursive:true});
const viewports=[
 {name:'desktop',width:1600,height:900},
 {name:'laptop',width:1280,height:720},
 {name:'compact',width:760,height:720},
 {name:'mobile',width:390,height:844}
];
function bbox(d){return {left:d.left,top:d.top,right:d.right,bottom:d.bottom};}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const logs=[];
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
   await page.waitForFunction(()=>typeof state==='object'&&
    typeof uiSetResultOverview==='function'&&typeof selectMap==='function',
    null,{timeout:30000});
   const slots=await page.locator('#map-selection [data-ui-map]').count();
   assert.equal(slots,6,'All six map slots are visible in selector DOM');
   assert.deepEqual(await page.locator('#map-selection [data-ui-map]').evaluateAll(els=>
    els.map(e=>e.dataset.uiMap)),['map1','map2','map3','map4','map5','map6']);
   for(const map of ['map2','map3','map5','map6']){
    assert.equal(await page.locator('#map-choice-'+map.slice(3)).isDisabled(),true,map+' must be locked');
    assert.equal(await page.locator('#map-choice-'+map.slice(3)).getAttribute('aria-disabled'),'true');
   }
   const info=await page.evaluate(()=>{
    const bbox=d=>({left:d.left,top:d.top,right:d.right,bottom:d.bottom});
    const buttons=[...document.querySelectorAll('#map-selection .map-choice-btn')];
    const shell=document.querySelector('#start-screen .ui-screen-shell');
    const r=document.querySelector('#map-selection .ui-six-map-grid').getBoundingClientRect();
    const initial=state.activeMap;
    for(const m of ['map2','map3','map5','map6'])selectMap(m);
    const kept=state.activeMap===initial;
    const blocked=buttons.filter(x=>x.disabled).map(x=>x.id);
    return {kept,blocked,menuOverflow:shell.scrollWidth-shell.clientWidth,
       pickerRect:bbox(r),viewportWidth:window.innerWidth};
   });
   assert(info.kept,'locked mode must not alter selected playable state');
   assert.equal(info.blocked.length,4);
   assert(info.menuOverflow<=2,'horizontal menu overflow: '+JSON.stringify(info));
   assert(info.pickerRect.left>=-2&&info.pickerRect.right<=vp.width+2,
    'map grid outside viewport: '+JSON.stringify(info));
   assert.equal(await page.locator('#map-choice-1').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'false');
   assert.equal(await page.locator('#start-btn').isEnabled(),true);
   await page.screenshot({path:path.join(DIR,vp.name+'-01-six-maps.png')});
   // Map1 actual launch -> DNF result with no fictional time/gap.
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1'&&state.raceTime>.1,
     null,{timeout:30000});
   await page.evaluate(()=>endGame(false));
   assert.equal(await page.locator('#gameover-screen').isVisible(),true);
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-map'),'map1');
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-status'),'dnf');
   assert.equal(await page.locator('#ui-result-metric-1-value').textContent(),'DNF');
   assert.equal(await page.locator('#ui-result-metric-2-value').textContent(),'—');
   assert.equal(await page.locator('#ui-result-metric-3-value').textContent(),'—');
   assert.match(await page.locator('#ui-result-mode').textContent(),/01/);
   assert.equal(await page.locator('#race-standings-list > div').count(),6);
   await page.screenshot({path:path.join(DIR,vp.name+'-02-map1-dnf.png')});
   // Real restart; controlled scoring snapshot for result UI branch, not full playthrough.
   await page.locator('#restart-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1',null,{timeout:30000});
   await page.evaluate(()=>{
    state.finished=true;state.playerDNF=false;state.finishTime=125;
    state.powerUpsCollected=3;state.checkpointTimes=[23,48,77];
    for(const r of racers){r.finished=false;r.dnf=false;r.finishTime=null;}
    racers[0].finished=true;racers[0].finishTime=120;
    endGame(true);
   });
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-status'),'finish');
   assert.equal(await page.locator('#ui-result-metric-1-value').textContent(),'2 / 6');
   assert.equal(await page.locator('#ui-result-metric-2-value').textContent(),'02:05.00');
   assert.match(await page.locator('#ui-result-metric-3-value').textContent(),/\+5,00/);
   assert.equal(await page.locator('#ui-result-metric-4-value').textContent(),'3');
   assert.match(await page.locator('#race-sector-splits').textContent(),/SEKTÖR/);
   await page.screenshot({path:path.join(DIR,vp.name+'-03-map1-finish-2nd.png')});
   await page.locator('#restart-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1',null,{timeout:30000});
   await page.evaluate(()=>{
    state.finished=true;state.playerDNF=false;state.finishTime=100;
    for(const r of racers){r.finished=false;r.dnf=false;r.finishTime=null;}
    endGame(true);
   });
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-status'),'win');
   assert.equal(await page.locator('#ui-result-outcome').textContent(),'BİRİNCİLİK');
   await page.locator('#menu-btn').click();
   assert.equal(await page.locator('#start-screen').isVisible(),true);
   assert.equal(await page.locator('#map-choice-1').getAttribute('aria-pressed'),'true');
   await page.locator('#map-choice-4').click();
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#h4-quality-picker').isVisible(),true);
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4',null,{timeout:30000});
   await page.evaluate(()=>endGame(false));
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-map'),'map4');
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-status'),'dnf');
   assert.equal(await page.locator('#ui-result-metric-1-value').textContent(),'DNF');
   assert.equal(await page.locator('#ui-result-metric-4-value').textContent(),'DNF');
   assert.match(await page.locator('#ui-result-criteria').textContent(),/300 sn/);
   assert.equal(await page.locator('#race-standings-list > div').count(),6);
   assert.match(await page.locator('#race-standings-head').textContent(),/PUAN/);
   await page.screenshot({path:path.join(DIR,vp.name+'-04-map4-dnf.png')});
   // Real Map4 restart and synthetic valid hunter result.
   await page.locator('#restart-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4',null,{timeout:30000});
   await page.evaluate(()=>{
    state.finished=true;state.playerDNF=false;state.finishTime=145;
    state.hunterScore=12;state.hunterKills=5;state.hunterShots=10;state.hunterHits=7;
    for(const r of racers){r.finished=false;r.dnf=false;r.finishTime=null;}
    endGame(true);
   });
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-status'),'win');
   assert.equal(await page.locator('#ui-result-metric-1-value').textContent(),'1 / 6');
   assert.equal(await page.locator('#ui-result-metric-2-value').textContent(),'12');
   assert.equal(await page.locator('#ui-result-metric-3-value').textContent(),'5');
   assert.equal(await page.locator('#ui-result-metric-4-value').textContent(),'02:25.00');
   assert.equal(await page.locator('#race-standings-list > div').count(),6);
   await page.screenshot({path:path.join(DIR,vp.name+'-05-map4-valid-win.png')});
   await page.locator('#restart-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4',null,{timeout:30000});
   await page.evaluate(()=>{
    state.finished=true;state.playerDNF=false;state.finishTime=301;
    state.hunterScore=30;state.hunterKills=11;
    for(const r of racers){r.finished=false;r.dnf=false;r.finishTime=null;}
    endGame(true);
   });
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-status'),'dnf');
   assert.equal(await page.locator('#ui-result-metric-1-value').textContent(),'DNF');
   assert.equal(await page.locator('#ui-result-metric-4-value').textContent(),'GEÇ VARIŞ');
   assert.equal(await page.evaluate(()=>window.starbladeHunterFinal.standings
    .find(e=>e.isPlayer).validFinish),false);
   // Results responsive and CTA still navigable.
   const geometry=await page.evaluate(()=>{
    const bbox=d=>({left:d.left,top:d.top,right:d.right,bottom:d.bottom});
    const shell=document.querySelector('#gameover-screen .ui-results-shell');
    const metrics=document.querySelector('#ui-result-quick-metrics').getBoundingClientRect();
    const buttons=[...document.querySelectorAll('#gameover-screen button')]
       .map(el=>bbox(el.getBoundingClientRect()));
    return {overflow:shell.scrollWidth-shell.clientWidth,
      metrics:bbox(metrics),buttons};
   });
   assert(geometry.overflow<=2,'result horizontal overflow '+JSON.stringify(geometry));
   assert(geometry.metrics.left>=-2&&geometry.metrics.right<=vp.width+2,
    'result metric row outside viewport '+JSON.stringify(geometry));
   assert(geometry.buttons.every(x=>x.left>=-2&&x.right<=vp.width+2),
    'result action outside viewport '+JSON.stringify(geometry));
   await page.screenshot({path:path.join(DIR,vp.name+'-06-map4-late-dnf.png')});
   await page.locator('#menu-btn').click();
   assert.equal(await page.locator('#start-screen').isVisible(),true);
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#map-choice-2').isDisabled(),true);
   assert.deepEqual(errors,[],vp.name+' browser errors');
   logs.push({viewport:vp.name,locked:4,playable:2,
     map1:['dnf','finish','win'],map4:['dnf','win','late'],
     resultOverflow:geometry.overflow,menuOverflow:info.menuOverflow});
   await page.close();
  }
  console.log('PASS UIUX06 '+JSON.stringify(logs));
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});