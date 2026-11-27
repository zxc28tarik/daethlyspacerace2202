'use strict';
// Deterministic gameplay-independent geometric fingerprint. Used by both
// the original game export and the Map2-owned detached asset test.
window.map2VisualFingerprint=(full=false)=>{
  map2CourseGroup.updateMatrixWorld(true);
  const rounded=v=>Number.isFinite(v)?Math.round(v*1000)/1000:String(v);
  const matInfo=m=>{
    if(Array.isArray(m))return m.map(matInfo).join('&');
    if(!m)return 'none';
    return [
      m.type||'',m.color?.getHexString?.()||'',
      m.emissive?.getHexString?.()||'',
      rounded(m.opacity??1),rounded(m.roughness??0),
      rounded(m.metalness??0),m.transparent?'T':'F',
      m.map?'MAP':'-',m.normalMap?'NORMAL':'-',
      m.emissiveMap?'EMAP':'-'
    ].join(':');
  };
  const rows=[];let meshes=0,instances=0;
  map2CourseGroup.traverse(o=>{
    if(!o.isMesh&&!o.isInstancedMesh)return;
    // Map1 reward boxes are procedurally spun/positioned per race, even
    // while Map2 is active. They are not architectural facade data.
    if(o.name.startsWith('MAP1_ORIGINAL_REWARD_'))return;
    meshes++;
    const geo=o.geometry,attr=geo?.attributes?.position;
    let bounds='';
    if(geo){
      if(!geo.boundingBox)geo.computeBoundingBox();
      if(geo.boundingBox)
        bounds=[...geo.boundingBox.min.toArray(),...geo.boundingBox.max.toArray()]
          .map(rounded).join(',');
    }
    let instanced='';
    if(o.isInstancedMesh){
      instances+=o.count;
      const arr=o.instanceMatrix.array;
      // Include all instance transforms, not only the prototype.
      let seed=2166136261>>>0;
      for(let i=0;i<o.count*16;i++){
        const v=rounded(arr[i]);
        const str=String(v);
        for(let j=0;j<str.length;j++){
          seed=Math.imul((seed^str.charCodeAt(j))>>>0,16777619)>>>0;
        }
      }
      instanced='I'+o.count+'/'+seed.toString(16);
    }
    const row=[
      o.name||'',o.type||'',
      o.visible?'VIS':'HIDE',o.frustumCulled?'CULL':'NOCULL',
      o.matrixWorld.elements.map(rounded).join(','),
      attr?.count??0,geo?.index?.count??0,bounds,
      matInfo(o.material),instanced
    ].join('|');
    rows.push(row);
  });
  rows.sort();
  let hash=2166136261>>>0;
  for(const row of rows){
    for(let i=0;i<row.length;i++)
      hash=Math.imul((hash^row.charCodeAt(i))>>>0,16777619)>>>0;
    hash=Math.imul((hash^10)>>>0,16777619)>>>0;
  }
  return {meshes,instances,hash:hash.toString(16).padStart(8,'0'),...(full?{rows}: {})};
};
