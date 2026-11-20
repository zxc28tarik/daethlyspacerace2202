/* NEXT11C21G: actual prize capsule and reward-only HYPER TURBO WebGL test. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21g-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[],browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  page.on('pageerror',err=>errors.push(String(err.stack||err.message)));
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof grantRandomItem==='function'&&
   typeof h4RewardTurboVisualTick==='function',null,{timeout:25000});
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1 &&
   state.raceTime>2,null,{timeout:25000});
  await page.evaluate(()=>{state.paused=true;renderer.setPixelRatio(1);
   renderer.setSize(1600,900,false);});
  const base=await page.evaluate(()=>{
   const boxes=itemBoxes.map(b=>({
    radius:b.radius,hasOrbit:!!b.orbit,
    visual:b.orbit&&b.orbit.userData.visualOnly,
    noCollider:b.orbit&&b.orbit.userData.noCollider,
    r:b.orbit&&b.orbit.geometry.parameters.radius
   }));
   state.paused=false;keys['ShiftLeft']=true;
   h4RewardTurboVisualTick(.016);state.paused=true;
   renderer.render(scene,camera);
   const gl=renderer.getContext();gl.finish();
   const data={
    map:state.activeMap,rewardOnManualBoost:h4RewardTurboFx.visible,
    rewardChildren:h4RewardTurboFx.children.map(x=>x.name),
    drawCalls:renderer.info.render.calls,rendererAA:!!gl.getContextAttributes().antialias,
    glError:gl.getError(),pixelRatio:renderer.getPixelRatio(),
    shipBatches:h4Ship19Race.children.length,shipParts:h4Ship19Race.userData.parts,
    items:boxes.length,allOrbit:boxes.every(b=>b.hasOrbit&&b.visual&&b.noCollider&&b.r===26),
    allOriginalRadius:boxes.every(b=>b.radius===49),
    expectedHyperZeroRoll:chooseBalancedRaceItem(state,0)
   };
   keys['ShiftLeft']=false;
   return data;
  });
  assert.equal(base.glError,0);assert(base.rendererAA);
  assert.equal(base.pixelRatio,1);assert.equal(base.map,'map1');
  assert.equal(base.rewardOnManualBoost,false,'manual Shift boost MUST NOT trigger reward art');
  assert.equal(base.shipBatches,7);assert.equal(base.shipParts,189);
  assert(base.items>=40&&base.allOrbit&&base.allOriginalRadius);
  assert.equal(base.expectedHyperZeroRoll,'HYPER_TURBO');
  assert.equal(base.rewardChildren.length,4);
  const capture=async phase=>{
   const c=await page.evaluate(phase=>{
    let granted='NONE';
    if(phase==='reward'){
     state.paused=false;keys['ShiftLeft']=false;
     const oldRandom=Math.random;
     try{Math.random=()=>0;granted=grantRandomItem(itemBoxes[0],state,true);}
     finally{Math.random=oldRandom;}
     h4RewardTurboVisualTick(.016);
     state.paused=true;
    } else if(phase==='expired'){
     state.itemTurboTimer=0;state.paused=false;
     h4RewardTurboVisualTick(.016);state.paused=true;
    }
    camera.updateMatrixWorld(true);renderer.render(scene,camera);
    const gl=renderer.getContext();gl.finish();
    const w=1600,h=900,row=w*4,raw=new Uint8Array(w*h*4);
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    const rgba=new Uint8ClampedArray(raw.length);
    for(let y=0;y<h;y++)
     rgba.set(raw.subarray(y*row,(y+1)*row),(h-1-y)*row);
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').putImageData(new ImageData(rgba,w,h),0,0);
    return {phase,granted,glError:gl.getError(),drawCalls:renderer.info.render.calls,
     rewardVisible:h4RewardTurboFx.visible,timer:state.itemTurboTimer,
     engineBoostVisual:h4Ship19Race.userData.thrustGlow,
     rewardObjectCount:h4RewardTurboFx.children.length,
     prizeCount:state.powerUpsCollected,laserSeconds:state.obstacleLaserTimer,
     rewardType:state.lastPowerUp,
     screenshot:canvas.toDataURL('image/png').split(',')[1]};
   },phase);
   fs.writeFileSync(path.join(out,'map1-'+phase+'-1600x900.png'),
    Buffer.from(c.screenshot,'base64'));delete c.screenshot;
   return c;
  };
  const normal=await capture('manual-boost');
  const hyper=await capture('reward');
  const expired=await capture('expired');
  assert.equal(normal.rewardVisible,false);
  assert.equal(hyper.granted,'HYPER_TURBO');
  assert.equal(hyper.rewardVisible,true);
  assert(hyper.timer>0);
  assert.equal(hyper.rewardObjectCount,4);
  assert(hyper.drawCalls>normal.drawCalls && hyper.drawCalls<=normal.drawCalls+6,
   'HYPER should add only four visible GPU meshes');
  assert.equal(hyper.prizeCount,normal.prizeCount+1);
  assert.equal(hyper.rewardType,'HYPER_TURBO');
  assert(hyper.laserSeconds>0,'original every-prize laser unlock retained');
  assert.equal(expired.rewardVisible,false);
  assert.equal(expired.drawCalls,normal.drawCalls);
  for(const c of [normal,hyper,expired])assert.equal(c.glError,0);
  const map4=await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
   renderer.render(scene,camera);
   return {map:state.activeMap,notVisible:!h4RewardTurboFx.visible,
    combatParts:h4Ship19Combat.userData.parts,
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],raceVisible:h4Ship19Race.visible};
  });
  assert.equal(map4.map,'map4');assert(map4.notVisible&&!map4.raceVisible);
  assert.equal(map4.combatParts,249);
  assert.deepEqual(map4.physics,[6,36,200]);
  assert.deepEqual(errors,[]);
  const report={pass:true,id:'NEXT11C21G',base,normal,hyper,expired,map4,errors,
   caveat:'Power-up capsule visually marks a RANDOM prize. Only the earned HYPER Turbo activates violet trails; not manual W/Shift.'};
  fs.writeFileSync(path.join(out,'reward-hyper-webgl-report.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21G REWARD HYPER VISUAL WEBGL PASS '+JSON.stringify({
   boxes:base.items,rewardType:hyper.rewardType,manual:normal.drawCalls,
   hyper:hyper.drawCalls,expired:expired.drawCalls,originalBatches:base.shipBatches,
   laserPickupSeconds:hyper.laserSeconds,map4,errors}));
 }finally{await browser.close();}
})().catch(e=>{
 fs.writeFileSync(path.join(out,'error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;
});