# NEXT-11B / QA-VIS-ARENA + QA-VIS-09 — görünürlük onarımı

**Durum:** Geliştirme/PR ve görsel kabul testi. Taban [NEXT11 PR #44](https://github.com/zxc28tarik/daethlyspacerace2202/pull/44), önceki PR zincirine bağımlı; `main`'e birleştirilmedi.

## 1. Önce doğrulanmış kök nedenler

### Arena 04–06

Gerçek Chromium/WebGL tanı testi `tests/map4-gfx11b-visibility-diagnostic.cjs` ile fabrikanın **yalnız render grubunu** aç/kapat yapıp aynı kamera ilerlemesinde baktık:

| Sabit kadraj | Fabrika grubu kapalı (güncel) | Geçici fabrika grubu açık | 
|---|---:|---:|
| 04 – merkez, progress 13000 | 36 draw call | 472 |
| 05 – enkaz, progress 13200 | 24 | 483 |
| 06 – savunma, progress 13400 | 21 | 504 |

Bu deney görünürlük kaybının önemli bir kısmını `gfx04IndustrialVisuals.visible=false` kararına bağlar. Ancak **mevcut `tests/map4-browser-smoke.cjs` testinde fabrikaların arena sırasında gizli kalması kesin korunan karardır**: sonraki aşamanın rafinerisi 60 saniyelik savaşı kaplamamalıdır. Bu yüzden fabrikanın tamamını açmak geri alınır; bunun yerine özgün savaş silüetleri üretilir.

### Sanayi 09

Progress 31600 / laneY 450 sabit kamera `W05_INDUSTRY_STATION_6` altında x=0 merkezdeki gerçek **560 birim yüksekliği olan gantry destek sütununun içinde** bulunuyor. WebGL raycast merkezde kameradan 19,76 uzaklıkta bu mesh'i vuruyor; `Box3.containsPoint(camera.position)` true. Bu sütun `h4IndustrialModelDetail` içinde `at+90=31590`, `side=0`, `altitude=280`, `scale[1]=560` olarak kuruluyor; eski `h4PlaceStructure` **gerçek** `planetaryBuildingColliders` kaydı yapıyor. Sütunu silmek veya taşımak fizik ve parkuru değiştireceğinden **yasak**.

## 2. Kodda yapılan değişiklikler

**Arena:**
- `h4Gfx11bBuildArenaSkyline()` ile yalnız arena grubuna ait, görsel-only özel bir dış savaş sahnesi eklendi.
- 4 paylaşılan `THREE.InstancedMesh` / **74 görsel instance**: parçalanmış taşıyıcı gövdeler, yaralı savunma kuleleri, kırık dış kanatlar ve sinyal ateşleri. VQ/GFX04 çizilmiş özgün `fracturedCarrier`, `brokenPlate`, `cannon` ve `beacon` geometri/PBR malzemelerinin **yeniden kullanımı**.
- Merkezi avcı/nişangâh hattı açıklığı ve üç ayrı pocket korunur. Yeni collider / fizik / score / hunter/AI yok.
- **Önceden var olan fabrikanın tamamı phase2'de hâlâ kapalı**. Yakın sahne artık sadece isimsiz, sonsuz kutu tüneli değildir; amaçlı savaş silüeti.

**Sanayi:**
- `h4Gfx11bCameraMask` yalnız **altıncı istasyonun gerçek merkez kolonunu** işaretler.
- Dünya malzeme dönüşümünden **sonra** orijinal PBR materyali saklanır; tek klon yakın kamera olduğunda %7.5 opak, `depthWrite=false` kullanılır. Kamera 100 birimden fazla uzaksa aynen eski PBR'a döner.
- Hem gerçek oyun kamera render öncesinde hem 12 sabit kadraj renderer testinden önce görünürlük kontrolü çalışır.
- Nesnenin dünya konumu, geometrisi, `userData.h4Collider` AABB ve asıl materyali yerinde kalır. Başka kamera/Harita1 etkilenmez.
- Bu çözüm **fiziği değiştirmeyen yakın-kamera saydamlaştırmasıdır**; daha sonra insan gözle görünürlük kontrolü gerekir.

## 3. Otomatik kabul / açık sınırlamalar

`tests/map4-gfx11b-visual-acceptance.cjs`:

- [ ] 04, 05, 06 aynı kamera warfront kapalı/açık PNG çiftleri gerçekten farklı; dört render batch/74 instance görünür, geometri/üçgen sayısı yükseliyor.
- [ ] Üç senaryoda ileri fabrika grubu kapalı; arena zemini açık.
- [ ] 09 aynı kamera sütun %100 opak vs geçici saydam PNG farkı; sütun `planetaryBuildingColliders` içinde **aynı progress/side/altitude/AABB**.
- [ ] 6 kanyon + 36 sanayi / ≈200 toplam yapı collider, 5 yarışçı, 8 avcı, 60sn/300sn/850m ve skor değişmiyor.
- [ ] Önceki offline, Map1/4, GFX09, GFX10, 300sn simüle VFX, GFX11 62 gerçek PNG/art baseline CI PASS.

**Ayrı açık (otomatik kapatılamaz):** Gerçek uçtan uca 5 dakikalık oynanış, gerçek masaüstü GPU FPS/p95/VRAM, 720/1080 gerçek cihaz kontrolü, tüm arenanın 7–8/10 insan sanatsal kabulü, ana dala birleştirme, ilk yayıncıda ≥3 oynanabilir harita.

**Sonraki `.`:** Yeni GFX11B CI hata verirse aynı PR üzerinde düzeltme; PASS ise gerçek karşılaştırmalı görüntüyü incele ve kalıcı görsel borçlar / NEXT11C arena doluluk, sanayi sanat ve gerçek GPU kabul kapılarından sıradaki açık işi işle.
