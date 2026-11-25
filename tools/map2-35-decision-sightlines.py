#!/usr/bin/env python3
from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MAP2-35: architectural decision sightlines"
if marker in s:
    print("MAP2-35 already applied")
    raise SystemExit(0)

anchor="            // MAP2-34: controlled architectural chaos\n"
if s.count(anchor)!=1:
    raise SystemExit(f"MAP2-35 anchor expected 1, got {s.count(anchor)}")

block=r'''
            // MAP2-35: architectural decision sightlines.
            // Multi-route choices must read from the architecture itself, not from
            // floating arrows or a painted road. After the full course exists, toe
            // the real Map4 shells framing SPLIT_GATE / MULTI_HUB complexes slightly
            // outward. Every accepted change must preserve ALL validated branches.
            const map2ShapeDecisionSightlines=()=>{
                const play=window.starbladeMap2PlayablePassages;
                const physical=window.starbladeMap2BuildingColliders||[];
                const gap=window.starbladeMap2GapBlockSystem;
                if(!play?.complexes?.length||!gap?.blocks?.length||!physical.length)return null;

                const roots=map2ExactBuildingRoots();
                const rootByName=new Map(roots.map(r=>[r.name,r]));
                let shapedRoots=0,rejectedRoots=0,maxYaw=0;
                const rows=[];

                const refreshCollider=o=>{
                    const root=rootByName.get(o.sourceRoot);
                    if(!root||!o.mesh)return;
                    root.updateMatrixWorld(true);
                    const box=new THREE.Box3().setFromObject(o.mesh);
                    if(box.isEmpty())return;
                    const d=Number(o.routeProgress);
                    if(!Number.isFinite(d))return;
                    const q=map2ProjectedBoxAt(box,d);
                    o.laneX=(q.minX+q.maxX)*.5;
                    o.laneY=(q.minY+q.maxY)*.5;
                    o.halfX=Math.min(215,Math.max(22,(q.maxX-q.minX)*.5*.78));
                    o.halfY=Math.min(205,Math.max(22,(q.maxY-q.minY)*.5*.78));
                    o.halfDepth=Math.min(230,Math.max(10,(q.maxZ-q.minZ)*.5*.72));
                    o.radius=Math.hypot(o.halfX,o.halfY,o.halfDepth);
                };
                const refreshRoot=name=>{
                    physical.filter(o=>o.sourceRoot===name).forEach(refreshCollider);
                };
                const routeBlocked=complex=>{
                    for(const passage of complex.passages){
                        const nodes=passage.nodes;
                        for(let i=1;i<nodes.length;i++){
                            if(physical.some(o=>o.active!==false&&
                                courseSegmentTouch(o,nodes[i-1],nodes[i],10.5)))
                                return true;
                        }
                    }
                    return false;
                };

                for(const complex of play.complexes){
                    const block=gap.blocks.find(b=>b.id===complex.id);
                    if(!block)continue;
                    const blockRoots=block.rootNames.map(n=>rootByName.get(n)).filter(Boolean);
                    const accepted=[];
                    blockRoots.forEach((root,ri)=>{
                        // MULTI_HUB gets a little more visual fan than SPLIT_GATE.
                        const base=complex.passages.length>=3?5.2:3.8;
                        const laneHint=Number(root.userData?.map2SequenceLaneX ??
                                              root.userData?.map2RoadApertureX ?? 0);
                        // If both roots share a near-zero hint, alternate signs.
                        const sign=Math.abs(laneHint)>22?Math.sign(laneHint):(ri%2?1:-1);
                        // Outward toe: left mass opens left, right mass opens right.
                        const deg=sign*base;
                        const old=root.quaternion.clone();
                        root.rotateY(THREE.MathUtils.degToRad(deg));
                        root.updateMatrix();root.updateMatrixWorld(true);
                        refreshRoot(root.name);

                        if(routeBlocked(complex)){
                            root.quaternion.copy(old);
                            root.updateMatrix();root.updateMatrixWorld(true);
                            refreshRoot(root.name);
                            rejectedRoots++;
                            return;
                        }
                        root.userData.map2DecisionSightline=true;
                        root.userData.map2DecisionSightlineYawDeg=deg;
                        root.userData.map2DecisionComplex=complex.id;
                        accepted.push({name:root.name,yawDeg:deg});
                        shapedRoots++;
                        maxYaw=Math.max(maxYaw,Math.abs(deg));
                    });

                    const focus=complex.focusDistance;
                    const branchCenters=complex.passages.map(p=>p.nodes[
                        Math.floor(p.nodes.length/2)
                    ]);
                    let minSeparation=Infinity;
                    for(let i=0;i<branchCenters.length;i++)
                        for(let j=i+1;j<branchCenters.length;j++)
                            minSeparation=Math.min(minSeparation,Math.hypot(
                                branchCenters[i].laneX-branchCenters[j].laneX,
                                branchCenters[i].laneY-branchCenters[j].laneY
                            ));
                    if(!Number.isFinite(minSeparation))minSeparation=0;
                    // Decision lead is deliberately not identical everywhere.
                    const lead=complex.passages.length>=3?
                        THREE.MathUtils.clamp(block.span*.31,240,520):
                        THREE.MathUtils.clamp(block.span*.26,190,430);
                    complex.decisionLeadDistance=Math.max(block.from,focus-lead);
                    complex.minBranchSeparation=minSeparation;
                    complex.sightlineClass=
                        minSeparation>=300?'WIDE_READ':
                        minSeparation>=190?'CLEAR_SPLIT':'LATE_REVEAL';
                    complex.sightlineRoots=accepted;
                    rows.push({
                        id:complex.id,passages:complex.passages.length,
                        roots:blockRoots.length,accepted:accepted.length,
                        minBranchSeparation:minSeparation,sightlineClass:complex.sightlineClass,
                        decisionLeadDistance:complex.decisionLeadDistance,
                        yaws:accepted.map(x=>x.yawDeg)
                    });
                }

                const classCounts={};
                rows.forEach(r=>classCounts[r.sightlineClass]=(classCounts[r.sightlineClass]||0)+1);
                const summary={
                    philosophy:'REAL_BUILDINGS_FRAME_ROUTE_CHOICES_NO_FLOATING_ARROWS',
                    complexes:rows,
                    complexCount:rows.length,
                    shapedRoots,rejectedRoots,maxYaw,classCounts
                };
                window.starbladeMap2DecisionSightlines=summary;
                const sightStats={
                    decisionSightlineComplexes:rows.length,
                    decisionSightlineRoots:shapedRoots,
                    decisionSightlineRejected:rejectedRoots,
                    decisionSightlineMaxYawDeg:maxYaw
                };
                Object.assign(map2VisualStageStats,sightStats);
                if(window.starbladeMap2Layout?.visualStage)
                    Object.assign(window.starbladeMap2Layout.visualStage,sightStats);
                return summary;
            };
            queueMicrotask(()=>map2ShapeDecisionSightlines());

'''
s=s.replace(anchor,block+anchor,1)
p.write_text(s,encoding="utf-8")
print("Applied MAP2-35 real-building decision sightline shaping")
