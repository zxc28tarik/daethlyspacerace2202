from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b in [(8080,8170),(8270,8335),(7190,7295),(14100,14380)]:
    print(f"\n--- {a}-{b} ---")
    for n in range(a,b+1):
        if 1<=n<=len(L): print(f"{n}: {L[n-1]}")
