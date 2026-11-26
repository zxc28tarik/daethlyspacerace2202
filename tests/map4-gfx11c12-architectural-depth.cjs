/* NEXT-11C12 real Chromium/WebGL: independent original industrial depth 07/08
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
      typeof h4Gfx11c12BuildDepth==='function' &&
      typeof h4Gfx11c12SetLook==='function',null,{timeout:18000});
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
      const root=h4Gfx11c12Root;
      const batches=root.children.map(mesh=>({
        name:mesh.name,isInstanced:mesh.isInstancedMesh,
        noCollider:mesh.userData.noCollider,
        visualOnly:mesh.userData.visualOnly,
        count:mesh.count,triangleCount:mesh.geometry.getAttribute('position').count/3,
        vertexCount:mesh.geometry.getAttribute('position').count,
        normalCount:mesh.geometry.getAttribute('normal').count,
        colorCount:mesh.geometry.getAttribute('color').count,
        uvCount:mesh.geometry.getAttribute('uv').count,
        texture:mesh.material.map?.name,vertexColors:mesh.material.vertexColors
      }));
      const markers=h4IndustrialGroups.flatMap(group=>
        group.children.filter(mesh=>mesh.userData.w05Kind==='BEACON'||
          mesh.userData.w05Kind==='HIGH_MARKER'));
      return {
        stats:{...h4Gfx11c12Stats},
        root:root.name,rootVisualOnly:root.userData.visualOnly,
        rootNoCollider:root.userData.noCollider,
        batches,sites:H4_GFX11C12_SITES.map(s=>({...s})),
        physicalBodies:h4Gfx11c3PhysicalMaterials.length,
        bodiesUnchanged:h4Gfx11c3PhysicalMaterials.every(e=>
          e.mesh.geometry===e.originalGeometry&&
          e.mesh.userData.h4Collider===e.collider),
        markerCount:markers.length,
        markerUnchanged:markers.every(m=>!root.children.includes(m)),
        ornaments:h4Gfx11c12Ornaments.map(o=>({
          current:o.mesh.material.name,
          original:o.original.name,
          alpha:o.faded.opacity,
          color:o.faded.color.getHex(),
          navigation:!!o.mesh.userData.w05Kind,
          colliding:!!o.mesh.userData.h4Collider
        })),
        gameplay:{rivals:racers.length,hunters:hunterTargets.length,
          limit:MAP4_RACE_RULES.realTimeLimit,arena:MAP4_PHASES.arenaSeconds,
          orbit:MAP4_PHASES.orbitAltitude},
        colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length]
      };
    });
    assert.deepEqual(baseline.colliders,[6,36,200]);
    assert.deepEqual(baseline.gameplay,{
      rivals:5,hunters:8,limit:300,arena:60,orbit:850
    });
    assert.equal(baseline.root,'MAP4_GFX11C12_ORIGINAL_ARCHITECTURAL_DEPTH');
    assert(baseline.rootVisualOnly&&baseline.rootNoCollider);
    assert.equal(baseline.physicalBodies,34);
    assert(baseline.bodiesUnchanged);
    assert.equal(baseline.markerCount,24);
    assert(baseline.markerUnchanged);
    assert.equal(baseline.stats.originalFamilies,2);
    assert.equal(baseline.stats.sites,6);
    assert.equal(baseline.stats.batches,2);
    assert.equal(baseline.batches.length,2);
    assert.equal(baseline.sites.length,6);
    assert.deepEqual(baseline.sites.map(x=>x.family),[0,1,0,1,0,1]);
    assert(baseline.sites.every(x=>Math.abs(x.side)>=1100 &&
      x.at>=15000&&x.at<30000),'C12 must stay on outer flanks');
    // H4_INDUSTRY FAST_LOW centre=-800, width +/-310; HUNTER_FLANK
    // centre=900, width +/-480. Conservative silhouette half width
    // includes yaw and all authored structural vertices (0.55 factor).
    // The visible art must not promise fake new collidable lane walls.
    for(const site of baseline.sites){
      const nearestToCentre=Math.abs(site.side)-
        .65*.55*site.size;
      assert(nearestToCentre>=(site.side<0?1140:1430),
        'C12 false visual barrier in industrial flight route: '+
        JSON.stringify(site)+' inner='+nearestToCentre);
    }
    for(const key of ['newColliders','newLights','newTextures','newExternalModels',
      'physicalMeshChanged','navigationMarkerChanged'])
      assert.equal(baseline.stats[key],0);
    const drawnTris=baseline.batches.reduce(
      (sum,b)=>sum+b.triangleCount*b.count,0);
    assert.equal(drawnTris,baseline.stats.triangles);
    assert(drawnTris>=3000&&drawnTris<=50000,
      'C12 batch triangle cap: '+drawnTris);
    for(const b of baseline.batches){
      assert.equal(b.isInstanced,true);
      assert(b.visualOnly&&b.noCollider&&b.count===3);
      assert.equal(b.vertexCount,b.normalCount);
      assert.equal(b.vertexCount,b.colorCount);
      assert.equal(b.vertexCount,b.uvCount);
      assert(b.vertexColors);
      assert.equal(b.texture,'MAP4_GFX11C5_AUTHORED_STEEL_DIRT_RIVETS');
    }
    assert.equal(baseline.stats.mutedNonNavOrnaments,
      baseline.ornaments.length);
    assert(baseline.ornaments.every(x=>
      !x.navigation&&!x.colliding&&x.alpha<.11));
    const setCamera=spec=>page.evaluate(p=>{
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
      camera.quaternion.copy(q);camera.fov=68;
      camera.updateProjectionMatrix();
      h4Gfx10SetProfile('HIGH');updatePlanetaryWorld();
      h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
      renderer.render(scene,camera);
    },spec);
    const metrics=()=>page.evaluate(()=>{
      renderer.render(scene,camera);
      return {
        visible:h4Gfx11c12Root.visible,
        ringMuted:h4Gfx11c12Ornaments.filter(o=>
          o.mesh.material===o.faded).length,
        drawCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        textures:renderer.info.memory.textures,
        geometries:renderer.info.memory.geometries,
        bodyIntegrity:h4Gfx11c3PhysicalMaterials.every(e=>
          e.mesh.geometry===e.originalGeometry &&
          e.mesh.userData.h4Collider===e.collider),
        markers:h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
          m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER')).length,
        physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length]
      };
    });
    const comparisons=[];
    for(const spec of [
      {id:'07-entry',progress:17200,laneY:260,phase:3},
      {id:'08-factory',progress:23800,laneY:350,phase:3},
      {id:'09-exit',progress:31600,laneY:450,phase:3}
    ]){
      await setCamera(spec);
      await page.evaluate(()=>h4Gfx11c12SetLook(true));
      await metrics(); // preload the prebuilt PBR buffers
      await page.evaluate(()=>h4Gfx11c12SetLook(false));
      const before=await metrics();
      const first=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c12-'+spec.id+'-before.png')});
      await page.evaluate(()=>h4Gfx11c12SetLook(true));
      const after=await metrics();
      const second=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c12-'+spec.id+'-after.png')});
      assert(!before.visible&&after.visible);
      assert.equal(after.drawCalls-before.drawCalls,2);
      assert.equal(after.triangles-before.triangles,drawnTris);
      assert.equal(after.textures,before.textures);
      assert.equal(after.geometries,before.geometries);
      assert.equal(before.ringMuted,0);
      assert.equal(after.ringMuted,baseline.ornaments.length);
      assert(after.bodyIntegrity);
      assert.equal(after.markers,24);
      assert.deepEqual(after.physics,[6,36,200]);
      if(spec.id!=='09-exit')
        assert(!first.equals(second),
          'Original skyline not visible in '+spec.id);
      comparisons.push({
        shot:spec.id,changed:!first.equals(second),
        drawCalls:after.drawCalls-before.drawCalls,
        triangles:after.triangles-before.triangles,
        fadedOrnaments:after.ringMuted});
    }
    const quality=[];
    await setCamera({progress:23800,laneY:350,phase:3});
    for(const setting of ['HIGH','BALANCED','LOW']){
      const current=await page.evaluate(p=>{
        h4Gfx10SetProfile(p);updatePlanetaryWorld();
        renderer.render(scene,camera);
        return {
          preset:h4Gfx10ProfileName,
          visible:h4Gfx11c12Root.visible,
          reduced:h4Gfx11c12Ornaments.filter(x=>
            x.mesh.material===x.faded).length,
          physics:h4IndustrialColliders.length
        };
      },setting);
      assert.equal(current.preset,setting);
      assert.equal(current.visible,setting!=='LOW');
      assert.equal(current.reduced,setting==='LOW'?0:
        baseline.ornaments.length);
      assert.equal(current.physics,36);
      quality.push(current);
    }
    for(const spec of [
      {progress:6000,laneY:170,phase:1},
      {progress:13300,laneY:175,phase:2},
      {progress:47700,laneY:1000,phase:4}
    ]){
      await setCamera(spec);
      const current=await metrics();
      assert.equal(current.visible,false);
      assert.equal(current.ringMuted,0);
      assert.deepEqual(current.physics,[6,36,200]);
    }
    assert.deepEqual(errors,[],errors.join('\n'));
    console.log('NEXT11C12 ARCHITECTURAL DEPTH PASS',JSON.stringify({
      baseline,drawnTris,comparisons,quality,
      nativeGpuVerified:false,userAestheticApproval:false
    }));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
