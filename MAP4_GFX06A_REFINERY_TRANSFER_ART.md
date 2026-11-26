# Harita 4 — GFX-06A / IN-01 + IN-02: Özgün Sanayi Silüeti (İlk Dalga)

Tarih: 16 Kasım 2026. Önceki ana dal: GFX-05C birleşmiş `d92830cffe8aed40bc32a1ca44ae3ad7ef824779`.
İş kimlikleri: `NEXT-02`, `IN-01`, `IN-02`. Referans: [Karar ve takip kaydı](ROADMAP_DECISIONS_PROGRESS.md) ve [master plan](MAP4_GRAPHICS_MASTERPLAN_VQ04_PLUS.md).

## Gerçekten kodlanan

Yeni `h4BuildGfx06aStation` ile mevcut W05 sanayi istasyonlarının **yalnız 1. ve 2. düğümü** görsel olarak farklı büyük endüstriyel kimliğe kavuştu. Her iki modelin 3D geometrileri ve malzemeleri bir defa oluşturulan paylaşılmış `H4_GFX06A_GEO` ve `H4_GFX06A_MAT` kataloğundan gelir. Alan `MAP4_GFX04_INDUSTRIAL_STRUCTURE_VISUALS` altında sahnenin mevcut sektörel görünürlüğüne bağlıdır.

- **IN-01 / 15.750, ayırma rafinerisi**: üç farklı boyda, gerçek dönel yüzeyli (`LatheGeometry`) yüksek ayırma kolonu; farklı tepe başlıkları, yürüyüş çemberleri, servis ve basınç işaretleri; yatay bakır/soğutucu boru başlıkları; yapısal raf platformu ve destekleri. Ana silüet yüksek ve dikeydir. Grup: `MAP4_GFX06A_IN01_DISTILLATION_REFINERY`.
- **IN-02 / 18.750, basınç transfer sistemi**: büyük uç pilonları, çok seviyeli üç uzun basınç hattı, farklı renkli borular, vana çemberleri, açık truss taşıyıcılar, servis ışıkları ve basınç hazneleri. Ana silüet yatay köprü ve farklı yükseklikte hatlar olarak tasarlanmıştır. Grup: `MAP4_GFX06A_IN02_PRESSURE_TRANSFER`.
- **Malzeme**: önceden var olan metal/soğuk çelik atlasları ve metal normal/roughness haritaları tekrar kullanılır. Koyu taşıyıcı, açık boyalı çelik, bakır, krem seramik ve cyan soğutma/amber ikaz bölgeleri ayrı materyal aileleri oluşturur. Henüz artist-made 2K/4K bake değildir.
- Eski W05 `SILO`, `BEACON`, `REFINERY` **yalnız collider içermeyen tekrarlı kozmetik parçalar** ilk iki düğümde görünmez yapılır. Diğer düğümler, tüm gerçek köprü/boru/kule hitbox'ları ve fiziksel görseller korunur. Eski ayrıntı mesh'inin collider'ı varsa gizlenmez.
- Bu çalışma **bütün sanayiyi bitirmez**. Düğüm 3–6, uzak/orta/yakın LOD ve nihai kaynak-model kalitesi sonraki işlerde kalır.

## Değiştirilmeyen kurallar

- 6 W05 istasyonu ve **36 W05 fizik collider** korunur. Yeni GFX06A objelerinin hiçbirinde `h4Collider` yoktur.
- Oyuncu hızlı alçak boru +%12 / üst güvenli / doğu avcı hattını aynı şekilde kullanır. Tesisin dev görsel kütleleri esas uçuş hattının batısında, dış panorama tarafına yerleştirilmiştir; oynanış yolunda sahte engel eklenmez.
- Harita 1 kodu, gemi ve kamera görüntüsü, AI, yarış, ateş, imha puanları, arena 60 sn, görev 300 sn, yörünge 850 irtifa değişmez.
- GPU tarafında yeni atlas üretilmez, paylaşılan geometri/materyal katalogları oyun başında bir kez oluşturulur; `buildPlanetaryWorld` tek kez çalıştığından restart sırasında aynı sanat varlığı yeniden kurulmaz.

## Test ve görsel kabul

- `tests/map4-browser-smoke.cjs`: 2 ayrı GFX06A grup, isimler, özgün malzemeler/geometri, ilk iki istasyonda eski görsel doldurucuların gizlenmesi, üçüncüden altıncıya müdahale edilmemesi, `visualOnly`, sıfır yeni collider, aynı 36 W05 collider, sektör görünürlüğü ve eski 3 rota/AI/çarpışma testleri.
- `tests/map4-art-baseline.cjs`: mevcut 12 kameraya **dokunmadan**, her iki tesis için aynı kod içinden yeni 2 kamera ve HUD açık/kapalı 4 gerçek ekran görüntüsü: `gfx06a-in01-refinery*.png`, `gfx06a-in02-transfer*.png`. Yazılımsal Chromium kare metrikleri çıktı JSON'una yazılır.
- `.github/workflows/map-browser-smoke.yml` yeni dalda browser, offline paket ve sanat karelerini tetikler.
- **Bu rapor yazıldığında CI PASS ve gerçek kullanıcının GPU FPS'si henüz doğrulanmadı.** Bu nedenle geçerli durum **GELİŞTİRME-PR / DOĞRULAMA**; 'ana sürüm tamamlandı' veya '7–8/10 grafik' değildir.

## Sıradaki üretim

1. CI/Chromium testleri incelenip kırık çıktı varsa düzeltilsin. İlk iki istasyon ekran görüntülerinde perspektif, görsel kütle ve eski fiziksel detay örtüşmesi gözle değerlendirilsin.
2. IN-01 ve IN-02'nin oyuncu kamerasına daha yakın, kontrollü gerçek GLB/LOD ve baked PBR sanat varlıkları; yalnız görsel sahada collider uyumu.
3. `NEXT-03 / IN-03 + IN-04`: ağır pres ve montaj ile enerji-soğutma komplekslerinin ayrı büyük silüeti. Sonra 5–6 ve GFX06D materyal dönüşümü.

**Kabul standardı**: kod + test + gerçek görüntü + FPS ayrı kapılardır; yalnız kod yeni olması yetmez.
