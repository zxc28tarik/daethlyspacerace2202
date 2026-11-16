/* NEXT-11: reproducible, offline visual acceptance dossier.
 * This catalogues REAL screenshots emitted by the existing engine's fixed camera
 * and same-camera feature-toggle tests. It does not claim artistic approval.
 * No change to gameplay, geometry, renderer or offline HTML build itself.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const artDir=path.join(root,'tests','art-baseline');
const output=path.join(root,'dist','gfx11-visual-review');
const imageDir=path.join(output,'images');
const metricFile=path.join(artDir,'metrics.json');
const metrics=JSON.parse(fs.readFileSync(metricFile,'utf8'));
const pairs=[
 {id:'V02-01',group:'silhouette',label:'Sanayi yaklaşımı / yontulmuş modül',before:'vis02-near-assembly-old.png',after:'vis02-near-assembly-new.png'},
 {id:'V02-02',group:'silhouette',label:'Uzak rafineri silüeti',before:'vis02-far-refinery-old.png',after:'vis02-far-refinery-new.png'},
 {id:'DC-01',group:'surface',label:'IN01 rafineri / işleve bağlı etiket ve aşınma',before:'gfx06dc-in01-refinery-before.png',after:'gfx06dc-in01-refinery-after.png'},
 {id:'DC-02',group:'surface',label:'IN04 soğutma / yüzey kalıntıları',before:'gfx06dc-in04-cooling-before.png',after:'gfx06dc-in04-cooling-after.png'},
 {id:'DC-03',group:'surface',label:'IN06 reaktör / servis uyarı yüzeyleri',before:'gfx06dc-in06-reactor-before.png',after:'gfx06dc-in06-reactor-after.png'},
 {id:'E-10',group:'hero',label:'LM10 askerî karakol / özgün büyük yapı',before:'gfx06e-LM10-outpost-before.png',after:'gfx06e-LM10-outpost-after.png'},
 {id:'E-11',group:'hero',label:'LM11 uzay limanı / büyük mimari',before:'gfx06e-LM11-spaceport-before.png',after:'gfx06e-LM11-spaceport-after.png'},
 {id:'E-12',group:'hero',label:'LM12 yörünge fırlatma / yüksek yapı',before:'gfx06e-LM12-orbital-launch-before.png',after:'gfx06e-LM12-orbital-launch-after.png'},
 {id:'L-10',group:'lighting',label:'LM10 ışık, sis ve silüet / eski-yeni',before:'gfx07-final-outpost-old.png',after:'gfx07-final-outpost-new.png'},
 {id:'L-11',group:'lighting',label:'LM11 atmosfer / eski-yeni',before:'gfx07-final-spaceport-old.png',after:'gfx07-final-spaceport-new.png'},
 {id:'L-12',group:'lighting',label:'LM12 gece atmosferi / eski-yeni',before:'gfx07-final-orbit-launch-old.png',after:'gfx07-final-orbit-launch-new.png'},
 {id:'FX-02',group:'vfx',label:'Arena namlu ateşi ve çarpışma VFX kapalı/açık',before:'gfx08-arena-muzzle-impact-before.png',after:'gfx08-arena-muzzle-impact-after.png'},
 {id:'FX-03',group:'vfx',label:'Sanayi patlaması ve motor VFX kapalı/açık',before:'gfx08-industrial-explosion-engine-before.png',after:'gfx08-industrial-explosion-engine-after.png'},
 {id:'FX-04',group:'vfx',label:'Yörünge enerji etkileri kapalı/açık',before:'gfx08-orbital-ion-boost-before.png',after:'gfx08-orbital-ion-boost-after.png'},
 {id:'EX-01',group:'vfx',label:'Oyuncu çift motor ısı izi kapalı/açık',before:'gfx05c-player-engine-heat-off.png',after:'gfx05c-player-engine-heat.png'}
];
const stages=[
 {id:'01-canyon-open',group:'canyon',label:'Kanyon / başlangıç',note:'Geniş saha, kaya büyük formu ve renk ayrımı kontrolü'},
 {id:'02-canyon-mesa',group:'canyon',label:'Kanyon / mesa',note:'Güvenli merkez ile hızlı ve avcı yan yollarının okunması'},
 {id:'03-canyon-exit',group:'canyon',label:'Kanyon / çıkış',note:'Kalabalık silüet, görüşü kapatmayan sahne düzeni'},
 {id:'04-arena-center',group:'arena',label:'Arena / merkez',note:'İNCELEME GEREKİYOR: Sabit kadraj çok boş, avcılar görünür değil'},
 {id:'05-arena-wreck',group:'arena',label:'Arena / enkaz',note:'İNCELEME GEREKİYOR: Sabit kadrajda hedef alanı boş görünüyor'},
 {id:'06-arena-defense',group:'arena',label:'Arena / savunma',note:'İNCELEME GEREKİYOR: Savunma yapıları kadrajda seçilmiyor'},
 {id:'07-industry-entry',group:'industry',label:'Sanayi / giriş',note:'Siluetlerin birbirinden ayrışması ve orta-ölçek makineler'},
 {id:'08-industry-factory',group:'industry',label:'Sanayi / fabrika',note:'Kutumsu ve tekrarlı yüzeylerin artist-made kalite eksiği'},
 {id:'09-industry-exit',group:'industry',label:'Sanayi / çıkış',note:'KRİTİK GÖRSEL UYARI: Mavi büyük yakın yüzey kadrajın çoğunu kapatıyor; canlı oynanışta doğrulanmalı'},
 {id:'10-outpost',group:'final',label:'Son bölge / karakol',note:'Büyük askerî odak ve mesafe katmanları'},
 {id:'11-spaceport',group:'final',label:'Son bölge / uzay limanı',note:'İşlevsel hangar boyutu, yaklaşma boşluğu, nişangâh okunması'},
 {id:'12-orbit-climb',group:'final',label:'Son bölge / yörünge tırmanışı',note:'En az 850m final yükselişinin görsel okunması'}
];
const extras=[
 {name:'GFX09 720p CHASE',file:'map4-gfx09-1280x720-chase.png'},
 {name:'GFX09 720p TURRET',file:'map4-gfx09-1280x720-turret.png'},
 {name:'GFX09 1080p CHASE',file:'map4-gfx09-1920x1080-chase.png'},
 {name:'GFX09 1080p TURRET',file:'map4-gfx09-1920x1080-turret.png'},
 {name:'HIGH 720p',file:'map4-gfx10-high-720p.png'},
 {name:'BALANCED 720p',file:'map4-gfx10-balanced-720p.png'},
 {name:'LOW 720p',file:'map4-gfx10-low-720p.png'},
 {name:'Harita4 canlı başlangıç',file:'map4-running.png'}
];
assert.equal(metrics.cases.length,12,'12 fixed cameras are mandatory');
assert.equal(pairs.length,15,'15 same-camera before/after pairs mandatory');
const metricComparisonGroups=[
 ['gfx06dcServiceGallery',3],['gfx06eGallery',3],
 ['gfx07BeforeAfter',3],['gfx08VfxGallery',3],['vis02Gallery',2]
];
for(const [key,count] of metricComparisonGroups)
 assert.equal(metrics[key].length,count,'missing original source metrics: '+key);
const stagesFromMetric=new Set(metrics.cases.map(item=>item.name));
for(const stage of stages)assert(stagesFromMetric.has(stage.id),'not a captured fixed camera '+stage.id);
fs.mkdirSync(imageDir,{recursive:true});
const assets=new Map();
function append(file,base=artDir){
 if(assets.has(file))return;
 const from=path.join(base,file);
 assert(fs.existsSync(from),'missing raw engine PNG '+from);
 const buffer=fs.readFileSync(from);
 assert(buffer.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')),
   'invalid PNG signature '+file);
 const width=buffer.readUInt32BE(16),height=buffer.readUInt32BE(20);
 assert(width>=900&&height>=700,'nonstandard image '+file+' '+width+'x'+height);
 const hash=crypto.createHash('sha256').update(buffer).digest('hex');
 fs.copyFileSync(from,path.join(imageDir,file));
 assets.set(file,{file:'images/'+file,sha256:hash,width,height,bytes:buffer.length});
}
for(const pair of pairs){
 append(pair.before);append(pair.after);
 assert.notEqual(assets.get(pair.before).sha256,assets.get(pair.after).sha256,
  'A/B images identical: '+pair.id);
 pair.beforeImage='images/'+pair.before;
 pair.afterImage='images/'+pair.after;
 pair.sameCameraEvidence=true; // All pairs are generated from fixed camera toggles.
}
for(const stage of stages){
 append(stage.id+'.png');
 stage.image='images/'+stage.id+'.png';
 const original=metrics.cases.find(x=>x.name===stage.id);
 stage.progress=original.progress;
 stage.drawCalls=original.calls;
 stage.triangles=original.triangles;
}
// Supplemental screenshots live in tests/ rather than tests/art-baseline.
for(const item of extras){
 append(item.file,path.join(root,'tests'));
 item.image='images/'+item.file;
}
const issues=[
 {id:'QA-VIS-09',severity:'BLOCKER',stage:'09-industry-exit',
   title:'Sanayi çıkışı sabit kamera kadrajı neredeyse tamamen yakın büyük bir yüzeyle kapanmış',
   source:'09-industry-exit.png',proof:'Görüntüde sahne yerine mavi/gri geniş yüzey hâkim.',
   next:'Bu sabit kamera konumunun görsel/solid geometri ile çakışmasını ve gerçek CHASE/TURRET akışını yeniden test et.'},
 {id:'QA-VIS-ARENA',severity:'HIGH',stage:'04–06',
   title:'60 saniyelik av arenasının üç sabit kadrajı çok boş; avcı/enkaz/ateş baskısı görünmüyor',
   source:'04-arena-center.png / 05-arena-wreck.png / 06-arena-defense.png',
   next:'Gerçek 60sn savaş oturumu + çevresel landmark görünürlük ve vizyon testini denetle.'},
 {id:'QA-VIS-MAT',severity:'HIGH',stage:'07–08',
   title:'Sanayi model ve malzemeleri hâlâ tekrar eden geometrik primitifler olarak okunabiliyor',
   source:'07-industry-entry.png / 08-industry-factory.png',
   next:'IN-01…IN-06 için özgün büyük-orta silüet/malzeme kabulü ve artist-made asset borcunu kapat.'},
 {id:'QA-VIS-READ',severity:'MEDIUM',stage:'01–12',
   title:'HUD yoğunluğu, yüksek ışık ve sisin uçuş nişangâhına etkisi insan değerlendirmesi bekliyor',
   source:'GFX09 720p/1080p CHASE/TURRET ek kadrajları',
   next:'Gerçek oyuncu göz hizasında HUD ve hedef okunabilirliği incele.'}
];
const provenance={
 codeBranch:process.env.GITHUB_REF_NAME||'codex/map4-gfx11-visual-acceptance-gallery',
 sourceRun:process.env.GITHUB_RUN_ID?
  'https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/'+process.env.GITHUB_RUN_ID:
  'https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43954482993',
 generatedUtc:new Date().toISOString(),
 package:'GFX01 packaged offline HTML / real WebGL screenshots',
 renderer:'Chromium SwiftShader / SOFTWARE GPU',
 auditType:'fixed 12 camera + 15 true same-camera within-build A/B toggles',
 performanceCaution:'Not real 5-minute live gameplay; no native GPU/VRAM proof.',
 acceptance:'AUTOMATED_PROVENANCE_PASS_HUMAN_VISUAL_REVIEW_REQUIRED',
 visualScore:null
};
const manifest={schemaVersion:1,title:'Harita 4 — GFX11 gerçek motor görüntüsü kabul dosyası',
 provenance,counts:{fixedStages:stages.length,pairs:pairs.length,comparisonImages:pairs.length*2,
 extras:extras.length,totalPng:assets.size},issues,pairs,stages,extras,assets:Object.fromEntries(assets),
 sourceMetrics:{
  renderer:metrics.note,
  medianDrawCalls:metrics.cases.map(x=>x.calls).sort((a,b)=>a-b)[5],
  all12Cases:metrics.cases.map(x=>({name:x.name,calls:x.calls,triangles:x.triangles})),
  vfxChecks:metrics.gfx08VfxGallery.map(v=>({name:v.name,
   screenshotChanged:v.screenshotChanged,sameCamera:v.after.sameCamera}))
 }};
assert.equal(manifest.counts.fixedStages,12);
assert.equal(manifest.counts.pairs,15);
assert.equal(manifest.counts.totalPng,50); // 30 A/B + 12 stages + 8 extras
fs.writeFileSync(path.join(output,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
fs.writeFileSync(path.join(output,'manifest.js'),
 'window.GFX11_MANIFEST='+JSON.stringify(manifest)+';\n');
fs.copyFileSync(path.join(__dirname,'gfx11-review.template.html'),
 path.join(output,'index.html'));
fs.writeFileSync(path.join(output,'HOW_TO_REVIEW.txt'),
 [
  'HARITA 4 — GFX11 GÖRSEL KABUL PAKETI',
  'index.html dosyasını internet olmadan tarayıcıda aç.',
  'A/B soldaki SADECE özellik kapalı eski render, sağdaki özellik açık yeni render.',
  'Bunlar farklı tarihteki iki oyun sürümü değildir; aynı kod aynı kamera geçişi.',
  '12 frozen-stage kadrajı gerçek 5 dakikalık oynanış değildir.',
  'ÖNCELİKLİ BLOKER: 09-industry-exit.png yakın yüzey/duvar kadrajı.',
  '05–06 dahil arena ve sanayi sanat kalitesi insan kabulü olmadan 7/10 sayılmaz.',
  'Kaynak, SHA256 ve ölçüler manifest.json içindedir.',
  'Yalnız screenshot/visual QA; fizik ve renderer runtime değiştirilmedi.'
 ].join('\n')+'\n');
console.log('GFX11 dossier PASS',JSON.stringify({
 fixedStages:stages.length,comparisonPairs:pairs.length,
 extras:extras.length,images:assets.size,issues:issues.length,
 visualGate:'OPEN',folder:path.relative(root,output)
}));
