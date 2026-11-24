// MAP2-24 baseline: measure architectural handoff continuity before canyon linking
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
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  const out=await page.evaluate(()=>{
    const rows=window.starbladeMap2BuildingRoad.groups.filter(g=>g.open).sort((a,b)=>a.d-b.d);
    const links=[];
    for(let i=0;i<rows.length-1;i++){
      const a=rows[i],b=rows[i+1];
      if(map2Segment(a.d).kind!=='TECH'||map2Segment(b.d).kind!=='TECH'||b.d-a.d>2500)continue;
      links.push({
        i,dd:b.d-a.d,dx:b.x-a.x,dy:b.y-a.y,
        lateral:Math.abs(b.x-a.x),vertical:Math.abs(b.y-a.y),
        euclid:Math.hypot(b.x-a.x,b.y-a.y),
        aTransition:!!a.transition,bTransition:!!b.transition,
        aSeq:a.sequence,bSeq:b.sequence
      });
    }
    const vals=k=>links.map(x=>x[k]).sort((a,b)=>a-b);
    const pct=(arr,p)=>arr[Math.min(arr.length-1,Math.floor((arr.length-1)*p))]||0;
    return {
      links:links.length,
      lateral:{avg:links.reduce((n,x)=>n+x.lateral,0)/links.length,p50:pct(vals('lateral'),.5),p75:pct(vals('lateral'),.75),p90:pct(vals('lateral'),.9),max:Math.max(...vals('lateral'))},
      vertical:{avg:links.reduce((n,x)=>n+x.vertical,0)/links.length,p90:pct(vals('vertical'),.9),max:Math.max(...vals('vertical'))},
      close:links.filter(x=>x.lateral<=70&&x.vertical<=55).length,
      veryClose:links.filter(x=>x.lateral<=45&&x.vertical<=40).length,
      strongJump:links.filter(x=>x.lateral>=100||x.vertical>=70).length,
      rows:links
    };
  });
  console.log('MAP2-24 BASELINE '+JSON.stringify(out));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});