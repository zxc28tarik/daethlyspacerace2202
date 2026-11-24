from pathlib import Path
lines=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["curvature","sharp","map2Curve","curveBrake","makeCourseLocalGroup","MAP2_HANGAR_RIB_","visualTunnelDepth","map2Gates.push"]
for term in terms:
    hits=[i for i,l in enumerate(lines,1) if term.lower() in l.lower()]
    print("\nTERM",term,"HITS",hits[:30])
    for h in hits[:5]:
        a=max(1,h-12);b=min(len(lines),h+28)
        print(f"--- {a}-{b} ---")
        for n in range(a,b+1):
            print(f"{n}: {lines[n-1]}")
