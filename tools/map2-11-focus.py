from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b in [(14382,14430),(21620,21685)]:
    print(f"\n--- {a}-{b} ---")
    for n in range(a,b+1):
        if 1<=n<=len(L): print(f"{n}: {L[n-1]}")
