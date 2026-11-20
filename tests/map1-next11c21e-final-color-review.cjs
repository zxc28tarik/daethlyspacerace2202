/* NEXT11C21E — actual native 1x WebGL four-angle final aesthetic evidence.
 * Never imply numerical color difference equals user art acceptance. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21e-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(String(e.stack||e.message)));
  page.on('console',msg=>{
   if(msg.type()==='error'&&/shader|webgl|glsl/i.test(msg.text()))
    errors.push(msg.text());
  });
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
    route=>route.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
    route=>route.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Ship20ZenitBuild==='function'&&
    typeof h4Ship19Race!=='undefined'&&!!h4Ship19Race,
    null,{timeout:30000});
  const result=await page.evaluate(()=>{
   const ship=h4Ship19Race,model=ship.clone(true);
   const materialKeys=['HULL','SECOND','RED','DARK','GLASS','ORANGE','PLASMA'];
   const materialColors={HULL:0xdbe4ea,SECOND:0x566675,
    RED:0xc43838,DARK:0x15202c,GLASS:0x18394f,
    ORANGE:0xfaa15d,PLASMA:0x6dd9ff};
   const families={};
   for(const key of materialKeys){
    const mesh=model.children.find(m=>m.name==='NEXT11C20_SB07_'+key);
    if(!mesh)throw Error('Missing real ship family '+key);
    const p=mesh.geometry.getAttribute('position'),
      n=mesh.geometry.getAttribute('normal'),
      uv=mesh.geometry.getAttribute('uv'),
      color=mesh.geometry.getAttribute('color');
    families[key]={hex:mesh.material.color.getHex(),positions:p.count,
     normals:n?.count||0,uv:uv?.count||0,
     rgbVertices:color?.count||0,
     pigmented:!!mesh.material.vertexColors};
   }
   const studio=new THREE.Scene();
   studio.background=new THREE.Color(0x0b1220);
   studio.add(new THREE.AmbientLight(0xdde6f2,.75));
   const keyLight=new THREE.DirectionalLight(0xf9fbff,2.3);
   keyLight.position.set(-7,10,-5);studio.add(keyLight);
   const fill=new THREE.DirectionalLight(0x72b9f5,1.1);
   fill.position.set(10,3,9);studio.add(fill);
   model.position.set(0,0,0);model.rotation.set(0,0,0);
   model.scale.set(1,1,1);model.visible=true;studio.add(model);
   const camera=new THREE.PerspectiveCamera(48,1600/900,.1,120),
    angles={rear:[0,5,23],front:[0,5,-23],
     'rear-quarter':[15,7,18],top:[0,25,4]};
   const gallery=document.createElement('canvas');
   gallery.width=1600;gallery.height=900;
   const gctx=gallery.getContext('2d'),images=[];
   for(const [angle,coords] of Object.entries(angles)){
    camera.position.set(...coords);camera.lookAt(0,0,0);
    renderer.setPixelRatio(1);renderer.setSize(1600,900,false);
    renderer.render(studio,camera);
    const gl=renderer.getContext();gl.finish();
    const glError=gl.getError(),raw=new Uint8Array(1600*900*4);
    gl.readPixels(0,0,1600,900,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    const rgba=new Uint8ClampedArray(raw.length),stride=1600*4;
    for(let y=0;y<900;y++)
      rgba.set(raw.subarray(y*stride,(y+1)*stride),(899-y)*stride);
    const canvas=document.createElement('canvas');
    canvas.width=1600;canvas.height=900;
    canvas.getContext('2d').putImageData(new ImageData(rgba,1600,900),0,0);
    const coordIndex=Object.keys(angles).indexOf(angle),
      gx=(coordIndex%2)*800,gy=Math.floor(coordIndex/2)*450;
    gctx.drawImage(canvas,gx,gy,800,450);
    gctx.font='bold 19px sans-serif';
    gctx.fillStyle='rgba(0,0,0,.68)';
    gctx.fillRect(gx+12,gy+12,184,34);
    gctx.fillStyle='#f7fafc';gctx.fillText(angle.toUpperCase(),gx+23,gy+35);
    let lit=0,red=0,cyan=0,amber=0,clipped=0,
      minX=1600,maxX=0,minY=900,maxY=0;
    for(let y=0;y<900;y++)
     for(let x=0;x<1600;x++){
      const i=(y*1600+x)*4,R=rgba[i],G=rgba[i+1],B=rgba[i+2];
      if(R+G+B<=130)continue;
      lit++;
      minX=Math.min(minX,x);maxX=Math.max(maxX,x);
      minY=Math.min(minY,y);maxY=Math.max(maxY,y);
      if(R>80&&R>G*1.25&&R>B*1.2)red++;
      if(B>95&&B>R*1.32&&G>R*1.18)cyan++;
      if(R>125&&G>65&&R>G*1.22&&G>B*1.19)amber++;
      if(R>248&&G>248&&B>248)clipped++;
     }
    images.push({angle,png:canvas.toDataURL('image/png').split(',')[1],
     glError,drawCalls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     antialias:gl.getContextAttributes().antialias,
     litPixels:lit,redPixels:red,cyanPixels:cyan,amberPixels:amber,
     clippedPixels:clipped,silhouette:[minX,minY,maxX,maxY]});
   }
   return {audit:{
    parts:ship.userData.parts,character:ship.userData.authoredShipId,
    colorHierarchy:ship.userData.colorHierarchy,
    raceRedFlowVersion:ship.userData.raceRedFlowVersion,
    engineToneVersion:ship.userData.engineToneVersion,
    nativeAA:renderer.getContext().getContextAttributes().antialias,
    pixelRatio:renderer.getPixelRatio(),batches:ship.children.length,
    families,materialColors},
    images,gallery:gallery.toDataURL('image/png').split(',')[1]};
  });
  const a=result.audit;
  assert.equal(a.character,'SB-07');assert.equal(a.parts,189);
  assert.equal(a.batches,7);assert(a.nativeAA);
  assert.equal(a.pixelRatio,1);
  assert.equal(a.colorHierarchy,'SB07_BALANCED');
  assert.equal(a.raceRedFlowVersion,'NEXT11C21C');
  assert.equal(a.engineToneVersion,'NEXT11C21D');
  assert.equal(Object.keys(a.families).length,7);
  let colored=0;
  for(const [key,m] of Object.entries(a.families)){
   assert.equal(m.hex,a.materialColors[key],'original base HEX '+key);
   assert(m.positions>0);
   assert.equal(m.positions,m.normals);
   assert.equal(m.positions,m.uv);
   if(['HULL','SECOND','RED','DARK'].includes(key)){
    assert(m.pigmented);assert.equal(m.rgbVertices,m.positions);
    colored+=m.rgbVertices;
   }else{
    assert(!m.pigmented);assert.equal(m.rgbVertices,0);
   }
  }
  assert.equal(colored,74700);
  const reports=[];
  for(const {png,...image} of result.images){
   assert.equal(image.glError,0);
   assert.equal(image.drawCalls,9);
   assert(image.triangles>4000&&image.antialias);
   assert(image.litPixels>7000);
   assert(image.silhouette[2]-image.silhouette[0]>120);
   assert(image.silhouette[3]-image.silhouette[1]>50);
   assert(image.clippedPixels/image.litPixels<.50);
   fs.writeFileSync(path.join(out,'final-'+image.angle+'-1600x900.png'),
     Buffer.from(png,'base64'));
   reports.push(image);
  }
  fs.writeFileSync(path.join(out,'final-sb07-four-angle-contact-sheet.png'),
    Buffer.from(result.gallery,'base64'));
  assert.deepEqual(errors,[]);
  const report={pass:true,tag:'NEXT11C21E',audit:a,
   angles:reports,errors,
   artReviewRequired:true,
   caveat:'Photographs are actual WebGL. No automated numeric threshold proves beauty, only render integrity and color distribution.'};
  fs.writeFileSync(path.join(out,'final-color-review.json'),
    JSON.stringify(report,null,2));
  console.log('NEXT11C21E FINAL PALETTE TRUE WEBGL PASS '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});