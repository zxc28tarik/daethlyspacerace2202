from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")

def repl(old,new,label):
    global s
    if old not in s: raise SystemExit("missing "+label)
    if s.count(old)!=1: raise SystemExit(f"non-unique {label}: {s.count(old)}")
    s=s.replace(old,new,1); print("PATCH",label)

repl(
"        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0,chokeWalls:0,turnFrames:0,silhouetteTowers:0};\n",
"        const map2VisualStageStats={deckSlabs:0,sideBlocks:0,stacks:0,trusses:0,fastMarkers:0,pipeRuns:0,tanks:0,roofUnits:0,catwalks:0,signals:0,gateDetails:0,chokeWalls:0,turnFrames:0,silhouetteTowers:0,rooflineRails:0,safeApertureLights:0};\n",
"visual stats")

repl(
"""                    if(cell%6===3){
                        for(const side of [-1,1]){
                            addVisualLamp(d-210,side*398,205,9,
                                side<0?map2VisualMats.signal:map2VisualMats.signalWarm,
                                'MAP2_SERVICE_LIGHT_'+cell+'_'+side);
                            map2VisualStageStats.signals++;
                        }
                    }
                }else if(fast && cell%2===0){
""",
"""                    if(cell%6===3){
                        for(const side of [-1,1]){
                            addVisualLamp(d-210,side*398,205,9,
                                side<0?map2VisualMats.signal:map2VisualMats.signalWarm,
                                'MAP2_SERVICE_LIGHT_'+cell+'_'+side);
                            map2VisualStageStats.signals++;
                        }
                    }
                    // MAP2-11: the KEEP IT LOW ceiling is communicated by the world,
                    // not another HUD panel. Sparse amber service rails sit exactly
                    // around the 220 flight ceiling while the safe openings stay cyan.
                    if(cell%2===0){
                        for(const side of [-1,1]){
                            addVisualBlock(d+145,side*418,220,76,8,250,map2VisualMats.signalWarm,
                                'MAP2_ROOFLINE_RAIL_'+cell+'_'+side);
                            map2VisualStageStats.rooflineRails++;
                        }
                    }
                }else if(fast && cell%2===0){
""",
"roofline rails")

repl(
"""                guide.add(lines);sectionAt(d).add(guide);
                apertureGuideCount++;
            }
""",
"""                guide.add(lines);sectionAt(d).add(guide);
                // Two low cyan lamps make the safe underside legible without drawing
                // a giant ring or rectangle around the opening.
                const safeD=d-depth/2-12;
                for(const sx of [-1,1]){
                    addVisualLamp(safeD,opening.x+sx*Math.max(12,halfX-10),
                        opening.y-Math.max(12,halfY-10),7,map2VisualMats.signal,
                        'MAP2_SAFE_APERTURE_'+index+'_'+apertureGuideCount+'_'+sx);
                    map2VisualStageStats.safeApertureLights++;
                }
                apertureGuideCount++;
            }
""",
"safe aperture lights")

repl(
"        const map2PatrolVisual={ship:null,beam:null,flash:0,breakaway:0,side:1,approach:0};\n",
"        const map2PatrolVisual={ship:null,beam:null,search:null,flash:0,breakaway:0,side:1,approach:0};\n",
"patrol visual state")

repl(
"""            if(map2PatrolVisual.ship)map2PatrolVisual.ship.visible=false;
            if(map2PatrolVisual.beam)map2PatrolVisual.beam.visible=false;
            window.starbladeMap2Patrol=null;
""",
"""            if(map2PatrolVisual.ship)map2PatrolVisual.ship.visible=false;
            if(map2PatrolVisual.beam)map2PatrolVisual.beam.visible=false;
            if(map2PatrolVisual.search)map2PatrolVisual.search.visible=false;
            window.starbladeMap2Patrol=null;
""",
"patrol reset")

repl(
"""                v.beam=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xff593c,transparent:true,opacity:.95,depthWrite:false}));
                v.beam.name='MAP2_PATROL_LASER';v.beam.frustumCulled=false;scene.add(v.beam);
            }
""",
"""                v.beam=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xff593c,transparent:true,opacity:.95,depthWrite:false}));
                v.beam.name='MAP2_PATROL_LASER';v.beam.frustumCulled=false;scene.add(v.beam);
                const searchGeo=new THREE.BufferGeometry();
                searchGeo.setAttribute('position',new THREE.BufferAttribute(new Float32Array(6),3));
                v.search=new THREE.Line(searchGeo,new THREE.LineBasicMaterial({
                    color:0xffb06a,transparent:true,opacity:.24,depthWrite:false
                }));
                v.search.name='MAP2_PATROL_SEARCHLIGHT';v.search.frustumCulled=false;scene.add(v.search);
            }
""",
"patrol searchlight creation")

repl(
"""                v.beam.visible=visible&&v.flash>0;
                if(visible){
""",
"""                v.beam.visible=visible&&v.flash>0;
                if(v.search)v.search.visible=false;
                if(visible){
""",
"searchlight default hidden")

repl(
"""                    const aim=target.clone().addScaledVector(pf.up,active?0:55);
                    v.ship.lookAt(aim);
                    if(v.beam.visible){
""",
"""                    const aim=target.clone().addScaledVector(pf.up,active?0:55);
                    v.ship.lookAt(aim);
                    if(v.search&&active&&!v.beam.visible){
                        v.search.visible=true;
                        v.search.material.opacity=.16+.30*lockRatio;
                        const s=v.search.geometry.attributes.position;
                        s.setXYZ(0,v.ship.position.x,v.ship.position.y,v.ship.position.z);
                        s.setXYZ(1,target.x,target.y,target.z);s.needsUpdate=true;
                    }
                    if(v.beam.visible){
""",
"searchlight targeting")

repl(
"""            window.starbladeMap2Patrol={active:p.active,lock:p.lock,shots:p.shots,hits:p.hits,visible,
                ceiling:MAP2_PATROL.ceiling,approach:v.approach,breakaway:v.breakaway,phase};
""",
"""            window.starbladeMap2Patrol={active:p.active,lock:p.lock,shots:p.shots,hits:p.hits,visible,
                ceiling:MAP2_PATROL.ceiling,approach:v.approach,breakaway:v.breakaway,
                searching:!!(v.search&&v.search.visible),phase};
""",
"patrol export")

p.write_text(s,encoding="utf-8")
print("WROTE",len(s))
