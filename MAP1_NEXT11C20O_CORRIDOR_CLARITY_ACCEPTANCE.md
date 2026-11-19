# NEXT11C20O — Harita 1 Uzak Çizgileri Birleştirme, Netlik ve GPU Komut Bütçesi

**Tarih 19 Kasım 2026**. Kullanıcı "." ile C20N'den NEXT11C20O'ya devam talimatı verdi. Geçerli kesin tasarım: **yeni küçük parça eklemek yerine mevcut ayrık parçaları birleştir ve çizgi kalitesini artır**.

## Önceki kabul ve gerçek test durumu
- [NEXT11C20N baş dalı #44522289298](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44522289298): `success` — gerçek Map1 + Map4 sahneleri 1280×720 ve 1920×1080 testleri, SwiftShader. 720p baseline Map1 `257` calls / `62,026` rendered triangles; Map4 `284` calls / `177,591` triangles (tek frozen frame; GPU FPS değil).
- [C20N full smoke #44522289351](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44522289351) ilk kontrolde `in_progress` idi; final durum tekrar kontrol edilmeli.
- C20N modelinde Harita 1 `buildVisibleCorridor()` fonksiyonu **192 ayrı `THREE.LineLoop`** yarattığı için her halka ayrı nesne/render çağrısı potansiyeline sahipti. İnce mavi halkalar uzaktan çok fazla dikkat çekebiliyordu.

## C20O uygulaması
- Yeni halka, dekor, çarpışma veya rota kuralı **eklenmedi**. `d=160;d<50000;d+=260` ve 48 segment/halka, 5'te bir ana vurgulu halka algoritması **birebir korunuyor**.
- 192 halka artık **5×10km rota sektörü ve her sektörde 2 malzeme `LineSegments`** olarak düzenlendi: maksimum **10 gerçek çizim nesnesi**. 192 orijinal halka, 39 büyük ve 153 ince halka olarak hâlâ var; uç segmentler kapatıldı, `getRaceFrameAtDistance` ve `getCorridorRadiusAt` aynen kullanılıyor. Böylece **182 ayrı çizim nesnesi azaldı (%94,79 halka-nesne azalması)**. Bu rakam bütün sahnedeki draw call azalması veya FPS artışı DEMEK DEĞİLDİR; frustum bazlı draw call farkı ölçülmeli.
- Uzunlamasına mevcut 16 yol rayı + 16 fiziksel sınır çizgisi korunuyor. Guide group yeni **10+32=42** çocuk çizgi nesnesi. Ayrı büyük mavi-yeşil yol halkaları görünürlük / uyarı için olduğu gibi kalır.
- İnce halkaların başlangıç opacity `.43→.30`; oyun sırasında pulse `.33+.17*pulse` yerine `.24+.12*pulse`. Büyük vurgu halkaları `.70+.22*pulse` korunur. Çarpışma tehlikesi uyarısı, rengi, parkur genişliği ve navigasyon aynı.
- Ayrılan halka grupları `userData` altında `ringBatchCount`, `ringOriginalCount`, `ringSectorCount`, `ringEdgeSegments` ile gerçek geometri kabul testine açıldı.

## Regresyon/test altyapısı
- Orijinal `index.html` tam inline JavaScript statik syntax PASS.
- Yeni `tests/map1-next11c20o-corridor-clarity.cjs` gerçek GitHub Actions Chromium / Three.js r128 üzerinde Harita 1'i çalıştırır, 192 original, 10 batch, 39/153 major/minor sayımı, 48 segment, her batched buffer vertex sayısı, 160m'deki ilk gerçek 3D rota köşesi (<.003 fark), 42 total guide object, korunan tehlike opacity, 189 SB-07 parçası, 249 B-04, [6,36,200] physics colliders, Map4 görünürlüğü doğrular.
- Gerçek WebGL framebuffer'dan Map1/Map4 **1280×720 PNG** (`gl.readPixels`) alır; bu gerçek render kanıtları JSON ile beraber workflow artifact olarak yüklenir.
- Özel `.github/workflows/map1-next11c20o-corridor-clarity.yml` tanımlandı; mevcut 43 aşamalı `map-browser-smoke.yml` dal ve yeni özel test ile güncellendi.
- **Gerçek CI PASS ve screenshots** yeni HEAD için tamamlanana dek başarı iddiası yok.
- Native kullanıcı ekran kartı FPS/p95 ve 5dk oynayarak görsel onayı açık.

## Korunacak sabitler
- SB-07 Zenit **189 gerçek oluşturucu primitifi**, 7 opaque material batch+2 glow sprites, ince uzun sivri burun, geniş düz ana kanat ve iki dışta dikey wingtip fin, mavi cam, kırmızı yarış şeritleri ve iki motor; yeni wing veya model yok.
- Harita1 saf yarış (silahsız), 5 bot, yarış fiziği, rota/astarot/çarpışma/enerji/boost/camera/HUD ve diğer haritalara ait kontroller korunur.
- Harita 4 B-04 249 parça, arena ve endüstriyel bölge, AI, 6+36+200 collateral koruma, renderer global ayarları değişmez.
- PR taslak, açık **MERGE onayı verilmedi**.

## NEXT11C20P
İlk olarak C20O Chromium gerçek 720p PNG'lerini ve `calls` sayısını C20N baseline 257 ile karşılaştır. Eski 192 halka nesnesi 10'a indiği hâlde bütçe/parlaklık beklenenden kötüyse sektör bazlı culling parametrelerini kontrol edip yalnız seçici düzelt. Uzunlamasına rayları ancak aynı QA doğrulamasıyla toplulaştır; yeni mikrodetay ekleme yok.
