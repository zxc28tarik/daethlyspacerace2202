from pathlib import Path
import re
s=Path("index.html").read_text(encoding="utf-8")
lines=s.splitlines()
hits=[]
for i,line in enumerate(lines,1):
    low=line.lower()
    if "map2" in low or "keep it low" in low or "industrial passage" in low:
        hits.append((i,line))
print("TOTAL_LINES",len(lines),"MAP2_RELATED_LINES",len(hits))
for i,line in hits:
    print(f"{i}: {line[:500]}")
