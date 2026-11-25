// MAP2-32/33 — architectural roles + validated playable real multi-passages
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
    const gap=window.starbladeMap2GapBlockSystem;
    const play=window.starbladeMap2PlayablePassages;
    const physical=window.starbladeMap2BuildingColliders||[];
    const roleRoots={};
    map2CourseGroup.traverse(o=>{
      const r=o.userData?.map2BuildingRole;
      if(r)roleRoots[r]=(roleRoots[r]||0)+1;
    });
    const collisions=[];
    for(const c of play.complexes){
      for(const p of c.passages){
        for(let i=1;i<p.nodes.length;i++){
          const a=p.nodes[i-1],b=p.nodes[i];
          if(physical.some(o=>o.active!==false&&courseSegmentTouch(o,a,b,10.5)))
            collisions.push({complex:c.id,passage:p.id,segment:i});
        }
      }
    }

    // Force fresh choices in one triple (or best available) complex and verify the
    // live profile/crowding chooser does not collapse the whole fleet to one branch.
    const sample=play.complexes.find(c=>c.passages.length>=3)||
      play.complexes.find(c=>c.passages.length>=2);
    const choices=[];
    if(sample){
      racers.forEach((r,i)=>{
        r.map2GapChoices={};
        r.laneX=(i-2)*38;r.laneY=-45+(i%2)*35;
      });
      for(const r of racers){
        const base=map2ThroughRouteTargetAt(sample.focusDistance,0);
        const q=map2GapRouteTargetAt(r,base);
        choices.push({name:r.name,passage:q?.passageId,role:q?.passageRole,profile:map2GapRacerProfile(r)});
      }
    }
    return {
      gapCounts:gap.passageCounts,
      roleCounts:play.roleCounts,
      roleRoots,
      playableComplexes:play.playableComplexes,
      playableDual:play.playableDual,
      playableTriple:play.playableTriple,
      rejectedBranches:play.rejectedBranches,
      gateConflicts:play.gateConflicts,
      complexes:play.complexes.map(c=>({id:c.id,style:c.style,role:c.buildingRole,passages:c.passages.length,
        ids:c.passages.map(p=>p.id),roles:c.passages.map(p=>p.role)})),
      collisions,
      choices,
      distinctChoices:new Set(choices.map(x=>x.passage).filter(Boolean)).size,
      oldStraight:window.starbladeMap2GroundedArchitecture?.remainingStraightSurfaces,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });
  console.log('MAP2-32/33 PLAYABLE_GAPS '+JSON.stringify(info));

  assert(info.roleCounts.MULTI_HUB>=3);
  assert(info.roleCounts.SPLIT_GATE>=6);
  assert(info.roleCounts.CHAOS_CLUSTER>=2);
  assert(info.roleCounts.OPEN_YARD>=2);
  assert(info.roleRoots.MULTI_HUB>=1&&info.roleRoots.SPLIT_GATE>=1,'real Map4 roots must receive architectural jobs');
  assert(info.playableComplexes>=3,'several real multi-gap complexes must survive physical validation');
  assert(info.playableDual>=2,'at least two validated dual-path complexes are required');
  assert(info.playableTriple>=1,'at least one validated triple-path complex is required');
  assert.deepEqual(info.collisions,[],'every published alternate branch must be collision-free against real Map4 building colliders');
  assert(info.distinctChoices>=2,'rival crowd/profile chooser must distribute racers across real branches');
  assert.equal(info.oldStraight,0,'central road must remain retired');
  assert.equal(info.stats?.playableGapComplexes,info.playableComplexes);
  assert.equal(info.stats?.playableGapDual,info.playableDual);
  assert.equal(info.stats?.playableGapTriple,info.playableTriple);
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-32 roles + MAP2-33 validated multi-passage routing');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
