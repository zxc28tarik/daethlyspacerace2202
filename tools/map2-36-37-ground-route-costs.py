#!/usr/bin/env python3
from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MAP2-36/37: architectural ground rhythm and measured route costs"
if marker in s:
    print("MAP2-36/37 already applied")
    raise SystemExit(0)
def replace_once(a,b):
    global s
    if s.count(a)!=1:
        raise SystemExit(f"MAP2-36/37 expected one anchor: {a[:90]}")
    s=s.replace(a,b,1)

ground=r'''
            // MAP2-36/37: architectural ground rhythm and measured route costs.
            const map2RefineGapGroundAndCosts=()=>{
                const ground=window.starbladeMap2GroundedArchitecture;
                const sys=window.starbladeMap2GapBlockSystem;
                const play=window.starbladeMap2PlayablePassages;
                if(!ground||!sys?.blocks?.length||!play?.complexes?.length)return null;
                const pads=[],links=[];
                map2CourseGroup.updateMatrixWorld(true);
                map2CourseGroup.traverse(o=>{
                    if(o.userData?.map2GroundPad)
                        pads.push({o,d:Number(o.userData.map2Distance),box:new THREE.Box3().setFromObject(o)});
                    if(o.userData?.map2BuildingConnector)
                        links.push({o,d:Number(o.userData.map2Distance),box:new THREE.Box3().setFromObject(o)});
                });
                const blockAt=d=>sys.blocks.find(b=>d>=b.from&&d<=b.to);
                const decisions=[];
                let removed=0;
                const maxRemove=Math.min(10,Math.max(0,links.length-24));
                for(const link of links){
                    if(!Number.isFinite(link.d)||link.d<sys.from||link.d>sys.to)continue;
                    const block=blockAt(link.d);
                    const adjacent=pads.filter(p=>Math.abs(p.d-link.d)<380);
                    const overlaps=adjacent.filter(p=>{
                        const a=p.box,b=link.box;
                        return a.max.x>=b.min.x&&a.min.x<=b.max.x&&
                               a.max.z>=b.min.z&&a.min.z<=b.max.z&&
                               Math.abs(a.max.y-b.max.y)<70;
                    });
                    const mode=block?.buildingRole==='OPEN_YARD'?'OPEN_GAP':
                        overlaps.length>=2?'DIRECT_ARCHITECTURE':'SERVICE_LINK';
                    // A visual-only connector is not a foundation. Never remove
                    // a physical obstacle, a pad or any element outside the pilot sector.
                    const canRemove=mode!=='SERVICE_LINK'&&removed<maxRemove&&
                        link.o.userData.map2VisualOnly===true&&
                        !link.o.userData.map2GroundPad&&link.o.parent&&
                        map2Segment(link.d).kind==='TECH';
                    if(canRemove){
                        link.o.parent.remove(link.o);
                        removed++;
                    }else{
                        link.o.userData.map2GroundConnectionRole=mode==='SERVICE_LINK'?mode:'RETAINED_SUPPORT';
                    }
                    decisions.push({name:link.o.name,d:link.d,block:block?.id||null,
                        mode,removed:!!canRemove,nearbyPads:adjacent.length,overlappingPads:overlaps.length});
                }
                const total=links.length-removed;
                ground.connectors=total;
                const groundStats={architectureConnectors:total,gapGroundRemovedLinks:removed,
                    gapGroundDirect:decisions.filter(x=>x.mode==='DIRECT_ARCHITECTURE').length,
                    gapGroundOpen:decisions.filter(x=>x.mode==='OPEN_GAP').length};
                Object.assign(map2VisualStageStats,groundStats);
                if(window.starbladeMap2Layout?.visualStage)
                    Object.assign(window.starbladeMap2Layout.visualStage,groundStats);
                window.starbladeMap2GapGroundIntegration={
                    sectorFrom:sys.from,sectorTo:sys.to,padsBefore:pads.length,padsAfter:pads.length,
                    linksBefore:links.length,linksAfter:total,removed,decisions
                };

                // Precompute actual geometric branch difficulty once, after the
                // final shell transforms. No expensive route scanning per AI frame.
                const physical=window.starbladeMap2BuildingColliders||[];
                const metrics=[];
                for(const complex of play.complexes){
                    for(const passage of complex.passages){
                        const nodes=passage.nodes;
                        let length=0,turn=0,climb=0,high=0,near=0;
                        let prev=null;
                        for(let i=1;i<nodes.length;i++){
                            const a=nodes[i-1],b=nodes[i];
                            const f=getRaceFrameAtDistance(a.routeProgress);
                            const g=getRaceFrameAtDistance(b.routeProgress);
                            const A=f.center.clone().addScaledVector(f.right,a.laneX).addScaledVector(f.up,a.laneY);
                            const B=g.center.clone().addScaledVector(g.right,b.laneX).addScaledVector(g.up,b.laneY);
                            const v=B.sub(A),dist=v.length();
                            length+=dist;
                            if(dist>0){
                                v.multiplyScalar(1/dist);
                                if(prev)turn+=Math.acos(THREE.MathUtils.clamp(prev.dot(v),-1,1));
                                prev=v;
                            }
                            climb+=Math.max(0,b.laneY-a.laneY);
                            high+=Math.max(0,(a.laneY+b.laneY)*.5)*dist;
                            if(physical.some(o=>o.active!==false&&courseSegmentTouch(o,a,b,28)))near++;
                        }
                        const m={
                            length,turn,climb,highExposure:length?high/length:0,
                            nearSegments:near,
                            opening:Math.min(Number(passage.width)||84,Number(passage.height)||72),
                            visibleLead:complex.visibilityEvidence?.branches?.find(b=>b.id===passage.id)?.maxVisibleDistance??null
                        };
                        passage.routeCostMetrics=m;
                        metrics.push({complex:complex.id,passage:passage.id,...m});
                    }
                }
                window.starbladeMap2RouteCostMetrics={complexes:play.complexes.length,passages:metrics};
                return {ground:window.starbladeMap2GapGroundIntegration,metrics};
            };
'''
anchor="            queueMicrotask(()=>map2ShapeDecisionSightlines());"
replace_once(anchor,ground+"\n"+anchor+"\n            queueMicrotask(()=>map2RefineGapGroundAndCosts());")

helper=r'''
        // MAP2-37: measured cost is a bounded modifier, not a replacement for
        // established pilot personality, approach alignment or traffic reservations.
        function map2GapMeasuredCost(p,complex,profile){
            const m=p?.routeCostMetrics;
            if(!m)return 0;
            const all=complex.passages.map(x=>x.routeCostMetrics).filter(Boolean);
            const shortest=Math.min(m.length,...all.map(x=>x.length));
            const extra=Math.max(0,m.length-shortest);
            const w=({
                SPEED:[.10,13,.025,.07,8,10],
                CAUTIOUS:[.025,28,.06,.30,24,32],
                AGGRESSIVE:[.06,11,.02,.10,8,9],
                BALANCED:[.055,20,.04,.18,15,19]
            })[profile]||[.055,20,.04,.18,15,19];
            const narrow=Math.max(0,180-m.opening)/180;
            const late=m.visibleLead===null?0:1-Math.min(1,m.visibleLead/340);
            return Math.min(100,extra*w[0]+m.turn*w[1]+m.climb*w[2]+
                m.highExposure*w[3]+m.nearSegments*w[4]+(narrow+late*.35)*w[5]);
        }

'''
replace_once("        function map2GapChoosePassage(r,complex){",helper+"        function map2GapChoosePassage(r,complex){")
replace_once("                cost+=(occupied.get(p.id)||0)*92;",
             "                cost+=(occupied.get(p.id)||0)*92;\n                cost+=map2GapMeasuredCost(p,complex,profile);")
# Keep the old steering lookahead, but follow the actual validated line segment.
replace_once("            const smooth=t*t*(3-2*t);\n            return {\n                ...basePlan,",
             "            const smooth=t; // stay inside the physically validated segment\n            return {\n                ...basePlan,")
p.write_text(s,encoding="utf-8")
print("Applied MAP2-36 ground rhythm and MAP2-37 measured branch costs")
