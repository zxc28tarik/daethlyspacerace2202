from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old="v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(3.0);"
new="v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(1.2);"
if old not in s: raise SystemExit("patrol scale target missing")
if s.count(old)!=1: raise SystemExit("patrol scale target non-unique")
s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-11 patrol render scale normalized to 1.2 for close approach")
