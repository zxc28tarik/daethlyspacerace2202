'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try {
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Next22eWarfrontDress==='function',
   null,{timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,
   null,{timeout:20000});
  const signature=await page.evaluate(()=>{
   const zone=planetaryWorldRegions[1];
   const root=zone.getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
   const materials=root?.children.map(x=>x.material.type);
   const counts=root?.children.map(x=>x.count);
   const names=root?.children.map(x=>x.name);
   return {root:Boolean(root),name:root?.name,counts,names,materials,
    rootNoCollider:root?.userData.noCollider,
    visualOnly:root?.children.every(x=>x.userData.visualOnly&&
     x.userData.noCollider&&!x.userData.h4Collider),
    batches:h4Next22eStats.batches,instances:h4Next22eStats.instances,
    byType:{...h4Next22eStats.byType},
    oldBatches:h4Gfx11bArenaStats.batches,
    oldInstances:h4Gfx11bArenaStats.instances,
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],errors:renderer.getContext().getError()};
  });
  assert.equal(signature.root,true);
  assert.equal(signature.rootNoCollider,true);
  assert.deepEqual(signature.counts,[28,24,18,24,18]);
  assert.deepEqual(signature.byType,{ribs:28,brokenDecks:24,warningLamps:18,deckEdges:24,beaconHalos:18});
  assert.equal(signature.batches,5);assert.equal(signature.instances,112);
  assert.equal(signature.oldBatches,4);assert.equal(signature.oldInstances,74);
  assert.equal(signature.visualOnly,true);
  assert.equal(signature.errors,0);
  assert.deepEqual(signature.colliders.slice(0,2),[6,36]);
  assert.equal(errors.length,0,errors.join('; '));
  console.log('NEXT22E+22F WEBGL SCENE PASS',JSON.stringify(signature));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
