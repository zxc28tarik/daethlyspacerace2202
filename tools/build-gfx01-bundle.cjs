/* GFX-01: offline one-file distribution builder for the current index.html.
 * Requires three@0.128.0 and tailwindcss@3.4.17 during build, NOT at runtime.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),outdir=path.join(root,'dist');
fs.mkdirSync(outdir,{recursive:true});
const get=p=>fs.readFileSync(path.join(root,p),'utf8');
const {makePack}=require('./gfx01-assets.cjs');
const source=get('index.html'),threeJs=get('node_modules/three/build/three.min.js');
const gltfLoader=get('node_modules/three/examples/js/loaders/GLTFLoader.js');
const cssFile=path.join(outdir,'gfx01-tailwind.css');
execFileSync(path.join(root,'node_modules','.bin','tailwindcss'),
 ['-i',path.join(root,'tools','gfx01-tailwind.css'),
  '-o',cssFile,'--content',path.join(root,'index.html'),'--minify'],
 {cwd:root,stdio:'pipe',timeout:90000});
const css=fs.readFileSync(cssFile,'utf8'),pack=makePack();
const packed=Object.fromEntries(Object.entries(pack).map(([id,v])=>[id,v.base64]));
const metadata=Object.fromEntries(Object.entries(pack).map(
 ([id,{base64,...meta}])=>[id,meta]));
const runtime=[
 '(function(global){',
 '  "use strict";',
 '  const raw='+JSON.stringify(packed)+';',
 '  const catalog='+JSON.stringify(metadata)+';',
 '  const cache=new Map(),counts={requested:0,decoded:0,ready:0,failed:0,errors:[]};',
 '  function load(id){',
 '    if(!Object.prototype.hasOwnProperty.call(raw,id))',
 '      return Promise.reject(new Error("Unknown model: "+id));',
 '    counts.requested++;',
 '    if(!cache.has(id)){',
 '      counts.decoded++;',
 '      const promise=new Promise((resolve,reject)=>{',
 '        try {',
 '          const bytes=Uint8Array.from(atob(raw[id]),x=>x.charCodeAt(0));',
 '          const loader=new THREE.GLTFLoader();',
 '          loader.parse(bytes.buffer,"",gltf=>{',
 '            if(!gltf.scene||!gltf.scene.children.length){',
 '              reject(new Error("Empty glTF scene: "+id));return;',
 '            }',
 '            counts.ready++;resolve(gltf.scene);',
 '          },reject);',
 '        }catch(e){reject(e);}',
 '      }).catch(e=>{',
 '        counts.failed++;counts.errors.push(String(e.message||e));throw e;',
 '      });',
 '      cache.set(id,promise);',
 '    }',
 '    return cache.get(id).then(scene=>scene.clone(true));',
 '  }',
 '  global.Map4ArtAssets={',
 '    load,catalog,status:()=>({...counts,cacheEntries:cache.size}),',
 '    has:id=>Object.prototype.hasOwnProperty.call(raw,id)',
 '  };',
 '})(window);'
].join('\n');
function exactly(haystack,needle,replacement){
 const n=haystack.split(needle).length-1;
 if(n!==1)throw Error('Expected one HTML anchor; saw '+n+': '+needle.slice(0,80));
 return haystack.replace(needle,replacement);
}
let built=source;
built=exactly(built,'<script src="https://cdn.tailwindcss.com"></script>',
 '<style id="gfx01-selfcontained-tailwind">\n'+css+'\n</style>');
built=exactly(built,
 '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>',
 '<script id="gfx01-three-r128">\n'+threeJs+'\n</script>\n'+
 '<script id="gfx01-gltfloader-r128">\n'+gltfLoader+'\n</script>\n'+
 '<script id="gfx01-embedded-asset-catalog">\n'+runtime+'\n</script>');
built=built.replace(
 /<link href="https:\/\/fonts.googleapis.com\/css2\?family=Orbitron[^"]+" rel="stylesheet">/,
 '<!-- Offline bundle uses local system font fallbacks, no remote font requests. -->');
if(built===source || /<(?:script|link)[^>]+https?:\/\//i.test(built))
 throw Error('Unresolved external executable/style resource in offline bundle');
const basename='Uzay_Yarisi_Guncel_Oynanabilir.html',output=path.join(outdir,basename);
fs.writeFileSync(output,built,'utf8');
const manifest={
 schemaVersion:1,gameSource:'index.html',buildFile:basename,
 buildSha256:crypto.createHash('sha256').update(built).digest('hex'),
 bundleBytes:Buffer.byteLength(built),assets:metadata,
 toolchain:{three:'0.128.0',tailwind:'3.4.17'},
 offline:{embeddedThree:true,embeddedGLTFLoader:true,
  embeddedAssets:true,embeddedTailwind:true,remoteFonts:false},
 caveat:'Sample assets are original procedural GLB test fixtures, not final artist-made assets.'
};
fs.writeFileSync(path.join(outdir,'gfx01-build-manifest.json'),
 JSON.stringify(manifest,null,2)+'\n');
console.log('GFX01 OFFLINE BUILD',JSON.stringify({
 bytes:manifest.bundleBytes,sha256:manifest.buildSha256,
 assets:Object.keys(pack),tailwindBytes:css.length
}));
module.exports={runtime};
