/* GFX-00 reproducible Chromium captures; SwiftShader metrics are NOT hardware FPS. */
const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const assert=require('node:assert/strict');
const caseSpecs=[
  {name:'01-canyon-open',progress:1950,laneX:0,laneY:80,phase:1},
  {name:'02-canyon-mesa',progress:6100,laneX:0,laneY:130,phase:1},
  {name:'03-canyon-exit',progress:10100,laneX:0,laneY:150,phase:1},
  {name:'04-arena-center',progress:13000,laneX:0,laneY:90,phase:2},
  {name:'05-arena-wreck',progress:13200,laneX:-1150,laneY:200,phase:2},
  {name:'06-arena-defense',progress:13400,laneX:1140,laneY:250,phase:2},
  {name:'07-industry-entry',progress:17200,laneX:0,laneY:260,phase:3},
  {name:'08-industry-factory',progress:23800,laneX:0,laneY:350,phase:3},
  {name:'09-industry-exit',progress:31600,laneX:0,laneY:450,phase:3},
  {name:'10-outpost',progress:36200,laneX:0,laneY:240,phase:4},
  {name:'11-spaceport',progress:42600,laneX:0,laneY:530,phase:4},
  {name:'12-orbit-climb',progress:48500,laneX:0,laneY:1200,phase:4}
];
const percentile=(numbers,p)=>{
 const sorted=[...numbers].sort((a,b)=>a-b);
 return sorted[Math.min(sorted.length-1,Math.round((sorted.length-1)*p))];
};
(async ()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
 await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',route=>
   route.fulfill({status:200,contentType:'text/javascript',body:three}));
 await page.route('**/cdn.tailwindcss.com/**',route=>
   route.fulfill({status:200,contentType:'text/javascript',body:''}));
 const directory=path.resolve(__dirname,'art-baseline');
 fs.mkdirSync(directory,{recursive:true});
 try {
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
    {waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForFunction(()=>typeof state==='object' &&
    typeof h4UpdateCinematicAtmosphere==='function',null,{timeout:16000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running && state.raceTime>.05,null,{timeout:20000});
  const out={schemaVersion:1,reference:'VQ04+ fixed visual probes',
   note:'Software Chromium/SwiftShader. Render timings are not end-user GPU FPS.',
   viewport:'1600x900',cases:[]};
  for(const item of caseSpecs){
   const info=await page.evaluate(({progress,laneX,laneY,phase})=>{
    state.paused=true;
    state.routeProgress=progress;state.laneX=laneX;state.laneY=laneY;
    state.map4Phase=phase;
    const frame=getRaceFrameAtDistance(progress);
    state.pos.copy(frame.center).addScaledVector(frame.right,laneX)
      .addScaledVector(frame.up,laneY);
    const basis=new THREE.Matrix4().makeBasis(frame.right,frame.up,
      frame.tangent.clone().negate());
    const q=new THREE.Quaternion().setFromRotationMatrix(basis);
    playerRig.position.copy(state.pos);
    playerRig.quaternion.copy(q);
    camera.position.copy(state.pos).add(new THREE.Vector3(0,5,17).applyQuaternion(q));
    camera.quaternion.copy(q);
    camera.fov=68;camera.updateProjectionMatrix();
    updatePlanetaryWorld();
    h4UpdateSkyVisuals();h4UpdateCinematicAtmosphere(8.0);
    renderer.render(scene,camera);
    return {calls:renderer.info.render.calls,triangles:renderer.info.render.triangles,
      points:renderer.info.render.points,
      geometries:renderer.info.memory.geometries,
      textures:renderer.info.memory.textures,
      fieldCount:h4AtmosphericFields.length,
      isMap4:planetaryWorldGroup.visible,
      terrainVertices:planetaryWorldRegions[0].children[0].geometry.attributes.position.count};
   },item);
   await page.screenshot({path:path.join(directory,item.name+'.png')});
   out.cases.push({...item,...info});
  }
  const durations=await page.evaluate(()=>{
    state.paused=true;
    const durations=[];
    for(let i=0;i<18;i++){
      const start=performance.now();
      renderer.render(scene,camera);
      durations.push(performance.now()-start);
    }
    return durations;
  });
  out.swiftshaderRenderMilliseconds={
    median:percentile(durations,.5),
    p95:percentile(durations,.95),
    samples:durations.length
  };
  out.errors=errors;
  assert.equal(out.cases.length,12);
  assert(out.cases.every(v=>v.isMap4));
  assert(out.cases.every(v=>v.calls>0&&v.triangles>1000));
  assert.equal(errors.length,0,errors.join(' | '));
  fs.writeFileSync(path.join(directory,'metrics.json'),JSON.stringify(out,null,2)+'\n');
  console.log('GFX-00 PASS',JSON.stringify({
    probes:out.cases.length,
    firstTerrainVertices:out.cases[0].terrainVertices,
    medianDrawCalls:percentile(out.cases.map(c=>c.calls),.5),
    medianTriangles:percentile(out.cases.map(c=>c.triangles),.5),
    metrics:path.relative(process.cwd(),path.join(directory,'metrics.json'))
  }));
 } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
