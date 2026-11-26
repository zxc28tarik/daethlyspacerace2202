/* NEXT11C21F — actual Map1 game-camera normal/boost color exposure.
 * No game code or render setting changes. Studio clipping != gameplay clipping; sample beyond startup camera interpolation. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21f-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
   '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
   '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  page.on('console',m=>{
   if(m.type()==='error'&&/shader|glsl|webglprogram/i.test(m.text()))
    errors.push(m.text());
  });
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Ship20ZenitBuild==='function'&&
   typeof h4Ship19Race!=='undefined'&&typeof startGame==='function',
   null,{timeout:25000});
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
   state.raceTime>2.0,null,{timeout:25000});
  await page.evaluate(()=>{state.paused=true;renderer.setPixelRatio(1);
   renderer.setSize(1600,900,false);});
  const captures=[];
  for(const phase of ['normal','boost']){
   const capture=await page.evaluate(phase=>{
    if(phase==='boost'){
     state.paused=false;
     state.currentSpeed=RACE_SPEEDS.BOOST;
     state.energy=Math.max(100,state.energy);
     keys['ShiftLeft']=true;
     for(let i=0;i<4;i++)h4Ship20ZenitVisualTick(.25);
     state.paused=true;
     keys['ShiftLeft']=false;
    }
    camera.updateMatrixWorld(true);
    h4Ship19Race.updateMatrixWorld(true);
    renderer.render(scene,camera);
    const gl=renderer.getContext();gl.finish();
    const glError=gl.getError(),size=[1600,900];
    const raw=new Uint8Array(size[0]*size[1]*4),row=size[0]*4;
    gl.readPixels(0,0,...size,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    const rgba=new Uint8ClampedArray(raw.length);
    for(let y=0;y<size[1];y++)
     rgba.set(raw.subarray(y*row,(y+1)*row),(size[1]-1-y)*row);
    const canvas=document.createElement('canvas');
    canvas.width=size[0];canvas.height=size[1];
    canvas.getContext('2d').putImageData(new ImageData(rgba,...size),0,0);
    const box=new THREE.Box3().setFromObject(h4Ship19Race),
     projected=[];
    for(const x of [box.min.x,box.max.x])
     for(const y of [box.min.y,box.max.y])
      for(const z of [box.min.z,box.max.z]){
       const p=new THREE.Vector3(x,y,z).project(camera);
       projected.push([(p.x+1)*800,(1-p.y)*450]);
      }
    const bound=[Math.max(0,Math.min(...projected.map(p=>p[0]))),
     Math.max(0,Math.min(...projected.map(p=>p[1]))),
     Math.min(1599,Math.max(...projected.map(p=>p[0]))),
     Math.min(899,Math.max(...projected.map(p=>p[1])))];
    const b=bound.map(Math.round),width=Math.max(0,b[2]-b[0]),
     height=Math.max(0,b[3]-b[1]);
    let bright=0,clipped=0,colorful=0,total=0;
    for(let y=Math.max(0,b[1]);y<=Math.min(899,b[3]);y++)
     for(let x=Math.max(0,b[0]);x<=Math.min(1599,b[2]);x++){
      const i=(y*1600+x)*4,r=rgba[i],g=rgba[i+1],bl=rgba[i+2];
      total++;
      if(r+g+bl>360)bright++;
      if(r>248&&g>248&&bl>248)clipped++;
      if(Math.max(r,g,bl)-Math.min(r,g,bl)>24)colorful++;
     }
    const plasma=h4Ship19Race.children.find(m=>m.material.name==='SB07_BLUE_PLASMA'),
      amber=h4Ship19Race.children.find(m=>m.material.name==='SB07_ENGINE_AMBER');
    return {phase,glError,drawCalls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     antialias:!!gl.getContextAttributes().antialias,
     pixelRatio:renderer.getPixelRatio(),map:state.activeMap,
     raceParts:h4Ship19Race.userData.parts,
     raceVisible:h4Ship19Race.visible,
     glow:h4Ship19Race.userData.thrustGlow,
     plasmaHex:plasma.material.color.getHex(),
     amberHex:amber.material.color.getHex(),
     shipBoundsPixels:b,shipProjectedWidth:width,shipProjectedHeight:height,
     regionTotal:total,regionBright:bright,regionClipped:clipped,
     regionColorful:colorful,regionClipFraction:total?clipped/total:0,
     png:canvas.toDataURL('image/png').split(',')[1]};
   },phase);
   assert.equal(capture.glError,0);assert(capture.antialias);
   assert.equal(capture.pixelRatio,1);assert.equal(capture.raceParts,189);
   assert(capture.raceVisible&&capture.drawCalls>20);
   assert(capture.shipProjectedWidth>5&&capture.shipProjectedHeight>5);
   fs.writeFileSync(path.join(out,'map1-true-camera-'+phase+'-1600x900.png'),
    Buffer.from(capture.png,'base64'));
   delete capture.png;
   await page.screenshot({path:path.join(out,'map1-with-hud-'+phase+'-1600x900.png')});
   captures.push(capture);
  }
  assert(captures[1].glow>captures[0].glow+.15,
   'real boost should produce stronger ship engine emission');
  assert.notEqual(captures[0].plasmaHex,captures[1].plasmaHex);
  assert.notEqual(captures[0].amberHex,captures[1].amberHex);
  const physics=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {raceVisible:h4Ship19Race.visible,
    combatVisible:h4Ship19Combat.visible,
    combatParts:h4Ship19Combat.userData.parts,
    map4Physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],drawCalls:renderer.info.render.calls};
  });
  assert(!physics.raceVisible&&physics.combatVisible);
  assert.equal(physics.combatParts,249);
  assert.deepEqual(physics.map4Physics,[6,36,200]);
  assert.deepEqual(errors,[]);
  const report={pass:true,tag:'NEXT11C21F',captures,physics,errors,
   caveat:'Region is projected ship bounding rectangle, not semantic ship-only mask. Real Map1 gameplay camera, no model/lighting changes. Clipping fractions are diagnostic, not subjective art approval.'};
  fs.writeFileSync(path.join(out,'map1-native-camera-report.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21F REAL RACE CAMERA WEBGL PASS '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});