// MAP2-19 scan real building apertures so buildings themselves can define the route
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
    const roots=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_'))roots.push(o);
      else if(o.userData?.map2ExactMap4CityClone&&o.name?.startsWith('MAP2_EXACT_MAP4_CITY_DISTRICT_AT_'))roots.push(o);
      else if(o.userData?.map2ExactMap4LandmarkClone&&o.name?.startsWith('MAP2_EXACT_MAP4_LANDMARK_'))roots.push(o);
      else if(o.userData?.map2ExactMap4CorridorClone&&o.name?.startsWith('MAP2_EXACT_MAP4_FINAL_CORRIDOR_AT_'))roots.push(o);
      else if(o.userData?.map2ExactMap4IndustrialVisualPart&&o.name?.startsWith('MAP2_EXACT_MAP4_INDUSTRIAL_PART_'))roots.push(o);
    });
    const project=(box,d)=>{
      const frame=getRaceFrameAtDistance(d),min=box.min,max=box.max;
      const corners=[[min.x,min.y,min.z],[min.x,min.y,max.z],[min.x,max.y,min.z],[min.x,max.y,max.z],[max.x,min.y,min.z],[max.x,min.y,max.z],[max.x,max.y,min.z],[max.x,max.y,max.z]];
      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
      const p=new THREE.Vector3(),r=new THREE.Vector3();
      for(const c of corners){p.set(c[0],c[1],c[2]);r.copy(p).sub(frame.center);const x=r.dot(frame.right),y=r.dot(frame.up),z=r.dot(frame.tangent);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);}
      return {minX,maxX,minY,maxY,minZ,maxZ};
    };
    const xs=[-210,-168,-126,-84,-42,0,42,84,126,168,210];
    const ys=[-175,-130,-85,-40,5,50,95,140];
    const rows=[];
    for(const root of roots){
      const d=Number(root.userData?.map2TargetDistance);
      if(!Number.isFinite(d)||map2Segment(d).kind!=='TECH')continue;
      root.updateMatrixWorld(true);
      const solids=[];
      root.traverse(m=>{
        if(!m.isMesh||m.isInstancedMesh||!m.visible)return;
        const box=new THREE.Box3().setFromObject(m);if(box.isEmpty())return;
        const q=project(box,d);
        const hx=(q.maxX-q.minX)/2,hy=(q.maxY-q.minY)/2,hd=(q.maxZ-q.minZ)/2;
        if(hx<25||hy<24||hd<10)return;
        if(q.maxZ<-450||q.minZ>450)return;
        solids.push(q);
      });
      const candidates=[];
      for(const x of xs)for(const y of ys){
        let blocked=0;
        for(const q of solids){
          const zOverlap=q.maxZ>=-250&&q.minZ<=250;
          const xy=x+38>=q.minX&&x-38<=q.maxX&&y+34>=q.minY&&y-34<=q.maxY;
          if(zOverlap&&xy)blocked++;
        }
        if(blocked===0)candidates.push({x,y,score:Math.abs(x)+Math.abs(y+55)*.35});
      }
      candidates.sort((a,b)=>a.score-b.score);
      const box=new THREE.Box3().setFromObject(root);
      rows.push({name:root.name,d,solids:solids.length,open:candidates.length,best:candidates[0]||null,size:box.isEmpty()?null:box.getSize(new THREE.Vector3()).toArray()});
    }
    const withOpen=rows.filter(r=>r.open>0);
    const noOpen=rows.filter(r=>!r.open);
    return {roots:rows.length,withOpen:withOpen.length,noOpen:noOpen.length,noOpenRows:noOpen.slice(0,30),sample:withOpen.slice(0,30)};
  });
  console.log('MAP2-19 APERTURE_SCAN '+JSON.stringify(out));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});