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
  await page.waitForFunction(()=>typeof map2PatrolTick==='function'&&typeof map2BuildCourse==='function');
  assert(await page.locator('#map-choice-4').isDisabled(),'Map4 must remain locked');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const layout=await page.evaluate(()=>window.starbladeMap2Layout);
  assert.equal(layout.distance,175000);assert.equal(layout.structures,382);assert.equal(layout.gates,68);assert.equal(layout.openings,85);
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
    await page.evaluate(({p,y})=>{state.paused=true;state.routeProgress=p;state.laneX=0;state.laneY=y;map2UpdateVisibility(p);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);}, {p:progress,y:laneY});
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

  const patrol=await page.evaluate(()=>{
    const step=(n,dt=.05)=>{for(let i=0;i<n;i++)map2PatrolTick(dt);};
    state.paused=true;state.routeProgress=40000;state.laneX=20;state.laneY=180;state.shield=100;
    state.powerShieldTimer=0;state.barrelRollTimer=0;map2PatrolReset();step(6);
    const low={search:!!map2PatrolVisual.search?.visible,beam:!!map2PatrolVisual.beam?.visible,shield:state.shield};
    state.laneY=250;step(4);
    const exposed={search:!!map2PatrolVisual.search?.visible,beam:!!map2PatrolVisual.beam?.visible,
      searching:window.starbladeMap2Patrol.searching,phase:window.starbladeMap2Patrol.phase,shield:state.shield};
    step(8);
    const locked={search:!!map2PatrolVisual.search?.visible,beam:!!map2PatrolVisual.beam?.visible,
      searching:window.starbladeMap2Patrol.searching,phase:window.starbladeMap2Patrol.phase,shield:state.shield};
    step(6);
    const fired={search:!!map2PatrolVisual.search?.visible,beam:!!map2PatrolVisual.beam?.visible,
      searching:window.starbladeMap2Patrol.searching,phase:window.starbladeMap2Patrol.phase,shield:state.shield};
    state.laneY=180;step(3);
    const recovered={search:!!map2PatrolVisual.search?.visible,searching:window.starbladeMap2Patrol.searching};
    return {cfg:{ceiling:MAP2_PATROL.ceiling,lockSeconds:MAP2_PATROL.lockSeconds,approachSeconds:MAP2_PATROL.approachSeconds,
      shotInterval:MAP2_PATROL.shotInterval,damage:MAP2_PATROL.damage},low,exposed,locked,fired,recovered};
  });
  assert.deepEqual(patrol.cfg,{ceiling:220,lockSeconds:.85,approachSeconds:.42,shotInterval:.7,damage:12});
  assert.equal(patrol.low.search,false);assert.equal(patrol.low.shield,100);
  assert.equal(patrol.exposed.search,true);assert.equal(patrol.exposed.searching,true);assert.equal(patrol.exposed.beam,false);
  assert(['approach','lock'].includes(patrol.exposed.phase));assert.equal(patrol.exposed.shield,100);
  assert.equal(patrol.locked.search,true);assert.equal(patrol.locked.beam,false);assert.equal(patrol.locked.shield,100);
  assert.equal(patrol.fired.beam,true);assert.equal(patrol.fired.search,false);assert.equal(patrol.fired.shield,88);
  assert.equal(patrol.recovered.search,false);assert.equal(patrol.recovered.searching,false);

  await settle(40000,250);
  await page.evaluate(()=>{state.paused=true;map2PatrolReset();for(let i=0;i<6;i++)map2PatrolTick(.05);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);});
  const approachShot=await page.evaluate(()=>{
    const ship=map2PatrolVisual.ship.position.clone().project(camera);
    const a=map2PatrolVisual.search.geometry.attributes.position;
    const start=new THREE.Vector3(a.getX(0),a.getY(0),a.getZ(0)).project(camera);
    const end=new THREE.Vector3(a.getX(1),a.getY(1),a.getZ(1)).project(camera);
    const player=playerRig.position.clone().project(camera);
    const box=new THREE.Box3().setFromObject(map2PatrolVisual.ship),pts=[];
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])
      pts.push(new THREE.Vector3(x,y,z).project(camera));
    const bbox={w:Math.max(...pts.map(p=>p.x))-Math.min(...pts.map(p=>p.x)),
      h:Math.max(...pts.map(p=>p.y))-Math.min(...pts.map(p=>p.y))};
    return {search:map2PatrolVisual.search?.visible===true,phase:window.starbladeMap2Patrol?.phase,
      warning:map2PatrolWarning()?.title||null,depthTest:map2PatrolVisual.search.material.depthTest,
      lineLength:Math.hypot(start.x-end.x,start.y-end.y),bbox,
      ship:{x:ship.x,y:ship.y,z:ship.z},player:{x:player.x,y:player.y,z:player.z},
      start:{x:start.x,y:start.y,z:start.z},end:{x:end.x,y:end.y,z:end.z}};
  });
  assert.equal(approachShot.search,true);assert(approachShot.warning?.includes('YAKLAŞIYOR'));
  assert.equal(approachShot.depthTest,false,'searchlight must remain readable against roof geometry');
  assert(Math.abs(approachShot.ship.x)<1&&Math.abs(approachShot.ship.y)<1&&approachShot.ship.z>=-1&&approachShot.ship.z<=1,
    'patrol fighter must actually be inside the camera frame during approach');
  assert(Math.abs(approachShot.start.x)<1.05&&Math.abs(approachShot.start.y)<1.05,
    'searchlight origin must be in frame');
  assert(Math.abs(approachShot.end.x)<1.05&&Math.abs(approachShot.end.y)<1.05,
    'searchlight target must be in frame');
  assert(Math.abs(approachShot.end.x-approachShot.player.x)<.015&&Math.abs(approachShot.end.y-approachShot.player.y)<.015,
    'searchlight must terminate on the actually rendered player craft');
  assert(Math.max(approachShot.bbox.w,approachShot.bbox.h)>.055,
    'patrol fighter must be large enough to read on screen');
  assert(approachShot.ship.z<.995,'patrol fighter must not sit at near-far-plane distance');
  await page.screenshot({path:path.join(evidence,'02-exposed-patrol-search.png')});

  await settle(12000,300);
  const fast=await page.evaluate(()=>{map2PatrolTick(.1);return {seg:map2Segment(state.routeProgress).kind,search:!!map2PatrolVisual.search?.visible,warning:map2PatrolWarning()};});
  assert.equal(fast.seg,'FAST');assert.equal(fast.search,false);assert.equal(fast.warning,null);
  await page.screenshot({path:path.join(evidence,'03-fast-no-roofline-threat.png')});

  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-11 KEEP IT LOW visual language '+JSON.stringify({layout:layout.visualStage,lowVisual,patrol,approachShot,fast}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
