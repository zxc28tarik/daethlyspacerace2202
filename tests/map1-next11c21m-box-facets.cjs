/* NEXT11C21M — only pigment on the 24 ORIGINAL cube vertices.
 * Real Chromium/WebGL: identical-game-camera baseline/face-tint and Map4 isolation.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21m-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[];
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   route=>route.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>itemBoxes.length===49&&asteroids.length===320&&
   wreckageModules.length===8,null,{timeout:30000});
  const shape=await page.evaluate(()=>{
   const b=itemBoxes[0],geo=b.spin.geometry,color=geo.getAttribute('color'),
    pos=geo.getAttribute('position'),normal=geo.getAttribute('normal'),
    original=new THREE.BoxGeometry(34,34,34),ref=original.getAttribute('position');
   let maxError=0;for(let i=0;i<pos.count;i++)
    for(let a=0;a<3;a++)maxError=Math.max(maxError,
     Math.abs(pos.array[i*3+a]-ref.array[i*3+a]));
   original.dispose();
   const meanFaces=[];
   for(let f=0;f<6;f++){
    const m=[0,0,0];
    for(let i=0;i<4;i++)for(let j=0;j<3;j++)
     m[j]+=color.array[((f*4+i)*3)+j]/4;
    meanFaces.push(m);
   }
   const keys=meanFaces.map(x=>x.map(c=>c.toFixed(3)).join(','));
   return {map:state.activeMap,count:itemBoxes.length,
    asteroids:asteroids.length,barriers:staticObstacles.filter(x=>x.type==='BARRIER').length,
    wrecks:wreckageModules.length,nebula:nebulaGroup.children.length,
    geometry:'BoxGeometry',width:geo.parameters.width,
    height:geo.parameters.height,depth:geo.parameters.depth,
    positions:pos.count,normals:normal.count,indices:geo.index.count,
    colorCount:color.count,usedVertexColor:b.spin.material.vertexColors,
    maxPositionError:maxError,originalSame:[...itemBoxes].every(x=>
     x.spin.geometry===geo&&x.spin.material===b.spin.material&&
     x.radius===49&&x.mesh.children.length===2&&
     x.spin.children.length===1&&
     x.edge.geometry.type==='EdgesGeometry'),
    uniqueFaces:new Set(keys).size,
    faces:meanFaces.map(rgb=>rgb.map(v=>+v.toFixed(4))),
    surfaceTag:geo.userData.map1OriginalCubeFacetDepth,
    rewardColor:b.spin.material.color.getHex(),
    rewardEdge:b.edge.material.color.getHex(),
    rewardCore:b.core.material.color.getHex(),
    stats:{ship:h4Ship19Race.userData.parts,
     starCount:starField.geometry.getAttribute('position').count,
     fog:[scene.fog.color.getHex(),scene.fog.density]}
   };
  });
  assert.equal(shape.map,'map1');
  assert.deepEqual([shape.count,shape.asteroids,shape.barriers,shape.wrecks,shape.nebula],
   [49,320,97,8,38]);
  assert.deepEqual([shape.width,shape.height,shape.depth,shape.positions,
   shape.normals,shape.indices,shape.colorCount],[34,34,34,24,24,36,24]);
  assert.equal(shape.maxPositionError,0);
  assert(shape.originalSame&&shape.usedVertexColor);
  assert.equal(shape.uniqueFaces,6);
  assert.equal(shape.surfaceTag,'NEXT11C21M');
  assert.deepEqual([shape.rewardColor,shape.rewardEdge,shape.rewardCore],
   [0x583895,0xd7c9ff,0x95dcea]);
  assert.deepEqual([shape.stats.ship,shape.stats.starCount],[189,2600]);
  assert.deepEqual(shape.stats.fog,[0x0d0e21,.00044]);
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:30000});
  const ab=await page.evaluate(()=>{
   state.paused=true;
   const b=itemBoxes[0],mesh=b.mesh,geo=b.spin.geometry,attr=geo.getAttribute('color'),
    saved={position:mesh.position.clone(),quaternion:mesh.quaternion.clone(),
     visible:mesh.visible}, colors=new Float32Array(attr.array);
   const stage=makeCourseLocalGroup(state.routeProgress+185,
    state.laneX+45,state.laneY+20);
   mesh.position.copy(stage.position);mesh.quaternion.copy(stage.quaternion);
   mesh.visible=true;
   const gl=renderer.getContext(),w=1600,h=900,stride=w*4;
   const frame=()=>{
    renderer.render(scene,camera);gl.finish();
    const err=gl.getError(),calls=renderer.info.render.calls,
     raw=new Uint8Array(w*h*4),flipped=new Uint8ClampedArray(w*h*4);
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    for(let y=0;y<h;y++)
     flipped.set(raw.subarray(y*stride,(y+1)*stride),(h-1-y)*stride);
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').putImageData(new ImageData(flipped,w,h),0,0);
    return {err,calls,canvas,pixels:flipped,
     png:canvas.toDataURL('image/png').split(',')[1]};
   };
   let old,now;
   try {
    // Neutral vertex multiplier equals C21L's original, untinted cube.
    attr.array.fill(1);attr.needsUpdate=true;old=frame();
    attr.array.set(colors);attr.needsUpdate=true;now=frame();
   } finally {
    attr.array.set(colors);attr.needsUpdate=true;
    mesh.position.copy(saved.position);mesh.quaternion.copy(saved.quaternion);
    mesh.visible=saved.visible;
   }
   let changed=0,peak=0;
   for(let i=0;i<old.pixels.length;i+=4){
    const delta=Math.max(
     Math.abs(old.pixels[i]-now.pixels[i]),
     Math.abs(old.pixels[i+1]-now.pixels[i+1]),
     Math.abs(old.pixels[i+2]-now.pixels[i+2]));
    if(delta>=3)changed++;
    peak=Math.max(peak,delta);
   }
   const both=document.createElement('canvas');both.width=1600;both.height=900;
   const ctx=both.getContext('2d');
   ctx.drawImage(old.canvas,400,0,800,900,0,0,800,900);
   ctx.drawImage(now.canvas,400,0,800,900,800,0,800,900);
   return {before:{err:old.err,calls:old.calls,png:old.png},
    after:{err:now.err,calls:now.calls,png:now.png},
    both:both.toDataURL('image/png').split(',')[1],
    changed,peak,
    restored:mesh.position.distanceTo(saved.position)<1e-6&&
     mesh.quaternion.angleTo(saved.quaternion)<1e-6&&
     mesh.visible===saved.visible&&attr.array.every((v,i)=>v===colors[i]),
    aa:!!gl.getContextAttributes().antialias};
  });
  assert(ab.aa&&ab.restored);
  assert.equal(ab.before.err,0);assert.equal(ab.after.err,0);
  assert.equal(ab.before.calls,ab.after.calls,'No new drawcalls for same mesh');
  assert(ab.changed>30&&ab.peak>=3,
   'Six faces must cause some visible pixel difference in identical camera');
  fs.writeFileSync(path.join(out,'c21m-original-flat-map1-camera.png'),
   Buffer.from(ab.before.png,'base64'));
  fs.writeFileSync(path.join(out,'c21m-refined-facets-map1-camera.png'),
   Buffer.from(ab.after.png,'base64'));
  fs.writeFileSync(path.join(out,'c21m-before-after-same-camera.png'),
   Buffer.from(ab.both,'base64'));
  delete ab.before.png;delete ab.after.png;delete ab.both;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,ship:h4Ship19Combat.userData.parts,
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],err:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');assert.equal(map4.ship,249);
  assert.deepEqual(map4.physics,[6,36,200]);assert.equal(map4.err,0);
  const returned=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,boxes:itemBoxes.length,
    sameColor:itemBoxes.every(x=>x.spin.geometry.getAttribute('color').count===24),
    fog:[scene.fog.color.getHex(),scene.fog.density],
    err:renderer.getContext().getError()};
  });
  assert.equal(returned.map,'map1');
  assert(returned.sameColor&&returned.boxes===49&&returned.err===0);
  assert.deepEqual(returned.fog,[0x0d0e21,.00044]);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21M',shape,ab,map4,returned,errors,
   note:'No added faces, mesh, triangles, textures, shaders, objects or drawcalls. Neutral baseline restores original C21L purple surface using the SAME existing 24 positions; improved uses only deterministic face vertex color. Old 34-box, 36-edge and 9-core geometry and reward systems untouched.'};
  fs.writeFileSync(path.join(out,'box-facet-regression.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21M ORIGINAL BOX FACETS WEBGL PASS '+JSON.stringify({
   items:shape.count,vertices:shape.positions,uniqueFaces:shape.uniqueFaces,
   changedPixels:ab.changed,peakDelta:ab.peak,
   drawCalls:[ab.before.calls,ab.after.calls],map4:map4.physics,errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
