from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
pairs=[
("v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(3.4);scene.add(v.ship);",
 "v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(4.1);scene.add(v.ship);"),
("""                v.search=new THREE.Line(searchGeo,new THREE.LineBasicMaterial({
                    color:0xffb06a,transparent:true,opacity:.24,depthWrite:false
                }));""",
 """                v.search=new THREE.Line(searchGeo,new THREE.LineBasicMaterial({
                    color:0xffb06a,transparent:true,opacity:.30,depthWrite:false,depthTest:false
                }));"""),
("const ahead=370-v.approach*190+strike*95;",
 "const ahead=285-v.approach*120+strike*80;"),
("const altitude=430-v.approach*145+strike*90;",
 "const altitude=345-v.approach*75+strike*70;")
]
for old,new in pairs:
    if old not in s: raise SystemExit("missing target: "+old[:70])
    if s.count(old)!=1: raise SystemExit("non-unique target")
    s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-11 patrol framing corrected")
