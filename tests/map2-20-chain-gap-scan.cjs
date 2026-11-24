// MAP2-20 scan longitudinal gaps between real building-road complexes
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
    const lookup=new Map();map2CourseGroup.traverse(o=>{if(o.name)lookup.set(o.name,o);});
    const project=(box,d)=>{
      const frame=getRaceFrameAtDistance(d),min=box.min,max=box.max;
      const corners=[[min.x,min.y,min.z],[min.x,min.y,max.z],[min.x,max.y,min.z],[min.x,max.y,max.z],[max.x,min.y,min.z],[max.x,min.y,max.z],[max.x,max.y,min.z],[max.x,max.y,max.z]];
      let minZ=Infinity,maxZ=-Infinity,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
      const p=new THREE.Vector3(),r=new THREE.Vector3();
      for(const c of corners){p.set(c[0],c[1],c[2]);r.copy(p).sub(frame.center);const x=r.dot(frame.right),y=r.dot(frame.up),z=r.dot(frame.tangent);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);}
      return {minX,maxX,minY,maxY,minZ,maxZ};
    };
    const rows=road.groups.filter(g=>g.open).map(g=>{
      const roots=(g.rootNames||[]).map(n=>lookup.get(n)).filter(Boolean);
      const box=new THREE.Box3();
      roots.forEach(r=>{r.updateMatrixWorld(true);box.union(new THREE.Box3().setFromObject(r));});
      if(box.isEmpty())return null;
      const q=project(box,g.d);
      return {d:g.d,start:g.d+q.minZ,end:g.d+q.maxZ,depth:q.maxZ-q.minZ,roots:g.roots,names:g.rootNames,seg:map2Segment(g.d).kind,x:g.x,y:g.y};
    }).filter(Boolean).sort((a,b)=>a.d-b.d);
    const tech=[[.2*MAP2_DISTANCE,.55*MAP2_DISTANCE],[.65*MAP2_DISTANCE,MAP2_DISTANCE]];
    const chains=tech.map(([from,to],idx)=>{
      const inside=rows.filter(r=>r.d>=from&&r.d<=to);
      const gaps=[];let cursor=from;
      for(const r of inside){const s=Math.max(from,r.start),e=Math.min(to,r.end);if(s>cursor)gaps.push({from:cursor,to:s,size:s-cursor,before:r.d});cursor=Math.max(cursor,e);}
      if(cursor<to)gaps.push({from:cursor,to,size:to-cursor,before:null});
      return {idx,from,to,count:inside.length,gaps:gaps.sort((a,b)=>b.size-a.size),maxGap:gaps.length?Math.max(...gaps.map(g=>g.size)):0,over1k:gaps.filter(g=>g.size>1000).length,coveredPct:100*(1-gaps.reduce((n,g)=>n+g.size,0)/(to-from))};
    });
    return {rows:rows.map(r=>({d:r.d,start:r.start,end:r.end,depth:r.depth,roots:r.roots})),chains};
  });
  console.log('MAP2-20 GAP_SCAN '+JSON.stringify(out));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});