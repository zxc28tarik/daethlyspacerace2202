// MAP2-35 — real-building framing for 2/3-way decision readability
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2-35: architectural decision sightlines'));

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
  await page.waitForTimeout(900);
  if(!await page.evaluate(()=>!!window.starbladeMap2DecisionSightlines)){
    throw new Error('MAP2-35 summary missing; page errors: '+JSON.stringify(errors));
  }

  const info=await page.evaluate(()=>{
    const s=window.starbladeMap2DecisionSightlines;
    const play=window.starbladeMap2PlayablePassages;
    const physical=window.starbladeMap2BuildingColliders||[];
    const tagged=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2DecisionSightline)tagged.push({
        name:o.name,yaw:o.userData.map2DecisionSightlineYawDeg,
        complex:o.userData.map2DecisionComplex
      });
    });
    const collisions=[];
    for(const c of play.complexes){
      for(const p of c.passages){
        for(let i=1;i<p.nodes.length;i++){
          if(physical.some(o=>o.active!==false&&courseSegmentTouch(o,p.nodes[i-1],p.nodes[i],10.5)))
            collisions.push({complex:c.id,passage:p.id,segment:i});
        }
      }
    }
    return {
      summary:s,
      tagged:tagged.length,
      uniqueYaw:[...new Set(tagged.map(x=>x.yaw))],
      collisions,
      leads:play.complexes.map(c=>({
        id:c.id,passages:c.passages.length,
        lead:c.decisionLeadDistance,focus:c.focusDistance,
        separation:c.minBranchSeparation,
        cls:c.sightlineClass
      })),
      oldStraight:window.starbladeMap2GroundedArchitecture?.remainingStraightSurfaces,
      chaosBlocked:(window.starbladeMap2ControlledChaos?.blocks||[]).filter(b=>b.accepted<1).length,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });
  console.log('MAP2-35 DECISION_SIGHTLINES '+JSON.stringify(info));

  assert.equal(info.summary.complexCount,9,'all six dual + three triple complexes need a sightline contract');
  assert(info.summary.shapedRoots>=9,'real Map4 framing shells must actually be shaped');
  assert(info.summary.maxYaw>=5&&info.summary.maxYaw<=5.201);
  assert.deepEqual(info.collisions,[],'sightline shaping may not close any validated branch');
  assert(info.leads.every(x=>Number.isFinite(x.lead)&&x.lead<x.focus),'every choice must expose a pre-decision lead point');
  assert(info.leads.every(x=>x.separation>=155),'published passages must remain visually/physically distinct');
  assert(Object.keys(info.summary.classCounts).length>=2,'not every choice should have identical readability');
  assert.equal(info.oldStraight,0);
  assert.equal(info.stats?.decisionSightlineComplexes,9);
  assert.equal(info.stats?.decisionSightlineRoots,info.summary.shapedRoots);
  assert.deepEqual(errors,[]);

  const dir=path.join(__dirname,'map2-35-evidence');fs.mkdirSync(dir,{recursive:true});
  const samples=await page.evaluate(()=>{
    const c=window.starbladeMap2PlayablePassages.complexes;
    const triple=c.find(x=>x.passages.length===3);
    const dual=c.find(x=>x.passages.length===2);
    const late=c.find(x=>x.sightlineClass==='LATE_REVEAL');
    return [triple,dual,late||c[c.length-1]].filter(Boolean)
      .map(x=>({id:x.id,d:Math.max(0,x.decisionLeadDistance-80)}));
  });
  for(let i=0;i<samples.length;i++){
    const s=samples[i];
    await page.evaluate(d=>{
      const q=starbladeMap2BuildingPassageAt(d);
      state.paused=true;state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
      const f=getRaceFrameAtDistance(d);
      state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
      const basis=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
      const rot=new THREE.Quaternion().setFromRotationMatrix(basis);
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
      camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    },s.d);
    await page.waitForTimeout(180);
    await page.screenshot({path:path.join(dir,String(i).padStart(2,'0')+'-'+s.id+'.png')});
  }
  console.log('PASS MAP2-35 real architecture frames route decisions');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
