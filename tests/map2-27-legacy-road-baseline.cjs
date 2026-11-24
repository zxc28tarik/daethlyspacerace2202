// MAP2-27 baseline — classify legacy central-road objects inside real building-chain spans
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
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  const out=await page.evaluate(()=>{
    const route=window.starbladeMap2ThroughRoute;
    const chains=window.starbladeMap2LongBuildingChains;
    const exact=o=>!!(o.userData?.map2ExactMap4Clone||o.userData?.map2ExactMap4CityClone||
      o.userData?.map2ExactMap4LandmarkClone||o.userData?.map2ExactMap4CorridorClone||
      o.userData?.map2ExactMap4IndustrialVisualPart||o.userData?.map2LongChainBridge);
    const inModuleSpan=d=>route.modules.some(m=>d>=m.entrance.distance-80&&d<=m.exit.distance+80);
    const inLongChain=d=>(chains?.chains||[]).some(c=>c.span>=10000&&d>=c.from&&d<=c.to);
    const prefix=name=>{
      if(!name)return '(unnamed)';
      const m=name.match(/^([A-Z0-9]+(?:_[A-Z0-9]+){0,3})/);
      return m?m[1]:name.slice(0,40);
    };
    const obstacleRows=[];
    for(const o of map2Obstacles){
      const d=Number(o.routeProgress);
      obstacleRows.push({
        d,name:o.mesh?.name||o.name||'',type:o.type||'',active:o.active!==false,
        exact:!!o.map2BuildingDerived||exact(o.mesh||{}),
        inModule:Number.isFinite(d)&&inModuleSpan(d),
        inLong:Number.isFinite(d)&&inLongChain(d),
        halfX:o.halfX,halfY:o.halfY,halfDepth:o.halfDepth,radius:o.radius,
        meshVisible:o.mesh?.visible!==false,
        keys:Object.keys(o).filter(k=>k.startsWith('map2')).sort()
      });
    }
    const group=(rows,keyFn)=>{
      const m={};
      for(const r of rows){const k=keyFn(r);m[k]=(m[k]||0)+1;}
      return Object.entries(m).sort((a,b)=>b[1]-a[1]);
    };
    const legacy=obstacleRows.filter(r=>!r.exact);
    const legacyIn=legacy.filter(r=>r.inModule);
    const legacyLong=legacy.filter(r=>r.inLong);

    const visuals=[];
    map2CourseGroup.traverse(o=>{
      if(o===map2CourseGroup||exact(o))return;
      const d=Number(o.userData?.map2TargetDistance??o.userData?.map2Distance??o.userData?.routeProgress);
      if(!Number.isFinite(d))return;
      visuals.push({
        d,name:o.name||'',type:o.type,visible:o.visible!==false,
        inModule:inModuleSpan(d),inLong:inLongChain(d),
        keys:Object.keys(o.userData||{}).filter(k=>k.startsWith('map2')).sort()
      });
    });
    const genericVisuals=visuals.filter(v=>v.inModule||v.inLong);
    const visualGroups={};
    for(const v of genericVisuals){
      const sig=prefix(v.name)+'|'+v.keys.slice(0,5).join(',');
      visualGroups[sig]=(visualGroups[sig]||0)+1;
    }
    return {
      obstacles:{total:obstacleRows.length,legacy:legacy.length,building:obstacleRows.filter(r=>r.exact).length,
        legacyInModule:legacyIn.length,legacyInLong:legacyLong.length,
        byName:group(legacy,r=>prefix(r.name)).slice(0,40),
        inModuleByName:group(legacyIn,r=>prefix(r.name)).slice(0,40),
        inLongByName:group(legacyLong,r=>prefix(r.name)).slice(0,40),
        sampleInModule:legacyIn.slice(0,120)},
      visuals:{total:visuals.length,inRelevant:genericVisuals.length,
        groups:Object.entries(visualGroups).sort((a,b)=>b[1]-a[1]).slice(0,70),
        sample:genericVisuals.slice(0,160)},
      route:{modules:route.modules.length,anchors:route.routeAnchors.length,coverage:chains.coveragePct,
        longest:chains.longest,retired:window.starbladeMap2RetiredLegacyObstacles||0},
      stats:window.starbladeMap2Layout?.visualStage
    };
  });
  console.log('MAP2-27 LEGACY_BASELINE '+JSON.stringify(out));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});