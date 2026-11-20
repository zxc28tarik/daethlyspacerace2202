/* NEXT11C21B: SB-07 geometry-first render quality. Real Chromium WebGL
 * live ship mesh, roof-conformal stripe clearance and Map4 protection.
 * Not a native physical GPU FPS benchmark. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {pathToFileURL}=require('node:url'),{chromium}=require('playwright');
const out=path.join(__dirname,'next11c21b-evidence');fs.mkdirSync(out,{recursive:true});
(async()=>{
 const errors=[];
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
  '--enable-webgl-software-rendering','--disable-dev-shm-usage'
 ]});
 try{
  const page=await browser.newPage({viewport:{width:1600,height:900},
   deviceScaleFactor:1});
  page.on('pageerror',e=>errors.push(e.stack||e.message));
  page.on('console',m=>{
   if(m.type()==='error'&&/shader|glsl|webglprogram/i.test(m.text()))
    errors.push(m.text());
  });
  const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
  await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:three}));
  await page.route('**/cdn.tailwindcss.com/**',
   r=>r.fulfill({status:200,contentType:'text/javascript',body:''}));
  await page.goto(pathToFileURL(path.resolve(__dirname,'../index.html')).toString(),
   {waitUntil:'domcontentloaded',timeout:30000});
  await page.waitForFunction(()=>typeof h4Ship20ZenitBuild==='function' &&
   !!h4Ship19Race&&!!h4Ship19Combat&&typeof startGame==='function',
   null,{timeout:25000});
  const geom=await page.evaluate(()=>{
   const ship=h4Ship19Race,combat=h4Ship19Combat;
   const hull=ship.children.find(o=>o.name==='NEXT11C20_SB07_HULL');
   const red=ship.children.find(o=>o.name==='NEXT11C20_SB07_RED');
   const px=mesh=>mesh.geometry.getAttribute('position');
   const count=mesh=>px(mesh).count;
   const ray=new THREE.Raycaster();
   const proxy=mesh=>{const m=new THREE.Mesh(mesh.geometry,mesh.material);
    m.updateMatrixWorld(true);return m;};
   const H=proxy(hull),R=proxy(red);
   const topAt=(mesh,x,z)=>{
    ray.set(new THREE.Vector3(x,3,z),new THREE.Vector3(0,-1,0));
    return ray.intersectObject(mesh,false).map(h=>h.point.y)
     .filter(y=>y>.45&&y<1.1).sort((a,b)=>b-a)[0]??null;
   };
   const samples=[];
   for(const side of [-1,1]){
    for(const z of [.72,1.18,1.52,1.89,2.10]){
     for(const offset of [-.04,0,.04]){
      const x=side*(1.77+offset);
      const redY=topAt(R,x,z),hullY=topAt(H,x,z);
      samples.push({side,z,offset,redY,hullY,
       clearance:redY!==null&&hullY!==null?redY-hullY:null});
     }
    }
   }
   // Examine real HULL vertices of the newly sculpted wing junction.
   // The old source had ONE thin detached root seam per side, not a
   // continuous surface. 5*6*2 expected roof stations are checked
   // directly against the merged, displayed vertex buffer.
   const rootStations=[
    [-2.93,1.02,1.96],[-2.53,1.075,2.11],
    [-2.05,1.13,2.29],[-1.55,1.185,2.43],
    [-.98,1.23,2.46]
   ];
   const rootFractions=[0,.16,.37,.62,.83,1];
   const hullRows=[
    [-9.0,.045,.055],[-7.85,.28,.19],[-6.4,.55,.26],
    [-4.4,.92,.38],[-2.0,1.25,.59],[.3,1.44,.58],
    [2.5,1.39,.54],[4.8,1.07,.38],[6.15,.38,.23]
   ];
   const hullRoof=(z,x)=>{
    let j=0;
    while(j<hullRows.length-2&&z>hullRows[j+1][0])j++;
    const lo=hullRows[j],hi=hullRows[j+1],
      t=(z-lo[0])/(hi[0]-lo[0]),
      width=lo[1]+(hi[1]-lo[1])*t,
      height=lo[2]+(hi[2]-lo[2])*t;
    const u=Math.min(1,Math.abs(x)/width),step=2*Math.PI/14;
    const seg=Math.min(6,Math.floor(Math.acos(u)/step));
    const a=seg*step,b=(seg+1)*step;
    const mix=(Math.cos(a)-u)/(Math.cos(a)-Math.cos(b));
    return height*(Math.sin(a)*(1-mix)+Math.sin(b)*mix);
   };
   const allHull=px(hull),bridgeChecks=[];
   for(const side of [-1,1]){
    for(const [z,inner,outer] of rootStations){
     for(const t of rootFractions){
      const x=side*(inner+(outer-inner)*t);
      const innerHeight=hullRoof(z,inner)+.018,
        y=-.105+(innerHeight+.105)*Math.pow(1-t,1.65)+
          .018*Math.sin(Math.PI*t);
      let closest=Infinity;
      for(let i=0;i<allHull.count;i++){
       const dx=allHull.getX(i)-x,dy=allHull.getY(i)-y,
        dz=allHull.getZ(i)-z;
       const length=Math.sqrt(dx*dx+dy*dy+dz*dz);
       if(length<closest)closest=length;
      }
      bridgeChecks.push({side,z,t,x,y,closestVertexError:closest});
     }
    }
   }
   const rootRise=side=>{
    const bridge=bridgeChecks.filter(x=>x.side===side&&x.z===-2.05);
    return bridge[0].y-bridge[bridge.length-1].y;
   };
   const redAttr=px(red);
   const spineVerts=[];
   for(let i=0;i<redAttr.count;i++){
    const x=redAttr.getX(i),z=redAttr.getZ(i);
    if((Math.abs(x-1.77)<.08||Math.abs(x+1.77)<.08)&&z>-.25&&z<2.4)
     spineVerts.push({x,z,y:redAttr.getY(i)});
   }
   // Validate genuine displayed 3D geometry, not userData claims.
   // 17 stations × 3 cross-edge points × 2 wings, same original
   // four exterior RED outline corners and the old .016 layer relief.
   const redPaintChecks=[],flapChecks=[];
   const dark=ship.children.find(o=>o.name==='NEXT11C20_SB07_DARK'),
         darkAttr=px(dark);
   const nearest=(attribute,x,y,z)=>{
     let min=Infinity;
     for(let i=0;i<attribute.count;i++){
       const dx=attribute.getX(i)-x,
         dy=attribute.getY(i)-y,
         dz=attribute.getZ(i)-z;
       const distance=Math.hypot(dx,dy,dz);
       if(distance<min)min=distance;
     }
     return min;
   };
   for(const side of [-1,1]){
     for(let j=0;j<17;j++){
       const t=j/16;
       const ax=2.16+(6.57-2.16)*t,
         az=-2.96+(-.67+2.96)*t,
         bx=2.31+(6.73-2.31)*t,
         bz=-3.13+(-.84+3.13)*t;
       for(let k=0;k<3;k++){
         const v=k/2,x=side*(ax+v*(bx-ax)),
           z=az+v*(bz-az),y=-.096;
         redPaintChecks.push({side,t,v,error:nearest(redAttr,x,y,z)});
       }
     }
     for(let j=0;j<13;j++){
       const t=j/12,
         x=side*(3.34+t*(5.95-3.34)),
         z=2.43+t*(1.70-2.43)-.012*Math.sin(Math.PI*t),
         halfWidth=.010+.014*Math.sin(Math.PI*t);
       for(const edge of [-1,1]){
         flapChecks.push({side,t,edge,
           error:nearest(darkAttr,x,-.087,z+edge*halfWidth)});
       }
     }
   }
   // NEXT11C21B: inspect DISPLAYED merged SECOND/RED GPU mesh
   // at 70 front shoulder top, 54 red paint and 50 aft bridge
   // sample coordinates. All are replacements for existing pieces.
   const second=ship.children.find(o=>o.name==='NEXT11C20_SB07_SECOND'),
     secondAttr=px(second);
   const frontStations=[
    [-1.48,4.48,.30,-.103],[-1.10,4.53,.58,-.079],
    [-.52,4.63,.76,-.057],[.10,4.74,.64,-.076],
    [.52,4.84,.28,-.103]
   ];
   const frontU=[-1,-.76,-.42,0,.42,.76,1];
   const stripeZ=[-.84,-.75,-.65,-.56,-.47,-.38,-.29,-.21,-.14];
   const stripeU=[.62,.75,.88];
   const aftStations=[
    [2.32,1.49,.115,-.072],
    [2.78,1.55,.210,-.051],
    [3.62,1.66,.247,-.043],
    [4.53,1.78,.191,-.055],
    [5.19,1.85,.105,-.085]
   ];
   const frontInterp=z=>{
    let i=0;
    while(i<frontStations.length-2&&z>frontStations[i+1][0])i++;
    const a=frontStations[i],b=frontStations[i+1],
      t=Math.max(0,Math.min(1,(z-a[0])/(b[0]-a[0])));
    return [1,2,3].map(k=>a[k]+(b[k]-a[k])*t);
   };
   const frontTop=(z,u)=>{
    const [, ,peak]=frontInterp(z),foot=-.106;
    return foot+(peak-foot)*Math.pow(1-Math.abs(u),1.55);
   };
   const fronts=[],shoulderPaint=[],aft=[];
   for(const side of [-1,1]){
    for(const [z,center,width] of frontStations)
     for(const u of frontU){
      const x=side*(center+width*u),y=frontTop(z,u);
      fronts.push({side,x,z,u,y,
       error:nearest(secondAttr,x,y,z)});
     }
    for(const z of stripeZ){
     const [center,width]=frontInterp(z);
     for(const u of stripeU){
      const x=side*(center+width*u),y=frontTop(z,u)+.012;
      shoulderPaint.push({side,z,u,y,
       error:nearest(redAttr,x,y,z)});
     }
    }
    for(const [x,z,width,roof] of aftStations){
     for(let i=0;i<5;i++){
      const depth=i/2-1,
        y=-.108+(roof+.108)*(1-Math.abs(depth)**1.6);
      aft.push({side,x:side*x,z:z+depth*width,depth,y,
       error:nearest(secondAttr,side*x,y,z+depth*width)});
     }
    }
   }
   // Native WebGL raycast of real rendered material, not assertion
   // only of coordinate arrays. Probe red-film/metal separation.
   const actualShoulderClearance=[];
   const secondaryProxy=proxy(second);
   for(const side of [-1,1]){
    for(const z of [-.75,-.47,-.21]){
     const [center,width]=frontInterp(z),x=side*(center+width*.75);
     ray.set(new THREE.Vector3(x,.8,z),new THREE.Vector3(0,-1,0));
     const redHits=ray.intersectObject(R,false)
       .filter(h=>h.point.y>-.15&&h.point.y<.15);
     const secondHits=ray.intersectObject(secondaryProxy,false)
       .filter(h=>h.point.y>-.15&&h.point.y<.15);
     actualShoulderClearance.push({side,z,
       redY:redHits[0]?.point.y??null,
       secondY:secondHits[0]?.point.y??null,
       separation:(redHits[0]&&secondHits[0])?
         +(redHits[0].point.y-secondHits[0].point.y).toFixed(5):null});
    }
   }
   // All examined red film points lie on exactly one wing skin plane.
   // Existing 8 real red/HULL, flap/HULL and root-lip tests in the
   // original SB-07 integration suite still check 0.008-0.05 relief.
   const mergedPaintTopY=[];
   for(const side of [-1,1]){
     const t=.30,ax=2.16+4.41*t,az=-2.96+2.29*t,
       bx=2.31+4.42*t,bz=-3.13+2.29*t,
       x=side*(ax+bx)/2,z=(az+bz)/2;
     const bottom=new THREE.Mesh(
       hull.geometry,hull.material);
     bottom.updateMatrixWorld(true);
     ray.set(new THREE.Vector3(x,2,z),new THREE.Vector3(0,-1,0));
     const hits=ray.intersectObject(bottom,false)
       .filter(h=>h.point.y<.1&&h.point.y>-.18);
     mergedPaintTopY.push({side,hullY:hits[0]?.point.y??null,
       paintY:-.096});
   }
   // NEXT11C21B: compare displayed, NONINDEXED GPU vertex normals
   // at real upper-roof coordinates with the tangent cross-product of
   // the authored 3D loft stations. Cap and wall normals must not bleed
   // into the visible upper surface, especially near root/end edges.
   const upperNorm=(samples,rows,cols,row,col)=>{
    const at=(r,c)=>{
     const v=samples[r*cols+c];
     return new THREE.Vector3(v.x,v.y,v.z);
    };
    const dr=at(Math.min(rows-1,row+1),col)
     .sub(at(Math.max(0,row-1),col));
    const dc=at(row,Math.min(cols-1,col+1))
     .sub(at(row,Math.max(0,col-1)));
    const expected=new THREE.Vector3().crossVectors(dr,dc);
    if(expected.y<0)expected.negate();
    return expected.normalize();
   };
   const actualUpperNormal=(mesh,p,expected)=>{
    const positions=px(mesh),normals=mesh.geometry.getAttribute('normal');
    let found=0,closest=Infinity,best=-1;
    for(let i=0;i<positions.count;i++){
     const dx=positions.getX(i)-p.x,
       dy=positions.getY(i)-p.y,dz=positions.getZ(i)-p.z,
       err=Math.hypot(dx,dy,dz);
     if(err<.0001){
      found++;
      const v=new THREE.Vector3(normals.getX(i),
        normals.getY(i),normals.getZ(i));
      const dot=v.dot(expected);
      if(err<closest){closest=err;best=dot;}
      if(dot>best)best=dot;
     }
    }
    return {found,positionError:closest,dot:best};
   };
   const normalsQA=[],normalRanges=[
    {label:'wing-root',mesh:hull,values:bridgeChecks,rows:5,cols:6},
    {label:'front-shoulder',mesh:second,values:fronts,rows:5,cols:7},
    {label:'aft-engine-wing',mesh:second,values:aft,rows:5,cols:5}
   ];
   for(const region of normalRanges){
    const slice=region.rows*region.cols;
    for(let sideIndex=0;sideIndex<2;sideIndex++){
     const values=region.values.slice(sideIndex*slice,(sideIndex+1)*slice);
     for(let row=0;row<region.rows;row++){
      for(let col=0;col<region.cols;col++){
       const p=values[row*region.cols+col];
       const expected=upperNorm(values,region.rows,region.cols,row,col);
       const observed=actualUpperNormal(region.mesh,p,expected);
       normalsQA.push({region:region.label,side:p.side,
        row,col,expectedUp:expected.y,
        found:observed.found,dot:observed.dot,
        normalPositionError:observed.positionError});
      }
     }
    }
   }
   // Aft engine-wing panel previously had reversed top winding
   // (row +X, column +Z => downward cross). Check true rendered
   // face orientation as well as interpolated normals.
   const aftWinding=[];
   const secondProxy=proxy(second);
   for(const side of [-1,1]){
    const x=side*3.62,z=1.66;
    ray.set(new THREE.Vector3(x,1.5,z),new THREE.Vector3(0,-1,0));
    const upperFaces=ray.intersectObject(secondProxy,false)
      .filter(hit=>Math.abs(hit.point.y-(-.043))<.012 &&
        hit.face&&Math.abs(hit.face.normal.y)>.25);
    aftWinding.push({side,faces:upperFaces.length,
      faceNormalUp:upperFaces[0]?.face.normal.y??null});
   }
   // NEXT11C21B: 54 true nose-hull roof vertex normals
   // (nine original 14-gon stations x six top perimeter samples)
   // plus 84 actual twin-engine curved roof normals
   // (two x six stations x seven upper cross-section samples).
   const noseStations=[
    [-9,.045,.055],[-7.85,.28,.19],[-6.4,.55,.26],
    [-4.4,.92,.38],[-2,1.25,.59],[.3,1.44,.58],
    [2.5,1.39,.54],[4.8,1.07,.38],[6.15,.38,.23]
   ];
   const engineStations=[
    [.34,.19,.54,.73],[.72,.26,.535,.825],
    [1.18,.285,.53,.865],[1.89,.285,.53,.86],
    [2.62,.245,.54,.795],[3.48,.16,.55,.66]
   ];
   const engineCross=[
    [-1,0],[-1,.27],[-.85,.62],[-.50,.92],
    [-.21,.99],[0,1],[.21,.99],[.50,.92],
    [.85,.62],[1,.27],[1,0]
   ];
   const sourceAt=(kind,row,col,side=1)=>{
    if(kind==='nose'){
     const [z,xWidth,yWidth]=noseStations[row];
     const phi=col*2*Math.PI/14;
     return new THREE.Vector3(xWidth*Math.cos(phi),
       yWidth*Math.sin(phi),z);
    }
    const [z,width,bottom,roof]=engineStations[row];
    const [u,v]=engineCross[col];
    return new THREE.Vector3(
       side*1.77+side*u*width,bottom+(roof-bottom)*v,z);
   };
   const sourceNormal=(kind,row,col,side=1)=>{
    const rows=kind==='nose'?noseStations.length:engineStations.length;
    const forward=sourceAt(kind,Math.min(rows-1,row+1),col,side);
    const rear=sourceAt(kind,Math.max(0,row-1),col,side);
    const right=sourceAt(kind,row,col+1,side);
    const left=sourceAt(kind,row,col-1,side);
    const tangent=forward.sub(rear);
    const cross=right.sub(left);
    const normal=new THREE.Vector3().crossVectors(tangent,cross);
    if(normal.y<0)normal.negate();
    return normal.normalize();
   };
   const noseAndEngineNormals=[];
   const testRoof=(kind,rows,columns,sides)=>{
     for(const side of sides)
      for(let row=0;row<rows;row++)
       for(const col of columns){
        const pos=sourceAt(kind,row,col,side);
        const expectation=sourceNormal(kind,row,col,side);
        const measured=actualUpperNormal(hull,pos,expectation);
        noseAndEngineNormals.push({
         kind,side,row,col,expectedUp:expectation.y,
         normalDot:measured.dot,found:measured.found,
         normalPositionError:measured.positionError
        });
       }
   };
   testRoof('nose',9,[1,2,3,4,5,6],[1]);
   testRoof('engine',6,[2,3,4,5,6,7,8],[-1,1]);
   // Verify actual displayed TRIANGLES, not merely userData flags.
   // The long 14-gon nose was originally inside-out. After the
   // correction, front/right side normal points +X and the opposite
   // side normal points -X. Both engine spine top skins face UP.
   const sourceTriangle=(a,b,c)=>{
     const positions=px(hull),matches=[];
     const desired=[a,b,c];
     for(let i=0;i<positions.count;i+=3){
      const tri=[0,1,2].map(k=>new THREE.Vector3(
       positions.getX(i+k),positions.getY(i+k),
       positions.getZ(i+k)));
      const assigned=new Set();
      for(const want of desired){
       const idx=tri.findIndex((v,k)=>!assigned.has(k)&&
         v.distanceTo(want)<.0001);
       if(idx>=0)assigned.add(idx);
      }
      if(assigned.size===3){
       const face=new THREE.Vector3().crossVectors(
        tri[1].clone().sub(tri[0]),
        tri[2].clone().sub(tri[0])).normalize();
       matches.push(face);
      }
     }
     return matches;
   };
   const windingChecks=[];
   for(const ring of [0,7]){
    const a=sourceAt('nose',2,ring),
     b=sourceAt('nose',2,ring+1),
     c=sourceAt('nose',3,ring);
    const outward=ring===0?new THREE.Vector3(1,0,0):
      new THREE.Vector3(-1,0,0);
    const matches=sourceTriangle(a,b,c);
    windingChecks.push({
      kind:'nose',side:ring===0?1:-1,
      matches:matches.length,
      maxOutward:Math.max(-1,...matches.map(v=>v.dot(outward)))
    });
   }
   for(const side of [-1,1]){
    const a=sourceAt('engine',2,5,side),
     b=sourceAt('engine',2,6,side),
     c=sourceAt('engine',3,5,side);
    const matches=sourceTriangle(a,b,c);
    windingChecks.push({
      kind:'engine',side,matches:matches.length,
      maxOutward:Math.max(-1,...matches.map(v=>v.y))
    });
   }
   // C21A: actual renderer materials and texture data (not a
   // description-only or additional cosmetic mesh). Prove that the
   // two original material batches now have purpose-built finish
   // maps, retain original user-approved base tints, and keep the RED
   // paint, GLASS canopy and engine colors untouched.
   const secondMaterial=second.material,
     hullMaterial=hull.material,
     redMaterial=red.material,
     glassMaterial=ship.children.find(
       o=>o.name==='NEXT11C20_SB07_GLASS').material;
   const textureStats=texture=>{
     const img=texture.image,
       w=img.width,h=img.height;
     const ctx=img.getContext('2d'),
       pixels=ctx.getImageData(0,0,w,h).data;
     let total=0,sumSq=0,min=255,max=0,firstRow=0,lastRow=0;
     for(let i=0;i<pixels.length;i+=4){
       const lum=pixels[i];
       total+=lum;sumSq+=lum*lum;
       min=Math.min(min,lum);max=Math.max(max,lum);
     }
     for(let x=0;x<w;x++){
       firstRow+=pixels[4*x];
       lastRow+=pixels[4*((h-1)*w+x)];
     }
     const n=w*h,mean=total/n;
     return {width:w,height:h,mean,standardDeviation:
       Math.sqrt(sumSq/n-mean*mean),min,max,
       firstRowMean:firstRow/w,lastRowMean:lastRow/w,
       anisotropy:texture.anisotropy,
       minFilter:texture.minFilter,
       magFilter:texture.magFilter,
       wrapS:texture.wrapS,wrapT:texture.wrapT};
   };
   const materialAudit={
    ceramic:{
      type:hullMaterial.type,isPhysical:hullMaterial.isMeshPhysicalMaterial,
      color:hullMaterial.color.getHex(),
      metalness:hullMaterial.metalness,
      roughness:hullMaterial.roughness,
      clearcoat:hullMaterial.clearcoat,
      clearcoatRoughness:hullMaterial.clearcoatRoughness,
      bumpScale:hullMaterial.bumpScale,
      emissiveIntensity:hullMaterial.emissiveIntensity,
      texture:textureStats(hullMaterial.roughnessMap),
      ownBump:hullMaterial.bumpMap===hullMaterial.roughnessMap
    },
    gunmetal:{
      type:secondMaterial.type,
      isPhysical:secondMaterial.isMeshPhysicalMaterial,
      color:secondMaterial.color.getHex(),
      metalness:secondMaterial.metalness,
      roughness:secondMaterial.roughness,
      clearcoat:secondMaterial.clearcoat,
      clearcoatRoughness:secondMaterial.clearcoatRoughness,
      bumpScale:secondMaterial.bumpScale,
      emissiveIntensity:secondMaterial.emissiveIntensity,
      texture:textureStats(secondMaterial.roughnessMap),
      ownBump:secondMaterial.bumpMap===secondMaterial.roughnessMap
    },
    contrast:{
      separateTextures:
        hullMaterial.roughnessMap!==secondMaterial.roughnessMap,
      separateOriginalRed:
        redMaterial.roughnessMap!==hullMaterial.roughnessMap&&
        redMaterial.roughnessMap!==secondMaterial.roughnessMap,
      originalRedColor:redMaterial.color.getHex(),
      originalRedType:redMaterial.type,
      originalRedRoughness:redMaterial.roughness,
      originalRedMetalness:redMaterial.metalness,
      originalCanopyType:glassMaterial.type,
      originalCanopyColor:glassMaterial.color.getHex(),
      originalCanopyClearcoat:glassMaterial.clearcoat
    }
   };
   // C21B-E: inspect REAL color buffer attributes on the four
   // already-existing GPU batches. This is model data, not an extra
   // decal or offscreen fake. White/metal/paint/mechanical zones must
   // have a smooth, bounded pigment gradient instead of random chips.
   const balancedKeys=['HULL','SECOND','RED','DARK'];
   const pigmentAudit={},pigmentKeyCount=balancedKeys.length;
   for(const key of balancedKeys){
    const mesh=ship.children.find(
      x=>x.name==='NEXT11C20_SB07_'+key);
    const pa=mesh.geometry.getAttribute('position'),
      ca=mesh.geometry.getAttribute('color'),
      sampleSet=new Set();
    let min=[Infinity,Infinity,Infinity],
      max=[-Infinity,-Infinity,-Infinity],
      mean=[0,0,0],nonDefault=0,finite=true;
    for(let i=0;i<ca.count;i++){
      const rgb=[ca.getX(i),ca.getY(i),ca.getZ(i)];
      for(let k=0;k<3;k++){
        min[k]=Math.min(min[k],rgb[k]);
        max[k]=Math.max(max[k],rgb[k]);
        mean[k]+=rgb[k];
        if(!Number.isFinite(rgb[k]))finite=false;
      }
      if(rgb.some(v=>Math.abs(v-1)>.01))nonDefault++;
      if(i%101===0)sampleSet.add(rgb.map(v=>v.toFixed(3)).join(':'));
    }
    mean=mean.map(x=>x/ca.count);
    pigmentAudit[key]={
      hasAttribute:!!ca,vertexColors:mesh.material.vertexColors,
      positionCount:pa.count,colorCount:ca.count,
      min,max,mean,nonDefault,distinctSamples:sampleSet.size,
      materialHex:mesh.material.color.getHex()
    };
   }
   const unchangedColorBatches=['GLASS','ORANGE','PLASMA']
     .map(key=>{
       const mesh=ship.children.find(
         x=>x.name==='NEXT11C20_SB07_'+key);
       return {key,colorBuffer:!!mesh.geometry.getAttribute('color'),
         materialHex:mesh.material.color.getHex(),
         vertexColors:!!mesh.material.vertexColors};
     });
   const raceParts=ship.userData.parts;
   const baseFrame=renderer.getContext().getContextAttributes();
   return {parts:raceParts,combatParts:combat.userData.parts,
    id:ship.userData.authoredShipId,raceOnly:ship.userData.raceOnly,
    weapons:ship.userData.weaponMounts,batches:ship.children.length,
    detailPass:ship.userData.detailPass,
    contoured:ship.userData.contouredEngineSpines,
    stripes:ship.userData.roofConformalSpineStripes,
    stations:ship.userData.engineSpineStations,
    lifted:ship.userData.engineSpinePaintLift,
    detachedTipRemoved:ship.userData.engineSpineDetachedTipRemoved,
    dimensions:new THREE.Box3().setFromObject(ship).getSize(new THREE.Vector3()).toArray(),
    hullVertices:count(hull),redVertices:count(red),
    normalized:ship.children.every(o=>o.isMesh&&o.geometry.getAttribute('normal')?.count===
     o.geometry.getAttribute('position')?.count&&
     o.geometry.getAttribute('uv')?.count===
     o.geometry.getAttribute('position')?.count),
    physicalAA:!!baseFrame.antialias,
    pixelRatio:renderer.getPixelRatio(),
    frontShoulderPieces:ship.userData.contouredFrontShoulders,
    frontShoulderSections:ship.userData.frontShoulderStations,
    frontShoulderProfiles:ship.userData.frontShoulderCrossSections,
    frontShoulderPaintGrids:ship.userData.frontShoulderPaintGrids,
    frontRedClearance:ship.userData.frontShoulderRedClearance,
    aftWingBridgePieces:ship.userData.taperedAftWingBridges,
    aftWingBridgeStations:ship.userData.aftBridgeStations,
    frontBoxesReplaced:ship.userData.shoulderBoxesReplaced,
    aftBoxesReplaced:ship.userData.aftBoxesReplaced,
    noNewPieces:ship.userData.shoulderGeometryNoExtraPieces,
    originalMSAARetained:ship.userData.shoulderOriginalMSAA,
    colorHierarchy:ship.userData.colorHierarchy,
    colorHierarchyVersion:ship.userData.colorHierarchyVersion,
    colorHierarchyFamilies:ship.userData.colorHierarchyFamilies,
    colorHierarchyPigmentVertices:ship.userData.colorHierarchyPigmentVertices,
    colorHierarchyByFamily:ship.userData.colorHierarchyByFamily,
    colorHierarchyOriginalAA:ship.userData.colorHierarchyNativeAA,
    colorHierarchyNoNewDraws:ship.userData.colorHierarchyDrawCallNeutral,
    colorHierarchyNoParts:ship.userData.colorHierarchyNoExtraShipParts,
    colorHierarchyOriginalHex:ship.userData.colorHierarchyOriginalMaterialHex,
    pigmentAudit,pigmentKeyCount,unchangedColorBatches,
    splitPhysicalMaterials:ship.userData.pbrCeramicGunmetalSplit,
    atlasSize:ship.userData.pbrFinishAtlasSize,
    surfaceFamilies:ship.userData.pbrFinishFamilies,
    unchangedMaterialBatches:ship.userData.pbrMaterialBatchCountUnchanged,
    originalRedPreserved:ship.userData.pbrRedFinishPreserved,
    originalPbrMSAA:ship.userData.pbrOriginalMSAA,
    noNewSurfaceGeometry:ship.userData.pbrNoNewGeometry,
    materialAudit,
    polishedNoseEngine:ship.userData.polishedNoseAndEngineRoofs,
    noseRoofCount:ship.userData.noseRoofNormalCount,
    engineRoofCount:ship.userData.engineRoofNormalCount,
    noseWindingOutward:ship.userData.noseHullSideWindingOutward,
    engineWindingOutward:ship.userData.engineSpineWindingOutward,
    unchangedEndCaps:ship.userData.hullEndCapsUnchanged,
    unchangedNoseEnginePositions:ship.userData.noseAndEnginePositionsUnchanged,
    noseEngineNativeAA:ship.userData.noseAndEngineNativeMSAA,
    noseEngineOnlyNormalWinding:ship.userData.noseAndEngineOnlyNormalsAndWinding,
    noseAndEngineNormals,windingChecks,
    polishedRoofNormals:ship.userData.polishedLoftRoofNormals,
    polishedRoofNormalCounts:ship.userData.polishedLoftNormalCounts,
    polishedRoofTypes:ship.userData.polishedLoftNormalTypes,
    correctedAftFaceWinding:ship.userData.aftBridgeWindingCorrected,
    noNormalGeometry:ship.userData.noNormalOverlayGeometry,
    normalsQA,aftWinding,
    frontChecks:fronts,shoulderPaintChecks:shoulderPaint,
    aftChecks:aft,actualShoulderClearance,
    conformalWingPaint:ship.userData.conformalWingPaintStrips,
    paintGrid:ship.userData.wingPaintTessellation,
    paintSurfaceY:ship.userData.wingPaintSurfaceY,
    oldPaintExtrusionsReplaced:ship.userData.oldWingPaintExtrusionsReplaced,
    inlaidFlapJoints:ship.userData.inlaidFlapSeams,
    oldFlapRodsReplaced:ship.userData.oldFlapCylindersReplaced,
    originalWingPaintAA:ship.userData.wingPaintOriginalMSAA,
    noAddedPaintPieces:ship.userData.wingPaintNoExtraPieces,
    redPaintChecks,flapChecks,mergedPaintTopY,
    wingRootBridges:ship.userData.unifiedWingRootBridges,
    wingRootBridgeStations:ship.userData.wingRootBridgeStations,
    wingRootBridgeColumns:ship.userData.wingRootBridgeColumns,
    wingRootReplacedSeams:ship.userData.wingRootFormerSeamsReplaced,
    wingRootPieceCountUnchanged:ship.userData.wingRootNoAdditionalPieces,
    wingRootOriginalMSAA:ship.userData.wingRootPreservesOriginalMSAA,
    bridgeChecks,
    rootRises:[rootRise(-1),rootRise(1)],
    samples,spineVerticesCount:spineVerts.length,
    minStripeZ:Math.min(...spineVerts.map(v=>v.z)),
    maxStripeZ:Math.max(...spineVerts.map(v=>v.z)),
    originalRails:corridorGuideGroup.userData.railOriginalSegments,
    originalRings:corridorGuideGroup.userData.ringOriginalCount,
    originalRailBatches:corridorGuideGroup.userData.railBatchCount,
    originalRingBatches:corridorGuideGroup.userData.ringBatchCount,
    originalMap4Physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    noCollider:ship.children.every(o=>o.userData.noCollider===true)
   };
  });
  assert.equal(geom.colorHierarchy,'SB07_BALANCED');
  assert.equal(geom.colorHierarchyVersion,'NEXT11C21B-E');
  assert.deepEqual(geom.colorHierarchyFamilies,
    ['HULL','SECOND','RED','DARK']);
  assert(geom.colorHierarchyOriginalAA&&
    geom.colorHierarchyNoNewDraws&&geom.colorHierarchyNoParts&&
    geom.colorHierarchyOriginalHex);
  assert.equal(geom.pigmentKeyCount,4);
  const audit=geom.pigmentAudit;
  let totalPigmentVertices=0;
  for(const [key,values] of Object.entries(audit)){
    assert(values.hasAttribute&&values.vertexColors,
      'real material must bind RGB per-vertex paint: '+key);
    assert.equal(values.positionCount,values.colorCount);
    assert(values.positionCount>200);
    assert(values.nonDefault>200);
    assert(values.distinctSamples>4);
    assert(values.min.every(x=>x>.77&&x<1.10));
    assert(values.max.every(x=>x>.82&&x<1.11));
    assert(values.mean.every(x=>x>.83&&x<1.11));
    totalPigmentVertices+=values.colorCount;
    assert.equal(geom.colorHierarchyByFamily[key],values.colorCount);
  }
  assert.equal(geom.colorHierarchyPigmentVertices,
    totalPigmentVertices);
  assert(audit.HULL.max[0]-audit.HULL.min[0]>.025);
  assert(audit.SECOND.max[2]-audit.SECOND.min[2]>.010);
  assert(audit.RED.max[1]-audit.RED.min[1]>.025);
  assert(audit.DARK.max[0]-audit.DARK.min[0]>.010);
  assert.equal(audit.HULL.materialHex,0xdbe4ea);
  assert.equal(audit.SECOND.materialHex,0x566675);
  assert.equal(audit.RED.materialHex,0xc43838);
  assert.equal(audit.DARK.materialHex,0x15202c);
  assert.deepEqual(geom.unchangedColorBatches,[
    {key:'GLASS',colorBuffer:false,materialHex:0x18394f,vertexColors:false},
    {key:'ORANGE',colorBuffer:false,materialHex:0xfaa15d,vertexColors:false},
    {key:'PLASMA',colorBuffer:false,materialHex:0x6dd9ff,vertexColors:false}
  ]);
  assert(geom.splitPhysicalMaterials&&geom.originalRedPreserved&&
    geom.originalPbrMSAA&&geom.noNewSurfaceGeometry);
  assert.equal(geom.atlasSize,128);
  assert.deepEqual(geom.surfaceFamilies,['ceramic','gunmetal']);
  assert.equal(geom.unchangedMaterialBatches,7);
  const materials=geom.materialAudit;
  assert(materials.ceramic.isPhysical&&materials.gunmetal.isPhysical);
  assert.equal(materials.ceramic.type,'MeshPhysicalMaterial');
  assert.equal(materials.gunmetal.type,'MeshPhysicalMaterial');
  assert.equal(materials.ceramic.color,0xdbe4ea);
  assert.equal(materials.gunmetal.color,0x566675);
  assert.equal(materials.ceramic.metalness,.47);
  assert.equal(materials.gunmetal.metalness,.76);
  assert.equal(materials.ceramic.roughness,.34);
  assert.equal(materials.gunmetal.roughness,.44);
  assert.equal(materials.ceramic.clearcoat,.30);
  assert.equal(materials.gunmetal.clearcoat,.12);
  assert.equal(materials.ceramic.bumpScale,.006);
  assert.equal(materials.gunmetal.bumpScale,.010);
  for(const finish of [materials.ceramic,materials.gunmetal]){
    assert(finish.ownBump);
    assert.equal(finish.texture.width,128);
    assert.equal(finish.texture.height,128);
    assert.equal(finish.texture.anisotropy,4);
    assert(finish.texture.standardDeviation>1 &&
      finish.texture.standardDeviation<20);
    assert(finish.texture.mean>180&&finish.texture.mean<240);
  }
  assert(materials.contrast.separateTextures&&
    materials.contrast.separateOriginalRed);
  assert.equal(materials.contrast.originalRedColor,0xc43838);
  assert.equal(materials.contrast.originalRedType,'MeshStandardMaterial');
  assert.equal(materials.contrast.originalRedRoughness,.47);
  assert.equal(materials.contrast.originalRedMetalness,.43);
  assert.equal(materials.contrast.originalCanopyType,'MeshPhysicalMaterial');
  assert.equal(materials.contrast.originalCanopyColor,0x18394f);
  assert.equal(materials.contrast.originalCanopyClearcoat,.75);
  assert(geom.polishedNoseEngine&&geom.noseWindingOutward&&
    geom.engineWindingOutward&&geom.unchangedEndCaps&&
    geom.unchangedNoseEnginePositions&&geom.noseEngineNativeAA&&
    geom.noseEngineOnlyNormalWinding);
  assert.equal(geom.noseRoofCount,54);
  assert.equal(geom.engineRoofCount,84);
  assert.equal(geom.noseAndEngineNormals.length,138);
  for(const item of geom.noseAndEngineNormals){
   assert(item.found>0 && item.normalPositionError<.0001,
     'genuine nose/engine vertex missing from current GPU data: '+
      JSON.stringify(item));
   assert(item.expectedUp>.16 && item.normalDot>.985,
     'final actual nose/engine normal must follow the real roof: '+
      JSON.stringify(item));
  }
  assert.equal(geom.windingChecks.length,4);
  for(const item of geom.windingChecks){
   assert(item.matches>0 && item.maxOutward>.25,
      'long nose or engine must have actual OUTWARD-facing triangles: '+
      JSON.stringify(item));
  }
  assert(geom.polishedRoofNormals&&geom.correctedAftFaceWinding&&
    geom.noNormalGeometry);
  assert.equal(geom.polishedRoofTypes,3);
  assert.deepEqual(geom.polishedRoofNormalCounts,[60,70,50],
    '2 wing roots (5x6), 2 shoulders (5x7), 2 aft bridges (5x5)');
  assert.equal(geom.normalsQA.length,180);
  for(const item of geom.normalsQA){
    assert(item.found>0&&item.normalPositionError<.0001,
      'target roof vertex must exist in actual WebGL geometry: '+
        JSON.stringify(item));
    assert(item.expectedUp>.16&&item.dot>.985,
      'actual final upper-skin normal must follow 3D roof tangents '+
        JSON.stringify(item));
  }
  assert.equal(geom.aftWinding.length,2);
  for(const item of geom.aftWinding){
    assert(item.faces>0&&item.faceNormalUp>.25,
      'rear motor wing upper face must wind UP, not down: '+
        JSON.stringify(item));
  }
  assert.equal(geom.frontShoulderPieces,2);
  assert.equal(geom.frontShoulderSections,5);
  assert.equal(geom.frontShoulderProfiles,7);
  assert.deepEqual(geom.frontShoulderPaintGrids,[9,3]);
  assert.equal(geom.frontRedClearance,.012);
  assert.equal(geom.aftWingBridgePieces,2);
  assert.equal(geom.aftWingBridgeStations,5);
  assert.equal(geom.frontBoxesReplaced,4);
  assert.equal(geom.aftBoxesReplaced,2);
  assert(geom.noNewPieces&&geom.originalMSAARetained);
  assert.equal(geom.frontChecks.length,70);
  assert.equal(geom.shoulderPaintChecks.length,54);
  assert.equal(geom.aftChecks.length,50);
  for(const point of [...geom.frontChecks,
    ...geom.shoulderPaintChecks,...geom.aftChecks])
    assert(point.error<.0001,
      'actual rendered shoulder/paint/wing-bridge vertex missing: '+
       JSON.stringify(point));
  assert.equal(geom.actualShoulderClearance.length,6);
  for(const point of geom.actualShoulderClearance){
    assert(Number.isFinite(point.separation) &&
      point.separation>.004&&point.separation<.028,
      'front red paint must sit on actual curved skin, not float: '+
      JSON.stringify(point));
  }
  assert.equal(geom.conformalWingPaint,2);
  assert.deepEqual(geom.paintGrid,[17,3]);
  assert.equal(geom.paintSurfaceY,-.096);
  assert.equal(geom.oldPaintExtrusionsReplaced,2);
  assert.equal(geom.inlaidFlapJoints,2);
  assert.equal(geom.oldFlapRodsReplaced,2);
  assert(geom.originalWingPaintAA&&geom.noAddedPaintPieces);
  assert.equal(geom.redPaintChecks.length,102);
  assert.equal(geom.flapChecks.length,52);
  for(const item of [...geom.redPaintChecks,...geom.flapChecks])
    assert(item.error<.0001,
      'real 3D paint/inlay sample must exist in GPU mesh: '+
       JSON.stringify(item));
  for(const p of geom.mergedPaintTopY){
    assert(Number.isFinite(p.hullY) && p.paintY-p.hullY>=.008 &&
      p.paintY-p.hullY<=.025,
      'red paint must sit above the existing metal panel: '+JSON.stringify(p));
  }
  assert.equal(geom.wingRootBridges,2);
  assert.equal(geom.wingRootBridgeStations,5);
  assert.equal(geom.wingRootBridgeColumns,6);
  assert.equal(geom.wingRootReplacedSeams,2);
  assert(geom.wingRootPieceCountUnchanged&&geom.wingRootOriginalMSAA);
  assert.equal(geom.bridgeChecks.length,60);
  for(const point of geom.bridgeChecks){
   assert(point.closestVertexError<.0001,
    'wing-to-fuselage loft surface missing from actual GPU geometry: '+
      JSON.stringify(point));
  }
  assert(geom.rootRises.every(y=>y>.12),
   'new root must rise continuously from wing skin to real fuselage');
  assert.equal(geom.parts,189);
  assert.equal(geom.combatParts,249);
  assert.equal(geom.id,'SB-07');
  assert(geom.raceOnly&&geom.weapons===0);
  assert.equal(geom.batches,7);
  assert.equal(geom.contoured,2);
  assert.equal(geom.stripes,2);
  assert.equal(geom.stations,6);
  assert.equal(geom.lifted,.014);
  assert(geom.detachedTipRemoved);
  assert.equal(geom.originalRails,6960);
  assert.equal(geom.originalRings,192);
  assert.equal(geom.originalRailBatches,20);
  assert.equal(geom.originalRingBatches,10);
  assert.deepEqual(geom.originalMap4Physics,[0,0,0]);
  assert(geom.noCollider&&geom.normalized&&geom.physicalAA);
  assert.equal(geom.pixelRatio,1);
  assert(geom.spineVerticesCount>25);
  assert(geom.minStripeZ>=.3399,
   'old red box floated ahead of the supporting engine shell');
  assert(geom.maxStripeZ<=2.131,
   'new conformal paint must stop on its supporting spine');
  assert.equal(geom.samples.length,30);
  for(const r of geom.samples){
   assert(Number.isFinite(r.redY)&&Number.isFinite(r.hullY),
    'both actual surfaces must exist: '+JSON.stringify(r));
   assert(r.clearance>=.008 && r.clearance<=.024,
    'paint should not float or z-fight the shell: '+JSON.stringify(r));
  }
  const images=[];
  for(const angle of ['rear','front','rear-quarter','top']){
   const snap=await page.evaluate(angle=>{
    const size=[1600,900],studio=new THREE.Scene();
    studio.background=new THREE.Color(0x0b1220);
    studio.add(new THREE.AmbientLight(0xdde6f2,.75));
    const key=new THREE.DirectionalLight(0xf9fbff,2.3);
    key.position.set(-7,10,-5);studio.add(key);
    const fill=new THREE.DirectionalLight(0x72b9f5,1.1);
    fill.position.set(10,3,9);studio.add(fill);
    const ship=h4Ship19Race.clone(true);
    ship.position.set(0,0,0);ship.rotation.set(0,0,0);ship.scale.set(1,1,1);
    ship.visible=true;studio.add(ship);
    const cam=new THREE.PerspectiveCamera(48,size[0]/size[1],.1,120);
    cam.position.copy({
     'rear':new THREE.Vector3(0,5,23),
     'front':new THREE.Vector3(0,5,-23),
     'rear-quarter':new THREE.Vector3(15,7,18),
     'top':new THREE.Vector3(0,25,4)
    }[angle]);
    cam.lookAt(0,0,0);
    renderer.setPixelRatio(1);renderer.setSize(...size,false);
    renderer.render(studio,cam);
    const gl=renderer.getContext();gl.finish();
    const err=gl.getError();
    const [w,h]=size,raw=new Uint8Array(w*h*4);
    gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,raw);
    const flipped=new Uint8ClampedArray(raw.length),row=w*4;
    let lit=0;
    for(let y=0;y<h;y++){
     const line=raw.subarray(y*row,(y+1)*row);
     flipped.set(line,(h-1-y)*row);
     for(let x=0;x<line.length;x+=4)
      if(line[x]+line[x+1]+line[x+2]>130)lit++;
    }
    const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
    canvas.getContext('2d').putImageData(new ImageData(flipped,w,h),0,0);
    return {angle,png:canvas.toDataURL('image/png').split(',')[1],
     glError:err,drawCalls:renderer.info.render.calls,
     triangles:renderer.info.render.triangles,
     litPixels:lit,snapshot:size,
     rendererAA:!!gl.getContextAttributes().antialias,
     materialBatches:ship.children.length};
   },angle);
   const bin=Buffer.from(snap.png,'base64');
   fs.writeFileSync(path.join(out,'sb07-contoured-'+angle+'-1600x900.png'),bin);
   delete snap.png;
   assert.equal(snap.glError,0);
   assert.equal(snap.drawCalls,9,'same seven merged batches plus two halos');
   assert(snap.triangles>4000&&snap.litPixels>7000);
   assert.equal(snap.materialBatches,7);
   assert(snap.rendererAA);
   images.push(snap);
  }
  await page.locator('#start-btn').click();
  await page.waitForFunction(()=>state.running&&state.activeMap===MAP_MODES.MAP1 &&
    state.raceTime>.02,null,{timeout:25000});
  await page.evaluate(()=>{
   state.paused=true;renderer.setSize(1600,900,false);
   const raf=window.requestAnimationFrame.bind(window);
   window.requestAnimationFrame=cb=>cb&&cb.name==='animate'?0:raf(cb);
  });
  const active=await page.evaluate(()=>{
   renderer.render(scene,camera);
   return {map:state.activeMap,parts:h4Ship19Race.userData.parts,
    visible:h4Ship19Race.visible,renderCalls:renderer.info.render.calls};
  });
  assert(active.visible&&active.renderCalls>20);
  assert.equal(active.parts,189);
  await page.evaluate(()=>{
   state.running=false;state.paused=false;
   document.getElementById('gameover-screen').classList.add('hidden');
   document.getElementById('start-screen').classList.remove('hidden');
   selectMap(MAP_MODES.MAP4);startGame();state.paused=true;
  });
  const protectedMap4=await page.evaluate(()=>{
   renderer.render(scene,camera);
   return {map:state.activeMap,parts:h4Ship19Combat.userData.parts,
    raceVisible:h4Ship19Race.visible,combatVisible:h4Ship19Combat.visible,
    physics:[h4CanyonColliders.length,h4IndustrialColliders.length,
     planetaryBuildingColliders.length],
    calls:renderer.info.render.calls};
  });
  assert(!protectedMap4.raceVisible&&protectedMap4.combatVisible);
  assert.equal(protectedMap4.parts,249);
  assert.deepEqual(protectedMap4.physics,[6,36,200]);
  assert(protectedMap4.calls>0);
  assert.deepEqual(errors,[]);
  const report={pass:true,tag:'NEXT11C21B',geom,images,active,protectedMap4,errors,
   caveat:'Real WebGL independent studio view of game model, not original player camera or native GPU FPS. A/B visual judgement requires user.'};
  fs.writeFileSync(path.join(out,'integrated-spines-qa.json'),JSON.stringify(report,null,2));
  console.log('NEXT11C21B BALANCED COLOR HIERARCHY REAL WEBGL PASS '+JSON.stringify({
   parts:geom.parts,palette:geom.colorHierarchy,
   paintedBatches:geom.pigmentKeyCount,
   coloredVertices:geom.colorHierarchyPigmentVertices,
   pigmentSummary:Object.fromEntries(
    Object.entries(geom.pigmentAudit).map(([key,val])=>[
       key,{min:val.min,max:val.max,mean:val.mean,
        distinct:val.distinctSamples,vertices:val.colorCount}])),
   materialTypes:[
    geom.materialAudit.ceramic.type,
    geom.materialAudit.gunmetal.type],
   originalMaterialColors:[
    geom.materialAudit.ceramic.color,
    geom.materialAudit.gunmetal.color,
    geom.materialAudit.contrast.originalRedColor],
   newFinishMaps:[
    geom.materialAudit.ceramic.texture,
    geom.materialAudit.gunmetal.texture],
   noNewMeshBatches:geom.batches===7,
   noseRoofNormals:geom.noseRoofCount,
   engineRoofNormals:geom.engineRoofCount,
   noseEngineNormalSamples:geom.noseAndEngineNormals.length,
   minNoseEngineNormalDot:Math.min(
      ...geom.noseAndEngineNormals.map(x=>x.normalDot)),
   outwardWinding:geom.windingChecks,
   roofNormalRegions:geom.polishedRoofTypes,
   roofNormalSamples:geom.normalsQA.length,
   minRoofTangentDot:Math.min(...geom.normalsQA.map(n=>n.dot)),
   aftFaceWinding:geom.aftWinding,
   shoulderPieces:geom.frontShoulderPieces,
   matchingShoulderVertices:geom.frontChecks.length,
   matchingShoulderRed:geom.shoulderPaintChecks.length,
   matchingAftWingBridge:geom.aftChecks.length,
   maxNewVertexError:Math.max(...[...geom.frontChecks,
    ...geom.shoulderPaintChecks,...geom.aftChecks].map(x=>x.error)),
   trueSurfacePaintClearances:geom.actualShoulderClearance.map(x=>x.separation),
   conformalPaintStrips:geom.conformalWingPaint,
   matchedPaintVertices:geom.redPaintChecks.length,
   maxPaintError:Math.max(...geom.redPaintChecks.map(x=>x.error)),
   inlaidFlapSeams:geom.inlaidFlapJoints,
   matchedFlapVertices:geom.flapChecks.length,
   maxFlapError:Math.max(...geom.flapChecks.map(x=>x.error)),
   wingPaintY:geom.paintSurfaceY,
   wingRootBridges:geom.wingRootBridges,
   replacedRootSeams:geom.wingRootReplacedSeams,
   matched3DRoofVertices:geom.bridgeChecks.length,
   maxRootVertexError:Math.max(...geom.bridgeChecks.map(x=>x.closestVertexError)),
   rootRises:geom.rootRises,
   spines:geom.contoured,roofStripes:geom.stripes,
   samples:geom.samples.length,
   clearanceMin:Math.min(...geom.samples.map(s=>s.clearance)),
   clearanceMax:Math.max(...geom.samples.map(s=>s.clearance)),
   floatingTipRemoved:geom.detachedTipRemoved,
   realScreenshots:images.length,
   renderBatches:geom.batches,map4Parts:protectedMap4.parts,
   map4Physics:protectedMap4.physics}));
 }finally{await browser.close();}
})().catch(e=>{fs.writeFileSync(path.join(out,'error.txt'),String(e.stack||e));
 console.error(e.stack||e);process.exitCode=1;});
