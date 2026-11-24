from pathlib import Path

index_path = Path("index.html")
source = index_path.read_text(encoding="utf-8")

old = r"""        // MAP2-04: altitude patrol. Isolated from all existing combat collections.
        const MAP2_PATROL=Object.freeze({ceiling:220,lockSeconds:.85,shotInterval:.7,damage:12,beamSeconds:.13});
        const map2PatrolVisual={ship:null,beam:null,flash:0};
        function map2PatrolReset(){
            state.map2Patrol=null;map2PatrolVisual.flash=0;
            if(map2PatrolVisual.ship)map2PatrolVisual.ship.visible=false;
            if(map2PatrolVisual.beam)map2PatrolVisual.beam.visible=false;
            window.starbladeMap2Patrol=null;
        }
        function map2PatrolStep(ship,dt,isPlayer){
            const p=ship.map2Patrol||(ship.map2Patrol={lock:0,shots:0,hits:0,active:false});
            const exposed=map2Active()&&!ship.finished&&!ship.dnf&&!(isPlayer&&state.playerDNF)&&
                map2Segment(ship.routeProgress).kind==='TECH'&&ship.laneY>MAP2_PATROL.ceiling;
            p.active=exposed;
            if(!exposed){p.lock=0;return false;}
            p.lock+=Math.max(0,dt);
            if(p.lock+1e-9<MAP2_PATROL.lockSeconds)return false;
            p.lock=Math.max(0,p.lock-MAP2_PATROL.shotInterval);p.shots++;
            const before=ship.shield;
            if(isPlayer)applyPlayerDamage(MAP2_PATROL.damage);
            else if(!(ship.powerShieldTimer>0)&&!(ship.barrelRollTimer>0)){
                ship.shield=Math.max(0,ship.shield-MAP2_PATROL.damage);
                if(ship.shield<=0){ship.dnf=true;ship.currentSpeed=0;ship.isBoosting=false;ship.isBraking=false;}
            }
            if(ship.shield<before)p.hits++;
            return true;
        }
        function map2PatrolTick(dt){
            if(!map2Active())return;
            const fired=map2PatrolStep(state,dt,true);
            for(const r of racers)map2PatrolStep(r,dt,false);
            const p=state.map2Patrol;
            const visible=state.running&&!state.finished&&!state.playerDNF&&map2Segment(state.routeProgress).kind==='TECH';
            const v=map2PatrolVisual;
            if(visible&&!v.ship){
                v.ship=createEnemyFighterMesh(true,false);
                v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(3.4);scene.add(v.ship);
                const geo=new THREE.BufferGeometry();
                geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
                v.beam=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xff593c,transparent:true,opacity:.95,depthWrite:false}));
                v.beam.name='MAP2_PATROL_LASER';v.beam.frustumCulled=false;scene.add(v.beam);
            }
            if(v.ship){
                v.ship.visible=visible;
                v.flash=fired?MAP2_PATROL.beamSeconds:Math.max(0,v.flash-dt);
                v.beam.visible=visible&&v.flash>0;
                if(visible){
                    const f=getRaceFrameAtDistance(Math.min(MAP2_DISTANCE,state.routeProgress+255));
                    const x=state.laneX*.35+Math.sin(state.raceTime*.9)*75;
                    v.ship.position.copy(f.center).addScaledVector(f.right,x).addScaledVector(f.up,325);
                    const pf=getRaceFrameAtDistance(state.routeProgress);
                    const target=pf.center.clone().addScaledVector(pf.right,state.laneX).addScaledVector(pf.up,state.laneY);
                    v.ship.lookAt(target);
                    if(v.beam.visible){
                        const a=v.beam.geometry.attributes.position;
                        a.setXYZ(0,v.ship.position.x,v.ship.position.y,v.ship.position.z);
                        a.setXYZ(1,target.x,target.y,target.z);a.needsUpdate=true;
                    }
                }
            }
            window.starbladeMap2Patrol={active:p.active,lock:p.lock,shots:p.shots,hits:p.hits,visible,ceiling:MAP2_PATROL.ceiling};
        }
        function map2PatrolWarning(){
            if(!map2Active()||state.finished||state.playerDNF||map2Segment(state.routeProgress).kind!=='TECH'||
                state.laneY<=MAP2_PATROL.ceiling)return null;
            const p=state.map2Patrol;
            return {tone:'urgent',title:p&&p.shots>0?'DEVRİYE ATEŞİ · ALÇAL':'DEVRİYE KİLİDİ · ALÇAL',detail:'Yapıların üstünde kalma · açıklıklardan geç'};
        }
"""

new = r"""        // MAP2-04/07: altitude patrol. Gameplay damage stays fixed; MAP2-07 adds readable approach/lock/breakaway motion.
        const MAP2_PATROL=Object.freeze({ceiling:220,lockSeconds:.85,approachSeconds:.42,shotInterval:.7,damage:12,beamSeconds:.13});
        const map2PatrolVisual={ship:null,beam:null,flash:0,breakaway:0,side:1,approach:0};
        function map2PatrolReset(){
            state.map2Patrol=null;
            map2PatrolVisual.flash=0;map2PatrolVisual.breakaway=0;map2PatrolVisual.side=1;map2PatrolVisual.approach=0;
            if(map2PatrolVisual.ship)map2PatrolVisual.ship.visible=false;
            if(map2PatrolVisual.beam)map2PatrolVisual.beam.visible=false;
            window.starbladeMap2Patrol=null;
        }
        function map2PatrolStep(ship,dt,isPlayer){
            const p=ship.map2Patrol||(ship.map2Patrol={lock:0,shots:0,hits:0,active:false});
            const exposed=map2Active()&&!ship.finished&&!ship.dnf&&!(isPlayer&&state.playerDNF)&&
                map2Segment(ship.routeProgress).kind==='TECH'&&ship.laneY>MAP2_PATROL.ceiling;
            p.active=exposed;
            if(!exposed){p.lock=0;return false;}
            p.lock+=Math.max(0,dt);
            if(p.lock+1e-9<MAP2_PATROL.lockSeconds)return false;
            p.lock=Math.max(0,p.lock-MAP2_PATROL.shotInterval);p.shots++;
            const before=ship.shield;
            if(isPlayer)applyPlayerDamage(MAP2_PATROL.damage);
            else if(!(ship.powerShieldTimer>0)&&!(ship.barrelRollTimer>0)){
                ship.shield=Math.max(0,ship.shield-MAP2_PATROL.damage);
                if(ship.shield<=0){ship.dnf=true;ship.currentSpeed=0;ship.isBoosting=false;ship.isBraking=false;}
            }
            if(ship.shield<before)p.hits++;
            return true;
        }
        function map2PatrolTick(dt){
            if(!map2Active())return;
            const fired=map2PatrolStep(state,dt,true);
            for(const r of racers)map2PatrolStep(r,dt,false);
            const p=state.map2Patrol;
            const visible=state.running&&!state.finished&&!state.playerDNF&&map2Segment(state.routeProgress).kind==='TECH';
            const v=map2PatrolVisual;
            if(visible&&!v.ship){
                v.ship=createEnemyFighterMesh(true,false);
                v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(3.4);scene.add(v.ship);
                const geo=new THREE.BufferGeometry();
                geo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
                v.beam=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xff593c,transparent:true,opacity:.95,depthWrite:false}));
                v.beam.name='MAP2_PATROL_LASER';v.beam.frustumCulled=false;scene.add(v.beam);
            }
            if(v.ship){
                v.ship.visible=visible;
                v.flash=fired?MAP2_PATROL.beamSeconds:Math.max(0,v.flash-dt);
                if(fired){v.breakaway=.34;v.side=(p.shots%2)?1:-1;}
                else v.breakaway=Math.max(0,v.breakaway-dt);
                v.beam.visible=visible&&v.flash>0;
                if(visible){
                    const active=!!p.active;
                    const lockRatio=active?Math.min(1,p.lock/MAP2_PATROL.lockSeconds):0;
                    const targetApproach=active?Math.min(1,lockRatio+(p.shots>0?.18:0)):0;
                    v.approach+=(targetApproach-v.approach)*Math.min(1,dt*(active?5.5:2.2));
                    const strike=v.breakaway>0?Math.sin((v.breakaway/.34)*Math.PI):0;
                    const ahead=370-v.approach*190+strike*95;
                    const f=getRaceFrameAtDistance(Math.min(MAP2_DISTANCE,state.routeProgress+ahead));
                    const sweep=Math.sin(state.raceTime*.85)*82;
                    const attackSide=v.side*(55+80*strike);
                    const x=state.laneX*(.25+.25*v.approach)+sweep*(1-v.approach*.55)+
                        attackSide*(v.approach*.35+strike*.65);
                    const altitude=430-v.approach*145+strike*90;
                    v.ship.position.copy(f.center).addScaledVector(f.right,x).addScaledVector(f.up,altitude);
                    const pf=getRaceFrameAtDistance(state.routeProgress);
                    const target=pf.center.clone().addScaledVector(pf.right,state.laneX).addScaledVector(pf.up,state.laneY);
                    const aim=target.clone().addScaledVector(pf.up,active?0:55);
                    v.ship.lookAt(aim);
                    if(v.beam.visible){
                        const a=v.beam.geometry.attributes.position;
                        a.setXYZ(0,v.ship.position.x,v.ship.position.y,v.ship.position.z);
                        a.setXYZ(1,target.x,target.y,target.z);a.needsUpdate=true;
                    }
                }else{
                    v.approach=0;v.breakaway=0;
                }
            }
            const phase=!p.active?'patrol':p.shots>0?'attack':p.lock<MAP2_PATROL.approachSeconds?'approach':'lock';
            window.starbladeMap2Patrol={active:p.active,lock:p.lock,shots:p.shots,hits:p.hits,visible,
                ceiling:MAP2_PATROL.ceiling,approach:v.approach,breakaway:v.breakaway,phase};
        }
        function map2PatrolWarning(){
            if(!map2Active()||state.finished||state.playerDNF||map2Segment(state.routeProgress).kind!=='TECH'||
                state.laneY<=MAP2_PATROL.ceiling)return null;
            const p=state.map2Patrol,lock=p?p.lock:0,shots=p?p.shots:0;
            if(shots>0)return {tone:'urgent',title:'DEVRİYE ATEŞİ · ALÇAL',detail:'Yapıların üstünde kalma · açıklıklardan geç'};
            if(lock<MAP2_PATROL.approachSeconds)return {tone:'caution',title:'DEVRİYE YAKLAŞIYOR · ALÇAL',detail:'Çatı çizgisinin altına in · açıklığa yönel'};
            return {tone:'urgent',title:'DEVRİYE KİLİDİ · ALÇAL',detail:'Ateş açmadan önce çatı çizgisinin altına in'};
        }
"""

if source.count(old) != 1:
    raise SystemExit(f"Expected exactly one MAP2 patrol block, found {source.count(old)}")
index_path.write_text(source.replace(old, new, 1), encoding="utf-8")

test = r"""'use strict';
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
await page.waitForFunction(()=>typeof map2PatrolTick==='function'&&typeof map2PatrolWarning==='function'&&typeof selectMap==='function');
assert(await page.locator('#map-choice-4').isDisabled());
await page.locator('#map-choice-2').click();
await page.locator('#start-btn').click();
await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&state.raceTime>.2,null,{timeout:30000});
const report=await page.evaluate(()=>{
  state.paused=true;
  const step=(n,dt=.05)=>{for(let i=0;i<n;i++)map2PatrolTick(dt);};
  state.routeProgress=40000;state.laneX=35;state.laneY=180;state.shield=100;
  state.powerShieldTimer=0;state.barrelRollTimer=0;map2PatrolReset();step(8);
  const low={warning:map2PatrolWarning(),shield:state.shield,visible:map2PatrolVisual.ship?.visible===true,
    approach:map2PatrolVisual.approach,shots:state.map2Patrol.shots};
  state.laneY=250;step(4);
  const early={warning:map2PatrolWarning(),shield:state.shield,phase:window.starbladeMap2Patrol.phase,
    approach:map2PatrolVisual.approach,shots:state.map2Patrol.shots};
  step(7);
  const locked={warning:map2PatrolWarning(),shield:state.shield,phase:window.starbladeMap2Patrol.phase,
    approach:map2PatrolVisual.approach,shots:state.map2Patrol.shots};
  step(6);
  const fired={warning:map2PatrolWarning(),shield:state.shield,phase:window.starbladeMap2Patrol.phase,
    beam:map2PatrolVisual.beam.visible,breakaway:map2PatrolVisual.breakaway,shots:state.map2Patrol.shots};
  state.laneY=190;step(30);
  const recovered={warning:map2PatrolWarning(),shield:state.shield,phase:window.starbladeMap2Patrol.phase,
    lock:state.map2Patrol.lock,shots:state.map2Patrol.shots,approach:map2PatrolVisual.approach};
  state.routeProgress=20000;state.laneY=300;step(8);
  const fast={warning:map2PatrolWarning(),visible:map2PatrolVisual.ship.visible,lock:state.map2Patrol.lock};
  return {cfg:{ceiling:MAP2_PATROL.ceiling,lockSeconds:MAP2_PATROL.lockSeconds,approachSeconds:MAP2_PATROL.approachSeconds,
      shotInterval:MAP2_PATROL.shotInterval,damage:MAP2_PATROL.damage},
    low,early,locked,fired,recovered,fast,map4Models:planetaryWorldRegions.length};
});
assert.deepEqual(report.cfg,{ceiling:220,lockSeconds:.85,approachSeconds:.42,shotInterval:.7,damage:12});
assert.equal(report.low.warning,null);assert.equal(report.low.shield,100);assert(report.low.visible);assert.equal(report.low.shots,0);
assert(report.early.warning?.title.includes('YAKLAŞIYOR'));assert.equal(report.early.phase,'approach');assert.equal(report.early.shield,100);assert.equal(report.early.shots,0);
assert(report.locked.warning?.title.includes('KİLİDİ'));assert.equal(report.locked.phase,'lock');assert.equal(report.locked.shield,100);assert.equal(report.locked.shots,0);
assert(report.locked.approach>report.early.approach,'patrol must visibly close during lock');
assert(report.fired.warning?.title.includes('ATEŞİ'));assert.equal(report.fired.phase,'attack');assert.equal(report.fired.shield,88);
assert.equal(report.fired.shots,1);assert(report.fired.beam);assert(report.fired.breakaway>0);
assert.equal(report.recovered.warning,null);assert.equal(report.recovered.shield,88);assert.equal(report.recovered.phase,'patrol');assert.equal(report.recovered.lock,0);
assert.equal(report.recovered.shots,1);assert(report.recovered.approach<report.locked.approach);
assert.equal(report.fast.warning,null);assert.equal(report.fast.visible,false);assert.equal(report.fast.lock,0);
assert.deepEqual(errors,[]);
const evidence=path.join(__dirname,'map2-07-evidence');fs.mkdirSync(evidence,{recursive:true});
await page.screenshot({path:path.join(evidence,'map2-patrol-approach.png')});
console.log('PASS MAP2-07 readable patrol approach/lock/fire/breakaway without gameplay rebalance',JSON.stringify(report));
}finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
"""
Path("tests/map2-07-patrol-approach.cjs").write_text(test, encoding="utf-8")
