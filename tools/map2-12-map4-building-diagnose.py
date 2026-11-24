from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b in [(5280,5375),(6280,6425),(7060,7165),(8140,8295),(11340,11445),(13920,14335)]:
    print(f"\n--- {a}-{b} ---")
    for n in range(a,b+1):
        if 1<=n<=len(L): print(f"{n}: {L[n-1]}")
