'use strict';
// MAP2-48 phase 1: capture a reproducible, independent copy of the
// exact Map4 visual SOURCE OBJECTS that Map2 currently consumes.
// This is intentionally an export/verification only: the live game remains untouched.
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const zlib=require('node:zlib');
const {pathToFileURL}=require('node:url');
const {chromium}=require('playwright');

(async()=>{
  const dir=path.join(__dirname,'map2-48-evidence');
  fs.mkdirSync(dir,{recursive:true});
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--use-gl=angle','--use-angle=swiftshader',
    '--enable-webgl-software-rendering','--disable-dev-shm-usage'
  ]});
  try{
    const page=await browser.newPage({viewport:{width:1440,height:810}});
    const errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const three=fs.readFileSync(require.resolve('three/build/three.min.js'),'utf8');
    await page.route('**/cdnjs.cloudflare.com/ajax/libs/three.js/**',r=>r.fulfill({
      status:200,contentType:'text/javascript',body:three
    }));
    await page.route('**/cdn.tailwindcss.com/**',r=>r.fulfill({
      status:200,contentType:'text/javascript',body:''
    }));
    await page.goto(pathToFileURL(path.resolve('index.html')).toString(),
      {waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForFunction(()=>typeof map2BuildCourse==='function');
    await page.locator('#map-choice-2').click();
    await page.locator('#start-btn').click();
    await page.waitForFunction(()=>state.running&&state.activeMap==='map2'&&
      window.starbladeMap2WideUrbanCourse,null,{timeout:90000});

    await page.addScriptTag({path:path.join(__dirname,'map2-48-visual-fingerprint.js')});
    const payload=await page.evaluate(()=>{
      state.paused=true;
      scene.updateMatrixWorld(true);
      const selections=[];
      const stationNames=h4IndustrialGroups.map(x=>x.name);
      h4IndustrialGroups.forEach((root,i)=>selections.push({
        id:'station-'+i,progress:root.userData.progress,root
      }));
      if(h4City02DistrictGroup)selections.push({
        id:'urban-district',progress:MAP4_CITY_ARENA.centerProgress,root:h4City02DistrictGroup
      });
      for(const name of [
        'MAP4_STONEGATE_1950','MAP4_OBSERVATION_10100','MAP4_REFINERY_17200',
        'MAP4_FACTORY_23800','MAP4_POWER_31600','MAP4_OUTPOST_36200',
        'MAP4_SPACEPORT_42600','MAP4_LAUNCH_48300'
      ]){
        const entry=h4WorldLandmarks.find(x=>x.group?.name===name);
        if(!entry)throw new Error('Missing source landmark '+name);
        selections.push({id:'landmark-'+name,progress:entry.at,root:entry.group});
      }
      const final=planetaryWorldRegions[3].children.filter(x=>
        x.name==='MAP4_GFX07_CORRIDOR_STRUCTURE');
      if(final.length<20)throw new Error('Final corridor source incomplete');
      final.forEach((root,i)=>selections.push({
        id:'final-corridor-'+i,progress:42000,root
      }));
      const industrial=planetaryWorldRegions[2].children.find(x=>
        x.name==='MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS');
      if(!industrial)throw new Error('Industrial visuals source missing');
      selections.push({id:'industrial-visuals',progress:null,root:industrial});

      const portableUserData=userData=>{
        const result={};
        for(const [key,value] of Object.entries(userData||{})){
          if(value===null||['string','number','boolean'].includes(typeof value))
            result[key]=value;
        }
        return result;
      };
      const portableNode=src=>{
        let out;
        if(src.isInstancedMesh){
          out=new THREE.InstancedMesh(src.geometry,src.material,src.count);
          out.instanceMatrix.copy(src.instanceMatrix);
          out.count=src.count;
          if(src.instanceColor)out.instanceColor=src.instanceColor.clone();
        }else if(src.isMesh)out=new THREE.Mesh(src.geometry,src.material);
        else if(src.isLineSegments)out=new THREE.LineSegments(src.geometry,src.material);
        else if(src.isLine)out=new THREE.Line(src.geometry,src.material);
        else if(src.isPoints)out=new THREE.Points(src.geometry,src.material);
        else if(src.isGroup)out=new THREE.Group();
        else out=new THREE.Object3D();
        out.name=src.name;
        out.position.copy(src.position);
        out.quaternion.copy(src.quaternion);
        out.scale.copy(src.scale);
        out.matrix.copy(src.matrix);
        out.matrixAutoUpdate=src.matrixAutoUpdate;
        out.visible=src.visible;
        out.frustumCulled=src.frustumCulled;
        out.renderOrder=src.renderOrder;
        out.castShadow=!!src.castShadow;
        out.receiveShadow=!!src.receiveShadow;
        out.userData=portableUserData(src.userData);
        for(const child of src.children)out.add(portableNode(child));
        return out;
      };
      // A scene-like graph with all original materials and mesh data.
      // Do not include Map4 physics, actor state, runtime effects or global scene.
      const packed=new THREE.Group();
      packed.name='MAP2_48_INDEPENDENT_VISUAL_SOURCE_LIBRARY';
      const manifest=[];
      for(const item of selections){
        const root=portableNode(item.root);
        root.userData.map2LibraryId=item.id;
        const sourceWorld=item.root.matrixWorld.toArray();
        packed.add(root);
        let meshCount=0,instanceCount=0;
        root.traverse(o=>{
          if(o.isMesh||o.isInstancedMesh)meshCount++;
          if(o.isInstancedMesh)instanceCount+=o.count;
        });
        manifest.push({id:item.id,name:item.root.name,
          progress:item.progress,sourceWorld,meshCount,instanceCount});
      }
      const exported=packed.toJSON();
      const json=JSON.stringify(exported);
      // Sanity check reconstruction BEFORE recommending any runtime switchover.
      const parsed=new THREE.ObjectLoader().parse(exported);
      const originalMeshes=[],loadedMeshes=[];
      packed.traverse(o=>{if(o.isMesh||o.isInstancedMesh)originalMeshes.push(o);});
      parsed.traverse(o=>{if(o.isMesh||o.isInstancedMesh)loadedMeshes.push(o);});
      if(originalMeshes.length!==loadedMeshes.length)
        throw new Error('Serialized source mesh mismatch: '+
          originalMeshes.length+' -> '+loadedMeshes.length);
      const meta={
        libraryVersion:1,map2Length:MAP2_DISTANCE,
        originalMeshCount:originalMeshes.length,restoredMeshCount:loadedMeshes.length,
        libraryRootCount:manifest.length,stationCount:stationNames.length,
        finalCorridorCount:final.length,
        visualSourceMap4Hidden:!planetaryWorldGroup.visible,
        map2GateCount:map2Gates.length,
        map2PhysicalCount:(window.starbladeMap2BuildingColliders||[]).length,
        map2Sections:map2Sections.length,
        visualFingerprint:window.map2VisualFingerprint(),
        sourceIds:manifest.map(x=>x.id)
      };
      if(!meta.visualSourceMap4Hidden)throw new Error('Map4 must remain hidden');
      return {meta,manifest,json};
    });
    assert.equal(payload.meta.stationCount,6,'Six complete industrial stations required');
    assert(payload.meta.libraryRootCount>30,'All source families must be archived');
    assert(payload.meta.originalMeshCount>1200,'Library must include complete facade and industrial meshes');
    assert(payload.meta.map2GateCount>50,'Map2 gate system must remain populated');
    assert(payload.meta.map2PhysicalCount>150,'Map2 physical buildings must remain intact');
    assert.deepEqual(errors,[]);

    const packed=Buffer.from(payload.json,'utf8');
    const compressed=zlib.gzipSync(packed,{level:9});
    const manifest={...payload.meta,
      sourceManifest:payload.manifest,
      uncompressedBytes:packed.length,
      compressedBytes:compressed.length,
      sourceOnly:true,
      map2PlacementPreservedByExistingCode:true,
      stage:'EXPORTED_NOT_YET_CONNECTED_TO_RUNTIME'};
    fs.writeFileSync(path.join(dir,'source-library.json.gz'),compressed);
    fs.writeFileSync(path.join(dir,'manifest.json'),JSON.stringify(manifest,null,2));
    console.log('MAP2-48 CAPTURE '+JSON.stringify({
      roots:manifest.libraryRootCount,meshes:manifest.originalMeshCount,
      compressedBytes:manifest.compressedBytes,rawBytes:manifest.uncompressedBytes,
      gates:manifest.map2GateCount,physical:manifest.map2PhysicalCount
    }));
    console.log('PASS MAP2-48 exact visual source snapshot & ObjectLoader restoration');
  }finally{await browser.close();}
})().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
