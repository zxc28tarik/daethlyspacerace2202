# NEXT11C21N — Harita 1 küçük koridor halkaları ton dengesi

**Stack taban:** C21M / PR #109, orijinal mor ödül kutusu + yüzey derinliği, 320 meteor / 97 bariyer / 8 enkaz ve SB07 ile.

## Amaç
Orijinal koridorun aşırı elektrik mavisi **153 küçük** halkasını, oyuncunun 39 kritik ana halkayı daha rahat seçebilmesi için biraz daha nötr maviye çekmek. Bu bir yeni halka tasarımı değildir. Ana yönlendirme çizgilerini, sınır tehlikesi uyarılarını, halkaların sayısını, aralıklarını ve konumunu değiştirme. Mevcut sahnenin görsel dilini koru.

## Kaynak kodu değişikliği
- C20O/C20P/C20Q birikimi üzerine yalnız `ringMaterial` (minor): renk `0x406dff → 0x557fc4`, opacity `.30 → .26`. `uNear=600`, `uFar=3000`, `uFloor=.08` ve `ShaderMaterial` orijinal algoritması aynı.
- `MAP1_C21N_MINOR_RING_GRADE` tek sabit; kullanıcı görsel değerlendirmesinde fazla sönük bulunursa yalnız bu renk/opaklık değiştirilebilir.
- **39 ana halka** `majorRingMaterial: 0x00e7ed/.85` aynı, **16 uçuş rayı** `0x17adcf/.58` aynı, **16 amber/kırmızı sınır uyarısı** `0xffba65/.20` ve `0xff6e67/.25` aynı.
- 192 halka **10 batched LineSegments**, 16 uzun ray **20 batched LineSegments**, 46 toplam rehber obje, 6960 ray segmenti ve tüm örneklenmiş dönüş koordinatları birebir aynı. Yeni mesh, shader, drawcall, geometri, collider, RNG veya oyun kuralı yok.
- Harita 1: 49 orijinal mor kutu, C21M 6 yüzeyli renk, 320 meteor, 97 engel, 8 enkaz kapısı, mevcut SB07 189 parça ve Map4 249 parça korunur. Harita 4'te Map1 rehber grubu zaten kapalı.

## Kabul
1. `tests/map1-next11c21n-minor-rings.cjs`: gerçek 1600×900 Chromium/WebGL, aynı kamera ve **aynı mesh** önce C21M parlak mavi, sonra C21N yumuşatılmış mavi. Tüm uniformlar geri alınır. `gl.readPixels` fark, drawcall eşitliği, 0 GL error ve büyük rehber/sınır malzeme sabitliği sayısal kontrol edilir.
2. C21M/L/K/J/I/H/G6 geçmiş grafik regresyonları + C20O/P/Q/R koridor ve SB07 testleri + offline full HTML.
3. `map-browser-smoke.yml` üzerinde tüm Map1/Map4 geçmiş QA; bu dal için reddedilmiş kristal/atom C21G–G5 testleri yine atlanır.
4. Başarı, kullanıcı estetik 7–8/10 onayı veya native GPU FPS kanıtı değildir. PR **DRAFT**, kullanıcı açık onayı olmadan main'e merge YOK.

## Sonraki
Gerçek C21N aynı kamera screenshot ve uzun uçuş sahnesi incelenecek. C21O yalnız mevcut oyunun görsel kalitesi ve doğrulanmış ihtiyaçlar doğrultusunda seçilecek.
