# Harita 4 — GFX-00 / GFX-02 İlk Uygulama Raporu
Tarih: 20 Ekim 2026
Kaynak: VQ04 main 27d8b9b68f931c777bf860462b82ae3c6b989cd1 (yalnız plan commit'i dahil)
Durum: GFX-00 ölçüm altyapısı + GFX-02 **ilk kanyon çevresi dalgası**. Master plandaki GFX-02 ve GFX-03 tamamen bitirilmiş değildir.

## GFX-00: Doğrulanmış karşılaştırma tabanı
- 1600 x 900 yazılımsal Chromium/SwiftShader, 12 sabit kamera/ilerleme/irtifa kadrajı.
- Karşılaştırma başlangıcı (saf VQ04): 12/12 screenshot ve metrik üreten test PASS, GitHub run 39391332846.
- Başlangıç JSON konsol özeti: canyon terrain 7680 vertex, medyan 397 draw call, medyan 29406 üçgen. Bunlar GPU için hedef FPS **değil** ve kullanıcı bilgisayarındaki performansı temsil etmez.
- Kontrol edilen 12 sahne: kanyon giriş/mesa/çıkış, merkez/enkaz/elit arena, sanayi giriş/fabrika/çıkış, karakol/uzay limanı/son yükseliş.
- Test dosyası tests/map4-art-baseline.cjs; artefakt arşivi tests/art-baseline/*.png + metrics.json; CI map4-fixed-art-baselines.
- Her yeni sürümde aynı seed/progress/yerel kamera/viewport ile kıyaslanabilir renderer.info metrikleri ve 12 kare yeniden alınır.

## GFX-02 ilk uygulama: görünen dünya değişiklikleri
- Yalnız kanyonun terrain yüzeyi 80x16 -> 160x40 grid (7680 -> 38400 position vertex), yakın ve uzak ölçekli erozyon/katman/shelf eğrileri. Ana uçuş koridoru altında dekoratif zemin kalır, fiziksel çarpışma eklenmez.
- 8 farklı stratifikasyon/erozyon geo varyantı; vertex renkli sediman bantları ve normal/roughness dokuları.
- Vadi boyunca her iki yakada toplam 28 büyük, ölçeği değişen katmanlı mesa/dağ kütlesi; tümü hedef uçuş sınırları dışında, visualOnly=true ve benzersiz, tek kez kurulur.
- Mevcut 3 kaya geçidi / 6 collider, hız bonusu +%18 ve gerçek hedef avı korundu.
- Harita 1 neon dünyası/gemi/kamera/render ayarı değiştirilmedi.
- Arena, sanayi ve üs geometri yoğunluğu bu dalgada değiştirilmedi; sonraki paketlerde farklı özgün model kitleriyle genişletilecek.

## GFX-02 teknik test kapısı
- Sadece kanyon zemini 38400 vertex, 28 görünür ayrı mesafe kayası ve 8 unique geometri.
- Kayaların kenarları ilgili ilerlemede MAP4 maxFlightRadius dışında; hiçbir yeni collider oluşmaz.
- GFX-00 12 kamera ekran görüntüsü, GPU kaynak sayısı ve draw-call metrikleri.
- Mevcut smoke: Harita 1/4 switch, arena 60sn, avcı puanı, 36 sanayi collider, 6 canyon collider, yeniden başlatma, 850+ bitiş, 300sn limit.
- 1080p gerçek FPS henüz ölçülmedi; SwiftShader yavaş çalışabilir, oyun PC performansı hakkında bu sonuçlardan iddia üretmeyin.
- Arazi detayının estetik puanı / kullanıcı onayı açık. Bu bir prosedürel VQ geçişidir, özgün lisanslı/profesyonel GLB model seti henüz değildir.

## Sonraki işler
1. GFX-01 özgün GLB/atlas yükleyici ve paketleme denemesi.
2. GFX-02 yakın/orta kaya kitleri, terrain LOD/drawcall optimizasyonu ve 3 gerçek rota için kadraj seçimi.
3. GFX-03 Kızıl Kaya Kapısı, Kırık Mesa Sırtı, Kanyon Gözleme ana hero asset dönüşümleri.
4. Kullanıcıya oynanabilir HTML + aynı kadrajda önce/sonra + gerçek cihaz FPS notu.
