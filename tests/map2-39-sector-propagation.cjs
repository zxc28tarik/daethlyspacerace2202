// MAP2-39 — full TECH sector propagation
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2-30/31: systematic building blocks and real gap classification'));

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const full=window.starbladeMap2FullGapSystem;
    if(!full)throw Error('MAP2-39 full system missing');
    const golden=window.starbladeMap2GapBlockSystem;
    const play=window.starbladeMap2PlayablePassages;
    const physical=window.starbladeMap2BuildingColliders||[];
    const ids=[...golden.blocks,...full.extraBlocks].map(b=>b.id);
    const bad=[],missingTargets=[];
    for(const c of [...play.complexes,...full.extraComplexes]){
      for(const p of c.passages)for(let i=1;i<p.nodes.length;i++){
        if(physical.some(o=>o.active!==false&&courseSegmentTouch(o,p.nodes[i-1],p.nodes[i],10.5)))bad.push(p.id);
      }
      if(full.extraComplexes.includes(c)){
        const p=c.passages[0],r={name:'test',map2GapChoices:{[c.id]:p.id}};
        const q=map2GapRouteTargetAt(r,{distance:c.focusDistance,x:0,y:0});
        if(q?.passageId!==p.id)missingTargets.push(c.id);
      }
    }
    const primary=[];
    for(const m of (window.starbladeMap2ThroughRoute?.modules||[])){
      let prev=null;
      for(let d=m.entrance.distance;d<=m.exit.distance+1;d+=70){
        const dd=Math.min(d,m.exit.distance),q=starbladeMap2BuildingPassageAt(dd);
        const now={routeProgress:dd,laneX:q.x,laneY:q.y};
        if(prev&&physical.some(o=>courseSegmentTouch(o,prev,now,12.5)))primary.push(m.id);
        prev=now;
      }
    }
    const apertures=window.starbladeMap2BuildingRoad.groups.filter(g=>g.open).filter(g=>{
      const a={routeProgress:g.d-150,laneX:g.x,laneY:g.y};
      return physical.some(o=>courseSegmentTouch(o,a,{...a,routeProgress:g.d+150},12.5));
    }).map(g=>g.d);
    const sections=new Set(map2Sections);
    const owner=o=>{while(o&&!sections.has(o))o=o.parent;return o;};
    const uncovered=physical.filter(o=>{
      const g=owner(o.mesh);if(!g)return true;
      return (g.userData.architectureFrom??g.userData.from)>o.routeProgress-(o.halfDepth||0)||
        (g.userData.architectureTo??g.userData.to)<o.routeProgress+(o.halfDepth||0);
    }).length;
    const wrong=full.sectors.filter(s=>s.groupDistances.some(d=>map2Segment(d).kind!=='TECH'));
    return {full,apertures,uncovered,uniqueIds:new Set(ids).size===ids.length,bad,primary,missingTargets,wrong,
      goldenCount:golden.blockCount,goldenComplexes:play.complexes.length,
      fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      gates:map2Gates.length,map4Hidden:!planetaryWorldGroup.visible};
  });
  console.log('MAP2-39 '+JSON.stringify(info));
  assert.equal(info.full.coveredGroups,info.full.totalEligibleGroups);
  assert(info.full.sectors.length>=2);
  assert(info.full.extraBlocks.length>=20);
  assert(info.full.extraComplexes.length>=2);
  assert(info.full.adjustments.length>=2);
  assert(info.uniqueIds);
  assert.equal(info.goldenCount,22);assert.equal(info.goldenComplexes,9);
  assert.deepEqual(info.bad,[]);assert.deepEqual(info.primary,[]);
  assert.deepEqual(info.apertures,[]);assert.equal(info.uncovered,0);
  assert.deepEqual(info.missingTargets,[]);assert.deepEqual(info.wrong,[]);
  assert.equal(info.fastPhysical,0);assert.equal(info.gates,68);assert(info.map4Hidden);
  assert(info.full.extraComplexes.every(c=>c.passages.length>=2&&
    c.passages.every(p=>p.routeCostMetrics?.length>0)));
  assert.deepEqual(errors,[]);
  const dir=path.join(__dirname,'map2-39-evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'sectors.json'),JSON.stringify(info,null,2));
  console.log('PASS MAP2-39 full TECH sector propagation');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
