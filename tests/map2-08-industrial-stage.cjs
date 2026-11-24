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
  assert.equal(layout.distance,175000);
  assert.equal(layout.gates,68);
  assert.equal(layout.openings,85);
  assert(layout.visualStage.deckSlabs>250,'continuous deck should cover route');
  assert(layout.visualStage.sideBlocks>300,'TECH district needs dense side factories');
  assert(layout.visualStage.stacks>100,'industrial stacks should be present');
  assert(layout.visualStage.trusses>40,'industrial overhead rhythm should be present');

  const depths=await page.evaluate(()=>[...new Set(map2Gates.map(g=>g.depth))].sort((a,b)=>a-b));
  assert.deepEqual(depths,[180,210,255,310]);
  const evidence=path.join(__dirname,'map2-08-evidence');fs.mkdirSync(evidence,{recursive:true});

  async function capture(progress,name){
    await page.evaluate(p=>{state.paused=false;state.routeProgress=p;state.laneX=0;state.laneY=0;},progress);
    await page.waitForTimeout(260);
    await page.evaluate(()=>{state.paused=true;map2UpdateVisibility(state.routeProgress);});
    const info=await page.evaluate(()=>{
      scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
      let visuals=0,onscreen=0;
      map2CourseGroup.traverse(o=>{
        if(!o.userData?.map2VisualOnly)return;
        visuals++;
        let visible=true,n=o;while(n){visible=visible&&n.visible;n=n.parent;}
        if(!visible)return;
        const p=new THREE.Vector3();o.getWorldPosition(p);const q=p.clone().project(camera);
        if(q.z>=-1&&q.z<=1&&Math.abs(q.x)<=1.35&&Math.abs(q.y)<=1.35)onscreen++;
      });
      const seg=map2Segment(state.routeProgress).kind;
      const gate=map2Gates.find(g=>g.distance+g.depth/2+35>=state.routeProgress&&g.distance-state.routeProgress<2600)||null;
      return {progress:state.routeProgress,seg,visuals,onscreen,visibleSections:map2Sections.filter(s=>s.visible).length,
        gate:gate&&{kind:gate.kind,distance:gate.distance,depth:gate.depth},
        background:scene.background.getHex(),fog:scene.fog.color.getHex()};
    });
    await page.screenshot({path:path.join(evidence,name+'.png')});
    return info;
  }
  const fast=await capture(12000,'01-fast-industrial');
  const techEntry=await capture(35200,'02-tech-entry');
  const hangar=await capture(37500,'03-between-factories');
  const dual=await capture(39750,'04-dual-factory');
  assert.equal(fast.seg,'FAST');assert(fast.onscreen>3,'FAST must still read as industrial surroundings');
  for(const x of [techEntry,hangar,dual]){
    assert.equal(x.seg,'TECH');assert(x.onscreen>8,'TECH must visibly surround the player with industry');
  }
  assert.equal(techEntry.background,0x172127);assert.equal(techEntry.fog,0x26343b);
  assert(html.includes('visualTunnelDepth=[680,540,760,620]'),'long factory tunnels must be visual-only');
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-08 industrial stage is visible and physical '+JSON.stringify({layout,depths,fast,techEntry,hangar,dual}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
