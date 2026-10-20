/* GFX-01: deterministic glTF2/GLB maker and source-asset validator.
 * Three small authored placeholder recipes prove the full pipeline; users can
 * drop genuinely sculpted GLB files into catalog replacementPath later.
 * The renderer/game does NOT depend on this file at runtime.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const sculpt=require('./gfx01b-sculpt-kit.cjs');
const atlas=require('./gfx01b-surface-atlas.cjs');
const root=path.resolve(__dirname,'..');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/gfx01/catalog.json'),'utf8'));
const v=(x,y,z)=>[x,y,z], sub=(a,b)=>a.map((q,i)=>q-b[i]);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function builder(model,lod=0) {
 const groups=model.materials.map(()=>({pos:[],nor:[],uv:[]}));
 function tri(mat,a,b,c){
  const n=cross(sub(b,a),sub(c,a));
  const d=Math.hypot(...n)||1, unit=n.map(x=>x/d);
  for(const p of [a,b,c]){groups[mat].pos.push(...p);groups[mat].nor.push(...unit);
   groups[mat].uv.push(p[0]*1.6+p[2]*.22,p[1]*1.6+p[2]*.41);}
 }
 function quad(mat,a,b,c,d){tri(mat,a,b,c);tri(mat,a,c,d);}
 function solid(mat,x,y,z,w,h,d,lean=0){
  const [xl,xr,yb,yt,zf,zb]=[x-w/2,x+w/2,y-h/2,y+h/2,z-d/2,z+d/2];
  const A=v(xl,yb,zf),B=v(xr,yb,zf),C=v(xr,yt,zb),D=v(xl,yt,zb);
  const E=v(xl,yb,zb),F=v(xr,yb,zb),G=v(xr,yt,zf),H=v(xl,yt,zf);
  C[0]+=lean;D[0]+=lean;G[0]+=lean;H[0]+=lean;
  quad(mat,A,B,G,H);quad(mat,F,E,D,C);
  quad(mat,E,A,H,D);quad(mat,B,F,C,G);
  quad(mat,H,G,C,D);quad(mat,E,F,B,A);
 }
 function panel(mat,points,thickness=.06){
  const n=points.length;
  if(n<3)throw Error('panel requires vertices');
  const upper=points.map(p=>[p[0],p[1]+thickness/2,p[2]]);
  const lower=points.map(p=>[p[0],p[1]-thickness/2,p[2]]);
  for(let k=1;k<n-1;k++){tri(mat,upper[0],upper[k],upper[k+1]);tri(mat,lower[0],lower[k+1],lower[k]);}
  for(let k=0;k<n;k++)quad(mat,upper[k],lower[k],lower[(k+1)%n],upper[(k+1)%n]);
 }
 function addArch(){
  // Six asymmetrically stepped stones form a genuine navigable opening.
  solid(0,-.39,-.13,0,.23,.73,.48,.03);
  solid(0,.39,-.13,0,.23,.73,.48,-.025);
  solid(0,-.29,.27,0,.35,.23,.50,-.06);
  solid(0,.29,.26,0,.35,.22,.49,.05);
  solid(0,0,.37,0,.37,.20,.55);
  solid(1,-.53,-.29,-.17,.20,.41,.23,-.07);
  solid(1,.54,-.31,.15,.18,.36,.27,.065);
  for(let i=0;i<5;i++){
   const x=(i-2)*.14;
   solid(i%3===0?1:0,x,.51+Math.sin(i*1.62)*.024,
     (i%2?-.15:.17),.19,.055,.21,.03*Math.sin(i));
  }
 }
 function addRadar(){
  solid(0,0,-.32,0,.33,.34,.28);
  solid(0,0,-.15,0,.12,.30,.12);
  solid(1,0,.015,.01,.55,.045,.50);
  // Segmented concave dish with actual surface triangles (not a painted ellipse).
  const slices=18,rings=5;
  const ringsXYZ=[];
  for(let k=0;k<=rings;k++){
   const r=.48*k/rings, rr=[];
   for(let j=0;j<=slices;j++){
    const a=j/slices*Math.PI*2;
    rr.push(v(r*Math.cos(a),.095+.20*(r/.48)**2,r*Math.sin(a)*.76));
   }
   ringsXYZ.push(rr);
  }
  for(let k=0;k<rings;k++)for(let j=0;j<slices;j++){
   const A=ringsXYZ[k][j],B=ringsXYZ[k][j+1],
     C=ringsXYZ[k+1][j+1],D=ringsXYZ[k+1][j];
   quad(k===rings-1?1:0,A,B,C,D);
  }
  solid(2,0,.18,0,.13,.10,.13);
  for(let side of [-1,1]){
   solid(0,side*.31,-.18,0,.055,.36,.055,side*-.03);
   solid(1,side*.40,.09,0,.065,.09,.08);
  }
 }
 function addFighter(){
  // Belly, tapered prow, dorsal canopy, twin angled wings, and nozzles.
  panel(0,[v(-.20,-.14,.47),v(-.32,-.10,-.25),v(-.17,-.08,-.53),
    v(.17,-.08,-.53),v(.32,-.10,-.25),v(.20,-.14,.47)],.21);
  panel(0,[v(-.29,-.065,.05),v(-.63,-.09,-.36),
    v(-.57,-.105,-.46),v(-.14,-.09,-.24)],.075);
  panel(0,[v(.29,-.065,.05),v(.63,-.09,-.36),
    v(.57,-.105,-.46),v(.14,-.09,-.24)],.075);
  solid(1,0,.035,-.04,.25,.18,.31);
  for(const side of [-1,1]){
   solid(2,side*.19,-.13,-.43,.15,.13,.18);
   solid(0,side*.50,-.015,-.39,.065,.21,.14,side*-.025);
  }
  solid(0,0,-.10,.40,.14,.065,.20);
 }
 sculpt.build({model,lod,tri,quad,solid,panel});
 return groups;
}
function glbFromGeometry(model,lod=0){
 const groups=builder(model,lod),pieces=[],bufferViews=[],accessors=[],primitives=[];
 let pointer=0;
 function append(bytes,target){
  const pad=(4-pointer%4)%4;
  if(pad){pieces.push(Buffer.alloc(pad));pointer+=pad;}
  const offset=pointer;
  pieces.push(bytes);pointer+=bytes.length;
  const ix=bufferViews.length;
  bufferViews.push({buffer:0,byteOffset:offset,byteLength:bytes.length,target});
  return ix;
 }
 function accessor(flat,type,componentType,target,withMinMax=false){
  const bytes=(type==='VEC3'||type==='VEC2')?Buffer.from(new Float32Array(flat).buffer):
    Buffer.from(new Uint16Array(flat).buffer);
  const view=append(bytes,target),idx=accessors.length,acc={
   bufferView:view,byteOffset:0,componentType,count:flat.length/(type==='VEC3'?3:type==='VEC2'?2:1),type
  };
  if(withMinMax){
   acc.min=[Infinity,Infinity,Infinity];acc.max=[-Infinity,-Infinity,-Infinity];
   for(let i=0;i<flat.length;i+=3)for(let j=0;j<3;j++){
    acc.min[j]=Math.min(acc.min[j],flat[i+j]);
    acc.max[j]=Math.max(acc.max[j],flat[i+j]);
   }
  }
  accessors.push(acc);return idx;
 }
 groups.forEach((group,i)=>{
  if(!group.pos.length)return;
  const pos=accessor(group.pos,'VEC3',5126,34962,true);
  const nor=accessor(group.nor,'VEC3',5126,34962);
  const uv=accessor(group.uv,'VEC2',5126,34962);
  const vertexCount=group.pos.length/3;
  if(vertexCount>65535)throw Error('Asset exceeds u16 index budget: '+model.id);
  const indices=accessor(Array.from({length:vertexCount},(_,j)=>j),'SCALAR',5123,34963);
  primitives.push({attributes:{POSITION:pos,NORMAL:nor,TEXCOORD_0:uv},indices,material:i,mode:4});
 });
 const textureType=model.category==='rock'?'rock':
  model.category==='wreck'?'wreck':model.category==='defense'?'defense':'metal';
 const texturePNG=atlas.create(textureType,
   (model.category==='wreck'||model.category==='defense')?512:256);
 const textureView=append(texturePNG);
 const binary=Buffer.concat(pieces);
 const materials=model.materials.map(m=>({
  name:m.id,pbrMetallicRoughness:{
   baseColorFactor:m.color,baseColorTexture:{index:0},
   metallicFactor:m.metallic,roughnessFactor:m.roughness
  },doubleSided:true,
  ...(m.id==='warning_lights'?{emissiveFactor:[.62,.09,.065]}:{})
 }));
 const json={asset:{version:'2.0',generator:'Map4 GFX01 deterministic placeholder authoring'},
  scene:0,scenes:[{nodes:[0]}],nodes:[{mesh:0,name:model.id}],
  meshes:[{name:model.id+'_LOD'+lod,primitives}],
  materials,
  samplers:[{magFilter:9729,minFilter:9987,wrapS:10497,wrapT:10497}],
  textures:[{sampler:0,source:0}],
  images:[{bufferView:textureView,mimeType:'image/png',name:'sculpted_'+model.category+'_atlas'}],
  buffers:[{byteLength:binary.length}],bufferViews,accessors};
 const jsonBytes=Buffer.from(JSON.stringify(json)),jpad=(4-jsonBytes.length%4)%4;
 const bpad=(4-binary.length%4)%4;
 const jsonChunk=Buffer.concat([jsonBytes,Buffer.alloc(jpad,0x20)]);
 const binChunk=Buffer.concat([binary,Buffer.alloc(bpad,0)]);
 const length=12+8+jsonChunk.length+8+binChunk.length;
 const glb=Buffer.alloc(12);glb.writeUInt32LE(0x46546c67,0);
 glb.writeUInt32LE(2,4);glb.writeUInt32LE(length,8);
 const jheader=Buffer.alloc(8);jheader.writeUInt32LE(jsonChunk.length,0);jheader.writeUInt32LE(0x4e4f534a,4);
 const bheader=Buffer.alloc(8);bheader.writeUInt32LE(binChunk.length,0);bheader.writeUInt32LE(0x004e4942,4);
 return Buffer.concat([glb,jheader,jsonChunk,bheader,binChunk]);
}
function validateGLB(buf,id){
 if(buf.length<28||buf.readUInt32LE(0)!==0x46546c67 ||
  buf.readUInt32LE(4)!==2||buf.readUInt32LE(8)!==buf.length)
  throw Error('Invalid GLB header for '+id);
 const jslen=buf.readUInt32LE(12);
 if(buf.readUInt32LE(16)!==0x4e4f534a||jslen>buf.length-28)
  throw Error('GLB must start with valid JSON chunk: '+id);
 const json=JSON.parse(buf.toString('utf8',20,20+jslen));
 if(json.asset?.version!=='2.0'||!json.scenes?.length || !json.meshes?.length)
  throw Error('Not valid glTF2 scene: '+id);
 if((json.buffers?.[0]?.byteLength||0)>3_000_000)
  throw Error('Untrusted oversized GLB buffer: '+id);
 if(!json.images?.length||!json.textures?.length)
  throw Error('GFX01B GLB needs embedded atlas: '+id);
 const uvSets=json.meshes.reduce((n,m)=>n+m.primitives.filter(p=>
  p.attributes?.TEXCOORD_0!==undefined).length,0);
 if(!uvSets)throw Error('Missing textured UV accessor: '+id);
 return {triangles:json.meshes.reduce((t,m)=>t+m.primitives.reduce((q,p)=>
   q+(json.accessors[p.indices].count/3),0),0),
   nodes:json.nodes.length,images:json.images.length,uvSets};
}
function makePack(){
 const out={};
 for(const model of catalog.models){
  for(const lod of [0,1,2]){
   const id=model.id+(lod?'_lod'+lod:'');
   const candidate=path.join(root,
     lod?model.replacementPath.replace(/\.glb$/,'_lod'+lod+'.glb'):model.replacementPath);
   const source=fs.existsSync(candidate)?'artist-glb':'generated-sculpted-placeholder';
   const buf=source==='artist-glb'?fs.readFileSync(candidate):glbFromGeometry(model,lod);
   const detail=validateGLB(buf,id);
   out[id]={
    mime:'model/gltf-binary',kind:model.category,lod,baseId:model.id,
    base64:buf.toString('base64'),source,bytes:buf.length,
    sha256:crypto.createHash('sha256').update(buf).digest('hex'),
    ...detail
   };
  }
 }
 return out;
}

if(require.main===module){
 const dir=path.join(root,'dist','gfx01');
 fs.mkdirSync(dir,{recursive:true});
 const pack=makePack();
 for(const [id,data] of Object.entries(pack)){
  fs.writeFileSync(path.join(dir,id+'.glb'),Buffer.from(data.base64,'base64'));
 }
 fs.writeFileSync(path.join(dir,'asset-manifest.json'),
   JSON.stringify(Object.fromEntries(Object.entries(pack).map(([id,{base64,...meta}])=>[id,meta])),null,2)+'\n');
 console.log('GFX01 GLB pack',Object.fromEntries(Object.entries(pack).map(([k,v])=>[k,{bytes:v.bytes,triangles:v.triangles,source:v.source}])));
}
module.exports={makePack,validateGLB,glbFromGeometry};
