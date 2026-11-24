from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["ALÇAK UÇ","alçak uç","KEEP IT LOW","map2Objective","map2Help","mission","instruction"]
for term in terms:
    hits=[i for i,l in enumerate(L,1) if term.lower() in l.lower()]
    print("\nTERM",term,"HITS",hits[:30])
    for h in hits[:6]:
        a=max(1,h-16);b=min(len(L),h+28)
        print(f"--- {a}-{b} ---")
        for n in range(a,b+1):print(f"{n}: {L[n-1]}")
