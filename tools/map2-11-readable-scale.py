from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old="v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(2.8);"
new="v.ship.name='MAP2_OVERHEAD_PATROL';v.ship.scale.setScalar(3.7);"
if old not in s: raise SystemExit("patrol scale target missing")
if s.count(old)!=1: raise SystemExit("patrol scale target non-unique")
s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-11 patrol render scale raised to 3.7")
