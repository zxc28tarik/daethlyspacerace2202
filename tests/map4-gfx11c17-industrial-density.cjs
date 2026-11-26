/* NEXT11C17 real Three.js/Chromium evidence; preserve hazards and navigation.
 * High-density authored industrial sculptures are visual-only, not easy lanes.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
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
  await page.waitForFunction(()=>typeof h4Gfx11c17BuildDensity==='function'&&
    typeof h4Gfx11c17SetLook==='function',null,{timeout:20000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,
    null,{timeout:20000});
  await page.evaluate(()=>{
    state.paused=true;
    const raf=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
  });
  const original=await page.evaluate(()=>{
    const root=h4Gfx11c17Root;
    const all=[...root.children.filter(m=>m.isInstancedMesh),
      ...h4Gfx11c17Fine.children];
    const owners=new Map();
    planetaryWorldGroup.traverse(m=>{
      if(m.isMesh&&m.userData.h4Collider)owners.set(m.userData.h4Collider,m);
    });
    const marker=h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
      m.userData.w05Kind==='BEACON'||m.userData.w05Kind==='HIGH_MARKER'));
    const landmark=h4WorldLandmarks.map(x=>x.group);
    return {
      stats:{...h4Gfx11c17Stats},
      root:root.name,
      rootFlags:[root.userData.visualOnly,root.userData.noCollider],
      fineFlags:[h4Gfx11c17Fine.userData.visualOnly,
        h4Gfx11c17Fine.userData.noCollider],
      units:{
        major:H4_GFX11C17_MAJOR.map(s=>({...s})),
        service:H4_GFX11C17_SERVICE.map(s=>({...s}))
      },
      batches:all.map(m=>({
        name:m.name,count:m.count,instanced:!!m.isInstancedMesh,
        visual:!!m.userData.visualOnly,noCollider:!!m.userData.noCollider,
        group:m.userData.h4Gfx11c17Service?'service':'major',
        verts:m.geometry.getAttribute('position').count,
        normal:m.geometry.getAttribute('normal').count,
        uv:m.geometry.getAttribute('uv').count,
        color:m.geometry.getAttribute('color').count,
        triangles:m.geometry.getAttribute('position').count/3,
        map:m.material.map?.name,
        material:m.material.name,vertexColors:m.material.vertexColors
      })),
      protected:{
        ownerCount:owners.size,
        colliderCount:planetaryBuildingColliders.length+h4IndustrialColliders.length,
        colliderHashes:planetaryBuildingColliders.concat(h4IndustrialColliders).map(c=>[
          c.progress,c.side,c.altitude,c.halfSide,c.halfUp,c.halfDepth]),
        markerIds:marker.map(m=>m.id),
        markerMaterials:marker.map(m=>m.material.uuid),
        markerMatrices:marker.map(m=>m.matrix.toArray()),
        physical: h4Gfx11c3PhysicalMaterials.map(x=>[
          x.mesh.id,x.mesh.geometry.uuid,x.collider.progress,
          x.collider.side,x.collider.altitude]),
        physics:[
          h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length
        ],
        rules:[
          MAP4_PHASES.arenaSeconds,
          MAP4_RACE_RULES.realTimeLimit,
          MAP4_PHASES.orbitAltitude,
          racers.length,hunterTargets.length,
          H4_INDUSTRY.fastBonus,H4_CANYON.fastMultiplier
        ]
      },
      landmarkCount:landmark.length
    };
  });
  assert.equal(original.root,'MAP4_GFX11C17_96_AUTHORED_INDUSTRIAL_UNITS');
  assert.deepEqual(original.rootFlags,[true,true]);
  assert.deepEqual(original.fineFlags,[true,true]);
  assert.equal(original.stats.uniqueFamilies,7);
  assert.equal(original.stats.majorObjects,24);
  assert.equal(original.stats.serviceObjects,72);
  assert.equal(original.stats.batches,7);
  assert.equal(original.units.major.length,24);
  assert.equal(original.units.service.length,72);
  assert.equal(original.protected.ownerCount,236);
  assert.deepEqual(original.protected.physics,[6,36,200]);
  assert.equal(original.protected.markerIds.length,24);
  assert.equal(original.protected.physical.length,34);
  assert.deepEqual(original.protected.rules,[60,300,850,5,8,1.12,1.18]);
  for(const k of ['newColliders','newLights','newTextures',
    'newExternalModels','markerMutation','physicalMutation'])
    assert.equal(original.stats[k],0,k);
  for(const o of original.units.major.concat(original.units.service)){
    assert(o.at>=14300&&o.at<34000,'outside industrial phase');
    // Whole authored unit including skew and instanced width: route
    // hunter flank must not look like a newly blocked visual corridor.
    const near=Math.abs(o.side)-o.size*.62;
    assert(near>1500,'false visual wall in flight lane: '+JSON.stringify(o));
  }
  assert.equal(original.batches.length,7);
  assert(original.batches.every(b=>b.instanced&&b.visual&&b.noCollider));
  assert(original.batches.every(b=>b.verts===b.normal&&
    b.verts===b.uv&&b.verts===b.color));
  assert(original.batches.every(b=>b.vertexColors&&
    b.map==='MAP4_GFX11C5_AUTHORED_STEEL_DIRT_RIVETS'));
  assert(original.batches.every(b=>b.triangles>70));
  const triangles=original.batches.reduce((s,b)=>s+b.triangles*b.count,0);
  assert.equal(original.stats.authoredTriangles,triangles);
  assert(triangles>12000&&triangles<230000,'budget exceeded: '+triangles);
  const cameraAt=spec=>page.evaluate(p=>{
    state.paused=true;state.routeProgress=p.progress;
    state.laneX=p.laneX||0;state.laneY=p.laneY;
    state.map4Phase=p.phase;
    const frame=getRaceFrameAtDistance(p.progress);
    state.pos.copy(frame.center)
      .addScaledVector(frame.right,p.laneX||0)
      .addScaledVector(frame.up,p.laneY);
    const q=new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().makeBasis(
        frame.right,frame.up,frame.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
    camera.position.copy(state.pos).add(
      new THREE.Vector3(0,5,17).applyQuaternion(q));
    camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
    h4Gfx10SetProfile('HIGH');
    updatePlanetaryWorld();h4UpdateSkyVisuals();
    h4UpdateCinematicAtmosphere(8);
    renderer.render(scene,camera);
  },spec);
  const read=()=>page.evaluate(()=>{
    renderer.render(scene,camera);
    const markers=h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
      m.userData.w05Kind==='BEACON'||m.userData.w05Kind==='HIGH_MARKER'));
    const structure=h4Gfx11c3PhysicalMaterials;
    return {
      active:h4Gfx11c17Root.visible,
      fine:h4Gfx11c17Fine.visible,
      profile:h4Gfx10ProfileName,
      calls:renderer.info.render.calls,
      triangles:renderer.info.render.triangles,
      textures:renderer.info.memory.textures,
      geometries:renderer.info.memory.geometries,
      state: {
        colliderHashes:planetaryBuildingColliders.concat(h4IndustrialColliders)
          .map(c=>[c.progress,c.side,c.altitude,c.halfSide,c.halfUp,c.halfDepth]),
        markers:markers.map(m=>[m.id,m.material.uuid,m.matrix.toArray()]),
        physical:structure.map(x=>[
          x.mesh.id,x.mesh.geometry.uuid,x.collider.progress,
          x.collider.side,x.collider.altitude])
      }
    };
  });
  const evidence=[];
  for(const scene of [
    {id:'07-approach',progress:16700,laneY:230,phase:3},
    {id:'07-machinery',progress:18100,laneY:320,phase:3},
    {id:'08-plant',progress:23800,laneY:350,phase:3},
    {id:'09-exit',progress:29500,laneY:410,phase:3}
  ]){
    await cameraAt(scene);
    await page.evaluate(()=>h4Gfx11c17SetLook(true));
    await read(); // warm cache
    await page.evaluate(()=>h4Gfx11c17SetLook(false));
    const before=await read();
    const beforeImg=await page.screenshot({
      path:path.join(__dirname,'map4-gfx11c17-'+scene.id+'-before.png')});
    await page.evaluate(()=>h4Gfx11c17SetLook(true));
    const after=await read();
    const afterImg=await page.screenshot({
      path:path.join(__dirname,'map4-gfx11c17-'+scene.id+'-after.png')});
    assert(!before.active&&!before.fine);
    assert(after.active&&after.fine);
    assert.equal(after.calls-before.calls,7);
    assert.equal(after.triangles-before.triangles,triangles);
    assert.equal(after.textures,before.textures);
    assert.equal(after.geometries,before.geometries);
    assert.deepEqual(after.state.colliderHashes,
      original.protected.colliderHashes);
    assert.deepEqual(after.state.markers,
      original.protected.markerIds.map((id,i)=>[
        id,original.protected.markerMaterials[i],
        original.protected.markerMatrices[i]
      ]));
    assert.deepEqual(after.state.physical,original.protected.physical);
    evidence.push({id:scene.id,pixelsChanged:!beforeImg.equals(afterImg),
      trianglesAdded:after.triangles-before.triangles,
      drawCallsAdded:after.calls-before.calls});
  }
  assert(evidence.filter(x=>x.pixelsChanged).length>=2,
    'new 96 scene units must create visible impact in >=2 real views');
  const qualities=[];
  await cameraAt({progress:23800,laneY:350,phase:3});
  for(const preset of ['HIGH','BALANCED','LOW']){
    await page.evaluate(p=>{
      h4Gfx10SetProfile(p);updatePlanetaryWorld();
    },preset);
    const stats=await read();
    assert(stats.active);
    assert.equal(stats.fine,preset!=='LOW');
    qualities.push({preset,majorShown:stats.active,serviceShown:stats.fine});
  }
  for(const scene of [
    {progress:6200,laneY:180,phase:1},
    {progress:13200,laneY:300,phase:2},
    {progress:43000,laneY:680,phase:4}
  ]){
    await cameraAt(scene);
    const stats=await read();
    assert.equal(stats.active,false);
    assert.equal(stats.fine,false);
  }
  assert.deepEqual(errors,[],errors.join('\n'));
  const result={id:'NEXT11C17',triangles,stats:original.stats,
    batches:original.batches,views:evidence,
    quality:qualities,protected:original.protected.physics,
    navigationMarkers:24,physicalMeshes:34,realNativeGpu:false,
    aestheticApproval:false,actual300sHumanFlight:false};
  fs.writeFileSync(path.join(__dirname,
    'map4-next11c17-density-qa.json'),JSON.stringify(result,null,2));
  console.log('NEXT11C17 INDUSTRIAL DENSITY WEBGL PASS',
    JSON.stringify({triangles,major:24,service:72,batches:7,
      views:evidence,quality:qualities}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
