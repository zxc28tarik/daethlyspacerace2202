from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["h4BuildIndustrialGauntlet(","h4Gfx06dcAddStationDecals(","h4Gfx06dInitializeLod(","h4Gfx11cBuildIndustryIdentities(","h4Vis02DressIndustry(","planetaryWorldRegions.push","h4BuildPlanetary","buildPlanetary"]
for term in terms:
    hits=[i for i,l in enumerate(L,1) if term.lower() in l.lower()]
    print("\nTERM",term,"HITS",hits)
    for h in hits:
        a=max(1,h-30);b=min(len(L),h+60)
        print(f"--- {a}-{b} ---")
        for n in range(a,b+1): print(f"{n}: {L[n-1]}")
