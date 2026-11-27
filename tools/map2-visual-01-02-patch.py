#!/usr/bin/env python3
"""Reversible MAP2 visual pass. Do not touch collision, route, AI or Map4 geometry.

Usage: python3 tools/map2-visual-01-02-patch.py
Runtime opt-out: ?map2VisualPolish=off
"""
from pathlib import Path

path=Path(__file__).resolve().parents[1]/'index.html'
s=path.read_text(encoding='utf-8')

def once(old,new,label):
    global s
    n=s.count(old)
    if n!=1: raise SystemExit(f'{label}: expected 1 anchor, saw {n}')
    s=s.replace(old,new,1)

once('        const MAP2_CITY_PANORAMA_URL = "assets/map2-city-panorama.jpg";',
'''        const MAP2_CITY_PANORAMA_URL = "assets/map2-city-panorama.jpg";
        // MAP2-VIS01/02: optional, purely cosmetic pass. Disabled view exactly
        // retains the pre-pass atlas, model details, and instance color tints.
        const MAP2_VISUAL_POLISH = new URLSearchParams(window.location.search)
            .get('map2VisualPolish') !== 'off';
        window.starbladeMap2VisualPolishEnabled=MAP2_VISUAL_POLISH;''','flag')

once('''                ctx.fillStyle='#a09aa9';
                for(const [x,y] of [[14,13],[245,18],[34,105],[120,105],[15,198],[235,167],[143,235]])
                    ctx.fillRect(x,y,5,2);''',
'''                ctx.fillStyle='#a09aa9';
                for(const [x,y] of [[14,13],[245,18],[34,105],[120,105],[15,198],[235,167],[143,235]])
                    ctx.fillRect(x,y,5,2);
                if(MAP2_VISUAL_POLISH){
                    // Engraved flush seams rather than additional 3D objects.
                    ctx.save();
                    ctx.strokeStyle='rgba(38,43,60,.28)';ctx.lineWidth=1.15;
                    for(const x of [21,81,146,213]){
                        ctx.beginPath();ctx.moveTo(x,3);ctx.lineTo(x-7,56);
                        ctx.lineTo(x-18,110);ctx.stroke();
                    }
                    ctx.strokeStyle='rgba(246,239,241,.25)';
                    for(const [x,y,w] of [[12,140,55],[112,140,85],[20,238,64],[140,238,91]]){
                        ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+w,y);ctx.stroke();
                    }
                    for(let row=0;row<5;row++)for(let col=0;col<4;col++){
                        const x=18+col*63+(row%2)*7,y=18+row*51;
                        ctx.fillStyle='rgba(35,41,57,.38)';ctx.fillRect(x,y,3,3);
                        ctx.fillStyle='rgba(242,235,238,.40)';ctx.fillRect(x+4,y,2,2);
                    }
                    ctx.restore();
                }''','metal surface detailing')

once("                shape(ctx,[[166,226],[224,226],[215,231],[163,231]],'#dca276');",
'''                shape(ctx,[[166,226],[224,226],[215,231],[163,231]],'#dca276');
                if(MAP2_VISUAL_POLISH){
                    // No animated lights, extra materials or draw calls.
                    ctx.save();
                    ctx.fillStyle='rgba(9,14,26,.66)';
                    for(const x of [36,62,167,193])for(let i=0;i<5;i++){
                        ctx.fillRect(x,138+i*14,15,3);
                    }
                    ctx.strokeStyle='rgba(119,166,176,.50)';ctx.lineWidth=2;
                    ctx.strokeRect(20,17,215,220);
                    ctx.fillStyle='rgba(110,211,208,.78)';
                    for(const x of [54,76,98,161,183])ctx.fillRect(x,104,9,2);
                    ctx.fillStyle='rgba(231,169,112,.75)';
                    for(const x of [44,179])ctx.fillRect(x,218,18,3);
                    ctx.restore();
                }''','systems surface detailing')

once('''            ctx.globalAlpha=.36;
            ctx.drawImage(panel,0,0);
            const skin=new THREE.CanvasTexture(canvas);''',
'''            ctx.globalAlpha=MAP2_VISUAL_POLISH?.45:.36;
            ctx.drawImage(panel,0,0);
            if(MAP2_VISUAL_POLISH){
                // Hand-drawn bay joints live inside the existing 256px texture.
                ctx.globalAlpha=1;
                ctx.strokeStyle='rgba(42,48,63,.17)';ctx.lineWidth=2;
                for(const y of [44,118,192]){
                    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();
                }
                ctx.strokeStyle='rgba(251,248,248,.18)';ctx.lineWidth=1;
                for(const y of [46,120,194]){
                    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();
                }
            }
            const skin=new THREE.CanvasTexture(canvas);''','frontage skin')

once('''                    block(.447,glassY,0,.018,.021,.57,steel);
                    block(.458,glassY,0,.013,.012,.49,accent);''',
'''                    block(.447,glassY,0,.018,.021,.57,steel);
                    block(.458,glassY,0,.013,.012,.49,accent);
                    if(MAP2_VISUAL_POLISH){
                        // Merged into the original instanced silhouette mesh.
                        // The modules are decorative, without physics colliders.
                        const bays=kind==='cooling'||kind==='power'?5:
                            kind==='forge'||kind==='cargo'?4:3;
                        for(let i=0;i<bays;i++){
                            const y=.24+i*(.50/Math.max(1,bays-1));
                            const plate=kind==='forge'?0x8c6d63:steel;
                            block(-.463,y,0,.012,.013,.61,plate);
                        }
                        for(const z of [-.32,.32]){
                            block(-.462,.48,z,.014,.47,.014,core);
                        }
                        block(.464,.18,0,.012,.010,.63,accent);
                    }''','works visual paneling')

once('''                        const tint=districtTints[approach].clone().lerp(districtTints[departure],blend);
                        let facade;''',
'''                        const tint=districtTints[approach].clone().lerp(districtTints[departure],blend);
                        if(MAP2_VISUAL_POLISH){
                            // A/B-compatible deterministic block variation; same geometry,
                            // same material, same instance count and same collision data.
                            const step=(i*13+row*5+(side>0?3:0))%7;
                            tint.multiplyScalar(1+(step-3)*.013);
                        }
                        let facade;''','district tint variation')

path.write_text(s,encoding='utf-8')
print('MAP2-VIS01/02 applied to index.html; source byte count:',path.stat().st_size)
