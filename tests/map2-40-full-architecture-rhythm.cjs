// MAP2-40 — full-course architecture and rhythm
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2-30/31: systematic building blocks and real gap classification'));

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
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const s=window.starbladeMap2FullRhythm,f=window.starbladeMap2FullGapSystem,g=window.starbladeMap2GapBlockSystem;
    if(!s||!f)throw Error('MAP2-40 summary missing');
    const physical=window.starbladeMap2BuildingColliders||[];
    const complexes=[...window.starbladeMap2PlayablePassages.complexes,...f.extraComplexes];
    const collisions=[];
    for(const c of complexes)for(const p of c.passages)for(let i=1;i<p.nodes.length;i++)
      if(physical.some(o=>o.active!==false&&courseSegmentTouch(o,p.nodes[i-1],p.nodes[i],10.5)))collisions.push(p.id);
    const goldenNames=new Set(g.blocks.flatMap(b=>b.rootNames));
    const badChanges=s.changes.filter(c=>goldenNames.has(c.root)||!Number.isFinite(c.yaw)||Math.abs(c.yaw)>5);
    const badTrim=s.trimmed.filter(x=>map2Segment(x.d).kind!=='TECH'||
      x.d>=g.from&&x.d<=g.to||Math.abs(x.after.w)>=Math.abs(x.before.w)||
      Math.abs(x.after.d)>=Math.abs(x.before.d));
    return {s,collisions,badChanges,badTrim,gates:map2Gates.length,
      extraComplexes:f.extraComplexes.length,expectedBlocks:g.blockCount+f.extraBlocks.length,
      fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      map4Hidden:!planetaryWorldGroup.visible};
  });
  assert.equal(info.s.distance,175000);
  assert.equal(info.s.fast+info.s.tech+info.s.other,info.s.distance);
  assert(info.s.fast/info.s.distance>=.23&&info.s.fast/info.s.distance<=.27);
  assert.equal(info.s.blocks.length,info.expectedBlocks);
  assert.equal(info.s.coveredGroups,info.s.eligibleGroups);
  assert(info.s.safetySegments>=860);
  assert(Object.keys(info.s.counts).length>=4);
  assert(info.s.changes.length>=1,'actual building transforms required');
  assert.deepEqual(info.badChanges,[]);
  assert.deepEqual(info.badTrim,[]);
  assert.deepEqual(info.collisions,[]);
  assert.equal(info.s.visibility.length,info.extraComplexes);
  for(const v of info.s.visibility){
    assert.equal(v.allVisibleLead,Math.max(0,...v.probes.filter(p=>p.allVisible).map(p=>p.lead)));
    assert(v.branches.length>=2);
  }
  assert.equal(info.gates,68);assert.equal(info.fastPhysical,0);assert(info.map4Hidden);
  const dir=path.join(__dirname,'map2-40-evidence');fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'full-rhythm.json'),JSON.stringify(info,null,2));
  console.log('MAP2-40 '+JSON.stringify(info));
  const stops=await page.evaluate(()=>{
    const f=window.starbladeMap2FullGapSystem,g=window.starbladeMap2GapBlockSystem;
    return [{id:'golden',d:g.from+Math.min(1000,g.span*.2)},
      ...f.sectors.filter(s=>s.to>s.from).slice(0,5).map(s=>({id:s.id,d:(s.from+s.to)*.5}))];
  });
  for(const stop of stops){
    await page.evaluate(d=>{
      const q=starbladeMap2BuildingPassageAt(d),f=getRaceFrameAtDistance(d);
      state.paused=true;state.routeProgress=d;state.laneX=q.x;state.laneY=q.y;
      state.pos.copy(f.center).addScaledVector(f.right,q.x).addScaledVector(f.up,q.y);
      const basis=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
      const rot=new THREE.Quaternion().setFromRotationMatrix(basis);
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
      camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    },stop.d);
    await page.waitForTimeout(180);
    await page.screenshot({path:path.join(dir,stop.id+'.png'),timeout:120000,animations:'disabled'});
  }
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-40 full architectural rhythm');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
