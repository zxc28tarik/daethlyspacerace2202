/* Browser smoke tests for Map 1 and Map 4. Only repository code is tested. */
const {chromium} = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const {pathToFileURL} = require('node:url');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  const page = await browser.newPage({viewport:{width:1440,height:900}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', msg => {if (msg.type()==='error' && !/font|tailwind|network/i.test(msg.text())) errors.push(msg.text())});
  try {
    const three = fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**', route =>
      route.fulfill({status:200,contentType:'text/javascript',body:three}));
    await page.route('**/cdn.tailwindcss.com/**',route=>
      route.fulfill({status:200,contentType:'text/javascript',body:''}));
    await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),{
      waitUntil:'domcontentloaded',timeout:25000
    });
    await page.waitForFunction(() => typeof selectMap === 'function' &&
      typeof state === 'object' && typeof THREE === 'object',null,{timeout:15000});
    assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'false');
    await page.locator('#map-choice-4').click();
    assert.equal(await page.locator('#start-btn').isEnabled(),true,'Map4 selectable');
    await page.locator('#start-btn').click();
    await page.waitForTimeout(800);
    assert.equal(await page.locator('#start-screen').isVisible(),false);
    const alive = await page.evaluate(() => hunterTargets.filter(h=>h.alive).length);
    assert.equal(alive,8,'8 live hunters after starting Map4');
    const runtime = await page.evaluate(() => ({
      running:state.running,mode:state.activeMap,
      rivals:racers.length,projectiles:hunterRivalShots.length,
      raceTime:state.raceTime
    }));
    assert.equal(runtime.mode,'map4');
    assert.equal(runtime.running,true);
    assert.equal(runtime.rivals,5);
    assert(runtime.raceTime>0,'time advances');
    const planetary=await page.evaluate(()=>({
      zones:planetaryWorldRegions.length,
      worldVisible:planetaryWorldGroup.visible,
      corridorVisible:corridorGuideGroup.visible,
      starsVisible:starField.visible,
      width:getCorridorRadiusAt(12000),
      strategyCount:new Set(racers.map(r=>r.hunterStrategy)).size,
      zoneName:document.getElementById('planetary-zone-name').textContent
    }));
    assert.equal(planetary.zones,4,'four distinct planetary zones');
    assert.equal(planetary.worldVisible,true,'planet landscape visible');
    assert.equal(planetary.corridorVisible,false,'neon race tube hidden');
    assert.equal(planetary.starsVisible,false,'old stars hidden');
    assert(planetary.width>1000,'wider free-flight space');
    assert.equal(planetary.strategyCount,5,'five rival strategies');
    assert(planetary.zoneName.includes('VADİ'),'planet zone HUD');
    const scored=await page.evaluate(()=>{
      const normal=hunterTargets.find(h=>h.alive&&!h.isElite);
      const elite=hunterTargets.find(h=>h.alive&&h.isElite);
      normal.hp=12;elite.hp=12;
      damageHunterTarget(normal,12,'PLAYER');
      damageHunterTarget(elite,12,'PLAYER');
      return {kills:state.hunterKills,points:state.hunterScore};
    });
    assert.equal(scored.kills,2,'two real credited kills');
    assert.equal(scored.points,4,'normal 1 + elite 3 points');
    assert.equal(await page.locator('#laser-status').textContent().then(t=>t.includes('HAZIR')),true);
    await page.screenshot({path:path.resolve(__dirname,'map4-running.png')});
    // Real deadline: no discount can make an unfinished runner eligible.
    await page.evaluate(() => {state.raceTime=119.98;state.paused=false;});
    try {
      await page.waitForFunction(() => !state.running,null,{timeout:12000});
    } catch (error) {
      console.error('Deadline diagnostic', await page.evaluate(() => ({
        running:state.running,paused:state.paused,realClock:state.raceTime,
        finished:state.finished,playerDNF:state.playerDNF,map:state.activeMap,
        gameOverHidden:document.getElementById('gameover-screen').classList.contains('hidden')
      })), errors);
      throw error;
    }
    assert.equal(await page.locator('#gameover-screen').isVisible(),true,
      'deadline must show results; browser errors: '+errors.join(' | '));
    const result=await page.evaluate(() => window.starbladeHunterFinal);
    assert.equal(result.realTimeLimit,120);
    assert.equal(result.standings.length,6);
    assert(result.standings.every(e=>!e.validFinish),'no invented finish');
    assert.equal(await page.locator('#race-standings-list > div').count(),6);
    await page.screenshot({path:path.resolve(__dirname,'map4-results.png')});
    // Restart same map clears old targets, timers and stats.
    await page.locator('#restart-btn').click();
    await page.waitForTimeout(220);
    assert.equal(await page.locator('#gameover-screen').isVisible(),false);
    const restart=await page.evaluate(()=>({
      mode:state.activeMap,hunters:hunterTargets.length,
      gameTime:state.raceTime,playerKills:state.hunterKills
    }));
    assert.equal(restart.mode,'map4');
    assert.equal(restart.hunters,8);
    assert(restart.gameTime<4,'timer reset');
    assert.equal(restart.playerKills,0);
    assert.equal(await page.evaluate(()=>state.hunterScore),0,'score reset');
    // Force an end for menu navigation, verify Map1 regressions.
    await page.evaluate(() => endGame(false));
    await page.locator('#menu-btn').click();
    assert.equal(await page.locator('#start-screen').isVisible(),true);
    await page.locator('#map-choice-1').click();
    assert.equal(await page.locator('#map4-instructions').isVisible(),false);
    await page.locator('#start-btn').click();
    await page.waitForTimeout(250);
    const map1=await page.evaluate(()=>({
      map:state.activeMap,hunters:hunterTargets.length,
      racers:racers.length,combat:state.combatEnabled,
      terrainVisible:planetaryWorldGroup.visible,
      corridorVisible:corridorGuideGroup.visible,
      flightRadius:getCorridorRadiusAt(8000),
      header:document.getElementById('race-standings-head').textContent
    }));
    assert.equal(map1.map,'map1');
    assert.equal(map1.hunters,0);
    assert.equal(map1.terrainVisible,false,'planetary terrain hidden in Map1');
    assert.equal(map1.corridorVisible,true,'Map1 corridor restored');
    assert(map1.flightRadius<500,'Map1 narrow flight restored');
    assert.equal(map1.racers,5);
    assert.equal(map1.combat,false);
    assert(map1.header.includes('TIME / GAP'),'Map1 header restored');
    await page.evaluate(()=>endGame(false));
    assert.equal(await page.locator('#gameover-screen').isVisible(),true);
    assert(!((await page.locator('#gameover-title').textContent()).includes('HARİTA 4')));
    assert.equal(errors.length,0,'browser JavaScript errors: '+errors.join(' | '));
    console.log('PASS: Planet Map4 4 zones, wide flight, AI strategies, points, 120s DNF, restart and Map1 regression');
  } finally {
    if (errors.length) console.error('Browser errors:',errors.join('\n'));
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
