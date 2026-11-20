/* NEXT11C21C — real WebGL racing red flow A/B, same model and native 1x AA. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21c-evidence');
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[];
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  page.on('console',msg=>{
   if(msg.type()==='error'&&/webgl|glsl|shader/i.test(msg.text()))
    errors.push(msg.text());
  });
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
    r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
    r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Ship20ZenitBuild==='function'&&
    typeof h4Ship19Race!=='undefined'&&!!h4Ship19Race,
    null,{timeout:30000});
  const result=await page.evaluate(()=>{
   const ship=h4Ship19Race,red=ship.children.find(
    m=>m.name==='NEXT11C20_SB07_RED');
   if(!red)throw Error('Missing real RED geometry');
   const p=red.geometry.getAttribute('position'),
      ca=red.geometry.getAttribute('color'),
      clamp=v=>Math.max(0,Math.min(1,v));
   if(!ca||ca.count!==p.count)throw Error('RED GPU geometry/paint mismatch');
   const old=new Float32Array(ca.array.length),corrected=ca.array.slice();
   let maximumError=0,changed=0;
   const outer=[],inner=[];
   for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const wing=clamp((Math.abs(x)-1.05)/6.4),
     nose=clamp((-z-1)/8),roof=clamp((y+.18)/1.2),
     wingEdge=wing*wing*(3-2*wing),
     sweep=wingEdge*clamp((3-z)/7);
    const expected=[
     .985+.010*nose+.009*sweep,
     .755-.034*nose-.058*sweep+.008*roof,
     .780-.032*nose-.058*sweep+.006*roof
    ];
    const previous=[.995+.005*nose,
     .720+.070*wing+.016*nose,
     .740+.045*wing+.015*nose];
    for(let k=0;k<3;k++){
     const current=ca.array[i*3+k];
     maximumError=Math.max(maximumError,Math.abs(current-expected[k]));
     old[i*3+k]=previous[k];
     if(Math.abs(current-previous[k])>.008)changed++;
    }
    if(Math.abs(x)>5&&z<0)
     outer.push({red:expected[0],green:expected[1],
      previousGreen:previous[1],sweep});
    if(Math.abs(x)<2.1&&z>0)
     inner.push({green:expected[1],previousGreen:previous[1]});
   }
   const mean=(arr,key)=>arr.reduce((n,item)=>n+item[key],0)/arr.length;
   const audit={parts:ship.userData.parts,
    version:ship.userData.raceRedFlowVersion,
    noGeometry:ship.userData.raceRedFlowOriginalGeometry,
    legacyTag:ship.userData.colorHierarchyVersion,
    batchCount:ship.children.length,redVertices:p.count,
    maxPigmentError:maximumError,changedChannels:changed,
    outerCount:outer.length,innerCount:inner.length,
    outerGreen:mean(outer,'green'),
    outerOldGreen:mean(outer,'previousGreen'),
    innerGreen:mean(inner,'green'),
    innerOldGreen:mean(inner,'previousGreen'),
    outerSweep:mean(outer,'sweep'),
    materialHex:red.material.color.getHex(),
    originalAA:renderer.getContext().getContextAttributes().antialias,
    pixelRatio:renderer.getPixelRatio(),
    immutableBatchColors:['HULL','SECOND','DARK','GLASS','ORANGE','PLASMA']
      .map(key=>{
       const mesh=ship.children.find(m=>m.name==='NEXT11C20_SB07_'+key);
       return [key,mesh.material.color.getHex(),mesh.geometry.getAttribute('position').count];
      })
   };
   const studio=new THREE.Scene();
   studio.background=new THREE.Color(0x0b1220);
   studio.add(new THREE.AmbientLight(0xdde6f2,.75));
   const key=new THREE.DirectionalLight(0xf9fbff,2.3);
   key.position.set(-7,10,-5);studio.add(key);
   const fill=new THREE.DirectionalLight(0x72b9f5,1.1);
   fill.position.set(10,3,9);studio.add(fill);
   const clone=ship.clone(true);
   clone.position.set(0,0,0);clone.rotation.set(0,0,0);clone.scale.set(1,1,1);
   clone.visible=true;studio.add(clone);
   const camera=new THREE.PerspectiveCamera(48,1600/900,.1,120);
   const render=(angle)=>{
    camera.position.copy(angle==='top'?
     new THREE.Vector3(0,25,4):new THREE.Vector3(15,7,18));
    camera.lookAt(0,0,0);
    renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
    renderer.render(studio,camera);
    const gl=renderer.getContext();gl.finish();
    const glError=gl.getError(),raw=new Uint8Array(1600*900*4);
    gl.readPixels(0,0,1600,900,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    const flipped=new Uint8ClampedArray(raw.length),stride=1600*4;
    for(let y=0;y<900;y++)
     flipped.set(raw.subarray(y*stride,(y+1)*stride),(899-y)*stride);
    const canvas=document.createElement('canvas');
    canvas.width=1600;canvas.height=900;
    canvas.getContext('2d').putImageData(new ImageData(flipped,1600,900),0,0);
    return {raw,png:canvas.toDataURL('image/png').split(',')[1],
     glError,drawCalls:renderer.info.render.calls,
     aa:gl.getContextAttributes().antialias};
   };
   const images=[];
   for(const angle of ['rear-quarter','top']){
    ca.array.set(old);ca.needsUpdate=true;
    const before=render(angle);
    ca.array.set(corrected);ca.needsUpdate=true;
    const after=render(angle);
    let changedPixels=0,changedSoftPixels=0,maxDelta=0;
    for(let i=0;i<before.raw.length;i+=4){
     const d=Math.max(...[0,1,2].map(k=>Math.abs(before.raw[i+k]-after.raw[i+k])));
     maxDelta=Math.max(maxDelta,d);
     if(d>2)changedSoftPixels++;
     if(d>12)changedPixels++;
    }
    images.push({angle,beforePng:before.png,afterPng:after.png,
     differingPixelsGt2:changedSoftPixels,
     differingPixelsGt12:changedPixels,maxChannelDifference:maxDelta,
     glError:Math.max(before.glError,after.glError),
     aa:before.aa&&after.aa,
     drawCallsBefore:before.drawCalls,drawCallsAfter:after.drawCalls});
   }
   ca.array.set(corrected);ca.needsUpdate=true;
   return {audit,images};
  });
  const a=result.audit;
  assert.equal(a.parts,189);assert.equal(a.batchCount,7);
  assert.equal(a.version,'NEXT11C21C');assert(a.noGeometry);
  assert.equal(a.legacyTag,'NEXT11C21B-E');
  assert.equal(a.materialHex,0xc43838);
  assert.equal(a.redVertices,1632);
  assert(a.originalAA);assert.equal(a.pixelRatio,1);
  assert(a.maxPigmentError<.000002,'actual RED GPU buffer must match new flow');
  assert(a.changedChannels>600);
  assert(a.outerCount>10 && a.innerCount>10);
  assert(a.outerSweep>.1);
  assert(a.outerGreen<a.outerOldGreen-.005,'forward swept outer RED must saturate');
  assert(a.innerGreen>a.innerOldGreen+.008,'inner RED must remain cleaner');
  assert.deepEqual(a.immutableBatchColors.map(x=>x.slice(0,2)),[
   ['HULL',0xdbe4ea],['SECOND',0x566675],['DARK',0x15202c],
   ['GLASS',0x18394f],['ORANGE',0xfaa15d],['PLASMA',0x6dd9ff]
  ]);
  const reportImages=[];
  for(const image of result.images){
   const {angle,beforePng,afterPng,...metrics}=image;
   fs.writeFileSync(path.join(out,'c21b-'+angle+'.png'),Buffer.from(beforePng,'base64'));
   fs.writeFileSync(path.join(out,'c21c-'+angle+'.png'),Buffer.from(afterPng,'base64'));
   assert.equal(metrics.glError,0);
   assert(metrics.aa);
   assert.equal(metrics.drawCallsBefore,9);
   assert.equal(metrics.drawCallsAfter,9);
   assert(metrics.differingPixelsGt2>50,'real visible shader-color effect required');
   reportImages.push({angle,...metrics});
  }
  assert.deepEqual(errors,[]);
  const report={pass:true,tag:'NEXT11C21C',audit:a,images:reportImages,
   errors,caveat:'Actual WebGL A/B with old pigment reconstructed on same mesh, not subjective art proof.'};
  fs.writeFileSync(path.join(out,'red-flow-report.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21C RED FLOW REAL WEBGL PASS '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});