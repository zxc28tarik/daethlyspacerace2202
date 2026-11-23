'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const out=path.join(__dirname,'uiux14-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
try{
for(const vp of [{name:'desktop',width:1366,height:768},{name:'mobile',width:390,height:844}]){
 const page=await browser.newPage({viewport:{width:vp.width,height:vp.height}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
 await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
 await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>typeof startGame==='function'&&typeof uiShowRacePodium==='function',null,{timeout:30000});
 await page.locator('#start-btn').click();
 await page.waitForFunction(()=>state.running&&state.activeMap==='map1',null,{timeout:30000});
 await page.evaluate(()=>{
   state.finished=true;state.playerDNF=false;state.finishTime=94;
   racers.forEach((r,i)=>{r.finished=i<2;r.dnf=false;r.finishTime=i===0?96:i===1?91:null});
   endGame(true);
 });
 assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-podium-phase'),'intro');
 const order=await page.locator('#ui-podium-places .ui-podium-place').evaluateAll(els=>els.map(el=>({
    rank:Number(el.dataset.rank),name:el.querySelector('.ui-podium-name').textContent,
    img:el.querySelector('img').getAttribute('src').slice(0,24)
 })));
 assert.deepEqual(order.map(x=>x.rank),[2,1,3]);
 assert.deepEqual(order.map(x=>x.name),['SEN','NOVA-X','VIPER-01']);
 assert(order.every(x=>x.img.startsWith('data:image/')),'ships must display');
 assert.equal(await page.locator('#race-standings-list > div').count(),6);
 assert.equal(await page.locator('#ui-results-reveal-wrap').getAttribute('aria-hidden'),'true');
 await page.screenshot({path:path.join(out,vp.name+'-map1-podium.png')});
 await page.waitForFunction(()=>document.getElementById('gameover-screen').dataset.uiPodiumPhase==='reveal',null,{timeout:6500});
 await page.waitForTimeout(1800);
 assert.equal(await page.locator('#ui-results-reveal-wrap').getAttribute('aria-hidden'),null);
 const dims=await page.evaluate(()=>{
   const shell=document.querySelector('#gameover-screen .ui-results-shell');
   const region=document.getElementById('ui-results-reveal-wrap');
   return {overflow:shell.scrollWidth-shell.clientWidth,opacity:getComputedStyle(region).opacity};
 });
 assert(dims.overflow<=2,'result overflow '+JSON.stringify(dims));
 assert(Number(dims.opacity)>.95,'standings should be visible '+JSON.stringify(dims));
 await page.screenshot({path:path.join(out,vp.name+'-map1-expanded.png')});
 await page.locator('#menu-btn').click();
 assert.equal(await page.locator('#ui-podium-places .ui-podium-place').count(),0);
 assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-podium-phase'),null);
 await page.locator('#map-choice-4').click();
 await page.locator('#start-btn').click();
 await page.waitForFunction(()=>state.running&&state.activeMap==='map4',null,{timeout:30000});
 await page.evaluate(()=>{
   state.finished=true;state.playerDNF=false;state.finishTime=145;
   state.hunterScore=15;state.hunterKills=7;state.hunterShots=10;state.hunterHits=8;
   racers.forEach((r,i)=>{
      r.finished=i<2;r.dnf=false;r.finishTime=i===0?150:i===1?160:null;
      r.hunterScore=i===0?20:i===1?10:0;r.hunterKills=i===0?9:i===1?4:0;
   });
   endGame(true);
 });
 const map4=await page.locator('#ui-podium-places .ui-podium-place').evaluateAll(els=>els.map(el=>({
   rank:Number(el.dataset.rank),name:el.querySelector('.ui-podium-name').textContent,
   metric:el.querySelector('.ui-podium-meta').textContent
 })));
 assert.deepEqual(map4.map(x=>x.name),['SEN','VIPER-01','NOVA-X']);
 assert(map4.every(x=>x.metric.includes('PUAN')),'Map4 hunter score podium');
 await page.screenshot({path:path.join(out,vp.name+'-map4-podium.png')});
 await page.locator('#restart-btn').click();
 await page.waitForFunction(()=>state.running&&state.activeMap==='map4',null,{timeout:30000});
 assert.equal(await page.locator('#ui-podium-places .ui-podium-place').count(),0);
 assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-podium-phase'),null);
 assert.deepEqual(errors,[],vp.name+' page errors');
 console.log('PASS '+vp.name+' '+JSON.stringify({order,map4,dims}));
 await page.close();
}
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1});
