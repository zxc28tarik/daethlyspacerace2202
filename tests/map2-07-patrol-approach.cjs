'use strict';
// MAP2-07 retirement regression: no aircraft, altitude-triggered attacks or air-warning UI.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))
  if(m[1].trim())new vm.Script(m[1]);
for(const removed of ['MAP2_OVERHEAD_PATROL','map2PatrolStep','map2PatrolTick','map2PatrolWarning','map2PreparePatrolVisual','DEVRİYE ATEŞİ','hava devriyesi'])
  assert(!html.includes(removed),'patrol source still present: '+removed);
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof selectMap==='function'&&typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  const result=await page.evaluate(()=>{
    state.paused=true;
    state.routeProgress=40000;
    state.laneY=340;
    updateHUD(false);
    const notice=window.starbladeHUDTelemetry?.warning;
    return {
      playerPatrol:state.map2Patrol,
      patrolTelemetry:window.starbladeMap2Patrol,
      patrolModel:!!scene.getObjectByName('MAP2_OVERHEAD_PATROL'),
      message:notice?.title||null,
      map2ShieldMultiplier:MAP2_TEST_SHIELD_MULTIPLIER,
      racers:racers.length
    };
  });
  assert.equal(result.playerPatrol,null);
  assert.equal(result.patrolTelemetry,null);
  assert.equal(result.patrolModel,false);
  assert(!/DEVRİYE|ATEŞİ|HAVA UYARISI/.test(result.message||''));
  assert.equal(result.racers,5);
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-07 overhead patrol removal',JSON.stringify(result));
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
