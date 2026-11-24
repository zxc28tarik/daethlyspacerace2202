from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["function getRaceFrameAtDistance","map2RouteCurve","map2Frame","getMap2","activeRaceFrame","map2RouteFrame","getActiveRaceFrame","makeCourseLocalGroup","routeFrame"]
for term in terms:
    hits=[i for i,l in enumerate(L,1) if term.lower() in l.lower()]
    print("\nTERM",term,"HITS",hits[:50])
    for h in hits[:8]:
        for n in range(max(1,h-8),min(len(L),h+18)+1):
            print(f"{n}: {L[n-1]}")
        print("---")
