# NEXT11C20U — SB-07 contoured one-piece motor kaportası / görsel kabul

**19 Kasım 2026 · Orijinal 1x MSAA kullanıcı tarafından açıkça en iyi olarak seçildi.**
Bu çalışma yalnız geminin **gerçek geometrik çizgi ve yüzey kalitesine** odaklanır; FPS ve süpersampling optimizasyonu hedef değildir.

## Doğrudan değişen görünüm
- SB-07 ZENİT'in iki motor üstünde eski dikdörtgen tek-kutu HULL kaportaları artık **aynı uzunluğu ve dar silueti koruyan**, 6 istasyonlu, yuvarlatılmış omuz geçişli, kapalı **3B aero-spine kabuk**. Boyuna eğim, burun bağlantısı ve arka kaporta yüksekliği tutarlı olarak değişir; artık ayrı kutu görünümü yok.
- Her kaportanın kırmızı şeridi daha önce kendi düz kutusu olarak gövdeden öne uzuyor (z=.04, alttaki kutu z=.36). Yeni kırmızı şerit **aynı yüzeyin gerçek yükseklik fonksiyonundan** örneklenip yalnız .014 birim yükseliyor; tüm 6 örnek boyunca kaportaya yatıyor. Boyuna boya z=.34 ila 2.13; ayrık boya ucu kaldırıldı.
- Geometri hala **iki tarafta sadece birer HULL ve RED emit**. 189 toplam kaynak parça, 7 malzeme batch + 2 glow, çift motor, geniş kanat ucu dikmeleri, silahsız Harita1 korunuyor; sırf süs olsun diye ek mesh yok.
- WebGL antialias/rasterize parametreleri, normal 1.00x MSAA, ışık/texture renkleri, hud, kamera, state güncellemesi ve diğer bütün sahneler **dokunulmadı**.

## Kabul: gerçek oyun ve yüzey
- `tests/map1-next11c20u-contoured-spines.cjs`: normal SB-07 modelini kullanıp 30 ayrı roof/paint aynı koordinat raycast ile gerçek yüzey mesafesini ölçer (0.008–0.024 birim). Şerit fazladan öne uzamamalı, 6 istasyon, 2 kavisli kaporta, 2 kırmızı boya, 189/249 parça, 7 batch, AA ve Map1 koruma şarttır.
- Gerçek `THREE.WebGLRenderer`/Chromium/SwiftShader ile **1600x900 dört ayrı açı**: ön, arka, arka-çapraz, üst, RGB framebuffer `gl.readPixels`; GL error sıfır ve gerçek 7 batch +2 glow bütçesi. Yeni görüntüler **gerçek oyuncu kamerası değil, gemiyi değerlendirmek için stüdyo kadrajlarıdır**.
- Aynı akışta `tests/map1-next11c20-sb07-zenit.cjs` (orijinal karakter/siluet/normal-boost uçuş testleri) ve `tests/map1-next11c20r-rail-seams.cjs` (304 birleşim) de tekrar; Map4 B-04 249 parça/[6,36,200] collider/comb at visible korunur. Full `map-browser-smoke.yml` T üzerinden yürümeye devam eder.
- Son HEAD gerçek WebGL özel ve kapsamlı smoke tamamlanmadan tüm projenin PASS olduğu söylenmez; fiziksel GPU FPS ayrı, kullanıcı estetik kararı esas.
- Önceki 1.25/1.5/2x AA denemeleri yalnız tarihsel QA verisidir; kullanıcı 1x'ı seçtiği için kalıcı grafik modu olmayacak.

## Sonraki NEXT11C20V
Bu geometriyi gerçek ekranlar üzerinde görsel olarak kabul ettikten sonra kanat bağlantı/üst yüzey çizgilerine aynı **parça eklemeden kaliteli loft + birleşik yüzey** yaklaşımını uygula; görsel kalite ana hedef, FPS yalnız bozulmama kapısı. Draft PR'ları kullanıcı açıkça onaylamadıkça birleştirme.
