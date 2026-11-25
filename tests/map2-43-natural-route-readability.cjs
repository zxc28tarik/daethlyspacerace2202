'use strict';
// MAP2-43: architecture itself must explain the route without painted/guide-line borders.
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
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&
    window.starbladeMap2WorldCity?.naturalRead?.records?.length>100,null,{timeout:90000});

  const info=await page.evaluate(()=>{
   state.paused=true;scene.updateMatrixWorld(true);
   const world=window.starbladeMap2WorldCity;
   const nr=world.naturalRead;
   const records=nr.records||[];
   const bend=records.filter(r=>r.bend>.15);
   const yawed=bend.filter(r=>r.yaw>.001);
   const approaches=records.filter(r=>r.approach>.35);

   const pairMap=new Map();
   for(const r of bend){
    const key=Math.round(r.d);
    const arr=pairMap.get(key)||[];
    arr.push(r);pairMap.set(key,arr);
   }
   let readablePairs=0,pairs=0,minSilhouetteDelta=Infinity,maxSilhouetteDelta=0;
   for(const arr of pairMap.values()){
    if(arr.length<2)continue;
    const inner=arr.find(r=>r.innerTurn),outer=arr.find(r=>!r.innerTurn);
    if(!inner||!outer)continue;
    pairs++;
    const delta=outer.height-inner.height;
    minSilhouetteDelta=Math.min(minSilhouetteDelta,delta);
    maxSilhouetteDelta=Math.max(maxSilhouetteDelta,delta);
    if(delta>80)readablePairs++;
   }

   const physical=(window.starbladeMap2BuildingColliders||[]).filter(o=>o.map2WideUrbanFrontage);
   const fastPhysical=physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length;
   const fastVisual=world.frontage.filter(r=>map2Segment(r.d).kind==='FAST');
   const fastSides={
    left:fastVisual.filter(r=>r.side<0).length,
    right:fastVisual.filter(r=>r.side>0).length
   };
   const openRows={
    left0:world.frontage.filter(r=>r.side<0&&r.row===0&&map2Segment(r.d).kind!=='TECH').length,
    right0:world.frontage.filter(r=>r.side>0&&r.row===0&&map2Segment(r.d).kind!=='TECH').length
   };

   return {
    records:records.length,
    openSectorRecords:nr.openSectorRecords,
    bendRecords:nr.bendRecords,
    flightEnvelope:nr.flightEnvelope,
    minClearance:nr.minClearance,
    yawedBends:yawed.length,
    maxYaw:Math.max(0,...bend.map(r=>r.yaw||0)),
    approaches:approaches.length,
    maxApproach:Math.max(0,...records.map(r=>r.approach||0)),
    pairs,readablePairs,
    minSilhouetteDelta:Number.isFinite(minSilhouetteDelta)?minSilhouetteDelta:0,
    maxSilhouetteDelta,
    fastPhysical,fastSides,openRows,
    retiredGuides:world.retiredGuides,
    lateralScale:world.lateralScale,
    map4Hidden:!planetaryWorldGroup.visible
   };
  });

  const dir=path.join(__dirname,'map2-43-evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'natural-route-read.json'),JSON.stringify(info,null,2));
  console.log('MAP2-43 METRICS '+JSON.stringify(info));

  assert(info.records>700,'continuous inner city row should cover the loop');
  assert(info.openSectorRecords>180,'LINK/FAST sectors must keep continuous city silhouette');
  assert(info.bendRecords>20,'route must contain enough measured bend records');
  assert(info.minClearance>=info.flightEnvelope-1,
    'natural-reading frontage must stay outside widened flight envelope');
  assert(info.yawedBends>20,'bent street frontage should measurably rotate with its real offset chord');
  assert(info.maxYaw>.006,'at least one bend needs measurable frontage orientation');
  assert(info.approaches>20&&info.maxApproach>.7,
    'sector entries need a gradual architectural height transition');
  assert(info.pairs>10&&info.readablePairs>=Math.floor(info.pairs*.6),
    'most measured corners should expose the inside and hold a taller outside silhouette');
  assert(info.maxSilhouetteDelta>180,'corner silhouette contrast should be visually meaningful');
  assert.equal(info.fastPhysical,0,'FAST sectors stay physically open');
  assert(info.fastSides.left>80&&info.fastSides.right>80,'FAST sectors need city on both sides');
  assert(info.openRows.left0>80&&info.openRows.right0>80,'open-sector inner rows must be continuous');
  assert(info.lateralScale===2&&info.map4Hidden,'Map2 width and hidden Map4 source must remain intact');

  const shots=[
   {d:9100,name:'fast1-entry'},
   {d:34200,name:'fast1-exit'},
   {d:96750,name:'fast2-entry'},
   {d:112900,name:'fast2-exit'},
   {d:145000,name:'city-turn'}
  ];
  for(const shot of shots){
   await page.evaluate(({d})=>{
    const f=getRaceFrameAtDistance(d);
    const q=map2Segment(d).kind==='TECH'?starbladeMap2BuildingPassageAt(d):{x:0,y:-60};
    state.paused=true;state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
    state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
    const rot=new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
    camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
    camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
    map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
   },shot);
   await page.waitForTimeout(220);
   await page.screenshot({path:path.join(dir,shot.name+'.png'),timeout:120000,animations:'disabled'});
  }

  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-43 natural architectural route readability');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
