'use strict';
// MAP2-45: prove progress-indexed broadphase retains every old sweep candidate.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
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
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&window.starbladeMap2PhysicalConsistency,null,{timeout:90000});
  const info=await page.evaluate(()=>{
   state.paused=true;map2BuildContactIndex();
   let missing=0,orderErrors=0,queries=0,oldTotal=0,newTotal=0,anchorErrors=0;
   const source=map2Obstacles;
   const order=new Map(source.map((o,i)=>[o,i]));
   for(let d=0;d<=MAP2_DISTANCE;d+=97){
    for(const span of [0,40,350,-180]){
     const a={routeProgress:d},b={routeProgress:Math.max(0,Math.min(MAP2_DISTANCE,d+span))},radius=18;
     const got=map2ContactCandidates(a,b,radius),set=new Set(got);
     for(const o of source){
      const pad=(o.type==='WRECK_BOX'?o.halfDepth:o.radius)+radius+8;
      if(Math.max(a.routeProgress,b.routeProgress)>=o.routeProgress-pad&&Math.min(a.routeProgress,b.routeProgress)<=o.routeProgress+pad&&!set.has(o))missing++;
     }
     for(let i=1;i<got.length;i++)if(order.get(got[i])<=order.get(got[i-1]))orderErrors++;
     queries++;oldTotal+=source.length;newTotal+=got.length;
    }
    const route=window.starbladeMap2ThroughRoute,anchors=route?.routeAnchors||window.starbladeMap2BuildingRoad?.knots;
    if(map2Segment(d).kind!=='TECH'||!anchors?.length||d<=anchors[0].distance||d>=anchors[anchors.length-1].distance)continue;
    let hi=1;while(hi<anchors.length&&anchors[hi].distance<d)hi++;
    const a=anchors[hi-1],b=anchors[hi],t=THREE.MathUtils.clamp((d-a.distance)/Math.max(1,b.distance-a.distance),0,1),smooth=t*t*(3-2*t);
    const actual=map2ThroughRouteTargetAt(d);
    if(!actual||Math.abs(actual.x-THREE.MathUtils.lerp(a.x,b.x,smooth))>1e-7||Math.abs(actual.y-THREE.MathUtils.lerp(a.y,b.y,smooth))>1e-7)anchorErrors++;
   }
   const probe=source.find(o=>o.moveType==='STATIC');
   const key='map2-45-test-contact';
   map2ContactPrevious.set(key,new Set([probe]));
   const retained=map2ContactCandidates({routeProgress:0},{routeProgress:1},10,key).includes(probe);
   map2ContactPrevious.delete(key);
   const drawCalls=typeof renderer!=='undefined'?renderer.info.render.calls:null;
   return {queries,missing,orderErrors,anchorErrors,retained,oldTotal,newTotal,reduction:1-newTotal/oldTotal,drawCalls,obstacles:source.length};
  });
  console.log('MAP2-45 METRICS '+JSON.stringify(info));
  assert.equal(info.missing,0);assert.equal(info.orderErrors,0);assert.equal(info.anchorErrors,0);assert.equal(info.retained,true);
  assert(info.reduction>.70,'indexed broadphase should eliminate at least 70% of full-scan candidates');
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-45 route lookup / broadphase equivalence');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
