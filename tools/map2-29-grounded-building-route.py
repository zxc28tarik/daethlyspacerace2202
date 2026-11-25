#!/usr/bin/env python3
from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")

marker="MAP2-29: grounded architectural route"
if marker in s:
    print("MAP2-29 already applied")
    raise SystemExit(0)

needle="""            map2AuthorArchitecturalChicaneChains();

            // MAP2-18: only after all authored gates and original physical solids"""

block=r"""            // MAP2-29: grounded architectural route.
            // The copied Map4 buildings are no longer allowed to hover around a
            // straight visual road. Their own local structural bases define a
            // smoothed ground profile; small vertical corrections seat each complex
            // onto that profile, while short industrial foundation/connector slabs
            // fill only the architecture-to-architecture handoffs. This is NOT a
            // replacement asphalt ribbon: the buildings remain the route.
            const map2GroundArchitecturalRoute=()=>{
                const road=window.starbladeMap2BuildingRoad;
                const route=window.starbladeMap2ThroughRoute;
                if(!road?.groups?.length||!road?.knots?.length||!route?.modules?.length)return null;

                const roots=map2ExactBuildingRoots();
                const rootByName=new Map(roots.map(r=>[r.name,r]));
                const rows=[];
                const median=arr=>{
                    if(!arr.length)return NaN;
                    const a=arr.slice().sort((x,y)=>x-y);
                    const m=(a.length-1)/2,lo=Math.floor(m),hi=Math.ceil(m);
                    return (a[lo]+a[hi])*.5;
                };
                const percentile=(arr,p)=>{
                    if(!arr.length)return NaN;
                    const a=arr.slice().sort((x,y)=>x-y);
                    return a[Math.min(a.length-1,Math.max(0,Math.round((a.length-1)*p)))];
                };

                // 1) Measure the REAL copied building mass instead of trusting the
                // clone origin. A low percentile ignores one-off hanging pipes,
                // antennae and deep decorative fragments.
                for(const g of road.groups.slice().sort((a,b)=>a.d-b.d)){
                    if(!g.open||map2Segment(g.d).kind!=='TECH')continue;
                    const groupRoots=(g.rootNames||[]).map(n=>rootByName.get(n)).filter(Boolean);
                    if(!groupRoots.length)continue;
                    const solids=map2CollectRouteSolids(groupRoots,g.d);
                    if(!solids.length)continue;
                    const lows=solids.map(q=>q.minY).filter(Number.isFinite);
                    const minXs=solids.map(q=>q.minX).filter(Number.isFinite);
                    const maxXs=solids.map(q=>q.maxX).filter(Number.isFinite);
                    const minZs=solids.map(q=>q.minZ).filter(Number.isFinite);
                    const maxZs=solids.map(q=>q.maxZ).filter(Number.isFinite);
                    const baseBefore=percentile(lows,.18);
                    if(!Number.isFinite(baseBefore))continue;
                    rows.push({
                        g,roots:groupRoots,d:g.d,x:g.x,y:g.y,baseBefore,
                        minX:Math.min(...minXs),maxX:Math.max(...maxXs),
                        minZ:Math.min(...minZs),maxZ:Math.max(...maxZs)
                    });
                }
                if(rows.length<2)return null;

                // 2) Derive a local SUPPORT datum from neighbouring real building
                // bases, but DO NOT move the copied building shell or the flight tube.
                // MAP2-25/28 already authored a flyable entrance/interior/exit path.
                // Grounding is visual/structural: foundations rise to the existing
                // architecture instead of dragging architecture up/down to a road.
                let grounded=0,movedGroups=0,maxVerticalCorrection=0,maxRawFloatGap=0,maxResidualSupport=0;
                for(const row of rows){
                    const neighbours=rows.filter(q=>
                        map2Segment(q.d).kind==='TECH'&&Math.abs(q.d-row.d)<=2600
                    );
                    const localMedian=median(neighbours.map(q=>q.baseBefore));
                    const neighbourFloor=Number.isFinite(localMedian)?localMedian:row.baseBefore;

                    // Always keep support below the building. Limit its depth so an
                    // isolated source fragment never creates a kilometre-high plinth.
                    let target=Math.min(
                        row.baseBefore-24,
                        neighbourFloor-12,
                        row.y-96
                    );
                    target=Math.max(target,row.baseBefore-170);

                    row.rawGround=target;
                    row.targetGround=target;
                    row.dy=0;
                    row.baseAfter=row.baseBefore;
                    row.supportGap=Math.max(24,row.baseAfter-row.targetGround);
                    grounded++;
                    maxRawFloatGap=Math.max(maxRawFloatGap,row.supportGap);

                    for(const root of row.roots){
                        root.userData.map2GroundedArchitecture=true;
                        root.userData.map2GroundShiftY=0;
                        root.userData.map2GroundBaseY=row.baseAfter;
                        root.userData.map2GroundTargetY=row.targetGround;
                    }
                }

                // Deliberately no route/root Y mutation here. This keeps the exact
                // MAP2-25 building handoffs, MAP2-28 chicane tube and AI navigation
                // unchanged while the new structural bases remove the floating look.

                // 3) Kill any remaining straight TECH road surface helper. MAP2-27
                // already removed the known deck class; this catches older aliases.
                const legacySurface=/(?:VISUAL_DECK|ROAD_SURFACE|ASPHALT|PAVEMENT|TRACK_SURFACE|LANE_STRIP|CENTER_STRIP)/i;
                let extraStraightSurfacesRemoved=0;
                for(const section of map2Sections){
                    for(const root of section.children.slice()){
                        if(!root.userData?.map2VisualOnly)continue;
                        if(root.name?.startsWith('MAP2_ARCH_'))continue;
                        const d=Number(root.userData?.map2Distance??root.userData?.map2TargetDistance??root.userData?.routeProgress);
                        if(!Number.isFinite(d)||map2Segment(d).kind!=='TECH')continue;
                        if(!legacySurface.test(root.name||''))continue;
                        section.remove(root);
                        extraStraightSurfacesRemoved++;
                    }
                }

                // 4) Structural ground comes from the architecture footprint, not
                // from a road ribbon. Each complex gets a local foundation touching
                // its measured base. Short staggered plates bridge only nearby
                // building handoffs and follow the actual chicane x/y.
                let foundations=0,connectors=0;
                const foundationRows=[];
                rows.forEach((row,i)=>{
                    const footprintW=THREE.MathUtils.clamp((row.maxX-row.minX)+120,360,1080);
                    const footprintD=THREE.MathUtils.clamp((row.maxZ-row.minZ)+140,320,1180);
                    const supportH=THREE.MathUtils.clamp(Math.max(28,row.supportGap+24),28,190);
                    const supportY=row.baseAfter-supportH*.50;
                    const g=addVisualBlock(
                        row.d,row.x,supportY,
                        footprintW,supportH,footprintD,
                        map2VisualMats.dark,
                        'MAP2_ARCH_FOUNDATION_'+i
                    );
                    g.userData.map2ArchitecturalGround=true;
                    g.userData.map2GroundTop=row.baseAfter;
                    g.userData.map2GroundTarget=row.targetGround;
                    g.userData.map2Distance=row.d;
                    foundationRows.push({
                        d:row.d,x:row.x,base:row.baseAfter,target:row.targetGround,
                        width:footprintW,depth:footprintD,height:supportH
                    });
                    foundations++;
                });

                for(let i=0;i<rows.length-1;i++){
                    const a=rows[i],b=rows[i+1];
                    const gap=b.d-a.d;
                    if(gap<=0||gap>2200)continue;
                    if(map2Segment((a.d+b.d)*.5).kind!=='TECH')continue;
                    const count=THREE.MathUtils.clamp(Math.ceil(gap/720),1,3);
                    for(let j=1;j<=count;j++){
                        const t=j/(count+1);
                        const d=THREE.MathUtils.lerp(a.d,b.d,t);
                        const q=map2BuildingPassageAt(d);
                        const ground=THREE.MathUtils.lerp(a.baseAfter,b.baseAfter,t);
                        const lateral=Math.abs(b.x-a.x);
                        const w=THREE.MathUtils.clamp(260+lateral*.42,260,430);
                        const depth=THREE.MathUtils.clamp(gap/(count+1)*.66,240,480);
                        const g=addVisualBlock(
                            d,q.x,ground-18,
                            w,28,depth,
                            (i+j)%3===0?map2VisualMats.shell:map2VisualMats.dark,
                            'MAP2_ARCH_CONNECTOR_'+i+'_'+j
                        );
                        g.userData.map2ArchitecturalGround=true;
                        g.userData.map2BuildingConnector=true;
                        g.userData.map2Distance=d;
                        connectors++;
                    }
                }

                // Re-scan after additions: no legacy straight TECH road surface may
                // survive. Foundations/connectors are intentionally excluded.
                const remainingStraight=[];
                for(const section of map2Sections){
                    for(const root of section.children){
                        if(root.name?.startsWith('MAP2_ARCH_'))continue;
                        const d=Number(root.userData?.map2Distance??root.userData?.map2TargetDistance??root.userData?.routeProgress);
                        if(!Number.isFinite(d)||map2Segment(d).kind!=='TECH')continue;
                        if(root.userData?.map2VisualOnly&&legacySurface.test(root.name||''))
                            remainingStraight.push({name:root.name,d});
                    }
                }

                // Connection quality is measured on the actual building route knots,
                // after grounding, not on the old centre spline.
                const techKnots=road.knots.filter(k=>map2Segment(k.distance).kind==='TECH')
                    .slice().sort((a,b)=>a.distance-b.distance);
                let maxVerticalHandoff=0,badVerticalHandoffs=0;
                for(let i=1;i<techKnots.length;i++){
                    const a=techKnots[i-1],b=techKnots[i];
                    if(b.distance-a.distance>2500)continue;
                    const dy=Math.abs(b.y-a.y);
                    maxVerticalHandoff=Math.max(maxVerticalHandoff,dy);
                    if(dy>92)badVerticalHandoffs++;
                }

                const summary={
                    philosophy:'BUILDING_BASES_DEFINE_GROUND_NO_ASPHALT_RIBBON',
                    measuredGroups:rows.length,groundedGroups:grounded,movedGroups,
                    foundations,connectors,
                    maxVerticalCorrection,maxRawFloatGap,maxResidualSupport,
                    extraStraightSurfacesRemoved,
                    remainingStraightSurfaces:remainingStraight.length,
                    remainingStraight,
                    maxVerticalHandoff,badVerticalHandoffs,
                    foundationsData:foundationRows,
                    groups:rows.map(r=>({
                        d:r.d,x:r.x,y:r.y,baseBefore:r.baseBefore,baseAfter:r.baseAfter,
                        targetGround:r.targetGround,dy:r.dy,supportGap:r.supportGap,
                        roots:r.roots.map(x=>x.name)
                    }))
                };
                window.starbladeMap2GroundedArchitecture=summary;
                Object.assign(map2VisualStageStats,{
                    groundedArchitectureGroups:grounded,
                    architectureMovedGroups:movedGroups,
                    architectureFoundations:foundations,
                    architectureConnectors:connectors,
                    architectureMaxVerticalCorrection:maxVerticalCorrection,
                    architectureMaxRawFloatGap:maxRawFloatGap,
                    architectureMaxResidualSupport:maxResidualSupport,
                    architectureStraightSurfacesRemoved:extraStraightSurfacesRemoved,
                    architectureStraightSurfacesRemaining:remainingStraight.length,
                    architectureMaxVerticalHandoff:maxVerticalHandoff,
                    architectureBadVerticalHandoffs:badVerticalHandoffs
                });
                return summary;
            };
            map2GroundArchitecturalRoute();

"""

if s.count(needle)!=1:
    raise SystemExit(f"MAP2-29 anchor count expected 1, got {s.count(needle)}")
s=s.replace(needle,"            map2AuthorArchitecturalChicaneChains();\n\n"+block+"            // MAP2-18: only after all authored gates and original physical solids",1)
p.write_text(s,encoding="utf-8")
print("Applied MAP2-29 grounded building-defined route")
