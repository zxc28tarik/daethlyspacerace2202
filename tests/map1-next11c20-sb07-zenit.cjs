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
  assert.equal(geometry.detailPass,'NEXT11C20D');
  assert.equal(geometry.controlSurfacePanels,4);
  assert.equal(geometry.engineStatorVanes,20);
  assert.equal(geometry.bellySpars,4);
  assert.equal(geometry.nacelleLouverPairs,10);
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
  assert.equal(geometry.wingDeckPanels,8);
  assert.equal(geometry.nozzleCrowns,2);
  assert.equal(geometry.nozzlePetals,16);
  assert.equal(geometry.sharedMicrofinish,true);
  assert(geometry.glassVertices>=200,'must have faceted canopy, not flat glass');
  assert(geometry.plasmaRearLip>24,'new rear engine corona must be present');
  assert.equal(geometry.stats.batches,13);
  assert.equal(geometry.stats.players,2);
  assert.equal(geometry.stats.externalModels,0);
  assert.equal(geometry.stats.newColliders,0);
  assert.equal(geometry.stats.newWeapons,0);
  assert.equal(geometry.stats.newAircraftClasses,0);
  assert(geometry.parts>190&&geometry.parts<500);
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
    status:'PASS',id:'NEXT11C20C',
    reference:'user-approved SB-07 Zenit image, gameplay art only',
    geometry,normal,boost,fixedNormal,fixedBoost,oblique,map4Preserved:after,
    actualNativeGPU:false,actualHumanRace:false,
    aestheticApprovedByUserForModel:false
  };
  fs.writeFileSync(path.join(__dirname,
    'map1-next11c20-zenit-qa.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C20 SB07 ZENIT WEBGL PASS',JSON.stringify({
    id:geometry.id,detail:geometry.detailPass,
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
