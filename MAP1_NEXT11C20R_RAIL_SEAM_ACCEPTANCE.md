# NEXT11C20R — 2,5 km uzun ray grup birleşimlerinde süreklilik / WebGL kabulü

**19 Kasım 2026 · C20Q / PR #82 üzerine stacked draft. Kullanıcı açık izin vermeden merge YOK.**

## Neden
C20P/C20Q ile Harita1'de 16 özgün 50km boyuna ray, her 2.5km'de frustum için yerel gruplanan 20 LineSegments çizim nesnesine taşındı. Aynı ShaderMaterial routeDistance/routeProgress kullanıldığı için teoride kesintisizdir. Ancak gruplar arasında gerçek 3D nokta, yol mesafesi veya materyal fade farkı varsa hızda görünür çizgi kopması/titreme yapabilir.

## Bu aşama ne yapar?
- **Yeni dekor yok. Oyunun gerçek 3D kodu değişmedi.** Yalnız gerçek oyunu açan WebGL doğrulaması eklendi.
- tests/map1-next11c20r-rail-seams.cjs, 19 ayrı komşu grup sınırı ×16 özgün ray = **304 birleşimde** ilk/son LineSegments vertex'ini karşılaştırır; mesafe ve konum hatası 0.0001 birimin altında olmalıdır.
- 20 sektörün original toplam **6960 çizgi segmenti**, her biri 16 raya bölünebilen batch, 20 yerel frustum bounding sphere, rota 0 ve 50.000 uç koordinatları korunmalıdır.
- Ortak uçları tek shader/fade ile 3 oyuncu ilerleme örneğinde inceler. Bu test yalnızca **geometri kaynaklı kopma/brightness discontinuity** için kesin kanıttır; gerçek oynanış 5dk titreme kontrolünün yerini tutmaz.
- 2500, 12500, 27500 ve 47500 rota sınırlarında **-15m/+15m** sahnede gerçek Chromium/SwiftShader 1280×720 gl.readPixels ekranları (8 PNG), GL errors ve çizim çağrıları raporlanır. Bu görüntüler farklı konum/pozisyon kadrajlarıdır, GPU FPS karşılaştırması değildir.
- Harita 1 yarış sistemi, gemi SB-07 189 primitive; Harita4 B-04 249 primitive ve [6,36,200] collider, bot/harita/görev güvenliği kontrol edilir.
- Ayrı .github/workflows/map1-next11c20r-rail-seams.yml ve tam Map1/Map4 browser smoke yeni R testini yürütür.

## Kabul kapısı
- Özel son-head gerçek WebGL CI PASS + JSON + gerçek 8 frame.
- Tam browser smoke CI PASS ayrıca kontrol edilecek.
- Yerel ekran kartı native FPS/p95, 5dk oynayarak görsel hareket/alias titreme ve görsel kalite onayı açık.
- **Rapor test bitmeden PASS kabul edilmez.** Eğer 304 ek yerinde geometri/distance hata yoksa, fizik veya sahne kodu gereksiz değiştirilmez.

## Sonraki NEXT11C20S
Test sonucu ve ekran görüntülerinde gerçek problem yoksa bu çizim katmanını stabil ilan et, sonraki saf çizgi/anti-alias kalite bütçesini tartış; mikro dekor veya yapay parça artışı yok. Hata varsa yalnız bu noktalara hedefli fix ve tekrar karşılaştırmalı QA. PR izinsiz birleştirilmez.
