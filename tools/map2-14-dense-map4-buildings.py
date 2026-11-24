from pathlib import Path

p=Path("index.html")
s=p.read_text(encoding="utf-8")

old_meta="""                clone.userData.map2ExactMap4Clone=true;
                clone.userData.sourceMap4Station=source.name;
                clone.userData.sourceProgress=sourceAt;"""
new_meta="""                clone.userData.map2ExactMap4Clone=true;
                clone.userData.sourceMap4Station=source.name;
                clone.userData.sourceProgress=sourceAt;
                clone.userData.map2TargetDistance=d;
                clone.userData.map2TargetSide=side;
                clone.userData.map2TargetUp=up;"""
if old_meta not in s:
    raise SystemExit("MAP2-14 metadata anchor not found")
s=s.replace(old_meta,new_meta,1)

old_layout="""            // Put the actual Map4 W05 stations directly around/over the Map2 road.
            // First copy intentionally covers the user's opening LINK view (~7.2 km).
            const exactCloneTargets=[8500];
            for(let d=14500;d<MAP2_DISTANCE-3500;d+=7600){
                if(map2Segment(d).kind!=='FAST')exactCloneTargets.push(d);
            }
            exactCloneTargets.forEach((d,i)=>{
                const side=(i%3===0?0:(i%2?120:-120));
                map2CloneExactMap4Station(i%6,d,side,-15);
            });"""
new_layout="""            // MAP2-14: use the real Map4 W05 stations as the dominant road architecture.
            // Keep the two full-throttle FAST zones clear, but cover the remaining course
            // with frequent station copies so the player flies through an industrial city,
            // not past isolated decorative boxes.
            const exactCloneTargets=[8500];
            for(let d=12000;d<MAP2_DISTANCE-3200;d+=3600){
                if(map2Segment(d).kind!=='FAST')exactCloneTargets.push(d);
            }
            let exactCloneOrdinal=0;
            exactCloneTargets.forEach((d,i)=>{
                // Most primary stations sit directly on the road centreline. A minority
                // is nudged slightly left/right to avoid a mechanically repeated tunnel.
                const phase=i%5;
                const side=(i===0||phase===0||phase===2||phase===4)?0:(phase===1?-140:140);
                map2CloneExactMap4Station(exactCloneOrdinal++%6,d,side,-18);

                // Every fourth non-opening anchor gets a second genuine Map4 station.
                // These flank copies overlap the road envelope rather than sitting in
                // the far background, creating the dense "between buildings" feeling.
                if(i>0&&i%4===0){
                    const flankD=d+760;
                    if(flankD<MAP2_DISTANCE-2500&&map2Segment(flankD).kind!=='FAST'){
                        const flankSide=(i%8===0?-360:360);
                        map2CloneExactMap4Station(exactCloneOrdinal++%6,flankD,flankSide,-28);
                    }
                }
            });"""
if old_layout not in s:
    raise SystemExit("MAP2-14 layout anchor not found")
s=s.replace(old_layout,new_layout,1)

p.write_text(s,encoding="utf-8")
print("MAP2-14 dense Map4 road-building patch applied")
