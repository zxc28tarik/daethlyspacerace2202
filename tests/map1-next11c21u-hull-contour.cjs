/* NEXT11C21U — original SB07 hull contour depth in real 1600x900
 * Map1 chase camera. No new meshes, materials, parts, lights or changes
 * to Map4. Reconstruct exact previous C21T HULL vertex pigments for A/B.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21u-evidence');fs.mkdirSync(out,{recursive:true});
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
  await page.waitForFunction(()=>typeof startGame==='function'&&
    typeof h4Ship20ZenitBuild==='function'&&
    Array.isArray(itemBoxes)&&itemBoxes.length===49&&
    wreckageModules.length===8,null,{timeout:30000});
  const audit=await page.evaluate(()=>{
    const ship=h4Ship19Race,
      hull=ship.children.find(x=>x.name==='NEXT11C20_SB07_HULL');
    const familyNames=['HULL','SECOND','RED','DARK','GLASS','ORANGE','PLASMA'];
    const materials=familyNames.map(key=>{
      const x=ship.children.find(m=>m.name==='NEXT11C20_SB07_'+key);
      return {key,exists:!!x,material:x.material.name,
        hex:x.material.color.getHex(),vertices:x.geometry.getAttribute('position').count,
        normals:x.geometry.getAttribute('normal').count,
        uv:x.geometry.getAttribute('uv').count,
        colorVertices:x.geometry.getAttribute('color')?.count||0};
    });
    const pos=hull.geometry.getAttribute('position');
    const norm=hull.geometry.getAttribute('normal');
    const colors=hull.geometry.getAttribute('color');
    const clamp=v=>Math.max(0,Math.min(1,v)),old=new Float32Array(colors.array.length);
    let changed=0,peakDiff=0,sum=0,range=[Infinity,-Infinity],normalRange=[Infinity,-Infinity];
    let roofCount=0,underCount=0,wingCount=0;
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      const wing=clamp((Math.abs(x)-1.05)/6.4),
        nose=clamp((-z-1)/8),
        engine=clamp((z-1.1)/5.5)*clamp((Math.abs(x)-.8)/1.1),
        roof=clamp((y+.18)/1.2);
      const edge=wing*wing*(3-2*wing);
      const baseline=[
        .975+.025*nose+.010*roof-.105*edge-.022*engine,
        .982+.018*nose+.009*roof-.075*edge-.012*engine,
        .995+.015*nose+.008*roof-.040*edge-.006*engine];
      const ny=norm.getY(i);
      if(ny>.65)roofCount++;
      if(ny<0)underCount++;
      if(Math.abs(x)>5.5)wingCount++;
      normalRange[0]=Math.min(normalRange[0],ny);
      normalRange[1]=Math.max(normalRange[1],ny);
      for(let k=0;k<3;k++){
        const oldValue=baseline[k],cur=colors.array[i*3+k],
          delta=Math.abs(cur-oldValue);
        old[i*3+k]=oldValue;
        if(delta>.005)changed++;
        peakDiff=Math.max(peakDiff,delta);sum+=delta;
        range[0]=Math.min(range[0],cur);range[1]=Math.max(range[1],cur);
      }
    }
    return {
      version:ship.userData.hullContourRevision,
      visualOnly:ship.userData.hullContourVertexOnly,
      additionalObjects:ship.userData.hullContourNewObjects,
      partCount:ship.userData.parts,batchCount:ship.children.length,
      palette:materials,hullVertices:pos.count,originalHullMaxColorDelta:peakDiff,
      changedChannels:changed,avgChange:sum/(pos.count*3),
      colorRange:range,normalRange,roofCount,underCount,wingCount,
      originalBlueMaterial:hull.material.color.getHex(),
      allPhysics:[h4CanyonColliders.length,h4IndustrialColliders.length,
        planetaryBuildingColliders.length],
      other:{meteor:asteroids.length,barriers:staticObstacles.filter(o=>o.type==='BARRIER').length,
        gates:wreckageModules.length,boxes:itemBoxes.length,
        rings:corridorGuideGroup.userData.ringOriginalCount,
        ringBatches:corridorGuideGroup.userData.ringBatchCount,
        stars:starField.geometry.getAttribute('position').count,nebula:nebulaGroup.children.length,
        combatShip:h4Ship19Combat.userData.parts},
      originalColorsOld:new Float32Array(old.slice(0,0))
    };
  });
  delete audit.originalColorsOld;
  assert.equal(audit.version,'NEXT11C21U');
  assert(audit.visualOnly);assert.equal(audit.additionalObjects,0);
  assert.equal(audit.partCount,189);assert.equal(audit.batchCount,7);
  assert.deepEqual(audit.palette.map(x=>x.key),
    ['HULL','SECOND','RED','DARK','GLASS','ORANGE','PLASMA']);
  assert(audit.palette.every(x=>x.exists&&x.vertices>0&&
    x.vertices===x.normals&&x.vertices===x.uv));
  assert.deepEqual(audit.palette.map(x=>x.hex),
    [0xdbe4ea,0x566675,0xc43838,0x15202c,0x18394f,0xfaa15d,0x6dd9ff]);
  assert(audit.hullVertices>1000);
  assert(audit.roofCount>100&&audit.underCount>100&&audit.wingCount>100);
  assert(audit.changedChannels>1000&&audit.originalHullMaxColorDelta>.08);
  assert(audit.colorRange[0]>.77&&audit.colorRange[1]<1.11);
  assert.deepEqual(audit.other,{meteor:320,barriers:97,gates:8,boxes:49,
    rings:192,ringBatches:10,stars:2600,nebula:38,combatShip:249});
  // Map4 colliders initialize only after switching to Map4; audit them below.
  assert.deepEqual(audit.allPhysics,[0,0,0]);
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
    state.raceTime>2,null,{timeout:30000});
  const ab=await page.evaluate(()=>{
    state.paused=true;
    renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
    const hull=h4Ship19Race.children.find(x=>x.name==='NEXT11C20_SB07_HULL');
    const pos=hull.geometry.getAttribute('position');
    const attr=hull.geometry.getAttribute('color');
    const newColors=new Float32Array(attr.array);
    const oldColors=new Float32Array(newColors.length);
    const clamp=x=>Math.max(0,Math.min(1,x));
    for(let i=0;i<pos.count;i++){
      const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
      const wing=clamp((Math.abs(x)-1.05)/6.4),
        nose=clamp((-z-1)/8),
        engine=clamp((z-1.1)/5.5)*clamp((Math.abs(x)-.8)/1.1),
        roof=clamp((y+.18)/1.2),
        wingEdge=wing*wing*(3-2*wing),j=i*3;
      oldColors[j]=.975+.025*nose+.010*roof-.105*wingEdge-.022*engine;
      oldColors[j+1]=.982+.018*nose+.009*roof-.075*wingEdge-.012*engine;
      oldColors[j+2]=.995+.015*nose+.008*roof-.040*wingEdge-.006*engine;
    }
    const gl=renderer.getContext(),w=1600,h=900,rowBytes=w*4;
    renderer.render(scene,camera);gl.finish();
    const memoryBefore=[renderer.info.memory.geometries,renderer.info.memory.textures];
    const snap=()=>{
      camera.updateMatrixWorld(true);
      renderer.render(scene,camera);gl.finish();
      const glError=gl.getError(),calls=renderer.info.render.calls;
      const raw=new Uint8Array(w*h*4),rgba=new Uint8ClampedArray(w*h*4);
      gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
      for(let y=0;y<h;y++)
        rgba.set(raw.subarray(y*rowBytes,(y+1)*rowBytes),(h-1-y)*rowBytes);
      const canvas=document.createElement('canvas');
      canvas.width=w;canvas.height=h;
      canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
      return {glError,calls,rgba,canvas,png:canvas.toDataURL('image/png').split(',')[1]};
    };
    let before,after;
    try{
      attr.array.set(oldColors);attr.needsUpdate=true;
      before=snap();
      attr.array.set(newColors);attr.needsUpdate=true;
      after=snap();
    }finally{
      attr.array.set(newColors);attr.needsUpdate=true;
    }
    let changed1=0,changed3=0,changed8=0,peak=0;
    const samplePixels=[];
    for(let i=0;i<before.rgba.length;i+=4){
      const delta=Math.max(
        Math.abs(before.rgba[i]-after.rgba[i]),
        Math.abs(before.rgba[i+1]-after.rgba[i+1]),
        Math.abs(before.rgba[i+2]-after.rgba[i+2]));
      if(delta>=1)changed1++;
      if(delta>=3)changed3++;
      if(delta>=8)changed8++;
      peak=Math.max(peak,delta);
    }
    const side=document.createElement('canvas');side.width=1600;side.height=900;
    const ctx=side.getContext('2d');
    ctx.drawImage(before.canvas,400,0,800,900,0,0,800,900);
    ctx.drawImage(after.canvas,400,0,800,900,800,0,800,900);
    const restored=attr.array.every((x,i)=>x===newColors[i])&&
      h4Ship19Race.userData.parts===189&&
      h4Ship19Race.children.length===7;
    return {changed1,changed3,changed8,peak,
      drawCalls:[before.calls,after.calls],errors:[before.glError,after.glError],
      antialias:!!gl.getContextAttributes().antialias,
      restored,memoryBefore,memoryAfter:[
        renderer.info.memory.geometries,renderer.info.memory.textures],
      before:before.png,after:after.png,
      comparison:side.toDataURL('image/png').split(',')[1]};
  });
  assert(ab.antialias&&ab.restored);
  assert.deepEqual(ab.errors,[0,0]);
  assert.equal(ab.drawCalls[0],ab.drawCalls[1]);
  assert.deepEqual(ab.memoryBefore,ab.memoryAfter);
  assert(ab.changed3>100,
    'Existing ceramic hull must have a materially visible difference in real race camera');
  assert(ab.peak>=3);
  for(const [key,name] of [
    ['before','c21u-original-c21t-hull.png'],
    ['after','c21u-contoured-original-hull.png'],
    ['comparison','c21u-real-race-camera-before-after.png']
  ])fs.writeFileSync(path.join(out,name),Buffer.from(ab[key],'base64'));
  delete ab.before;delete ab.after;delete ab.comparison;
  const map4=await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
    renderer.render(scene,camera);
    return {map:state.activeMap,raceVisible:h4Ship19Race.visible,
      combatVisible:h4Ship19Combat.visible,ship:h4Ship19Combat.userData.parts,
      phys:[h4CanyonColliders.length,h4IndustrialColliders.length,
       planetaryBuildingColliders.length],gl:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');
  assert(!map4.raceVisible&&map4.combatVisible);
  assert.equal(map4.ship,249);
  assert.deepEqual(map4.phys,[6,36,200]);assert.equal(map4.gl,0);
  const back=await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
    renderer.render(scene,camera);
    return {map:state.activeMap,parts:h4Ship19Race.userData.parts,
      revision:h4Ship19Race.userData.hullContourRevision,
      gl:renderer.getContext().getError()};
  });
  assert.equal(back.map,'map1');assert.equal(back.parts,189);
  assert.equal(back.revision,'NEXT11C21U');assert.equal(back.gl,0);
  assert.deepEqual(errors,[]);
  const report={pass:true,revision:'NEXT11C21U',audit,ab,map4,back,errors,
    note:'Only the original merged SB07 silver ceramic HULL batch vertex color attr changes with original normals, original center-wing and outboard continuous gradients. Red, gunmetal and all OTHER material vertex colors unchanged, original 189 parts and 7 batches. BEFORE exact C21T original HULL formula and AFTER C21U in true live Map1 chase camera; no moves/staging, constant scene/lighting and original Map4.'};
  fs.writeFileSync(path.join(out,'sb07-hull-contour-regression.json'),
    JSON.stringify(report,null,2));
  console.log('NEXT11C21U ORIGINAL SB07 HULL CONTOUR WEBGL PASS '+JSON.stringify({
    parts:audit.partCount,hullVertices:audit.hullVertices,
    changedPixels3:ab.changed3,changedPixels8:ab.changed8,
    peak:ab.peak,drawCalls:ab.drawCalls,
    map4:map4.phys,errors
  }));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
