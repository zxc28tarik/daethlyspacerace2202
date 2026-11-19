/* NEXT11C20R - 19 sector seam x 16 ray continuity and real
 * Chromium/Three.js r128 WebGL near-boundary camera capture.
 * Pure QA: game graphics, geometry and physics are not modified.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const out=path.join(__dirname,'next11c20r-evidence');
fs.mkdirSync(out,{recursive:true});
(async()=>{
  const errors=[];
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  try{
    const page=await browser.newPage({viewport:{width:1280,height:720},
      deviceScaleFactor:1});
    page.on('pageerror',e=>errors.push(e.stack||e.message));
    page.on('console',m=>{
      if(m.type()==='error'&&/shader|glsl|webglprogram/i.test(m.text()))
        errors.push(m.text());
    });
    const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
      {waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>typeof startGame==='function' &&
      !!corridorGuideGroup && !!h4Ship19Race && !!h4Ship19Combat,
      null,{timeout:25000});
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&
      state.activeMap===MAP_MODES.MAP1&&state.raceTime>.02,
      null,{timeout:25000});
    await page.evaluate(()=>{
      state.paused=true;
      const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
    });

    // Exhaustively verify all 19 join interfaces and all 16 original rays.
    const survey=await page.evaluate(()=>{
      const rails=corridorGuideGroup.children.filter(o=>
        o.name?.startsWith('MAP1_C20P_RAIL_SECTOR_'));
      rails.sort((a,b)=>a.userData.railSector-b.userData.railSector);
      const checks=[],lengths=[],sectorCulling=[],totalSegments=[];
      let maxPositionError=0,maxDistanceError=0;
      for(const mesh of rails){
        const geometry=mesh.geometry;
        const a=geometry.getAttribute('position');
        const d=geometry.getAttribute('routeDistance');
        const perRay=mesh.userData.segmentCount/16;
        if(!Number.isInteger(perRay)||perRay<1)
          throw new Error('not 16 preserved rays: '+mesh.name);
        if(a.count!==d.count||a.count!==mesh.userData.segmentCount*2)
          throw new Error('lost rail vertex attribute: '+mesh.name);
        if(!mesh.frustumCulled)throw new Error('local sector culling disabled');
        geometry.computeBoundingSphere();
        if(!geometry.boundingSphere||
          !Number.isFinite(geometry.boundingSphere.radius))
          throw new Error('invalid sector bounding sphere');
        lengths.push(perRay);
        totalSegments.push(mesh.userData.segmentCount);
        sectorCulling.push({sector:mesh.userData.railSector,
          sphereRadius:geometry.boundingSphere.radius,
          segments:mesh.userData.segmentCount});
      }
      for(let n=0;n<rails.length-1;n++){
        const left=rails[n],right=rails[n+1];
        const lp=left.geometry.getAttribute('position');
        const rp=right.geometry.getAttribute('position');
        const ld=left.geometry.getAttribute('routeDistance');
        const rd=right.geometry.getAttribute('routeDistance');
        const lCount=left.userData.segmentCount/16;
        const rCount=right.userData.segmentCount/16;
        let boundaryD=0;
        for(let k=0;k<16;k++){
          const endIndex=(k*lCount+lCount-1)*2+1;
          const startIndex=k*rCount*2;
          const end=new THREE.Vector3(lp.getX(endIndex),
            lp.getY(endIndex),lp.getZ(endIndex));
          const start=new THREE.Vector3(rp.getX(startIndex),
            rp.getY(startIndex),rp.getZ(startIndex));
          const positionError=end.distanceTo(start);
          const distanceError=Math.abs(ld.getX(endIndex)-rd.getX(startIndex));
          maxPositionError=Math.max(maxPositionError,positionError);
          maxDistanceError=Math.max(maxDistanceError,distanceError);
          boundaryD=ld.getX(endIndex);
          if(positionError>.0001||distanceError>.0001)
            throw new Error('visible guide gap: '+n+' / rail '+k+
              ' position='+positionError+' progress='+distanceError);
          // Check fade is identical at both sides of the boundary
          // (they share ShaderMaterial + exactly the same routeDistance).
          const m=corridorGuideGroup.userData.railMaterial;
          const near=m.uniforms.uNear.value,far=m.uniforms.uFar.value;
          const floor=m.uniforms.uFloor.value;
          const evalAlpha=(d,progress)=>{
            const x=Math.max(0,Math.min(1,(Math.abs(d-progress)-near)/(far-near)));
            const smooth=x*x*(3-2*x);
            return (floor+(1-floor)*(1-smooth))*m.uniforms.uOpacity.value;
          };
          for(const pilotProgress of [boundaryD-200,boundaryD,boundaryD+200]){
            const alphaError=Math.abs(evalAlpha(ld.getX(endIndex),pilotProgress)-
              evalAlpha(rd.getX(startIndex),pilotProgress));
            if(alphaError>1e-8)throw new Error('shader join brightness discontinuity');
          }
          checks.push({sector:n,rail:k,progress:boundaryD,positionError,distanceError});
        }
      }
      const first=rails[0].geometry.getAttribute('position');
      const last=rails[rails.length-1].geometry.getAttribute('position');
      const initial=getRaceFrameAtDistance(0);
      const finish=getRaceFrameAtDistance(RACE_ROUTE_NOMINAL_DISTANCE);
      const initialExpected=initial.center.clone()
        .addScaledVector(initial.right,getCorridorRadiusAt(0));
      const finishExpected=finish.center.clone()
        .addScaledVector(finish.right,getCorridorRadiusAt(RACE_ROUTE_NOMINAL_DISTANCE));
      const firstError=new THREE.Vector3(first.getX(0),first.getY(0),first.getZ(0))
        .distanceTo(initialExpected);
      // Final rail k=0 ends after its per-ray segment count
      const lastMesh=rails[rails.length-1],
        lastCount=lastMesh.userData.segmentCount/16,
        lastIndex=lastCount*2-1;
      const finalError=new THREE.Vector3(last.getX(lastIndex),
        last.getY(lastIndex),last.getZ(lastIndex)).distanceTo(finishExpected);
      return {originalRails:corridorGuideGroup.userData.railOriginalCount,
        railBatches:rails.length,
        summedRailSegments:totalSegments.reduce((a,b)=>a+b,0),
        fullJoinCount:checks.length,
        joinSectors:rails.length-1,
        maxPositionError,maxDistanceError,firstError,finalError,
        perRaySegmentsBySector:lengths,
        minSphereRadius:Math.min(...sectorCulling.map(s=>s.sphereRadius)),
        maxSphereRadius:Math.max(...sectorCulling.map(s=>s.sphereRadius)),
        checks,
        parts:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts],
        physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length]
      };
    });
    assert.equal(survey.originalRails,16);
    assert.equal(survey.railBatches,20);
    assert.equal(survey.joinSectors,19);
    assert.equal(survey.fullJoinCount,304);
    assert.equal(survey.summedRailSegments,6960);
    assert(survey.maxPositionError<.0001);
    assert(survey.maxDistanceError<.0001);
    assert(survey.firstError<.003&&survey.finalError<.003);
    assert(survey.minSphereRadius>0&&survey.maxSphereRadius>0);
    assert.deepEqual(survey.parts,[189,249]);
    assert.deepEqual(survey.physics,[0,0,0]);

    // Capture true GL frames around four representative joins. Preserve
    // original camera/ship state outside this read-only test process.
    const samples=[];
    const sample=async (boundary,offset)=>page.evaluate(({boundary,offset})=>{
      const progress=boundary+offset;
      const frame=getRaceFrameAtDistance(progress);
      camera.position.copy(frame.center)
        .addScaledVector(frame.tangent,-350)
        .addScaledVector(frame.up,115);
      camera.up.copy(frame.up);
      camera.lookAt(frame.center.clone().addScaledVector(frame.tangent,1000));
      camera.updateMatrixWorld(true);
      state.routeProgress=progress;
      updateVisibleCorridor();
      renderer.render(scene,camera);
      const gl=renderer.getContext();gl.finish();
      const original=gl.getError();
      const projection=new THREE.Matrix4().multiplyMatrices(
        camera.projectionMatrix,camera.matrixWorldInverse);
      const frustum=new THREE.Frustum().setFromProjectionMatrix(projection);
      const rails=corridorGuideGroup.children.filter(o=>
        o.name?.startsWith('MAP1_C20P_RAIL_SECTOR_'));
      const previous=rails.find(o=>o.userData.railSector===Math.floor(boundary/2500)-1);
      const next=rails.find(o=>o.userData.railSector===Math.floor(boundary/2500));
      const width=gl.drawingBufferWidth,height=gl.drawingBufferHeight;
      const raw=new Uint8Array(width*height*4);
      gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,raw);
      const flipped=new Uint8ClampedArray(raw.length);
      let lit=0;
      for(let y=0;y<height;y++){
        const src=raw.subarray(y*width*4,(y+1)*width*4);
        flipped.set(src,(height-1-y)*width*4);
        for(let i=0;i<src.length;i+=4)
          if(src[i]+src[i+1]+src[i+2]>60)lit++;
      }
      const canvas=document.createElement('canvas');
      canvas.width=width;canvas.height=height;
      canvas.getContext('2d').putImageData(
        new ImageData(flipped,width,height),0,0);
      const result={boundary,offset,progress,
        priorIntersects:frustum.intersectsObject(previous),
        nextIntersects:frustum.intersectsObject(next),
        calls:renderer.info.render.calls,
        triangles:renderer.info.render.triangles,
        litPixels:lit,glError:original,
        uniformProgress:corridorGuideGroup.userData.railMaterial.uniforms.uProgress.value,
        buffer:[width,height],
        png:canvas.toDataURL('image/png').split(',')[1]};
      return result;
    },{boundary,offset});
    for(const boundary of [2500,12500,27500,47500]){
      for(const offset of [-15,15]){
        const s=await sample(boundary,offset);
        fs.writeFileSync(path.join(out,
          'map1-rail-'+boundary+(offset<0?'-before':'-after')+'-720p.png'),
          Buffer.from(s.png,'base64'));
        delete s.png;
        assert.deepEqual(s.buffer,[1280,720]);
        assert.equal(s.glError,0);
        assert(Math.abs(s.uniformProgress-s.progress)<.01);
        assert(s.calls>0&&s.triangles>1000&&s.litPixels>1000,
          'must render a real nonblank race scene near each seam');
        samples.push(s);
      }
    }
    await page.evaluate(()=>{
      state.running=false;state.paused=false;
      document.getElementById('gameover-screen').classList.add('hidden');
      document.getElementById('start-screen').classList.remove('hidden');
      selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
    });
    const map4=await page.evaluate(()=>{
      renderer.render(scene,camera);
      return {map:state.activeMap,raceVisible:h4Ship19Race.visible,
        combatVisible:h4Ship19Combat.visible,
        parts:[h4Ship19Race.userData.parts,h4Ship19Combat.userData.parts],
        physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length],
        calls:renderer.info.render.calls};
    });
    assert.equal(map4.combatVisible,true);
    assert.equal(map4.raceVisible,false);
    assert.deepEqual(map4.parts,[189,249]);
    assert.deepEqual(map4.physics,[6,36,200]);
    assert(map4.calls>0);
    assert.deepEqual(errors,[],errors.join('\n'));
    const report={pass:true,id:'NEXT11C20R',survey,samples,map4,errors,
      evidence:'19 shared batch interfaces x 16 rails and real Chromium WebGL',
      caveat:'No native GPU FPS measurements. 8 camera captures span different route positions.'};
    fs.writeFileSync(path.join(out,'rail-seam-report.json'),JSON.stringify(report,null,2));
    console.log('NEXT11C20R WEBGL SEAM PASS '+JSON.stringify({
      joins:survey.fullJoinCount,sectors:survey.joinSectors,
      maxPositionError:survey.maxPositionError,
      maxDistanceError:survey.maxDistanceError,
      segments:survey.summedRailSegments,
      capturedFrames:samples.length,
      parts:map4.parts,physics:map4.physics}));
  }finally{await browser.close();}
})().catch(e=>{
  fs.writeFileSync(path.join(out,'qa-error.txt'),String(e.stack||e));
  console.error(e.stack||e);process.exitCode=1;
});
