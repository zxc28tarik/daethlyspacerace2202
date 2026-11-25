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
  assert.equal(s.groundedGroups,s.measuredGroups,'every measured building group must receive structural ground support');
  assert.equal(s.movedGroups,0,'grounding must not move the authored building route vertically');
  assert.equal(s.maxVerticalCorrection,0,'grounding must preserve MAP2-25/28 route Y geometry');
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
  assert.equal(info.stats?.architectureMovedGroups,0);
  assert.equal(info.stats?.architectureFoundations,s.foundations);
  assert.equal(info.stats?.architectureConnectors,s.connectors);
  assert.equal(info.stats?.architectureStraightSurfacesRemaining,0);

  const evidence=path.join(__dirname,'map2-29-evidence');fs.mkdirSync(evidence,{recursive:true});

  async function settleAt(progress,laneX,laneY){
    const lead=Math.max(0,progress-900);
    await page.evaluate(({p,x,y})=>{state.paused=false;state.routeProgress=p;state.laneX=x;state.laneY=y;},{p:lead,x:laneX,y:laneY});
    await page.waitForTimeout(260);
    for(let i=1;i<=9;i++){
      const at=lead+(progress-lead)*i/9;
      await page.evaluate(({p,x,y})=>{state.paused=false;state.routeProgress=p;state.laneX=x;state.laneY=y;},{p:at,x:laneX,y:laneY});
      await page.waitForTimeout(55);
    }
    return await page.evaluate(({p,x,y})=>{
      state.paused=true;state.routeProgress=p;state.laneX=x;state.laneY=y;
      const f=getRaceFrameAtDistance(p);
      state.pos.copy(f.center).addScaledVector(f.right,x).addScaledVector(f.up,y);
      const basis=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
      const q=new THREE.Quaternion().setFromRotationMatrix(basis);
      state.pitch=0;state.yaw=0;state.roll=0;
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(q));
      camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(p);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);

      const seen={foundations:0,connectors:0,architecture:0};
      map2CourseGroup.traverse(o=>{
        let vis=true,a=o;while(a){vis=vis&&a.visible;a=a.parent;}if(!vis)return;
        const pos=new THREE.Vector3();o.getWorldPosition(pos);
        const ndc=pos.project(camera);
        const on=ndc.z>=-1&&ndc.z<=1&&Math.abs(ndc.x)<=1.25&&Math.abs(ndc.y)<=1.25;
        if(!on)return;
        if(o.name?.startsWith('MAP2_ARCH_FOUNDATION_'))seen.foundations++;
        if(o.name?.startsWith('MAP2_ARCH_CONNECTOR_'))seen.connectors++;
        if(o.userData?.map2ExactMap4Clone||o.userData?.map2ExactMap4IndustrialVisualPart||
           o.userData?.map2ExactMap4CityClone||o.userData?.map2ExactMap4LandmarkClone)seen.architecture++;
      });
      return seen;
    },{p:progress,x:laneX,y:laneY});
  }

  const picks=[.22,.52,.78], visual=[];
  for(let i=0;i<picks.length;i++){
    const row=await page.evaluate(p=>{
      const s=window.starbladeMap2GroundedArchitecture;
      return s.groups[Math.min(s.groups.length-1,Math.floor((s.groups.length-1)*p))];
    },picks[i]);
    const d=Math.max(0,row.d-360);
    const passage=await page.evaluate(d=>starbladeMap2BuildingPassageAt(d),d);
    const seen=await settleAt(d,passage.x,passage.y);
    visual.push({i,d,seen});
    await page.waitForTimeout(220);
    await page.screenshot({path:path.join(evidence,String(i).padStart(2,'0')+'-grounded-building-route.png')});
  }
  console.log('MAP2-29 VISUAL_EVIDENCE '+JSON.stringify(visual));
  assert(visual.every(v=>v.seen.architecture>0),'each visual checkpoint must actually show copied Map4 architecture');
  assert(visual.some(v=>v.seen.foundations>0),'visual evidence must show at least one local building foundation');
  assert(visual.some(v=>v.seen.connectors>0),'visual evidence must show at least one building-to-building connector');

  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-29 grounded building route / no straight asphalt ribbon');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
