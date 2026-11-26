# NEXT11C21G4 — İnce üç enerji halkası

**Kullanıcı isteği:** Metalsiz minimal kristalin etrafında **daha fazla halka**. Önceki tasarımı şişirmeden, kristali ve mevcut fizik kurallarını koruyarak üç farklı yörüngede dönen ince enerji halkası yapıldı.

## Oyuna işlenen
- Ana halka (önceki tasarımla aynı çap 24, incelik 0.52) mevcut; parlaklık yoğunluğu 0.36 → **0.29**.
- Dış ikinci halka: yarıçap **28**, kesit **0.40**, soluk lila tonu ve opaklık **0.18**.
- İç üçüncü halka: yarıçap **19**, kesit **0.37**, mavi-lila tonu ve opaklık **0.20**.
- Üç halka da **farklı eğimlerde ve farklı eksenlerde**, ikisi ters yöne yavaşça döner; tek bir halka gibi üst üste binmezler.
- **Metal iskelet/metal malzeme sıfır**. Kristal formu ve iç ışık değişmedi. Postprocess, bloom, extra lights ya da particle artışı yapılmadı.
- 49 ödülün hepsi **5 mesh** (eski 3 + iki yeni halka). Her halka geometrisi ve materyali 49 obje arasında ortak; 49 kat ayrı vertex buffer yok.
- Ödül/kutu mekanikleri, radius=49 sweep collision, route/powerup RNG, normal Shift/W boost, HYPER turbo süresi, lazer/enerji, SB-07 189 gövde parçası, Harita4 249 ve [6,36,200] collider aynen duruyor.

## Kabul
- Test: tests/map1-next11c21g4-triple-orbit.cjs
- Chromium/Three r128 1600x900 native AA; tek ve üç halka aynı kamera A/B screenshot, gerçek chase kamera 185m staged pickup screenshot; tüm 49 pickup, metalness=0, radius49, ring material/geometry paylaşımı, bağımsız dönüş ve Map4 koruma.
- Dedicated .github/workflows/map1-next11c21g4-triple-orbit.yml, bütün Map1/Map4 smoke; önceki C21G2-C21G3 testleri yeni 5 mesh kompozisyonu için güncellendi.
- Workflow **son kaynak kodundan offline tek oynanabilir HTML** üretir. Onay olmadan main'e merge yok; kullanıcı otomatik sonraki küçük adımı istedi.
