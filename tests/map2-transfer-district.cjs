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
        for (const branch of ['LOW_PIPE','OUTER_SERVICE']) {
            const trace = await page.evaluate(branch => {
                startGame();
                state.routeProgress=34200;
                state.mouseX=W/2;state.mouseY=H/2;
                racers.forEach((r,i) => {
                    r.routeProgress=state.routeProgress+200+i*75;
                    positionRacerOnRoute(r);
                });
                const passage=map2TransferFork.passages.find(p=>p.id===branch);
                const samples=[], fleet={}, views=[], contacts=[]; const previousHits=new Map();
                // Only the starting grid is placed. Thereafter use the game's mouse input,
                // normal speed, bot decisions and swept contacts all the way to the exit.
                for(let frame=0;frame<1800 && state.running;frame++){
                    const d=state.routeProgress, look=d+145;
                    let aim=map2ThroughRouteTargetAt(look)||{x:0,y:0};
                    if(look>=passage.start&&look<=passage.end){
                        const nodes=passage.nodes;
                        const i=nodes.findIndex((n,i)=>i>0&&n.routeProgress>=look);
                        const a=nodes[i-1],b=nodes[i];
                        const t=(look-a.routeProgress)/(b.routeProgress-a.routeProgress);
                        aim={x:a.laneX+(b.laneX-a.laneX)*t,y:a.laneY+(b.laneY-a.laneY)*t};
                    }
                    const clamp=v=>Math.max(-1,Math.min(1,v));
                    window.dispatchEvent(new MouseEvent('mousemove',{
                        clientX:W*(1+clamp((aim.x-state.laneX)/140))/2,
                        clientY:H*(1-clamp((aim.y-state.laneY)/120))/2
                    }));
                    updateGame(1/30);
                    if(d<40100&&state.routeProgress>=40100)samples.push([state.laneX,state.laneY]);
                    for(const r of racers){
                        if(r.aiStats.wreckHits>(previousHits.get(r)||0)){contacts.push([r.name,Math.round(r.routeProgress),Math.round(r.laneX),Math.round(r.laneY)]); previousHits.set(r,r.aiStats.wreckHits);}
                        if(r.routeProgress>=40100&&!fleet[r.name]){
                            fleet[r.name]={choice:r.map2GapChoices?.PRESSURE_TRANSFER,x:r.laneX,y:r.laneY};
                        }
                    }
                    if(window.captureTransferViews&&views.length<3&&state.routeProgress>=[35430,39200,41450][views.length]){
                        renderer.render(scene,camera);
                        views.push(renderer.domElement.toDataURL());
                    }
                    if(state.routeProgress>45100&&racers.every(r=>r.routeProgress>45000))break;
                }
                return {branch,samples,fleet,views,contacts,progress:state.routeProgress,hits:state.barrierHits,
                    bots:racers.map(r=>({name:r.name,progress:r.routeProgress,hits:r.aiStats.wreckHits}))};
            },branch);
            const views=trace.views.splice(0);
            views.forEach((url,i)=>fs.writeFileSync(path.join(process.env.MAP2_CAPTURE_DIR,branch+'-'+i+'.png'),Buffer.from(url.split(',')[1],'base64')));
            console.log(JSON.stringify(trace));
            const inside=(choice,x,y)=>choice==='LOW_PIPE' ? Math.abs(x+88)<78&&Math.abs(y+83)<64 :
                choice==='OUTER_SERVICE'&&Math.abs(x-274)<123&&Math.abs(y+6)<108;
            assert(trace.progress>45000 && trace.hits===0,'player must clear the complete district');
            assert(trace.samples.length===1 && inside(branch,...trace.samples[0]),'player must fly through selected mouth');
            assert(trace.bots.every(r=>r.progress>45000),'fleet must rejoin at the exit');
            assert(!trace.contacts.some(([,d])=>d>=35000&&d<45000),'fleet struck a district building');
            const crossings=Object.values(trace.fleet);
            assert.equal(crossings.length,5);
            assert.equal(new Set(crossings.map(r=>r.choice)).size,2);
            assert(crossings.every(r=>inside(r.choice,r.x,r.y)),'bot crossing must match committed passage');
        }
        const collision=await page.evaluate(()=>{
            startGame();
            // Enter the solid central pier using normal physics and damage handling.
            state.routeProgress=39500; state.laneX=65; state.laneY=-50;
            state.mouseX=W/2;state.mouseY=H/2;
            for(let i=0;i<240&&state.running&&state.routeProgress<40110;i++)updateGame(1/30);
            return {hits:state.barrierHits,shield:state.shield};
        });
        assert(collision.hits>0&&collision.shield<100,'central pier must stop a clean crossing');
        console.log('Central pier contact',collision);

        assert.deepEqual(errors,[]);
    } finally { await browser.close(); }
})().catch(error=>{console.error(error);process.exitCode=1;});

