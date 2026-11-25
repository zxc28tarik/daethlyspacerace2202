// MAP2-34 — controlled chaos must be visibly asymmetric but route-safe
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2-34: controlled architectural chaos'));

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

  const info=await page.evaluate(()=>{
    const c=window.starbladeMap2ControlledChaos;
    const physical=window.starbladeMap2BuildingColliders||[];
    const gap=window.starbladeMap2GapBlockSystem;
    const tagged=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2ControlledChaos)tagged.push({
        name:o.name,yaw:o.userData.map2ControlledChaosYawDeg,
        d:o.userData.map2TargetDistance
      });
    });
    const blocked=[];
    for(const b of gap.blocks.filter(x=>x.style==='CHAOS')){
      let prev=null,hit=false;
      for(let d=Math.max(0,b.from-70);d<=Math.min(MAP2_DISTANCE,b.to+70)+1;d+=55){
        const dd=Math.min(d,Math.min(MAP2_DISTANCE,b.to+70));
        const q=starbladeMap2BuildingPassageAt(dd);
        const now={routeProgress:dd,laneX:q.x,laneY:q.y};
        if(prev&&physical.some(o=>o.active!==false&&courseSegmentTouch(o,prev,now,12.5))){hit=true;break;}
        prev=now;
      }
      if(hit)blocked.push(b.id);
    }
    const multiChaos=gap.blocks.filter(b=>b.style==='CHAOS'&&b.playablePassageCount>1).map(b=>b.id);
    return {
      summary:c,tagged,blocked,multiChaos,
      yaws:[...new Set(tagged.map(x=>x.yaw))],
      oldStraight:window.starbladeMap2GroundedArchitecture?.remainingStraightSurfaces,
      groundMoved:window.starbladeMap2GroundedArchitecture?.movedGroups,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });
  console.log('MAP2-34 CONTROLLED_CHAOS '+JSON.stringify(info));

  assert.equal(info.summary.chaosBlocks,4);
  assert(info.summary.rotatedRoots>=4,'most chaos nodes should get real asymmetric building yaw');
  assert(info.summary.maxYaw>=5&&info.summary.maxYaw<=9.001);
  assert(info.yaws.length>=3,'chaos may not use one repeated angle');
  assert.deepEqual(info.blocked,[],'controlled chaos may never close the real building route');
  assert.deepEqual(info.multiChaos,[],'dedicated multi-passage complexes must not be mutated by chaos pass');
  assert.equal(info.oldStraight,0);
  assert.equal(info.groundMoved,0,'grounding contract: do not move building/route Y');
  assert.equal(info.stats?.controlledChaosRotatedRoots,info.summary.rotatedRoots);
  assert.deepEqual(errors,[]);

  // Real camera evidence at all chaos nodes.
  const dir=path.join(__dirname,'map2-34-evidence');fs.mkdirSync(dir,{recursive:true});
  const ds=await page.evaluate(()=>window.starbladeMap2ControlledChaos.blocks.map(b=>(b.from+b.to)*.5));
  for(let i=0;i<ds.length;i++){
    const d=Math.max(0,ds[i]-260);
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
    },d);
    await page.waitForTimeout(180);
    await page.screenshot({path:path.join(dir,String(i).padStart(2,'0')+'-chaos.png')});
  }
  console.log('PASS MAP2-34 route-safe asymmetric real-building chaos');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
