// MAP2-21 — authored gameplay sequences using only existing real Map4 groups
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('map2ArrangeAuthoredBuildingSequences'));
assert(html.includes('CITY_GATE'));
assert(html.includes('CORRIDOR_KNIFE'));

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
    const seq=window.starbladeMap2AuthoredSequences;
    const road=window.starbladeMap2BuildingRoad;
    const coreKnots=road.coreKnots||road.knots;
    const comp=window.starbladeMap2BuildingChainCompaction;
    const expected=[
      [
        ['LANDMARK','CITY','STATION','INDUSTRIAL','LANDMARK','STATION','STATION','STATION'],
        ['PLANT','STATION','STATION','INDUSTRIAL','STATION','PLANT','STATION','STATION'],
        ['CITY','STATION','STATION','PLANT','STATION','INDUSTRIAL','STATION','STATION'],
        ['CITY','STATION','STATION','STATION','STATION','STATION','STATION','STATION']
      ],
      [
        ['LANDMARK','STATION','CITY','STATION','INDUSTRIAL','STATION','STATION'],
        ['SPACEPORT','STATION','STATION','STATION','CITY','STATION','STATION'],
        ['CORRIDOR','STATION','INDUSTRIAL','STATION','STATION','STATION','STATION'],
        ['SPACEPORT','STATION','STATION','STATION','STATION','STATION','STATION']
      ]
    ];
    const names=[
      ['CITY_GATE','REFINERY_SLALOM','LOW_FACTORY_RUN','CITY_EXIT_CANYON'],
      ['OUTPOST_ENTRY','SPACEPORT_RUN','CORRIDOR_KNIFE','LAUNCH_EXIT']
    ];

    const chains=seq.plan.map((p,ri)=>{
      const slots=p.slots;
      const grouped=names[ri].map(name=>{
        const planRows=slots.filter(s=>s.sequence===name);
        const roadRows=road.groups.filter(g=>g.sequence===name).sort((a,b)=>a.d-b.d);
        const xr=roadRows.length?Math.max(...roadRows.map(r=>r.x))-Math.min(...roadRows.map(r=>r.x)):0;
        const yr=roadRows.length?Math.max(...roadRows.map(r=>r.y))-Math.min(...roadRows.map(r=>r.y)):0;
        const avgY=roadRows.length?roadRows.reduce((n,r)=>n+r.y,0)/roadRows.length:0;
        return {
          name,
          expected:expected[ri][names[ri].indexOf(name)],
          planTypes:planRows.map(r=>r.type),
          roadTypes:roadRows.map(r=>r.sequenceType),
          count:roadRows.length,
          framed:roadRows.filter(r=>r.framed).length,
          xr,yr,avgY,
          minD:roadRows[0]?.d,maxD:roadRows[roadRows.length-1]?.d,
          laneSigns:[...new Set(roadRows.map(r=>Math.sign(r.x)).filter(Boolean))]
        };
      });
      return {rangeIndex:ri,count:slots.length,grouped};
    });

    const allRoad=road.groups.filter(g=>g.sequence);
    const seqNames=[...new Set(allRoad.map(g=>g.sequence))];
    const physical=window.starbladeMap2BuildingColliders||[];
    const rootSequence=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2SequenceName)rootSequence.push({
        name:o.name,seq:o.userData.map2SequenceName,type:o.userData.map2SequenceType,
        slot:o.userData.map2SequenceSlot,d:o.userData.map2TargetDistance,
        seg:map2Segment(o.userData.map2TargetDistance).kind
      });
    });

    const techRanges=MAP2_SEGMENTS.filter(s=>s.kind==='TECH').map(s=>({from:s.from*MAP2_DISTANCE,to:s.to*MAP2_DISTANCE}));
    const techGaps=[];
    for(const range of techRanges){
      const knots=coreKnots.filter(k=>k.distance>=range.from&&k.distance<=range.to).sort((a,b)=>a.distance-b.distance);
      let prev=range.from;
      for(const k of knots){techGaps.push(k.distance-prev);prev=k.distance;}
      techGaps.push(range.to-prev);
    }

    return {
      sequenceCount:seq.sequenceCount,reordered:seq.reordered,laneSwings:seq.laneSwings,verticalSwings:seq.verticalSwings,
      chains,seqNames,roadGroups:allRoad.length,knots:coreKnots.length,totalKnots:road.knots.length,
      framed:allRoad.filter(g=>g.framed).length,
      physical:physical.length,fastPhysical:physical.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length,
      rootSequenceCount:rootSequence.length,rootsTech:rootSequence.every(r=>r.seg==='TECH'),
      maxGap:Math.max(...techGaps),
      compMaxGap:comp.maxGapAfter,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });

  console.log('MAP2-21 AUTHORED_SEQUENCES '+JSON.stringify(info));

  assert.equal(info.sequenceCount,8,'exactly eight authored TECH sequences are expected');
  assert.equal(info.roadGroups,60,'all 60 existing building groups must participate');
  assert.equal(info.knots,60,'one core real aperture knot per authored building group');
  assert(info.totalKnots>=info.knots,'later real-building handoffs may add extra knots');
  assert(info.reordered>=35,'the uniform MAP2-20 order must be substantially rearranged');
  assert(info.laneSwings>=10,'authored route should contain repeated left/right building transitions');
  assert(info.verticalSwings>=6,'authored route should contain meaningful altitude transitions');
  assert.deepEqual(info.chains.map(c=>c.count),[32,28]);

  for(const chain of info.chains){
    for(const g of chain.grouped){
      assert.deepEqual(g.planTypes,g.expected,g.name+' plan type grammar must match');
      assert.deepEqual(g.roadTypes,g.expected,g.name+' real road order must match plan');
      assert(g.count===g.expected.length,g.name+' must retain full sequence length');
      assert(g.xr>=80,g.name+' should produce visible lateral movement');
    }
  }

  const find=name=>info.chains.flatMap(c=>c.grouped).find(g=>g.name===name);
  assert(find('REFINERY_SLALOM').xr>=150,'refinery slalom should strongly alternate left/right');
  assert(find('LOW_FACTORY_RUN').avgY<=-70,'low factory sequence must remain visibly low');
  assert(find('CITY_EXIT_CANYON').laneSigns.length===2,'city exit canyon should cross both sides');
  assert(find('SPACEPORT_RUN').expected[0]==='SPACEPORT');
  assert(find('CORRIDOR_KNIFE').expected[0]==='CORRIDOR');
  assert(find('LAUNCH_EXIT').expected[0]==='SPACEPORT');

  assert(info.framed>=54,'most authored sequence knots must remain framed by real building mass');
  assert(info.physical>=50,'substantial real building physics must remain');
  assert.equal(info.fastPhysical,0,'FAST zones stay free of building-derived collision');
  assert.equal(info.rootSequenceCount,122,'all 122 copied roots must belong to an authored sequence');
  assert(info.rootsTech,'sequenced roots must remain in TECH');
  assert(info.maxGap<=2250,'authored reordering must keep MAP2-20 continuous cadence');
  assert(info.compMaxGap<=2250);
  assert.equal(info.stats?.authoredSequences,8);
  assert.equal(info.stats?.sequenceReorderedGroups,info.reordered);
  assert.equal(info.stats?.sequenceLaneSwings,info.laneSwings);
  assert.equal(info.stats?.sequenceVerticalSwings,info.verticalSwings);

  const evidence=path.join(__dirname,'map2-21-evidence');fs.mkdirSync(evidence,{recursive:true});
  const target=find('REFINERY_SLALOM').minD+1200;
  await page.evaluate(d=>{state.routeProgress=d;state.laneX=0;state.laneY=-55;state.paused=true;map2UpdateVisibility(d);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);},target);
  await page.waitForTimeout(350);
  await page.screenshot({path:path.join(evidence,'00-refinery-slalom-sequence.png')});
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-21 authored real-building gameplay sequences');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
