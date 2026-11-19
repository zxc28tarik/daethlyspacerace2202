/* NEXT11C20U: SB-07 geometry-first render quality. Real Chromium WebGL
 * live ship mesh, roof-conformal stripe clearance and Map4 protection.
 * Not a native physical GPU FPS benchmark. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c20u-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[];
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},
   deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.stack||e.message));
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
  await page.waitForFunction(()=>typeof h4Ship20ZenitBuild==='function' &&
   !!h4Ship19Race&&!!h4Ship19Combat&&typeof startGame==='function',
   null,{timeout:25000});
  const geom=await page.evaluate(()=>{
   const ship=h4Ship19Race,combat=h4Ship19Combat;
   const hull=ship.children.find(o=>o.name==='NEXT11C20_SB07_HULL');
   const red=ship.children.find(o=>o.name==='NEXT11C20_SB07_RED');
   const px=mesh=>mesh.geometry.getAttribute('position');
   const count=mesh=>px(mesh).count;
   const ray=new THREE.Raycaster();
   const proxy=mesh=>{const m=new THREE.Mesh(mesh.geometry,mesh.material);
    m.updateMatrixWorld(true);return m;};
   const H=proxy(hull),R=proxy(red);
   const topAt=(mesh,x,z)=>{
    ray.set(new THREE.Vector3(x,3,z),new THREE.Vector3(0,-1,0));
    return ray.intersectObject(mesh,false).map(h=>h.point.y)
     .filter(y=>y>.45&&y<1.1).sort((a,b)=>b-a)[0]??null;
   };
   const samples=[];
   for(const side of [-1,1]){
    for(const z of [.72,1.18,1.52,1.89,2.10]){
     for(const offset of [-.04,0,.04]){
      const x=side*(1.77+offset);
      const redY=topAt(R,x,z),hullY=topAt(H,x,z);
      samples.push({side,z,offset,redY,hullY,
       clearance:redY!==null&&hullY!==null?redY-hullY:null});
     }
    }
   }
   const redAttr=px(red);
   const spineVerts=[];
   for(let i=0;i<redAttr.count;i++){
    const x=redAttr.getX(i),z=redAttr.getZ(i);
    if((Math.abs(x-1.77)<.08||Math.abs(x+1.77)<.08)&&z>-.25&&z<2.4)
     spineVerts.push({x,z,y:redAttr.getY(i)});
   }
   const raceParts=ship.userData.parts;
   const baseFrame=renderer.getContext().getContextAttributes();
   return {parts:raceParts,combatParts:combat.userData.parts,
    id:ship.userData.authoredShipId,raceOnly:ship.userData.raceOnly,
    weapons:ship.userData.weaponMounts,batches:ship.children.length,
    detailPass:ship.userData.detailPass,
    contoured:ship.userData.contouredEngineSpines,
    stripes:ship.userData.roofConformalSpineStripes,
    stations:ship.userData.engineSpineStations,
    lifted:ship.userData.engineSpinePaintLift,
    detachedTipRemoved:ship.userData.engineSpineDetachedTipRemoved,
    dimensions:new THREE.Box3().setFromObject(ship).getSize(new THREE.Vector3()).toArray(),
    hullVertices:count(hull),redVertices:count(red),
    normalized:ship.children.every(o=>o.isMesh&&o.geometry.getAttribute('normal')?.count===
     o.geometry.getAttribute('position')?.count&&
     o.geometry.getAttribute('uv')?.count===
     o.geometry.getAttribute('position')?.count),
    physicalAA:!!baseFrame.antialias,
    pixelRatio:renderer.getPixelRatio(),
    samples,spineVerticesCount:spineVerts.length,
    minStripeZ:Math.min(...spineVerts.map(v=>v.z)),
    maxStripeZ:Math.max(...spineVerts.map(v=>v.z)),
    originalRails:corridorGuideGroup.userData.railOriginalSegments,
    originalRings:corridorGuideGroup.userData.ringOriginalCount,
    originalRailBatches:corridorGuideGroup.userData.railBatchCount,
    originalRingBatches:corridorGuideGroup.userData.ringBatchCount,
    originalMap4Physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    noCollider:ship.children.every(o=>o.userData.noCollider===true)
   };
  });
  assert.equal(geom.parts,189);
  assert.equal(geom.combatParts,249);
  assert.equal(geom.id,'SB-07');
  assert(geom.raceOnly&&geom.weapons===0);
  assert.equal(geom.batches,7);
  assert.equal(geom.contoured,2);
  assert.equal(geom.stripes,2);
  assert.equal(geom.stations,6);
  assert.equal(geom.lifted,.014);
  assert(geom.detachedTipRemoved);
  assert.equal(geom.originalRails,6960);
  assert.equal(geom.originalRings,192);
  assert.equal(geom.originalRailBatches,20);
  assert.equal(geom.originalRingBatches,10);
  assert.deepEqual(geom.originalMap4Physics,[0,0,0]);
  assert(geom.noCollider&&geom.normalized&&geom.physicalAA);
  assert.equal(geom.pixelRatio,1);
  assert(geom.spineVerticesCount>25);
  assert(geom.minStripeZ>=.3399,
   'old red box floated ahead of the supporting engine shell');
  assert(geom.maxStripeZ<=2.131,
   'new conformal paint must stop on its supporting spine');
  assert.equal(geom.samples.length,30);
  for(const r of geom.samples){
   assert(Number.isFinite(r.redY)&&Number.isFinite(r.hullY),
    'both actual surfaces must exist: '+JSON.stringify(r));
   assert(r.clearance>=.008 && r.clearance<=.024,
    'paint should not float or z-fight the shell: '+JSON.stringify(r));
  }
  const images=[];
  for(const angle of ['rear','front','rear-quarter','top']){
   const snap=await page.evaluate(angle=>{
    const size=[1600,900],studio=new THREE.Scene();
    studio.background=new THREE.Color(0x0b1220);
    studio.add(new THREE.AmbientLight(0xdde6f2,.75));
    const key=new THREE.DirectionalLight(0xf9fbff,2.3);
    key.position.set(-7,10,-5);studio.add(key);
    const fill=new THREE.DirectionalLight(0x72b9f5,1.1);
    fill.position.set(10,3,9);studio.add(fill);
    const ship=h4Ship19Race.clone(true);
    ship.position.set(0,0,0);ship.rotation.set(0,0,0);ship.scale.set(1,1,1);
    ship.visible=true;studio.add(ship);
    const cam=new THREE.PerspectiveCamera(48,size[0]/size[1],.1,120);
    cam.position.copy({
     'rear':new THREE.Vector3(0,5,23),
     'front':new THREE.Vector3(0,5,-23),
     'rear-quarter':new THREE.Vector3(15,7,18),
     'top':new THREE.Vector3(0,25,4)
    }[angle]);
    cam.lookAt(0,0,0);
    renderer.setPixelRatio(1);renderer.setSize(...size,false);
    renderer.render(studio,cam);
    const gl=renderer.getContext();gl.finish();
    const err=gl.getError();
    const [w,h]=size,raw=new Uint8Array(w*h*4);
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    const flipped=new Uint8ClampedArray(raw.length),row=w*4;
    let lit=0;
    for(let y=0;y<h;y++){
     const line=raw.subarray(y*row,(y+1)*row);
     flipped.set(line,(h-1-y)*row);
     for(let x=0;x<line.length;x+=4)
      if(line[x]+line[x+1]+line[x+2]>130)lit++;
    }
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').putImageData(new ImageData(flipped,w,h),0,0);
    return {angle,png:canvas.toDataURL('image/png').split(',')[1],
     glError:err,drawCalls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     litPixels:lit,snapshot:size,
     rendererAA:!!gl.getContextAttributes().antialias,
     materialBatches:ship.children.length};
   },angle);
   const bin=Buffer.from(snap.png,'base64');
   fs.writeFileSync(path.join(out,'sb07-contoured-'+angle+'-1600x900.png'),bin);
   delete snap.png;
   assert.equal(snap.glError,0);
   assert.equal(snap.drawCalls,9,'same seven merged batches plus two halos');
   assert(snap.triangles>4000&&snap.litPixels>7000);
   assert.equal(snap.materialBatches,7);
   assert(snap.rendererAA);
   images.push(snap);
  }
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1 &&
    state.raceTime>.02,null,{timeout:25000});
  await page.evaluate(()=>{
   state.paused=true;renderer.setSize(1600,900,false);
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
  });
  const active=await page.evaluate(()=>{
   renderer.render(scene,camera);
   return {map:state.activeMap,parts:h4Ship19Race.userData.parts,
    visible:h4Ship19Race.visible,renderCalls:renderer.info.render.calls};
  });
  assert(active.visible&&active.renderCalls>20);
  assert.equal(active.parts,189);
  await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
  });
  const protectedMap4=await page.evaluate(()=>{
   renderer.render(scene,camera);
   return {map:state.activeMap,parts:h4Ship19Combat.userData.parts,
    raceVisible:h4Ship19Race.visible,combatVisible:h4Ship19Combat.visible,
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    calls:renderer.info.render.calls};
  });
  assert(!protectedMap4.raceVisible&&protectedMap4.combatVisible);
  assert.equal(protectedMap4.parts,249);
  assert.deepEqual(protectedMap4.physics,[6,36,200]);
  assert(protectedMap4.calls>0);
  assert.deepEqual(errors,[]);
  const report={pass:true,tag:'NEXT11C20U',geom,images,active,protectedMap4,errors,
   caveat:'Real WebGL independent studio view of game model, not original player camera or native GPU FPS. A/B visual judgement requires user.'};
  fs.writeFileSync(path.join(out,'integrated-spines-qa.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C20U SCULPTED SPINE REAL WEBGL PASS '+JSON.stringify({
   parts:geom.parts,spines:geom.contoured,roofStripes:geom.stripes,
   samples:geom.samples.length,
   clearanceMin:Math.min(...geom.samples.map(s=>s.clearance)),
   clearanceMax:Math.max(...geom.samples.map(s=>s.clearance)),
   floatingTipRemoved:geom.detachedTipRemoved,
   realScreenshots:images.length,
   renderBatches:geom.batches,map4Parts:protectedMap4.parts,
   map4Physics:protectedMap4.physics}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});
