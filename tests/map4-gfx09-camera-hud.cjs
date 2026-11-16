/* GFX09: real Chromium 720p/1080p HUD, chase/turret, grade and Map1 isolation. */
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
 page.on('pageerror',e=>errors.push(e.message));
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
  const game=pathToFileURL(path.resolve(__dirname,'../index.html')).toString()+'?gfx09debug=1';
  await page.goto(game,{waitUntil:'domcontentloaded',timeout:25000});
  await page.waitForFunction(()=>typeof selectMap==='function'&&typeof h4Gfx09SafeChase==='function',
   null,{timeout:15000});
  await page.locator('#map-choice-4').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.raceTime>0.04,null,{timeout:25000});
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('map4-composition')),true);
  const samples=[];
  for(const viewport of [{width:1280,height:720},{width:1920,height:1080}]){
    await page.setViewportSize(viewport);
    await page.waitForTimeout(100);
    for(const mode of ['TURRET','CHASE']){
      await page.evaluate(mode=>{
        if(state.cameraMode!==mode)toggleCameraMode();
        updateGame(0.016);
      },mode);
      const info=await page.evaluate(()=>{
        const ids=['planetary-zone-hud','hunter-competition-hud'];
        const nodes=ids.map(id=>document.getElementById(id))
          .concat([document.querySelector('.map4-flight-status')]);
        const fields=nodes.filter(node=>node&&!node.classList.contains('hidden')&&
          getComputedStyle(node).display!=='none').map(node=>{
          const r=node.getBoundingClientRect();
          return {id:node.id||'flight',x:r.left,y:r.top,right:r.right,bottom:r.bottom};
        });
        return {mode:state.cameraMode,fov:camera.fov,near:camera.near,
          map:state.activeMap,post:getComputedStyle(document.getElementById('h4-post-overlay')).opacity,
          screen:{width:innerWidth,height:innerHeight},fields};
      });
      assert.equal(info.mode,mode);
      assert.equal(info.map,'map4');
      assert(info.fov>=60&&info.fov<=85,'Map4 FOV usable');
      assert(info.fields.length>=2,'essential HUD visible');
      for(const r of info.fields){
        assert(r.x>=-3&&r.y>=-3&&r.right<=viewport.width+3&&r.bottom<=viewport.height+3,
         'HUD clipped at '+viewport.width+'x'+viewport.height+': '+JSON.stringify(r));
      }
      // Left flight, center region and right hunter score must not collide.
      const a=info.fields;
      for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length;j++){
        const x=Math.min(a[i].right,a[j].right)-Math.max(a[i].x,a[j].x);
        const y=Math.min(a[i].bottom,a[j].bottom)-Math.max(a[i].y,a[j].y);
        assert(x<8||y<8,'HUD overlap: '+JSON.stringify([a[i],a[j]]));
      }
      await page.screenshot({path:path.join(__dirname,
        'map4-gfx09-'+viewport.width+'x'+viewport.height+'-'+mode.toLowerCase()+'.png')});
      samples.push({viewport:viewport.width+'x'+viewport.height,mode,fov:info.fov,hud:info.fields.length});
    }
  }
  await page.keyboard.press('F8');
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('gfx09-photo-mode')),
   true,'debug-only photo toggle');
  assert.equal(await page.locator('#h4-hud-root').evaluate(e=>getComputedStyle(e).visibility),
   'hidden');
  await page.keyboard.press('F8');
  assert.equal(await page.locator('body').evaluate(e=>e.classList.contains('gfx09-photo-mode')),false);

  // An intentionally camera-only test: the camera backs off from a physical
  // industrial box, while position/score/collider state remains unchanged.
  const occlusion=await page.evaluate(()=>{
    state.paused=true;
    const c=h4IndustrialColliders[0]||planetaryBuildingColliders[0];
    if(!c)return {hasCollider:false};
    const saved={progress:state.routeProgress,x:state.laneX,y:state.laneY,
      phase:state.map4Phase,pos:state.pos.clone(),score:state.score};
    state.routeProgress=c.progress;state.laneX=c.side+c.halfSide+250;
    state.laneY=c.altitude;state.map4Phase=3;
    state.pos.copy(h4WorldPosition(state.routeProgress,state.laneX,state.laneY));
    const target=h4WorldPosition(c.progress,c.side,c.altitude);
    const safe=h4Gfx09SafeChase(target,getRaceFrameAtDistance(c.progress));
    const result={hasCollider:true,blocked:h4Gfx09CameraInfo.occluded,
      distance:safe.distanceTo(state.pos),original:target.distanceTo(state.pos),
      scorePreserved:state.score===saved.score};
    state.routeProgress=saved.progress;state.laneX=saved.x;
    state.laneY=saved.y;state.map4Phase=saved.phase;state.pos.copy(saved.pos);
    return result;
  });
  assert(occlusion.hasCollider&&occlusion.blocked,'physical industrial box clipped chase');
  assert(occlusion.distance<occlusion.original,'camera moved closer to ship');
  assert(occlusion.scorePreserved,'camera change is visual only');

  await page.evaluate(()=>{state.paused=false;endGame(false);});
  // Explicitly choose Map1 from the start screen once game is inactive.
  await page.evaluate(()=>{
    state.running=false;state.paused=false;
    document.getElementById('start-screen').classList.remove('hidden');
    document.getElementById('gameover-screen').classList.add('hidden');
    selectMap(MAP_MODES.MAP1);
  });
  const map1=await page.evaluate(()=>({
    active:state.activeMap,grade:document.body.classList.contains('map4-composition'),
    photo:document.body.classList.contains('gfx09-photo-mode'),
    distance:camera.far,light:nebulaLight1.color.getHex()
  }));
  assert.equal(map1.active,'map1');
  assert.equal(map1.grade,false);
  assert.equal(map1.photo,false);
  assert.equal(map1.distance,4500);
  assert.equal(map1.light,0xff55aa);
  assert.equal(errors.length,0,'Runtime page errors: '+errors.join(' / '));
  console.log('GFX09 browser PASS',JSON.stringify({samples,occlusion,map1}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
