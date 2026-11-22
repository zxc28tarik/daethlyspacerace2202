/* UIUX-05 real settings tests — Chromium/WebGL and the original game.
 * Proves audio graph, save/reload, Map4 graphics sync, UI accessibility
 * and pause/restart boundaries without changing simulation constants.
 */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {chromium}=require('playwright');
const {pathToFileURL}=require('node:url');
const out=path.join(__dirname,'uiux05-evidence');fs.mkdirSync(out,{recursive:true});
const viewports=[
 {name:'desktop',width:1600,height:900},
 {name:'laptop',width:1366,height:768},
 {name:'hd',width:1280,height:720},
 {name:'mobile',width:390,height:844}
];
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
const soundSource=html.split('class OverdriveSound {')[1]?.split('const sound = new OverdriveSound()')[0];
assert(soundSource,'Missing sound class');
assert.equal((soundSource.match(/\.connect\(this\.ctx\.destination\)/g)||[]).length,1,
 'Only one final master node should connect to the sound device');
assert.match(soundSource,/this\.engineGain\.connect\(this\.masterGain\)/,
 'Engine must use shared volume bus');
assert((soundSource.match(/\.connect\(this\.masterGain\)/g)||[]).length>=6,
 'All effects must go through the master sound bus');
const url=pathToFileURL(path.join(__dirname,'../index.html')).toString();
async function prepare(page){
 const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
 await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:three}));
 await page.route('**/cdn.tailwindcss.com/**',r=>
   r.fulfill({status:200,contentType:'text/javascript',body:''}));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>typeof state==='object'&&
   typeof uiChangeSetting==='function'&&typeof uiSettings==='object',
   null,{timeout:30000});
}
async function setRange(page,id,value){
 await page.locator(id).evaluate((el,val)=>{
  el.value=String(val);
  el.dispatchEvent(new Event('input',{bubbles:true}));
 },value);
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const report=[];
 try{
  for(const vp of viewports){
   const page=await browser.newPage({viewport:{width:vp.width,height:vp.height},
    deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await prepare(page);
   // Start from a deterministic preference baseline, not a previously stored QA value.
   await page.evaluate(()=>{
    try{localStorage.removeItem(UI_SETTINGS_KEY);}catch(_err){}
    uiChangeSetting('masterVolume',100);
    uiChangeSetting('graphics','HIGH');
    uiChangeSetting('hudText','NORMAL');
    uiChangeSetting('highContrast',false);
    uiChangeSetting('reducedMotion',false);
   });
   assert.equal(await page.locator('#ui-setting-volume').inputValue(),'100');
   await page.locator('#map-choice-4').click();
   assert.equal(await page.locator('#h4-quality-select').inputValue(),'HIGH');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&
    state.raceTime>.12,null,{timeout:30000});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused&&
    !document.getElementById('flight-help-screen').classList.contains('hidden'),
    null,{timeout:12000});
   assert.equal(await page.locator('#ui-settings-panel').isVisible(),true);
   assert.equal(await page.locator('#ui-settings-panel').evaluate(e=>e.open),false);
   const pausedTime=await page.evaluate(()=>state.raceTime);
   await page.locator('#ui-settings-panel summary').click();
   assert.equal(await page.locator('#ui-settings-panel').evaluate(e=>e.open),true);
   for(const id of ['#ui-setting-volume','#ui-setting-graphics','#ui-setting-hud-text',
    '#ui-setting-contrast','#ui-setting-reduced-motion','#ui-settings-reset'])
    assert.equal(await page.locator(id).isVisible(),true,'interactive setting '+id);
   await page.screenshot({path:path.join(out,vp.name+'-01-default-pause-settings.png')});
   await setRange(page,'#ui-setting-volume',35);
   let audio=await page.evaluate(()=>({
    level:sound.masterVolume,bus:!!sound.masterGain,engine:!!sound.engineGain,
    setting:uiSettings.masterVolume,output:document.querySelector('#ui-setting-volume-output').textContent
   }));
   assert.equal(audio.level,35);
   assert.equal(audio.setting,35);
   assert.equal(audio.output,'35%');
   assert(audio.bus&&audio.engine,'master sound bus must exist');
   await page.locator('#ui-setting-graphics').selectOption('LOW');
   assert.equal(await page.locator('#h4-quality-select').inputValue(),'LOW');
   assert.equal(await page.evaluate(()=>h4Gfx10ProfileName),'LOW');
   const ratio=await page.evaluate(()=>({
    pixel:renderer.getPixelRatio(),
    expected:Math.min(window.devicePixelRatio||1,2)*H4_GFX10_PROFILES.LOW.resolutionScale
   }));
   assert(Math.abs(ratio.pixel-ratio.expected)<.001,'LOW graphics must adjust pixel resolution');
   await page.locator('#ui-setting-hud-text').selectOption('LARGE');
   assert.equal(await page.evaluate(()=>document.body.dataset.uiHudText),'LARGE');
   await page.locator('#ui-setting-contrast').check();
   await page.locator('#ui-setting-reduced-motion').check();
   assert.equal(await page.evaluate(()=>document.body.classList.contains('ui-high-contrast')),true);
   assert.equal(await page.evaluate(()=>document.body.classList.contains('ui-reduced-motion')),true);
   const status=await page.locator('#ui-settings-save-status').textContent();
   const saved=await page.evaluate(()=>{
    try{return JSON.parse(localStorage.getItem(UI_SETTINGS_KEY));}catch(_err){return null;}
   });
   // If browser disallows storage for file://, the UI must clearly report temporary mode.
   if(saved){
    assert.deepEqual(saved,{
     masterVolume:35,graphics:'LOW',hudText:'LARGE',highContrast:true,reducedMotion:true
    });
    assert.match(status,/kaydedildi/);
   }else assert.match(status,/Depolama kapalı/);
   assert.equal(await page.evaluate(()=>state.paused),true,
    'Changing options must not accidentally unpause gameplay');
   assert.equal(await page.evaluate(()=>state.raceTime),pausedTime,
    'Simulation timer must remain frozen while paused');
   await page.screenshot({path:path.join(out,vp.name+'-02-changed-pause-settings.png')});
   // Verify persistent state is restored through an actual page navigation.
   if(saved){
    await page.reload({waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForFunction(()=>typeof uiSettings==='object'&&typeof state==='object',
      null,{timeout:30000});
    const restored=await page.evaluate(()=>({
      prefs:{...uiSettings},soundLevel:sound.masterVolume,graphics:h4Gfx10ProfileName,
      hudText:document.body.dataset.uiHudText,
      contrast:document.body.classList.contains('ui-high-contrast'),
      reduced:document.body.classList.contains('ui-reduced-motion')
    }));
    assert.equal(restored.soundLevel,35);
    assert.equal(restored.graphics,'LOW');
    assert.equal(restored.hudText,'LARGE');
    assert(restored.contrast&&restored.reduced);
    assert.deepEqual(restored.prefs,saved);
   }
   // The pre-launch quality select and pause select must remain in sync.
   await page.locator('#map-choice-4').click();
   assert.equal(await page.locator('#h4-quality-select').inputValue(),saved?'LOW':'HIGH');
   await page.locator('#h4-quality-select').selectOption('BALANCED');
   assert.equal(await page.evaluate(()=>h4Gfx10ProfileName),'BALANCED');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4',null,{timeout:30000});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   assert.equal(await page.locator('#ui-setting-graphics').inputValue(),'BALANCED');
   await page.locator('#ui-settings-panel summary').click();
   // A functional reset must update audio graph, graphics, HUD, and stored values.
   await page.locator('#ui-settings-reset').click();
   const reset=await page.evaluate(()=>({
    values:{...uiSettings},level:sound.masterVolume,gfx:h4Gfx10ProfileName,
    hud:document.body.dataset.uiHudText,contrast:document.body.classList.contains('ui-high-contrast'),
    reduced:document.body.classList.contains('ui-reduced-motion'),paused:state.paused,
    menuGfx:document.getElementById('h4-quality-select').value,
    pauseGfx:document.getElementById('ui-setting-graphics').value
   }));
   assert.deepEqual(reset.values,{
    masterVolume:100,graphics:'HIGH',hudText:'NORMAL',highContrast:false,reducedMotion:false
   });
   assert.equal(reset.level,100);
   assert.equal(reset.gfx,'HIGH');
   assert.equal(reset.menuGfx,'HIGH');
   assert.equal(reset.pauseGfx,'HIGH');
   assert(reset.paused);
   await page.screenshot({path:path.join(out,vp.name+'-03-reset-pause-settings.png')});
   await page.locator('#resume-btn').click();
   await page.waitForFunction(()=>state.running&&!state.paused,null,{timeout:12000});
   await page.keyboard.press('F7');
   await page.waitForFunction(()=>h4Gfx10ProfileName==='BALANCED',null,{timeout:15000});
   assert.equal(await page.locator('#ui-setting-graphics').inputValue(),'BALANCED');
   await page.evaluate(()=>endGame(false));
   await page.locator('#menu-btn').click();
   await page.locator('#map-choice-1').click();
   assert.equal(await page.evaluate(()=>document.body.dataset.uiMode),'map1');
   // Map1 ignores the quality resolution scaler while the saved preset remains.
   assert.equal(await page.evaluate(()=>renderer.getPixelRatio()),
    await page.evaluate(()=>Math.min(devicePixelRatio||1,2)));
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1',null,{timeout:30000});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   assert.equal(await page.locator('#ui-settings-panel').isVisible(),true);
   assert.equal(await page.locator('#ui-setting-graphics').inputValue(),'BALANCED');
   assert.deepEqual(errors,[],vp.name+' JavaScript runtime errors');
   report.push({viewport:vp.name,audioBus:audio.bus,persistence:!!saved,
    qualityPixelRatio:ratio.pixel,pauseHeld:true,reset:true,f7Sync:true,map1Safe:true});
   await page.close();
  }
  console.log('PASS UIUX-05 '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});