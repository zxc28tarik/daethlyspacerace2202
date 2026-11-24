from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b in [(7920,8125),(6200,6460),(11300,11650)]:
    print(f"\n--- {a}-{b} ---")
    for n in range(a,b+1):
        if 1<=n<=len(L):print(f"{n}: {L[n-1]}")
