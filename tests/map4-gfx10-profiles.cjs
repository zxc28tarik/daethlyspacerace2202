/* NEXT10 / GFX10 visual budgets: tests real Chromium without changing game balance. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
   '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 try{
   const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
     r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>
     r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
     {waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof h4Gfx10SetProfile==='function'&&typeof selectMap==='function',
     null,{timeout:15000});
   assert.equal(await page.locator('#h4-quality-picker').isVisible(),false,
     'Map1 must not inherit the Map4 quality menu');
   await page.locator('#map-choice-4').click();
   assert.equal(await page.locator('#h4-quality-picker').isVisible(),true);
   await page.locator('#h4-quality-select').selectOption('BALANCED');
   assert.equal(await page.evaluate(()=>h4Gfx10ProfileName),'BALANCED');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.raceTime>.06,null,{timeout:30000});
   const initial=await page.evaluate(()=>({
     competitors:racers.length,hunters:hunterTargets.length,
     canyonColliders:typeof h4Gfx02ColliderStats!=='undefined' ? h4Gfx02ColliderStats.count : null,
     industryColliders:h4IndustrialColliders.length,
     legacyBuildingColliders:planetaryBuildingColliders.length,
     realTimeLimit:MAP4_RACE_RULES.realTimeLimit,
     arenaSeconds:MAP4_PHASES.arenaSeconds,
     orbitAltitude:MAP4_PHASES.orbitAltitude,
     score:state.score,weaponShots:state.hunterShots
   }));
   assert.equal(initial.competitors,5);
   assert.equal(initial.hunters,8);
   assert.equal(initial.realTimeLimit,300);
   assert.equal(initial.arenaSeconds,60);
   assert.equal(initial.orbitAltitude,850);
   assert.equal(initial.industryColliders,36);
   const samples=[];
   for(const preset of ['HIGH','BALANCED','LOW']){
     const data=await page.evaluate(preset=>{
       h4Gfx10SetProfile(preset);
       h4Gfx08Reset();
       const emitted=[];
       for(let i=0;i<48;i++)emitted.push(h4Gfx08Emit('SMOKE',state.pos,1,0xb2aa9c));
       h4Gfx08Update(.015);
       const metrics={
         preset:h4Gfx10ProfileName,
         pixelRatio:renderer.getPixelRatio(),
         drawingWidth:renderer.domElement.width,
         smokeVisible:h4Gfx08Meshes[H4_GFX08_TYPES.SMOKE].count,
         smokeCapacity:H4_GFX08_LIMITS[H4_GFX08_TYPES.SMOKE],
         lodRange:h4Gfx10CurrentProfile().lodRange,
         detailRange:h4Gfx10CurrentProfile().detailRange,
         lightBudget:h4Gfx10CurrentProfile().localLights,
         activeMap:state.activeMap
       };
       h4Gfx08Reset();
       return metrics;
     },preset);
     assert.equal(data.preset,preset);
     assert.equal(data.activeMap,'map4');
     assert(data.smokeVisible<=data.smokeCapacity);
     assert(data.smokeVisible>=12,'most recent important visual smoke must be visible');
     samples.push(data);
     await page.screenshot({
       path:path.join(__dirname,'map4-gfx10-'+preset.toLowerCase()+'-720p.png')
     });
   }
   assert(samples[0].pixelRatio>samples[1].pixelRatio);
   assert(samples[1].pixelRatio>samples[2].pixelRatio);
   assert(samples[0].drawingWidth>samples[1].drawingWidth);
   assert(samples[1].drawingWidth>samples[2].drawingWidth);
   assert(samples[0].smokeVisible>samples[1].smokeVisible);
   assert(samples[1].smokeVisible>samples[2].smokeVisible);
   assert(samples[0].lodRange>samples[1].lodRange);
   assert(samples[1].lodRange>samples[2].lodRange);
   assert.equal(samples[0].lightBudget,true);
   assert.equal(samples[2].lightBudget,false);
   assert.equal(await page.evaluate(()=>h4Gfx10SetProfile('ULTRA')),false,'bad preset rejected');

   // Quality must NOT affect deadlines, colliders, competition or player weapons.
   const restored=await page.evaluate(()=>{
     const snapshot={
       competitors:racers.length,hunters:hunterTargets.length,
       industryColliders:h4IndustrialColliders.length,
       legacyBuildingColliders:planetaryBuildingColliders.length,
       realTimeLimit:MAP4_RACE_RULES.realTimeLimit,
       arenaSeconds:MAP4_PHASES.arenaSeconds,
       orbitAltitude:MAP4_PHASES.orbitAltitude,
       score:state.score,weaponShots:state.hunterShots
     };
     h4Gfx10RecordFrame(16.6);
     h4Gfx10RecordFrame(18.0);
     const counters={samples:h4Gfx10Stats.samples,
       triangles:h4Gfx10Stats.triangles,
       geometries:h4Gfx10Stats.geometries,
       textures:h4Gfx10Stats.textures,
       gpuClaim:h4Gfx10Stats.hardwareGpuFpsVerified};
     return {snapshot,counters};
   });
   for(const k of ['competitors','hunters','industryColliders','legacyBuildingColliders',
     'realTimeLimit','arenaSeconds','orbitAltitude','score','weaponShots']){
      assert.equal(restored.snapshot[k],initial[k],'visual budget changed '+k);
   }
   assert.equal(restored.counters.gpuClaim,false,'rAF telemetry is NOT GPU benchmarking');
   assert(restored.counters.samples>0,'rAF telemetry working');

   // Confirm live F7 switch and return to Map1 restores exactly original render scale.
   const current=await page.evaluate(()=>h4Gfx10ProfileName);
   assert.equal(current,'LOW');
   await page.keyboard.press('F7');
   assert.equal(await page.evaluate(()=>h4Gfx10ProfileName),'HIGH','F7 cycles presets');
   await page.evaluate(()=>{
     endGame(false);
     document.getElementById('start-screen').classList.remove('hidden');
     document.getElementById('gameover-screen').classList.add('hidden');
     selectMap(MAP_MODES.MAP1);
   });
   const map1=await page.evaluate(()=>({
     selected:state.activeMap,
     pixelRatio:renderer.getPixelRatio(),
     width:renderer.domElement.width,
     pickerHidden:document.getElementById('h4-quality-picker').classList.contains('hidden'),
     qualityHudHidden:document.getElementById('h4-quality-hud').classList.contains('hidden'),
     map4World:planetaryWorldGroup.visible
   }));
   assert.equal(map1.selected,'map1');
   assert.equal(map1.pixelRatio,1,'Map1 exact prior default DPR restored');
   assert.equal(map1.width,1280);
   assert.equal(map1.pickerHidden,true);
   assert.equal(map1.qualityHudHidden,true);
   assert.equal(map1.map4World,false);
   assert.equal(errors.length,0,'page errors: '+errors.join(' / '));
   console.log('GFX10 profiles PASS',JSON.stringify({samples,initial,restored,map1}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
