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
assert.equal(Object.keys(manifest.assets).length,3);
const {makePack,validateGLB}=require('../tools/gfx01-assets.cjs');
const pack=makePack();
for(const [id,v] of Object.entries(pack)){
 const detail=validateGLB(Buffer.from(v.base64,'base64'),id);
 assert(detail.triangles>10,'meaningful GLB geometry '+id);
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
  assert.equal(art.cache.decoded,3,'each distinct GLB decoded once');
  assert.equal(art.cache.cacheEntries,3,'three decoded model cache entries');
  assert.deepEqual(art.imported.map(x=>x.id).sort(),
   ['canyon_arch','observatory_module','patrol_fighter']);
  assert(art.oldHidden,'fallback rock arch hides only after model loaded');
  assert.equal(art.smokeVisible,true);
  assert.equal(art.shaders,true);
  assert.equal(art.meshesImported,3);
  const reuses=await page.evaluate(async()=>{
   const a=await Map4ArtAssets.load('canyon_arch');
   const b=await Map4ArtAssets.load('canyon_arch');
   const now=Map4ArtAssets.status();
   return {decoded:now.decoded,clone: a!==b,
    sameGeometry:a.children[0].geometry===b.children[0].geometry};
  });
  assert.equal(reuses.decoded,3,'cache prevents GLB reparse');
  assert.equal(reuses.clone,true,'separate scene clones per use');
  assert.equal(reuses.sameGeometry,true,'GPU geometry is shared across clones');
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
  assert.deepEqual(network,[],'no remote requests in packaged game');
  assert.equal(errors.length,0,errors.join(' | '));
  console.log('GFX01 OFFLINE PASS',JSON.stringify({
   bytes:manifest.bundleBytes,glbLoaded:art.state.mounted,
   models:art.imported.map(x=>x.id),cacheDecodes:art.cache.decoded,
   networkRequests:network.length,map1Isolated:true
  }));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
