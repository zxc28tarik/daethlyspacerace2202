'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){if(m[1].trim())new vm.Script(m[1]);}
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
assert(await page.locator('#map-choice-4').isDisabled());
assert(await page.locator('#ui-side-map4').isDisabled());
const original=await page.evaluate(()=>({map:state.activeMap,length:RACE_ROUTE_NOMINAL_DISTANCE,asteroids:asteroids.length,solids:staticObstacles.length,items:itemBoxes.length,arc:raceRouteCurve.getLength(),map4Built:planetaryWorldRegions.length}));
assert.equal(original.map,'map1');assert.equal(original.length,50000);
await page.evaluate(()=>selectMap('map4'));
assert.equal(await page.evaluate(()=>state.activeMap),'map1');
await page.locator('#map-choice-2').click();
const layout=await page.evaluate(()=>{
  const result=window.starbladeMap2Layout;
  const fast=MAP2_SEGMENTS.filter(s=>s.kind==='FAST');
  const allClear=map2Gates.every(g=>{
    const a={routeProgress:g.distance-220,laneX:g.laneX,laneY:g.laneY};
    const b={...a,routeProgress:g.distance+220};
    return !map2Obstacles.some(o=>courseSegmentTouch(o,a,b,12.5));
  });
  const solidHit=map2Gates.every(g=>{
    const o=map2Obstacles.find(o=>o.routeProgress===g.distance);
    return courseSegmentTouch(o,{routeProgress:g.distance-240,laneX:o.laneX,laneY:o.laneY},
      {routeProgress:g.distance+240,laneX:o.laneX,laneY:o.laneY},12.5);
  });
  return {...result,allClear,solidHit,fastClear:!map2Obstacles.some(o=>fast.some(s=>o.routeProgress-o.halfDepth<s.to*MAP2_DISTANCE&&o.routeProgress+o.halfDepth>s.from*MAP2_DISTANCE)),
    map4Built:planetaryWorldRegions.length,sceneVisible:map2CourseGroup.visible};
});
assert.equal(layout.distance,175000);assert(Math.abs(layout.actualArc/layout.map1Arc-3.5)<.001);
assert(layout.closure<.01);assert(layout.structures>200);assert(layout.gates>50);
assert(layout.allClear,'every opening should pass a pilot-sized sphere');
assert(layout.solidHit,'solid factory panels should collide');assert(layout.fastClear);
assert.equal(layout.map4Built,original.map4Built);assert(layout.sceneVisible);
assert.deepEqual(layout.segments.filter(s=>s.kind==='FAST').map(s=>Math.round((s.to-s.from)*100)),[15,10]);
await page.locator('#map-choice-1').click();
const restored=await page.evaluate(()=>({map:state.activeMap,length:RACE_ROUTE_NOMINAL_DISTANCE,asteroids:asteroids.length,solids:staticObstacles.length,items:itemBoxes.length,arc:raceRouteCurve.getLength(),map4Built:planetaryWorldRegions.length}));
assert.deepEqual(restored,original);
await page.locator('#map-choice-2').click();
await page.locator('#start-btn').click();
await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
assert.equal(await page.evaluate(()=>racers.length),5);
assert.equal(await page.evaluate(()=>tryFirePlayerLasers()),false);
const evidence=path.join(__dirname,'map2-01-evidence');fs.mkdirSync(evidence,{recursive:true});
await page.screenshot({path:path.join(evidence,'map2-start.png')});
assert.deepEqual(errors,[]);
console.log('PASS MAP2 layout/selection/launch smoke',JSON.stringify(layout));
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
