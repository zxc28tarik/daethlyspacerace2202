from pathlib import Path
s=Path("index.html").read_text(encoding="utf-8")
terms=[
    "map2LogicalBuildingGroups",
    "map2GateSelections",
    "map2GateExits",
    "map2BuildingPassageAt(",
    "function updateRival",
    "function updateRacers",
    "map2SelectGateOpening",
    "gateTarget",
    "targetLane"
]
lines=s.splitlines()
for term in terms:
    print("\n===== TERM",term,"=====")
    hits=0
    for i,line in enumerate(lines):
        if term in line:
            hits+=1
            a=max(0,i-18);b=min(len(lines),i+30)
            print(f"--- HIT {hits} lines {a+1}-{b} ---")
            for j in range(a,b):
                print(f"{j+1}: {lines[j]}")
            if hits>=8: break
