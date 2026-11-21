/* NEXT11C21R: Existing 8 Map1 wreck gate face pigment only.
 * Native Chromium WebGL 1600x900 actual race-camera before/after,
 * all 8 original modules, full geometry and Map4 isolation.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21r-evidence');
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
    r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
    r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
    {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>wreckageModules.length===8&&itemBoxes.length===49&&
    asteroids.length===320,null,{timeout:30000});

  const original=await page.evaluate(()=>{
   const sample=[],paint=[];let preserved=true;
   let metalPieces=0,metalVertices=0,gateChildren=0,visibleGuides=0;
   const covers=new Set();
   for(let i=0;i<wreckageModules.length;i++){
    const m=wreckageModules[i],g=m.group;
    covers.add(m.mode);
    const mesh=g.children.filter(x=>x.isMesh);
    const lines=g.children.filter(x=>x.isLineSegments);
    const metal=mesh.filter(x=>x.material?.map===courseWreckPaint);
    const warnings=mesh.filter(x=>x.material?.color?.getHex()===0xffa666);
    const minmax=[Infinity,-Infinity];let maxError=0;
    metalPieces+=metal.length;gateChildren+=g.children.length;
    visibleGuides+=lines.length;
    for(const p of metal){
      const geo=p.geometry,xyz=geo.getAttribute('position');
      const col=geo.getAttribute('color');
      if(geo.type!=='BoxGeometry'||geo.index!==null||xyz.count!==24||
       col.count!==24||geo.userData.map1OriginalWreckPanelFaces!=='NEXT11C21R'||
       geo.userData.sourcePositionsUnchanged!==true||!p.material.vertexColors||
       p.material.map!==courseWreckPaint)preserved=false;
      const params=geo.parameters;
      const baseline=new THREE.BoxGeometry(params.width,params.height,params.depth);
      const old=baseline.getAttribute('position');
      for(let v=0;v<24;v++){
        for(const key of ['X','Y','Z'])
          maxError=Math.max(maxError,
           Math.abs(xyz['get'+key](v)-old['get'+key](v)));
        minmax[0]=Math.min(minmax[0],col.getX(v),col.getY(v),col.getZ(v));
        minmax[1]=Math.max(minmax[1],col.getX(v),col.getY(v),col.getZ(v));
      }
      metalVertices+=24;
      baseline.dispose();
    }
    if(metal.length!==11||warnings.length!==4||lines.length!==1||
       g.children.length!==16||maxError>1e-6||m.parts.length!==4||
       !m.parts.every(x=>x.type==='WRECK_BOX'&&x.halfDepth===82.5)||
       m.opening.x!==0||m.opening.hx!==116||![78,98].includes(m.opening.hy))
      preserved=false;
    sample.push({gate:i,mode:m.mode,parts:m.parts.length,children:g.children.length,
     metal:metal.length,warnings:warnings.length,lines:lines.length,
     faceColorRange:minmax,maxPositionError:maxError,
     opening:m.opening,physicsParts:m.parts.map(x=>[x.halfX,x.halfY,x.halfDepth])});
   }
   const materialSample=wreckageModules[0].group.children
    .filter(x=>x.isMesh&&x.material?.map===courseWreckPaint);
   return {gateCount:wreckageModules.length,gateChildren,metalPieces,
    metalVertices,visibleGuides,allOriginal:preserved,sample,
    modes:[...covers].sort(),
    palette:MAP1_C21R_GATE_FACE_TONES.slice(),
    paint:materialSample.map(x=>({
     hex:x.material.color.getHex(),roughness:x.material.roughness,
     metalness:x.material.metalness,texture:x.material.map.name,
     vertexColors:x.material.vertexColors
    })),
    other:{
     meteors:asteroids.length,
     barriers:staticObstacles.filter(o=>o.type==='BARRIER').length,
     wreckColliders:staticObstacles.filter(o=>o.type==='WRECK_BOX').length,
     rewardBoxes:itemBoxes.length,
     rings:corridorGuideGroup.userData.ringOriginalCount,
     ringBatches:corridorGuideGroup.userData.ringBatchCount,
     roadSectors:raceRoadGroup.userData.sectors.length,
     ships:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts]
    }};
  });
  assert.equal(original.gateCount,8);
  assert.equal(original.gateChildren,8*16);
  assert.equal(original.metalPieces,8*11);
  assert.equal(original.metalVertices,8*11*24);
  assert.equal(original.visibleGuides,8);
  assert(original.allOriginal,'Original 8 gates, openings, panels and coords required');
  assert.deepEqual(original.palette,[1.04,.86,1.08,.83,.98,.90]);
  assert.deepEqual(original.modes,['BOTTOM_ONLY','CENTER_ONLY','TOP_ONLY']);
  assert(original.sample.every(x=>
    x.maxPositionError<1e-6&&x.faceColorRange[1]-x.faceColorRange[0]>.19));
  assert(original.paint.every(x=>x.vertexColors&&
    x.texture==='MAP1_C21I_WEATHERED_PLATE'&&
    (x.hex===0x788797||x.hex===0x445364)&&
    x.roughness>=.76&&x.metalness>=.37));
  assert.deepEqual(original.other,{meteors:320,barriers:97,wreckColliders:32,
    rewardBoxes:49,rings:192,ringBatches:10,roadSectors:5,ships:[189,249]});

  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
    state.raceTime>2,null,{timeout:30000});

  const ab=await page.evaluate(()=>{
    state.paused=true;
    // Three existing gates (center/top/bottom opening types), temporarily
    // staged at controlled race progress. Actual game state is not changed.
    const chosen=wreckageModules.slice(0,3);
    const saved=chosen.map(m=>({
      m,position:m.group.position.clone(),
      quaternion:m.group.quaternion.clone(),visible:m.group.visible,
      metals:m.group.children.filter(x=>x.isMesh&&x.material.map===courseWreckPaint)
        .map(x=>({x,attr:x.geometry.getAttribute('color'),
          colors:new Float32Array(x.geometry.getAttribute('color').array)}))
    }));
    saved.forEach((s,i)=>{
      const anchor=makeCourseLocalGroup(state.routeProgress+[570,1130,1750][i],0,0);
      s.m.group.position.copy(anchor.position);
      s.m.group.quaternion.copy(anchor.quaternion);
      s.m.group.visible=true;
    });
    const gl=renderer.getContext(),w=1600,h=900,rowBytes=w*4;
    const snap=()=>{
      renderer.render(scene,camera);gl.finish();
      const err=gl.getError(),calls=renderer.info.render.calls;
      const raw=new Uint8Array(w*h*4),rgba=new Uint8ClampedArray(w*h*4);
      gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
      for(let y=0;y<h;y++)
        rgba.set(raw.subarray(y*rowBytes,(y+1)*rowBytes),(h-1-y)*rowBytes);
      const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
      canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
      return {err,calls,canvas,rgba,
        png:canvas.toDataURL('image/png').split(',')[1]};
    };
    let before,after;
    try{
      // BEFORE: same C21Q original textured 24-vertex box, white vertex
      // colors = no C21R pigment. All 8 shapes, lights, gameplay kept.
      for(const s of saved)for(const m of s.metals){
        m.attr.array.fill(1);m.attr.needsUpdate=true;
      }
      before=snap();
      for(const s of saved)for(const m of s.metals){
        m.attr.array.set(m.colors);m.attr.needsUpdate=true;
      }
      after=snap();
    }finally{
      for(const s of saved){
        for(const m of s.metals){
          m.attr.array.set(m.colors);m.attr.needsUpdate=true;
        }
        s.m.group.position.copy(s.position);
        s.m.group.quaternion.copy(s.quaternion);
        s.m.group.visible=s.visible;
      }
    }
    let changed=0,peak=0;
    for(let i=0;i<before.rgba.length;i+=4){
      const delta=Math.max(
       Math.abs(before.rgba[i]-after.rgba[i]),
       Math.abs(before.rgba[i+1]-after.rgba[i+1]),
       Math.abs(before.rgba[i+2]-after.rgba[i+2]));
      if(delta>=3)changed++;
      peak=Math.max(peak,delta);
    }
    const side=document.createElement('canvas');side.width=1600;side.height=900;
    const ctx=side.getContext('2d');
    ctx.drawImage(before.canvas,400,0,800,900,0,0,800,900);
    ctx.drawImage(after.canvas,400,0,800,900,800,0,800,900);
    const restored=saved.every(s=>
      s.m.group.position.distanceTo(s.position)<1e-6&&
      s.m.group.quaternion.angleTo(s.quaternion)<1e-6&&
      s.m.group.visible===s.visible&&
      s.metals.every(m=>m.attr.array.every((x,i)=>x===m.colors[i])));
    return {before:{err:before.err,calls:before.calls,png:before.png},
      after:{err:after.err,calls:after.calls,png:after.png},
      side:side.toDataURL('image/png').split(',')[1],
      changed,peak,restored,antialias:!!gl.getContextAttributes().antialias};
  });
  assert(ab.antialias&&ab.restored,'All staged geometry transforms and pigments restored');
  assert.equal(ab.before.err,0);assert.equal(ab.after.err,0);
  assert.equal(ab.before.calls,ab.after.calls,'No new drawcalls after color change');
  assert(ab.changed>250&&ab.peak>=3,
    'The actual Map1 race camera should render visible gate facet differences');
  fs.writeFileSync(path.join(out,'c21r-original-wreck-gates-before.png'),
    Buffer.from(ab.before.png,'base64'));
  fs.writeFileSync(path.join(out,'c21r-original-wreck-gates-after.png'),
    Buffer.from(ab.after.png,'base64'));
  fs.writeFileSync(path.join(out,'c21r-wreck-gates-same-camera.png'),
    Buffer.from(ab.side,'base64'));
  delete ab.before.png;delete ab.after.png;delete ab.side;

  const map4=await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
    renderer.render(scene,camera);
    return {map:state.activeMap,combatShip:h4Ship19Combat.userData.parts,
     gatesHidden:wreckageModules.every(g=>!g.group.visible),
     physical:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length],
     error:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');
  assert.equal(map4.combatShip,249);assert.equal(map4.gatesHidden,true);
  assert.deepEqual(map4.physical,[6,36,200]);assert.equal(map4.error,0);
  const back=await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
    renderer.render(scene,camera);
    return {map:state.activeMap,gateCount:wreckageModules.length,
     faceTag:wreckageModules[0].group.children[0].geometry.userData.map1OriginalWreckPanelFaces,
     error:renderer.getContext().getError()};
  });
  assert.equal(back.map,'map1');assert.equal(back.gateCount,8);
  assert.equal(back.faceTag,'NEXT11C21R');assert.equal(back.error,0);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21R',original,ab,map4,back,errors,
   note:'All 8 old 16-part gates and 32 solid WRECK_BOX colliders preserved. Only 88 existing painted metal BoxGeometry panels/ribs/antennae receive 24-vertex face pigment. In true Map1 camera 3 existing gates with different passable opening types are staged then restored. BEFORE neutral vertex colors reconstructs the C21Q old material; AFTER is C21R; equal draw calls, GL=0. 4 warning amber blocks and cyan guide line unchanged.'};
  fs.writeFileSync(path.join(out,'wreck-gate-facet-regression.json'),
    JSON.stringify(report,null,2));
  console.log('NEXT11C21R ORIGINAL WRECK GATE WEBGL PASS '+JSON.stringify({
    gates:original.gateCount,paintedMetalParts:original.metalPieces,
    changedPixels:ab.changed,peak:ab.peak,
    drawCalls:[ab.before.calls,ab.after.calls],map4:map4.physical,errors
  }));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
