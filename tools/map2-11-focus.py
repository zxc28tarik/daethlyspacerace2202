from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b in [(14128,14178),(14312,14414)]:
    print(f"--- {a}-{b} ---")
    for n in range(a,b+1): print(f"{n}: {L[n-1]}")
