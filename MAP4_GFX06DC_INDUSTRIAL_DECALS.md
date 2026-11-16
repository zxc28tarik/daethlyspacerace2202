# Harita 4 — GFX-06D-C / NEXT-05C: Sanayi Servis Decal, Kurum ve Aşınma

**16 Kasım 2026.** Bir adet `.` komutuna karşılık gelen tek geliştirme aşaması.
**Bağlı geliştirme:** [GFX-06D-A/B PR #36](https://github.com/zxc28tarik/daethlyspacerace2202/pull/36). Önceki PR zinciri #32→#33→#34→#35→#36; GFX-06D-C bu zincirin üstünde yeni taslak PR olarak değerlendirilmelidir. `main` üzerinde henüz değil.

## Oyuna gerçekten eklenen

- `h4Gfx06dcAtlas()`: **tek 1024×1024 paylaşılan CanvasTexture**, 4×4 kareli UV kataloğunun dokuz hücresi kullanılıyor. Her tesise özgü servis numarası/işlev, bir kurum patch'i, bir pas/akıntı patch'i ve bir yıpranmış amber ikaz şeridi. Bu görsel texture tablosu renk blokları + deterministic mikro aşınma içeriyor; işaretler okunsun diye sınırlı kontrast, abartılı neon yok.
- Altı tesise farklı, fiziksel ve fonksiyonel işaretler:
  1. **01 — FRACTIONATION** (15.750): ayırma rafinerisi
  2. **02 — PRESSURE TRANSFER** (18.750): basınç hattı
  3. **03 — HEAVY ASSEMBLY** (21.850): pres/montaj
  4. **04 — COOLING RECOVERY** (24.950): soğutma ve enerji geri kazanım
  5. **05 — CARGO TERMINAL** (28.150): lojistik terminal
  6. **06 — REACTOR GRID** (31.500): santral/reaktör
- Her işaret ilgili art grubundaki **mevcut büyük kutu gövdelerin gerçek öne/arkaya bakan yüzeylerine** quaternion ve gövde ölçeğiyle yerleştiriliyor. Bağımsız havada duran sahte 'billboard' veya oynanış engeli yok. Art gövdeler: `IN01_PIPE_RACK_BASE`, `IN02_MAIN_TRUSS`, `IN03_ASSEMBLY_DECK`, `IN04_TURBINE_GENERATOR_HALL`, `IN05_FREIGHT_TERMINAL_DECK`, `IN06_REACTOR_FOUNDATION`.
- Tesis başına yalnız **4 `InstancedMesh` çizim kümesi**: 2 servis tabelası; 4 kurum/yanık, 3 pas sızıntısı, 2 kırık ikaz şeridi. Altı tesiste toplam **12 tabela + 24 kurum + 18 pas + 12 ikaz = 66 görsel decal instance; 24 toplu batch**. Aynı texture, aynı MeshStandardMaterial; her birinde ayrı texture/drawcall değil.
- Yüzey çizimleri `transparent`, `depthWrite:false`, `polygonOffset` ile; boyutu, işaret sayısı ve yerleşimi işlevsel kalıyor.
- **GFX-06D-B LOD uyumu:** 6.1 km'yi aşan kamera mesafesinde bir istasyonun bu küçük detayları gizleniyor, 5.4 km'ye dönünce geri açılıyor. Yeni Mesh/texture oluşturulmuyor ve mevcut yakın/orta/uzak fabrika geometrisi değiştirilmez.

## Oynanış ve fizik güvenliği

- **Sıfır** yeni h4Collider ve silah hedefi. **36 W05 sanayi collider** ve 34 W02 fiziksel model korunur; alt hızlı boru +%12, üst güvenli ve doğu avcı hattı aynı kalır.
- Harita 1 fizik/kamera/görüntü, Harita 4 4 faz, 60 saniye avcı arenası, 300 saniyelik süre, 850 irtifa, 5 rakip+8 avcı ve puan/AI koduna dokunulmaz.
- Art tek HTML offline derlemesinin içinde procedural CanvasTexture olarak oluşturulur; dış internet varlığına bağımlı değildir.
- İlk altı tesise önceden eklenen gerçek görsel 3D kütleler, GFX06M ortak malzemeler, VIS02 modeller ve GFX06D-A/B PBR+LOD sistemi korunur.

## Kanıt / kapanış şartları

- `tests/map4-browser-smoke.cjs`: tek atlas/1024 px/9 UV karo, tüm altı fabrika, 24 batch + 66 instance, model ile konum bağları, iki taraflı servis tabelası, ortak material/texture, 36 W05 ve 34 W02 fizik, gizlenip geri açılan LOD görüntüsü ve Map1 regresyonu.
- `tests/map4-art-baseline.cjs`: üç tesiste (rafineri/soğutma/santral) **aynı sabit kamera ve ışıkta decals KAPALI / AÇIK** toplam altı gerçek Chromium in-engine ekran görüntüsü. İki karede yalnız decal görünürlüğü değişir; renderer drawcalls/triangle ölçümleri ayrı tutulur.
- `.github/workflows/map-browser-smoke.yml`: Ubuntu 24.04 browser/offline/sanat otomatik CI; indirilebilir offline HTML GitHub Actions artifact'ı.
- **CI PASS henüz gerçek GitHub Actions sonucu ile doğrulanana kadar bu işi 'tamamlandı' diye işaretlemeyeceğiz.**
- Gerçek GPU FPS/p95/VRAM ve kullanıcı son estetik onayı bu PR ile verilmiş sayılamaz. 1024 px atlas procedural; profesyonel baked 2K/4K GLB/PBR sanat kabulü halen açık.

## Sıradaki adım

Tek `.` komutunda **NEXT-06 / LM10–12**: Harita 4'ün son 34.000–50.000 ilerleme kısmında hudut karakolu, askeri uzay limanı ve yörünge fırlatma kompleksi. Ancak mevcut decal testlerinde hata varsa öncelikle düzeltilecek. Önceki büyük sanat/LOD/optimizasyon borçları silinmez.

