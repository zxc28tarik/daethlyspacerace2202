const assert=require('node:assert/strict');
const fs=require('node:fs');
for(const path of ['index.html','dist/Uzay_Yarisi_Guncel_Oynanabilir.html']){
  const s=fs.readFileSync(path,'utf8');
  const marker='const map2City02IndependentBlueprint=(()=>{';
  assert.equal(s.split(marker).length-1,1,path+' has one blueprint');
  const world=s.split('const map2BuildWorldCity=()=>{')[1]?.split('map2BuildWorldCity();')[0];
  const wide=s.split('const map2BuildWideUrbanCourse=()=>{')[1]?.split('map2BuildWideUrbanCourse();')[0];
  assert.ok(world&&wide,path+' world and frontage builders');
  assert.ok(!world.includes('h4City02DistrictGroup'),path+' world footprint must be independent');
  assert.ok(!wide.includes('h4City02DistrictGroup'),path+' wide frontage must be independent');
  assert.ok(world.includes('map2City02IndependentBlueprint.footprints'));
  assert.ok(wide.includes('map2City02IndependentBlueprint.prototypes'));
  assert.ok(s.includes('if(prototypes.length!==48)'),path+' retains original 48 building specifications');
  assert.ok(s.includes('const width=120+(index*17)%64;'));
  assert.ok(s.includes('const depth=108+(index*21)%53;'));
  assert.ok(s.includes('const height=280+(row*59+col*69)%480;'));
}
const specs=[];
for(let row=0;row<9;row++)for(let col=0;col<6;col++){
  if([2,5,8].includes(row)&&[2,3].includes(col))continue;
  const index=row*6+col;
  specs.push([index,120+(index*17)%64,280+(row*59+col*69)%480,108+(index*21)%53]);
}
assert.equal(specs.length,48);
console.log('MAP2-47 static blueprint audit PASS: 48 original City02 body/crown specifications in both builds');
