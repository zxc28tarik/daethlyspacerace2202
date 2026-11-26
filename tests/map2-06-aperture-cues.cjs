'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
(async()=>{
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
try {
const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
const page=await browser.newPage({viewport:{width:1280,height:720}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
await page.waitForFunction(()=>typeof map2PlayerApertureCue==='function'&&typeof selectMap==='function');
const original=await page.evaluate(()=>({
  map:state.activeMap,distance:RACE_ROUTE_NOMINAL_DISTANCE,
  staticSolids:staticObstacles.length,map4Models:planetaryWorldRegions.length
}));
assert.equal(original.map,'map1');
assert(await page.locator('#map-choice-4').isDisabled());
await page.locator('#map-choice-2').click();
const report=await page.evaluate(()=>{
  const guides=[];
  map2CourseGroup.traverse(o=>{if(o.name==='MAP2_APERTURE_CORNERS')guides.push(o);});
  const allGuidesPhysical=guides.every(o=>
    o.isLineSegments&&o.geometry.getAttribute('position').count===16&&
    o.userData.visualOnly&&o.userData.nonColliding&&o.material.depthTest&&
    !o.material.depthWrite);
  const guidesCorrectlyPlaced=map2Gates.every(g=>g.openings.every((p,i)=>{
    const cue=guides.find(o=>o.userData.routeProgress===g.distance&&o.userData.openingIndex===i);
    if(!cue)return false;
    const f=getRaceFrameAtDistance(g.distance-g.depth/2-6);
    const expected=f.center.clone().addScaledVector(f.right,p.x).addScaledVector(f.up,p.y);
    return cue.parent.position.distanceTo(expected)<1e-6;
  }));
  const noNewColliders=map2Obstacles.every(o=>!String(o.mesh?.name||'').includes('APERTURE'));
  const first=map2Gates[0],p=first.openings[0],progress=first.distance-first.depth/2-900;
  const aligned=map2PlayerApertureCue(first,progress,p.x,p.y);
  const left=map2PlayerApertureCue(first,progress,p.x+220,p.y);
  const right=map2PlayerApertureCue(first,progress,p.x-220,p.y);
  const down=map2PlayerApertureCue(first,progress,p.x,p.y+220);
  const up=map2PlayerApertureCue(first,progress,p.x,p.y-220);
  const dual=map2Gates.find(g=>g.kind==='DUAL_FACTORY');
  const dualL=map2PlayerApertureCue(dual,dual.distance-1200,dual.openings[0].x,dual.openings[0].y);
  const dualR=map2PlayerApertureCue(dual,dual.distance-1200,dual.openings[1].x,dual.openings[1].y);
  const allSafe=map2Gates.every(g=>g.openings.every(o=>{
    const cue=map2PlayerApertureCue(g,g.distance-900,o.x,o.y);
    return cue.aligned;
  }));
  const allDirections=map2Gates.every(g=>g.openings.every(o=>{
    const c=map2PlayerApertureCue(g,g.distance-900,o.x+350,o.y+350);
    return c.detail.includes('SOLA')&&c.detail.includes('ALÇAL');
  }));
  return {count:guides.length,expected:window.starbladeMap2Layout.openings,
    guideCount:window.starbladeMap2Layout.apertureGuides,allGuidesPhysical,
    guidesCorrectlyPlaced,noNewColliders,aligned,left,right,down,up,dualL,dualR,
    allSafe,allDirections,map4Models:planetaryWorldRegions.length};
});
assert.equal(report.count,report.expected);
assert.equal(report.guideCount,report.expected);
assert(report.allGuidesPhysical&&report.guidesCorrectlyPlaced&&report.noNewColliders);
assert(report.aligned.aligned&&report.aligned.detail.includes('HATTI KORU'));
assert(report.left.detail.includes('SOLA')&&report.right.detail.includes('SAĞA'));
assert(report.down.detail.includes('ALÇAL')&&report.up.detail.includes('YÜKSEL'));
assert.equal(report.dualL.openingIndex,0);assert.equal(report.dualR.openingIndex,1);
assert(report.allSafe&&report.allDirections);
assert.equal(report.map4Models,original.map4Models);
await page.locator('#start-btn').click();
await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
const live=await page.evaluate(()=>{
  state.paused=true;
  const first=map2Gates[0],p=first.openings[0];
  state.routeProgress=first.distance-first.depth/2-550;
  state.laneX=p.x+230;state.laneY=p.y;
  state.hudWarningTick=-1;state.raceTime+=.25;
  const warning=updateRaceHudWarning();
  const patrol=map2PatrolWarning();
  return {warning,patrol,activeMap:state.activeMap};
});
assert(live.warning&&live.warning.detail.includes('SOLA'));
assert.equal(live.patrol,null);assert.equal(live.activeMap,'map2');
await page.locator('#map-choice-1').click().catch(()=>{});
const map1After=await page.evaluate(()=>({distance:RACE_ROUTE_NOMINAL_DISTANCE,map4Models:planetaryWorldRegions.length}));
assert.equal(map1After.map4Models,original.map4Models);
assert.deepEqual(errors,[]);
const evidence=path.join(__dirname,'map2-06-evidence');fs.mkdirSync(evidence,{recursive:true});
await page.screenshot({path:path.join(evidence,'map2-cues.png')});
console.log('PASS MAP2-06 physical aperture corner cues, safe directional HUD and MAP4 lock',JSON.stringify({
  markers:report.count,dualChoices:[report.dualL.openingIndex,report.dualR.openingIndex],live:live.warning
}));
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
