# NEXT11C20T — 1,00× / 1,25× / 1,50× / 2,00× supersampling karşılaştırması

**19 Kasım 2026. C20S PR #84 üzerine stacked taslak, birleştirmeye açık kullanıcı onayı yok.**

## Geçerli oyun ve tasarım kararı
- Kullanıcı *yeni küçük görsel parça ekleme, ayrık yüzeyleri birleştir, çizgi kalitesini yükselt* kararı verdi.
- NEXT11C20R'de 304/304 koridor ray kesişimi, NEXT11C20S'de orijinal antialias:true, 720/1080p 2x tanısal karşılaştırma başarıyla doğrulandı.
- Orijinal oyun `index.html` bu adımda yine **değiştirilmedi**; yeni yüksek maliyetli grafik ayarı açılmadı.

## T görevi: gerçek karşılaştırma
- `tests/map1-next11c20t-four-quality-levels.cjs`, gerçek Chromium / Three.js r128 / SwiftShader WebGL ve aktif Harita1 üzerinde 4 çözünürlük oranını ayrı ayrı render eder:
  - Orijinal native-MSAA `1.00×` = %100 ekran pikseli
  - `1.25×` boyut, piksel yükü `1.5625×` = %156,25
  - `1.50×` boyut, piksel yükü `2.25×` = %225
  - `2.00×` boyut, piksel yükü `4.00×` = %400
- Aynı rota (12.500 ve 27.500m), 720p ve 1080p, oyuncu ilerlemesinden -6 / 0 / +6m 3 gerçek WebGL framebuffer sahnesi ile çekilir. `gl.finish` render süreleri, çizim sayısı, gerçek çizgi/üçgen sayısı, WebGL hata kontrolü, lit pixel motion-proxy ve orijinale karşı piksel farkı kaydedilir. 4× 2×2 mozaik 720p/1080p PNG ile JSON artifact üretilir.
- Bunlar **gerçek oyun kamerası yerine rota üzerinde kontrollü tanısal kamera** sahneleridir. Piksel hareket metriği sahne hareketini de ölçer, yalnız anti-alias titremesi değildir. SwiftShader CPU süreleri fiziksel kullanıcı GPU FPS değildir. Tek 3 karelik örnek, uzun oynanış donanım benchmark'ı sayılamaz.

## Güvenli kalite kapıları
- C20R 19×16=304 birleştirme kontrolü ve Harita1/4 tam regresyon başarısızsa kalıcı AA açılmaz.
- SB-07 189 orijinal builder primitive ve 7 ana mesh +2 sprite, B-04 249 primitive, Harita4 [6,36,200] collider, HUD/fizik/kamera/silah/race-only ve 192 ring/6960 rail segment korunur.
- **Bir kalite modu otomatik seçilmez.** Kalıcı 1.25x/1.5x ancak görsel fark belirgin, p95 yerel GPU frame bütçesi uygun ve pilota etkisi kabul edilirse sonraki kararla uygulanır.
- [C20S test QA](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44534431908) gerçek başarı; C20T özel + full smoke henüz sonuç alınmadan PASS yazılmaz.

## NEXT11C20U
Dört gerçek kalite mozağini ve JSON ölçümlerini incele. Artımlı 1.25x kazanımı varsa yalnız Harita1'e isteğe bağlı kalite profili A/B prototipini risk sınırlarıyla öner; yoksa mevcut WebGL MSAA'yı koru. Gerçek donanım FPS/p95 ve 5 dakika oynanış kullanıcı estetik kabulü açık. Yeni dekor yok, PR merge yok.
