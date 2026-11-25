#!/usr/bin/env python3
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MAP2-40: full-course architectural rhythm"
if marker in s:
    print("MAP2-40 already applied")
    raise SystemExit(0)
anchor="            queueMicrotask(()=>map2PropagateArchitecturalSectors());"
if s.count(anchor)!=1:
    raise SystemExit("MAP2-40 requires MAP2-39 propagation")
block=r'''
            // MAP2-40: full-course architectural rhythm.
            const map2FinalizeArchitecturalRhythm=()=>{
                const golden=window.starbladeMap2GapBlockSystem;
                const full=window.starbladeMap2FullGapSystem;
                const play=window.starbladeMap2PlayablePassages;
                if(!golden||!full||!play)return null;
                const physical=window.starbladeMap2BuildingColliders||[];
                const roots=map2ExactBuildingRoots();
                const rootByName=new Map(roots.map(r=>[r.name,r]));
                const pilotNames=new Set(golden.blocks.flatMap(b=>b.rootNames));
                const complexes=[...play.complexes,...full.extraComplexes];
                const blocks=[...golden.blocks,...full.extraBlocks].sort((a,b)=>a.from-b.from);
                const techSpan=(a,b)=>{
                    const n=Math.max(1,Math.ceil((b-a)/100));
                    for(let i=0;i<=n;i++)if(map2Segment(a+(b-a)*i/n).kind!=='TECH')return false;
                    return true;
                };
                const safeSegments=[];
                const pushSeg=(id,a,b,r)=>safeSegments.push({id,a,b,r});
                for(const m of (window.starbladeMap2ThroughRoute?.modules||[])){
                    const from=m.entrance.distance,to=m.exit.distance;
                    let prev=null;
                    const sample=[];
                    for(let d=from;d<to;d+=70)sample.push(d);
                    sample.push(to);
                    for(const d of sample){
                        const q=map2BuildingPassageAt(d),now={routeProgress:d,laneX:q.x,laneY:q.y};
                        if(prev)pushSeg(m.id+':'+d,prev,now,12.5);
                        prev=now;
                    }
                }
                for(const c of complexes)for(const p of c.passages)
                    for(let i=1;i<p.nodes.length;i++)pushSeg(p.id+':'+i,p.nodes[i-1],p.nodes[i],10.5);
                const hits=colliders=>new Set(safeSegments.filter(x=>colliders.some(o=>
                    courseSegmentTouch(o,x.a,x.b,x.r))).map(x=>x.id));
                const rhythm=[],changes=[],used=new Set();
                let prev=null,run=0;
                for(const b of blocks){
                    const continuous=prev&&b.from>=prev.to&&b.from-prev.to<3200&&techSpan(prev.to,b.from);
                    const same=continuous&&prev.style===b.style;
                    run=same?run+1:1;
                    const q0=map2BuildingPassageAt(Math.max(b.from,b.focusDistance-120));
                    const q1=map2BuildingPassageAt(Math.min(b.to,b.focusDistance+120));
                    const lateral=q1.x-q0.x,vertical=q1.y-q0.y;
                    const widths=b.passages.map(p=>Math.min(p.width,p.height)).filter(Number.isFinite);
                    const opening=widths.length?Math.min(...widths):null;
                    const type=b.actualPassages>=2?'MULTI':b.breather||b.style==='BREATHER'?'OPEN_YARD':
                        b.chaos||b.style==='CHAOS'?'IRREGULAR':Math.abs(lateral)>=45?'TURN':
                        opening!==null&&opening<160?'COMPRESSION':'CORRIDOR';
                    const row={id:b.id,sector:b.sectorId||'GOLDEN_TECH_01',from:b.from,to:b.to,
                        style:b.style,type,run,opening,lateral,vertical,
                        gapBefore:continuous?Math.max(0,b.from-prev.to):null};
                    rhythm.push(row);prev=b;
                    // Refine only extended-sector single-route blocks. Preserve the
                    // golden prototype and every existing multi-passage complex.
                    if(!b.sectorId||b.actualPassages>=2||type==='OPEN_YARD'||type==='IRREGULAR')continue;
                    if(!(run>=2||type==='TURN'||b.index%3===1))continue;
                    for(const n of b.rootNames){
                        if(used.has(n)||pilotNames.has(n))continue;
                        const root=rootByName.get(n);
                        if(!root||root.userData.map2SectorArchitectureYaw)continue;
                        const changed=physical.filter(o=>o.sourceRoot===n);
                        if(!changed.length||changed.some(o=>!o.mesh))continue;
                        const before=hits(changed);
                        const old=root.quaternion.clone();
                        const saved=changed.map(o=>({o,fields:Object.fromEntries(
                            ['laneX','laneY','halfX','halfY','halfDepth','radius'].map(k=>[k,o[k]]))}));
                        const restore=()=>{root.quaternion.copy(old);root.updateMatrix();root.updateMatrixWorld(true);
                            saved.forEach(({o,fields})=>Object.assign(o,fields));};
                        const sign=Math.abs(lateral)>12?Math.sign(lateral):(b.index%2?1:-1);
                        const deg=sign*(type==='TURN'?5.0:run>=2?3.5:2.5);
                        let accepted=0;
                        for(const factor of [1,.5,.25]){
                            restore();
                            root.rotateY(THREE.MathUtils.degToRad(deg*factor));
                            root.updateMatrix();root.updateMatrixWorld(true);
                            for(const o of changed){
                                const box=new THREE.Box3().setFromObject(o.mesh);
                                if(box.isEmpty()||!Number.isFinite(o.routeProgress))continue;
                                const q=map2ProjectedBoxAt(box,o.routeProgress);
                                o.laneX=(q.minX+q.maxX)*.5;o.laneY=(q.minY+q.maxY)*.5;
                                o.halfX=Math.min(215,Math.max(22,(q.maxX-q.minX)*.5*.78));
                                o.halfY=Math.min(205,Math.max(22,(q.maxY-q.minY)*.5*.78));
                                o.halfDepth=Math.min(230,Math.max(10,(q.maxZ-q.minZ)*.5*.72));
                                o.radius=Math.hypot(o.halfX,o.halfY,o.halfDepth);
                            }
                            if([...hits(changed)].every(id=>before.has(id))){accepted=deg*factor;break;}
                        }
                        if(!accepted){restore();continue;}
                        used.add(n);root.userData.map2FullRhythmYaw=accepted;
                        changes.push({root:n,block:b.id,yaw:accepted,type});
                        break;
                    }
                }
                // Reduce the visual width and length of existing service links
                // near open yards; keep their centres, support pads and draw count.
                const trimmed=[];
                map2CourseGroup.traverse(o=>{
                    if(!o.userData?.map2BuildingConnector||!o.userData.map2VisualOnly)return;
                    const d=Number(o.userData.map2Distance);
                    if(!Number.isFinite(d)||map2Segment(d).kind!=='TECH'||d>=golden.from&&d<=golden.to)return;
                    const b=full.extraBlocks.find(b=>d>=b.from&&d<=b.to);
                    if(!b||!(b.breather||b.style==='BREATHER'||b.style==='CHAOS'))return;
                    const m=o.children?.find(x=>x.isMesh);
                    if(!m)return;
                    const before={w:m.scale.x,d:m.scale.z};
                    const factor=b.style==='CHAOS'?.82:.66;
                    m.scale.x*=factor;m.scale.z*=factor;
                    m.updateMatrix();m.updateMatrixWorld(true);
                    o.userData.map2RhythmShortService=true;
                    trimmed.push({name:o.name,block:b.id,d,before,after:{w:m.scale.x,d:m.scale.z}});
                });
                // Measure actual branch approach visibility in every extension,
                // using the same world-space geometry method as the golden sector.
                const rootBounds=roots.map(root=>{
                    root.updateMatrixWorld(true);
                    return {root,box:new THREE.Box3().setFromObject(root)};
                }).filter(x=>!x.box.isEmpty());
                const ray=new THREE.Raycaster();
                const world=(d,x,y)=>{
                    const f=getRaceFrameAtDistance(d);
                    return f.center.clone().addScaledVector(f.right,x).addScaledVector(f.up,y);
                };
                const visible=(a,b)=>{
                    const v=b.clone().sub(a),len=v.length();
                    if(len<1)return true;
                    ray.set(a,v.multiplyScalar(1/len));ray.near=.5;ray.far=Math.max(.5,len-6);
                    for(const x of rootBounds){
                        if(!ray.ray.intersectsBox(x.box))continue;
                        if(ray.intersectObject(x.root,true).some(h=>h.distance<ray.far))return false;
                    }
                    return true;
                };
                const at=(p,d)=>{
                    const n=p.nodes;if(d<n[0].routeProgress||d>n[n.length-1].routeProgress)return null;
                    let i=1;while(i<n.length-1&&n[i].routeProgress<d)i++;
                    const a=n[i-1],b=n[i],t=THREE.MathUtils.clamp((d-a.routeProgress)/Math.max(1,b.routeProgress-a.routeProgress),0,1);
                    return {x:THREE.MathUtils.lerp(a.laneX,b.laneX,t),y:THREE.MathUtils.lerp(a.laneY,b.laneY,t)};
                };
                const visibility=[];
                for(const c of full.extraComplexes){
                    let split=null;
                    for(let d=Math.max(...c.passages.map(p=>p.start));d<c.focusDistance;d+=25){
                        const points=c.passages.map(p=>at(p,d));if(points.some(p=>!p))continue;
                        let sep=Infinity;
                        for(let i=0;i<points.length;i++)for(let j=i+1;j<points.length;j++)
                            sep=Math.min(sep,Math.hypot(points[i].x-points[j].x,points[i].y-points[j].y));
                        if(sep>=75){split={d,points,sep};break;}
                    }
                    const probes=[];
                    if(split)for(const lead of [60,120,220,340,480]){
                        const d=split.d-lead;
                        if(d<0||!techSpan(d,split.d))continue;
                        const q=map2BuildingPassageAt(d),f=getRaceFrameAtDistance(d);
                        const origin=world(d,q.x-1.45,q.y+5.1).addScaledVector(f.tangent,-18.2);
                        const ids=[];
                        split.points.forEach((p,i)=>{
                            const target=world(split.d,p.x,p.y),v=target.clone().sub(origin),z=v.dot(f.tangent);
                            if(z>0&&Math.abs(v.dot(f.right))<=z*1.2&&Math.abs(v.dot(f.up))<=z*.67&&visible(origin,target))
                                ids.push(c.passages[i].id);
                        });
                        probes.push({lead,visibleIds:ids,allVisible:ids.length===c.passages.length});
                    }
                    const branches=c.passages.map(p=>{
                        const maxLead=Math.max(0,...probes.filter(x=>x.visibleIds.includes(p.id)).map(x=>x.lead));
                        if(p.routeCostMetrics)p.routeCostMetrics.visibleLead=probes.length?maxLead:null;
                        return {id:p.id,maxLead};
                    });
                    const report={id:c.id,splitDistance:split?.d??null,minSeparation:split?.sep??null,
                        probes,branches,allVisibleLead:Math.max(0,...probes.filter(p=>p.allVisible).map(p=>p.lead))};
                    c.approachVisibility=report;visibility.push(report);
                }
                const rhythmCounts={};
                for(const r of rhythm)rhythmCounts[r.type]=(rhythmCounts[r.type]||0)+1;
                let fast=0,tech=0,other=0;
                for(let d=0;d<MAP2_DISTANCE;d+=100){
                    const len=Math.min(100,MAP2_DISTANCE-d),kind=map2Segment(d+len*.5).kind;
                    if(kind==='FAST')fast+=len;else if(kind==='TECH')tech+=len;else other+=len;
                }
                const result={distance:MAP2_DISTANCE,fast,tech,other,blocks:rhythm,counts:rhythmCounts,
                    changes,trimmed,visibility,coveredGroups:full.coveredGroups,
                    eligibleGroups:full.totalEligibleGroups,safetySegments:safeSegments.length};
                window.starbladeMap2FullRhythm=result;
                return result;
            };
'''
s=s.replace(anchor,block+"\n"+anchor+"\n            queueMicrotask(()=>map2FinalizeArchitecturalRhythm());",1)
p.write_text(s,encoding="utf-8")
print("Applied MAP2-40 full-course rhythm, compact service links and real approach visibility")
