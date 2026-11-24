from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old="v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(2.8);scene.add(v.ship);"
new="""v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(2.8);
                const patrolBeaconMat=new THREE.MeshBasicMaterial({color:0xff9b63});
                for(const bx of [-2.7,2.7]){
                    const beacon=new THREE.Mesh(new THREE.SphereGeometry(.55,8,6),patrolBeaconMat);
                    beacon.position.set(bx,.25,-.45);beacon.name='MAP2_PATROL_BEACON';v.ship.add(beacon);
                }
                const patrolGlow=new THREE.PointLight(0xff8c58,.85,42);
                patrolGlow.position.set(0,1.2,.4);patrolGlow.name='MAP2_PATROL_GLOW';v.ship.add(patrolGlow);
                scene.add(v.ship);"""
if old not in s: raise SystemExit("patrol creation target missing")
s=s.replace(old,new,1)
old2="const altitude=300-v.approach*20+strike*55;"
new2="const altitude=285-v.approach*20+strike*55;"
if old2 not in s: raise SystemExit("altitude target missing")
s=s.replace(old2,new2,1)
p.write_text(s,encoding="utf-8")
print("MAP2-11 patrol visibility accents applied")
