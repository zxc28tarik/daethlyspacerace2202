# NEXT-11C18 — Uçuş manevrası ve üç-sistem enerji yönetimi (Squadrons araştırması)

**Tarih:** 18 Kasım 2026 · **Durum:** UYGULANDI-GELİŞTİRME DALINDA; gerçek WebGL ve tam regresyon kabulü ayrı · **DRAFT / MERGE YOK**

## Kullanıcı kararı ve kapsam

Kullanıcı Star Wars: Squadrons araştırmasının **2. Uçuş Sistemi** ve **3. Enerji Yönetimi** fikirlerini kendi oyunumuza uygulanmasını açıkça istedi, özellikle enerjiye öncelik verdi; **gemi sınıfları, yeni gemi modelleri ve parça/özelleştirme sistemi daha sonraya ertelendi**. Harita 1 saf yarışının kararlı kodunu ve bütün mevcut Harita 4 dört-aşamalı görevi korumak için ilk oynanabilir entegrasyon Harita 4'e özeldir. Bu, Squadrons'ın kopyası değildir; fikrin rota kontrollü gezegen uçuşumuza uyarlanmasıdır.

## Gerçek entegrasyon — uygulanmış

- Oyun içi **1=DENGELİ**, **2=MOTOR**, **3=SİLAH**, **4=KALKAN** güç önceliği (numpad dahil). Üç enerji göstergesi: mevcut `state.energy` motor kapasitörü, yeni silah ve kalkan rezervi. Enerji dağıtımı bu üç kapasitörün yeniden dolum hızını değiştirir:
  - **Dengeli:** motor +10, silah +10, kalkan rezervi +9/s.
  - **Motor:** motor +18, silah +3, kalkan +3/s. Boost sırasında hedef hız ×1,05 (yalnız aktif motor önceliğinde).
  - **Silah:** motor +4, silah +24, kalkan +3/s.
  - **Kalkan:** motor +4, silah +4, kalkan +24/s. Hasar almadıktan en az **6 saniye sonra** kalkan bütünlüğü yalnız odaktayken **en çok +1,5/s**, rezervden 2 birim/1 kalkan harcayarak iyileşir; sınır hasarı veya yeni fiziksel hasarda iyileşme olmaz.
- Harita 4 avcı silahı artık **5 silah rezervi/çift lazer volleysi** tüketir (eski sınırsız atış yok); kapasite bitince ateş reddedilir. Harita 1'in eski 3 ortak enerji bedeli ve sürpriz kutusu kuralı **hiç değişmez**. Avcı hasarı, puanı, düşman sayısı, AI hedefleri ve ateş hızı değişmez.
- Boost `Shift/W` ve fren `S` mevcut kontrollerle çalışır; Harita 4'te boost motor kapasitesini tüketir, seçili güç önceliği boost sonrasında şarj oranını belirler. Rakip AI'nın mevcut enerji sistemi ve normal yarış hızı dokunulmadan kalır.
- **X**: boost kullanılan son **1,25s** içinde 8 motor enerjisi tüketerek **0,72s** kontrollü drift. Bu sırada yanal/irtifa vektörü sırasıyla ×1,36 / ×1,24. Çarpışma bağışıklığı, teleport, serbest geri uçuş **yok**; gerçek collider korunur.
- **Alt basılı tut**: kamera yerel yaw/pitch bakışı; geminin rotası ve fiziksel konumu bakış hareketiyle değiştirilmez. Mevcut Q/E barrel roll, fare/AD/yukarı/aşağı yanal hareket, C kamera, nişan ve lazer fonksiyonları korunur. Bu "tam 6DOF" değildir; dört-aşamalı yönlendirme kontratı aynıdır.
- HUD yeni üç rezerv barı ve seçilen güç profilini gösterir; Başlangıç ve duraklatma ekranlarına Harita 4 kontrolleri eklendi. Map1 paneli gizli ve orijinal.
- Başlangıç/restart: güç modu, üç rezerv, drift ve hasar gecikmesi sıfırlanır; Map1'e geçiş izole.
- Savaş hedef puanı, 5 rakip/8 avcı, 60 saniye arena kilidi, 300 saniye limit, 850 metre çıkış, +%18 kanyon ve +%12 sanayi bonusu, **6/36/200 collider**, 24 W05 işaret, 34 W02 fiziksel kabuk, GFX11C17 96 dekor model **korunur**.
- Gemi sınıfı/kozmetik/GLB veya enerji aktarma animasyonu **eklenmedi**. Kimlikler ve tüm 3D gemi modelleri ertelenmiştir.

## Ürün denge kabulü açık

- Bu değerler **ilk oynanabilir dengeleme prototipi**, kullanıcı tarafından henüz kesinleştirilmiş son denge sözleşmesi **değildir**.
- Özellikle güç odakları ile 5 rakip arasındaki hız adaleti, lazer kullanan/çok az ateş eden pilot seçenekleri, kalkan onarımının zorluk üzerindeki etkisi ve drift kontrolü **gerçek oynanış ve kullanıcı kararı** gerektiriyor. Şimdiden "nihai" diye kilitleme.
- Daha sonra değerlendirilecekler (izinsiz yapılmadı): tam serbest 6DOF uçuş, ayrı throttle kademe, ayrıntılı joystick/HOTAS tuş ayarları, hedef seçme kısayolu, ön/arka kalkan yönlendirme, Imperial tarzı anlık güç dönüştürme, gemi sınıfları, ağır silah yükleri.

## Kalite kapıları

- [x] Yeni üretim `index.html` kodu ve HUD / kontrol / restart bağları.
- [x] Bağımsız Chromium testi `tests/map4-next11c18-power-flight.cjs` + hızlı workflow ve tam Map1/Map4 workflow bağlantısı.
- [ ] Bağımsız gerçek Chromium PASS (ilk testte sözdizimi düzeltmesi gerekmişti).
- [ ] Güncel tam Map1/Map4 regresyon PASS.
- [ ] Harita 4 kesintisiz 300s insan sürüşü, 720/1080p native GPU FPS/p95/VRAM.
- [ ] Kullanıcı gerçek enerji dengesi ve yeni manevra hisleri onayı.
- [ ] Açık kullanıcı onayı olmadan mevcut stacked PR'lar veya bu PR birleşmez.

**Özgünlük:** Squadrons'ın telifli görsellerini, arayüzünü, varlıklarını veya yazılımını kopyalamak yok; sadece genel güç dağıtımı ve uçuş kontrolü konseptlerinden ilham alındı.
