'use strict';
// MAP2-49: recover and validate Map2's baked source archive from either playable HTML.
// Never reconstruct the Map4 world; this is a reproducible, lossless archive extraction.
const fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const crypto=require('node:crypto'),assert=require('node:assert/strict');
const files=['index.html','dist/Uzay_Yarisi_Guncel_Oynanabilir.html'];
function template(html,id){
  const pattern=new RegExp('<template\\s+id="'+id+'"\\s*>([\\s\\S]*?)<\\/template>');
  const match=html.match(pattern);
  assert(match,'Missing embedded Map2 source: '+id);
  return match[1].trim();
}
function unpack(file){
  const html=fs.readFileSync(file,'utf8');
  const manifest=JSON.parse(template(html,'map2-48-source-manifest'));
  const gzip=Buffer.from(template(html,'map2-48-gzip-archive'),'base64');
  const data=zlib.gunzipSync(gzip);
  const obj=JSON.parse(data.toString('utf8'));
  assert.equal(manifest.libraryRootCount,44);
  assert.equal(manifest.originalMeshCount,2269);
  assert.equal(manifest.restoredMeshCount,2269);
  assert.equal(manifest.stationCount,6);
  assert.equal(manifest.map2GateCount,59);
  assert(manifest.map2PhysicalCount>=500);
  assert.equal(manifest.compressedBytes,gzip.byteLength);
  assert.equal(manifest.uncompressedBytes,data.byteLength);
  assert.equal(manifest.sourceManifest.length,manifest.libraryRootCount);
  assert(Array.isArray(obj.object?.children)&&obj.object.children.length===44);
  assert.equal(new Set(manifest.sourceManifest.map(x=>x.id)).size,44);
  return {manifest,gzip,bytes:data,sha256:crypto.createHash('sha256').update(gzip).digest('hex')};
}
const primary=unpack(files[0]),download=unpack(files[1]);
assert.equal(primary.sha256,download.sha256,
  'The playable HTML and source HTML must embed identical archives');
assert.deepEqual(primary.manifest,download.manifest,
  'The two HTMLs must share an identical Map2 source manifest');
const dir=path.join(__dirname,'map2-48-evidence');fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'source-library.json.gz'),primary.gzip);
fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(primary.manifest,null,2));
const audit={
 mode:'MAP2_OWNED_REHYDRATION',compressedBytes:primary.gzip.length,
 uncompressedBytes:primary.bytes.length,sha256:primary.sha256,
 sources:primary.manifest.libraryRootCount,
 meshes:primary.manifest.originalMeshCount,
 gateCount:primary.manifest.map2GateCount,
 filesVerified:files
};
fs.writeFileSync(path.join(dir,'rehydration-audit.json'),JSON.stringify(audit,null,2));
console.log('PASS MAP2-49 reproducible independent asset rehydration '+JSON.stringify(audit));
