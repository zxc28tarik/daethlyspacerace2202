// MAP2-25 feasibility scan — real building depth / entrance-interior-exit apertures
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  const out=await page.evaluate(()=>{
    const groups=map2LogicalBuildingGroups()
      .filter(g=>map2Segment(g.d).kind==='TECH')
      .sort((a,b)=>a.d-b.d);
    const offsets=[-900,-700,-520,-360,-180,0,180,360,520,700,900];
    const rows=[];
    for(const g of groups){
      const center=map2BuildingPassageAt(g.d);
      const samples=[];
      for(const off of offsets){
        const sd=THREE.MathUtils.clamp(g.d+off,0,MAP2_DISTANCE);
        if(map2Segment(sd).kind!=='TECH')continue;
        const solids=map2CollectRouteSolids(g.roots,sd);
        const found=map2FindBuildingRoadAperture(g.roots,sd,center);
        if(solids.length>0&&found.aperture){
          samples.push({off,d:sd,solids:solids.length,x:found.aperture.x,y:found.aperture.y,framed:!!found.aperture.framed,dir:found.aperture.directional});
        }
      }
      const neg=samples.filter(s=>s.off<0).sort((a,b)=>a.off-b.off);
      const pos=samples.filter(s=>s.off>0).sort((a,b)=>b.off-a.off);
      const cen=samples.find(s=>s.off===0);
      const entry=neg[0]||null,exit=pos[0]||null;
      const depth=entry&&exit?exit.d-entry.d:0;
      const framedSlices=samples.filter(s=>s.framed).length;
      rows.push({
        d:g.d,roots:g.roots.map(r=>r.name),transition:g.roots.some(r=>r.userData?.map2TransitionRoadClone),
        sampleCount:samples.length,framedSlices,entry,center:cen,exit,depth,
        candidate:!!(entry&&cen&&exit&&depth>=720&&framedSlices>=2)
      });
    }
    const candidates=rows.filter(r=>r.candidate);
    const deep=candidates.filter(r=>r.depth>=1040);
    return {
      groups:rows.length,
      candidates:candidates.length,
      deep:deep.length,
      transitions:candidates.filter(r=>r.transition).length,
      cores:candidates.filter(r=>!r.transition).length,
      framedHeavy:candidates.filter(r=>r.framedSlices>=5).length,
      depthStats:candidates.map(r=>r.depth).sort((a,b)=>a-b),
      candidateRows:candidates,
      failed:rows.filter(r=>!r.candidate).map(r=>({d:r.d,transition:r.transition,samples:r.sampleCount,framed:r.framedSlices,depth:r.depth,roots:r.roots.slice(0,2)}))
    };
  });
  console.log('MAP2-25 DEPTH_SCAN '+JSON.stringify(out));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});