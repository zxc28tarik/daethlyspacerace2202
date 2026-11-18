/* NEXT11C19 — independently verify two original ships in actual WebGL,
 * default cinematic chase and boost camera approach, without altering physics.
 * SwiftShader validates render integration, NOT native GPU or art approval.
 */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path');
const assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  const page=await browser.newPage({viewport:{width:1600,height:900},
    deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.stack||e.message));
  try{
    const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',r=>
      r.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
      {waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>typeof h4Ship19Select==='function'&&
      h4Ship19Race&&h4Ship19Combat&&
      typeof h4PowerChange==='function',null,{timeout:18000});
    const register=await page.evaluate(()=>{
      const get=r=>({
        name:r.name,id:r.userData.authoredShipId,
        parts:r.userData.parts,tris:r.userData.triangles,
        batches:r.children.map(m=>({
          name:m.name,vertices:m.geometry.getAttribute('position').count,
          normals:m.geometry.getAttribute('normal').count,
          uvs:m.geometry.getAttribute('uv').count,
          visualOnly:m.userData.visualOnly,
          noCollider:m.userData.noCollider,
          material:m.material.type,map:!!m.material.map,
          emissiveStrength:m.material.emissiveIntensity||0,
          emissiveColor:m.material.emissive?.getHex()||0,
          toneMapped:m.material.toneMapped,
          size:m.geometry.boundingSphere.radius,
          triangles:m.geometry.getAttribute('position').count/3
        }))
      });
      return {stats:{...h4Ship19Stats},
        map1:get(h4Ship19Race),map4:get(h4Ship19Combat),
        actorParents:[
          h4Ship19Race.parent===geoSwordMesh,
          h4Ship19Combat.parent===h4GeoSwordArt],
        physics:[
          h4CanyonColliders.length,h4IndustrialColliders.length,
          planetaryBuildingColliders.length
        ]};
    });
    assert.equal(register.stats.players,2);
    assert.deepEqual(register.actorParents,[true,true]);
    // Map4 world has not been built in Map1's initial menu; check its
    // colliders after selecting and launching Map4 below.
    assert.deepEqual(register.physics,[0,0,0]);
    for(const k of ['externalModels','newColliders','newWeapons',
      'newAircraftClasses'])assert.equal(register.stats[k],0,k);
    assert(register.map1.parts>=55);
    assert(register.map4.parts>=65);
    assert.equal(register.stats.batches,13);
    assert.equal(register.map1.batches.length,7);
    assert.equal(register.map1.id,'SB-07');
    assert.equal(register.map4.batches.length,6);
    assert(register.map1.tris>2000&&register.map1.tris<60000);
    assert(register.map4.tris>3000&&register.map4.tris<75000);
    assert.notEqual(register.map1.id,register.map4.id);
    for(const ship of [register.map1,register.map4]){
      assert.equal(ship.tris,ship.batches.reduce(
        (s,b)=>s+b.triangles,0));
      assert(ship.batches.every(b=>b.vertices===b.normals&&
        b.vertices===b.uvs&&b.visualOnly&&b.noCollider));
      assert(ship.batches.every(b=>b.size>0));
      if(ship.id==='SB-07'){
        // Map1 has little diffuse lighting: its original glossy white/cyan
        // design uses a restrained self-lit fill, NOT the dark factory map.
        assert.equal(ship.batches.filter(b=>b.map).length,0);
        assert(ship.batches.some(b=>b.emissiveStrength>.35),
          'Zenit white/red racing silhouette must remain visible in dark sky');
        assert(ship.batches.some(b=>b.emissiveColor!==0));
      }else{
        assert(ship.batches.filter(b=>b.map).length>=2,
          'battle craft retains weathered PBR steel textures');
        assert(ship.batches.some(b=>b.toneMapped===false),
          'amber engines should remain visibly orange in bright desert');
      }
    }
    const capture=async id=>{
      await page.evaluate(()=>{
        // Drive the genuine updateGame and normal chase camera in a
        // stable playable pose; never alter level geometry.
        renderer.render(scene,camera);
      });
      const buffer=await page.screenshot({path:path.join(__dirname,
        'map4-next11c19-'+id+'.png')});
      const stat=await page.evaluate(()=>{
        const model=state.activeMap===MAP_MODES.MAP4?
          h4Ship19Combat:h4Ship19Race;
        const bbox=new THREE.Box3().setFromObject(model);
        const p=model.getWorldPosition(new THREE.Vector3())
          .project(camera);
        return {map:state.activeMap,mode:state.cameraMode,
          distance:+camera.position.distanceTo(state.pos).toFixed(4),
          fov:+camera.fov.toFixed(4),
          model:model.userData.authoredShipId,
          shipVisible:model.visible&&geoSwordMesh.visible,
          onScreen:p.z<1&&p.z>-1&&Math.abs(p.x)<1&&Math.abs(p.y)<1,
          screen:p.toArray(),bounds:bbox.getSize(new THREE.Vector3()).toArray(),
          engine:state.energy,progress:state.routeProgress,
          rendered:renderer.info.render.calls};
      });
      assert(stat.shipVisible,id+' ship invisible');
      assert(stat.onScreen,id+' ship center off screen '+JSON.stringify(stat));
      return {stat,buffer};
    };
    const fly=async boost=>page.evaluate(active=>{
      Object.keys(keys).forEach(k=>keys[k]=false);
      state.energy=100;
      state.mouseX=W/2;state.mouseY=H/2;
      keys.ShiftLeft=active;
      for(let i=0;i<32;i++)updateGame(1/30);
      keys.ShiftLeft=false;
      camera.updateProjectionMatrix();
    },boost);
    // Use actual selection button then launch button; no fabricated game states.
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>.04,
      null,{timeout:25000});
    await page.evaluate(()=>{
      state.paused=true;const raf=window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
      state.paused=false;
    });
    const map1Identity=await page.evaluate(()=>({
      isMap1:state.activeMap===MAP_MODES.MAP1,
      defaultChase:state.cameraMode==='CHASE',
      race:h4Ship19Race.visible,combat:h4Ship19Combat.visible,
      legacy:[noseCone,cockpit,mainWings,wingTipL,wingTipR,
        thrusterGlow].every(o=>!o.visible)}));
    assert.deepEqual(map1Identity,{
      isMap1:true,defaultChase:true,race:true,combat:false,legacy:true});
    await fly(false);const map1Normal=await capture('map1-normal');
    await fly(true);const map1Boost=await capture('map1-boost');
    assert(map1Boost.stat.distance<map1Normal.stat.distance-1.3,
      'Map1 boost must APPROACH tighter chase instead of pull away');
    assert(map1Boost.stat.fov>map1Normal.stat.fov,
      'Map1 boost FOV increases for speed');
    assert(!map1Normal.buffer.equals(map1Boost.buffer),
      'Map1 cinematic framing should visually respond to boost');
    // Map change and fresh mission; no gameplay mutation.
    await page.evaluate(()=>{
      state.running=false;state.paused=false;
      document.getElementById('gameover-screen').classList.add('hidden');
      document.getElementById('start-screen').classList.remove('hidden');
      selectMap(MAP_MODES.MAP4);
      startGame();
    });
    const map4Identity=await page.evaluate(()=>({
      isMap4:state.activeMap===MAP_MODES.MAP4,
      defaultChase:state.cameraMode==='CHASE',
      race:h4Ship19Race.visible,combat:h4Ship19Combat.visible,
      h4Parent:h4GeoSwordArt.visible,legacyHidden:geoSwordMesh.children
        .filter(c=>c!==h4GeoSwordArt&&c!==h4Ship19Race)
        .every(c=>!c.visible),
      power:state.h4Power.mode,combatTargets:hunterTargets.length,
      rivals:racers.length}));
    assert.deepEqual(map4Identity,{
      isMap4:true,defaultChase:true,race:false,combat:true,
      h4Parent:true,legacyHidden:true,
      power:'BALANCED',combatTargets:8,rivals:5});
    await fly(false);const map4Normal=await capture('map4-normal');
    await fly(true);const map4Boost=await capture('map4-boost');
    assert(map4Boost.stat.distance<map4Normal.stat.distance-1.4);
    assert(map4Boost.stat.fov>map4Normal.stat.fov);
    assert(!map4Normal.buffer.equals(map4Boost.buffer));
    const modes=await page.evaluate(()=>{
      toggleCameraMode();const turret={
        mode:state.cameraMode,
        visible:geoSwordMesh.visible,turret:turretGroup.visible
      };
      toggleCameraMode();
      const chase={
        mode:state.cameraMode,
        visible:geoSwordMesh.visible,turret:turretGroup.visible
      };
      return {turret,chase};
    });
    assert.deepEqual(modes,{
      turret:{mode:'TURRET',visible:false,turret:true},
      chase:{mode:'CHASE',visible:true,turret:false}
    });
    const unmodified=await page.evaluate(()=>({
      geometry:[h4CanyonColliders.length,
        h4IndustrialColliders.length,planetaryBuildingColliders.length],
      navigation:h4IndustrialGroups.flatMap(g=>g.children.filter(m=>
        m.userData.w05Kind==='BEACON'||m.userData.w05Kind==='HIGH_MARKER')).length,
      physical:h4Gfx11c3PhysicalMaterials.length,
      rivalCount:racers.length,hunterCount:hunterTargets.length,
      rules:[MAP4_PHASES.arenaSeconds,MAP4_RACE_RULES.realTimeLimit,
        MAP4_PHASES.orbitAltitude,H4_INDUSTRY.fastBonus,
        H4_CANYON.fastMultiplier],
      singleton:[
        geoSwordMesh.children.filter(x=>x===h4Ship19Race).length,
        h4GeoSwordArt.children.filter(x=>x===h4Ship19Combat).length
      ]}));
    assert.deepEqual(unmodified,{
      geometry:[6,36,200],navigation:24,physical:34,
      rivalCount:5,hunterCount:8,rules:[60,300,850,1.12,1.18],
      singleton:[1,1]});
    assert.deepEqual(errors,[],errors.join('\n'));
    const result={id:'NEXT11C19',status:'PASS',
      ships:{map1:register.map1,map4:register.map4},
      normalBoost:{
        map1:[map1Normal.stat,map1Boost.stat],
        map4:[map4Normal.stat,map4Boost.stat]},
      rules:unmodified,
      softwareWebGL:true,nativeGpuVerified:false,
      userAestheticApproval:false};
    fs.writeFileSync(path.join(__dirname,
      'map4-next11c19-two-ships-qa.json'),JSON.stringify(result,null,2));
    console.log('NEXT11C19 TWO ORIGINAL SHIPS PASS',
      JSON.stringify({raceParts:register.map1.parts,
        combatParts:register.map4.parts,
        batches:register.stats.batches,
        map1:[map1Normal.stat.distance,map1Boost.stat.distance],
        map4:[map4Normal.stat.distance,map4Boost.stat.distance],
        views:['map1-normal','map1-boost','map4-normal','map4-boost'],
        physics:unmodified.geometry,
        nativeGpuVerified:false,userAestheticApproval:false}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
