from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

def repl(old,new,label):
    global s
    if old not in s: raise SystemExit("missing "+label)
    if s.count(old)!=1: raise SystemExit(f"non-unique {label}: {s.count(old)}")
    s=s.replace(old,new,1)
    print("PATCH",label)

old="""            const map2AddMap4Part=(d,x,y,geo,mat,sx,sy,sz,name)=>{
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
new="""            const map2AddMap4BuildingKit=(d,baseX,family,id)=>{
                // Use the ACTUAL active Map4 VIS02 authored skyline geometry.
                // This is the same geometry/material pair h4Vis02DressIndustry()
                // installs into Map4, not the older H4_MESHES box recipes.
                const style={refinery:0,factory:1,power:3,outpost:2}[family];
                const g=makeCourseLocalGroup(d,baseX,18);
                const mesh=new THREE.Mesh(h4Vis02Kits[style],h4Vis02Mat);
                const height=family==='power'?610:family==='factory'?520:family==='refinery'?570:500;
                const width=family==='factory'?520:family==='power'?460:490;
                mesh.scale.set(width,height,470);
                mesh.name='MAP2_MAP4_VIS02_'+family.toUpperCase()+'_'+id;
                mesh.userData.map2VisualOnly=true;
                mesh.userData.map4ReusedBuilding=true;
                mesh.userData.map4Source='h4Vis02Kits['+style+']';
                mesh.castShadow=false;mesh.receiveShadow=false;
                g.name='MAP2_MAP4_BUILDING_'+family.toUpperCase()+'_'+id;
                g.userData.map2VisualOnly=true;g.userData.map4ReusedBuilding=true;
                g.add(mesh);
                // Reuse Map4's own roof-cap/aerial language so the silhouette reads
                // as a building from the player camera rather than a dark cuboid.
                const cap=new THREE.Mesh(h4Vis02PanelGeo,h4Vis02FacadeMats[0]);
                cap.scale.set(width*.54,42,300);cap.position.y=height*.50;
                cap.name='MAP2_MAP4_ROOF_CAP_'+id;g.add(cap);
                const aerial=new THREE.Mesh(h4Vis02PanelGeo,h4Vis02FacadeMats[2]);
                aerial.scale.set(18,160,18);aerial.position.set(width*.18,height*.68,0);
                aerial.name='MAP2_MAP4_AERIAL_'+id;g.add(aerial);
                sectionAt(d).add(g);
                map2VisualStageStats.map4BuildingKits++;
                map2VisualStageStats.map4BuildingMeshes+=3;
                return g;
            };
"""
repl(old,new,"replace legacy Map4 recipes with active VIS02 buildings")

old2="""            function mountKit(mesh,style){
                const bounds=kitBounds[style];
                const detail=new THREE.Mesh(h4Vis02Kits[style],h4Vis02Mat);
                detail.scale.set(.82/bounds.size.x,.84/bounds.size.y,.20/bounds.size.z);
                detail.position.set(-bounds.center.x*detail.scale.x,-bounds.center.y*detail.scale.y,.40-bounds.center.z*detail.scale.z);
                detail.name='MAP2_REUSED_H4_KIT_'+style;detail.userData.map2KitStyle=style;
                const core=new THREE.Mesh(H4_MESHES.structure,mesh.material);
                core.scale.set(1,1,.80);core.position.z=-.10;
                mesh.material=mesh.material.clone();mesh.material.visible=false;
                mesh.add(core,detail);kitCounts[style]++;
            }
"""
new2="""            function mountKit(mesh,style){
                const bounds=kitBounds[style];
                const detail=new THREE.Mesh(h4Vis02Kits[style],h4Vis02Mat);
                // Fill the visible pier volume with the actual Map4 authored kit.
                // Collider data stays unchanged; the black backing cuboid is removed.
                detail.scale.set(.96/bounds.size.x,.96/bounds.size.y,.86/bounds.size.z);
                detail.position.set(-bounds.center.x*detail.scale.x,
                    -bounds.center.y*detail.scale.y,-bounds.center.z*detail.scale.z);
                detail.name='MAP2_REUSED_H4_KIT_'+style;
                detail.userData.map2KitStyle=style;
                detail.userData.map4Source='h4Vis02Kits['+style+']';
                mesh.material=mesh.material.clone();mesh.material.visible=false;
                mesh.add(detail);kitCounts[style]++;
            }
"""
repl(old2,new2,"remove black gate backing cores")

# Reduce the remaining old generic TECH rooftop/catwalk boxes that visually read as buildings.
s=s.replace("addVisualBlock(d-135,side*(505+(cell%3)*30),185,118,66,150,",
            "addVisualBlock(d-135,side*(505+(cell%3)*30),185,78,42,90,",1)
s=s.replace("addVisualBlock(d+60,side*420,128,82,22,410,",
            "addVisualBlock(d+60,side*420,128,52,16,260,",1)

p.write_text(s,encoding="utf-8")
print("WROTE",len(s))
