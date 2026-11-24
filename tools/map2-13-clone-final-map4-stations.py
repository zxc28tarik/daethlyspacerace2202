from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

def repl(old,new,label):
    global s
    if old not in s: raise SystemExit("missing "+label)
    if s.count(old)!=1: raise SystemExit(f"non-unique {label}: {s.count(old)}")
    s=s.replace(old,new,1); print("PATCH",label)

old="""            const map2AddMap4BuildingKit=(d,baseX,family,id)=>{
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
new="""            // MAP2-13: build Map4 once, then clone its ACTUAL finalized W05 station groups.
            // No reconstruction from primitive kits. clone(true) preserves every child,
            // material, GFX06A/B/C hero, decal and architectural detail already attached.
            if(h4IndustrialGroups.length<6)buildPlanetaryWorld();
            const map2Map4StationSources=h4IndustrialGroups.slice(0,6);
            const map2Map4StationCenters=map2Map4StationSources.map(source=>{
                source.updateWorldMatrix(true,true);
                const box=new THREE.Box3().setFromObject(source);
                return box.getCenter(new THREE.Vector3());
            });
            const map2AddMap4BuildingKit=(d,baseX,family,id)=>{
                const familyIndex={refinery:0,factory:1,power:4,outpost:5}[family]??0;
                const source=map2Map4StationSources[familyIndex];
                const center=map2Map4StationCenters[familyIndex];
                if(!source||!center)throw new Error('MAP2 missing finalized Map4 station '+familyIndex);
                const anchor=makeCourseLocalGroup(d,baseX,-40);
                anchor.name='MAP2_MAP4_CLONE_ANCHOR_'+id;
                anchor.userData.map2VisualOnly=true;
                anchor.userData.map4ReusedBuilding=true;
                anchor.userData.map4Source=source.name;
                const clone=source.clone(true);
                clone.name='MAP2_CLONED_'+source.name+'_'+id;
                clone.position.sub(center);
                clone.scale.setScalar(.72);
                clone.traverse(obj=>{
                    obj.visible=true;
                    obj.userData={...obj.userData,map2VisualOnly:true,map4ClonedFinal:true};
                    if(obj.isMesh){
                        obj.castShadow=false;obj.receiveShadow=false;
                        map2VisualStageStats.map4BuildingMeshes++;
                    }
                });
                anchor.add(clone);
                sectionAt(d).add(anchor);
                map2VisualStageStats.map4BuildingKits++;
                return anchor;
            };
"""
repl(old,new,"clone finalized W05 station groups")

# Remove obsolete special VIS02 gate-detail mounting backing; keep collision mesh invisible
# and attach a cloned final Map4 station as visual skin next to physical gate.
old2="""            function mountKit(mesh,style){
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
new2="""            function mountKit(mesh,style){
                // Physical Map2 gate keeps its collider, but no fake visual skin is
                // generated here. The surrounding finalized Map4 station clones are the art.
                mesh.material=mesh.material.clone();mesh.material.visible=false;
                mesh.userData.map2PhysicalGateOnly=true;
                kitCounts[style]++;
            }
"""
repl(old2,new2,"remove reconstructed gate VIS02 skin")

p.write_text(s,encoding="utf-8")
print("WROTE",len(s))
