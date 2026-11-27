#!/usr/bin/env python3
"""MAP2-48: install the validated Map2-owned building source library.
Only use this tool on the dedicated feature branch. Never touch Map4's source.
"""
from pathlib import Path
import base64
import json

evidence = Path("tests/map2-48-evidence")
archive = (evidence / "source-library.json.gz").read_bytes()
manifest = json.loads((evidence / "manifest.json").read_text())
if not (manifest["libraryRootCount"] == 44 and
        manifest["originalMeshCount"] == manifest["restoredMeshCount"] and
        manifest["stationCount"] == 6 and
        manifest["finalCorridorCount"] >= 20 and
        manifest["map2GateCount"] == 59 and
        manifest["map2PhysicalCount"] >= 500):
    raise RuntimeError("Source library archive failed the baseline contract")

runtime = r"""
        // MAP2-48: the final Map2 model sources are now embedded in this
        // self-contained HTML. All placement/physics rules stay in Map2.
        let map2IndependentLibrary=null;
        let map2IndependentLoadPromise=null;
        async function map2LoadIndependentLibrary(){
            if(map2IndependentLibrary)return map2IndependentLibrary;
            if(map2IndependentLoadPromise)return map2IndependentLoadPromise;
            map2IndependentLoadPromise=(async()=>{
                const content=document.getElementById('map2-48-gzip-archive')?.content?.textContent?.trim();
                const manifestContent=document.getElementById('map2-48-source-manifest')?.content?.textContent;
                if(!content||!manifestContent)
                    throw new Error('MAP2-48 embedded asset snapshot missing');
                if(typeof DecompressionStream!=='function')
                    throw new Error('MAP2-48 gzip decoding unavailable in this browser');
                const bytes=Uint8Array.from(atob(content),c=>c.charCodeAt(0));
                const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
                const json=await new Response(stream).text();
                const model=new THREE.ObjectLoader().parse(JSON.parse(json));
                const manifest=JSON.parse(manifestContent);
                const sources=new Map(model.children.map(obj=>[obj.userData.map2LibraryId,obj]));
                const get=id=>{
                    const result=sources.get(id);
                    if(!result)throw new Error('MAP2-48 missing archived source: '+id);
                    return result;
                };
                const stations=Array.from({length:6},(_,i)=>get('station-'+i));
                const city=get('urban-district');
                const landmarks=manifest.sourceManifest
                    .filter(m=>m.id.startsWith('landmark-'))
                    .map(m=>({at:m.progress,group:get(m.id)}));
                const finalCorridors=manifest.sourceManifest
                    .filter(m=>m.id.startsWith('final-corridor-'))
                    .map(m=>get(m.id));
                const industrialVisuals=get('industrial-visuals');
                if(stations.length!==6||landmarks.length!==8||finalCorridors.length<20)
                    throw new Error('MAP2-48 source family incomplete');
                map2IndependentLibrary={stations,city,landmarks,finalCorridors,industrialVisuals,
                    manifest,model};
                window.starbladeMap2IndependentAssets={
                    mode:'ARCHIVED_MAP2_SOURCES',roots:manifest.libraryRootCount,
                    meshes:manifest.originalMeshCount,compressedBytes:bytes.byteLength,
                    map4WorldConstructed:false
                };
                return map2IndependentLibrary;
            })().catch(error=>{
                // Preserve emergency playability on unsupported browsers.
                // The MAP2-48 regression test REJECTS this fallback.
                console.error('MAP2-48 independent asset load failed:',error);
                window.starbladeMap2IndependentAssets={mode:'FALLBACK_TO_MAP4',error:String(error)};
                return null;
            });
            return map2IndependentLoadPromise;
        }
"""

def replace_one(text, old, new):
    count = text.count(old)
    if count != 1:
        raise RuntimeError("Expected exactly 1 occurrence, got %s of: %s" % (count, old[:100]))
    return text.replace(old, new)

for filename in ("index.html", "dist/Uzay_Yarisi_Guncel_Oynanabilir.html"):
    p=Path(filename)
    html=p.read_text()
    if "map2-48-gzip-archive" in html:
        raise RuntimeError("Already embedded in "+filename)
    html=replace_one(html, "        function applyPlanetaryEnvironment() {",
        runtime+"\n        function applyPlanetaryEnvironment() {")
    original = """            if(map2Active()){
                // Build Map4 once, hidden, only so Map2 can clone the authoritative
                // final W05 station Group trees. Restore Map2 state immediately.
                const previousMap=state.activeMap,previousPhase=state.map4Phase;
                state.activeMap=MAP_MODES.MAP4;state.map4Phase=3;
                buildPlanetaryWorld();
                state.activeMap=previousMap;state.map4Phase=previousPhase;
                planetaryWorldGroup.visible=false;
                map2BuildCourse();
            }"""
    changed = """            if(map2Active()){
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
            }"""
    html=replace_one(html,original,changed)
    html=replace_one(html,
       "const map2ExactMap4Sources=h4IndustrialGroups.slice(0,6);",
       "const map2ExactMap4Sources=(map2IndependentLibrary?.stations||h4IndustrialGroups).slice(0,6);")
    city_old="const source=h4City02DistrictGroup;"
    if html.count(city_old)!=2:
        raise RuntimeError("Expected 2 Map2 city source references")
    html=html.replace(city_old,
       "const source=map2IndependentLibrary?.city||h4City02DistrictGroup;")
    html=replace_one(html,
       "const entry=h4WorldLandmarks.find(x=>x.group&&x.group.name===sourceName);",
       "const entry=(map2IndependentLibrary?.landmarks||h4WorldLandmarks).find(x=>x.group&&x.group.name===sourceName);")
    html=replace_one(html,
       "const sources=planetaryWorldRegions[3].children.filter(o=>",
       "const sources=(map2IndependentLibrary?.finalCorridors||planetaryWorldRegions[3].children).filter(o=>")
    html=replace_one(html,
       "const source=planetaryWorldRegions[2].children.find(o=>",
       "const source=(map2IndependentLibrary?.industrialVisuals?[map2IndependentLibrary.industrialVisuals]:planetaryWorldRegions[2].children).find(o=>")
    html=replace_one(html,
       "const footprints=h4City02DistrictGroup.children",
       "const footprints=(map2IndependentLibrary?.city||h4City02DistrictGroup).children")
    html=replace_one(html,
       "        function selectMap(mapId) {",
       "        async function selectMap(mapId) {")
    html=replace_one(html,
       """            if(mapId!==MAP_MODES.MAP4)delete document.body.dataset.uiPhase;
            applyPlanetaryEnvironment();""",
       """            if(mapId!==MAP_MODES.MAP4)delete document.body.dataset.uiPhase;
            if(map2Active()){
                const launch=document.getElementById('start-btn');
                launch.disabled=true;
                launch.textContent='BİNALAR HAZIRLANIYOR…';
                await map2LoadIndependentLibrary();
                if(state.activeMap!==mapId||state.running)return;
            }
            applyPlanetaryEnvironment();""")
    html=replace_one(html,
       """            launch.disabled = !ready;
            const isMap4=mapId===MAP_MODES.MAP4;""",
       """            launch.disabled = !ready;
            launch.textContent='YARIŞI BAŞLAT';
            const isMap4=mapId===MAP_MODES.MAP4;""")
    # Templates are not inline script tags, so existing syntax regression
    # checks do not accidentally evaluate the embedded binary as JavaScript.
    resources = "\n<template id=\"map2-48-source-manifest\">" + json.dumps(manifest,ensure_ascii=False) + "</template>"
    resources += "\n<template id=\"map2-48-gzip-archive\">" + base64.b64encode(archive).decode("ascii") + "</template>\n"
    html=replace_one(html,"</body>",resources+"</body>")
    p.write_text(html)
    print("MAP2-48 embed",filename,"bytes:",p.stat().st_size)
print("MAP2-48 complete staged HTML source redirect. Map4 untouched.")
