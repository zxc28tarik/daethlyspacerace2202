from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

if "MAP2-26: long industrial building chains" in s:
    print("MAP2-26 already applied")
    raise SystemExit(0)

stats_anchor="throughBuildingRetiredLegacyObstacles:0"
stats_new=("throughBuildingRetiredLegacyObstacles:0,"
           "longChainBridgeClones:0,longChainBridgeModules:0,"
           "longChainBridgeAnchors:0,longChainCoveragePct:0,"
           "longChainLongestSpan:0,longChainMaxGapAfter:0,"
           "longChainBadLinksAfter:0")
if stats_anchor not in s:
    raise SystemExit("MAP2-26 stats anchor missing")
s=s.replace(stats_anchor,stats_new,1)

anchor="""            const map2RetireLegacyObstaclesOnBuildingRoute=()=>{"""
insert=r"""            // MAP2-26: long industrial building chains.
            // MAP2-25 proved that existing complexes have real entry/interior/exit
            // tubes. This pass fills the remaining open handoff distance ONLY with
            // additional exact Map4 W05 station shells. No procedural road box or
            // placeholder is introduced.
            const map2BridgeSafeDistance=(from,to,target,seed=0)=>{
                let best=target,bestScore=-Infinity;
                const span=Math.max(1,to-from);
                for(const delta of [0,-70,70,-140,140,-210,210]){
                    const d=THREE.MathUtils.clamp(target+delta,from+Math.min(110,span*.12),to-Math.min(110,span*.12));
                    if(map2Segment(d).kind!=='TECH')continue;
                    const gateClear=map2Gates.length?Math.min(...map2Gates.map(g=>Math.abs(g.distance-d))):99999;
                    const edgeClear=Math.min(d-from,to-d);
                    const score=Math.min(gateClear,850)+edgeClear*.18-Math.abs(delta)*.10+(seed%7)*.001;
                    if(score>bestScore){bestScore=score;best=d;}
                }
                return best;
            };

            const map2BridgeModuleFromRoot=(clone,d,targetX,targetY,leftModule,rightModule,ordinal)=>{
                const headingDx=rightModule.entrance.x-leftModule.exit.x;
                const headingDd=Math.max(1,rightModule.entrance.distance-leftModule.exit.distance);
                const yaw=THREE.MathUtils.clamp(
                    Math.atan2(headingDx,headingDd)*1.35,
                    -THREE.MathUtils.degToRad(14),
                    THREE.MathUtils.degToRad(14)
                );
                map2RotateBuildingGroupAroundRoute({d,roots:[clone]},yaw);

                let found=map2FindBuildingRoadAperture([clone],d,{x:targetX,y:targetY});
                if(!found.aperture)return null;
                map2MoveRouteBuildingGroup(
                    [clone],d,
                    targetX-found.aperture.x,
                    targetY-found.aperture.y
                );
                found=map2FindBuildingRoadAperture([clone],d,{x:targetX,y:targetY});
                if(!found.aperture)return null;

                const reach=230;
                const offsets=[-reach,-155,0,155,reach];
                const samples=[];
                for(const off of offsets){
                    const sd=d+off;
                    if(map2Segment(sd).kind!=='TECH')continue;
                    const t=THREE.MathUtils.clamp(
                        (sd-leftModule.exit.distance)/
                        Math.max(1,rightModule.entrance.distance-leftModule.exit.distance),
                        0,1
                    );
                    const preferred={
                        x:THREE.MathUtils.lerp(leftModule.exit.x,rightModule.entrance.x,t),
                        y:THREE.MathUtils.lerp(leftModule.exit.y,rightModule.entrance.y,t)
                    };
                    const q=map2FindBuildingRoadAperture([clone],sd,preferred);
                    if(!q.aperture||q.solids<1)continue;
                    samples.push({
                        distance:sd,offset:off,x:q.aperture.x,y:q.aperture.y,
                        framed:!!q.aperture.framed,
                        directional:q.aperture.directional,
                        left:!!q.aperture.left,right:!!q.aperture.right,
                        above:!!q.aperture.above,below:!!q.aperture.below,
                        solids:q.solids,kind:map2ThroughApertureKind(q.aperture)
                    });
                }

                const center=samples.reduce((best,q)=>
                    !best||Math.abs(q.offset)<Math.abs(best.offset)?q:best,null);
                const neg=samples.filter(q=>q.offset<0).sort((a,b)=>a.offset-b.offset);
                const pos=samples.filter(q=>q.offset>0).sort((a,b)=>b.offset-a.offset);
                const entry=neg.find(q=>q.framed)||neg[0]||null;
                const exit=pos.find(q=>q.framed)||pos[0]||null;
                if(!center||!entry||!exit)return null;
                const depth=exit.distance-entry.distance;
                if(depth<280)return null;

                const points=[entry,center,exit]
                    .sort((a,b)=>a.distance-b.distance)
                    .filter((q,i,arr)=>!i||q.distance-arr[i-1].distance>55);
                if(points.length<3)return null;

                const id='MAP2_CHAIN_BRIDGE_'+ordinal;
                points.forEach((q,i)=>{
                    q.moduleId=id;
                    q.role=i===0?'ENTRY':i===points.length-1?'EXIT':'INTERIOR';
                    q.rootNames=[clone.name];
                    q.source='THROUGH_BUILDING';
                    q.bridge=true;
                });
                clone.userData.map2LongChainBridge=true;
                clone.userData.map2LongChainBridgeOrdinal=ordinal;
                clone.userData.map2ThroughBuildingModule=id;
                clone.userData.map2ThroughEntrance=entry.distance;
                clone.userData.map2ThroughExit=exit.distance;
                clone.userData.map2ThroughDepth=depth;
                clone.userData.map2SequenceLaneX=center.x;
                clone.userData.map2SequenceLaneY=center.y;
                clone.traverse(o=>{
                    o.userData.map2LongChainBridge=true;
                    o.userData.map2LongChainBridgeOrdinal=ordinal;
                });

                return {
                    id,centerDistance:d,transition:false,bridge:true,
                    rootNames:[clone.name],
                    entrance:{...entry},core:{...center},exit:{...exit},
                    points:points.map(q=>({...q})),
                    depth,
                    framedPoints:points.filter(q=>q.framed).length,
                    kind:map2ThroughApertureKind(center)
                };
            };

            const map2SummarizeLongBuildingChains=(route,bridges)=>{
                const modules=route.modules.slice().sort((a,b)=>a.entrance.distance-b.entrance.distance);
                const pairs=[];
                for(let i=0;i<modules.length-1;i++){
                    const a=modules[i],b=modules[i+1];
                    const mid=(a.exit.distance+b.entrance.distance)/2;
                    if(map2Segment(a.exit.distance).kind!=='TECH'||
                       map2Segment(b.entrance.distance).kind!=='TECH'||
                       map2Segment(mid).kind!=='TECH')continue;
                    pairs.push({
                        a:a.id,b:b.id,
                        gap:Math.max(0,b.entrance.distance-a.exit.distance),
                        lateral:Math.abs(b.entrance.x-a.exit.x),
                        vertical:Math.abs(b.entrance.y-a.exit.y)
                    });
                }

                const chains=[];let current=[];
                const flush=()=>{if(current.length){chains.push(current);current=[];}};
                for(const m of modules){
                    if(map2Segment(m.centerDistance).kind!=='TECH'){flush();continue;}
                    if(!current.length){current=[m];continue;}
                    const prev=current[current.length-1];
                    const link=pairs.find(p=>p.a===prev.id&&p.b===m.id);
                    if(link&&link.gap<=700&&link.lateral<=115&&link.vertical<=95)current.push(m);
                    else{flush();current=[m];}
                }
                flush();

                const chainRows=chains.map(c=>({
                    count:c.length,
                    from:c[0].entrance.distance,
                    to:c[c.length-1].exit.distance,
                    span:c[c.length-1].exit.distance-c[0].entrance.distance,
                    bridgeCount:c.filter(m=>m.bridge).length
                })).sort((a,b)=>b.span-a.span);

                const techRanges=MAP2_SEGMENTS.filter(s=>s.kind==='TECH')
                    .map(s=>({from:s.from*MAP2_DISTANCE,to:s.to*MAP2_DISTANCE}));
                let covered=0,total=0;
                for(const range of techRanges){
                    total+=range.to-range.from;
                    const intervals=modules
                        .map(m=>[
                            Math.max(range.from,m.entrance.distance),
                            Math.min(range.to,m.exit.distance)
                        ])
                        .filter(([a,b])=>b>a)
                        .sort((a,b)=>a[0]-b[0]);
                    const merged=[];
                    for(const iv of intervals){
                        const last=merged[merged.length-1];
                        if(last&&iv[0]<=last[1])last[1]=Math.max(last[1],iv[1]);
                        else merged.push([...iv]);
                    }
                    covered+=merged.reduce((n,[a,b])=>n+b-a,0);
                }
                const coveragePct=total?covered/total*100:0;
                const maxGap=pairs.length?Math.max(...pairs.map(p=>p.gap)):0;
                const badLinks=pairs.filter(p=>p.gap>700||p.lateral>115||p.vertical>95).length;
                return {
                    bridges:bridges.length,
                    modules:modules.length,
                    pairs,
                    chains:chainRows,
                    longest:chainRows[0]||null,
                    coveragePct,maxGap,badLinks
                };
            };

            const map2AddLongIndustrialBuildingBridges=()=>{
                const route=window.starbladeMap2ThroughRoute;
                const road=window.starbladeMap2BuildingRoad;
                if(!route?.modules?.length||!road?.knots?.length)return [];

                const base=route.modules.slice().sort((a,b)=>a.entrance.distance-b.entrance.distance);
                const bridgeRequests=[];
                for(let i=0;i<base.length-1;i++){
                    const a=base[i],b=base[i+1];
                    const mid=(a.exit.distance+b.entrance.distance)/2;
                    if(map2Segment(a.exit.distance).kind!=='TECH'||
                       map2Segment(b.entrance.distance).kind!=='TECH'||
                       map2Segment(mid).kind!=='TECH')continue;

                    const gap=Math.max(0,b.entrance.distance-a.exit.distance);
                    const lateral=Math.abs(b.entrance.x-a.exit.x);
                    const vertical=Math.abs(b.entrance.y-a.exit.y);
                    let count=Math.max(
                        Math.max(0,Math.ceil(gap/700)-1),
                        Math.max(0,Math.ceil(lateral/115)-1),
                        Math.max(0,Math.ceil(vertical/95)-1)
                    );
                    if(gap>700&&count===0)count=1;
                    if((lateral>115||vertical>95)&&count===0)count=1;
                    count=Math.min(3,count);
                    if(!count)continue;
                    bridgeRequests.push({a,b,gap,lateral,vertical,count});
                }

                const bridges=[];
                let ordinal=0;
                for(const req of bridgeRequests){
                    for(let j=0;j<req.count;j++){
                        const t=(j+1)/(req.count+1);
                        const rawD=THREE.MathUtils.lerp(req.a.exit.distance,req.b.entrance.distance,t);
                        const d=map2BridgeSafeDistance(
                            req.a.exit.distance,req.b.entrance.distance,rawD,ordinal
                        );
                        if(map2Segment(d).kind!=='TECH')continue;
                        const x=THREE.MathUtils.lerp(req.a.exit.x,req.b.entrance.x,t);
                        const y=THREE.MathUtils.lerp(req.a.exit.y,req.b.entrance.y,t);
                        const sourceIndex=(ordinal*5+j*3)%6;
                        const clone=map2CloneExactMap4Station(sourceIndex,d,x,y);
                        clone.name=clone.name+'_CHAINBRIDGE_'+ordinal;
                        clone.userData.map2LongChainBridge=true;
                        clone.userData.map2LongChainBridgeFrom=req.a.id;
                        clone.userData.map2LongChainBridgeTo=req.b.id;

                        const module=map2BridgeModuleFromRoot(
                            clone,d,x,y,req.a,req.b,ordinal
                        );
                        if(!module){
                            clone.parent?.remove(clone);
                            ordinal++;
                            continue;
                        }
                        bridges.push(module);
                        ordinal++;
                    }
                }

                // All bridge modules are exact copied Map4 stations. Their real
                // aperture points become navigation anchors, but they do not alter
                // the historical 118 MAP2-19/22 base group accounting.
                for(const module of bridges){
                    route.modules.push(module);
                    for(const q of module.points){
                        const knot={
                            distance:q.distance,x:q.x,y:q.y,
                            source:'THROUGH_BUILDING',
                            moduleId:module.id,role:q.role,
                            framed:q.framed,kind:q.kind,bridge:true
                        };
                        route.moduleAnchors.push({...knot});
                        road.knots.push(knot);
                    }
                }
                route.modules.sort((a,b)=>a.entrance.distance-b.entrance.distance);
                road.knots.sort((a,b)=>a.distance-b.distance);
                route.routeAnchors=road.knots;

                const summary=map2SummarizeLongBuildingChains(route,bridges);
                window.starbladeMap2LongBuildingChains=summary;
                window.starbladeMap2ChainBridgeModules=bridges;

                map2VisualStageStats.longChainBridgeClones=bridges.length;
                map2VisualStageStats.longChainBridgeModules=bridges.length;
                map2VisualStageStats.longChainBridgeAnchors=bridges.reduce((n,m)=>n+m.points.length,0);
                map2VisualStageStats.longChainCoveragePct=summary.coveragePct;
                map2VisualStageStats.longChainLongestSpan=summary.longest?.span||0;
                map2VisualStageStats.longChainMaxGapAfter=summary.maxGap;
                map2VisualStageStats.longChainBadLinksAfter=summary.badLinks;

                // Refresh MAP2-25 aggregate telemetry after adding real bridge modules.
                map2VisualStageStats.throughBuildingModules=route.modules.length;
                map2VisualStageStats.throughBuildingAnchors=route.moduleAnchors.length;
                map2VisualStageStats.throughBuildingFramedAnchors=
                    route.modules.reduce((n,m)=>n+m.points.filter(q=>q.framed).length,0);
                map2VisualStageStats.throughBuildingDeepModules=
                    route.modules.filter(m=>m.depth>=700).length;
                map2VisualStageStats.throughBuildingMaxDepth=
                    Math.max(...route.modules.map(m=>m.depth));
                map2VisualStageStats.throughBuildingRouteKnots=road.knots.length;
                return bridges;
            };

            const map2RetireLegacyObstaclesOnBuildingRoute=()=>{"""
if anchor not in s:
    raise SystemExit("MAP2-26 helper anchor missing")
s=s.replace(anchor,insert,1)

call_anchor="""            map2BuildThroughBuildingRouteModules();

            // MAP2-25: remove obsolete generic road obstacles that conflict with
            // the real building route before deriving collision from Map4 meshes.
            map2RetireLegacyObstaclesOnBuildingRoute();"""
call_new="""            map2BuildThroughBuildingRouteModules();

            // MAP2-26: fill the remaining long/violent EXIT->ENTRY handoffs with
            // exact Map4 W05 buildings, then turn those buildings into real
            // entrance/interior/exit modules as well.
            map2AddLongIndustrialBuildingBridges();

            // MAP2-25: remove obsolete generic road obstacles that conflict with
            // the now-denser real building route before deriving Map4 collision.
            map2RetireLegacyObstaclesOnBuildingRoute();"""
if call_anchor not in s:
    raise SystemExit("MAP2-26 call anchor missing")
s=s.replace(call_anchor,call_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-26 long industrial building chains applied")
