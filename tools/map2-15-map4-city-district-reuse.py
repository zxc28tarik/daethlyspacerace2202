from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

old_stats="exactMap4StationClones:0,exactMap4Meshes:0"
new_stats="exactMap4StationClones:0,exactMap4Meshes:0,exactMap4CityDistrictClones:0,exactMap4CityMeshes:0"
if old_stats not in s:
    raise SystemExit("MAP2-15 stats anchor not found")
s=s.replace(old_stats,new_stats,1)

anchor="""                return clone;
            };
            // MAP2-08: build an actual industrial district around the physical gates."""
insert="""                return clone;
            };

            // MAP2-15: reuse the FINAL visible Map4 urban combat district as another
            // authoritative source. This includes the real city towers, crowns,
            // stepped tops, antenna silhouettes, facade ribs/windows and street-level
            // architectural detail. We clone the complete group, then strip only its
            // Map4 collision metadata so Map2 gameplay remains controlled by Map2.
            const map2CloneExactMap4CityDistrict=(d,side=0,up=0)=>{
                const source=h4City02DistrictGroup;
                if(!source||source.name!=='MAP4_CITY02_REAL_URBAN_DISTRICT')
                    throw new Error('MAP2-15 requires final Map4 urban district source');
                const sourceAt=MAP4_CITY_ARENA.centerProgress;
                const clone=source.clone(true);
                clone.name='MAP2_EXACT_MAP4_CITY_DISTRICT_AT_'+Math.round(d);
                clone.visible=true;
                clone.userData.map2ExactMap4CityClone=true;
                clone.userData.sourceMap4District=source.name;
                clone.userData.sourceProgress=sourceAt;
                clone.userData.map2TargetDistance=d;
                clone.userData.map2TargetSide=side;
                clone.userData.map2TargetUp=up;
                const transform=map2FrameMatrix(d,side,up)
                    .multiply(map4SourceFrameMatrix(sourceAt).invert());
                clone.applyMatrix4(transform);
                let meshes=0;
                clone.traverse(obj=>{
                    obj.userData.map2ExactMap4CityClone=true;
                    if(obj.isMesh||obj.isInstancedMesh){
                        meshes++;
                        obj.userData.map2VisualOnly=true;
                        obj.userData.visualOnly=true;
                        if(obj.userData.h4Collider)obj.userData.h4Collider=null;
                        if(obj.userData.h4CityPhysical)obj.userData.h4CityPhysical=false;
                    }
                });
                sectionAt(d).add(clone);
                map2VisualStageStats.exactMap4CityDistrictClones++;
                map2VisualStageStats.exactMap4CityMeshes+=meshes;
                return clone;
            };

            // MAP2-08: build an actual industrial district around the physical gates."""
if anchor not in s:
    raise SystemExit("MAP2-15 city clone function anchor not found")
s=s.replace(anchor,insert,1)

layout_anchor="""            exactCloneTargets.forEach((d,i)=>{
                // Most primary stations sit directly on the road centreline. A minority
                // is nudged slightly left/right to avoid a mechanically repeated tunnel.
                const phase=i%5;
                const side=(i===0||phase===0||phase===2||phase===4)?0:(phase===1?-140:140);
                map2CloneExactMap4Station(exactCloneOrdinal++%6,d,side,-18);

                // Every fourth non-opening anchor gets a second genuine Map4 station.
                // These flank copies overlap the road envelope rather than sitting in
                // the far background, creating the dense "between buildings" feeling.
                if(i>0&&i%4===0){
                    const flankD=d+760;
                    if(flankD<MAP2_DISTANCE-2500&&map2Segment(flankD).kind!=='FAST'){
                        const flankSide=(i%8===0?-360:360);
                        map2CloneExactMap4Station(exactCloneOrdinal++%6,flankD,flankSide,-28);
                    }
                }
            });"""
layout_new=layout_anchor+"""

            // Add full Map4 city districts between industrial stretches. Each city copy
            // spans roughly two kilometres of authored urban fabric, so keep generous
            // separation and never let its centre or shoulders overlap a FAST segment.
            const cityDistrictTargets=[];
            for(let seed=24500;seed<MAP2_DISTANCE-9000;seed+=30000){
                let d=seed;
                for(let tries=0;tries<8;tries++,d+=1800){
                    const clear=[d-1800,d,d+1800].every(x=>
                        x>4000&&x<MAP2_DISTANCE-4000&&map2Segment(x).kind!=='FAST');
                    if(clear){cityDistrictTargets.push(d);break;}
                }
            }
            cityDistrictTargets.forEach((d,i)=>{
                const side=(i%3===0?0:(i%2?-110:110));
                map2CloneExactMap4CityDistrict(d,side,-8);
            });"""
if layout_anchor not in s:
    raise SystemExit("MAP2-15 city placement anchor not found")
s=s.replace(layout_anchor,layout_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-15 exact Map4 city district reuse patch applied")
