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

            // MAP2-17: paste every drawable from the large final Map4 industrial
            // visual group. Three.js clone(true) drops descendants on several of
            // its special batched nodes, so use an explicit visual deep-clone that
            // preserves the exact source geometry/material references and instance
            // matrices while avoiding circular userData.
            const map2ClonePrimitiveUserData=(src)=>{
                const out={};
                for(const [k,v] of Object.entries(src||{})){
                    if(v===null||['string','number','boolean'].includes(typeof v))out[k]=v;
                }
                return out;
            };
            const map2DeepCloneVisualNode=(node)=>{
                let out;
                if(node.isInstancedMesh){
                    out=new THREE.InstancedMesh(node.geometry,node.material,node.count);
                    out.count=node.count;
                    out.instanceMatrix.copy(node.instanceMatrix);
                    out.instanceMatrix.needsUpdate=true;
                    if(node.instanceColor)out.instanceColor=node.instanceColor.clone();
                }else if(node.isMesh){
                    out=new THREE.Mesh(node.geometry,node.material);
                }else if(node.isLineSegments){
                    out=new THREE.LineSegments(node.geometry,node.material);
                }else if(node.isLine){
                    out=new THREE.Line(node.geometry,node.material);
                }else if(node.isPoints){
                    out=new THREE.Points(node.geometry,node.material);
                }else if(node.isGroup){
                    out=new THREE.Group();
                }else{
                    out=new THREE.Object3D();
                }
                out.name=node.name;
                out.position.copy(node.position);
                out.quaternion.copy(node.quaternion);
                out.scale.copy(node.scale);
                out.matrix.copy(node.matrix);
                out.matrixAutoUpdate=node.matrixAutoUpdate;
                out.visible=node.visible;
                out.frustumCulled=node.frustumCulled;
                out.renderOrder=node.renderOrder;
                out.castShadow=!!node.castShadow;
                out.receiveShadow=!!node.receiveShadow;
                out.userData=map2ClonePrimitiveUserData(node.userData);
                for(const child of node.children)out.add(map2DeepCloneVisualNode(child));
                return out;
            };
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
            const map2CloneExactMap4IndustrialVisualParts=()=>{
                const source=planetaryWorldRegions[2].children.find(o=>
                    o.name==='MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS');
                if(!source)throw new Error('MAP2-17 missing 985-mesh Map4 industrial visual source');

                const sourceChildren=source.children.filter(child=>{
                    let n=0;child.traverse(o=>{if(o.isMesh||o.isInstancedMesh)n++;});return n>0;
                });
                const chunkCount=5;
                const preferred=[26000,56000,86000,121000,153000];
                const targets=[],used=[];
                for(let i=0;i<chunkCount;i++){
                    const target=map2FindClearTechWindow(preferred[i],2500,used);
                    if(target===null)throw new Error('MAP2-17 no clear TECH window for industrial chunk '+i);
                    targets.push(target);used.push(target);
                }

                source.updateMatrixWorld(true);
                const sourceParentWorld=source.matrixWorld.clone();
                const sourceAnchor=(PLANETARY_REGIONS[2].from+PLANETARY_REGIONS[2].to)*.5;
                const sourceAnchorInv=map4SourceFrameMatrix(sourceAnchor).invert();
                let totalMeshes=0,totalParts=0;

                sourceChildren.forEach((child,index)=>{
                    let sourceMeshCount=0;
                    child.traverse(o=>{if(o.isMesh||o.isInstancedMesh)sourceMeshCount++;});
                    const chunk=Math.min(chunkCount-1,
                        Math.floor(index*chunkCount/sourceChildren.length));
                    const first=Math.floor(chunk*sourceChildren.length/chunkCount);
                    const last=Math.floor((chunk+1)*sourceChildren.length/chunkCount);
                    const localCount=Math.max(1,last-first);
                    const localIndex=index-first;
                    const longitudinal=localCount<=1?0:
                        -1800+(localIndex/(localCount-1))*3600;
                    const targetAt=targets[chunk]+longitudinal;
                    const side=((localIndex%3)-1)*260;

                    const clone=map2DeepCloneVisualNode(child);
                    clone.name='MAP2_EXACT_MAP4_INDUSTRIAL_PART_'+chunk+'_'+index;
                    clone.userData.map2ExactMap4IndustrialVisualPart=true;
                    clone.userData.sourceMap4IndustrialVisual=source.name;
                    clone.userData.sourceChildName=child.name||null;
                    clone.userData.sourceChildIndex=index;
                    clone.userData.sourceChunk=chunk;
                    clone.userData.map2TargetDistance=targetAt;
                    clone.userData.map2ChunkCenter=targets[chunk];

                    // Preserve each complete authored child composition, then align
                    // and center that composition on its assigned Map2 road slot.
                    clone.applyMatrix4(sourceParentWorld);
                    const orient=map2FrameMatrix(targetAt,side,-20)
                        .multiply(sourceAnchorInv.clone());
                    clone.applyMatrix4(orient);
                    clone.updateMatrixWorld(true);
                    const box=new THREE.Box3().setFromObject(clone);
                    if(!box.isEmpty()){
                        const actual=box.getCenter(new THREE.Vector3());
                        const frame=getRaceFrameAtDistance(targetAt);
                        const desired=frame.center.clone()
                            .addScaledVector(frame.right,side)
                            .addScaledVector(frame.up,-20);
                        clone.position.add(desired.sub(actual));
                        clone.updateMatrix();
                    }

                    let cloneMeshCount=0;
                    clone.traverse(obj=>{
                        obj.userData.map2ExactMap4IndustrialVisualPart=true;
                        if(obj.isMesh||obj.isInstancedMesh){
                            cloneMeshCount++;
                            obj.userData.map2VisualOnly=true;
                            obj.userData.visualOnly=true;
                            if(obj.userData.h4Collider)obj.userData.h4Collider=null;
                            if(obj.userData.h4CityPhysical)obj.userData.h4CityPhysical=false;
                        }
                    });
                    if(cloneMeshCount!==sourceMeshCount)
                        throw new Error('MAP2-17 deep clone mismatch '+index+': '+sourceMeshCount+' -> '+cloneMeshCount);
                    sectionAt(targetAt).add(clone);
                    totalMeshes+=cloneMeshCount;
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

            // Paste all 985 meshes from the final Map4 industrial visual group once.
            map2CloneExactMap4IndustrialVisualParts();"""
if layout_anchor not in s:
    raise SystemExit("MAP2-17 placement anchor not found")
s=s.replace(layout_anchor,layout_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-17 manual-deep-clone 985-mesh Map4 industrial district patch applied")
