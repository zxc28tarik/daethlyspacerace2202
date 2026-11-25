// MAP2-29 — grounded building-defined route; no straight TECH asphalt ribbon
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2GroundArchitecturalRoute'));
assert(html.includes('BUILDING_BASES_DEFINE_GROUND_NO_ASPHALT_RIBBON'));
assert(html.includes('MAP2_ARCH_FOUNDATION_'));
assert(html.includes('MAP2_ARCH_CONNECTOR_'));

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
    const s=window.starbladeMap2GroundedArchitecture;
    const ground=[];
    const oldStraight=[];
    const pattern=/(?:VISUAL_DECK|ROAD_SURFACE|ASPHALT|PAVEMENT|TRACK_SURFACE|LANE_STRIP|CENTER_STRIP)/i;
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ArchitecturalGround)ground.push({
        name:o.name,d:o.userData.map2Distance,
        connector:!!o.userData.map2BuildingConnector
      });
      const d=Number(o.userData?.map2Distance??o.userData?.map2TargetDistance??o.userData?.routeProgress);
      if(Number.isFinite(d)&&map2Segment(d).kind==='TECH'&&o.userData?.map2VisualOnly&&
         !o.name?.startsWith('MAP2_ARCH_')&&pattern.test(o.name||'')){
        oldStraight.push({name:o.name,d});
      }
    });
    const route=window.starbladeMap2ThroughRoute;
    const road=window.starbladeMap2BuildingRoad;
    let maxLocalYJump=0;
    const a=(road?.knots||[]).slice().sort((u,v)=>u.distance-v.distance);
    for(let i=1;i<a.length;i++){
      const gap=a[i].distance-a[i-1].distance;
      if(gap<=0||gap>950||map2Segment((a[i].distance+a[i-1].distance)*.5).kind!=='TECH')continue;
      maxLocalYJump=Math.max(maxLocalYJump,Math.abs(a[i].y-a[i-1].y));
    }
    const groundedRoots=[];
    map2CourseGroup.traverse(r=>{
      if(!r.userData?.map2GroundedArchitecture)return;
      groundedRoots.push({
        name:r.name,d:r.userData.map2TargetDistance,
        dy:r.userData.map2GroundShiftY,
        base:r.userData.map2GroundBaseY,
        target:r.userData.map2GroundTargetY
      });
    });
    return {
      s,
      ground:ground.length,
      foundations:ground.filter(x=>!x.connector).length,
      connectors:ground.filter(x=>x.connector).length,
      oldStraight,
      groundedRoots:groundedRoots.length,
      maxLocalYJump,
      modules:route?.modules?.length||0,
      anchors:route?.routeAnchors?.length||0,
      gates:map2Gates.length,
      physical:(window.starbladeMap2BuildingColliders||[]).length,
      map4Hidden:!planetaryWorldGroup.visible,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });

  console.log('MAP2-29 GROUNDED_ROUTE '+JSON.stringify(info));
  const s=info.s;
  assert(s,'grounding summary must be published');
  assert.equal(s.philosophy,'BUILDING_BASES_DEFINE_GROUND_NO_ASPHALT_RIBBON');
  assert(s.measuredGroups>=80,'most real building groups must participate in ground measurement');
  assert.equal(s.foundations,s.measuredGroups,'every measured building group gets its own local foundation');
  assert(s.connectors>=20,'nearby building handoffs need short architectural connector plates');
  assert(s.groundedGroups>=10,'obvious vertical outliers must actually be moved, not only covered');
  assert(s.maxVerticalCorrection<=86.001,'grounding may not violently yank a copied Map4 complex');
  assert.equal(s.remainingStraightSurfaces,0,'no straight legacy TECH road surface may remain');
  assert.equal(info.oldStraight.length,0,'scene graph must contain no old straight TECH surface helper');
  assert.equal(info.foundations,s.foundations);
  assert.equal(info.connectors,s.connectors);
  assert(info.groundedRoots>=40,'grounding metadata must be carried by a substantial set of copied Map4 roots');
  assert(info.maxLocalYJump<=330,'grounded route anchors must remain flyable');
  assert(info.modules>=168&&info.anchors>=736,'dense through-building route must survive');
  assert.equal(info.gates,68,'all hard-safety gates remain');
  assert(info.physical>=180,'real building physics remains substantial');
  assert(info.map4Hidden,'Map4 source scene remains hidden');
  assert.equal(info.stats?.architectureFoundations,s.foundations);
  assert.equal(info.stats?.architectureConnectors,s.connectors);
  assert.equal(info.stats?.architectureStraightSurfacesRemaining,0);

  const evidence=path.join(__dirname,'map2-29-evidence');fs.mkdirSync(evidence,{recursive:true});
  const picks=[.22,.52,.78];
  for(let i=0;i<picks.length;i++){
    await page.evaluate(p=>{
      const s=window.starbladeMap2GroundedArchitecture;
      const row=s.groups[Math.min(s.groups.length-1,Math.floor((s.groups.length-1)*p))];
      const d=Math.max(0,row.d-260);
      state.routeProgress=d;
      const q=starbladeMap2BuildingPassageAt(d);
      state.laneX=q.x;state.laneY=q.y;state.paused=true;
      map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    },picks[i]);
    await page.waitForTimeout(250);
    await page.screenshot({path:path.join(evidence,String(i).padStart(2,'0')+'-grounded-building-route.png')});
  }

  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-29 grounded building route / no straight asphalt ribbon');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
