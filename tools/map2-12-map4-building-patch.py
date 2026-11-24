from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

def repl(old,new,label):
    global s
    if old not in s: raise SystemExit("missing "+label)
    if s.count(old)!=1: raise SystemExit(f"non-unique {label}: {s.count(old)}")
    s=s.replace(old,new,1)
    print("PATCH",label)

repl(
"const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0,chokeWalls:0,turnFrames:0,silhouetteTowers:0,rooflineRails:0,safeApertureLights:0};",
"const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0,chokeWalls:0,turnFrames:0,silhouetteTowers:0,rooflineRails:0,safeApertureLights:0,map4BuildingKits:0,map4BuildingMeshes:0};",
"extend stats")

anchor="""            const addVisualLamp=(d,x,y,r,mat,name)=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(map2DetailGeos.lamp,mat);
                mesh.scale.setScalar(r);mesh.userData.map2VisualOnly=true;
                g.userData.map2VisualOnly=true;g.name=name;g.add(mesh);sectionAt(d).add(g);return g;
            };
"""
insert=anchor+"""            // MAP2-12: reuse the authored MAP4 landmark building recipes verbatim.
            // No new building design is invented here; these are the same refinery,
            // factory, power and outpost compositions used by h4CreateLandmark().
            const map2AddMap4Part=(d,x,y,geo,mat,sx,sy,sz,name)=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(geo,mat);
                mesh.scale.set(sx,sy,sz);mesh.userData.map2VisualOnly=true;
                mesh.castShadow=false;mesh.receiveShadow=false;
                if(geo===H4_MESHES.structure&&sy>=180&&sx>=75)
                    h4ArchitecturalDetail(mesh,sy>430?'tower':'building');
                g.userData.map2VisualOnly=true;g.userData.map4ReusedBuilding=true;
                g.name=name;g.add(mesh);sectionAt(d).add(g);
                map2VisualStageStats.map4BuildingMeshes++;
                return g;
            };
            const map2AddMap4BuildingKit=(d,baseX,family,id)=>{
                const ground=-256;
                const add=(delta,shift,height,geo,mat,sx,sy,sz,role)=>
                    map2AddMap4Part(d+delta,baseX+shift,ground+height,geo,mat,sx,sy,sz,
                        'MAP2_MAP4_'+family.toUpperCase()+'_'+id+'_'+role);
                const metal=H4_DETAIL_MAT.oxidized,armor=H4_DETAIL_MAT.armor;
                if(family==='refinery'){
                    add(0,0,85,H4_MESHES.structure,armor,340,170,255,'CORE');
                    for(const side of [-1,1]){
                        add(-70,side*175,210,H4_MESHES.tower,metal,62,420,62,'STACK_'+side);
                        add(-70,side*175,435,H4_DETAIL_GEO.ring,H4_DETAIL_MAT.hazard,49,49,49,'RING_'+side);
                        add(110,side*140,115,H4_MESHES.structure,metal,110,230,110,'PROCESS_'+side);
                    }
                    add(30,0,330,H4_MESHES.structure,H4_DETAIL_MAT.cyan,70,18,60,'SIGNAL');
                }else if(family==='factory'){
                    for(let i=0;i<3;i++){
                        const pos=(i-1)*200;
                        add(i*60,pos,185,H4_MESHES.structure,armor,180,370,190,'BLOCK_'+i);
                        add(i*60,pos,397,H4_DETAIL_GEO.plate,metal,210,35,215,'ROOF_'+i);
                        add(i*60,pos,485,H4_DETAIL_GEO.mast,H4_DETAIL_MAT.warning,22,195,22,'MAST_'+i);
                    }
                }else if(family==='power'){
                    add(0,0,65,H4_MESHES.structure,armor,300,130,230,'BASE');
                    for(const side of [-1,1]){
                        add(0,side*190,300,H4_MESHES.tower,metal,65,600,65,'TOWER_'+side);
                        add(0,side*190,612,H4_DETAIL_GEO.sphere,H4_DETAIL_MAT.cyan,42,42,42,'ORB_'+side);
                        add(0,side*190,515,H4_DETAIL_GEO.ring,H4_DETAIL_MAT.purple,90,90,90,'COIL_'+side);
                    }
                }else{
                    for(const side of [-1,1]){
                        add(0,side*210,160,H4_MESHES.structure,H4_MATERIALS.wall,135,320,140,'SIDE_'+side);
                        add(0,side*210,335,H4_DETAIL_GEO.hull,H4_DETAIL_MAT.hazard,45,45,45,'CAP_'+side);
                    }
                    add(-110,0,55,H4_MESHES.structure,armor,270,110,145,'BASE');
                }
                map2VisualStageStats.map4BuildingKits++;
            };
"""
repl(anchor,insert,"Map4 kit helpers")

old="""                        const h=360+(cell%5)*58;
                        const w=170+(cell%3)*42;
                        addVisualBlock(d+side*70,x,-48,w,h,470+(cell%4)*70,
                            cell%4===0?map2VisualMats.warm:map2VisualMats.shell,
                            'MAP2_VISUAL_FACTORY_'+cell+'_'+side);
                        map2VisualStageStats.sideBlocks++;
"""
new="""                        const families=['refinery','factory','power','outpost'];
                        const family=families[(cell+(side>0?1:0))%families.length];
                        // The old single rectangular placeholder is replaced by an
                        // actual Map4 building recipe, positioned outside the flight aperture.
                        map2AddMap4BuildingKit(d+side*70,side*(690+Math.abs(stagger)*.28),
                            family,cell+'_'+(side>0?'R':'L'));
"""
repl(old,new,"replace generic factories")

p.write_text(s,encoding="utf-8")
print("WROTE",len(s))
