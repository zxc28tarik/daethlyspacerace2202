/* NEXT-11C11 real Chromium/WebGL: nonphysical macro facade on protected W02 07/08
 * zero new physics/guidance, map-phase isolation, graphics tiers.
 * Software WebGL proves visual difference, not native GPU or art approval.
 */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');

(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  const page=await browser.newPage({
    viewport:{width:1600,height:900},deviceScaleFactor:1
  });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  try{
    const three=fs.readFileSync(
      require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
      waitUntil:'domcontentloaded',timeout:30000
    });
    await page.waitForFunction(()=>
      typeof h4Gfx11c11BuildRelief==='function' &&
      typeof h4Gfx11c11SetLook==='function',null,{timeout:18000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>.05,
      null,{timeout:22000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });





    const baseline=await page.evaluate(()=>{
      const root=h4Gfx11c11Root;
      const batches=root.children.map(m=>({
        name:m.name,count:m.count,isInstanced:m.isInstancedMesh,
        visual:m.userData.visualOnly,noCollider:m.userData.noCollider,
        geometry:m.geometry.name,
        vertexCount:m.geometry.getAttribute('position').count,
        normals:m.geometry.getAttribute('normal').count,
        colors:m.geometry.getAttribute('color').count,
        uv:m.geometry.getAttribute('uv').count,
        texture:m.material.map?.name,
        verticesWithColor:m.material.vertexColors,
        triangles:m.geometry.getAttribute('position').count/3
      }));
      const protectedShells=[];
      planetaryWorldRegions[2].traverse(mesh=>{
        if(mesh.isMesh&&mesh.userData.h4Vis02Protected)
          protectedShells.push(mesh);
      });
      const markers=h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
        m.userData.w05Kind==='BEACON'||
        m.userData.w05Kind==='HIGH_MARKER'));
      return {
        stats:{...h4Gfx11c11Stats},
        root:root.name,rootVisual:root.userData.visualOnly,
        rootNoCollider:root.userData.noCollider,batches,
        protectedShells:protectedShells.length,
        allOldGeometryUnchanged:h4Gfx11c3PhysicalMaterials.every(e=>
          e.mesh.geometry===e.originalGeometry &&
          e.mesh.userData.h4Collider===e.collider),
        targets:h4Gfx11c11Entries.map(e=>({
          protected:e.mesh.userData.h4Vis02Protected,
          collider:e.collider===e.mesh.userData.h4Collider,
          geometry:e.geometry===e.mesh.geometry,
          before:e.original.name,current:e.mesh.material.name,
          progress:e.collider.progress,family:e.family
        })),
        markerCount:markers.length,
        markersNotInRoot:markers.every(m=>!root.children.includes(m)),
        nav:[...markers].every(m=>m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER'),
        physics:[h4CanyonColliders.length,
          h4IndustrialColliders.length,planetaryBuildingColliders.length],
        gameplay:{rivals:racers.length,hunters:hunterTargets.length,
          limit:MAP4_RACE_RULES.realTimeLimit,
          arena:MAP4_PHASES.arenaSeconds,
          orbit:MAP4_PHASES.orbitAltitude}
      };
    });
    assert.deepEqual(baseline.physics,[6,36,200]);
    assert.deepEqual(baseline.gameplay,{
      rivals:5,hunters:8,limit:300,arena:60,orbit:850
    });
    assert.equal(baseline.protectedShells,34);
    assert(baseline.allOldGeometryUnchanged);
    assert.equal(baseline.markerCount,24);
    assert(baseline.markersNotInRoot&&baseline.nav);
    assert.equal(baseline.root,'MAP4_GFX11C11_NEARFIELD_FACADE_RELIEF');
    assert(baseline.rootVisual&&baseline.rootNoCollider);
    assert(baseline.stats.facadeTargets>=12);
    assert(baseline.stats.facadeTargets<34);
    assert.equal(baseline.stats.physicalMaterialsRegraded,
      baseline.stats.facadeTargets);
    assert.equal(baseline.stats.boxTargets+baseline.stats.towerTargets,
      baseline.stats.facadeTargets);
    assert(baseline.stats.facadeBatches>=1&&
      baseline.stats.facadeBatches<=2);
    assert.equal(baseline.stats.newTextures,0);
    assert.equal(baseline.stats.newColliders,0);
    assert.equal(baseline.stats.newLights,0);
    assert.equal(baseline.batches.length,
      baseline.stats.facadeBatches);
    assert.equal(baseline.targets.length,
      baseline.stats.facadeTargets);
    // Game starts in phase 1; C11 material overrides must be OFF until
    // entry into phase 3. The same test activates them below per camera.
    assert(baseline.targets.every(e=>e.protected&&e.collider&&
      e.geometry&&e.progress<29200&&e.current===e.before));
    const fullTriangles=baseline.batches.reduce((acc,b)=>
      acc+b.triangles*b.count,0);
    assert.equal(baseline.stats.trianglesAdded,fullTriangles);
    assert(fullTriangles>=10000&&fullTriangles<=55000,
      'C11 nearfield batch outside art budget: '+fullTriangles);
    for(const b of baseline.batches){
      assert(b.isInstanced&&b.visual&&b.noCollider&&b.count>0);
      assert(b.vertexCount>500);
      assert.equal(b.vertexCount,b.normals);
      assert.equal(b.vertexCount,b.colors);
      assert.equal(b.vertexCount,b.uv);
      assert.equal(b.texture,'MAP4_GFX11C5_AUTHORED_STEEL_DIRT_RIVETS');
      assert(b.verticesWithColor);
    }
    const setCamera=p=>page.evaluate(spec=>{
      state.paused=true;state.routeProgress=spec.progress;
      state.laneX=spec.laneX||0;state.laneY=spec.laneY;
      state.map4Phase=spec.phase;
      const f=getRaceFrameAtDistance(spec.progress);
      state.pos.copy(f.center)
        .addScaledVector(f.right,spec.laneX||0)
        .addScaledVector(f.up,spec.laneY);
      const q=new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(
          f.right,f.up,f.tangent.clone().negate()));
      playerRig.position.copy(state.pos);
      playerRig.quaternion.copy(q);
      camera.position.copy(state.pos).add(
        new THREE.Vector3(0,5,17).applyQuaternion(q));
      camera.quaternion.copy(q);
      camera.fov=68;camera.updateProjectionMatrix();
      h4Gfx10SetProfile('HIGH');
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(8);
      renderer.render(scene,camera);
    },p);
    const metrics=()=>page.evaluate(()=>{
      renderer.render(scene,camera);
      return {
        enabled:h4Gfx11c11Root.visible,
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        textures:renderer.info.memory.textures,
        geometries:renderer.info.memory.geometries,
        originalsSafe:h4Gfx11c3PhysicalMaterials.every(e=>
          e.mesh.geometry===e.originalGeometry&&
          e.mesh.userData.h4Collider===e.collider),
        overlays:h4Gfx11c11Entries.filter(e=>
          e.mesh.material===e.styled).length,
        physics:[h4CanyonColliders.length,
          h4IndustrialColliders.length,planetaryBuildingColliders.length]
      };
    });
    const previews=[];
    for(const p of [
      {id:'07-entry',progress:17200,laneY:260,phase:3},
      {id:'08-factory',progress:23800,laneY:350,phase:3},
      {id:'09-exit',progress:31600,laneY:450,phase:3}
    ]){
      await setCamera(p);
      await page.evaluate(()=>h4Gfx11c11SetLook(true));
      await metrics();
      await page.evaluate(()=>h4Gfx11c11SetLook(false));
      const before=await metrics();
      const old=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c11-'+p.id+'-before.png')});
      await page.evaluate(()=>h4Gfx11c11SetLook(true));
      const after=await metrics();
      const image=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c11-'+p.id+'-after.png')});
      if(p.id!=='09-exit')
        assert(!image.equals(old),'C11 not visible '+p.id);
      assert.equal(before.enabled,false);
      assert.equal(after.enabled,true);
      assert.equal(before.overlays,0);
      assert.equal(after.overlays,baseline.stats.facadeTargets);
      assert.equal(after.calls-before.calls,baseline.stats.facadeBatches);
      assert.equal(after.triangles-before.triangles,fullTriangles);
      assert.equal(after.textures,before.textures);
      assert.equal(after.geometries,before.geometries);
      assert(after.originalsSafe);
      assert.deepEqual(after.physics,[6,36,200]);
      previews.push({id:p.id,changed:!image.equals(old),
        extraCalls:after.calls-before.calls,
        extraTriangles:after.triangles-before.triangles});
    }
    const quality=[];
    await setCamera({progress:23800,laneY:350,phase:3});
    for(const name of ['HIGH','BALANCED','LOW']){
      const q=await page.evaluate(p=>{
        h4Gfx10SetProfile(p);updatePlanetaryWorld();
        renderer.render(scene,camera);
        return {preset:h4Gfx10ProfileName,
          visible:h4Gfx11c11Root.visible,
          overlays:h4Gfx11c11Entries.filter(e=>
            e.mesh.material===e.styled).length,
          physics:h4IndustrialColliders.length};
      },name);
      assert.equal(q.preset,name);
      assert.equal(q.visible,name!=='LOW');
      assert.equal(q.overlays,name==='LOW'?0:
        baseline.stats.facadeTargets);
      assert.equal(q.physics,36);
      quality.push(q);
    }
    for(const p of [
      {progress:6200,laneY:155,phase:1},
      {progress:13200,laneY:155,phase:2},
      {progress:47000,laneY:1000,phase:4}
    ]){
      await setCamera(p);
      const stats=await metrics();
      assert.equal(stats.enabled,false);
      assert.equal(stats.overlays,0);
    }
    assert.deepEqual(errors,[],errors.join('\n'));
    console.log('NEXT11C11 ORIGINAL NEARFIELD RELIEF PASS',
      JSON.stringify({baseline,fullTriangles,previews,quality,
        nativeGpuVerified:false,userAestheticApproval:false}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
