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
  await page.waitForFunction(()=>typeof selectMap==='function'&&typeof map2BuildCourse==='function');
  assert(await page.locator('#map-choice-4').isDisabled(),'Map4 must remain locked');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const layout=await page.evaluate(()=>window.starbladeMap2Layout);
  assert.equal(layout.distance,175000);assert.equal(layout.structures,382);assert.equal(layout.gates,68);assert.equal(layout.openings,85);
  const v=layout.visualStage;
  assert(v.chokeWalls>=24,'sharp turns need paired canyon walls');
  assert(v.turnFrames>=4,'sharp turns need readable frames');
  assert(v.silhouetteTowers>=100,'gate families need stronger silhouettes');
  const depths=await page.evaluate(()=>[...new Set(map2Gates.map(g=>g.depth))].sort((a,b)=>a-b));
  assert.deepEqual(depths,[180,210,255,310],'physical gate depths must remain unchanged');

  const evidence=path.join(__dirname,'map2-10-evidence');fs.mkdirSync(evidence,{recursive:true});
  async function capture(progress,name){
    await page.evaluate(p=>{state.paused=false;state.routeProgress=p;state.laneX=0;state.laneY=0;},progress);
    await page.waitForTimeout(600);
    await page.evaluate(()=>{state.paused=true;map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);});
    const info=await page.evaluate(()=>{
      const compositionPrefixes=['MAP2_CHOKE_WALL_','MAP2_TURN_FRAME_','MAP2_TURN_TOWER_',
        'MAP2_HANGAR_TOWER_','MAP2_GANTRY_PYLON_','MAP2_DUAL_FACTORY_MASS_','MAP2_SLOT_MACHINE_','MAP2_SLOT_CROWN_'];
      const counts={all:0,onscreen:0,choke:0,gateSilhouette:0};
      map2CourseGroup.traverse(o=>{
        if(!compositionPrefixes.some(p=>o.name?.startsWith(p)))return;
        let vis=true,n=o;while(n){vis=vis&&n.visible;n=n.parent;}if(!vis)return;
        counts.all++;
        if(o.name.startsWith('MAP2_CHOKE_')||o.name.startsWith('MAP2_TURN_'))counts.choke++;else counts.gateSilhouette++;
        const p=new THREE.Vector3();o.getWorldPosition(p);const q=p.clone().project(camera);
        if(q.z>=-1&&q.z<=1&&Math.abs(q.x)<=1.28&&Math.abs(q.y)<=1.28)counts.onscreen++;
      });
      const seg=map2Segment(state.routeProgress).kind;
      const gate=map2Gates.find(g=>g.distance+g.depth/2+35>=state.routeProgress&&g.distance-state.routeProgress<1800)||null;
      return {progress:state.routeProgress,seg,counts,gate:gate&&{kind:gate.kind,distance:gate.distance,depth:gate.depth}};
    });
    await page.screenshot({path:path.join(evidence,name+'.png')});
    return info;
  }

  const sharp=await page.evaluate(()=>map2Gates.map(g=>{
    const a=getRaceFrameAtDistance(g.distance-650).tangent,b=getRaceFrameAtDistance(g.distance+650).tangent;
    return {distance:g.distance,kind:g.kind,angle:a.angleTo(b)};
  }).filter(x=>x.angle>.095).sort((a,b)=>b.angle-a.angle).slice(0,3));
  assert(sharp.length>=2,'need multiple real sharp-turn gates');
  const sharpShots=[];
  for(let i=0;i<sharp.length;i++){
    const s=sharp[i];
    const shot=await capture(Math.max(0,s.distance-720),'0'+(i+1)+'-sharp-'+s.kind.toLowerCase());
    sharpShots.push({...shot,angle:s.angle});
    assert.equal(shot.seg,'TECH');
    assert(shot.counts.onscreen>=4,'sharp turn composition should be visible before the gate');
    assert(shot.counts.choke>0,'sharp turn should show canyon composition');
  }

  const familyShots={};
  for(const kind of ['HANGAR','GANTRY','DUAL_FACTORY','MACHINE_SLOT']){
    const gate=await page.evaluate(k=>map2Gates.find(g=>g.kind===k&&g.distance>35000),kind);
    assert(gate,kind+' gate missing');
    const shot=await capture(gate.distance-620,'family-'+kind.toLowerCase());
    familyShots[kind]=shot;
    assert.equal(shot.gate?.kind,kind);
    assert(shot.counts.gateSilhouette>0,kind+' needs visible family silhouette');
  }

  const fast=await capture(12000,'fast-preserved');
  assert.equal(fast.seg,'FAST');assert.equal(fast.counts.choke,0,'FAST must not inherit TECH chokepoints');
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-10 chokepoint composition '+JSON.stringify({layout,depths,sharpShots,familyShots,fast}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
