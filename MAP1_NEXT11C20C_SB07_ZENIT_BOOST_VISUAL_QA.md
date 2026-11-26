# NEXT11C20C — SB-07 Zenit yakın plan yüzeyler ve gerçek boost ışığı

**18 Kasım 2026. Durum: gelişme kodlandı, WebGL/oyuncu görsel onayı açık.**

## Kullanıcının kilit tasarımı
SB-07'yi yeniden tasarlamıyoruz: uzun burun, geniş düz ve geriye süpürülmüş kanatlar, her dış köşedeki **yükselen dikey uç stabilizatör**, çift büyük motor, gümüş-beyaz/kırmızı gövde, koyu mavi kokpit sabit. Önce reddedilen parantez/kavis, kaba ya da gereğinden ince alternatif yok. Yalnız Harita 1 görsel-only racer.

## NEXT11C20C değişiklikleri
1. Her iki tarafta gövde burun dikişi + iki oyuk hava girişi. Bunlar **süs**; gemi sınıfı/silah yok.
2. Yükselen iki kanat stabilizatöründe metal iç iskelet, dekoratif oyuk kanallar. İki arka kanat ucunun dış geometrisi aynen.
3. Kanat kenarına iki ince mavi uç ışığı ve metal geri kenar kanalı.
4. Mavi-siyah kokpit gerçek Three.js `MeshPhysicalMaterial` `clearcoat=.75` ile vernik katmanı; korunan 7 batch içinde.
5. Gerçek yarış `updateGame(dt)` içindeki `state.currentSpeed`, basılı boost ve item turboya bağlı **yumuşak interpolasyonlu** mavi plazma/turuncu ısı rengi, küçük kokpit emissive tepkisi. Yeni GPU point light, parçacık, çarpışma veya oyun gücü eklemiyoruz. Harita 4 dışında çalışmaz; fizik/savaş/puan kamera kontrollerine dokunulmaz.
6. WebGL testi model kimliği, tüm 7 batch, iki motor, kanat stabilizatörleri, çift hava girişi, fiziksel cam clearcoat, normal/boost gerçek renk farkı, Map4 6/36/200 collider/5 rakip/8 avcı/60-300-850/bonuslar korunmasını sınar.
7. 3 önceki gerçek oyun karesine ek olarak **aynı göreli 3/4 kamera** açısından iki karşılaştırılabilir motor normal/boost PNG artifaktı.

## Kalite kapıları
- [x] Kod ve JS statik sözdizim kontrolü; ayrı stacked branch.
- [x] Yeni otonom browser QA ve tam regresyon workflow branch tetiklemesi.
- [ ] Gerçek Chromium/WebGL otomatik testler **PASS** olarak doğrulandı.
- [ ] Aynı açı motor normal/boost ekranları insan tarafından görsel olarak karşılaştırıldı.
- [ ] Gerçek oyuncu tarafından son SB-07 görsel onayı.
- [ ] Harita 1/4 tam uçtan uca pilot testi, native 720p/1080p GPU FPS/p95.
- [ ] Kullanıcı açık izni olmadan PR merge **YOK**.

[Önceki C20B işçiliği](MAP1_NEXT11C20B_SB07_ZENIT_POLISH_ACCEPTANCE.md). `NEXT11C20D` için sıradaki kapı **kayıtlı gerçek görüntü üzerinden estetik düzeltme**, daha çok rastgele parça ekleme değil.
