// MAP2-24 — transition W05 shells form continuous architectural canyons
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2LinkTransitionCanyons'));
assert(html.includes('map2CanyonLinked'));

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
    const canyon=window.starbladeMap2ConnectedCanyons;
    const road=window.starbladeMap2BuildingRoad;
    const physical=window.starbladeMap2BuildingColliders||[];
    const rows=road.groups.filter(g=>g.open).sort((a,b)=>a.d-b.d);
    const links=[];
    for(let i=0;i<rows.length-1;i++){
      const a=rows[i],b=rows[i+1];
      if(map2Segment(a.d).kind!=='TECH'||map2Segment(b.d).kind!=='TECH'||b.d-a.d>2500)continue;
      links.push({
        dd:b.d-a.d,
        lateral:Math.abs(b.x-a.x),
        vertical:Math.abs(b.y-a.y),
        euclid:Math.hypot(b.x-a.x,b.y-a.y),
        aTransition:!!a.transition,bTransition:!!b.transition
      });
    }
    const vals=k=>links.map(x=>x[k]).sort((a,b)=>a-b);
    const pct=(arr,p)=>arr[Math.min(arr.length-1,Math.floor((arr.length-1)*p))]||0;
    const rootRows=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2CanyonLinked&&o.name?.includes('_HANDOFF_'))rootRows.push({
        name:o.name,d:o.userData.map2TargetDistance,
        prev:o.userData.map2CanyonPrevDistance,next:o.userData.map2CanyonNextDistance,
        exact:!!o.userData.map2ExactMap4Clone,
        seg:map2Segment(o.userData.map2TargetDistance).kind
      });
    });
    const blocked=rows.filter(g=>{
      const a={routeProgress:g.d-110,laneX:g.x,laneY:g.y};
      const b={...a,routeProgress:g.d+110};
      return physical.some(o=>courseSegmentTouch(o,a,b,12.5));
    });
    const macro=rows.filter(g=>!g.transition);
    const macroSigns=[];
    for(let i=1;i<macro.length;i++){
      const dx=macro[i].x-macro[i-1].x;
      if(Math.abs(dx)>=35)macroSigns.push(Math.sign(dx));
    }
    let signChanges=0;
    for(let i=1;i<macroSigns.length;i++)if(macroSigns[i]!==macroSigns[i-1])signChanges++;
    return {
      canyon,
      links:links.length,
      lateral:{avg:links.reduce((n,x)=>n+x.lateral,0)/links.length,p50:pct(vals('lateral'),.5),p75:pct(vals('lateral'),.75),p90:pct(vals('lateral'),.9),max:Math.max(...vals('lateral'))},
      vertical:{avg:links.reduce((n,x)=>n+x.vertical,0)/links.length,p90:pct(vals('vertical'),.9),max:Math.max(...vals('vertical'))},
      close:links.filter(x=>x.lateral<=70&&x.vertical<=55).length,
      veryClose:links.filter(x=>x.lateral<=45&&x.vertical<=40).length,
      loose:links.filter(x=>x.lateral>70||x.vertical>55).length,
      rootRows:rootRows.length,allExact:rootRows.every(r=>r.exact),allTech:rootRows.every(r=>r.seg==='TECH'),
      groups:rows.length,framed:rows.filter(g=>g.framed).length,
      blocked:blocked.length,physical:physical.length,fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      macroSignChanges:signChanges,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });

  console.log('MAP2-24 CONNECTED_CANYONS '+JSON.stringify(info));

  assert(info.canyon,'canyon metadata must exist');
  assert.equal(info.canyon.linked,58,'all real W05 handoff buildings should link neighbouring core complexes');
  assert(info.canyon.shifted>=45,'most handoff shells should physically move onto the shared corridor spine');
  assert(info.canyon.maxJumpAfter<info.canyon.maxJumpBefore,'predicted micro-handoff discontinuity must improve');
  assert(info.canyon.maxJumpAfter<=100,'shared corridor midpoint should cap predicted handoff discontinuity near 100 or lower');
  assert.equal(info.rootRows,58,'all 58 W05 handoff roots should carry canyon-link metadata');
  assert(info.allExact,'canyon links must use exact copied Map4 W05 shells only');
  assert(info.allTech,'canyon-linked shells stay inside TECH');

  assert.equal(info.groups,118,'all 118 real building route groups remain');
  assert(info.close>=110,'at least 110/116 adjacent building links should now be tightly continuous');
  assert(info.veryClose>=78,'most links should read as a single narrow architectural corridor');
  assert(info.lateral.p90<=58,'90th percentile lateral handoff should be well below the old ~70 baseline');
  assert(info.lateral.max<=86,'worst actual lateral handoff must stay materially below the old ~97 baseline');
  assert(info.vertical.max<=50,'vertical continuity must stay tight');
  assert(info.loose<=6,'only a handful of deliberate macro transitions may remain loose');
  assert(info.macroSignChanges>=10,'macro authored left/right sequence character must survive micro smoothing');

  assert(info.framed>=110,'real building framing must remain strong');
  assert.equal(info.blocked,0,'canyon linking may not close its own route apertures');
  assert(info.physical>=150,'real building physics remains dense');
  assert.equal(info.fastPhysical,0,'FAST remains open');
  assert.equal(info.stats?.canyonLinkedTransitions,58);
  assert.equal(info.stats?.canyonShiftedTransitions,info.canyon.shifted);
  assert(Math.abs(info.stats?.canyonMaxLaneShift-info.canyon.maxShift)<1e-6);

  const evidence=path.join(__dirname,'map2-24-evidence');fs.mkdirSync(evidence,{recursive:true});
  const target=info.canyon.links.slice().sort((a,b)=>b.shift-a.shift)[0];
  await page.evaluate(d=>{
    const road=window.starbladeMap2BuildingRoad;
    const k=road.knots.reduce((best,x)=>Math.abs(x.distance-d)<Math.abs(best.distance-d)?x:best,road.knots[0]);
    state.routeProgress=Math.max(0,d-650);state.laneX=k.x;state.laneY=k.y;state.paused=true;
    map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  },target.distance);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-connected-building-canyon.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-24 connected real-building architectural canyons');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
