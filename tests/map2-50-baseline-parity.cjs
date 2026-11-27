'use strict';
// MAP2-50: compare actual current course data against the pre-detachment version.
// This is deliberately stronger than old name-based and fixed-altitude assertions.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const baseline=path.resolve(process.env.MAP2_BASELINE_HTML||'tests/map2-49-baseline.html');
const candidate=path.resolve('index.html');
const evidence=path.join(__dirname,'map2-50-evidence');fs.mkdirSync(evidence,{recursive:true});
(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
 async function inspect(file,variant){
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  try{
   await page.goto(pathToFileURL(file).toString(),{waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>typeof map2BuildCourse==='function');
   await page.locator('#map-choice-2').click();
   await page.waitForFunction(()=>state.activeMap==='map2'&&window.starbladeMap2WideUrbanCourse&&map2Gates.length===59,null,{timeout:120000});
   await page.addScriptTag({path:path.join(__dirname,'map2-48-visual-fingerprint.js')});
   const course=await page.evaluate(()=>{
    const r=v=>Math.round(v*1000)/1000;
    const city=typeof map2IndependentLibrary!=='undefined'&&map2IndependentLibrary?map2IndependentLibrary.city:h4City02DistrictGroup;
    const sources=new Map();
    city.traverse(o=>{if(o.isMesh||o.isInstancedMesh){
      if(!sources.has(o.geometry))sources.set(o.geometry,new Set());
      sources.get(o.geometry).add(o.material);
    }});
    let frontage=0,geometryMatched=0,materialMatched=0,oldNameMatched=0;
    map2CourseGroup.traverse(o=>{
      if(!o.userData?.map2WideUrbanFrontage||!o.isInstancedMesh)return;
      frontage++;
      if(sources.has(o.geometry))geometryMatched++;
      if(sources.get(o.geometry)?.has(o.material))materialMatched++;
      const original=city.getObjectByName(o.name.replace('MAP2_WIDE_URBAN_FRONTAGE_',''));
      if(original?.geometry===o.geometry&&original?.material===o.material)oldNameMatched++;
    });
    const collision=(a,b)=>map2Obstacles.some(o=>courseSegmentTouch(o,a,b,12.5));
    const gateData=map2Gates.map(g=>{
      const outcomes=g.openings.map(p=>{
        const a={routeProgress:g.distance-g.depth/2-40,laneX:p.x,laneY:p.y};
        return {x:r(p.x),y:r(p.y),hx:r(p.hx),hy:r(p.hy),clear:!collision(a,{...a,routeProgress:g.distance+g.depth/2+40})};
      });
      const probe=(x,y)=>{
        const a={routeProgress:g.distance-220,laneX:x,laneY:y};
        return collision(a,{...a,routeProgress:g.distance+220});
      };
      return {distance:r(g.distance),kind:g.kind,laneX:r(g.laneX),laneY:r(g.laneY),openings:outcomes,
       primaryClear:!probe(g.laneX,g.laneY),oldGantryBlocked:g.kind==='GANTRY'?probe(g.laneX,-215):null,
       oldDualCenterBlocked:g.kind==='DUAL_FACTORY'?probe(0,-38):null};
    });
    const colliders=map2Obstacles.map(o=>[o.kind||'',r(o.routeProgress),r(o.laneX),r(o.laneY),r(o.halfX),r(o.halfY),r(o.halfDepth)].join('|')).sort();
    return {map4Regions:planetaryWorldRegions.length,gateData,colliders,
      fingerprint:window.map2VisualFingerprint(),frontage,geometryMatched,materialMatched,oldNameMatched,
      physical:(window.starbladeMap2BuildingColliders||[]).length};
   });
   await page.locator('#start-btn').click({timeout:120000});
   await page.waitForFunction(()=>state.running&&state.activeMap==='map2',null,{timeout:120000});
   const views=[];
   for(const distance of [7249,36500,39000,69000,90000,122000,151000,169000]){
    const info=await page.evaluate(d=>{
      const f=getRaceFrameAtDistance(d),q=starbladeMap2BuildingPassageAt(d);
      state.paused=true;state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
      state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
      const rot=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
      camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
      let exactOn=0,allOn=0;
      map2CourseGroup.traverse(o=>{
        if(!o.isMesh&&!o.isInstancedMesh)return;
        let vis=true;for(let p=o;p;p=p.parent)if(!p.visible){vis=false;break;}
        if(!vis)return;
        const p=new THREE.Vector3();o.getWorldPosition(p);const v=p.project(camera);
        if(v.z<-1||v.z>1||Math.abs(v.x)>1.3||Math.abs(v.y)>1.3)return;
        allOn++;if(o.userData?.map2ExactMap4Clone)exactOn++;
      });
      return {distance:d,segment:map2Segment(d).kind,exactOn,allOn,fingerprint:window.map2VisualFingerprint()};
    },distance);
    views.push(info);
    await page.screenshot({path:path.join(evidence,variant+'-'+distance+'.png'),timeout:120000,animations:'disabled'});
   }
   assert.deepEqual(errors,[],variant+' JS errors');
   return {course,views};
  }finally{await page.close();}
 }
 try{
  const old=await inspect(baseline,'baseline'),now=await inspect(candidate,'independent');
  fs.writeFileSync(path.join(evidence,'parity.json'),JSON.stringify({old,now},null,2));
  console.log('MAP2-50 A/B '+JSON.stringify({old:{...old.course,gateData:undefined,colliders:undefined},now:{...now.course,gateData:undefined,colliders:undefined},oldViews:old.views,nowViews:now.views,oldGantryBlocked:old.course.gateData.filter(x=>x.oldGantryBlocked).map(x=>x.distance),newGantryBlocked:now.course.gateData.filter(x=>x.oldGantryBlocked).map(x=>x.distance)}));
  assert(old.course.map4Regions>=4);assert.equal(now.course.map4Regions,0);
  assert.deepEqual(now.course.gateData,old.course.gateData,'Every gate and opening collision probe must match the legacy baseline');
  assert.deepEqual(now.course.colliders,old.course.colliders,'All collider dimensions and locations must match');
  assert.equal(now.course.physical,old.course.physical);
  assert.deepEqual(now.course.fingerprint,old.course.fingerprint,'Complete architectural fingerprint unchanged');
  assert.deepEqual(now.views,old.views,'All eight fixed-camera views must preserve exact architecture counts and fingerprints');
  assert(now.course.gateData.every(g=>g.primaryClear),'Every current primary gate is flyable');
  assert(now.course.frontage>0&&now.course.geometryMatched===now.course.frontage,'All facade batches must originate from copied city geometry');
  assert.equal(now.course.materialMatched,old.course.materialMatched,'Material identity parity with original implementation');
  console.log('PASS MAP2-50 exact architecture / gates / collision / 8 camera A/B parity');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
