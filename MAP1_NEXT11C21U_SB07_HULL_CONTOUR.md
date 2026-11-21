# NEXT11C21U — SB07 özgün gövde ve kanat konturlarının belirginleştirilmesi

**Taban:** C21T / PR #116. **Stacked DRAFT**; `main` dalına kullanıcı açıkça onay vermeden merge yok.

## Gerekçe
C21T gerçek 1600×900 Harita 1 yarış kamerasındaki kırmızı saten mikro dokusu sadece **211 çok hafif piksel / tepe renk farkı 2** oluşturuyordu. Normal hızda geminin mevcut gövde–kanat hacmi ve dış hatları daha iyi seçilebilsin; hiç yeni uçak parçası veya sert neon çizgi eklenmesin.

## Yapılan fiziksel olarak mevcut görsele dayalı boya
- Yalnız **orijinal SB07 SILVER CERAMIC / `HULL` tek GPU material batch** `geometry.color` RGB vertex buffer'ı. Yeni `Mesh`, `Geometry`, `Material`, doku/partikül/şerit ışık/çizim çağrısı **sıfır**. Orijinal **189 parça, 7 malzeme grubu**.
- Mevcut normal vektörlerinin `normal.y` yönüyle: doğrudan ışığa bakan üst yüzeylerde hafif `roofLift=.05`, mevcut yanal/alt panellerde `sideDepth=.07`; dış kanatlara `outboardDepth=.055`; zaten geometrik olarak mevcut kök omuzlarında `shoulderDepth=.016`. Bütün geçişler `smoothstep` ve sürekli rampalar; eklenmiş siyah çizgi veya kabarık parça yok. `minPigment=.795,maxPigment=1.080`, HULL orijinal C21B sınırlarının içinde.
- **Diğer altı eski malzeme grubunun vertex pigmenti değişmez.** Kırmızı `RED` boya ve C21C akışı, C21T 128px saten yüzey, SECOND gövde iskeleti, DARK motor bölgeleri, GLASS, amber ve mavi plazma hiç değiştirilmez. Kullanıcı onaylı yedi ana materyal hex `[0xdbe4ea,0x566675,0xc43838,0x15202c,0x18394f,0xfaa15d,0x6dd9ff]` aynı.
- 49 eski mor ödül kutusu, 320 meteor, 97 bariyer, 8 enkaz kapısı/32 katı engel, 192 halka/10 batch, 2600 yıldız ve 38 eski bulutsu, 5 yol sektörü; Map4 249 farklı gemi parçası ve 6/36/200 fizik aynı. Kontrol, yarış dengesi, kamera, görev, yapay zekâ, geometri ve RNG değişmez.

## Gerçek WebGL doğrulama
- `tests/map1-next11c21u-hull-contour.cjs`: gerçek Chromium/SwiftShader 1600×900. SB07 `HULL` yüzeyindeki `position/normal` ve RGB vertex sayıları ve 7 orijinal materyal doğrulanır. C21T orijinal `balancedTint HULL` formülünü matematiksel olarak **bütün mevcut vertexler için yeniden üretir**, aynı gemi/aynı yarış kamerası/aynı sahnede eski–yeni `gl.readPixels` ekran görüntüsü ve yan yana PNG alır. Gerçek piksel farkı, drawcall/memory/GL error, pigment restorasyonu ve Map4 fizik izolasyonu ölçülür. Test sırasında gemi veya harita nesneleri taşınmaz.
- Dedicated CI bütün orijinal SB07/C20 ve C21A-F testleri, C21T/S/R/Q/P/O/N/M/L/K/J/I/H/G6 geçmiş harita testleri; ayrıca 80+ adımlı Map1/Map4 full smoke. Tek dosya çevrimdışı oynanabilir HTML ayrı hızlı build CI'sinde.
- İlk C21U testinde `Map1` başlangıcında Map4 collider dizilerini 6/36/200 bekleme hatası düzeltildi. Map4 collider'ları **Map4 başlatılınca** oluşur; test başlangıçta 0/0/0 bekler, Map4'e geçince 6/36/200 kontrol eder. Bu yalnız QA test değişikliğidir.
- Değişim piksel sayısı **görsel etki ölçüsüdür**, kalite/estetik kabulü, gerçek donanım GPU FPS veya yayıncı sunumu kabulü değildir. `main` merge izin kapısı devam eder.

## Yol haritası
Önceki C21T özel test [#44912403115](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44912403115) artık **SUCCESS**; tam Map1/4 smoke [#44912403102](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44912403102) son kontrol ~52/80 sürmekteydi.
