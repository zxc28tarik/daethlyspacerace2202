/* NEXT11C20 SB-07 ZENIT: USER-APPROVED reference -> actual Map1 3D ship.
 * Browser/WebGL proof, silhouettes and camera, protected Map4 gameplay.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',e=>errors.push(e.stack||e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
    {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Ship20ZenitBuild==='function'
      &&h4Ship19Race&&h4Ship19Combat
      &&typeof startGame==='function',null,{timeout:18000});
  const geometry=await page.evaluate(()=>{
    const race=h4Ship19Race,combat=h4Ship19Combat;
    const meshes=race.children;
    const box=new THREE.Box3().setFromObject(race)
      .getSize(new THREE.Vector3());
    const hull=meshes.find(m=>m.name==='NEXT11C20_SB07_HULL');
    const plasma=meshes.find(m=>m.name==='NEXT11C20_SB07_PLASMA');
    const samples=(mesh,fn)=>{
      const attr=mesh.geometry.getAttribute('position');
      let sum=0;
      for(let i=0;i<attr.count;i++)
        if(fn(attr.getX(i),attr.getY(i),attr.getZ(i)))sum++;
      return sum;
    };
    let old=0;
    scene.traverse(x=>{
      if(x.userData?.authoredShipId==='R-01')old++;
    });
    return {
      id:race.userData.authoredShipId,
      model:race.name,parts:race.userData.parts,
      tris:race.userData.triangles,
      batches:meshes.length,
      detailPass:race.userData.detailPass,
      unifiedNoseStripe:race.userData.unifiedNoseStripe,
      integratedWingRootPanels:race.userData.integratedWingRootPanels,
      integratedWingRootChannels:race.userData.integratedWingRootChannels,
      continuousCanopyRails:race.userData.continuousCanopyRails,
      integratedWingRearRails:race.userData.integratedWingRearRails,
      integratedNacelleGrooves:race.userData.integratedNacelleGrooves,
      integratedAnnularBands:race.userData.integratedAnnularBands,
      connectedCoolantConduits:race.userData.connectedCoolantConduits,
      consolidationPass:race.userData.consolidationPass,
      minMachiningLineDiameter:race.userData.minMachiningLineDiameter,
      boundedHaloOpacity:race.userData.boundedHaloOpacity,
      boundedHaloSize:race.userData.boundedHaloSize,
      reviewStudioCapture:race.userData.reviewStudioCapture,
      lineRadialSegments:race.userData.lineRadialSegments,
      roundLineCount:race.userData.roundLineCount,
      engineBarrelSegments:race.userData.engineBarrelSegments,
      engineRimRadialSegments:race.userData.engineRimRadialSegments,
      engineRimTubularSegments:race.userData.engineRimTubularSegments,
      wingBevelSegments:race.userData.wingBevelSegments,
      finBevelSegments:race.userData.finBevelSegments,
      deckBevelSegments:race.userData.deckBevelSegments,
      canopyCrossSections:race.userData.canopyCrossSections,
      haloMipmapped:race.userData.haloMipmapped,
      engineHaloCount:race.userData.engineHaloCount,
      engineHaloTextureSize:race.userData.engineHaloTextureSize,
      nozzleRecesses:race.userData.nozzleRecesses,
      sealedWingRootLines:race.userData.sealedWingRootLines,
      haloSprites:plasma.children.filter(m=>m.isSprite).map(s=>({
        name:s.name,
        x:s.position.x,z:s.position.z,
        additive:s.material.blending===THREE.AdditiveBlending,
        depthWrite:s.material.depthWrite,
        textureWidth:s.material.map?.image?.width||0,
        minFilter:s.material.map?.minFilter,
        mipmapped:!!s.material.map?.generateMipmaps,
        anisotropy:s.material.map?.anisotropy||0,
        noCollider:s.userData.noCollider
      })),
      haloTextureShared:plasma.children.filter(m=>m.isSprite)[0]?.material.map===
        plasma.children.filter(m=>m.isSprite)[1]?.material.map,
      flushWingTopcoats:race.userData.flushWingTopcoats,
      recessedWingLouverPairs:race.userData.recessedWingLouverPairs,
      engineThroatRings:race.userData.engineThroatRings,
      thermalShieldSegments:race.userData.thermalShieldSegments,
      controlSurfacePanels:race.userData.controlSurfacePanels,
      engineStatorVanes:race.userData.engineStatorVanes,
      bellySpars:race.userData.bellySpars,
      nacelleLouverPairs:race.userData.nacelleLouverPairs,
      coolantManifolds:race.userData.coolantManifolds,
      aeroIntakes:race.userData.aeroIntakes,
      finStructuralPass:race.userData.finStructuralPass,
      cockpitClearcoat:race.userData.cockpitClearcoat,
      facetedCanopy:race.userData.facetedCanopy,
      wingDeckPanels:race.userData.wingDeckPanels,
      nozzleCrowns:race.userData.nozzleCrowns,
      nozzlePetals:race.userData.nozzlePetals,
      sharedMicrofinish:race.userData.sharedMicrofinish,
      batchNames:meshes.map(m=>m.name),
      colors:meshes.map(m=>({
        name:m.material.name,
        hex:m.material.color?.getHex(),
        emissiveIntensity:m.material.emissiveIntensity||0,
        materialType:m.material.type,
        clearcoat:m.material.clearcoat||0,
        roughnessMap:!!m.material.roughnessMap,
        bumpMap:!!m.material.bumpMap,
        visualOnly:m.userData.visualOnly,
        noCollider:m.userData.noCollider,
        vertices:m.geometry.getAttribute('position').count,
        normals:m.geometry.getAttribute('normal').count,
        uv:m.geometry.getAttribute('uv').count
      })),
      dimensions:box.toArray(), // Vector3 size [x,y,z]
      finLeft:samples(hull,(x,y)=>x<-6.9&&y>1.9),
      finRight:samples(hull,(x,y)=>x>6.9&&y>1.9),
      needle:samples(hull,(x,y,z)=>Math.abs(x)<.6&&z<-7.5),
      glassVertices:meshes.find(m=>m.name==='NEXT11C20_SB07_GLASS')
        .geometry.getAttribute('position').count,
      plasmaRearLip:samples(plasma,(x,y,z)=>z>6.37),
      insetRearPlasmaLeft:samples(plasma,
        (x,y,z)=>x<-1&&z>6.53),
      insetRearPlasmaRight:samples(plasma,
        (x,y,z)=>x>1&&z>6.53),
      statorLeft:samples(meshes.find(m=>
        m.name==='NEXT11C20_SB07_SECOND'),
        (x,y,z)=>x<-1.0&&z>6.48),
      statorRight:samples(meshes.find(m=>
        m.name==='NEXT11C20_SB07_SECOND'),
        (x,y,z)=>x>1.0&&z>6.48),
      engineLeft:samples(plasma,(x,y,z)=>x<-1&&z>5.7),
      engineRight:samples(plasma,(x,y,z)=>x>1&&z>5.7),
      oldR01Instances:old,
      raceOnly:race.userData.raceOnly,
      weaponMounts:race.userData.weaponMounts,
      replacementFor:race.userData.replacementFor,
      stats:{...h4Ship19Stats},
      parentCorrect:race.parent===geoSwordMesh,
      map4Id:combat.userData.authoredShipId,
      map4Parts:combat.userData.parts,
      map4Batches:combat.children.length
    };
  });
  assert.equal(geometry.id,'SB-07');
  assert(geometry.model.includes('ZENIT'));
  assert.equal(geometry.parentCorrect,true);
  assert.equal(geometry.oldR01Instances,0,'legacy R-01 must not be built');
  assert.equal(geometry.raceOnly,true);
  assert.equal(geometry.weaponMounts,0);
  assert.equal(geometry.replacementFor,'R-01 VEKTÖR');
  assert.equal(geometry.batches,7);
  assert.equal(geometry.detailPass,'NEXT11C20I');
  assert.equal(geometry.unifiedNoseStripe,true);
  assert.equal(geometry.integratedWingRootPanels,4);
  assert.equal(geometry.integratedWingRootChannels,2);
  assert.equal(geometry.continuousCanopyRails,2);
  assert.equal(geometry.integratedWingRearRails,4);
  assert.equal(geometry.integratedNacelleGrooves,2);
  assert.equal(geometry.integratedAnnularBands,8);
  assert.equal(geometry.connectedCoolantConduits,2);
  assert.equal(geometry.consolidationPass,true);
  assert.equal(geometry.minMachiningLineDiameter,.056);
  assert.deepEqual(geometry.boundedHaloOpacity,[.14,.38]);
  assert.deepEqual(geometry.boundedHaloSize,[1.68,2.06]);
  assert.equal(geometry.reviewStudioCapture,true);
  assert.equal(geometry.lineRadialSegments,16);
  assert(geometry.roundLineCount>65,
    'rounded line geometry must be actually emitted >40 times');
  assert.equal(geometry.engineBarrelSegments,32);
  assert.equal(geometry.engineRimRadialSegments,40);
  assert.equal(geometry.engineRimTubularSegments,10);
  assert.equal(geometry.wingBevelSegments,4);
  assert.equal(geometry.finBevelSegments,4);
  assert.equal(geometry.deckBevelSegments,2);
  assert.equal(geometry.canopyCrossSections,11);
  assert.equal(geometry.haloMipmapped,true);
  assert.equal(geometry.engineHaloCount,2);
  assert.equal(geometry.engineHaloTextureSize,128);
  assert.equal(geometry.nozzleRecesses,0);
  assert.equal(geometry.sealedWingRootLines,2);
  assert.equal(geometry.haloSprites.length,2,
    'two live soft blue engine halos must exist');
  assert(geometry.haloSprites.every(s=>
    s.additive&&s.depthWrite===false&&
    s.textureWidth===128&&s.noCollider&&
    s.minFilter===THREE.LinearMipmapLinearFilter&&
    s.mipmapped&&s.anisotropy>=4),
    'engine glows need safe additive blending + shared procedural atlas');
  assert(geometry.haloTextureShared,
    'both engine sprites must reuse a single in-browser texture');
  assert.deepEqual(geometry.haloSprites.map(s=>s.x),[-1.8,1.8]);
  assert.equal(geometry.flushWingTopcoats,true);
  assert.equal(geometry.recessedWingLouverPairs,2);
  assert.equal(geometry.engineThroatRings,6);
  assert.equal(geometry.thermalShieldSegments,0);
  assert(geometry.insetRearPlasmaLeft>24&&
    geometry.insetRearPlasmaRight>24,
    'new inner plasma throat must exist in both engines');
  assert.equal(geometry.controlSurfacePanels,2);
  assert.equal(geometry.engineStatorVanes,20);
  assert.equal(geometry.bellySpars,4);
  assert.equal(geometry.nacelleLouverPairs,2);
  assert.equal(geometry.coolantManifolds,2);
  assert(geometry.statorLeft>=36&&geometry.statorRight>=36,
    'Both engines must have new rear nozzle stator geometry');
  assert.equal(geometry.aeroIntakes,2);
  assert.equal(geometry.finStructuralPass,true);
  assert.equal(geometry.cockpitClearcoat,.75);
  const glassMat=geometry.colors.find(
    x=>x.name==='SB07_SMOKED_BLUE_COCKPIT');
  assert.equal(glassMat.materialType,'MeshPhysicalMaterial');
  assert.equal(glassMat.clearcoat,.75);
  assert.equal(geometry.facetedCanopy,true);
  assert.equal(geometry.wingDeckPanels,14);
  assert.equal(geometry.nozzleCrowns,2);
  assert.equal(geometry.nozzlePetals,0);
  assert.equal(geometry.sharedMicrofinish,true);
  assert(geometry.glassVertices>=350,
    '11-cross-section true continuous canopy must retain designed form');
  assert(geometry.plasmaRearLip>24,'new rear engine corona must be present');
  assert.equal(geometry.stats.batches,13);
  assert.equal(geometry.stats.players,2);
  assert.equal(geometry.stats.externalModels,0);
  assert.equal(geometry.stats.newColliders,0);
  assert.equal(geometry.stats.newWeapons,0);
  assert.equal(geometry.stats.newAircraftClasses,0);
  // The identical model build counter was measured via deterministic
  // source-level geometry builder: C20H=354, new unified C20I=191.
  // Assert absolute limit and 40%+ reduction; no mock 3D screenshot.
  assert.equal(geometry.parts,191,
    'real emitted SB-07 objects must drop from 354 to 191');
  assert((354-geometry.parts)/354>.45,
    'must reduce disconnected primitives by more than 45 percent');
  assert(geometry.tris>4000&&geometry.tris<65000);
  assert(geometry.dimensions[0]>14&&geometry.dimensions[0]<19);
  assert(geometry.dimensions[1]>2.7&&geometry.dimensions[1]<6);
  assert(geometry.dimensions[2]>14&&geometry.dimensions[2]<20);
  assert(geometry.finLeft>14&&geometry.finRight>14,
    'must have two separately rising vertical WINGTIP stabilizers');
  assert(geometry.needle>6,'long tapered wedge nose must be real geometry');
  assert(geometry.engineLeft>24&&geometry.engineRight>24,
    'both large detailed rear exhausts must exist');
  assert.equal(geometry.map4Id,'B-04');
  assert.equal(geometry.map4Parts,249,'Map4 B-04 geometry must remain unchanged');
  assert.equal(geometry.map4Batches,6);
  assert(geometry.colors.every(x=>x.visualOnly&&x.noCollider&&
    x.vertices===x.normals&&x.vertices===x.uv));
  assert(geometry.colors.some(x=>x.name==='SB07_SILVER_CERAMIC'&&
    x.hex===0xdbe4ea));
  assert(geometry.colors.some(x=>x.name==='SB07_RACING_RED'&&
    x.hex===0xc43838));
  assert(geometry.colors.some(x=>x.name==='SB07_ENGINE_AMBER'&&
    x.hex===0xfaa15d));
  assert(geometry.colors.some(x=>x.name==='SB07_BLUE_PLASMA'&&
    x.hex===0x6dd9ff));
  for(const material of ['SB07_SILVER_CERAMIC',
    'SB07_GUNMETAL_SUBFRAME','SB07_RACING_RED']){
    assert(geometry.colors.some(x=>x.name===material&&x.roughnessMap),
      material+' must use shared weathered roughness microtexture');
  }
  assert(geometry.colors.find(x=>x.name==='SB07_SILVER_CERAMIC')
    .bumpMap,'silver must retain fine normal surface variation');
  assert.equal(geometry.colors.find(
    x=>x.name==='SB07_SILVER_CERAMIC').emissiveIntensity,.20,
    'ceramic surface shading must not be flattened by excessive glow');
  assert(!geometry.colors.some(x=>x.name==='SB07_BLUE_PLASMA'&&x.roughnessMap),
    'plasma must remain fullbright rather than PBR');
  // Actual game launch and real player physics, not isolated art.
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.03,
    null,{timeout:25000});
  await page.evaluate(()=>{
    state.paused=true;
    const raf=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    state.paused=false;
  });
  const fly=async active=>page.evaluate(boost=>{
    Object.keys(keys).forEach(k=>keys[k]=false);
    state.energy=100;
    state.mouseX=W/2;state.mouseY=H/2;
    keys.ShiftLeft=boost;
    for(let i=0;i<35;i++)updateGame(1/30);
    keys.ShiftLeft=false;
    camera.updateProjectionMatrix();
    renderer.render(scene,camera);
  },active);
  const read=async filename=>{
    const stateData=await page.evaluate(()=>{
      renderer.render(scene,camera);
      const root=h4Ship19Race;
      const center=root.getWorldPosition(new THREE.Vector3()).project(camera);
      return {
        map:state.activeMap,mode:state.cameraMode,
        ship:root.userData.authoredShipId,
        visible:root.visible&&geoSwordMesh.visible,
        onScreen:center.z<1&&center.z>-1&&
          Math.abs(center.x)<1&&Math.abs(center.y)<1,
        cameraDistance:+camera.position.distanceTo(state.pos).toFixed(4),
        fov:+camera.fov.toFixed(3),
        combatEnabled:state.combatEnabled,
        progress:state.routeProgress,
        renderCalls:renderer.info.render.calls,
        thrustGlow:+root.userData.thrustGlow.toFixed(4),
        haloOpacities:root.children.find(
          m=>m.material.name==='SB07_BLUE_PLASMA').children
          .filter(m=>m.isSprite).map(m=>+m.material.opacity.toFixed(4)),
        haloSizes:root.children.find(
          m=>m.material.name==='SB07_BLUE_PLASMA').children
          .filter(m=>m.isSprite).map(m=>+m.scale.x.toFixed(4)),
        plasmaColor:root.children.find(
          m=>m.material.name==='SB07_BLUE_PLASMA')
          .material.color.getHex(),
        amberColor:root.children.find(
          m=>m.material.name==='SB07_ENGINE_AMBER')
          .material.color.getHex(),
        cockpitGlow:root.children.find(
          m=>m.material.name==='SB07_SMOKED_BLUE_COCKPIT')
          .material.emissiveIntensity
      };
    });
    await page.screenshot({path:path.join(__dirname,
      'map1-next11c20-'+filename+'.png')});
    return stateData;
  };
  // Identical cockpit/rear-engine camera composition for genuinely
  // comparable normal/boost materials. Not a substitute for chase frames.
  const fixedEngineFrame=async tag=>{
    const evidence=await page.evaluate(()=>{
      const ship=h4Ship19Race;
      const pos=ship.getWorldPosition(new THREE.Vector3());
      const frame=playerRig.quaternion.clone();
      camera.position.copy(pos).add(
        new THREE.Vector3(9,8,16).applyQuaternion(frame));
      camera.lookAt(pos);
      camera.fov=55;camera.updateProjectionMatrix();
      renderer.render(scene,camera);
      const projected=pos.clone().project(camera);
      return {
        ship:ship.userData.authoredShipId,
        glow:+ship.userData.thrustGlow.toFixed(3),
        centerVisible:Math.abs(projected.x)<1&&
          Math.abs(projected.y)<1&&projected.z>-1&&projected.z<1
      };
    });
    assert(evidence.centerVisible,tag+' fixed view must show SB-07');
    await page.screenshot({path:path.join(__dirname,
      'map1-next11c20-zenit-fixed-engine-'+tag+'.png')});
    return evidence;
  };
  await fly(false);
  const normal=await read('zenit-chase-normal');
  const fixedNormal=await fixedEngineFrame('normal');
  await fly(true);
  const boost=await read('zenit-chase-boost');
  const fixedBoost=await fixedEngineFrame('boost');
  assert(normal.visible&&boost.visible);
  assert(normal.onScreen&&boost.onScreen);
  assert(normal.mode==='CHASE'&&boost.mode==='CHASE');
  assert.equal(normal.combatEnabled,false);
  assert.equal(boost.combatEnabled,false);
  assert(boost.cameraDistance<normal.cameraDistance-1.0,
    'boost should close chase camera like user-selected #1->#2');
  assert(boost.fov>normal.fov,'boost should increase speed FOV');
  assert(boost.thrustGlow>normal.thrustGlow+.20,
    'real boost must brighten actual twin motor plasma');
  assert.notEqual(boost.plasmaColor,normal.plasmaColor,
    'engine blue must respond to player speed rather than static rendering');
  assert.notEqual(boost.amberColor,normal.amberColor,
    'heat shield orange must respond to racing throttle');
  assert(boost.cockpitGlow>normal.cockpitGlow,
    'cockpit highlight must respond subtly to speed');
  assert(normal.haloOpacities.length===2&&boost.haloOpacities.length===2);
  assert(boost.haloOpacities.every((v,i)=>
    v>normal.haloOpacities[i]+.05),
    'both actual engine halo intensities must respond to boost');
  assert(boost.haloSizes.every((v,i)=>
    v>normal.haloSizes[i]+.07),
    'both actual engine halo diameters must grow under boost');
  assert(normal.haloOpacities.every(v=>v>=.13&&v<=.38));
  assert(boost.haloOpacities.every(v=>v>=.14&&v<=.381),
    'both boosts must be bright but not clip an oversized halo');
  assert(boost.haloSizes.every(v=>v<=2.061));
  // Evidence image from oblique above; this is NOT the playable camera.
  const oblique=await page.evaluate(()=>{
    const ship=h4Ship19Race;
    const pos=ship.getWorldPosition(new THREE.Vector3());
    const quaternion=playerRig.quaternion.clone();
    camera.position.copy(pos).add(new THREE.Vector3(
      11,10,17).applyQuaternion(quaternion));
    camera.lookAt(pos);
    camera.fov=55;camera.updateProjectionMatrix();
    renderer.render(scene,camera);
    const center=pos.clone().project(camera);
    return {onScreen:Math.abs(center.x)<1&&
      Math.abs(center.y)<1&&center.z>-1&&center.z<1,
      renderCalls:renderer.info.render.calls};
  });
  assert(oblique.onScreen);
  await page.screenshot({path:path.join(__dirname,
    'map1-next11c20-zenit-3d-oblique.png')});
  // NEXT11C20H visual acceptance PROOF, not a fake illustrated model:
  // render the exact seven-batch live SB-07 Three.js geometry into a
  // deterministic neutral studio. Screenshots have no HUD or race debris.
  // Normal and boost get the SAME camera, lighting and pixel coordinates.
  const captureStudio=async(angle,tag)=>{
    const frame=await page.evaluate(angle=>{
      if(!window.__SB07_STUDIO_H){
        const studio=new THREE.Scene();
        studio.background=new THREE.Color(0x0b1423);
        const ship=h4Ship19Race.clone(true);
        ship.position.set(0,0,0);
        ship.quaternion.identity();
        studio.add(ship);
        studio.add(new THREE.AmbientLight(0xffffff,.70));
        const key=new THREE.DirectionalLight(0xf2f6ff,2.1);
        key.position.set(-8,13,-11);studio.add(key);
        const fill=new THREE.DirectionalLight(0x74caff,1.3);
        fill.position.set(9,5,14);studio.add(fill);
        const red=new THREE.DirectionalLight(0xffa088,.65);
        red.position.set(-5,-4,5);studio.add(red);
        const view=new THREE.PerspectiveCamera(47,1600/900,.1,120);
        window.__SB07_STUDIO_H={scene:studio,ship,camera:view};
      }
      const studio=window.__SB07_STUDIO_H;
      const view=studio.camera;
      if(angle==='front')view.position.set(11,9,-20);
      else view.position.set(11,8,21);
      view.lookAt(0,0,-.6);
      view.updateProjectionMatrix();
      renderer.render(studio.scene,view);
      const gl=renderer.getContext();
      const width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
      const sample=(x,y,z)=>{
        const projected=new THREE.Vector3(x,y,z).project(view);
        const N=40;
        const left=Math.max(0,Math.min(width-N,
          Math.round((projected.x*.5+.5)*width)-N/2));
        const bottom=Math.max(0,Math.min(height-N,
          Math.round((projected.y*.5+.5)*height)-N/2));
        const data=new Uint8Array(N*N*4);
        gl.readPixels(left,bottom,N,N,gl.RGBA,gl.UNSIGNED_BYTE,data);
        let brightness=0,clipped=0,cyan=0;
        for(let i=0;i<N*N;i++){
          const at=i*4;
          const r=data[at],g=data[at+1],b=data[at+2];
          brightness+=(r+g+b)/3;
          if(r>247&&g>247&&b>247)clipped++;
          if(b>g*1.05&&g>r*1.20&&b>65)cyan++;
        }
        return {
          uv:[+projected.x.toFixed(3),+projected.y.toFixed(3)],
          meanBrightness:+(brightness/(N*N)).toFixed(2),
          whiteClipRatio:+(clipped/(N*N)).toFixed(4),
          blueTintRatio:+(cyan/(N*N)).toFixed(4)
        };
      };
      // WebGL preserveDrawingBuffer is normally false. Capture pixels
      // synchronously after render so studio evidence never becomes
      // a blank/black screenshot during the next compositor tick.
      const rgba=new Uint8Array(width*height*4);
      gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,rgba);
      const flipped=new Uint8ClampedArray(rgba.length);
      for(let row=0;row<height;row++){
        const stride=width*4;
        flipped.set(rgba.subarray(row*stride,(row+1)*stride),
          (height-1-row)*stride);
      }
      const output=document.createElement('canvas');
      output.width=width;output.height=height;
      const ctx=output.getContext('2d');
      ctx.putImageData(new ImageData(flipped,width,height),0,0);
      const png=output.toDataURL('image/png').split(',')[1];
      return {png,metrics:{
        angle,ship:studio.ship.userData.authoredShipId,
        renderCalls:renderer.info.render.calls,
        pixelSize:[width,height],
        antialias:!!gl.getContextAttributes()?.antialias,
        thrust:+h4Ship19Race.userData.thrustGlow.toFixed(4),
        engines:angle==='rear'?[
          sample(-1.8,-.25,6.65),
          sample(1.8,-.25,6.65)
        ]:[],
        normalViewAligned:studio.ship.children.length===7
      }};
    },angle);
    const metrics=frame.metrics;
    fs.writeFileSync(path.join(__dirname,
      'map1-next11c20-zenit-studio-h-'+tag+'.png'),
      Buffer.from(frame.png,'base64'));
    assert.equal(metrics.ship,'SB-07');
    assert.equal(metrics.normalViewAligned,true,
      'studio screenshots must use real seven-batch ship, not a mock');
    assert(metrics.renderCalls>=7&&metrics.renderCalls<=12,
      'ship studio review should stay within 7 meshes + 2 halos');
    assert(metrics.pixelSize[0]>=1200&&metrics.pixelSize[1]>=700,
      'art evidence must have enough pixel density for a fair edge review');
    assert(metrics.engines.every(e=>
      Number.isFinite(e.meanBrightness)&&
      e.whiteClipRatio>=0&&e.whiteClipRatio<=1));
    return metrics;
  };
  await fly(false);
  const studioNormal=await captureStudio('rear','rear-normal');
  const studioFront=await captureStudio('front','front');
  await fly(true);
  const studioBoost=await captureStudio('rear','rear-boost');
  assert(studioBoost.thrust>studioNormal.thrust+.15,
    'review images must show an actual game-state boost difference');
  assert.deepEqual(studioNormal.pixelSize,studioBoost.pixelSize,
    'A/B image dimensions must be identical');
  // Pixel stats are diagnostic, not an invented human aesthetic PASS.
  // Preserve original game camera and proceed to protected Map4 checks.
  await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('gameover-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
    selectMap(MAP_MODES.MAP4);
    startGame();
    renderer.render(scene,camera);
  });
  const after=await page.evaluate(()=>({
    map4:state.activeMap===MAP_MODES.MAP4,
    raceVisible:h4Ship19Race.visible,
    combatVisible:h4Ship19Combat.visible,
    combatId:h4Ship19Combat.userData.authoredShipId,
    combatParts:h4Ship19Combat.userData.parts,
    powerMode:state.h4Power.mode,
    rivals:racers.length,hunters:hunterTargets.length,
    navMarkers:h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
      m.userData.w05Kind==='BEACON'||m.userData.w05Kind==='HIGH_MARKER')).length,
    protectedPhysical:h4Gfx11c3PhysicalMaterials.length,
    physics:[
      h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length
    ],
    rules:[MAP4_PHASES.arenaSeconds,
      MAP4_RACE_RULES.realTimeLimit,MAP4_PHASES.orbitAltitude,
      H4_CANYON.fastMultiplier,H4_INDUSTRY.fastBonus]
  }));
  assert.deepEqual(after,{
    map4:true,raceVisible:false,combatVisible:true,
    combatId:'B-04',combatParts:249,powerMode:'BALANCED',
    rivals:5,hunters:8,navMarkers:24,protectedPhysical:34,
    physics:[6,36,200],rules:[60,300,850,1.18,1.12]
  });
  assert.deepEqual(errors,[],errors.join('\n'));
  const report={
    status:'PASS',id:'NEXT11C20I',
    reference:'user-approved SB-07 Zenit image, gameplay art only',
    geometry,normal,boost,fixedNormal,fixedBoost,oblique,
    studioNormal,studioFront,studioBoost,map4Preserved:after,
    actualNativeGPU:false,actualHumanRace:false,
    aestheticApprovedByUserForModel:false
  };
  fs.writeFileSync(path.join(__dirname,
    'map1-next11c20-zenit-qa.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C20 SB07 ZENIT WEBGL PASS',JSON.stringify({
    id:geometry.id,detail:geometry.detailPass,
    independentBuilderPieces:[354,geometry.parts],
    pieceCountReductionPct:+((354-geometry.parts)*100/354).toFixed(2),
    integratedCanopy:geometry.continuousCanopyRails,
    integratedEngineBands:geometry.integratedAnnularBands,
    studioMetrics:[studioNormal,studioBoost],
    haloSprites:geometry.haloSprites.length,
    edgeQuality:[geometry.lineRadialSegments,
      geometry.engineBarrelSegments,geometry.engineRimRadialSegments],
    canopyColumns:geometry.canopyCrossSections,
    roundedSeams:geometry.roundLineCount,
    haloOpacity:[normal.haloOpacities,boost.haloOpacities],
    insets:[geometry.insetRearPlasmaLeft,
      geometry.insetRearPlasmaRight],
    statorSamples:[geometry.statorLeft,geometry.statorRight],
    boostLighting:[normal.thrustGlow,boost.thrustGlow],
    wingDeck:geometry.wingDeckPanels,glass:geometry.glassVertices,
    plasmaRearLip:geometry.plasmaRearLip,
    parts:geometry.parts,tris:geometry.tris,
    silhouette:geometry.dimensions,
    fins:[geometry.finLeft,geometry.finRight],
    engines:[geometry.engineLeft,geometry.engineRight],
    oldR01:geometry.oldR01Instances,
    camera:[normal.cameraDistance,boost.cameraDistance],
    map4B04Unchanged:after.combatParts,
    physics:after.physics
  }));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
