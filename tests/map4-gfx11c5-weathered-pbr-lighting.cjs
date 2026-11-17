/* NEXT-11C5 real-engine QA — 07/08/09 same-camera PBR/weather and
 * contact-shadow A/B; protected navigation rings, physics and low quality.
 * Chromium software renderer is NOT native GPU FPS or aesthetic signoff.
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
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.stack||error.message));
  try{
    const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',route=>
      route.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',route=>
      route.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
      waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(
      ()=>typeof h4Gfx11c5BuildLook==='function'&&
          typeof h4Gfx11c5SetLook==='function',null,{timeout:18000});
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
    const base=await page.evaluate(()=>{
      const nav=h4IndustrialGroups.flatMap(station=>station.children.filter(m=>
        m.userData.w05Kind==='HIGH_MARKER'||m.userData.w05Kind==='BEACON'));
      return {
        stats:{...h4Gfx11c5Stats},
        allNewPBR:h4Gfx11c5HeroMaterials.map(item=>({
          isInstanced:item.mesh.isInstancedMesh,
          uv:item.mesh.geometry.getAttribute('uv')?.count,
          pos:item.mesh.geometry.getAttribute('position').count,
          map:item.style.map?.name,bump:item.style.bumpMap?.name,
          roughness:item.style.roughness,metalness:item.style.metalness,
          oldMap:item.old.map?.name||null,
          noCollision:item.mesh.userData.noCollider,
          current:item.mesh.material===item.style,
          instanceCount:item.mesh.count
        })),
        shadows:{
          name:h4Gfx11c5ContactShadows?.name,
          count:h4Gfx11c5ContactShadows?.count,
          isInstanced:h4Gfx11c5ContactShadows?.isInstancedMesh,
          noCollision:h4Gfx11c5ContactShadows?.userData.noCollider,
          opacity:h4Gfx11c5ContactShadows?.material.opacity,
          map:h4Gfx11c5ContactShadows?.material.map?.name,
          triangles:(h4Gfx11c5ContactShadows.geometry.index?
            h4Gfx11c5ContactShadows.geometry.index.count:
            h4Gfx11c5ContactShadows.geometry.getAttribute('position').count)/3
        },
        navCount:nav.length,
        navProtected:nav.every(item=>
          !h4Gfx11c5DecorRings.some(r=>r.mesh===item)),
        originalPhysical:h4Gfx11c3PhysicalMaterials.every(item=>
          item.mesh.userData.h4Collider===item.collider&&
          item.mesh.geometry===item.originalGeometry),
        gameplay:{
          rivals:racers.length,hunters:hunterTargets.length,
          canyon:h4CanyonColliders.length,
          industry:h4IndustrialColliders.length,
          buildings:planetaryBuildingColliders.length,
          raceLimit:MAP4_RACE_RULES.realTimeLimit,
          arenaSeconds:MAP4_PHASES.arenaSeconds,
          orbit:MAP4_PHASES.orbitAltitude,
          score:state.score,shots:state.hunterShots
        }
      };
    });
    assert.deepEqual(base.gameplay,{
      rivals:5,hunters:8,canyon:6,industry:36,buildings:200,
      raceLimit:300,arenaSeconds:60,orbit:850,score:0,shots:0
    });
    assert.equal(base.stats.pbrFamilies,3);
    assert.equal(base.stats.uvGeometries,3);
    assert.equal(base.stats.weatherTextureCount,2);
    assert.equal(base.stats.shadowInstances,12);
    assert.equal(base.stats.shadowBatches,1);
    assert.equal(base.stats.addedColliders,0);
    assert.equal(base.stats.addedLights,0);
    assert.equal(base.stats.navigationRingsUnmodified,true);
    assert(base.navCount>=12,'original industrial route markers missing');
    assert.equal(base.navProtected,true);
    assert.equal(base.originalPhysical,true);
    assert.equal(base.allNewPBR.length,3);
    for(const material of base.allNewPBR){
      assert.equal(material.isInstanced,true);
      assert.equal(material.uv,material.pos);
      assert.equal(material.noCollision,true);
      assert.equal(material.current,true);
      assert.equal(material.instanceCount,4);
      assert.equal(material.map,'MAP4_GFX11C5_AUTHORED_STEEL_DIRT_RIVETS');
      assert.equal(material.bump,material.map);
      assert(material.roughness>=.70&&material.metalness>=.4);
      assert.equal(material.oldMap,null);
    }
    assert.equal(base.shadows.count,12);
    assert.equal(base.shadows.isInstanced,true);
    assert.equal(base.shadows.noCollision,true);
    assert(base.shadows.opacity>0&&base.shadows.opacity<.8);
    assert.equal(base.shadows.map,'MAP4_GFX11C5_SOFT_CONTACT_SHADOW_ATLAS');
    const fixedCamera=spec=>page.evaluate(p=>{
      state.paused=true;state.routeProgress=p.progress;
      state.laneX=p.laneX;state.laneY=p.laneY;state.map4Phase=p.phase;
      const frame=getRaceFrameAtDistance(p.progress);
      state.pos.copy(frame.center).addScaledVector(frame.right,p.laneX)
        .addScaledVector(frame.up,p.laneY);
      const q=new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(frame.right,frame.up,
          frame.tangent.clone().negate()));
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
      camera.position.copy(state.pos).add(
        new THREE.Vector3(0,5,17).applyQuaternion(q));
      camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
      h4Gfx10SetProfile('HIGH');
      updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
      renderer.render(scene,camera);
    },spec);
    const stateMetrics=()=>page.evaluate(()=>{
      renderer.render(scene,camera);
      return {
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        textures:renderer.info.memory.textures,
        geometry:renderer.info.memory.geometries,
        exposure:renderer.toneMappingExposure,
        ambient:ambientLight.intensity,
        key:nebulaLight1.intensity,
        sunOpacity:h4SunHalo.material.opacity,
        sunScale:h4SunHalo.scale.x,
        fog:scene.fog.color.getHex(),
        fogDensity:scene.fog.density,
        shadowVisible:h4Gfx11c5ContactShadows.visible,
        heroPBR:h4Gfx11c5HeroMaterials.every(x=>x.mesh.material===x.style),
        cameraMask:h4Gfx11bCameraMask.active,
        cameraMaterial:h4Gfx11bCameraMask.mesh.material.name
      };
    });
    const cases=[];
    for(const sample of [
      {id:'07-entry',progress:17200,laneX:0,laneY:260,phase:3},
      {id:'08-factory',progress:23800,laneX:0,laneY:350,phase:3},
      {id:'09-exit',progress:31600,laneX:0,laneY:450,phase:3}
    ]){
      await fixedCamera(sample);
      await page.evaluate(()=>{
        h4Gfx11c5SetLook(false);
        h4UpdateCinematicAtmosphere(8);
      });
      const old=await stateMetrics();
      const oldImage=await page.screenshot({path:path.join(__dirname,
        'map4-gfx11c5-'+sample.id+'-before.png')});
      await page.evaluate(()=>{
        h4Gfx11c5SetLook(true);
        h4UpdateCinematicAtmosphere(8);
      });
      const next=await stateMetrics();
      const image=await page.screenshot({path:path.join(__dirname,
        'map4-gfx11c5-'+sample.id+'-after.png')});
      console.log('NEXT11C5 FRAME',sample.id,JSON.stringify({
        oldCalls:old.calls,newCalls:next.calls,oldTris:old.triangles,
        newTris:next.triangles,oldTextures:old.textures,newTextures:next.textures,
        pixelChanged:!oldImage.equals(image)
      }));
      assert(!oldImage.equals(image),
        'weather + industrial lighting not visible: '+sample.id);
      assert.equal(old.heroPBR,false);
      assert.equal(old.shadowVisible,false);
      assert.equal(next.heroPBR,true);
      assert.equal(next.shadowVisible,true);
      assert(next.calls>=old.calls&&next.calls<=old.calls+1,
        'one contact-shadow batch maximum: '+sample.id);
      // InstancedMesh uses a 2-triangle quad 12 times, so the renderer
      // records 24 drawn triangles (not only 2), still just ONE draw call.
      const contactTriangles=base.shadows.triangles*base.shadows.count;
      assert.equal(next.triangles-old.triangles,contactTriangles,
        '12 shadow instances = 24 actual drawn triangles: '+sample.id);
      assert.equal(next.geometry,old.geometry);
      assert.equal(next.textures,old.textures);
      assert(next.exposure<old.exposure&&next.ambient<old.ambient,
        'muted industry exposure required');
      assert(next.sunOpacity<old.sunOpacity&&next.sunScale<old.sunScale,
        'sun halo remains too bright');
      assert(next.key>old.key,'directional light contrast should increase');
      if(sample.id==='09-exit'){
        assert.equal(next.cameraMask,true);
        assert.equal(next.cameraMaterial,'MAP4_GFX11B_CAMERA_NEAR_FADE');
      }
      cases.push({id:sample.id,before:old,after:next,screenshotChanged:true});
    }
    const quality=[];
    await fixedCamera({progress:23800,laneX:0,laneY:350,phase:3});
    for(const p of ['HIGH','BALANCED','LOW']){
      const metrics=await page.evaluate(preset=>{
        h4Gfx10SetProfile(preset);
        updatePlanetaryWorld();
        renderer.render(scene,camera);
        return {profile:h4Gfx10ProfileName,
          shadows:h4Gfx11c5ContactShadows.visible,
          heavyArt:h4Gfx11c4HeroRoot.visible,
          triangles:renderer.info.render.triangles,
          conservedColliders:[h4CanyonColliders.length,
            h4IndustrialColliders.length,
            planetaryBuildingColliders.length]};
      },p);
      assert.equal(metrics.profile,p);
      assert.equal(metrics.shadows,p!=='LOW');
      assert.equal(metrics.heavyArt,p!=='LOW');
      assert.deepEqual(metrics.conservedColliders,[6,36,200]);
      quality.push(metrics);
    }
    assert(quality[2].triangles<quality[1].triangles,
      'LOW should omit expensive authoring/shadow detail');
    // Atmosphere effects cannot leak into canyon, 60s arena or orbit.
    const phases=[];
    for(const sample of [
      {id:'canyon',progress:5900,laneY:160,phase:1},
      {id:'arena',progress:13200,laneY:180,phase:2},
      {id:'orbit',progress:47500,laneY:1100,phase:4}
    ]){
      await fixedCamera({...sample,laneX:0});
      await page.evaluate(()=>{
        h4Gfx11c5SetLook(false);
        h4UpdateCinematicAtmosphere(8);
      });
      const off=await stateMetrics();
      await page.evaluate(()=>{
        h4Gfx11c5SetLook(true);
        h4UpdateCinematicAtmosphere(8);
      });
      const on=await stateMetrics();
      for(const key of ['exposure','ambient','key','sunOpacity','sunScale','fog','fogDensity'])
        assert.equal(on[key],off[key],sample.id+' lighting leaked '+key);
      assert.equal(on.shadowVisible,false);
      phases.push({id:sample.id,off,on});
    }
    const final=await page.evaluate(()=>({
      collisions:[h4CanyonColliders.length,h4IndustrialColliders.length,
        planetaryBuildingColliders.length],
      originalsFixed:h4Gfx11c3PhysicalMaterials.every(item=>
        item.mesh.userData.h4Collider===item.collider&&
        item.mesh.geometry===item.originalGeometry),
      navUnchanged:h4IndustrialGroups.flatMap(st=>st.children.filter(x=>
        x.userData.w05Kind==='BEACON'||x.userData.w05Kind==='HIGH_MARKER'))
        .every(x=>!h4Gfx11c5DecorRings.some(y=>y.mesh===x)),
      artFamilies:h4Gfx11c4HeroRoot.children.length
    }));
    assert.equal(final.originalsFixed,true);
    assert.equal(final.navUnchanged,true);
    assert.deepEqual(final.collisions,[6,36,200]);
    assert.equal(final.artFamilies,3);
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('NEXT11C5 WEATHERED PBR LIGHTING PASS',JSON.stringify({
      baseline:base,cases,quality,phases,final,
      nativeGpuVerified:false,humanAestheticApproval:false
    }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
