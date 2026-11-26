# NEXT11C21H — Harita 1 meteorleri, model ve oyun mekanikleri korundu

Kullanıcı kararı: eski kutuları ve eski engelleri koruyup sadece görsel niteliklerini artırmak. C21G6 mor kutu olduğu gibi kaldı; bu aşamada meteorlerin YALNIZ görünümü yenilendi.

- Mevcut 320 meteorun DodecahedronGeometry(radius, 1) ve tüm vertex konumları değişmedi; gerçek radius ve çarpışma, rota, dayanıklılık ve yapay zekâ aynen duruyor.
- Üç boyut sınıfında farklı doğal taş tonları, daha yüksek yüzey pürüzlülüğü, çok düşük metalik yansıtma.
- Her mevcut yüz için deterministik mineral pigment katsayıları. Math.random çağrısı yok, mesh ve triangle sayısı aynı.
- Neon mavi kenar çizgisi daha yumuşak taş konturuna döndürüldü. Her meteroide hâlâ yalnız 1 kaya mesh + 1 line segment.
- 49 eski mor kutu, 189 parçalı SB-07, Map4 249 parçalı savaş gemisi değişmedi.

## Test
Native gerçek Chromium/Three r128 1600x900 WebGL A/B: solda eski meteor, sağda aynı vertexlerle yenilenmiş yüzey; her boyuttan bir örnek.
Beş gerçek meteorun vertex değerleri orijinal geometrisiyle birebir karşılaştırılır, 320 class ve eski kutu korunması doğrulanır.
Gerçek oyun kamerasında tek meteor yalnız QA için geçici sahnelenir, ardından konumu iade edilir. Harita4 fizik regresyonu.
Dedicated workflow + full Map1/Map4 smoke + tek dosya offline playable HTML derlemesi.

Bu dal #103 üzerine taslak PR'dır. Main'e kullanıcı açık onayı olmadan merge yapılmaz.