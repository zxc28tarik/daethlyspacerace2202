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
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof courseSegmentTouch==='function');
  await page.locator('#map-choice-2').click();
  const out=await page.evaluate(()=>{
    const buildings=(window.starbladeMap2BuildingColliders||[]);
    return map2Gates.filter(g=>g.kind==='GANTRY').map(g=>{
      const a={routeProgress:g.distance-220,laneX:g.laneX,laneY:-215};
      const b={...a,routeProgress:g.distance+220};
      const blockers=map2Obstacles.filter(o=>courseSegmentTouch(o,a,b,12.5)).map(o=>({
        d:o.routeProgress,x:o.laneX,y:o.laneY,hd:o.halfDepth,
        building:!!o.map2BuildingDerived,source:o.sourceRoot||null,type:o.type||null,
        dist:Math.abs(o.routeProgress-g.distance)
      }));
      return {gate:g.distance,laneX:g.laneX,blockers};
    });
  });
  console.log('MAP2-18 GANTRY_BLOCKERS '+JSON.stringify(out));
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});