from pathlib import Path
lines=Path("index.html").read_text(encoding="utf-8").splitlines()
for a,b,label in [
    (19840,20040,"MAP2 AI GATE PLANNER"),
    (21970,22190,"RIVAL STEERING"),
    (15040,15195,"BUILDING ROAD ORGANIZER"),
    (14380,14570,"BUILDING HELPERS")
]:
    print(f"\n===== {label} {a}-{b} =====")
    for i in range(a-1,min(b,len(lines))):
        print(f"{i+1}: {lines[i]}")
