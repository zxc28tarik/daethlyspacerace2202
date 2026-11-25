# MAP2-41–46: Dünya ve şehir ölçeği revizyonu (25 Kasım 2026)

Kullanıcı geri bildirimi: yol havada; gerçek dünya zemini yok; yan binalar kopuk; merkez mimari geçişler anlaşılmıyor; pist dar. Subway Surfers yaklaşımı: yönü çizgiler değil mimari tarif eder.

## Korunanlar
175 km tek tur, iki FAST bölgesi (%15 + %10), KEEP IT LOW devriye kuralı, Map4 kaynakları ve diğer haritalar. FAST merkezine engel eklenmez.

## MAP2-41: altyapı — kaynak koduna uygulandı, tarayıcı QA bekleniyor
- Harita tamamını, çevresiyle birlikte kaplayan yatay dünya zemini; eski yapay yol şeridi değil.
- Önceden var olan temeller üst yüzlerini koruyarak ortak zemin seviyesine kadar uzatılır.
- Harita 4'ün orijinal şehir kulelerinin gövde/taç geometri ve materyalleri iki tarafta ikişer kademede instancing ile kullanılır. Yakın sıra geçiş hacmi dışında. FAST bölgelerinin yanında da şehir var.
- Harita 2 yatay uçuş sınırı iki katı, dikey sınır ve devriye yüksekliği aynı. Eski açık sektör kenar çizgileri kaldırıldı.
- Haritanın başlangıç/bitiş birleşiminde görünürlük devam eder.
- Ölçek seçimi ilk denemedir; gerçek uçuş görüntüleri, kapı geçişleri ve performans görülmeden onaylanmış sayılmaz.

## MAP2-42: merkez şehir mimarisi
Orijinal Map4 yapı kümeleri arasındaki geçitleri genişleyen gerçek hacme göre tekrar kur. Bina kütleleri yolu oluşturur, 2-3 seçenekli ayrımlar ve okunabilir giriş/çıkış. Dış dekor şeritleri merkez engellerin yerine geçmez.

## MAP2-43: doğal rota okuması
Girişten sonraki açıklık görünür; sahte çizgiler yerine paralel cepheler, köşelerde cephe yönelimi ve doğal siluet. Olası rota her zaman en az bir gerçek geçişle bağlanır. FAST alanında açık şehir kanyonu.

## MAP2-44: fiziksel engel ve alternatif yol tutarlılığı
Genişleyen alanın bina dışından kestirme kaçışa dönüşmesini engelle; fiziksel yapı/rota açıklığı birbiriyle tutarlı; yan yapılar yaklaşılabilir olacaksa collider ekle. Gemi boyutu ve fren mesafesiyle clearance doğrula.

## MAP2-45: rakipler ve performans
Genişliğe uygun bot rotaları, şerit seçenekleri, keskin dönüş frenlemesi; culling, LOD, FPS ve draw call ölçümleri. Yeni mimariyi Map4'e taşımadan çalış.

## MAP2-46: gerçek oyuncu kamerası ile kabul
Başlangıç, iki FAST bölgesi, çok geçitli fabrika, şehir dönüşü, bitiş; ekran görüntüleri ve tam tur testi. Oyuncu görüşünün boş kalmadığı ve yolun yapılarla anlaşıldığı görsel olarak değerlendirilmeden tamamlandı denmez.
