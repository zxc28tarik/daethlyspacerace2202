from pathlib import Path
lines=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b in [(4180,4265),(13145,13245),(13940,14205),(22320,22395)]:
    print(f"\n===== LINES {a}-{b} =====")
    for n in range(a,b+1):
        if 1<=n<=len(lines):
            print(f"{n}: {lines[n-1]}")
