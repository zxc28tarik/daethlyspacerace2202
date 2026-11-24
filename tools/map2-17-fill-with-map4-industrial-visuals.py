from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

old_stats="exactMap4CorridorClusters:0,exactMap4CorridorMeshes:0"
new_stats="exactMap4CorridorClusters:0,exactMap4CorridorMeshes:0,exactMap4IndustrialVisualClones:0,exactMap4IndustrialVisualMeshes:0"
if old_stats not in s:
    raise SystemExit("MAP2-17 stats anchor not found")
s=s.replace(old_stats,new_stats,1)

anchor="""            const map2FindNonFastStructureTarget=(seed,pad=1000)=>{
                let d=seed;
                for(let tries=0;tries<14;tries++,d+=1400){
                    const probes=[d-pad,d,d+pad];
                    if(probes.every(x=>x>3500&&x<MAP2_DISTANCE-3500&&map2Segment(x).kind!=='FAST'))
                        return d;
                }
                return null;
            };

            // MAP2-08: build an actual industrial district around the physical gates."""
insert="""            const map2FindNonFastStructureTarget=(seed,pad=1000)=>{
                let d=seed;
                for(let tries=0;tries<14;tries++,d+=1400){
                    const probes=[d-pad,d,d+pad];
                    if(probes.every(x=>x>3500&&x<MAP2_DISTANCE-3500&&map2Segment(x).kind!=='FAST'))
                        return d;
                }
                return null;
            };

            // MAP2-17: clone the complete 985-mesh Map4 industrial visual district.
            // It spans Map4 region 2 (20 km). Place it inside an already dense TECH
            // stretch so it upgrades authored detail without increasing the intended
            // route occupancy beyond the 70-80% target.
            const map2FindClearTechSpan=(preferred,halfSpan=10000)=>{
                const candidates=[];
                for(let d=halfSpan+4000;d<MAP2_DISTANCE-halfSpan-4000;d+=1000){
                    let clear=true;
                    for(let x=-halfSpan;x<=halfSpan;x+=1000){
                        if(map2Segment(d+x).kind==='FAST'){clear=false;break;}
                    }
                    if(clear)candidates.push(d);
                }
                if(!candidates.length)return null;
                candidates.sort((a,b)=>Math.abs(a-preferred)-Math.abs(b-preferred));
                return candidates[0];
            };
            const map2CloneExactMap4IndustrialVisualDistrict=(d,side=0,up=0)=>{
                const source=planetaryWorldRegions[2].children.find(o=>
                    o.name==='MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS');
                if(!source)throw new Error('MAP2-17 missing 985-mesh Map4 industrial visual source');
                const sourceAt=(PLANETARY_REGIONS[2].from+PLANETARY_REGIONS[2].to)*.5;
                const clone=source.clone(true);
                clone.name='MAP2_EXACT_MAP4_INDUSTRIAL_VISUAL_DISTRICT_AT_'+Math.round(d);
                clone.visible=true;
                clone.userData.map2ExactMap4IndustrialVisualClone=true;
                clone.userData.sourceMap4IndustrialVisual=source.name;
                clone.userData.sourceProgress=sourceAt;
                clone.userData.sourceSpan=PLANETARY_REGIONS[2].to-PLANETARY_REGIONS[2].from;
                clone.userData.map2TargetDistance=d;
                clone.userData.map2TargetSide=side;
                const transform=map2FrameMatrix(d,side,up)
                    .multiply(map4SourceFrameMatrix(sourceAt).invert());
                clone.applyMatrix4(transform);
                let meshes=0;
                clone.traverse(obj=>{
                    obj.userData.map2ExactMap4IndustrialVisualClone=true;
                    if(obj.isMesh||obj.isInstancedMesh){
                        meshes++;
                        obj.userData.map2VisualOnly=true;
                        obj.userData.visualOnly=true;
                        if(obj.userData.h4Collider)obj.userData.h4Collider=null;
                        if(obj.userData.h4CityPhysical)obj.userData.h4CityPhysical=false;
                    }
                });
                sectionAt(d).add(clone);
                map2VisualStageStats.exactMap4IndustrialVisualClones++;
                map2VisualStageStats.exactMap4IndustrialVisualMeshes+=meshes;
                return clone;
            };

            // MAP2-08: build an actual industrial district around the physical gates."""
if anchor not in s:
    raise SystemExit("MAP2-17 helper anchor not found")
s=s.replace(anchor,insert,1)

layout_anchor="""            const finalCorridorTarget=map2FindNonFastStructureTarget(151000,2600);
            if(finalCorridorTarget!==null)
                map2CloneExactMap4FinalCorridor(finalCorridorTarget,0,-18);"""
layout_new=layout_anchor+"""

            // Paste the full Map4 industrial visual district once, overlapping an
            // existing TECH-dense section. This is the exact 985-mesh source group.
            const industrialVisualTarget=map2FindClearTechSpan(96000,10000);
            if(industrialVisualTarget!==null)
                map2CloneExactMap4IndustrialVisualDistrict(industrialVisualTarget,0,-20);"""
if layout_anchor not in s:
    raise SystemExit("MAP2-17 placement anchor not found")
s=s.replace(layout_anchor,layout_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-17 full 985-mesh Map4 industrial district patch applied")
