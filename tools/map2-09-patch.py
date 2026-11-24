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
"        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0};\n",
"        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0};\n",
"extend visual stats")

replace_once(
"""            const map2VisualMats={
                floor:H4_MATERIALS.wall.clone(),
                shell:H4_MATERIALS.wall.clone(),
                steel:H4_MATERIALS.steel.clone(),
                dark:H4_MATERIALS.wreck.clone(),
                warm:H4_MATERIALS.steel.clone(),
                signal:new THREE.MeshBasicMaterial({color:0x74d4dc})
            };
""",
"""            const map2VisualMats={
                floor:H4_MATERIALS.wall.clone(),
                shell:H4_MATERIALS.wall.clone(),
                steel:H4_MATERIALS.steel.clone(),
                dark:H4_MATERIALS.wreck.clone(),
                warm:H4_MATERIALS.steel.clone(),
                pipe:H4_MATERIALS.steel.clone(),
                tank:H4_MATERIALS.wall.clone(),
                service:H4_MATERIALS.wreck.clone(),
                signal:new THREE.MeshBasicMaterial({color:0x74d4dc}),
                signalWarm:new THREE.MeshBasicMaterial({color:0xe59a62})
            };
""",
"detail materials")

replace_once(
"""            map2VisualMats.warm.color.setHex(0x76584a);map2VisualMats.warm.roughness=.74;
            const addVisualBlock=(d,x,y,w,h,depth,mat,name)=>{
""",
"""            map2VisualMats.warm.color.setHex(0x76584a);map2VisualMats.warm.roughness=.74;
            map2VisualMats.pipe.color.setHex(0x68818b);map2VisualMats.pipe.roughness=.48;map2VisualMats.pipe.metalness=.66;
            map2VisualMats.tank.color.setHex(0x53636a);map2VisualMats.tank.roughness=.68;map2VisualMats.tank.metalness=.38;
            map2VisualMats.service.color.setHex(0x111a1e);map2VisualMats.service.roughness=.84;
            const map2DetailGeos={
                pipe:new THREE.CylinderGeometry(1,1,1,8),
                tank:new THREE.CylinderGeometry(1,1,1,12),
                lamp:new THREE.SphereGeometry(1,6,4)
            };
            const addVisualBlock=(d,x,y,w,h,depth,mat,name)=>{
""",
"detail geometries")

replace_once(
"""            const addVisualStack=(d,x,y,r,h,mat,name)=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(H4_MESHES.tower,mat);
                mesh.scale.set(r,h,r);mesh.userData.map2VisualOnly=true;
                g.userData.map2VisualOnly=true;g.name=name;g.add(mesh);sectionAt(d).add(g);return g;
            };
            for(let d=310,cell=0;d<MAP2_DISTANCE-200;d+=620,cell++){
""",
"""            const addVisualStack=(d,x,y,r,h,mat,name)=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(H4_MESHES.tower,mat);
                mesh.scale.set(r,h,r);mesh.userData.map2VisualOnly=true;
                g.userData.map2VisualOnly=true;g.name=name;g.add(mesh);sectionAt(d).add(g);return g;
            };
            const addVisualPipe=(d,x,y,r,length,mat,name,axis='route')=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(map2DetailGeos.pipe,mat);
                mesh.scale.set(r,length,r);
                if(axis==='route')mesh.rotation.x=Math.PI/2;
                else if(axis==='side')mesh.rotation.z=Math.PI/2;
                mesh.userData.map2VisualOnly=true;g.userData.map2VisualOnly=true;g.name=name;
                g.add(mesh);sectionAt(d).add(g);return g;
            };
            const addVisualTank=(d,x,y,r,h,mat,name)=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(map2DetailGeos.tank,mat);
                mesh.scale.set(r,h,r);mesh.userData.map2VisualOnly=true;
                g.userData.map2VisualOnly=true;g.name=name;g.add(mesh);sectionAt(d).add(g);return g;
            };
            const addVisualLamp=(d,x,y,r,mat,name)=>{
                const g=makeCourseLocalGroup(d,x,y);
                const mesh=new THREE.Mesh(map2DetailGeos.lamp,mat);
                mesh.scale.setScalar(r);mesh.userData.map2VisualOnly=true;
                g.userData.map2VisualOnly=true;g.name=name;g.add(mesh);sectionAt(d).add(g);return g;
            };
            for(let d=310,cell=0;d<MAP2_DISTANCE-200;d+=620,cell++){
""",
"detail helpers")

replace_once(
"""                    if(cell%3===1){
                        addVisualBlock(d,0,286,930,28,92,map2VisualMats.dark,'MAP2_VISUAL_TRUSS_'+cell);
                        addVisualBlock(d,-438,238,34,125,92,map2VisualMats.steel,'MAP2_VISUAL_TRUSS_L_'+cell);
                        addVisualBlock(d,438,238,34,125,92,map2VisualMats.steel,'MAP2_VISUAL_TRUSS_R_'+cell);
                        map2VisualStageStats.trusses++;
                    }
                }else if(fast && cell%2===0){
""",
"""                    if(cell%3===1){
                        addVisualBlock(d,0,286,930,28,92,map2VisualMats.dark,'MAP2_VISUAL_TRUSS_'+cell);
                        addVisualBlock(d,-438,238,34,125,92,map2VisualMats.steel,'MAP2_VISUAL_TRUSS_L_'+cell);
                        addVisualBlock(d,438,238,34,125,92,map2VisualMats.steel,'MAP2_VISUAL_TRUSS_R_'+cell);
                        map2VisualStageStats.trusses++;
                    }
                    // MAP2-09: secondary industrial language. All pieces stay outside
                    // the flight aperture and are visual-only so collision remains MAP2-08 safe.
                    if(cell%2===0){
                        for(const side of [-1,1]){
                            addVisualPipe(d-80,side*(455+(cell%3)*22),105+(cell%4)*24,18,520,
                                map2VisualMats.pipe,'MAP2_PIPE_'+cell+'_'+side);
                            map2VisualStageStats.pipeRuns++;
                        }
                    }
                    if(cell%3===0){
                        for(const side of [-1,1]){
                            addVisualTank(d+125,side*(650+(cell%4)*24),-80,72+(cell%3)*8,250+(cell%5)*22,
                                cell%6===0?map2VisualMats.warm:map2VisualMats.tank,
                                'MAP2_TANK_'+cell+'_'+side);
                            map2VisualStageStats.tanks++;
                        }
                    }
                    if(cell%4===1){
                        for(const side of [-1,1]){
                            addVisualBlock(d-135,side*(505+(cell%3)*30),185,118,66,150,
                                map2VisualMats.service,'MAP2_ROOF_UNIT_'+cell+'_'+side);
                            addVisualPipe(d-135,side*(505+(cell%3)*30),225,10,120,
                                map2VisualMats.pipe,'MAP2_ROOF_VENT_'+cell+'_'+side,'vertical');
                            map2VisualStageStats.roofUnits++;
                        }
                    }
                    if(cell%5===2){
                        for(const side of [-1,1]){
                            addVisualBlock(d+60,side*420,128,82,22,410,map2VisualMats.steel,
                                'MAP2_CATWALK_'+cell+'_'+side);
                            addVisualBlock(d-110,side*420,68,22,120,24,map2VisualMats.dark,
                                'MAP2_CATWALK_SUPPORT_'+cell+'_'+side);
                            map2VisualStageStats.catwalks++;
                        }
                    }
                    if(cell%6===3){
                        for(const side of [-1,1]){
                            addVisualLamp(d-210,side*398,205,9,
                                side<0?map2VisualMats.signal:map2VisualMats.signalWarm,
                                'MAP2_SERVICE_LIGHT_'+cell+'_'+side);
                            map2VisualStageStats.signals++;
                        }
                    }
                }else if(fast && cell%2===0){
""",
"TECH industrial detail cadence")

replace_once(
"""                    addVisualBlock(d,0,292,790,104,visualTunnelDepth,map2VisualMats.shell,
                        'MAP2_GATE_SHELL_TOP_'+i);
                    map2VisualStageStats.sideBlocks+=2;map2VisualStageStats.trusses++;
                    map2Gates.push({distance:d,mode:'CENTER_ONLY',laneX:opening,laneY:oy,clearX:hx,clearY:hy,
""",
"""                    addVisualBlock(d,0,292,790,104,visualTunnelDepth,map2VisualMats.shell,
                        'MAP2_GATE_SHELL_TOP_'+i);
                    map2VisualStageStats.sideBlocks+=2;map2VisualStageStats.trusses++;
                    if(style===0){
                        for(const z of [-220,220]){
                            addVisualBlock(d+z,-350,35,34,430,42,map2VisualMats.steel,'MAP2_HANGAR_RIB_L_'+i+'_'+z);
                            addVisualBlock(d+z,350,35,34,430,42,map2VisualMats.steel,'MAP2_HANGAR_RIB_R_'+i+'_'+z);
                            map2VisualStageStats.gateDetails+=2;
                        }
                    }else if(style===1){
                        addVisualPipe(d,0,350,16,690,map2VisualMats.pipe,'MAP2_GANTRY_PIPE_A_'+i,'side');
                        addVisualPipe(d,0,382,11,690,map2VisualMats.pipe,'MAP2_GANTRY_PIPE_B_'+i,'side');
                        map2VisualStageStats.gateDetails+=2;
                    }else if(style===2){
                        addVisualTank(d-180,-455,-70,64,250,map2VisualMats.tank,'MAP2_DUAL_TANK_L_'+i);
                        addVisualTank(d+180,455,-70,64,250,map2VisualMats.tank,'MAP2_DUAL_TANK_R_'+i);
                        addVisualPipe(d,-455,90,12,420,map2VisualMats.pipe,'MAP2_DUAL_PIPE_L_'+i);
                        addVisualPipe(d,455,90,12,420,map2VisualMats.pipe,'MAP2_DUAL_PIPE_R_'+i);
                        map2VisualStageStats.gateDetails+=4;
                    }else{
                        for(const side of [-1,1])for(const y of [150,205,260]){
                            addVisualBlock(d+side*105,side*292,y,82,16,54,map2VisualMats.dark,
                                'MAP2_SLOT_FIN_'+i+'_'+side+'_'+y);
                            map2VisualStageStats.gateDetails++;
                        }
                    }
                    map2Gates.push({distance:d,mode:'CENTER_ONLY',laneX:opening,laneY:oy,clearX:hx,clearY:hy,
""",
"gate family detail language")

p.write_text(s,encoding="utf-8")
print("WROTE",p,len(s))
