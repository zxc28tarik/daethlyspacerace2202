from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
pairs=[
("v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(4.1);scene.add(v.ship);",
 "v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(2.8);scene.add(v.ship);"),
("const altitude=340-v.approach*35+strike*55;",
 "const altitude=300-v.approach*20+strike*55;")
]
for old,new in pairs:
    if old not in s: raise SystemExit("missing "+old)
    if s.count(old)!=1: raise SystemExit("non-unique")
    s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-11 final patrol framing applied")
