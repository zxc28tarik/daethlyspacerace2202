# NEXT11C21A — SB-07 ZENİT gümüş-seramik ve fırçalanmış metal yüzey kalitesi

**19 Kasım 2026. Kullanıcı kararı: FPS artırma değil, gerçek görsel kalite. Orijinal 1,00× MSAA en iyi görüntü.**

## Oyun kodundaki gerçek görsel değişiklik
- C20Z'nin ardından önceki farklı yüzeyler HULL ve SECOND **aynı 128×128 roughness+bump checker-grid finish atlasını** kullanıyordu. Seramik ve koyu gunmetal aynı mikro desenle okunuyordu; uzun kanat/gövde üzerinde yapay ince kare ızgarası görülmesi mümkündü.
- **HULL / SB07_SILVER_CERAMIC** artık `MeshPhysicalMaterial`: onaylı renk **0xdbe4ea aynen**, metalness **.47**, roughness **.34**, clearcoat **.30**, clearcoatRoughness **.23**, emissive intensity **.12**, yumuşak 128×128 sürekli/ızgarasız saten-seramik mikrodoku ve küçük bump **.006**. Büyük gövde ve kanat bağlantısında daha tutarlı geniş yansıma.
- **SECOND / SB07_GUNMETAL_SUBFRAME** artık ayrı `MeshPhysicalMaterial`: onaylı koyu mavi-gri renk **0x566675 aynen**, metalness **.76**, roughness **.44**, clearcoat **.12**, clearcoatRoughness **.40**, emissive intensity **.13** ve ayrı 128×128 yönlü fırçalanmış metal atlasıyla bump **.010**. Açık seramikten ayırt edilen işlenmiş alt bağlantı ve motor metal hissi.
- Her iki atlas da **yerel HTML Canvas2D'de deterministik** yaratılır; dış ağ/asset/ücretli kaynak/lisanslı tasarım yok. Mipmap ve anisotropy 4 korunur. Kırmızı yarış boyası **mevcut fineFinish, renk 0xc43838, roughness .47, metalness .43** ile **tamamen orijinal** kalır. Cam `MeshPhysicalMaterial` clearcoat .75 ve mavi renk 0x18394f unchanged; amber motor, plasma, rough geometry ve gerçek ışık aynı.
- Daha önce 7 birleştirilmiş gemi malzeme grubu vardı, **hâlâ 7**; 189 original SB-07 emit, 2 halo, 249 Map4 B-04, onaylı kanatlar/dik kanat ucu/kama burun/iki motor/oyuncu chase kamera/race-only ve 304 corridor rail joins korunur. Mesh, decorator, geometri, rig, çarpışma, shader/post-process ve 1.25×/1.5×/2× açılmadı. *Daha farklı GPU shader/iki küçük texture ilave bellek ve maliyet yaratabilir; gerçek GPU fps test edilmeden performans iyileştirme iddiası yapılamaz.*

## Kabul testi ve görsel değerlendirme
- `tests/map1-next11c21a-native-pbr-finishes.cjs` gerçek Chromium/Three r128 oyun WebGL'inde HULL/SECOND malzeme sınıfı, 128×128 gerçek pixel buffer atlas ortalaması/kontrastı, iki map ayrı, RED ve GLASS unchanged, 7 batch, orijinal native antialias renderer ve SB-07 189/B-04 249 collider [6,36,200] kesin kontrol.
- Aynı 4 açıdan 1600×900 gerçek WebGL stüdyo gemi çıktısı, eski [C20Z gerçek görüntüleri](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44551656762) ile aynı kamera/ışıkta karşılaştırılabilir. Teknik kontrast farkı kullanıcı estetik onayı değildir.
- Özel C21A workflow ve kapsamlı Map1/Map4 smoke, orijinal playable/boost test ve U/W/X/Y/Z/R geometri regresyonu içerir. Son HEAD başarılı CI sonucu ayrı teyit edilmeli.

## NEXT11C21B
Görüntü farkını değerlendir; yeni malzemeler fazla plastik/parlak ya da karanlık okunuyorsa **önce aynı iki malzeme parametrelerini düzelt**. Daha fazla parça, siluet değişikliği, global AA, heavy shader/postprocess, performans takıntısı yok. Herhangi PR açık kullanıcı onayı olmadan merge edilmez.
