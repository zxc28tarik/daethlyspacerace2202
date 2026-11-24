from pathlib import Path
lines=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b in [(13168,13242),(13948,14096)]:
    print(f"\n===== LINES {a}-{b} =====")
    for n in range(a,b+1):
        print(f"{n}: {lines[n-1]}")
