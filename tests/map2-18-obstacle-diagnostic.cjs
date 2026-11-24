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
  const out=await page.evaluate(()=>({
    obstacle0:map2Obstacles[0],
    obstacle1:map2Obstacles[1],
    gate0:map2Gates[0],
    obstacleKeys:[...new Set(map2Obstacles.flatMap(o=>Object.keys(o)))],
    gateKeys:[...new Set(map2Gates.flatMap(g=>Object.keys(g)))],
    touch:courseSegmentTouch.toString(),
    build:map2BuildCourse.toString().slice(0,18000),
    funcs:Object.getOwnPropertyNames(globalThis).filter(k=>/map2.*obstacle|obstacle.*map2|map2.*gate|gate.*map2/i.test(k))
  }));
  console.log('MAP2-18 DIAG '+JSON.stringify(out));
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});