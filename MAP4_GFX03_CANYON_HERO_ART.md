# Harita 4 — GFX-03 / İlk Üç Kanyon Anıtının Heykelsi Sanat Geçişi
Tarih: 20 Ekim 2026
Başlangıç: GFX-00 + GFX-02 main `621a0668c4c4045b64f83f77c483c18020820694`

## Bu dalgada yapılanlar
- Kızıl Kaya Kapısı: bir üçgen-kutu kombinasyonu daha yerine gerçek boşluk içeren, kenarları düzensiz extruded büyük doğal taş kemer, kalın temel taşları, erozyon tabakaları ve kaya destekleri.
- Kırık Mesa: sekiz GFX-02 kaya geometrisi yeniden kullanılarak çok parçalı plato ve farklı seviyelerde sediment basamakları; farklı silüet veren ikinci/üçüncü kaya kütleleri.
- Kanyon Gözleme: yüksek yapısal gövde, metal taşıyıcılar, açık platform, gerçek 3D radar çanağı ve mercek; çevresinde aşınmış kaya temelleri.
- 7 yeni paylaşılmış geometri tipi; çoğu GFX-02 rock variant ve VQ04 map atlası yeniden kullanıyor. Materyal paleti canyon sandstone, kaya, şist, çelik, pirinç, cam, işaret lambası.
- GFX-03 grupları mevcut 3 W01 landmark parent altında kalır; bölgesel görünürlük / landmark HUD olduğu gibi.
- Sıfır yeni çarpışma. Zorunlu W03 6 kaya geçidi collider'ı, 36 W05 endüstri collider'ı ve +18% / +12% rota bonusları değiştirilmez.
- Harita 1'e geometri/ışık/materyal sızıntısı yok; yapılar yalnız Map4 planetary group içinde.
- 12 sabit görsel karşılaştırma karesine ilave 3 yakın hero odak karesi: `hero-stonegate.png`, `hero-mesa.png`, `hero-observation.png`.

## Eksikler ve dürüst kalite sınırı
Bu hâlâ Three.js procedural artist mesh'lerinin bir aşamasıdır: özgün Blender/GLB dosyası, el boyaması texture atlası, gerçek GPU FPS kanıtı henüz yoktur. VQ02'nin eski temel geometrileri tamamen sökülmedi; GFX-03 yeni büyük heykelsi silüeti ekler. Estetik puanını test PASS üzerinden sayı olarak vermiyoruz. Bina/tepe kütlelerinin oyuncu kamerasında daha iyi görünmesi gerçek görüntü onayı gerektirir.

## Doğrulama
- `tests/map4-browser-smoke.cjs`: tam görev ve 3 hero detayları, gerçek geometrik kapı deliği, materyal farklılığı, collider sayıları, restart ve Map1 regresyonu.
- `tests/map4-art-baseline.cjs`: 12 önceki kadrajı aynı kurallarla saklar, 3 ilave hedef kadrajı üretir, renderer.info metriklerini kaydeder.
- CI PASS ardından main merge, HTML release commit kimliği doğrulaması.

## Sıradaki üretim
- GFX-01 gerçek GLB/atlas import + cache + tek HTML paketleme sisteminin uygulanması.
- GFX-03 ileri aşama: üç hero anıtın eski geometrilerini kontrollü değiştirerek azaltmak, görünürlük LOD ve draw-call optimizasyonu, gerçek doku atlasları.
- GFX-04: üç cepheli savaş ovasında kruvazör ve savunma hatlarının özgün sanat geçişi.
