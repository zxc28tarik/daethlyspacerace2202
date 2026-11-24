from pathlib import Path
import re
p=Path("index.html")
s=p.read_text(encoding="utf-8")
terms=["KEEP IT LOW","starbladeMap2Layout","map2Models","map2PatrolVisual","MAP2_PATROL","map2Aperture","map2Gate","industrial"]
print("INDEX_BYTES", len(s.encode("utf-8")))
for term in terms:
    hits=[m.start() for m in re.finditer(re.escape(term),s,re.I)]
    print("\nTERM",term,"HITS",len(hits))
    for i,pos in enumerate(hits[:8]):
        a=max(0,pos-2200); b=min(len(s),pos+4200)
        print(f"\n--- {term} HIT {i+1} @ {pos} ---")
        print(s[a:b])
