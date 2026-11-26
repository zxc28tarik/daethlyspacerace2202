# MAP2 — Bina Dizilimi, Boşluklar ve Kontrollü Kaos Ana Planı

## Ana ilke
MAP2 artık “rota çiz, kenarına bina koy” mantığıyla ilerlemeyecek.

**Yeni sıra:** bina kompleksi → gerçek boşluk/geçit → rota.

Map4’ten kopyalanmış gerçek endüstriyel mimari rota geometrisini tanımlar. Görünmez asfalt/merkez yol yalnız ilerleme matematiği için kalabilir; oyuncuya yol olarak gösterilmez.

## 1. Makro sektörler
175 km rota yaklaşık 10–14 farklı karakterli sektöre ayrılır. Sektörlerin uzunlukları eşit olmak zorunda değildir. Yoğun fabrika, rafineri, servis sahası, çoklu rota kompleksi, KEEP IT LOW bölgesi, açık hız bölgesi vb. karakterler kullanılır.

## 2. Mimari bloklar
Her sektör 600–1600 m civarı küçük mimari bloklara ayrılır. Bir blok tek bina değildir; birkaç gerçek Map4 yapısının birlikte oluşturduğu uçuş problemidir.

## 3. Blok rolleri
Kullanılabilecek roller: koridor, daraltıcı, şikan, kör köşe, bina içi geçiş, alt geçit, üst bağlantı, açık avlu, çoklu geçit kompleksi ve kontrollü kaos.

## 4. Tek / çift / üçlü geçit
Rehber oran:
- %55–65 tek geçit
- %20–25 çift geçit
- %8–12 üçlü geçit
- yaklaşık %10 açık/karmaşık serbest alan

Bu oranlar katı matematik değildir. Haritanın ritmi gerektiğinde sistem dışına çıkabilir.

Çift/üçlü geçitler gerçek seçenekler olmalıdır. Aynı yolun kopyaları olmayacak:
- kısa + dar
- uzun + güvenli
- üst + hızlı ama KEEP IT LOW/devriye riski
- alt + teknik ama korunaklı

## 5. Sahte açıklık yok
Geçit gibi görünen açıklık mümkün olduğunca kullanılabilir olmalıdır. Kullanılamayan yer görünmez duvarla değil gerçek fiziksel nedenlerle kapatılır: boru, kapı, makine, kolon, ızgara, servis parçası vb.

## 6. Kontrollü kaos
Yaklaşık %70–80 kontrollü tasarım, %20–30 kontrollü kaos hedeflenir.

Kaos bölgelerinde:
- simetri kırılır,
- bina açıları aynı olmaz,
- bir geçit sonradan daralabilir,
- yapı kütleleri birbirinin önünü kısmen kapatabilir,
- servis yapıları ve borular düzensiz yerleşebilir,
- bina aralıkları eşit olmak zorunda değildir.

**Kural:** görsel kaos oynanış bozukluğu değildir. Oyuncu ve AI için gerçek güvenli hat kalmalıdır.

## 7. Simetriyi kır
Sürekli “bina — merkez yol — bina” kompozisyonu yasaktır. Merkez hattı sürekli açık bırakmak yerine binalar bazen sola, bazen sağa, bazen merkeze taşar ve uçulabilir boşluğu kendileri oluşturur.

## 8. Boşluk rolleri
Boşluklar da tasarım elemanıdır:
- uçuş boşluğu
- karar boşluğu
- hız boşluğu
- nefes boşluğu

Boşluk bina konulmayan rastgele alan değildir.

## 9. Boşluk ritmi
Açıklık genişliği tek tip olmayacak. Örnek: geniş → orta → dar → orta → çok geniş. Uzun süre ardışık aynı genişlikte dar koridor kullanılmayacak.

## 10. Sert dönüşler
Keskin dönüşü spline değil bina kütlesi yaratmalı. Büyük yapı görüşü keser, yaklaşınca yeni geçit açılır, sonraki yapı oyuncuyu ters yöne geri yönlendirir.

## 11. Görüş mesafesi
Uzun, orta ve kısa görüş bölümleri bilinçli dağıtılır. Kaotik tesislerde sonraki geçit bazı yerlerde köşeyi dönene kadar görünmez.

## 12. Çoklu geçit birleşmeleri
Alternatif yollar bazen 300–500 m sonra, bazen 1–2 km sonra birleşebilir. Alternatif rotadaki rakip zaman zaman diğer açıklıktan görülebilmelidir.

## 13. KEEP IT LOW bağlantısı
Üst rota otomatik avantaj değildir. Daha hızlı/açık olabilir ama devriye riski artar. Alt rota daha teknik ama korunaklı olabilir.

## 14. Bağlantı sınıfları
Mevcut kısa bağlantılar üçe ayrılır:
- doğrudan mimari devam
- kısa servis bağlantısı
- bilinçli açık boşluk

Her iki bina arasına zorunlu platform koyulmaz.

## 15. Zemin sistemi
MAP2-29B/29C tabanı korunur:
- sürekli asfalt yok,
- yapı/rota Y konumu gereksiz yere oynatılmaz,
- yerel kompakt destekler,
- kısa ve seyrek servis bağlantıları,
- açık boşluklarda gereksiz pad yok.

## 16. Hız bölgeleri
Önceden kararlaştırılmış iki tam gaz alanı korunur: yaklaşık %15 + %10. Bu bölgelerde bina yoğunluğu ve görüş engeli azalır.

## 17. Tekrar engelleme
Son 3–5 blokta aynı sol/sağ dizilim, aynı açıklık tipi veya aynı kompozisyon tekrarlanmaz. Aynı Map4 yapı modeli farklı görevlerde tekrar kullanılabilir.

## 18. AI
Çoklu geçit kararında uzunluk, genişlik, viraj, engel yoğunluğu, risk, KEEP IT LOW riski ve trafik değerlendirilecektir. SPEED, CAUTIOUS, AGGRESSIVE vb. pilot profilleri farklı geçit tercihlerine sahip olacaktır. Rakiplerin tamamının aynı kapıya yığılması engellenecektir.

## 19. İlk uygulama / Golden Sector
İlk prototip, ilk uzun TECH zincirinin yaklaşık 30–40 km’lik kısmıdır.

Hedef:
- yaklaşık 20–30 mimari blok,
- çoğunluk tek geçit,
- 4–6 çift geçit,
- 2–3 üçlü geçit,
- birkaç sert şikan,
- en az iki kontrollü kaos düğümü,
- birkaç bilinçli nefes alanı.

Bu bölüm kalite standardı olduktan sonra sistem kalan TECH sektörlerine yayılır.

## 20. Uygulama sırası
- MAP2-30 — block segmentation
- MAP2-31 — gap classification
- MAP2-32 — building role assignment
- MAP2-33 — multi-passage complexes
- MAP2-34 — controlled chaos
- MAP2-35 — sightline shaping
- MAP2-36 — ground integration
- MAP2-37 — AI route choice
- MAP2-38 — first sector polish
- MAP2-39 — pattern propagation
- MAP2-40 — full-map rhythm pass

## 21. QA
Her aşamada:
- bina taban temas hatası
- havada bina
- eski asfalt/deck
- uzun sürekli zemin zinciri
- tek/çift/üçlü geçit sayısı
- sahte/kapalı rota
- açıklık genişliği
- AI geçit dağılımı
- obstacle hit
- gate exit
- görüş mesafesi
- bina/boşluk yoğunluğu
- tekrarlanan kompozisyon
- gerçek kamera görüntüleri

ölçülecektir.

## Nihai hedef
Oyuncu “yarış pistindeyim” değil, **“devasa bir endüstriyel yerleşimin içinden rota buluyorum”** hissini almalıdır. Tasarım sistemi oynanabilirliği korur; kontrollü kaos dünyanın doğal ve öngörülemez görünmesini sağlar.
