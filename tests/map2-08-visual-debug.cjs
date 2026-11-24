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
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof selectMap==='function'&&typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  const evidence=path.join(__dirname,'map2-08-debug-evidence');fs.mkdirSync(evidence,{recursive:true});
  const positions=[35000,36000,37500,39000,39750,41000];
  const report=[];
  for(const d of positions){
    await page.evaluate((progress)=>{state.routeProgress=progress;state.laneX=0;state.laneY=0;state.paused=false;},d);
    await page.waitForTimeout(120);
    await page.evaluate(()=>{state.paused=true;map2UpdateVisibility(state.routeProgress);});
    const snap=await page.evaluate(()=>{
      scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
      const nearest=map2Obstacles.slice().sort((a,b)=>Math.abs(a.routeProgress-state.routeProgress)-Math.abs(b.routeProgress-state.routeProgress)).slice(0,8).map(o=>{
        const p=new THREE.Vector3();o.mesh.getWorldPosition(p);const ndc=p.clone().project(camera);
        let chain=true,n=o.mesh;while(n){chain=chain&&n.visible;n=n.parent;}
        let materialVisible=null;
        const child=o.mesh.children.find(c=>c.isMesh)||null;
        if(child?.material)materialVisible=Array.isArray(child.material)?child.material.every(m=>m.visible!==false):child.material.visible!==false;
        return {kind:o.mesh.name,route:o.routeProgress,delta:o.routeProgress-state.routeProgress,world:[+p.x.toFixed(1),+p.y.toFixed(1),+p.z.toFixed(1)],
          ndc:[+ndc.x.toFixed(3),+ndc.y.toFixed(3),+ndc.z.toFixed(3)],visibleChain:chain,materialVisible};
      });
      const gate=map2Gates.find(g=>g.distance+g.depth/2+35>=state.routeProgress&&g.distance-state.routeProgress<2500)||null;
      return {progress:state.routeProgress,camera:[camera.position.x,camera.position.y,camera.position.z].map(v=>+v.toFixed(1)),
        pos:[state.pos.x,state.pos.y,state.pos.z].map(v=>+v.toFixed(1)),courseVisible:map2CourseGroup.visible,
        visibleSections:map2Sections.filter(x=>x.visible).length,gate:gate&&{distance:gate.distance,kind:gate.kind,depth:gate.depth},nearest};
    });
    report.push(snap);
    await page.screenshot({path:path.join(evidence,'map2-'+d+'.png')});
  }
  assert.deepEqual(errors,[]);
  console.log('MAP2_VISUAL_DEBUG '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
