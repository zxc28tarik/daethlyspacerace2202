# NEXT11C20P — Harita 1 mesafesel koridor çizgisi netliği

Tarih: 19 Kasım 2026. C20O / PR #80 üzerine yeni taslak geliştirme. Merge için kullanıcı açık onayı gerekir.

## Dar kapsam ve teknik uygulama
- Harita 1: özgün 16 uzunlamasına ray, aynı 50km rota ve aynı 115m örnek aralıklarıyla korunur. 16 tek-parça Line yerine 20 adet 2500m LineSegments grubuna dönüştürülür; beklenen toplam 6960 özgün segment ve 13920 buffer vertex.
- Raylara rota mesafesi attribute eklenir. GPU fragment alpha, oyuncunun state.routeProgress değerine göre yumuşak solar: 900–4600m, uzakta 0.12 taban katsayısı.
- C20O 192 halka 10 batch olarak kalır. 153 ince mavi halka GPU fragment alpha ile 600–3000m uzakta solar; taban .08. 39 büyük turkuaz kılavuz halka ve 16 amber/kırmızı fizik sınır çizgisi korunur. Rota ve çarpışma geometrisi değişmez.
- Rehber grup çocuk çizim sayısı önce 10 ring +16 rail +16 border =42, şimdi 10 ring +20 rail batch +16 border =46. Bu sayı draw-call/FPS kazancı kanıtı değildir. Daha yerel frustum culling ve daha az uzaktaki görsel gürültü hedeflenir.
- SB-07 189 orijinal builder parça, 7 opaque batch+2 sprite, dikey wingtip ve iki motor değişmez. Harita1 saf yarış/silah kapalı. Harita4 B-04 249 parça, 6+36+200 collider, AI ve kamerası değişmez. Yeni dekor ve ekstra fizik yok.

## Kabul kapıları
- tests/map1-next11c20o-corridor-clarity.cjs: aynı orijinal halka geometri kontrolü ve yeni doğru grup sayısı.
- tests/map1-next11c20p-distance-clarity.cjs: gerçek Chromium/Three r128 WebGL; 20 grup, 6960 ray segmenti, tüm routeDistance attribute, 192 halka, oyuncu progress uniform değişimleri, iki gerçek 720p frame ve Map4 collider doğrulaması.
- .github/workflows/map1-next11c20p-distance-clarity.yml özel test; map-browser-smoke.yml kapsamlı regresyon.
- Her iki test son HEAD üzerinde PASS değilse başarı ilan edilmez. Native GPU FPS, 1080p/p95, 5dk oyuncu ve estetik değerlendirme ayrıca açıktır.

## Referans ve sıradaki adım
- Önceki C20O gerçek Chromium QA başarı: https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44524729348
- Önceki başarılı C20O tam smoke: https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44524333375
- NEXT11C20Q: görüntülerde uzak koridor çizgisi/2.5km sınır geçişi, draw calls ve tam test sonucu değerlendir; yalnız gerçek gereksinim varsa hedefli düzeltme. NO MERGE.
