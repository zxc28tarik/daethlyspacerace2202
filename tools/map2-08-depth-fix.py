from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old="                    const depth=[620,460,700,520][style];\n"
new="                    const depth=[210,180,255,310][style];\n"
if old not in s: raise SystemExit("expanded physical depth not found")
s=s.replace(old,new,1)
marker="""                    for(let j=0;j<panels.length;j++){
                        const [a,b,c,e,role]=panels[j];
                        const mesh=addSolid(d,(a+b)/2,(c+e)/2,b-a,e-c,depth,
                            role==='BEAM'?H4_MATERIALS.steel:deckMat,kind+'_'+i+'_'+role+'_'+j);
                        if(role==='PIER')mountKit(mesh,style);
                        else h4ArchitecturalDetail(mesh,'building');
                    }
                    map2Gates.push({distance:d,mode:'CENTER_ONLY',laneX:opening,laneY:oy,clearX:hx,clearY:hy,
"""
replacement="""                    for(let j=0;j<panels.length;j++){
                        const [a,b,c,e,role]=panels[j];
                        const mesh=addSolid(d,(a+b)/2,(c+e)/2,b-a,e-c,depth,
                            role==='BEAM'?H4_MATERIALS.steel:deckMat,kind+'_'+i+'_'+role+'_'+j);
                        if(role==='PIER')mountKit(mesh,style);
                        else h4ArchitecturalDetail(mesh,'building');
                    }
                    // MAP2-08: long factory envelope is visual-only. The short physical
                    // gate stays conservative so curved routes between gates remain valid.
                    const visualTunnelDepth=[680,540,760,620][style];
                    addVisualBlock(d,-318,8,150,480,visualTunnelDepth,map2VisualMats.dark,
                        'MAP2_GATE_SHELL_L_'+i);
                    addVisualBlock(d,318,8,150,480,visualTunnelDepth,map2VisualMats.dark,
                        'MAP2_GATE_SHELL_R_'+i);
                    addVisualBlock(d,0,292,790,104,visualTunnelDepth,map2VisualMats.shell,
                        'MAP2_GATE_SHELL_TOP_'+i);
                    map2VisualStageStats.sideBlocks+=2;map2VisualStageStats.trusses++;
                    map2Gates.push({distance:d,mode:'CENTER_ONLY',laneX:opening,laneY:oy,clearX:hx,clearY:hy,
"""
if marker not in s: raise SystemExit("gate shell insertion marker missing")
s=s.replace(marker,replacement,1)
p.write_text(s,encoding="utf-8")
print("MAP2-08 physical-depth correction and visual tunnel shells applied")
