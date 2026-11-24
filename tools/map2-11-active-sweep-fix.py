from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
pairs=[
("v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(3.7);",
 "v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(3.0);"),
("const ahead=62-v.approach*18+strike*42;",
 "const ahead=105-v.approach*28+strike*50;"),
("const sweep=Math.sin(state.raceTime*.85)*82;",
 "const sweep=Math.sin(state.raceTime*.85)*(active?28:82);")
]
for old,new in pairs:
    if old not in s: raise SystemExit("missing target: "+old)
    if s.count(old)!=1: raise SystemExit("non-unique target: "+old)
    s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-11 patrol active sweep/framing normalized")
