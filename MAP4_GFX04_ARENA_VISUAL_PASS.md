# Harita 4 — GFX-04: Savaş Arenası Özgün 3D Silüet Dalgası
Tarih: 20 Ekim 2026. Kaynak: `da85d1d2d8b8c353445b351ccf8df6935c5a7a82` (GFX-03B).
Durum: Kodda üretilen birinci GFX-04 sanat dalgası; profesyonel sanat kaynağı henüz değil.

## Hedef
Savaşın ikinci fazı kesin 60 saniye sürer; oyuncu ve beş rakip ileri gidemeden geniş alanda serbest yanal/dikey manevra ile sekiz gerçek avcıyı vurmaya çalışır. Grafik üretimi üç cephenin işlevini, büyük ölçek silüetini ve savaşın izlerini ayırt ettirmeli; mevcut avcı puanını ve hareketi kesinlikle etkilememeli.

## Sahnede değiştirdiklerimiz

**Açık Merkez — CENTER:**
- Sol/sağ uzakta düşük kırık siperler, iki aşamalı enkaz modülleri, hasarlı ikaz direkleri.
- Ortada sığ darbe çukuru halkası, yanık bölge ve dört farklı yerde dağılan kırık parça.
- Merkezi hedef görüşü açık kalacak şekilde kütleler yanlara yerleştirildi. Kanallar arasında bir çarpışma kutusu veya görünmez savunma duvarı yok.

**Düşmüş Kruvazör — WRECK:**
- Özgün `ExtrudeGeometry` ile yaklaşık 12 köşeli, asimetrik ana kruvazör silüeti.
- Kırık aft gövdesi, iki büyük kanat plakası, ayrılmış uç parçaları, çift motor halkası, turuncu hasarlı çekirdekler.
- Altı açık iskelet/rib detayı ve beş değişken büyüklükte hurda.
- Önceki tek büyük kutu ve gelişigüzel küçük hurda dizilimi gizlendi.

**Elit Savunma Hattı — DEFENSE:**
- Komuta bunkeri ve simetrik ikili büyük zırhlı kule; iki yükseltilmiş batarya platformu.
- Yüksek radar çanakları, kırmızı hedef işaretleri, açılı zırhlı cepheler, yarı gömülü tahkimatlar.
- Tek tip blok barikat dizisi yerine basamaklı fiziksel mühendislik hissi hedeflendi.

## Ek kalite geçişi: arka plandaki tekrarlı kutular
- Arena çerçevesinde eski otomatik üretilmiş **28 benzer dikdörtgen bina** görünümü kaldırıldı; yalnız 10 düşük, parçalı zırh/enkaz formu aynı alan boyunca konumlandı. Bu dekoratif kütleler fiziksel engel değildir.
- W02 geniş çevredeki 16 yakın obje artık düz kutular yerine yıkık plaka/yanık çekirdek geometri; 28 uzak silüet, açısal kruvazör/enkaz geometrileriyle değiştirildi. **44 obje sayısı aynıdır**, ancak görünüş ve materyaller savaş alanına özgüdür.
- Her bölgede görülen anlamsız büyük dekoratif yön halkaları, bu arenada tek bir merkezi navigasyon halkasına indirildi; üç savaş cebi oyun HUD'undan seçilebilir.
- Amaç, ana savaş enkazı ve elit savunma kütlelerinin tekrarlı binalar arasında kaybolmasını önlemek. Dinamik avcı hedefleri hiçbir dekor nedeniyle görünmez mermi isabeti almaz.

## Teknik sınırlar
- Her cephe GFX-04 sanat çocuk grubunu tek sefer oluşturur: `MAP4_GFX04_CENTER_ART`, `MAP4_GFX04_WRECK_ART`, `MAP4_GFX04_DEFENSE_ART`.
- Eski W04 kütleleri saklanır fakat görünmez; 3 eski W01 landmark + 3 VQ02 signature dekorları görünmez bırakılır. Landmark isimleri, zone HUD ve önceki test sayaçları kalır.
- Materyal kiti taş, yanık karbon, oksitlenmiş metal, savunma çeliği, bakır, sıcak çekirdek ve sinyal lamba renkleri; önceki VQ03 PBR atlasları yeniden kullanılır.
- Yeni mesh'ler `visualOnly` olup **yeni hitbox, avcı, lazer hasarı veya puan üretmez**.
- Mevcut 3/3/2 avcı dağılımı, 60 saniye sabit arena, normal +1/elit +3, 300s limit, 850 bitiş irtifası, 5 rakip, 6 kaya ve 36 sanayi collider değişmez. Harita 1'in onaylı görseli korunur.
- Eski W04 grup sayaçları, oyun başlatma/restart ve bölgesel culling aynı kalır. Sahne objeleri her restart'ta tekrar üretilmez.

## Doğrulama
- `tests/map4-browser-smoke.cjs`: 3 GFX04 grup, özgün taşıyıcı form, malzeme ve görünürlük, eski modellerin gizlenmesi, 12 landmark, gerçek avcı/pilot hasarı, arena kilidi, fizikte regresyon.
- `tests/map4-art-baseline.cjs`: 12 sabit GFX00 kadraj + 3 canyon HUD-on/off + **3 savaş cebi için HUD-on/off** kamera kareleri; yazılımsal Chromium renderer.info metrikleri.
- `tests/map4-gfx01-offline.cjs`: 9 GLB, cache, çevrimdışı HTML, Harita 1 izolasyonu.
- Başarılı CI sonrası main ve indirilebilir tek HTML yayın doğrulaması.

## Görsel kalite ve sonraki üretim
Testler yeni modellerin render edildiğini ve oyun kurallarının sağlam olduğunu doğrular; AAA sinematik kaliteyi ölçmez. GFX04 mevcut procedural artist mesh'lerin özgünleştirilmiş ilk dalgasıdır. Daha ileri aşamada kırık kruvazörün profesyonel GLB/2K PBR atlası, yanık izi/decal, kontrollü duman, enkaz arazi bağlantısı ve performans/oynanış kadraj onayı yapılmalıdır.
