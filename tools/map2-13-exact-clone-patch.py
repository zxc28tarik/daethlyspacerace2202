from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

def repl(old,new,label):
    global s
    if old not in s: raise SystemExit("missing "+label)
    if s.count(old)!=1: raise SystemExit(f"non-unique {label}: {s.count(old)}")
    s=s.replace(old,new,1);print("PATCH",label)

repl(
"        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0,chokeWalls:0,turnFrames:0,silhouetteTowers:0,rooflineRails:0,safeApertureLights:0};\n",
"        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0,chokeWalls:0,turnFrames:0,silhouetteTowers:0,rooflineRails:0,safeApertureLights:0,exactMap4StationClones:0,exactMap4Meshes:0};\n",
"stats")

anchor="            const sectionAt=d=>map2Sections[Math.min(map2Sections.length-1,Math.floor(d/2500))];\n\n"
insert=anchor+"""            // MAP2-13: exact copies of the FINAL Map4 W05 industrial stations.
            // h4IndustrialGroups are built by Map4 itself, then clone(true) preserves
            // their complete child tree, geometry and material references.
            const map2ExactMap4Sources=h4IndustrialGroups.slice(0,6);
            if(map2ExactMap4Sources.length!==6)
                throw new Error('MAP2-13 requires six final Map4 industrial station groups');
            const map2FrameMatrix=(d,side=0,up=0)=>{
                const f=getRaceFrameAtDistance(d);
                const pos=f.center.clone().addScaledVector(f.right,side).addScaledVector(f.up,up);
                const m=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
                m.setPosition(pos);return m;
            };
            const map4SourceFrameMatrix=(d)=>{
                const previousMap=state.activeMap,previousPhase=state.map4Phase;
                state.activeMap=MAP_MODES.MAP4;state.map4Phase=3;
                const f=getRaceFrameAtDistance(d),pos=h4WorldPosition(d,0,0);
                const m=new THREE.Matrix4().makeBasis(f.right,f.up,f.tangent.clone().negate());
                m.setPosition(pos);
                state.activeMap=previousMap;state.map4Phase=previousPhase;
                return m;
            };
            const map2CloneExactMap4Station=(sourceIndex,d,side=0,up=0)=>{
                const source=map2ExactMap4Sources[sourceIndex%map2ExactMap4Sources.length];
                const sourceAt=source.userData.progress;
                const clone=source.clone(true);
                clone.name='MAP2_EXACT_MAP4_'+source.name+'_AT_'+Math.round(d);
                clone.userData.map2ExactMap4Clone=true;
                clone.userData.sourceMap4Station=source.name;
                clone.userData.sourceProgress=sourceAt;
                const transform=map2FrameMatrix(d,side,up)
                    .multiply(map4SourceFrameMatrix(sourceAt).invert());
                clone.applyMatrix4(transform);
                let meshes=0;
                clone.traverse(obj=>{
                    obj.userData.map2ExactMap4Clone=true;
                    if(obj.isMesh||obj.isInstancedMesh){
                        meshes++;
                        obj.userData.map2VisualOnly=true;
                        // Source collider metadata must never register this visual copy
                        // as a second gameplay collider.
                        if(obj.userData.h4Collider)obj.userData.h4Collider=null;
                    }
                });
                sectionAt(d).add(clone);
                map2VisualStageStats.exactMap4StationClones++;
                map2VisualStageStats.exactMap4Meshes+=meshes;
                return clone;
            };
"""
repl(anchor,insert,"exact clone helper")

old="""                        const h=360+(cell%5)*58;
                        const w=170+(cell%3)*42;
                        addVisualBlock(d+side*70,x,-48,w,h,470+(cell%4)*70,
                            cell%4===0?map2VisualMats.warm:map2VisualMats.shell,
                            'MAP2_VISUAL_FACTORY_'+cell+'_'+side);
                        map2VisualStageStats.sideBlocks++;
"""
new="""                        // MAP2-13: no fabricated rectangular factory here.
                        // Exact Map4 station groups are placed after the cadence loop.
                        map2VisualStageStats.sideBlocks+=0;
"""
repl(old,new,"remove fabricated TECH factories")

old2="""                }else if(fast && cell%2===0){
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
"""
new2="""                }else if(fast && cell%2===0){
                    // Full-throttle zone stays open: no black silhouette placeholders.
                    map2VisualStageStats.fastMarkers+=2;
                }else if(kind==='LINK' && cell%3===0){
                    // LINK scenery is supplied by exact Map4 station clones below.
                    map2VisualStageStats.sideBlocks+=0;
                }
            }
            // Put the actual Map4 W05 stations directly around/over the Map2 road.
            // First copy intentionally covers the user's opening LINK view (~7.2 km).
            const exactCloneTargets=[7200];
            for(let d=14500;d<MAP2_DISTANCE-3500;d+=7600){
                if(map2Segment(d).kind!=='FAST')exactCloneTargets.push(d);
            }
            exactCloneTargets.forEach((d,i)=>{
                const side=(i%3===0?0:(i%2?120:-120));
                map2CloneExactMap4Station(i%6,d,side,-15);
            });
"""
repl(old2,new2,"replace FAST LINK placeholders and place exact clones")

old3="""        function applyPlanetaryEnvironment() {
            const active=state.activeMap===MAP_MODES.MAP4;
            if(map2Active())map2BuildCourse();
            if(active)buildPlanetaryWorld();
"""
new3="""        function applyPlanetaryEnvironment() {
            const active=state.activeMap===MAP_MODES.MAP4;
            if(map2Active()){
                // Build Map4 once, hidden, only so Map2 can clone the authoritative
                // final W05 station Group trees. Restore Map2 state immediately.
                const previousMap=state.activeMap,previousPhase=state.map4Phase;
                state.activeMap=MAP_MODES.MAP4;state.map4Phase=3;
                buildPlanetaryWorld();
                state.activeMap=previousMap;state.map4Phase=previousPhase;
                planetaryWorldGroup.visible=false;
                map2BuildCourse();
            }
            if(active)buildPlanetaryWorld();
"""
repl(old3,new3,"stage hidden final Map4 sources before Map2 build")

# Remove visible black backing core behind reused gate kits while retaining physical gate mesh/collider.
old4="""                const core=new THREE.Mesh(H4_MESHES.structure,mesh.material);
                core.scale.set(1,1,.80);core.position.z=-.10;
                mesh.material=mesh.material.clone();mesh.material.visible=false;
                mesh.add(core,detail);kitCounts[style]++;
"""
new4="""                mesh.material=mesh.material.clone();mesh.material.visible=false;
                mesh.add(detail);kitCounts[style]++;
"""
repl(old4,new4,"remove black gate backing core")

p.write_text(s,encoding="utf-8")
print("WROTE",len(s))
