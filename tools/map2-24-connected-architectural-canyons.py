from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

if "MAP2-24: connected architectural canyons" in s:
    print("MAP2-24 already applied")
    raise SystemExit(0)

stats_anchor="architecturalFacingPairs:0"
stats_new="architecturalFacingPairs:0,canyonLinkedTransitions:0,canyonShiftedTransitions:0,canyonMaxLaneShift:0,canyonPredictedMaxJumpBefore:0,canyonPredictedMaxJumpAfter:0"
if stats_anchor not in s:
    raise SystemExit("MAP2-24 stats anchor missing")
s=s.replace(stats_anchor,stats_new,1)

anchor="""            const map2AlignArchitecturalHandoffs=()=>{"""
insert=r"""            // MAP2-24: connected architectural canyons.
            // MAP2-22 inserted a real W05 building between each pair of authored
            // complexes. This pass moves ONLY those transition shells onto the
            // corridor midpoint between their two neighbouring real openings.
            // Macro sequence swings stay intact because core buildings never move.
            const map2LinkTransitionCanyons=()=>{
                const groups=map2LogicalBuildingGroups()
                    .map(entry=>({...entry,hint:map2ArchitecturalLaneHint(entry)}))
                    .filter(entry=>map2Segment(entry.d).kind==='TECH')
                    .sort((a,b)=>a.d-b.d);

                let linked=0,shifted=0,maxShift=0,maxBefore=0,maxAfter=0;
                const links=[];

                const isTransition=entry=>entry.roots.some(r=>r.userData?.map2TransitionRoadClone);

                for(let i=1;i<groups.length-1;i++){
                    const cur=groups[i];
                    if(!isTransition(cur))continue;
                    const prev=groups[i-1],next=groups[i+1];
                    if(isTransition(prev)||isTransition(next))continue;
                    if(map2Segment(prev.d).kind!=='TECH'||map2Segment(next.d).kind!=='TECH')continue;

                    const beforeA=Math.hypot(cur.hint.x-prev.hint.x,cur.hint.y-prev.hint.y);
                    const beforeB=Math.hypot(next.hint.x-cur.hint.x,next.hint.y-cur.hint.y);
                    maxBefore=Math.max(maxBefore,beforeA,beforeB);

                    // Exact midpoint is the architectural handoff spine. Keep only
                    // a tiny alternating offset so adjacent W05 shells do not read
                    // as mechanically copy-pasted.
                    const coreSpan=Math.abs(next.hint.x-prev.hint.x);
                    const bias=coreSpan>150?0:((linked%3)-1)*10;
                    const targetX=THREE.MathUtils.clamp((prev.hint.x+next.hint.x)*.5+bias,-128,128);
                    const targetY=THREE.MathUtils.clamp((prev.hint.y+next.hint.y)*.5,-132,72);
                    const dx=targetX-cur.hint.x;
                    const dy=targetY-cur.hint.y;
                    const shift=Math.hypot(dx,dy);

                    if(shift>1){
                        map2MoveRouteBuildingGroup(cur.roots,cur.d,dx,dy);
                        shifted++;
                        maxShift=Math.max(maxShift,shift);
                    }
                    for(const root of cur.roots){
                        root.userData.map2SequenceLaneX=targetX;
                        root.userData.map2SequenceLaneY=targetY;
                        root.userData.map2CanyonLinked=true;
                        root.userData.map2CanyonPrevDistance=prev.d;
                        root.userData.map2CanyonNextDistance=next.d;
                    }
                    cur.hint={x:targetX,y:targetY};

                    const afterA=Math.hypot(targetX-prev.hint.x,targetY-prev.hint.y);
                    const afterB=Math.hypot(next.hint.x-targetX,next.hint.y-targetY);
                    maxAfter=Math.max(maxAfter,afterA,afterB);
                    links.push({
                        distance:cur.d,
                        prevDistance:prev.d,nextDistance:next.d,
                        beforeA,beforeB,afterA,afterB,
                        x:targetX,y:targetY,shift,
                        roots:cur.roots.map(r=>r.name)
                    });
                    linked++;
                }

                window.starbladeMap2ConnectedCanyons={
                    links,linked,shifted,maxShift,maxJumpBefore:maxBefore,maxJumpAfter:maxAfter
                };
                map2VisualStageStats.canyonLinkedTransitions=linked;
                map2VisualStageStats.canyonShiftedTransitions=shifted;
                map2VisualStageStats.canyonMaxLaneShift=maxShift;
                map2VisualStageStats.canyonPredictedMaxJumpBefore=maxBefore;
                map2VisualStageStats.canyonPredictedMaxJumpAfter=maxAfter;
                return links;
            };

            const map2AlignArchitecturalHandoffs=()=>{"""
if anchor not in s:
    raise SystemExit("MAP2-24 helper anchor missing")
s=s.replace(anchor,insert,1)

call_anchor="""            // MAP2-23: rotate complete real building shells toward the next opening.
            // This removes the parallel/roadside-building read and creates connected
            // architectural canyons without altering source geometry or materials.
            map2AlignArchitecturalHandoffs();

            // MAP2-19: after architectural orientation, re-scan each real shell and
            // place the route through its actual surviving opening.
            map2OrganizeBuildingsAsRoad();"""
call_new="""            // MAP2-24: pull each real W05 handoff shell onto the midpoint corridor
            // between its two neighbouring core complexes. Core buildings stay put,
            // so authored macro turns survive while micro-gaps become one canyon.
            map2LinkTransitionCanyons();

            // MAP2-23: rotate complete real building shells toward the next opening.
            // This removes the parallel/roadside-building read and creates connected
            // architectural canyons without altering source geometry or materials.
            map2AlignArchitecturalHandoffs();

            // MAP2-19: after canyon linking + architectural orientation, re-scan each
            // real shell and place the route through its actual surviving opening.
            map2OrganizeBuildingsAsRoad();"""
if call_anchor not in s:
    raise SystemExit("MAP2-24 call anchor missing")
s=s.replace(call_anchor,call_new,1)

toe_anchor="if(i<chain.length-1&&Math.abs(localDx)>=55){"
if toe_anchor not in s:
    raise SystemExit("MAP2-24 toe-in anchor missing")
s=s.replace(toe_anchor,"if(i<chain.length-1&&Math.abs(localDx)>=35){",1)

yaw_anchor="let yaw=Math.atan2(dx,dd)*1.90;"
if yaw_anchor not in s:
    raise SystemExit("MAP2-24 yaw response anchor missing")
s=s.replace(yaw_anchor,"let yaw=Math.atan2(dx,dd)*2.15;",1)

p.write_text(s,encoding="utf-8")
print("MAP2-24 connected architectural canyons applied")
