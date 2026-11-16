/* Browser smoke tests for Map 1 and Map 4. Only repository code is tested. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {if (msg.type()==='error' && !/font|tailwind|network/i.test(msg.text())) errors.push(msg.text())});
  try {
    const three = fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**', route =>
      route.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',route=>
      route.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
      waitUntil:'domcontentloaded',timeout:25000
    });
    await page.waitForFunction(() => typeof selectMap === 'function' &&
      typeof state === 'object' && typeof THREE === 'object',null,{timeout:15000});
    assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'false');
    await page.locator('#map-choice-4').click();
    assert.equal(await page.locator('#start-btn').isEnabled(),true,'Map4 selectable');
    await page.locator('#start-btn').click();
    // Snapshot the actual launch formation before earlier probes give the
    // rival AI time to move away from its spawn lanes.
    const launchFormation=await page.evaluate(()=>racers.map(r=>
      Math.hypot(r.laneX,r.laneY)));
    assert.equal(launchFormation.length,5,'five rival pilots launched');
    try {
      await page.waitForFunction(() => state.running && state.raceTime>0.06,null,{timeout:25000});
    } catch(err) {
      console.error('Game loop diagnostics',await page.evaluate(()=>({
        map:state.activeMap,running:state.running,paused:state.paused,
        time:state.raceTime,zones:planetaryWorldRegions.length,
        terrainVisible:planetaryWorldGroup.visible,
        scriptsError:typeof updateGame,
        webgl:renderer.getContext().getParameter(renderer.getContext().VERSION)
      })),errors);
      throw err;
    }
    assert.equal(await page.locator('#start-screen').isVisible(),false);
    const alive = await page.evaluate(() => hunterTargets.filter(h=>h.alive).length);
    assert.equal(alive,8,'8 live hunters after starting Map4');
    const runtime = await page.evaluate(() => ({
      running:state.running,mode:state.activeMap,
      rivals:racers.length,projectiles:hunterRivalShots.length,
      raceTime:state.raceTime
    }));
    assert.equal(runtime.mode,'map4');
    assert.equal(runtime.running,true);
    assert.equal(runtime.rivals,5);
    assert(runtime.raceTime>0,'time advances');
    const planetary=await page.evaluate(()=>({
      zones:planetaryWorldRegions.length,
      worldVisible:planetaryWorldGroup.visible,
      corridorVisible:corridorGuideGroup.visible,
      starsVisible:starField.visible,
      width:getCorridorRadiusAt(12000),
      strategyCount:new Set(racers.map(r=>r.hunterStrategy)).size,
      zoneName:document.getElementById('planetary-zone-name').textContent
    }));
    assert.equal(planetary.zones,4,'four distinct planetary zones');
    // Map4 visual-quality proof: actual shader sky, physically lit procedural
    // textures, enhanced aircraft, facade meshes, 36 cloud volumes and draw range.
    const art=await page.evaluate(()=>{
      const materials=H4_MATERIALS;
      const detailedBuildings=planetaryWorldRegions[2].children.reduce((total,child)=>{
        let n=0;child.traverse(mesh=>{if(mesh.userData.h4Detailed)n++});
        return total+n;
      },0);
      return {
        textures:h4VisualQuality.textures,
        active:h4SkyDome.visible,
        skyShader:h4SkyDome.material.type,
        sun:h4SunHalo.visible,
        aircraft:racers.filter(r=>r.mesh.userData.h4DetailedCraft).length,
        cloudCount:h4Clouds.length,
        cloudsZones:h4CloudGroups.length,
        nearDetail:detailedBuildings,
        rockVertices:H4_MESHES.rock.attributes.position.count,
        rockType:H4_MESHES.rock.type,
        rockMap:!!materials.rock.map,
        steelMap:!!materials.steel.map,
        groundUV:!!planetaryWorldRegions[0].children[0].geometry.attributes.uv,
        groundMap:!!planetaryWorldRegions[0].children[0].material.map,
        playerEnhancements:h4GeoSwordArt.visible,
        tonemapMatches:renderer.toneMapping===THREE.ACESFilmicToneMapping,
        exposure:renderer.toneMappingExposure
      };
    });
    assert(art.textures>=7,'seven textures actually generated at runtime');
    assert.equal(art.active,true,'planet shader sky is visible');
    assert.equal(art.skyShader,'ShaderMaterial','custom gradient shader rendered');
    assert.equal(art.sun,true,'sun-halo sprite visible');
    assert.equal(art.aircraft,5,'all five rivals have enhanced 3D crafts');
    assert.equal(art.cloudCount,36,'36 layered atmospheric cloud forms');
    assert.equal(art.cloudsZones,4,'clouds span all regions');
    assert(art.nearDetail>=10,'industrial architectural panels built');
    assert(art.rockVertices>50,'rugged rock silhouettes use layered geometry');
    assert.equal(art.rockMap,true,'rock procedural textures');
    assert.equal(art.steelMap,true,'metal procedural textures');
    assert.equal(art.groundUV,true,'ground UV atlas tiling');
    assert.equal(art.groundMap,true,'ground uses texture');
    assert.equal(art.playerEnhancements,true,'map4 player craft art enabled');
    assert.equal(art.tonemapMatches,true,'planet-specific filmic tonemapping');
    assert(art.exposure>1.1,'planet uses dedicated tonal exposure');
    // VQ02: exactly twelve distinct non-generic landmark signatures, new
    // sculpted compound hull geometry, coherent six-station factory networks.
    const signatures=await page.evaluate(()=>{
      const shapes=h4SignatureStats;
      const sigGroup=h4WorldLandmarks.find(x=>x.kind==='crash').group;
      let signatureCount=0;
      sigGroup.traverse(g=>{if(g.userData.signature)signatureCount++});
      const w05=h4IndustrialArtStats;
      const refinery=h4IndustrialGroups[0];
      let refineryDetail=0;
      refinery.traverse(g=>{if(g.userData.vq02IndustrialDetail)refineryDetail++});
      const idx=planetaryWorldRegions[0].children[0].geometry.index;
      return {
        sites:shapes.sites,
        byRegion:shapes.byRegion.slice(),
        uniqueTypes:[...new Set(shapes.types)].length,
        parts:shapes.parts,
        crashSignature:signatureCount,
        customHull:H4_HERO_GEOMETRY.carvedHull.type,
        hullVerts:H4_HERO_GEOMETRY.carvedHull.attributes.position.count,
        refineryDetail,
        industrialStations:w05.stations,
        industrialParts:w05.parts,
        colliderCount:h4IndustrialColliders.length,
        builtWithH1Inactive:!corridorGuideGroup.visible,
        groundIndices:idx?idx.count:0
      };
    });
    assert.equal(signatures.sites,12,'all twelve landmarks have bespoke forms');
    assert.deepEqual(signatures.byRegion,[3,3,3,3],
      'three unique signatures per region');
    assert.equal(signatures.uniqueTypes,12,'non-repeated landmark silhouettes');
    assert(signatures.parts>=85&&signatures.parts<160,
      'bounded compound hero meshes rather than thousands of primitives');
    assert.equal(signatures.crashSignature,1,'crashed cruiser has custom signature');
    assert.equal(signatures.customHull,'ExtrudeGeometry','wedge hull truly modeled');
    assert(signatures.hullVerts>40,'angular custom 3D hull has real faces');
    assert.equal(signatures.industrialStations,6,'six detailed factory nodes');
    assert(signatures.industrialParts>=70&&signatures.industrialParts<135,
      'pipe/gantry detailing bounded');
    assert(signatures.refineryDetail>=10,'refinery has connected structures');
    assert.equal(signatures.colliderCount,36,'gameplay solids kept intact');
    assert.equal(signatures.builtWithH1Inactive,true,'art only in planetary mode');
    // VQ03: tileable normal + roughness surfaces and sculpted wing silhouettes.
    const vq03=await page.evaluate(()=>{
      const rock=H4_MATERIALS.rock;
      const steel=H4_MATERIALS.steel;
      const ground=planetaryWorldRegions[0].children[0].material;
      return {
        microTextures:h4MaterialMicroStats.textures,
        microKinds:[...h4MaterialMicroStats.surfaceKinds],
        roughRock:h4MaterialMicroStats.meanRoughness.rock,
        roughMetal:h4MaterialMicroStats.meanRoughness.metal,
        normalRock:!!rock.normalMap,
        roughnessRock:!!rock.roughnessMap,
        normalSteel:!!steel.normalMap,
        roughnessSteel:!!steel.roughnessMap,
        terrainNormal:!!ground.normalMap,
        terrainRoughness:!!ground.roughnessMap,
        encoding:rock.normalMap.encoding,
        normalScale:rock.normalScale.x,
        wings:h4CraftArtStats.sweptWings,
        fins:h4CraftArtStats.ventralFins,
        playerWing:h4GeoSwordArt.children.filter(c=>c.name==='VQ03_SCULPTED_WING').length,
        enemyWings:racers.every(r=>r.mesh.children.filter(c=>c.name==='VQ03_SCULPTED_WING').length===2),
        wingType:racers[0].mesh.children.find(c=>c.name==='VQ03_SCULPTED_WING')?.geometry.type,
        smokeAtlas:h4SmokeAtlas.isTexture
      };
    });
    assert.equal(vq03.microTextures,4,'two normal and two roughness texture maps');
    assert.deepEqual(vq03.microKinds,['rock','metal']);
    assert(vq03.roughRock>.65&&vq03.roughRock<.98,'stone actually rough');
    assert(vq03.roughMetal>.35&&vq03.roughMetal<.9,'metal surface variance');
    assert(vq03.normalRock&&vq03.roughnessRock,'rock normal+roughness enabled');
    assert(vq03.normalSteel&&vq03.roughnessSteel,'steel normal+roughness enabled');
    assert(vq03.terrainNormal&&vq03.terrainRoughness,'terrain relief maps enabled');
    assert(vq03.normalScale>.25,'perceived rock bump surface configured');
    assert(vq03.wings>=28&&vq03.fins>=28,'player, racers and hunters gain wing details');
    assert.equal(vq03.playerWing,2,'player craft has two sculpted wings');
    assert.equal(vq03.enemyWings,true,'rivals use 3D sculpted wings');
    assert.equal(vq03.wingType,'ExtrudeGeometry','wings have genuine 3D custom shape');
    assert.equal(vq03.smokeAtlas,true,'self-contained smoke texture');

    // GFX05: ten original shared GPU geometries and five distinct pilot
    // palettes replace simplistic cone/box ships without changing hit spheres.
    const gfx05=await page.evaluate(()=>{
      const player=h4GeoSwordArt.userData.h4Gfx05Craft;
      const rivalModels=racers.map(r=>r.mesh.userData.h4Gfx05Craft);
      const hunterModels=hunterTargets.map(h=>h.mesh.userData.h4Gfx05Craft);
      const count=(root,prefix)=>root.children.filter(c=>
        c.name.startsWith(prefix)).length;
      const base=geoSwordMesh.children.filter(x=>x!==h4GeoSwordArt);
      const before=state.shield;
      state.shield=31;
      const hunter=hunterTargets[0];
      const hp=hunter.hp;
      hunter.hp=hunter.maxHp*.25;
      h4Gfx05AnimateCraft(.016,11.9);
      const damagePlayer=player.userData.h4Gfx05Damage.visible;
      const damageHunter=hunter.mesh.userData.h4Gfx05Craft.userData.h4Gfx05Damage.visible;
      state.shield=before;hunter.hp=hp;
      h4Gfx05AnimateCraft(.016,12.15);
      return {
        stats:{...h4Gfx05Stats},
        player:!!player,playerModelName:player?.name,
        playerWings:count(player,'GFX05_SWEPT_WING'),
        playerIdentityPanels:count(player,'GFX05_IDENTITY_WING_PANEL'),
        playerHull:count(player,'GFX05_TAPERED_3D_HULL'),
        playerEngines:count(player,'GFX05_LIVE_THRUSTER'),
        playerVisible:h4GeoSwordArt.visible,
        baseHidden:base.every(x=>!x.visible),
        rivals:rivalModels.length,
        rivalDifferentPaint:new Set(rivalModels.map(x=>
          x.userData.h4Gfx05Palette)).size,
        rivalOldHidden:racers.every(r=>r.mesh.children.filter(x=>
          x!==r.mesh.userData.h4Gfx05Craft && x!==r.speedTrailGroup)
          .every(x=>!x.visible)),
        hunters:hunterModels.length,
        allHuntersArt:hunterModels.every(x=>x&&x.userData.h4Gfx05Type),
        visualOnly:player.userData.h4Gfx05VisualOnly &&
          [...rivalModels,...hunterModels].every(x=>
            x.userData.h4Gfx05VisualOnly),
        engineAnimated:player.userData.h4Gfx05Engines.every(x=>x.scale.x>0),
        damagePlayer,damageHunter,
        afterDamage:!player.userData.h4Gfx05Damage.visible,
        commonGeometry:hunterModels[0].children.find(x=>
          x.name==='GFX05_TAPERED_3D_HULL').geometry===
          rivalModels[0].children.find(x=>
            x.name==='GFX05_TAPERED_3D_HULL').geometry,
        hullType:H4_GFX05_GEO.hull.type,
        wingType:H4_GFX05_GEO.wingRight.type,
        registered:H4_GFX05_GEO.hull.uuid
      };
    });
    assert.equal(gfx05.stats.player,1,'one rebuilt GeoSword player craft');
    assert.equal(gfx05.stats.racers,5,'five new rival pilot models');
    assert.equal(gfx05.stats.hunters,8,'eight updated shared hunter models');
    assert.equal(gfx05.player,true);
    assert.equal(gfx05.playerHull,1,'one physically sculpted player hull');
    assert.equal(gfx05.playerWings,2,'player gets two swept wing surfaces');
    assert.equal(gfx05.playerIdentityPanels,2,
      'both wings expose large, actually painted 3D identity panels');
    assert.equal(gfx05.playerEngines,2,'player gets two live exhaust nozzles');
    assert(gfx05.baseHidden && gfx05.playerVisible,
      'Map4 displays only its new player silhouette');
    assert.equal(gfx05.rivals,5);
    assert.equal(gfx05.rivalDifferentPaint,5,'five pilots have distinct liveries');
    assert.equal(gfx05.rivalOldHidden,true,'old rival box wings hidden');
    assert.equal(gfx05.hunters,8);
    assert.equal(gfx05.allHuntersArt,true);
    assert.equal(gfx05.visualOnly,true,'aircraft decoration cannot alter hit spheres');
    assert(gfx05.engineAnimated,'GFX05 nozzles pulse without new allocations');
    assert(gfx05.damagePlayer && gfx05.damageHunter,
      'damage markers reflect current shield and hull');
    assert(gfx05.afterDamage,'player model damage marker clears on repair');
    assert.equal(gfx05.commonGeometry,true,'different craft share main GPU hull');
    assert.equal(gfx05.hullType,'BufferGeometry');
    assert.equal(gfx05.wingType,'ExtrudeGeometry');
    assert(gfx05.stats.sharedGeometries<=14,'strict once-built GPU craft kit');
    assert.equal(gfx05.stats.enginePairs,14,'each of 14 craft models has two engines');

    // GFX05B: real paint/normal/roughness atlases shared by all 14
    // visual-only aircraft. Texture pixels genuinely differ across the atlas.
    const craftSurfaces=await page.evaluate(()=>{
      const gfx=h4Gfx05bMaps,states={...h4Gfx05bStats};
      const ctx=gfx.albedo.image.getContext('2d');
      const pixels=ctx.getImageData(0,0,256,256).data;
      const values=new Set();
      for(let i=0;i<pixels.length;i+=4*257)values.add(pixels[i]);
      const models=[h4GeoSwordArt.userData.h4Gfx05Craft,
        ...racers.map(x=>x.mesh.userData.h4Gfx05Craft),
        ...hunterTargets.map(x=>x.mesh.userData.h4Gfx05Craft)];
      const geomMat=(root)=>root.children.find(x=>
        x.name==='GFX05_TAPERED_3D_HULL')?.material;
      const wingMat=(root)=>root.children.find(x=>
        x.name.startsWith('GFX05_SWEPT_WING_'))?.material;
      const sameMaterials=models.every(root=>
        geomMat(root)?.map===gfx.albedo &&
        geomMat(root)?.normalMap===gfx.normal &&
        geomMat(root)?.roughnessMap===gfx.roughness &&
        wingMat(root)?.map===gfx.albedo &&
        wingMat(root)?.normalMap===gfx.normal);
      const details=models.map(root=>({
        armor:root.children.filter(x=>x.name==='GFX05_HEEL_ARMOR_STRIP').length,
        heat:root.children.filter(x=>x.name==='GFX05_THERMAL_ENGINE_SHROUD').length,
        allVisual:root.children.every(x=>x.userData.visualOnly)
      }));
      return {
        ...states,
        sameMaterials,
        models:models.length,
        details,
        pixelVariance:values.size,
        namedMaps:[gfx.albedo.name,gfx.normal.name,gfx.roughness.name],
        normalLinear:gfx.normal.encoding===THREE.LinearEncoding,
        roughnessLinear:gfx.roughness.encoding===THREE.LinearEncoding,
        albedoSRGB:gfx.albedo.encoding===THREE.sRGBEncoding,
        colorUniqueLiveries:new Set(racers.map(x=>
          geomMat(x.mesh.userData.h4Gfx05Craft).color.getHex())).size,
        atlasTexturesUnique:new Set([
          gfx.albedo.uuid,gfx.normal.uuid,gfx.roughness.uuid]).size,
        extraGPUBufferCount:h4Gfx05SharedGeometries.size
      };
    });
    assert.equal(craftSurfaces.atlasSets,1,'all aircraft reuse one generated atlas set');
    assert.equal(craftSurfaces.textures,3,'neutral paint, relief and wear maps');
    assert.equal(craftSurfaces.palettes,8,'eight intentionally separate craft liveries');
    assert.equal(craftSurfaces.models,14,'player five rivals eight hunters');
    assert.equal(craftSurfaces.details.length,14);
    assert(craftSurfaces.details.every(x=>x.armor===2&&x.heat===2&&x.allVisual),
      'two readable armor panels and two shrouds per craft, all visual');
    assert.equal(craftSurfaces.details.length*4,56,
      'GFX05B adds exactly 56 bounded silhouette details');
    assert.equal(craftSurfaces.sameMaterials,true,
      'each hull/wing uses shared texture objects');
    assert(craftSurfaces.pixelVariance>25,
      'the paint atlas contains genuine nondestructive wear variation');
    assert(craftSurfaces.normalLinear && craftSurfaces.roughnessLinear,
      'normal/roughness maps are linear data');
    assert(craftSurfaces.albedoSRGB,'albedo interpreted as sRGB');
    assert.equal(craftSurfaces.colorUniqueLiveries,5,
      'individual racer colours remain distinct');
    assert.equal(craftSurfaces.atlasTexturesUnique,3);
    assert(craftSurfaces.extraGPUBufferCount<=14,
      'surface quality does not create a unique VBO for each craft');


    // GFX05C: one InstancedMesh renders up to 28 dynamic twin-nozzle
    // heat plumes. Replaces Map4's square pilot streaks, preserves Map1.
    const exhaust=await page.evaluate(()=>{
      const mesh=h4Gfx05cMesh;
      const before=mesh.instanceMatrix.array;
      h4Gfx05AnimateCraft(.016,12.40);
      const n=mesh.count;
      const first=new THREE.Matrix4();
      mesh.getMatrixAt(0,first);
      const baseline=first.elements.slice();
      const boostBefore=state.currentSpeed;
      state.currentSpeed=state.baseSpeed*1.40;
      h4Gfx05AnimateCraft(.016,14.2);
      mesh.getMatrixAt(0,first);
      const after=first.elements.slice();
      state.currentSpeed=boostBefore;
      h4Gfx05AnimateCraft(.016,14.8);
      const atlas=h4Gfx05cTex.image.getContext('2d')
        .getImageData(0,0,128,128).data;
      const alpha=new Set();
      for(let i=3;i<atlas.length;i+=4*131)alpha.add(atlas[i]);
      return {
        name:mesh.name,isInstancedMesh:mesh.isInstancedMesh===true,
        capacity:mesh.instanceMatrix.count,instances:n,
        active:h4Gfx05cStats.activeInstances,
        drawCalls:h4Gfx05cStats.drawCalls,
        transparent:mesh.material.transparent,
        additive:mesh.material.blending===THREE.AdditiveBlending,
        colorChannel:!!mesh.instanceColor,
        atlasName:h4Gfx05cTex.name,textureSets:h4Gfx05cStats.textureCount,
        alphaVariance:alpha.size,
        instanceBufferBytes:mesh.instanceMatrix.array.byteLength,
        geometryId:mesh.geometry.uuid,
        bufferUnchanged:mesh.instanceMatrix.array===before,
        boostChange:Math.abs(after[10]-baseline[10])>.01||
          Math.abs(after[14]-baseline[14])>.01,
        burstInstances:h4Gfx05cStats.burstInstances,
        resetCount:h4Gfx05cStats.resets,
        squarePilots:racers.filter(r=>r.speedTrailGroup.visible).length,
        gpuGeometryShared:h4Gfx05SharedGeometries.has(h4Gfx05cGeometry),
        visualOnly:mesh.userData.visualOnly&&!mesh.userData.h4Collider
      };
    });
    assert.equal(exhaust.name,'MAP4_GFX05C_INSTANCED_ENGINE_HEAT');
    assert.equal(exhaust.isInstancedMesh,true,'true GPU-instanced exhaust mesh');
    assert.equal(exhaust.capacity,28,'fixed two-nozzle budget for fourteen craft');
    assert(exhaust.instances>=18&&exhaust.instances<=28,
      'exhaust is rendered for living player/racers/hunters');
    assert.equal(exhaust.active,exhaust.instances);
    assert.equal(exhaust.drawCalls,1,'one GPU draw call for all exhausts');
    assert(exhaust.transparent&&exhaust.additive,'non-opaque heat plume blend');
    assert(exhaust.colorChannel,'pilot-specific instance colours');
    assert.equal(exhaust.textureSets,1,'one exhaust canvas/texture for all craft');
    assert.equal(exhaust.atlasName,'MAP4_GFX05C_TAPERED_HEAT_ATLAS');
    assert(exhaust.alphaVariance>=6,'exhaust has real alpha taper');
    assert.equal(exhaust.bufferUnchanged,true,'no dynamic GPU geometry replacement');
    assert.equal(exhaust.boostChange,true,'boost meaningfully changes exhaust length');
    assert.equal(exhaust.squarePilots,0,
      'Map4 does not show legacy box-shaped racer engine streaks');
    assert(exhaust.gpuGeometryShared&&exhaust.visualOnly,
      'heat geometry is reusable non-physical craft art');

    const blast=await page.evaluate(()=>{
      const before={...h4ExplosionStats};
      createExplosion(state.pos.clone().add(new THREE.Vector3(0,10,-100)),
        0xff9654,22,1.2);
      return {smoke:h4ExplosionStats.smokeSprites-before.smokeSprites,
        rings:h4ExplosionStats.shockRings-before.shockRings,
        emissions:h4ExplosionStats.emissions-before.emissions,
        activeSmoke:particles.filter(p=>p.vq03Smoke).length,
        activeRings:particles.filter(p=>p.vq03Shock).length};
    });
    assert.equal(blast.smoke,6,'six layered smoke sprites per qualifying explosion');
    assert.equal(blast.rings,1,'visible shockwave ring');
    assert.equal(blast.emissions,1,'real explosion event');
    assert(blast.activeSmoke>=6&&blast.activeRings>=1,'VFX participates in frame particles');


    // VQ04: ensure the actual game world has four bounded atmospheric fields,
    // persistent contact shadows and smooth atmosphere/orbit palette states.
    const vq04=await page.evaluate(()=>{
      const before={progress:state.routeProgress,laneY:state.laneY};
      const step=(progress,laneY)=>{
        state.routeProgress=progress;state.laneY=laneY;
        h4UpdateSkyVisuals();
        h4UpdateCinematicAtmosphere(9.7);
        return {
          fog:scene.fog.density,zenith:h4AtmosphereUniforms.zenith.value.getHex(),
          orbit:h4AtmosphereUniforms.orbitFade.value,
          clouds:h4AtmosphereUniforms.cloudiness.value,
          haze:h4AtmosphereUniforms.horizonDust.value
        };
      };
      const valley=step(2400,60);
      const arena=step(12700,75);
      const industrial=step(23000,240);
      const orbit=step(45700,1650);
      state.routeProgress=before.progress;state.laneY=before.laneY;
      h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(9.8);
      const fieldPoints=h4AtmosphericFields.map(f=>f.geometry.attributes.position.count);
      const shadowObjects=h4WorldLandmarks.reduce((n,point)=>{
        let k=0;point.group.traverse(m=>{if(m.name==='MAP4_VQ04_CONTACT_SHADOW')k++});
        return n+k;
      },0);
      return {valley,arena,industrial,orbit,fields:h4AtmosphericFields.length,
        fieldPoints,particleTotal:h4VQ04Stats.particleCount,
        shadows:h4VQ04Stats.contactShadows,shadowObjects,
        texture:h4DustTex.isTexture,starUniform:h4AtmosphereUniforms.orbitFade.value,
        revisions:h4VQ04Stats.atmosphereUpdates,
        map1Exclusion:planetaryWorldGroup.visible && !corridorGuideGroup.visible};
    });
    assert.equal(vq04.fields,4,'one atmospheric particle draw-call per phase');
    assert.deepEqual(vq04.fieldPoints,[460,360,430,290],
      'four reproducible differentiated atmospheric populations');
    assert.equal(vq04.particleTotal,1540,'particles allocated only once');
    assert.equal(vq04.shadows,12,'twelve baked hero-site contact shadows');
    assert.equal(vq04.shadowObjects,12,'contact decals physically placed in scene');
    assert.equal(vq04.texture,true,'embedded soft alpha dust atlas');
    assert(vq04.valley.fog>vq04.industrial.fog,
      'canyon distance haze higher than clean industrial palette');
    assert(vq04.valley.zenith!==vq04.arena.zenith &&
      vq04.arena.zenith!==vq04.industrial.zenith,
      'distinct cinematic sky palettes for three ground phases');
    assert(vq04.orbit.orbit>.96,'orbital altitude actually reveals outer space');
    assert(vq04.orbit.fog<vq04.industrial.fog*.3,
      'upper atmosphere fog fades instead of remaining opaque');
    assert(vq04.orbit.haze<vq04.valley.haze*.15,
      'horizon dust extinguishes naturally in orbit');
    assert(vq04.revisions>4,'runtime cinematic sky updated during transitions');
    assert.equal(vq04.map1Exclusion,true,'planetary VQ04 art stays map4-scoped');

    // GFX-03 canyon silhouettes: three true scene-space sculptural sites,
    // shared geometry, a carved portal with a hole, and NO new hitboxes.
    const heroArt=await page.evaluate(()=>{
      const sculpt=h4CanyonHeroStats;
      const canyonPoints=h4WorldLandmarks.filter(p=>p.zone===0);
      const info=canyonPoints.map(p=>{
        const site=p.group.children.find(c=>c.userData.h4Gfx03Hero);
        return {
          kind:p.kind,group:site?.name,
          parts:site?.children.filter(c=>c.userData.h4Gfx03Part===p.kind).length,
          worldParts:site?.children.every(c=>c.userData.visualOnly),
          materials:site?[...new Set(site.children.map(c=>c.material.uuid))].length:0
        };
      });
      const portal=H4_GFX03_GEO.naturalPortal;
      const opening=portal.parameters.shapes.holes.length;
      return {sites:sculpt.sites,parts:sculpt.parts,
        counts:Object.values(sculpt.byKind),
        archGeometry:sculpt.archGeometry,rockInstances:sculpt.rockInstances,
        visualOnly:info.every(x=>x.worldParts),
        info,opening,meshType:portal.type,
        portalVerts:portal.attributes.position.count,
        cowboyPhysics:h4CanyonColliders.length,
        industryPhysics:h4IndustrialColliders.length
      };
    });
    assert.equal(heroArt.sites,3,'three distinctive canyon landmark sculptures');
    assert.deepEqual(heroArt.counts,[1,1,1],'each site built exactly once');
    assert(heroArt.parts>=40&&heroArt.parts<=50,'bounded and rich sculpt components');
    assert(heroArt.rockInstances>=14,'uses detailed geology rather than repeated boxes');
    assert.equal(heroArt.archGeometry,1,'one original portal hero geometry');
    assert.equal(heroArt.opening,1,'rock arch uses a real cut-through opening');
    assert.equal(heroArt.meshType,'ExtrudeGeometry','arched silhouette is 3D');
    assert(heroArt.portalVerts>90,'portal has real custom facade mesh');
    assert(heroArt.info.every(x=>x.parts>=12 && x.materials>=3),
      'three layered canyon heroes are materially differentiated');
    assert.equal(heroArt.visualOnly,true,'all detail remains decorative');
    assert.equal(heroArt.cowboyPhysics,6,'six genuine canyon collision solids intact');
    assert.equal(heroArt.industryPhysics,36,'36 real industry collision solids intact');

    const geology=await page.evaluate(()=>{
      const near=h4SceneryGroups[0].near;
      const far=h4SceneryGroups[0].far;
      const sample=near.children[0];
      return {
        atlas:h4CanyonSurfaceStats.atlasCount,
        replaced:h4CanyonSurfaceStats.replacedSilhouettes,
        atlasName:h4NaturalRockMap.name,
        sculptMaterial:h4Gfx02RockMaterial.map===h4NaturalRockMap,
        nearUses:near.children.filter(m=>m.material===h4Gfx02RockMaterial).length,
        farUses:far.children.filter(m=>m.material===h4Gfx02RockMaterial).length,
        uv:sample.geometry.attributes.uv.count>0,
        normalStrength:h4Gfx02RockMaterial.normalScale.x
      };
    });
    assert.equal(geology.atlas,1,'one deterministic shared natural rock atlas');
    assert.equal(geology.replaced,28,'generic canyon corridor rocks replaced');
    assert.equal(geology.atlasName,'MAP4_GFX03_NATURAL_SEDIMENT_ALBEDO');
    assert.equal(geology.sculptMaterial,true,'sculpted rock uses low-noise albedo');
    assert.equal(geology.nearUses,38,'30 near rocks + 8 launch panorama rocks use sculpted variants');
    assert.equal(geology.farUses,28,'distant skyline rock variants replace cones');
    assert.equal(geology.uv,true,'custom rock geometry includes actual UVs');
    assert(geology.normalStrength<.3,'normal strength bounded to avoid zebra ridges');


    // W03 physical and strategic paths before phase-two arena.
    const canyon=await page.evaluate(()=>{
      const fast={laneX:H4_CANYON.fastCenter};
      const hunt={laneX:H4_CANYON.huntCenter};
      const main={laneX:0};
      const p=3700,dt=0.1,speed=2200;
      const firstRock=h4CanyonColliders[0];
      const segmentStart={routeProgress:firstRock.progress-450,
        laneX:firstRock.side,laneY:firstRock.altitude};
      const segmentEnd={routeProgress:firstRock.progress+450,
        laneX:firstRock.side,laneY:firstRock.altitude};
      const safeStart={...segmentStart,laneX:0,laneY:0};
      const safeEnd={...segmentEnd,laneX:0,laneY:0};
      const initial={progress:state.routeProgress,x:state.laneX,y:state.laneY};
      // The *same* visible rock volume must damage the player's shield.
      state.routeProgress=firstRock.progress+60;
      state.laneX=firstRock.side;state.laneY=firstRock.altitude;
      state.shield=100;state.powerShieldTimer=0;state.barrelRollTimer=0;
      state.h4CanyonCooldown=0;state.map4Phase=1;
      h4UpdateCanyonContacts(segmentStart,racers.map(r=>({
        routeProgress:r.routeProgress,laneX:r.laneX,laneY:r.laneY
      })));
      const afterImpact={shield:state.shield,speed:state.currentSpeed};
      state.routeProgress=initial.progress;state.laneX=initial.x;
      state.laneY=initial.y;state.shield=100;state.h4CanyonCooldown=0;
      return {
        routeFast:h4CanyonRoute(p,fast.laneX),
        routeHunt:h4CanyonRoute(p,hunt.laneX),
        routeMain:h4CanyonRoute(p,main.laneX),
        advanceFast:map4Advance(p,speed,dt,fast)-p,
        advanceMain:map4Advance(p,speed,dt,main)-p,
        advanceHunt:map4Advance(p,speed,dt,hunt)-p,
        rockCount:h4CanyonColliders.length,
        visualGroups:h4CanyonVisualGroups.length,
        visibleRockLink:firstRock.mesh.userData.h4CanyonCollider===firstRock,
        hit:h4SegmentBoxHit(segmentStart,segmentEnd,firstRock),
        missesCenter:!h4SegmentBoxHit(safeStart,safeEnd,firstRock),
        afterImpact,
        earlyHuntersEast:hunterTargets.filter(h=>h.baseLaneX>850).length,
        routeHud:document.getElementById('planetary-route-name')!==null
      };
    });
    assert.equal(canyon.routeFast,'FAST');
    assert.equal(canyon.routeHunt,'HUNT');
    assert.equal(canyon.routeMain,'MAIN');
    assert(canyon.advanceFast>canyon.advanceMain*1.17 &&
      canyon.advanceFast<canyon.advanceMain*1.19,'real 18% gorge speed gain');
    assert.equal(canyon.advanceHunt,canyon.advanceMain,
      'hunter flank does not receive unearned speed gain');
    assert.equal(canyon.rockCount,6,'three real two-pillar rock gates');
    assert.equal(canyon.visualGroups,1,'single persistent W03 canyon zone');
    assert.equal(canyon.visibleRockLink,true,'collision tied to visible rock');
    assert.equal(canyon.hit,true,'swept rock collision catches high speed');
    assert.equal(canyon.missesCenter,true,'safe central lane is clear');
    assert(canyon.afterImpact.shield<100,'canyon rock collision damages shield');
    assert(canyon.earlyHuntersEast>=4,'optional east route has more hunter encounters');
    assert.equal(canyon.routeHud,true,'flight lane HUD created');
    const openSpace=await page.evaluate(()=>{
      const probe=[0,12500,13500,22000,45000].map(progress=>({
        progress,radius:map4AirspaceRadius(progress),
        profile:map4BoundaryProfile(progress)
      }));
      const opening=map4BoundaryProfile(0);
      const warn=evaluateBoundaryFriction(opening.safeRadius+25,0,18,0,0);
      const caution=evaluateBoundaryFriction(opening.softRadius+75,0,18,0,0);
      const pressure=evaluateBoundaryFriction(opening.outsideRadius+40,0,18,0,0);
      const limiter={routeProgress:0,laneX:10000,laneY:0,vx:150,vy:0};
      clampToSoftBoundary(limiter);
      return {
        probe,warn,caution,pressure,limiter,
        scenery:h4WideScenery,
        terrain:{
          positions:planetaryWorldRegions[0].children[0].geometry.attributes.position.count,
          colors:!!planetaryWorldRegions[0].children[0].geometry.attributes.color,
          sceneryOnly:planetaryWorldRegions[0].children[0].userData.h4TerrainSceneryOnly
        },
        cameraFar:camera.far,
        light:nebulaLight1.color.getHex(),
        firstPositions:racers.map(r=>Math.hypot(r.laneX,r.laneY))
      };
    });
    assert.equal(Math.round(openSpace.probe[0].radius),3700,
      'wide starting airspace');
    assert(openSpace.probe[2].radius>3900,
      'larger 60 second hunter arena');
    assert(openSpace.probe[3].radius>=3300,'industrial area stays broad');
    assert(openSpace.probe[4].radius>=3400,'orbital ascent stays broad');
    assert(openSpace.probe[0].profile.safeRadius>2900,
      'no-penalty opening radius over 2.9k');
    assert.equal(openSpace.warn.level,1,'first ring is warning only');
    assert.equal(openSpace.warn.factor,1,'warning never slows');
    assert.equal(openSpace.warn.damagePerSecond,0,'warning never damages');
    assert(openSpace.caution.level>=2&&openSpace.caution.factor<1,
      'outer zone applies gradual slowdown');
    assert.equal(openSpace.pressure.level,4,'true pressure at far boundary');
    assert(openSpace.pressure.damagePerSecond>0,'far boundary damages');
    assert(openSpace.limiter.laneX<4400&&openSpace.limiter.laneX>4200,
      'hard clamp only at distant outer edge');
    assert.deepEqual(openSpace.scenery.byRegion,[66,44,58,58],
      'layered scenery across four zones');
    assert.equal(openSpace.scenery.total,226,'bounded one-time scenery allocation');
    assert(openSpace.terrain.positions>7000,'planet ground subdivided for relief');
    assert.equal(openSpace.terrain.colors,true,'planet ground has vertex palette');
    assert.equal(openSpace.terrain.sceneryOnly,true,'no invented terrain hitboxes');
    // GFX-02: visibly denser canyon mesh and custom large-scale geology.
    // All added rocks remain outside the playable radius and visual-only.
    const gfx02=await page.evaluate(()=>{
      const group=planetaryWorldRegions[0].children.find(g=>
        g.name==='MAP4_GFX02_LONG_RANGE_ERODED_CLIFFS');
      return {
        canyonVertices:h4TerrainArtStats.canyonVertices,
        cliffs:h4TerrainArtStats.cliffs,
        variantCount:h4TerrainArtStats.variants,
        builtRocks:group?.children.length,
        outsideEnvelope:group?.children.every(m=>
          m.userData.visualOnly &&
          m.scale.y>800 &&
          m.geometry.attributes.position.count>500 &&
          Math.abs(m.userData.h4CliffSide)-m.scale.x*1.20>
            map4BoundaryProfile(m.userData.h4CliffProgress).maxRadius),
        distinctGeometries:group?new Set(group.children.map(m=>m.geometry.uuid)).size:0,
        terrainName:planetaryWorldRegions[0].children[0].name,
        terrainVisualOnly:planetaryWorldRegions[0].children[0].userData.h4TerrainSceneryOnly
      };
    });
    assert.equal(gfx02.canyonVertices,160*40*6,
      'canyon ground uses dedicated high-resolution mesh grid');
    assert.equal(gfx02.cliffs,28,'28 custom long-range canyon forms');
    assert.equal(gfx02.builtRocks,28,'visual cliff meshes occupy the world');
    assert.equal(gfx02.distinctGeometries,8,'eight original cliff geometries');
    assert.equal(gfx02.outsideEnvelope,true,'cliffs are sculpted and beyond every flight envelope');
    assert.equal(gfx02.terrainVisualOnly,true,'new terrain never invents collision walls');
    assert.equal(gfx02.terrainName,'MAP4_GFX02_SCULPTED_CANYON_GROUND',
      'sculpted terrain replaces canyon-only old surface');
    assert(openSpace.cameraFar>10000,'planet draw distance increased');
    assert(launchFormation.every(x=>x>150),
      'five rivals launch in wide formation (measured before AI movement)');
    assert(openSpace.firstPositions.every(Number.isFinite),
      'later AI steering keeps finite lane coordinates');
    assert.equal(openSpace.light,0xffd8b8,'VQ04 canyon daylight palette active');
    const content=await page.evaluate(()=>{
      const initialProgress=state.routeProgress;
      const byRegion=h4WorldContentStats.byRegion.slice();
      const nameSet=new Set(h4WorldLandmarks.map(x=>x.name));
      const zoneProbe=[6000,13200,23800,42600].map((progress,i)=>{
        state.routeProgress=progress;
        updatePlanetaryWorld();
        const point=h4WorldLandmarks.find(x=>x.zone===i&&x.group.visible);
        return {regionVisible:planetaryWorldRegions[i].visible,
          landmarkVisible:!!point,
          label:document.getElementById('planetary-landmark-name').textContent};
      });
      state.routeProgress=initialProgress;
      updatePlanetaryWorld();
      return {byRegion,total:h4WorldContentStats.landmarks,
        meshes:h4WorldContentStats.decorMeshes,names:nameSet.size,
        zones:zoneProbe};
    });
    assert.equal(content.total,12,'12 named landmark groups');
    assert.deepEqual(content.byRegion,[3,3,3,3],'three landmarks in each zone');
    assert.equal(content.names,12,'every landmark has a distinct identity');

    // NEXT-06: LM10/11/12 final sector has three distinct hero compositions
    // rather than repeated W01 boxes/VQ02 signatures. GFX01's existing
    // imported patrol fighter at the spaceport must remain independently
    // mounted. No physical obstacles or route constraints are added.
    const finalHeroes=await page.evaluate(()=>{
      const records=h4WorldLandmarks.filter(p=>p.zone===3);
      const heroes=records.map(point=>{
        const old=point.group.getObjectByName(
          'MAP4_LEGACY_W01_'+point.kind.toUpperCase());
        const signature=point.group.children.find(c=>
          c.userData.signature===point.kind);
        const art=point.group.children.find(c=>c.userData.h4Gfx06e);
        const meshes=[];
        art?.traverse(obj=>{if(obj.isMesh)meshes.push(obj)});
        return {
          kind:point.kind,progress:point.at,
          name:point.name,group:art?.name,
          anchorProgress:art?.userData.anchorProgress,
          anchorSide:art?.userData.anchorSide,
          parts:meshes.length,oldHidden:old?.visible===false,
          sigHidden:signature?.visible===false,
          visualOnly:art?.userData.visualOnly===true&&
            meshes.every(x=>x.userData.visualOnly&&
              x.userData.h4Gfx06e&&!x.userData.h4Collider),
          frameCount:meshes.filter(m=>m.geometry===H4_GFX06E_GEO.frame).length,
          uniqueKinds:new Set(meshes.map(m=>m.geometry.type)).size,
          tags:meshes.map(m=>m.name),
          importedFighterRetained:point.kind!=='spaceport'||
            point.group.userData.h4Gfx01Requested===true
        };
      });
      const before=camera.position.clone();
      const fine=h4Gfx06eFineArt[0];
      camera.position.copy(fine.position).add(new THREE.Vector3(1000,0,0));
      h4Gfx06eUpdateFineDetail();
      const near=fine.visible;
      camera.position.copy(fine.position).add(new THREE.Vector3(10000,0,0));
      h4Gfx06eUpdateFineDetail();
      const far=!fine.visible;
      camera.position.copy(fine.position).add(new THREE.Vector3(900,0,0));
      h4Gfx06eUpdateFineDetail();
      const restored=fine.visible;
      camera.position.copy(before);
      h4Gfx06eUpdateFineDetail();
      return {heroes,stats:{...h4Gfx06eStats},
        fineCount:h4Gfx06eFineArt.length,near,far,restored,
        canyonPhysics:h4CanyonColliders.length,
        industrialPhysics:h4IndustrialColliders.length,
        worldPhysics:planetaryBuildingColliders.length,
        stillMap4:state.activeMap===MAP_MODES.MAP4};
    });
    assert.equal(finalHeroes.stats.sites,3);
    assert.equal(finalHeroes.stats.legacyHidden,3);
    assert.equal(finalHeroes.stats.signatureHidden,3);
    assert.equal(finalHeroes.stats.physicsAdded,0);
    assert.deepEqual(finalHeroes.heroes.map(x=>x.kind),
      ['outpost','spaceport','launch']);
    assert.deepEqual(finalHeroes.heroes.map(x=>x.progress),
      [36200,42600,48300]);
    assert(finalHeroes.heroes.every(x=>x.parts>=20&&
      x.oldHidden&&x.sigHidden&&x.visualOnly&&
      x.anchorProgress===x.progress&&
      Math.abs(x.anchorSide)>1500&&x.uniqueKinds>=3&&
      x.importedFighterRetained));
    assert(finalHeroes.heroes[0].tags.includes('LM10_COMMAND_CITADEL'));
    assert(finalHeroes.heroes[0].tags.includes('LM10_OPEN_SECURITY_GATE'));
    assert.equal(finalHeroes.heroes[0].frameCount,1);
    assert.equal(finalHeroes.heroes[1].frameCount,2);
    assert(finalHeroes.heroes[1].tags.includes('LM11_FLIGHT_DECK_SPINE'));
    assert(finalHeroes.heroes[1].tags.includes('LM11_AIR_TRAFFIC_CONTROL_TOWER'));
    assert.equal(finalHeroes.heroes[2].frameCount,2);
    assert(finalHeroes.heroes[2].tags.includes('LM12_ROCKET_MAIN_STAGE'));
    assert(finalHeroes.heroes[2].tags.includes('LM12_UPLINK_MAST'));
    assert(finalHeroes.fineCount>=12&&
      finalHeroes.near&&finalHeroes.far&&finalHeroes.restored);
    assert.equal(finalHeroes.canyonPhysics,6);
    assert.equal(finalHeroes.industrialPhysics,36);
    assert(finalHeroes.worldPhysics>finalHeroes.industrialPhysics,
      'all existing world collision proxies remain registered');
    assert(finalHeroes.stillMap4);

    // NEXT07: no extra collisions, same 86 scenery mesh references, five
    // genuinely different authored 3D families and sector-4-only lighting.
    const gfx07=await page.evaluate(()=>{
      const zone=planetaryWorldRegions[3];
      const wide=zone.getObjectByName('MAP4_W02_WIDE_SCENERY_3');
      const near=wide.getObjectByName('NEAR_TERRAIN_AND_SETTLEMENT');
      const far=wide.getObjectByName('HORIZON_SILHOUETTE');
      const styled=h4Gfx07Styled;
      const geos=[...new Set(styled.map(m=>m.geometry.name))];
      const before={
        route:state.routeProgress,phase:state.map4Phase,
        camera:camera.position.clone(),
        planet:planetaryWorldGroup.visible,
        collision:h4IndustrialColliders.length
      };
      const inCorridor=zone.children.filter(m=>
        m.isMesh&&m.userData.h4Gfx07Styled);
      const zoneGround=zone.children[0];
      const oldTag=styled.every(m=>
        m.userData.visualOnly&&m.userData.h4Gfx07OriginalGeometry&&
        m.userData.h4Gfx07OriginalMaterial&&!m.userData.h4Collider);
      const newTag=styled.every(m=>
        m.geometry.name.startsWith('MAP4_GFX07_FINAL_SKYLINE_FAMILY_')&&
        m.material===h4Gfx07SkylineMaterial);
      const matCheck={
        name:zoneGround.name,
        map:zoneGround.material.map===h4Gfx07GroundMap,
        size:h4Gfx07GroundMap.image.width,
        color:zoneGround.material.color.getHex(),
        noHarshRockNormal:zoneGround.material.normalMap===null,
        silhouetteTint:h4Gfx07SkylineMaterial.color.getHex(),
        canyonUnchanged:planetaryWorldRegions[0].children[0].material.map!==
          h4Gfx07GroundMap,
        industryUnchanged:planetaryWorldRegions[2].children[0].material.map!==
          h4Gfx07GroundMap
      };
      state.routeProgress=42600;state.map4Phase=4;
      h4Gfx07UpdateLighting();h4UpdateCinematicAtmosphere(18);
      const final={
        localActive:h4Gfx07Stats.activeLights,
        fog:scene.fog.density,
        blend:h4Gfx07Stats.finalAtmosphereWeight,
        ambient:ambientLight.intensity,
        key:nebulaLight1.intensity
      };
      state.routeProgress=23500;state.map4Phase=3;
      h4Gfx07UpdateLighting();h4UpdateCinematicAtmosphere(18);
      const industry={
        localActive:h4Gfx07Stats.activeLights,
        blend:h4Gfx07Stats.finalAtmosphereWeight
      };
      state.routeProgress=before.route;state.map4Phase=before.phase;
      camera.position.copy(before.camera);
      h4Gfx07UpdateLighting();h4UpdateCinematicAtmosphere(18);
      return {
        stats:{...h4Gfx07Stats},geometryFamilies:geos,
        corridor:inCorridor.length,near:near.children.filter(
          m=>m.userData.h4Gfx07Styled).length,
        far:far.children.filter(m=>m.userData.h4Gfx07Styled).length,
        total:styled.length,oldTag,newTag,matCheck,
        lights:h4Gfx07Lights.map(l=>({
          kind:l.name,castShadow:l.castShadow,
          parentIsLandmark:h4WorldLandmarks.some(x=>x.group===l.parent)
        })),
        shadows:h4Gfx07Shadows.map(m=>({
          valid:m.userData.visualOnly&&!m.userData.h4Collider,
          textureShared:m.material===h4ShadowMat,
          name:m.name
        })),
        canyonPhysics:h4CanyonColliders.length,
        industryPhysics:h4IndustrialColliders.length,
        collisionsGained:before.collision-h4IndustrialColliders.length,
        final,industry
      };
    });
    assert.equal(gfx07.stats.replaced,86);
    assert.equal(gfx07.stats.corridor,28);
    assert.equal(gfx07.stats.near,30);
    assert.equal(gfx07.stats.far,28);
    assert.equal(gfx07.corridor,28);
    assert.equal(gfx07.near,30);
    assert.equal(gfx07.far,28);
    assert.equal(gfx07.total,86);
    assert.equal(gfx07.geometryFamilies.length,5);
    assert(gfx07.oldTag&&gfx07.newTag,
      'new signature forms are render-only and original render buffers retained');
    assert.equal(gfx07.matCheck.name,
      'MAP4_GFX07_FINAL_SECTOR_MATTE_GROUND');
    assert(gfx07.matCheck.map&&gfx07.matCheck.size===512&&
      gfx07.matCheck.canyonUnchanged&&gfx07.matCheck.industryUnchanged);
    assert.equal(gfx07.matCheck.color,0x757d87,
      'last sector ground must be muted rather than overexposed');
    assert.equal(gfx07.matCheck.silhouetteTint,0x677482,
      'final skyline kit requires darker steel-to-concrete separation');
    assert(gfx07.matCheck.noHarshRockNormal,
      'do not apply harsh canyon micro-rock bump to final military landing ground');
    assert.equal(gfx07.stats.groundAtlasCount,1);
    assert.equal(gfx07.stats.heroShadows,3);
    assert.equal(gfx07.stats.localLights,3);
    assert.equal(gfx07.stats.addedColliders,0);
    assert(gfx07.shadows.every(m=>m.valid&&m.textureShared));
    assert(gfx07.lights.every(l=>l.parentIsLandmark&&!l.castShadow),
      'three selective bounce lights, no global shadow-map cost');
    assert(gfx07.final.localActive>=1&&gfx07.final.localActive<=2,
      'only nearby final-sector hero lights activated');
    assert.equal(gfx07.industry.localActive,0);
    assert(gfx07.final.blend>.99&&gfx07.industry.blend===0);
    assert.equal(gfx07.canyonPhysics,6);
    assert.equal(gfx07.industryPhysics,36);
    assert.equal(gfx07.collisionsGained,0);


    assert(content.meshes>=55 && content.meshes<200,'bounded additional geometry');
    assert(content.zones.every(z=>z.regionVisible&&z.landmarkVisible),
      'visible landmarks throughout all four sectors');
    assert(content.zones.every(z=>z.label.includes('YAKIN NOKTA')),
      'nearby landmark names on HUD');
    assert.equal(planetary.worldVisible,true,'planet landscape visible');
    assert.equal(planetary.corridorVisible,false,'neon race tube hidden');
    assert.equal(planetary.starsVisible,false,'old stars hidden');
    assert(planetary.width>1000,'wider free-flight space');
    assert.equal(planetary.strategyCount,5,'five rival strategies');
    assert(planetary.zoneName.includes('VADİ'),'planet zone HUD');
    const scored=await page.evaluate(()=>{
      const normal=hunterTargets.find(h=>h.alive&&!h.isElite);
      const elite=hunterTargets.find(h=>h.alive&&h.isElite);
      normal.hp=12;elite.hp=12;
      damageHunterTarget(normal,12,'PLAYER');
      damageHunterTarget(elite,12,'PLAYER');
      return {kills:state.hunterKills,points:state.hunterScore};
    });
    assert.equal(scored.kills,2,'two real credited kills');
    assert.equal(scored.points,4,'normal 1 + elite 3 points');
    // GFX04D: animated smoke + pooled sparks are physically present in Map4
    // and directly follow real damageHunterTarget events, not fake kills.
    const gfx04d=await page.evaluate(()=>{
      const smoke=planetaryWorldRegions[1].children.find(x=>
        x.name==='MAP4_GFX04D_BATTLE_SMOKE_FIELD');
      const sparks=planetaryWorldGroup.children.find(x=>
        x.name==='MAP4_GFX04D_HIT_SPARK_POOL');
      const a=smoke.geometry.attributes.position;
      h4UpdateGfx04D(0.02,11.10);
      const first=[a.getX(7),a.getY(7),a.getZ(7)];
      h4UpdateGfx04D(0.09,13.80);
      const second=[a.getX(7),a.getY(7),a.getZ(7)];
      const emitted=h4Gfx04DStats.sparksEmitted;
      const capacity=h4Gfx04DStats.sparkCapacity;
      // Batch-limit stress probe: 30 legitimate-looking visual-only spark
      // bursts; does not alter any pilot/hunter HP or scores.
      for(let n=0;n<30;n++)
        h4EmitGfx04DSparks(state.pos,n%3===0);
      h4UpdateGfx04D(.13,14.20);
      const after=h4Gfx04DStats.sparksActive;
      h4UpdateGfx04D(1.0,16.20);
      const cleared=h4Gfx04DStats.sparksActive;
      const allocation={
        smokeGeometry:smoke.geometry.uuid,sparkGeometry:sparks.geometry.uuid,
        smokeMaterial:smoke.material.uuid,sparkMaterial:sparks.material.uuid
      };
      return {
        plumes:h4Gfx04DStats.plumes,
        smokePoints:h4Gfx04DStats.smokePoints,
        smokeFields:h4Gfx04DStats.smokeFields,
        fieldGeometry:smoke.geometry.attributes.position.count,
        moved:first.some((x,i)=>Math.abs(x-second[i])>.1),
        sourceIsDecorative:smoke.userData.visualOnly &&
          sparks.userData.visualOnly,
        extraColliders:!smoke.userData.h4Collider&&!sparks.userData.h4Collider,
        capacity,events:h4Gfx04DStats.sparkEvents,
        emitted,after,cleared,
        oneSparkBatch:h4Gfx04DStats.sparkDrawCalls,
        allocations:allocation,
        sparkAttributes:sparks.geometry.attributes.position.count
      };
    });
    assert.equal(gfx04d.plumes,4,'four differentiated static battle smoke sources');
    assert.equal(gfx04d.smokePoints,72,'72 smoke particles within one draw call');
    assert.equal(gfx04d.smokeFields,1,'one shared smoke Points mesh');
    assert.equal(gfx04d.fieldGeometry,72,'smoke buffer truly populated');
    assert.equal(gfx04d.moved,true,'time-dependent smoke shifts in world space');
    assert.equal(gfx04d.sourceIsDecorative,true);
    assert.equal(gfx04d.extraColliders,true,'VFX never add physical blockers');
    assert.equal(gfx04d.capacity,96,'fixed-size hit spark pool');
    assert(gfx04d.events>=2 && gfx04d.emitted>=15,
      'only actual hunter hits trigger the initial sparks');
    assert(gfx04d.after<=96 && gfx04d.after>0,
      'high intensity sparks bounded to 96 GPU points');
    assert.equal(gfx04d.cleared,0,'sparks fade and expire with no lingering impacts');
    assert.equal(gfx04d.oneSparkBatch,1,'spark VFX uses one draw-call mesh');
    assert.equal(gfx04d.sparkAttributes,96,'preallocated GPU vertex budget');

    // GFX04E: smoke has genuinely different opacity/size/temperature layers.
    // Heat lighting is phase-scoped, decorative, and cleared on restart.
    const gfx04e=await page.evaluate(()=>{
      const arena=planetaryWorldRegions[1];
      const smoke=h4Gfx04DState.smoke;
      const g=smoke.geometry;
      const attrIds={
        position:g.attributes.position.uuid,
        size:g.attributes.aSize.uuid,
        fade:g.attributes.aFade.uuid,
        tint:g.attributes.aTint.uuid,
        mat:smoke.material.uuid
      };
      const decal=arena.children.filter(x=>
        x.name==='MAP4_GFX04E_BATTLE_SCORCH');
      const lights=arena.children.filter(x=>
        x.name.startsWith('MAP4_GFX04E_LOCAL_HEAT_LIGHT'));
      const glows=arena.children.filter(x=>
        x.name.startsWith('MAP4_GFX04E_HOT_CORE'));
      const phaseBefore=state.map4Phase;
      state.map4Phase=2;
      h4UpdateGfx04D(.016,20.4);
      const positions=g.attributes.position,sz=g.attributes.aSize,
        fade=g.attributes.aFade,tint=g.attributes.aTint;
      const samples=Array.from({length:sz.count},(_,i)=>({
        size:sz.getX(i),fade:fade.getX(i),
        color:[tint.getX(i),tint.getY(i),tint.getZ(i)]
      }));
      const fireOn=lights.map(x=>x.intensity);
      const glowOn=glows.map(x=>x.visible);
      h4UpdateGfx04D(.018,21.0);
      const changed=lights.some((x,i)=>Math.abs(x.intensity-fireOn[i])>.0001);
      state.map4Phase=phaseBefore;
      h4UpdateGfx04D(.016,21.2);
      const dark=lights.every(x=>x.intensity===0) &&
        glows.every(x=>!x.visible);
      return {
        shader:smoke.material.type,
        shaderAtlas:smoke.material.uniforms.uAtlas.value===h4SmokeAtlas,
        texHeights:smoke.material.uniforms.uViewportHeight.value>100,
        uniformCount:h4Gfx04EStats.smokeUniforms,
        attrs:Object.keys(g.attributes),
        sizes:[Math.min(...samples.map(x=>x.size)),
          Math.max(...samples.map(x=>x.size))],
        opacity:[Math.min(...samples.map(x=>x.fade)),
          Math.max(...samples.map(x=>x.fade))],
        warmVsCool:samples[0].color[2]<samples[12].color[2],
        positions:positions.count,
        idsStable:attrIds.position===g.attributes.position.uuid &&
          attrIds.size===g.attributes.aSize.uuid &&
          attrIds.fade===g.attributes.aFade.uuid &&
          attrIds.tint===g.attributes.aTint.uuid &&
          attrIds.mat===smoke.material.uuid,
        scorchDecals:decal.length,
        scorchGeometry:decal.every(x=>x.userData.visualOnly &&
          x.geometry===h4ShadowPlane && !x.userData.h4Collider),
        warmLights:lights.length,coreGlows:glows.length,
        lightOn:fireOn.every(x=>x>.2),
        glowsOn:glowOn.every(Boolean),flicker:changed,dark,
        stageRestored:state.map4Phase===phaseBefore,
        atlasOnce:h4Gfx04EStats.shaderSmokeFields,
        visualOnly:h4Gfx04EStats.decorativeOnly
      };
    });
    assert.equal(gfx04e.shader,'ShaderMaterial','one authored smoke shader replaces flat points');
    assert.equal(gfx04e.shaderAtlas,true,'existing smoke atlas reused without texture duplication');
    assert.equal(gfx04e.texHeights,true,'smoke billboards use real render viewport');
    assert(gfx04e.attrs.includes('aSize')&&gfx04e.attrs.includes('aFade')&&
      gfx04e.attrs.includes('aTint'),'per-point size, fade and tint attributes exist');
    assert(gfx04e.sizes[1]>gfx04e.sizes[0]*1.6,'smoke changes size across vertical layers');
    assert(gfx04e.opacity[1]>gfx04e.opacity[0]*1.8,'smoke opacity fades at rising crest');
    assert.equal(gfx04e.positions,72,'existing bounded smoke point population kept');
    assert.equal(gfx04e.idsStable,true,'no per-frame buffer/material reallocation');
    assert.equal(gfx04e.scorchDecals,3,'three extra burned-ground decals');
    assert.equal(gfx04e.scorchGeometry,true,'burnt ground decals have no collision');
    assert.equal(gfx04e.warmLights,2,'two localized actual Three point lights');
    assert.equal(gfx04e.coreGlows,2,'two flare glows share the existing dust atlas');
    assert.equal(gfx04e.lightOn,true,'thermal lights activate in battle phase');
    assert.equal(gfx04e.glowsOn,true,'localized hot cores are visible during battle');
    assert.equal(gfx04e.flicker,true,'thermal light intensity changes naturally');
    assert.equal(gfx04e.dark,true,'local lights are disabled outside battle phase');
    assert.equal(gfx04e.stageRestored,true,'test does not alter race phase');
    assert.equal(gfx04e.atlasOnce,1,'one smoke shader allocated once');
    assert.equal(gfx04e.visualOnly,true,'all added VFX is non-physical');


    assert.equal(await page.locator('#laser-status').textContent().then(t=>t.includes('HAZIR')),true);
    await page.screenshot({path:path.resolve(__dirname,'map4-running.png')});
    // Phase 1 should normally take around forty seconds at nonboost speed.
    const nominal=await page.evaluate(()=>({
      intro:MAP4_PHASES.introEnd/(RACE_SPEEDS.NORMAL*MAP4_PHASES.introSpeed),
      arena:MAP4_PHASES.arenaSeconds,
      industry:(MAP4_PHASES.industryEnd-MAP4_PHASES.introEnd)/
        (RACE_SPEEDS.NORMAL*MAP4_PHASES.industrialSpeed),
      ascent:(RACE_ROUTE_NOMINAL_DISTANCE-MAP4_PHASES.industryEnd)/
        (RACE_SPEEDS.NORMAL*MAP4_PHASES.ascentSpeed)
    }));
    assert(nominal.intro>34 && nominal.intro<48,'intro near 40s');
    assert.equal(nominal.arena,60,'arena is fixed 60 seconds');
    assert(nominal.intro+nominal.arena+nominal.industry+nominal.ascent>240 &&
      nominal.intro+nominal.arena+nominal.industry+nominal.ascent<300,
      'normal map duration 4–5 minutes');
    // Enter zone two, check every pilot is held in the battle area.
    await page.evaluate(()=>{state.routeProgress=MAP4_PHASES.introEnd-2;});
    await page.waitForFunction(()=>state.map4Phase===2,null,{timeout:14000});
    const anchor=await page.evaluate(()=>state.routeProgress);
    await page.waitForTimeout(300);
    assert(Math.abs((await page.evaluate(()=>state.routeProgress))-anchor)<0.01,
      'no forward progress during arena');
    assert.equal(await page.evaluate(()=>racers.every(r=>r.routeProgress===MAP4_PHASES.introEnd
      || r.finished || r.dnf)),true,'five AI pilots held in arena');

    // GFX-04: three substantial, non-generic warfront compositions must
    // replace old repeated boxes without touching hunter/collision systems.
    const gfx04=await page.evaluate(()=>{
      const pockets=H4_ARENA_POCKETS.map(p=>{
        const parent=h4ArenaWarfrontGroups.find(g=>g.userData.pocketId===p.id);
        const hero=parent.children.find(g=>g.userData.h4Gfx04Pocket===p.id);
        const pieces=hero?.children||[];
        return {id:p.id,art:hero?.name,visible:hero?.visible,
          pieces:pieces.length,hiddenOld:parent.children.filter(
            x=>x!==hero).every(x=>!x.visible),
          visualOnly:pieces.every(x=>x.userData.w04VisualOnly===true &&
            x.userData.h4Collider===undefined && x.userData.visualOnly===true),
          customHulls:pieces.filter(x=>x.geometry.type==='ExtrudeGeometry').length,
          materialKinds:new Set(pieces.map(x=>x.material.uuid)).size,
          highest:Math.max(...pieces.map(x=>x.position.y))};
      });
      const old= h4WorldLandmarks.filter(l=>l.zone===1).map(l=>({
        type:l.kind,legacyHidden:l.group.children.find(
          c=>c.name.startsWith('MAP4_LEGACY_W01_'))?.visible===false,
        signatureHidden:l.group.children.find(
          c=>c.userData.signature===l.kind)?.visible===false
      }));
      return {stats:{...h4Gfx04Stats},pockets,old,
        rockColliders:h4CanyonColliders.length,
        factoryColliders:h4IndustrialColliders.length,
        physicalCityColliders:planetaryBuildingColliders.length};
    });
    // The next phase's refinery must not crowd the entire battlefield
    // during the mandatory 60-second stand-still fight.
    const industrialDuringArena=await page.evaluate(()=>{
      updatePlanetaryWorld();
      const zone=planetaryWorldRegions[2];
      return {terrain:zone.children[0].visible&&zone.visible,
        visualGroup:zone.userData.gfx04IndustrialVisuals?.visible,
        wrapperName:zone.userData.gfx04IndustrialVisuals?.name,
        geometryCount:zone.children[0].geometry.attributes.position.count};
    });
    assert.equal(industrialDuringArena.terrain,true,
      'planet ground remains continuous behind the combat arena');
    assert.equal(industrialDuringArena.wrapperName,
      'MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS');
    assert.equal(industrialDuringArena.visualGroup,false,
      'only future factory structures are hidden during the arena');
    assert(industrialDuringArena.geometryCount>7000,
      'terrain still has an actual visible 3D surface');
    const arenaSkyline=await page.evaluate(()=>{
      const zone=planetaryWorldRegions[1];
      const near=h4SceneryGroups[1].near;
      const far=h4SceneryGroups[1].far;
      return {
        wreckForms:zone.children.filter(x=>
          x.name==='MAP4_GFX04_MIDFIELD_RUIN').length,
        nearWreckPieces:near.children.filter(x=>
          x.geometry===H4_GFX04_GEO.brokenPlate ||
          x.geometry===H4_GFX04_GEO.charredCore).length,
        farWreckPieces:far.children.filter(x=>
          x.geometry===H4_GFX04_GEO.fracturedCarrier ||
          x.geometry===H4_GFX04_GEO.brokenPlate).length,
        nearCount:near.children.length,farCount:far.children.length,
        collisions:h4IndustrialColliders.length
      };
    });
    const arenaGround=await page.evaluate(()=>{
      const mat=planetaryWorldRegions[1].children[0].material;
      return {atlas:mat.map===h4Gfx04BattleGroundAtlas,
        name:mat.map?.name,normalScale:mat.normalScale.x,
        atlasWidth:mat.map?.image?.width,atlasHeight:mat.map?.image?.height,
        colliderFree:planetaryWorldRegions[1].children[0].userData.h4TerrainSceneryOnly,
        map1GroundUntouched:planetaryWorldRegions[0].children[0].material.map===
          h4SurfaceMaps.ground};
    });
    assert.equal(arenaGround.atlas,true,'battlefield has distinct tileable dust map');
    assert.equal(arenaGround.name,'MAP4_GFX04_BATTLEFIELD_DUST_ALBEDO');
    assert.equal(arenaGround.atlasWidth,256);
    assert.equal(arenaGround.atlasHeight,256);
    assert(arenaGround.normalScale<.2,'battlefield striped normal bump suppressed');
    assert.equal(arenaGround.colliderFree,true,'new battlefield ground is decorative');
    assert.equal(arenaGround.map1GroundUntouched,true,
      'canyon existing terrain map unchanged');

    assert.equal(arenaSkyline.wreckForms,10,
      'arena old rectangular middle skyline replaced by ten low wreck forms');
    assert.equal(arenaSkyline.nearWreckPieces,16,
      'all old near-box props become custom wreckage');
    assert.equal(arenaSkyline.farWreckPieces,28,
      'distant warfront silhouettes replace generic wedge towers');
    assert.equal(arenaSkyline.nearCount+arenaSkyline.farCount,44,
      'existing world-visibility/scenery budget remains stable');
    assert.equal(arenaSkyline.collisions,36,
      'decorative battlefield ruins add no factory hitboxes');
    assert.equal(gfx04.stats.sites,3,'all three warfronts receive new GFX04 art');
    assert.deepEqual(gfx04.pockets.map(p=>p.id),['CENTER','WRECK','DEFENSE']);
    assert(gfx04.pockets.every(p=>p.visible===true &&
      p.hiddenOld && p.visualOnly && p.materialKinds>=3),
      'warfronts replace their original primitive props with independent art');
    assert(gfx04.pockets[0].pieces>=18 && gfx04.pockets[0].pieces<=20,
      'centre remains deliberately sparse with legible hunter space');
    const centerMarkers=await page.evaluate(()=>{
      const group=h4ArenaWarfrontGroups[0].children.find(c=>c.userData.h4Gfx04Pocket==='CENTER');
      return {
        masts:group.children.filter(c=>c.name==='MAP4_GFX04_CENTER_FLANK_SIGNAL_MAST').length,
        lamps:group.children.filter(c=>c.name==='MAP4_GFX04_CENTER_FLANK_SIGNAL_LAMP').length,
        farWreck:group.children.filter(c=>c.name==='MAP4_GFX04_CENTER_DISTANT_CRUISER_FRAGMENT').length,
        colliderFree:group.children.every(c=>!c.userData.h4Collider)
      };
    });
    assert.deepEqual([centerMarkers.masts,centerMarkers.lamps,centerMarkers.farWreck],
      [2,2,1],'first person arena sightline has two flank markers and one far wreck');
    assert.equal(centerMarkers.colliderFree,true,'visual markers never become hitboxes');
    assert(gfx04.pockets[1].pieces>=20 &&
      gfx04.pockets[1].customHulls>=5,'cruiser wreck has five modeled hull sections');
    assert(gfx04.pockets[2].pieces>=20 &&
      gfx04.pockets[2].customHulls>=3,'defense has modeled layered fortification');
    assert(gfx04.stats.customHullFaces>40,'custom cruiser has real sculpted faces');
    assert.equal(gfx04.stats.hiddenOldLandmarks,6,
      'three redundant old W01+VQ02 battlefield landmarks hidden');
    assert(gfx04.old.every(p=>p.legacyHidden&&p.signatureHidden));
    assert.equal(gfx04.rockColliders,6,'canyon hazards preserved');
    assert.equal(gfx04.factoryColliders,36,'industrial solids preserved');
    assert.equal(gfx04.physicalCityColliders,
      await page.evaluate(()=>planetaryBuildingColliders.length),
      'warfront visual meshes add no unexpected building collision volumes');

    // W04: all three distinct combat pockets exist and spawn the shared 8
    // hunters in 3/3/2 formation. Both elites stay in the defense wing.
    const warfront=await page.evaluate(()=>{
      const ids=hunterTargets.map(h=>h.arenaPocketId);
      const perPocket=H4_ARENA_POCKETS.map(p=>({
        id:p.id,slots:p.slots.length,
        hunters:hunterTargets.filter(h=>h.arenaPocketId===p.id).length,
        elite:hunterTargets.filter(h=>h.arenaPocketId===p.id&&h.isElite).length
      }));
      const before=hunterTargets.map(h=>({
        id:h.id,x:h.laneX,y:h.laneY,z:h.routeProgress
      }));
      updateHunterTargets(0.3);
      const moved=hunterTargets.some((h,i)=>
        Math.abs(h.laneX-before[i].x)>0.1||
        Math.abs(h.laneY-before[i].y)>0.1||
        Math.abs(h.routeProgress-before[i].z)>0.1);
      const center=hunterTargets.find(h=>h.arenaPocketId==='CENTER'&&!h.isElite);
      const wreck=hunterTargets.find(h=>h.arenaPocketId==='WRECK'&&!h.isElite);
      const defense=hunterTargets.find(h=>h.arenaPocketId==='DEFENSE'&&h.isElite);
      const beforePlayer={points:state.hunterScore,kills:state.hunterKills};
      // Real background AI may have destroyed one of these targets in the
      // milliseconds between arena entry and test. Reuse the SAME target
      // slot before deterministic hit-attribution assertions (no new meshes).
      for(const target of [center,wreck,defense]){
        if(!target.alive)spawnHunterTarget(target,hunterTargets.indexOf(target));
        target.hp=12;
      }
      const centerHit=damageHunterTarget(center,12,'PLAYER');
      const wreckOwner=racers[1];
      const rivalBefore={points:wreckOwner.hunterScore,kills:wreckOwner.hunterKills};
      const wreckHit=damageHunterTarget(wreck,12,wreckOwner.name);
      const defenseHit=damageHunterTarget(defense,12,'PLAYER');
      updateHunterCompetitionHUD();
      const info=window.starbladeHunterTelemetry?.arena;
      return {
        groups:h4ArenaWarfrontGroups.length,
        meshCount:h4ArenaWarfrontStats.geometryCount,
        byPocket:h4ArenaWarfrontStats.byPocket.slice(),
        names:h4ArenaWarfrontGroups.map(g=>g.name),
        perPocket,moved,ids,
        hitSuccess:[centerHit.destroyed,wreckHit.destroyed,defenseHit.destroyed],
        playerScoreGain:state.hunterScore-beforePlayer.points,
        playerKillGain:state.hunterKills-beforePlayer.kills,
        playerPocketKills:{...state.hunterPocketKills},
        rivalScoreGain:wreckOwner.hunterScore-rivalBefore.points,
        rivalKillGain:wreckOwner.hunterKills-rivalBefore.kills,
        rivalPocketKills:{...wreckOwner.hunterPocketKills},
        telemetry:info,
        hunterCount:hunterTargets.length,
        hudText:document.getElementById('planetary-route-name').textContent
      };
    });
    // GFX04C in SOURCE HTML deliberately stays on original artwork,
    // while offline release loads the 3-LOD battery assets. The factory
    // source must never fake imported collision or extra game targets.
    const batteryFallback=await page.evaluate(()=>{
      const pocket=h4ArenaWarfrontGroups.find(g=>g.userData.pocketId==='DEFENSE');
      const art=pocket.children.find(x=>x.userData.h4Gfx04Pocket==='DEFENSE');
      const originals=art.children.filter(x=>h4Gfx04DefenseOldNames.has(x.name));
      return {scheduled:h4Gfx04DefenseStats.scheduled,
        fallback:h4Gfx04DefenseStats.fallback,
        hidden:h4Gfx04DefenseStats.hiddenLegacy,
        mounts:h4Gfx04DefenseStats.mounted,
        decals:h4Gfx04DefenseStats.scorchDecals,
        oldTotal:originals.length,oldVisible:originals.every(x=>x.visible),
        noNewColliders:h4Gfx04DefenseStats.noNewColliders};
    });
    assert.equal(batteryFallback.scheduled,1,'defense GLB attempted only once');
    assert.equal(batteryFallback.fallback,1,'source HTML has visual-only legacy fallback');
    assert.equal(batteryFallback.mounts,0,'no bundled GLB in source HTML');
    assert.equal(batteryFallback.oldTotal,8,'exactly eight original defense pieces');
    assert.equal(batteryFallback.oldVisible,true,'source defense retains safe original visuals');
    assert.equal(batteryFallback.hidden,0,'legacy remains visible if GLB unavailable');
    assert.equal(batteryFallback.decals,0,'unloaded art does not create ground marks');
    assert.equal(batteryFallback.noNewColliders,true,'defense GLB never changes game physics');
    assert.equal(warfront.groups,3,'three independent visible warfront groups');
    assert(warfront.meshCount>=28&&warfront.meshCount<80,'bounded set-piece geometry');
    assert(warfront.byPocket.every(n=>n>=8),'each pocket has unique scenery');
    assert.deepEqual(warfront.perPocket.map(p=>p.hunters),[3,3,2],
      'three center, three wreck, two defense hunters');
    assert.deepEqual(warfront.perPocket.map(p=>p.elite),[0,0,2],
      'elite fighters are in the defense wing');
    assert.equal(warfront.moved,true,'hunters fly real arena patrol routes');
    assert(warfront.hitSuccess.every(Boolean),'only actual fatal hits get kill credit');
    assert.equal(warfront.playerScoreGain,4,'center +1 and defense +3');
    assert.equal(warfront.playerKillGain,2,'only two player kills');
    assert.equal(warfront.playerPocketKills.CENTER,1);
    assert.equal(warfront.playerPocketKills.DEFENSE,1);
    assert.equal(warfront.rivalScoreGain,1,'rival gets equal normal kill points');
    assert.equal(warfront.rivalKillGain,1);
    assert.equal(warfront.rivalPocketKills.WRECK,1);
    assert.equal(warfront.hunterCount,8,'no extra invisible targets created');
    assert.deepEqual(warfront.telemetry.counts.map(p=>p.id),
      ['CENTER','WRECK','DEFENSE'],'arena telemetry exposes pockets');
    assert(warfront.telemetry.timeRemaining>0&&warfront.telemetry.timeRemaining<=60,
      'arena is still under exact 60 second budget');
    assert(warfront.hudText.includes('SAVAŞ CEPHESİ')||
        warfront.hudText.includes('GÜVENLİ ANA HAT'),
      'pocket HUD remains readable');
    await page.screenshot({path:path.resolve(__dirname,'map4-arena.png')});
    await page.evaluate(()=>{state.map4ArenaElapsed=MAP4_PHASES.arenaSeconds-0.08;});
    await page.waitForFunction(()=>state.map4Phase===3,null,{timeout:12000});
    assert(await page.evaluate(()=>map4SpeedFactor(20000)>0),'forward progress unlocked in phase 3');
    const industryRevealed=await page.evaluate(()=>{
      updatePlanetaryWorld();
      const zone=planetaryWorldRegions[2];
      return zone.visible && zone.userData.gfx04IndustrialVisuals.visible;
    });
    assert.equal(industryRevealed,true,
      'industrial factory geometry returns after the arena while ground persists');
    const building=await page.evaluate(()=> {
      const collider=planetaryBuildingColliders[0];
      state.routeProgress=collider.progress;
      state.map4Phase=3;
      state.laneX=collider.side;
      state.laneY=collider.altitude;
      state.shield=100;
      state.map4ImpactCooldown=0;
      updatePlanetaryBuildingContacts({routeProgress:collider.progress-10,laneX:collider.side,
        laneY:collider.altitude},racers.map(r=>({routeProgress:r.routeProgress,
        laneX:r.laneX,laneY:r.laneY})));
      return {shield:state.shield,colliders:planetaryBuildingColliders.length};
    });
    assert(building.colliders>0,'industrial buildings have collision volumes');
    assert(building.shield<100,'industrial collision damages player shield');
    // W05: six industrial complexes, explicit visible colliders and three
    // practical route choices. Test a 500m/frame pipe impact and two ways past.
    const industrial=await page.evaluate(()=>{
      const all=h4IndustrialColliders;
      const beam=all.find(c=>c.kind==='OVERHEAD_PIPE');
      const bridge=all.find(c=>c.kind==='TRANSFER_BRIDGE');
      const front={routeProgress:beam.progress-350,laneX:beam.side,laneY:beam.altitude};
      const back={routeProgress:beam.progress+350,laneX:beam.side,laneY:beam.altitude};
      const low={...front,laneY:H4_INDUSTRY.lowY};
      const lowAfter={...back,laneY:H4_INDUSTRY.lowY};
      const high={...front,laneY:H4_INDUSTRY.upperY};
      const highAfter={...back,laneY:H4_INDUSTRY.upperY};
      const speed=1800,dt=0.1,position=21000;
      const fast={laneX:H4_INDUSTRY.fastCenter,laneY:H4_INDUSTRY.lowY};
      const safe={laneX:0,laneY:H4_INDUSTRY.upperY};
      const hunt={laneX:H4_INDUSTRY.huntCenter,laneY:310};
      const preferred=['SPRINTER','HUNTER','BALANCED','ELITE','CAUTIOUS']
        .map(style=>({style,...h4IndustrialPreferredRoute(style)}));
      const avoidance=h4IndustrialAvoidance({
        routeProgress:bridge.progress-240},0,bridge.altitude);
      // Verify new solid bridges hurt actual ships and carry no invisible shell.
      state.routeProgress=beam.progress+40;
      state.laneX=beam.side;state.laneY=beam.altitude;
      state.shield=100;state.powerShieldTimer=0;state.barrelRollTimer=0;
      state.map4ImpactCooldown=0;state.map4Phase=3;
      updatePlanetaryBuildingContacts(front,racers.map(r=>({
        routeProgress:r.routeProgress,laneX:r.laneX,laneY:r.laneY
      })));
      const shieldAfterBeam=state.shield;
      return {
        stations:h4IndustrialStats.stations,
        meshes:h4IndustrialStats.meshes,
        colliders:h4IndustrialStats.physical,
        zones:h4IndustrialGroups.length,
        kinds:[...new Set(all.map(c=>c.kind))],
        link:beam.mesh.userData.h4Collider===beam,
        swept:h4SegmentBoxHit(front,back,beam,12),
        underClear:!h4SegmentBoxHit(low,lowAfter,beam,12),
        aboveClear:!h4SegmentBoxHit(high,highAfter,beam,12),
        speedFast:map4Advance(position,speed,dt,fast)-position,
        speedSafe:map4Advance(position,speed,dt,safe)-position,
        speedHunt:map4Advance(position,speed,dt,hunt)-position,
        routeLabels:[h4IndustrialRoute(position,fast.laneX,fast.laneY),
          h4IndustrialRoute(position,safe.laneX,safe.laneY),
          h4IndustrialRoute(position,hunt.laneX,hunt.laneY)],
        preferred,avoidance,shieldAfterBeam,
        room:H4_INDUSTRY.to-H4_INDUSTRY.from
      };
    });
    assert.equal(industrial.stations,6,'six complete industrial compounds');
    assert.equal(industrial.zones,6,'six persistent industrial groups');
    assert(industrial.meshes>=90&&industrial.meshes<150,'bounded industry mesh allocation');
    assert.equal(industrial.colliders,36,'physical solids authored with real geometry');

    // GFX06A: IN-01/IN-02 have distinct industrial hero models, replacing
    // old duplicate visual skyline only. W05 physical collider counts stay 36.
    const gfx06a=await page.evaluate(()=>{
      const sites=h4IndustrialGroups.map((group,index)=>{
        const art=group.children.find(x=>x.userData.h4Gfx06a);
        if(!art)return {index,active:false};
        const meshes=[];
        art.traverse(child=>{if(child.isMesh)meshes.push(child)});
        const old=group.children.filter(c=>
          ['SILO','BEACON','REFINERY'].includes(c.userData.w05Kind));
        return {
          index,active:true,name:art.name,parts:meshes.length,
          geometryTypes:[...new Set(meshes.map(m=>m.geometry.type))],
          materials:[...new Set(meshes.map(m=>m.material.uuid))].length,
          visualOnly:meshes.every(m=>
            m.userData.visualOnly&&m.userData.w05VisualOnly&&
            !m.userData.h4Collider),
          legacyHidden:old.length>0&&old.every(x=>!x.visible),
          maxHeight:Math.max(...meshes.map(m=>m.scale.y)),
          markerCount:meshes.filter(m=>m.name.includes('IN0')).length
        };
      });
      const stats={...h4Gfx06aStats};
      return {sites,stats,physical:h4IndustrialColliders.length,
        extraPhysical:planetaryBuildingColliders.length,
        roots:planetaryWorldRegions[2].userData.gfx04IndustrialVisuals.name};
    });
    assert.equal(gfx06a.stats.stations,2,'only IN01 and IN02 are replaced');
    assert.equal(gfx06a.stats.refinery,1);
    assert.equal(gfx06a.stats.transfer,1);
    assert.equal(gfx06a.stats.addedColliders,0,
      'art adds no phantom flight collision');
    assert.equal(gfx06a.physical,36,'GFX06A preserves all 36 W05 solids');
    assert.equal(gfx06a.sites.filter(s=>s.active).length,2);
    assert.equal(gfx06a.sites[0].name,
      'MAP4_GFX06A_IN01_DISTILLATION_REFINERY');
    assert.equal(gfx06a.sites[1].name,
      'MAP4_GFX06A_IN02_PRESSURE_TRANSFER');
    assert(gfx06a.sites.slice(0,2).every(s=>
      s.visualOnly&&s.legacyHidden&&s.parts>=14&&
      s.materials>=4&&s.geometryTypes.length>=3),
      'authored visible silhouettes replace cosmetic duplicates only');
    assert(gfx06a.sites[0].maxHeight>=1200,
      'IN01 has an unmistakably tall separation column');
    assert(gfx06a.sites[1].markerCount>=14,
      'IN02 has a dense, differently composed pressure transfer kit');
    assert.equal(gfx06a.roots,'MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS',
      'old arena-to-industry visibility gating is preserved');

    // GFX-06B / IN-03/IN-04: art is intentionally NOT collision geometry.
    const gfx06b=await page.evaluate(()=>{
      const sites=h4IndustrialGroups.map((group,i)=>{
        const art=group.children.find(x=>x.userData.h4Gfx06b);
        if(!art)return {i,active:false};
        const meshes=[];
        art.traverse(obj=>{if(obj.isMesh)meshes.push(obj)});
        return {
          i,active:true,name:art.name,parts:meshes.length,
          archCount:meshes.filter(m=>m.name.startsWith(
            'IN03_OPEN_PRESS_ARCH_')).length,
          hyperboloidCount:meshes.filter(m=>m.name.startsWith(
            'IN04_HYPERBOLOID_COOLING_TOWER_')).length,
          geometryTypes:[...new Set(meshes.map(m=>m.geometry.type))],
          materials:[...new Set(meshes.map(m=>m.material.uuid))].length,
          visualOnly:meshes.every(m=>
            m.userData.visualOnly&&m.userData.w05VisualOnly&&
            !m.userData.h4Collider),
          hiddenLegacy:group.children.some(x=>
            x.userData.w05Kind==='SILO'&&!x.visible),
          artHasNoColliders:art.children.every(x=>
            !x.userData.h4Collider)
        };
      });
      return {sites,stats:{...h4Gfx06bStats},
        physical:h4IndustrialColliders.length,
        art06a:h4IndustrialGroups.filter(g=>
          g.children.some(x=>x.userData.h4Gfx06a)).length,
        map1ArtHiddenWhenSwitched:!planetaryWorldGroup.visible||
          state.activeMap===MAP_MODES.MAP4
      };
    });
    assert.equal(gfx06b.stats.stations,2,'exactly two new IN03/04 art groups');
    assert.equal(gfx06b.stats.presses,1);
    assert.equal(gfx06b.stats.cooling,1);
    assert.equal(gfx06b.stats.addedColliders,0);
    assert.equal(gfx06b.physical,36,
      'GFX06B cannot modify 36 established W05 physics obstacles');
    assert.equal(gfx06b.art06a,2,'earlier refinery/transfer art stays intact');
    assert.deepEqual(gfx06b.sites.filter(x=>x.active).map(x=>x.i),[2,3],
      'fifth and sixth industrial stations are deliberately untouched');
    assert.equal(gfx06b.sites[2].name,
      'MAP4_GFX06B_IN03_HEAVY_PRESS_ASSEMBLY');
    assert.equal(gfx06b.sites[3].name,
      'MAP4_GFX06B_IN04_COOLING_RECLAMATION');
    assert.equal(gfx06b.sites[2].archCount,2,
      'two authentic punched-through heavy press extrusion silhouettes');
    assert.equal(gfx06b.sites[3].hyperboloidCount,2,
      'two distinct open-topped cooling tower lathe silhouettes');
    assert(gfx06b.sites[2].geometryTypes.includes('ExtrudeGeometry'));
    assert(gfx06b.sites[3].geometryTypes.includes('LatheGeometry'));
    assert(gfx06b.sites.slice(2,4).every(x=>
      x.visualOnly&&x.artHasNoColliders&&x.hiddenLegacy&&
      x.parts>=20&&x.materials>=5));

    // GFX06M: visual evidence showed excessive repeated checker/grid paint.
    // Material remapping is industry-only. Preserve all solid mesh identities.
    const gfx06m=await page.evaluate(()=>{
      const industry=planetaryWorldRegions[2];
      const ground=industry.children[0];
      const one=h4IndustrialColliders[0],original=one.mesh;
      return {
        stats:{...h4Gfx06mStats},
        applied:industry.userData.h4Gfx06mApplied,
        groundMap:ground.material.map?.name,
        metalMap:h4Gfx06mSteelMap.name,
        groundNormalScale:ground.material.normalScale.x,
        phys:h4IndustrialColliders.length,
        colliderMeshLinked:one.mesh===original&&
          one.mesh.userData.h4Collider===one,
        industryOnly:planetaryWorldRegions.filter((z,i)=>i!==2)
          .every(z=>!z.userData.h4Gfx06mApplied),
        map1Safe:!h4GeoSwordArt.userData.h4Gfx06m
      };
    });
    assert.equal(gfx06m.stats.atlases,2,'two fixed reusable 512px atlases');
    assert.equal(gfx06m.stats.groundUpdated,true);
    assert(gfx06m.stats.mappedMeshes>=30,
      'old industry meshes replace metallic checkerboard materials');
    assert.equal(gfx06m.stats.addedColliders,0);
    assert.equal(gfx06m.phys,36);
    assert.equal(gfx06m.colliderMeshLinked,true,
      'all original collision mesh pointers remain unchanged');
    assert.equal(gfx06m.applied,true);
    assert.equal(gfx06m.groundMap,
      'MAP4_GFX06M_SMOOTH_ERODED_INDUSTRY_GROUND');
    assert.equal(gfx06m.metalMap,'MAP4_GFX06M_DIRTY_STEEL_NO_GRID_ALBEDO');
    assert(gfx06m.groundNormalScale<=.1);
    assert(gfx06m.industryOnly&&gfx06m.map1Safe);

    const skyPolish=await page.evaluate(()=>{
      const before=state.routeProgress;
      state.routeProgress=22000;
      h4UpdateCinematicAtmosphere(3);
      const industrial=h4AtmosphereUniforms.cloudiness.value;
      state.routeProgress=2000;
      h4UpdateCinematicAtmosphere(3);
      const canyon=h4AtmosphereUniforms.cloudiness.value;
      state.routeProgress=before;
      h4UpdateCinematicAtmosphere(3);
      return {industrial,canyon};
    });
    assert(skyPolish.industrial<skyPolish.canyon*.48,
      'sector 3 cirrus stripes reduced without altering canyon sky');

    // VIS-02: 58 W02 visual-only industrial props now have 4 sculpted
    // identities. Original physical W02 meshes, geometry, and collider
    // references are untouched, but acquire FOUR shared instanced drawcalls.
    const vis02=await page.evaluate(()=>{
      const z=planetaryWorldRegions[2];
      const wide=z.getObjectByName('MAP4_W02_WIDE_SCENERY_2');
      const near=wide.children.find(x=>x.name==='NEAR_TERRAIN_AND_SETTLEMENT');
      const far=wide.children.find(x=>x.name==='HORIZON_SILHOUETTE');
      const visual=[...near.children,...far.children];
      const physics=[];
      z.traverse(m=>{if(m.userData.h4Vis02Protected)physics.push(m)});
      const facades=z.userData.h4Vis02Facades;
      const dual=h4IndustrialGroups.flatMap(g=>g.children).filter(m=>
        m.userData.vq02IndustrialDetail&&m.userData.h4Collider);
      return {
        stat:{...h4Vis02Stats},
        landscapeVisible:wide.visible,
        scenery:{near:near.children.length,far:far.children.length},
        featureNamed:visual.every(m=>m.userData.h4Vis02Sculpted&&
          m.name.startsWith('MAP4_VIS02_AUTHORED_SKYLINE_')),
        fourKitTypes:[...new Set(visual.map(m=>
          m.userData.h4Gfx06dLevels?.[0]?.name||m.geometry.name))],
        sourcePreserved:visual.every(m=>
          !!m.userData.h4Vis02LegacyGeometry&&
          !!m.userData.h4Vis02LegacyMaterial),
        physicalProtected:physics.every(m=>
          !!m.userData.h4Collider&&
          !!m.userData.h4Vis02LegacyMaterial&&
          (m.geometry===H4_MESHES.structure||
           m.geometry===H4_MESHES.tower)&&m.visible),
        facadeMeshCount:facades.children.length,
        facadeChildNoPhysics:facades.children.every(m=>
          m.isInstancedMesh&&m.userData.noCollider&&!m.userData.h4Collider),
        facadeInstanceCount:facades.children.reduce((n,m)=>n+m.count,0),
        oldVQ02TaggedPhysical:dual.length,
        oldVQ02Corrected:dual.every(m=>
          m.userData.w05VisualOnly===false),
        physW05:h4IndustrialColliders.length,
        scenePhysical:planetaryBuildingColliders.length,
        otherRegionClean:planetaryWorldRegions.filter((r,i)=>i!==2)
          .every(r=>!r.userData.h4Vis02Applied)
      };
    });
    assert.equal(vis02.stat.sculpted,58);
    assert.deepEqual(vis02.scenery,{near:30,far:28});
    assert(vis02.featureNamed&&vis02.sourcePreserved);
    assert.equal(vis02.fourKitTypes.length,4,
      'four non-box industrial visual families actually mounted');
    assert.equal(vis02.stat.physical,34,
      'all 34 old physical skyline hazards are still present');
    assert.equal(vis02.stat.geometryPreserved,34);
    assert.equal(vis02.stat.addedColliders,0);
    assert.equal(vis02.facadeMeshCount,4,
      'four InstancedMesh facade drawcalls instead of 100+ meshes');
    assert(vis02.facadeChildNoPhysics&&vis02.physicalProtected);
    assert(vis02.facadeInstanceCount>=120);
    assert.equal(vis02.stat.facadeInstances,vis02.facadeInstanceCount);
    assert(vis02.oldVQ02TaggedPhysical>0&&
      vis02.oldVQ02Corrected,
      'VQ02 double-tagged collision props no longer claim to be visual-only');
    assert.equal(vis02.physW05,36);
    assert(vis02.scenePhysical>vis02.physW05,
      'legacy W02/VQ02 collision collection remains available');
    assert(vis02.otherRegionClean,'Map1 and other Map4 zones unmodified');

    // GFX-06C: final two industrial nodes, dramatically different visual
    // functions and silhouettes while ALL previous physical routes persist.
    const gfx06c=await page.evaluate(()=>{
      const sites=h4IndustrialGroups.map((station,index)=>{
        const art=station.children.find(m=>m.userData.h4Gfx06c);
        if(!art)return {index,present:false};
        const meshes=[];
        art.traverse(m=>{if(m.isMesh)meshes.push(m)});
        const solids=station.children.filter(m=>m.userData.h4Collider);
        return {
          index,present:true,name:art.name,parts:meshes.length,
          openCranes:meshes.filter(m=>
            m.name.startsWith('IN05_OPEN_AFRAME_CRANE_')).length,
          toroids:meshes.filter(m=>
            m.name.startsWith('IN06_CENTRAL_POWER_TOROID_')).length,
          cargoContainers:meshes.filter(m=>
            m.name.startsWith('IN05_STACKED_FREIGHT_')).length,
          transformers:meshes.filter(m=>
            m.name.startsWith('IN06_GRID_TRANSFORMER_')).length,
          artOnly:art.userData.visualOnly&&meshes.every(m=>
            m.userData.visualOnly&&m.userData.w05VisualOnly&&
            !m.userData.h4Collider),
          solidPhysical:solids.length,
          solidsVisible:solids.every(m=>m.visible),
          distinctMaterials:new Set(meshes.map(m=>m.material.uuid)).size,
          shapes:[...new Set(meshes.map(m=>m.geometry.type))]
        };
      });
      return {
        stats:{...h4Gfx06cStats},
        sites,physical:h4IndustrialColliders.length,
        oldGfx06a:h4IndustrialGroups.slice(0,2).every(g=>
          g.children.some(m=>m.userData.h4Gfx06a)),
        oldGfx06b:h4IndustrialGroups.slice(2,4).every(g=>
          g.children.some(m=>m.userData.h4Gfx06b)),
        art06c:[...h4IndustrialGroups].filter(g=>
          g.children.some(m=>m.userData.h4Gfx06c)).length
      };
    });
    assert.equal(gfx06c.stats.stations,2);
    assert.equal(gfx06c.stats.logistics,1);
    assert.equal(gfx06c.stats.energy,1);
    assert.equal(gfx06c.stats.addedColliders,0);
    assert.equal(gfx06c.physical,36,
      'the final two compounds add zero physics volumes');
    assert.deepEqual(gfx06c.sites.filter(s=>s.present).map(s=>s.index),
      [4,5]);
    assert.equal(gfx06c.sites[4].name,
      'MAP4_GFX06C_IN05_INTERMODAL_LOGISTICS');
    assert.equal(gfx06c.sites[5].name,
      'MAP4_GFX06C_IN06_REACTOR_SECURITY_POWER');
    assert.equal(gfx06c.sites[4].openCranes,2);
    assert.equal(gfx06c.sites[4].cargoContainers,5);
    assert.equal(gfx06c.sites[5].toroids,2);
    assert.equal(gfx06c.sites[5].transformers,3);
    assert(gfx06c.sites[4].shapes.includes('ExtrudeGeometry')&&
      gfx06c.sites[5].shapes.includes('TorusGeometry'));
    assert(gfx06c.sites.slice(4,6).every(s=>
      s.artOnly&&s.parts>=25&&s.solidPhysical>=6&&
      s.solidsVisible&&s.distinctMaterials>=5),
      'highly differentiated art, no hidden W05 physical solids');
    assert(gfx06c.oldGfx06a&&gfx06c.oldGfx06b);
    assert.equal(gfx06c.art06c,2);

    // GFX06D-A/B: shared physically based maps + actual 3-level geometry
    // substitution on only the 58 visual skyline meshes. All physical
    // obstacles and Map1 materials/ship meshes remain untouched.
    const gfx06d=await page.evaluate(()=>{
      const before=state.routeProgress,phase=state.map4Phase;
      const beforeCam=camera.position.clone();
      const beforeTarget=camera.getWorldDirection(new THREE.Vector3());
      state.routeProgress=22000;state.map4Phase=3;
      const item=h4Gfx06dLodObjects[0];
      const detail=h4Gfx06dMicroObjects[0];
      const size=(geometry)=>geometry.attributes.position.count;
      camera.position.copy(item.position).add(new THREE.Vector3(1000,0,0));
      h4Gfx06dUpdateLod();
      const close={level:item.userData.h4Gfx06dLod,
        vertices:size(item.geometry),matches:
          item.geometry===item.userData.h4Gfx06dLevels[0]};
      camera.position.copy(item.position).add(new THREE.Vector3(4000,0,0));
      h4Gfx06dUpdateLod();
      const middle={level:item.userData.h4Gfx06dLod,
        vertices:size(item.geometry),matches:
          item.geometry===item.userData.h4Gfx06dLevels[1]};
      camera.position.copy(item.position).add(new THREE.Vector3(9000,0,0));
      h4Gfx06dUpdateLod();
      const distant={level:item.userData.h4Gfx06dLod,
        vertices:size(item.geometry),matches:
          item.geometry===item.userData.h4Gfx06dLevels[2]};
      camera.position.copy(detail.position)
          .add(new THREE.Vector3(1000,0,0));
      h4Gfx06dUpdateLod();
      const detailClose=detail.visible;
      camera.position.copy(detail.position)
          .add(new THREE.Vector3(10000,0,0));
      h4Gfx06dUpdateLod();
      const detailFar=detail.visible;
      const materialQuality={
        pixels:h4Gfx06dStats.textureSize,
        normalName:h4Gfx06dMaps.normal.name,
        roughName:h4Gfx06dMaps.roughness.name,
        normalWidth:h4Gfx06dMaps.normal.image.width,
        roughWidth:h4Gfx06dMaps.roughness.image.width,
        uniqueAtlases:h4Gfx06dStats.normalMaps+
          h4Gfx06dStats.roughnessMaps,
        materials:h4Gfx06dStats.metalMaterials,
        shared:h4Gfx06dMetals.every(m=>
          m.normalMap===h4Gfx06dMaps.normal&&
          m.roughnessMap===h4Gfx06dMaps.roughness),
        roughnessSpread:h4Gfx06dStats.noiseMax-h4Gfx06dStats.noiseMin,
        silhouetteVertexColors:!!h4Vis02Mat.vertexColors,
        silhouetteHasNoUVMaps:!h4Vis02Mat.normalMap&&
          !h4Vis02Mat.roughnessMap
      };
      const physics={
        W05:h4IndustrialColliders.length,
        preservedW05:h4IndustrialColliders.every(c=>
          c.mesh.userData.h4Collider===c),
        protectedW02:h4Vis02Stats.physical,
        noNew:h4Gfx06dStats.addedColliders,
        lodCount:h4Gfx06dLodObjects.length,
        detailCount:h4Gfx06dMicroObjects.length,
        geometryOnly:h4Gfx06dLodObjects.every(m=>
          !m.userData.h4Collider&&m.userData.visualOnly)
      };
      camera.position.copy(beforeCam);
      camera.lookAt(beforeCam.clone().add(beforeTarget));
      state.routeProgress=before;state.map4Phase=phase;
      h4Gfx06dUpdateLod();
      return {close,middle,distant,detailClose,detailFar,
        materialQuality,physics};
    });
    assert.deepEqual([gfx06d.close.level,gfx06d.middle.level,
      gfx06d.distant.level],[0,1,2]);
    assert(gfx06d.close.matches&&gfx06d.middle.matches&&
      gfx06d.distant.matches);
    assert(gfx06d.close.vertices>gfx06d.middle.vertices&&
      gfx06d.middle.vertices>gfx06d.distant.vertices,
      'three geometry budgets genuinely shrink by distance');
    assert(gfx06d.detailClose&&!gfx06d.detailFar,
      'small art parts fade at range and restore when close');
    assert.equal(gfx06d.materialQuality.pixels,512);
    assert.equal(gfx06d.materialQuality.normalWidth,512);
    assert.equal(gfx06d.materialQuality.roughWidth,512);
    assert.equal(gfx06d.materialQuality.uniqueAtlases,2);
    assert.equal(gfx06d.materialQuality.materials,18);
    assert(gfx06d.materialQuality.shared&&
      gfx06d.materialQuality.roughnessSpread>.10);
    assert(gfx06d.materialQuality.silhouetteVertexColors&&
      gfx06d.materialQuality.silhouetteHasNoUVMaps,
      'non-UV merged silhouette geometry cannot use normal/roughness maps');
    assert.equal(gfx06d.physics.lodCount,58);
    assert(gfx06d.physics.detailCount>=15);
    assert.equal(gfx06d.physics.W05,36);
    assert.equal(gfx06d.physics.protectedW02,34);
    assert.equal(gfx06d.physics.noNew,0);
    assert(gfx06d.physics.preservedW05&&gfx06d.physics.geometryOnly);

    // GFX06D-C: functional markings on all six real hero bodies.
    // 1 shared 1024px atlas, 9 UV tiles, 4 instanced batches per station.
    // Verify no hidden physics, no duplicate material, and reversible LOD.
    const gfx06dc=await page.evaluate(()=>{
      const groups=h4Gfx06dcGroups;
      const stations=groups.map((group,i)=>{
        const station=h4IndustrialGroups[i];
        const art=station.children.find(c=>
          c.userData.h4Gfx06a||c.userData.h4Gfx06b||
          c.userData.h4Gfx06c);
        const target=art.children.find(m=>
          m.name===H4_GFX06DC_ANCHORS[i]);
        return {
          id:group.name,childCount:group.children.length,
          directChild:station.children.includes(group),
          parentHero:target?.name,
          labelCount:group.children[0].count,
          sootCount:group.children[1].count,
          rustCount:group.children[2].count,
          hazardCount:group.children[3].count,
          correctTypes:group.children.every(c=>
            c.isInstancedMesh&&c.userData.h4Gfx06dc&&
            c.userData.visualOnly&&!c.userData.h4Collider),
          materialShared:group.children.every(c=>
            c.material===h4Gfx06dcMaterial),
          anchorMatches:group.userData.anchor.distanceTo(
            target.position)<.001
        };
      });
      const canvas=h4Gfx06dcTexture.image;
      const ctx=canvas.getContext('2d');
      const stencilPixel=ctx.getImageData(16,56,1,1).data;
      const sootPixel=ctx.getImageData(2*256+128,256+128,1,1).data;
      const beforeCamera=camera.position.clone();
      const prevPhase=state.map4Phase,prevRoute=state.routeProgress;
      state.routeProgress=15750;state.map4Phase=3;
      const target=groups[0].userData.anchor;
      camera.position.copy(target).add(new THREE.Vector3(0,240,1400));
      h4Gfx06dcUpdateRange();
      const close=groups[0].visible;
      camera.position.copy(target).add(new THREE.Vector3(0,240,9900));
      h4Gfx06dcUpdateRange();
      const far=!groups[0].visible;
      camera.position.copy(target).add(new THREE.Vector3(0,240,1100));
      h4Gfx06dcUpdateRange();
      const restored=groups[0].visible;
      camera.position.copy(beforeCamera);
      state.routeProgress=prevRoute;state.map4Phase=prevPhase;
      h4Gfx06dcUpdateRange();
      return {
        stats:{...h4Gfx06dcStats},stations,
        texture:{name:h4Gfx06dcTexture.name,width:canvas.width,
          height:canvas.height,stencilAlpha:stencilPixel[3],
          sootAlpha:sootPixel[3]},
        geometryUnique:h4Gfx06dcTiles.length,
        commonShared:h4Gfx06dcGroups.every(g=>
          g.children.every(m=>m.material.map===h4Gfx06dcTexture)),
        noPhysics:h4IndustrialColliders.length===36&&
          h4Vis02Stats.geometryPreserved===34,
        close,far,restored
      };
    });
    assert.equal(gfx06dc.stats.stations,6);
    assert.equal(gfx06dc.stats.atlasCount,1);
    assert.equal(gfx06dc.stats.atlasSize,1024);
    assert.equal(gfx06dc.geometryUnique,9);
    assert.equal(gfx06dc.stats.drawBatches,24);
    assert.equal(gfx06dc.stats.labelInstances,12);
    assert.equal(gfx06dc.stats.sootInstances,24);
    assert.equal(gfx06dc.stats.rustInstances,18);
    assert.equal(gfx06dc.stats.hazardInstances,12);
    assert.equal(gfx06dc.stats.addedColliders,0);
    assert.deepEqual(gfx06dc.stations.map(s=>s.id),[
      'MAP4_GFX06DC_STATION_1_DECALS',
      'MAP4_GFX06DC_STATION_2_DECALS',
      'MAP4_GFX06DC_STATION_3_DECALS',
      'MAP4_GFX06DC_STATION_4_DECALS',
      'MAP4_GFX06DC_STATION_5_DECALS',
      'MAP4_GFX06DC_STATION_6_DECALS'
    ]);
    assert(gfx06dc.stations.every(s=>
      s.childCount===4&&s.labelCount===2&&s.sootCount===4&&
      s.rustCount===3&&s.hazardCount===2&&s.correctTypes&&
      s.materialShared&&s.directChild&&s.anchorMatches));
    assert(gfx06dc.stations.every(s=>s.parentHero.startsWith('IN0')));
    assert.equal(gfx06dc.texture.width,1024);
    assert.equal(gfx06dc.texture.height,1024);
    assert(gfx06dc.texture.stencilAlpha>0&&
      gfx06dc.texture.sootAlpha>0);
    assert(gfx06dc.commonShared&&gfx06dc.noPhysics);
    assert(gfx06dc.close&&gfx06dc.far&&gfx06dc.restored,
      'visual micro-decals cull with distance and restore without rebuild');








    assert(industrial.kinds.includes('OVERHEAD_PIPE')&&
      industrial.kinds.includes('TRANSFER_BRIDGE')&&
      industrial.kinds.includes('HUNTER_SIDE_TOWER'),
      'pipes, bridges and east towers genuinely collide');
    assert.equal(industrial.link,true,'collision registered on visible pipe mesh');
    assert.equal(industrial.swept,true,'high-speed swept collision cannot tunnel');
    assert.equal(industrial.underClear,true,'low fast route passes under overhead pipe');
    assert.equal(industrial.aboveClear,true,'high route passes above pipe');
    assert.deepEqual(industrial.routeLabels,['FAST_LOW','SAFE_UPPER','HUNTER_FLANK']);
    assert(industrial.speedFast>industrial.speedSafe*1.11 &&
      industrial.speedFast<industrial.speedSafe*1.13,
      'low route earns 12% actual progress, not cosmetic speed');
    assert.equal(industrial.speedSafe,industrial.speedHunt,
      'safe and combat flank both have normal base speed');
    assert.equal(industrial.preferred.length,5);
    assert(industrial.preferred[0].x<0,'sprinter chooses low pipeline');
    assert(industrial.preferred[1].x>0,'hunter chooses eastern factories');
    assert(industrial.preferred[4].y>800,'cautious pilot flies high');
    assert.equal(industrial.avoidance.avoiding,true,
      'AI proactively diverts around a visible transfer bridge');
    assert.notEqual(industrial.avoidance.y,290,
      'AI never plans directly through a bridge');
    assert(industrial.shieldAfterBeam<100,
      'visible pipe hurts player on real high-speed contact');
    // Phase four: crossing the finish plane low is not enough; must rise into orbit.
    await page.evaluate(()=>{
      state.shield=100;
      state.routeProgress=RACE_ROUTE_NOMINAL_DISTANCE-5;
      state.laneX=0;state.laneY=0;
      state.map4Phase=4;state.map4ImpactCooldown=0;
    });
    await page.waitForTimeout(400);
    assert.equal(await page.evaluate(()=>state.finished),false,'low flight cannot finish');
    await page.evaluate(()=>{
      state.routeProgress=RACE_ROUTE_NOMINAL_DISTANCE-2;
      state.laneY=MAP4_PHASES.orbitAltitude+100;
    });
    await page.waitForFunction(()=>state.finished,null,{timeout:14000});
    assert(await page.evaluate(()=>state.finishTime<MAP4_RACE_RULES.realTimeLimit),
      'orbital ascent crossing qualifies on time');
    // End mission and restart; test deadline DNF separately.
    await page.evaluate(()=>endGame(true));
    assert.equal(await page.evaluate(()=>
      window.starbladeHunterFinal.standings.find(x=>x.id==='PLAYER').validFinish),true,
      'on-time orbital ascender appears as qualified');
    await page.locator('#restart-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>0.05,null,{timeout:15000});
    // The 300-second real deadline disqualifies runners regardless of points.
    await page.evaluate(() => {state.raceTime=299.96;state.paused=false;});
    try {
      await page.waitForFunction(() => !state.running,null,{timeout:12000});
    } catch (error) {
      console.error('Deadline diagnostic', await page.evaluate(() => ({
        running:state.running,paused:state.paused,realClock:state.raceTime,
        finished:state.finished,playerDNF:state.playerDNF,map:state.activeMap,
        gameOverHidden:document.getElementById('gameover-screen').classList.contains('hidden')
      })), errors);
      throw error;
    }
    assert.equal(await page.locator('#gameover-screen').isVisible(),true,
      'deadline must show results; browser errors: '+errors.join(' | '));
    const result=await page.evaluate(() => window.starbladeHunterFinal);
    assert.equal(result.realTimeLimit,300);
    assert.equal(result.standings.length,6);
    assert(result.standings.every(e=>!e.validFinish),'no invented finish');
    assert.equal(await page.locator('#race-standings-list > div').count(),6);
    await page.screenshot({path:path.resolve(__dirname,'map4-results.png')});
    // Restart same map clears old targets, timers and stats.
    await page.locator('#restart-btn').click();
    await page.waitForTimeout(220);
    assert.equal(await page.locator('#gameover-screen').isVisible(),false);
    const restart=await page.evaluate(()=>({
      mode:state.activeMap,hunters:hunterTargets.length,
      gameTime:state.raceTime,playerKills:state.hunterKills
    }));
    assert.equal(restart.mode,'map4');
    assert.equal(restart.hunters,8);
    assert.equal(await page.evaluate(()=>h4WorldLandmarks.length),12,
      'restart reuses one-time world compositions');
    assert.equal(await page.evaluate(()=>h4WideScenery.total),226,
      'restart does not duplicate terrain and skyline');
    assert.equal(await page.evaluate(()=>h4CanyonColliders.length),6,
      'restart reuses the same real canyon rock volumes');
    assert.equal(await page.evaluate(()=>h4ArenaWarfrontGroups.length),3,
      'restart never duplicates warfront scenery');
    assert.equal(await page.evaluate(()=>h4IndustrialGroups.length),6,
      'restart never duplicates industrial buildings');
    assert.equal(await page.evaluate(()=>h4SignatureStats.sites),12,
      'restart never duplicates twelve hero signatures');
    assert.equal(await page.evaluate(()=>h4IndustrialArtStats.stations),6,
      'restart never duplicates refinery gantries');
    const vfxReset=await page.evaluate(()=>({
      active:h4Gfx04DStats.sparksActive,
      plumes:h4Gfx04DStats.plumes,
      particleBuffers:planetaryWorldRegions[1].children.filter(x=>
        x.name==='MAP4_GFX04D_BATTLE_SMOKE_FIELD').length,
      sparks:planetaryWorldGroup.children.filter(x=>
        x.name==='MAP4_GFX04D_HIT_SPARK_POOL').length,
      resets:h4Gfx04DStats.resets
    }));
    assert.equal(vfxReset.active,0,'restart resets pooled hit sparks');
    assert.equal(vfxReset.plumes,4,'restart reuses smoke anchors');
    assert.equal(vfxReset.particleBuffers,1,'no duplicate battlefield smoke mesh');
    assert.equal(vfxReset.sparks,1,'no duplicate spark GPU buffer');
    const g04eReset=await page.evaluate(()=>({
      decals:planetaryWorldRegions[1].children.filter(x=>
        x.name==='MAP4_GFX04E_BATTLE_SCORCH').length,
      lights:h4Gfx04EState.lights.length,
      glows:h4Gfx04EState.glows.length,
      active:h4Gfx04EStats.activeLights,
      warm:h4Gfx04EState.lights.map(x=>x.light.intensity),
      visible:h4Gfx04EState.glows.map(x=>x.visible)
    }));
    assert.equal(g04eReset.decals,3,'restart reuses three existing ground decals');
    assert.equal(g04eReset.lights,2,'restart reuses two warm lights');
    assert.equal(g04eReset.glows,2,'restart reuses two hot-core sprites');
    assert.equal(g04eReset.active,0,'restart never leaves combat lighting enabled');
    assert(g04eReset.warm.every(x=>x===0)&&g04eReset.visible.every(x=>!x),
      'no stale warfront lighting in another phase');

    assert(vfxReset.resets>=2,'pooled hit effects reset on each launch');
    const gfx05Restart=await page.evaluate(()=>{
      const rigs= [h4GeoSwordArt.userData.h4Gfx05Craft,
        ...racers.map(r=>r.mesh.userData.h4Gfx05Craft),
        ...hunterTargets.map(t=>t.mesh.userData.h4Gfx05Craft)];
      return {
        rigs:rigs.length,valid:rigs.every(x=>x&&x.children.length>8),
        shared:h4Gfx05SharedGeometries.has(H4_GFX05_GEO.hull),
        hullUUID:H4_GFX05_GEO.hull.uuid,
        geometries:h4Gfx05SharedGeometries.size,
        racerColors:new Set(racers.map(r=>
          r.mesh.userData.h4Gfx05Craft.userData.h4Gfx05Palette)).size
      };
    });
    const gfx05cRestart=await page.evaluate(()=>({
      reset:h4Gfx05cStats.resets,
      count:h4Gfx05cMesh.count,
      geometryId:h4Gfx05cMesh.geometry.uuid,
      stillSingle:planetaryWorldGroup.children.filter(
        x=>x.name==='MAP4_GFX05C_INSTANCED_ENGINE_HEAT').length,
      texture:h4Gfx05cTex.uuid,
      models:h4Gfx05cStats.models
    }));
    assert(gfx05cRestart.reset>=2,'restart clears old exhaust instances');
    assert.equal(gfx05cRestart.stillSingle,1,
      'restart creates no second exhaust InstancedMesh');
    assert.equal(gfx05cRestart.geometryId,exhaust.geometryId,
      'restart reuses the original GPU instance buffer');
    assert.equal(gfx05cRestart.models,1);
    assert.equal(gfx05Restart.rigs,14,'restart recreates exactly existing 5+8 aircraft');
    assert.equal(gfx05Restart.valid,true,'all new craft are complete');
    assert.equal(gfx05Restart.shared,true,'restart must not dispose shared VBO geometry');
    assert.equal(gfx05Restart.hullUUID,gfx05.registered,
      'same GPU hull reused after all hunters and AI were recreated');
    assert.equal(gfx05Restart.racerColors,5,'restart retains distinctive pilot palettes');
    assert.equal(await page.evaluate(()=>h4Gfx05bStats.atlasSets),1,
      'restart reuses the same PBR atlas canvases and GPU textures');
    assert.equal(await page.evaluate(()=>h4Gfx05bStats.textures),3,
      'restart never creates duplicate 2D normal or roughness maps');
    assert.equal(await page.evaluate(()=>h4Gfx04Stats.sites),3,
      'restart reuses three hero warfront compositions without duplicating art');
    assert.equal(await page.evaluate(()=>h4CanyonHeroStats.sites),3,
      'restart never duplicates the three sculpted canyon hero sites');
    assert.equal(await page.evaluate(()=>h4MaterialMicroStats.textures),4,
      'restart shares same four micro-surface GPU textures');
    assert.equal(await page.evaluate(()=>particles.filter(p=>p.vq03Smoke||p.vq03Shock).length),
      0,'restart clears all VQ03 explosion effects');
    assert.deepEqual(await page.evaluate(()=>state.hunterPocketKills),
      {CENTER:0,WRECK:0,DEFENSE:0},'restart clears arena pocket kill counters');
    assert(restart.gameTime<4,'timer reset');
    assert.equal(restart.playerKills,0);
    assert.equal(await page.evaluate(()=>state.map4Phase),1,'four phase reset');
    assert.equal(await page.evaluate(()=>state.map4ArenaStarted),false,'arena reset');
    assert.equal(await page.evaluate(()=>state.hunterScore),0,'score reset');
    // Force an end for menu navigation, verify Map1 regressions.
    await page.evaluate(() => endGame(false));
    await page.locator('#menu-btn').click();
    assert.equal(await page.locator('#start-screen').isVisible(),true);
    await page.locator('#map-choice-1').click();
    assert.equal(await page.locator('#map4-instructions').isVisible(),false);
    await page.locator('#start-btn').click();
    await page.waitForTimeout(250);
    const map1=await page.evaluate(()=>({
      map:state.activeMap,hunters:hunterTargets.length,
      racers:racers.length,combat:state.combatEnabled,
      terrainVisible:planetaryWorldGroup.visible,
      corridorVisible:corridorGuideGroup.visible,
      flightRadius:getCorridorRadiusAt(8000),
      cameraFar:camera.far,
      light:nebulaLight1.color.getHex(),
      header:document.getElementById('race-standings-head').textContent
    }));
    assert.equal(map1.map,'map1');
    assert.equal(map1.hunters,0);
    assert.equal(map1.terrainVisible,false,'planetary terrain hidden in Map1');
    assert.equal(await page.locator('#planetary-zone-hud').isVisible(),false,
      'landmark HUD hidden in Map1');
    assert.equal(map1.corridorVisible,true,'Map1 corridor restored');
    assert(map1.flightRadius<500,'Map1 narrow flight restored');
    assert.equal(map1.cameraFar,4500,'Map1 draw distance restored');
    assert.equal(map1.light,0xff55aa,'Map1 lighting restored');
    const map1Art=await page.evaluate(()=>({
      sky:h4SkyDome.visible,sun:h4SunHalo.visible,
      player:h4GeoSwordArt.visible,
      tonemapRestored:renderer.toneMapping===THREE.NoToneMapping,
      encodingRestored:renderer.outputEncoding===THREE.LinearEncoding,
      cloudParent:planetaryWorldGroup.visible
    }));
    assert.equal(map1Art.sky,false,'Map1 cannot see planet shader');
    assert.equal(map1Art.sun,false,'Map1 cannot see sun halo');
    assert.equal(map1Art.player,false,'Map1 GeoSword unchanged');
    assert.equal(map1Art.cloudParent,false,'planetary clouds hidden in Map1');
    assert.equal(map1Art.tonemapRestored,true,'Map1 tonemapping restored');
    assert.equal(map1Art.encodingRestored,true,'Map1 output encoding restored');
    const map1Boundary=await page.evaluate(()=>evaluateBoundaryFriction(0,0,18,0,0));
    assert.equal(map1Boundary.level,0,'Map1 boundary behavior unchanged');
    assert.equal(map1.racers,5);
    assert.equal(map1.combat,false);
    assert(map1.header.includes('TIME / GAP'),'Map1 header restored');
    await page.evaluate(()=>endGame(false));
    assert.equal(await page.locator('#gameover-screen').isVisible(),true);
    assert(!((await page.locator('#gameover-title').textContent()).includes('HARİTA 4')));
    assert.equal(errors.length,0,'browser JavaScript errors: '+errors.join(' | '));
    console.log('PASS: Map4 VQ03 PBR microtextures, sculpted ship wings, layered smoke/explosion, VQ02 and Map1 isolation');
  } finally {
    if (errors.length) console.error('Browser errors:',errors.join('\n'));
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
