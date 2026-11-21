/* NEXT11C21P: natural facet relief on the 320 ORIGINAL Map1 meteors.
 * Real Chromium/WebGL, same race camera baseline C21H and C21P pigments.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21p-evidence');
fs.mkdirSync(out,{recursive:true});
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
  await page.waitForFunction(()=>asteroids.length===320&&itemBoxes.length===49,
   null,{timeout:30000});
  const shape=await page.evaluate(()=>{
   const counts={SMALL:0,MEDIUM:0,LARGE:0};
   const samples=[],valid=asteroids.map((m,i)=>{
    counts[m.sizeClass]++;
    const geo=m.mesh.geometry,positions=geo.getAttribute('position'),
     colors=geo.getAttribute('color'),
     edges=m.mesh.children.find(x=>x.isLineSegments);
    if([0,2,4,9,319].includes(i)){
     const original=new THREE.DodecahedronGeometry(m.radius,1),
      o=original.getAttribute('position');let err=0;
     for(let p=0;p<o.count;p++)for(const axis of ['X','Y','Z'])
      err=Math.max(err,Math.abs(positions['get'+axis](p)-o['get'+axis](p)));
     samples.push({id:i,cls:m.sizeClass,vertices:positions.count,
      triangleCount:positions.count/3,error:err});
     original.dispose();
    }
    return geo.type==='DodecahedronGeometry'&&
     geo.parameters.detail===1&&geo.parameters.radius===m.radius&&
     geo.userData.map1MineralSurface==='C21H_FACET_TINT'&&
     geo.userData.map1DirectionalFacetRelief==='NEXT11C21P'&&
     geo.userData.sourceVertexPositionsUnchanged===true&&
     colors.count===positions.count&&
     m.mesh.material.vertexColors===true&&
     m.mesh.material.roughness>=.9&&
     m.mesh.material.metalness<.06&&
     edges.material.opacity<=.18&&edges.userData.noCollider===true&&
     edges.userData.visualOnly===true;
   });
   return {counts,valid:valid.every(Boolean),count:asteroids.length,
    originalObjects:[itemBoxes.length,
     staticObstacles.filter(x=>x.type==='BARRIER').length,
     wreckageModules.length],ship:h4Ship19Race.userData.parts,
    relief:MAP1_C21P_METEOR_RELIEF,samples,
    ringBatches:corridorGuideGroup.userData.ringBatchCount,
    roadPalette:MAP1_C21O_ROAD_PALETTE.slice(),
    starCount:starField.geometry.getAttribute('position').count};
  });
  assert.equal(shape.count,320);
  assert.deepEqual(shape.counts,{SMALL:128,MEDIUM:128,LARGE:64});
  assert(shape.valid&&shape.samples.every(x=>x.error<1e-6));
  assert.deepEqual(shape.originalObjects,[49,97,8]);
  assert.equal(shape.ship,189);
  assert.equal(shape.ringBatches,10);
  assert.deepEqual(shape.roadPalette,
   [0x49bfce,0x709bc8,0xb48abf,0x6aba9e,0xcfa57e]);
  assert.equal(shape.starCount,2600);
  assert.equal(shape.relief.strength,.19);
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:30000});

  const ab=await page.evaluate(()=>{
   state.paused=true;
   const ids=[4,9,14,19],meshes=ids.map(i=>asteroids[i]);
   const saved=meshes.map(a=>({
    a,position:a.mesh.position.clone(),quaternion:a.mesh.quaternion.clone(),
    visible:a.mesh.visible,colors:new Float32Array(a.mesh.geometry.getAttribute('color').array)
   }));
   const coords=[[240,-90,8],[330,110,50],[440,-25,-45],[555,70,35]];
   const vA=new THREE.Vector3(),vB=new THREE.Vector3(),
    vC=new THREE.Vector3(),abVec=new THREE.Vector3(),
    acVec=new THREE.Vector3(),normal=new THREE.Vector3();
   const config=MAP1_C21P_METEOR_RELIEF;
   // Mathematically undo only the added C21P relief factor. This
   // reconstructs the exact C21H face color attribute of each same meteor.
   let actualReliefMin=Infinity,actualReliefMax=-Infinity;
   const oldColors=saved.map(({a,colors})=>{
    const geo=a.mesh.geometry,pos=geo.getAttribute('position');
    const old=new Float32Array(colors);
    for(let vertex=0;vertex<pos.count;vertex+=3){
     vA.fromBufferAttribute(pos,vertex);
     vB.fromBufferAttribute(pos,vertex+1);
     vC.fromBufferAttribute(pos,vertex+2);
     abVec.subVectors(vB,vA);acVec.subVectors(vC,vA);
     normal.crossVectors(abVec,acVec).normalize();
     const dir=Math.max(-1,Math.min(1,
      normal.x*config.normalX+normal.y*config.normalY+normal.z*config.normalZ));
     const factor=1+config.strength*dir;
     actualReliefMin=Math.min(actualReliefMin,factor);
     actualReliefMax=Math.max(actualReliefMax,factor);
     for(let i=vertex*3;i<(vertex+3)*3;i++)old[i]/=factor;
    }
    return old;
   });
   // Stage four EXISTING large meteors in the camera field; scene
   // progress, game mechanics, random seed and original mesh counts remain.
   saved.forEach(({a},i)=>{
    const [d,x,y]=coords[i];
    const stage=makeCourseLocalGroup(state.routeProgress+d,
     state.laneX+x,state.laneY+y);
    a.mesh.position.copy(stage.position);
    a.mesh.quaternion.copy(stage.quaternion);
    a.mesh.visible=true;
   });
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
   let before,after;
   try {
    saved.forEach(({a},i)=>{
     const attr=a.mesh.geometry.getAttribute('color');
     attr.array.set(oldColors[i]);attr.needsUpdate=true;
    });
    before=frame();
    saved.forEach(({a,colors})=>{
     const attr=a.mesh.geometry.getAttribute('color');
     attr.array.set(colors);attr.needsUpdate=true;
    });
    after=frame();
   }finally{
    saved.forEach(({a,position,quaternion,visible,colors})=>{
     const attr=a.mesh.geometry.getAttribute('color');
     attr.array.set(colors);attr.needsUpdate=true;
     a.mesh.position.copy(position);
     a.mesh.quaternion.copy(quaternion);
     a.mesh.visible=visible;
    });
   }
   let changed=0,peak=0;
   for(let i=0;i<before.pixels.length;i+=4){
    const delta=Math.max(
     Math.abs(before.pixels[i]-after.pixels[i]),
     Math.abs(before.pixels[i+1]-after.pixels[i+1]),
     Math.abs(before.pixels[i+2]-after.pixels[i+2]));
    if(delta>=3)changed++;
    peak=Math.max(peak,delta);
   }
   const side=document.createElement('canvas');
   side.width=1600;side.height=900;
   const ctx=side.getContext('2d');
   ctx.drawImage(before.canvas,400,0,800,900,0,0,800,900);
   ctx.drawImage(after.canvas,400,0,800,900,800,0,800,900);
   return {before:{err:before.err,calls:before.calls,png:before.png},
    after:{err:after.err,calls:after.calls,png:after.png},
    comparison:side.toDataURL('image/png').split(',')[1],
    changed,peak,reliefRange:[actualReliefMin,actualReliefMax],
    restored:saved.every(x=>
     x.a.mesh.position.distanceTo(x.position)<1e-6&&
     x.a.mesh.quaternion.angleTo(x.quaternion)<1e-6&&
     x.a.mesh.visible===x.visible&&
     x.a.mesh.geometry.getAttribute('color').array.every((v,i)=>v===x.colors[i])),
    aa:!!gl.getContextAttributes().antialias};
  });
  assert(ab.aa&&ab.restored);
  assert.equal(ab.before.err,0);assert.equal(ab.after.err,0);
  assert.equal(ab.before.calls,ab.after.calls,'No additional draw calls');
  assert(ab.reliefRange[0]<.96&&ab.reliefRange[1]>1.04);
  assert(ab.changed>200&&ab.peak>=3,
   'Original in-world 4-meteor view must measurably improve');
  fs.writeFileSync(path.join(out,'c21p-old-meteor-faces.png'),
   Buffer.from(ab.before.png,'base64'));
  fs.writeFileSync(path.join(out,'c21p-natural-meteor-face-depth.png'),
   Buffer.from(ab.after.png,'base64'));
  fs.writeFileSync(path.join(out,'c21p-same-camera-side-by-side.png'),
   Buffer.from(ab.comparison,'base64'));
  delete ab.before.png;delete ab.after.png;delete ab.comparison;

  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,combat:h4Ship19Combat.userData.parts,
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],err:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');assert.equal(map4.combat,249);
  assert.deepEqual(map4.physics,[6,36,200]);assert.equal(map4.err,0);
  const returned=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,meteors:asteroids.length,
    rock:asteroids[4].mesh.geometry.userData.map1DirectionalFacetRelief,
    err:renderer.getContext().getError()};
  });
  assert.equal(returned.map,'map1');assert.equal(returned.meteors,320);
  assert.equal(returned.rock,'NEXT11C21P');
  assert.equal(returned.err,0);assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21P',shape,ab,map4,returned,errors,
   note:'True 1600x900 WebGL, identical actual Map1 race camera. Four ORIGINAL large rocks staged at 240/330/440/555m with restored transforms, shared original PBR materials and unchanged collision systems. Baseline reconstructs C21H triangle pigment by mathematically undoing ONLY C21P static per-face directional multiplier. No new geometry, lights, physics, shaders, drawcalls, RNG or objects.'};
  fs.writeFileSync(path.join(out,'meteor-facet-relief-regression.json'),
   JSON.stringify(report,null,2));
  console.log('NEXT11C21P NATURAL METEOR RELIEF WEBGL PASS '+JSON.stringify({
   rocks:shape.count,classes:shape.counts,
   changedPixels:ab.changed,peakDelta:ab.peak,
   drawCalls:[ab.before.calls,ab.after.calls],map4:map4.physics,
   errors}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});
