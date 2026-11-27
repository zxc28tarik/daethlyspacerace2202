'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function verify(path){
  const html=fs.readFileSync(path,'utf8');
  for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
    if(m[1].trim())new vm.Script(m[1]);
  }
  const cueStart=html.indexOf('function map2PlayerApertureCue');
  const cue=html.slice(cueStart,cueStart+5200);
  assert(cueStart>=0,'Map2 aperture cue missing');
  assert(cue.includes("ALTERNATİF ROTA · "),'multi-opening gates must be named as alternate routes');
  assert(cue.includes("ALT BORU HATTI")&&cue.includes("DIŞ SERVİS HATTI"),
    'pressure transfer branches need readable player-facing names');

  const bonusStart=html.indexOf("const bonus = document.getElementById('bonus-status');");
  const bonus=html.slice(bonusStart,bonusStart+5200);
  assert(bonusStart>=0,'bonus status block missing');
  assert(bonus.includes('if(map2Active())'),'Map2 must have a dedicated bonus-status branch');
  assert(bonus.includes('ALTERNATİF ROTA /'),'Map2 bonus row must announce route forks');
  assert(bonus.includes('KEEP IT LOW / AÇIK HAT'),'Map2 open-course status missing');
  assert(bonus.indexOf('if(map2Active())')<bonus.indexOf('⚠ ENKAZ GECIDI'),
    'legacy debris warning must stay behind the non-Map2 branch');
  assert(bonus.indexOf('if(map2Active())')<bonus.indexOf('⚠ DEBRIS ZONE'),
    'legacy debris zone must stay behind the non-Map2 branch');
}
verify('index.html');
verify('dist/Uzay_Yarisi_Guncel_Oynanabilir.html');
console.log('PASS MAP2-46 alternate-route HUD clarity and legacy-warning isolation');
