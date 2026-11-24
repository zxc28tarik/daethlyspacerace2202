from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

if "MAP2-21: authored building sequences" in s:
    print("MAP2-21 already applied")
    raise SystemExit(0)

stats_anchor="chainMaxGapAfter:0"
stats_new="chainMaxGapAfter:0,authoredSequences:0,sequenceReorderedGroups:0,sequenceLaneSwings:0,sequenceVerticalSwings:0"
if stats_anchor not in s:
    raise SystemExit("MAP2-21 stats anchor missing")
s=s.replace(stats_anchor,stats_new,1)

anchor="""            const map2OrganizeBuildingsAsRoad=()=>{"""
insert=r"""            // MAP2-21: authored building sequences.
            // MAP2-20 gave us continuous cadence. This pass gives that cadence
            // gameplay grammar: city canyon, factory slalom, low plant run,
            // spaceport run, corridor knife and launch exit.
            const map2SequenceTypeOf=(entry)=>{
                const names=entry.roots.map(r=>r.name).join('|');
                if(/CITY_DISTRICT/i.test(names))return 'CITY';
                if(/FINAL_CORRIDOR/i.test(names))return 'CORRIDOR';
                if(/INDUSTRIAL_PART/i.test(names))return 'INDUSTRIAL';
                if(/SPACEPORT|LAUNCH/i.test(names))return 'SPACEPORT';
                if(/REFINERY|FACTORY|POWER/i.test(names))return 'PLANT';
                if(/STONEGATE|OBSERVATION|OUTPOST/i.test(names))return 'LANDMARK';
                if(/W05_INDUSTRY_STATION/i.test(names))return 'STATION';
                return 'OTHER';
            };

            const map2AuthoredSequenceDefs=[
                [
                    {
                        name:'CITY_GATE',
                        types:['LANDMARK','CITY','STATION','INDUSTRIAL','LANDMARK','STATION','STATION','STATION'],
                        x:[-70,-105,-35,80,105,35,-70,-20],
                        y:[-55,-82,-72,-48,-62,-88,-64,-46]
                    },
                    {
                        name:'REFINERY_SLALOM',
                        types:['PLANT','STATION','STATION','INDUSTRIAL','STATION','PLANT','STATION','STATION'],
                        x:[85,112,35,-90,-118,-30,75,105],
                        y:[-24,-42,-68,-92,-58,-22,-48,-72]
                    },
                    {
                        name:'LOW_FACTORY_RUN',
                        types:['CITY','STATION','STATION','PLANT','STATION','INDUSTRIAL','STATION','STATION'],
                        x:[-45,45,105,42,-65,-115,-48,25],
                        y:[-112,-122,-96,-82,-114,-126,-88,-66]
                    },
                    {
                        name:'CITY_EXIT_CANYON',
                        types:['CITY','STATION','STATION','STATION','STATION','STATION','STATION','STATION'],
                        x:[72,22,-82,-108,-38,62,108,18],
                        y:[-54,-44,-62,-92,-76,-36,-52,-66]
                    }
                ],
                [
                    {
                        name:'OUTPOST_ENTRY',
                        types:['LANDMARK','STATION','CITY','STATION','INDUSTRIAL','STATION','STATION'],
                        x:[20,-72,-108,-42,58,102,28],
                        y:[-64,-82,-102,-72,-46,-62,-76]
                    },
                    {
                        name:'SPACEPORT_RUN',
                        types:['SPACEPORT','STATION','STATION','STATION','CITY','STATION','STATION'],
                        x:[-98,-48,22,88,112,52,-32],
                        y:[-34,-42,-56,-32,-22,-52,-72]
                    },
                    {
                        name:'CORRIDOR_KNIFE',
                        types:['CORRIDOR','STATION','INDUSTRIAL','STATION','STATION','STATION','STATION'],
                        x:[92,42,-72,-112,-62,38,92],
                        y:[-72,-98,-112,-82,-62,-46,-72]
                    },
                    {
                        name:'LAUNCH_EXIT',
                        types:['SPACEPORT','STATION','STATION','STATION','STATION','STATION','STATION'],
                        x:[-82,-22,62,108,48,-42,-98],
                        y:[-32,-46,-56,-26,-42,-62,-76]
                    }
                ]
            ];

            const map2ArrangeAuthoredBuildingSequences=()=>{
                const groups=map2LogicalBuildingGroups();
                const ranges=MAP2_SEGMENTS.filter(s=>s.kind==='TECH').map(s=>({
                    from:s.from*MAP2_DISTANCE,
                    to:s.to*MAP2_DISTANCE
                }));
                const plan=[];
                let reordered=0,laneSwings=0,verticalSwings=0;

                ranges.forEach((range,rangeIndex)=>{
                    const inside=groups.filter(g=>g.d>=range.from&&g.d<=range.to)
                        .sort((a,b)=>a.d-b.d);
                    const defs=map2AuthoredSequenceDefs[rangeIndex];
                    const expected=defs.flatMap(def=>def.types);
                    if(expected.length!==inside.length){
                        console.warn('MAP2-21 sequence/group mismatch',rangeIndex,expected.length,inside.length);
                        return;
                    }

                    const buckets=new Map();
                    for(const entry of inside){
                        const type=map2SequenceTypeOf(entry);
                        if(!buckets.has(type))buckets.set(type,[]);
                        buckets.get(type).push(entry);
                    }

                    const slots=[];
                    let slotIndex=0;
                    const margin=900;
                    const first=range.from+margin;
                    const last=range.to-margin;
                    defs.forEach((def,sequenceIndex)=>{
                        def.types.forEach((type,localIndex)=>{
                            const bucket=buckets.get(type)||[];
                            const entry=bucket.shift();
                            if(!entry){
                                console.warn('MAP2-21 missing type',type,'for',def.name);
                                return;
                            }
                            const t=inside.length<=1?.5:slotIndex/(inside.length-1);
                            const target=THREE.MathUtils.lerp(first,last,t);
                            const oldD=entry.d;
                            map2MoveBuildingGroupAlongRoute(entry,target);
                            if(Math.abs(oldD-target)>50)reordered++;

                            const laneX=def.x[localIndex];
                            const laneY=def.y[localIndex];
                            for(const root of entry.roots){
                                root.userData.map2SequenceName=def.name;
                                root.userData.map2SequenceIndex=sequenceIndex;
                                root.userData.map2SequenceSlot=localIndex;
                                root.userData.map2SequenceLaneX=laneX;
                                root.userData.map2SequenceLaneY=laneY;
                                root.userData.map2SequenceType=type;
                            }

                            const prev=slots[slots.length-1];
                            if(prev){
                                if(Math.sign(prev.x)!==Math.sign(laneX)&&Math.abs(prev.x-laneX)>=90)laneSwings++;
                                if(Math.abs(prev.y-laneY)>=38)verticalSwings++;
                            }
                            slots.push({
                                distance:target,type,sequence:def.name,
                                sequenceIndex,slot:localIndex,x:laneX,y:laneY,
                                roots:entry.roots.map(r=>r.name)
                            });
                            slotIndex++;
                        });
                    });
                    plan.push({rangeIndex,from:range.from,to:range.to,slots});
                });

                window.starbladeMap2AuthoredSequences={
                    plan,
                    sequenceCount:plan.reduce((n,p)=>n+new Set(p.slots.map(s=>s.sequence)).size,0),
                    reordered,
                    laneSwings,
                    verticalSwings
                };
                map2VisualStageStats.authoredSequences=window.starbladeMap2AuthoredSequences.sequenceCount;
                map2VisualStageStats.sequenceReorderedGroups=reordered;
                map2VisualStageStats.sequenceLaneSwings=laneSwings;
                map2VisualStageStats.sequenceVerticalSwings=verticalSwings;
                return plan;
            };

            const map2OrganizeBuildingsAsRoad=()=>{"""
if anchor not in s:
    raise SystemExit("MAP2-21 helper anchor missing")
s=s.replace(anchor,insert,1)

old="""                    const preferred=map2BuildingPassageAt(d);
                    const continuity={
                        x:THREE.MathUtils.lerp(preferred.x,previous.x,.38),
                        y:THREE.MathUtils.lerp(preferred.y,previous.y,.38)
                    };"""
new="""                    const hinted=roots.find(r=>
                        Number.isFinite(r.userData?.map2SequenceLaneX)&&
                        Number.isFinite(r.userData?.map2SequenceLaneY)
                    );
                    const preferred=hinted
                        ? {x:hinted.userData.map2SequenceLaneX,y:hinted.userData.map2SequenceLaneY}
                        : map2BuildingPassageAt(d);
                    const continuity={
                        x:THREE.MathUtils.lerp(preferred.x,previous.x,hinted?.12:.38),
                        y:THREE.MathUtils.lerp(preferred.y,previous.y,hinted?.12:.38)
                    };"""
if old not in s:
    raise SystemExit("MAP2-21 preferred-route anchor missing")
s=s.replace(old,new,1)

old_record="""                        rootNames:roots.map(r=>r.name),
                        sourceX:found.aperture.x,sourceY:found.aperture.y,
                        framed:!!found.aperture.framed,
                        x:routeTarget.x,y:routeTarget.y,shift"""
new_record="""                        rootNames:roots.map(r=>r.name),
                        sequence:roots[0]?.userData?.map2SequenceName||null,
                        sequenceIndex:roots[0]?.userData?.map2SequenceIndex??null,
                        sequenceSlot:roots[0]?.userData?.map2SequenceSlot??null,
                        sequenceType:roots[0]?.userData?.map2SequenceType||null,
                        sourceX:found.aperture.x,sourceY:found.aperture.y,
                        framed:!!found.aperture.framed,
                        x:routeTarget.x,y:routeTarget.y,shift"""
if old_record not in s:
    raise SystemExit("MAP2-21 route record anchor missing")
s=s.replace(old_record,new_record,1)

call_anchor="""            // MAP2-19: now discover and align the real hole inside each re-spaced
            // complex. The resulting aperture sequence is the visible road.
            map2OrganizeBuildingsAsRoad();"""
call_new="""            // MAP2-21: replace the uniform repeated rhythm with authored sequences
            // built only from the existing real Map4 groups.
            map2ArrangeAuthoredBuildingSequences();

            // MAP2-19: now discover and align the real hole inside each sequenced
            // complex. The resulting aperture sequence is the visible road.
            map2OrganizeBuildingsAsRoad();"""
if call_anchor not in s:
    raise SystemExit("MAP2-21 call anchor missing")
s=s.replace(call_anchor,call_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-21 authored building sequences applied")
