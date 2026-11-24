// MAP2-16 scan remaining final Map4 structure groups
'use strict';
const fs=require('node:fs'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof buildPlanetaryWorld==='function');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const report=await page.evaluate(()=>{
    const count=(root)=>{
      let meshes=0,instanced=0,groups=0,named=[];
      root.traverse(o=>{
        if(o!==root&&o.isGroup)groups++;
        if(o.isMesh||o.isInstancedMesh){
          meshes++;
          if(o.isInstancedMesh)instanced++;
          if(o.name)named.push(o.name);
        }
      });
      return {meshes,instanced,groups,named:named.slice(0,18)};
    };
    const regions=planetaryWorldRegions.map((region,ri)=>({
      region:ri,
      name:region.name||null,
      visible:region.visible,
      children:region.children.map((child,ci)=>({
        ci,name:child.name||null,type:child.type,visible:child.visible,
        userData:Object.keys(child.userData||{}).filter(k=>/h4|city|industrial|visual|region|arena|gfx/i.test(k)).slice(0,12),
        ...count(child)
      })).filter(x=>x.meshes>0)
    }));
    const known={
      industry:h4IndustrialGroups.map(g=>({name:g.name,...count(g)})),
      city:h4City02DistrictGroup?{name:h4City02DistrictGroup.name,...count(h4City02DistrictGroup)}:null,
      arenaWarfront:typeof h4ArenaWarfrontGroups!=='undefined'?h4ArenaWarfrontGroups.map(g=>({name:g.name,visible:g.visible,...count(g)})):[],
      arenaSkyline:typeof h4Gfx11bArenaSkylineGroup!=='undefined'&&h4Gfx11bArenaSkylineGroup?{name:h4Gfx11bArenaSkylineGroup.name,visible:h4Gfx11bArenaSkylineGroup.visible,...count(h4Gfx11bArenaSkylineGroup)}:null,
      arenaWreck:typeof h4Next22kArenaWreckGroup!=='undefined'&&h4Next22kArenaWreckGroup?{name:h4Next22kArenaWreckGroup.name,visible:h4Next22kArenaWreckGroup.visible,...count(h4Next22kArenaWreckGroup)}:null,
      landmarks:(typeof h4WorldLandmarks!=='undefined'?h4WorldLandmarks:[]).map(x=>({at:x.at,zone:x.zone,name:x.group?.name||null,visible:x.group?.visible,...count(x.group)})),
      scenery:(typeof h4RegionScenery!=='undefined'?h4RegionScenery:[]).map((x,i)=>({i,regionIndex:x.regionIndex,near:x.near?{name:x.near.name||null,visible:x.near.visible,...count(x.near)}:null,far:x.far?{name:x.far.name||null,visible:x.far.visible,...count(x.far)}:null}))
    };
    return {regions,known};
  });
  console.log('MAP2-16 STRUCTURE_SCAN '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
