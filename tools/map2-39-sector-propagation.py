#!/usr/bin/env python3
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MAP2-39: sector-by-sector architectural propagation"
if marker in s:
    print("MAP2-39 already applied")
    raise SystemExit(0)
def rep(a,b):
    global s
    if s.count(a)!=1:
        raise SystemExit("MAP2-39 anchor expected once: "+a[:100])
    s=s.replace(a,b,1)

# Reuse the proven gap scanner, but isolate pilot telemetry and identifiers.
rep("const map2BuildBuildingGapBlockSystem=()=>{",
    "const map2BuildBuildingGapBlockSystem=(override=null)=>{")
rep("const chain=chains.chains\n",
    "const chain=override?.chain || (chains.chains\n")
rep("|| chains.chains.slice().sort((a,b)=>b.span-a.span)[0];",
    "|| chains.chains.slice().sort((a,b)=>b.span-a.span)[0]);")
rep("const groups=road.groups\n                    .filter(g=>g.open&&g.d>=chain.from&&g.d<=chain.to&&map2Segment(g.d).kind==='TECH')\n                    .slice().sort((a,b)=>a.d-b.d);\n                if(groups.length<12)return null;",
    "const groups=override?.groups || road.groups\n                    .filter(g=>g.open&&g.d>=chain.from&&g.d<=chain.to&&map2Segment(g.d).kind==='TECH')\n                    .slice().sort((a,b)=>a.d-b.d);\n                if(groups.length<(override?1:12))return null;")
rep("let take=countPattern[bi%countPattern.length];",
    "let take=countPattern[(bi+(override?.phase||0))%countPattern.length];")
rep("id:'MAP2_GAP_BLOCK_'+rawBlocks.length,",
    "id:(override?'MAP2_GAP_'+override.id+'_BLOCK_':'MAP2_GAP_BLOCK_')+rawBlocks.length,")
rep("b.passageCapacity>=3).slice(0,3).map(b=>b.id)",
    "b.passageCapacity>=3).slice(0,override?Math.max(0,Math.round(rawBlocks.length*.12)):3).map(b=>b.id)")
rep("!tripleSet.has(b.id)).slice(0,6).map(b=>b.id)",
    "!tripleSet.has(b.id)).slice(0,override?Math.max(1,Math.round(rawBlocks.length*.24)):6).map(b=>b.id)")
rep(").slice(0,3).map(b=>b.id));\n                const chaosSet",
    ").slice(0,override?Math.round(rawBlocks.length*.15):3).map(b=>b.id));\n                const chaosSet")
rep(").slice(0,4).map(b=>b.id));\n\n                const blocks",
    ").slice(0,override?Math.round(rawBlocks.length*.20):4).map(b=>b.id));\n\n                const blocks")
rep("let style=baseStyle[(i*7+i*i)%baseStyle.length];",
    "let style=baseStyle[(i*7+i*i+(override?.phase||0))%baseStyle.length];")
rep("sector:'GOLDEN_TECH_01',","sector:override?.id||'GOLDEN_TECH_01',")
rep("                window.starbladeMap2GapBlockSystem=summary;",
    "                if(override)return summary;\n                window.starbladeMap2FullGapSystem=null;\n                window.starbladeMap2GapBlockSystem=summary;")
# Reuse branch validation without changing the golden sector's public contract.
rep("const map2BuildPlayableGapComplexes=()=>{\n                const sys=window.starbladeMap2GapBlockSystem;",
    "const map2BuildPlayableGapComplexes=(override=null)=>{\n                const sys=override||window.starbladeMap2GapBlockSystem;")
rep("                window.starbladeMap2PlayablePassages=summary;",
    "                if(override)return summary;\n                window.starbladeMap2PlayablePassages=summary;")
rep("return sys?.complexes?.find(c=>distance>=c.from&&distance<=c.to)||null;",
    "return sys?.complexes?.find(c=>distance>=c.from&&distance<=c.to)||\n                window.starbladeMap2FullGapSystem?.extraComplexes?.find(c=>distance>=c.from&&distance<=c.to)||null;")

block=r'''
            // MAP2-39: sector-by-sector architectural propagation.
            const map2PropagateArchitecturalSectors=()=>{
                const golden=window.starbladeMap2GapBlockSystem;
                const goldenPlay=window.starbladeMap2PlayablePassages;
                const road=window.starbladeMap2BuildingRoad;
                if(!golden||!goldenPlay||!road?.groups?.length)return null;
                const all=road.groups.filter(g=>g.open&&map2Segment(g.d).kind==='TECH')
                    .slice().sort((a,b)=>a.d-b.d);
                const pending=all.filter(g=>g.d<golden.from||g.d>golden.to);
                const isTechSpan=(a,b)=>{
                    if(a>b)return false;
                    const steps=Math.max(1,Math.ceil((b-a)/100));
                    for(let i=0;i<=steps;i++)
                        if(map2Segment(THREE.MathUtils.lerp(a,b,i/steps)).kind!=='TECH')return false;
                    return true;
                };
                const goldenNames=new Set(golden.blocks.flatMap(b=>b.rootNames));
                const assignedNames=new Set(goldenNames);
                const roots=map2ExactBuildingRoots();
                const rootByName=new Map(roots.map(r=>[r.name,r]));
                const physical=window.starbladeMap2BuildingColliders||[];
                const partitions=[];
                for(const g of pending){
                    const last=partitions[partitions.length-1];
                    const prev=last?.[last.length-1];
                    if(!last||g.d-prev.d>3200||g.d-last[0].d>24000||
                        (prev.d<golden.from&&g.d>golden.to)||!isTechSpan(prev.d,g.d))
                        partitions.push([g]);
                    else last.push(g);
                }
                const sectors=[],extraComplexes=[],extraBlocks=[];
                let droppedComplexes=0;
                for(let i=0;i<partitions.length;i++){
                    const members=partitions[i];
                    const id='TECH_EXT_'+String(i+1).padStart(2,'0');
                    const first=members[0].d,last=members[members.length-1].d;
                    let from=Math.max(0,first-200),to=Math.min(MAP2_DISTANCE,last+200);
                    if(first>golden.to)from=Math.max(from,golden.to+1);
                    if(last<golden.from)to=Math.min(to,golden.from-1);
                    if(i>0)from=Math.max(from,partitions[i-1].slice(-1)[0].d+1);
                    if(i+1<partitions.length)to=Math.min(to,partitions[i+1][0].d-1);
                    if(!isTechSpan(from,first))from=first;
                    if(!isTechSpan(last,to))to=last;
                    const groups=members.map(g=>({...g,rootNames:(g.rootNames||[]).filter(n=>!assignedNames.has(n))}));
                    const sys=map2BuildBuildingGapBlockSystem({id,phase:(i*5+3)%17,
                        chain:{from,to,span:to-from},groups});
                    if(!sys)continue;
                    for(const b of sys.blocks)for(const n of b.rootNames)assignedNames.add(n);
                    const play=map2BuildPlayableGapComplexes(sys);
                    // Publish only genuinely validated choices. A rejected candidate
                    // remains a single-route architectural block, never a fake junction.
                    const playableIds=new Map((play?.complexes||[]).map(c=>[c.id,c]));
                    for(const b of sys.blocks){
                        b.sectorId=id;
                        const c=playableIds.get(b.id);
                        if(b.targetPassages>1&&!c){
                            droppedComplexes++;
                            b.style='CORRIDOR';b.buildingRole='CANYON';
                            b.targetPassages=1;b.actualPassages=Math.min(1,b.passages.length);
                            b.passages=b.passages.slice(0,1);
                        }else if(c&&c.passages.length<b.targetPassages){
                            b.style='DUAL';b.buildingRole='SPLIT_GATE';
                            b.targetPassages=c.passages.length;b.actualPassages=c.passages.length;
                            const ids=new Set(c.passages.map(p=>p.id));
                            b.passages=b.passages.filter(p=>ids.has(p.id));
                            c.style=b.style;c.buildingRole=b.buildingRole;
                        }
                        for(const n of b.rootNames){
                            const root=rootByName.get(n);
                            if(!root)continue;
                            Object.assign(root.userData,{map2GapSector:id,map2GapBlockStyle:b.style,
                                map2GapBlockPassages:b.actualPassages,map2BuildingRole:b.buildingRole});
                        }
                        extraBlocks.push(b);
                    }
                    extraComplexes.push(...(play?.complexes||[]));
                    sectors.push({id,from,to,groups:members.length,groupDistances:members.map(g=>g.d),
                        blocks:sys.blocks.map(b=>b.id),complexes:(play?.complexes||[]).map(c=>c.id)});
                }
                const allComplexes=[...goldenPlay.complexes,...extraComplexes];
                const primary=[];
                for(const m of (window.starbladeMap2ThroughRoute?.modules||[])){
                    let prev=null;
                    for(let d=m.entrance.distance;d<=m.exit.distance+1;d+=70){
                        const dd=Math.min(d,m.exit.distance),q=map2BuildingPassageAt(dd);
                        const now={routeProgress:dd,laneX:q.x,laneY:q.y};
                        if(prev)primary.push([prev,now]);
                        prev=now;
                    }
                }
                // Protect the older MAP2-19 aperture contract too: a straight
                // 300 m pilot tube through every original building group.
                for(const g of all){
                    const a={routeProgress:g.d-150,laneX:g.x,laneY:g.y};
                    primary.push([a,{...a,routeProgress:g.d+150}]);
                }
                const sections=new Set(map2Sections);
                const ownerOf=o=>{while(o&&!sections.has(o))o=o.parent;return o;};
                const owned=o=>{
                    const g=ownerOf(o.mesh);
                    if(!g)return false;
                    const from=g.userData.architectureFrom??g.userData.from;
                    const to=g.userData.architectureTo??g.userData.to;
                    return from<=o.routeProgress-(o.halfDepth||0)&&to>=o.routeProgress+(o.halfDepth||0);
                };
                const safe=changed=>{
                    if(changed.some(o=>!owned(o)))return false;
                    for(const [a,b] of primary)
                        if(changed.some(o=>courseSegmentTouch(o,a,b,12.5)))return false;
                    for(const c of allComplexes)for(const p of c.passages)
                        for(let j=1;j<p.nodes.length;j++)
                            if(changed.some(o=>o.active!==false&&courseSegmentTouch(o,p.nodes[j-1],p.nodes[j],10.5)))return false;
                    return true;
                };
                const adjustments=[];
                const rotated=new Set();
                for(const b of extraBlocks.filter(x=>x.style==='CHAOS'||x.style==='DUAL'||x.style==='TRIPLE')){
                    for(const [i,n] of b.rootNames.entries()){
                        const root=rootByName.get(n);
                        if(!root||goldenNames.has(n)||rotated.has(n))continue;
                        const changed=physical.filter(o=>o.sourceRoot===n);
                        if(!changed.length||!safe(changed))continue;
                        const old=root.quaternion.clone();
                        const saved=changed.map(o=>({o,fields:Object.fromEntries(
                            ['laneX','laneY','halfX','halfY','halfDepth','radius'].map(k=>[k,o[k]]))}));
                        const restore=()=>{root.quaternion.copy(old);root.updateMatrix();root.updateMatrixWorld(true);
                            saved.forEach(({o,fields})=>Object.assign(o,fields));};
                        let accepted=0;
                        const degrees=b.style==='CHAOS'?[6,-4.5,7.5,-5.5][(b.index+i)%4]:
                            (i%2?1:-1)*(b.style==='TRIPLE'?4:3);
                        for(const factor of [1,.5,.25]){
                            restore();
                            root.rotateY(THREE.MathUtils.degToRad(degrees*factor));
                            root.updateMatrix();root.updateMatrixWorld(true);
                            for(const o of changed){
                                if(!o.mesh)continue;
                                const box=new THREE.Box3().setFromObject(o.mesh);
                                if(box.isEmpty()||!Number.isFinite(o.routeProgress))continue;
                                const q=map2ProjectedBoxAt(box,o.routeProgress);
                                o.laneX=(q.minX+q.maxX)*.5;o.laneY=(q.minY+q.maxY)*.5;
                                o.halfX=Math.min(215,Math.max(22,(q.maxX-q.minX)*.5*.78));
                                o.halfY=Math.min(205,Math.max(22,(q.maxY-q.minY)*.5*.78));
                                o.halfDepth=Math.min(230,Math.max(10,(q.maxZ-q.minZ)*.5*.72));
                                o.radius=Math.hypot(o.halfX,o.halfY,o.halfDepth);
                            }
                            if(safe(changed)){accepted=degrees*factor;break;}
                        }
                        if(!accepted){restore();continue;}
                        rotated.add(n);
                        root.userData.map2SectorArchitectureYaw=accepted;
                        adjustments.push({name:n,sector:b.sectorId,block:b.id,yaw:accepted});
                    }
                }
                // Costs are measured after the final safe transforms, once at build time.
                for(const c of extraComplexes)for(const p of c.passages){
                    let length=0,turn=0,climb=0,high=0,near=0,prev=null;
                    for(let i=1;i<p.nodes.length;i++){
                        const a=p.nodes[i-1],b=p.nodes[i],f=getRaceFrameAtDistance(a.routeProgress),
                            g=getRaceFrameAtDistance(b.routeProgress);
                        const A=f.center.clone().addScaledVector(f.right,a.laneX).addScaledVector(f.up,a.laneY);
                        const B=g.center.clone().addScaledVector(g.right,b.laneX).addScaledVector(g.up,b.laneY);
                        const v=B.sub(A),d=v.length();length+=d;
                        if(d>0){v.multiplyScalar(1/d);if(prev)turn+=Math.acos(THREE.MathUtils.clamp(prev.dot(v),-1,1));prev=v;}
                        climb+=Math.max(0,b.laneY-a.laneY);high+=Math.max(0,(a.laneY+b.laneY)*.5)*d;
                        if(physical.some(o=>o.active!==false&&courseSegmentTouch(o,a,b,28)))near++;
                    }
                    p.routeCostMetrics={length,turn,climb,highExposure:length?high/length:0,
                        nearSegments:near,opening:Math.min(p.width||84,p.height||72),visibleLead:null};
                }
                const full={goldenGroups:golden.groups,totalEligibleGroups:all.length,
                    coveredGroups:golden.groups+sectors.reduce((n,x)=>n+x.groups,0),
                    sectors,extraBlocks,extraComplexes,adjustments,droppedComplexes};
                window.starbladeMap2FullGapSystem=full;
                return full;
            };
'''
rep("            queueMicrotask(()=>map2RefineGapGroundAndCosts());",
    block+"\n            queueMicrotask(()=>map2RefineGapGroundAndCosts());\n            queueMicrotask(()=>map2PropagateArchitecturalSectors());")
p.write_text(s,encoding="utf-8")
print("Applied MAP2-39 architectural sectors and validated additional navigation")
