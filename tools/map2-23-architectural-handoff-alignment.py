from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

if "MAP2-23: architectural handoff alignment" in s:
    print("MAP2-23 already applied")
    raise SystemExit(0)

stats_anchor="transitionMaxGapAfter:0"
stats_new="transitionMaxGapAfter:0,architecturalAlignedGroups:0,architecturalYawTurns:0,architecturalMaxYawDeg:0,architecturalFacingPairs:0"
if stats_anchor not in s:
    raise SystemExit("MAP2-23 stats anchor missing")
s=s.replace(stats_anchor,stats_new,1)

anchor="""            const map2OrganizeBuildingsAsRoad=()=>{"""
insert=r"""            // MAP2-23: architectural handoff alignment.
            // Buildings no longer only occupy the correct route positions; their
            // complete authored shells are yawed toward the next real opening so
            // entrances, canyons and underpasses visually hand the player forward.
            const map2RotateBuildingGroupAroundRoute=(entry,yaw)=>{
                if(Math.abs(yaw)<.002)return 0;
                const pivot=map2FrameMatrix(entry.d,0,0);
                const delta=pivot.clone()
                    .multiply(new THREE.Matrix4().makeRotationY(yaw))
                    .multiply(pivot.clone().invert());

                for(const root of entry.roots){
                    root.parent?.updateMatrixWorld(true);
                    root.updateMatrixWorld(true);
                    const newWorld=delta.clone().multiply(root.matrixWorld);
                    const parent=root.parent;
                    const local=parent.matrixWorld.clone().invert().multiply(newWorld);
                    local.decompose(root.position,root.quaternion,root.scale);
                    root.matrixAutoUpdate=true;
                    root.updateMatrix();
                    root.updateMatrixWorld(true);
                    root.userData.map2ArchitecturalAligned=true;
                    root.userData.map2ArchitecturalYaw=yaw;
                }
                return Math.abs(yaw);
            };

            const map2ArchitecturalLaneHint=(entry)=>{
                const root=entry.roots.find(r=>
                    Number.isFinite(r.userData?.map2SequenceLaneX)&&
                    Number.isFinite(r.userData?.map2SequenceLaneY)
                );
                return {
                    x:root?.userData?.map2SequenceLaneX||0,
                    y:root?.userData?.map2SequenceLaneY??-55
                };
            };

            const map2AlignArchitecturalHandoffs=()=>{
                const groups=map2LogicalBuildingGroups()
                    .map(entry=>({...entry,hint:map2ArchitecturalLaneHint(entry)}))
                    .filter(entry=>map2Segment(entry.d).kind==='TECH')
                    .sort((a,b)=>a.d-b.d);

                let aligned=0,yawTurns=0,maxYaw=0,facingPairs=0;
                const records=[];

                for(const seg of MAP2_SEGMENTS.filter(s=>s.kind==='TECH')){
                    const from=seg.from*MAP2_DISTANCE,to=seg.to*MAP2_DISTANCE;
                    const chain=groups.filter(g=>g.d>=from&&g.d<=to).sort((a,b)=>a.d-b.d);
                    for(let i=0;i<chain.length;i++){
                        const cur=chain[i];
                        const prev=chain[Math.max(0,i-1)];
                        const next=chain[Math.min(chain.length-1,i+1)];
                        const dd=Math.max(1,next.d-prev.d);
                        const dx=next.hint.x-prev.hint.x;

                        // The route-local heading points the architecture toward the
                        // next opening. Clamp to keep buildings believable/upright.
                        let yaw=Math.atan2(dx,dd)*1.55;
                        yaw=THREE.MathUtils.clamp(yaw,-THREE.MathUtils.degToRad(18),THREE.MathUtils.degToRad(18));

                        // On strong side-to-side handoffs, toe the two neighbouring
                        // shells slightly toward one another. This creates readable
                        // street/factory canyon relationships instead of parallel rows.
                        const localDx=next.hint.x-cur.hint.x;
                        const localDd=Math.max(1,next.d-cur.d);
                        const localHeading=Math.atan2(localDx,localDd);
                        if(i<chain.length-1&&Math.abs(localDx)>=70){
                            yaw=THREE.MathUtils.clamp(
                                yaw+localHeading*.32,
                                -THREE.MathUtils.degToRad(20),
                                THREE.MathUtils.degToRad(20)
                            );
                            facingPairs++;
                        }

                        const magnitude=map2RotateBuildingGroupAroundRoute(cur,yaw);
                        if(magnitude>.002){
                            aligned++;
                            if(magnitude>=THREE.MathUtils.degToRad(4))yawTurns++;
                            maxYaw=Math.max(maxYaw,magnitude);
                        }
                        for(const root of cur.roots){
                            root.userData.map2ArchitecturalFacingX=next.hint.x;
                            root.userData.map2ArchitecturalFacingDistance=next.d;
                        }
                        records.push({
                            distance:cur.d,x:cur.hint.x,y:cur.hint.y,yaw,
                            roots:cur.roots.map(r=>r.name),
                            transition:cur.roots.some(r=>r.userData?.map2TransitionRoadClone)
                        });
                    }
                }

                window.starbladeMap2ArchitecturalAlignment={
                    groups:records,
                    aligned,
                    yawTurns,
                    maxYawDeg:THREE.MathUtils.radToDeg(maxYaw),
                    facingPairs
                };
                map2VisualStageStats.architecturalAlignedGroups=aligned;
                map2VisualStageStats.architecturalYawTurns=yawTurns;
                map2VisualStageStats.architecturalMaxYawDeg=THREE.MathUtils.radToDeg(maxYaw);
                map2VisualStageStats.architecturalFacingPairs=facingPairs;
                return records;
            };

            const map2OrganizeBuildingsAsRoad=()=>{"""
if anchor not in s:
    raise SystemExit("MAP2-23 helper anchor missing")
s=s.replace(anchor,insert,1)

call_anchor="""            // MAP2-22: insert genuine Map4 stations between adjacent authored
            // building beats so the visible road hands off building-to-building.
            map2AddTransitionBuildingHandoffs();

            // MAP2-19: now discover and align the real hole inside every major and
            // transition complex. The resulting aperture sequence is the visible road.
            map2OrganizeBuildingsAsRoad();"""
call_new="""            // MAP2-22: insert genuine Map4 stations between adjacent authored
            // building beats so the visible road hands off building-to-building.
            map2AddTransitionBuildingHandoffs();

            // MAP2-23: rotate complete real building shells toward the next opening.
            // This removes the parallel/roadside-building read and creates connected
            // architectural canyons without altering source geometry or materials.
            map2AlignArchitecturalHandoffs();

            // MAP2-19: after architectural orientation, re-scan each real shell and
            // place the route through its actual surviving opening.
            map2OrganizeBuildingsAsRoad();"""
if call_anchor not in s:
    raise SystemExit("MAP2-23 call anchor missing")
s=s.replace(call_anchor,call_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-23 architectural handoff alignment applied")
