/* UIUX-01: real Chromium/WebGL screen, mode and button regression. */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const out=path.join(__dirname,'uiux01-evidence');fs.mkdirSync(out,{recursive:true});
const modes=[{width:1600,height:900,label:'desktop'},{width:1366,height:768,label:'laptop'},{width:390,height:844,label:'narrow'}];
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const report=[];
 try {
  for(const config of modes){
   const page=await browser.newPage({viewport:{width:config.width,height:config.height},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(String(e.message)));
   const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
      {waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof selectMap==='function'&&typeof state==='object',null,{timeout:30000});
   assert((await page.title()).startsWith('Deathly Space Race'));
   assert.equal(await page.locator('#map-choice-1').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'false');
   assert.equal(await page.locator('.ui-hero-title').innerText(),'DEATHLY SPACE RACE');
   const mainStyle=await page.locator('#start-screen > .ui-screen-shell').evaluate(el=>({
     maxWidth:getComputedStyle(el).maxWidth,borderRadius:getComputedStyle(el).borderRadius,
     overflow:getComputedStyle(el).overflowY
   }));
   assert.notEqual(mainStyle.borderRadius,'0px','ui shell styles loaded');
   await page.screenshot({path:path.join(out,config.label+'-menu-map1.png')});
   await page.locator('#map-choice-4').click();
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#map4-instructions').isVisible(),true);
   assert.equal(await page.locator('#map1-instructions').isVisible(),false);
   assert.equal(await page.locator('#h4-quality-picker').isVisible(),true);
   assert.equal(await page.evaluate(()=>document.body.dataset.uiMode),'map4');
   await page.screenshot({path:path.join(out,config.label+'-menu-map4.png')});
   const menuOverflow=await page.evaluate(()=>({
     page:document.documentElement.scrollWidth-innerWidth,
     menu:document.querySelector('#start-screen > .ui-screen-shell').scrollWidth-
       document.querySelector('#start-screen > .ui-screen-shell').clientWidth
   }));
   assert(menuOverflow.page<=2,'window horizontal overflow on '+config.label+': '+JSON.stringify(menuOverflow));
   assert(menuOverflow.menu<=2,'menu horizontal overflow on '+config.label+': '+JSON.stringify(menuOverflow));
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.raceTime>.05,null,{timeout:30000});
   assert.equal(await page.locator('#start-screen').isVisible(),false);
   assert.equal(await page.locator('#shield-text').isVisible(),true);
   await page.screenshot({path:path.join(out,config.label+'-map4-hud.png')});
   await page.keyboard.press('KeyP');
   assert.equal(await page.locator('#flight-help-screen').isVisible(),true);
   assert.equal(await page.locator('#ui-map1-pause-note').isVisible(),false,'map1 hint not shown in map4');
   await page.screenshot({path:path.join(out,config.label+'-map4-pause.png')});
   await page.locator('#resume-btn').click();
   assert.equal(await page.locator('#flight-help-screen').isVisible(),false);
   assert.equal(await page.evaluate(()=>state.running&&!state.paused),true);
   await page.evaluate(()=>endGame(false));
   assert.equal(await page.locator('#gameover-screen').isVisible(),true);
   assert.equal(await page.locator('#restart-btn').isEnabled(),true);
   await page.screenshot({path:path.join(out,config.label+'-map4-results.png')});
   await page.locator('#menu-btn').click();
   assert.equal(await page.locator('#start-screen').isVisible(),true);
   await page.locator('#map-choice-1').click();
   assert.equal(await page.evaluate(()=>document.body.dataset.uiMode),'map1');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1'&&state.raceTime>.05,null,{timeout:30000});
   await page.screenshot({path:path.join(out,config.label+'-map1-hud.png')});
   await page.keyboard.press('KeyP');
   assert.equal(await page.locator('#ui-map1-pause-note').isVisible(),true);
   await page.locator('#resume-btn').click();
   await page.evaluate(()=>endGame(false));
   assert.equal(await page.locator('#gameover-screen').isVisible(),true);
   await page.screenshot({path:path.join(out,config.label+'-map1-results.png')});
   assert.deepEqual(errors,[],'page errors on '+config.label);
   report.push({viewport:config.label,menuOverflow,screens:7,errors});
   await page.close();
  }
  console.log('PASS UIUX-01 '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(err=>{console.error(err.stack||err);process.exitCode=1;});
