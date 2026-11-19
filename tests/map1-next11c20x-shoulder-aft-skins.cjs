/* NEXT11C20X: SB-07 geometry-first render quality. Real Chromium WebGL
 * live ship mesh, roof-conformal stripe clearance and Map4 protection.
 * Not a native physical GPU FPS benchmark. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c20x-evidence');fs.mkdirSync(out,{recursive:true});
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
   // Examine real HULL vertices of the newly sculpted wing junction.
   // The old source had ONE thin detached root seam per side, not a
   // continuous surface. 5*6*2 expected roof stations are checked
   // directly against the merged, displayed vertex buffer.
   const rootStations=[
    [-2.93,1.02,1.96],[-2.53,1.075,2.11],
    [-2.05,1.13,2.29],[-1.55,1.185,2.43],
    [-.98,1.23,2.46]
   ];
   const rootFractions=[0,.16,.37,.62,.83,1];
   const hullRows=[
    [-9.0,.045,.055],[-7.85,.28,.19],[-6.4,.55,.26],
    [-4.4,.92,.38],[-2.0,1.25,.59],[.3,1.44,.58],
    [2.5,1.39,.54],[4.8,1.07,.38],[6.15,.38,.23]
   ];
   const hullRoof=(z,x)=>{
    let j=0;
    while(j<hullRows.length-2&&z>hullRows[j+1][0])j++;
    const lo=hullRows[j],hi=hullRows[j+1],
      t=(z-lo[0])/(hi[0]-lo[0]),
      width=lo[1]+(hi[1]-lo[1])*t,
      height=lo[2]+(hi[2]-lo[2])*t;
    const u=Math.min(1,Math.abs(x)/width),step=2*Math.PI/14;
    const seg=Math.min(6,Math.floor(Math.acos(u)/step));
    const a=seg*step,b=(seg+1)*step;
    const mix=(Math.cos(a)-u)/(Math.cos(a)-Math.cos(b));
    return height*(Math.sin(a)*(1-mix)+Math.sin(b)*mix);
   };
   const allHull=px(hull),bridgeChecks=[];
   for(const side of [-1,1]){
    for(const [z,inner,outer] of rootStations){
     for(const t of rootFractions){
      const x=side*(inner+(outer-inner)*t);
      const innerHeight=hullRoof(z,inner)+.018,
        y=-.105+(innerHeight+.105)*Math.pow(1-t,1.65)+
          .018*Math.sin(Math.PI*t);
      let closest=Infinity;
      for(let i=0;i<allHull.count;i++){
       const dx=allHull.getX(i)-x,dy=allHull.getY(i)-y,
        dz=allHull.getZ(i)-z;
       const length=Math.sqrt(dx*dx+dy*dy+dz*dz);
       if(length<closest)closest=length;
      }
      bridgeChecks.push({side,z,t,x,y,closestVertexError:closest});
     }
    }
   }
   const rootRise=side=>{
    const bridge=bridgeChecks.filter(x=>x.side===side&&x.z===-2.05);
    return bridge[0].y-bridge[bridge.length-1].y;
   };
   const redAttr=px(red);
   const spineVerts=[];
   for(let i=0;i<redAttr.count;i++){
    const x=redAttr.getX(i),z=redAttr.getZ(i);
    if((Math.abs(x-1.77)<.08||Math.abs(x+1.77)<.08)&&z>-.25&&z<2.4)
     spineVerts.push({x,z,y:redAttr.getY(i)});
   }
   // Validate genuine displayed 3D geometry, not userData claims.
   // 17 stations × 3 cross-edge points × 2 wings, same original
   // four exterior RED outline corners and the old .016 layer relief.
   const redPaintChecks=[],flapChecks=[];
   const dark=ship.children.find(o=>o.name==='NEXT11C20_SB07_DARK'),
         darkAttr=px(dark);
   const nearest=(attribute,x,y,z)=>{
     let min=Infinity;
     for(let i=0;i<attribute.count;i++){
       const dx=attribute.getX(i)-x,
         dy=attribute.getY(i)-y,
         dz=attribute.getZ(i)-z;
       const distance=Math.hypot(dx,dy,dz);
       if(distance<min)min=distance;
     }
     return min;
   };
   for(const side of [-1,1]){
     for(let j=0;j<17;j++){
       const t=j/16;
       const ax=2.16+(6.57-2.16)*t,
         az=-2.96+(-.67+2.96)*t,
         bx=2.31+(6.73-2.31)*t,
         bz=-3.13+(-.84+3.13)*t;
       for(let k=0;k<3;k++){
         const v=k/2,x=side*(ax+v*(bx-ax)),
           z=az+v*(bz-az),y=-.096;
         redPaintChecks.push({side,t,v,error:nearest(redAttr,x,y,z)});
       }
     }
     for(let j=0;j<13;j++){
       const t=j/12,
         x=side*(3.34+t*(5.95-3.34)),
         z=2.43+t*(1.70-2.43)-.012*Math.sin(Math.PI*t),
         halfWidth=.010+.014*Math.sin(Math.PI*t);
       for(const edge of [-1,1]){
         flapChecks.push({side,t,edge,
           error:nearest(darkAttr,x,-.087,z+edge*halfWidth)});
       }
     }
   }
   // NEXT11C20X: inspect DISPLAYED merged SECOND/RED GPU mesh
   // at 70 front shoulder top, 54 red paint and 50 aft bridge
   // sample coordinates. All are replacements for existing pieces.
   const second=ship.children.find(o=>o.name==='NEXT11C20_SB07_SECOND'),
     secondAttr=px(second);
   const frontStations=[
    [-1.48,4.48,.30,-.103],[-1.10,4.53,.58,-.079],
    [-.52,4.63,.76,-.057],[.10,4.74,.64,-.076],
    [.52,4.84,.28,-.103]
   ];
   const frontU=[-1,-.76,-.42,0,.42,.76,1];
   const stripeZ=[-.84,-.75,-.65,-.56,-.47,-.38,-.29,-.21,-.14];
   const stripeU=[.62,.75,.88];
   const aftStations=[
    [2.32,1.49,.115,-.072],
    [2.78,1.55,.210,-.051],
    [3.62,1.66,.247,-.043],
    [4.53,1.78,.191,-.055],
    [5.19,1.85,.105,-.085]
   ];
   const frontInterp=z=>{
    let i=0;
    while(i<frontStations.length-2&&z>frontStations[i+1][0])i++;
    const a=frontStations[i],b=frontStations[i+1],
      t=Math.max(0,Math.min(1,(z-a[0])/(b[0]-a[0])));
    return [1,2,3].map(k=>a[k]+(b[k]-a[k])*t);
   };
   const frontTop=(z,u)=>{
    const [, ,peak]=frontInterp(z),foot=-.106;
    return foot+(peak-foot)*Math.pow(1-Math.abs(u),1.55);
   };
   const fronts=[],shoulderPaint=[],aft=[];
   for(const side of [-1,1]){
    for(const [z,center,width] of frontStations)
     for(const u of frontU){
      const x=side*(center+width*u),y=frontTop(z,u);
      fronts.push({side,z,u,y,
       error:nearest(secondAttr,x,y,z)});
     }
    for(const z of stripeZ){
     const [center,width]=frontInterp(z);
     for(const u of stripeU){
      const x=side*(center+width*u),y=frontTop(z,u)+.012;
      shoulderPaint.push({side,z,u,y,
       error:nearest(redAttr,x,y,z)});
     }
    }
    for(const [x,z,width,roof] of aftStations){
     for(let i=0;i<5;i++){
      const depth=i/2-1,
        y=-.108+(roof+.108)*(1-Math.abs(depth)**1.6);
      aft.push({side,x,z,depth,y,
       error:nearest(secondAttr,side*x,y,z+depth*width)});
     }
    }
   }
   // Native WebGL raycast of real rendered material, not assertion
   // only of coordinate arrays. Probe red-film/metal separation.
   const actualShoulderClearance=[];
   const secondaryProxy=proxy(second);
   for(const side of [-1,1]){
    for(const z of [-.75,-.47,-.21]){
     const [center,width]=frontInterp(z),x=side*(center+width*.75);
     ray.set(new THREE.Vector3(x,.8,z),new THREE.Vector3(0,-1,0));
     const redHits=ray.intersectObject(R,false)
       .filter(h=>h.point.y>-.15&&h.point.y<.15);
     const secondHits=ray.intersectObject(secondaryProxy,false)
       .filter(h=>h.point.y>-.15&&h.point.y<.15);
     actualShoulderClearance.push({side,z,
       redY:redHits[0]?.point.y??null,
       secondY:secondHits[0]?.point.y??null,
       separation:(redHits[0]&&secondHits[0])?
         +(redHits[0].point.y-secondHits[0].point.y).toFixed(5):null});
    }
   }
   // All examined red film points lie on exactly one wing skin plane.
   // Existing 8 real red/HULL, flap/HULL and root-lip tests in the
   // original SB-07 integration suite still check 0.008-0.05 relief.
   const mergedPaintTopY=[];
   for(const side of [-1,1]){
     const t=.30,ax=2.16+4.41*t,az=-2.96+2.29*t,
       bx=2.31+4.42*t,bz=-3.13+2.29*t,
       x=side*(ax+bx)/2,z=(az+bz)/2;
     const bottom=new THREE.Mesh(
       hull.geometry,hull.material);
     bottom.updateMatrixWorld(true);
     ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));
     const hits=ray.intersectObject(bottom,false)
       .filter(h=>h.point.y<.1&&h.point.y>-.18);
     mergedPaintTopY.push({side,hullY:hits[0]?.point.y??null,
       paintY:-.096});
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
    frontShoulderPieces:ship.userData.contouredFrontShoulders,
    frontShoulderSections:ship.userData.frontShoulderStations,
    frontShoulderProfiles:ship.userData.frontShoulderCrossSections,
    frontShoulderPaintGrids:ship.userData.frontShoulderPaintGrids,
    frontRedClearance:ship.userData.frontShoulderRedClearance,
    aftWingBridgePieces:ship.userData.taperedAftWingBridges,
    aftWingBridgeStations:ship.userData.aftBridgeStations,
    frontBoxesReplaced:ship.userData.shoulderBoxesReplaced,
    aftBoxesReplaced:ship.userData.aftBoxesReplaced,
    noNewPieces:ship.userData.shoulderGeometryNoExtraPieces,
    originalMSAARetained:ship.userData.shoulderOriginalMSAA,
    frontChecks:fronts,shoulderPaintChecks:shoulderPaint,
    aftChecks:aft,actualShoulderClearance,
    conformalWingPaint:ship.userData.conformalWingPaintStrips,
    paintGrid:ship.userData.wingPaintTessellation,
    paintSurfaceY:ship.userData.wingPaintSurfaceY,
    oldPaintExtrusionsReplaced:ship.userData.oldWingPaintExtrusionsReplaced,
    inlaidFlapJoints:ship.userData.inlaidFlapSeams,
    oldFlapRodsReplaced:ship.userData.oldFlapCylindersReplaced,
    originalWingPaintAA:ship.userData.wingPaintOriginalMSAA,
    noAddedPaintPieces:ship.userData.wingPaintNoExtraPieces,
    redPaintChecks,flapChecks,mergedPaintTopY,
    wingRootBridges:ship.userData.unifiedWingRootBridges,
    wingRootBridgeStations:ship.userData.wingRootBridgeStations,
    wingRootBridgeColumns:ship.userData.wingRootBridgeColumns,
    wingRootReplacedSeams:ship.userData.wingRootFormerSeamsReplaced,
    wingRootPieceCountUnchanged:ship.userData.wingRootNoAdditionalPieces,
    wingRootOriginalMSAA:ship.userData.wingRootPreservesOriginalMSAA,
    bridgeChecks,
    rootRises:[rootRise(-1),rootRise(1)],
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
  assert.equal(geom.frontShoulderPieces,2);
  assert.equal(geom.frontShoulderSections,5);
  assert.equal(geom.frontShoulderProfiles,7);
  assert.deepEqual(geom.frontShoulderPaintGrids,[9,3]);
  assert.equal(geom.frontRedClearance,.012);
  assert.equal(geom.aftWingBridgePieces,2);
  assert.equal(geom.aftWingBridgeStations,5);
  assert.equal(geom.frontBoxesReplaced,4);
  assert.equal(geom.aftBoxesReplaced,2);
  assert(geom.noNewPieces&&geom.originalMSAARetained);
  assert.equal(geom.frontChecks.length,70);
  assert.equal(geom.shoulderPaintChecks.length,54);
  assert.equal(geom.aftChecks.length,50);
  for(const point of [...geom.frontChecks,
    ...geom.shoulderPaintChecks,...geom.aftChecks])
    assert(point.error<.0001,
      'actual rendered shoulder/paint/wing-bridge vertex missing: '+
       JSON.stringify(point));
  assert.equal(geom.actualShoulderClearance.length,6);
  for(const point of geom.actualShoulderClearance){
    assert(Number.isFinite(point.separation) &&
      point.separation>.004&&point.separation<.028,
      'front red paint must sit on actual curved skin, not float: '+
      JSON.stringify(point));
  }
  assert.equal(geom.conformalWingPaint,2);
  assert.deepEqual(geom.paintGrid,[17,3]);
  assert.equal(geom.paintSurfaceY,-.096);
  assert.equal(geom.oldPaintExtrusionsReplaced,2);
  assert.equal(geom.inlaidFlapJoints,2);
  assert.equal(geom.oldFlapRodsReplaced,2);
  assert(geom.originalWingPaintAA&&geom.noAddedPaintPieces);
  assert.equal(geom.redPaintChecks.length,102);
  assert.equal(geom.flapChecks.length,52);
  for(const item of [...geom.redPaintChecks,...geom.flapChecks])
    assert(item.error<.0001,
      'real 3D paint/inlay sample must exist in GPU mesh: '+
       JSON.stringify(item));
  for(const p of geom.mergedPaintTopY){
    assert(Number.isFinite(p.hullY) && p.paintY-p.hullY>=.008 &&
      p.paintY-p.hullY<=.025,
      'red paint must sit above the existing metal panel: '+JSON.stringify(p));
  }
  assert.equal(geom.wingRootBridges,2);
  assert.equal(geom.wingRootBridgeStations,5);
  assert.equal(geom.wingRootBridgeColumns,6);
  assert.equal(geom.wingRootReplacedSeams,2);
  assert(geom.wingRootPieceCountUnchanged&&geom.wingRootOriginalMSAA);
  assert.equal(geom.bridgeChecks.length,60);
  for(const point of geom.bridgeChecks){
   assert(point.closestVertexError<.0001,
    'wing-to-fuselage loft surface missing from actual GPU geometry: '+
      JSON.stringify(point));
  }
  assert(geom.rootRises.every(y=>y>.12),
   'new root must rise continuously from wing skin to real fuselage');
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
  const report={pass:true,tag:'NEXT11C20X',geom,images,active,protectedMap4,errors,
   caveat:'Real WebGL independent studio view of game model, not original player camera or native GPU FPS. A/B visual judgement requires user.'};
  fs.writeFileSync(path.join(out,'integrated-spines-qa.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C20X SHOULDER AND AFT ROOT REAL WEBGL PASS '+JSON.stringify({
   parts:geom.parts,shoulderPieces:geom.frontShoulderPieces,
   matchingShoulderVertices:geom.frontChecks.length,
   matchingShoulderRed:geom.shoulderPaintChecks.length,
   matchingAftWingBridge:geom.aftChecks.length,
   maxNewVertexError:Math.max(...[...geom.frontChecks,
    ...geom.shoulderPaintChecks,...geom.aftChecks].map(x=>x.error)),
   trueSurfacePaintClearances:geom.actualShoulderClearance.map(x=>x.separation),
   conformalPaintStrips:geom.conformalWingPaint,
   matchedPaintVertices:geom.redPaintChecks.length,
   maxPaintError:Math.max(...geom.redPaintChecks.map(x=>x.error)),
   inlaidFlapSeams:geom.inlaidFlapJoints,
   matchedFlapVertices:geom.flapChecks.length,
   maxFlapError:Math.max(...geom.flapChecks.map(x=>x.error)),
   wingPaintY:geom.paintSurfaceY,
   wingRootBridges:geom.wingRootBridges,
   replacedRootSeams:geom.wingRootReplacedSeams,
   matched3DRoofVertices:geom.bridgeChecks.length,
   maxRootVertexError:Math.max(...geom.bridgeChecks.map(x=>x.closestVertexError)),
   rootRises:geom.rootRises,
   spines:geom.contoured,roofStripes:geom.stripes,
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
