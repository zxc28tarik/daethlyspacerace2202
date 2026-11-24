from pathlib import Path
p=Path("index.html")
s=p.read_text(encoding="utf-8")
old="""                const source=map2ExactMap4Sources[sourceIndex%map2ExactMap4Sources.length];
                const sourceAt=source.userData.progress;
                const clone=source.clone(true);
                clone.name='MAP2_EXACT_MAP4_'+source.name+'_AT_'+Math.round(d);
"""
new="""                const source=map2ExactMap4Sources[sourceIndex%map2ExactMap4Sources.length];
                const sourceAt=source.userData.progress;
                // Map4 collider metadata contains self-references (collider.mesh -> Mesh).
                // Temporarily detach ONLY that metadata so Three.js clone(true) can
                // copy the complete visual hierarchy without recursive JSON overflow.
                const colliderMetadata=[];
                source.traverse(obj=>{
                    if(obj.userData&&obj.userData.h4Collider){
                        colliderMetadata.push([obj,obj.userData.h4Collider]);
                        delete obj.userData.h4Collider;
                    }
                });
                let clone;
                try{clone=source.clone(true)}
                finally{
                    for(const [obj,collider] of colliderMetadata)
                        obj.userData.h4Collider=collider;
                }
                clone.name='MAP2_EXACT_MAP4_'+source.name+'_AT_'+Math.round(d);
"""
if old not in s: raise SystemExit("exact clone source block missing")
s=s.replace(old,new,1)
p.write_text(s,encoding="utf-8")
print("MAP2-13 circular collider metadata sanitized around clone(true)")
