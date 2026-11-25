#!/usr/bin/env python3
from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")
marker="MAP2-30/31: systematic building blocks and real gap classification"
if marker in s:
    print("MAP2-30/31 already applied")
    raise SystemExit(0)

call_anchor="            map2GroundArchitecturalRoute();\n"
if s.count(call_anchor)!=1:
    raise SystemExit(f"MAP2-30 call anchor count expected 1, got {s.count(call_anchor)}")

block=r'''
            // MAP2-30/31: systematic building blocks and real gap classification.
            // The first long TECH chain is the golden sector. We segment its REAL Map4
            // architecture into irregular 600–1600-ish metre design blocks, then scan
            // the actual copied geometry for distinct pilot-sized openings. Systematic
            // structure protects playability; authored CHAOS blocks deliberately break
            // cadence/symmetry so the industrial city never becomes a sterile pattern.
            const map2BuildBuildingGapBlockSystem=()=>{
                const road=window.starbladeMap2BuildingRoad;
                const chains=window.starbladeMap2LongBuildingChains;
                if(!road?.groups?.length||!chains?.chains?.length)return null;

                const chain=chains.chains
                    .filter(c=>c.span>=30000&&c.span<=45000)
                    .slice()
                    .sort((a,b)=>a.from-b.from)[0]
                    || chains.chains.slice().sort((a,b)=>b.span-a.span)[0];
                if(!chain)return null;

                const groups=road.groups
                    .filter(g=>g.open&&g.d>=chain.from&&g.d<=chain.to&&map2Segment(g.d).kind==='TECH')
                    .slice().sort((a,b)=>a.d-b.d);
                if(groups.length<12)return null;

                const roots=map2ExactBuildingRoots();
                const rootByName=new Map(roots.map(r=>[r.name,r]));

                const scanOpenings=g=>{
                    const groupRoots=(g.rootNames||[]).map(n=>rootByName.get(n)).filter(Boolean);
                    if(!groupRoots.length)return {distance:g.d,openings:[],solids:0};
                    const solids=map2CollectRouteSolids(groupRoots,g.d);
                    const xs=map2BuildingRoadSampleXs;
                    const ys=map2BuildingRoadSampleYs;
                    const valid=new Map();

                    for(let ix=0;ix<xs.length;ix++){
                        const x=xs[ix];
                        for(let iy=0;iy<ys.length;iy++){
                            const y=ys[iy];
                            let blocked=false;
                            for(const q of solids){
                                const zOverlap=q.maxZ>=-255&&q.minZ<=255;
                                const xyOverlap=
                                    x+42>=q.minX&&x-42<=q.maxX&&
                                    y+36>=q.minY&&y-36<=q.maxY;
                                if(zOverlap&&xyOverlap){blocked=true;break;}
                            }
                            if(blocked)continue;

                            const zSolids=solids.filter(q=>q.maxZ>=-320&&q.minZ<=320);
                            const left=zSolids.some(q=>
                                q.maxX<=x-42&&x-q.maxX<360&&
                                q.maxY>=y-170&&q.minY<=y+170);
                            const right=zSolids.some(q=>
                                q.minX>=x+42&&q.minX-x<360&&
                                q.maxY>=y-170&&q.minY<=y+170);
                            const above=zSolids.some(q=>
                                q.minY>=y+36&&q.minY-y<300&&
                                q.maxX>=x-240&&q.minX<=x+240);
                            const below=zSolids.some(q=>
                                q.maxY<=y-36&&y-q.maxY<300&&
                                q.maxX>=x-240&&q.minX<=x+240);
                            const directional=(left?1:0)+(right?1:0)+(above?1:0)+(below?1:0);
                            if(directional<2)continue;
                            const framed=(left&&right)||(above&&below)||((left||right)&&(above||below));
                            valid.set(ix+':'+iy,{ix,iy,x,y,left,right,above,below,framed,directional});
                        }
                    }

                    const components=[];
                    const seen=new Set();
                    for(const [key,start] of valid){
                        if(seen.has(key))continue;
                        const queue=[start],cells=[];
                        seen.add(key);
                        while(queue.length){
                            const cur=queue.pop();cells.push(cur);
                            for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
                                const nk=(cur.ix+dx)+':'+(cur.iy+dy);
                                if(seen.has(nk)||!valid.has(nk))continue;
                                seen.add(nk);queue.push(valid.get(nk));
                            }
                        }
                        if(cells.length<2)continue;
                        const framedCount=cells.filter(c=>c.framed).length;
                        if(!framedCount&&cells.length<4)continue;
                        const cx=cells.reduce((n,c)=>n+c.x,0)/cells.length;
                        const cy=cells.reduce((n,c)=>n+c.y,0)/cells.length;
                        const minX=Math.min(...cells.map(c=>c.x)),maxX=Math.max(...cells.map(c=>c.x));
                        const minY=Math.min(...cells.map(c=>c.y)),maxY=Math.max(...cells.map(c=>c.y));
                        components.push({
                            x:cx,y:cy,
                            width:(maxX-minX)+84,
                            height:(maxY-minY)+72,
                            cells:cells.length,
                            framedRatio:framedCount/cells.length,
                            score:cells.length*18+framedCount*34-Math.hypot(cx-g.x,(cy-g.y)*.72)*.10
                        });
                    }
                    components.sort((a,b)=>b.score-a.score);

                    const merged=[];
                    for(const c of components){
                        const near=merged.find(m=>Math.hypot(m.x-c.x,m.y-c.y)<155);
                        if(!near)merged.push(c);
                        else if(c.score>near.score)Object.assign(near,c);
                    }
                    return {distance:g.d,openings:merged.slice(0,4),solids:solids.length};
                };

                // Deliberately irregular counts: systematized blocks without metronomic repetition.
                const countPattern=[2,2,1,3,2,1,2,3,1,2,2,3,1,2,1,3,2,2,1,3,2,1,2,2,3,1,2,3];
                const rawBlocks=[];
                let gi=0,bi=0;
                while(gi<groups.length){
                    let take=countPattern[bi%countPattern.length];
                    let end=Math.min(groups.length,gi+take);
                    while(end>gi+1&&groups[end-1].d-groups[gi].d>2200)end--;
                    if(end<=gi)end=gi+1;
                    const members=groups.slice(gi,end);
                    const scans=members.map(scanOpenings);
                    scans.sort((a,b)=>
                        b.openings.length-a.openings.length||
                        (b.openings[0]?.score||0)-(a.openings[0]?.score||0)
                    );
                    const focus=scans[0];
                    const prevD=rawBlocks.length?rawBlocks[rawBlocks.length-1].to:chain.from;
                    const from=Math.max(chain.from,groups[gi].d-Math.min(320,(groups[gi].d-prevD)*.25));
                    const nextD=end<groups.length?groups[end].d:chain.to;
                    const to=Math.min(chain.to,groups[end-1].d+Math.min(360,(nextD-groups[end-1].d)*.25));
                    rawBlocks.push({
                        id:'MAP2_GAP_BLOCK_'+rawBlocks.length,
                        index:rawBlocks.length,
                        from,to,span:to-from,
                        groupCount:members.length,
                        groupDistances:members.map(g=>g.d),
                        rootNames:[...new Set(members.flatMap(g=>g.rootNames||[]))],
                        focusDistance:focus.distance,
                        passageCapacity:Math.min(3,focus.openings.length),
                        candidateOpenings:focus.openings
                    });
                    gi=end;bi++;
                }

                // Multi-passage designation is capacity-driven: we never label a fake
                // second/third route where real copied geometry does not expose one.
                const byCapacity=rawBlocks.slice().sort((a,b)=>
                    b.passageCapacity-a.passageCapacity||
                    b.candidateOpenings.reduce((n,q)=>n+q.score,0)-a.candidateOpenings.reduce((n,q)=>n+q.score,0)
                );
                const tripleSet=new Set(byCapacity.filter(b=>b.passageCapacity>=3).slice(0,3).map(b=>b.id));
                const dualSet=new Set(byCapacity.filter(b=>b.passageCapacity>=2&&!tripleSet.has(b.id)).slice(0,6).map(b=>b.id));

                // Non-multi styles intentionally include irregular CHAOS and BREATHER
                // nodes. Reserve them AFTER multi-passage capacity is assigned so a
                // valuable 2/3-way junction never silently consumes every breath node.
                const baseStyle=['CORRIDOR','NARROW','CHICANE','CORRIDOR','NARROW','CHICANE','CORRIDOR'];
                const nonMulti=rawBlocks.filter(b=>!tripleSet.has(b.id)&&!dualSet.has(b.id));
                const breatherSet=new Set(nonMulti.slice().sort((a,b)=>
                    b.span-a.span||a.index-b.index
                ).slice(0,3).map(b=>b.id));
                const chaosSet=new Set(nonMulti.filter(b=>!breatherSet.has(b.id))
                    .slice().sort((a,b)=>
                        ((a.index*17)%29)-((b.index*17)%29)||b.passageCapacity-a.passageCapacity
                    ).slice(0,4).map(b=>b.id));

                const blocks=rawBlocks.map((b,i)=>{
                    let style=baseStyle[(i*7+i*i)%baseStyle.length];
                    let targetPassages=1;
                    if(tripleSet.has(b.id)){style='TRIPLE';targetPassages=3;}
                    else if(dualSet.has(b.id)){style='DUAL';targetPassages=2;}
                    else if(breatherSet.has(b.id)){style='BREATHER';}
                    else if(chaosSet.has(b.id)){style='CHAOS';}
                    const passages=b.candidateOpenings.slice(0,targetPassages).map((q,pi)=>{
                        const widthClass=q.width<180?'NARROW':q.width>320?'WIDE':'MEDIUM';
                        const altitudeClass=q.y>20?'HIGH':q.y<-95?'LOW':'MID';
                        return {
                            id:b.id+'_PASSAGE_'+pi,
                            x:q.x,y:q.y,width:q.width,height:q.height,
                            widthClass,altitudeClass,
                            framedRatio:q.framedRatio,
                            role:altitudeClass==='HIGH'?'FAST_HIGH_RISK':
                                widthClass==='NARROW'?'SHORT_TECHNICAL':'SAFE_STANDARD'
                        };
                    });
                    const block={...b,style,targetPassages,actualPassages:passages.length,passages,
                        chaos:style==='CHAOS',breather:style==='BREATHER'};
                    delete block.candidateOpenings;

                    for(const name of block.rootNames){
                        const root=rootByName.get(name);
                        if(!root)continue;
                        root.userData.map2GapBlockId=block.id;
                        root.userData.map2GapBlockStyle=style;
                        root.userData.map2GapBlockPassages=block.actualPassages;
                        root.userData.map2GapBlockChaos=block.chaos;
                    }
                    return block;
                });

                const passageCounts={single:0,dual:0,triple:0};
                for(const b of blocks){
                    if(b.actualPassages>=3)passageCounts.triple++;
                    else if(b.actualPassages===2)passageCounts.dual++;
                    else passageCounts.single++;
                }
                const groupCounts=[...new Set(blocks.map(b=>b.groupCount))];
                const spans=blocks.map(b=>b.span);
                const styleCounts={};
                blocks.forEach(b=>styleCounts[b.style]=(styleCounts[b.style]||0)+1);

                const summary={
                    philosophy:'BUILDING_COMPLEX_FIRST_GAPS_SECOND_ROUTE_THIRD',
                    sector:'GOLDEN_TECH_01',
                    from:chain.from,to:chain.to,span:chain.span,
                    groups:groups.length,
                    blocks,
                    blockCount:blocks.length,
                    irregularGroupCounts:groupCounts,
                    minBlockSpan:Math.min(...spans),
                    maxBlockSpan:Math.max(...spans),
                    passageCounts,
                    chaosBlocks:blocks.filter(b=>b.chaos).length,
                    breatherBlocks:blocks.filter(b=>b.breather).length,
                    styleCounts
                };
                window.starbladeMap2GapBlockSystem=summary;
                Object.assign(map2VisualStageStats,{
                    gapSystemBlocks:summary.blockCount,
                    gapSystemDual:passageCounts.dual,
                    gapSystemTriple:passageCounts.triple,
                    gapSystemChaos:summary.chaosBlocks,
                    gapSystemBreathers:summary.breatherBlocks,
                    gapSystemGoldenSpan:summary.span
                });
                return summary;
            };
            map2BuildBuildingGapBlockSystem();
'''

s=s.replace(call_anchor,call_anchor+block+"\n",1)
p.write_text(s,encoding="utf-8")
print("Applied MAP2-30/31 building blocks + real gap classification")
