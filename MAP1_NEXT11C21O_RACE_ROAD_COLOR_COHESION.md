# NEXT11C21O — Harita 1 mevcut yarış yolu renk bütünlüğü

**Taban:** C21N [PR #110](https://github.com/zxc28tarik/daethlyspacerace2202/pull/110) üstüne stacked DRAFT.

## Görsel hedef
Orijinal beş sektörlü yarı saydam uçuş yolunun çok parlak cyan/mavi/mor/yeşil/turuncu malzemeleri yer yer beş ayrı neon gösterisine dönüşüyordu. Yeni **beş uyumlu, daha ölçülü pigment** (turkuaz, gök mavisi, mineral-mor, su yeşili, amber) aynı bölüm farklarını korurken mor ödül kutularını, meteorları ve yönlendirme/çarpışma uyarılarını daha rahat ayırt ettirir.

Bu bir yeni zemin, koridor, model, parça veya oyun modu değildir.

## Uygulanan tek kod değişikliği
- `buildRaceRoad()` içindeki orijinal 5 sektörün `sectorPalette` pigmentlerini `MAP1_C21O_ROAD_PALETTE` adlı immutable paletle değiştir:
  - 1: `0x16e7ff → 0x49bfce` (sakin turkuaz)
  - 2: `0x43a5ff → 0x709bc8` (yumuşak gök mavisi)
  - 3: `0xe87eff → 0xb48abf` (dengeli mineral-mor)
  - 4: `0x44ffaf → 0x6aba9e` (ağırbaşlı su yeşili)
  - 5: `0xffb467 → 0xcfa57e` (sıcak/loş amber)
- Her 10 km sektorun orijinal `MeshBasicMaterial` yol yüzeyi **.115 additive opacity**, sağ-sol hat `LineSegments` **.74 opacity**, orta beyaz kesikli çizgi **.33** sabit.
- Sektör grupları, yol geometrisi, genişlik/uzunluk, 145 birim örnekleme, kesikli merkez çizgileri, virajdaki amber yön okları ve bütün koordinatlar aynıdır.
- Yeni mesh, model, shader, ışık, render pass, tekstür, collider, drawcall, yarış mekaniği veya RNG tüketimi **yok**.
- 153 küçük/39 büyük halka, 16 ray, 320 meteor, 97 bariyer, 8 enkaz, 49 C21M yüzeyli orijinal ödül kutusu, 189 parçalı SB07 ve 249 parçalı Map4 **birebir korunur**.

## Gerçek kabul ve regresyon
1. `tests/map1-next11c21o-road-colors.cjs`: gerçek Chromium/WebGL 1600×900. **Normal oyun kamerası** ve **sadece kamera geçici eğilen yol yüzeyi yakın kontrolü**: C21N eski 5 renk / C21O uyumlu 5 renk A/B PNG, aynı mesh ve kamera, piksellerde ölçülebilir değişiklik, 0 WebGL hatası, aynı drawcalls.
2. Oyun dışı ikinci kamera yalnız testte; oyun kamerası position/quaternion/up eksiksiz geri alınır.
3. 5 sektörün orijinal çocuk mesh sayısı, kenar/çizgi opaklıkları, 5×10000m sınırı, malzeme ve aynı geometri korunur; Map4'te Map1 yol `visible=false`, fizik 6/36/200, race/combat gemi 189/249 parça.
4. C21N/M/L/K/J/I/H/G6, C20O/P/Q/R, SB07, full Map1+Map4 browser smoke, offline single-file HTML.
5. **Özel test PASS**, kullanıcının gerçek ekrandaki estetik onayı veya native GPU FPS kanıtı sayılmaz. `main` merge için açık kullanıcı onayı gereklidir.

## Kabul sonrası
Yayıncı için en az üç oynanabilir harita hedefi ve native GPU 720p/1080p hâlâ ayrı kapılar. Bu görsel işlem Harita 4'ün kendine özgü atmosferini değiştirmez.
