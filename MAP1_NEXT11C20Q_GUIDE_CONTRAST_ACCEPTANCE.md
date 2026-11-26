# NEXT11C20Q — Harita1 koridor navigasyon çizgilerinde kontrollü uzaklık kontrastı

**19 Kasım 2026 · stacked DRAFT after C20P PR #81 · NO MERGE without user permission**

## Kaynak gözlem ve neden
C20P canlı Chromium 1280x720 PNG ve JSON artifact #14532997264 incelendi: Map1'de ileri görüşte ince turkuaz/mavi kıvrımlar ve iç içe çizgiler belirgin. Daha önce yalnız 153 minor halka ve 16 uzun ray distance-fade özelliği aldı. 39 yüksek opaklıklı major kılavuz halka ve 16 adet turuncu/kırmızı fiziksel sınır çizgisi her rota mesafesinde aynı opaklıkta kalıyordu. Farklı uçuş anlarını gösteren C20O ve C20P PNG'leri doğrudan A/B değildi; bu aşamada kamera sabitleme zorunlu.

## Uygulama
- **Orijinal 39 büyük kılavuz halka** aynen durur. Aynı koordinatlar ve 48 segment/halka korunur, yalnız her iki endpoint'e routeDistance float attribute eklenir. Mevcut dinamik .70+.22*pulse gücü yakınlarda aynen; uzakta (1700–5400 mesafe) yumuşak fade, en uzak .35 katsayı.
- **Orijinal 16 fiziksel warning / impact border çizgisi** (8 amber hint + 8 kırmızı danger) d=0..50000 aralığında aynı 235m örnek, radius ve malzeme rengi korunur. Sadece mevcut çizgi geometry'sine vertex routeDistance eklenir. Hint (1400..5500m, .22 floor), danger (1500..6200m, .24 floor) GPU alpha fade; oyuncuya yakın uyarılar ve anlık boundaryLevel danger artışı değişmez.
- **Korumalar:** 192 ring (39 major /153 minor), 10 ring batch, 20 boyuna rail sector batch /6960 segment, 46 guide drawable; Map1 route, camera, HUD, asteroit, fizik, AI ve saf yarış; SB-07 189 parça / 7 opaque batch +2 sprites ve iki wingtip; Map4 B-04 249 parça ve [6,36,200] collider aynıdır.
- **No extra artwork:** yeni ring/çizgi, görüntü süsü, fizik collider veya gemi primitive eklenmedi. Shader değişimi yalnız Harita1 corridorGuideGroup materyalleri.

## Kontrollü gerçek WebGL QA
- Yeni `tests/map1-next11c20q-guide-contrast.cjs` r128 Chromium SwiftShader WebGL üzerinde 1280x720 sahneyi durdurur; aynı kamera, gemi, pilot konumu ve sahnede yalnız major/boundary malzeme uzaklık fade taban katsayılarını 1.0 yapıp eski çizime karşı **C20Q fade açık/kapalı** PNG, piksel fark sayısı, parlaklık farkı ve JSON üretir. Bu C20P'den C20Q'ya bire bir kod-version karşılaştırması değildir; yalnız **C20Q'daki 3 yeni fade'in kontrollü A/B izolasyonu**.
- Test major ring ve boundary vertex attribute uzunluğunu, Q değişimiyle toplam 46 çizim nesnesini, 192 ring/6960 ray segmentini, material uniform güncellemesini, GL hatalarını, SB-07 189 ve B-04 249, Map1 / Map4 physics [0,0,0]/[6,36,200] doğrular.
- Önceki C20O ve C20P WebGL testleri dahil özel `.github/workflows/map1-next11c20q-guide-contrast.yml`, ayrıca tam `map-browser-smoke.yml` dal tetikleyicisine entegre edildi.

## Açık kapılar / NEXT11C20R
- HEAD gerçek özel Q CI ve full smoke PASS olmadan başarı ilan edilmez.
- Gerçek A/B PNG'leri gözle kontrol, baz alınan yakın warning'lerin korunması; aynı ilerleme mesafesinde büyük ring aşırı sönüyorsa eşikleri ayarla.
- Native kullanıcı GPU FPS/p95 ve 5dk oynanış onayı ayrı; tek render frame draw-call performans ölçüsü değildir.
- Sonraki NEXT11C20R: kamera/hareket sırasında 2.5km ray grup sınırlarında çizgi sürekliliği ve kontrastı test et, iyi ise yeni dekor eklemeden bu görüntü katmanını dondur.
