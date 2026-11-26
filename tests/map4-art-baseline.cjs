/* GFX-00 reproducible Chromium captures; SwiftShader metrics are NOT hardware FPS. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const caseSpecs=[
  {name:'01-canyon-open',progress:1950,laneX:0,laneY:80,phase:1},
  {name:'02-canyon-mesa',progress:6100,laneX:0,laneY:130,phase:1},
  {name:'03-canyon-exit',progress:10100,laneX:0,laneY:150,phase:1},
  {name:'04-arena-center',progress:13000,laneX:0,laneY:90,phase:2},
  {name:'05-arena-wreck',progress:13200,laneX:-1150,laneY:200,phase:2},
  {name:'06-arena-defense',progress:13400,laneX:1140,laneY:250,phase:2},
  {name:'07-industry-entry',progress:17200,laneX:0,laneY:260,phase:3},
  {name:'08-industry-factory',progress:23800,laneX:0,laneY:350,phase:3},
  {name:'09-industry-exit',progress:31600,laneX:0,laneY:450,phase:3},
  {name:'10-outpost',progress:36200,laneX:0,laneY:240,phase:4},
  {name:'11-spaceport',progress:42600,laneX:0,laneY:530,phase:4},
  {name:'12-orbit-climb',progress:48500,laneX:0,laneY:1200,phase:4}
];
const percentile=(numbers,p)=>{
 const sorted=[...numbers].sort((a,b)=>a-b);
 return sorted[Math.min(sorted.length-1,Math.round((sorted.length-1)*p))];
};
(async ()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
 await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',route=>
   route.fulfill({status:200,contentType:'text/javascript',body:three}));
 await page.route('**/cdn.tailwindcss.com/**',route=>
   route.fulfill({status:200,contentType:'text/javascript',body:''}));
 const directory=path.resolve(__dirname,'art-baseline');
 fs.mkdirSync(directory,{recursive:true});
 try {
  await page.goto(pathToFileURL(path.resolve(process.env.GFX01_HTML_PATH || path.resolve(__dirname,'../index.html'))).toString(),
    {waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForFunction(()=>typeof state==='object' &&
    typeof h4UpdateCinematicAtmosphere==='function',null,{timeout:16000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running && state.raceTime>.05,null,{timeout:20000});
  // Only halt the GAME animation loop during reproducible screenshots.
  // Playwright's own rAF polling continues normally. Each probe below
  // manually calls renderer.render; this prevents needless SwiftShader
  // background frames from competing with the readback/screenshot.
  await page.evaluate(()=>{
    state.paused=true;
    const nativeRaf=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=(callback)=>
      callback&&callback.name==='animate'?0:nativeRaf(callback);
  });
  const out={schemaVersion:1,build:process.env.GFX01_HTML_PATH?'GFX01 packaged offline HTML':'source HTML',
    reference:'VQ04+ fixed visual probes',
   note:'Software Chromium/SwiftShader. Render timings are not end-user GPU FPS.',
   viewport:'1600x900',cases:[]};
  for(const item of caseSpecs){
   const info=await page.evaluate(({progress,laneX,laneY,phase})=>{
    state.paused=true;
    state.routeProgress=progress;state.laneX=laneX;state.laneY=laneY;
    state.map4Phase=phase;
    const frame=getRaceFrameAtDistance(progress);
    state.pos.copy(frame.center).addScaledVector(frame.right,laneX)
      .addScaledVector(frame.up,laneY);
    const basis=new THREE.Matrix4().makeBasis(frame.right,frame.up,
      frame.tangent.clone().negate());
    const q=new THREE.Quaternion().setFromRotationMatrix(basis);
    playerRig.position.copy(state.pos);
    playerRig.quaternion.copy(q);
    camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
    camera.quaternion.copy(q);
    camera.fov=68;camera.updateProjectionMatrix();
    updatePlanetaryWorld();
    h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8.0);
    renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
      points:renderer.info.render.points,
      geometries:renderer.info.memory.geometries,
      textures:renderer.info.memory.textures,
      fieldCount:h4AtmosphericFields.length,
      isMap4:planetaryWorldGroup.visible,
      terrainVertices:planetaryWorldRegions[0].children[0].geometry.attributes.position.count};
   },item);
   await page.screenshot({path:path.join(directory,item.name+'.png')});
   out.cases.push({...item,...info});
  }
  // Non-gameplay camera evidence: photograph the new silhouettes without
  // masking their shapes behind the player HUD, alongside HUD-on screenshots.
  await page.addStyleTag({content:`
    body.map4-photo-probe .hud-box,
    body.map4-photo-probe #shield-ring,
    body.map4-photo-probe #fx-canvas,
    body.map4-photo-probe #boundary-scrape-overlay {
      visibility:hidden !important;
    }
  `});
  // GFX06A: two actual in-engine industrial hero cameras at unchanged
  // authored coordinates. Keep the original 12 comparison cameras intact.
  out.gfx06aSites=[];
  for(const spec of [
    {name:'in01-refinery',i:0,at:15750,targetX:-2950,viewX:-970,
      targetY:425,viewY:770},
    {name:'in02-transfer',i:1,at:18750,targetX:-3120,viewX:-970,
      targetY:665,viewY:830}
  ]){
    const details=await page.evaluate(info=>{
      state.paused=true;state.map4Phase=3;state.routeProgress=info.at;
      state.laneX=info.viewX;state.laneY=info.viewY;
      const view=h4WorldPosition(info.at-1120,info.viewX,info.viewY);
      const focus=h4WorldPosition(info.at,info.targetX,info.targetY);
      camera.position.copy(view);
      camera.lookAt(focus);
      camera.fov=61;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      renderer.render(scene,camera);
      const art=h4IndustrialGroups[info.i].children.find(
        x=>x.userData.h4Gfx06a);
      return {name:info.name,artName:art?.name,parts:art?.children.length,
        drawCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        distance:view.distanceTo(focus),
        colliders:h4IndustrialColliders.length};
    },spec);
    await page.screenshot({path:path.join(directory,
      'gfx06a-'+spec.name+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,
      'gfx06a-'+spec.name+'-art-only.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.gfx06aSites.push(details);
  }
  assert.equal(out.gfx06aSites.length,2);
  assert(out.gfx06aSites.every(x=>
    x.artName?.startsWith('MAP4_GFX06A_')&&x.parts>=14&&
    x.triangles>1000&&x.colliders===36));
  // GFX06B adds two real-world camera probes in addition to GFX06A and the
  // original 12 fixed probes. No manipulated marketing renders.
  out.gfx06bSites=[];
  for(const spec of [
    {name:'in03-heavy-press',i:2,at:21850,targetX:3350,viewX:1100,
      targetY:475,viewY:760},
    {name:'in04-cooling-plant',i:3,at:24950,targetX:3170,viewX:900,
      targetY:580,viewY:810}
  ]){
    const details=await page.evaluate(info=>{
      state.paused=true;state.map4Phase=3;
      state.routeProgress=info.at;
      state.laneX=info.viewX;state.laneY=info.viewY;
      const view=h4WorldPosition(info.at-1350,info.viewX,info.viewY);
      const focal=h4WorldPosition(info.at,info.targetX,info.targetY);
      camera.position.copy(view);camera.lookAt(focal);
      camera.fov=60;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      renderer.render(scene,camera);
      const art=h4IndustrialGroups[info.i].children.find(
        obj=>obj.userData.h4Gfx06b);
      return {
        name:info.name,
        group:art?.name,
        parts:art?.children.length,
        drawCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        colliderCount:h4IndustrialColliders.length,
        cameraDistance:view.distanceTo(focal)
      };
    },spec);
    await page.screenshot({path:path.join(directory,
      'gfx06b-'+spec.name+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,
      'gfx06b-'+spec.name+'-art-only.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.gfx06bSites.push(details);
  }
  assert.equal(out.gfx06bSites.length,2);
  assert(out.gfx06bSites.every(x=>
    x.group?.startsWith('MAP4_GFX06B_')&&
    x.parts>=20&&x.triangles>1000&&x.colliderCount===36));

  // VIS02: real unchanged-camera A/B captures (new four sculpted skyline
  // kit silhouettes + batched physically-attached cladding vs W02 originals).
  // Temporarily toggle ONLY render geometry/materials; game is paused and
  // all original W02 physical Mesh/collider references stay untouched.
  out.vis02Gallery=[];
  await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
  for(const shot of [
    {name:'near-assembly',index:9,kind:'near',progress:20600,sideOffset:1100},
    {name:'far-refinery',index:15,kind:'far',progress:25100,sideOffset:-900}
  ]){
    const fresh=await page.evaluate(input=>{
      state.paused=true;state.map4Phase=3;
      state.routeProgress=input.progress;state.laneX=0;state.laneY=650;
      const wide=planetaryWorldRegions[2].getObjectByName(
        'MAP4_W02_WIDE_SCENERY_2');
      const activeGroup=wide.children.find(g=>g.name===(input.kind==='near'?
        'NEAR_TERRAIN_AND_SETTLEMENT':'HORIZON_SILHOUETTE'));
      const target=activeGroup.children[input.index];
      const frame=getRaceFrameAtDistance(input.progress);
      camera.position.copy(target.position).addScaledVector(frame.tangent,-1400)
        .addScaledVector(frame.right,input.sideOffset)
        .addScaledVector(frame.up,400);
      camera.lookAt(target.position);
      camera.fov=60;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      const zone=planetaryWorldRegions[2];
      const scenic=[];
      wide.traverse(x=>{if(x.userData.h4Vis02Sculpted)scenic.push(x)});
      const physical=[];
      zone.traverse(x=>{if(x.userData.h4Vis02Protected)physical.push(x)});
      const facades=zone.userData.h4Vis02Facades;
      window.__vis02AB={
        scenic:scenic.map(x=>({m:x,newGeo:x.geometry,newMat:x.material})),
        physical:physical.map(x=>({m:x,newMat:x.material})),facades
      };
      renderer.render(scene,camera);
      return {
        name:input.name,artParts:scenic.length,
        artDrawCalls:renderer.info.render.calls,
        artTriangles:renderer.info.render.triangles,
        physics:h4IndustrialColliders.length,
        targetGeometry:target.geometry.name
      };
    },shot);
    await page.screenshot({path:path.join(directory,
      'vis02-'+shot.name+'-new.png')});
    const old=await page.evaluate(()=>{
      const evidence=window.__vis02AB;
      evidence.scenic.forEach(o=>{
        o.m.geometry=o.m.userData.h4Vis02LegacyGeometry;
        o.m.material=o.m.userData.h4Vis02LegacyMaterial;
      });
      evidence.physical.forEach(o=>{
        o.m.material=o.m.userData.h4Vis02LegacyMaterial;
      });
      evidence.facades.visible=false;
      renderer.render(scene,camera);
      return {oldCalls:renderer.info.render.calls,
        oldTriangles:renderer.info.render.triangles};
    });
    await page.screenshot({path:path.join(directory,
      'vis02-'+shot.name+'-old.png')});
    await page.evaluate(()=>{
      const evidence=window.__vis02AB;
      evidence.scenic.forEach(o=>{
        o.m.geometry=o.newGeo;o.m.material=o.newMat;
      });
      evidence.physical.forEach(o=>o.m.material=o.newMat);
      evidence.facades.visible=true;
      delete window.__vis02AB;
      renderer.render(scene,camera);
    });
    out.vis02Gallery.push({...fresh,...old});
  }
  await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
  assert.equal(out.vis02Gallery.length,2);
  assert(out.vis02Gallery.every(x=>
    x.physics===36&&x.artParts===58&&
    x.targetGeometry.startsWith('MAP4_VIS02_ONE_DRAW_KIT_')&&
    x.artTriangles>x.oldTriangles&&
    x.artDrawCalls>0&&x.oldCalls>0),
    'VIS02 art upgrades are real new geometry in identical engine cameras');
  // GFX-06C: authored fifth and sixth compound at true world coords.
  // Two 1600x900 cameras, art-only and HUD-on for each. Legacy 12 unchanged.
  out.gfx06cSites=[];
  for(const item of [
    {name:'in05-freight-gantries',i:4,at:28150,
      targetX:-3340,targetY:360,viewX:-1100,viewY:730},
    {name:'in06-power-reactor',i:5,at:31500,
      targetX:3450,targetY:745,viewX:900,viewY:980}
  ]){
    const frame=await page.evaluate(info=>{
      state.paused=true;state.map4Phase=3;
      state.routeProgress=info.at;
      state.laneX=info.viewX;state.laneY=info.viewY;
      const from=h4WorldPosition(info.at-1200,info.viewX,info.viewY);
      const target=h4WorldPosition(info.at,info.targetX,info.targetY);
      camera.position.copy(from);camera.lookAt(target);
      camera.fov=60;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      renderer.render(scene,camera);
      const art=h4IndustrialGroups[info.i].children.find(
        m=>m.userData.h4Gfx06c);
      return {
        name:info.name,group:art?.name,parts:art?.children.length,
        drawCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        colliders:h4IndustrialColliders.length,
        artVisible:art?.visible,
        cameraDistance:from.distanceTo(target)
      };
    },item);
    await page.screenshot({path:path.join(directory,
      'gfx06c-'+item.name+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,
      'gfx06c-'+item.name+'-art-only.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.gfx06cSites.push(frame);
  }
  assert.equal(out.gfx06cSites.length,2);
  assert(out.gfx06cSites.every(x=>
    x.group?.startsWith('MAP4_GFX06C_')&&x.parts>=25&&
    x.triangles>1000&&x.colliders===36&&x.artVisible));
  // GFX06D: three actual renderer captures of same industrial silhouette
  // at LOD0, LOD1 and LOD2. Existing 12 fixed cameras remain intact.
  out.gfx06dLodViews=[];
  await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
  for(const level of [
    {name:'near-lod0',distance:1550,want:0},
    {name:'medium-lod1',distance:4100,want:1},
    {name:'far-lod2',distance:8600,want:2}
  ]){
    const evidence=await page.evaluate(spec=>{
      state.paused=true;state.map4Phase=3;state.routeProgress=22500;
      state.laneX=0;state.laneY=500;
      const target=h4Gfx06dLodObjects[9];
      const aim=target.position.clone();
      camera.position.copy(aim).add(new THREE.Vector3(0,220,-spec.distance));
      camera.lookAt(aim);camera.fov=60;
      camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      renderer.render(scene,camera);
      return {
        name:spec.name,lod:target.userData.h4Gfx06dLod,
        requested:spec.want,geometry:target.geometry.name,
        geometryVertices:target.geometry.attributes.position.count,
        drawCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        atlases:h4Gfx06dStats.normalMaps+h4Gfx06dStats.roughnessMaps,
        physics:h4IndustrialColliders.length
      };
    },level);
    await page.screenshot({path:path.join(directory,
      'gfx06d-'+level.name+'.png')});
    out.gfx06dLodViews.push(evidence);
  }
  await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
  assert.deepEqual(out.gfx06dLodViews.map(x=>x.lod),[0,1,2]);
  assert(out.gfx06dLodViews[0].geometryVertices>
    out.gfx06dLodViews[1].geometryVertices);
  assert(out.gfx06dLodViews[1].geometryVertices>
    out.gfx06dLodViews[2].geometryVertices);
  assert(out.gfx06dLodViews.every(x=>
    x.physics===36&&x.atlases===2&&x.drawCalls>0));
  // GFX06D fair visual A/B/C: lock camera, framing, world, lighting and
  // renderer, force only the target mesh's already-authored LOD geometry.
  // Distance-driven LOD is verified separately by gfx06dLodViews and smoke.
  // These three screenshots are labelled DEBUG / same camera, not gameplay
  // images pretending to be three naturally equal-sized camera distances.
  await page.evaluate(()=>{
    state.paused=true;state.map4Phase=3;state.routeProgress=22500;
    state.laneX=0;state.laneY=500;
    const target=h4Gfx06dLodObjects[9],aim=target.position.clone();
    camera.position.copy(aim).add(new THREE.Vector3(0,220,-1550));
    camera.lookAt(aim);camera.fov=60;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();
    h4UpdateCinematicAtmosphere(18);
    window.__gfx06dLocked={target,originalGeometry:target.geometry,
      originalLod:target.userData.h4Gfx06dLod,
      fixedCamera:camera.position.clone()};
  });
  out.gfx06dSameCamera=[];
  for(const lod of [0,1,2]){
    const measurement=await page.evaluate(level=>{
      const spec=window.__gfx06dLocked,
        target=spec.target;
      target.geometry=target.userData.h4Gfx06dLevels[level];
      target.userData.h4Gfx06dLod=level;
      renderer.render(scene,camera);
      return {
        lod:level,
        sameCamera:camera.position.distanceTo(spec.fixedCamera)<.001,
        geom:target.geometry.name,
        vertices:target.geometry.attributes.position.count,
        renderCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        visible:target.visible
      };
    },lod);
    await page.screenshot({path:path.join(directory,
      'gfx06d-debug-same-camera-lod'+lod+'.png')});
    out.gfx06dSameCamera.push(measurement);
  }
  await page.evaluate(()=>{
    const p=window.__gfx06dLocked;
    p.target.geometry=p.originalGeometry;
    p.target.userData.h4Gfx06dLod=p.originalLod;
    delete window.__gfx06dLocked;
    updatePlanetaryWorld();
  });
  assert(out.gfx06dSameCamera.every(x=>x.sameCamera&&x.visible));
  assert.deepEqual(out.gfx06dSameCamera.map(x=>x.lod),[0,1,2]);
  assert(out.gfx06dSameCamera[0].vertices>
    out.gfx06dSameCamera[1].vertices);
  assert(out.gfx06dSameCamera[1].vertices>
    out.gfx06dSameCamera[2].vertices);
  // GFX06D-C: honest same-camera, same-light true in-engine A/B screenshots.
  // Six numbered plants exist; we sample refinery, cooling, and power.
  // Only decal groups are hidden for A, then visible for B.
  out.gfx06dcServiceGallery=[];
  await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
  for(const item of [
    {i:0,name:'in01-refinery',at:15750},
    {i:3,name:'in04-cooling',at:24950},
    {i:5,name:'in06-reactor',at:31500}
  ]){
    const off=await page.evaluate(spec=>{
      state.paused=true;state.map4Phase=3;
      state.routeProgress=spec.at;state.laneX=0;state.laneY=500;
      const station=h4IndustrialGroups[spec.i],
        art=station.children.find(m=>
          m.userData.h4Gfx06a||m.userData.h4Gfx06b||
          m.userData.h4Gfx06c),
        body=art.children.find(m=>
          m.name===H4_GFX06DC_ANCHORS[spec.i]),
        decal=h4Gfx06dcGroups[spec.i];
      const up=new THREE.Vector3(0,1,0)
          .applyQuaternion(body.quaternion);
      const out=new THREE.Vector3(0,0,1)
          .applyQuaternion(body.quaternion);
      camera.position.copy(body.position).addScaledVector(out,1380)
        .addScaledVector(up,220);
      camera.lookAt(body.position.clone().addScaledVector(up,20));
      camera.fov=57;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      decal.visible=false;
      renderer.render(scene,camera);
      window.__gfx06dcVisualProbe={
        station:spec.i,pos:camera.position.clone(),
        quaternion:camera.quaternion.clone()
      };
      return {name:spec.name,calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        body:body.name,visible:decal.visible,
        colliders:h4IndustrialColliders.length};
    },item);
    await page.screenshot({path:path.join(directory,
      'gfx06dc-'+item.name+'-before.png')});
    const on=await page.evaluate(spec=>{
      const g=h4Gfx06dcGroups[spec.i],
        pose=window.__gfx06dcVisualProbe;
      g.visible=true;
      renderer.render(scene,camera);
      return {calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        visible:g.visible,children:g.children.length,
        sameCamera:camera.position.distanceTo(pose.pos)<.001&&
          camera.quaternion.angleTo(pose.quaternion)<.001};
    },item);
    await page.screenshot({path:path.join(directory,
      'gfx06dc-'+item.name+'-after.png')});
    out.gfx06dcServiceGallery.push({name:item.name,before:off,after:on});
    await page.evaluate(()=>{delete window.__gfx06dcVisualProbe});
  }
  await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
  assert.equal(out.gfx06dcServiceGallery.length,3);
  assert(out.gfx06dcServiceGallery.every(s=>
    s.before.colliders===36&&
    s.before.visible===false&&s.after.visible===true&&
    s.after.sameCamera&&s.after.children===4&&
    s.after.calls>=s.before.calls+3&&
    s.after.triangles>s.before.triangles),
    'three functional-decal screenshots must change geometry without gameplay');
  // NEXT06 proof: exact same game camera and lighting, W01/VQ02
  // fallback vs new 3D art. Original 12 fixed sector cameras are unchanged.
  // No Photoshop, no image-gen, and no hidden changes to physics.
  out.gfx06eGallery=[];
  await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
  for(const spec of [
    {name:'LM10-outpost',kind:'outpost',at:36200,target:'LM10_COMMAND_CITADEL',
      laneY:430,lookY:210},
    {name:'LM11-spaceport',kind:'spaceport',at:42600,
      target:'LM11_FLIGHT_DECK_SPINE',laneY:550,lookY:100},
    {name:'LM12-orbital-launch',kind:'launch',at:48300,
      target:'LM12_ROCKET_MAIN_STAGE',laneY:1110,lookY:1300}
  ]){
    const before=await page.evaluate(input=>{
      state.paused=true;state.map4Phase=4;
      state.routeProgress=input.at;state.laneX=0;state.laneY=input.laneY;
      const landmark=h4WorldLandmarks.find(x=>x.kind===input.kind),
        art=landmark.group.children.find(c=>c.userData.h4Gfx06e),
        old=landmark.group.getObjectByName(
          'MAP4_LEGACY_W01_'+input.kind.toUpperCase()),
        sig=landmark.group.children.find(c=>
          c.userData.signature===input.kind),
        aim=art.children.find(c=>c.name===input.target);
      const from=h4WorldPosition(input.at-1900,0,input.laneY+110);
      const focus=aim.position.clone().addScaledVector(
        getRaceFrameAtDistance(input.at).up,input.lookY*.15);
      camera.position.copy(from);camera.lookAt(focus);
      camera.fov=61;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      art.visible=false;old.visible=true;sig.visible=true;
      renderer.render(scene,camera);
      window.__gfx06eShot={
        kind:input.kind,camera:camera.position.clone(),
        rotation:camera.quaternion.clone(),art,old,sig
      };
      return {name:input.name,
        oldCalls:renderer.info.render.calls,
        oldTriangles:renderer.info.render.triangles,
        oldVisible:old.visible&&sig.visible&&!art.visible,
        physics:h4IndustrialColliders.length};
    },spec);
    const originalPng=await page.screenshot({path:path.join(directory,
      'gfx06e-'+spec.name+'-before.png')});
    const after=await page.evaluate(()=>{
      const p=window.__gfx06eShot;
      p.art.visible=true;p.old.visible=false;p.sig.visible=false;
      renderer.render(scene,camera);
      const geometry=[];
      p.art.traverse(obj=>{if(obj.isMesh)geometry.push(obj)});
      return {
        afterCalls:renderer.info.render.calls,
        afterTriangles:renderer.info.render.triangles,
        artParts:geometry.length,
        sameCamera:camera.position.distanceTo(p.camera)<.001&&
          camera.quaternion.angleTo(p.rotation)<.001,
        visualOnly:geometry.every(x=>
          x.userData.visualOnly&&!x.userData.h4Collider),
        artVisible:p.art.visible&&!p.old.visible&&!p.sig.visible
      };
    });
    const updatedPng=await page.screenshot({path:path.join(directory,
      'gfx06e-'+spec.name+'-after.png')});
    out.gfx06eGallery.push({...before,...after,
      screenshotChanged:!originalPng.equals(updatedPng)});
    await page.evaluate(()=>{delete window.__gfx06eShot});
  }
  // The final fly-through screenshot remains tied to player laneX=0,
  // altitude 1050, not inside any ornamental structure.
  const finalAscent=await page.evaluate(()=>{
    state.map4Phase=4;state.routeProgress=47900;
    state.laneX=0;state.laneY=1050;
    const near=h4WorldPosition(47700,0,1050),
      ahead=h4WorldPosition(49400,0,1460);
    camera.position.copy(near);camera.lookAt(ahead);
    camera.fov=68;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();
    h4UpdateCinematicAtmosphere(18);
    renderer.render(scene,camera);
    return {
      progress:state.routeProgress,
      altitude:state.laneY,
      map4:state.activeMap===MAP_MODES.MAP4,
      launchArt:h4WorldLandmarks.find(l=>l.kind==='launch')
        .group.children.some(c=>c.userData.h4Gfx06e),
      industrialColliderCount:h4IndustrialColliders.length,
      drawCalls:renderer.info.render.calls,
      triangles:renderer.info.render.triangles
    };
  });
  out.gfx06eAscent=finalAscent;
  await page.screenshot({path:path.join(directory,
    'gfx06e-LM12-clear-ascent-corridor.png')});
  await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
  assert.equal(out.gfx06eGallery.length,3);
  // Scene draw calls are NOT expected to increase: optimized authored art
  // may use fewer draw calls or triangles than the original repeated boxes.
  // The correct acceptance is verified camera lock, physics preservation,
  // and a real screenshot pixel change, with both costs logged as evidence.
  console.log('NEXT06 SAME CAMERA GALLERY',JSON.stringify(out.gfx06eGallery));
  assert(out.gfx06eGallery.every(e=>
    e.oldVisible&&e.artVisible&&e.sameCamera&&e.visualOnly&&
    e.physics===36&&e.artParts>=20&&e.screenshotChanged&&
    e.oldCalls>0&&e.afterCalls>0&&
    e.oldTriangles>0&&e.afterTriangles>0));
  assert(out.gfx06eAscent.map4&&out.gfx06eAscent.altitude>=850&&
    out.gfx06eAscent.launchArt&&
    out.gfx06eAscent.industrialColliderCount===36);
  // NEXT07: three true same-camera, same-sky screenshot pairs. Toggle
  // ONLY 86 render mesh identities, decorative contact shadows and local
  // point lights. No physics, waypoint, route or HUD state is changed.
  out.gfx07BeforeAfter=[];
  await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
  for(const spec of [
    {name:'final-outpost',kind:'outpost',progress:36200,laneY:410},
    {name:'final-spaceport',kind:'spaceport',progress:42600,laneY:520},
    {name:'final-orbit-launch',kind:'launch',progress:48300,laneY:1110}
  ]){
    const old=await page.evaluate(input=>{
      state.paused=true;state.map4Phase=4;
      state.routeProgress=input.progress;
      state.laneX=0;state.laneY=input.laneY;
      const lm=h4WorldLandmarks.find(l=>l.kind===input.kind);
      const hero=lm.group.children.find(c=>c.userData.h4Gfx06e);
      const aim=hero.children.find(c=>c.isMesh&&
        (c.name.includes('CITADEL')||c.name.includes('FLIGHT_DECK')||
         c.name.includes('ROCKET_MAIN_STAGE')));
      const from=h4WorldPosition(input.progress-1850,0,input.laneY+120);
      camera.position.copy(from);camera.lookAt(aim.position);
      camera.fov=60;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      const ground=planetaryWorldRegions[3].children[0];
      const originals=h4Gfx07Styled.map(mesh=>({
        mesh,modernGeometry:mesh.geometry,modernMaterial:mesh.material
      }));
      const shadows=h4Gfx07Shadows.map(mesh=>({
        mesh,visible:mesh.visible
      }));
      const lights=h4Gfx07Lights.map(light=>({
        light,visible:light.visible
      }));
      window.__gfx07AB={
        cam:camera.position.clone(),quaternion:camera.quaternion.clone(),
        originals,ground,modernMap:ground.material.map,shadows,lights
      };
      for(const v of originals){
        v.mesh.geometry=v.mesh.userData.h4Gfx07OriginalGeometry;
        v.mesh.material=v.mesh.userData.h4Gfx07OriginalMaterial;
      }
      ground.material.map=h4SurfaceMaps.ground;
      ground.material.needsUpdate=true;
      shadows.forEach(v=>v.mesh.visible=false);
      lights.forEach(v=>v.light.visible=false);
      renderer.render(scene,camera);
      return {
        name:input.name,oldCalls:renderer.info.render.calls,
        oldTriangles:renderer.info.render.triangles,
        oldGeometryCount:originals.length,
        colliderCount:h4IndustrialColliders.length
      };
    },spec);
    const oldBuffer=await page.screenshot({path:path.join(directory,
      'gfx07-'+spec.name+'-old.png')});
    const latest=await page.evaluate(()=>{
      const a=window.__gfx07AB;
      for(const o of a.originals){
        o.mesh.geometry=o.modernGeometry;o.mesh.material=o.modernMaterial;
      }
      a.ground.material.map=a.modernMap;
      a.ground.material.needsUpdate=true;
      a.shadows.forEach(v=>v.mesh.visible=v.visible);
      a.lights.forEach(v=>v.light.visible=v.visible);
      renderer.render(scene,camera);
      const res={
        newCalls:renderer.info.render.calls,
        newTriangles:renderer.info.render.triangles,
        sameCamera:camera.position.distanceTo(a.cam)<.001&&
          camera.quaternion.angleTo(a.quaternion)<.001,
        newGeometryCount:h4Gfx07Styled.filter(m=>
          m.geometry.name.startsWith('MAP4_GFX07_')).length,
        fog:scene.fog.density,
        liveLights:h4Gfx07Stats.activeLights
      };
      delete window.__gfx07AB;
      return res;
    });
    const newBuffer=await page.screenshot({path:path.join(directory,
      'gfx07-'+spec.name+'-new.png')});
    out.gfx07BeforeAfter.push({...old,...latest,
      screenshotChanged:!oldBuffer.equals(newBuffer)});
  }
  await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
  assert.equal(out.gfx07BeforeAfter.length,3);
  console.log('NEXT07 SAME CAMERA COMPARISON',
    JSON.stringify(out.gfx07BeforeAfter));
  assert(out.gfx07BeforeAfter.every(e=>
    e.sameCamera&&e.oldGeometryCount===86&&
    e.newGeometryCount===86&&e.colliderCount===36&&
    e.oldCalls>0&&e.newCalls>0&&
    e.oldTriangles>0&&e.newTriangles>0&&e.screenshotChanged),
    'final-sector overhaul must be visibly different without altering physics');
  // GFX08: repeatable renderer proof of the five bounded transient pools.
  // VFX are deliberately staged at known spots in the live 3D engine for
  // framing; the REAL weapon, impact and explosion hooks are independently
  // verified by the browser smoke test.
  out.gfx08VfxGallery=[];
  await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
  for(const shot of [
    {name:'arena-muzzle-impact',progress:13150,phase:2,
      laneY:360,front:950},
    {name:'industrial-explosion-engine',progress:22800,phase:3,
      laneY:320,front:900},
    {name:'orbital-ion-boost',progress:47500,phase:4,
      laneY:1130,front:900}
  ]){
    const before=await page.evaluate(v=>{
      state.paused=true;state.map4Phase=v.phase;
      state.routeProgress=v.progress;state.laneX=0;state.laneY=v.laneY;
      const start=h4WorldPosition(v.progress-260,0,v.laneY+130);
      const focus=h4WorldPosition(v.progress+v.front,0,v.laneY+70);
      camera.position.copy(start);camera.lookAt(focus);
      camera.fov=62;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      h4Gfx08Reset();
      renderer.render(scene,camera);
      window.__gfx08Frame={
        focus,cam:camera.position.clone(),
        rotation:camera.quaternion.clone()
      };
      return {drawCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        active:h4Gfx08Meshes.map(m=>m.count),
        colliderCount:h4IndustrialColliders.length};
    },shot);
    const oldPng=await page.screenshot({path:path.join(directory,
      'gfx08-'+shot.name+'-before.png')});
    const after=await page.evaluate((v)=>{
      const p=window.__gfx08Frame;
      const target=p.focus;
      const direction=p.focus.clone().sub(camera.position).normalize();
      const right=getRaceFrameAtDistance(v.progress).right;
      const up=getRaceFrameAtDistance(v.progress).up;
      const place=(x,y,z)=>target.clone()
        .addScaledVector(right,x).addScaledVector(up,y)
        .addScaledVector(direction,z);
      h4Gfx08Emit('MUZZLE',place(-95,10,-135),13,0x7cffff,direction);
      h4Gfx08Emit('MUZZLE',place(95,10,-135),13,0x75ffb3,direction);
      h4Gfx08Emit('IMPACT',place(0,20,0),11,0x85faff);
      h4Gfx08Emit('SHOCK',place(30,15,60),7,0xffb777);
      for(let i=0;i<3;i++){
        h4Gfx08Emit('SMOKE',place(-40+i*35,10+i*18,50),
          28,0x98a6b1);
      }
      h4Gfx08Emit('ENGINE',place(0,-20,-200),16,0x8cefff);
      h4Gfx08Update(.032);
      renderer.render(scene,camera);
      return {
        drawCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        active:h4Gfx08Meshes.map(m=>m.count),
        sameCamera:camera.position.distanceTo(p.cam)<.001&&
          camera.quaternion.angleTo(p.rotation)<.001,
        sharedMeshes:h4Gfx08Root.children.length,
        visualOnly:h4Gfx08Meshes.every(m=>
          m.userData.visualOnly&&!m.userData.h4Collider)
      };
    },shot);
    const newPng=await page.screenshot({path:path.join(directory,
      'gfx08-'+shot.name+'-after.png')});
    out.gfx08VfxGallery.push({
      name:shot.name,before,after,
      screenshotChanged:!oldPng.equals(newPng)
    });
    await page.evaluate(()=>{h4Gfx08Reset();delete window.__gfx08Frame});
  }
  await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
  console.log('GFX08 VFX PAIRS',JSON.stringify(out.gfx08VfxGallery));
  assert.equal(out.gfx08VfxGallery.length,3);
  assert(out.gfx08VfxGallery.every(item=>
    item.before.active.every(n=>n===0)&&
    item.after.active.every(n=>n>0)&&
    item.before.colliderCount===36&&
    item.after.sharedMeshes===5&&item.after.visualOnly&&
    item.after.sameCamera&&item.screenshotChanged&&
    item.after.drawCalls>=item.before.drawCalls+4));
  // GFX-03 supplemental close-range hero compositions (original 12 probes
  // remain unchanged, preserving apples-to-apples GFX-00 metrics).
  out.heroGallery=[];
  for(const hero of [
    {kind:'stonegate',progress:1950,targetSide:-2080,viewSide:-1050},
    {kind:'mesa',progress:6100,targetSide:2300,viewSide:1200},
    {kind:'observation',progress:10100,targetSide:-2260,viewSide:-1160}
  ]){
    const detail=await page.evaluate(data=>{
      state.paused=true;
      state.routeProgress=data.progress;
      state.map4Phase=1;
      state.laneX=data.viewSide;
      state.laneY=230;
      camera.position.copy(h4WorldPosition(data.progress-880,data.viewSide,220));
      const focal=h4WorldPosition(data.progress,data.targetSide,-40);
      camera.lookAt(focal);
      camera.fov=61;camera.updateProjectionMatrix();
      updatePlanetaryWorld();
      h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(14.0);
      renderer.render(scene,camera);
      const site=h4WorldLandmarks.find(p=>p.kind===data.kind);
      const sculpture=site.group.children.find(x=>x.userData.h4Gfx03Hero);
      return {
        name:site.name,kind:site.kind,childCount:sculpture.children.length,
        drawCalls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        cameraDistance:camera.position.distanceTo(focal)
      };
    },hero);
    await page.screenshot({path:path.join(directory,'hero-'+hero.kind+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,'hero-'+hero.kind+'-art-only.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.heroGallery.push(detail);
  }
  assert.deepEqual(out.heroGallery.map(x=>x.kind),['stonegate','mesa','observation']);
  assert(out.heroGallery.every(x=>x.childCount>=12&&x.drawCalls>0));

  if(await page.evaluate(()=>!!window.Map4ArtAssets?.has('wreck_carrier')))
    await page.waitForFunction(()=>h4Gfx04CarrierStats.mounted===1 ||
      h4Gfx04CarrierStats.failed>0,null,{timeout:25000});
  // GFX-04 fixed warfront gallery: same camera/progress every subsequent wave.
  // Save both normal HUD and art-only images, never fabricate a quality score.
  out.warfrontGallery=[];
  for(const sceneShot of [
    {name:'center',progress:13120,targetX:0,viewX:0,viewProgress:12490,
      targetY:-310,viewY:300},
    {name:'wreck',progress:13180,targetX:-1250,viewX:-680,viewProgress:12600,
      targetY:-245,viewY:320},
    {name:'defense',progress:13160,targetX:1250,viewX:540,viewProgress:12600,
      targetY:-125,viewY:450}
  ]){
    const frame=await page.evaluate(data=>{
      state.paused=true;
      state.map4Phase=2;
      state.routeProgress=data.progress;
      state.laneX=data.viewX;state.laneY=data.viewY;
      camera.position.copy(h4WorldPosition(data.viewProgress,data.viewX,data.viewY));
      const focus=h4WorldPosition(data.progress,data.targetX,data.targetY);
      camera.lookAt(focus);
      camera.fov=64;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();
      h4UpdateCinematicAtmosphere(18);
      renderer.render(scene,camera);
      const art=h4ArenaWarfrontGroups.find(g=>
        g.userData.pocketId===data.name.toUpperCase());
      return {name:data.name,artVisible:art?.visible,
        customParts:art?.children.find(g=>g.userData.h4Gfx04Pocket)
          ?.children.length||0,
        triangles:renderer.info.render.triangles,
        drawCalls:renderer.info.render.calls};
    },sceneShot);
    await page.screenshot({path:path.join(directory,'warfront-'+sceneShot.name+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,
      'warfront-'+sceneShot.name+'-art-only.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.warfrontGallery.push(frame);
  }
  assert.equal(out.warfrontGallery.length,3);
  assert(out.warfrontGallery.every(x=>x.artVisible && x.customParts>=13 &&
    x.triangles>1000),'three GFX04 warfront models render');
  // GFX-04B: dedicated hero evidence from two real camera angles, including
  // fully unobstructed art. All standard GFX00/GFX04 viewpoints stay unchanged.
  out.carrierGallery=[];
  for(const probe of [
    {name:'carrier-near',at:12640,x:-250,y:410},
    {name:'carrier-flank',at:13520,x:-2180,y:430}
  ]){
    const info=await page.evaluate(p=>{
      state.paused=true;state.map4Phase=2;state.routeProgress=13250;
      camera.position.copy(h4WorldPosition(p.at,p.x,p.y));
      const focal=h4WorldPosition(13175,-1330,-240);
      camera.lookAt(focal);
      camera.fov=58;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(18);
      h4UpdateGfx01LOD();renderer.render(scene,camera);
      const wreck=h4ArenaWarfrontGroups.find(g=>g.userData.pocketId==='WRECK');
      const art=wreck.children.find(g=>g.userData.h4Gfx04Pocket==='WRECK');
      const carrier=art?.children.find(o=>o.userData.h4Gfx04Carrier);
      return {name:p.name,artVisible:art?.visible!==false,
        imported:!!carrier,LOD:carrier?.userData.h4Gfx01LOD,
        replacements:h4Gfx04CarrierStats.hiddenLegacy,
        distance:camera.position.distanceTo(focal),
        calls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
    },probe);
    await page.screenshot({path:path.join(directory,probe.name+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,probe.name+'-art-only.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.carrierGallery.push(info);
  }
  assert.equal(out.carrierGallery.length,2);
  if(await page.evaluate(()=>!!window.Map4ArtAssets?.has('wreck_carrier'))){
    assert(out.carrierGallery.every(x=>x.imported && x.replacements===8),
      'two carrier views show complete imported model and hidden old hull');
  }
  // GFX04C detailed evidence: twin defense structures from approach and
  // flank, with normal HUD and an art-only view at matching camera settings.
  if(await page.evaluate(()=>!!window.Map4ArtAssets?.has('elite_battery')))
    await page.waitForFunction(()=>h4Gfx04DefenseStats.mounted===2 ||
      h4Gfx04DefenseStats.failed>0,null,{timeout:30000});
  out.batteryGallery=[];
  for(const shot of [
    {name:'defense-twins-approach',at:12600,x:890,y:420,
      targetProgress:13100,targetX:1250,targetY:30},
    {name:'defense-tower-flank',at:13160,x:2630,y:560,
      targetProgress:13100,targetX:1695,targetY:60}
  ]){
    const snapshot=await page.evaluate(p=>{
      state.paused=true;state.routeProgress=13200;
      state.map4Phase=2;
      camera.position.copy(h4WorldPosition(p.at,p.x,p.y));
      const focal=h4WorldPosition(p.targetProgress,p.targetX,p.targetY);
      camera.lookAt(focal);camera.fov=62;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(19);
      h4UpdateGfx01LOD();renderer.render(scene,camera);
      const group=h4ArenaWarfrontGroups.find(x=>x.userData.pocketId==='DEFENSE');
      const art=group.children.find(x=>x.userData.h4Gfx04Pocket==='DEFENSE');
      return {name:p.name,groupVisible:group.visible,
        mounted:h4Gfx04DefenseStats.mounted,
        decals:h4Gfx04DefenseStats.scorchDecals,
        artVisible:art.visible,
        drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles};
    },shot);
    await page.screenshot({path:path.join(directory,shot.name+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,shot.name+'-art-only.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.batteryGallery.push(snapshot);
  }
  assert.equal(out.batteryGallery.length,2);
  if(await page.evaluate(()=>!!window.Map4ArtAssets?.has('elite_battery')))
    assert(out.batteryGallery.every(v=>v.mounted===2&&v.decals===2),
      'two fortified batteries and two scorched bases appear in release');
  // GFX04D fixed smoke and event-driven spark proof in the same arena,
  // with original camera probes untouched for A/B comparison.
  const plume=await page.evaluate(()=>{
    state.paused=true;state.map4Phase=2;state.routeProgress=13200;
    camera.position.copy(h4WorldPosition(12600,-620,360));
    camera.lookAt(h4WorldPosition(13220,-1250,-120));
    camera.fov=64;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(18);
    h4UpdateGfx04D(.03,8.4);
    const point=h4WorldPosition(13180,-1210,-130);
    h4EmitGfx04DSparks(point,true);
    h4UpdateGfx04D(.03,8.6);
    renderer.render(scene,camera);
    return {smoke:h4Gfx04DStats.smokePoints,
      visibleSparks:h4Gfx04DStats.sparksActive,
      plumes:h4Gfx04DStats.plumes,
      rendering:renderer.info.render.calls};
  });
  await page.screenshot({path:path.join(directory,'gfx04d-smoke-sparks.png')});
  await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
  await page.screenshot({path:path.join(directory,'gfx04d-smoke-sparks-art-only.png')});
  await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
  assert.equal(plume.smoke,72);
  assert(plume.visibleSparks>0);
  out.battleVFX=plume;
  // GFX04E: two comparable fixed warfront cameras with heat lighting ON
  // and a cold-light control. Use the same gameplay world for both captures.
  out.gfx04eGallery=[];
  for(const p of [
    {id:'wreck',at:12610,x:-590,y:380,target:13175,lane:-1240,alt:-120},
    {id:'defense',at:12640,x:600,y:400,target:13095,lane:1280,alt:5}
  ]){
    const result=await page.evaluate(v=>{
      state.paused=true;state.routeProgress=13200;state.map4Phase=2;
      camera.position.copy(h4WorldPosition(v.at,v.x,v.y));
      camera.lookAt(h4WorldPosition(v.target,v.lane,v.alt));
      camera.fov=60;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(20);
      h4UpdateGfx01LOD();h4UpdateGfx04D(0,28.45);
      renderer.render(scene,camera);
      return {smokeFields:h4Gfx04EStats.shaderSmokeFields,
        lightCount:h4Gfx04EStats.activeLights,
        decals:h4Gfx04EStats.scorchDecals,
        calls:renderer.info.render.calls};
    },p);
    await page.screenshot({path:path.join(directory,'gfx04e-'+p.id+'-hud.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,'gfx04e-'+p.id+'-art.png')});
    await page.evaluate(()=>{
      h4Gfx04EState.lights.forEach(x=>{x.light.intensity=0;});
      h4Gfx04EState.glows.forEach(x=>{x.visible=false;});
      renderer.render(scene,camera);
    });
    await page.screenshot({path:path.join(directory,'gfx04e-'+p.id+'-no-heat.png')});
    await page.evaluate(()=>{
      document.body.classList.remove('map4-photo-probe');
      h4UpdateGfx04D(0,28.45);
    });
    out.gfx04eGallery.push({id:p.id,...result});
  }
  assert.equal(out.gfx04eGallery.length,2);
  assert(out.gfx04eGallery.every(x=>x.lightCount===2&&x.decals===3));
  // GFX05 authentic 3D ship close-ups, taken from real world objects rather
  // than drawings or screenshots fabricated outside the game renderer.
  out.craftGallery=[];
  for(const craft of [
    {id:'player',type:'PLAYER'},
    {id:'pilot',type:'RACER'},
    {id:'elite',type:'HUNTER'}
  ]){
    const data=await page.evaluate(spec=>{
      state.paused=true;state.map4Phase=1;state.routeProgress=650;
      updatePlanetaryWorld();
      const old={geoVisible:geoSwordMesh.visible,turret:turretGroup.visible};
      let model,root;
      if(spec.type==='PLAYER'){
        geoSwordMesh.visible=true;turretGroup.visible=false;
        model=h4GeoSwordArt.userData.h4Gfx05Craft;root=h4GeoSwordArt;
      }else if(spec.type==='RACER'){
        root=racers[0].mesh;model=root.userData.h4Gfx05Craft;
      }else{
        root=hunterTargets.find(x=>x.alive&&x.isElite)?.mesh;
        model=root?.userData.h4Gfx05Craft;
      }
      if(!model||!root)return {id:spec.id,visible:false};
      root.updateWorldMatrix(true,true);
      const pos=root.getWorldPosition(new THREE.Vector3());
      const offset=spec.type==='PLAYER'?
        new THREE.Vector3(20,11,26):new THREE.Vector3(26,15,34);
      camera.position.copy(pos).add(offset);
      camera.lookAt(pos);
      camera.fov=47;camera.updateProjectionMatrix();
      h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(17);
      renderer.render(scene,camera);
      const counts={id:spec.id,visible:true,model:model.name,
        components:model.children.length,
        wings:model.children.filter(x=>x.name.includes('SWEPT_WING')).length,
        engines:model.children.filter(x=>x.name==='GFX05_LIVE_THRUSTER').length,
        triangles:renderer.info.render.triangles,
        drawCalls:renderer.info.render.calls};
      if(spec.type==='PLAYER'){
        // Restore after screenshots outside this evaluate in caller.
        window.__gfx05ViewerRestore=old;
      }
      return counts;
    },craft);
    assert.equal(data.visible,true,'ship exists: '+craft.id);
    await page.screenshot({path:path.join(directory,'craft-'+craft.id+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,'craft-'+craft.id+'-art-only.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.craftGallery.push(data);
  }
  await page.evaluate(()=>{
    if(window.__gfx05ViewerRestore){
      geoSwordMesh.visible=window.__gfx05ViewerRestore.geoVisible;
      turretGroup.visible=window.__gfx05ViewerRestore.turret;
      delete window.__gfx05ViewerRestore;
    }
  });
  assert(out.craftGallery.every(x=>x.wings===2&&x.engines===2));
  // GFX05B geometry/material consistency: same rendering camera, varied
  // pilot liveries, shared microtexture surfaces, no edited glamour image.
  out.gfx05bCloseups=[];
  for(const spec of [
    {name:'player-texture',progress:14100,kind:'PLAYER',lane:0},
    {name:'racer-texture',progress:14100,kind:'RACER',lane:240},
    {name:'hunter-texture',progress:14100,kind:'HUNTER',lane:-260}
  ]){
    const m=await page.evaluate(info=>{
      state.paused=true;state.routeProgress=info.progress;state.map4Phase=2;
      const target=info.kind==='PLAYER'?h4GeoSwordArt:
        info.kind==='RACER'?racers[0].mesh:hunterTargets[0].mesh;
      target.updateWorldMatrix(true,false);
      const center=new THREE.Vector3();
      target.getWorldPosition(center);
      const rot=getRaceFrameAtDistance(info.progress);
      camera.position.copy(center)
        .addScaledVector(rot.right,info.kind==='PLAYER'?46:64)
        .addScaledVector(rot.up,info.kind==='PLAYER'?30:37)
        .addScaledVector(rot.tangent,48);
      camera.lookAt(center);
      camera.fov=52;camera.updateProjectionMatrix();
      updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateGfx04D(0,7.3);
      renderer.render(scene,camera);
      return {name:info.name,geometryCount:h4Gfx05SharedGeometries.size,
        materialCount:h4Gfx05SharedMaterials.size,
        paintTextures:h4Gfx05bStats.textures,
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles};
    },spec);
    await page.screenshot({path:path.join(directory,'gfx05b-'+spec.name+'.png')});
    await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
    await page.screenshot({path:path.join(directory,'gfx05b-'+spec.name+'-art.png')});
    await page.evaluate(()=>document.body.classList.remove('map4-photo-probe'));
    out.gfx05bCloseups.push(m);
  }
  assert.equal(out.gfx05bCloseups.length,3);
  assert(out.gfx05bCloseups.every(x=>x.paintTextures===3));
  // GFX05C: identical player camera and scene with animated heat-plume
  // instancing enabled and disabled, proving an in-engine A/B improvement.
  const heatEvidence=await page.evaluate(()=>{
    state.paused=true;state.map4Phase=2;state.routeProgress=13200;
    const before=geoSwordMesh.visible;
    geoSwordMesh.visible=true;
    const craft=h4GeoSwordArt.userData.h4Gfx05Craft;
    craft.updateWorldMatrix(true,false);
    const center=craft.getWorldPosition(new THREE.Vector3());
    const rotation=craft.getWorldQuaternion(new THREE.Quaternion());
    camera.position.copy(center)
      .add(new THREE.Vector3(8,4,34).applyQuaternion(rotation));
    camera.lookAt(center.clone().add(
      new THREE.Vector3(0,0,3.0).applyQuaternion(rotation)));
    camera.fov=52;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(16);
    h4UpdateGfx05cExhaust(12.30);
    renderer.render(scene,camera);
    window.__gfx05cViewerRestore={geo:before};
    return {
      plumeCount:h4Gfx05cMesh.count,
      paletteCount:h4Gfx05cPalette.length,
      drawCalls:renderer.info.render.calls,
      triangles:renderer.info.render.triangles
    };
  });
  await page.evaluate(()=>document.body.classList.add('map4-photo-probe'));
  await page.screenshot({path:path.join(directory,'gfx05c-player-engine-heat.png')});
  await page.evaluate(()=>{
    h4Gfx05cMesh.count=0;
    renderer.render(scene,camera);
  });
  await page.screenshot({path:path.join(directory,'gfx05c-player-engine-heat-off.png')});
  await page.evaluate(()=>{
    document.body.classList.remove('map4-photo-probe');
    geoSwordMesh.visible=window.__gfx05cViewerRestore.geo;
    delete window.__gfx05cViewerRestore;
    h4UpdateGfx05cExhaust(12.30);
  });
  assert(heatEvidence.plumeCount>0&&heatEvidence.plumeCount<=28);
  out.gfx05cHeatEvidence=heatEvidence;
  const durations=await page.evaluate(()=>{
    state.paused=true;
    const durations=[];
    for(let i=0;i<18;i++){
      const start=performance.now();
      renderer.render(scene,camera);
      durations.push(performance.now()-start);
    }
    return durations;
  });
  out.swiftshaderRenderMilliseconds={
    median:percentile(durations,.5),
    p95:percentile(durations,.95),
    samples:durations.length
  };
  out.errors=errors;
  assert.equal(out.cases.length,12);
  assert(out.cases.every(v=>v.isMap4));
  assert(out.cases.every(v=>v.calls>0&&v.triangles>1000));
  assert.equal(errors.length,0,errors.join(' | '));
  fs.writeFileSync(path.join(directory,'metrics.json'),JSON.stringify(out,null,2)+'\n');
  console.log('GFX-00 PASS',JSON.stringify({
    probes:out.cases.length,heroViews:out.heroGallery.length,
    warfrontViews:out.warfrontGallery.length,
    firstTerrainVertices:out.cases[0].terrainVertices,
    medianDrawCalls:percentile(out.cases.map(c=>c.calls),.5),
    medianTriangles:percentile(out.cases.map(c=>c.triangles),.5),
    metrics:path.relative(process.cwd(),path.join(directory,'metrics.json'))
  }));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
