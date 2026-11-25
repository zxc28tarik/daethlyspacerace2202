'use strict';
// MAP2-46 — actual-player chase-camera acceptance sweep.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);

(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{
    waitUntil:'domcontentloaded',timeout:60000
  });
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&
    window.starbladeMap2WorldCity&&window.starbladeMap2PhysicalConsistency&&
    window.starbladeMap2PhysicsBins?.obstacles>100,null,{timeout:90000});
  await page.evaluate(()=>{state.paused=true;state.finished=false;state.playerDNF=false;});

  const dir=path.join(__dirname,'map2-46-evidence');fs.mkdirSync(dir,{recursive:true});
  const shots=[
    {d:4500,name:'01-link-world-ground'},
    {d:9200,name:'02-fast1-entry'},
    {d:28200,name:'03-fast1-speed'},
    {d:37200,name:'04-tech-entry'},
    {d:51200,name:'05-tech-building-road'},
    {d:100200,name:'06-fast2-speed'},
    {d:126800,name:'07-late-tech-canyon'},
    {d:149200,name:'08-late-tech-turn'}
  ];
  const metrics=[];
  for(const shot of shots){
    const m=await page.evaluate(({d,name})=>{
      state.finished=false;state.playerDNF=false;state.paused=true;
      state.routeProgress=d;state.currentSpeed=RACE_SPEEDS.NORMAL;
      state.yaw=state.pitch=state.roll=0;
      const seg=map2Segment(d);
      const q=seg.kind==='TECH'?starbladeMap2BuildingPassageAt(d):{x:0,y:-55};
      state.laneX=q.x;state.laneY=q.y;
      const f=getRaceFrameAtDistance(d);
      state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
      const rot=new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
      playerRig.visible=true;
      h4Ship19CameraOffset.set(-1.45,5.1,18.2);
      camera.position.copy(state.pos).add(
        h4Ship19CameraOffset.clone().applyQuaternion(rot));
      camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(d);
      scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
      renderer.render(scene,camera);

      const projectRoute=dd=>{
        const rf=getRaceFrameAtDistance(Math.min(MAP2_DISTANCE,dd));
        const rq=map2Segment(dd).kind==='TECH'?starbladeMap2BuildingPassageAt(dd):{x:0,y:-55};
        const p=rf.center.clone().addScaledVector(rf.right,rq.x).addScaledVector(rf.up,rq.y);
        const ndc=p.project(camera);
        return {x:ndc.x,y:ndc.y,z:ndc.z,onscreen:
          Math.abs(ndc.x)<=1&&Math.abs(ndc.y)<=1&&ndc.z>=-1&&ndc.z<=1};
      };
      const recs=window.starbladeMap2WorldCity.naturalRead.records;
      const nearby=recs.filter(r=>{
        let delta=Math.abs(r.d-d);
        delta=Math.min(delta,MAP2_DISTANCE-delta);
        return delta<5200;
      });
      const side={left:nearby.filter(r=>r.side<0).length,
        right:nearby.filter(r=>r.side>0).length};
      const perf=map2PerformanceSnapshot();
      return {
        name,d,segment:seg.kind,lane:{x:q.x,y:q.y},fov:camera.fov,
        floorY:window.starbladeMap2WorldCity.floorY,cameraY:camera.position.y,
        route800:projectRoute(d+800),route1800:projectRoute(d+1800),
        nearbyCity:nearby.length,side,
        retiredGuides:window.starbladeMap2WorldCity.retiredGuides,
        visibleSections:perf.visibility.visibleSections,
        instancing:perf.instancing,renderer:perf.renderer,
        map4Hidden:!planetaryWorldGroup.visible
      };
    },shot);
    metrics.push(m);
    await page.waitForTimeout(120);
    await page.screenshot({path:path.join(dir,shot.name+'.png'),
      timeout:120000,animations:'disabled'});
  }

  console.log('MAP2-46 CAMERA '+JSON.stringify(metrics));
  assert(metrics.every(m=>m.fov===68));
  assert(metrics.every(m=>m.cameraY>m.floorY+20),
    'chase camera must remain above the common world ground');
  assert(metrics.every(m=>m.route800.onscreen),
    'the authored route must remain readable 800m ahead from actual chase camera');
  assert(metrics.filter(m=>m.route1800.onscreen).length>=6,
    'most acceptance views should expose the route well beyond immediate reaction distance');
  assert(metrics.every(m=>m.nearbyCity>40&&m.side.left>15&&m.side.right>15),
    'city context must continuously exist on both sides of every acceptance view');
  assert(metrics.every(m=>m.visibleSections>0&&m.visibleSections<20));
  assert(metrics.every(m=>m.instancing.visibleInstances>100));
  assert(metrics.every(m=>m.renderer.calls>0&&m.renderer.triangles>0));
  assert(metrics.every(m=>m.map4Hidden));
  assert(metrics.every(m=>m.retiredGuides>=40),
    'legacy route-guide layer must remain retired');
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(dir,'camera-acceptance.json'),JSON.stringify(metrics,null,2));
  console.log('PASS MAP2-46 actual player-camera acceptance capture');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
