'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const out=path.join(__dirname,'uiux15-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
 try{
  for(const vp of [{name:'desktop',width:1366,height:768},{name:'mobile',width:390,height:844},{name:'short',width:360,height:640}]){
   const page=await browser.newPage({viewport:{width:vp.width,height:vp.height}});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof uiShowRacePodium==='function'&&typeof startGame==='function',null,{timeout:30000});
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1');
   await page.evaluate(()=>{
     state.finished=true;state.playerDNF=false;state.finishTime=94;
     racers.forEach((r,i)=>{r.finished=i<2;r.dnf=false;r.finishTime=i===0?96:i===1?91:null});
     endGame(true);
   });
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-podium-phase'),'intro');
   assert.equal(await page.locator('#ui-results-reveal-wrap').getAttribute('inert'),'','hidden standings should not be focusable');
   assert.equal(await page.locator('#ui-podium-places .ui-podium-place').count(),3);
   assert.deepEqual(await page.locator('#ui-podium-places .ui-podium-place').evaluateAll(els=>els.map(e=>e.dataset.rank)),['2','1','3']);
   const details=page.locator('#ui-result-extra-details');
   const summary=page.locator('#race-summary-banner');
   assert.equal(await summary.evaluate(el=>el.closest('details')?.id),'ui-result-extra-details');
   assert.equal(await details.getAttribute('open'),null);
   assert.equal(await summary.isVisible(),false,'duplicate telemetry must be collapsed');
   const sizes=await page.locator('#ui-podium-places .ui-podium-craft').evaluateAll(els=>els.map(el=>el.getBoundingClientRect().height));
   assert(sizes[1]>sizes[0],'first place craft must be more prominent');
   await page.waitForTimeout(700);
   await page.screenshot({path:path.join(out,vp.name+'-intro.png')});
   await page.waitForFunction(()=>document.getElementById('gameover-screen').dataset.uiPodiumPhase==='reveal',null,{timeout:7000});
   await page.waitForFunction(()=>Number(getComputedStyle(document.getElementById('ui-results-reveal-wrap')).opacity)>.95,null,{timeout:10000});
   assert.equal(await page.locator('#ui-results-reveal-wrap').getAttribute('inert'),null);
   const layout=await page.evaluate(()=>{
      const shell=document.querySelector('#gameover-screen .ui-results-shell');
      const screen=document.getElementById('gameover-screen');
      return {shellOverflowX:shell.scrollWidth-shell.clientWidth,screenOverflowX:screen.scrollWidth-screen.clientWidth,
        shellOverflowY:getComputedStyle(shell).overflowY,viewportHeight:innerHeight};
   });
   assert(layout.shellOverflowX<=3&&layout.screenOverflowX<=3,'no horizontal overflow: '+JSON.stringify(layout));
   assert.equal(layout.shellOverflowY,'auto');
   assert.equal(await summary.isVisible(),false);
   await details.locator('summary').click();
   assert.equal(await summary.isVisible(),true,'expanded telemetry must still be available');
   await details.locator('summary').click();
   await page.screenshot({path:path.join(out,vp.name+'-results.png')});
   assert.deepEqual(errors,[],vp.name+' browser page errors');
   console.log('PASS UIUX15 '+vp.name+' '+JSON.stringify(layout));
   await page.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
