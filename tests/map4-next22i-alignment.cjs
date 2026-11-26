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
 const page=await browser.newPage({viewport:{width:1440,height:810},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Next22iDeckOpeningRimGeometry==='function',
   null,{timeout:18000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>.05,
   null,{timeout:20000});
  await page.evaluate(()=>{
   state.paused=true;
   const native=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:native(cb);
  });
  const signature=await page.evaluate(()=>{
   const zone=planetaryWorldRegions[1];
   const group=zone.getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
   const deck=group.getObjectByName('MAP4_NEXT22E_SHATTERED_SERVICE_DECKS');
   const trim=group.getObjectByName('MAP4_NEXT22E_SHATTERED_DECK_EDGES');
   const beacon=group.getObjectByName('MAP4_NEXT22E_DISTANT_WARNING_BEACONS');
   const halo=group.getObjectByName('MAP4_NEXT22E_DISTANT_BEACON_HALOS');
   const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
   const deckSample=new THREE.Mesh(deck.geometry,material);
   const rimSample=new THREE.Mesh(trim.geometry,material);
   deckSample.updateMatrixWorld(true);rimSample.updateMatrixWorld(true);
   const ray=(target,x,z)=>new THREE.Raycaster(
    new THREE.Vector3(x,5,z),new THREE.Vector3(0,-1,0))
    .intersectObject(target,false).length;
   const m1=new THREE.Matrix4(),m2=new THREE.Matrix4(),
    m3=new THREE.Matrix4(),m4=new THREE.Matrix4();
   const q1=new THREE.Quaternion(),q2=new THREE.Quaternion(),
    p1=new THREE.Vector3(),p2=new THREE.Vector3(),
    s1=new THREE.Vector3(),s2=new THREE.Vector3();
   const deckHorizontalErrors=[],beaconPositionErrors=[],haloRadiusRatios=[];
   for(let i=0;i<24;i++){
    deck.getMatrixAt(i,m1);trim.getMatrixAt(i,m2);
    m1.decompose(p1,q1,s1);m2.decompose(p2,q2,s2);
    const routeUp=getRaceFrameAtDistance(MAP4_PHASES.introEnd+
       [360,575,810][i%3]+Math.floor(i/3)*35+
       (i%4-1.5)*[-120,-50,85][i%3]*.22).up;
    const lateral=p2.clone().sub(p1).addScaledVector(routeUp,
      -p2.clone().sub(p1).dot(routeUp));
    deckHorizontalErrors.push(lateral.length());
   }
   for(let i=0;i<18;i++){
    beacon.getMatrixAt(i,m3);halo.getMatrixAt(i,m4);
    m3.decompose(p1,q1,s1);m4.decompose(p2,q2,s2);
    beaconPositionErrors.push(p1.distanceTo(p2));
    haloRadiusRatios.push((s2.x*.5)/(s1.x*.5));
   }
   return {counts:group.children.map(x=>x.count),batches:group.children.length,
    deck:deck.geometry.type,deckHoles:deck.geometry.parameters.shapes.holes.length,
    trim:trim.geometry.type,trimRimVertices:trim.geometry.attributes.position.count,
    centerHoleDeckHits:ray(deckSample,0,0),
    centerHoleTrimHits:ray(rimSample,0,0),
    outerDeckHits:ray(deckSample,-.39,-.25),
    maxDeckHorizontalError:Math.max(...deckHorizontalErrors),
    maxBeaconOffset:Math.max(...beaconPositionErrors),
    haloRadiusRange:[Math.min(...haloRadiusRatios),Math.max(...haloRadiusRatios)],
    colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],error:renderer.getContext().getError()};
  });
  assert.deepEqual(signature.counts,[28,24,18,24,18]);
  assert.equal(signature.batches,5);
  assert.equal(signature.deck,'ExtrudeGeometry');
  assert.equal(signature.deckHoles,1);
  assert.equal(signature.trim,'TubeGeometry');
  assert(signature.trimRimVertices>100);
  assert.equal(signature.centerHoleDeckHits,0,'Deck opening is actually blocked');
  assert.equal(signature.centerHoleTrimHits,0,'Metal trim covers the deck opening');
  assert(signature.outerDeckHits>0,'Deck lacks actual surrounding metal');
  assert(signature.maxDeckHorizontalError<.01,'Trim misaligned with opening');
  assert(signature.maxBeaconOffset<.01,'Halo does not encircle warning beacon');
  assert(signature.haloRadiusRange[0]>1.0 &&
   signature.haloRadiusRange[1]<2.2,'Halo too large or too small');
  assert.deepEqual(signature.colliders,[6,36,200]);
  assert.equal(signature.error,0);
  const frames=[];
  for(const [label,progress,side] of [
   ['center',12600,0],['wreck',12750,-1150],['defense',13000,1150]]){
   const setup=await page.evaluate(({progress,side})=>{
    state.paused=true;state.routeProgress=progress;
    state.laneX=side;state.laneY=190;state.map4Phase=2;
    const f=getRaceFrameAtDistance(progress);
    state.pos.copy(f.center).addScaledVector(f.right,side)
      .addScaledVector(f.up,190);
    const q=new THREE.Quaternion().setFromRotationMatrix(
     new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate()));
    playerRig.position.copy(state.pos);playerRig.quaternion.copy(q);
    camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
    camera.quaternion.copy(q);camera.fov=75;camera.updateProjectionMatrix();
    updatePlanetaryWorld();h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8);
    const g=planetaryWorldRegions[1].getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
    g.visible=false;renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,zoneVisible:planetaryWorldRegions[1].visible};
   },{progress,side});
   const before=await page.screenshot({path:path.join(__dirname,
    'map4-next22i-'+label+'-before.png')});
   const after=await page.evaluate(()=>{
    const g=planetaryWorldRegions[1].getObjectByName('MAP4_NEXT22E_WARFRONT_COMPOSITION');
    g.visible=true;renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,glError:renderer.getContext().getError(),
     colliders:[h4CanyonColliders.length,h4IndustrialColliders.length,
      planetaryBuildingColliders.length]};
   });
   const image=await page.screenshot({path:path.join(__dirname,
    'map4-next22i-'+label+'-after.png')});
   assert.equal(setup.zoneVisible,true);
   assert(after.calls>=setup.calls&&after.calls<=setup.calls+5);
   assert.equal(after.glError,0);
   assert.deepEqual(after.colliders,signature.colliders);
   frames.push({label,visible:!before.equals(image),calls:after.calls});
  }
  assert(frames.every(x=>x.visible),'At least one battle pocket lacks visible art');
  assert.equal(errors.length,0,errors.join('|'));
  console.log('NEXT22I HOLE, HALO, AND THREE-POCKET WEBGL PASS',
   JSON.stringify({signature,frames}));
 } finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
