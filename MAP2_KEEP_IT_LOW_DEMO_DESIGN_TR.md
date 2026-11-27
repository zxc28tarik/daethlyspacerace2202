# Harita 2 — KEEP IT LOW | Onaylı demo tasarım kararları

Tarih: 24 Kasım 2026. Son karar güncellemesi: 27 Kasım 2026. Bu belge Harita 2 için birincil tasarım referansıdır. Önceki düz rota, iki tur, dekor ağırlıklı yerleşim ve devriye tehdidi önerilerinin yerine geçer.

## 1. Demo kapsamı ve amaç
- Harita 4 mevcut haliyle tamamlanmaktan uzak ve iş gücü ihtiyacı yüksek. Demo önceliğinde Harita 4 yerine daha hızlı tamamlanabilir, Harita 1 tabanlı ikinci yarış sunulacak.
- Harita 4 silinmeyecek, üzerine yazılmayacak; sonraki geliştirmeler için korunacak. Sanayi, şehir, fabrika, makine, rafineri, platform, boru ve benzeri mevcut modelleri yeniden kullanılacak.
- Yeni harita adı/görevi: KEEP IT LOW. Ana deneyim yarış, hassas uçuş, risk ve alçak irtifa. Oyuncu silahları kapalı; serbest çatışma arenası, bekleme, boss, büyük yeni savaş sistemi ve tepeden saldıran devriye düşmanı yok.
- İlk hedef kaba ama baştan sona oynanabilir pist; sanat cilası sonra. Mevcut varlıkları kullanarak hızlı üretim hedeflenir; 1–2 saatlik ilk yerleşim fikri bir süre garantisi değildir.

## 2. Geometri ve mesafe (kilitli)
- Tek tur, başlangıç ve bitiş aynı bölge; düzensiz kapalı çember/loop, geometrik olarak kusursuz daire değil.
- Toplam rota yay uzunluğu Harita 1'in mevcut gerçek uzunluğunun 3–4 katı. Tek tur tamamlandığında yarış biter; ek tur yok. Süre oynanış testiyle belirlenir; eski 3–4 dakika varsayımı bağlayıcı değildir.
- Yaklaşık %70: fabrika ve şehir yapılarının doğrudan uçuş yolunda fiziksel engel olduğu teknik kesimler. Oyuncu yapıların gerçek iç boşlukları, alt açıklıkları ve aralarından geçer.
- %15: kesintisiz geniş, az engelli birinci tam gaz bölgesi.
- %10: ayrı, kesintisiz geniş, az engelli ikinci tam gaz bölgesi.
- Kalan yaklaşık %5: başlangıç, bitiş ve kısa bağlantılar. Oranlar rota mesafesidir, süre değildir. İki hız kesimi birbirinden ayrılmalı; yüksek hızda oynanabilir olmalı.
- Bazı dönüşlerde yolun iki tarafında gerçek yapılar bulunacak; keskin 45–90 dereceye varan dönüşler, fren ve hassas çizgi seçimi. Viraj yarıçapı uçuş hızı ve kontrol hissiyle doğrulanacak. Mevcut rail kamera/rota yönlendirmesi korunarak fiziksel geçişler güvenli ve okunaklı yapılacak.
- Örnek (değiştirilebilir) tempo: %0–5 başlangıç; %5–20 tam gaz 1; %20–55 teknik; %55–65 tam gaz 2; %65–100 teknik ve finiş. Başlangıç/bitiş bağlantılarının toplamı yaklaşık %5; teknik kısımların toplamı yaklaşık %70. Kesin yerler oynanışa göre.

## 3. Yapılar dekor değil engeldir (en önemli karar)
- Harita 4 varlıkları pist kenarına dizilip dekor olarak bırakılmayacak; büyük çoğunlukla doğrudan yarış koridorunun içine yerleştirilecek.
- Örnek oran: koridor genişliği 5 ise büyük yapının kapladığı genişlik yaklaşık 3 birim. Bu, tüm objeler için zorunlu sabit boyut değil; başlangıç yerleşim kılavuzudur. Ortalanmış veya hafif sağa/sola kaydırılmış dizilimler.
- Geçişler: fabrika/hangar giriş-çıkışları, yatay dar açıklık, çift açıklık, asimetrik boşluk, boru altı, kolon arası, makine gövdesi arası, şehir sokakları, slalom. Yüksekten bütün yapıyı atlamak optimal çözüm olmayacak.
- Fiziksel katı alanlar çarpışır; gerçek açıklıkların collider'ları boş kalır. Görünen boşluk ile çarpışma geometrisi uyuşmalı. Tünel içinde kamera okunaklı olmalı.
- Önce tüm loop ve mevcut varlıkların kaba yerleşimi, sonra boşluklar, açıklıklar, viraj çevresi, çarpışmalar, aralıklar ve zorluk. Sırf daha güzel model yapmak için zaman harcanmayacak.
- Her teknik engel için erişilebilir en az bir geçiş; oyuncu ve bot için gemi boyutu + güvenlik payı, yüksek hızda tunneling önleme ve önden okunabilir girişler. Katı yapılarda üstten/yan dışından kestirme ile yarış mesafesi atlanmamalı.

## 4. KEEP IT LOW — 27 Kasım 2026 güncel kural
- Harita 2'de tepeden saldıran devriye uçağı, devriye kilidi, devriye lazeri/ateşi ve irtifaya bağlı kalkan hasarı kullanılmayacak.
- "DEVRİYE YAKLAŞIYOR", "DEVRİYE KİLİDİ" ve "DEVRİYE ATEŞİ" gibi devriye HUD uyarıları Harita 2'de gösterilmeyecek.
- KEEP IT LOW kimliği artık yapay bir hava cezasından değil; fiziksel bina geçitleri, dar açıklıklar, keskin dönüşler, rota seçimi ve yarış çizgisinden doğacak.
- Oyuncu ve botlar aynı gerçek bina çarpışmalarına ve rota mesafesine tabidir; üstten/yan dışından kestirme yarış ilerlemesini atlatmamalıdır.
- Harita 2 HUD'ı sade kalacak. Çoklu geçitlerde oyuncuya açık biçimde "ALTERNATİF ROTA" ve seçilen geçit yönü gösterilecek; eski genel "ENKAZ GEÇİDİ / DEBRIS ZONE" dili Harita 2 için kullanılmayacak.

## 5. Yeniden kullanılacak sistemler
- Harita 1 yarış motoru, uçuş/rail kontrolleri, eşit temel hız, rakip pilot profilleri ve sollama, boost/fren/enerji, mevcut mor ödül kutuları, çarpışma temeli, sıralama ve podyum/sonuç akışı.
- Riskli geçişlerde boost kutuları ve güvenli hız kesimlerinde sollama fırsatları; mevcut mekanik ve sanat kimliği korunur. Yeni pickup sistemi gerekmez.
- Harita 4 varlıkları, atmosferi ve ışıklandırması uygun oldukça aktarılır. Yeni haritanın ana kimliği görsellikten önce teknik yarış.
- Menüde ayrı Harita 2 seçimi, kendine ait görsel ve haritaya özgü sonuç arka planı son cila adımı; mevcut Harita 1 ve 4 davranışları bozulmayacak.
- Keep It Simple: sade uyarılar, temiz HUD, gereksiz panel yok.

## 6. Uygulama sırası ve kabul kapıları
1. Mevcut güncel geliştirme dalını doğrula; Harita 1 rota uzunluğunu, ortak yarış motorunu ve Harita 4 varlık fabrikalarını incele. Yeni Harita 2 ayrı yapılandırma/rota olarak eklenir; Harita 1 kodunu körlemesine kopyalama, ortak fonksiyonları kullan.
2. Kapalı, tek turluk 3–4x rota; mesafe tabanlı %70/%15/%10/%5 segmentler; başlangıç ve bitiş kapanışının tutarlılığı. Tam gaz kesimleri gerçekten açık.
3. Mevcut şehir ve sanayi modellerini teknik kesimlerin içine yerleştir; virajların iki yanındaki yapılar, gerçek iç geçişler ve boşlukları oluştur.
4. Çarpışma, kamera, okunabilirlik, bot geçiş hedefleri, geçiş güvenliği ve sıralama. Tek turda doğru sonuç.
5. Alternatif geçitlerin oyuncu tarafından erken okunması; HUD yönlendirmesinin gerçek fiziksel açıklıklarla ve botların kullanabildiği rota kollarıyla tutarlı olması.
6. Boost/enerji ve fren dengesi; risk/ödül, tam gaz bölümleri, yarış temposu ve farklı pilot davranışları.
7. Menü/podyum/arka plan ve görsel cila. Gerçek tarayıcıda Harita 2 baştan sona oynanış, botların finişi, yeniden başlatma, Harita 1/4 regresyonu ve WebGL performans testi. Geçişler test edilmeden tamamlandı denmeyecek.
8. Oyuncuya test için güncel doğrudan sohbetten indirilebilir web HTML dosyası sağlanması hedeflenir. GitHub indirme bağlantısı, istenen sohbet eki yerine geçmez; dosya aktarımı başarısız olursa dürüstçe belirtilir.

## 7. Kapsam dışı
Yeni savaş modu, karmaşık çatışma AI'sı, yeni uçuş motoru, boss, kariyer, ekonomi, çok oyunculu, Harita 4'ün tamamlanması, sıfırdan kapsamlı model üretimi. Harita 1 ile aynı çekirdek; ikinci haritanın farkı fiziksel sanayi engelleri, keskin virajlar, alçak irtifa ve iki tam gaz kesimidir.

## 8. Öncelik
Güncel öncelik: geçiş/çarpışma doğrulaması, alternatif rota okunabilirliği, botların 175 km'lik yarışı tamamlaması, tam gaz sektörlerinin gerçekten açık kalması ve demo cilası. Devriye sistemi kapsam dışına çıkarılmıştır.

## 9. Ek kullanıcı kararı — 24 Kasım 2026
Harita 4 silinmeyecek veya bozulmayacak. Demo sürümünde yalnızca seçimi ve başlatılması geçici olarak kapalı tutulacak. `DEMO_MAP4_ENABLED=false` ile geri alınabilir erişim kapısı kullanılacak. MAP2-01 ayrı dalda; Harita 4'ün özgün işlevleri ve varlıkları korunacak.


## 10. Ek kullanıcı kararı — 27 Kasım 2026
- Harita 2 hava devriyesi ve ona bağlı saldırı/hasar/uyarı sistemi kaldırıldı.
- Harita 1 ve Harita 4 bu karardan etkilenmeyecek.
- 15× oyuncu test kalkanı geçici Harita 2 test aracı olarak korunuyor.
- Mevcut alternatif rota geometrileri ve bot rota seçimi korunuyor; sonraki çalışma oyuncunun bu ayrımları daha erken ve daha açık okuyabilmesine odaklanıyor.
