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

                // MAP2-38: guard the primary through-building route as well as
                // alternate branches. Match the independent MAP2-28 audit,
                // including all colliders (not just those tagged active).
                const primarySegments=[];
                for(const m of (window.starbladeMap2ThroughRoute?.modules||[]).filter(m=>m.chicane)){
                    let prev=null;
                    for(let d=m.entrance.distance;d<=m.exit.distance+1;d+=70){
                        const dd=Math.min(d,m.exit.distance);
                        const q=map2BuildingPassageAt(dd);
                        const node={routeProgress:dd,laneX:q.x,laneY:q.y};
                        if(prev)primarySegments.push({id:m.id,a:prev,b:node});
                        prev=node;
                    }
                }
                const primaryBlocked=()=>new Set(primarySegments.filter(v=>
                    physical.some(o=>courseSegmentTouch(o,v.a,v.b,12.5))).map(v=>v.id));
                const preexistingPrimary=primaryBlocked();
                let primaryRejected=0;
                const primaryRejections=[];
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
                        const old=root.quaternion.clone();
                        const colliderState=physical.filter(o=>o.sourceRoot===root.name).map(o=>({
                            o,fields:Object.fromEntries(['laneX','laneY','halfX','halfY','halfDepth','radius'].map(k=>[k,o[k]]))
                        }));
                        const restore=()=>{
                            root.quaternion.copy(old);
                            root.updateMatrix();root.updateMatrixWorld(true);
                            colliderState.forEach(({o,fields})=>Object.assign(o,fields));
                        };
                        let deg=0;
                        for(const factor of [1,.5,.25]){
                            restore();
                            const candidate=sign*base*factor;
                            root.rotateY(THREE.MathUtils.degToRad(candidate));
                            root.updateMatrix();root.updateMatrixWorld(true);
                            refreshRoot(root.name);
                            const mainHits=[...primaryBlocked()].filter(id=>!preexistingPrimary.has(id));
                            if(mainHits.length){
                                primaryRejected++;
                                primaryRejections.push({root:root.name,yaw:candidate,modules:mainHits});
                                continue;
                            }
                            if(play.complexes.some(routeBlocked))continue;
                            deg=candidate;
                            break;
                        }
                        if(!deg){
                            restore();
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
                    const revealDistance=focus-complex.decisionLeadDistance;
                    complex.sightlineClass=
                        revealDistance>=340?'WIDE_READ':
                        revealDistance>=220?'CLEAR_SPLIT':'LATE_REVEAL';
                    complex.revealDistance=revealDistance;
                    complex.sightlineRoots=accepted;
                    rows.push({
                        id:complex.id,passages:complex.passages.length,
                        roots:blockRoots.length,accepted:accepted.length,
                        minBranchSeparation:minSeparation,sightlineClass:complex.sightlineClass,
                        decisionLeadDistance:complex.decisionLeadDistance,revealDistance:complex.revealDistance,
                        yaws:accepted.map(x=>x.yawDeg)
                    });
                }

                // Measure actual architectural visibility independently from authored
                // lead distances. This runs once at course construction, not per frame.
                // World-space rays are tested against the original Map4 shell meshes.
                const rootBounds=roots.map(root=>{
                    root.updateMatrixWorld(true);
                    return {root,box:new THREE.Box3().setFromObject(root)};
                }).filter(x=>!x.box.isEmpty());
                const raycaster=new THREE.Raycaster();
                const worldAt=(d,x,y)=>{
                    const f=getRaceFrameAtDistance(d);
                    return f.center.clone().addScaledVector(f.right,x).addScaledVector(f.up,y);
                };
                const visible=(origin,target)=>{
                    const direction=target.clone().sub(origin);
                    const length=direction.length();
                    if(length<1)return true;
                    raycaster.set(origin,direction.multiplyScalar(1/length));
                    raycaster.near=0.5;
                    raycaster.far=Math.max(.5,length-6);
                    for(const entry of rootBounds){
                        if(!raycaster.ray.intersectsBox(entry.box))continue;
                        const hits=raycaster.intersectObject(entry.root,true);
                        if(hits.some(h=>h.distance<raycaster.far))return false;
                    }
                    return true;
                };
                for(const complex of play.complexes){
                    const row=rows.find(r=>r.id===complex.id);
                    if(!row)continue;
                    const focus=complex.focusDistance;
                    const available=Math.min(720,Math.max(0,focus-complex.from));
                    const distances=Array.from(new Set([40,80,120,160,220,280,340,430,520,620,720,available]
                        .filter(d=>d>0&&d<=available))).sort((a,b)=>a-b);
                    const probes=distances.map(distance=>{
                        const d=focus-distance;
                        const q=map2BuildingPassageAt(d);
                        const f=getRaceFrameAtDistance(d);
                        const origin=worldAt(d,q.x,q.y+5.1).addScaledVector(f.tangent,-18.2);
                        const visibleIds=[];
                        for(const passage of complex.passages){
                            const center=passage.nodes.reduce((a,b)=>
                                Math.abs(b.routeProgress-focus)<Math.abs(a.routeProgress-focus)?b:a);
                            // Center plus two lateral samples: a tiny slit alone is
                            // not enough to count the opening as visually readable.
                            const offset=Math.min(36,Math.max(8,Number(passage.width||0)*.15));
                            const targets=[-offset,0,offset].map(dx=>
                                worldAt(center.routeProgress,center.laneX+dx,center.laneY));
                            const inView=targets.map(target=>{
                                const v=target.clone().sub(origin);
                                const forward=v.dot(f.tangent);
                                return forward>0&&Math.abs(v.dot(f.right))<=forward*1.2&&
                                    Math.abs(v.dot(f.up))<=forward*.67&&visible(origin,target);
                            });
                            if(inView[1]&&(inView[0]||inView[2]))visibleIds.push(passage.id);
                        }
                        return {distance,visibleIds,allVisible:visibleIds.length===complex.passages.length};
                    });
                    const branches=complex.passages.map(p=>{
                        const seen=probes.filter(q=>q.visibleIds.includes(p.id));
                        return {id:p.id,maxVisibleDistance:Math.max(0,...seen.map(q=>q.distance))};
                    });
                    const all=probes.filter(q=>q.allVisible);
                    const measuredAllVisibleDistance=Math.max(0,...all.map(q=>q.distance));
                    const observedClass=measuredAllVisibleDistance>=340?'WIDE_READ':
                        measuredAllVisibleDistance>=220?'CLEAR_SPLIT':
                        measuredAllVisibleDistance>0?'LATE_REVEAL':'OCCLUDED';
                    // Distinguish visibility of the deep opening from visibility
                    // of an already-separated branch approach. A bend can hide
                    // the deep aperture even when a pilot sees where to turn.
                    const at=(p,d)=>{
                        const n=p.nodes;
                        if(d<n[0].routeProgress||d>n[n.length-1].routeProgress)return null;
                        let i=1;
                        while(i<n.length-1&&n[i].routeProgress<d)i++;
                        const a=n[i-1],b=n[i];
                        const t=THREE.MathUtils.clamp((d-a.routeProgress)/Math.max(1,b.routeProgress-a.routeProgress),0,1);
                        return {x:THREE.MathUtils.lerp(a.laneX,b.laneX,t),y:THREE.MathUtils.lerp(a.laneY,b.laneY,t)};
                    };
                    const commonStart=Math.max(...complex.passages.map(p=>p.start));
                    const splitSamples=[];
                    for(let d=commonStart;d<focus;d+=25){
                        const points=complex.passages.map(p=>at(p,d));
                        if(points.some(p=>!p))continue;
                        let sep=Infinity;
                        for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)
                            sep=Math.min(sep,Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y));
                        if(sep>=75)splitSamples.push({d,points,sep});
                    }
                    const split=splitSamples[0]||null;
                    const approachProbes=[];
                    if(split){
                        // Sample before the first visible spatial separation, not
                        // after the pilot is already committed to an opening.
                        for(const lead of [60,120,220,340,480]){
                            const d=split.d-lead;
                            if(d<0||map2Segment(d).kind!=='TECH')continue;
                            const q=map2BuildingPassageAt(d),f=getRaceFrameAtDistance(d);
                            const origin=worldAt(d,q.x-1.45,q.y+5.1).addScaledVector(f.tangent,-18.2);
                            const ids=[];
                            split.points.forEach((p,i)=>{
                                const target=worldAt(split.d,p.x,p.y),v=target.clone().sub(origin);
                                const z=v.dot(f.tangent);
                                if(z>0&&Math.abs(v.dot(f.right))<=z*1.2&&Math.abs(v.dot(f.up))<=z*.67&&visible(origin,target))
                                    ids.push(complex.passages[i].id);
                            });
                            approachProbes.push({lead,visibleIds:ids,allVisible:ids.length===complex.passages.length});
                        }
                    }
                    const evidence={method:'WORLD_SPACE_MAP4_MESH_RAYS',probes,branches,
                        measuredAllVisibleDistance,observedClass,
                        approach:{splitDistance:split?.d??null,minSeparation:split?.sep??null,
                            probes:approachProbes,allVisibleLead:Math.max(0,...approachProbes.filter(p=>p.allVisible).map(p=>p.lead))}};
                    complex.visibilityEvidence=evidence;
                    row.visibilityEvidence=evidence;
                }
                const classCounts={};
                rows.forEach(r=>classCounts[r.sightlineClass]=(classCounts[r.sightlineClass]||0)+1);
                const observedClassCounts={};
                rows.forEach(r=>{
                    const cls=r.visibilityEvidence?.observedClass||'UNMEASURED';
                    observedClassCounts[cls]=(observedClassCounts[cls]||0)+1;
                });
                const summary={
                    observedClassCounts,
                    primarySafety:{checkedSegments:primarySegments.length,
                        blockedBefore:[...preexistingPrimary],blockedAfter:[...primaryBlocked()],
                        rejectedAttempts:primaryRejected,rejections:primaryRejections},
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

'''
s=s.replace(anchor,block+anchor,1)
chaos_call="            queueMicrotask(()=>map2AuthorControlledChaos());"
if s.count(chaos_call)!=1:
    raise SystemExit("MAP2-35 expects exactly one MAP2-34 deferred call")
s=s.replace(chaos_call,chaos_call+"\n            queueMicrotask(()=>map2ShapeDecisionSightlines());",1)
p.write_text(s,encoding="utf-8")
print("Applied MAP2-35 real-building decision sightline shaping")
