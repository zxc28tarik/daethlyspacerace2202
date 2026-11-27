'use strict';
// Unsupported decompression or a missing archive may not silently construct Map4.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
 try{
  for(const variant of ['unsupported','missing-archive']){
   const page=await browser.newPage({viewport:{width:1280,height:720}});
   try{
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
    if(variant==='unsupported')await page.addInitScript(()=>Object.defineProperty(window,'DecompressionStream',{value:undefined,configurable:true}));
    await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:90000});
    await page.waitForFunction(()=>typeof map2BuildCourse==='function');
    if(variant==='missing-archive')await page.evaluate(()=>document.getElementById('map2-48-gzip-archive').remove());
    await page.locator('#map-choice-2').click();
    await page.waitForFunction(()=>window.starbladeMap2IndependentAssets?.mode==='MAP2_ASSET_LOAD_FAILED',null,{timeout:90000});
    assert(await page.locator('#start-btn').isDisabled());
    assert.match(await page.locator('#start-btn').innerText(),/HARİTA 2 AÇILAMADI/);
    const result=await page.evaluate(()=>({map4Regions:planetaryWorldRegions.length,library:!!map2IndependentLibrary,running:state.running}));
    assert.deepEqual(result,{map4Regions:0,library:false,running:false});
    await page.locator('#map-choice-1').click();
    await page.waitForFunction(()=>state.activeMap==='map1'&&!document.getElementById('start-btn').disabled);
    assert.equal(await page.evaluate(()=>planetaryWorldRegions.length),0);
    console.log('PASS MAP2-50 blocked legacy fallback '+variant+' '+JSON.stringify(result));
   }finally{await page.close();}
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
