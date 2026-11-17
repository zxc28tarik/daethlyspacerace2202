/* NEXT-11C8 real Chromium/WebGL: authored protected-shell facades & ground A/B
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
      typeof h4Gfx11c8BuildFacades==='function' &&
      typeof h4Gfx11c8SetLook==='function',null,{timeout:18000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>.05,
      null,{timeout:22000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });


    // Historical same-camera QA must isolate NEXT11C9's later art layer.
    // C9 itself is tested independently under real Chromium/WebGL.
    await page.evaluate(()=>{
      if(typeof h4Gfx11c9SetLook==='function')
        h4Gfx11c9SetLook(false);
    });
    const baseline=await page.evaluate(()=>{
      // W04/GFX04 reparents all industry visuals below the zone's
      // gfx04IndustrialVisuals group after their construction. Descend the
      // final scene tree rather than checking only the old direct children.
      const protectedShells=[];
      planetaryWorldRegions[2].traverse(m=>{
        if(m.isMesh&&m.userData.h4Vis02Protected)
          protectedShells.push(m);
      });
      const root=h4Gfx11c8Root;
      const ground=planetaryWorldRegions[2].children.find(m=>
        m.isMesh&&m.userData.h4TerrainSceneryOnly);
      return {
        stats:{...h4Gfx11c8Stats},root:root.name,
        rootVisual:root.userData.visualOnly,rootNoCollider:root.userData.noCollider,
        batches:root.children.map(m=>({
          name:m.name,count:m.count,instanced:m.isInstancedMesh,
          visual:m.userData.visualOnly,noCollider:m.userData.noCollider,
          uv:m.geometry.getAttribute('uv')?.count,
          normal:m.geometry.getAttribute('normal')?.count,
          color:m.geometry.getAttribute('color')?.count,
          pos:m.geometry.getAttribute('position').count,
          tri:(m.geometry.index?m.geometry.index.count:
            m.geometry.getAttribute('position').count)/3,
          map:m.material.map?.name,
          vertexColors:m.material.vertexColors
        })),
        protectedShells:protectedShells.length,
        shellIdentity:protectedShells.every(mesh=>
          mesh.userData.h4Collider&&
          h4Gfx11c3PhysicalMaterials.some(e=>
            e.mesh===mesh&&mesh.geometry===e.originalGeometry&&
            mesh.userData.h4Collider===e.collider)),
        navCount:h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
          m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER')).length,
        navProtected:h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
          m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER')).every(m=>
            !root.children.includes(m)),
        groundNonphysical:!!ground.userData.h4TerrainSceneryOnly &&
          !ground.userData.h4Collider,
        atlasName:h4Gfx11c8GroundMaterial.map?.name,
        groundOriginalIsC7:h4Gfx11c8GroundFallback.kind==='GROUND',
        physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length],
        game:{rivals:racers.length,hunters:hunterTargets.length,
          seconds:MAP4_RACE_RULES.realTimeLimit,
          arena:MAP4_PHASES.arenaSeconds,
          orbit:MAP4_PHASES.orbitAltitude}
      };
    });
    assert.deepEqual(baseline.physics,[6,36,200]);
    assert.deepEqual(baseline.game,{
      rivals:5,hunters:8,seconds:300,arena:60,orbit:850
    });
    assert(baseline.protectedShells>=20,
      'expected original W02 physical shells: '+baseline.protectedShells);
    assert.equal(baseline.stats.facades,baseline.protectedShells);
    assert.equal(baseline.stats.boxFacades+baseline.stats.towerFacades,
      baseline.stats.facades);
    assert(baseline.stats.batches>=1&&baseline.stats.batches<=2);
    assert.equal(baseline.stats.groundAtlases,1);
    assert.equal(baseline.stats.groundUpdated,1);
    assert.equal(baseline.stats.addedColliders,0);
    assert.equal(baseline.stats.addedLights,0);
    assert(baseline.rootVisual&&baseline.rootNoCollider);
    assert(baseline.shellIdentity&&baseline.navProtected);
    assert(baseline.navCount>=12);
    assert(baseline.groundNonphysical&&baseline.groundOriginalIsC7);
    assert.equal(baseline.atlasName,
      'MAP4_GFX11C8_AUTHORED_CONCRETE_SILT_ALBEDO');
    for(const b of baseline.batches){
      assert(b.instanced&&b.visual&&b.noCollider&&b.count>0);
      assert(b.pos>100&&b.pos===b.uv&&b.pos===b.normal&&b.pos===b.color);
      assert.equal(b.map,'MAP4_GFX11C5_AUTHORED_STEEL_DIRT_RIVETS');
      assert.equal(b.vertexColors,true);
    }
    const expectedTriangles=baseline.batches.reduce(
      (sum,b)=>sum+b.tri*b.count,0);
    assert.equal(expectedTriangles,baseline.stats.trianglesAdded);
    assert(expectedTriangles<70000,'C8 budget overrun');

    const fixedCamera=spec=>page.evaluate(p=>{
      state.paused=true;state.routeProgress=p.progress;
      state.laneX=0;state.laneY=p.laneY;state.map4Phase=p.phase;
      const f=getRaceFrameAtDistance(p.progress);
      state.pos.copy(f.center).addScaledVector(f.up,p.laneY);
      const q=new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(
          f.right,f.up,f.tangent.clone().negate()));
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
      camera.position.copy(state.pos).add(
        new THREE.Vector3(0,5,17).applyQuaternion(q));
      camera.quaternion.copy(q);camera.fov=68;
      camera.updateProjectionMatrix();
      h4Gfx10SetProfile('HIGH');updatePlanetaryWorld();
      h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
      renderer.render(scene,camera);
    },spec);
    const metrics=()=>page.evaluate(()=>{
      renderer.render(scene,camera);
      return {
        visible:h4Gfx11c8Root.visible,
        groundMaterial:h4Gfx11c8Ground.material.name,
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        textures:renderer.info.memory.textures,
        geometries:renderer.info.memory.geometries,
        originalProtected:h4Gfx11c3PhysicalMaterials.every(e=>
          e.mesh.geometry===e.originalGeometry&&
          e.mesh.userData.h4Collider===e.collider),
        physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length]
      };
    });
    const results=[];
    for(const spec of [
      {id:'07-entry',progress:17200,laneY:260,phase:3},
      {id:'08-factory',progress:23800,laneY:350,phase:3},
      {id:'09-exit',progress:31600,laneY:450,phase:3}
    ]){
      await fixedCamera(spec);
      await page.evaluate(()=>h4Gfx11c8SetLook(true));
      await metrics(); // Upload newly authored map before comparison
      await page.evaluate(()=>h4Gfx11c8SetLook(false));
      const before=await metrics();
      const oldImage=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c8-'+spec.id+'-before.png')});
      await page.evaluate(()=>h4Gfx11c8SetLook(true));
      const after=await metrics();
      const newImage=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c8-'+spec.id+'-after.png')});
      assert(!oldImage.equals(newImage),'no visual difference '+spec.id);
      assert.equal(before.visible,false);
      assert.equal(after.visible,true);
      assert(after.groundMaterial.includes('GFX11C8_WORN'));
      assert(before.groundMaterial.includes('GFX11C7_MATTE'));
      assert.equal(after.calls-before.calls,baseline.stats.batches);
      assert.equal(after.triangles-before.triangles,expectedTriangles);
      assert.equal(after.textures,before.textures);
      assert.equal(after.geometries,before.geometries);
      assert.deepEqual(after.physics,[6,36,200]);
      assert.equal(after.originalProtected,true);
      results.push({id:spec.id,addedCalls:after.calls-before.calls,
        triangles:after.triangles-before.triangles,
        screenshotChanged:true});
    }
    const quality=[];
    await fixedCamera({progress:23800,laneY:350,phase:3});
    for(const preset of ['HIGH','BALANCED','LOW']){
      const q=await page.evaluate(p=>{
        h4Gfx10SetProfile(p);updatePlanetaryWorld();
        renderer.render(scene,camera);
        return {preset:h4Gfx10ProfileName,visible:h4Gfx11c8Root.visible,
          ground:h4Gfx11c8Ground.material.name,
          collisions:h4IndustrialColliders.length};
      },preset);
      assert.equal(q.preset,preset);
      assert.equal(q.visible,preset!=='LOW');
      assert.equal(q.collisions,36);
      if(preset==='LOW')assert(!q.ground.includes('GFX11C8_WORN'));
      quality.push(q);
    }
    for(const p of [
      {progress:5900,laneY:160,phase:1},
      {progress:13200,laneY:180,phase:2},
      {progress:47500,laneY:1100,phase:4}
    ]){
      await fixedCamera(p);
      await page.evaluate(()=>h4Gfx11c8SetLook(true));
      const after=await metrics();
      assert.equal(after.visible,false,
        'C8 facades must not show in phase '+p.phase);
      assert(!after.groundMaterial.includes('GFX11C8_WORN'));
    }
    assert.deepEqual(errors,[],errors.join('\n'));
    console.log('NEXT11C8 PHYSICAL-SHELL FACADES PASS',JSON.stringify({
      baseline,expectedTriangles,results,quality,
      realGpuFpsVerified:false,humanAestheticApproval:false
    }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
