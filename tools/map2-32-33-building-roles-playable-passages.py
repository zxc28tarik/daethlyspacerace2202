#!/usr/bin/env python3
from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MAP2-32/33: building roles and playable multi-passage complexes"
if marker in s:
    print("MAP2-32/33 already applied")
    raise SystemExit(0)

gap_call="            map2BuildBuildingGapBlockSystem();\n"
if s.count(gap_call)!=1:
    raise SystemExit(f"MAP2-32/33 gap-system call anchor expected 1, got {s.count(gap_call)}")

build_block=r'''
            // MAP2-32/33: building roles and playable multi-passage complexes.
            // MAP2-30 found candidate gaps from real Map4 geometry. This pass turns
            // those candidates into design roles and rejects any alternative whose
            // entry->opening->exit tube is not collision-free in the actual copied
            // architecture. No fake second or third lane is manufactured.
            const map2BuildPlayableGapComplexes=()=>{
                const sys=window.starbladeMap2GapBlockSystem;
                const physical=window.starbladeMap2BuildingColliders||[];
                if(!sys?.blocks?.length)return null;

                const roleForStyle=style=>({
                    TRIPLE:'MULTI_HUB',
                    DUAL:'SPLIT_GATE',
                    CHAOS:'CHAOS_CLUSTER',
                    BREATHER:'OPEN_YARD',
                    CHICANE:'TURN_LOCK',
                    NARROW:'COMPRESSION',
                    CORRIDOR:'CANYON'
                })[style]||'CANYON';

                const roots=map2ExactBuildingRoots();
                const rootByName=new Map(roots.map(r=>[r.name,r]));
                const roleCounts={};
                const complexes=[];
                let playableDual=0,playableTriple=0,rejectedBranches=0,gateConflicts=0;

                const nodeAt=(d,x,y)=>({routeProgress:d,laneX:x,laneY:y});
                const blocked=nodes=>{
                    for(let i=1;i<nodes.length;i++){
                        const a=nodes[i-1],b=nodes[i];
                        if(physical.some(o=>o.active!==false&&courseSegmentTouch(o,a,b,10.5)))
                            return true;
                    }
                    return false;
                };
                const gateConflict=nodes=>{
                    for(const g of map2Gates){
                        if(g.distance<=nodes[0].routeProgress+35||
                           g.distance>=nodes[nodes.length-1].routeProgress-35)continue;
                        let hi=1;
                        while(hi<nodes.length&&nodes[hi].routeProgress<g.distance)hi++;
                        if(hi>=nodes.length)continue;
                        const a=nodes[hi-1],b=nodes[hi];
                        const t=THREE.MathUtils.clamp(
                            (g.distance-a.routeProgress)/
                            Math.max(1,b.routeProgress-a.routeProgress),0,1
                        );
                        const x=THREE.MathUtils.lerp(a.laneX,b.laneX,t);
                        const y=THREE.MathUtils.lerp(a.laneY,b.laneY,t);
                        const ok=g.openings?.some(o=>
                            Math.abs(x-o.x)<=Math.max(22,o.halfWidth-18)&&
                            Math.abs(y-o.y)<=Math.max(18,o.halfHeight-16)
                        );
                        if(!ok)return true;
                    }
                    return false;
                };

                const makeRoute=(block,passage)=>{
                    const focus=block.focusDistance;
                    // Try progressively shorter merges. Complexes near a hard gate
                    // often need a tighter branch, while open yards can fan out early.
                    for(const ratio of [.34,.27,.21,.16]){
                        const half=THREE.MathUtils.clamp(block.span*ratio,135,430);
                        const start=Math.max(block.from+20,focus-half);
                        const end=Math.min(block.to-20,focus+half);
                        if(end-start<210)continue;

                        const entry=map2BuildingPassageAt(start);
                        const exit=map2BuildingPassageAt(end);
                        const aD=THREE.MathUtils.lerp(start,focus,.56);
                        const bD=THREE.MathUtils.lerp(focus,end,.44);
                        const aBase=map2BuildingPassageAt(aD);
                        const bBase=map2BuildingPassageAt(bD);
                        const nodes=[
                            nodeAt(start,entry.x,entry.y),
                            nodeAt(aD,
                                THREE.MathUtils.lerp(aBase.x,passage.x,.68),
                                THREE.MathUtils.lerp(aBase.y,passage.y,.68)),
                            nodeAt(focus,passage.x,passage.y),
                            nodeAt(bD,
                                THREE.MathUtils.lerp(passage.x,bBase.x,.68),
                                THREE.MathUtils.lerp(passage.y,bBase.y,.68)),
                            nodeAt(end,exit.x,exit.y)
                        ];
                        const hasGateConflict=gateConflict(nodes);
                        if(hasGateConflict){gateConflicts++;continue;}
                        if(blocked(nodes))continue;
                        return {
                            id:passage.id,
                            role:passage.role,
                            widthClass:passage.widthClass,
                            altitudeClass:passage.altitudeClass,
                            width:passage.width,height:passage.height,
                            framedRatio:passage.framedRatio,
                            nodes,
                            start,end,focus,
                            collisionFree:true,
                            gateConflict:false
                        };
                    }
                    return null;
                };

                for(const block of sys.blocks){
                    block.buildingRole=roleForStyle(block.style);
                    roleCounts[block.buildingRole]=(roleCounts[block.buildingRole]||0)+1;

                    // Give the complete real Map4 shells an architectural job; for
                    // CHAOS blocks vary subroles to break the sterile wall-wall rhythm.
                    block.rootNames.forEach((name,ri)=>{
                        const root=rootByName.get(name);
                        if(!root)return;
                        let subRole=block.buildingRole;
                        if(block.buildingRole==='CHAOS_CLUSTER'){
                            subRole=['ANCHOR_MASS','OFFSET_WALL','SIGHT_BREAKER'][ri%3];
                        }else if(block.buildingRole==='MULTI_HUB'){
                            subRole=ri%2?'PASSAGE_FRAME':'HUB_MASS';
                        }else if(block.buildingRole==='SPLIT_GATE'){
                            subRole=ri%2?'SPLIT_FRAME':'SPLIT_MASS';
                        }
                        root.userData.map2BuildingRole=block.buildingRole;
                        root.userData.map2BuildingSubRole=subRole;
                    });

                    if(block.actualPassages<2)continue;
                    const routes=[];
                    for(const passage of block.passages){
                        const route=makeRoute(block,passage);
                        if(route)routes.push(route);
                        else rejectedBranches++;
                    }
                    // A DUAL/TRIPLE label only becomes playable when its real geometry
                    // still supports at least two independently validated branches.
                    if(routes.length<2)continue;
                    const playableCount=Math.min(block.targetPassages,routes.length);
                    const kept=routes.slice(0,playableCount);
                    if(playableCount>=3)playableTriple++;
                    else playableDual++;
                    block.playablePassages=kept;
                    block.playablePassageCount=playableCount;
                    block.playable=true;
                    complexes.push({
                        id:block.id,style:block.style,buildingRole:block.buildingRole,
                        from:block.from,to:block.to,focusDistance:block.focusDistance,
                        passages:kept
                    });
                }

                const summary={
                    philosophy:'REAL_MAP4_GAPS_BECOME_BRANCHING_FLIGHT_LINES',
                    complexes,
                    playableComplexes:complexes.length,
                    playableDual,playableTriple,
                    rejectedBranches,gateConflicts,
                    roleCounts,
                    sectorFrom:sys.from,sectorTo:sys.to
                };
                window.starbladeMap2PlayablePassages=summary;
                Object.assign(map2VisualStageStats,{
                    buildingRoleBlocks:sys.blocks.length,
                    playableGapComplexes:summary.playableComplexes,
                    playableGapDual:playableDual,
                    playableGapTriple:playableTriple,
                    playableGapRejected:rejectedBranches
                });
                return summary;
            };
            map2BuildPlayableGapComplexes();
'''
s=s.replace(gap_call,gap_call+build_block+"\n",1)

global_anchor="        // MAP2-04/07: altitude patrol. Gameplay damage stays fixed; MAP2-07 adds readable approach/lock/breakaway motion."
if global_anchor not in s:
    raise SystemExit("MAP2-32/33 global helper anchor missing")

global_helpers=r'''
        // MAP2-33: choose and interpolate a validated real-building branch for rivals.
        // Choice persists per complex so a pilot never changes its mind halfway through.
        function map2GapRacerProfile(r){
            const raw=[
                r?.pilotProfile?.id,r?.pilotProfile?.name,
                r?.profile?.id,r?.profile?.name,
                r?.aiProfile?.id,r?.aiProfile?.name,
                r?.aiStyle,r?.personality,r?.name
            ].filter(Boolean).join(' ').toUpperCase();
            if(raw.includes('CAUTIOUS')||raw.includes('CYBER'))return 'CAUTIOUS';
            if(raw.includes('AGGRESSIVE')||raw.includes('BLAZE'))return 'AGGRESSIVE';
            if(raw.includes('SPEED')||raw.includes('VIPER'))return 'SPEED';
            return 'BALANCED';
        }

        function map2GapComplexAt(distance){
            const sys=window.starbladeMap2PlayablePassages;
            return sys?.complexes?.find(c=>distance>=c.from&&distance<=c.to)||null;
        }

        function map2GapChoosePassage(r,complex){
            if(!r||!complex?.passages?.length)return null;
            r.map2GapChoices=r.map2GapChoices||{};
            const existing=r.map2GapChoices[complex.id];
            const valid=complex.passages.find(p=>p.id===existing);
            if(valid)return valid;

            const profile=map2GapRacerProfile(r);
            const occupied=new Map();
            if(typeof racers!=='undefined'&&Array.isArray(racers)){
                for(const other of racers){
                    if(other===r)continue;
                    const id=other.map2GapChoices?.[complex.id];
                    if(id)occupied.set(id,(occupied.get(id)||0)+1);
                }
            }
            const seed=String(r.name||'R').split('').reduce((n,ch)=>n+ch.charCodeAt(0),0);
            const scored=complex.passages.map((p,i)=>{
                let cost=Math.hypot((p.nodes[2].laneX-(r.laneX||0)),
                                    (p.nodes[2].laneY-(r.laneY||0))*.78)*.18;
                cost+=(occupied.get(p.id)||0)*92;
                if(profile==='SPEED'){
                    if(p.role==='FAST_HIGH_RISK')cost-=82;
                    if(p.role==='SHORT_TECHNICAL')cost-=24;
                    if(p.role==='SAFE_STANDARD')cost+=12;
                }else if(profile==='CAUTIOUS'){
                    if(p.role==='SAFE_STANDARD')cost-=68;
                    if(p.role==='FAST_HIGH_RISK')cost+=128;
                    if(p.role==='SHORT_TECHNICAL')cost+=46;
                }else if(profile==='AGGRESSIVE'){
                    if(p.role==='SHORT_TECHNICAL')cost-=78;
                    if(p.role==='FAST_HIGH_RISK')cost-=30;
                }else{
                    if(p.role==='SAFE_STANDARD')cost-=34;
                    if(p.role==='FAST_HIGH_RISK')cost+=18;
                }
                cost+=((seed+i*37)%23)*1.7;
                return {p,cost};
            }).sort((a,b)=>a.cost-b.cost);
            const chosen=scored[0]?.p||complex.passages[0];
            r.map2GapChoices[complex.id]=chosen.id;
            r.aiStats=r.aiStats||{};
            r.aiStats.map2GapChoicesMade=(r.aiStats.map2GapChoicesMade||0)+1;
            return chosen;
        }

        function map2GapRouteTargetAt(r,basePlan){
            if(!basePlan)return null;
            const complex=map2GapComplexAt(basePlan.distance);
            if(!complex)return basePlan;
            const passage=map2GapChoosePassage(r,complex);
            if(!passage?.nodes?.length)return basePlan;
            const d=basePlan.distance;
            if(d<passage.start||d>passage.end)return basePlan;
            const nodes=passage.nodes;
            let hi=1;
            while(hi<nodes.length&&nodes[hi].routeProgress<d)hi++;
            if(hi>=nodes.length)hi=nodes.length-1;
            const a=nodes[Math.max(0,hi-1)],b=nodes[hi];
            const t=THREE.MathUtils.clamp(
                (d-a.routeProgress)/Math.max(1,b.routeProgress-a.routeProgress),0,1
            );
            const smooth=t*t*(3-2*t);
            return {
                ...basePlan,
                x:THREE.MathUtils.lerp(a.laneX,b.laneX,smooth),
                y:THREE.MathUtils.lerp(a.laneY,b.laneY,smooth),
                multiPassage:true,
                complexId:complex.id,
                passageId:passage.id,
                passageRole:passage.role
            };
        }

'''
s=s.replace(global_anchor,global_helpers+global_anchor,1)

old_plan="""                const map2BuildingPlan=map2Pilot?map2ThroughRouteTargetAt(
                    r.routeProgress,
                    Math.min(620,Math.max(220,r.currentSpeed*.22))
                ):null;"""
new_plan="""                const map2BuildingBasePlan=map2Pilot?map2ThroughRouteTargetAt(
                    r.routeProgress,
                    Math.min(620,Math.max(220,r.currentSpeed*.22))
                ):null;
                const map2BuildingPlan=map2Pilot?map2GapRouteTargetAt(r,map2BuildingBasePlan):null;"""
if old_plan not in s:
    raise SystemExit("MAP2-32/33 rival building-plan anchor missing")
s=s.replace(old_plan,new_plan,1)

old_stats="""                        r.aiStats.map2BuildingRouteSeconds=(r.aiStats.map2BuildingRouteSeconds||0)+dt;
                        r.aiStats.map2BuildingRouteTargets=(r.aiStats.map2BuildingRouteTargets||0)+1;
                        if(map2BuildingPlan.inModule)
                            r.aiStats.map2ThroughBuildingSeconds=(r.aiStats.map2ThroughBuildingSeconds||0)+dt;"""
new_stats="""                        r.aiStats.map2BuildingRouteSeconds=(r.aiStats.map2BuildingRouteSeconds||0)+dt;
                        r.aiStats.map2BuildingRouteTargets=(r.aiStats.map2BuildingRouteTargets||0)+1;
                        if(map2BuildingPlan.multiPassage){
                            r.aiStats.map2MultiPassageSeconds=(r.aiStats.map2MultiPassageSeconds||0)+dt;
                            r.aiStats.map2MultiPassageTargets=(r.aiStats.map2MultiPassageTargets||0)+1;
                            r.aiStats.map2LastPassageId=map2BuildingPlan.passageId;
                            r.aiStats.map2LastPassageRole=map2BuildingPlan.passageRole;
                        }
                        if(map2BuildingPlan.inModule)
                            r.aiStats.map2ThroughBuildingSeconds=(r.aiStats.map2ThroughBuildingSeconds||0)+dt;"""
if old_stats not in s:
    raise SystemExit("MAP2-32/33 rival stats anchor missing")
s=s.replace(old_stats,new_stats,1)

s=s.replace("            // MAP2-30/31: systematic building blocks and real gap classification.",
            "            // MAP2-32/33: building roles and playable multi-passage complexes\n            // MAP2-30/31: systematic building blocks and real gap classification.",1)

p.write_text(s,encoding="utf-8")
print("Applied MAP2-32 building roles + MAP2-33 playable real multi-passages")
