from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

stats_anchor="map4BuildingOverheads:0"
stats_new="map4BuildingOverheads:0,routeBuildingGroups:0,routeBuildingShells:0,routeBuildingApertures:0,routeBuildingShifted:0,routeBuildingMaxShift:0,routeBuildingFramedApertures:0"
if stats_anchor not in s:
    raise SystemExit("MAP2-19 stats anchor not found")
s=s.replace(stats_anchor,stats_new,1)

pass_anchor="""            const map2BuildingPassageAt=(d)=>{
                if(!map2Gates.length)return {x:0,y:-60};"""
pass_new="""            const map2BuildingPassageAt=(d)=>{
                // MAP2-19: once building apertures have been organized, THEY are
                // the route. The old centre spline remains progress math only.
                const road=window.starbladeMap2BuildingRoad;
                if(road?.knots?.length){
                    const knots=road.knots;
                    if(d<=knots[0].distance)return {x:knots[0].x,y:knots[0].y};
                    if(d>=knots[knots.length-1].distance){
                        const k=knots[knots.length-1];
                        return {x:k.x,y:k.y};
                    }
                    let hi=1;
                    while(hi<knots.length&&knots[hi].distance<d)hi++;
                    const a=knots[hi-1],b=knots[hi];
                    const t=THREE.MathUtils.clamp((d-a.distance)/Math.max(1,b.distance-a.distance),0,1);
                    const smooth=t*t*(3-2*t);
                    return {
                        x:THREE.MathUtils.lerp(a.x,b.x,smooth),
                        y:THREE.MathUtils.lerp(a.y,b.y,smooth)
                    };
                }
                if(!map2Gates.length)return {x:0,y:-60};"""
if pass_anchor not in s:
    raise SystemExit("MAP2-19 passage override anchor not found")
s=s.replace(pass_anchor,pass_new,1)

anchor="""            const map2BuildPhysicalMap4BuildingObstacles=()=>{"""
insert=r"""            // MAP2-19: BUILDINGS ARE THE ROAD.
            // The hidden route spline is now only a technical progress backbone.
            // In TECH sectors the visible/traversable course is defined by real
            // openings inside the copied Map4 architecture itself.
            const map2BuildingRoadSampleXs=Array.from({length:21},(_,i)=>-700+i*70);
            const map2BuildingRoadSampleYs=Array.from({length:11},(_,i)=>-250+i*47);

            const map2CollectRouteSolids=(roots,d)=>{
                const solids=[];
                for(const root of roots){
                    root.updateMatrixWorld(true);
                    root.traverse(mesh=>{
                        if(!mesh.isMesh||mesh.isInstancedMesh||!mesh.visible)return;
                        const box=new THREE.Box3().setFromObject(mesh);
                        if(box.isEmpty())return;
                        const q=map2ProjectedBoxAt(box,d);
                        const hx=(q.maxX-q.minX)*.5;
                        const hy=(q.maxY-q.minY)*.5;
                        const hd=(q.maxZ-q.minZ)*.5;
                        // Ignore antennae, lights and facade trim. Route apertures
                        // are determined only by masses that can read as architecture.
                        if(hx<25||hy<24||hd<10)return;
                        if(q.maxZ<-420||q.minZ>420)return;
                        solids.push(q);
                    });
                }
                return solids;
            };

            const map2FindBuildingRoadAperture=(roots,d,preferred)=>{
                const solids=map2CollectRouteSolids(roots,d);
                const candidates=[];
                for(const x of map2BuildingRoadSampleXs){
                    for(const y of map2BuildingRoadSampleYs){
                        let blocked=false;
                        for(const q of solids){
                            const zOverlap=q.maxZ>=-255&&q.minZ<=255;
                            const xyOverlap=
                                x+42>=q.minX&&x-42<=q.maxX&&
                                y+36>=q.minY&&y-36<=q.maxY;
                            if(zOverlap&&xyOverlap){blocked=true;break;}
                        }
                        if(blocked)continue;

                        // An empty point is not enough. Prefer holes that are visibly
                        // framed by architecture: opposing walls, floor+ceiling, or a
                        // wall combined with overhead/underpass mass. This is what
                        // makes the building itself read as the road.
                        const zSolids=solids.filter(q=>q.maxZ>=-320&&q.minZ<=320);
                        const left=zSolids.some(q=>
                            q.maxX<=x-42&&x-q.maxX<360&&
                            q.maxY>=y-170&&q.minY<=y+170);
                        const right=zSolids.some(q=>
                            q.minX>=x+42&&q.minX-x<360&&
                            q.maxY>=y-170&&q.minY<=y+170);
                        const above=zSolids.some(q=>
                            q.minY>=y+36&&q.minY-y<300&&
                            q.maxX>=x-240&&q.minX<=x+240);
                        const below=zSolids.some(q=>
                            q.maxY<=y-36&&y-q.maxY<300&&
                            q.maxX>=x-240&&q.minX<=x+240);
                        const framed=(left&&right)||(above&&below)||((left||right)&&(above||below));
                        const directional=(left?1:0)+(right?1:0)+(above?1:0)+(below?1:0);

                        // The preferred point only controls continuity between
                        // complexes. Framing dominates the score so a wide empty
                        // courtyard never beats a real hangar/canyon/underpass.
                        const dx=x-preferred.x,dy=y-preferred.y;
                        const centreBias=Math.abs(x)*.035+Math.abs(y+55)*.02;
                        const framePenalty=framed?0:(directional>=2?110:directional===1?230:420);
                        candidates.push({x,y,left,right,above,below,framed,directional,
                            score:framePenalty+Math.hypot(dx,dy*.72)+centreBias});
                    }
                }
                candidates.sort((a,b)=>a.score-b.score);
                return {aperture:candidates[0]||null,solids:solids.length,choices:candidates.length};
            };

            const map2MoveRouteBuildingGroup=(roots,d,dx,dy)=>{
                const frame=getRaceFrameAtDistance(d);
                const worldDelta=frame.right.clone().multiplyScalar(dx)
                    .addScaledVector(frame.up,dy);
                for(const root of roots){
                    if(!root.parent)continue;
                    root.parent.updateMatrixWorld(true);
                    root.updateMatrixWorld(true);
                    const worldPos=root.getWorldPosition(new THREE.Vector3()).add(worldDelta);
                    root.position.copy(root.parent.worldToLocal(worldPos));
                    root.updateMatrix();
                    root.updateMatrixWorld(true);
                    root.userData.map2BuildingIsRoad=true;
                    root.userData.map2RoadShiftX=(root.userData.map2RoadShiftX||0)+dx;
                    root.userData.map2RoadShiftY=(root.userData.map2RoadShiftY||0)+dy;
                }
            };

            const map2OrganizeBuildingsAsRoad=()=>{
                const all=map2ExactBuildingRoots()
                    .filter(root=>{
                        const d=Number(root.userData?.map2TargetDistance);
                        return Number.isFinite(d)&&map2Segment(d).kind==='TECH';
                    });

                // The 67 industrial source children belong to five authored Map4
                // complexes. Keep each complex together; do not scatter its parts.
                const industrialChunks=new Map();
                const groups=[];
                for(const root of all){
                    if(root.userData?.map2ExactMap4IndustrialVisualPart){
                        const k=Number(root.userData.sourceChunk)||0;
                        if(!industrialChunks.has(k))industrialChunks.set(k,[]);
                        industrialChunks.get(k).push(root);
                    }else{
                        groups.push([root]);
                    }
                }
                for(const roots of industrialChunks.values())groups.push(roots);

                const records=[];
                let shifted=0,maxShift=0,shells=0,apertures=0,framedApertures=0;
                groups.sort((a,b)=>{
                    const ad=a.reduce((n,r)=>n+Number(r.userData.map2TargetDistance),0)/a.length;
                    const bd=b.reduce((n,r)=>n+Number(r.userData.map2TargetDistance),0)/b.length;
                    return ad-bd;
                });

                let previous={x:0,y:-55};
                for(const roots of groups){
                    const d=roots.reduce((n,r)=>n+Number(r.userData.map2TargetDistance),0)/roots.length;
                    if(map2Segment(d).kind!=='TECH')continue;

                    // The target is only a continuity hint. First inspect the real
                    // complex and discover an actual pilot-sized hole.
                    const preferred=map2BuildingPassageAt(d);
                    const continuity={
                        x:THREE.MathUtils.lerp(preferred.x,previous.x,.38),
                        y:THREE.MathUtils.lerp(preferred.y,previous.y,.38)
                    };
                    const found=map2FindBuildingRoadAperture(roots,d,continuity);
                    if(!found.aperture){
                        records.push({d,roots:roots.length,open:false,solids:found.solids,rootNames:roots.map(r=>r.name)});
                        continue;
                    }

                    // Align the discovered real hole with the hidden navigation
                    // backbone. The architecture moves; its geometry is untouched.
                    // This is the key inversion from "buildings beside a road" to
                    // "the hole inside the building IS the road".
                    const routeTarget={
                        x:THREE.MathUtils.clamp(continuity.x,-145,145),
                        y:THREE.MathUtils.clamp(continuity.y,-145,95)
                    };
                    const dx=routeTarget.x-found.aperture.x;
                    const dy=routeTarget.y-found.aperture.y;
                    const shift=Math.hypot(dx,dy);
                    if(shift>1){
                        map2MoveRouteBuildingGroup(roots,d,dx,dy);
                        shifted++;
                        maxShift=Math.max(maxShift,shift);
                    }

                    for(const root of roots){
                        root.userData.map2BuildingIsRoad=true;
                        root.userData.map2RoadApertureX=routeTarget.x;
                        root.userData.map2RoadApertureY=routeTarget.y;
                        root.userData.map2RoadApertureSourceX=found.aperture.x;
                        root.userData.map2RoadApertureSourceY=found.aperture.y;
                    }
                    shells+=roots.length;
                    apertures++;
                    if(found.aperture.framed)framedApertures++;
                    previous=routeTarget;
                    records.push({
                        d,roots:roots.length,open:true,solids:found.solids,
                        rootNames:roots.map(r=>r.name),
                        sourceX:found.aperture.x,sourceY:found.aperture.y,
                        framed:!!found.aperture.framed,
                        x:routeTarget.x,y:routeTarget.y,shift
                    });
                }

                // Building apertures are the visible course knots. Other systems can
                // query these without treating the old centre spline as visible road.
                const knots=records.filter(r=>r.open)
                    .map(r=>({distance:r.d,x:r.x,y:r.y}))
                    .sort((a,b)=>a.distance-b.distance);
                window.starbladeMap2BuildingRoad={
                    groups:records,
                    knots,
                    techOnly:true,
                    philosophy:'BUILDINGS_ARE_THE_ROAD'
                };

                map2VisualStageStats.routeBuildingGroups=records.length;
                map2VisualStageStats.routeBuildingShells=shells;
                map2VisualStageStats.routeBuildingApertures=apertures;
                map2VisualStageStats.routeBuildingShifted=shifted;
                map2VisualStageStats.routeBuildingMaxShift=maxShift;
                map2VisualStageStats.routeBuildingFramedApertures=framedApertures;
                return records;
            };

            const map2BuildPhysicalMap4BuildingObstacles=()=>{"""
if anchor not in s:
    raise SystemExit("MAP2-19 organizer anchor not found")
s=s.replace(anchor,insert,1)

call_anchor="""            // MAP2-18: only after all authored gates and original physical solids
            // exist, derive collision directly from the visible Map4 building meshes.
            // This ordering lets the real buildings act as obstacles without
            // accidentally sealing the intended gate apertures.
            map2BuildPhysicalMap4BuildingObstacles();"""
call_new="""            // MAP2-19: first make the copied architecture itself form the TECH road.
            // Only after those complete building groups are aligned by their real
            // apertures do we derive collision from their visible masses.
            map2OrganizeBuildingsAsRoad();

            // MAP2-18: only after all authored gates and original physical solids
            // exist, derive collision directly from the visible Map4 building meshes.
            // This ordering lets the real buildings act as obstacles without
            // accidentally sealing the intended gate apertures.
            map2BuildPhysicalMap4BuildingObstacles();"""
if call_anchor not in s:
    raise SystemExit("MAP2-19 call anchor not found")
s=s.replace(call_anchor,call_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-19 building-as-road organizer applied")
