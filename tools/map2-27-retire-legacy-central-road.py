from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

if "MAP2-27: retire legacy central-road scaffolding" in s:
    print("MAP2-27 already applied")
    raise SystemExit(0)

stats_anchor="longChainBadLinksAfter:0"
stats_new=("longChainBadLinksAfter:0,"
           "legacyRoadTurnsRetired:0,legacyRoadMeshesHidden:0,"
           "legacyApertureGuidesHidden:0,legacyRoadObstaclesBefore:0,"
           "legacyRoadObstaclesAfter:0,legacyRoadGateObstaclesPreserved:0")
if stats_anchor not in s:
    raise SystemExit("MAP2-27 stats anchor missing")
s=s.replace(stats_anchor,stats_new,1)

anchor="""            const map2RetireLegacyObstaclesOnBuildingRoute=()=>{"""
insert=r"""            // MAP2-27: retire the obsolete central-road scaffolding.
            // Hard-safety gates remain intact. We only remove old generic CITY_TURN
            // collision/meshes where the route is already physically defined by
            // real Map4 architecture, and hide artificial aperture-corner line
            // guides in long real-building chains.
            const map2RetireLegacyCentralRoadScaffolding=()=>{
                const route=window.starbladeMap2ThroughRoute;
                const chains=window.starbladeMap2LongBuildingChains;
                const building=window.starbladeMap2BuildingColliders||[];
                if(!route?.modules?.length||!chains?.chains?.length)return null;

                const longChains=chains.chains.filter(c=>c.span>=10000);
                const inLongChain=d=>longChains.some(c=>d>=c.from&&d<=c.to);
                const inRealModule=d=>route.modules.some(m=>
                    d>=m.entrance.distance-120&&d<=m.exit.distance+120
                );
                const nearbyBuildingPhysics=d=>building.filter(o=>
                    Math.abs((o.routeProgress??-999999)-d)<=520
                ).length;
                const isGateObstacleName=name=>
                    /^MAP2_(?:HANGAR|GANTRY|DUAL_FACTORY|MACHINE_SLOT)_/.test(name||'');

                const before=map2Obstacles.length;
                const keep=[];
                const retired=[];
                let hiddenMeshes=0,gatePreserved=0;

                for(const obstacle of map2Obstacles){
                    if(obstacle.map2BuildingDerived){keep.push(obstacle);continue;}
                    const d=Number(obstacle.routeProgress);
                    const name=obstacle.mesh?.name||obstacle.name||'';
                    if(isGateObstacleName(name)){
                        gatePreserved++;
                        keep.push(obstacle);
                        continue;
                    }

                    const cityTurn=/^MAP2_CITY_TURN_/.test(name);
                    const replaceable=cityTurn&&Number.isFinite(d)&&
                        map2Segment(d).kind==='TECH'&&
                        inLongChain(d)&&inRealModule(d)&&
                        nearbyBuildingPhysics(d)>=1;

                    if(!replaceable){
                        keep.push(obstacle);
                        continue;
                    }

                    obstacle.active=false;
                    obstacle.map2RetiredForBuildingRoute=true;
                    obstacle.map2RetiredByMAP227=true;
                    if(obstacle.mesh){
                        if(obstacle.mesh.visible!==false)hiddenMeshes++;
                        obstacle.mesh.visible=false;
                        obstacle.mesh.userData.map2RetiredForBuildingRoute=true;
                        obstacle.mesh.userData.map2RetiredByMAP227=true;
                    }
                    retired.push({
                        name,d,
                        buildingPhysicsNearby:nearbyBuildingPhysics(d)
                    });
                }

                map2Obstacles.length=0;
                map2Obstacles.push(...keep);

                let guidesHidden=0;
                const hiddenGuides=[];
                map2CourseGroup.traverse(o=>{
                    if(o.name!=='MAP2_APERTURE_CORNERS'||o.visible===false)return;
                    const d=Number(
                        o.userData?.map2TargetDistance??
                        o.userData?.map2Distance??
                        o.userData?.routeProgress
                    );
                    if(!Number.isFinite(d)||!inLongChain(d))return;
                    // Keep entrance/exit-region hints near TECH boundaries. Deep
                    // inside long real-building chains, architecture itself guides.
                    const seg=map2Segment(d);
                    if(seg.kind!=='TECH')return;
                    const edgeDist=Math.min(
                        ...MAP2_SEGMENTS.filter(sg=>sg.kind==='TECH')
                            .map(sg=>Math.min(
                                Math.abs(d-sg.from*MAP2_DISTANCE),
                                Math.abs(d-sg.to*MAP2_DISTANCE)
                            ))
                    );
                    if(edgeDist<1200)return;

                    const closeModule=route.modules.some(m=>
                        Math.abs(m.centerDistance-d)<=950||
                        (d>=m.entrance.distance-150&&d<=m.exit.distance+150)
                    );
                    if(!closeModule)return;

                    o.visible=false;
                    o.userData.map2RetiredByMAP227=true;
                    o.userData.map2LegacyGuideHidden=true;
                    guidesHidden++;
                    hiddenGuides.push({name:o.name,d});
                });

                // MAP2-25 already published its retirement count. MAP2-27 extends
                // the same explicit accounting instead of silently changing totals.
                const prior=window.starbladeMap2RetiredLegacyObstacles||0;
                const totalRetired=prior+retired.length;
                window.starbladeMap2RetiredLegacyObstacles=totalRetired;
                map2VisualStageStats.throughBuildingRetiredLegacyObstacles=totalRetired;

                const result={
                    philosophy:'REAL_BUILDINGS_REPLACE_LEGACY_CENTRAL_ROAD',
                    before,
                    after:map2Obstacles.length,
                    retired,
                    retiredCount:retired.length,
                    hiddenMeshes,
                    guidesHidden,
                    hiddenGuides,
                    gatePreserved,
                    priorRetired:prior,
                    totalRetired,
                    longChains:longChains.map(c=>({
                        from:c.from,to:c.to,span:c.span,count:c.count
                    }))
                };
                window.starbladeMap2LegacyRoadRetirement=result;

                map2VisualStageStats.legacyRoadTurnsRetired=retired.length;
                map2VisualStageStats.legacyRoadMeshesHidden=hiddenMeshes;
                map2VisualStageStats.legacyApertureGuidesHidden=guidesHidden;
                map2VisualStageStats.legacyRoadObstaclesBefore=before;
                map2VisualStageStats.legacyRoadObstaclesAfter=map2Obstacles.length;
                map2VisualStageStats.legacyRoadGateObstaclesPreserved=gatePreserved;
                return result;
            };

            const map2RetireLegacyObstaclesOnBuildingRoute=()=>{"""
if anchor not in s:
    raise SystemExit("MAP2-27 helper anchor missing")
s=s.replace(anchor,insert,1)

call_anchor="""            map2BuildPhysicalMap4BuildingObstacles();"""
call_new="""            map2BuildPhysicalMap4BuildingObstacles();

            // MAP2-27: now that replacement Map4 collision exists, remove the old
            // CITY_TURN central-road scaffolding and artificial corner guides only
            // where long real-building chains have physically taken over.
            map2RetireLegacyCentralRoadScaffolding();"""
if call_anchor not in s:
    raise SystemExit("MAP2-27 physical-call anchor missing")
s=s.replace(call_anchor,call_new,1)

p.write_text(s,encoding="utf-8")
print("MAP2-27 legacy central-road scaffolding retirement applied")
