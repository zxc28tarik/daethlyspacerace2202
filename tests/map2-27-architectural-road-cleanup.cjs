// MAP2-27: architecture replaces the old central road, without deleting safety gates.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  assert(await page.locator('#map-choice-4').isDisabled(),'Map4 remains locked');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  const info=await page.evaluate(()=>{
   const cleanup=window.starbladeMap2LegacyRoadCleanup;
   const route=window.starbladeMap2ThroughRoute;
   const chains=window.starbladeMap2LongBuildingChains;
   const sections=new Set(map2Sections);
   const names=new Set(),rails=[],decks=[],uncovered=[];
   const ownerOf=o=>{while(o&&!sections.has(o))o=o.parent;return o;};
   const spans=(g,d)=>g&&(g.userData.architectureFrom??g.userData.from)<=d&&(g.userData.architectureTo??g.userData.to)>=d;
   const moduleRoots=new Map();
   map2CourseGroup.traverse(o=>{
    names.add(o.name);
    if(o.userData?.map2OpenSectorGuide)rails.push(o.userData);
    if(o.name.startsWith('MAP2_VISUAL_DECK_'))decks.push(o.userData.map2Distance);
    if(o.userData?.map2ThroughBuildingModule&&Number.isFinite(o.userData.map2ThroughEntrance)&&Number.isFinite(o.userData.map2ThroughExit)){
     const g=ownerOf(o);
     moduleRoots.set(o.name,o.userData.map2ThroughBuildingModule);
     if(!spans(g,o.userData.map2ThroughEntrance)||!spans(g,o.userData.map2ThroughExit))uncovered.push(o.name);
    }
   });
   const wrongRails=rails.filter(r=>MAP2_SEGMENTS.some(s=>s.kind==='TECH'&&Math.min(r.to,s.to*MAP2_DISTANCE)-Math.max(r.from,s.from*MAP2_DISTANCE)>1e-4));
   const physical=map2Obstacles.filter(o=>o.map2BuildingDerived);
   const colliderUncovered=physical.filter(o=>!spans(ownerOf(o.mesh),o.routeProgress-(o.halfDepth||0))||!spans(ownerOf(o.mesh),o.routeProgress+(o.halfDepth||0)));
   return {cleanup:{...cleanup,retired:undefined},stillPresent:cleanup.retired.filter(r=>names.has(r.name)),
    allTech:cleanup.retired.every(r=>map2Segment(r.d).kind==='TECH'),
    techDecks:decks.filter(d=>map2Segment(d).kind==='TECH'),openDecks:decks.length,
    rails:rails.length,wrongRails,uncovered,colliderUncovered:colliderUncovered.length,
    missingModuleRoots:route.modules.filter(m=>!m.rootNames.some(n=>moduleRoots.get(n)===m.id)).map(m=>m.id),
    moduleCount:route.modules.length,coverage:chains.coveragePct,physical:physical.length,
    fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
    gates:map2Gates.length,openings:map2Gates.reduce((n,g)=>n+g.openings.length,0),
    map4Hidden:!planetaryWorldGroup.visible,stats:window.starbladeMap2Layout.visualStage};
  });
  console.log('MAP2-27 '+JSON.stringify(info));
  assert(info.cleanup.deck>100,'continuous TECH platform must actually be removed');
  assert(info.cleanup.tunnel>50,'duplicate generic tunnel architecture must actually be removed');
  assert(info.cleanup.secondary>0);
  assert.equal(info.cleanup.total,info.cleanup.deck+info.cleanup.tunnel+info.cleanup.secondary);
  assert.equal(info.stats.retiredLegacyRoadVisuals,info.cleanup.total);
  assert(info.allTech);assert.deepEqual(info.stillPresent,[]);
  assert.deepEqual(info.techDecks,[]);assert(info.openDecks>0);
  assert(info.rails>0);assert.deepEqual(info.wrongRails,[]);
  assert.deepEqual(info.uncovered,[]);assert.equal(info.colliderUncovered,0);
  assert.deepEqual(info.missingModuleRoots,[]);
  assert(info.moduleCount>=135);assert(info.coverage>=62);assert(info.physical>=150);
  assert.equal(info.fastPhysical,0);assert.equal(info.gates,68);assert.equal(info.openings,85);
  assert(info.map4Hidden);
  const evidence=path.join(__dirname,'map2-27-evidence');fs.mkdirSync(evidence,{recursive:true});
  for(let i=0;i<3;i++){
   await page.evaluate(i=>{
    const c=window.starbladeMap2LongBuildingChains.longest;
    const d=c.from+c.span*[.15,.5,.85][i];
    const q=starbladeMap2BuildingPassageAt(d);
    state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
    map2UpdateVisibility(d);
    scene.updateMatrixWorld(true);
   },i);
   await page.waitForTimeout(250);
   await page.screenshot({path:path.join(evidence,'chain-'+i+'.png')});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-27 architectural road cleanup');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
