from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
pairs=[
("const ahead=285-v.approach*120+strike*80;",
 "const ahead=105-v.approach*35+strike*55;"),
("const altitude=345-v.approach*75+strike*70;",
 "const altitude=340-v.approach*35+strike*55;"),
("""                    const pf=getRaceFrameAtDistance(state.routeProgress);
                    const target=pf.center.clone().addScaledVector(pf.right,state.laneX).addScaledVector(pf.up,state.laneY);
                    const aim=target.clone().addScaledVector(pf.up,active?0:55);
""",
 """                    const pf=getRaceFrameAtDistance(state.routeProgress);
                    // MAP2-11: target the exact rendered player position instead of
                    // reconstructing it separately from route coordinates.
                    const target=state.pos.clone();
                    const aim=target.clone().addScaledVector(pf.up,active?0:55);
""")
]
for old,new in pairs:
    if old not in s: raise SystemExit("missing target: "+old[:80])
    if s.count(old)!=1: raise SystemExit("non-unique target")
    s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-11 patrol now targets rendered player position")
