// MAP2-14 dense Map4 road-building placement QA
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)) if(m[1].trim()) new vm.Script(m[1]);
assert(html.includes('d+=3600'),'dense 3.6 km Map4 cadence must remain present');
assert(html.includes('map2TargetDistance'),'exact Map4 clones must expose placement metadata');

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof buildPlanetaryWorld==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const roots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_')) roots.push(o);
    });
    const placed=roots.map(o=>({
      source:o.userData.sourceMap4Station,
      d:o.userData.map2TargetDistance,
      side:o.userData.map2TargetSide,
      up:o.userData.map2TargetUp,
      seg:map2Segment(o.userData.map2TargetDistance).kind
    })).filter(x=>Number.isFinite(x.d));
    return {
      roots:placed.length,
      centre:placed.filter(x=>Math.abs(x.side)<=1).length,
      nearRoad:placed.filter(x=>Math.abs(x.side)<=160).length,
      flank:placed.filter(x=>Math.abs(x.side)>=300&&Math.abs(x.side)<=420).length,
      fast:placed.filter(x=>x.seg==='FAST').length,
      minD:Math.min(...placed.map(x=>x.d)),
      maxD:Math.max(...placed.map(x=>x.d)),
      sources:[...new Set(placed.map(x=>x.source))].sort(),
      visualStats:window.starbladeMap2Layout?.visualStage||null,
      map4Visible:planetaryWorldGroup.visible
    };
  });
  console.log('MAP2-14 DENSITY '+JSON.stringify(info));
  assert(info.roots>=28,'Map2 needs many genuine Map4 station roots, not a handful');
  assert(info.centre>=14,'substantial Map4 architecture must sit directly on the road centreline');
  assert(info.nearRoad>=22,'most Map4 buildings must overlap the road envelope');
  assert(info.flank>=4,'some Map4 stations should form side walls/clusters');
  assert.equal(info.fast,0,'full-throttle FAST zones must remain free of exact station placements');
  assert(info.minD<=8500,'opening Map4 station must remain ahead of the player');
  assert(info.maxD>130000,'Map4 architecture must continue deep into the long Map2 route');
  assert.equal(info.sources.length,6,'all six final Map4 W05 station groups should be reused');
  assert.equal(info.map4Visible,false,'authoritative Map4 source world stays hidden in Map2');

  const evidence=path.join(__dirname,'map2-14-evidence');fs.mkdirSync(evidence,{recursive:true});
  await page.evaluate(()=>{state.routeProgress=7750;state.laneX=0;state.laneY=80;state.paused=true;map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);});
  await page.waitForTimeout(300);
  await page.screenshot({path:path.join(evidence,'00-opening-dense-map4-road.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-14 dense Map4 road-building placement');
 } finally { await browser.close(); }
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
