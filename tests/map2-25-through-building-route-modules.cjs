// MAP2-25 — real building entrance/interior/exit route modules + rival binding
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2BuildThroughBuildingRouteModules'));
assert(html.includes('map2ThroughRouteTargetAt'));
assert(html.includes('map2BuildingRouteSeconds'));

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
    const route=window.starbladeMap2ThroughRoute;
    const road=window.starbladeMap2BuildingRoad;
    const physical=window.starbladeMap2BuildingColliders||[];
    const modules=route?.modules||[];
    const rows=road.groups.filter(g=>g.open).sort((a,b)=>a.d-b.d);
    const links=[];
    for(let i=0;i<rows.length-1;i++){
      const a=rows[i],b=rows[i+1];
      if(map2Segment(a.d).kind!=='TECH'||map2Segment(b.d).kind!=='TECH'||b.d-a.d>2500)continue;
      links.push({lateral:Math.abs(b.x-a.x),vertical:Math.abs(b.y-a.y),dd:b.d-a.d});
    }

    const blockedModules=[];
    for(const m of modules){
      let prev=null,blocked=false;
      for(let d=m.entrance.distance;d<=m.exit.distance+1;d+=70){
        const q=starbladeMap2BuildingPassageAt(Math.min(d,m.exit.distance));
        const now={routeProgress:Math.min(d,m.exit.distance),laneX:q.x,laneY:q.y};
        if(prev&&physical.some(o=>courseSegmentTouch(o,prev,now,12.5))){blocked=true;break;}
        prev=now;
      }
      if(blocked)blockedModules.push(m.id);
    }

    const roots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ThroughBuildingModule)roots.push({
        name:o.name,module:o.userData.map2ThroughBuildingModule,
        exact:!!(o.userData.map2ExactMap4Clone||o.userData.map2ExactMap4CityClone||
          o.userData.map2ExactMap4LandmarkClone||o.userData.map2ExactMap4CorridorClone||
          o.userData.map2ExactMap4IndustrialVisualPart)
      });
    });
    const roles={};
    for(const m of modules)for(const p of m.points)roles[p.role]=(roles[p.role]||0)+1;
    const kinds={};
    for(const m of modules)kinds[m.kind]=(kinds[m.kind]||0)+1;
    const sampleModule=modules.find(m=>m.depth>=700)||modules[0];
    const mid=sampleModule?(sampleModule.entrance.distance+sampleModule.exit.distance)/2:40000;
    const nav=map2ThroughRouteTargetAt(mid,0);
    return {
      philosophy:route?.philosophy,
      modules:modules.length,
      deep:modules.filter(m=>m.depth>=700).length,
      veryDeep:modules.filter(m=>m.depth>=950).length,
      moduleAnchors:route?.moduleAnchors?.length||0,
      routeAnchors:route?.routeAnchors?.length||0,
      framedAnchors:route?.moduleAnchors?.filter(a=>a.framed).length||0,
      maxDepth:modules.length?Math.max(...modules.map(m=>m.depth)):0,
      minDepth:modules.length?Math.min(...modules.map(m=>m.depth)):0,
      avgDepth:modules.length?modules.reduce((n,m)=>n+m.depth,0)/modules.length:0,
      roles,kinds,
      roots:roots.length,allExact:roots.every(r=>r.exact),
      blockedModules,
      nav,
      physical:physical.length,
      fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      links:links.length,
      loose:links.filter(x=>x.lateral>70||x.vertical>55).length,
      close:links.filter(x=>x.lateral<=70&&x.vertical<=55).length,
      lateralMax:Math.max(...links.map(x=>x.lateral)),
      stats:window.starbladeMap2Layout?.visualStage
    };
  });

  console.log('MAP2-25 THROUGH_ROUTE '+JSON.stringify(info));
  assert.equal(info.philosophy,'BUILDINGS_HAVE_ENTRANCE_INTERIOR_EXIT');
  assert(info.modules>=24,'many actual complexes must expose a real through-building module');
  assert(info.deep>=8,'several complexes must provide >=700m entrance-to-exit depth');
  assert(info.moduleAnchors>=info.modules*2,'each module needs at least entry and exit depth anchors');
  assert(info.routeAnchors>118,'route must contain more than the old one-knot-per-building model');
  assert(info.framedAnchors>=Math.floor(info.moduleAnchors*.55),'most depth anchors should be framed by real architecture');
  assert(info.maxDepth>=700);
  assert(info.roles.ENTRY===info.modules&&info.roles.EXIT===info.modules);
  assert(info.roots>=info.modules,'module metadata must live on real copied building roots');
  assert(info.allExact,'through modules may use only real copied Map4 architecture');
  assert.equal(info.blockedModules.length,0,'real building physics may not close its own through-route tube');
  assert(info.nav&&Number.isFinite(info.nav.x)&&Number.isFinite(info.nav.y)&&info.nav.inModule,'global navigation query must resolve inside a real module');
  assert(info.physical>=150);
  assert.equal(info.fastPhysical,0);
  assert(info.loose<=3,'residual building handoff looseness must not regress');
  assert(info.close>=113,'at least MAP2-24 canyon continuity must be preserved');
  assert.equal(info.stats?.throughBuildingModules,info.modules);
  assert.equal(info.stats?.throughBuildingAnchors,info.moduleAnchors);
  assert.equal(info.stats?.throughBuildingRouteKnots,info.routeAnchors);

  // Exercise the real rival update loop: building-route navigation must be used
  // for sustained TECH flight while the old 68 gates remain hard safety.
  const fleet=await page.evaluate(()=>{
    state.paused=true;state.finished=true;state.finishTime=0;state.maxPostFinishWait=1000;
    racers.forEach((r,i)=>{
      const angle=i*2*Math.PI/5;
      r.routeProgress=0;r.laneX=Math.cos(angle)*105;r.laneY=Math.sin(angle)*105;
      r.vx=0;r.vy=0;r.targetX=r.laneX;r.targetY=r.laneY;
      r.map2GateChoice=null;positionRacerOnRoute(r);
    });
    let frames=0;
    for(;frames<12000&&state.running&&!racers.every(r=>r.finished||r.dnf);frames++)updateGame(1/30);
    return {frames,gates:map2Gates.length,rivals:racers.map(r=>({
      name:r.name,finished:r.finished,dnf:r.dnf,progress:r.routeProgress,
      stats:{...r.aiStats}
    }))};
  });
  console.log('MAP2-25 FLEET '+JSON.stringify(fleet));
  assert(fleet.rivals.filter(r=>r.finished).length>=4,'at least four rivals finish while following the building route');
  assert(fleet.rivals.filter(r=>r.finished).every(r=>r.stats.map2GateExits===fleet.gates),'hard gate safety must remain intact');
  assert(fleet.rivals.every(r=>(r.stats.map2BuildingRouteSeconds||0)>35),'every rival must spend substantial time following real building anchors');
  assert(fleet.rivals.every(r=>(r.stats.map2BuildingRouteTargets||0)>900),'building route must be a continuous steering source, not a token event');
  assert(fleet.rivals.every(r=>(r.stats.map2ThroughBuildingSeconds||0)>8),'every rival must actually traverse real through-building modules');

  const evidence=path.join(__dirname,'map2-25-evidence');fs.mkdirSync(evidence,{recursive:true});
  await page.evaluate(()=>{
    const m=window.starbladeMap2ThroughRoute.modules.slice().sort((a,b)=>b.depth-a.depth)[0];
    state.routeProgress=Math.max(0,m.entrance.distance-450);
    const q=starbladeMap2BuildingPassageAt(state.routeProgress);
    state.laneX=q.x;state.laneY=q.y;state.paused=true;
    map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  });
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-through-building-module.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-25 real entrance/interior/exit building route + rival binding');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});