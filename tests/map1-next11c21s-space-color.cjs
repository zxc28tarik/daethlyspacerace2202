/* NEXT11C21S — original 2600 stars and 38 nebula sphere pigments only.
 * 1600x900 Chromium/WebGL normal Map1 game camera and Map4 isolation.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21s-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
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
  await page.waitForFunction(()=>starField.geometry.getAttribute('position').count===2600&&
   nebulaGroup.children.length===38&&itemBoxes.length===49,
   null,{timeout:30000});
  const meta=await page.evaluate(()=>{
    const ps=starField.geometry.getAttribute('position'),
     cc=starField.geometry.getAttribute('color'),
     bins=starField.userData.map1OriginalStarPaletteBins;
    const count=[0,0,0,0],first=[];
    let err=0,min=Infinity,max=-Infinity;
    const palette=MAP1_C21S_ORIGINAL_SPACE_GRADE.starPalette.map(x=>new THREE.Color(x));
    for(let i=0;i<ps.count;i++){
      const bin=bins[i],color=palette[bin];
      count[bin]++;
      const factor=i%13===0?1:i%5===0?.73:.89;
      for(const [axis,channel] of [['X','r'],['Y','g'],['Z','b']]){
        const seen=cc['get'+axis](i);
        const expected=color[channel]*factor;
        err=Math.max(err,Math.abs(seen-expected));
        min=Math.min(min,seen);max=Math.max(max,seen);
      }
      if(i<4)first.push({bin,pos:[ps.getX(i),ps.getY(i),ps.getZ(i)]});
    }
    const fog=[scene.fog.color.getHex(),scene.fog.density];
    return {
      map:state.activeMap,tag:starField.userData.map1VisualGrade,
      count:ps.count,colors:cc.count,bins:bins.length,binsDistribution:count,
      maxColorError:err,colorRange:[min,max],first,
      starType:starField.type,starSize:starField.material.size,
      starOpacity:starField.material.opacity,
      palette:MAP1_C21S_ORIGINAL_SPACE_GRADE.starPalette.slice(),
      nebulaPalette:MAP1_C21S_ORIGINAL_SPACE_GRADE.nebulaPalette.slice(),
      nebula:nebulaGroup.children.map((x,i)=>({
       type:x.geometry.type,index:i,
       radius:x.geometry.parameters.radius,
       opacity:x.material.opacity,hex:x.material.color.getHex(),
       position:x.position.toArray(),
       geometrySegments:x.geometry.parameters.widthSegments
      })),
      original:[asteroids.length,
       staticObstacles.filter(o=>o.type==='BARRIER').length,
       wreckageModules.length,itemBoxes.length],
      rings:corridorGuideGroup.userData.ringOriginalCount,
      ship:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts],
      fog
    };
  });
  assert.deepEqual(meta.original,[320,97,8,49]);
  assert.deepEqual(meta.ship,[189,249]);
  assert.deepEqual(meta.fog,[0x0d0e21,.00044]);
  assert.deepEqual([meta.count,meta.colors,meta.bins,meta.starSize,meta.starOpacity],
    [2600,2600,2600,2.5,.78]);
  assert.equal(meta.rings,192);
  assert.equal(meta.tag,'NEXT11C21S');
  assert(meta.maxColorError<2e-7);
  assert(meta.binsDistribution.every(n=>n>500&&n<850));
  assert.deepEqual(meta.palette,[0xf2f6ff,0x9ec6e5,0xd1b3d9,0xe8c39b]);
  assert.deepEqual(meta.nebulaPalette,
   [0x75315f,0xb75178,0xc77b54,0x345b91,0x4c3492]);
  assert.equal(meta.nebula.length,38);
  const mismatchedNebula=meta.nebula.filter(n=>!(n.type==='Mesh'&&
    n.radius>=260&&n.radius<=680&&n.opacity===.062&&
    n.geometrySegments===12&&n.hex===meta.nebulaPalette[n.index%5]));
  assert.deepEqual(mismatchedNebula,[],'All 38 original nebula geometry/opacity/color invariants');

  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1&&
    state.raceTime>2,null,{timeout:30000});
  const ab=await page.evaluate(()=>{
    state.paused=true;
    const ps=starField.geometry.getAttribute('position');
    const cc=starField.geometry.getAttribute('color');
    const bins=starField.userData.map1OriginalStarPaletteBins;
    const origColorBuffer=new Float32Array(cc.array);
    const oldPalette=[0xffffff,0x88ffff,0xff99dd,0xffcc77].map(x=>new THREE.Color(x));
    const oldNebulaPalette=[0x881177,0xff4477,0xff8833,0x2244aa,0x551199];
    const nebulaColors=nebulaGroup.children.map(x=>x.material.color.clone());
    const positionSignature=[ps.array[0],ps.array[1],ps.array[2],
     ps.array[ps.array.length-3],ps.array[ps.array.length-2],ps.array[ps.array.length-1]];
    const rendererMemoryBefore={
      geometries:renderer.info.memory.geometries,
      textures:renderer.info.memory.textures
    };
    const gl=renderer.getContext(),w=1600,h=900,stride=w*4;
    const capture=()=>{
      renderer.render(scene,camera);gl.finish();
      const err=gl.getError(),calls=renderer.info.render.calls,
       raw=new Uint8Array(w*h*4),rgba=new Uint8ClampedArray(w*h*4);
      gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
      for(let y=0;y<h;y++)
       rgba.set(raw.subarray(y*stride,(y+1)*stride),(h-1-y)*stride);
      const c=document.createElement('canvas');c.width=w;c.height=h;
      c.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
      return {err,calls,pixels:rgba,canvas:c,png:c.toDataURL('image/png').split(',')[1]};
    };
    let before,after;
    try{
      for(let i=0;i<ps.count;i++){
        const c=oldPalette[bins[i]],j=3*i;
        cc.array[j]=c.r;cc.array[j+1]=c.g;cc.array[j+2]=c.b;
      }
      cc.needsUpdate=true;
      nebulaGroup.children.forEach((mesh,i)=>
        mesh.material.color.setHex(oldNebulaPalette[i%5]));
      before=capture();
      cc.array.set(origColorBuffer);cc.needsUpdate=true;
      nebulaGroup.children.forEach((mesh,i)=>
        mesh.material.color.copy(nebulaColors[i]));
      after=capture();
    }finally{
      cc.array.set(origColorBuffer);cc.needsUpdate=true;
      nebulaGroup.children.forEach((mesh,i)=>
        mesh.material.color.copy(nebulaColors[i]));
    }
    let changed=0,peak=0,sum=0,soft=0;
    for(let i=0;i<before.pixels.length;i+=4){
      const delta=Math.max(
       Math.abs(before.pixels[i]-after.pixels[i]),
       Math.abs(before.pixels[i+1]-after.pixels[i+1]),
       Math.abs(before.pixels[i+2]-after.pixels[i+2]));
      if(delta>=3)changed++;
      if(delta>=1)soft++;
      sum+=delta;peak=Math.max(peak,delta);
    }
    const side=document.createElement('canvas');
    side.width=1600;side.height=900;
    const ctx=side.getContext('2d');
    ctx.drawImage(before.canvas,400,0,800,900,0,0,800,900);
    ctx.drawImage(after.canvas,400,0,800,900,800,0,800,900);
    const restore=cc.array.every((v,i)=>v===origColorBuffer[i])&&
     nebulaGroup.children.every((x,i)=>x.material.color.equals(nebulaColors[i]))&&
     positionSignature.every((n,i)=>n===[
       ps.array[0],ps.array[1],ps.array[2],
       ps.array[ps.array.length-3],ps.array[ps.array.length-2],
       ps.array[ps.array.length-1]][i]);
    return {changed,soft,peak,sum,
     drawCalls:[before.calls,after.calls],glErrors:[before.err,after.err],
     aa:!!gl.getContextAttributes().antialias,restore,
     memoryBefore:rendererMemoryBefore,
     memoryAfter:{geometries:renderer.info.memory.geometries,
       textures:renderer.info.memory.textures},
     before:before.png,after:after.png,
     side:side.toDataURL('image/png').split(',')[1]};
  });
  assert(ab.aa&&ab.restore);
  assert.deepEqual(ab.glErrors,[0,0]);
  assert.equal(ab.drawCalls[0],ab.drawCalls[1]);
  assert.deepEqual(ab.memoryBefore,ab.memoryAfter);
  assert(ab.changed>1700,
    'Real game chase camera must visibly differ more than C21R staged gates');
  assert(ab.peak>=3);
  for(const [key,name] of [
    ['before','c21s-original-stars-and-nebulae.png'],
    ['after','c21s-harmonized-original-stars-and-nebulae.png'],
    ['side','c21s-same-camera-original-background-a-b.png']
  ])fs.writeFileSync(path.join(out,name),Buffer.from(ab[key],'base64'));
  delete ab.before;delete ab.after;delete ab.side;
  const map4=await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
    renderer.render(scene,camera);
    return {map:state.activeMap,stars:starField.visible,nebula:nebulaGroup.visible,
      combatShip:h4Ship19Combat.userData.parts,
      phys:[h4CanyonColliders.length,h4IndustrialColliders.length,
        planetaryBuildingColliders.length],gl:renderer.getContext().getError()};
  });
  assert.equal(map4.map,'map4');
  assert(!map4.stars&&!map4.nebula);
  assert.equal(map4.combatShip,249);
  assert.deepEqual(map4.phys,[6,36,200]);assert.equal(map4.gl,0);
  const back=await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP1);startGame();state.paused=true;
    renderer.render(scene,camera);
    return {map:state.activeMap,stars:starField.visible,nebula:nebulaGroup.visible,
      count:starField.geometry.getAttribute('color').count,
      error:renderer.getContext().getError()};
  });
  assert.equal(back.map,'map1');assert(back.stars&&back.nebula);
  assert.equal(back.count,2600);assert.equal(back.error,0);
  assert.deepEqual(errors,[]);
  const report={pass:true,rev:'NEXT11C21S',meta,ab,map4,back,errors,
    note:'Only original 2600 Points color buffer and original 38 SphereGeometry mesh base colors changed. Original 4 RNG draws per star and 38x4 RNG draws for nebula placement unchanged. No new object or shader, unchanged C21L opacity/size and C21K fog, Map4 starfield hidden. BEFORE/AFTER same actual Map1 chase camera with full scene and no staging. Star/nebula colors are restored after A/B.'};
  fs.writeFileSync(path.join(out,'original-space-color-regression.json'),
    JSON.stringify(report,null,2));
  console.log('NEXT11C21S ORIGINAL SPACE COLOR WEBGL PASS '+JSON.stringify({
    stars:meta.count,nebula:meta.nebula.length,
    changedPixels:ab.changed,peak:ab.peak,drawCalls:ab.drawCalls,
    map4:map4.phys,errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'failure.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});
