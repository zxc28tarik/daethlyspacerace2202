#!/usr/bin/env python3
from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MAP2-34: controlled architectural chaos"
if marker in s:
    print("MAP2-34 already applied")
    raise SystemExit(0)

anchor="            map2BuildPlayableGapComplexes();\n"
if s.count(anchor)!=1:
    raise SystemExit(f"MAP2-34 anchor expected 1, got {s.count(anchor)}")

block=r'''
            // MAP2-34: controlled architectural chaos.
            // Chaos means real Map4 complexes stop sitting at neat parallel angles,
            // NOT that collision/navigation becomes random. We skew complete building
            // shells around their existing grounded footprint, refresh their derived
            // physics, and automatically revert any skew that closes the real route.
            const map2AuthorControlledChaos=()=>{
                const sys=window.starbladeMap2GapBlockSystem;
                const physical=window.starbladeMap2BuildingColliders||[];
                if(!sys?.blocks?.length||!physical.length)return null;

                const roots=map2ExactBuildingRoots();
                const rootByName=new Map(roots.map(r=>[r.name,r]));
                const chaos=sys.blocks.filter(b=>b.buildingRole==='CHAOS_CLUSTER'||b.style==='CHAOS');
                const rows=[];
                let rotatedRoots=0,rejectedRoots=0,maxYaw=0;

                const refreshCollider=o=>{
                    const root=rootByName.get(o.sourceRoot);
                    if(!root||!o.mesh)return;
                    root.updateMatrixWorld(true);
                    const box=new THREE.Box3().setFromObject(o.mesh);
                    if(box.isEmpty())return;
                    // Keep the collider in its authored longitudinal section.
                    // Controlled chaos changes building angle, not course ownership.
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
                const refreshRootColliders=name=>{
                    physical.filter(o=>o.sourceRoot===name).forEach(refreshCollider);
                };
                const routeBlocked=block=>{
                    let prev=null;
                    const from=Math.max(0,block.from-70),to=Math.min(MAP2_DISTANCE,block.to+70);
                    for(let d=from;d<=to+1;d+=55){
                        const dd=Math.min(d,to);
                        const q=map2BuildingPassageAt(dd);
                        const now={routeProgress:dd,laneX:q.x,laneY:q.y};
                        if(prev&&physical.some(o=>o.active!==false&&courseSegmentTouch(o,prev,now,12.5)))
                            return true;
                        prev=now;
                    }
                    return false;
                };

                chaos.forEach((block,bi)=>{
                    const blockRoots=block.rootNames.map(n=>rootByName.get(n)).filter(Boolean);
                    const accepted=[];
                    blockRoots.forEach((root,ri)=>{
                        // Intentionally non-uniform: adjacent shells toe in/out by
                        // different amounts instead of following a repeating cadence.
                        const deg=[-8.5,5.5,-4.0,9.0,-6.5,3.5][(bi*3+ri)%6];
                        const angle=THREE.MathUtils.degToRad(deg);
                        const oldQuat=root.quaternion.clone();
                        root.rotateY(angle);
                        root.updateMatrix();root.updateMatrixWorld(true);
                        refreshRootColliders(root.name);

                        if(routeBlocked(block)){
                            root.quaternion.copy(oldQuat);
                            root.updateMatrix();root.updateMatrixWorld(true);
                            refreshRootColliders(root.name);
                            rejectedRoots++;
                            return;
                        }
                        root.userData.map2ControlledChaos=true;
                        root.userData.map2ControlledChaosYawDeg=deg;
                        accepted.push({name:root.name,yawDeg:deg});
                        rotatedRoots++;
                        maxYaw=Math.max(maxYaw,Math.abs(deg));
                    });
                    block.controlledChaosRoots=accepted;
                    block.controlledChaos=true;
                    rows.push({
                        id:block.id,from:block.from,to:block.to,
                        roots:blockRoots.length,accepted:accepted.length,
                        yaws:accepted.map(x=>x.yawDeg)
                    });
                });

                const summary={
                    philosophy:'ASYMMETRIC_REAL_BUILDINGS_WITH_ROUTE_SAFETY',
                    blocks:rows,
                    chaosBlocks:chaos.length,
                    rotatedRoots,rejectedRoots,maxYaw
                };
                window.starbladeMap2ControlledChaos=summary;
                const chaosStats={
                    controlledChaosBlocks:chaos.length,
                    controlledChaosRotatedRoots:rotatedRoots,
                    controlledChaosRejectedRoots:rejectedRoots,
                    controlledChaosMaxYawDeg:maxYaw
                };
                Object.assign(map2VisualStageStats,chaosStats);
                // MAP2-34 runs in a microtask after the layout snapshot is published.
                // Mirror the late telemetry into that public snapshot as well.
                if(window.starbladeMap2Layout?.visualStage)
                    Object.assign(window.starbladeMap2Layout.visualStage,chaosStats);
                return summary;
            };
            // Defer until map2BuildCourse finishes so all derived physics, supports
            // and route structures are guaranteed to exist.
            queueMicrotask(()=>map2AuthorControlledChaos());
'''

s=s.replace(anchor,anchor+block+"\n",1)

s=s.replace("            // MAP2-32/33: building roles and playable multi-passage complexes",
            "            // MAP2-34: controlled architectural chaos\n            // MAP2-32/33: building roles and playable multi-passage complexes",1)

p.write_text(s,encoding="utf-8")
print("Applied MAP2-34 controlled asymmetry with route-safe real Map4 building skew")
