/* NEXT-11C13 fast-low viewpoint blocker diagnostics using original scene
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








    const samples=[];
    for(const pose of [
      {section:'07',name:'fast_low',progress:17200,x:-800,y:-100},
      {section:'08',name:'fast_low',progress:23800,x:-800,y:-100},
      {section:'08',name:'central',progress:23800,x:0,y:350}
    ]){
      const report=await page.evaluate(p=>{
        state.paused=true;state.routeProgress=p.progress;
        state.laneX=p.x;state.laneY=p.y;state.map4Phase=3;
        const frame=getRaceFrameAtDistance(p.progress);
        state.pos.copy(frame.center)
          .addScaledVector(frame.right,p.x)
          .addScaledVector(frame.up,p.y);
        const q=new THREE.Quaternion().setFromRotationMatrix(
          new THREE.Matrix4().makeBasis(
            frame.right,frame.up,frame.tangent.clone().negate()));
        playerRig.position.copy(state.pos);
        playerRig.quaternion.copy(q);
        camera.position.copy(state.pos).add(
          new THREE.Vector3(0,5,17).applyQuaternion(q));
        camera.quaternion.copy(q);
        camera.fov=68;camera.updateProjectionMatrix();
        h4Gfx10SetProfile('HIGH');updatePlanetaryWorld();
        h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
        renderer.render(scene,camera);
        scene.updateMatrixWorld(true);
        const pos=camera.getWorldPosition(new THREE.Vector3());
        const forward=camera.getWorldDirection(new THREE.Vector3());
        const baseDirs=[
          {id:'forward',dir:forward.clone()},
          {id:'left',dir:forward.clone().addScaledVector(
            frame.right,-.38).normalize()},
          {id:'right',dir:forward.clone().addScaledVector(
            frame.right,.38).normalize()}
        ];
        const candidates=[];
        const boxes=[];
        const bounds=new THREE.Box3();
        const matrix=new THREE.Matrix4();
        const candidateIds=new Set();
        const stack=[];
        const groupName=obj=>{
          let current=obj;
          for(let k=0;k<4 && current;k++,current=current.parent)
            stack.push(current.name||current.type);
          const result=stack.join(' <- ');stack.length=0;
          return result;
        };
        const checkBox=(mesh,b,index)=>{
          const distance=b.distanceToPoint(pos);
          const inside=b.containsPoint(pos);
          if(!inside&&distance>1200)return;
          const record={
            name:mesh.name||'(unnamed)',path:groupName(mesh),
            id:mesh.id,instance:index,geometry:mesh.geometry.name||mesh.geometry.type,
            dist:Math.round(distance),inside,
            collider:!!mesh.userData.h4Collider,
            boundsSize:b.getSize(new THREE.Vector3()).toArray()
              .map(x=>Math.round(x)),
            visualOnly:!!(mesh.userData.visualOnly||
              mesh.userData.h4VisualOnly||mesh.userData.noCollider)
          };
          boxes.push(record);
          if(!candidateIds.has(mesh.id)){
            candidates.push(mesh);
            candidateIds.add(mesh.id);
          }
        };
        planetaryWorldRegions[2].traverse(mesh=>{
          if(!mesh.isMesh||!mesh.geometry)return;
          for(let node=mesh;node;node=node.parent)
            if(!node.visible)return;
          const geo=mesh.geometry;
          if(!geo.boundingBox)geo.computeBoundingBox();
          if(mesh.isInstancedMesh){
            for(let k=0;k<mesh.count;k++){
              mesh.getMatrixAt(k,matrix);
              const compound=mesh.matrixWorld.clone().multiply(matrix);
              bounds.copy(geo.boundingBox).applyMatrix4(compound);
              checkBox(mesh,bounds,k);
            }
          }else{
            bounds.copy(geo.boundingBox).applyMatrix4(mesh.matrixWorld);
            checkBox(mesh,bounds,null);
          }
        });
        const traces=[];
        for(const {id,dir} of baseDirs){
          const caster=new THREE.Raycaster(pos,dir,.01,1500);
          const hits=caster.intersectObjects(candidates,false);
          traces.push({ray:id,hits:hits.slice(0,12).map(hit=>({
            distance:Math.round(hit.distance),
            mesh:hit.object.name||'(unnamed)',
            source:groupName(hit.object),
            geometry:hit.object.geometry.name||hit.object.geometry.type,
            material:hit.object.material?.name||'',
            collider:!!hit.object.userData.h4Collider,
            visualOnly:!!(hit.object.userData.visualOnly||
              hit.object.userData.h4VisualOnly||
              hit.object.userData.noCollider)
          }))});
        }
        return {
          sample:p,
          cameraPosition:pos.toArray().map(x=>Math.round(x)),
          nearbyBoxes:boxes.sort((a,b)=>
            Number(b.inside)-Number(a.inside)||a.dist-b.dist).slice(0,45),
          traces,nearbyGeometryCount:candidates.length,
          protectedMarkers:h4IndustrialGroups.flatMap(g=>
            g.children.filter(m=>m.userData.w05Kind==='BEACON'||
              m.userData.w05Kind==='HIGH_MARKER')).length,
          sceneColliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
            planetaryBuildingColliders.length]
        };
      },pose);
      assert.equal(report.protectedMarkers,24);
      assert.deepEqual(report.sceneColliders,[6,36,200]);
      samples.push(report);
    }
    assert.equal(samples.length,3);
    fs.writeFileSync(path.join(__dirname,
      'map4-next11c13-08-fast-low-occlusion.json'),
      JSON.stringify({version:'NEXT11C13',samples},null,2));
    console.log('NEXT11C13 VIEW BLOCKER AUDIT PASS',JSON.stringify({
      samples:samples.map(s=>({
        name:s.sample.name,section:s.sample.section,
        nearby:s.nearbyGeometryCount,
        nearest:s.traces[0].hits.slice(0,3),
        inside:s.nearbyBoxes.filter(x=>x.inside).slice(0,5)
      }))
    }));
    assert.deepEqual(errors,[],errors.join('\n'));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
