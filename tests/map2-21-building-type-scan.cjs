// MAP2-21 classify existing Map4 road groups for authored sequence design
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
  await page.locator('#map-choice-2').click();
  const out=await page.evaluate(()=>{
    const road=window.starbladeMap2BuildingRoad;
    const classify=names=>{
      const s=names.join('|');
      if(/CITY_DISTRICT/i.test(s))return 'CITY';
      if(/FINAL_CORRIDOR/i.test(s))return 'CORRIDOR';
      if(/INDUSTRIAL_PART/i.test(s))return 'INDUSTRIAL';
      if(/SPACEPORT|LAUNCH/i.test(s))return 'SPACEPORT';
      if(/REFINERY|FACTORY|POWER/i.test(s))return 'PLANT';
      if(/STONEGATE|OBSERVATION|OUTPOST/i.test(s))return 'LANDMARK';
      if(/EXACT_MAP4_(?:W05|STATION|[1-6]_)/i.test(s)||/W05_INDUSTRY_STATION/i.test(s))return 'STATION';
      return 'OTHER';
    };
    const rows=road.groups.filter(g=>g.open).map((g,i)=>({
      i,d:g.d,x:g.x,y:g.y,roots:g.roots,framed:g.framed,
      type:classify(g.rootNames||[]),
      names:g.rootNames||[]
    }));
    const counts=Object.fromEntries([...new Set(rows.map(r=>r.type))].map(t=>[t,rows.filter(r=>r.type===t).length]));
    const tech=MAP2_SEGMENTS.filter(s=>s.kind==='TECH').map((s,idx)=>({
      idx,from:s.from*MAP2_DISTANCE,to:s.to*MAP2_DISTANCE,
      rows:rows.filter(r=>r.d>=s.from*MAP2_DISTANCE&&r.d<=s.to*MAP2_DISTANCE)
    }));
    return {counts,rows,tech};
  });
  console.log('MAP2-21 TYPE_SCAN '+JSON.stringify(out));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});