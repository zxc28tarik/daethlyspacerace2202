// MAP2-28 — long architectural chicane chains made from real Map4 buildings
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2AuthorArchitecturalChicaneChains'));
assert(html.includes('REAL_MAP4_BUILDINGS_FORM_LONG_CHICANES'));

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
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const s=window.starbladeMap2ArchitecturalChicanes;
    const route=window.starbladeMap2ThroughRoute;
    const physical=window.starbladeMap2BuildingColliders||[];
    const tagged=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ArchitecturalChicane)tagged.push({
        name:o.name,d:o.userData.map2TargetDistance,
        x:o.userData.map2ArchitecturalChicaneShiftX,
        y:o.userData.map2ArchitecturalChicaneShiftY
      });
    });
    let maxJumpX=0,maxJumpY=0,maxGap=0;
    const a=(route?.routeAnchors||[]).slice().sort((u,v)=>u.distance-v.distance);
    for(let i=1;i<a.length;i++){
      if(map2Segment((a[i-1].distance+a[i].distance)/2).kind!=='TECH')continue;
      const gap=a[i].distance-a[i-1].distance;
      if(gap>950)continue;
      maxGap=Math.max(maxGap,gap);
      maxJumpX=Math.max(maxJumpX,Math.abs(a[i].x-a[i-1].x));
      maxJumpY=Math.max(maxJumpY,Math.abs(a[i].y-a[i-1].y));
    }
    const blocked=[];
    for(const m of route.modules.filter(m=>m.chicane)){
      let prev=null,hit=false;
      for(let d=m.entrance.distance;d<=m.exit.distance+1;d+=70){
        const q=starbladeMap2BuildingPassageAt(Math.min(d,m.exit.distance));
        const now={routeProgress:Math.min(d,m.exit.distance),laneX:q.x,laneY:q.y};
        if(prev&&physical.some(o=>courseSegmentTouch(o,prev,now,12.5))){hit=true;break;}
        prev=now;
      }
      if(hit)blocked.push(m.id);
    }
    return {
      s,
      tagged:tagged.length,
      taggedFast:tagged.filter(x=>Number.isFinite(x.d)&&map2Segment(x.d).kind==='FAST').length,
      routeModules:route?.modules?.length,
      anchors:route?.routeAnchors?.length,
      maxJumpX,maxJumpY,maxGap,
      blocked,
      physical:physical.length,
      fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      gates:map2Gates.length,
      map4Hidden:!planetaryWorldGroup.visible,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });

  console.log('MAP2-28 ARCHITECTURAL_CHICANES '+JSON.stringify(info));
  const s=info.s;
  assert(s,'MAP2-28 chicane summary must be published');
  assert.equal(s.philosophy,'REAL_MAP4_BUILDINGS_FORM_LONG_CHICANES');
  assert(s.activeChains>=3,'several long real-building chains must become authored chicanes');
  assert(s.movedModules>=30,'a substantial set of real building modules must be repositioned');
  assert(s.movedRoots>=30,'whole real Map4 building roots must move with the route');
  assert(s.maxLateralShift>=80&&s.maxLateralShift<=160.001,'lateral architectural movement must be strong but bounded');
  assert(s.maxVerticalShift>=30&&s.maxVerticalShift<=78.001,'vertical movement must add low/high rhythm but remain bounded');
  assert(s.leftModules>=8&&s.rightModules>=8,'the road must use both sides of the architectural corridor');
  assert(s.directionChanges>=5,'long chains must contain repeated left/right building-defined changes');
  assert(s.longestMovedSpan>=7000,'at least one authored chicane sequence must extend for kilometres');
  assert(info.tagged>=s.movedRoots,'moved roots must be tagged in the scene graph');
  assert.equal(info.taggedFast,0,'FAST sectors may not receive chicane buildings');
  assert(info.maxJumpX<=330,'real-aperture anchor handoffs must remain flyable laterally');
  assert(info.maxJumpY<=190,'real-aperture anchor handoffs must remain flyable vertically');
  assert.equal(info.blocked.length,0,'shifted buildings may not close their own route tube');
  assert(info.physical>=180,'real Map4 building physics must remain substantial');
  assert.equal(info.fastPhysical,0,'FAST remains free from building collision');
  assert.equal(info.gates,68,'all authored hard-safety gates remain');
  assert(info.routeModules>=168&&info.anchors>=736,'MAP2-26 route density must survive');
  assert(info.map4Hidden,'Map4 source scene must stay hidden');
  assert.equal(info.stats?.architecturalChicaneModules,s.movedModules);
  assert.equal(info.stats?.architecturalChicaneRoots,s.movedRoots);
  assert.equal(info.stats?.architecturalChicaneDirectionChanges,s.directionChanges);

  const fleet=await page.evaluate(()=>{
    state.paused=true;state.finished=true;state.finishTime=0;state.maxPostFinishWait=1000;
    racers.forEach((r,i)=>{
      const angle=i*2*Math.PI/5;
      r.routeProgress=0;r.laneX=Math.cos(angle)*105;r.laneY=Math.sin(angle)*105;
      r.vx=0;r.vy=0;r.targetX=r.laneX;r.targetY=r.laneY;
      r.map2GateChoice=null;positionRacerOnRoute(r);
    });
    let frames=0;
    for(;frames<13000&&state.running&&!racers.every(r=>r.finished||r.dnf);frames++)updateGame(1/30);
    return {frames,gates:map2Gates.length,rivals:racers.map(r=>({
      name:r.name,finished:r.finished,dnf:r.dnf,progress:r.routeProgress,stats:{...r.aiStats}
    }))};
  });
  console.log('MAP2-28 FLEET '+JSON.stringify(fleet));
  assert.equal(fleet.rivals.filter(x=>x.finished).length,5,'all five rivals should finish the building-defined chicanes');
  assert(fleet.rivals.every(x=>x.stats.map2GateExits===fleet.gates),'68/68 hard-safety gates still work');
  assert(fleet.rivals.every(x=>(x.stats.obstacleHits||0)===0),'architectural chicanes may not cause generic obstacle strikes');
  assert(fleet.rivals.every(x=>(x.stats.map2BuildingRouteSeconds||0)>55),'AI must keep using the real building route');

  const evidence=path.join(__dirname,'map2-28-evidence');fs.mkdirSync(evidence,{recursive:true});
  await page.evaluate(()=>{
    const s=window.starbladeMap2ArchitecturalChicanes;
    const pick=s.moved[Math.floor(s.moved.length*.52)]||s.moved[0];
    const d=Math.max(0,(pick?.d||60000)-350);
    state.routeProgress=d;
    const q=starbladeMap2BuildingPassageAt(d);
    state.laneX=q.x;state.laneY=q.y;state.paused=true;
    map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  });
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-long-building-chicane.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-28 real Map4 buildings form long architectural chicanes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
