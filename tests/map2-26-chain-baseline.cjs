// MAP2-26 baseline — measure real module EXIT -> next ENTRY continuity
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
    const modules=(window.starbladeMap2ThroughRoute?.modules||[]).slice().sort((a,b)=>a.entrance.distance-b.entrance.distance);
    const techRanges=MAP2_SEGMENTS.filter(s=>s.kind==='TECH').map(s=>({
      from:s.from*MAP2_DISTANCE,to:s.to*MAP2_DISTANCE
    }));
    const pairs=[];
    for(let i=0;i<modules.length-1;i++){
      const a=modules[i],b=modules[i+1];
      const mid=(a.exit.distance+b.entrance.distance)/2;
      if(map2Segment(a.exit.distance).kind!=='TECH'||map2Segment(b.entrance.distance).kind!=='TECH'||map2Segment(mid).kind!=='TECH')continue;
      const gap=Math.max(0,b.entrance.distance-a.exit.distance);
      const lateral=Math.abs(b.entrance.x-a.exit.x);
      const vertical=Math.abs(b.entrance.y-a.exit.y);
      const euclid=Math.hypot(lateral,vertical);
      pairs.push({
        index:i,a:a.id,b:b.id,
        aKind:a.kind,bKind:b.kind,
        aExit:a.exit.distance,bEntry:b.entrance.distance,
        gap,lateral,vertical,euclid,
        from:{x:a.exit.x,y:a.exit.y},to:{x:b.entrance.x,y:b.entrance.y}
      });
    }

    const chainThreshold={gap:700,lateral:85,vertical:65};
    const chains=[];let current=[];
    const push=()=>{if(current.length){chains.push(current);current=[];}};
    for(let i=0;i<modules.length;i++){
      const m=modules[i];
      if(map2Segment(m.centerDistance).kind!=='TECH'){push();continue;}
      if(!current.length){current=[m];continue;}
      const prev=current[current.length-1];
      const pair=pairs.find(p=>p.a===prev.id&&p.b===m.id);
      if(pair&&pair.gap<=chainThreshold.gap&&pair.lateral<=chainThreshold.lateral&&pair.vertical<=chainThreshold.vertical){
        current.push(m);
      }else{
        push();current=[m];
      }
    }
    push();

    const chainRows=chains.map((c,i)=>({
      i,count:c.length,
      from:c[0].entrance.distance,to:c[c.length-1].exit.distance,
      span:c[c.length-1].exit.distance-c[0].entrance.distance,
      kinds:[...new Set(c.map(m=>m.kind))]
    })).sort((a,b)=>b.span-a.span);

    const covered=[];
    for(const range of techRanges){
      const intervals=modules
        .map(m=>[Math.max(range.from,m.entrance.distance),Math.min(range.to,m.exit.distance)])
        .filter(([a,b])=>b>a).sort((x,y)=>x[0]-y[0]);
      const merged=[];
      for(const iv of intervals){
        const last=merged[merged.length-1];
        if(last&&iv[0]<=last[1])last[1]=Math.max(last[1],iv[1]);
        else merged.push([...iv]);
      }
      const length=merged.reduce((n,[a,b])=>n+b-a,0);
      covered.push({from:range.from,to:range.to,length,pct:length/(range.to-range.from)*100,intervals:merged.length});
    }

    const vals=(key)=>pairs.map(p=>p[key]).sort((a,b)=>a-b);
    const pct=(arr,p)=>arr[Math.min(arr.length-1,Math.floor((arr.length-1)*p))]||0;
    const gaps=vals('gap'),lat=vals('lateral'),vert=vals('vertical');
    return {
      modules:modules.length,pairs:pairs.length,
      gap:{avg:pairs.reduce((n,p)=>n+p.gap,0)/Math.max(1,pairs.length),p50:pct(gaps,.5),p75:pct(gaps,.75),p90:pct(gaps,.9),max:Math.max(...gaps)},
      lateral:{avg:pairs.reduce((n,p)=>n+p.lateral,0)/Math.max(1,pairs.length),p75:pct(lat,.75),p90:pct(lat,.9),max:Math.max(...lat)},
      vertical:{avg:pairs.reduce((n,p)=>n+p.vertical,0)/Math.max(1,pairs.length),p90:pct(vert,.9),max:Math.max(...vert)},
      gapBuckets:{
        le300:pairs.filter(p=>p.gap<=300).length,
        le500:pairs.filter(p=>p.gap<=500).length,
        le700:pairs.filter(p=>p.gap<=700).length,
        le900:pairs.filter(p=>p.gap<=900).length,
        gt900:pairs.filter(p=>p.gap>900).length
      },
      bad:pairs.filter(p=>p.gap>700||p.lateral>85||p.vertical>65).sort((a,b)=>b.gap-a.gap),
      chainThreshold,chains:chainRows.length,longest:chainRows.slice(0,12),
      covered,
      coveragePct:covered.reduce((n,r)=>n+r.length,0)/covered.reduce((n,r)=>n+r.to-r.from,0)*100,
      retired:window.starbladeMap2RetiredLegacyObstacles||0,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });
  console.log('MAP2-26 CHAIN_BASELINE '+JSON.stringify(out));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});