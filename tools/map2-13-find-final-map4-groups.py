from pathlib import Path
L=Path("index.html").read_text(encoding="utf-8").splitlines()
terms=[
"h4IndustrialGroups.push","MAP4_GFX11C_SIX_FACTORY_IDENTITIES","h4IndustrialGroups",
"h4BuildGfx06aStation","h4BuildGfx06bStation","h4BuildGfx06cStation",
"zone.add(group)","MAP4_W02_WIDE_SCENERY_2","clone(true)","function buildMap4"
]
for term in terms:
    hits=[i for i,l in enumerate(L,1) if term.lower() in l.lower()]
    print("\nTERM",term,"HITS",hits[:40])
    for h in hits[:8]:
        a=max(1,h-18);b=min(len(L),h+70)
        print(f"--- {a}-{b} ---")
        for n in range(a,b+1):print(f"{n}: {L[n-1]}")
