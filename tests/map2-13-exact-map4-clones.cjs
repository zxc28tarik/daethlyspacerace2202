'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');
const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1280,height:720}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function'&&typeof buildPlanetaryWorld==='function');
  assert(await page.locator('#map-choice-4').isDisabled(),'Map4 must remain locked');
  await page.locator('#map-choice-2').click();await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const structural=await page.evaluate(()=>{
    const clones=[];
    map2CourseGroup.traverse(o=>{if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_'))clones.push(o)});
    const roots=clones.filter(o=>o.parent&&o.parent.parent===map2CourseGroup);
    let meshPairs=0,sameGeo=0,sameMat=0,namePairs=0;
    for(const clone of roots){
      const source=h4IndustrialGroups.find(g=>g.name===clone.userData.sourceMap4Station);
      if(!source)continue;
      const sm=[],cm=[];
      source.traverse(o=>{if(o.isMesh||o.isInstancedMesh)sm.push(o)});
      clone.traverse(o=>{if(o.isMesh||o.isInstancedMesh)cm.push(o)});
      const n=Math.min(sm.length,cm.length);meshPairs+=n;
      for(let i=0;i<n;i++){
        if(sm[i].geometry===cm[i].geometry)sameGeo++;
        if(sm[i].material===cm[i].material)sameMat++;
        if(sm[i].name===cm[i].name)namePairs++;
      }
    }
    return {
      activeMap:state.activeMap,map4Regions:planetaryWorldRegions.length,map4Visible:planetaryWorldGroup.visible,
      sources:h4IndustrialGroups.map(g=>g.name),roots:roots.length,
      meshPairs,sameGeo,sameMat,namePairs,
      visualStats:window.starbladeMap2Layout?.visualStage||null,
      fakeFactory:!!map2CourseGroup.getObjectByName('MAP2_VISUAL_FACTORY_0_-1'),
      fakeFastNames:[],
    };
  });
  assert.equal(structural.activeMap,'map2');
  assert(structural.map4Regions>=4,'hidden authoritative Map4 must be built once');
  assert.equal(structural.map4Visible,false,'hidden Map4 source world must not render in Map2');
  assert.deepEqual(structural.sources,[
    'W05_INDUSTRY_STATION_1','W05_INDUSTRY_STATION_2','W05_INDUSTRY_STATION_3',
    'W05_INDUSTRY_STATION_4','W05_INDUSTRY_STATION_5','W05_INDUSTRY_STATION_6'
  ]);
  assert(structural.roots>=10,'Map2 should reuse many complete Map4 stations');
  assert(structural.meshPairs>300,'exact station clones need substantial final child trees');
  assert.equal(structural.sameGeo,structural.meshPairs,'clone must share exact Map4 geometry objects');
  assert.equal(structural.sameMat,structural.meshPairs,'clone must share exact Map4 material objects');
  assert.equal(structural.namePairs,structural.meshPairs,'clone child names must stay identical');
  assert.equal(structural.fakeFactory,false,'old fabricated Map2 factory must be absent');

  const evidence=path.join(__dirname,'map2-13-evidence');fs.mkdirSync(evidence,{recursive:true});
  async function settle(progress,name){
    const lead=Math.max(0,progress-900);
    await page.evaluate(p=>{state.paused=false;state.routeProgress=p;state.laneX=0;state.laneY=80;},lead);
    await page.waitForTimeout(300);
    for(let i=1;i<=9;i++){
      const at=lead+(progress-lead)*i/9;
      await page.evaluate(p=>{state.routeProgress=p;state.laneX=0;state.laneY=80;state.paused=false;},at);
      await page.waitForTimeout(70);
    }
    await page.evaluate(p=>{
      state.routeProgress=p;state.laneX=0;state.laneY=80;state.paused=true;
      map2UpdateVisibility(p);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);
    },progress);
    await page.waitForTimeout(220);
    const info=await page.evaluate(()=>{
      let exactRootsOn=0,exactMeshesOn=0,oldBoxes=0;
      map2CourseGroup.traverse(o=>{
        const n=o.name||'';
        if(n.startsWith('MAP2_VISUAL_FACTORY_')||n.startsWith('MAP2_FAST_SILHOUETTE_')||n.startsWith('MAP2_LINK_SILHOUETTE_'))oldBoxes++;
        if(!o.userData?.map2ExactMap4Clone)return;
        const p=new THREE.Vector3();o.getWorldPosition(p);const q=p.clone().project(camera);
        const on=q.z>=-1&&q.z<=1&&Math.abs(q.x)<=1.3&&Math.abs(q.y)<=1.3;
        if(on){
          if(n.startsWith('MAP2_EXACT_MAP4_'))exactRootsOn++;
          if(o.isMesh||o.isInstancedMesh)exactMeshesOn++;
        }
      });
      return {seg:map2Segment(state.routeProgress).kind,exactRootsOn,exactMeshesOn,oldBoxes};
    });
    await page.screenshot({path:path.join(evidence,name+'.png')});
    return info;
  }
  const user=await settle(7249,'00-user-view-exact-map4-clone');
  const tech=await settle(36500,'01-tech-exact-map4-clone');
  assert.equal(user.oldBoxes,0);assert.equal(tech.oldBoxes,0);
  assert(user.exactMeshesOn>=8,'opening view must visibly contain exact Map4 station meshes');
  assert(tech.exactMeshesOn>=8,'TECH view must visibly contain exact Map4 station meshes');
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-13 exact Map4 station clone '+JSON.stringify({structural,user,tech}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
