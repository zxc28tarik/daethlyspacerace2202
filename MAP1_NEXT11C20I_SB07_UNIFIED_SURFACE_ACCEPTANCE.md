# NEXT-11C20I — SB-07 ZENİT bütünleşik geometri ve çizgi kalitesi

**19 Kasım 2026.** Kullanıcının son kararı: "şimdi fazla parça eklemek yerine ayrık parçaları birleştir ve çizgi kalitesini yükselt". Bunun üzerine ayrı küçük dekoru çoğaltmak yerine **mevcut gerçek oyun içi** SB-07 yapısını radikal biçimde sadeleştirdik.

## Kesin korunacak tasarım
- Kullanıcının onayladığı SB-07 ZENİT: uzun sivri burun, geniş/neredeyse düz süpürülmüş iki yatay ana kanat, **iki dış kanat ucunda yukarı yönelen DİKEY stabilizatörler**; beyaz/gümüş-gunmetal gövde, kırmızı yarış deseni, koyu mavi fasetli cam, arkada iki detaylı mavi plazma motoru.
- Önce reddedilen kavisli parantez kanat tasarımına veya ticari 3. parti gemi modeline dönüş **YOK**.
- Harita 1 **silahsız yarış**; kamera normal Cinematic Chase / boost close Chase, hız/enerji/AI/çarpışma değişmez. Harita 4 B-04 ve bütün arena kuralları/hitbox'ları **değişmez**.
- 7 birleştirilmiş SB-07 materyal/mesh render batch + 2 ayrı küçük plazma halo sprite devam; 0 yeni collider/weapon/dış model.

## Gerçek uygulama — ayrık parça -> tek entegre yüzey
| Bölge | Eski yapı | Yeni 3D birleşik yapı |
|---|---|---|
| Burun yarış şeridi | 3 bağımsız kırmızı kutu | Gövdenin eğim istasyonlarını izleyen **1 UV'li kesintisiz ribbon** |
| Kokpit yan çerçeveleri | Her yanda 4 ayrı düz rod | Her yanda **1 CatmullRom + TubeGeometry** sürekli metal çerçeve |
| Kontrol yüzeyleri | Her kanatta 2 ayrı parça ve birden fazla küçük menteşe/bolt | Her kanatta **1 birleşik flap paneli** ve 1 uzun menteşe çizgisi |
| Kanat kökü hava geçişleri | 8 küçük kutu + 3 kısa seam / kanat | **2 bütünleşik root surface** ve 1 gerçek uzun derz / kanat |
| Kanat arka yüzeyi | 16 küçük yüzey kutusu / kanat | **2 uzun aerodinamik rail** / kanat |
| Motor üst servis kanalları | Her motorda 10 küçük louver objesi | **1 uzun inset groove + kesintisiz edge** |
| Motor nozzle çevresi | Her motorda 6 recess + 8 petal + 12 thermal + 6 shield box | 1 continuous groove ring + **3 dairesel annular bant**; iki motorda 20 gerçek stator korunur |
| Yan motor kapakları | Her yanda 7 detached cover chip | **1 gerçek uzun bağlı kaplama + 1 accent çizgi** |
| Motor termal borusu | Her yanda 2 bağlantısız düz çubuk | **1 continuous curved TubeGeometry** |
| Merkez üst kapak/arka eşanjör | Çok sayıda ardışık küçük kutu | Bütünleşik uzun kapak ve 4 parçalı kompakt eşanjör |
| Kanat yarış çizgileri | Ana kırmızı güverte çizgisi + tekrar eden kısa overlay'ler | **Sadece mevcut tek red extrude çizgi yüzeyi** |

## SAYISAL parça doğrulama
- Önceki NEXT11C20H oyun modelinin `h4Ship20ZenitBuild` **gerçek kodu** kontrollü bir minimum Three.js geometry mock'uyla çalıştırıldı: `root.userData.parts = 354`, aynı 7 material batch.
- Yeni NEXT11C20I aynı sayımda `root.userData.parts = 191`, yine 7 material batch.
- **Azalma = 163 adet çizim öncesi primitif (%46.05).** Sahte model tasarlamadık; ölçüm iki sürümün **gerçek model üretici kodunu** çalıştırır. Gerçek GPU/WebGL görsel kalite veya FPS ölçümü değildir.
- Gerçek Chromium browser testinde **191** hard gate ile doğrulama eklendi.

## Çizgi / eğri kalite yükseltmeleri
- Metal çizgi yuvarlak kesit: **12→16** radial bölüm.
- Motor silindiri: **24→32** çevresel bölüm; flared nozzle aynı 32 bölümlü.
- Motor ring Torus çevresi: **32→40**; tüpsel segment: 10.
- Yatay kanat ve iki dış upright fin bevel: **3→4** kademeli geçiş.
- Kokpit enine örnekleme: **9→11**; 7 uzunlamasına karakteristik sıra korunur.
- Önceki 128px orijinal CanvasTexture / trilinear mipmap / 4× anisotropic, 7 PBR/material batch ve hızla çalışan ikili motor ışığı değişmeden.
- İki kullanılmayan builder kaynak geometri tanımı kaldırıldı. Derinlik kontrastını bozabilecek önceki büyük aşırı parlak ışığa dönülmedi.

## Test / dürüst kabul durumu
- [x] Gerçek `index.html` tam inline JS sözdizimi **PASS**.
- [x] Önce/sonra `h4Ship20ZenitBuild` model üretici testi: **354→191**, 7 batch korunuyor.
- [x] Playwright Chromium/WebGL kodu 191 gerçek parça, yeni 16/32/40/11 kesitler, kokpit 3D/kanat uçları/nozzle/stator, Map 1 no-weapon ve Map 4 B-04 / 249 part + collider/AI/arena kurallarını doğrulama için güncellendi.
- [x] Hızlı browser workflow ve tam Map1/4 smoke dal tetikleyicisi eklendi.
- [ ] Yeni commit gerçek Chromium/WebGL CI **PASS** olarak doğrulandı.
- [ ] Ön/arka normal/boost PNG gerçek çıktı görüntüleri incelenip kabul edildi.
- [ ] Native GPU 720p/1080p FPS/p95 ölçümüyle 40-segment halka ve 16-segment çizgi performans maliyeti doğrulandı.
- [ ] Kullanıcının estetik ve açık merge onayı alındı.

**Önemli:** 163 daha az üretici primitif, 163 daha az draw call değildir. Baştan beri malzemeye göre 7 birleşik mesh var; WebGL triangle sayısı artırılan curve quality sebebiyle farklı olabilir. FPS kanıtı olmadan hızlandı iddiası YOK.

## Sonraki NEXT11C20J
Gerçek WebGL screenshot / CI durumunu elde et; kamera #1/#2 altında birleşik konturların clipping/z-fighting yapmadığını, koyu mavi cam kenarlarını, kırmızı ribbonun burun eğimini, dairesel motor ringlerini değerlendir. Gerekirse minimal düzeltme. **Yeni küçük dekor parçası ekleme yok**.

Önceki [NEXT11C20H](MAP1_NEXT11C20H_SB07_RENDER_EVIDENCE_ACCEPTANCE.md). Taslak PR, **NO MERGE**.
