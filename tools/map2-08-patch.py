from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

def replace_once(old,new,label):
    global s
    if old not in s:
        raise SystemExit(f"missing patch target: {label}")
    if s.count(old)!=1:
        raise SystemExit(f"non-unique patch target {label}: {s.count(old)}")
    s=s.replace(old,new,1)
    print("PATCH",label)

replace_once(
"        const map2Obstacles=[],map2Items=[],map2Gates=[],map2Sections=[];\n",
"""        const map2Obstacles=[],map2Items=[],map2Gates=[],map2Sections=[];
        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0};
""","visual stats")

replace_once(
"""            const sectionAt=d=>map2Sections[Math.min(map2Sections.length-1,Math.floor(d/2500))];
            const addSolid=(d,x,y,w,h,depth,mat,kind)=>{
""",
"""            const sectionAt=d=>map2Sections[Math.min(map2Sections.length-1,Math.floor(d/2500))];

            // MAP2-08: build an actual industrial district around the physical gates.
            // These meshes are visual context only. The obstacle list below remains the
            // sole authority for collision, so FAST lanes stay physically clear.
            const map2VisualMats={
                floor:H4_MATERIALS.wall.clone(),
                shell:H4_MATERIALS.wall.clone(),
                steel:H4_MATERIALS.steel.clone(),
                dark:H4_MATERIALS.wreck.clone(),
                warm:H4_MATERIALS.steel.clone(),
                signal:new THREE.MeshBasicMaterial({color:0x74d4dc})
            };
            map2VisualMats.floor.color.setHex(0x20292f);map2VisualMats.floor.roughness=.88;
            map2VisualMats.shell.color.setHex(0x2c3b43);map2VisualMats.shell.roughness=.78;
            map2VisualMats.steel.color.setHex(0x496573);map2VisualMats.steel.roughness=.64;
            map2VisualMats.dark.color.setHex(0x172126);map2VisualMats.dark.roughness=.86;
            map2VisualMats.warm.color.setHex(0x76584a);map2VisualMats.warm.roughness=.74;
            const addVisualBlock=(d,x,y,w,h,depth,mat,name)=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(H4_MESHES.structure,mat);
                mesh.scale.set(w,h,depth);mesh.castShadow=false;mesh.receiveShadow=false;
                mesh.userData.map2VisualOnly=true;g.userData.map2VisualOnly=true;g.name=name;
                g.add(mesh);sectionAt(d).add(g);return g;
            };
            const addVisualStack=(d,x,y,r,h,mat,name)=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(H4_MESHES.tower,mat);
                mesh.scale.set(r,h,r);mesh.userData.map2VisualOnly=true;
                g.userData.map2VisualOnly=true;g.name=name;g.add(mesh);sectionAt(d).add(g);return g;
            };
            for(let d=310,cell=0;d<MAP2_DISTANCE-200;d+=620,cell++){
                const kind=map2Segment(d).kind;
                const tech=kind==='TECH',fast=kind==='FAST';
                const deckWidth=fast?1320:tech?980:1120;
                addVisualBlock(d,0,-285,deckWidth,58,690,map2VisualMats.floor,'MAP2_VISUAL_DECK_'+cell);
                map2VisualStageStats.deckSlabs++;
                if(tech){
                    for(const side of [-1,1]){
                        const stagger=((cell*73)%170)-85;
                        const x=side*(520+Math.abs(stagger)*.36);
                        const h=360+(cell%5)*58;
                        const w=170+(cell%3)*42;
                        addVisualBlock(d+side*70,x,-48,w,h,470+(cell%4)*70,
                            cell%4===0?map2VisualMats.warm:map2VisualMats.shell,
                            'MAP2_VISUAL_FACTORY_'+cell+'_'+side);
                        map2VisualStageStats.sideBlocks++;
                        if(cell%2===0){
                            addVisualStack(d-120,side*(655+(cell%3)*38),20,42+(cell%3)*8,390+(cell%4)*70,
                                map2VisualMats.steel,'MAP2_VISUAL_STACK_'+cell+'_'+side);
                            map2VisualStageStats.stacks++;
                        }
                    }
                    if(cell%3===1){
                        addVisualBlock(d,0,286,930,28,92,map2VisualMats.dark,'MAP2_VISUAL_TRUSS_'+cell);
                        addVisualBlock(d,-438,238,34,125,92,map2VisualMats.steel,'MAP2_VISUAL_TRUSS_L_'+cell);
                        addVisualBlock(d,438,238,34,125,92,map2VisualMats.steel,'MAP2_VISUAL_TRUSS_R_'+cell);
                        map2VisualStageStats.trusses++;
                    }
                }else if(fast && cell%2===0){
                    for(const side of [-1,1]){
                        addVisualBlock(d,side*(790+(cell%3)*80),-70,240,300+(cell%4)*45,520,
                            map2VisualMats.dark,'MAP2_FAST_SILHOUETTE_'+cell+'_'+side);
                        map2VisualStageStats.fastMarkers++;
                    }
                }else if(kind==='LINK' && cell%3===0){
                    for(const side of [-1,1]){
                        addVisualBlock(d,side*690,-95,190,260,430,map2VisualMats.dark,
                            'MAP2_LINK_SILHOUETTE_'+cell+'_'+side);
                        map2VisualStageStats.sideBlocks++;
                    }
                }
            }
            const addSolid=(d,x,y,w,h,depth,mat,kind)=>{
""","industrial visual stage")

replace_once(
"                    const depth=[210,180,255,310][style];\n",
"                    const depth=[620,460,700,520][style];\n",
"physical passage depth")

replace_once(
"""            window.starbladeMap2Layout={distance:MAP2_DISTANCE,actualArc:map2RouteCurve.getLength(),
                map1Arc:RACE_ROUTE_TOTAL_ARC_LENGTH,segments:MAP2_SEGMENTS,structures:map2Obstacles.length,
                gates:map2Gates.length,items:map2Items.length,gateKinds:gateKinds.slice(),kitCounts:kitCounts.slice(),openings:map2Gates.reduce((n,g)=>n+g.openings.length,0),apertureGuides:apertureGuideCount,
                closure:map2RouteCurve.getPointAt(0).distanceTo(map2RouteCurve.getPointAt(1))};
""",
"""            window.starbladeMap2Layout={distance:MAP2_DISTANCE,actualArc:map2RouteCurve.getLength(),
                map1Arc:RACE_ROUTE_TOTAL_ARC_LENGTH,segments:MAP2_SEGMENTS,structures:map2Obstacles.length,
                gates:map2Gates.length,items:map2Items.length,gateKinds:gateKinds.slice(),kitCounts:kitCounts.slice(),openings:map2Gates.reduce((n,g)=>n+g.openings.length,0),apertureGuides:apertureGuideCount,
                visualStage:{...map2VisualStageStats},
                closure:map2RouteCurve.getPointAt(0).distanceTo(map2RouteCurve.getPointAt(1))};
""","layout visual stats")

replace_once(
"""                scene.background.setHex(0x62524c);scene.fog.color.setHex(0x62524c);scene.fog.density=.00025;
                ambientLight.color.setHex(0xb9b1a9);ambientLight.intensity=1.6;
                nebulaLight1.color.setHex(0xffd0a2);nebulaLight2.color.setHex(0x91b5c2);
""",
"""                scene.background.setHex(0x172127);scene.fog.color.setHex(0x26343b);scene.fog.density=.00017;
                ambientLight.color.setHex(0xb9c9cb);ambientLight.intensity=1.42;
                nebulaLight1.color.setHex(0xe7a36f);nebulaLight1.intensity=1.35;
                nebulaLight2.color.setHex(0x79c6d2);nebulaLight2.intensity=1.45;
""","Map2 industrial atmosphere")

p.write_text(s,encoding="utf-8")
print("WROTE",p,len(s))
