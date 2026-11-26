from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

if "MAP2-20: compact existing real building groups into continuous TECH chains" in s:
    print("MAP2-20 already applied")
    raise SystemExit(0)

stats_anchor="routeBuildingFramedApertures:0"
stats_new="routeBuildingFramedApertures:0,chainCompactedGroups:0,chainLongitudinalMoves:0,chainMaxShift:0,chainMaxGapBefore:0,chainMaxGapAfter:0"
if stats_anchor not in s:
    raise SystemExit("MAP2-20 stats anchor not found")
s=s.replace(stats_anchor,stats_new,1)

anchor="""            const map2OrganizeBuildingsAsRoad=()=>{"""
insert=r"""            // MAP2-20: compact existing real building groups into continuous TECH chains.
            // No new geometry is created. We re-space the already copied Map4
            // complexes longitudinally so one building opening hands the player
            // directly to the next instead of leaving multi-kilometre empty flights.
            const map2LogicalBuildingGroups=()=>{
                const all=map2ExactBuildingRoots()
                    .filter(root=>{
                        const d=Number(root.userData?.map2TargetDistance);
                        return Number.isFinite(d)&&map2Segment(d).kind==='TECH';
                    });
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
                return groups.map(roots=>({
                    roots,
                    d:roots.reduce((n,r)=>n+Number(r.userData.map2TargetDistance),0)/roots.length
                })).sort((a,b)=>a.d-b.d);
            };

            const map2MoveBuildingGroupAlongRoute=(entry,newD)=>{
                const oldD=entry.d;
                const shift=newD-oldD;
                if(Math.abs(shift)<1)return 0;

                // Transform the complete authored composition from its old route
                // frame into the new one. This rotates it with the curve instead of
                // merely sliding it through world space.
                const delta=map2FrameMatrix(newD,0,0)
                    .multiply(map2FrameMatrix(oldD,0,0).invert());

                for(const root of entry.roots){
                    root.parent?.updateMatrixWorld(true);
                    root.updateMatrixWorld(true);
                    const newWorld=delta.clone().multiply(root.matrixWorld);
                    const oldRootD=Number(root.userData.map2TargetDistance);
                    const newRootD=oldRootD+shift;
                    const newParent=sectionAt(newRootD);
                    newParent.updateMatrixWorld(true);
                    newParent.add(root);
                    const local=newParent.matrixWorld.clone().invert().multiply(newWorld);
                    local.decompose(root.position,root.quaternion,root.scale);
                    root.matrixAutoUpdate=true;
                    root.updateMatrix();
                    root.updateMatrixWorld(true);

                    root.userData.map2ChainCompacted=true;
                    root.userData.map2ChainOriginalDistance=
                        Number.isFinite(root.userData.map2ChainOriginalDistance)
                            ? root.userData.map2ChainOriginalDistance
                            : oldRootD;
                    root.userData.map2TargetDistance=newRootD;
                    if(Number.isFinite(root.userData.map2ChunkCenter))
                        root.userData.map2ChunkCenter+=shift;
                }
                entry.d=newD;
                return Math.abs(shift);
            };

            const map2RouteGroupGapStats=(groups,ranges)=>{
                let maxGap=0;
                const details=[];
                for(const range of ranges){
                    const inside=groups.filter(g=>g.d>=range.from&&g.d<=range.to)
                        .sort((a,b)=>a.d-b.d);
                    let prev=range.from;
                    for(const g of inside){
                        const gap=g.d-prev;
                        maxGap=Math.max(maxGap,gap);
                        details.push(gap);
                        prev=g.d;
                    }
                    const tail=range.to-prev;
                    maxGap=Math.max(maxGap,tail);
                    details.push(tail);
                }
                return {maxGap,details};
            };

            const map2CompactBuildingRoadChains=()=>{
                const groups=map2LogicalBuildingGroups();
                const ranges=MAP2_SEGMENTS.filter(s=>s.kind==='TECH').map(s=>({
                    from:s.from*MAP2_DISTANCE,
                    to:s.to*MAP2_DISTANCE
                }));
                const before=map2RouteGroupGapStats(groups,ranges);
                let moved=0,maxShift=0;

                for(const range of ranges){
                    const inside=groups.filter(g=>g.d>=range.from&&g.d<=range.to)
                        .sort((a,b)=>a.d-b.d);
                    if(!inside.length)continue;

                    // Keep a short readable entry/exit breath, then distribute every
                    // existing complex evenly. This produces ~1.9-2.2 km aperture
                    // cadence without duplicating a single building.
                    const margin=900;
                    const first=range.from+margin;
                    const last=range.to-margin;
                    inside.forEach((entry,i)=>{
                        const t=inside.length<=1?.5:i/(inside.length-1);
                        const target=THREE.MathUtils.lerp(first,last,t);
                        const shift=map2MoveBuildingGroupAlongRoute(entry,target);
                        if(shift>1){moved++;maxShift=Math.max(maxShift,shift);}
                    });
                }

                groups.sort((a,b)=>a.d-b.d);
                const after=map2RouteGroupGapStats(groups,ranges);
                window.starbladeMap2BuildingChainCompaction={
                    groups:groups.length,
                    moved,
                    maxShift,
                    maxGapBefore:before.maxGap,
                    maxGapAfter:after.maxGap,
                    ranges:ranges.map(r=>{
                        const inside=groups.filter(g=>g.d>=r.from&&g.d<=r.to).sort((a,b)=>a.d-b.d);
                        return {
                            from:r.from,to:r.to,count:inside.length,
                            distances:inside.map(g=>g.d)
                        };
                    })
                };
                map2VisualStageStats.chainCompactedGroups=groups.length;
                map2VisualStageStats.chainLongitudinalMoves=moved;
                map2VisualStageStats.chainMaxShift=maxShift;
                map2VisualStageStats.chainMaxGapBefore=before.maxGap;
                map2VisualStageStats.chainMaxGapAfter=after.maxGap;
                return groups;
            };

            const map2OrganizeBuildingsAsRoad=()=>{"""
if anchor not in s:
    raise SystemExit("MAP2-20 helper anchor not found")
s=s.replace(anchor,insert,1)

call_anchor="""            // MAP2-19: first make the copied architecture itself form the TECH road.
            // Only after those complete building groups are aligned by their real
            // apertures do we derive collision from their visible masses.
            map2OrganizeBuildingsAsRoad();"""
call_new="""            // MAP2-20: close the multi-kilometre gaps first. Existing Map4
            // complexes are re-spaced into two continuous TECH building chains.
            map2CompactBuildingRoadChains();

            // MAP2-19: now discover and align the real hole inside each re-spaced
            // complex. The resulting aperture sequence is the visible road.
            map2OrganizeBuildingsAsRoad();"""
if call_anchor not in s:
    raise SystemExit("MAP2-20 call anchor not found")
s=s.replace(call_anchor,call_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-20 continuous building-chain compaction applied")
