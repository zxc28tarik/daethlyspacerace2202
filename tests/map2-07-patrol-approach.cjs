'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
try{
const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
const page=await browser.newPage({viewport:{width:1280,height:720}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForFunction(()=>typeof map2PatrolTick==='function'&&typeof map2PatrolWarning==='function'&&typeof selectMap==='function');
assert(await page.locator('#map-choice-4').isDisabled());
await page.locator('#map-choice-2').click();
await page.locator('#start-btn').click();
await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
const report=await page.evaluate(()=>{
  state.paused=true;
  const step=(n,dt=.05)=>{for(let i=0;i<n;i++)map2PatrolTick(dt);};
  state.routeProgress=40000;state.laneX=35;state.laneY=180;state.shield=100;
  state.powerShieldTimer=0;state.barrelRollTimer=0;map2PatrolReset();step(8);
  const low={warning:map2PatrolWarning(),shield:state.shield,visible:map2PatrolVisual.ship?.visible===true,
    approach:map2PatrolVisual.approach,shots:state.map2Patrol.shots};
  state.laneY=250;step(4);
  const early={warning:map2PatrolWarning(),shield:state.shield,phase:window.starbladeMap2Patrol.phase,
    approach:map2PatrolVisual.approach,shots:state.map2Patrol.shots};
  step(7);
  const locked={warning:map2PatrolWarning(),shield:state.shield,phase:window.starbladeMap2Patrol.phase,
    approach:map2PatrolVisual.approach,shots:state.map2Patrol.shots};
  step(6);
  const fired={warning:map2PatrolWarning(),shield:state.shield,phase:window.starbladeMap2Patrol.phase,
    beam:map2PatrolVisual.beam.visible,breakaway:map2PatrolVisual.breakaway,shots:state.map2Patrol.shots};
  state.laneY=190;step(30);
  const recovered={warning:map2PatrolWarning(),shield:state.shield,phase:window.starbladeMap2Patrol.phase,
    lock:state.map2Patrol.lock,shots:state.map2Patrol.shots,approach:map2PatrolVisual.approach};
  state.routeProgress=20000;state.laneY=300;step(8);
  const fast={warning:map2PatrolWarning(),visible:map2PatrolVisual.ship.visible,lock:state.map2Patrol.lock};
  return {cfg:{ceiling:MAP2_PATROL.ceiling,lockSeconds:MAP2_PATROL.lockSeconds,approachSeconds:MAP2_PATROL.approachSeconds,
      shotInterval:MAP2_PATROL.shotInterval,damage:MAP2_PATROL.damage},
    low,early,locked,fired,recovered,fast,map4Models:planetaryWorldRegions.length};
});
assert.deepEqual(report.cfg,{ceiling:220,lockSeconds:.85,approachSeconds:.42,shotInterval:.7,damage:12});
assert.equal(report.low.warning,null);assert.equal(report.low.shield,100);assert(report.low.visible);assert.equal(report.low.shots,0);
assert(report.early.warning?.title.includes('YAKLAŞIYOR'));assert.equal(report.early.phase,'approach');assert.equal(report.early.shield,100);assert.equal(report.early.shots,0);
assert(report.locked.warning?.title.includes('KİLİDİ'));assert.equal(report.locked.phase,'lock');assert.equal(report.locked.shield,100);assert.equal(report.locked.shots,0);
assert(report.locked.approach>report.early.approach,'patrol must visibly close during lock');
assert(report.fired.warning?.title.includes('ATEŞİ'));assert.equal(report.fired.phase,'attack');assert.equal(report.fired.shield,88);
assert.equal(report.fired.shots,1);assert(report.fired.beam);assert(report.fired.breakaway>0);
assert.equal(report.recovered.warning,null);assert.equal(report.recovered.shield,88);assert.equal(report.recovered.phase,'patrol');assert.equal(report.recovered.lock,0);
assert.equal(report.recovered.shots,1);assert(report.recovered.approach<report.locked.approach);
assert.equal(report.fast.warning,null);assert.equal(report.fast.visible,false);assert.equal(report.fast.lock,0);
assert.deepEqual(errors,[]);
const evidence=path.join(__dirname,'map2-07-evidence');fs.mkdirSync(evidence,{recursive:true});
await page.screenshot({path:path.join(evidence,'map2-patrol-approach.png')});
console.log('PASS MAP2-07 readable patrol approach/lock/fire/breakaway without gameplay rebalance',JSON.stringify(report));
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
