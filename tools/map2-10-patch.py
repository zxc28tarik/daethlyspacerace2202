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
"        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0};\n",
"        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0,chokeWalls:0,turnFrames:0,silhouetteTowers:0};\n",
"extend composition stats")

replace_once(
"""                    if(style===0){
                        for(const z of [-220,220]){
                            addVisualBlock(d+z,-350,35,34,430,42,map2VisualMats.steel,'MAP2_HANGAR_RIB_L_'+i+'_'+z);
                            addVisualBlock(d+z,350,35,34,430,42,map2VisualMats.steel,'MAP2_HANGAR_RIB_R_'+i+'_'+z);
                            map2VisualStageStats.gateDetails+=2;
                        }
                    }else if(style===1){
""",
"""                    if(style===0){
                        for(const z of [-220,220]){
                            addVisualBlock(d+z,-350,35,34,430,42,map2VisualMats.steel,'MAP2_HANGAR_RIB_L_'+i+'_'+z);
                            addVisualBlock(d+z,350,35,34,430,42,map2VisualMats.steel,'MAP2_HANGAR_RIB_R_'+i+'_'+z);
                            map2VisualStageStats.gateDetails+=2;
                        }
                        addVisualBlock(d-70,-510,55,190,540,360,map2VisualMats.shell,'MAP2_HANGAR_TOWER_L_'+i);
                        addVisualBlock(d+70,510,55,190,540,360,map2VisualMats.shell,'MAP2_HANGAR_TOWER_R_'+i);
                        map2VisualStageStats.silhouetteTowers+=2;
                    }else if(style===1){
""",
"hangar silhouette")

replace_once(
"""                    }else if(style===1){
                        addVisualPipe(d,0,350,16,690,map2VisualMats.pipe,'MAP2_GANTRY_PIPE_A_'+i,'side');
                        addVisualPipe(d,0,382,11,690,map2VisualMats.pipe,'MAP2_GANTRY_PIPE_B_'+i,'side');
                        map2VisualStageStats.gateDetails+=2;
                    }else if(style===2){
""",
"""                    }else if(style===1){
                        addVisualPipe(d,0,350,16,690,map2VisualMats.pipe,'MAP2_GANTRY_PIPE_A_'+i,'side');
                        addVisualPipe(d,0,382,11,690,map2VisualMats.pipe,'MAP2_GANTRY_PIPE_B_'+i,'side');
                        addVisualBlock(d-35,-500,95,120,650,250,map2VisualMats.steel,'MAP2_GANTRY_PYLON_L_'+i);
                        addVisualBlock(d+35,500,95,120,650,250,map2VisualMats.steel,'MAP2_GANTRY_PYLON_R_'+i);
                        map2VisualStageStats.gateDetails+=2;map2VisualStageStats.silhouetteTowers+=2;
                    }else if(style===2){
""",
"gantry silhouette")

replace_once(
"""                    }else if(style===2){
                        addVisualTank(d-180,-455,-70,64,250,map2VisualMats.tank,'MAP2_DUAL_TANK_L_'+i);
                        addVisualTank(d+180,455,-70,64,250,map2VisualMats.tank,'MAP2_DUAL_TANK_R_'+i);
                        addVisualPipe(d,-455,90,12,420,map2VisualMats.pipe,'MAP2_DUAL_PIPE_L_'+i);
                        addVisualPipe(d,455,90,12,420,map2VisualMats.pipe,'MAP2_DUAL_PIPE_R_'+i);
                        map2VisualStageStats.gateDetails+=4;
                    }else{
""",
"""                    }else if(style===2){
                        addVisualTank(d-180,-455,-70,64,250,map2VisualMats.tank,'MAP2_DUAL_TANK_L_'+i);
                        addVisualTank(d+180,455,-70,64,250,map2VisualMats.tank,'MAP2_DUAL_TANK_R_'+i);
                        addVisualPipe(d,-455,90,12,420,map2VisualMats.pipe,'MAP2_DUAL_PIPE_L_'+i);
                        addVisualPipe(d,455,90,12,420,map2VisualMats.pipe,'MAP2_DUAL_PIPE_R_'+i);
                        addVisualBlock(d-150,-585,20,210,480,420,map2VisualMats.warm,'MAP2_DUAL_FACTORY_MASS_L_'+i);
                        addVisualBlock(d+150,585,20,210,480,420,map2VisualMats.shell,'MAP2_DUAL_FACTORY_MASS_R_'+i);
                        map2VisualStageStats.gateDetails+=4;map2VisualStageStats.silhouetteTowers+=2;
                    }else{
""",
"dual silhouette")

replace_once(
"""                    }else{
                        for(const side of [-1,1])for(const y of [150,205,260]){
                            addVisualBlock(d+side*105,side*292,y,82,16,54,map2VisualMats.dark,
                                'MAP2_SLOT_FIN_'+i+'_'+side+'_'+y);
                            map2VisualStageStats.gateDetails++;
                        }
                    }
""",
"""                    }else{
                        for(const side of [-1,1])for(const y of [150,205,260]){
                            addVisualBlock(d+side*105,side*292,y,82,16,54,map2VisualMats.dark,
                                'MAP2_SLOT_FIN_'+i+'_'+side+'_'+y);
                            map2VisualStageStats.gateDetails++;
                        }
                        addVisualBlock(d-110,-455,70,135,600,330,map2VisualMats.dark,'MAP2_SLOT_MACHINE_L_'+i);
                        addVisualBlock(d+110,455,70,135,600,330,map2VisualMats.dark,'MAP2_SLOT_MACHINE_R_'+i);
                        addVisualBlock(d,0,420,760,34,210,map2VisualMats.steel,'MAP2_SLOT_CROWN_'+i);
                        map2VisualStageStats.silhouetteTowers+=2;map2VisualStageStats.gateDetails++;
                    }
""",
"slot silhouette")

replace_once(
"""                    // Actual route curvature determines paired city walls.
                    const turnAngle=getRaceFrameAtDistance(d-650).tangent.angleTo(getRaceFrameAtDistance(d+650).tangent);
                    if(turnAngle>.095||i%7===1){
                        for(const side of [-1,1]){
                            const m=addSolid(d-430,side*306,-18,82,400,180,detailMat,'CITY_TURN_'+i);
                            h4ArchitecturalDetail(m,'tower');
                        }
                    }
""",
"""                    // Actual route curvature determines paired city walls.
                    const frameBefore=getRaceFrameAtDistance(d-650),frameAfter=getRaceFrameAtDistance(d+650);
                    const turnAngle=frameBefore.tangent.angleTo(frameAfter.tangent);
                    const turnCross=frameBefore.tangent.x*frameAfter.tangent.z-frameBefore.tangent.z*frameAfter.tangent.x;
                    const turnSign=Math.sign(turnCross)||1;
                    if(turnAngle>.095||i%7===1){
                        for(const side of [-1,1]){
                            const m=addSolid(d-430,side*306,-18,82,400,180,detailMat,'CITY_TURN_'+i);
                            h4ArchitecturalDetail(m,'tower');
                        }
                    }
                    // MAP2-10: visual composition around sharp turns. Physical CITY_TURN
                    // walls remain the only collider change from earlier milestones.
                    if(turnAngle>.095){
                        for(const offset of [-690,-430,-170]){
                            for(const side of [-1,1]){
                                const outer=side===turnSign;
                                const x=side*(505+(outer?70:0));
                                const h=(outer?620:470)+((i+offset)%3)*35;
                                addVisualBlock(d+offset,x,30,outer?190:155,h,260,
                                    outer?map2VisualMats.shell:map2VisualMats.dark,
                                    'MAP2_CHOKE_WALL_'+i+'_'+offset+'_'+side);
                                map2VisualStageStats.chokeWalls++;
                            }
                        }
                        const towerSide=turnSign;
                        addVisualStack(d-540,towerSide*720,40,58,660,map2VisualMats.steel,'MAP2_TURN_TOWER_'+i);
                        addVisualBlock(d-510,towerSide*610,315,250,26,330,map2VisualMats.steel,'MAP2_TURN_FRAME_'+i);
                        addVisualLamp(d-500,towerSide*470,280,12,map2VisualMats.signalWarm,'MAP2_TURN_BEACON_A_'+i);
                        addVisualLamp(d-500,towerSide*750,280,12,map2VisualMats.signalWarm,'MAP2_TURN_BEACON_B_'+i);
                        map2VisualStageStats.silhouetteTowers++;map2VisualStageStats.turnFrames++;
                    }
""",
"sharp turn industrial canyon composition")

p.write_text(s,encoding="utf-8")
print("WROTE",p,len(s))
