/* NEXT-11C10 real Chromium/WebGL: original industrial districts A/B
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
      typeof h4Gfx11c10BuildDistricts==='function' &&
      typeof h4Gfx11c10SetLook==='function',null,{timeout:18000});
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
      const root=h4Gfx11c10Root;
      const batches=root.children.map(mesh=>({
        name:mesh.name,count:mesh.count,instanced:mesh.isInstancedMesh,
        visual:mesh.userData.visualOnly,
        noCollider:mesh.userData.noCollider,
        pos:mesh.geometry.getAttribute('position').count,
        normals:mesh.geometry.getAttribute('normal').count,
        colors:mesh.geometry.getAttribute('color').count,
        uv:mesh.geometry.getAttribute('uv').count,
        map:mesh.material.map?.name,
        triangles:mesh.geometry.getAttribute('position').count/3,
        geometryName:mesh.geometry.name
      }));
      const markers=h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
        m.userData.w05Kind==='BEACON'||
        m.userData.w05Kind==='HIGH_MARKER'));
      const allProtected=h4Gfx11c3PhysicalMaterials.every(e=>
        e.mesh.geometry===e.originalGeometry&&
        e.mesh.userData.h4Collider===e.collider);
      return {
        stats:{...h4Gfx11c10Stats},
        rootName:root.name,rootVisual:root.userData.visualOnly,
        noCollider:root.userData.noCollider,batches,
        locations:H4_GFX11C10_LOCATIONS.map(x=>({
          site:x.site,at:x.at,side:x.side
        })),
        markers:markers.length,
        markerCollisionSafe:markers.every(m=>
          !root.children.includes(m)),
        physicalMeshesOriginal:allProtected,
        physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length],
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
    assert.equal(baseline.rootName,
      'MAP4_GFX11C10_ORIGINAL_FUNCTIONAL_DISTRICTS');
    assert(baseline.rootVisual&&baseline.noCollider);
    assert.equal(baseline.markers,24);
    assert(baseline.markerCollisionSafe&&baseline.physicalMeshesOriginal);
    assert.equal(baseline.stats.originalFamilies,3);
    assert.equal(baseline.stats.originalDistricts,6);
    assert.equal(baseline.stats.drawBatches,3);
    for(const k of ['newColliders','newLights','newExternalAssets',
      'closedRouteMarkersAltered'])
      assert.equal(baseline.stats[k],0);
    assert.equal(baseline.batches.length,3);
    assert.equal(new Set(baseline.batches.map(b=>b.geometryName)).size,3);
    assert.equal(baseline.locations.length,6);
    assert(baseline.locations.every(loc=>
      loc.at>=14000&&loc.at<=34000&&Math.abs(loc.side)>=1100),
      'all original structures must stay outside narrow lanes');
    const triangles=baseline.batches.reduce(
      (sum,b)=>sum+b.triangles*b.count,0);
    assert(triangles>5000&&triangles<45000,
      'C10 original district tris exceed art cap: '+triangles);
    for(const b of baseline.batches){
      assert(b.instanced&&b.visual&&b.noCollider);
      assert.equal(b.count,2);
      assert.equal(b.pos,b.normals);
      assert.equal(b.pos,b.colors);
      assert.equal(b.pos,b.uv);
      assert.equal(b.map,'MAP4_GFX11C5_AUTHORED_STEEL_DIRT_RIVETS');
    }
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
        visible:h4Gfx11c10Root.visible,
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        textures:renderer.info.memory.textures,
        geometries:renderer.info.memory.geometries,
        physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length],
        nav:h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
          m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER')).length
      };
    });
    const results=[];
    for(const spec of [
      {id:'07-entry',progress:17200,laneY:260,phase:3},
      {id:'08-factory',progress:23800,laneY:350,phase:3},
      {id:'09-exit',progress:31600,laneY:450,phase:3}
    ]){
      await setCamera(spec);
      await page.evaluate(()=>h4Gfx11c10SetLook(true));
      await metrics();
      await page.evaluate(()=>h4Gfx11c10SetLook(false));
      const before=await metrics();
      const oldImage=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c10-'+spec.id+'-before.png')});
      await page.evaluate(()=>h4Gfx11c10SetLook(true));
      const after=await metrics();
      const newImage=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c10-'+spec.id+'-after.png')});
      assert(!oldImage.equals(newImage),'C10 must appear in '+spec.id);
      assert.equal(before.visible,false);assert.equal(after.visible,true);
      assert.equal(after.calls-before.calls,3);
      assert.equal(after.triangles-before.triangles,triangles);
      assert.equal(after.textures,before.textures);
      assert.equal(after.geometries,before.geometries);
      assert.deepEqual(after.physics,[6,36,200]);
      assert.equal(after.nav,24);
      results.push({id:spec.id,newCalls:after.calls-before.calls,
        addedTriangles:after.triangles-before.triangles,changed:true});
    }
    const quality=[];
    await setCamera({id:'quality',progress:23800,laneY:350,phase:3});
    for(const name of ['HIGH','BALANCED','LOW']){
      const q=await page.evaluate(p=>{
        h4Gfx10SetProfile(p);updatePlanetaryWorld();
        renderer.render(scene,camera);
        return {name:h4Gfx10ProfileName,
          visible:h4Gfx11c10Root.visible,
          calls:renderer.info.render.calls,
          physics:h4IndustrialColliders.length};
      },name);
      assert.equal(q.name,name);
      assert.equal(q.visible,name!=='LOW');
      assert.equal(q.physics,36);
      quality.push(q);
    }
    for(const p of [
      {progress:5500,laneY:150,phase:1},
      {progress:13300,laneY:180,phase:2},
      {progress:46800,laneY:1000,phase:4}
    ]){
      await setCamera(p);
      assert.equal((await metrics()).visible,false);
    }
    assert.deepEqual(errors,[],errors.join('\n'));
    console.log('NEXT11C10 ORIGINAL DISTRICTS PASS',JSON.stringify({
      baseline,triangles,results,quality,
      nativeGpuVerified:false,userArtApproval:false
    }));
  }finally{await browser.close();}
})().catch(err=>{console.error(err);process.exitCode=1});
