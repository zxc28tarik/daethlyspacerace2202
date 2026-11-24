// MAP2-19 — real Map4 building apertures ARE the TECH road
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('BUILDINGS ARE THE ROAD'));
assert(html.includes('map2OrganizeBuildingsAsRoad'));
assert(html.includes("BUILDINGS_ARE_THE_ROAD"));

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof courseSegmentTouch==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const road=window.starbladeMap2BuildingRoad;
    const project=(box,d)=>{
      const frame=getRaceFrameAtDistance(d),min=box.min,max=box.max;
      const corners=[[min.x,min.y,min.z],[min.x,min.y,max.z],[min.x,max.y,min.z],[min.x,max.y,max.z],[max.x,min.y,min.z],[max.x,min.y,max.z],[max.x,max.y,min.z],[max.x,max.y,max.z]];
      let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
      const p=new THREE.Vector3(),r=new THREE.Vector3();
      for(const cc of corners){p.set(cc[0],cc[1],cc[2]);r.copy(p).sub(frame.center);const x=r.dot(frame.right),y=r.dot(frame.up),z=r.dot(frame.tangent);minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);}
      return {minX,maxX,minY,maxY,minZ,maxZ};
    };
    const lookup=new Map();
    map2CourseGroup.traverse(o=>{if(o.name)lookup.set(o.name,o);});

    const rows=road.groups.filter(g=>g.open).map(g=>{
      const roots=(g.rootNames||[]).map(n=>lookup.get(n)).filter(Boolean);
      const p=window.starbladeMap2BuildingPassageAt(g.d);
      const a={routeProgress:g.d-150,laneX:g.x,laneY:g.y};
      const b={...a,routeProgress:g.d+150};
      const blockedByBuilding=(window.starbladeMap2BuildingColliders||[])
        .some(o=>courseSegmentTouch(o,a,b,12.5));

      const solids=[];
      for(const root of roots){
        root.updateMatrixWorld(true);
        root.traverse(mesh=>{
          if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.visible)return;
          const box=new THREE.Box3().setFromObject(mesh);if(box.isEmpty())return;
          const q=project(box,g.d);
          const hx=(q.maxX-q.minX)/2,hy=(q.maxY-q.minY)/2,hd=(q.maxZ-q.minZ)/2;
          if(hx<25||hy<24||hd<10||q.maxZ<-320||q.minZ>320)return;
          solids.push(q);
        });
      }
      const near=(q)=>{
        const dx=g.x<q.minX?q.minX-g.x:g.x>q.maxX?g.x-q.maxX:0;
        const dy=g.y<q.minY?q.minY-g.y:g.y>q.maxY?g.y-q.maxY:0;
        return Math.hypot(dx,dy)<300;
      };
      const local=solids.filter(near);
      const left=local.some(q=>q.maxX<=g.x-42&&g.x-q.maxX<290);
      const right=local.some(q=>q.minX>=g.x+42&&q.minX-g.x<290);
      const above=local.some(q=>q.minY>=g.y+36&&q.minY-g.y<250);
      const below=local.some(q=>q.maxY<=g.y-36&&g.y-q.maxY<250);
      const shell=(left&&right)||(above&&below)||((left||right)&&(above||below));

      return {
        d:g.d,x:g.x,y:g.y,shift:g.shift,roots:g.roots,solids:g.solids,
        names:g.rootNames,seg:map2Segment(g.d).kind,
        routeMatch:Math.hypot(p.x-g.x,p.y-g.y),
        blockedByBuilding,
        shell,left,right,above,below,
        flagged:roots.length>0&&roots.every(r=>r.userData?.map2BuildingIsRoad),
        localSolids:local.length
      };
    });

    const knots=road.knots||[];
    const through=window.starbladeMap2ThroughRoute||null;
    const throughKnots=knots.filter(k=>k.source==='THROUGH_BUILDING');
    const deviations=knots.filter(k=>Math.abs(k.x)>60||Math.abs(k.y+55)>42).length;
    const gaps=knots.slice(1).map((k,i)=>k.distance-knots[i].distance);
    const physical=window.starbladeMap2BuildingColliders||[];
    const fastPhysical=physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length;

    return {
      philosophy:road.philosophy,
      groupCount:road.groups.length,
      openGroups:rows.length,
      closedGroups:road.groups.filter(g=>!g.open).length,
      knotCount:knots.length,
      throughActive:!!through,
      throughKnotCount:throughKnots.length,
      throughAllTech:throughKnots.every(k=>map2Segment(k.distance).kind==='TECH'),
      throughAllReal:throughKnots.every(k=>!!k.moduleId&&['ENTRY','INTERIOR','EXIT'].includes(k.role)),
      deviations,
      rows,
      shellCount:rows.filter(r=>r.shell).length,
      maxGap:gaps.length?Math.max(...gaps):null,
      minGap:gaps.length?Math.min(...gaps):null,
      fastKnots:knots.filter(k=>map2Segment(k.distance).kind==='FAST').length,
      fastPhysical,
      stats:window.starbladeMap2Layout?.visualStage||null,
      physicalCount:physical.length
    };
  });

  console.log('MAP2-19 BUILDING_ROAD '+JSON.stringify(info));

  assert.equal(info.philosophy,'BUILDINGS_ARE_THE_ROAD');
  assert(info.groupCount>=55,'major copied building complexes must be organized as route groups');
  assert(info.openGroups>=50,'most route groups must expose a real pilot-sized aperture');
  if(info.throughActive){
    assert(info.throughKnotCount>=info.openGroups*2,'MAP2-25+ must add real entrance/interior/exit depth knots');
    assert.equal(info.knotCount,info.openGroups+info.throughKnotCount,'centre building knots plus real through-building knots must account for the full route');
    assert(info.throughAllTech,'through-building depth knots stay inside TECH');
    assert(info.throughAllReal,'every extra route knot must belong to a real building module role');
  }else{
    assert.equal(info.knotCount,info.openGroups);
  }
  assert.equal(info.fastKnots,0,'building-road knots belong only to TECH sectors');
  assert.equal(info.fastPhysical,0,'FAST zones remain open');
  assert(info.deviations>=8,'the building-defined road must visibly leave the old centre lane');
  assert(info.rows.every(r=>r.seg==='TECH'&&r.routeMatch<1),'each route knot must be the active TECH passage');
  assert(info.rows.every(r=>!r.blockedByBuilding),'a building-derived collider may not seal its own real aperture');
  assert(info.rows.every(r=>r.flagged),'route groups must be real copied Map4 building roots');
  assert(info.shellCount>=Math.floor(info.openGroups*.55),'most route knots must be physically framed by building mass');
  assert(info.stats?.routeBuildingGroups===info.groupCount);
  assert(info.stats?.routeBuildingApertures===info.openGroups);
  assert(info.stats?.routeBuildingShifted>=8,'multiple complexes should be physically re-aligned around their apertures');
  assert(info.stats?.routeBuildingShells>=50);
  assert(info.physicalCount>=30,'real building physics must remain active');

  const evidence=path.join(__dirname,'map2-19-evidence');fs.mkdirSync(evidence,{recursive:true});
  const sample=info.rows.find(r=>r.shell&&Math.abs(r.x)>60)||info.rows.find(r=>r.shell)||info.rows[0];
  await page.evaluate(({d,x,y})=>{
    state.routeProgress=Math.max(0,d-850);state.laneX=x;state.laneY=y;
    state.paused=true;map2UpdateVisibility(state.routeProgress);
    scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
  },sample);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-buildings-are-the-road.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-19 buildings themselves define the TECH road');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
