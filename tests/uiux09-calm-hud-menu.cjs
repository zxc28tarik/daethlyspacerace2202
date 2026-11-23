/* UIUX09 — calm HUD/menu contract. Runs on real Chromium/WebGL. */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const out=path.join(__dirname,'uiux09-evidence');fs.mkdirSync(out,{recursive:true});
const url=pathToFileURL(path.resolve(__dirname,'../index.html')).toString();
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 const report=[];
 try{
  for(const v of [{name:'laptop',width:1366,height:768},
                  {name:'mobile',width:390,height:844}]){
   const page=await browser.newPage({viewport:{width:v.width,height:v.height}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({
     status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({
     status:200,contentType:'text/javascript',body:''}));
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof uiChangeSetting==='function'&&
     typeof state==='object',null,{timeout:30000});
   assert.equal(await page.locator('#map-selection .map-choice-btn').count(),6);
   for(const n of [2,3,5,6])assert(await page.locator('#map-choice-'+n).isDisabled());
   assert.equal(await page.locator('#ui-menu-rail').isVisible(),false,
     'duplicated map rail must stay hidden');
   assert.equal(await page.evaluate(()=>document.body.dataset.uiHudDensity),'COMPACT');
   const computed=await page.locator('#start-btn').evaluate(e=>({
      bg:getComputedStyle(e).backgroundColor,
      shadow:getComputedStyle(e).boxShadow}));
   assert.equal(computed.bg,'rgb(85, 121, 130)');
   assert.equal(computed.shadow,'none');
   assert.equal(await page.locator('#ui-result-extra-details').evaluate(e=>e.open),false);
   assert.equal(await page.locator('#ui-result-extra-details summary').count(),1);
   const overflow=await page.locator('#start-screen .ui-start-shell').evaluate(e=>
     e.scrollWidth-e.clientWidth);
   assert(overflow<=3,'menu horizontal overflow: '+overflow);
   await page.screenshot({path:path.join(out,v.name+'-01-menu.png')});
   await page.locator('#map-choice-4').click();
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'true');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&state.raceTime>.2,
      null,{timeout:30000});
   assert.equal(await page.locator('#race-hud-details').evaluate(e=>getComputedStyle(e).display),'none');
   await page.screenshot({path:path.join(out,v.name+'-02-compact-hud.png')});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:15000});
   assert(await page.locator('#flight-help-screen').isVisible());
   assert.equal(await page.locator('#ui-setting-hud-density').inputValue(),'COMPACT');
   await page.screenshot({path:path.join(out,v.name+'-03-pause.png')});
   await page.locator('#ui-setting-hud-density').selectOption('DETAILED');
   assert.equal(await page.evaluate(()=>document.body.dataset.uiHudDensity),'DETAILED');
   assert.notEqual(await page.locator('#race-hud-details').evaluate(e=>getComputedStyle(e).display),'none');
   const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem(UI_SETTINGS_KEY)||'{}'));
   assert.equal(stored.hudDensity,'DETAILED');
   await page.locator('#ui-setting-hud-density').selectOption('COMPACT');
   assert.equal(await page.locator('#race-hud-details').evaluate(e=>getComputedStyle(e).display),'none');
   await page.locator('#resume-btn').click();
   await page.waitForFunction(()=>state.running&&!state.paused,null,{timeout:12000});
   assert.deepEqual(errors,[],v.name+' unexpected JS errors');
   report.push({viewport:v.name,overflow,menuCards:6,compactHud:true,
     densityToggle:true,persistence:true,pauseResume:true,errors});
   await page.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log('PASS UIUX09 '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
