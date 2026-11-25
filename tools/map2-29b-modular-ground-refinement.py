#!/usr/bin/env python3
from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MAP2-29B: modular structural ground"
if marker in s:
    print("MAP2-29B already applied")
    raise SystemExit(0)

start=s.find("                let foundations=0,connectors=0;")
end=s.find("                // Re-scan after additions: no legacy straight TECH road surface may",start)
if start<0 or end<0:
    raise SystemExit("MAP2-29B structural-ground anchors missing")

block=r"""                // MAP2-29B: modular structural ground.
                // A single giant slab under every complex read like a replacement road.
                // Split the support into compact pads positioned under the measured
                // architectural footprint, and keep inter-building links narrow.
                let foundations=0,foundationPads=0,connectors=0;
                const foundationRows=[];
                rows.forEach((row,i)=>{
                    const rawW=THREE.MathUtils.clamp(row.maxX-row.minX,220,900);
                    const rawD=THREE.MathUtils.clamp(row.maxZ-row.minZ,260,900);
                    const cols=THREE.MathUtils.clamp(Math.ceil(rawW/390),1,3);
                    const depthRows=THREE.MathUtils.clamp(Math.ceil(rawD/500),1,2);
                    const padW=THREE.MathUtils.clamp((rawW/cols)*.64,180,330);
                    const padD=THREE.MathUtils.clamp((rawD/depthRows)*.64,220,360);
                    const minX=THREE.MathUtils.clamp(row.minX,-620,620);
                    const maxX=THREE.MathUtils.clamp(row.maxX,-620,620);
                    const minZ=THREE.MathUtils.clamp(row.minZ,-360,360);
                    const maxZ=THREE.MathUtils.clamp(row.maxZ,-360,360);
                    const supportH=THREE.MathUtils.clamp(Math.max(28,row.supportGap+24),28,190);
                    const supportY=row.baseAfter-supportH*.50;
                    let pads=0;

                    for(let rz=0;rz<depthRows;rz++){
                        const localZ=depthRows===1?(minZ+maxZ)*.5:
                            THREE.MathUtils.lerp(minZ+padD*.42,maxZ-padD*.42,rz);
                        let d=row.d+localZ;
                        if(d<0||d>MAP2_DISTANCE||map2Segment(d).kind!=='TECH')d=row.d;

                        for(let cx=0;cx<cols;cx++){
                            const x=cols===1?(minX+maxX)*.5:
                                THREE.MathUtils.lerp(minX+padW*.42,maxX-padW*.42,cx);
                            const g=addVisualBlock(
                                d,x,supportY,
                                padW,supportH,padD,
                                ((i+cx+rz)%4===0)?map2VisualMats.shell:map2VisualMats.dark,
                                'MAP2_ARCH_FOUNDATION_'+i+'_'+rz+'_'+cx
                            );
                            g.userData.map2ArchitecturalGround=true;
                            g.userData.map2GroundPad=true;
                            g.userData.map2GroundGroup=i;
                            g.userData.map2GroundTop=row.baseAfter;
                            g.userData.map2GroundTarget=row.targetGround;
                            g.userData.map2Distance=d;
                            foundationPads++;pads++;
                        }
                    }

                    foundationRows.push({
                        d:row.d,x:row.x,base:row.baseAfter,target:row.targetGround,
                        width:rawW,depth:rawD,height:supportH,pads
                    });
                    foundations++;
                });

                for(let i=0;i<rows.length-1;i++){
                    const a=rows[i],b=rows[i+1];
                    const gap=b.d-a.d;
                    if(gap<420||gap>1900)continue;
                    if(map2Segment((a.d+b.d)*.5).kind!=='TECH')continue;

                    // One or two short service bridges, never a continuous road strip.
                    const count=gap>1250?2:1;
                    for(let j=1;j<=count;j++){
                        const t=j/(count+1);
                        const d=THREE.MathUtils.lerp(a.d,b.d,t);
                        if(map2Segment(d).kind!=='TECH')continue;
                        const q=map2BuildingPassageAt(d);
                        const ground=THREE.MathUtils.lerp(a.baseAfter,b.baseAfter,t);
                        const w=THREE.MathUtils.clamp(170+Math.abs(b.x-a.x)*.20,170,250);
                        const depth=THREE.MathUtils.clamp(gap/(count+1)*.34,170,300);
                        const g=addVisualBlock(
                            d,q.x,ground-14,
                            w,20,depth,
                            ((i+j)%3===0)?map2VisualMats.shell:map2VisualMats.dark,
                            'MAP2_ARCH_CONNECTOR_'+i+'_'+j
                        );
                        g.userData.map2ArchitecturalGround=true;
                        g.userData.map2BuildingConnector=true;
                        g.userData.map2Distance=d;
                        connectors++;
                    }
                }

"""
s=s[:start]+block+s[end:]

summary_anchor="                    measuredGroups:rows.length,groundedGroups:grounded,movedGroups,\n                    foundations,connectors,"
summary_repl="                    measuredGroups:rows.length,groundedGroups:grounded,movedGroups,\n                    foundations,foundationPads,connectors,"
if summary_anchor not in s:
    raise SystemExit("MAP2-29B summary anchor missing")
s=s.replace(summary_anchor,summary_repl,1)

stats_anchor="                    architectureFoundations:foundations,\n                    architectureConnectors:connectors,"
stats_repl="                    architectureFoundations:foundations,\n                    architectureFoundationPads:foundationPads,\n                    architectureConnectors:connectors,"
if stats_anchor not in s:
    raise SystemExit("MAP2-29B stats anchor missing")
s=s.replace(stats_anchor,stats_repl,1)

insert_anchor="            // MAP2-29: grounded architectural route."
s=s.replace(insert_anchor,"            // MAP2-29B: modular structural ground\n"+insert_anchor,1)

p.write_text(s,encoding="utf-8")
print("Applied MAP2-29B modular pads and narrow service connectors")
