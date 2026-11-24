from pathlib import Path
lines=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["function makeCourseLocalGroup","makeCourseLocalGroup(","function updateCamera","camera.position","mesh.position.copy(getRace","getRaceFrameAtDistance(state.routeProgress","getRaceFrameAtDistance(playerProgress"]
for term in terms:
    hits=[i for i,l in enumerate(lines,1) if term in l]
    print("\nTERM",term,"HITS",hits[:20])
    for h in hits[:6]:
        a=max(1,h-20);b=min(len(lines),h+35)
        print(f"--- AROUND {h} ---")
        for n in range(a,b+1):
            print(f"{n}: {lines[n-1]}")
