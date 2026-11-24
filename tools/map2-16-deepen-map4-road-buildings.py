from pathlib import Path

index_path=Path("index.html")
test_path=Path("tests/map2-12-map4-buildings.cjs")
s=index_path.read_text(encoding="utf-8")
t=test_path.read_text(encoding="utf-8")

def repl(text, old, new, label):
    count=text.count(old)
    if count!=1:
        raise SystemExit(f"{label}: expected 1 match, found {count}")
    print("PATCH",label)
    return text.replace(old,new,1)

# TECH: pull the existing real Map4 buildings inward and add one alternating
# inner road building per cell. This creates an actual weave through buildings,
# instead of leaving the Map4 art mostly on the roadside.
old_tech = """                if(tech){
                    for(const side of [-1,1]){
                        const stagger=((cell*73)%170)-85;
                        const x=side*(520+Math.abs(stagger)*.36);
                        const families=['refinery','factory','power','outpost'];
                        const family=families[(cell+(side>0?1:0))%families.length];
                        // The old single rectangular placeholder is replaced by an
                        // actual Map4 building recipe, positioned outside the flight aperture.
                        map2AddMap4BuildingKit(
                            d+side*70,
                            side*(278+Math.abs(stagger)*.42),
                            family,
                            'ROAD_TECH_'+cell+'_'+(side>0?'R':'L'),
                            430+(cell%3)*20,
                            side*(cell%3-1)*.045,
                            true
                        );
"""
new_tech = """                if(tech){
                    const chicaneSide=cell%2?1:-1;
                    for(const side of [-1,1]){
                        const stagger=((cell*73)%170)-85;
                        const families=['refinery','factory','power','outpost'];
                        const family=families[(cell+(side>0?1:0))%families.length];
                        // MAP2-16: the real Map4 building now sits on the road edge,
                        // not in the distant scenery band.
                        map2AddMap4BuildingKit(
                            d+side*70,
                            side*(238+Math.abs(stagger)*.24),
                            family,
                            'ROAD_TECH_'+cell+'_'+(side>0?'R':'L'),
                            410+(cell%3)*18,
                            side*(cell%3-1)*.045,
                            true
                        );
                        // One additional complete Map4 building is pasted deeper into
                        // the road on alternating sides, creating a readable slalom.
                        const innerD=d+245;
                        if(side===chicaneSide&&map2Segment(innerD).kind!=='FAST'){
                            const innerFamily=families[(cell+2+(side>0?1:0))%families.length];
                            map2AddMap4BuildingKit(
                                innerD,
                                side*(158+(cell%3)*18),
                                innerFamily,
                                'ROAD_TECH_INNER_'+cell+'_'+(side>0?'R':'L'),
                                326+(cell%2)*18,
                                -side*.065,
                                true
                            );
                        }
"""
s=repl(s,old_tech,new_tech,"deepen TECH Map4 road buildings")

old_link = """                }else if(kind==='LINK'){
                    // LINK is no longer empty scenery. Copy Map4 buildings one-by-one
                    // directly onto the road, alternating sides to form a fly-through street.
                    const side=cell%2?1:-1;
                    const families=['refinery','factory','power','outpost'];
                    const family=families[cell%families.length];
                    map2AddMap4BuildingKit(
                        d,
                        side*(245+(cell%4)*24),
                        family,
                        'ROAD_LINK_'+cell+'_'+(side>0?'R':'L'),
                        420+(cell%3)*18,
                        side*(cell%3-1)*.05,
                        true
                    );
                    if(cell%4===0){
                        const other=families[(cell+2)%families.length];
                        map2AddMap4BuildingKit(
                            d+145,
                            -side*(330+(cell%3)*18),
                            other,
                            'ROAD_LINK_PAIR_'+cell,
                            360+(cell%2)*22,
                            -side*.04,
                            true
                        );
                    }
                    map2VisualStageStats.sideBlocks++;
                }
"""
new_link = """                }else if(kind==='LINK'){
                    // MAP2-16: LINK is a real Map4-building street. The first building
                    // is pulled inward, then a second complete building is pasted deeper
                    // on the opposite side so the player must thread between them.
                    const side=cell%2?1:-1;
                    const families=['refinery','factory','power','outpost'];
                    const family=families[cell%families.length];
                    map2AddMap4BuildingKit(
                        d,
                        side*(218+(cell%4)*18),
                        family,
                        'ROAD_LINK_'+cell+'_'+(side>0?'R':'L'),
                        398+(cell%3)*16,
                        side*(cell%3-1)*.05,
                        true
                    );
                    const innerD=d+238;
                    if(map2Segment(innerD).kind!=='FAST'){
                        const innerFamily=families[(cell+1)%families.length];
                        map2AddMap4BuildingKit(
                            innerD,
                            -side*(154+(cell%3)*20),
                            innerFamily,
                            'ROAD_LINK_INNER_'+cell+'_'+(side>0?'L':'R'),
                            324+(cell%2)*18,
                            side*.07,
                            true
                        );
                    }
                    if(cell%4===0){
                        const other=families[(cell+2)%families.length];
                        map2AddMap4BuildingKit(
                            d+145,
                            -side*(292+(cell%3)*16),
                            other,
                            'ROAD_LINK_PAIR_'+cell,
                            350+(cell%2)*18,
                            -side*.04,
                            true
                        );
                    }
                    map2VisualStageStats.sideBlocks++;
                }
"""
s=repl(s,old_link,new_link,"deepen LINK Map4 road buildings")

# Gate-side Map4 buildings were still sitting around +/-400. Bring those real
# building pieces into the visual flight corridor while leaving the physical
# gate aperture/collider rules unchanged.
for old,new,label in [
    ("map2AddMap4BuildingKit(d-70,-410,'factory','GATE_HANGAR_L_'+i,430,.04);",
     "map2AddMap4BuildingKit(d-70,-342,'factory','GATE_HANGAR_L_'+i,430,.04);","hangar left"),
    ("map2AddMap4BuildingKit(d+70,410,'refinery','GATE_HANGAR_R_'+i,430,-.04);",
     "map2AddMap4BuildingKit(d+70,342,'refinery','GATE_HANGAR_R_'+i,430,-.04);","hangar right"),
    ("map2AddMap4BuildingKit(d-35,-405,'power','GATE_GANTRY_L_'+i,445,.03);",
     "map2AddMap4BuildingKit(d-35,-338,'power','GATE_GANTRY_L_'+i,445,.03);","gantry left"),
    ("map2AddMap4BuildingKit(d+35,405,'factory','GATE_GANTRY_R_'+i,445,-.03);",
     "map2AddMap4BuildingKit(d+35,338,'factory','GATE_GANTRY_R_'+i,445,-.03);","gantry right"),
    ("map2AddMap4BuildingKit(d-150,-420,'refinery','GATE_DUAL_L_'+i,420,.045);",
     "map2AddMap4BuildingKit(d-150,-350,'refinery','GATE_DUAL_L_'+i,420,.045);","dual left"),
    ("map2AddMap4BuildingKit(d+150,420,'outpost','GATE_DUAL_R_'+i,420,-.045);",
     "map2AddMap4BuildingKit(d+150,350,'outpost','GATE_DUAL_R_'+i,420,-.045);","dual right"),
    ("map2AddMap4BuildingKit(d-110,-400,'outpost','GATE_SLOT_L_'+i,405,.05);",
     "map2AddMap4BuildingKit(d-110,-332,'outpost','GATE_SLOT_L_'+i,405,.05);","slot left"),
    ("map2AddMap4BuildingKit(d+110,400,'power','GATE_SLOT_R_'+i,405,-.05);",
     "map2AddMap4BuildingKit(d+110,332,'power','GATE_SLOT_R_'+i,405,-.05);","slot right"),
]:
    s=repl(s,old,new,label)

# Strengthen browser QA around the specific complaint: buildings must be pasted
# into the road, not merely counted somewhere in the scene.
old_eval = """    let road=0,link=0,tech=0,maxAbsX=0,fast=0;
    map2CourseGroup.traverse(o=>{
      if(!o.userData?.map2RoadPiece)return;
      road++;maxAbsX=Math.max(maxAbsX,Math.abs(o.userData.map2LaneX||0));
      const kind=map2Segment(o.userData.map2RouteProgress||0).kind;
      if(kind==='LINK')link++;if(kind==='TECH')tech++;if(kind==='FAST')fast++;
    });
"""
new_eval = """    let road=0,link=0,tech=0,maxAbsX=0,fast=0,innerRoad=0,deepInner=0;
    map2CourseGroup.traverse(o=>{
      if(!o.userData?.map2RoadPiece)return;
      const ax=Math.abs(o.userData.map2LaneX||0);
      road++;maxAbsX=Math.max(maxAbsX,ax);
      if(ax<=215)innerRoad++;
      if(ax<=195)deepInner++;
      const kind=map2Segment(o.userData.map2RouteProgress||0).kind;
      if(kind==='LINK')link++;if(kind==='TECH')tech++;if(kind==='FAST')fast++;
    });
"""
t=repl(t,old_eval,new_eval,"count inner road buildings")

old_ret = """      road,link,tech,fast,maxAbsX,
      physical:physical.length,
"""
new_ret = """      road,link,tech,fast,maxAbsX,innerRoad,deepInner,
      physical:physical.length,
"""
t=repl(t,old_ret,new_ret,"return inner road counts")

old_assert = """  assert(roadPieces.road>150,'road must be populated piece-by-piece with Map4 buildings');
  assert(roadPieces.link>20&&roadPieces.tech>40,'both LINK and TECH must contain on-road Map4 buildings');
"""
new_assert = """  assert(roadPieces.road>240,'road must be densely populated piece-by-piece with Map4 buildings');
  assert(roadPieces.link>45&&roadPieces.tech>70,'both LINK and TECH must contain many on-road Map4 buildings');
  assert(roadPieces.innerRoad>90,'many real Map4 buildings must be pasted inside the +/-215 road band');
  assert(roadPieces.deepInner>60,'a deep inner slalom of real Map4 buildings must exist inside +/-195');
"""
t=repl(t,old_assert,new_assert,"assert dense inner road buildings")

index_path.write_text(s,encoding="utf-8")
test_path.write_text(t,encoding="utf-8")
print("WROTE",index_path,len(s),test_path,len(t))
