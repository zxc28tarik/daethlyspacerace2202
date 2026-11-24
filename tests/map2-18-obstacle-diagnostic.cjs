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
    const plain=o=>Object.fromEntries(Object.entries(o).filter(([k,v])=>v===null||['string','number','boolean'].includes(typeof v)));
    const o=map2Obstacles[0],g=map2Gates[0];
    return {
      obstacleCount:map2Obstacles.length,
      gateCount:map2Gates.length,
      obstacleKeys:Object.keys(o),
      obstacle:plain(o),
      gateKeys:Object.keys(g),
      gate:plain(g),
      opening:g.openings?.[0]||null,
      touch:courseSegmentTouch.toString().slice(0,3000),
      globals:Object.getOwnPropertyNames(globalThis).filter(k=>/map2.*obstacle|obstacle.*map2|map2.*gate|gate.*map2/i.test(k))
    };
  });
  console.log('MAP2-18 DIAG '+JSON.stringify(out));
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});