# MAP2-41–46: Dünya ve şehir ölçeği revizyonu (25 Kasım 2026)

Kullanıcı geri bildirimi: yol havada; gerçek dünya zemini yok; yan binalar kopuk; merkez mimari geçişler anlaşılmıyor; pist dar. Subway Surfers yaklaşımı: yönü çizgiler değil mimari tarif eder.

## Korunanlar
175 km tek tur, iki FAST bölgesi (%15 + %10), KEEP IT LOW devriye kuralı, Map4 kaynakları ve diğer haritalar. FAST merkezine engel eklenmez.

## MAP2-41: altyapı — Chromium/WebGL QA geçti
- Harita tamamını, çevresiyle birlikte kaplayan yatay dünya zemini; eski yapay yol şeridi değil.
- Önceden var olan temeller üst yüzlerini koruyarak ortak zemin seviyesine kadar uzatılır.
- Harita 4'ün orijinal şehir kulelerinin gövde/taç geometri ve materyalleri iki tarafta ikişer kademede instancing ile kullanılır. Yakın sıra geçiş hacmi dışında. FAST bölgelerinin yanında da şehir var.
- Harita 2 yatay uçuş sınırı iki katı, dikey sınır ve devriye yüksekliği aynı. Eski açık sektör kenar çizgileri kaldırıldı.
- Haritanın başlangıç/bitiş birleşiminde görünürlük devam eder.
- Ölçek seçimi ilk denemedir; gerçek uçuş görüntüleri, kapı geçişleri ve performans görülmeden onaylanmış sayılmaz.

## MAP2-42: merkez şehir mimarisi — Chromium/WebGL QA ve tam yarış regresyonu geçti
- MAP2-41 ile iki katına çıkan yatay alanın TECH bölümlerine orijinal Map4 şehir bina gövde/taç geometrilerinden yoğun yakın cephe eklendi.
- Yakın cephe yaklaşık 430 m görsel ritimle ilerler; sağ/sol geri çekilmeleri küçük ve asimetriktir, böylece oyuncu sürekli bina dokusu görür ama steril tekrar hissi azalır.
- Fizik daha seyrek toplulaştırılmış bina hacimleriyle çalışır; görsel yoğunluğu bire bir collider sayısına çevrilmez ve FPS maliyeti sınırlanır.
- Mevcut gerçek bina açıklığı ana rotası ve doğrulanmış 2-3 kollu alternatif geçitler korunur. Yeni bir bina hacmi bu hatlardan birine değerse dışarı itilir; hâlâ çakışıyorsa hiç eklenmez.
- FAST bölgelerine yeni fiziksel bina engeli eklenmez. Dışarıdan kestirme kaçış azaltılırken iki tam gaz bölgesi korunur.
- Harita 4 kaynakları değiştirilmez; yalnızca geometri ve materyal referansları yeniden kullanılır.
- Doğrulanan son ölçüm: 568 yakın bina örneği, 188 fiziksel yan cephe collider'ı, ana rota çakışması 0, alternatif geçit çakışması 0, FAST fiziksel engeli 0.
- MAP2-41, MAP2-40, MAP2-39 ve KEEP IT LOW tam yarış regresyonları aynı commit üzerinde PASS.

## MAP2-43: doğal rota okuması
Girişten sonraki açıklık görünür; sahte çizgiler yerine paralel cepheler, köşelerde cephe yönelimi ve doğal siluet. Olası rota her zaman en az bir gerçek geçişle bağlanır. FAST alanında açık şehir kanyonu.

- Uygulama (MAP2-43): MAP2-41 yakın dış şehir sırası gerçek sağ/sol ofset eğrisinin kiriş yönüne çevrildi; viraj içi siluet alçaltıldı, dışı yükseltildi. Sektör girişlerinde yüksekliğe yumuşak geçiş eklendi.
- Aynı Map4 gövde ve taç geometrileri, aynı instancing grupları; yeni fiziksel FAST engeli yok. Mevcut iç TECH mimarisi ve geçit kolları değişmedi.
- Yerel örnekleme ile genişletilmiş uçuş zarfı kontrolü ve her iki FAST giriş/çıkışı için gerçek kamera ekran görüntüsü noktaları QA'ya eklendi.
- Durum: kod ve test kaydedildi; yeni commit için Chromium/WebGL sonucu ve insan gözüyle rota okunabilirliği henüz doğrulanmadı. MAP2-44'te görsel/fiziksel hacim eşleşmesi ayrıca ele alınacak.

## MAP2-44: fiziksel engel ve alternatif yol tutarlılığı
Genişleyen alanın bina dışından kestirme kaçışa dönüşmesini engelle; fiziksel yapı/rota açıklığı birbiriyle tutarlı; yan yapılar yaklaşılabilir olacaksa collider ekle. Gemi boyutu ve fren mesafesiyle clearance doğrula.

## MAP2-45: rakipler ve performans
Genişliğe uygun bot rotaları, şerit seçenekleri, keskin dönüş frenlemesi; culling, LOD, FPS ve draw call ölçümleri. Yeni mimariyi Map4'e taşımadan çalış.

## MAP2-46: gerçek oyuncu kamerası ile kabul
Başlangıç, iki FAST bölgesi, çok geçitli fabrika, şehir dönüşü, bitiş; ekran görüntüleri ve tam tur testi. Oyuncu görüşünün boş kalmadığı ve yolun yapılarla anlaşıldığı görsel olarak değerlendirilmeden tamamlandı denmez.
