/* UIUX11: real Chromium/WebGL KISS menu, HUD and pause acceptance. */
'use strict';
const {chromium}=require('playwright'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const out=path.join(__dirname,'uiux11-evidence');
fs.mkdirSync(out,{recursive:true});
const url=pathToFileURL(path.resolve(__dirname,'../index.html')).toString();
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
   '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 const report=[];
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  for(const viewport of [{name:'desktop',width:1366,height:768},{name:'mobile',width:390,height:844}]){
   const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
     r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>
     r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof state==='object'&&typeof startGame==='function',null,{timeout:30000});
   const retroImage=await page.evaluate(async()=>{
     const start=document.getElementById('start-screen');
     const pseudo=getComputedStyle(start,'::before');
     const shell=getComputedStyle(start.querySelector('.ui-start-shell'));
     const match=pseudo.backgroundImage.match(/url\\("(data:image\\/webp;base64,[^"]+)"\\)/);
     if(!match)return {embedded:false,blur:shell.backdropFilter};
     const img=new Image();img.src=match[1];await img.decode();
     return {embedded:true,width:img.naturalWidth,height:img.naturalHeight,
       blur:shell.backdropFilter};
   });
   assert.equal(retroImage.embedded,true,'retro backdrop must be embedded offline');
   assert.equal(retroImage.width,1672);
   assert.equal(retroImage.height,941);
   assert.equal(retroImage.blur,'none','no blurry menu rectangle over the art');
   const menu=await page.evaluate(()=>{
     const q=id=>document.getElementById(id),css=id=>getComputedStyle(q(id));
     return {six:document.querySelectorAll('.map-choice-btn').length,
       active:[1,4].every(i=>css('map-choice-'+i).display!=='none'),
       hidden:[2,3,5,6].every(i=>css('map-choice-'+i).display==='none'),
       border:getComputedStyle(document.querySelector('#start-screen .ui-start-shell')).borderTopWidth,
       brief:css('ui-quick-briefing').backgroundColor,
       overflow:q('start-screen').scrollWidth-q('start-screen').clientWidth};
   });
   assert.equal(menu.six,6);assert(menu.active&&menu.hidden);
   assert.equal(menu.border,'0px');assert.equal(menu.brief,'rgba(0, 0, 0, 0)');
   assert(menu.overflow<=2,JSON.stringify(menu));
   await page.screenshot({path:path.join(out,viewport.name+'-01-menu.png')});
   await page.locator('#ui-upcoming-maps summary').click();
   assert(await page.locator('#map-choice-2').isVisible());
   assert(await page.locator('#map-choice-2').isDisabled());
   await page.locator('#ui-upcoming-maps summary').click();
   assert(await page.locator('#map-choice-2').isHidden());
   await page.locator('#map-choice-4').click();
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&state.raceTime>.2,
     null,{timeout:30000});
   const hud=await page.evaluate(()=>({
     density:document.body.dataset.uiHudDensity,
     panels:['ui-flight-metrics-panel','ui-resources-panel','ui-score-panel','planetary-zone-hud']
       .map(id=>getComputedStyle(document.getElementById(id)).backgroundColor),
     details:getComputedStyle(document.getElementById('race-hud-details')).display
   }));
   assert.equal(hud.density,'COMPACT');assert.equal(hud.details,'none');
   assert(hud.panels.every(v=>v==='rgba(0, 0, 0, 0)'),JSON.stringify(hud));
   assert.equal(await page.locator('#ui-first-flight')
     .evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)',
     'first-flight guidance must never become an obstructing card');
   assert.equal(await page.locator('#hunter-competition-hud')
     .evaluate(e=>getComputedStyle(e).display),'none',
     'do not show combat score before the combat phase');
   await page.screenshot({path:path.join(out,viewport.name+'-02-map4-hud.png')});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   assert.equal(await page.locator('#ui-settings-panel').evaluate(e=>e.open),false);
   assert.equal(await page.locator('.ui-pause-right').evaluate(e=>getComputedStyle(e).display),'none');
   await page.screenshot({path:path.join(out,viewport.name+'-03-pause.png')});
   await page.locator('#ui-pause-open-settings').click();
   assert.equal(await page.locator('#ui-settings-panel').evaluate(e=>e.open),true);
   assert(await page.locator('#ui-setting-hud-density').isVisible());
   await page.locator('#ui-setting-hud-density').selectOption('DETAILED');
   assert.equal(await page.evaluate(()=>document.body.dataset.uiHudDensity),'DETAILED');
   await page.locator('#ui-setting-hud-density').selectOption('COMPACT');
   await page.locator('#resume-btn').click();
   await page.waitForFunction(()=>state.running&&!state.paused,null,{timeout:12000});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   await page.locator('#ui-pause-return').click();
   assert(await page.locator('#start-screen').isVisible());
   await page.locator('#map-choice-1').click();
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1'&&state.raceTime>.2,
     null,{timeout:30000});
   assert.deepEqual(errors,[],viewport.name+' JavaScript errors');
   report.push({viewport:viewport.name,menu,hud,map4:true,map1:true,pause:true,errors});
   await page.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2));
  console.log('PASS UIUX11 '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});