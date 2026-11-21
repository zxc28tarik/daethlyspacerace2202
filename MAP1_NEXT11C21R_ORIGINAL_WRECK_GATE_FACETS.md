# NEXT11C21R — Harita 1 özgün 8 enkaz geçidinin yüzey derinliği

**Stack tabanı:** C21Q / PR #113; **ana dala merge yok**.

## Neden?
Oyuncunun Harita 1 koridorunda karşılaştığı 8 büyük enkaz geçidi, C21I’nin orijinal yıpranmış metal dokusuna sahip olsa da, büyük kutu yüzeyleri tek tip boyalı görünüyor. C21R yeni nesne üretmeden mevcut panel yüzeylerini iyileştirir. Mevcut ana mimari, yarış mekaniği, orijinal mor kutular ve meteorlar korunur.

## Uygulama — yalnızca vertex rengi
- **8 eski `wreckageModules`** (CENTER_ONLY / TOP_ONLY / BOTTOM_ONLY): her biri orijinal **16 çocuk** ve **4 katı `WRECK_BOX` çarpışma paneli** ile aynen kalır; toplam **32 gerçek fizik paneli** ve `opening.hx=116`, `opening.hy=78/98`, `halfDepth=82.5` sabittir.
- Her geçitte 4 büyük gövde paneli, 4 öndeki zırh plaka, 2 dikey ince rib, 1 mevcut anten: **11 metal `BoxGeometry` × 8 = 88**. Her birinin aynı **24 vertex** (`4×6` yüzey) konumlarına yalnız `color` attribute eklenir.
- 6 yüzey için taş/metalimsi ton `[1.04,.86,1.08,.83,.98,.90]`, çok hafif üst/alt düşüş. `MAP1_C21R_GATE_FACE_TONES` sabitiyle kolay geri alınabilir. Aynı C21I `64×64` `courseWreckPaint`, aynı PBR renk, pürüzlülük, metalness değerleri, aynı paylaşımlı `hull` ve `plating` materyalleri; yalnız `vertexColors=true`.
- **4 adet turuncu uyarı kutusu** ve **1 camgöbeği kapı outline çizgisi**, geçiş açıklığının biçimi, enkaz silueti, bütün 32 collider, bölümlerin rotadaki yeri tamamen aynı. Yeni model, mesh, poly, texture, light, shader, particle, RNG, render pass veya drawcall eklenmez.
- Eski 49 mor ödül kutusu, 320 meteor, 97 bariyer, 192 koridor halkası/10 batch, SB07 189 parça, Map4 249 parça ve 6/36/200 fizik korunur.

## Gerçek browser kabul testi
- `tests/map1-next11c21r-wreck-gate-facets.cjs`: Chromium/SwiftShader 1600×900 **gerçek oyun yarışı kamera açısı**. Üç eski enkaz modülünü tüm üç geçiş tipiyle birlikte yalnızca ölçüm için 570/1130/1750 birim mesafede sahneye yerleştirir; önce C21Q gibi nötr vertex pigmenti, sonra C21R face depth. Aynı objeler/geometri/kamera/ışıktaki A/B görüntüleri, delta piksel, drawcall eşitliği, WebGL 0 error. Sonrasında renk, konum, rotasyon ve görünürlük tümü geri alınır.
- Tüm 88 metal `BoxGeometry` için eski `new THREE.BoxGeometry(width,height,depth)` ile **position vertex farkı sıfır**; 8×16 çocuk, 8×4 panel collider, uyarı çizgileri, Map4 görünmezliği ve dönüş doğrulanır.
- Dedicated workflow: C21Q/P/O/N/M/L/K/J/I/H/G6 + C20O/P/Q/R ve SB07 regresyonları; tam çevrimdışı tek HTML. Ayrıca kapsamlı Map1/Map4 browser smoke.
- Kullanıcı gerçek ekran görsel kalite onayı, native GPU FPS, yayıncı en az 3 oynanabilir harita ve `main` merge açık kullanıcı izni **ayrı kapılar**.

## Çalışma kuralı
PR **stacked DRAFT**. Test sonucu netleşmeden genel smoke PASS denmez. Önceki C21Q smoke [#44906535629](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44906535629) son kontrolde henüz sürmekteydi.
