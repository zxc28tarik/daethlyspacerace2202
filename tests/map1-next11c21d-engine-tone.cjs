/* NEXT11C21D: real native 1x WebGL motor shroud pigment A/B. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21d-evidence');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  page.on('console',m=>{
   if(m.type()==='error'&&/shader|glsl|webgl/i.test(m.text()))
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
   typeof h4Ship19Race!=='undefined'&&!!h4Ship19Race,null,{timeout:30000});
  const result=await page.evaluate(()=>{
   const ship=h4Ship19Race,clamp=v=>Math.max(0,Math.min(1,v));
   const keys=['SECOND','DARK'],meshes=Object.fromEntries(keys.map(key=>
    [key,ship.children.find(m=>m.name==='NEXT11C20_SB07_'+key)]));
   const paint={},original={},previous={},statistics={};
   for(const key of keys){
    const mesh=meshes[key],pos=mesh.geometry.getAttribute('position'),
      attr=mesh.geometry.getAttribute('color');
    if(!attr||attr.count!==pos.count)throw Error(key+' color geometry mismatch');
    const old=new Float32Array(attr.array.length),saved=attr.array.slice();
    let err=0,changed=0,engineCount=0,maxDepth=0,maxLift=0;
    for(let i=0;i<pos.count;i++){
     const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i),
      wing=clamp((Math.abs(x)-1.05)/6.4),
      engine=clamp((z-1.1)/5.5)*clamp((Math.abs(x)-.8)/1.1),
      roof=clamp((y+.18)/1.2),
      e=engine*engine*(3-2*engine);
     const oldRgb=key==='SECOND'?[
      .870+.040*roof+.018*wing-.040*engine,
      .925+.035*roof-.024*engine,
      1.040+.018*roof-.008*engine]:[
      .925+.035*roof,.975+.018*engine,1.035+.015*engine];
     const newRgb=key==='SECOND'?[
      .870+.040*roof+.018*wing-.068*e,
      .925+.035*roof-.045*e,
      1.040+.018*roof+.010*e]:[
      .925+.035*roof-.030*e,
      .975+.020*e,
      1.035+.024*e];
     for(let k=0;k<3;k++){
      const value=attr.array[i*3+k];
      err=Math.max(err,Math.abs(value-newRgb[k]));
      old[i*3+k]=oldRgb[k];
      if(Math.abs(value-oldRgb[k])>.006)changed++;
     }
     if(e>.45){
      engineCount++;
      maxDepth=Math.max(maxDepth,oldRgb[0]-newRgb[0]);
      maxLift=Math.max(maxLift,newRgb[2]-oldRgb[2]);
     }
    }
    statistics[key]={vertices:pos.count,expectedColorError:err,
     changedChannels:changed,engineVertices:engineCount,
     maxEngineRedDepth:maxDepth,maxEngineBlueLift:maxLift,
     originalMaterialHex:mesh.material.color.getHex()};
    paint[key]=attr;original[key]=saved;previous[key]=old;
   }
   const immutable=['HULL','RED','GLASS','ORANGE','PLASMA'].map(key=>{
    const mesh=ship.children.find(m=>m.name==='NEXT11C20_SB07_'+key);
    return [key,mesh.material.color.getHex(),!!mesh.geometry.getAttribute('color')];
   });
   const studio=new THREE.Scene();
   studio.background=new THREE.Color(0x0b1220);
   studio.add(new THREE.AmbientLight(0xdde6f2,.75));
   const keyLight=new THREE.DirectionalLight(0xf9fbff,2.3);
   keyLight.position.set(-7,10,-5);studio.add(keyLight);
   const fill=new THREE.DirectionalLight(0x72b9f5,1.1);
   fill.position.set(10,3,9);studio.add(fill);
   const clone=ship.clone(true);clone.position.set(0,0,0);
   clone.rotation.set(0,0,0);clone.scale.set(1,1,1);
   clone.visible=true;studio.add(clone);
   const camera=new THREE.PerspectiveCamera(48,1600/900,.1,120);
   const render=angle=>{
    camera.position.copy(angle==='rear'?
     new THREE.Vector3(0,5,23):new THREE.Vector3(15,7,18));
    camera.lookAt(0,0,0);renderer.setPixelRatio(1);
    renderer.setSize(1600,900,false);renderer.render(studio,camera);
    const gl=renderer.getContext();gl.finish();
    const err=gl.getError(),raw=new Uint8Array(1600*900*4);
    gl.readPixels(0,0,1600,900,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    const pixels=new Uint8ClampedArray(raw.length),row=1600*4;
    for(let y=0;y<900;y++)
     pixels.set(raw.subarray(y*row,(y+1)*row),(899-y)*row);
    const canvas=document.createElement('canvas');canvas.width=1600;
    canvas.height=900;
    canvas.getContext('2d').putImageData(new ImageData(pixels,1600,900),0,0);
    return {raw,png:canvas.toDataURL('image/png').split(',')[1],
     err,calls:renderer.info.render.calls,aa:gl.getContextAttributes().antialias};
   };
   const images=[];
   for(const angle of ['rear','rear-quarter']){
    for(const key of keys){
     paint[key].array.set(previous[key]);paint[key].needsUpdate=true;
    }
    const before=render(angle);
    for(const key of keys){
     paint[key].array.set(original[key]);paint[key].needsUpdate=true;
    }
    const after=render(angle);
    let differentGt2=0,differentGt12=0,maxChannelDifference=0;
    for(let i=0;i<before.raw.length;i+=4){
     const delta=Math.max(Math.abs(before.raw[i]-after.raw[i]),
      Math.abs(before.raw[i+1]-after.raw[i+1]),
      Math.abs(before.raw[i+2]-after.raw[i+2]));
     maxChannelDifference=Math.max(maxChannelDifference,delta);
     if(delta>2)differentGt2++;
     if(delta>12)differentGt12++;
    }
    images.push({angle,c21cPng:before.png,c21dPng:after.png,
     differentGt2,differentGt12,maxChannelDifference,
     glError:Math.max(before.err,after.err),
     oldDrawCalls:before.calls,newDrawCalls:after.calls,
     antialias:before.aa&&after.aa});
   }
   for(const key of keys){
    paint[key].array.set(original[key]);paint[key].needsUpdate=true;
   }
   return {audit:{
    version:ship.userData.engineToneVersion,
    energyUnchanged:ship.userData.engineToneOriginalEnergy,
    priorRedVersion:ship.userData.raceRedFlowVersion,
    originalAA:renderer.getContext().getContextAttributes().antialias,
    pixelRatio:renderer.getPixelRatio(),
    shipParts:ship.userData.parts,meshBatches:ship.children.length,
    statistics,immutable},
    images};
  });
  const a=result.audit,s=a.statistics;
  assert.equal(a.version,'NEXT11C21D');
  assert(a.energyUnchanged);assert.equal(a.priorRedVersion,'NEXT11C21C');
  assert(a.originalAA);assert.equal(a.pixelRatio,1);
  assert.equal(a.shipParts,189);assert.equal(a.meshBatches,7);
  assert.equal(s.SECOND.vertices,38376);assert.equal(s.DARK.vertices,24216);
  assert.equal(s.SECOND.originalMaterialHex,0x566675);
  assert.equal(s.DARK.originalMaterialHex,0x15202c);
  for(const key of ['SECOND','DARK']){
   assert(s[key].expectedColorError<.000002,key+' pigment formula mismatch');
   assert(s[key].changedChannels>100,key+' pigment failed to change');
   assert(s[key].engineVertices>10,key+' actual engine vertices missing');
   assert(s[key].maxEngineRedDepth>.005,key+' engine metal not distinctly deeper');
   assert(s[key].maxEngineBlueLift>.005,key+' blue-steel response missing');
  }
  assert.deepEqual(a.immutable.map(x=>x.slice(0,2)),[
   ['HULL',0xdbe4ea],['RED',0xc43838],['GLASS',0x18394f],
   ['ORANGE',0xfaa15d],['PLASMA',0x6dd9ff]
  ]);
  const imageReports=[];
  for(const snap of result.images){
   const {angle,c21cPng,c21dPng,...metrics}=snap;
   fs.writeFileSync(path.join(out,'c21c-'+angle+'.png'),Buffer.from(c21cPng,'base64'));
   fs.writeFileSync(path.join(out,'c21d-'+angle+'.png'),Buffer.from(c21dPng,'base64'));
   assert.equal(metrics.glError,0);assert(metrics.antialias);
   assert.equal(metrics.oldDrawCalls,9);assert.equal(metrics.newDrawCalls,9);
   assert(metrics.differentGt2>20);
   imageReports.push({angle,...metrics});
  }
  assert.deepEqual(errors,[]);
  const report={pass:true,tag:'NEXT11C21D',audit:a,images:imageReports,errors,
   caveat:'Same true WebGL model/machine/AA under two pigment buffers. Aesthetic judgement is separate.'};
  fs.writeFileSync(path.join(out,'engine-metal-report.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21D ENGINE METAL REAL WEBGL PASS '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});