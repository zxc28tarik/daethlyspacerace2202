/* UIUX-04 — map-specific quick mission briefing and first-flight onboarding QA.
   In Chromium with Three/WebGL. The phase 2/3/4 hint QA uses synthetic HUD
   transition states, not fully played Map4 sections.
*/
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const OUT=path.join(__dirname,'uiux04-evidence');fs.mkdirSync(OUT,{recursive:true});
const viewports=[
 {name:'desktop',width:1600,height:900},
 {name:'laptop',width:1280,height:720},
 {name:'tablet',width:760,height:720},
 {name:'mobile',width:390,height:844}
];
const htmlUrl=pathToFileURL(path.resolve(__dirname,'../index.html')).toString();
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const snapshots=[];
 try{
  for(const viewport of viewports){
   const page=await browser.newPage({viewport,deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(htmlUrl,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof state==='object'&&typeof uiFirstFlightBegin==='function',null,
    {timeout:30000});
   assert.equal(await page.locator('#map1-instructions').isVisible(),true);
   assert.equal(await page.locator('#map4-instructions').isVisible(),false);
   assert.equal(await page.locator('#map1-instructions').evaluate(e=>e.open),false);
   assert.equal(await page.locator('#ui-quick-mission-title').textContent(),
    '6 PİLOT. BİRİNCİLİĞİ AL.');
   assert.equal(await page.locator('#ui-quick-stat-3-value').textContent(),'MOR KUTU');
   assert.equal(await page.locator('#ui-quick-controls span').count(),3);
   const menuGeometry=await page.evaluate(()=>{
    const shell=document.querySelector('#start-screen > .ui-screen-shell');
    const quick=document.querySelector('#ui-quick-briefing');
    const r=quick.getBoundingClientRect();
    return {overflow:shell.scrollWidth-shell.clientWidth,
      x:r.left,right:r.right,width:window.innerWidth,
      startButton:document.getElementById('start-btn').disabled};
   });
   assert(menuGeometry.overflow<=2,'menu horizontal overflow '+JSON.stringify(menuGeometry));
   assert(menuGeometry.x>=-2&&menuGeometry.right<=viewport.width+2,
    'briefing exceeds screen '+JSON.stringify(menuGeometry));
   assert.equal(menuGeometry.startButton,false);
   await page.screenshot({path:path.join(OUT,viewport.name+'-01-map1-briefing.png')});
   await page.locator('#map1-instructions summary').click();
   assert.equal(await page.locator('#map1-instructions').evaluate(e=>e.open),true);
   assert.equal(await page.locator('#map1-instructions .ui-instruction-grid>div').count(),5);
   assert.equal(await page.locator('#map1-instructions .ui-instruction-grid>div').first().isVisible(),true);
   await page.screenshot({path:path.join(OUT,viewport.name+'-02-expanded-rules.png')});
   await page.locator('#map-choice-4').click();
   assert.equal(await page.locator('#map1-instructions').isVisible(),false);
   assert.equal(await page.locator('#map4-instructions').isVisible(),true);
   assert.equal(await page.locator('#map4-instructions').evaluate(e=>e.open),false);
   assert.equal(await page.locator('#ui-quick-mission-title').textContent(),
    'AVCILARI VUR. YÖRÜNGEYE ÇIK.');
   assert.deepEqual(await page.locator('.ui-brief-stat strong').allTextContents(),
    ['60 SN','300 SN','850 M']);
   assert.match(await page.locator('#ui-quick-controls').textContent(),/1–4/);
   assert.equal(await page.locator('#h4-quality-picker').isVisible(),true);
   await page.screenshot({path:path.join(OUT,viewport.name+'-03-map4-briefing.png')});
   await page.locator('#map4-instructions summary').click();
   assert.equal(await page.locator('#map4-instructions').evaluate(e=>e.open),true);
   assert.equal(await page.locator('#map4-instructions .ui-instruction-grid>div').count(),4);
   await page.locator('#map-choice-1').click();
   assert.equal(await page.locator('#map4-instructions').evaluate(e=>e.open),false);
   assert.equal(await page.locator('#ui-help-map-context').textContent(),
    'HARİTA 1 · MOR KUTU LAZERİ AÇAR · BOOST SHIFT/W · F / SOL TIK');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1'&&
    document.getElementById('ui-first-flight').classList.contains('hidden')===false,
    null,{timeout:30000});
   assert.match(await page.locator('#ui-first-flight-title').textContent(),/YÖNÜ KONTROL ET/);
   assert.match(await page.locator('#ui-first-flight-text').textContent(),/A \/ D/);
   await page.screenshot({path:path.join(OUT,viewport.name+'-04-map1-first-flight.png')});
   let guide=await page.evaluate(()=>{
    state.raceTime=3.2;
    uiFirstFlightUpdate(true);
    const second=document.getElementById('ui-first-flight-title').textContent;
    state.raceTime=6.2;
    uiFirstFlightUpdate(true);
    const third=document.getElementById('ui-first-flight-title').textContent;
    const step=document.getElementById('ui-first-flight-step').textContent;
    state.raceTime=9.2;
    uiFirstFlightUpdate(true);
    return {second,third,step,hidden:
      document.getElementById('ui-first-flight').classList.contains('hidden'),
      seen:uiFirstFlight.seen.has('map1')};
   });
   assert.match(guide.second,/HIZINI YÖNET/);
   assert.match(guide.third,/MOR ÖDÜLLERİ TOPLA/);
   assert.match(guide.step,/3\/3/);
   assert.equal(guide.hidden,true);
   assert.equal(guide.seen,true);
   await page.evaluate(()=>endGame(false));
   await page.locator('#restart-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1',null,{timeout:30000});
   assert.equal(await page.locator('#ui-first-flight').isVisible(),false,
    'first-flight coach should not repeat after a completed intro');
   await page.evaluate(()=>endGame(false));
   await page.locator('#menu-btn').click();
   await page.locator('#map-choice-4').click();
   assert.match(await page.locator('#ui-help-map-context').textContent(),/60 SN ARENA/);
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&
    !document.getElementById('ui-first-flight').classList.contains('hidden'),
    null,{timeout:30000});
   assert.match(await page.locator('#ui-first-flight-title').textContent(),/VADİDE ROTANI SEÇ/);
   await page.screenshot({path:path.join(OUT,viewport.name+'-05-map4-first-flight.png')});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:15000});
   assert.equal(await page.locator('#ui-first-flight').isVisible(),false);
   assert.equal(await page.locator('#flight-help-screen').isVisible(),true);
   assert.match(await page.locator('#ui-help-map-context').textContent(),/850 M/);
   await page.screenshot({path:path.join(OUT,viewport.name+'-06-map4-pause.png')});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>!state.paused,null,{timeout:15000});
   // Pause toggles instantly but the game loop re-renders the coach next frame.
   await page.waitForFunction(()=>
     !document.getElementById('ui-first-flight').classList.contains('hidden'),
     null,{timeout:15000});
   assert.equal(await page.locator('#ui-first-flight').isVisible(),true);
   const stages=await page.evaluate(()=>{
    const result={};
    state.raceTime=9.7;uiFirstFlightUpdate(true);
    result.introGone=uiFirstFlight.initial===false;
    for(const stage of [2,3,4]){
      state.map4Phase=stage;
      state.raceTime+=5;
      uiFirstFlightUpdate(true);
      result[stage]={
        title:document.getElementById('ui-first-flight-title').textContent,
        text:document.getElementById('ui-first-flight-text').textContent,
        shown:!document.getElementById('ui-first-flight').classList.contains('hidden'),
        label:document.getElementById('ui-first-flight-step').textContent
      };
    }
    return result;
   });
   assert.equal(stages.introGone,true);
   for(let stage of [2,3,4]){
    assert.equal(stages[stage].shown,true,'stage '+stage+' hint must appear');
    assert.match(stages[stage].label,new RegExp(stage+'/4'));
   }
   assert.match(stages[2].title,/ARENASI/);
   assert.match(stages[3].title,/SANAYİ/);
   assert.match(stages[4].title,/YÖRÜNGE/);
   await page.screenshot({path:path.join(OUT,viewport.name+'-07-map4-phase-hint.png')});
   // Dismiss actual DOM button and verify firing is not triggered accidentally.
   const dismissButton=page.locator('#ui-first-flight-dismiss');
   await dismissButton.click();
   assert.equal(await page.locator('#ui-first-flight').isVisible(),false);
   assert.equal(await page.evaluate(()=>uiFirstFlight.dismissedThisRun),true);
   assert.equal(await page.evaluate(()=>state.isFiring),false);
   assert.equal(await page.evaluate(()=>uiFirstFlight.seen.has('map4')),true);
   await page.evaluate(()=>endGame(false));
   await page.locator('#restart-btn').click();
   await page.waitForFunction(()=>state.running,null,{timeout:20000});
   assert.equal(await page.locator('#ui-first-flight').isVisible(),false);
   assert.deepEqual(errors,[],viewport.name+' runtime errors');
   snapshots.push({viewport:viewport.name,briefing:'map1 + map4',guide,stages,
    noOverflow:menuGeometry.overflow<=2,pause:true,restart:true});
   await page.close();
  }
  console.log('PASS UIUX04 '+JSON.stringify(snapshots));
 } finally {await browser.close();}
})().catch(err=>{console.error(err.stack||err);process.exitCode=1;});