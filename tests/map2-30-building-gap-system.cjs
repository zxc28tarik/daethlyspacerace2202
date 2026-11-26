// MAP2-30/31 — golden-sector building blocks + real gap classification
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

const html=fs.readFileSync('index.html','utf8');
for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))if(m[1].trim())new vm.Script(m[1]);
assert(html.includes('MAP2-30/31: systematic building blocks and real gap classification'));

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
    const s=window.starbladeMap2GapBlockSystem;
    const tagged=[];
    map2CourseGroup.traverse(o=>{
      if(o.userData?.map2GapBlockId)tagged.push({
        name:o.name,id:o.userData.map2GapBlockId,
        style:o.userData.map2GapBlockStyle,
        passages:o.userData.map2GapBlockPassages,
        chaos:o.userData.map2GapBlockChaos
      });
    });
    let maxSame=0,run=0,last=null;
    for(const b of s.blocks){
      run=b.style===last?run+1:1;last=b.style;maxSame=Math.max(maxSame,run);
    }
    return {
      philosophy:s.philosophy,from:s.from,to:s.to,span:s.span,
      groups:s.groups,blockCount:s.blockCount,
      irregularGroupCounts:s.irregularGroupCounts,
      minBlockSpan:s.minBlockSpan,maxBlockSpan:s.maxBlockSpan,
      passageCounts:s.passageCounts,chaosBlocks:s.chaosBlocks,
      breatherBlocks:s.breatherBlocks,styleCounts:s.styleCounts,
      blocks:s.blocks.map(b=>({
        id:b.id,style:b.style,groupCount:b.groupCount,span:b.span,
        capacity:b.passageCapacity,target:b.targetPassages,actual:b.actualPassages,
        passageRoles:b.passages.map(p=>p.role)
      })),
      tagged:tagged.length,maxSame,
      oldStraight:window.starbladeMap2GroundedArchitecture?.remainingStraightSurfaces,
      stats:window.starbladeMap2Layout?.visualStage
    };
  });
  console.log('MAP2-30 GAP_BLOCK_SYSTEM '+JSON.stringify(info));

  assert.equal(info.philosophy,'BUILDING_COMPLEX_FIRST_GAPS_SECOND_ROUTE_THIRD');
  assert(info.span>=30000&&info.span<=45000,'golden sector must be the requested 30–40km-ish TECH prototype');
  assert(info.groups>=35&&info.groups<=60,'golden sector must contain a substantial real building chain');
  assert(info.blockCount>=18&&info.blockCount<=30,'golden sector should be split into about 20–30 design blocks');
  assert(info.irregularGroupCounts.length>=3,'block grouping may not become uniform/metronomic');
  assert(info.chaosBlocks>=2,'controlled chaos must exist inside the systematic sector');
  assert(info.breatherBlocks>=2,'breather gaps must be deliberately authored');
  assert(info.maxSame<=2,'same block style may not repeat mechanically');
  assert((info.passageCounts.dual+info.passageCounts.triple)>=2,'real copied geometry should expose multiple-choice points');
  assert(info.passageCounts.triple>=1,'at least one real three-passage candidate should exist in the golden sector');
  assert(info.blocks.filter(b=>b.target>1).every(b=>b.actual===b.target),'never label a fake second/third passage');
  assert(info.tagged>=info.groups,'real Map4 roots must carry their gap-block metadata');
  assert.equal(info.oldStraight,0,'central asphalt/deck cleanup must remain intact');
  assert.equal(info.stats?.gapSystemBlocks,info.blockCount);
  assert.equal(info.stats?.gapSystemDual,info.passageCounts.dual);
  assert.equal(info.stats?.gapSystemTriple,info.passageCounts.triple);
  assert.deepEqual(errors,[]);
  console.log('PASS MAP2-30/31 systematic blocks + irregular chaos + real multi-gap discovery');
 } finally {await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
