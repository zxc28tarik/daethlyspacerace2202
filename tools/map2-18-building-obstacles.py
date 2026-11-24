from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

old_stats="exactMap4IndustrialVisualParts:0,exactMap4IndustrialVisualMeshes:0"
new_stats="exactMap4IndustrialVisualParts:0,exactMap4IndustrialVisualMeshes:0,map4BuildingColliders:0,map4BuildingColliderBins:0,map4BuildingCenterBlocks:0,map4BuildingSideBlocks:0,map4BuildingOverheads:0"
if old_stats not in s:
    raise SystemExit("MAP2-18 stats anchor not found")
s=s.replace(old_stats,new_stats,1)

anchor="""            // MAP2-08: build an actual industrial district around the physical gates."""
insert=r"""            // MAP2-18: turn the real Map4 architecture already placed on Map2 into
            // actual course obstacles. Colliders are derived from visible building
            // mesh volumes, shrunk inward so contact occurs inside the rendered mass.
            // We keep one deliberately narrow, gate-aware passage through every TECH
            // stretch and never register building colliders inside FAST sections.
            const map2PreferredGateOpening=(gate,index)=>{
                if(!gate||!gate.openings?.length)return {x:0,y:-60};
                if(gate.openings.length===1)return gate.openings[0];
                // Alternate the two-option gates to create a readable slalom rather
                // than allowing the player to hold one side for the entire district.
                return gate.openings[(Math.floor(index/2)+index)%gate.openings.length];
            };
            const map2BuildingPassageAt=(d)=>{
                if(!map2Gates.length)return {x:0,y:-60};
                let next=map2Gates.findIndex(g=>g.distance>=d);
                if(next<0)next=map2Gates.length-1;
                const prev=Math.max(0,next-1);
                const a=map2Gates[prev],b=map2Gates[next];
                const pa=map2PreferredGateOpening(a,prev);
                const pb=map2PreferredGateOpening(b,next);
                if(a===b)return {x:pa.x,y:pa.y};
                const t=THREE.MathUtils.clamp((d-a.distance)/(b.distance-a.distance),0,1);
                const baseX=THREE.MathUtils.lerp(pa.x,pb.x,t);
                const baseY=THREE.MathUtils.lerp(pa.y,pb.y,t);
                // Gate openings themselves remain untouched, but the route between
                // gates bows alternately left/right. At t=0/1 the added offset is
                // exactly zero, so every authored gate aperture is still reachable.
                const dir=((prev+Math.floor(prev/3))%2)?1:-1;
                const bow=Math.sin(Math.PI*t);
                const lateralBow=dir*135*bow;
                const verticalBow=Math.sin(Math.PI*2*t)*38;
                return {
                    x:THREE.MathUtils.clamp(baseX+lateralBow,-205,205),
                    y:THREE.MathUtils.clamp(baseY+verticalBow,-190,135)
                };
            };
            const map2ProjectedBoxAt=(box,d)=>{
                const frame=getRaceFrameAtDistance(d);
                const min=box.min,max=box.max;
                const corners=[
                    [min.x,min.y,min.z],[min.x,min.y,max.z],
                    [min.x,max.y,min.z],[min.x,max.y,max.z],
                    [max.x,min.y,min.z],[max.x,min.y,max.z],
                    [max.x,max.y,min.z],[max.x,max.y,max.z]
                ];
                let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,minZ=Infinity,maxZ=-Infinity;
                const p=new THREE.Vector3(),r=new THREE.Vector3();
                for(const c of corners){
                    p.set(c[0],c[1],c[2]);
                    r.copy(p).sub(frame.center);
                    const x=r.dot(frame.right),y=r.dot(frame.up),z=r.dot(frame.tangent);
                    minX=Math.min(minX,x);maxX=Math.max(maxX,x);
                    minY=Math.min(minY,y);maxY=Math.max(maxY,y);
                    minZ=Math.min(minZ,z);maxZ=Math.max(maxZ,z);
                }
                return {minX,maxX,minY,maxY,minZ,maxZ};
            };
            const map2ExactBuildingRoots=()=>{
                const roots=[];
                map2CourseGroup.traverse(o=>{
                    if(o.userData?.map2ExactMap4Clone&&o.name?.startsWith('MAP2_EXACT_MAP4_'))roots.push(o);
                    else if(o.userData?.map2ExactMap4CityClone&&o.name?.startsWith('MAP2_EXACT_MAP4_CITY_DISTRICT_AT_'))roots.push(o);
                    else if(o.userData?.map2ExactMap4LandmarkClone&&o.name?.startsWith('MAP2_EXACT_MAP4_LANDMARK_'))roots.push(o);
                    else if(o.userData?.map2ExactMap4CorridorClone&&o.name?.startsWith('MAP2_EXACT_MAP4_FINAL_CORRIDOR_AT_'))roots.push(o);
                    else if(o.userData?.map2ExactMap4IndustrialVisualPart&&o.name?.startsWith('MAP2_EXACT_MAP4_INDUSTRIAL_PART_'))roots.push(o);
                });
                return roots;
            };
            const map2BuildPhysicalMap4BuildingObstacles=()=>{
                const roots=map2ExactBuildingRoots();
                const candidates=[];
                const seenMeshes=new Set();
                for(const root of roots){
                    const rootD=Number(root.userData.map2TargetDistance);
                    if(!Number.isFinite(rootD)||map2Segment(rootD).kind==='FAST')continue;
                    root.updateMatrixWorld(true);
                    root.traverse(mesh=>{
                        if(!mesh.isMesh||mesh.isInstancedMesh||seenMeshes.has(mesh.uuid))return;
                        seenMeshes.add(mesh.uuid);
                        // Hidden fallback geometry must never receive invisible physics.
                        let visible=true,n=mesh;
                        while(n&&n!==root.parent){visible=visible&&n.visible;n=n.parent;}
                        if(!visible)return;
                        const box=new THREE.Box3().setFromObject(mesh);
                        if(box.isEmpty())return;
                        const initial=map2ProjectedBoxAt(box,rootD);
                        const initialZ=(initial.minZ+initial.maxZ)*.5;
                        const d=rootD+initialZ;
                        if(!Number.isFinite(d)||d<0||d>MAP2_DISTANCE||map2Segment(d).kind!=='TECH')return;
                        // Re-project at the collider's actual route progress. On sharp
                        // bends this keeps the collision centre inside the real mesh.
                        const q=map2ProjectedBoxAt(box,d);
                        const cx=(q.minX+q.maxX)*.5,cy=(q.minY+q.maxY)*.5;
                        let hx=(q.maxX-q.minX)*.5,hy=(q.maxY-q.minY)*.5,hd=(q.maxZ-q.minZ)*.5;
                        // Existing authored gates already handle their own immediate
                        // collision. Use real buildings mainly between those gates.
                        if(map2Gates.some(g=>Math.abs(g.distance-d)<280))return;
                        // Reject rails/lights/small facade trim; retain structural mass.
                        if(hx<30||hy<28||hd<14)return;
                        if(Math.abs(cx)>520||cy<-360||cy>380)return;
                        // An enormous aggregate box can hide real internal openings.
                        // Smaller child masses make much more faithful building physics.
                        if(hx>430||hy>360||hd>500)return;

                        // Pull the collider well inside the rendered mesh. This avoids
                        // the old "invisible box" feeling at rotated/irregular edges.
                        hx=Math.min(215,hx*.72);
                        hy=Math.min(205,hy*.72);
                        hd=Math.min(230,hd*.72);
                        if(hx<22||hy<22||hd<10)return;

                        const pass=map2BuildingPassageAt(d);
                        const passageHalfX=48,passageHalfY=42;
                        const blocksPassage=
                            Math.abs(cx-pass.x)<hx+passageHalfX&&
                            Math.abs(cy-pass.y)<hy+passageHalfY;
                        if(blocksPassage)return;

                        const roadOverlap=Math.max(0,360-(Math.abs(cx)-hx));
                        if(roadOverlap<=25)return;
                        const volume=hx*hy*hd;
                        candidates.push({
                            routeProgress:d,laneX:cx,laneY:cy,
                            halfX:hx,halfY:hy,halfDepth:hd,
                            mesh,root,score:volume*(1+roadOverlap/360),
                            passageX:pass.x,passageY:pass.y
                        });
                    });
                }

                // At most two real building masses in each 420 m slice. This keeps
                // the route difficult and three-dimensional without turning it into
                // an accidental solid wall or thousands of tiny collision checks.
                const bins=new Map();
                for(const c of candidates){
                    const key=Math.floor(c.routeProgress/420);
                    if(!bins.has(key))bins.set(key,[]);
                    bins.get(key).push(c);
                }
                const selected=[];
                for(const arr of bins.values()){
                    arr.sort((a,b)=>b.score-a.score);
                    const first=arr[0];
                    if(first)selected.push(first);
                    const second=arr.find(c=>c!==first&&(
                        Math.sign(c.laneX)!==Math.sign(first.laneX)||
                        Math.abs(c.laneY-first.laneY)>130
                    ));
                    if(second)selected.push(second);
                }
                selected.sort((a,b)=>a.routeProgress-b.routeProgress);

                const physical=[];
                for(const c of selected){
                    const obstacle={
                        routeProgress:c.routeProgress,
                        laneX:c.laneX,laneY:c.laneY,
                        halfX:c.halfX,halfY:c.halfY,halfDepth:c.halfDepth,
                        radius:Math.hypot(c.halfX,c.halfY,c.halfDepth),
                        mesh:c.mesh,
                        type:'WRECK_BOX',moveType:'STATIC',active:true,
                        touchingShips:new Set(),hitTimes:new Map(),
                        map2BuildingDerived:true,
                        sourceRoot:c.root.name,
                        passageX:c.passageX,passageY:c.passageY
                    };
                    map2Obstacles.push(obstacle);
                    physical.push(obstacle);
                    c.mesh.userData.map2PhysicalBuilding=true;
                    c.mesh.userData.map2BuildingCollider=true;
                }
                window.starbladeMap2BuildingColliders=physical;
                const centre=physical.filter(o=>Math.abs(o.laneX)<=150).length;
                const overhead=physical.filter(o=>o.laneY>110).length;
                map2VisualStageStats.map4BuildingColliders=physical.length;
                map2VisualStageStats.map4BuildingColliderBins=bins.size;
                map2VisualStageStats.map4BuildingCenterBlocks=centre;
                map2VisualStageStats.map4BuildingSideBlocks=physical.length-centre;
                map2VisualStageStats.map4BuildingOverheads=overhead;
                return physical;
            };

            // MAP2-08: build an actual industrial district around the physical gates."""
if anchor not in s:
    raise SystemExit("MAP2-18 helper anchor not found")
s=s.replace(anchor,insert,1)

call_anchor="""            // Paste all 985 meshes from the final Map4 industrial visual group once.
            map2CloneExactMap4IndustrialVisualParts();"""
call_new=call_anchor+"""

            // MAP2-18: after every real Map4 building is in its final Map2 position,
            // derive gameplay collision from the visible structural masses.
            map2BuildPhysicalMap4BuildingObstacles();"""
if call_anchor not in s:
    raise SystemExit("MAP2-18 call anchor not found")
s=s.replace(call_anchor,call_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-18 real-building obstacle/chokepoint patch applied")
