/* NEXT-11C6 real Chromium/WebGL: authored silhouettes, scene-depth A/B,
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
      typeof h4Gfx11c6BuildSkyline==='function' &&
      typeof h4Gfx11c6SetLook==='function',null,{timeout:18000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>.05,
      null,{timeout:22000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });
    const construction=await page.evaluate(()=>{
      const sky=h4Gfx11c6Root;
      const nav=h4IndustrialGroups.flatMap(st=>st.children.filter(m=>
        m.userData.w05Kind==='BEACON'||m.userData.w05Kind==='HIGH_MARKER'));
      return {
        stats:{...h4Gfx11c6Stats},
        root:sky.name,
        batches:sky.children.map(mesh=>({
          name:mesh.name,count:mesh.count,isInstanced:mesh.isInstancedMesh,
          pos:mesh.geometry.getAttribute('position').count,
          normal:mesh.geometry.getAttribute('normal')?.count,
          colors:mesh.geometry.getAttribute('color')?.count,
          uv:mesh.geometry.getAttribute('uv')?.count,
          textured:mesh.material.map?.name,
          bump:mesh.material.bumpMap?.name,
          visual:mesh.userData.visualOnly,
          nonphysical:mesh.userData.noCollider,
          material:mesh.material.name,
          triangles:(mesh.geometry.index ?
            mesh.geometry.index.count :
            mesh.geometry.getAttribute('position').count)/3
        })),
        navCount:nav.length,
        protectedNav:nav.every(mesh=>!sky.children.includes(mesh)),
        collisions:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length],
        oldPhysicalIntact:h4Gfx11c3PhysicalMaterials.every(x=>
          x.mesh.userData.h4Collider===x.collider &&
          x.mesh.geometry===x.originalGeometry),
        gameplay:{rivals:racers.length,hunters:hunterTargets.length,
          duration:MAP4_RACE_RULES.realTimeLimit,
          huntLock:MAP4_PHASES.arenaSeconds,
          orbit:MAP4_PHASES.orbitAltitude}
      };
    });
    assert.deepEqual(construction.collisions,[6,36,200]);
    assert.deepEqual(construction.gameplay,{
      rivals:5,hunters:8,duration:300,huntLock:60,orbit:850
    });
    assert.equal(construction.oldPhysicalIntact,true);
    assert.equal(construction.navCount>=12,true);
    assert.equal(construction.protectedNav,true);
    assert.equal(construction.stats.skylineFamilies,3);
    assert.equal(construction.stats.skylineBatches,3);
    assert.equal(construction.stats.skylineInstances,12);
    assert.equal(construction.stats.newColliders,0);
    assert.equal(construction.stats.newLights,0);
    assert.equal(construction.stats.navigationUnchanged,true);
    assert.equal(construction.batches.length,3);
    for(const b of construction.batches){
      assert(b.isInstanced&&b.count===4&&b.visual&&b.nonphysical);
      assert(b.pos>100&&b.pos===b.normal&&b.pos===b.colors);
      assert.equal(b.pos,b.uv,'authored silhouette UVs required');
      assert.equal(b.textured,'MAP4_GFX11C5_AUTHORED_STEEL_DIRT_RIVETS');
      assert.equal(b.bump,b.textured,'reuse existing texture, no new atlas');
      assert(b.material.startsWith('MAP4_GFX11C6_MUTED_STRUCTURE_'));
    }

    const setCamera=async spec=>page.evaluate(p=>{
      state.paused=true;state.routeProgress=p.progress;
      state.laneX=0;state.laneY=p.laneY;state.map4Phase=p.phase;
      const f=getRaceFrameAtDistance(p.progress);
      state.pos.copy(f.center).addScaledVector(f.up,p.laneY);
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
      updatePlanetaryWorld();
      h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(8);
      renderer.render(scene,camera);
    },spec);

    const metrics=()=>page.evaluate(()=>{
      renderer.render(scene,camera);
      return {
        visible:h4Gfx11c6Root.visible,
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        geometry:renderer.info.memory.geometries,
        textures:renderer.info.memory.textures,
        originalPhysical:h4Gfx11c3PhysicalMaterials.every(x=>
          x.mesh.geometry===x.originalGeometry &&
          x.mesh.userData.h4Collider===x.collider),
        collisions:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length],
        originalNav:h4IndustrialGroups.flatMap(st=>st.children.filter(x=>
          x.userData.w05Kind==='BEACON'||x.userData.w05Kind==='HIGH_MARKER')).length
      };
    });
    const frames=[];
    const expectedTriangles=construction.batches.reduce(
      (sum,x)=>sum+x.triangles*x.count,0);
    for(const p of [
      {id:'07-entry',progress:17200,laneY:260,phase:3},
      {id:'08-factory',progress:23800,laneY:350,phase:3},
      {id:'09-exit',progress:31600,laneY:450,phase:3}
    ]){
      await setCamera(p);
      await page.evaluate(()=>h4Gfx11c6SetLook(false));
      const before=await metrics();
      const oldImage=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c6-'+p.id+'-before.png')});
      await page.evaluate(()=>h4Gfx11c6SetLook(true));
      const after=await metrics();
      const newImage=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c6-'+p.id+'-after.png')});
      assert.equal(before.visible,false);
      assert.equal(after.visible,true);
      assert(!oldImage.equals(newImage),'no new scene silhouette '+p.id);
      assert(after.calls>=before.calls && after.calls<=before.calls+3,
        'more than three silhouette batches '+p.id);
      assert.equal(after.triangles-before.triangles,expectedTriangles,
        'three batches x four instances; triangle budget '+p.id);
      assert.equal(after.geometry,before.geometry);
      assert.equal(after.textures,before.textures);
      assert.deepEqual(after.collisions,[6,36,200]);
      assert.equal(after.originalPhysical,true);
      assert.equal(after.originalNav,before.originalNav);
      frames.push({id:p.id,addedCalls:after.calls-before.calls,
        addedTriangles:after.triangles-before.triangles,
        screenshotChanged:true});
    }

    const quality=[];
    await setCamera({progress:23800,laneY:350,phase:3});
    for(const profile of ['HIGH','BALANCED','LOW']){
      const q=await page.evaluate(name=>{
        h4Gfx10SetProfile(name);updatePlanetaryWorld();
        renderer.render(scene,camera);
        return {profile:h4Gfx10ProfileName,
          skylineVisible:h4Gfx11c6Root.visible,
          triangles:renderer.info.render.triangles,
          colliders:h4IndustrialColliders.length};
      },profile);
      assert.equal(q.profile,profile);
      assert.equal(q.skylineVisible,profile!=='LOW');
      assert.equal(q.colliders,36);
      quality.push(q);
    }
    assert(quality[2].triangles<quality[1].triangles);

    for(const p of [
      {progress:5900,laneY:160,phase:1},
      {progress:13200,laneY:180,phase:2},
      {progress:47500,laneY:1100,phase:4}
    ]){
      await setCamera(p);
      const q=await metrics();
      assert.equal(q.visible,false,'skyline leaked to phase '+p.phase);
    }
    assert.deepEqual(errors,[],errors.join('\n'));
    console.log('NEXT11C6 SILHOUETTE DEPTH PASS',JSON.stringify({
      construction,frames,quality,
      nativeGpuFpsVerified:false,humanAestheticApproval:false
    }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
