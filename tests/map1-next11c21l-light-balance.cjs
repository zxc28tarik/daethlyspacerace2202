/* NEXT11C21L — original Map1 assets, restrained visual light hierarchy.
 * Real Chromium/WebGL before/after and Map4 isolation. No gameplay changes.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21l-evidence');fs.mkdirSync(out,{recursive:true});
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
   r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>asteroids.length===320&&itemBoxes.length===49&&
   staticObstacles.some(o=>o.type==='BARRIER')&&nebulaGroup.children.length===38,
   null,{timeout:30000});
  const initial=await page.evaluate(()=>{
   const first=staticObstacles.find(o=>o.type==='BARRIER'),reward=itemBoxes[0];
   const b=MAP1_C21L_LIGHT_BALANCE;
   return {
    config:b,
    map:state.activeMap,
    fog:[scene.fog.color.getHex(),scene.fog.density],
    stars:{count:starField.geometry.getAttribute('position').count,
     size:starField.material.size,opacity:starField.material.opacity},
    objects:[asteroids.length,staticObstacles.filter(x=>x.type==='BARRIER').length,
     wreckageModules.length,itemBoxes.length],
    reward:{radius:reward.radius,width:reward.spin.geometry.parameters.width,
     edgeChildren:reward.edge.geometry.attributes.position.count,
     purple:reward.spin.material.color.getHex(),
     roughness:reward.spin.material.roughness,
     emissive:reward.spin.material.emissiveIntensity,
     edge:reward.edge.material.color.getHex(),edgeOpacity:reward.edge.material.opacity,
     core:reward.core.material.color.getHex(),coreOpacity:reward.core.material.opacity,
     childCount:reward.mesh.children.length},
    barrier:{radius:first.radius,durability:first.durability,
     childCount:first.mesh.children.length,
     glow:first.mesh.children[1].material.color.getHex(),
     glowOpacity:first.mesh.children[1].material.opacity,
     line:first.mesh.children[3].material.color.getHex(),
     lineOpacity:first.mesh.children[3].material.opacity},
    ship:h4Ship19Race.userData.parts,nebula:nebulaGroup.children.length
   };
  });
  assert.equal(initial.map,'map1');
  assert.deepEqual(initial.fog,[0x0d0e21,.00044]);
  assert.deepEqual(initial.objects,[320,97,8,49]);
  assert.equal(initial.nebula,38);
  assert.equal(initial.ship,189);
  assert.deepEqual([initial.stars.count,initial.stars.size,initial.stars.opacity],
   [2600,2.5,.78]);
  assert.deepEqual([initial.reward.radius,initial.reward.width,
   initial.reward.childCount,initial.reward.purple],[49,34,2,0x583895]);
  assert.deepEqual([initial.reward.roughness,initial.reward.emissive,
   initial.reward.edge,initial.reward.edgeOpacity,
   initial.reward.core,initial.reward.coreOpacity],
   [.48,.44,0xd7c9ff,.82,0x95dcea,.78]);
  assert.equal(initial.barrier.durability,3);
  assert.equal(initial.barrier.childCount,4);
  assert.deepEqual([initial.barrier.glow,initial.barrier.glowOpacity,
   initial.barrier.line,initial.barrier.lineOpacity],
   [0xf4a667,.74,0xf1c58d,.74]);
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2,null,{timeout:30000});
  const ab=await page.evaluate(()=>{
   state.paused=true;
   const b=itemBoxes[0],bar=staticObstacles.find(o=>o.type==='BARRIER');
   const refs=[b.mesh,bar.mesh];
   const saved=refs.map(mesh=>({mesh,
    position:mesh.position.clone(),rotation:mesh.quaternion.clone(),visible:mesh.visible}));
   const placement=[[560,40,0],[850,-100,0]];
   saved.forEach(({mesh},i)=>{
    const [d,x,y]=placement[i];
    const g=makeCourseLocalGroup(state.routeProgress+d,state.laneX+x,state.laneY+y);
    mesh.position.copy(g.position);mesh.quaternion.copy(g.quaternion);mesh.visible=true;
   });
   const star=starField.material;
   const front=bar.mesh.children[1].material,line=bar.mesh.children[3].material;
   const cube=b.spin.material,edge=b.edge.material,core=b.core.material;
   const newLook={
    starSize:star.size,starOpacity:star.opacity,
    frontColor:front.color.getHex(),frontOpacity:front.opacity,
    lineColor:line.color.getHex(),lineOpacity:line.opacity,
    roughness:cube.roughness,emissive:cube.emissiveIntensity,
    edgeColor:edge.color.getHex(),edgeOpacity:edge.opacity,
    coreColor:core.color.getHex(),coreOpacity:core.opacity
   };
   const apply=(p)=>{
    star.size=p.starSize;star.opacity=p.starOpacity;
    front.color.setHex(p.frontColor);front.opacity=p.frontOpacity;
    line.color.setHex(p.lineColor);line.opacity=p.lineOpacity;
    cube.roughness=p.roughness;cube.emissiveIntensity=p.emissive;
    edge.color.setHex(p.edgeColor);edge.opacity=p.edgeOpacity;
    core.color.setHex(p.coreColor);core.opacity=p.coreOpacity;
   };
   const oldLook={
    starSize:3.2,starOpacity:.9,
    frontColor:0xff9c53,frontOpacity:.83,
    lineColor:0xffd18a,lineOpacity:.84,
    roughness:.42,emissive:.50,
    edgeColor:0xdac3ff,edgeOpacity:.87,
    coreColor:0x83e4f2,coreOpacity:.82
   };
   const gl=renderer.getContext(),w=1600,h=900,stride=w*4;
   const frame=()=>{
    renderer.render(scene,camera);gl.finish();
    const err=gl.getError(),calls=renderer.info.render.calls;
    const data=new Uint8Array(w*h*4),pixels=new Uint8ClampedArray(w*h*4);
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,data);
    for(let y=0;y<h;y++)
     pixels.set(data.subarray(y*stride,(y+1)*stride),(h-1-y)*stride);
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').putImageData(new ImageData(pixels,w,h),0,0);
    return {err,calls,canvas,png:canvas.toDataURL('image/png').split(',')[1]};
   };
   let before,after;
   try{
    apply(oldLook);before=frame();
    apply(newLook);after=frame();
   }finally{
    apply(newLook);
    saved.forEach(x=>{
     x.mesh.position.copy(x.position);
     x.mesh.quaternion.copy(x.rotation);
     x.mesh.visible=x.visible;
    });
   }
   const merged=document.createElement('canvas');merged.width=1600;merged.height=900;
   const ctx=merged.getContext('2d');
   ctx.drawImage(before.canvas,400,0,800,900,0,0,800,900);
   ctx.drawImage(after.canvas,400,0,800,900,800,0,800,900);
   const restored=saved.every(x=>x.mesh.position.distanceTo(x.position)<1e-6&&
    x.mesh.quaternion.angleTo(x.rotation)<1e-6&&x.mesh.visible===x.visible);
   return {before:{err:before.err,calls:before.calls,png:before.png},
    after:{err:after.err,calls:after.calls,png:after.png},
    composite:merged.toDataURL('image/png').split(',')[1],
    restored,lookRestored:star.size===newLook.starSize&&
     front.color.getHex()===newLook.frontColor&&
     edge.color.getHex()===newLook.edgeColor,
    aa:!!gl.getContextAttributes().antialias};
  });
  assert(ab.aa&&ab.restored&&ab.lookRestored);
  assert.equal(ab.before.err,0);assert.equal(ab.after.err,0);
  assert.equal(ab.before.calls,ab.after.calls);
  fs.writeFileSync(path.join(out,'map1-c21l-old-light.png'),Buffer.from(ab.before.png,'base64'));
  fs.writeFileSync(path.join(out,'map1-c21l-balanced-light.png'),Buffer.from(ab.after.png,'base64'));
  fs.writeFileSync(path.join(out,'map1-c21l-same-camera-side-by-side.png'),
   Buffer.from(ab.composite,'base64'));
  delete ab.before.png;delete ab.after.png;delete ab.composite;
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,starsVisible:starField.visible,
    map4Ship:h4Ship19Combat.userData.parts,
    phys:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    fog:scene.fog.density,err:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');
  assert.equal(map4.starsVisible,false);
  assert.equal(map4.map4Ship,249);
  assert.deepEqual(map4.phys,[6,36,200]);
  assert(map4.fog<.0003&&map4.err===0);
  const returned=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,stars:starField.visible,
    fog:[scene.fog.color.getHex(),scene.fog.density],
    items:itemBoxes.length,err:renderer.getContext().getError()};
  });
  assert.equal(returned.map,'map1');
  assert.equal(returned.stars,true);
  assert.deepEqual(returned.fog,[0x0d0e21,.00044]);
  assert.equal(returned.items,49);assert.equal(returned.err,0);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21L',initial,ab,map4,returned,errors,
   note:'Original 49 cube rewards, 97 barriers, 320 meteors, geometry and gameplay untouched. Before/after: only star size/opacity, existing barrier warning materials and original cube/core/edge materials. Same 1600x900 camera. No extra draws. Map4 unchanged.'};
  fs.writeFileSync(path.join(out,'light-balance-regression.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21L REAL WEBGL PASS '+JSON.stringify({
   objects:initial.objects,stars:initial.stars,drawCalls:ab.after.calls,
   map4:map4.phys,errors}));
 }finally{await browser.close();}
})().catch(err=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(err.stack||err));
 console.error(err.stack||err);process.exitCode=1;
});
