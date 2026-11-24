from pathlib import Path
lines=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["const H4_MATERIALS","H4_MATERIALS =","wall:","steel:","const H4_MESHES","H4_MESHES =","structure:"]
for term in terms:
    hits=[i for i,l in enumerate(lines,1) if term in l]
    print("\nTERM",term,"HITS",hits[:20])
    for h in hits[:4]:
        a=max(1,h-12);b=min(len(lines),h+28)
        print(f"--- AROUND {h} ---")
        for n in range(a,b+1):
            print(f"{n}: {lines[n-1]}")
