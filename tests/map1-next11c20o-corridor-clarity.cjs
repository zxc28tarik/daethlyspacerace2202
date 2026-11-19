/* NEXT11C20O: genuine Chromium/Three.js evidence that Map1
   ring clutter is regrouped, not erased or made a new collision.
   Source index.html remains the actual game under test. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const out=path.join(__dirname,'next11c20o-evidence');
fs.mkdirSync(out,{recursive:true});
const errors=[];
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
   '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
   const page=await browser.newPage({viewport:{width:1280,height:720},
     deviceScaleFactor:1});
   page.on('pageerror',e=>errors.push(e.stack||e.message));
   const three=fs.readFileSync(
     require.resolve('three/build/three.min.js'),'utf8');
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
     r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>
     r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
     {waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof startGame==='function' &&
     !!h4Ship19Race&&!!h4Ship19Combat&&!!corridorGuideGroup,
     null,{timeout:25000});
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&
     state.activeMap===MAP_MODES.MAP1&&state.raceTime>.02,
     null,{timeout:25000});
   await page.evaluate(()=>{
     state.paused=true;
     const raf=window.requestAnimationFrame.bind(window);
     window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
   });
   const sample=async mode=>page.evaluate(mode=>{
     const gl=renderer.getContext();
     renderer.render(scene,camera);
     gl.finish();
     const lineMeshes=corridorGuideGroup.children.filter(m=>
       m.name?.startsWith('MAP1_C20O_')&&m.isLineSegments);
     const sectors=[];
     for(let sector=0;sector<5;sector++){
       const m=lineMeshes.filter(x=>x.userData.sector===sector);
       const major=m.find(x=>x.userData.ringKind==='major');
       const minor=m.find(x=>x.userData.ringKind==='minor');
       sectors.push({sector,majorCount:major?.userData.ringCount||0,
         minorCount:minor?.userData.ringCount||0,
         majorVerts:major?.geometry.getAttribute('position').count||0,
         minorVerts:minor?.geometry.getAttribute('position').count||0});
     }
     const majorFirst=lineMeshes.find(m=>
       m.userData.sector===0&&m.userData.ringKind==='major');
     const first=majorFirst.geometry.getAttribute('position');
     const expectedFrame=getRaceFrameAtDistance(160);
     const expectedRadius=getCorridorRadiusAt(160);
     const originalFirst=expectedFrame.center.clone()
       .addScaledVector(expectedFrame.right,expectedRadius);
     const actualFirst=new THREE.Vector3(first.getX(0),
       first.getY(0),first.getZ(0));
     // Checks exactly original corridor point, including curved route.
     const firstVertexError=actualFirst.distanceTo(originalFirst);
     const playerPartCount=h4Ship19Race.userData.parts;
     const combatPartCount=h4Ship19Combat.userData.parts;
     const ret={
       mode,map:state.activeMap,
       ringBatchCount:corridorGuideGroup.userData.ringBatchCount,
       ringOriginalCount:corridorGuideGroup.userData.ringOriginalCount,
       ringSectorCount:corridorGuideGroup.userData.ringSectorCount,
       ringEdgeSegments:corridorGuideGroup.userData.ringEdgeSegments,
       consolidated:corridorGuideGroup.userData.ringGeometryConsolidated,
       lineMeshes:lineMeshes.length,guideChildren:corridorGuideGroup.children.length,
       sectors,firstVertexError,playerPartCount,combatPartCount,
       majorOpacity:corridorGuideGroup.userData.majorRingMaterial.opacity,
       minorOpacity:corridorGuideGroup.userData.ringMaterial.opacity,
       dangerOpacity:corridorGuideGroup.userData.boundaryDangerMat.opacity,
       calls:renderer.info.render.calls,
       triangles:renderer.info.render.triangles,
       buffer:[gl.drawingBufferWidth,gl.drawingBufferHeight],
       glAntialias:!!gl.getContextAttributes()?.antialias,
       physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
         planetaryBuildingColliders.length],
       map4CombatVisible:h4Ship19Combat.visible,
       map1RaceVisible:h4Ship19Race.visible
     };
     // Preserve reliable frame evidence with synchronous gl.readPixels.
     const width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
     const raw=new Uint8Array(width*height*4);
     gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,raw);
     const out=new Uint8ClampedArray(raw.length),stride=width*4;
     for(let y=0;y<height;y++)
       out.set(raw.subarray(y*stride,(y+1)*stride),
         (height-1-y)*stride);
     const canvas=document.createElement('canvas');
     canvas.width=width;canvas.height=height;
     canvas.getContext('2d').putImageData(new ImageData(out,width,height),0,0);
     ret.png=canvas.toDataURL('image/png').split(',')[1];
     return ret;
   },mode);
   const first=await sample('MAP1');
   fs.writeFileSync(path.join(out,'map1-merged-rings-720p.png'),
     Buffer.from(first.png,'base64'));delete first.png;
   assert.equal(first.ringOriginalCount,192,
     'all 192 original race corridor rings must be retained');
   assert.equal(first.ringBatchCount,10,
     '5 sectors and 2 original ring material types = 10 batches');
   assert.equal(first.ringSectorCount,5);
   assert.equal(first.ringEdgeSegments,48);
   assert.equal(first.lineMeshes,10);
   assert.equal(first.guideChildren,42,
     '32 original long guidance lines + 10 grouped ring lines');
   assert.equal(first.consolidated,true);
   assert.equal(first.sectors.reduce((a,s)=>a+s.majorCount,0),39);
   assert.equal(first.sectors.reduce((a,s)=>a+s.minorCount,0),153);
   for(const s of first.sectors){
     assert(s.majorCount>0&&s.minorCount>0);
     assert.equal(s.majorVerts,s.majorCount*48*2);
     assert.equal(s.minorVerts,s.minorCount*48*2);
   }
   assert(first.firstVertexError<.003,
     'original 3D route & ring coordinates must be pixel-faithful');
   assert(first.minorOpacity>=.24&&first.minorOpacity<=.361);
   assert(first.majorOpacity>.69,'navigation emphasis must survive');
   assert(first.dangerOpacity>=.15,'race collision-warning must survive');
   assert.equal(first.playerPartCount,189);
   assert.equal(first.combatPartCount,249);
   assert.equal(first.map1RaceVisible,true);
   assert.deepEqual(first.physics,[6,36,200]);
   assert(first.calls>0&&first.triangles>1000);
   assert.deepEqual(first.buffer,[1280,720]);
   await page.evaluate(()=>{
     state.running=false;state.paused=false;
     document.getElementById('gameover-screen').classList.add('hidden');
     document.getElementById('start-screen').classList.remove('hidden');
     selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   });
   const second=await sample('MAP4');
   fs.writeFileSync(path.join(out,'map4-unaltered-720p.png'),
     Buffer.from(second.png,'base64'));delete second.png;
   assert.equal(second.map4CombatVisible,true);
   assert.equal(second.map1RaceVisible,false);
   assert.equal(second.playerPartCount,189);
   assert.equal(second.combatPartCount,249);
   assert.deepEqual(second.physics,[6,36,200]);
   assert(second.calls>0&&second.triangles>1000);
   assert.deepEqual(errors,[],errors.join('\n'));
   const report={pass:true,id:'NEXT11C20O',
     evidence:'original Map1 ring coordinates, same gameplay and Map4',
     initialLineLoopCount:192,currentRingLineDrawables:10,
     groupedReductionPercent:+((192-10)/192*100).toFixed(2),
     caution:'line objects reduced; visible draw calls depend on frustum/scene; not native FPS',
     map1:first,map4:second,errors};
   fs.writeFileSync(path.join(out,'corridor-batch-qa.json'),
     JSON.stringify(report,null,2));
   console.log('NEXT11C20O CORRIDOR WEBGL PASS '+JSON.stringify({
     oldRingObjects:192,groupedRingObjects:10,
     totalMap1Calls:first.calls,map4Calls:second.calls,
     ringVertexError:first.firstVertexError,
     unchangedSB07Parts:first.playerPartCount}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'qa-error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
