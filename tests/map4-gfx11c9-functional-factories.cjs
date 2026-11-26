/* NEXT-11C9 real Chromium/WebGL: functional roofs and ring-free industrial exit A/B
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
      typeof h4Gfx11c9BuildFunctionalIndustry==='function' &&
      typeof h4Gfx11c9SetLook==='function',null,{timeout:18000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>.05,
      null,{timeout:22000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });



    // NEXT11C10 is an independent later visual-only layer.
    // Keep earlier A/B drawcall & pixel comparisons isolated.
    await page.evaluate(()=>{
      if(typeof h4Gfx11c10SetLook==='function')
        h4Gfx11c10SetLook(false);
    });
    // C11 is a separately tested late visual pass; isolate this
    // older A/B suite from its two batches and physics-shell materials.
    await page.evaluate(()=>{
      if(typeof h4Gfx11c11SetLook==='function')
        h4Gfx11c11SetLook(false);
    });
    // C12 is a later independently tested industrial silhouette layer.
    // Disable it so historic pixel/drawcall A/B tests stay meaningful.
    await page.evaluate(()=>{
      if(typeof h4Gfx11c12SetLook==='function')
        h4Gfx11c12SetLook(false);
    });
    const baseline=await page.evaluate(()=>{
      const root=h4Gfx11c9Root;
      const shells=planetaryWorldRegions[2].children[0];
      const protectedShells=[];
      planetaryWorldRegions[2].traverse(mesh=>{
        if(mesh.isMesh&&mesh.userData.h4Vis02Protected)
          protectedShells.push(mesh);
      });
      const batches=root.children.map(m=>{
        const g=m.geometry;
        return {
          name:m.name,count:m.count,
          instanced:m.isInstancedMesh,
          visual:m.userData.visualOnly,noCollider:m.userData.noCollider,
          hasUV:!!g.getAttribute('uv'),vertexColors:m.material.vertexColors,
          pos:g.getAttribute('position').count,
          color:g.getAttribute('color').count,
          normal:g.getAttribute('normal').count,
          uv:g.getAttribute('uv').count,
          triangles:g.getAttribute('position').count/3,
          texture:m.material.map?.name
        };
      });
      return {
        stats:{...h4Gfx11c9Stats},batches,
        rootVisual:root.userData.visualOnly,
        rootNoCollider:root.userData.noCollider,
        protectedCount:protectedShells.length,
        originalsIntact:h4Gfx11c3PhysicalMaterials.every(item=>
          item.mesh.userData.h4Collider===item.collider&&
          item.mesh.geometry===item.originalGeometry),
        legacyC4:h4Gfx11c7HeroMatrices.map(e=>({
          index:e.index,hasPhysics:!!e.mesh.userData.h4Collider,
          noCollider:e.mesh.userData.noCollider
        })),
        protectedMarkers:h4IndustrialGroups.flatMap(st=>
          st.children.filter(m=>m.userData.w05Kind==='BEACON'||
            m.userData.w05Kind==='HIGH_MARKER')).every(m=>
              !root.children.includes(m)),
        markerCount:h4IndustrialGroups.flatMap(st=>st.children.filter(
          m=>m.userData.w05Kind==='BEACON'||
            m.userData.w05Kind==='HIGH_MARKER')).length,
        game:{rivals:racers.length,hunters:hunterTargets.length,
          race:MAP4_RACE_RULES.realTimeLimit,
          arena:MAP4_PHASES.arenaSeconds,
          orbit:MAP4_PHASES.orbitAltitude},
        colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length]
      };
    });
    assert.deepEqual(baseline.game,{
      rivals:5,hunters:8,race:300,arena:60,orbit:850});
    assert.deepEqual(baseline.colliders,[6,36,200]);
    assert.equal(baseline.protectedCount,34);
    assert(baseline.originalsIntact&&baseline.protectedMarkers);
    assert(baseline.markerCount>=24);
    assert.deepEqual(baseline.legacyC4.map(e=>e.index),[2,3]);
    assert(baseline.legacyC4.every(x=>x.noCollider&&!x.hasPhysics));
    assert.equal(baseline.stats.roofModules,34);
    assert.equal(baseline.stats.roofBlocks,22);
    assert.equal(baseline.stats.roofTowers,12);
    assert.equal(baseline.stats.roofBatches,2);
    assert.equal(baseline.stats.exitManifolds,2);
    assert.equal(baseline.stats.exitBatches,1);
    assert.equal(baseline.stats.bridgeOverlays,12);
    assert.equal(baseline.stats.bridgeBatches,1);
    assert.equal(baseline.stats.newColliders,0);
    assert.equal(baseline.stats.newLights,0);
    assert.equal(baseline.stats.newTextures,0);
    assert(baseline.rootVisual&&baseline.rootNoCollider);
    assert.equal(baseline.batches.length,4);
    assert(baseline.batches.some(b=>b.name===
      'MAP4_GFX11C9_PHYSICAL_BEAM_VISUAL_SKIN'&&b.count===12));
    const triangleBudget=baseline.batches.reduce(
      (sum,b)=>sum+b.triangles*b.count,0);
    assert(triangleBudget>3000&&triangleBudget<90000,
      'ring-free machinery exceeds compact triangle budget');
    for(const b of baseline.batches){
      assert(b.instanced&&b.visual&&b.noCollider&&b.hasUV);
      assert.equal(b.pos,b.normal);
      assert.equal(b.pos,b.color);
      assert.equal(b.pos,b.uv);
      assert(b.vertexColors&&b.count>0);
      assert.equal(b.texture,'MAP4_GFX11C5_AUTHORED_STEEL_DIRT_RIVETS');
    }
    const cameraFor=spec=>page.evaluate(p=>{
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
      const former=h4Gfx11c7HeroMatrices.map(entry=>{
        const matrix=new THREE.Matrix4();
        entry.mesh.getMatrixAt(entry.index,matrix);
        return matrix.getMaxScaleOnAxis();
      });
      return {
        current:h4Gfx11c9Root.visible,
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        textures:renderer.info.memory.textures,
        geometries:renderer.info.memory.geometries,
        oldEnergyScale:former,
        originalsIntact:h4Gfx11c3PhysicalMaterials.every(x=>
          x.mesh.geometry===x.originalGeometry&&
          x.mesh.userData.h4Collider===x.collider),
        colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length]
      };
    });
    const cameras=[
      {id:'07-entry',progress:17200,laneY:260,phase:3},
      {id:'08-factory',progress:23800,laneY:350,phase:3},
      {id:'09-exit',progress:31600,laneY:450,phase:3}
    ];
    const images=[];
    for(const spec of cameras){
      await cameraFor(spec);
      await page.evaluate(()=>h4Gfx11c9SetLook(false));
      const old=await metrics();
      const before=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c9-'+spec.id+'-before.png')});
      await page.evaluate(()=>h4Gfx11c9SetLook(true));
      const now=await metrics();
      const after=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c9-'+spec.id+'-after.png')});
      assert(!before.equals(after),'no C9 screen impact '+spec.id);
      assert(!old.current&&now.current);
      assert.equal(now.calls-old.calls,4,'4 batched C9 units expected');
      assert.equal(now.triangles-old.triangles,triangleBudget);
      assert.equal(now.textures,old.textures);
      assert.equal(now.geometries,old.geometries);
      assert.deepEqual(now.colliders,[6,36,200]);
      assert(now.originalsIntact);
      assert.equal(now.oldEnergyScale.length,2);
      assert(now.oldEnergyScale.every((v,i)=>v<old.oldEnergyScale[i]*.002),
        'old nonphysical ring instance must disappear from C9 view');
      images.push({id:spec.id,newCalls:now.calls-old.calls,
        triangleDelta:now.triangles-old.triangles,changed:true});
    }
    const quality=[];
    await cameraFor({progress:23800,laneY:350,phase:3});
    for(const name of ['HIGH','BALANCED','LOW']){
      const d=await page.evaluate(value=>{
        h4Gfx10SetProfile(value);updatePlanetaryWorld();
        renderer.render(scene,camera);
        return {quality:h4Gfx10ProfileName,
          visible:h4Gfx11c9Root.visible,
          collisions:h4IndustrialColliders.length,
          oldEnergy:h4Gfx11c9EnergyEntries.map(e=>e.c9Active)};
      },name);
      assert.equal(d.quality,name);
      assert.equal(d.visible,name!=='LOW');
      assert.equal(d.collisions,36);
      assert(d.oldEnergy.every(x=>x===(name!=='LOW')));
      quality.push(d);
    }
    const phaseCases=[];
    for(const spec of [
      {id:'canyon',progress:5800,laneY:160,phase:1},
      {id:'arena',progress:13200,laneY:160,phase:2},
      {id:'orbit',progress:47500,laneY:1000,phase:4}
    ]){
      await cameraFor(spec);
      const off=await page.evaluate(()=>{
        h4Gfx11c9SetLook(false);
        renderer.render(scene,camera);
        return {calls:renderer.info.render.calls,
          triangles:renderer.info.render.triangles};
      });
      const on=await page.evaluate(()=>{
        h4Gfx11c9SetLook(true);
        renderer.render(scene,camera);
        return {calls:renderer.info.render.calls,
          triangles:renderer.info.render.triangles,
          visible:h4Gfx11c9Root.visible};
      });
      assert.deepEqual({calls:on.calls,triangles:on.triangles},off);
      assert.equal(on.visible,false);
      phaseCases.push(spec.id);
    }
    assert.deepEqual(errors,[],errors.join('\n'));
    console.log('NEXT11C9 FUNCTIONAL INDUSTRY PASS',JSON.stringify({
      baseline,triangleBudget,images,quality,phaseCases,
      nativeGpuVerified:false,humanAestheticApproval:false
    }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
