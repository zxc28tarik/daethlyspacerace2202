/* UIUX-08: approved map-selection and pause panel layouts.
 * Uses real WebGL Map1/Map4 launches and real settings; no synthetic gameplay states.
 */
'use strict';
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url');
const output=path.join(__dirname,'uiux08-evidence');fs.mkdirSync(output,{recursive:true});
const sizes=[
 {name:'desktop',width:1600,height:900},
 {name:'laptop',width:1366,height:768},
 {name:'hd',width:1280,height:720},
 {name:'mobile',width:390,height:844}
];
const url=pathToFileURL(path.join(__dirname,'../index.html')).toString();
async function prepare(page){
 const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
 await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({
  status:200,contentType:'text/javascript',body:three}));
 await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({
  status:200,contentType:'text/javascript',body:''}));
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>typeof state==='object'&&typeof selectMap==='function'&&
  typeof startGame==='function',null,{timeout:30000});
}
async function shot(page,name,id){await page.screenshot({
 path:path.join(output,name+'-'+id+'.png'),fullPage:false});}
async function noOverflow(page,selector,label){
 const d=await page.locator(selector).evaluate(e=>({
  scrollWidth:e.scrollWidth,clientWidth:e.clientWidth,
  visible:getComputedStyle(e).display!=='none'}));
 assert(d.visible,label+' is invisible');
 assert(d.scrollWidth-d.clientWidth<=3,label+' horizontal overflow '+JSON.stringify(d));
 return d;
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const report=[];
 try {
  for(const v of sizes){
   const page=await browser.newPage({viewport:{width:v.width,height:v.height},deviceScaleFactor:1});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await prepare(page);
   const btns=page.locator('#map-selection [data-ui-map]');
   assert.equal(await btns.count(),6);
   for(const n of [2,3,5,6]) assert(await page.locator('#map-choice-'+n).isDisabled());
   assert.equal(await page.locator('#map-choice-1').isEnabled(),true);
   assert.equal(await page.locator('#map-choice-4').isEnabled(),true);
   assert.equal(await page.locator('#ui-side-map1').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#ui-side-map4').getAttribute('aria-pressed'),'false');
   assert.equal(await page.locator('#map-selection .ui-map-scene').count(),6);
   assert.equal(await page.locator('#map-selection .ui-map-scene svg').count(),2);
   const menu=await noOverflow(page,'#start-screen .ui-start-shell','map selection');
   const grid=await noOverflow(page,'#map-selection .ui-six-map-grid','six cards');
   assert(await page.locator('#start-btn').isEnabled());
   await shot(page,v.name,'01-map1-cards');
   await page.locator('#ui-side-map4').focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'true');
   assert.equal(await page.locator('#ui-side-map4').getAttribute('aria-pressed'),'true');
   assert(await page.locator('#h4-quality-picker').isVisible());
   await shot(page,v.name,'02-map4-cards');
   await page.locator('#ui-side-guide').click();
   assert.equal(await page.locator('#map4-instructions').evaluate(e=>e.open),true);
   await page.locator('#ui-side-guide').click();
   assert.equal(await page.locator('#map4-instructions').evaluate(e=>e.open),false);
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&state.raceTime>.2,
    null,{timeout:30000});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   assert(await page.locator('#flight-help-screen').isVisible());
   assert(await page.locator('#resume-btn').isVisible());
   assert(await page.locator('#ui-pause-restart').isVisible());
   assert(await page.locator('#ui-pause-return').isVisible());
   assert(await page.locator('#ui-settings-panel').isVisible());
   assert.equal(await page.locator('#ui-settings-panel').evaluate(e=>e.open),true);
   assert(await page.locator('#ui-setting-volume').isVisible());
   const pause=await noOverflow(page,'#flight-help-screen .ui-pause-shell','pause screen');
   const positions=await page.evaluate(()=>{
    const a=document.querySelector('.ui-pause-left').getBoundingClientRect();
    const b=document.querySelector('.ui-pause-right').getBoundingClientRect();
    return {left:a.toJSON(),right:b.toJSON()};
   });
   if(v.width>860){
    assert(positions.right.left>=positions.left.right-1,
     'desktop pause must have two columns '+JSON.stringify(positions));
   }else{
    assert(positions.right.top>=positions.left.top,
     'mobile pause must stack settings '+JSON.stringify(positions));
   }
   await shot(page,v.name,'03-split-pause');
   await page.locator('[data-target="ui-setting-graphics"]').click();
   assert.equal(await page.locator('[data-target="ui-setting-graphics"]')
      .getAttribute('aria-pressed'),'true');
   assert.equal(await page.evaluate(()=>state.paused),true);
   await page.locator('#ui-setting-graphics').selectOption('BALANCED');
   assert.equal(await page.evaluate(()=>h4Gfx10ProfileName),'BALANCED');
   await page.locator('#ui-setting-volume').evaluate(el=>{
    el.value='45';el.dispatchEvent(new Event('input',{bubbles:true}));
   });
   assert.equal(await page.evaluate(()=>sound.masterVolume),45);
   await page.locator('[data-target="ui-setting-hud-text"]').click();
   await page.locator('#ui-setting-hud-text').selectOption('LARGE');
   assert.equal(await page.evaluate(()=>document.body.dataset.uiHudText),'LARGE');
   await shot(page,v.name,'04-adjusted-settings');
   await page.locator('[data-target="ui-pause-controls-guide"]').click();
   assert.equal(await page.locator('#ui-pause-controls-guide').evaluate(e=>e.open),true);
   await page.locator('#ui-pause-open-settings').click();
   assert(await page.locator('#ui-settings-panel').isVisible());
   // Restart is an actual game reset and may not fabricate a result.
   await page.locator('#ui-pause-restart').click();
   await page.waitForFunction(()=>state.running&&!state.paused&&state.activeMap==='map4'&&
    state.raceTime<2,null,{timeout:30000});
   assert(await page.locator('#flight-help-screen').isHidden());
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   await page.locator('#ui-pause-return').click();
   assert(await page.locator('#start-screen').isVisible());
   assert.equal(await page.evaluate(()=>state.running),false);
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'true');
   await page.locator('#ui-side-map1').click();
   assert.equal(await page.locator('#map-choice-1').getAttribute('aria-pressed'),'true');
   await page.locator('#start-btn').click();
   await page.waitForFunction(()=>state.running&&state.activeMap==='map1'&&state.raceTime>.2,
    null,{timeout:30000});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   assert(await page.locator('#ui-map1-pause-note').isVisible());
   await shot(page,v.name,'05-map1-pause');
   await page.locator('#resume-btn').click();
   await page.waitForFunction(()=>state.running&&!state.paused,null,{timeout:12000});
   assert(await page.locator('#flight-help-screen').isHidden());
   assert.deepEqual(errors,[],v.name+' JS errors');
   report.push({viewport:v.name,menuOverflow:menu.scrollWidth-menu.clientWidth,
    gridOverflow:grid.scrollWidth-grid.clientWidth,
    pauseOverflow:pause.scrollWidth-pause.clientWidth,
    sideBySide:v.width>860,gameplay:['map4','map1'],
    settings:['volume','graphics','hudText'],screenshots:5,errors});
   await page.close();
  }
  fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  console.log('PASS UIUX08 '+JSON.stringify(report));
 }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
