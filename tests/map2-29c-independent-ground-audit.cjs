// MAP2-29C — independent structural-ground audit
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2-29B: modular structural ground'));
assert(html.includes('architectureFoundationPads'));

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

  const audit=await page.evaluate(()=>{
    const sum=window.starbladeMap2GroundedArchitecture;
    const pads=[],links=[],old=[],allGround=[];
    const oldPattern=/(?:VISUAL_DECK|ROAD_SURFACE|ASPHALT|PAVEMENT|TRACK_SURFACE|LANE_STRIP|CENTER_STRIP)/i;
    map2CourseGroup.traverse(o=>{
      const d=Number(o.userData?.map2Distance??o.userData?.map2TargetDistance??o.userData?.routeProgress);
      if(Number.isFinite(d)&&o.userData?.map2VisualOnly&&oldPattern.test(o.name||'')&&map2Segment(d).kind==='TECH') old.push({name:o.name,d});
      if(!o.userData?.map2ArchitecturalGround)return;
      const mesh=o.children?.find(x=>x.isMesh);
      if(!mesh)return;
      const box=new THREE.Box3().setFromObject(o);
      const row={name:o.name,d:Number(o.userData?.map2Distance),minY:box.min.y,maxY:box.max.y,
        minX:box.min.x,maxX:box.max.x,minZ:box.min.z,maxZ:box.max.z,
        connector:!!o.userData?.map2BuildingConnector,pad:!!o.userData?.map2GroundPad,
        group:o.userData?.map2GroundGroup};
      allGround.push(row);
      if(row.pad)pads.push(row);
      if(row.connector)links.push(row);
    });

    // Every measured architecture group must have one or more pads.
    const padGroups=new Map();
    for(const p of pads)padGroups.set(p.group,(padGroups.get(p.group)||0)+1);
    const missingPadGroups=[];
    for(let i=0;i<sum.measuredGroups;i++)if(!padGroups.has(i))missingPadGroups.push(i);

    // Pad top must touch the measured building base closely, never hover below it.
    const padTopErrors=[];
    for(const p of pads){
      const g=sum.groups[p.group];
      if(!g)continue;
      const err=Math.abs(p.maxY-g.baseAfter);
      if(err>2.5)padTopErrors.push({group:p.group,err,top:p.maxY,base:g.baseAfter});
    }

    // No supports are allowed in the two FAST sections.
    const wrongZone=allGround.filter(g=>Number.isFinite(g.d)&&map2Segment(g.d).kind!=='TECH');

    // Estimate longitudinal visual coverage. Pads/connectors may be frequent, but
    // they must not merge into one asphalt-like ribbon for kilometres.
    const intervals=allGround.filter(g=>Number.isFinite(g.d)).map(g=>{
      const half=Math.min(240,Math.max(70,(g.maxZ-g.minZ)*.5));
      return [Math.max(0,g.d-half),Math.min(MAP2_DISTANCE,g.d+half)];
    }).sort((a,b)=>a[0]-b[0]);
    const merged=[];
    for(const iv of intervals){
      const last=merged[merged.length-1];
      if(last&&iv[0]<=last[1]+35)last[1]=Math.max(last[1],iv[1]);
      else merged.push(iv.slice());
    }
    const longest=Math.max(0,...merged.map(x=>x[1]-x[0]));
    const totalCovered=merged.reduce((n,x)=>n+(x[1]-x[0]),0);
    const techLength=map2Segments.filter(s=>s.kind==='TECH').reduce((n,s)=>n+(s.to-s.from),0);
    const coveragePct=techLength?100*totalCovered/techLength:0;

    // Support should stay well below the actual flown passage, not become a raised road.
    let minFlightClearance=Infinity,badFlightClearance=[];
    for(const g of sum.groups){
      const clearance=g.y-g.baseAfter;
      minFlightClearance=Math.min(minFlightClearance,clearance);
      if(clearance<42)badFlightClearance.push({d:g.d,clearance,y:g.y,base:g.baseAfter});
    }

    return {
      groups:sum.measuredGroups,pads:pads.length,links:links.length,
      missingPadGroups,padTopErrors,wrongZone,old,
      mergedRuns:merged.length,longestGroundRun:longest,groundCoveragePct:coveragePct,
      minFlightClearance,badFlightClearance,
      maxPadSpanX:Math.max(0,...pads.map(p=>p.maxX-p.minX)),
      maxPadSpanZ:Math.max(0,...pads.map(p=>p.maxZ-p.minZ)),
      maxLinkSpanX:Math.max(0,...links.map(p=>p.maxX-p.minX)),
      maxLinkSpanZ:Math.max(0,...links.map(p=>p.maxZ-p.minZ)),
      stats:window.starbladeMap2Layout?.visualStage||null
    };
  });
  console.log('MAP2-29C STRUCTURAL_AUDIT '+JSON.stringify(audit));

  assert.equal(audit.groups,118);
  assert(audit.pads>=118&&audit.pads<=520);
  assert(audit.links>=20&&audit.links<=140);
  assert.deepEqual(audit.missingPadGroups,[]);
  assert.deepEqual(audit.padTopErrors,[]);
  assert.deepEqual(audit.wrongZone,[]);
  assert.deepEqual(audit.old,[]);
  assert(audit.longestGroundRun<3200,'architectural supports must not merge into a kilometre-scale road ribbon');
  assert(audit.groundCoveragePct<72,'ground support may not visually cover most of TECH as a continuous road');
  assert.deepEqual(audit.badFlightClearance,[]);
  assert(audit.maxPadSpanX<=360&&audit.maxPadSpanZ<=390);
  assert(audit.maxLinkSpanX<=280&&audit.maxLinkSpanZ<=330);
  assert.equal(audit.stats?.architectureFoundationPads,audit.pads);
  assert.equal(audit.stats?.architectureConnectors,audit.links);

  // Independent camera tour at six positions, with actual rig/camera relocation.
  async function settle(p){
    const q=await page.evaluate(d=>starbladeMap2BuildingPassageAt(d),p);
    await page.evaluate(({p,q})=>{
      state.paused=true;state.routeProgress=p;state.laneX=q.x;state.laneY=q.y;
      const f=getRaceFrameAtDistance(p);
      state.pos.copy(f.center).addScaledVector(f.right,state.laneX).addScaledVector(f.up,state.laneY);
      const basis=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
      const rot=new THREE.Quaternion().setFromRotationMatrix(basis);
      playerRig.position.copy(state.pos);playerRig.quaternion.copy(rot);
      camera.position.copy(state.pos).add(new THREE.Vector3(-1.45,5.1,18.2).applyQuaternion(rot));
      camera.quaternion.copy(rot);camera.fov=68;camera.updateProjectionMatrix();
      map2UpdateVisibility(p);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    },{p,q});
    await page.waitForTimeout(180);
    return await page.evaluate(()=>{
      const v={architecture:0,pads:0,links:0};
      map2CourseGroup.traverse(o=>{
        let vis=true,a=o;while(a){vis=vis&&a.visible;a=a.parent;}if(!vis)return;
        const pos=new THREE.Vector3();o.getWorldPosition(pos);const n=pos.project(camera);
        if(n.z<-1||n.z>1||Math.abs(n.x)>1.18||Math.abs(n.y)>1.18)return;
        if(o.userData?.map2GroundPad)v.pads++;
        if(o.userData?.map2BuildingConnector)v.links++;
        if(o.userData?.map2ExactMap4Clone||o.userData?.map2ExactMap4IndustrialVisualPart||
           o.userData?.map2ExactMap4CityClone||o.userData?.map2ExactMap4LandmarkClone)v.architecture++;
      });
      return v;
    });
  }

  const evidence=path.join(__dirname,'map2-29c-evidence');fs.mkdirSync(evidence,{recursive:true});
  const samples=await page.evaluate(()=>{
    const s=window.starbladeMap2GroundedArchitecture;
    return [.08,.24,.41,.58,.74,.91].map(p=>s.groups[Math.min(s.groups.length-1,Math.floor((s.groups.length-1)*p))].d);
  });
  const visual=[];
  for(let i=0;i<samples.length;i++){
    const d=Math.max(0,samples[i]-320),seen=await settle(d);
    visual.push({d,seen});
    await page.screenshot({path:path.join(evidence,String(i).padStart(2,'0')+'.png')});
  }
  console.log('MAP2-29C CAMERA_TOUR '+JSON.stringify(visual));
  assert(visual.filter(v=>v.seen.architecture>0).length>=5,'architecture must be visible in almost every tour checkpoint');
  assert(visual.filter(v=>v.seen.pads>0).length>=4,'modular ground support must be visible through most TECH checkpoints');
  assert(visual.some(v=>v.seen.links>0),'at least one checkpoint must show a building handoff bridge');
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-29C independent structural + camera audit');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
