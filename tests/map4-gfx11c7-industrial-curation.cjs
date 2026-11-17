/* NEXT-11C7 real Chromium/WebGL: nonphysical industrial art A/B
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
      typeof h4Gfx11c7BuildCuration==='function' &&
      typeof h4Gfx11c7SetLook==='function',null,{timeout:18000});
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
      const markers=h4IndustrialGroups.flatMap(st=>st.children.filter(m=>
        m.userData.w05Kind==='BEACON'||
        m.userData.w05Kind==='HIGH_MARKER'));
      const ground=planetaryWorldRegions[2].children.find(m=>
        m.isMesh&&m.userData.h4TerrainSceneryOnly);
      return {
        stats:{...h4Gfx11c7Stats},entries:h4Gfx11c7Styled.map(x=>({
          kind:x.kind,name:x.mesh.name,old:x.original.name,
          next:x.styled.name,physical:!!x.mesh.userData.h4Collider,
          sameGeometry:x.mesh.geometry===
            (x.mesh.userData.h4Vis02LegacyGeometry||x.mesh.geometry),
          uv:x.mesh.geometry.getAttribute('uv')?.count||0,
          marked:x.mesh.userData.w05Kind||null
        })),
        markerCount:markers.length,
        markerProtected:markers.every(mesh=>
          !h4Gfx11c7Styled.some(item=>item.mesh===mesh)),
        groundIsVisual:!!ground.userData.h4TerrainSceneryOnly,
        physicalIntact:h4Gfx11c3PhysicalMaterials.every(x=>
          x.mesh.geometry===x.originalGeometry&&
          x.mesh.userData.h4Collider===x.collider),
        originalColliders:[
          h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length
        ],
        gameplay:{rivals:racers.length,hunters:hunterTargets.length,
          duration:MAP4_RACE_RULES.realTimeLimit,
          arena:MAP4_PHASES.arenaSeconds,
          orbit:MAP4_PHASES.orbitAltitude}
      };
    });
    assert.deepEqual(baseline.originalColliders,[6,36,200]);
    assert.deepEqual(baseline.gameplay,{
      rivals:5,hunters:8,duration:300,arena:60,orbit:850
    });
    assert.equal(baseline.stats.oldDecksCurated,12);
    assert.equal(baseline.stats.decorativeBatchesCurated,2);
    assert.equal(baseline.stats.groundCurated,1);
    assert.equal(baseline.stats.reactorRingsCurated,2);
    assert.equal(baseline.stats.exitHeroInstancesCurated,2);
    for(const k of ['newColliders','newLights','newTextures'])
      assert.equal(baseline.stats[k],0);
    assert(baseline.markerCount>=12);
    assert(baseline.markerProtected);
    assert(baseline.physicalIntact&&baseline.groundIsVisual);
    assert.equal(baseline.entries.length,17);
    assert.equal(baseline.entries.filter(x=>
      x.marked==='BEACON'||x.marked==='HIGH_MARKER').length,0);
    for(const item of baseline.entries)
      assert(!item.physical&&item.uv>0,'11C7 must be UV and nonphysical');

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
        styleCount:h4Gfx11c7Styled.filter(x=>
          x.mesh.material===x.styled).length,
        ringScale:h4Gfx11c7Styled.filter(x=>
          x.kind==='REACTOR_TOROID').map(x=>x.mesh.scale.x),
        exitHeroScale:h4Gfx11c7HeroMatrices.map(e=>{
          const matrix=new THREE.Matrix4();
          e.mesh.getMatrixAt(e.index,matrix);
          return matrix.getMaxScaleOnAxis();
        }),
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        textures:renderer.info.memory.textures,
        geometries:renderer.info.memory.geometries,
        sunOpacity:h4SunHalo.material.opacity,
        sunScale:h4SunHalo.scale.x,
        fog:scene.fog.color.getHex(),
        fogDensity:scene.fog.density,
        exposure:renderer.toneMappingExposure,
        navProtected:h4IndustrialGroups.flatMap(st=>st.children.filter(x=>
          x.userData.w05Kind==='BEACON'||x.userData.w05Kind==='HIGH_MARKER'
        )).every(x=>!h4Gfx11c7Styled.some(item=>item.mesh===x)),
        colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length]
      };
    });
    const frames=[];
    for(const spec of [
      {id:'07-entry',progress:17200,laneY:260,phase:3},
      {id:'08-factory',progress:23800,laneY:350,phase:3},
      {id:'09-exit',progress:31600,laneY:450,phase:3}
    ]){
      await fixedCamera(spec);
      await page.evaluate(()=>{
        h4Gfx11c7SetLook(false);h4UpdateCinematicAtmosphere(8);
      });
      const before=await metrics();
      const oldImage=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c7-'+spec.id+'-before.png')});
      await page.evaluate(()=>{
        h4Gfx11c7SetLook(true);h4UpdateCinematicAtmosphere(8);
      });
      const after=await metrics();
      const newImage=await page.screenshot({path:path.join(
        __dirname,'map4-gfx11c7-'+spec.id+'-after.png')});
      assert(!oldImage.equals(newImage),'visual A/B unchanged '+spec.id);
      assert.equal(before.styleCount,0);
      assert.equal(after.styleCount,17);
      assert.equal(after.ringScale.length,2);
      assert(after.ringScale.every((v,i)=>v<before.ringScale[i]));
      assert.equal(after.exitHeroScale.length,2);
      assert(after.exitHeroScale.every((v,i)=>v<before.exitHeroScale[i]),
        'nonphysical C4 energy hero should shrink at 09');
      assert.equal(after.calls,before.calls,'no new draw calls '+spec.id);
      assert.equal(after.triangles,before.triangles);
      assert.equal(after.textures,before.textures);
      assert.equal(after.geometries,before.geometries);
      assert(after.sunOpacity<before.sunOpacity);
      assert(after.sunScale<before.sunScale);
      assert(after.fogDensity<before.fogDensity);
      assert(after.exposure<before.exposure);
      assert.deepEqual(after.colliders,[6,36,200]);
      assert(after.navProtected);
      frames.push({id:spec.id,calls:after.calls,
        triangles:after.triangles,screenshotChanged:true});
    }
    const quality=[];
    await fixedCamera({progress:23800,laneY:350,phase:3});
    for(const profile of ['HIGH','BALANCED','LOW']){
      const data=await page.evaluate(p=>{
        h4Gfx10SetProfile(p);updatePlanetaryWorld();
        renderer.render(scene,camera);
        return {profile:h4Gfx10ProfileName,curated:
          h4Gfx11c7Styled.filter(x=>x.mesh.material===x.styled).length,
          collisions:h4IndustrialColliders.length};
      },profile);
      assert.equal(data.profile,profile);
      assert.equal(data.curated,profile==='LOW'?0:17);
      assert.equal(data.collisions,36);
      quality.push(data);
    }
    for(const p of [
      {progress:5900,laneY:160,phase:1},
      {progress:13200,laneY:180,phase:2},
      {progress:47500,laneY:1100,phase:4}
    ]){
      await fixedCamera(p);
      await page.evaluate(()=>{
        h4Gfx11c7SetLook(false);h4UpdateCinematicAtmosphere(8);
      });
      const before=await metrics();
      await page.evaluate(()=>{
        h4Gfx11c7SetLook(true);h4UpdateCinematicAtmosphere(8);
      });
      const after=await metrics();
      assert.equal(before.styleCount,0);
      assert.equal(after.styleCount,0);
      for(const k of ['sunOpacity','sunScale','fog','fogDensity','exposure'])
        assert.equal(after[k],before[k],'leak to phase '+p.phase+' '+k);
    }
    assert.deepEqual(errors,[],errors.join('\n'));
    console.log('NEXT11C7 INDUSTRIAL CURATION PASS',JSON.stringify({
      baseline,frames,quality,nativeGpuFpsVerified:false,
      humanAestheticApproval:false
    }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
