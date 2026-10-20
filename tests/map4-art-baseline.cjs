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
