from pathlib import Path
lines=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=["const map2Pilot","map2PilotPlan(r","gateAhead","gatePlan =","const gatePlan","maxLateralSpeed"]
for term in terms:
    print("\n====",term,"====")
    for i,line in enumerate(lines):
        if term in line and 21500<i<22250:
            for j in range(max(0,i-12),min(len(lines),i+24)):
                print(f"{j+1}: {lines[j]}")
            print()
