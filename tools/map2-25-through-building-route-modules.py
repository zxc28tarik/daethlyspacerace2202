from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

if "MAP2-25: through-building route modules" in s:
    print("MAP2-25 already applied")
    raise SystemExit(0)

# Expand MAP2 layout telemetry.
stats_anchor="canyonPredictedMaxJumpAfter:0"
stats_new=("canyonPredictedMaxJumpAfter:0,"
           "throughBuildingModules:0,throughBuildingAnchors:0,"
           "throughBuildingFramedAnchors:0,throughBuildingDeepModules:0,"
           "throughBuildingMaxDepth:0,throughBuildingRouteKnots:0,"
           "throughBuildingLegacySafetyRejects:0,"
           "throughBuildingRetiredLegacyObstacles:0")
if stats_anchor not in s:
    raise SystemExit("MAP2-25 stats anchor missing")
s=s.replace(stats_anchor,stats_new,1)

# MAP2-24 proved the midpoint concept. Keep only a very small anti-repetition
# bias now that stronger architectural yaw is already preserved separately.
bias_anchor="const bias=coreSpan>150?0:((linked%3)-1)*10;"
if bias_anchor not in s:
    raise SystemExit("MAP2-25 canyon bias anchor missing")
s=s.replace(bias_anchor,"const bias=coreSpan>150?0:(linked===5?3:((linked%3)-1)*2);",1)

# Build multi-point route tubes through the actual depth of real Map4 buildings.
fn_anchor="""            // MAP2-25: the copied Map4 architecture is now the real route.
            // Retire old generic Map2 obstacle meshes that physically cross that
            // real entrance/interior/exit tube. This is not an invisible-collision
            // workaround: both the obsolete legacy collider and its visible generic
            // mesh are removed from play. Authored gate walls remain untouched.
            const map2RetireLegacyObstaclesOnBuildingRoute=()=>{
                const route=window.starbladeMap2ThroughRoute;
                if(!route?.routeAnchors?.length)return 0;
                let retired=0;
                const keep=[];
                for(const obstacle of map2Obstacles){
                    if(obstacle.map2BuildingDerived){keep.push(obstacle);continue;}
                    const d=Number(obstacle.routeProgress);
                    if(!Number.isFinite(d)||map2Segment(d).kind!=='TECH'){
                        keep.push(obstacle);continue;
                    }
                    const hd=obstacle.halfDepth||obstacle.radius||45;
                    const gateProtected=map2Gates.some(g=>
                        Math.abs(g.distance-d)<Math.max(330,hd+260)
                    );
                    if(gateProtected){keep.push(obstacle);continue;}

                    let crosses=false;
                    const from=Math.max(0,d-hd-140);
                    const to=Math.min(MAP2_DISTANCE,d+hd+140);
                    let prev=null;
                    for(let sd=from;sd<=to+1;sd+=70){
                        const qd=Math.min(sd,to);
                        if(map2Segment(qd).kind!=='TECH'){prev=null;continue;}
                        const q=map2BuildingPassageAt(qd);
                        const node={routeProgress:qd,laneX:q.x,laneY:q.y};
                        if(prev&&courseSegmentTouch(obstacle,prev,node,12.5)){
                            crosses=true;break;
                        }
                        prev=node;
                    }
                    if(crosses){
                        obstacle.active=false;
                        obstacle.map2RetiredForBuildingRoute=true;
                        if(obstacle.mesh){
                            obstacle.mesh.visible=false;
                            obstacle.mesh.userData.map2RetiredForBuildingRoute=true;
                        }
                        retired++;
                    }else keep.push(obstacle);
                }
                map2Obstacles.length=0;
                map2Obstacles.push(...keep);
                map2VisualStageStats.throughBuildingRetiredLegacyObstacles=retired;
                window.starbladeMap2RetiredLegacyObstacles=retired;
                return retired;
            };

            const map2BuildPhysicalMap4BuildingObstacles=()=>{"""
fn_insert=r"""            // MAP2-25: through-building route modules.
            // A real complex is no longer represented by one centre aperture only.
            // We slice its visible Map4 mass along route depth and keep pilot-sized
            // real openings as entrance / interior / exit anchors. No geometry is
            // generated here: every anchor comes from an existing copied building.
            const map2ThroughApertureKind=a=>{
                if(!a)return 'OPENING';
                if(a.above&&a.below)return 'INTERIOR';
                if(a.above&&(a.left||a.right))return 'UNDERPASS';
                if(a.left&&a.right)return 'ALLEY';
                if((a.left||a.right)&&(a.below||a.above))return 'CANYON';
                return 'OPENING';
            };

            const map2BuildThroughBuildingRouteModules=()=>{
                const road=window.starbladeMap2BuildingRoad;
                if(!road?.groups?.length)return [];

                const logical=map2LogicalBuildingGroups()
                    .filter(g=>map2Segment(g.d).kind==='TECH')
                    .sort((a,b)=>a.d-b.d);
                const records=road.groups.filter(r=>r.open).sort((a,b)=>a.d-b.d);
                const modules=[];
                const moduleAnchors=[];
                let framedAnchors=0,deepModules=0,maxDepth=0;

                const recordAt=d=>records.reduce((best,r)=>
                    Math.abs(r.d-d)<Math.abs(best.d-d)?r:best,records[0]);

                logical.forEach((entry,index)=>{
                    const d=entry.d;
                    const rec=recordAt(d);
                    if(!rec||Math.abs(rec.d-d)>8)return;

                    const prevGap=index?d-logical[index-1].d:1500;
                    const nextGap=index<logical.length-1?logical[index+1].d-d:1500;
                    // Never let one complex own the neighbouring complex's approach.
                    const reach=THREE.MathUtils.clamp(Math.min(prevGap,nextGap)*.34,180,720);
                    const rawOffsets=[-1,-.72,-.42,0,.42,.72,1]
                        .map(v=>Math.round(v*reach));
                    const offsets=[...new Set(rawOffsets)].sort((a,b)=>a-b);
                    const samples=[];

                    for(const off of offsets){
                        const sd=d+off;
                        if(sd<0||sd>MAP2_DISTANCE||map2Segment(sd).kind!=='TECH')continue;
                        const preferred=map2BuildingPassageAt(sd);
                        const found=map2FindBuildingRoadAperture(entry.roots,sd,preferred);
                        if(!found.aperture||found.solids<1)continue;
                        const a=found.aperture;
                        samples.push({
                            distance:sd,offset:off,x:a.x,y:a.y,
                            framed:!!a.framed,directional:a.directional,
                            left:!!a.left,right:!!a.right,above:!!a.above,below:!!a.below,
                            solids:found.solids,kind:map2ThroughApertureKind(a)
                        });
                    }

                    const center=samples.reduce((best,q)=>
                        !best||Math.abs(q.offset)<Math.abs(best.offset)?q:best,null);
                    const neg=samples.filter(q=>q.offset<0).sort((a,b)=>a.offset-b.offset);
                    const pos=samples.filter(q=>q.offset>0).sort((a,b)=>b.offset-a.offset);
                    const entrance=neg.find(q=>q.framed)||neg[0]||null;
                    const exit=pos.find(q=>q.framed)||pos[0]||null;
                    if(!center||!entrance||!exit)return;

                    const depth=exit.distance-entrance.distance;
                    const framedCount=[entrance,center,exit].filter(q=>q.framed).length;
                    if(depth<300||framedCount<2)return;

                    const innerNeg=samples.filter(q=>q.offset<0&&q!==entrance&&q.framed)
                        .sort((a,b)=>Math.abs(a.offset)-Math.abs(b.offset))[0];
                    const innerPos=samples.filter(q=>q.offset>0&&q!==exit&&q.framed)
                        .sort((a,b)=>Math.abs(a.offset)-Math.abs(b.offset))[0];
                    const points=[entrance,innerNeg,center,innerPos,exit]
                        .filter(Boolean)
                        .sort((a,b)=>a.distance-b.distance)
                        .filter((q,i,arr)=>!i||q.distance-arr[i-1].distance>55);

                    const id='MAP2_THROUGH_'+modules.length;
                    points.forEach((q,pointIndex)=>{
                        q.moduleId=id;
                        q.role=pointIndex===0?'ENTRY':
                            pointIndex===points.length-1?'EXIT':
                            Math.abs(q.offset)<80?'CORE':'INTERIOR';
                        q.rootNames=entry.roots.map(r=>r.name);
                        if(q.framed)framedAnchors++;
                        if(Math.abs(q.offset)>70)moduleAnchors.push({...q});
                    });

                    for(const root of entry.roots){
                        root.userData.map2ThroughBuildingModule=id;
                        root.userData.map2ThroughEntrance=entrance.distance;
                        root.userData.map2ThroughExit=exit.distance;
                        root.userData.map2ThroughDepth=depth;
                    }

                    const module={
                        id,centerDistance:d,transition:entry.roots.some(r=>r.userData?.map2TransitionRoadClone),
                        rootNames:entry.roots.map(r=>r.name),
                        entrance:{...entrance},core:{...center},exit:{...exit},
                        points:points.map(q=>({...q})),
                        depth,
                        framedPoints:points.filter(q=>q.framed).length,
                        kind:map2ThroughApertureKind(center)
                    };
                    modules.push(module);
                    if(depth>=700)deepModules++;
                    maxDepth=Math.max(maxDepth,depth);
                });

                // Existing centre apertures stay authoritative at each complex centre.
                // Extra depth anchors bend the road through the real opening tube.
                const enriched=road.knots.map(k=>({...k,source:k.source||'BUILDING_CENTER'}));
                for(const a of moduleAnchors){
                    if(enriched.some(k=>Math.abs(k.distance-a.distance)<55))continue;
                    enriched.push({
                        distance:a.distance,x:a.x,y:a.y,
                        source:'THROUGH_BUILDING',moduleId:a.moduleId,role:a.role,
                        framed:a.framed,kind:a.kind
                    });
                }
                enriched.sort((a,b)=>a.distance-b.distance);
                road.knots=enriched;
                road.throughModules=modules;

                window.starbladeMap2ThroughRoute={
                    philosophy:'BUILDINGS_HAVE_ENTRANCE_INTERIOR_EXIT',
                    modules,
                    moduleAnchors,
                    routeAnchors:enriched,
                    techOnly:true
                };

                map2VisualStageStats.throughBuildingModules=modules.length;
                map2VisualStageStats.throughBuildingAnchors=moduleAnchors.length;
                map2VisualStageStats.throughBuildingFramedAnchors=framedAnchors;
                map2VisualStageStats.throughBuildingDeepModules=deepModules;
                map2VisualStageStats.throughBuildingMaxDepth=maxDepth;
                map2VisualStageStats.throughBuildingRouteKnots=enriched.length;
                return modules;
            };

            const map2BuildPhysicalMap4BuildingObstacles=()=>{"""
if fn_anchor not in s:
    raise SystemExit("MAP2-25 physical-builder anchor missing")
s=s.replace(fn_anchor,fn_insert,1)

call_anchor="""            // MAP2-18: only after all authored gates and original physical solids
            // exist, derive collision directly from the visible Map4 building meshes.
            // This ordering lets the real buildings act as obstacles without
            // accidentally sealing the intended gate apertures.
            map2BuildPhysicalMap4BuildingObstacles();"""
call_new="""            // MAP2-25: expand each suitable real complex from a single centre
            // aperture into entrance/interior/exit route anchors before physics is
            // derived, so collision preservation follows the real through-building tube.
            map2BuildThroughBuildingRouteModules();

            // MAP2-25: remove obsolete generic road obstacles that conflict with
            // the real building route before deriving collision from Map4 meshes.
            map2RetireLegacyObstaclesOnBuildingRoute();

            // MAP2-18: only after all authored gates and original physical solids
            // exist, derive collision directly from the visible Map4 building meshes.
            // This ordering lets the real buildings act as obstacles without
            // accidentally sealing the intended gate apertures.
            map2BuildPhysicalMap4BuildingObstacles();"""
if call_anchor not in s:
    raise SystemExit("MAP2-25 call anchor missing")
s=s.replace(call_anchor,call_new,1)

# Global interpolation for AI and QA. Data is generated inside map2BuildCourse,
# while this function intentionally lives at game scope.
global_anchor="""        }
        // MAP2-04/07: altitude patrol. Gameplay damage stays fixed; MAP2-07 adds readable approach/lock/breakaway motion."""
global_new=r"""        }

        // MAP2-25: shared real-building navigation query.
        // The hidden spline still supplies longitudinal progress only; lateral and
        // vertical targets come from the enriched real-building aperture anchors.
        function map2ThroughRouteTargetAt(progress,lookAhead=0){
            const route=window.starbladeMap2ThroughRoute;
            const anchors=route?.routeAnchors||window.starbladeMap2BuildingRoad?.knots;
            if(!anchors?.length)return null;
            const d=THREE.MathUtils.clamp(progress+lookAhead,0,MAP2_DISTANCE);
            if(map2Segment(d).kind!=='TECH')return null;
            if(d<=anchors[0].distance){
                const a=anchors[0];
                return {distance:d,x:a.x,y:a.y,moduleId:a.moduleId||null,role:a.role||null};
            }
            if(d>=anchors[anchors.length-1].distance){
                const a=anchors[anchors.length-1];
                return {distance:d,x:a.x,y:a.y,moduleId:a.moduleId||null,role:a.role||null};
            }
            let hi=1;
            while(hi<anchors.length&&anchors[hi].distance<d)hi++;
            const a=anchors[hi-1],b=anchors[hi];
            const t=THREE.MathUtils.clamp((d-a.distance)/Math.max(1,b.distance-a.distance),0,1);
            const smooth=t*t*(3-2*t);
            const module=route?.modules?.find(m=>d>=m.entrance.distance&&d<=m.exit.distance)||null;
            return {
                distance:d,
                x:THREE.MathUtils.lerp(a.x,b.x,smooth),
                y:THREE.MathUtils.lerp(a.y,b.y,smooth),
                moduleId:module?.id||a.moduleId||b.moduleId||null,
                role:module?'THROUGH':(a.role||b.role||null),
                inModule:!!module,
                kind:module?.kind||null
            };
        }

        // MAP2-04/07: altitude patrol. Gameplay damage stays fixed; MAP2-07 adds readable approach/lock/breakaway motion."""
if global_anchor not in s:
    raise SystemExit("MAP2-25 global target anchor missing")
s=s.replace(global_anchor,global_new,1)

# Compute the real-building target once per rival frame, beside the existing
# gate planner. Old gates remain a hard-safety layer on final approach.
pilot_anchor="""                const gateAhead = upcomingWreckGate(r.routeProgress,2500);
                const map2Pilot=map2Active()?map2PilotPlan(r,gateAhead,maxLateralSpeed):null;
                const gatePlan=map2Pilot?map2Pilot.gatePlan:getGateApproachPlan(r,gateAhead,dt,maxLateralSpeed);"""
pilot_new="""                const gateAhead = upcomingWreckGate(r.routeProgress,2500);
                const map2Pilot=map2Active()?map2PilotPlan(r,gateAhead,maxLateralSpeed):null;
                const gatePlan=map2Pilot?map2Pilot.gatePlan:getGateApproachPlan(r,gateAhead,dt,maxLateralSpeed);
                const map2BuildingPlan=map2Pilot?map2ThroughRouteTargetAt(
                    r.routeProgress,
                    Math.min(620,Math.max(220,r.currentSpeed*.22))
                ):null;"""
if pilot_anchor not in s:
    raise SystemExit("MAP2-25 rival planner anchor missing")
s=s.replace(pilot_anchor,pilot_new,1)

speed_anchor="""                if(map2Pilot){
                    const cap=Math.min(map2Pilot.turnLimit,map2Pilot.gateLimit??Infinity);
                    r.map2SpeedLimit=cap;
                    if(cap<=RACE_SPEEDS.NORMAL)r.isBoosting=false;
                    r.isBraking=cap<=RACE_SPEEDS.BRAKE;
                    if(map2Pilot.turnBrake)r.aiStats.map2CurveBrakeSeconds=(r.aiStats.map2CurveBrakeSeconds||0)+dt;
                    if(map2Pilot.gatePlan?.shouldBrake)r.aiStats.map2GateBrakeSeconds=(r.aiStats.map2GateBrakeSeconds||0)+dt;
                }"""
speed_new="""                if(map2Pilot){
                    let cap=Math.min(map2Pilot.turnLimit,map2Pilot.gateLimit??Infinity);
                    if(map2BuildingPlan){
                        const buildingError=Math.hypot(
                            map2BuildingPlan.x-r.laneX,
                            map2BuildingPlan.y-r.laneY
                        );
                        // Moderate speed only when the craft is genuinely late to a
                        // real building aperture. We do not globally slow the race.
                        if(map2BuildingPlan.inModule&&buildingError>82)
                            cap=Math.min(cap,RACE_SPEEDS.BRAKE);
                        else if(buildingError>58)
                            cap=Math.min(cap,RACE_SPEEDS.NORMAL);
                        map2Pilot.buildingPlan={...map2BuildingPlan,lateralError:buildingError};
                    }
                    r.map2SpeedLimit=cap;
                    if(cap<=RACE_SPEEDS.NORMAL)r.isBoosting=false;
                    r.isBraking=cap<=RACE_SPEEDS.BRAKE;
                    if(map2Pilot.turnBrake)r.aiStats.map2CurveBrakeSeconds=(r.aiStats.map2CurveBrakeSeconds||0)+dt;
                    if(map2Pilot.gatePlan?.shouldBrake)r.aiStats.map2GateBrakeSeconds=(r.aiStats.map2GateBrakeSeconds||0)+dt;
                    if(map2Pilot.buildingPlan&&cap<=RACE_SPEEDS.NORMAL)
                        r.aiStats.map2BuildingBrakeSeconds=(r.aiStats.map2BuildingBrakeSeconds||0)+dt;
                }"""
if speed_anchor not in s:
    raise SystemExit("MAP2-25 speed anchor missing")
s=s.replace(speed_anchor,speed_new,1)

steer_anchor="""                if (gatePlan && (map2Pilot||gatePlan.gap < 1650)) {
                    // Kalabalık yarışta gemiler aynı noktaya kilitlenmesin:
                    // Her bot geçidin güvenli boşluğu içinde farklı yatay şerit seçer.
                    activeTargetX=gatePlan.x + (map2Pilot?0:(rIdx - 2) * 28);
                    activeTargetY=gatePlan.y;
                    // Bu geçişte agresif sollama oyuncuyla metal gövde arasında sıkıştırmasın.
                    r.overtakeTarget=null;
                    r.overtakeHoldTimer=0;
                    // Rastgele engel kaçınma yerine metal geçidin açık hattı öncelikli.
                    r.avoidAsteroid=null;
                }"""
steer_new="""                if (gatePlan && (map2Pilot||gatePlan.gap < 1650)) {
                    // Kalabalık yarışta gemiler aynı noktaya kilitlenmesin:
                    // Her bot geçidin güvenli boşluğu içinde farklı yatay şerit seçer.
                    activeTargetX=gatePlan.x + (map2Pilot?0:(rIdx - 2) * 28);
                    activeTargetY=gatePlan.y;
                    // Bu geçişte agresif sollama oyuncuyla metal gövde arasında sıkıştırmasın.
                    r.overtakeTarget=null;
                    r.overtakeHoldTimer=0;
                    // Rastgele engel kaçınma yerine metal geçidin açık hattı öncelikli.
                    r.avoidAsteroid=null;
                }

                // MAP2-25: between hard gate approaches, the copied building aperture
                // chain is the navigation line. Urgent asteroid avoidance can still
                // temporarily override it; an immediate legacy gate remains hard safety.
                if(map2Pilot&&map2BuildingPlan&&!r.avoidAsteroid&&
                    map2Segment(r.routeProgress).kind==='TECH'){
                    const hardGate=gatePlan&&gatePlan.gap<950&&gatePlan.gap>-190;
                    if(!hardGate){
                        activeTargetX=map2BuildingPlan.x;
                        activeTargetY=map2BuildingPlan.y;
                        r.overtakeTarget=null;
                        r.overtakeHoldTimer=0;
                        r.aiStats.map2BuildingRouteSeconds=(r.aiStats.map2BuildingRouteSeconds||0)+dt;
                        r.aiStats.map2BuildingRouteTargets=(r.aiStats.map2BuildingRouteTargets||0)+1;
                        if(map2BuildingPlan.inModule)
                            r.aiStats.map2ThroughBuildingSeconds=(r.aiStats.map2ThroughBuildingSeconds||0)+dt;
                    }
                }"""
if steer_anchor not in s:
    raise SystemExit("MAP2-25 steering anchor missing")
s=s.replace(steer_anchor,steer_new,1)

# MAP2-25 collision compatibility: preserve one real through-route safety
# corridor from every authored gate opening to the nearest next opening. Building
# visuals stay untouched; only a derived collider candidate is rejected if it
# would close that already-valid visible flight corridor.
collider_anchor="""            const map2BuildPhysicalMap4BuildingObstacles=()=>{
                const roots=map2ExactBuildingRoots();
                const candidates=[];"""
collider_new=r"""            const map2BuildPhysicalMap4BuildingObstacles=()=>{
                const roots=map2ExactBuildingRoots();
                const candidates=[];
                const legacySafetySegments=[];
                for(const seg of MAP2_SEGMENTS.filter(s=>s.kind==='TECH')){
                    const start=seg.from*MAP2_DISTANCE,end=seg.to*MAP2_DISTANCE;
                    const gates=map2Gates.filter(g=>g.distance>=start&&g.distance<end);
                    for(let gi=1;gi<gates.length;gi++){
                        const a=gates[gi-1],b=gates[gi];
                        const from=a.distance+a.depth/2+40;
                        const to=b.distance-b.depth/2-40;
                        const run=Math.max(1,to-from);
                        const blend=Math.min(170,run*.16);
                        const smooth=t=>t*t*(3-2*t);
                        for(const p of a.openings){
                            const q=b.openings.slice().sort((u,v)=>
                                Math.hypot(u.x-p.x,u.y-p.y)-Math.hypot(v.x-p.x,v.y-p.y)
                            )[0];
                            if(!q)continue;
                            const nodes=[{routeProgress:from,laneX:p.x,laneY:p.y}];
                            for(let d=from+90;d<to;d+=90){
                                const lane=map2BuildingPassageAt(d);
                                let x=lane.x,y=lane.y;
                                if(d<from+blend){
                                    const t=smooth((d-from)/blend);
                                    x=p.x+(x-p.x)*t;y=p.y+(y-p.y)*t;
                                }
                                if(d>to-blend){
                                    const t=smooth((d-(to-blend))/blend);
                                    x=x+(q.x-x)*t;y=y+(q.y-y)*t;
                                }
                                nodes.push({routeProgress:d,laneX:x,laneY:y});
                            }
                            nodes.push({routeProgress:to,laneX:q.x,laneY:q.y});
                            for(let ni=1;ni<nodes.length;ni++)
                                legacySafetySegments.push([nodes[ni-1],nodes[ni]]);
                        }
                    }
                }
                let legacySafetyRejects=0;"""
if collider_anchor not in s:
    raise SystemExit("MAP2-25 collider builder anchor missing")
s=s.replace(collider_anchor,collider_new,1)

candidate_anchor="""                        const roadOverlap=Math.max(0,360-(Math.abs(cx)-hx));
                        if(roadOverlap<=25)return;
                        const volume=hx*hy*hd;"""
candidate_new=r"""                        const roadOverlap=Math.max(0,360-(Math.abs(cx)-hx));
                        if(roadOverlap<=25)return;

                        const safetyProbe={
                            routeProgress:d,laneX:cx,laneY:cy,
                            halfX:hx,halfY:hy,halfDepth:hd,
                            radius:Math.hypot(hx,hy,hd),
                            type:'WRECK_BOX',moveType:'STATIC',active:true
                        };
                        if(legacySafetySegments.some(([sa,sb])=>
                            courseSegmentTouch(safetyProbe,sa,sb,12.5)
                        )){
                            legacySafetyRejects++;
                            return;
                        }

                        const volume=hx*hy*hd;"""
if candidate_anchor not in s:
    raise SystemExit("MAP2-25 collider candidate anchor missing")
s=s.replace(candidate_anchor,candidate_new,1)

return_anchor="""                map2VisualStageStats.map4BuildingOverheads=overhead;
                return physical;"""
return_new=r"""                map2VisualStageStats.map4BuildingOverheads=overhead;
                map2VisualStageStats.throughBuildingLegacySafetyRejects=legacySafetyRejects;
                return physical;"""
if return_anchor not in s:
    raise SystemExit("MAP2-25 collider stats anchor missing")
s=s.replace(return_anchor,return_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-25 through-building modules + rival navigation applied")
