/* NEXT10B simulated 300s visual endurance and fixed renderer-memory budget.
   This is NOT a wall-clock 5min gameplay or native GPU/VRAM benchmark. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
(async()=>{
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  const page=await browser.newPage({viewport:{width:1280,height:720},deviceScaleFactor:1});
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try{
    const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',route=>
      route.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',route=>
      route.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
      waitUntil:'domcontentloaded',timeout:30000
    });
    await page.waitForFunction(()=>typeof h4Gfx10SetProfile==='function' &&
      typeof h4Gfx09SafeChase==='function',null,{timeout:18000});
    await page.locator('#map-choice-4').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.raceTime>.06,null,{timeout:30000});
    // Preserve exact game mechanics while probing static render-only scene.
    const metrics=await page.evaluate(()=>{
      state.paused=true;
      const stages=[
        {p:1950,y:80,phase:1}, {p:13100,y:110,phase:2},
        {p:23800,y:350,phase:3}, {p:48500,y:1200,phase:4}
      ];
      const signatures=()=>{
        let meshes=0,lights=0;
        scene.traverse(node=>{
          if(node.isMesh)meshes++;
          if(node.isLight)lights++;
        });
        return {meshes,lights,children:scene.children.length,
          geometries:renderer.info.memory.geometries,
          textures:renderer.info.memory.textures};
      };
      const setStage=(s)=>{
        state.routeProgress=s.p;
        state.laneX=0;state.laneY=s.y;
        state.map4Phase=s.phase;
        const frame=getRaceFrameAtDistance(s.p);
        state.pos.copy(frame.center).addScaledVector(frame.up,s.y);
        camera.position.copy(state.pos);
        updatePlanetaryWorld();
        h4UpdateGfx01LOD();
        h4Gfx07UpdateLighting();
        h4Gfx06eUpdateFineDetail();
        renderer.render(scene,camera);
        return frame;
      };
      // Prewarm shader/geometry for every sector and quality profile.
      for(const preset of H4_GFX10_ORDER){
        h4Gfx10SetProfile(preset);
        for(const stage of stages)setStage(stage);
      }
      // Prime all five pooled GPU geometries before memory baseline:
      // otherwise the first real blast could appear as a false leak.
      h4Gfx10SetProfile('HIGH');
      for(const kind of ['MUZZLE','IMPACT','SHOCK','SMOKE','ENGINE'])
        h4Gfx08Emit(kind,state.pos,1,0x8cefff);
      h4Gfx08Update(.015);
      renderer.render(scene,camera);
      h4Gfx08Reset();
      renderer.render(scene,camera);
      const first=signatures();
      const fixed={
        competitors:racers.length,hunters:hunterTargets.length,
        industryColliders:h4IndustrialColliders.length,
        canyonColliders:h4CanyonColliders.length,
        realTimeLimit:MAP4_RACE_RULES.realTimeLimit,
        arenaSeconds:MAP4_PHASES.arenaSeconds,
        orbitAltitude:MAP4_PHASES.orbitAltitude,
        score:state.score,hunterShots:state.hunterShots
      };
      h4Gfx08Reset();
      const poolPeaks=new Array(5).fill(0);
      let checks=0,generated=0;
      // 6,000 bounded steps * 50ms = FIVE MINUTES of simulated VFX runtime.
      // No claim of five minutes actual gameplay or real-device measured FPS.
      const seconds=300,dt=.05,iterations=Math.round(seconds/dt);
      for(let step=0;step<iterations;step++){
        const mode=H4_GFX10_ORDER[Math.floor(step/2000)%3];
        if(step%2000===0)h4Gfx10SetProfile(mode);
        if(step%500===0)setStage(stages[Math.floor(step/500)%4]);
        // Stress the pooled visual emitter without damaging the game.
        if(step%3===0){
          h4Gfx08Emit('SMOKE',state.pos,1.2,0x949ba2);
          h4Gfx08Emit('ENGINE',state.pos,1,0x8cefff);
          generated+=2;
        }
        h4Gfx08Update(dt);
        if(state.map4Phase===3){
          const f=getRaceFrameAtDistance(state.routeProgress);
          const cameraTarget=h4Gfx10bChaseTarget.copy(state.pos)
            .add(h4Gfx10bChaseOffset.set(0,5,23).applyQuaternion(camera.quaternion));
          h4Gfx09SafeChase(cameraTarget,f);
          checks++;
        }
        for(let i=0;i<5;i++)
          poolPeaks[i]=Math.max(poolPeaks[i],h4Gfx08Events[i].length);
        if(step%500===0)renderer.render(scene,camera);
      }
      // Fully expire every remaining transient without new material creation.
      for(let i=0;i<26;i++)h4Gfx08Update(dt);
      renderer.render(scene,camera);
      const after=signatures();
      const final={
        competitors:racers.length,hunters:hunterTargets.length,
        industryColliders:h4IndustrialColliders.length,
        canyonColliders:h4CanyonColliders.length,
        realTimeLimit:MAP4_RACE_RULES.realTimeLimit,
        arenaSeconds:MAP4_PHASES.arenaSeconds,
        orbitAltitude:MAP4_PHASES.orbitAltitude,
        score:state.score,hunterShots:state.hunterShots
      };
      const transient=h4Gfx08Events.map(a=>a.length);
      const visible=h4Gfx08Meshes.map(a=>a.count);
      const report={first,after,fixed,final,seconds,iterations,generated,
        checks,poolPeaks,transient,visible,
        passes:{lastProfile:h4Gfx10ProfileName,
          softwareOnly:h4Gfx10Stats.hardwareGpuFpsVerified===false},
        renderer:{drawCalls:renderer.info.render.calls,
          triangles:renderer.info.render.triangles}};
      return report;
    });
    assert.equal(metrics.seconds,300);
    assert.equal(metrics.iterations,6000);
    assert(metrics.generated>3000);
    assert(metrics.checks>=1000,'camera occlusion endurance actually sampled');
    assert(metrics.poolPeaks.every((v,i)=>v<=([28,36,18,48,30][i])),
      'pool must remain within GPU instance hard limits');
    assert(metrics.transient.every(v=>v===0),'VFX events have expired at 300s');
    assert(metrics.visible.every(v=>v===0),'GPU pools have no remaining visible instances');
    assert.deepEqual(metrics.final,metrics.fixed,'all game mechanics, rivals, score, colliders unchanged');
    assert.equal(metrics.after.meshes,metrics.first.meshes,'scene mesh count must not grow');
    assert.equal(metrics.after.children,metrics.first.children,'scene direct children must not grow');
    assert.equal(metrics.after.lights,metrics.first.lights,'scene lights must not grow');
    assert(metrics.after.geometries<=metrics.first.geometries+2,
      'renderer geometry count increased: '+JSON.stringify(metrics));
    assert(metrics.after.textures<=metrics.first.textures+2,
      'renderer texture count increased: '+JSON.stringify(metrics));
    assert.equal(metrics.passes.softwareOnly,true);
    assert.equal(errors.length,0,errors.join(' | '));
    const out=path.resolve(__dirname,'art-baseline','gfx10b-endurance-metrics.json');
    fs.mkdirSync(path.dirname(out),{recursive:true});
    fs.writeFileSync(out,JSON.stringify({
      note:'6,000 simulated 50ms visual steps, not actual GPU / wall-clock gameplay',
      ...metrics
    },null,2)+'\n');
    console.log('GFX10B SIMULATED ENDURANCE PASS',JSON.stringify(metrics));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});