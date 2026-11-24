from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

old_stats="exactMap4CityDistrictClones:0,exactMap4CityMeshes:0"
new_stats="exactMap4CityDistrictClones:0,exactMap4CityMeshes:0,exactMap4LandmarkClones:0,exactMap4LandmarkMeshes:0,exactMap4CorridorClusters:0,exactMap4CorridorMeshes:0"
if old_stats not in s:
    raise SystemExit("MAP2-16 stats anchor not found")
s=s.replace(old_stats,new_stats,1)

anchor="""                map2VisualStageStats.exactMap4CityDistrictClones++;
                map2VisualStageStats.exactMap4CityMeshes+=meshes;
                return clone;
            };

            // MAP2-08: build an actual industrial district around the physical gates."""
insert="""                map2VisualStageStats.exactMap4CityDistrictClones++;
                map2VisualStageStats.exactMap4CityMeshes+=meshes;
                return clone;
            };

            // MAP2-16: remaining FINAL Map4 authored structures. These are not
            // fabricated Map2 blocks: every source comes from the live Map4 world.
            const map2StripMap4Collision=(root,flagName)=>{
                let meshes=0;
                root.traverse(obj=>{
                    obj.userData[flagName]=true;
                    if(obj.isMesh||obj.isInstancedMesh){
                        meshes++;
                        obj.userData.map2VisualOnly=true;
                        obj.userData.visualOnly=true;
                        if(obj.userData.h4Collider)obj.userData.h4Collider=null;
                        if(obj.userData.h4CityPhysical)obj.userData.h4CityPhysical=false;
                    }
                });
                return meshes;
            };
            const map2CloneExactMap4Landmark=(sourceName,d,side=0,up=0)=>{
                const entry=h4WorldLandmarks.find(x=>x.group&&x.group.name===sourceName);
                if(!entry)throw new Error('MAP2-16 missing Map4 landmark '+sourceName);
                const clone=entry.group.clone(true);
                clone.name='MAP2_EXACT_MAP4_LANDMARK_'+sourceName+'_AT_'+Math.round(d);
                clone.visible=true;
                clone.userData.map2ExactMap4LandmarkClone=true;
                clone.userData.sourceMap4Landmark=sourceName;
                clone.userData.sourceProgress=entry.at;
                clone.userData.map2TargetDistance=d;
                clone.userData.map2TargetSide=side;
                const transform=map2FrameMatrix(d,side,up)
                    .multiply(map4SourceFrameMatrix(entry.at).invert());
                clone.applyMatrix4(transform);
                const meshes=map2StripMap4Collision(clone,'map2ExactMap4LandmarkClone');
                sectionAt(d).add(clone);
                map2VisualStageStats.exactMap4LandmarkClones++;
                map2VisualStageStats.exactMap4LandmarkMeshes+=meshes;
                return clone;
            };
            const map2CloneExactMap4FinalCorridor=(d,side=0,up=0)=>{
                const sources=planetaryWorldRegions[3].children.filter(o=>
                    o.name==='MAP4_GFX07_CORRIDOR_STRUCTURE');
                if(sources.length<20)
                    throw new Error('MAP2-16 requires final Map4 corridor structures');
                const clone=new THREE.Group();
                clone.name='MAP2_EXACT_MAP4_FINAL_CORRIDOR_AT_'+Math.round(d);
                clone.userData.map2ExactMap4CorridorClone=true;
                clone.userData.map2TargetDistance=d;
                clone.userData.sourceProgress=42000;
                for(const source of sources)clone.add(source.clone(true));
                const transform=map2FrameMatrix(d,side,up)
                    .multiply(map4SourceFrameMatrix(42000).invert());
                clone.applyMatrix4(transform);
                const meshes=map2StripMap4Collision(clone,'map2ExactMap4CorridorClone');
                sectionAt(d).add(clone);
                map2VisualStageStats.exactMap4CorridorClusters++;
                map2VisualStageStats.exactMap4CorridorMeshes+=meshes;
                return clone;
            };
            const map2FindNonFastStructureTarget=(seed,pad=1000)=>{
                let d=seed;
                for(let tries=0;tries<14;tries++,d+=1400){
                    const probes=[d-pad,d,d+pad];
                    if(probes.every(x=>x>3500&&x<MAP2_DISTANCE-3500&&map2Segment(x).kind!=='FAST'))
                        return d;
                }
                return null;
            };

            // MAP2-08: build an actual industrial district around the physical gates."""
if anchor not in s:
    raise SystemExit("MAP2-16 clone helper anchor not found")
s=s.replace(anchor,insert,1)

layout_anchor="""            cityDistrictTargets.forEach((d,i)=>{
                const side=(i%3===0?0:(i%2?-110:110));
                map2CloneExactMap4CityDistrict(d,side,-8);
            });"""
layout_new=layout_anchor+"""

            // Transfer the remaining building-like Map4 landmarks once each.
            // Natural mesa/crash/wreck landmarks are intentionally excluded.
            const remainingMap4Buildings=[
                ['MAP4_STONEGATE_1950',17000,0],
                ['MAP4_OBSERVATION_10100',29500,-90],
                ['MAP4_REFINERY_17200',46500,120],
                ['MAP4_FACTORY_23800',65500,0],
                ['MAP4_POWER_31600',80500,-120],
                ['MAP4_OUTPOST_36200',101500,0],
                ['MAP4_SPACEPORT_42600',132500,110],
                ['MAP4_LAUNCH_48300',159000,0]
            ];
            remainingMap4Buildings.forEach(([name,seed,side])=>{
                const d=map2FindNonFastStructureTarget(seed,1100);
                if(d!==null)map2CloneExactMap4Landmark(name,d,side,-12);
            });

            // The final Map4 sector has a separate family of detailed corridor
            // buildings. Bring the whole authored set as one exact structural cluster.
            const finalCorridorTarget=map2FindNonFastStructureTarget(151000,2600);
            if(finalCorridorTarget!==null)
                map2CloneExactMap4FinalCorridor(finalCorridorTarget,0,-18);"""
if layout_anchor not in s:
    raise SystemExit("MAP2-16 placement anchor not found")
s=s.replace(layout_anchor,layout_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-16 remaining Map4 buildings patch applied")
