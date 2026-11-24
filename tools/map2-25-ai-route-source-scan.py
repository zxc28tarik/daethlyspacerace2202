from pathlib import Path
s=Path("index.html").read_text(encoding="utf-8")
terms=["map2GateSelections","map2GateExits","map2BuildingPassageAt(","laneX","targetLaneX","map2Select","map2Gate","routeProgress"]
lines=s.splitlines()
seen=set()
for term in terms:
    print("\n===== TERM",term,"=====")
    hits=0
    for i,line in enumerate(lines):
        if term in line:
            key=(i,term)
            if key in seen: continue
            seen.add(key);hits+=1
            a=max(0,i-8);b=min(len(lines),i+13)
            print(f"--- lines {a+1}-{b} ---")
            for j in range(a,b):
                print(f"{j+1}: {lines[j]}")
            if hits>=12: break
