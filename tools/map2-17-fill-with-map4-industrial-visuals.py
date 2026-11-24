from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

old_stats="exactMap4CorridorClusters:0,exactMap4CorridorMeshes:0"
new_stats="exactMap4CorridorClusters:0,exactMap4CorridorMeshes:0,exactMap4IndustrialVisualParts:0,exactMap4IndustrialVisualMeshes:0"
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

            // MAP2-17: paste the entire 985-mesh Map4 industrial visual district,
            // but split its original 20 km source span into five ~4 km authored
            // chunks. Each chunk is relocated into a clear TECH window, so every
            // original mesh is reused exactly once without filling FAST sectors.
            const map2FindClearTechWindow=(preferred,halfSpan=2500,used=[])=>{
                const candidates=[];
                for(let d=halfSpan+4500;d<MAP2_DISTANCE-halfSpan-4500;d+=500){
                    let clear=true;
                    for(let x=-halfSpan;x<=halfSpan;x+=500){
                        if(map2Segment(d+x).kind==='FAST'){clear=false;break;}
                    }
                    if(clear&&used.every(u=>Math.abs(u-d)>6500))candidates.push(d);
                }
                if(!candidates.length)return null;
                candidates.sort((a,b)=>Math.abs(a-preferred)-Math.abs(b-preferred));
                return candidates[0];
            };
            const map2NearestMap4Progress=(worldPoint,from,to)=>{
                let best=from,bestDist=Infinity;
                for(let d=from;d<=to;d+=250){
                    const dist=h4WorldPosition(d,0,0).distanceToSquared(worldPoint);
                    if(dist<bestDist){bestDist=dist;best=d;}
                }
                const lo=Math.max(from,best-250),hi=Math.min(to,best+250);
                for(let d=lo;d<=hi;d+=25){
                    const dist=h4WorldPosition(d,0,0).distanceToSquared(worldPoint);
                    if(dist<bestDist){bestDist=dist;best=d;}
                }
                return best;
            };
            const map2CloneExactMap4IndustrialVisualParts=()=>{
                const source=planetaryWorldRegions[2].children.find(o=>
                    o.name==='MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS');
                if(!source)throw new Error('MAP2-17 missing 985-mesh Map4 industrial visual source');
                const sourceFrom=PLANETARY_REGIONS[2].from;
                const sourceTo=PLANETARY_REGIONS[2].to;
                const sourceSpan=sourceTo-sourceFrom;
                const chunkCount=5;
                const chunkSpan=sourceSpan/chunkCount;
                const preferred=[26000,56000,86000,121000,153000];
                const targets=[],used=[];
                for(let i=0;i<chunkCount;i++){
                    const target=map2FindClearTechWindow(preferred[i],chunkSpan*.5+500,used);
                    if(target===null)throw new Error('MAP2-17 no clear TECH window for industrial chunk '+i);
                    targets.push(target);used.push(target);
                }

                source.updateMatrixWorld(true);
                const sourceParentWorld=source.matrixWorld.clone();
                const center=new THREE.Vector3();
                let totalMeshes=0,totalParts=0;
                source.children.forEach((child,index)=>{
                    let childMeshes=0;
                    child.traverse(o=>{if(o.isMesh||o.isInstancedMesh)childMeshes++;});
                    if(!childMeshes)return;

                    const box=new THREE.Box3().setFromObject(child);
                    if(!box.isEmpty()){
                        box.getCenter(center);
                    }else{
                        // Some final industrial batches have no usable aggregate
                        // Box3 despite containing meshes/instances. Recover a real
                        // source point from the first drawable descendant.
                        let found=false;
                        child.traverse(o=>{
                            if(found||!(o.isMesh||o.isInstancedMesh))return;
                            o.updateMatrixWorld(true);
                            if(o.isInstancedMesh&&o.count>0){
                                const im=new THREE.Matrix4();
                                o.getMatrixAt(0,im);
                                center.setFromMatrixPosition(im).applyMatrix4(o.matrixWorld);
                            }else{
                                o.getWorldPosition(center);
                            }
                            found=true;
                        });
                        if(!found)child.getWorldPosition(center);
                    }
                    const sourceAt=map2NearestMap4Progress(center,sourceFrom,sourceTo);
                    const chunk=Math.max(0,Math.min(chunkCount-1,
                        Math.floor((sourceAt-sourceFrom)/chunkSpan)));
                    const sourceChunkCenter=sourceFrom+(chunk+.5)*chunkSpan;
                    const targetAt=targets[chunk]+(sourceAt-sourceChunkCenter);

                    const clone=child.clone(true);
                    clone.name='MAP2_EXACT_MAP4_INDUSTRIAL_PART_'+chunk+'_'+index;
                    clone.userData.map2ExactMap4IndustrialVisualPart=true;
                    clone.userData.sourceMap4IndustrialVisual=source.name;
                    clone.userData.sourceChildName=child.name||null;
                    clone.userData.sourceChildIndex=index;
                    clone.userData.sourceProgress=sourceAt;
                    clone.userData.sourceChunk=chunk;
                    clone.userData.map2TargetDistance=targetAt;
                    clone.userData.map2ChunkCenter=targets[chunk];

                    // Convert the child's original parent-local transform to world,
                    // then map that Map4 route frame onto the chosen Map2 TECH frame.
                    clone.applyMatrix4(sourceParentWorld);
                    const transform=map2FrameMatrix(targetAt,0,-20)
                        .multiply(map4SourceFrameMatrix(sourceAt).invert());
                    clone.applyMatrix4(transform);

                    clone.traverse(obj=>{
                        obj.userData.map2ExactMap4IndustrialVisualPart=true;
                        if(obj.isMesh||obj.isInstancedMesh){
                            obj.userData.map2VisualOnly=true;
                            obj.userData.visualOnly=true;
                            if(obj.userData.h4Collider)obj.userData.h4Collider=null;
                            if(obj.userData.h4CityPhysical)obj.userData.h4CityPhysical=false;
                        }
                    });
                    sectionAt(targetAt).add(clone);
                    totalMeshes+=childMeshes;
                    totalParts++;
                });
                map2VisualStageStats.exactMap4IndustrialVisualParts+=totalParts;
                map2VisualStageStats.exactMap4IndustrialVisualMeshes+=totalMeshes;
                if(totalMeshes!==985)
                    throw new Error('MAP2-17 expected 985 industrial meshes, got '+totalMeshes);
                return {targets,totalParts,totalMeshes};
            };

            // MAP2-08: build an actual industrial district around the physical gates."""
if anchor not in s:
    raise SystemExit("MAP2-17 helper anchor not found")
s=s.replace(anchor,insert,1)

layout_anchor="""            const finalCorridorTarget=map2FindNonFastStructureTarget(151000,2600);
            if(finalCorridorTarget!==null)
                map2CloneExactMap4FinalCorridor(finalCorridorTarget,0,-18);"""
layout_new=layout_anchor+"""

            // Paste every mesh from the large Map4 industrial visual group once.
            map2CloneExactMap4IndustrialVisualParts();"""
if layout_anchor not in s:
    raise SystemExit("MAP2-17 placement anchor not found")
s=s.replace(layout_anchor,layout_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-17 split-and-paste 985-mesh Map4 industrial district patch applied")
