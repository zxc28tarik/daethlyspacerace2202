/* NEXT11C21G3: metal-free collectible real WebGL QA */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21g3-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>Array.isArray(itemBoxes)&&itemBoxes.length>=45,
   null,{timeout:25000});
  const v=await page.evaluate(()=>{
   const first=itemBoxes[0],last=itemBoxes[itemBoxes.length-1];
   const all=itemBoxes.map(b=>{
    const list=[];b.art.traverse(o=>{if(o.isMesh)list.push(o)});
    return {radius:b.radius,meshCount:list.length,
     noMetal:list.every(m=>m.material.metalness===undefined||
      m.material.metalness===0),
     noCage:list.every(m=>!/cage|frame|metal/i.test(m.name)),
     noBox:list.every(m=>m.geometry.type!=='BoxGeometry'),
     visual:list.every(m=>m.userData.visualOnly&&m.userData.noCollider)};
   });
   const oldPosition=first.art.position.y,oldRot=first.spin.rotation.y;
   const clock=state.raceTime;
   state.raceTime=1.5; // force nonzero hover phase (raceTime=0 is sine origin)
   animateItemBoxes(.3);
   state.raceTime=clock;
   renderer.render(scene,camera);
   const gl=renderer.getContext();gl.finish();
   return {items:itemBoxes.length,five:all.every(x=>x.meshCount===5),
    noMetal:all.every(x=>x.noMetal&&x.noCage),
    noBox:all.every(x=>x.noBox),visual:all.every(x=>x.visual),
    radius49:all.every(x=>x.radius===49),
    sharedCrystal:first.spin.geometry===last.spin.geometry,
    sharedOrbit:first.orbit.geometry===last.orbit.geometry,
    crystalMetalness:first.spin.material.metalness,
    orbitRadius:first.orbit.geometry.parameters.radius,
    orbitWidth:first.orbit.geometry.parameters.tube,
    orbitOpacity:first.orbit.material.opacity,
    motion:Math.abs(first.spin.rotation.y-oldRot),
    float:Math.abs(first.art.position.y-oldPosition),
    aa:!!gl.getContextAttributes().antialias,glError:gl.getError()};
  });
  assert.equal(v.items,49);
  assert(v.five&&v.noMetal&&v.noBox&&v.visual&&v.radius49);
  assert(v.sharedCrystal&&v.sharedOrbit);
  assert.equal(v.crystalMetalness,0);
  assert.equal(v.orbitRadius,24);
  assert(v.orbitWidth<=.55&&v.orbitOpacity<=.4);
  assert(v.motion>0&&v.float>0&&v.aa&&v.glError===0);
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'no-metal-report.json'),
   JSON.stringify({pass:true,v,errors},null,2));
  console.log('NEXT11C21G3 NO METAL WEBGL PASS '+JSON.stringify(v));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});