'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof selectMap==='function');
  assert(await page.locator('#map-choice-4').isDisabled(),'Map4 must remain locked');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  const layout=await page.evaluate(()=>window.starbladeMap2Layout);
  assert(layout.visualStage.map4BuildingKits>300,'Map4 visual kits must populate TECH/FAST/LINK scenery');
  assert(layout.visualStage.map4BuildingMeshes>500,'active Map4 visual meshes must replace box placeholders');
  assert(layout.visualStage.map4RoadPieces>150,'real Map4 building pieces must sit directly on the Map2 road');
  assert(layout.visualStage.map4RoadColliders>150,'on-road Map4 buildings must be physical obstacles');
  const roadPieces=await page.evaluate(()=>{
    let road=0,link=0,tech=0,maxAbsX=0,fast=0;
    map2CourseGroup.traverse(o=>{
      if(!o.userData?.map2RoadPiece)return;
      road++;maxAbsX=Math.max(maxAbsX,Math.abs(o.userData.map2LaneX||0));
      const kind=map2Segment(o.userData.map2RouteProgress||0).kind;
      if(kind==='LINK')link++;if(kind==='TECH')tech++;if(kind==='FAST')fast++;
    });
    const physical=map2Obstacles.filter(o=>o.map4RoadBuilding);
    return {
      road,link,tech,fast,maxAbsX,
      physical:physical.length,
      physicalFast:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      minHalfX:Math.min(...physical.map(o=>o.halfX)),
      maxHalfX:Math.max(...physical.map(o=>o.halfX))
    };
  });
  assert(roadPieces.road>150,'road must be populated piece-by-piece with Map4 buildings');
  assert(roadPieces.link>20&&roadPieces.tech>40,'both LINK and TECH must contain on-road Map4 buildings');
  assert.equal(roadPieces.fast,0,'FAST must remain free of physical road buildings');
  assert.equal(roadPieces.physicalFast,0,'FAST must contain no Map4 building colliders');
  assert.equal(roadPieces.physical,layout.visualStage.map4RoadColliders,'every physical road piece must own one collider');
  assert(roadPieces.maxAbsX<=430,'road pieces must stay on the course instead of distant skyline placement');
  assert(roadPieces.minHalfX>=72&&roadPieces.maxHalfX<120,'colliders must stay conservative and leave flyable gaps');
  assert.equal(await page.evaluate(()=>planetaryWorldGroup.visible),false,'Map4 source world must stay hidden');
  assert(await page.locator('#map-choice-4').isDisabled(),'Map4 remains locked after sourcing');
  assert(await page.evaluate(()=>{const src=h4Gfx11c17Root.children.filter(o=>o.isInstancedMesh&&!o.userData.h4Gfx11c17Service);let road=0;map2CourseGroup.traverse(o=>{if(o.name.startsWith('MAP2_REUSED_H4_KIT_')&&src.some(x=>x.geometry===o.geometry&&x.material===o.material))road++;});return road>100;}),'final Map4 buildings must occupy physical course piers');

  const ev=path.join(__dirname,'map2-12-evidence');fs.mkdirSync(ev,{recursive:true});
  async function settle(progress,name){
    const lead=Math.max(0,progress-1200);
    await page.evaluate(p=>{state.paused=false;state.routeProgress=p;state.laneX=0;state.laneY=120;},lead);
    await page.waitForTimeout(350);
    for(let i=1;i<=12;i++){const p=lead+(progress-lead)*i/12;
      await page.evaluate(p=>{state.routeProgress=p;state.laneX=0;state.laneY=120;state.paused=false;},p);await page.waitForTimeout(60);}
    await page.evaluate(p=>{
      state.routeProgress=p;state.laneX=0;state.laneY=120;state.paused=true;
      const f=getRaceFrameAtDistance(p);
      state.pos.copy(f.center).addScaledVector(f.up,state.laneY);
      const basis=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
      const q=new THREE.Quaternion().setFromRotationMatrix(basis);
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(q));
      camera.quaternion.copy(q);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(p);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    },progress);
    const info=await page.evaluate(()=>{
      const counts={all:0,on:0,finalFactory:0,finalFactoryOn:0,legacyFastBoxes:0,legacyLinkBoxes:0,exactMap4Geometry:0};
      map2CourseGroup.traverse(o=>{
        const n=o.name||'';
        if(n.startsWith('MAP2_FAST_SILHOUETTE_'))counts.legacyFastBoxes++;
        if(n.startsWith('MAP2_LINK_SILHOUETTE_'))counts.legacyLinkBoxes++;
        const isMap4=n.startsWith('MAP2_MAP4_')||n.startsWith('MAP2_REUSED_H4_KIT_');
        if(!isMap4)return;
        let vis=true,a=o;while(a){vis=vis&&a.visible;a=a.parent;}if(!vis)return;
        counts.all++;
        const exact=o.isMesh&&h4Gfx11c17Root.children.some(src=>src.isInstancedMesh&&src.geometry===o.geometry&&src.material===o.material);
        if(exact)counts.exactMap4Geometry++;
        if(n.startsWith('MAP2_MAP4_FINAL_'))counts.finalFactory++;
        const p=new THREE.Vector3();o.getWorldPosition(p);const q=p.clone().project(camera);
        const on=q.z>=-1&&q.z<=1&&Math.abs(q.x)<=1.3&&Math.abs(q.y)<=1.3;
        if(on){counts.on++;if(n.startsWith('MAP2_MAP4_FINAL_'))counts.finalFactoryOn++;}
      });
      return {seg:map2Segment(state.routeProgress).kind,counts};
    });
    assert(info.counts.legacyFastBoxes===0&&info.counts.legacyLinkBoxes===0,'legacy black silhouette boxes must be gone');
    assert(info.counts.exactMap4Geometry>0,'visible scenery must use exact final C17 geometry/material geometry');
    assert(info.counts.finalFactoryOn>=2,'actual Map4 final C17 buildings must be visible in camera');
    await page.screenshot({path:path.join(ev,name+'.png')});
    return info;
  }
  const userShot=await settle(7249,'00-user-view-167751m-remaining');
  assert.equal(userShot.seg,'LINK','the supplied screenshot position is the opening LINK segment');
  assert(userShot.counts.finalFactoryOn>=2,'user screenshot position must show real Map4 buildings');
  const a=await settle(35200,'01-map4-buildings-tech-entry');
  const b=await settle(39750,'02-map4-buildings-dual-factory');
  const c=await settle(45200,'03-map4-buildings-industrial-canyon');
  const families=await page.evaluate(()=>{
    const names=[];let exact=0,blackFast=0,blackLink=0;
    map2CourseGroup.traverse(o=>{
      const n=o.name||'';
      if(n.startsWith('MAP2_MAP4_'))names.push(n);
      if(o.isMesh&&h4Gfx11c17Root.children.some(src=>src.isInstancedMesh&&src.geometry===o.geometry&&src.material===o.material))exact++;
      if(n.startsWith('MAP2_FAST_SILHOUETTE_'))blackFast++;
      if(n.startsWith('MAP2_LINK_SILHOUETTE_'))blackLink++;
    });
    return {refinery:names.some(n=>n.includes('REFINERY')),factory:names.some(n=>n.includes('FACTORY')),
      power:names.some(n=>n.includes('POWER')),outpost:names.some(n=>n.includes('OUTPOST')),exact,blackFast,blackLink};
  });
  assert.equal(families.refinery,true);assert.equal(families.factory,true);assert.equal(families.power,true);assert.equal(families.outpost,true);
  assert(families.exact>300,'many scene meshes must directly reuse final C17 geometry/material');
  assert.equal(families.blackFast,0);assert.equal(families.blackLink,0);
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-15 real Map4 road buildings visible + physical '+JSON.stringify({visual:layout.visualStage,userShot,a,b,c,families}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
