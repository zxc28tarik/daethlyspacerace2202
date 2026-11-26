// MAP2-36/37 — ground integration and measured branch choices
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2-32/33: building roles and playable multi-passage complexes'));
assert(html.includes('map2GapRouteTargetAt(r,map2BuildingBasePlan)'));

(async()=>{
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-webgl-software-rendering','--disable-dev-shm-usage']});
 try{
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  const page=await browser.newPage({viewport:{width:1440,height:810}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve('index.html')).toString(),{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForFunction(()=>typeof map2BuildCourse==='function');
  await page.locator('#map-choice-2').click();
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});

  const info=await page.evaluate(()=>{
    const ground=window.starbladeMap2GapGroundIntegration;
    const costs=window.starbladeMap2RouteCostMetrics;
    const play=window.starbladeMap2PlayablePassages;
    if(!ground||!costs||!play)throw Error('missing integrated MAP2-36/37 data');
    let pads=0,links=0;
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2GroundPad)pads++;
      if(o.userData?.map2BuildingConnector)links++;
    });
    const physical=window.starbladeMap2BuildingColliders||[];
    const collisions=[],badTargets=[],choices=[];
    for(const c of play.complexes){
      for(const p of c.passages){
        for(let i=1;i<p.nodes.length;i++){
          const a=p.nodes[i-1],b=p.nodes[i];
          if(physical.some(o=>o.active!==false&&courseSegmentTouch(o,a,b,10.5)))collisions.push(p.id);
          const r={name:'test',laneX:a.laneX,laneY:a.laneY,map2GapChoices:{[c.id]:p.id}};
          const d=(a.routeProgress+b.routeProgress)*.5;
          const q=map2GapRouteTargetAt(r,{distance:d,x:0,y:0});
          if(q?.passageId!==p.id||Math.abs(q.x-(a.laneX+b.laneX)*.5)>1e-6||
            Math.abs(q.y-(a.laneY+b.laneY)*.5)>1e-6)badTargets.push(p.id);
        }
      }
      for(const profile of ['SPEED','CAUTIOUS','AGGRESSIVE','BALANCED']){
        const r={name:'test',aiStyle:profile,laneX:0,laneY:0,map2GapChoices:{}};
        const p=map2GapChoosePassage(r,c);
        r.laneX=999;
        const next=map2GapChoosePassage(r,c);
        choices.push({profile,valid:c.passages.includes(p),stable:p===next,
          scores:c.passages.map(x=>map2GapMeasuredCost(x,c,profile))});
      }
    }
    const synthetic={routeCostMetrics:{length:950,turn:1,climb:80,highExposure:100,nearSegments:1,opening:90,visibleLead:80}};
    const safe={routeCostMetrics:{length:900,turn:0,climb:0,highExposure:0,nearSegments:0,opening:220,visibleLead:340}};
    const comparison={passages:[synthetic,safe]};
    return {ground,costs,pads,links,collisions,badTargets,choices,
      cautiousRisk:map2GapMeasuredCost(synthetic,comparison,'CAUTIOUS'),
      speedRisk:map2GapMeasuredCost(synthetic,comparison,'SPEED'),
      stats:window.starbladeMap2Layout?.visualStage};
  });
  assert.equal(info.ground.padsBefore,info.pads);
  assert.equal(info.ground.padsAfter,info.pads);
  assert.equal(info.ground.linksAfter,info.links);
  assert.equal(info.ground.linksBefore-info.ground.removed,info.links);
  assert(info.ground.removed>=0&&info.ground.removed<=10);
  assert(info.ground.decisions.length>0);
  assert(info.ground.decisions.filter(x=>x.removed).every(x=>x.mode!=='SERVICE_LINK'&&x.d>=info.ground.sectorFrom&&x.d<=info.ground.sectorTo));
  assert.equal(info.stats.architectureConnectors,info.links);
  assert.equal(info.costs.complexes,9);
  assert.equal(info.costs.passages.length,21);
  assert(info.costs.passages.every(p=>p.length>0&&p.opening>0&&
    [p.length,p.turn,p.climb,p.highExposure,p.nearSegments].every(Number.isFinite)));
  assert.deepEqual(info.collisions,[]);
  assert.deepEqual(info.badTargets,[]);
  assert(info.choices.every(x=>x.valid&&x.stable&&x.scores.every(n=>Number.isFinite(n)&&n>=0&&n<=100)));
  assert(info.cautiousRisk>info.speedRisk);
  assert.deepEqual(errors,[]);
  const dir=path.join(__dirname,'map2-36-37-evidence');
  fs.mkdirSync(dir,{recursive:true});
  fs.writeFileSync(path.join(dir,'ground-route-costs.json'),JSON.stringify(info,null,2));
  console.log('MAP2-36/37 '+JSON.stringify(info));
  console.log('PASS MAP2-36/37 ground integration and measured branch costs');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
