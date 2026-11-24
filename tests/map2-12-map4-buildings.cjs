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
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof selectMap==='function');
  assert(await page.locator('#map-choice-4').isDisabled(),'Map4 must remain locked');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  const layout=await page.evaluate(()=>window.starbladeMap2Layout);
  assert(layout.visualStage.map4BuildingKits>250,'Map4 building kits must populate most TECH cells');
  assert(layout.visualStage.map4BuildingMeshes>1500,'Map4 building mesh parts must replace box placeholders');
  assert.equal(await page.evaluate(()=>planetaryWorldRegions.length),0,'Map4 world itself must not be built/modified');

  const ev=path.join(__dirname,'map2-12-evidence');fs.mkdirSync(ev,{recursive:true});
  async function settle(progress,name){
    const lead=Math.max(0,progress-1200);
    await page.evaluate(p=>{state.paused=false;state.routeProgress=p;state.laneX=0;state.laneY=120;},lead);
    await page.waitForTimeout(350);
    for(let i=1;i<=12;i++){const p=lead+(progress-lead)*i/12;
      await page.evaluate(p=>{state.routeProgress=p;state.laneX=0;state.laneY=120;state.paused=false;},p);await page.waitForTimeout(60);}
    await page.evaluate(p=>{
      state.routeProgress=p;state.laneX=0;state.laneY=120;state.paused=true;
      const f=getRaceFrameAtDistance(p);
      state.pos.copy(f.center).addScaledVector(f.up,state.laneY);
      const basis=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
      const q=new THREE.Quaternion().setFromRotationMatrix(basis);
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(q));
      camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(p);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    },progress);
    const info=await page.evaluate(()=>{
      const counts={all:0,on:0,refinery:0,factory:0,power:0,outpost:0};
      map2CourseGroup.traverse(o=>{
        const n=o.name||'';if(!n.startsWith('MAP2_MAP4_'))return;
        let vis=true,a=o;while(a){vis=vis&&a.visible;a=a.parent;}if(!vis)return;
        counts.all++;
        if(n.includes('REFINERY'))counts.refinery++;
        if(n.includes('FACTORY'))counts.factory++;
        if(n.includes('POWER'))counts.power++;
        if(n.includes('OUTPOST'))counts.outpost++;
        const p=new THREE.Vector3();o.getWorldPosition(p);const q=p.clone().project(camera);
        if(q.z>=-1&&q.z<=1&&Math.abs(q.x)<=1.3&&Math.abs(q.y)<=1.3)counts.on++;
      });
      return {seg:map2Segment(state.routeProgress).kind,counts};
    });
    assert.equal(info.seg,'TECH');assert(info.counts.on>=8,'reused Map4 buildings must be visible in camera');
    await page.screenshot({path:path.join(ev,name+'.png')});
    return info;
  }
  const a=await settle(35200,'01-map4-buildings-tech-entry');
  const b=await settle(39750,'02-map4-buildings-dual-factory');
  const c=await settle(45200,'03-map4-buildings-industrial-canyon');
  const families=await page.evaluate(()=>{
    const names=[];map2CourseGroup.traverse(o=>{if((o.name||'').startsWith('MAP2_MAP4_'))names.push(o.name)});
    return {refinery:names.some(n=>n.includes('REFINERY')),factory:names.some(n=>n.includes('FACTORY')),
      power:names.some(n=>n.includes('POWER')),outpost:names.some(n=>n.includes('OUTPOST'))};
  });
  assert.deepEqual(families,{refinery:true,factory:true,power:true,outpost:true});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-12 actual Map4 building kits visible in Map2 '+JSON.stringify({visual:layout.visualStage,a,b,c,families}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
