/* GFX-01 offline release validation: real GLB parse, scene mounts,
 * asset cache, procedural fallback, and no network dependence. */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url'),assert=require('node:assert/strict');
const game=path.resolve(__dirname,'../dist/Uzay_Yarisi_Guncel_Oynanabilir.html');
const build=path.resolve(__dirname,'../dist/gfx01-build-manifest.json');
assert(fs.existsSync(game),'GFX01 bundle must be built before test');
const html=fs.readFileSync(game,'utf8');
const manifest=JSON.parse(fs.readFileSync(build,'utf8'));
assert(!/<script[^>]+src=["']https?:/i.test(html),'external script in offline file');
assert(!/<link[^>]+href=["']https?:/i.test(html),'external stylesheet in offline file');
assert.equal(Object.keys(manifest.assets).length,15,'5 subjects x 3 sculpted LODs');
const {makePack,validateGLB}=require('../tools/gfx01-assets.cjs');
const pack=makePack();
for(const [id,v] of Object.entries(pack)){
 const detail=validateGLB(Buffer.from(v.base64,'base64'),id);
 assert(detail.triangles>10,'meaningful GLB geometry '+id);
 assert(detail.images>=1&&detail.uvSets>=1,'asset has embedded albedo texture and UV '+id);
 assert(v.sha256===manifest.assets[id].sha256,'GLB checksum integrity '+id);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1440,height:900}});
 const errors=[],network=[];
 page.on('pageerror',e=>errors.push(e.message));
 page.on('request',req=>{
  if(/^https?:/i.test(req.url()))network.push(req.url());
 });
 await page.route(/^https?:\/\//,route=>route.abort('blockedbyclient'));
 try {
  await page.goto(pathToFileURL(game).href,{waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForFunction(()=>typeof selectMap==='function' &&
   typeof Map4ArtAssets==='object',null,{timeout:15000});
  assert.equal(await page.evaluate(()=>typeof THREE.GLTFLoader),'function');
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>h4Gfx01Stats.mounted===3 ||
   h4Gfx01Stats.failed>0,null,{timeout:30000});
  await page.waitForFunction(()=>h4Gfx04CarrierStats.mounted===1 ||
   h4Gfx04CarrierStats.failed>0,null,{timeout:30000});
  await page.waitForFunction(()=>h4Gfx04DefenseStats.mounted===2 ||
   h4Gfx04DefenseStats.failed>0,null,{timeout:30000});
  const art=await page.evaluate(()=>{
   const root=h4WorldLandmarks;
   const imported=[];
   for(const lm of root){
    lm.group.traverse(o=>{if(o.userData.h4Gfx01Model)
      imported.push({site:lm.kind,id:o.userData.h4Gfx01Model,
       meshes:o.children[0].children.length,visible:o.visible});
    });
   }
   const oldPortal=root.find(x=>x.kind==='stonegate').group;
   let oldHidden=false;
   oldPortal.traverse(o=>{
    if(o.name==='MAP4_GFX03_CARVED_PORTAL_OPENING')oldHidden=!o.visible;
   });
   const before=Map4ArtAssets.status();
   return {
    state:{...h4Gfx01Stats},
    cache:before,imported,oldHidden,
    smokeVisible:planetaryWorldGroup.visible,
    shaders:h4SkyDome.visible,
    meshesImported:imported.length
   };
  });
  assert.equal(art.state.scheduled,3,'three mount requests');
  assert.equal(art.state.mounted,3,'three GLB instances mounted');
  assert.equal(art.state.failed,0,'no GLB loader failure');
  assert.equal(art.state.fallback,0,'all three sample GLBs provided');
  assert.equal(art.cache.decoded,15,'five GLB assets each have three decoded LODs');
  assert.equal(art.cache.cacheEntries,15,'fifteen decoded model cache entries');
  assert.deepEqual(art.imported.map(x=>x.id).sort(),
   ['canyon_arch','observatory_module','patrol_fighter']);
  assert(art.oldHidden,'fallback rock arch hides only after model loaded');
  assert.equal(art.smokeVisible,true);
  assert.equal(art.shaders,true);
  assert.equal(art.meshesImported,3);
  // GFX03B: the three new landmarks are not masked by the old W01 / VQ02
  // silhouettes. Only the actual imported radar surface replaces GFX03 dish.
  const composition=await page.evaluate(()=>{
    const sites=h4WorldLandmarks.filter(lm=>lm.zone===0);
    const count=sites.map(lm=>{
      const legacy=lm.group.children.find(c=>c.name==='MAP4_LEGACY_W01_'+lm.kind.toUpperCase());
      const signature=lm.group.children.find(c=>c.userData.signature===lm.kind);
      const sculpt=lm.group.children.find(c=>c.userData.h4Gfx03Hero);
      return {kind:lm.kind,legacyHidden:legacy?.visible===false,
        signatureHidden:signature?.visible===false,
        sculptVisible:sculpt?.visible!==false};
    });
    const obs=sites.find(lm=>lm.kind==='observation');
    let hiddenDish=0;
    obs.group.traverse(o=>{
      if(o.userData.h4Gfx01Replaced==='observation'&&!o.visible)hiddenDish++;
    });
    const overlay=document.getElementById('hunter-competition-hud').getBoundingClientRect();
    const sector=document.getElementById('planetary-zone-hud').getBoundingClientRect();
    const flight=document.querySelector('.map4-flight-status').getBoundingClientRect();
    return {sites:count,hiddenDish,stats:{...h4Gfx03bCompositionStats},
      viewport:window.innerWidth,overlay:{x:overlay.x,top:overlay.top,width:overlay.width},
      sector:{x:sector.x,top:sector.top,width:sector.width},
      flight:{x:flight.x,top:flight.top,width:flight.width},
      hudEnabled:document.body.classList.contains('map4-composition')};
  });
  assert(composition.sites.every(s=>s.legacyHidden && s.signatureHidden &&
    s.sculptVisible),'three canyon heroes hide their superseded art');
  assert.equal(composition.stats.hiddenLegacy,3);
  assert.equal(composition.stats.hiddenSignatures,3);
  assert.equal(composition.hiddenDish,3,'loaded radar replaces three overlapping dish parts');
  assert(composition.stats.sightlineProps>=1,'hero sightlines decluttered');
  assert.equal(composition.hudEnabled,true);
  assert(composition.overlay.top<110 && composition.overlay.width<390,
    'ranking is a compact top-right panel');
  assert(composition.sector.top<32 && composition.sector.width<330,
    'sector guidance stays small and centered');
  assert(composition.flight.width<=430,'flight metrics no longer cover half the sky');
  const flagship=await page.evaluate(()=>{
    const pocket=h4ArenaWarfrontGroups.find(g=>g.userData.pocketId==='WRECK');
    const sculpt=pocket.children.find(g=>g.name==='MAP4_GFX04_WRECK_ART');
    const carrier=sculpt.children.find(g=>g.userData.h4Gfx04Carrier);
    const oldNames=h4Gfx04CarrierLegacyNames;
    const old=sculpt.children.filter(g=>oldNames.has(g.name));
    return {
      stats:{...h4Gfx04CarrierStats},
      holder:carrier?.name,
      lodCount:carrier?.children.length,
      oldTotal:old.length,
      legacyInvisible:old.every(g=>!g.visible),
      loadedVisualOnly:carrier?.children.every(g=>g.userData.visualOnly),
      collider:carrier?.userData.h4Collider||null,
      size:carrier?.scale.toArray(),
      sceneNested:!!carrier?.parent&&!!sculpt?.parent
    };
  });
  assert.equal(flagship.stats.mounted,1,'one imported cruiser replaces procedural hull');
  assert.equal(flagship.stats.failed,0,'new cruiser GLB loads without errors');
  assert.equal(flagship.stats.distinctLOD,3,'three cruiser LODs exist');
  assert.equal(flagship.oldTotal,8,'eight redundant old hull/engine pieces accounted for');
  assert.equal(flagship.stats.hiddenLegacy,8,'eight old hull/engine pieces hidden');
  assert.equal(flagship.legacyInvisible,true,'old hull does not z-fight imported flagship');
  assert.equal(flagship.loadedVisualOnly,true,'no physical GLB collision volumes');
  assert.equal(flagship.collider,null);
  assert.equal(flagship.sceneNested,true,'cruiser belongs to original warfront scene');
  // GFX04C: left/right towers have individual transforms, share parsed
  // geometry/material buffers, and replace exactly the 8 previous primitives.
  const defense=await page.evaluate(()=>{
    const pocket=h4ArenaWarfrontGroups.find(g=>g.userData.pocketId==='DEFENSE');
    const sculpt=pocket.children.find(g=>g.name==='MAP4_GFX04_DEFENSE_ART');
    const holders=sculpt.children.filter(x=>x.userData.h4Gfx04Defense);
    const old=sculpt.children.filter(x=>h4Gfx04DefenseOldNames.has(x.name));
    const decals=sculpt.children.filter(x=>x.name==='MAP4_GFX04C_SCORCHED_PAD');
    const left=holders.find(x=>x.name.includes('LEFT'));
    const right=holders.find(x=>x.name.includes('RIGHT'));
    const shared=left&&right?left.children[0].children[0].geometry===
      right.children[0].children[0].geometry:false;
    return {stats:{...h4Gfx04DefenseStats},
      holders:holders.map(x=>({name:x.name,position:x.position.toArray(),
        lods:x.children.length,artOnly:x.children.every(y=>y.userData.visualOnly)})),
      oldTotal:old.length,oldHidden:old.every(x=>!x.visible),
      scorch:decals.length,
      scorchDecorative:decals.every(x=>x.userData.visualOnly&&!x.userData.h4Collider),
      collider:holders.some(x=>x.userData.h4Collider),
      geometryShared:shared,
      positionsIndependent:left&&right?
        left.position.distanceTo(right.position)>500:false};
  });
  assert.equal(defense.stats.scheduled,1,'defense site mounted exactly once');
  assert.equal(defense.stats.mounted,2,'both armored towers loaded');
  assert.equal(defense.stats.failed,0,'no defense GLB load failed');
  assert.equal(defense.stats.fallback,0,'model replacement succeeded');
  assert.equal(defense.stats.hiddenLegacy,8,'eight former tower/radar pieces hidden');
  assert.equal(defense.oldTotal,8,'all eight superseded elements accounted for');
  assert(defense.oldHidden,'legacy blocks hidden only after new art ready');
  assert.equal(defense.holders.length,2);
  assert(defense.holders.every(x=>x.lods===3 && x.artOnly));
  assert.equal(defense.stats.lodGroups,2,'two independently culled 3-LOD models');
  assert.equal(defense.scorch,2,'two grounded burn marks installed');
  assert.equal(defense.scorchDecorative,true,'scorch decals never collide');
  assert.equal(defense.collider,false,'defense models never create invisible hitboxes');
  assert(defense.geometryShared,'both imported towers share GPU buffer geometry');
  assert(defense.positionsIndependent,'two batteries visibly separated in world');
  const reuses=await page.evaluate(async()=>{
   const a=await Map4ArtAssets.load('canyon_arch');
   const b=await Map4ArtAssets.load('canyon_arch');
   const now=Map4ArtAssets.status();
   return {decoded:now.decoded,clone: a!==b,
    sameGeometry:a.children[0].geometry===b.children[0].geometry};
  });
  assert.equal(reuses.decoded,15,'cache prevents GLB reparse');
  assert.equal(reuses.clone,true,'separate scene clones per use');
  assert.equal(reuses.sameGeometry,true,'GPU geometry is shared across clones');
  const levels=await page.evaluate(()=>{
    const item=h4Gfx01LODGroups.find(g=>g.userData.h4Gfx01Model==='canyon_arch');
    const restore=camera.position.clone();
    const probe=(meters)=>{
      camera.position.copy(item.position).add(new THREE.Vector3(meters,0,0));
      h4UpdateGfx01LOD();
      return {level:item.userData.h4Gfx01LOD,
       visible:item.children.map(v=>v.visible),
       meshes:item.children[item.userData.h4Gfx01LOD].children.length};
    };
    const near=probe(650),mid=probe(2700),far=probe(6000),returnNear=probe(550);
    camera.position.copy(restore);
    return {near,mid,far,returnNear,switches:h4Gfx01Stats.lodSwitches,
      groups:h4Gfx01Stats.lodGroups,
      geometryShared:item.children.every(root=>root.children.length>0)};
  });
  assert.deepEqual([levels.near.level,levels.mid.level,levels.far.level,
    levels.returnNear.level],[0,1,2,0],'actual runtime LOD transition order');
  assert.deepEqual(levels.far.visible,[false,false,true],
    'only a single LOD renders at far distance');
  assert.equal(levels.groups,6,'four sites plus two independent defensive GLB LOD groups');
  assert(levels.switches>=3,'LOD updates replace visible model without GLB parse');
  assert.equal(levels.geometryShared,true);
  const geometryBudget={};
  for(const id of ['canyon_arch','observatory_module','patrol_fighter','wreck_carrier','elite_battery']){
    const p0=manifest.assets[id].triangles;
    const p1=manifest.assets[id+'_lod1'].triangles;
    const p2=manifest.assets[id+'_lod2'].triangles;
    assert(p0>p1 && p1>p2,
      'three genuine triangle budgets required for '+id+': '+[p0,p1,p2]);
    geometryBudget[id]=[p0,p1,p2];
  }
  await page.screenshot({path:path.resolve(__dirname,'gfx01-offline-map4.png')});
  await page.evaluate(()=>endGame(false));
  await page.locator('#menu-btn').click();
  await page.locator('#map-choice-1').click();
  await page.locator('#start-btn').click();
  const map1=await page.evaluate(()=>({
   mode:state.activeMap,visible:planetaryWorldGroup.visible,
   tonemap:renderer.toneMapping===THREE.NoToneMapping,
   glow:h4SunHalo.visible
  }));
  assert.equal(map1.mode,'map1');
  assert.equal(map1.visible,false,'Map1 must not leak imported GLB world');
  assert.equal(map1.tonemap,true);
  assert.equal(map1.glow,false);
  assert.equal(await page.evaluate(()=>document.body.classList.contains('map4-composition')),
    false,'Map1 must not retain the Map4 art HUD mode');
  assert.deepEqual(network,[],'no remote requests in packaged game');
  assert.equal(errors.length,0,errors.join(' | '));
  console.log('GFX01 OFFLINE PASS',JSON.stringify({
   bytes:manifest.bundleBytes,glbLoaded:art.state.mounted,
   models:art.imported.map(x=>x.id),cacheDecodes:art.cache.decoded,
   LODTriangles:geometryBudget,carrierHiddenLegacy:flagship.stats.hiddenLegacy,
   twinBatteryMounts:defense.stats.mounted,decals:defense.scorch,
   networkRequests:network.length,map1Isolated:true
  }));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
