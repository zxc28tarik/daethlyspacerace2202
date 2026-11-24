from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old="const ahead=105-v.approach*35+strike*55;"
new="const ahead=62-v.approach*18+strike*42;"
if old not in s: raise SystemExit("ahead target missing")
if s.count(old)!=1: raise SystemExit("ahead target non-unique")
s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-11 patrol visual approach distance tightened")
