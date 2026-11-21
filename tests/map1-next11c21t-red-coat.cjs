/* NEXT11C21T — Original SB07 racing-red microfinish clean satin.
 * Real 1600×900 Chromium/WebGL A/B of original chase camera, same meshes.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21t-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Ship20ZenitBuild==='function'&&
   typeof startGame==='function'&&Array.isArray(itemBoxes)&&itemBoxes.length===49&&
   typeof h4Ship19Race!=='undefined'&&h4Ship19Race.userData.parts===189,
   null,{timeout:30000});
  const initial=await page.evaluate(()=>{
   const ship=h4Ship19Race,red=ship.children.find(m=>m.name==='NEXT11C20_SB07_RED'),
    hull=ship.children.find(m=>m.name==='NEXT11C20_SB07_HULL'),
    metal=ship.children.find(m=>m.name==='NEXT11C20_SB07_SECOND');
   const material=red.material,tex=material.roughnessMap;
   const c=tex.image,ctx=c.getContext('2d'),d=ctx.getImageData(0,0,128,128).data;
   const sizes=[];
   let sum=0,min=Infinity,max=-Infinity,white=0,black=0;
   for(let i=0;i<d.length;i+=4){
    const n=d[i];sum+=n;min=Math.min(min,n);max=Math.max(max,n);
    if(n>=235)white++;if(n<=170)black++;
   }
   const batches=ship.children.filter(x=>x.type==='Mesh');
   return {
     map:state.activeMap,parts:ship.userData.parts,
     originalFamilyCount:batches.length,
     materialFamilyNames:batches.map(m=>m.material.name).sort(),
     originalRedColor:material.color.getHex(),
     originalRedEmissive:material.emissive.getHex(),
     redEmissiveIntensity:material.emissiveIntensity,
     redRoughness:material.roughness,redMetalness:material.metalness,
     paintLift:ship.userData.paintSurfaceLift,
     redGeo:{count:red.geometry.getAttribute('position').count,
      color:red.geometry.getAttribute('color').count,
      uv:red.geometry.getAttribute('uv').count,
      normal:red.geometry.getAttribute('normal').count,
      originalMaterial:material.type},
     tex:{name:tex.name,revision:tex.userData.surfaceRevision,
      width:c.width,height:c.height,anisotropy:tex.anisotropy,
      wrapS:tex.wrapS,wrapT:tex.wrapT,mean:sum/16384,min,max,white,black},
     otherTexturesUnchanged:{
      hull:hull.material.roughnessMap.name,
      gunmetal:metal.material.roughnessMap.name,
      redSeparate:tex!==hull.material.roughnessMap&&
       tex!==metal.material.roughnessMap},
     objects:{stars:starField.geometry.getAttribute('position').count,
       clouds:nebulaGroup.children.length,asteroids:asteroids.length,
       barriers:staticObstacles.filter(x=>x.type==='BARRIER').length,
       gates:wreckageModules.length,boxes:itemBoxes.length,
       ringBatches:corridorGuideGroup.userData.ringBatchCount,
       fullRings:corridorGuideGroup.userData.ringOriginalCount,
       map4Ship:h4Ship19Combat.userData.parts},
     config:MAP1_C21T_RED_SATIN
   };
  });
  assert.equal(initial.map,'map1');
  assert.equal(initial.parts,189);
  assert.equal(initial.originalFamilyCount,7);
  assert.equal(initial.originalRedColor,0xc43838);
  assert.equal(initial.originalRedEmissive,0x631717);
  assert.deepEqual([initial.redRoughness,initial.redMetalness,initial.redEmissiveIntensity],
   [.47,.43,.29]);
  assert.equal(initial.paintLift,.016);
  assert.equal(initial.tex.name,'SB07_C21T_ORIGINAL_RED_SATIN_COAT');
  assert.equal(initial.tex.revision,'NEXT11C21T');
  assert.deepEqual([initial.tex.width,initial.tex.height,initial.tex.anisotropy],[128,128,4]);
  assert(initial.tex.mean>198&&initial.tex.mean<207);
  assert(initial.tex.min>=190&&initial.tex.max<=215);
  assert(initial.otherTexturesUnchanged.redSeparate);
  assert.equal(initial.redGeo.color,initial.redGeo.count);
  assert.equal(initial.redGeo.uv,initial.redGeo.count);
  assert.equal(initial.redGeo.normal,initial.redGeo.count);
  assert.deepEqual(initial.objects,{stars:2600,clouds:38,asteroids:320,
    barriers:97,gates:8,boxes:49,ringBatches:10,fullRings:192,map4Ship:249});
  assert.deepEqual(initial.config,{base:202,grit:.45,verticalFiber:3.1,diagonalFiber:1.2});
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
    state.raceTime>2,null,{timeout:30000});
  const ab=await page.evaluate(()=>{
   state.paused=true;
   renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
   const red=h4Ship19Race.children.find(x=>x.name==='NEXT11C20_SB07_RED');
   const tex=red.material.roughnessMap,canvas=tex.image,ctx=canvas.getContext('2d');
   const current=ctx.getImageData(0,0,128,128);
   const old=ctx.createImageData(128,128);
   let seed=0x07a11ce;
   for(let y=0;y<128;y++)for(let x=0;x<128;x++){
     seed=(Math.imul(seed,1664525)+1013904223)>>>0;
     const grit=(seed>>>28)-8,
       seam=(x%32<2||y%32<2)?-7:0,
       brushed=(y%7===0)?3:0,
       lum=Math.max(115,Math.min(245,216+grit+seam+brushed)),
       at=(y*128+x)*4;
     old.data[at]=old.data[at+1]=old.data[at+2]=lum;
     old.data[at+3]=255;
   }
   const materials=h4Ship19Race.children.map(x=>x.material);
   const saved={p:renderer.getPixelRatio(),
    counts:[h4Ship19Race.userData.parts,h4Ship19Race.children.length],
    redPos:red.geometry.getAttribute('position').array,
    redNormals:red.geometry.getAttribute('normal').array,
    map:tex,hex:red.material.color.getHex(),
    rough:red.material.roughness,
    mem:[renderer.info.memory.geometries,renderer.info.memory.textures]};
   const gl=renderer.getContext(),w=1600,h=900,stride=w*4;
   const snap=()=>{
     camera.updateMatrixWorld(true);h4Ship19Race.updateMatrixWorld(true);
     renderer.render(scene,camera);gl.finish();
     const glError=gl.getError(),drawCalls=renderer.info.render.calls;
     const raw=new Uint8Array(w*h*4),pixels=new Uint8ClampedArray(w*h*4);
     gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
     for(let row=0;row<h;row++)
      pixels.set(raw.subarray(row*stride,(row+1)*stride),(h-row-1)*stride);
     const c=document.createElement('canvas');c.width=w;c.height=h;
     c.getContext('2d').putImageData(new ImageData(pixels,w,h),0,0);
     return {glError,drawCalls,pixels,canvas:c,png:c.toDataURL('image/png').split(',')[1]};
   };
   let before,after;
   try{
     ctx.putImageData(old,0,0);tex.needsUpdate=true;
     before=snap();
     ctx.putImageData(current,0,0);tex.needsUpdate=true;
     after=snap();
   }finally{
     ctx.putImageData(current,0,0);tex.needsUpdate=true;
   }
   const originalBufferRestored=ctx.getImageData(0,0,128,128).data
      .every((x,i)=>x===current.data[i]);
   let changed=0,peak=0,soft=0;
   for(let i=0;i<before.pixels.length;i+=4){
     const delta=Math.max(
       Math.abs(before.pixels[i]-after.pixels[i]),
       Math.abs(before.pixels[i+1]-after.pixels[i+1]),
       Math.abs(before.pixels[i+2]-after.pixels[i+2]));
     if(delta>=3)changed++;if(delta>=1)soft++;
     peak=Math.max(peak,delta);
   }
   const side=document.createElement('canvas');side.width=1600;side.height=900;
   const c=side.getContext('2d');
   c.drawImage(before.canvas,400,0,800,900,0,0,800,900);
   c.drawImage(after.canvas,400,0,800,900,800,0,800,900);
   return {glErrors:[before.glError,after.glError],
    calls:[before.drawCalls,after.drawCalls],changed,soft,peak,
    aa:!!gl.getContextAttributes().antialias,
    restored:originalBufferRestored&&saved.map===tex&&
       saved.redPos===red.geometry.getAttribute('position').array&&
       saved.redNormals===red.geometry.getAttribute('normal').array&&
       saved.hex===red.material.color.getHex()&&
       saved.rough===red.material.roughness&&
       saved.counts[0]===h4Ship19Race.userData.parts&&
       saved.counts[1]===h4Ship19Race.children.length&&
       h4Ship19Race.children.every((m,i)=>m.material===materials[i]),
    memBefore:saved.mem,
    memAfter:[renderer.info.memory.geometries,renderer.info.memory.textures],
    before:before.png,after:after.png,
    side:side.toDataURL('image/png').split(',')[1]};
  });
  assert(ab.aa&&ab.restored);
  assert.deepEqual(ab.glErrors,[0,0]);
  assert.equal(ab.calls[0],ab.calls[1]);
  assert.deepEqual(ab.memBefore,ab.memAfter);
  // Changes may be subtle at zoomed race chase distance; require a real
  // non-zero actual camera difference, never invent dramatic pixel counts.
  assert(ab.soft>0,'The original race-view red coating should produce real pixel change');
  for(const [k,file] of [
   ['before','c21t-original-red-ribbon-gridded-roughness.png'],
   ['after','c21t-original-red-ribbon-satin-roughness.png'],
   ['side','c21t-same-race-camera-red-coat-comparison.png']
  ])fs.writeFileSync(path.join(out,file),Buffer.from(ab[k],'base64'));
  delete ab.before;delete ab.after;delete ab.side;
  const map4=await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
    renderer.render(scene,camera);
    return {map:state.activeMap,combatParts:h4Ship19Combat.userData.parts,
     raceHidden:!h4Ship19Race.visible,
     physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
       planetaryBuildingColliders.length],error:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');assert.equal(map4.combatParts,249);
  assert(map4.raceHidden);assert.deepEqual(map4.physics,[6,36,200]);
  assert.equal(map4.error,0);
  const back=await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
    renderer.render(scene,camera);
    return {map:state.activeMap,
     redTex:h4Ship19Race.children.find(m=>m.name==='NEXT11C20_SB07_RED')
      .material.roughnessMap.name,
     parts:h4Ship19Race.userData.parts,
     error:renderer.getContext().getError()};
  });
  assert.equal(back.map,'map1');assert.equal(back.parts,189);
  assert.equal(back.redTex,'SB07_C21T_ORIGINAL_RED_SATIN_COAT');
  assert.equal(back.error,0);assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'sb07-red-satin-regression.json'),
    JSON.stringify({pass:true,revision:'NEXT11C21T',initial,ab,map4,back,errors,
      note:'Original RED 128x128 roughness texture (same CanvasTexture object), same 7 material batches, same SB07 189 geometry parts and base colors. Reconstruct old 32px grid atlas and compare with new smooth satin map in the same ACTUAL game chase view; restore original image. Never move objects, alter shader, geometry, drive/boost, RNG, or Map4.'},null,2));
  console.log('NEXT11C21T ORIGINAL SB07 RED SATIN WEBGL PASS '+JSON.stringify({
    parts:initial.parts,originalRedHex:initial.originalRedColor,
    textureMean:initial.tex.mean,changedPixels:ab.changed,
    softPixels:ab.soft,peak:ab.peak,calls:ab.calls,map4:map4.physics,errors
  }));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
