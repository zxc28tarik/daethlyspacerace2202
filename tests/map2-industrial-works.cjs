'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const {chromium} = require('playwright');

(async () => {
    const browser = await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
    try {
        const page = await browser.newPage({viewport:{width:960,height:540}});
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.route('**/cdnjs.cloudflare.com/**', route => route.fulfill({
            path:require.resolve('three/build/three.min.js'), contentType:'text/javascript'
        }));
        await page.route('**/cdn.tailwindcss.com/**', route => route.fulfill({body:''}));
        await page.route('**/fonts.googleapis.com/**', route => route.fulfill({body:''}));
        // Drive the normal simulation at 30 Hz to make the flight reproducible.
        await page.addInitScript(() => {
            let seed=0x452035;
            Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
            window.addEventListener('load', () => { window.onload=null; }, {capture:true});
        });
        await page.goto(process.env.MAP2_GAME_URL || pathToFileURL(path.join(__dirname,'../index.html')).href);
        await page.locator('#map-choice-2').click({timeout:120000});
        await page.locator('#start-btn').click({timeout:120000});
        if(process.env.MAP2_CAPTURE_DIR){
            fs.mkdirSync(process.env.MAP2_CAPTURE_DIR,{recursive:true});
            await page.evaluate(()=>{window.captureTransferViews=true;});
        }
        for(const lane of [0,1]){
            const log=await page.evaluate(lane=>{
                startGame();
                state.routeProgress=44800;
                state.mouseX=W/2;state.mouseY=H/2;
                racers.forEach((r,i)=>{
                    r.routeProgress=44810+i*55;
                    positionRacerOnRoute(r);
                });
                const gates=map2Gates.filter(g=>g.distance>=45000&&g.distance<96250);
                const pilots=[state,...racers];
                const samples=pilots.map(()=>[]);
                const contacts=[],views=[],choices={};
                const seen=new Set();
                const shipHits=p=>p===state?p.barrierHits:p.aiStats.wreckHits;
                for(let frame=0;frame<6000&&state.running;frame++){
                    const d=state.routeProgress+145;
                    const aim=map2ThroughRouteTargetAt(d)||{x:0,y:0};
                    const complex=map2GapComplexAt(d);
                    if(complex&&d>=45000&&d<96250){
                        const nodes=complex.passages[lane].nodes;
                        const i=nodes.findIndex((n,i)=>i>0&&n.routeProgress>=d);
                        const a=nodes[i-1],b=nodes[i],t=(d-a.routeProgress)/(b.routeProgress-a.routeProgress);
                        aim.x=a.laneX+(b.laneX-a.laneX)*t;
                        aim.y=a.laneY+(b.laneY-a.laneY)*t;
                    }
                    const clamp=v=>Math.max(-1,Math.min(1,v));
                    window.dispatchEvent(new MouseEvent('mousemove',{
                        clientX:W*(1+clamp((aim.x-state.laneX)/125))/2,
                        clientY:H*(1-clamp((aim.y-state.laneY)/115))/2
                    }));
                    const previous=pilots.map(p=>[p.routeProgress,p.laneX,p.laneY,shipHits(p)]);
                    updateGame(1/30);
                    pilots.forEach((p,j)=>{
                        const [last,x,y,hits]=previous[j];
                        if(shipHits(p)>hits&&p.routeProgress<96250)
                            contacts.push([p.name||'PLAYER',Math.round(p.routeProgress),Math.round(p.laneX),Math.round(p.laneY)]);
                        for(const g of gates){
                            if(g.distance<=last||g.distance>p.routeProgress)continue;
                            const t=(g.distance-last)/(p.routeProgress-last);
                            const sx=x+(p.laneX-x)*t,sy=y+(p.laneY-y)*t;
                            const gap=g.openings.findIndex(o=>Math.abs(sx-o.x)<o.hx-10&&Math.abs(sy-o.y)<o.hy-10);
                            samples[j].push([g.distance,gap]);
                            if(g.openings.length>1&&j){
                                (choices[g.distance]??=[]).push(gap);
                            }
                        }
                    });
                    if(lane===0&&window.captureTransferViews){
                        const next=gates.find(g=>g.distance-state.routeProgress>650&&g.distance-state.routeProgress<720);
                        if(next&&!seen.has(next.kind)){
                            seen.add(next.kind);renderer.render(scene,camera);
                            views.push([next.kind,renderer.domElement.toDataURL()]);
                        }
                    }
                    if(pilots.every(p=>p.routeProgress>=96300))break;
                }
                return {stations:gates.length,samples,choices,contacts,views,
                    exits:pilots.map(p=>Math.round(p.routeProgress)),
                    forks:gates.filter(g=>g.openings.length>1).map(g=>g.distance),
                    fastObstacles:map2Obstacles.filter(o=>map2Segment(o.routeProgress).kind==='FAST').length};
            },lane);
            for(const [name,url] of log.views)
                fs.writeFileSync(path.join(process.env.MAP2_CAPTURE_DIR,'works-'+name+'.png'),Buffer.from(url.split(',')[1],'base64'));
            const misses=log.samples.flatMap((s,pilot)=>s.filter(row=>row[1]<0).map(row=>({pilot,at:row[0]})));
            console.log(JSON.stringify({lane,stations:log.stations,exits:log.exits,contacts:log.contacts,misses,branches:log.choices}));
            assert.equal(log.stations,25);
            assert.equal(log.fastObstacles,0);
            assert(log.exits.every(d=>d>=96250),'all pilots must reach FAST');
            assert(log.samples.every(s=>s.length===log.stations),'all gates must be traversed');
            assert.deepEqual(misses,[]);
            assert.deepEqual(log.contacts,[]);
            for(const at of log.forks){
                assert.equal(log.samples[0].find(row=>row[0]===at)[1],lane);
                assert.equal(new Set(log.choices[at]).size,2);
            }
        }
        assert.deepEqual(errors,[]);
    }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});


