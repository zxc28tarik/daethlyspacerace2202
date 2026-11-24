from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

if "MAP2-22: transition building handoffs" in s:
    print("MAP2-22 already applied")
    raise SystemExit(0)

stats_anchor="sequenceVerticalSwings:0"
stats_new="sequenceVerticalSwings:0,transitionBuildingClones:0,transitionBuildingKnots:0,transitionMaxGapBefore:0,transitionMaxGapAfter:0"
if stats_anchor not in s:
    raise SystemExit("MAP2-22 stats anchor missing")
s=s.replace(stats_anchor,stats_new,1)

anchor="""            const map2OrganizeBuildingsAsRoad=()=>{"""
insert=r"""            // MAP2-22: transition building handoffs.
            // The authored MAP2-21 complexes remain the major beats, but one extra
            // genuine Map4 W05 station is inserted between adjacent beats inside
            // each sequence. This halves the empty flight between real buildings.
            const map2TransitionSafeDistance=(a,b,seed=0)=>{
                const lo=a+(b-a)*.32,hi=a+(b-a)*.68;
                let best=(a+b)*.5,bestClear=-Infinity;
                for(let i=0;i<=8;i++){
                    const t=i/8;
                    const d=THREE.MathUtils.lerp(lo,hi,t);
                    if(map2Segment(d).kind!=='TECH')continue;
                    const gateClear=map2Gates.length
                        ? Math.min(...map2Gates.map(g=>Math.abs(g.distance-d)))
                        : 99999;
                    const edgeClear=Math.min(d-a,b-d);
                    // Prefer positions away from existing authored gate collision,
                    // then favour the midpoint for even visual cadence.
                    const score=Math.min(gateClear,900)+edgeClear*.20-Math.abs(t-.5)*35+(seed%3)*.01;
                    if(score>bestClear){bestClear=score;best=d;}
                }
                return best;
            };

            const map2AddTransitionBuildingHandoffs=()=>{
                const authored=window.starbladeMap2AuthoredSequences;
                if(!authored?.plan?.length)return [];
                const transitions=[];
                let ordinal=0,maxBefore=0;

                for(const range of authored.plan){
                    const slots=range.slots.slice().sort((a,b)=>a.distance-b.distance);
                    for(let i=0;i<slots.length-1;i++){
                        const a=slots[i],b=slots[i+1];
                        // Do not bridge two named sequences with an artificial beat.
                        // Sequence boundaries stay readable as major transitions.
                        if(a.sequence!==b.sequence)continue;
                        const gap=b.distance-a.distance;
                        maxBefore=Math.max(maxBefore,gap);
                        const d=map2TransitionSafeDistance(a.distance,b.distance,ordinal);
                        if(map2Segment(d).kind!=='TECH')continue;

                        const midpointX=(a.x+b.x)*.5;
                        const midpointY=(a.y+b.y)*.5;
                        const lateralKick=((ordinal+range.rangeIndex)%2?1:-1)*24;
                        const verticalKick=(ordinal%3===1?-14:(ordinal%3===2?12:0));
                        const x=THREE.MathUtils.clamp(midpointX+lateralKick,-132,132);
                        const y=THREE.MathUtils.clamp(midpointY+verticalKick,-138,72);

                        // This is an actual final Map4 W05 station clone, not a box
                        // or procedural obstacle. The existing source geometry and
                        // materials are reused exactly.
                        const sourceIndex=(ordinal*3+range.rangeIndex*2)%6;
                        const clone=map2CloneExactMap4Station(sourceIndex,d,x,y);
                        clone.name=clone.name+'_HANDOFF_'+ordinal;
                        clone.userData.map2TransitionRoadClone=true;
                        clone.userData.map2TransitionFrom=a.sequence;
                        clone.userData.map2TransitionOrdinal=ordinal;
                        clone.userData.map2SequenceLaneX=x;
                        clone.userData.map2SequenceLaneY=y;
                        clone.traverse(o=>{
                            o.userData.map2TransitionRoadClone=true;
                            o.userData.map2TransitionOrdinal=ordinal;
                        });
                        transitions.push({distance:d,x,y,sourceIndex,sequence:a.sequence,name:clone.name});
                        ordinal++;
                    }
                }

                window.starbladeMap2TransitionBuildings=transitions;
                map2VisualStageStats.transitionBuildingClones=transitions.length;
                map2VisualStageStats.transitionMaxGapBefore=maxBefore;
                return transitions;
            };

            const map2OrganizeBuildingsAsRoad=()=>{"""
if anchor not in s:
    raise SystemExit("MAP2-22 helper anchor missing")
s=s.replace(anchor,insert,1)

old_closed="""                        records.push({d,roots:roots.length,open:false,solids:found.solids,rootNames:roots.map(r=>r.name)});"""
new_closed="""                        records.push({
                            d,roots:roots.length,open:false,solids:found.solids,
                            transition:roots.some(r=>r.userData?.map2TransitionRoadClone),
                            rootNames:roots.map(r=>r.name)
                        });"""
if old_closed not in s:
    raise SystemExit("MAP2-22 closed record anchor missing")
s=s.replace(old_closed,new_closed,1)

old_open="""                        rootNames:roots.map(r=>r.name),
                        sequence:roots[0]?.userData?.map2SequenceName||null,"""
new_open="""                        rootNames:roots.map(r=>r.name),
                        transition:roots.some(r=>r.userData?.map2TransitionRoadClone),
                        sequence:roots[0]?.userData?.map2SequenceName||null,"""
if old_open not in s:
    raise SystemExit("MAP2-22 open record anchor missing")
s=s.replace(old_open,new_open,1)

old_road="""                window.starbladeMap2BuildingRoad={
                    groups:records,
                    knots,
                    techOnly:true,
                    philosophy:'BUILDINGS_ARE_THE_ROAD'
                };

                map2VisualStageStats.routeBuildingGroups=records.length;"""
new_road="""                const coreKnots=records.filter(r=>r.open&&!r.transition)
                    .map(r=>({distance:r.d,x:r.x,y:r.y}))
                    .sort((a,b)=>a.distance-b.distance);
                const transitionKnots=records.filter(r=>r.open&&r.transition)
                    .map(r=>({distance:r.d,x:r.x,y:r.y}))
                    .sort((a,b)=>a.distance-b.distance);

                window.starbladeMap2BuildingRoad={
                    groups:records,
                    knots,
                    coreKnots,
                    transitionKnots,
                    techOnly:true,
                    philosophy:'BUILDINGS_ARE_THE_ROAD'
                };

                let transitionMaxGapAfter=0;
                for(const seg of MAP2_SEGMENTS.filter(s=>s.kind==='TECH')){
                    const from=seg.from*MAP2_DISTANCE,to=seg.to*MAP2_DISTANCE;
                    const ks=knots.filter(k=>k.distance>=from&&k.distance<=to);
                    let prev=from;
                    for(const k of ks){transitionMaxGapAfter=Math.max(transitionMaxGapAfter,k.distance-prev);prev=k.distance;}
                    transitionMaxGapAfter=Math.max(transitionMaxGapAfter,to-prev);
                }

                map2VisualStageStats.transitionBuildingKnots=transitionKnots.length;
                map2VisualStageStats.transitionMaxGapAfter=transitionMaxGapAfter;
                map2VisualStageStats.routeBuildingGroups=records.length;"""
if old_road not in s:
    raise SystemExit("MAP2-22 road metadata anchor missing")
s=s.replace(old_road,new_road,1)

call_anchor="""            // MAP2-19: now discover and align the real hole inside each sequenced
            // complex. The resulting aperture sequence is the visible road.
            map2OrganizeBuildingsAsRoad();"""
call_new="""            // MAP2-22: insert genuine Map4 stations between adjacent authored
            // building beats so the visible road hands off building-to-building.
            map2AddTransitionBuildingHandoffs();

            // MAP2-19: now discover and align the real hole inside every major and
            // transition complex. The resulting aperture sequence is the visible road.
            map2OrganizeBuildingsAsRoad();"""
if call_anchor not in s:
    raise SystemExit("MAP2-22 call anchor missing")
s=s.replace(call_anchor,call_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-22 transition building handoffs applied")
