# Harita 4 — GFX-04B: Düşmüş Kruvazör GLB ve Hasarlı Metal Sanatı

Tarih: 20 Ekim 2026. **Başlangıç commit'i:** `35efea1467702bdfe6723e03dd095436e196c490`.
Çıktı: GFX-04'ün mevcut savaş alanını koruyarak batı enkaz cephesinin ana gemisini ayrı bir **dokulu GLB sanat varlığına** yükseltme.

## Uygulanan teknik sanat üretimi

- `wreck_carrier`: fizik/collider olmayan, özgün kodla şekillendirilmiş gemi enkazı. Ana gövde 3D yüzeylerden ve kasıtlı açık gövde kırıklarından oluşur; görünen iç iskelet kaburgaları, simetrik olmayan parçalanmış kanatlar, yıkık komuta köprüsü, iki hasarlı motor boğazı, ısı plakaları ve kopmuş zırh parçaları içerir.
- 3 gerçek LOD mesh: `wreck_carrier`, `wreck_carrier_lod1`, `wreck_carrier_lod2`. LOD0 daha fazla detay, LOD1 orta, LOD2 mesafeli silhouette hedefi. Aynı GFX01B önbellek/GLB loader ve mesafeye bağlı LOD sistemi kullanılır.
- 512x512 prosedürel **soot/rust/painted steel albedo PNG atlası** GLB'nin içine gömülür (dış HTTP yok). Siyah kurum, oksit, panel derzleri ve ince yönlü yüzey aşınması üç GLB'de vardır. Mesh yüzeyinin glTF UV accessor kanalı PBR materyale bağlıdır.
- **Dürüst sınır:** Bu gerçek bir normal/ORM 2K PBR bake seti veya Blender sanatçı üretimi değildir. glTF metallic/roughness materyal parametreleri kullanılmakta, albedo procedurally tasarlanmaktadır. Tam sanat bitmiş kabul edilmez.
- Model yüklenince yalnız 8 artık gereksiz eski GFX04 ana gövde, kanat, motor, yanık çekirdek parçası gizlenir; enkaz fragmanları, iskeletler, eski dünyadaki 3 isimli landmark ve hedefler korunur.
- Başarısız yüklemede eski 3D kruvazör görünür kalır. Her GLB yalnız bir kere çözülür; restart art gruplarını yeniden üretmez.

## Korunan oynanış
- Arena kesin 60s, toplam görev 300s, final yörünge ≥850, 8 avcı (3+3+2), +1/+3 gerçek imha puanı, 5 rakip.
- 6 gerçek W03 kaya ve 36 gerçek W05 sanayi collider; bu GFX-04B dalgasında yeni hitbox, engel, lazer hedefi yok.
- Harita 1'de yeni GLB ve malzemeler görünmez, eski yarış/ışık/arayüz aynıdır.
- Dört bağlı alan ve üç bölgesel savaş cebi korunur.

## Test ve teslim
- `tests/map4-gfx01-offline.cjs`: 12 GLB, UV+embedded PNG, hash, cache; cruiser mount ve 8 eski parça gizleme, sahnede tek LOD, Map1 izolasyonu, sıfır dış ağ isteği.
- `tests/map4-browser-smoke.cjs`: eski 60s/300s/arena/hunter/collider/restart/Map1 regresyonu. Kaynak HTML'de model sağlayıcı yoksa eski kruvazörün fallback olarak görünmesi normal.
- `tests/map4-art-baseline.cjs`: 12 baz sahne, 3+3 kanyon görünüşü, 3+3 savaş sahnesi + **yeni kruvazör için iki HUD-on ve iki HUD-off** yakın çekim.
- Tek dosya offline HTML Release, commit SHA eşlemesi, CI PASS; gerçek masaüstü FPS ve kullanıcının görsel kalite puanı hâlâ açık.

## Sıradaki sanat işleri
Profesyonel GLB köprü silüeti, animasyonlu büyük motor kırıkları, yerle temas eden enkaz yaraları, yerel duman/yanık decal'leri ve hasar kaplamalarında gerçek baked normal/ORM. Ardından GFX04 elit savunma hattı özgün modeline geçilmeli.
