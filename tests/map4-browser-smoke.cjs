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
      header:document.getElementById('race-standings-head').textContent
    }));
    assert.equal(map1.map,'map1');
    assert.equal(map1.hunters,0);
    assert.equal(map1.racers,5);
    assert.equal(map1.combat,false);
    assert(map1.header.includes('TIME / GAP'),'Map1 header restored');
    await page.evaluate(()=>endGame(false));
    assert.equal(await page.locator('#gameover-screen').isVisible(),true);
    assert(!((await page.locator('#gameover-title').textContent()).includes('HARİTA 4')));
    assert.equal(errors.length,0,'browser JavaScript errors: '+errors.join(' | '));
    console.log('PASS: Map4 launch, 8 hunters, 5 AI, race clock, 120s DNF, six results, restart, return to Map1, no runtime errors');
  } finally {
    if (errors.length) console.error('Browser errors:',errors.join('\n'));
    await browser.close();
  }
})().catch(error=>{console.error(error);process.exitCode=1});
