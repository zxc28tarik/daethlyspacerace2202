from pathlib import Path
lines=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["MAP2_PATROL","ceiling:220","approachSeconds","map2Patrol","DEVRİYE","map2VisualMats","MAP2_SERVICE_LIGHT_","MAP2_GATE_SHELL_TOP_","addApertureCue","map2UpdateVisibility"]
for term in terms:
    hits=[i for i,l in enumerate(lines,1) if term.lower() in l.lower()]
    print("\nTERM",term,"HITS",hits[:40])
    for h in hits[:6]:
        a=max(1,h-14);b=min(len(lines),h+36)
        print(f"--- {a}-{b} ---")
        for n in range(a,b+1):
            print(f"{n}: {lines[n-1]}")
