/* NEXT-11C13 read-only provenance and moving-route WebGL 07/08 QA
 * zero new physics/guidance, map-phase isolation, graphics tiers.
 * Software WebGL proves visual difference, not native GPU or art approval.
 */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');

(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  const page=await browser.newPage({
    viewport:{width:1600,height:900},deviceScaleFactor:1
  });
  const errors=[];
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  try{
    const three=fs.readFileSync(
      require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
      waitUntil:'domcontentloaded',timeout:30000
    });
    await page.waitForFunction(()=>
      typeof h4Gfx11c13RingProvenance==='function' &&
      typeof h4Gfx11c12BuildDepth==='function',null,{timeout:18000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>.05,
      null,{timeout:22000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });







    const baseline=await page.evaluate(()=>{
      const markers=h4IndustrialGroups.flatMap(g=>
        g.children.filter(m=>m.userData.w05Kind==='BEACON'||
          m.userData.w05Kind==='HIGH_MARKER'));
      const oldBodies=h4Gfx11c3PhysicalMaterials.map(e=>({
        id:e.mesh.id,geometry:e.mesh.geometry.uuid,
        collider:e.mesh.userData.h4Collider.kind
      }));
      return {
        markers:markers.map(m=>({
          id:m.id,kind:m.userData.w05Kind,
          uuid:m.geometry.uuid,material:m.material.uuid,
          matrix:m.matrix.toArray()
        })),
        oldBodies,
        counts:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length],
        quality:h4Gfx10ProfileName,
        stats:{...h4Gfx11c13AuditStats},
        protectedMaterialC5:h4Gfx11c5DecorRings.length,
        map:state.activeMap
      };
    });
    assert.equal(baseline.markers.length,24);
    assert.equal(baseline.markers.filter(x=>x.kind==='BEACON').length,12);
    assert.equal(baseline.markers.filter(x=>x.kind==='HIGH_MARKER').length,12);
    assert.equal(baseline.oldBodies.length,34);
    assert.deepEqual(baseline.counts,[6,36,200]);
    assert.equal(baseline.protectedMaterialC5,0,
      'C5 non-navigation ring list may not suddenly grow');
    assert.equal(baseline.stats.visualEdits,0);
    assert(baseline.map!==undefined&&baseline.map!==null);
    const setPose=spec=>page.evaluate(p=>{
      state.paused=true;state.routeProgress=p.progress;
      state.laneX=p.x;state.laneY=p.y;state.map4Phase=3;
      const frame=getRaceFrameAtDistance(p.progress);
      state.pos.copy(frame.center)
        .addScaledVector(frame.right,p.x)
        .addScaledVector(frame.up,p.y);
      const q=new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(frame.right,frame.up,
          frame.tangent.clone().negate()));
      playerRig.position.copy(state.pos);
      playerRig.quaternion.copy(q);
      camera.position.copy(state.pos).add(
        new THREE.Vector3(0,5,17).applyQuaternion(q));
      camera.quaternion.copy(q);
      camera.fov=68;camera.updateProjectionMatrix();
      h4Gfx10SetProfile('HIGH');
      updatePlanetaryWorld();
      h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
      renderer.render(scene,camera);
    },spec);
    const measure=()=>page.evaluate(()=>{
      renderer.render(scene,camera);
      const audit=h4Gfx11c13RingProvenance();
      const markers=h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
        m.userData.w05Kind==='BEACON'||
        m.userData.w05Kind==='HIGH_MARKER'));
      const projected=[];
      const center=new THREE.Vector3();
      const p=new THREE.Vector3();
      for(const mesh of h4Gfx11c12Root.children){
        for(let i=0;i<mesh.count;i++){
          const matrix=new THREE.Matrix4();
          mesh.getMatrixAt(i,matrix);
          center.setFromMatrixPosition(matrix);
          p.copy(center).project(camera);
          projected.push({
            group:mesh.name,i,ndc:[p.x,p.y,p.z]
              .map(x=>Math.round(x*1000)/1000),
            inFront:p.z>-1&&p.z<1,
            visible:Math.abs(p.x)<=1&&Math.abs(p.y)<=1&&
              p.z>-1&&p.z<1
          });
        }
      }
      return {
        audit,projected,
        markers:markers.map(m=>({
          id:m.id,kind:m.userData.w05Kind,
          uuid:m.geometry.uuid,material:m.material.uuid,
          matrix:m.matrix.toArray()
        })),
        bodyIntegrity:h4Gfx11c3PhysicalMaterials.every(e=>
          e.mesh.geometry===e.originalGeometry&&
          e.mesh.userData.h4Collider===e.collider),
        physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length],
        gpu:{
          drawCalls:renderer.info.render.calls,
          triangles:renderer.info.render.triangles,
          textures:renderer.info.memory.textures,
          geometries:renderer.info.memory.geometries
        }
      };
    });
    const progressBySection=[
      {section:'07',progress:[16550,17200,18000]},
      {section:'08',progress:[22400,23800,25350]}
    ];
    const lanes=[
      {lane:'FAST_LOW',x:-800,y:-100},
      {lane:'CENTRAL',x:0,y:350},
      {lane:'HUNTER_FLANK',x:900,y:310}
    ];
    const checkpoints=[],shots=[];
    for(const section of progressBySection){
      for(const progress of section.progress){
        for(const lane of lanes){
          const pose={progress,x:lane.x,y:lane.y};
          await setPose(pose);
          const stateNow=await measure();
          assert.equal(stateNow.audit.counts.actualW05,24);
          assert.equal(stateNow.audit.counts.protectedNav,24);
          assert.equal(stateNow.audit.visualEdits,0);
          assert.equal(stateNow.audit.items.filter(x=>x.safeToAutoHide).length,0);
          assert.equal(stateNow.audit.counts.total,
            stateNow.audit.items.length);
          assert(stateNow.audit.counts.torus>=24,
            'W05 torus provenance incomplete at '+progress);
          assert.deepEqual(stateNow.markers,baseline.markers,
            'C13 survey may not modify W05 signals');
          assert.deepEqual(stateNow.physics,[6,36,200]);
          assert(stateNow.bodyIntegrity);
          assert.equal(stateNow.projected.length,6);
          assert(stateNow.audit.items.every(item=>
            typeof item.source==='string'&&
            Number.isFinite(item.ndc[0])&&
            typeof item.visible==='boolean'));
          // Assert actual route identity at each progressive sample.
          const route=await page.evaluate(()=>
            h4IndustrialRoute(state.routeProgress,state.laneX,state.laneY));
          assert.equal(route,lane.lane);
          const shot=(section.section==='07'&&progress===17200)||
            (section.section==='08'&&progress===23800);
          if(shot){
            const name='map4-gfx11c13-'+section.section+'-'+
              lane.lane.toLowerCase()+'.png';
            await page.screenshot({path:path.join(__dirname,name)});
            shots.push(name);
          }
          checkpoints.push({
            section:section.section,progress,lane:lane.lane,
            ringCount:stateNow.audit.counts.total,
            visibleRingCount:stateNow.audit.counts.visible,
            onScreenRings:stateNow.audit.items.filter(x=>
              x.visible&&x.inScreen).map(x=>({
                source:x.source,name:x.name,kind:x.kind,
                ndc:x.ndc,geometryType:x.geometryType,
                colliding:x.collider
              })),
            skyline:stateNow.projected,
            render:stateNow.gpu
          });
        }
      }
    }
    assert.equal(checkpoints.length,18);
    assert.equal(shots.length,6);
    // Dynamic camera sweep: the original sky silhouettes really move in
    // projection as the pilot advances. Not just the same static screenshot.
    for(const sec of ['07','08']){
      const at=checkpoints.filter(x=>x.section===sec&&x.lane==='CENTRAL');
      assert.equal(at.length,3);
      const movement=at.some((x,i)=>i>0&&x.skyline.some((v,j)=>
        Math.abs(v.ndc[0]-at[i-1].skyline[j].ndc[0])>.035||
        Math.abs(v.ndc[1]-at[i-1].skyline[j].ndc[1])>.035));
      assert(movement,'projected C12 art did not move in '+sec+' sweep');
    }
    const first=checkpoints[0].render;
    const last=checkpoints.at(-1).render;
    // A previously unseen world atlas may be uploaded once by the GPU when
    // entering a new visibility region. That is NOT a per-frame resource leak.
    // Enforce a strict tiny lazy-load budget, then revisit both camera
    // endpoints and prove memory has reached a stable high-water mark.
    assert(last.textures>=first.textures&&
      last.textures-first.textures<=2,
      'C13 moving camera exceeded bounded one-time atlas uploads');
    assert.equal(first.geometries,last.geometries,
      'C13 moving camera must not allocate geometries');
    await setPose({progress:16550,x:-800,y:-100});
    const replayStart=(await measure()).gpu;
    await setPose({progress:25350,x:900,y:310});
    const replayEnd=(await measure()).gpu;
    assert.equal(replayStart.textures,last.textures,
      'C13 return to first camera created an extra texture');
    assert.equal(replayEnd.textures,last.textures,
      'C13 repeated last camera created an extra texture');
    assert.equal(replayStart.geometries,last.geometries);
    assert.equal(replayEnd.geometries,last.geometries);
    const final=await page.evaluate(()=>{
      const rings=h4Gfx11c13RingProvenance();
      return {
        auditCount:h4Gfx11c13AuditStats.auditCalls,
        visualEdits:h4Gfx11c13AuditStats.visualEdits,
        navSources:rings.counts.bySource,
        markers:h4IndustrialGroups.flatMap(g=>
          g.children.filter(m=>m.userData.w05Kind==='BEACON'||
            m.userData.w05Kind==='HIGH_MARKER')).map(m=>({
              id:m.id,kind:m.userData.w05Kind,
              uuid:m.geometry.uuid,material:m.material.uuid,
              matrix:m.matrix.toArray()
            }))
      };
    });
    assert.deepEqual(final.markers,baseline.markers);
    assert.equal(final.visualEdits,0);
    assert(final.auditCount>=19);
    assert.deepEqual(errors,[],errors.join('\n'));
    const report={
      version:'NEXT11C13',test:'read-only moving camera ring provenance',
      baseline:{...baseline,markers:baseline.markers.map(m=>({
        id:m.id,kind:m.kind
      }))},
      auditSources:final.navSources,
      checkpoints,shots,
      visualEdits:0,
      trueNativeGpuVerified:false,
      complete300sPilotFlight:false,
      humanAestheticApproval:false,
      autoHiddenRings:0
    };
    fs.writeFileSync(path.join(__dirname,
      'map4-next11c13-motion-provenance.json'),
      JSON.stringify(report,null,2));
    console.log('NEXT11C13 MOVING PROVENANCE PASS',JSON.stringify({
      frames:checkpoints.length,screens:shots.length,
      nav:final.navSources,firstGpu:first,lastGpu:last,
      noVisualEdits:true
    }));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
