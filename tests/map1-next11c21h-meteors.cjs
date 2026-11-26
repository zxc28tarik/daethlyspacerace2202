/* NEXT11C21H — existing asteroid model visual-only WebGL validation. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21h-evidence');fs.mkdirSync(out,{recursive:true});
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
  await page.waitForFunction(()=>Array.isArray(asteroids)&&asteroids.length===320,
   null,{timeout:30000});
  const shape=await page.evaluate(()=>{
   const counts={SMALL:0,MEDIUM:0,LARGE:0},samples=[],colors=[];
   const all=asteroids.map((a,i)=>{
    counts[a.sizeClass]++;
    const geo=a.mesh.geometry,vertex=geo.getAttribute('position'),
     tint=geo.getAttribute('color'),edges=a.mesh.children.find(x=>x.isLineSegments);
    if(!tint||!edges)return false;
    if([0,2,4,155,319].includes(i)){
     const old=new THREE.DodecahedronGeometry(a.radius,1),
      before=old.getAttribute('position');
     let err=0;
     for(let k=0;k<before.count;k++)
      err=Math.max(err,Math.abs(before.getX(k)-vertex.getX(k)),
       Math.abs(before.getY(k)-vertex.getY(k)),
       Math.abs(before.getZ(k)-vertex.getZ(k)));
     samples.push({i,cls:a.sizeClass,radius:a.radius,vertexCount:vertex.count,err});
     old.dispose();
    }
    if([0,2,4].includes(i))for(let j=0;j<tint.count;j++)
     colors.push(tint.getX(j));
    return a.mesh.name==='MAP1_ORIGINAL_METEOR_REFINED'&&
     geo.type==='DodecahedronGeometry'&&geo.parameters.detail===1&&
     geo.parameters.radius===a.radius&&tint.count===vertex.count&&
     geo.userData.sourceVertexPositionsUnchanged===true&&
     a.mesh.material.vertexColors===true&&a.mesh.material.roughness>=.9&&
     edges.material.opacity<=.18&&edges.userData.noCollider===true&&
     edges.userData.visualOnly===true;
   });
   return {count:asteroids.length,counts,allValid:all.every(Boolean),samples,
    pigmentRange:[Math.min(...colors),Math.max(...colors)],
    originalBoxes:itemBoxes.length===49&&itemBoxes.every(b=>
     b.radius===49&&b.spin.geometry.type==='BoxGeometry'&&
     b.spin.geometry.parameters.width===34)};
  });
  assert.equal(shape.count,320);
  assert.deepEqual(shape.counts,{SMALL:128,MEDIUM:128,LARGE:64});
  assert(shape.allValid&&shape.originalBoxes);
  assert(shape.samples.every(s=>s.err<1e-6));
  assert(shape.pigmentRange[1]-shape.pigmentRange[0]>.14);
  const studio=await page.evaluate(()=>{
   const stage=new THREE.Scene();stage.background=new THREE.Color(0x0b1020);
   stage.add(new THREE.HemisphereLight(0xd5dcff,0x1b1b27,1.35));
   const l=new THREE.DirectionalLight(0xffffff,2);l.position.set(40,85,175);
   stage.add(l);
   const oldMat={
    SMALL:{color:0x84839d,roughness:.79,metalness:.16,emissive:0x0b1622},
    MEDIUM:{color:0x81748d,roughness:.80,metalness:.19,emissive:0x120c26},
    LARGE:{color:0x8e7280,roughness:.84,metalness:.20,emissive:0x220d1a}
   };
   const outlineOld=new THREE.LineBasicMaterial({color:0x5ccddb,
    transparent:true,opacity:.24,depthWrite:false});
   for(const [i,y] of [[0,103],[2,0],[4,-106]]){
    const a=asteroids[i];
    const old=new THREE.Mesh(a.mesh.geometry,
     new THREE.MeshStandardMaterial({...oldMat[a.sizeClass],flatShading:true}));
    old.position.set(-115,y,0);old.rotation.set(.3,.35,.16);
    old.add(new THREE.LineSegments(new THREE.EdgesGeometry(a.mesh.geometry,25),outlineOld));
    stage.add(old);
    const improved=a.mesh.clone(true);
    improved.position.set(115,y,0);improved.rotation.set(.3,.35,.16);
    stage.add(improved);
   }
   const cam=new THREE.PerspectiveCamera(39,1600/900,.1,1100);
   cam.position.set(0,20,490);cam.lookAt(0,0,0);
   renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
   renderer.render(stage,cam);
   const gl=renderer.getContext();gl.finish();
   const error=gl.getError(),calls=renderer.info.render.calls;
   const w=1600,h=900,stride=w*4,raw=new Uint8Array(w*h*4),
    rgba=new Uint8ClampedArray(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   for(let y=0;y<h;y++)rgba.set(raw.subarray(y*stride,(y+1)*stride),(h-1-y)*stride);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   return {calls,error,aa:!!gl.getContextAttributes().antialias,
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert.equal(studio.calls,12);assert(studio.aa&&studio.error===0);
  fs.writeFileSync(path.join(out,'meteors-original-vs-polished.png'),
   Buffer.from(studio.png,'base64'));delete studio.png;
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:25000});
  const race=await page.evaluate(()=>{
   state.paused=true;
   const a=asteroids[4],p=a.mesh.position.clone(),q=a.mesh.quaternion.clone(),
    visible=a.mesh.visible;
   const staged=makeCourseLocalGroup(state.routeProgress+260,
    state.laneX+64,state.laneY+22);
   a.mesh.position.copy(staged.position);a.mesh.quaternion.copy(staged.quaternion);
   a.mesh.visible=true;
   renderer.render(scene,camera);
   const gl=renderer.getContext();gl.finish();
   const err=gl.getError(),calls=renderer.info.render.calls;
   const w=1600,h=900,stride=w*4,raw=new Uint8Array(w*h*4),
    rgba=new Uint8ClampedArray(w*h*4);
   gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
   for(let y=0;y<h;y++)rgba.set(raw.subarray(y*stride,(y+1)*stride),(h-1-y)*stride);
   const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
   canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
   a.mesh.position.copy(p);a.mesh.quaternion.copy(q);a.mesh.visible=visible;
   return {err,calls,restored:a.mesh.position.distanceTo(p)<1e-5,
    ship:h4Ship19Race.userData.parts,
    png:canvas.toDataURL('image/png').split(',')[1]};
  });
  assert(race.err===0&&race.restored);assert.equal(race.ship,189);
  fs.writeFileSync(path.join(out,'meteor-in-real-map1-camera.png'),
   Buffer.from(race.png,'base64'));delete race.png;
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
  assert.deepEqual(errors,[]);
  fs.writeFileSync(path.join(out,'meteor-acceptance-report.json'),
   JSON.stringify({pass:true,id:'NEXT11C21H',shape,studio,race,map4,errors,
    note:'Side by side identical DodecahedronGeometry vertex positions and radius; only surface colors and edge material changed. Game camera screenshot stages and restores one meteor position, so the route and gameplay remain unchanged.'},null,2));
  console.log('NEXT11C21H METEOR SURFACE WEBGL PASS '+JSON.stringify({
   meteorCount:shape.count,sizes:shape.counts,boxRestored:shape.originalBoxes,
   originalVertices:shape.samples.every(s=>s.err===0),
   drawCalls:studio.calls,map4,errors}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});
