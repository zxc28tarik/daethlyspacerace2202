# NEXT11C20S — Harita 1 gerçek WebGL 720p/1080p çizgi kenarı ve hareket titremesi bütçesi

**19 Kasım 2026 · C20R PR #83 üzerine stacked DRAFT · açık izin olmadan merge YOK**

## Ölçüm kararı
- Mevcut renderer `new THREE.WebGLRenderer({ canvas:gameCanvas, antialias:true })` ile zaten native WebGL MSAA ister. Ek global FXAA/blur/DOF ile tüm oyunun ve nişangâhın bulanıklaştırılması kesin tasarım kısıtına aykırı. Test yapmadan supersampling açmak da GPU maliyetini artırır.
- **Bu aşamada production index.html değiştirilmedi**. Saf görsel/performans kabul altyapısı geliştirildi. Amaç çizgilerin gerçekten aliasing/titreme problemi yaşayıp yaşamadığını ve olası çözümün maliyetini karar verilebilir kılmak.

## Gerçek A/B protokolü
- `tests/map1-next11c20s-msaa-shimmer-budget.cjs`: GitHub Actions Chromium / gerçek Three.js r128 / SwiftShader WebGL üzerinde **aynı geometri, aynı kamera, aynı 12500m ve 27500m uçuş konumu**.
- 720p (1280×720) ve 1080p (1920×1080) için 1x orijinal WebGL MSAA framebuffer ile 2x en/boy iç çözünürlükten Canvas2D yüksek kaliteli küçültme referansı. **2x sadece testte; gerçek oyunda açılmaz.**
- Her durumda kamera progresi **-6 / 0 / +6 metre**. Her iki çıktı için GL readPixels, render/gl.finish zamanları, draw-call / line / triangle sayısı, fiziksel WebGL antialias context flag, ışıklı piksel yoğunluğu, bitişik hareket karesindeki RGB parlaklık değişimi (shimmer proxy) ölçülür. 4 orijinal-vs-supersample görüntü karşılaştırma dosyası ve JSON rapor.
- Bu piksel değişim ölçümü görüntü hareketini de içerir; yalnız çizgi titremesini izole eden nihai fiziksel GPU/TAA ölçümü değildir. SwiftShader CPU render süresi =/= oyuncunun ekran kartı FPS'si.
- Referans 2x her zaman daha iyi sonuç verir varsayımı **test assertion değil**; farklar ve maliyet ölçülür, karar verilir.

## Geçmiş korumalar
- C20R 19×16=**304** birleşim konum ve rota hatası sıfır; toplam **6960** özgün ray segmenti, 20 batch, 192 ring / 10 batch korunur.
- SB-07 **189** oluşturucu parça, iki motor/dikey wingtip, saf Harita1 yarış; Harita4 B-04 **249** parça, [6,36,200] collider, AI/kamera/fizik/oyun kuralları korunur.
- Özel Chromium WebGL testinde C20R tekrarı ve 720/1080p S benchmark'ı birlikte çalışır; tam `map-browser-smoke.yml` de dalı ve S testini içerir.

## Açık koşullar / sonraki NEXT11C20T
- Özel S ve tam browser smoke son HEAD CI, gerçek PNG/JSON görüntü analizi, görsel kabul ve yerel native GPU FPS/p95.
- Ölçülebilir kalite artışı ve kabul edilebilir native performans kanıtı olmadan supersampling **kalıcı açılmaz**.
- NEXT11C20T: sonuçlara göre Harita1 için gerekirse sınırlı, seçici çizgi kenarı düzeltmesi tasarla; körlemesine global filtre veya yeni mikro dekor ekleme yok.
