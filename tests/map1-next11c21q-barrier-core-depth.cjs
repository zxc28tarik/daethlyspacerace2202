/* NEXT11C21Q — original 97 Map1 barrier cores, natural paint facet depth.
 * Real Chromium/WebGL 1600x900 same game camera A/B; no geometry/physics edits.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21q-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[];
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try {
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   route=>route.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>staticObstacles.filter(x=>x.type==='BARRIER').length===97&&
   itemBoxes.length===49&&asteroids.length===320,null,{timeout:30000});
  const initial=await page.evaluate(()=>{
   const obstacles=staticObstacles.filter(x=>x.type==='BARRIER');
   const geometryCounts={OctahedronGeometry:0,IcosahedronGeometry:0};
   const sampleIndices=[0,1,2,95,96];
   const samples=[],totals={faces:0,vertices:0},mat=obstacles[0].mesh.children[0].material;
   let allOriginal=true,minColor=Infinity,maxColor=-Infinity;
   obstacles.forEach((o,i)=>{
    const group=o.mesh,[core,front,back,spokes]=group.children;
    const geo=core.geometry,pos=geo.getAttribute('position'),
     normal=geo.getAttribute('normal'),color=geo.getAttribute('color');
    geometryCounts[geo.type]++;
    totals.vertices+=pos.count;totals.faces+=pos.count/3;
    const original=geo.type==='OctahedronGeometry'?
     new THREE.OctahedronGeometry(o.radius*.85,0):
     new THREE.IcosahedronGeometry(o.radius*.82,0);
    const prior=original.getAttribute('position');let maxError=0;
    for(let j=0;j<pos.count;j++)
     for(const a of ['X','Y','Z'])maxError=Math.max(maxError,
      Math.abs(pos['get'+a](j)-prior['get'+a](j)));
    original.dispose();
    if(sampleIndices.includes(i))samples.push({i,shape:geo.type,
     vertices:pos.count,triangles:pos.count/3,maxError});
    for(let j=0;j<color.count;j++){
     minColor=Math.min(minColor,color.getX(j),color.getY(j),color.getZ(j));
     maxColor=Math.max(maxColor,color.getX(j),color.getY(j),color.getZ(j));
    }
    allOriginal&&=geo.index===null&&pos.count===normal.count&&
     pos.count===color.count&&
     maxError<.000001&&
     geo.userData.map1OriginalBarrierCoreDepth==='NEXT11C21Q'&&
     geo.userData.originalCorePositionsUnchanged===true&&
     core.material===mat&&mat.map===courseHazardPaint&&
     mat.vertexColors&&mat.roughness===.74&&mat.metalness===.48&&
     group.children.length===4&&
     front.geometry.type==='TorusGeometry'&&
     back.geometry.type==='TorusGeometry'&&
     front.material===back.material&&
     front.geometry.parameters.radius===o.radius*1.02&&
     front.geometry.parameters.tube===3.5&&
     spokes.type==='LineSegments'&&
     spokes.material.color.getHex()===MAP1_C21L_LIGHT_BALANCE.barrierLine&&
     o.radius>0&&o.durability===3&&o.maxDurability===3;
   });
   const other={
    meteor:asteroids.length,boxes:itemBoxes.length,
    wrecks:wreckageModules.length,
    ringBatches:corridorGuideGroup.userData.ringBatchCount,
    ringCount:corridorGuideGroup.userData.ringOriginalCount,
    roadSectors:raceRoadGroup.userData.sectors.length,
    ship:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts]
   };
   return {map:state.activeMap,barriers:obstacles.length,
    geometryCounts,samples,totals,allOriginal,
    rgbRange:[minColor,maxColor],config:MAP1_C21Q_BARRIER_CORE_DEPTH,
    hull:{color:mat.color.getHex(),roughness:mat.roughness,
     metalness:mat.metalness,texture:mat.map.name,vertexColors:mat.vertexColors},
    ring:{front:obstacles[0].mesh.children[1].material.color.getHex(),
     opacity:obstacles[0].mesh.children[1].material.opacity},
    other};
  });
  assert.equal(initial.map,'map1');
  assert.equal(initial.barriers,97);
  assert(initial.allOriginal);
  assert.equal(initial.geometryCounts.OctahedronGeometry+
   initial.geometryCounts.IcosahedronGeometry,97);
  assert(initial.geometryCounts.OctahedronGeometry>0&&
   initial.geometryCounts.IcosahedronGeometry>0);
  assert(initial.samples.every(x=>x.maxError<1e-6));
  assert.deepEqual([initial.hull.color,initial.hull.roughness,
   initial.hull.metalness,initial.hull.texture,initial.hull.vertexColors],
   [0x807b82,.74,.48,'MAP1_C21I_HAZARD_PAINT',true]);
  assert.deepEqual([initial.ring.front,initial.ring.opacity],
   [0xf4a667,.74]);
  assert(initial.rgbRange[1]-initial.rgbRange[0]>.22);
  assert.equal(initial.config.base,.91);
  assert.equal(initial.config.directional,.19);
  assert.deepEqual(initial.other,{
   meteor:320,boxes:49,wrecks:8,ringBatches:10,ringCount:192,
   roadSectors:5,ship:[189,249]});

  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:30000});
  const ab=await page.evaluate(()=>{
   state.paused=true;
   const obstacles=staticObstacles.filter(x=>x.type==='BARRIER').slice(0,3);
   const saved=obstacles.map(o=>({
    o,p:o.mesh.position.clone(),q:o.mesh.quaternion.clone(),
    visible:o.mesh.visible,
    colors:new Float32Array(o.mesh.children[0].geometry.getAttribute('color').array)
   }));
   const spots=[[190,-70,24],[315,90,-18],[460,-20,68]];
   saved.forEach(({o},i)=>{
    const [d,x,y]=spots[i];
    const anchor=makeCourseLocalGroup(state.routeProgress+d,
     state.laneX+x,state.laneY+y);
    o.mesh.position.copy(anchor.position);o.mesh.quaternion.copy(anchor.quaternion);
    o.mesh.visible=true;
   });
   const gl=renderer.getContext(),w=1600,h=900,rowBytes=w*4;
   const render=()=>{
    renderer.render(scene,camera);gl.finish();
    const err=gl.getError(),calls=renderer.info.render.calls;
    const raw=new Uint8Array(w*h*4),pixels=new Uint8ClampedArray(w*h*4);
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    for(let row=0;row<h;row++)
     pixels.set(raw.subarray(row*rowBytes,(row+1)*rowBytes),
      (h-1-row)*rowBytes);
    const canvas=document.createElement('canvas');
    canvas.width=w;canvas.height=h;
    canvas.getContext('2d').putImageData(new ImageData(pixels,w,h),0,0);
    return {err,calls,pixels,canvas,png:canvas.toDataURL('image/png').split(',')[1]};
   };
   let before,after;
   try{
    // C21P baseline exact pre-C21Q uniform core vertex pigment.
    // Same materials, same model and course; only color attribute is neutral.
    saved.forEach(({o})=>{
     const colors=o.mesh.children[0].geometry.getAttribute('color');
     colors.array.fill(1);colors.needsUpdate=true;
    });
    before=render();
    saved.forEach(({o,colors})=>{
     const attr=o.mesh.children[0].geometry.getAttribute('color');
     attr.array.set(colors);attr.needsUpdate=true;
    });
    after=render();
   } finally {
    saved.forEach(({o,p,q,visible,colors})=>{
     const attr=o.mesh.children[0].geometry.getAttribute('color');
     attr.array.set(colors);attr.needsUpdate=true;
     o.mesh.position.copy(p);o.mesh.quaternion.copy(q);o.mesh.visible=visible;
    });
   }
   let changed=0,peak=0;
   for(let i=0;i<before.pixels.length;i+=4){
    const delta=Math.max(
     Math.abs(before.pixels[i]-after.pixels[i]),
     Math.abs(before.pixels[i+1]-after.pixels[i+1]),
     Math.abs(before.pixels[i+2]-after.pixels[i+2]));
    if(delta>=3)changed++;peak=Math.max(peak,delta);
   }
   const both=document.createElement('canvas');
   both.width=1600;both.height=900;
   const ctx=both.getContext('2d');
   ctx.drawImage(before.canvas,400,0,800,900,0,0,800,900);
   ctx.drawImage(after.canvas,400,0,800,900,800,0,800,900);
   return {
    before:{err:before.err,calls:before.calls,png:before.png},
    after:{err:after.err,calls:after.calls,png:after.png},
    both:both.toDataURL('image/png').split(',')[1],
    changed,peak,aa:!!gl.getContextAttributes().antialias,
    restored:saved.every(s=>{
     const a=s.o.mesh.children[0].geometry.getAttribute('color').array;
     return s.o.mesh.position.distanceTo(s.p)<1e-6&&
      s.o.mesh.quaternion.angleTo(s.q)<1e-6&&
      s.o.mesh.visible===s.visible&&a.every((v,i)=>v===s.colors[i]);
    })
   };
  });
  assert(ab.aa&&ab.restored,'Scene must restore exactly');
  assert.equal(ab.before.err,0);assert.equal(ab.after.err,0);
  assert.equal(ab.before.calls,ab.after.calls,'No extra barrier drawcalls');
  assert(ab.changed>100&&ab.peak>=3,'Subtle face pigment should render visibly');
  fs.writeFileSync(path.join(out,'c21q-old-original-barrier-cores.png'),
   Buffer.from(ab.before.png,'base64'));
  fs.writeFileSync(path.join(out,'c21q-refined-original-barrier-cores.png'),
   Buffer.from(ab.after.png,'base64'));
  fs.writeFileSync(path.join(out,'c21q-same-camera-side-by-side.png'),
   Buffer.from(ab.both,'base64'));
  delete ab.before.png;delete ab.after.png;delete ab.both;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,ship:h4Ship19Combat.userData.parts,
    barrierMeshesHidden:staticObstacles.filter(o=>o.type==='BARRIER').every(o=>!o.mesh.visible),
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],err:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');assert.equal(map4.ship,249);
  assert.equal(map4.barrierMeshesHidden,true);
  assert.deepEqual(map4.physics,[6,36,200]);assert.equal(map4.err,0);
  const back=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,barriers:staticObstacles.filter(x=>x.type==='BARRIER').length,
    shader:staticObstacles.find(x=>x.type==='BARRIER').mesh.children[0].material.vertexColors,
    err:renderer.getContext().getError()};
  });
  assert.equal(back.map,'map1');assert.equal(back.barriers,97);
  assert(back.shader&&back.err===0);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21Q',initial,ab,map4,back,errors,
   note:'97 original hazard barriers keep the exact octahedron/icosahedron vertex position buffers and 4 existing children (one core, two amber toruses, one spoke). Only three pre-existing cores temporarily placed 190/315/460m ahead for an actual game-camera WebGL A-B at identical render state, then restored. Meshes, torus, 64px weathering texture, playability, RNG, AI and Map4 unchanged.'};
  fs.writeFileSync(path.join(out,'barrier-core-depth-regression.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21Q ORIGINAL BARRIER CORE DEPTH WEBGL PASS '+
   JSON.stringify({barriers:initial.barriers,types:initial.geometryCounts,
    pixels:ab.changed,peak:ab.peak,drawCalls:[ab.before.calls,ab.after.calls],
    map4:map4.physics,errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
