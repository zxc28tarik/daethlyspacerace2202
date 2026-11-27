from pathlib import Path

PATHS = [Path("index.html"), Path("dist/Uzay_Yarisi_Guncel_Oynanabilir.html")]
MARKER = "const map2City02IndependentBlueprint=(()=>{"
BLUEPRINT = """            // MAP2-47: Map2-owned replica blueprints for City02 tower bodies and crowns.
            // Same geometry, palette, roof material, 48-building order and original footprints.
            // These two long frontage systems no longer read Map4's live city scene.
            const map2City02IndependentBlueprint=(()=>{
                const geometry=new THREE.BoxGeometry(1,1,1);
                const materials=[0x283e53,0x3c5261,0x223c4f,0x424c5a,0x26384c,0x3b4855]
                    .map(color=>new THREE.MeshStandardMaterial({
                        color,metalness:.24,roughness:.82,flatShading:true
                    }));
                const roofMaterial=new THREE.MeshStandardMaterial({
                    color:0x263b4e,metalness:.53,roughness:.57
                });
                const prototypes=[];
                for(let row=0;row<9;row++)for(let col=0;col<6;col++){
                    if((row===2||row===5||row===8)&&(col===2||col===3))continue;
                    const index=row*6+col;
                    const width=120+(index*17)%64;
                    const depth=108+(index*21)%53;
                    const height=280+(row*59+col*69)%480;
                    prototypes.push({
                        footprint:new THREE.Vector3(width,height,depth),
                        body:{
                            name:'H4_CITY02_PHYSICAL_BUILDING_'+index,
                            geometry,material:materials[index%materials.length],
                            userData:{h4CityPhysical:true}
                        },
                        crown:{
                            name:'H4_CITY02_TOWER_CROWN_'+index,
                            geometry,material:roofMaterial,
                            userData:{visualOnly:true}
                        }
                    });
                }
                if(prototypes.length!==48)
                    throw new Error('MAP2-47 city prefab count mismatch');
                return Object.freeze({
                    prototypes,
                    footprints:prototypes.map(p=>p.footprint)
                });
            })();
"""
OLD_FOOTPRINT = """const footprints=h4City02DistrictGroup.children
                    .filter(m=>m.isMesh&&/^H4_CITY02_PHYSICAL_BUILDING_/.test(m.name))
                    .map(m=>m.scale);"""
NEW_FOOTPRINT = "const footprints=map2City02IndependentBlueprint.footprints;"
OLD_WIDE = """const source=h4City02DistrictGroup;
                const prototypes=source.children
                    .filter(m=>m.isMesh&&/^H4_CITY02_PHYSICAL_BUILDING_/.test(m.name))
                    .map(m=>({body:m,crown:source.getObjectByName(
                        m.name.replace('PHYSICAL_BUILDING','TOWER_CROWN'))}));
                if(!prototypes.length)throw new Error('MAP2-42 requires original Map4 building meshes');"""
NEW_WIDE = """const prototypes=map2City02IndependentBlueprint.prototypes;
                if(!prototypes.length)throw new Error('MAP2-47 missing Map2-owned city prefabs');"""

def replace_one(text, before, after, path):
    count = text.count(before)
    if count != 1:
        raise RuntimeError(f"{path}: expected one occurrence; found {count}")
    return text.replace(before, after, 1)

for path in PATHS:
    src = path.read_text(encoding="utf-8")
    if MARKER in src:
        assert NEW_FOOTPRINT in src and NEW_WIDE in src, f"{path}: partial patch"
        print(f"{path}: already patched")
        continue
    src = replace_one(src, "const map2BuildWorldCity=()=>{",
                      BLUEPRINT + "            const map2BuildWorldCity=()=>{", path)
    src = replace_one(src, OLD_FOOTPRINT, NEW_FOOTPRINT, path)
    src = replace_one(src, OLD_WIDE, NEW_WIDE, path)
    world = src.split("const map2BuildWorldCity=()=>{", 1)[1].split("map2BuildWorldCity();", 1)[0]
    wide = src.split("const map2BuildWideUrbanCourse=()=>{", 1)[1].split("map2BuildWideUrbanCourse();", 1)[0]
    if "h4City02DistrictGroup" in world or "h4City02DistrictGroup" in wide:
        raise RuntimeError(f"{path}: city frontage still reads Map4 scene")
    path.write_text(src, encoding="utf-8")
    print(f"{path}: MAP2-47 city frontage source isolated")
