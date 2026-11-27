#!/usr/bin/env python3
"""Remove the emergency hidden Map4 fallback from the already-detached game.
Fail closed on invalid archives / unsupported browsers. Do not edit Map4 logic.
"""
from pathlib import Path
def one(s,a,b,n=1):
    count=s.count(a)
    if count!=n:
        raise RuntimeError(f'Expected {n}, got {count}: {a[:110]}')
    return s.replace(a,b)
paths=[Path("index.html"),Path("dist/Uzay_Yarisi_Guncel_Oynanabilir.html")]
out=[]
for p in paths:
    s=p.read_text()
    if "MAP2-50: reject missing independent sources" in s:
        assert "FALLBACK_TO_MAP4" not in s
        out.append((p,s))
        continue
    s=one(s,"""                // Preserve emergency playability on unsupported browsers.
                // The MAP2-48 regression test REJECTS this fallback.
                console.error('MAP2-48 independent asset load failed:',error);
                window.starbladeMap2IndependentAssets={mode:'FALLBACK_TO_MAP4',error:String(error)};
                return null;""","""                // MAP2-50: reject missing independent sources; never construct Map4.
                console.error('MAP2 independent asset load failed:',error);
                window.starbladeMap2IndependentAssets={mode:'MAP2_ASSET_LOAD_FAILED',error:String(error)};
                map2IndependentLoadPromise=null;
                return null;""")
    s=one(s,"""            if(map2Active()){
                if(map2IndependentLibrary){
                    // No Map4 world, arena, atmosphere, effect or collision build.
                    map2BuildCourse();
                }else{
                    // Emergency fallback for unsupported browsers.
                    const previousMap=state.activeMap,previousPhase=state.map4Phase;
                    state.activeMap=MAP_MODES.MAP4;state.map4Phase=3;
                    buildPlanetaryWorld();
                    state.activeMap=previousMap;state.map4Phase=previousPhase;
                    planetaryWorldGroup.visible=false;
                    map2BuildCourse();
                }
            }""","""            if(map2Active()){
                if(!map2IndependentLibrary)throw new Error('Map2 independent assets not loaded');
                map2BuildCourse();
            }""")
    for a,b,n in [
        ("(map2IndependentLibrary?.stations||h4IndustrialGroups).slice(0,6)","map2IndependentLibrary.stations.slice(0,6)",1),
        ("map2IndependentLibrary?.city||h4City02DistrictGroup","map2IndependentLibrary.city",3),
        ("(map2IndependentLibrary?.landmarks||h4WorldLandmarks).find","map2IndependentLibrary.landmarks.find",1),
        ("(map2IndependentLibrary?.finalCorridors||planetaryWorldRegions[3].children).filter","map2IndependentLibrary.finalCorridors.filter",1),
        ("(map2IndependentLibrary?.industrialVisuals?[map2IndependentLibrary.industrialVisuals]:planetaryWorldRegions[2].children).find","[map2IndependentLibrary.industrialVisuals].find",1),
    ]:
        s=one(s,a,b,n)
    s=one(s,"""                await map2LoadIndependentLibrary();
                if(state.activeMap!==mapId||state.running)return;""","""                const library=await map2LoadIndependentLibrary();
                if(state.activeMap!==mapId||state.running)return;
                if(!library){
                    launch.disabled=true;
                    launch.textContent='HARİTA 2 AÇILAMADI — TARAYICIYI GÜNCELLE';
                    return;
                }""")
    assert "FALLBACK_TO_MAP4" not in s
    out.append((p,s))
for p,s in out:
    if p.read_text()!=s:p.write_text(s)
    print("MAP2-50 independent-only source selection",p)
