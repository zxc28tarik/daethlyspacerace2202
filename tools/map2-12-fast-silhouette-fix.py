from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old="""                }else if(fast && cell%2===0){
                    for(const side of [-1,1]){
                        addVisualBlock(d,side*(790+(cell%3)*80),-70,240,300+(cell%4)*45,520,
                            map2VisualMats.dark,'MAP2_FAST_SILHOUETTE_'+cell+'_'+side);
                        map2VisualStageStats.fastMarkers++;
                    }
                }else if(kind==='LINK' && cell%3===0){
                    for(const side of [-1,1]){
                        addVisualBlock(d,side*690,-95,190,260,430,map2VisualMats.dark,
                            'MAP2_LINK_SILHOUETTE_'+cell+'_'+side);
                        map2VisualStageStats.sideBlocks++;
                    }
                }
"""
new="""                }else if(fast && cell%2===0){
                    // Keep the full-throttle lane clear, but use real Map4 skyline
                    // buildings at the flanks instead of black placeholder cuboids.
                    for(const side of [-1,1]){
                        const family=(cell+side>0)?'factory':'outpost';
                        map2AddMap4BuildingKit(d+side*55,
                            side*(930+(cell%3)*95),family,'FAST_'+cell+'_'+(side>0?'R':'L'));
                        map2VisualStageStats.fastMarkers++;
                    }
                }else if(kind==='LINK' && cell%3===0){
                    for(const side of [-1,1]){
                        const family=side>0?'refinery':'outpost';
                        map2AddMap4BuildingKit(d,side*790,family,
                            'LINK_'+cell+'_'+(side>0?'R':'L'));
                        map2VisualStageStats.sideBlocks++;
                    }
                }
"""
if old not in s: raise SystemExit("FAST/LINK placeholder block not found")
s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-12 FAST/LINK black silhouettes replaced with Map4 VIS02 buildings")
