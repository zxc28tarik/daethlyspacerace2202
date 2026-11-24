from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["h4ArchitecturalDetail","H4_MESHES","H4_MATERIALS","planetaryWorldRegions","industrial","building","hangar","factory","tower","city","map4"]
for term in terms:
    hits=[i for i,l in enumerate(L,1) if term.lower() in l.lower()]
    print("\nTERM",term,"HITS",hits[:80])
    for h in hits[:10]:
        a=max(1,h-10);b=min(len(L),h+34)
        print(f"--- {a}-{b} ---")
        for n in range(a,b+1): print(f"{n}: {L[n-1]}")
