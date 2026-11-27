'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  assert(await page.locator('#map-choice-4').isDisabled(),'Map4 must remain locked');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const layout=await page.evaluate(()=>window.starbladeMap2Layout);
  assert.equal(layout.distance,175000);
  const retired=layout.visualStage.throughBuildingRetiredLegacyObstacles||0;
  const wideUrban=layout.visualStage.wideUrbanPhysicalColliders||0;
  assert(wideUrban>=150,'MAP2-42 must add a substantial physical urban frontage');
  assert.equal(layout.structures+retired,382+layout.visualStage.map4BuildingColliders+wideUrban,
    'visible/physical structure accounting must preserve the legacy layer plus the explicit MAP2-42 frontage');
  if(retired>0){
    const legacyRetirement=await page.evaluate(()=>window.starbladeMap2LegacyRoadRetirement||null);
    if(legacyRetirement){
      assert.equal(legacyRetirement.totalRetired,retired,
        'MAP2-27 explicit retirement metadata must account for every retired legacy obstacle');
      assert(legacyRetirement.retiredCount>=1,
        'MAP2-27 retirement must be a deliberate replacement pass');
      assert(legacyRetirement.retired.every(x=>/^MAP2_CITY_TURN_/.test(x.name)),
        'MAP2-27 may only retire the classified CITY_TURN central-road obstacle class');
      assert(legacyRetirement.retiredCount<=90,
        'MAP2-27 retirement remains selective rather than broad legacy deletion');
      assert(legacyRetirement.gatePreserved>=250,
        'hard-safety gate obstacle layer must remain preserved');
    }else{
      assert(retired<=12,'pre-MAP2-27 only a small explicit legacy set may be retired');
    }
  }
  assert(layout.visualStage.map4BuildingColliders>=30,'real Map4 buildings must contribute physical obstacles');
  assert.equal(layout.gates,68);assert.equal(layout.openings,85);
  assert(layout.visualStage.rooflineRails>100,'roofline warning language should repeat through TECH');
  assert.equal(layout.visualStage.safeApertureLights,170,'each of 85 openings needs two low-safe lights');

  const evidence=path.join(__dirname,'map2-11-evidence');fs.mkdirSync(evidence,{recursive:true});

  async function settle(progress,laneY){
    const lead=Math.max(0,progress-1000);
    await page.evaluate(({p,y})=>{state.paused=false;state.routeProgress=p;state.laneX=0;state.laneY=y;}, {p:lead,y:laneY});
    await page.waitForTimeout(350);
    for(let i=1;i<=10;i++){
      const at=lead+(progress-lead)*i/10;
      await page.evaluate(({p,y})=>{state.paused=false;state.routeProgress=p;state.laneX=0;state.laneY=y;}, {p:at,y:laneY});
      await page.waitForTimeout(70);
    }
    await page.evaluate(({p,y})=>{
      state.paused=true;state.routeProgress=p;state.laneX=0;state.laneY=y;
      const f=getRaceFrameAtDistance(p);
      state.pos.copy(f.center).addScaledVector(f.right,state.laneX).addScaledVector(f.up,state.laneY);
      const basis=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
      const q=new THREE.Quaternion().setFromRotationMatrix(basis);
      state.pitch=0;state.yaw=0;state.roll=0;
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(q));
      camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(p);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    }, {p:progress,y:laneY});
  }

  await settle(39750,150);
  const lowVisual=await page.evaluate(()=>{
    const counts={roofline:0,safe:0,rooflineOnscreen:0,safeOnscreen:0};
    map2CourseGroup.traverse(o=>{
      const n=o.name||'';const roof=n.startsWith('MAP2_ROOFLINE_RAIL_'),safe=n.startsWith('MAP2_SAFE_APERTURE_');
      if(!roof&&!safe)return;
      let vis=true,a=o;while(a){vis=vis&&a.visible;a=a.parent;}if(!vis)return;
      if(roof)counts.roofline++;else counts.safe++;
      const p=new THREE.Vector3();o.getWorldPosition(p);const q=p.clone().project(camera);
      const on=q.z>=-1&&q.z<=1&&Math.abs(q.x)<=1.25&&Math.abs(q.y)<=1.25;
      if(on){if(roof)counts.rooflineOnscreen++;else counts.safeOnscreen++;}
    });
    return counts;
  });
  assert(lowVisual.rooflineOnscreen>0,'220 roofline cues should be visible in TECH');
  assert(lowVisual.safeOnscreen>0,'safe aperture lights should be visible near gate');
  await page.screenshot({path:path.join(evidence,'01-low-safe-corridor.png')});

  await settle(40000,250);
  const patrolRetired=await page.evaluate(()=>{
    state.paused=true;
    state.routeProgress=40000;
    state.laneY=300;
    const warning=updateRaceHudWarning();
    return {fighter:!!scene.getObjectByName('MAP2_OVERHEAD_PATROL'),
      statePatrol:state.map2Patrol,telemetry:window.starbladeMap2Patrol,
      airWarning:!!warning&&/DEVRİYE|HAVA UYARISI/.test(warning.title)};
  });
  assert.equal(patrolRetired.fighter,false);
  assert.equal(patrolRetired.statePatrol,null);
  assert.equal(patrolRetired.telemetry,null);
  assert.equal(patrolRetired.airWarning,false);
  await page.screenshot({path:path.join(evidence,'02-high-altitude-no-patrol.png')});

  await settle(12000,300);
  const fast=await page.evaluate(()=>{
    const guide=document.getElementById('ui-first-flight');
    return {seg:map2Segment(state.routeProgress).kind,warning:updateRaceHudWarning(),
      patrolTelemetry:window.starbladeMap2Patrol,
      guideHidden:guide.classList.contains('hidden'),
      guideTitle:document.getElementById('ui-first-flight-title')?.textContent||''};
  });
  assert.equal(fast.seg,'FAST');assert.equal(fast.patrolTelemetry,null);
  assert(!fast.warning||!/DEVRİYE|HAVA UYARISI/.test(fast.warning.title));
  if(!fast.guideHidden)assert.notEqual(fast.guideTitle,'ALÇAK UÇ','FAST guidance must not show a low-flight threat');
  await page.screenshot({path:path.join(evidence,'03-fast-no-roofline-threat.png')});

  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-11 KEEP IT LOW visual language '+JSON.stringify({layout:layout.visualStage,lowVisual,patrolRetired,fast}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
