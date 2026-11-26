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
        for(const lane of [0,1]){
            const result=await page.evaluate(({capture,lane})=>{
                startGame();
                const from=96250, to=113750, dt=1/30;
                const firstGate=map2Gates.find(g=>g.distance>=to);
                const finish=firstGate.distance+firstGate.depth/2+50;
                const start=94650, line=map2ThroughRouteTargetAt(start);
                state.routeProgress=start;
                state.laneX=line.x;
                state.laneY=line.y;
                racers.forEach((r,i)=>{
                    r.routeProgress=start-i*52;
                    const aim=map2ThroughRouteTargetAt(r.routeProgress);
                    r.laneX=aim.x;
                    r.laneY=aim.y+(i-2)*12;
                    positionRacerOnRoute(r);
                });
                const ships=[state,...racers];
                const stats=ships.map(p=>({name:p.name||'Oyuncu',peak:0,boostSeconds:0,entry:0,exit:0,gate:-1,hits:0}));
                const views=[];
                const viewDistances=[96850,104600,112650];
                let widestFlight=0,wideDamage=0;
                for(let frame=0;frame<2400&&state.running;frame++){
                    const d=state.routeProgress, look=d+180;
                    const aim=map2ThroughRouteTargetAt(look)||{x:0,y:-36};
                    if(d>=from&&d<to){
                        // Fly beyond the old safe width on the straight and rejoin the approach.
                        aim.x+=765*THREE.MathUtils.smoothstep(d,99500,102000)*
                            (1-THREE.MathUtils.smoothstep(d,106000,109500));
                    }
                    const gate=upcomingWreckGate(d,2400);
                    if(gate===firstGate){
                        const gap=gate.openings[lane];
                        aim.x=gap.x;
                        aim.y=gap.y;
                    }
                    const clamp=v=>Math.max(-1,Math.min(1,v));
                    window.dispatchEvent(new MouseEvent('mousemove',{
                        clientX:W*(1+clamp((aim.x-state.laneX)/150))/2,
                        clientY:H*(1-clamp((aim.y-state.laneY)/135))/2
                    }));
                    const boost=d>=from&&d<to-1800&&
                        (state.energy>35||(keys.ShiftLeft&&state.energy>8));
                    if(!!keys.ShiftLeft!==boost)
                        window.dispatchEvent(new KeyboardEvent(boost?'keydown':'keyup',{code:'ShiftLeft',key:'Shift'}));
                    const progress=ships.map(p=>p.routeProgress);
                    const countHits=p=>p===state?p.barrierHits:p.aiStats.wreckHits;
                    const hits=ships.map(countHits);
                    const previous=ships.map(p=>[p.laneX,p.laneY]);
                    updateGame(dt);
                    ships.forEach((p,i)=>{
                        const s=stats[i], speed=p.currentSpeed*SPEED_DISPLAY_SCALE;
                        if(progress[i]<from&&p.routeProgress>=from)s.entry=speed;
                        if(progress[i]<to&&p.routeProgress>=to)s.exit=speed;
                        if(progress[i]>=from&&progress[i]<to){
                            s.peak=Math.max(s.peak,speed);
                            if((i?p.isBoosting:boost)&&speed>RACE_SPEEDS.NORMAL*SPEED_DISPLAY_SCALE+100)
                                s.boostSeconds+=dt;
                        }
                        if(progress[i]<firstGate.distance&&p.routeProgress>=firstGate.distance){
                            const t=(firstGate.distance-progress[i])/(p.routeProgress-progress[i]);
                            const x=THREE.MathUtils.lerp(previous[i][0],p.laneX,t);
                            const y=THREE.MathUtils.lerp(previous[i][1],p.laneY,t);
                            s.gate=firstGate.openings.findIndex(o=>Math.abs(x-o.x)<o.hx-10&&Math.abs(y-o.y)<o.hy-10);
                        }
                        if(progress[i]<finish)s.hits+=countHits(p)-hits[i];
                    });
                    if(state.laneX>715){
                        widestFlight=Math.max(widestFlight,state.laneX);
                        wideDamage=Math.max(wideDamage,state.boundaryLevel);
                    }
                    if(capture&&views.length<viewDistances.length&&d>=viewDistances[views.length]){
                        renderer.render(scene,camera);
                        views.push({d:Math.round(d),image:renderer.domElement.toDataURL()});
                    }
                    if(ships.every(p=>p.routeProgress>=finish))break;
                }
                return {stats,views,widestFlight,wideDamage,positions:ships.map(p=>p.routeProgress),finish,
                    firstGate:firstGate.distance, limits:[map2LateralScale(from),map2LateralScale(105000),map2LateralScale(to)],
                    obstacles:map2Obstacles.filter(o=>o.routeProgress>=from&&o.routeProgress<to).length,
                    gates:map2Gates.filter(g=>g.distance>=from&&g.distance<to).length};
            },{capture:!!process.env.MAP2_CAPTURE_DIR&&lane===0,lane});
            const {views,...metrics}=result;
            for(const v of views){
                const dir=process.env.MAP2_CAPTURE_DIR;
                fs.mkdirSync(dir,{recursive:true});
                fs.writeFileSync(path.join(dir,'speedway-'+v.d+'.png'),Buffer.from(v.image.split(',')[1],'base64'));
            }
            console.log(JSON.stringify(metrics));
            assert.deepEqual(errors,[]);
            assert.equal(metrics.obstacles,0);
            assert.equal(metrics.gates,0);
            assert.deepEqual(metrics.limits,[2,3,2]);
            assert(metrics.widestFlight>735&&metrics.wideDamage===0,'outer overtaking lane must be flyable');
            assert(metrics.positions.length===6&&metrics.positions.every(d=>d>=metrics.finish));
            assert(metrics.stats.every(s=>s.entry>0&&s.exit>0&&s.peak>4650&&s.boostSeconds>1));
            assert.equal(metrics.stats[0].gate,lane);
            assert(metrics.stats.every(s=>s.gate>=0),'all ships enter the first technical gate');
            assert(metrics.stats.every(s=>s.hits===0),'clear exit and entry for all six ships');
        }
    }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
