from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old="            const exactCloneTargets=[7200];"
new="            const exactCloneTargets=[8500];"
if old not in s: raise SystemExit("opening exact clone target not found")
s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-13 opening exact Map4 station moved forward to 8500")
