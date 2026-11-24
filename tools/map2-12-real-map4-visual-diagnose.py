from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b in [(7090,7195),(8160,8298),(8330,8425),(9135,9225),(13970,14160)]:
    print(f"\n--- {a}-{b} ---")
    for n in range(a,b+1):
        if 1<=n<=len(L): print(f"{n}: {L[n-1]}")
