/* UIUX-07 final framing, readability, keyboard and capture evidence.
 * Real WebGL boots both available maps. Win/stage manipulation is not used:
 * this suite covers authentic opening gameplay and genuine DNF exits.
 * Native GPU FPS, full race completion and artistic approval remain separate.
 */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('playwright'),{pathToFileURL}=require('node:url');
const out=path.join(__dirname,'uiux07-evidence');
fs.mkdirSync(out,{recursive:true});
const viewports=[
 {name:'desktop',width:1600,height:900},
 {name:'laptop',width:1366,height:768},
 {name:'hd720',width:1280,height:720},
 {name:'compact',width:760,height:720},
 {name:'mobile',width:390,height:844}
];
const url=pathToFileURL(path.resolve(__dirname,'../index.html')).toString();
function png(name,phase){return path.join(out,name+'-'+phase+'.png');}
async function bounds(page,ids,width,height){
 const r=await page.evaluate(ids=>ids.map(id=>{
  const el=document.getElementById(id);
  if(!el)return {id,missing:true};
  const d=el.getBoundingClientRect(),s=getComputedStyle(el);
  return {id,visible:s.display!=='none'&&s.visibility!=='hidden'&&
   d.width>0&&d.height>0,
   left:d.left,right:d.right,top:d.top,bottom:d.bottom,
   text:el.textContent?.trim().slice(0,70)||'',
   font:parseFloat(s.fontSize)};
 }),ids);
 for(const v of r){
  assert(!v.missing,'missing '+v.id);
  assert(v.visible,'hidden UI element: '+v.id);
  assert(v.left>=-3&&v.right<=width+3,
   'horizontal viewport clip '+JSON.stringify(v));
  assert(v.top>=-3&&v.bottom<=height+3,
   'vertical viewport clip '+JSON.stringify(v));
 }
 return r;
}
async function shellWidth(page,selector){
 return page.locator(selector).evaluate(el=>({
  overflow:el.scrollWidth-el.clientWidth,
  width:el.clientWidth,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight
 }));
}
async function launch(page,map){
 await page.locator('#map-choice-'+map).focus();
 await page.keyboard.press('Enter');
 assert.equal(await page.locator('#map-choice-'+map).getAttribute('aria-pressed'),'true');
 await page.locator('#start-btn').scrollIntoViewIfNeeded();
 await page.locator('#start-btn').focus();
 await page.keyboard.press('Enter');
 await page.waitForFunction(expected=>state.running&&
  state.activeMap===expected&&state.raceTime>.25,
  'map'+map,{timeout:30000});
}
(async()=>{
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 const result=[];
 try{
  for(const v of viewports){
   const page=await browser.newPage({viewport:{width:v.width,height:v.height},
    deviceScaleFactor:1});
   const errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
   await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:three}));
   await page.route('**/cdn.tailwindcss.com/**',r=>
    r.fulfill({status:200,contentType:'text/javascript',body:''}));
   await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>typeof state==='object'&&
    typeof selectMap==='function'&&typeof endGame==='function',
    null,{timeout:30000});
   assert.equal(await page.locator('#map-selection [data-ui-map]').count(),6);
   assert.equal(await page.locator('#map-choice-1').isEnabled(),true);
   assert.equal(await page.locator('#map-choice-4').isEnabled(),true);
   for(const n of [2,3,5,6]){
    assert(await page.locator('#map-choice-'+n).isDisabled());
    assert.equal(await page.locator('#map-choice-'+n)
     .getAttribute('aria-disabled'),'true');
   }
   const menu=await shellWidth(page,'#start-screen > .ui-screen-shell');
   assert(menu.overflow<=2,'menu overflow '+JSON.stringify({v,menu}));
   const legibility=await page.evaluate(()=>{
    const props=sel=>{
     const e=document.querySelector(sel),c=getComputedStyle(e);
     return {font:parseFloat(c.fontSize),opacity:parseFloat(c.opacity),color:c.color};
    };
    return {
     index:props('#map-selection .ui-six-map-grid .ui-map-index'),
     description:props('#map-selection .ui-six-map-grid .ui-map-description'),
     status:props('#map-selection .ui-six-map-grid .ui-map-status'),
     locked:props('#map-selection .ui-six-map-grid .ui-map-locked')
    };
   });
   assert(legibility.index.font>=10&&legibility.description.font>=10&&
    legibility.status.font>=10,'map cards illegible '+JSON.stringify(legibility));
   assert(legibility.locked.opacity>=.8,'locked cards too dim');
   await page.screenshot({path:png(v.name,'01-picker-six-maps-top')});

   // Menu keyboard selection and native <details> disclosure.
   await page.locator('#map-choice-4').focus();
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#map-choice-4').getAttribute('aria-pressed'),'true');
   const summary=page.locator('#map4-instructions summary');
   await summary.scrollIntoViewIfNeeded();
   await summary.focus();
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#map4-instructions').evaluate(e=>e.open),true,
    'native guide must open via keyboard');
   await summary.focus();await page.keyboard.press('Enter');
   assert.equal(await page.locator('#map4-instructions').evaluate(e=>e.open),false);
   await page.locator('#start-btn').scrollIntoViewIfNeeded();
   await bounds(page,['start-btn'],v.width,v.height);
   await page.screenshot({path:png(v.name,'02-map4-briefing-launch')});
   await page.locator('#start-btn').focus();
   await page.keyboard.press('Enter');
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4'&&
    state.raceTime>.3,null,{timeout:30000});
   assert(await page.locator('#game-canvas').isVisible());
   await bounds(page,['planetary-zone-hud','ui-flight-metrics-panel',
    'hunter-competition-hud','ui-resources-panel'],v.width,v.height);
   assert(await page.locator('#ui-map4-goal-value').isVisible());
   await page.screenshot({path:png(v.name,'03-map4-live-valley')});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   assert(await page.locator('#flight-help-screen').isVisible());
   const settingsSummary=page.locator('#ui-settings-panel summary');
   await settingsSummary.scrollIntoViewIfNeeded();
   await settingsSummary.focus();
   const focus=await settingsSummary.evaluate(e=>{
    const s=getComputedStyle(e);
    return {style:s.outlineStyle,width:s.outlineWidth};
   });
   assert.equal(focus.style,'solid','keyboard focus must be visible');
   assert(parseFloat(focus.width)>=2,'keyboard focus must be strong');
   await page.keyboard.press('Enter');
   assert.equal(await page.locator('#ui-settings-panel').evaluate(e=>e.open),true);
   await page.locator('#ui-setting-hud-text').selectOption('LARGE');
   await page.locator('#ui-setting-contrast').check();
   await page.locator('#ui-setting-reduced-motion').check();
   assert.equal(await page.evaluate(()=>document.body.classList.contains('ui-high-contrast')),true);
   assert.equal(await page.evaluate(()=>document.body.dataset.uiHudText),'LARGE');
   await page.screenshot({path:png(v.name,'04-pause-accessibility-high-contrast')});
   // Reset is a real interactive action, then keyboard resume.
   await page.locator('#ui-settings-reset').click();
   assert.equal(await page.evaluate(()=>document.body.dataset.uiHudText),'NORMAL');
   assert.equal(await page.evaluate(()=>document.body.classList.contains('ui-high-contrast')),false);
   await page.locator('#resume-btn').scrollIntoViewIfNeeded();
   await page.locator('#resume-btn').focus();
   await page.keyboard.press('Enter');
   await page.waitForFunction(()=>state.running&&!state.paused,null,{timeout:12000});
   await page.evaluate(()=>endGame(false));
   assert(await page.locator('#gameover-screen').isVisible());
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-status'),'dnf');
   assert.equal(await page.locator('#ui-result-metric-4-value').textContent(),'DNF');
   let summaryWidth=await shellWidth(page,'#gameover-screen .ui-results-shell');
   assert(summaryWidth.overflow<=2,'Map4 result overflow '+JSON.stringify(summaryWidth));
   await page.screenshot({path:png(v.name,'05-map4-real-dnf')});
   await page.locator('#restart-btn').scrollIntoViewIfNeeded();
   await bounds(page,['restart-btn','menu-btn'],v.width,v.height);
   await page.locator('#restart-btn').focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>state.running&&state.activeMap==='map4',
    null,{timeout:30000});
   await page.evaluate(()=>endGame(false));
   await page.locator('#menu-btn').focus();await page.keyboard.press('Enter');
   assert(await page.locator('#start-screen').isVisible());

   // A fresh Map1 launch proves Map4 controls did not bleed into race HUD.
   await launch(page,1);
   assert.equal(await page.evaluate(()=>document.body.dataset.uiMode),'map1');
   assert(await page.locator('#rank-text').isVisible());
   await bounds(page,['ui-flight-metrics-panel','ui-resources-panel'],v.width,v.height);
   await page.screenshot({path:png(v.name,'06-map1-live-race')});
   await page.keyboard.press('p');
   await page.waitForFunction(()=>state.paused,null,{timeout:12000});
   assert(await page.locator('#ui-map1-pause-note').isVisible());
   await page.screenshot({path:png(v.name,'07-map1-real-pause')});
   await page.locator('#resume-btn').click();
   await page.waitForFunction(()=>state.running&&!state.paused,null,{timeout:12000});
   await page.evaluate(()=>endGame(false));
   assert.equal(await page.locator('#gameover-screen').getAttribute('data-ui-result-map'),'map1');
   assert.equal(await page.locator('#ui-result-metric-2-value').textContent(),'—',
    'DNF cannot invent a finish time');
   const resultFont=await page.locator('.ui-result-metric span').first()
    .evaluate(e=>parseFloat(getComputedStyle(e).fontSize));
   assert(resultFont>=11,'result metric labels must be readable');
   summaryWidth=await shellWidth(page,'#gameover-screen .ui-results-shell');
   assert(summaryWidth.overflow<=2,'Map1 result overflow '+JSON.stringify(summaryWidth));
   await page.screenshot({path:png(v.name,'08-map1-real-dnf')});
   await page.locator('#menu-btn').focus();await page.keyboard.press('Enter');
   assert(await page.locator('#start-screen').isVisible());
   assert.deepEqual(errors,[],'runtime errors in '+v.name);
   result.push({viewport:v.name,width:v.width,height:v.height,
    menuHorizontalOverflow:menu.overflow,resultHorizontalOverflow:summaryWidth.overflow,
    screenshotCount:8,map1:'real launch+pause+DNF',map4:'real launch+pause+DNF+retry',
    keyboard:'menu+guide+settings+result',legibility,errors});
   await page.close();
  }
  fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(result,null,2));
  console.log('PASS UIUX07 '+JSON.stringify(result));
 }finally{await browser.close();}
})().catch(err=>{console.error(err.stack||err);process.exitCode=1;});
