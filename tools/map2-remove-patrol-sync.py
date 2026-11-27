#!/usr/bin/env python3
"""Retire Map2 overhead patrol from the downloadable standalone HTML (idempotent)."""
from pathlib import Path

path = Path("dist/Uzay_Yarisi_Guncel_Oynanabilir.html")
s = path.read_text(encoding="utf-8")
if "MAP2_OVERHEAD_PATROL" not in s:
    assert "function map2PatrolReset()" in s
    print("Standalone HTML already synchronized.")
    raise SystemExit(0)

def replace_once(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        raise RuntimeError(f"{label}: expected exactly one occurrence, got {n}")
    s = s.replace(old, new, 1)

start = s.index("        // MAP2-04/07: altitude patrol. Gameplay damage stays fixed; MAP2-07 adds readable approach/lock/breakaway motion.")
end = s.index("        // MAP2-45: progress-indexed static collision broadphase.", start)
assert 0 < end - start < 12000
s = (s[:start] +
    "        // MAP2: overhead patrol and altitude-fire rule retired for the current race design.\n"
    "        // A lightweight reset retains compatibility with map transitions and restarts.\n"
    "        function map2PatrolReset(){\n"
    "            state.map2Patrol=null;\n"
    "            window.starbladeMap2Patrol=null;\n"
    "        }\n\n" + s[end:])
replace_once("            map2PreparePatrolVisual();\n            const {ship,beam,search}=map2PatrolVisual;\n            const show=[...map2Sections,map2FinishPortal,ship,beam,search].filter(object=>!object.visible);", "            const show=[...map2Sections,map2FinishPortal].filter(object=>!object.visible);", "GPU objects")
replace_once("                // Technical sections include the patrol's point light. Open\n                // sections use the same course materials without that light.\n                renderRaceFrame();\n                ship.visible=beam.visible=search.visible=false;\n                renderRaceFrame();", "                // Warm the course geometry and materials only; no patrol shader or light.\n                renderRaceFrame();", "GPU render")
replace_once("            if(map2Active())map2PatrolTick(dt);\n", "", "patrol update")
replace_once("            const patrolWarning=map2PatrolWarning();\n            if(patrolWarning)return patrolWarning;\n", "", "air warning")
replace_once("            if(map2Active()){\n                if(map2PatrolVisual.ship)map2PatrolVisual.ship.visible=false;\n                if(map2PatrolVisual.beam)map2PatrolVisual.beam.visible=false;\n            }\n", "", "end screen")
replace_once("objective:'Dar açıklıklardan alçak geç; üstte devriye ateşi var. İki açık hız bölgesinde tam gaz.'", "objective:'Fabrikaların içinden ve alternatif açıklıklardan geç. Dar geçişlerde frenle; iki açık hız bölgesinde tam gaz.'", "briefing")
replace_once("map2:[['ALÇAK UÇ','Yapıların üstünde devriye ateşi var; boşluklardan geç.'],['FREN VE BOOST'", "map2:[['GEÇİT SEÇ','Yapıların gerçek açıklıklarını takip et; sağ veya sol alternatifleri değerlendir.'],['FREN VE BOOST'", "tutorial")
replace_once("'Harita 2: 175 km, tek tur, sanayi geçişleri ve hava devriyesi.'", "'Harita 2: 175 km, tek tur, sanayi geçişleri ve alternatif açıklıklar.'", "menu")
replace_once("                    // MAP2-11: the KEEP IT LOW ceiling is communicated by the world,\n                    // not another HUD panel. Sparse amber service rails sit exactly\n                    // around the 220 flight ceiling while the safe openings stay cyan.", "                    // MAP2: amber industrial service rails mark the roofline as scenery;\n                    // cyan opening lights show the traversable architecture. No altitude punishment.", "decor note")
for banned in ("map2PatrolStep", "map2PatrolTick", "map2PatrolWarning", "map2PatrolVisual", "MAP2_PATROL", "MAP2_OVERHEAD_PATROL", "hava devriyesi", "DEVRİYE ATEŞİ"):
    assert banned not in s, f"Leftover {banned}"
assert "MAP2_TEST_SHIELD_MULTIPLIER" in s
path.write_text(s, encoding="utf-8")
print("Synchronized playable standalone HTML; overhead patrol and air warning retired.")
