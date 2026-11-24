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
  assert(v.deckSlabs>250);assert(v.sideBlocks>500);assert(v.stacks>150);assert(v.trusses>100);
  assert(v.pipeRuns>150,'TECH needs repeated pipe language');
  assert(v.tanks>100,'TECH needs repeated process tanks');
  assert(v.roofUnits>70,'factory roofs need service equipment');
  assert(v.catwalks>60,'industrial catwalk rhythm missing');
  assert(v.signals>40,'service lights missing');
  assert(v.gateDetails>100,'gate families need distinct detail kits');

  const depths=await page.evaluate(()=>[...new Set(map2Gates.map(g=>g.depth))].sort((a,b)=>a-b));
  assert.deepEqual(depths,[180,210,255,310],'MAP2-08 safe collision depths must not change');
  const evidence=path.join(__dirname,'map2-09-evidence');fs.mkdirSync(evidence,{recursive:true});

  async function capture(progress,name){
    await page.evaluate(p=>{state.paused=false;state.routeProgress=p;state.laneX=0;state.laneY=0;},progress);
    await page.waitForTimeout(560);
    await page.evaluate(()=>{state.paused=true;map2UpdateVisibility(state.routeProgress);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);});
    const info=await page.evaluate(()=>{
      const prefixes=['MAP2_PIPE_','MAP2_TANK_','MAP2_ROOF_','MAP2_CATWALK_','MAP2_SERVICE_LIGHT_',
        'MAP2_HANGAR_RIB_','MAP2_GANTRY_PIPE_','MAP2_DUAL_TANK_','MAP2_DUAL_PIPE_','MAP2_SLOT_FIN_'];
      const totals={all:0,onscreen:0,pipe:0,tank:0,roof:0,catwalk:0,signal:0,gate:0};
      map2CourseGroup.traverse(o=>{
        if(!prefixes.some(p=>o.name?.startsWith(p)))return;
        let visible=true,n=o;while(n){visible=visible&&n.visible;n=n.parent;}if(!visible)return;
        totals.all++;
        const name=o.name||'';
        if(name.startsWith('MAP2_PIPE_'))totals.pipe++;
        else if(name.startsWith('MAP2_TANK_'))totals.tank++;
        else if(name.startsWith('MAP2_ROOF_'))totals.roof++;
        else if(name.startsWith('MAP2_CATWALK_'))totals.catwalk++;
        else if(name.startsWith('MAP2_SERVICE_LIGHT_'))totals.signal++;
        else totals.gate++;
        const p=new THREE.Vector3();o.getWorldPosition(p);const q=p.clone().project(camera);
        if(q.z>=-1&&q.z<=1&&Math.abs(q.x)<=1.25&&Math.abs(q.y)<=1.25)totals.onscreen++;
      });
      const seg=map2Segment(state.routeProgress).kind;
      const gate=map2Gates.find(g=>g.distance+g.depth/2+35>=state.routeProgress&&g.distance-state.routeProgress<1600)||null;
      return {progress:state.routeProgress,seg,totals,gate:gate&&{kind:gate.kind,distance:gate.distance,depth:gate.depth}};
    });
    await page.screenshot({path:path.join(evidence,name+'.png')});
    return info;
  }

  const techEntry=await capture(35200,'01-tech-entry');
  const gantry=await capture(37500,'02-gantry-approach');
  const dual=await capture(39750,'03-dual-factory');
  const slot=await capture(41650,'04-machine-slot');
  for(const shot of [techEntry,gantry,dual,slot]){
    assert.equal(shot.seg,'TECH');assert(shot.totals.onscreen>=4,'industrial details must be visible in real camera');
  }
  assert(techEntry.totals.pipe+techEntry.totals.tank+techEntry.totals.roof>0);
  assert(gantry.gate?.kind==='GANTRY');
  assert(dual.gate?.kind==='DUAL_FACTORY');
  assert(slot.gate?.kind==='MACHINE_SLOT');

  const fast=await capture(12000,'05-fast-preserved');
  assert.equal(fast.seg,'FAST');
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-09 industrial facility detail pass '+JSON.stringify({layout,depths,techEntry,gantry,dual,slot,fast}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
