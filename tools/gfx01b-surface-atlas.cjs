/* GFX-01B: deterministic tileable rock/metal glTF albedo surfaces.
 * Built into GLB binary bufferViews as PNGs, no runtime texture fetch.
 */
'use strict';
const zlib=require('node:zlib');
function crc32(buf){
 let c=0xffffffff;
 for(const b of buf){
  c^=b;
  for(let k=0;k<8;k++)c=(c>>>1)^(c&1?0xedb88320:0);
 }
 return (c^0xffffffff)>>>0;
}
function chunk(type,data){
 const len=Buffer.alloc(4),kind=Buffer.from(type);
 len.writeUInt32BE(data.length);
 const crc=Buffer.alloc(4);
 crc.writeUInt32BE(crc32(Buffer.concat([kind,data])));
 return Buffer.concat([len,kind,data,crc]);
}
function periodicNoise(size,seed,frequency,x,y){
 const u=x/size*frequency,v=y/size*frequency;
 const xi=Math.floor(u),yi=Math.floor(v),a=u-xi,b=v-yi;
 const smooth=t=>t*t*(3-2*t),ax=smooth(a),by=smooth(b);
 const hash=(x,y)=>{
  const n=Math.imul(x+41,0x632be5ab)^Math.imul(y+97,0x85157af5)^seed;
  let k=n>>>0;k^=k>>>16;k=Math.imul(k,0x7feb352d);
  k^=k>>>15;k=Math.imul(k,0x846ca68b);k^=k>>>16;
  return (k>>>0)/4294967295;
 };
 const x1=(xi+1)%frequency,y1=(yi+1)%frequency;
 const c0=hash(xi%frequency,yi%frequency)*(1-ax)+hash(x1,yi%frequency)*ax;
 const c1=hash(xi%frequency,y1)*(1-ax)+hash(x1,y1)*ax;
 return c0*(1-by)+c1*by;
}
function create(kind,size=256){
 const scan=Buffer.alloc(size*(1+size*4));
 const rock=kind==='rock',wreck=kind==='wreck';
 const base=rock?[218,200,180]:wreck?[165,153,144]:[201,210,220];
 for(let y=0;y<size;y++){
  const off=y*(1+4*size);
  scan[off]=0;
  for(let x=0;x<size;x++){
   const n=.52*periodicNoise(size,8812,4,x,y)+
    .25*periodicNoise(size,10053,12,x,y)+
    .15*periodicNoise(size,4428,26,x,y)+
    .08*periodicNoise(size,12789,52,x,y);
   const band=rock?Math.sin(y/size*Math.PI*2*15+
       periodicNoise(size,1937,4,x,y)*2.8)*.032:
     wreck?Math.sin(y/size*Math.PI*2*5+periodicNoise(size,1937,4,x,y)*4)*.028:
     ((y%64===0||x%64===0)?-.1:0);
   const p=1+(n-.5)*(rock?.32:wreck?.37:.16)+band;
   const idx=off+1+4*x;
   if(wreck){
     // Periodic pseudo-art treatment: scorch fields, oxide, directional
     // scratches and intermittent plate seams. No externally loaded atlas.
     const u=x/size,v=y/size,tau=2*Math.PI;
     const scorching=periodicNoise(size,7631,5,x,y)*.63+
       periodicNoise(size,9234,17,x,y)*.37;
     const soot=Math.pow(Math.max(0,(scorching-.49)*2.9),1.9);
     const corrode=periodicNoise(size,2277,22,x,y);
     const seamX=Math.pow(Math.max(0,.012-Math.min(
       (u*6)%1,1-(u*6)%1))/.012,1.2);
     const seamY=Math.pow(Math.max(0,.015-Math.min(
       (v*8)%1,1-(v*8)%1))/.015,1.2);
     const scratches=Math.pow(Math.max(0,Math.cos(
       tau*(u*34+Math.sin(tau*v*3)*.018+
       periodicNoise(size,5673,8,x,y)*.07))),32);
     const heat=.30*Math.max(0,corrode-.68);
     const dark=soot*.70+Math.max(seamX,seamY)*.20+scratches*.20;
     for(let c=0;c<3;c++){
       const baseValue=base[c]*p*(1-dark);
       const corrosionColor=[184,91,52][c];
       const value=baseValue*(1-heat)+corrosionColor*heat;
       scan[idx+c]=Math.max(0,Math.min(255,Math.round(value)));
     }
   }else for(let c=0;c<3;c++)scan[idx+c]=Math.max(0,Math.min(255,
     Math.round(base[c]*p+(rock?0:Math.sin(y*.19)*2.8))));
   scan[idx+3]=255;
  }
 }
 const header=Buffer.alloc(13);
 header.writeUInt32BE(size,0);header.writeUInt32BE(size,4);
 header[8]=8;header[9]=6;header[10]=0;header[11]=0;header[12]=0;
 return Buffer.concat([
  Buffer.from([137,80,78,71,13,10,26,10]),
  chunk('IHDR',header),chunk('IDAT',zlib.deflateSync(scan,{level:9})),
  chunk('IEND',Buffer.alloc(0))
 ]);
}
module.exports={create};
