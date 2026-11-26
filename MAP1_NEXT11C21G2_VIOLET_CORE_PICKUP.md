# NEXT-11C21G2 — VIOLET CORE: mor ödül kutusunun tam 3B yeniden tasarımı

**20 Kasım 2026**. Kullanıcı kesin olarak yalnızca **oyunda görünen ödül kutusu/objesinin görsel kalite artışı** istedi. Kullanıcı tasarım kararını asistana bıraktı ve daha fazla soru sorulmasını istemedi.

## Uygulanan özgün model

Eski sıradan 34×34×34 mor kutu ve tel kutu kenarları tamamen kaldırıldı. Rastgele HYPER_TURBO / SHIELD / ENERGY verebilen her ödülün dış görünümü artık **VIOLET CORE**:

- 30 ince segmentten birleşik tek 3B altıgen iskelet; iki yatay altıgen, altı çapraz omurga, 12 adet kapanan üst/alt çatal. Geleneksel kapalı küp ya da şeffaf kutu kullanılmaz.
- İçte iki katmanlı açık camgöbeği enerji kristali: yarı saydam prizmatik ana yüzey ve açık beyaz enerji özü.
- Merkezden ayrılmış, çapı sabit 26 birim tek ince mor enerji yörüngesi.
- İskelet, kristal ve halkaların bağımsız farklı dönme hızları, çok hafif çekirdek pulse ve 2,7 birim sınırında yüzen görsel.
- Modelin dört çizim mesh'i/üç dünya çocuğu vardır. Eski dört çizimli model ile aynıdır; iskelet 30 ayrı draw-call değil, birleşik BufferGeometry'dir.
- 49 ödülün tamamı **aynı dört geometri ve aynı materyal örneklerini paylaşır**; kopya vertex buffer oluşturulmaz.

## Değiştirilmeyen işler

- Kutu mekaniği **değişmedi**: radius=49, rota pozisyonları, ödül şansları, HYPER süresi, lazer 12 saniye, oyuncu/bot eşitliği, çarpışma, envanter.
- Önceden hangi ödül çıkacağını bildiren ikon yok.
- SB-07 189 fiziksel gemi parçası ve malzeme paleti; Map4 249 savaş parçası ve collider [6,36,200] değişmedi.
- Ödülden sonra gemiye gelen efektler bu modelin konusu değildir ve bu çalışmada **yeniden geliştirilmedi**.

## Görsel ve teknik kabul

- Dedicated workflow: `.github/workflows/map1-next11c21g2-violet-core.yml`.
- Test: `tests/map1-next11c21g2-violet-core.cjs`. Gerçek Chromium WebGL, 1600×900 native 1× MSAA, bir karede sol **eski kutu** / sağ **yeni VIOLET CORE** karşılaştırması.
- İkinci karede aynı mevcut oyuncu yarış kamerasına, yalnız test amacıyla 185 metre ileride **geçici bir kapsül sahnelenir**. Sonra pozisyonu iade edilir; gerçek oyun rota verisine müdahale edilmez.
- Fizik, 49 gerçek pickup, tüm ortak geometriler, sıfır BoxGeometry, dört çizim çağrısı ve önceki C21G ödül mantığı geriye dönük testleri.
- Aynı CI workflow'unda `tools/build-gfx01-bundle.cjs` ile **tamamen offline tek HTML oynanabilir oyun** oluşturulup artifact olarak kaydedilir.
- Genel Map1/Map4 smoke ayrıca çalışır. Dedicated / smoke başarıları raporla doğrulanmadan PASS değildir.

PR, #98 üzerine STACKED DRAFT. Main'e merge için kullanıcı onayı gerekir.
