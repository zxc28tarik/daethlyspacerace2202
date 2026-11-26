# NEXT11C21I — Orijinal bariyerler ve enkaz kapıları, yalnız yüzey iyileştirmesi

Kullanıcı kararı: Eski Harita 1 kutularını, meteorleri ve engelleri koruyarak **yalnız görüntülerini iyileştir**. Metal, taş, çarpışma, rota ve oynanış yeni tasarım ile değiştirilmez.

Bu pakette mevcut geometriler korunuyor:
- Bariyer: Aynı core `OctahedronGeometry` veya `IcosahedronGeometry`, iki `TorusGeometry` uyarı halkası, aynı spoke line; aynı obstacle radius, görünürlük, pozisyon, dayanıklılık ve AI.
- Mevcut 8 enkaz kapısı: aynı 4 fiziksel panel çarpışması, aynı 16 görsel group child ve geçiş açıklıkları. Kapılara daha fazla parça koyulmadı.
- Sadece iki adet 64×64 paylaşımlı `THREE.DataTexture` boya/aşınma haritası üretildi; rastgele sayı tüketmeden temel boyalı yüzeylerde ufak ton farklılıkları ve yıpranma işaretleri veriyor.
- Bariyer çekirdeği daha mat ve doğal boyalı metal, turuncu uyarı halkası daha kontrollü; enkaz plaka rengi daha soğuk çelik, iki boya katmanı ve portakal uyarı işaretleri.
- 49 eski mor kutu, 320 orijinal meteor, SB-07 189 parça, Harita 4 249 parça tamamen korunuyor.

## QA
Native Chromium 1600x900 WebGL karşılaştırması: solda orijinal bariyer materyali, sağda aynı orijinal geometrinin rafine materyali. Gerçek yarış kamerasında bir bariyer ve bir enkaz kapısı geçici olarak 280m/640m mesafeye görsel test amacıyla taşınır, sonra eski pozisyonlarına iade edilir.
320 meteoru ve 49 kutuyu doğrulayan C21H/C21G6 testleri yeniden koşulur. Fizik 8×4 paneller, Map4 collider [6,36,200], hiç artmayan barrier draw call sayısı doğrulanır.
Önceki atom pickup tasarımlarını varsayan C21G-C21G5 testleri bu yeni dalda atlanır; C21G6 eski kutu testi yerine geçer.
Dedicated CI, full smoke ve güncel tek dosya offline HTML üretilir.

PR, #104 üzerine taslak; main'e açık onay olmadan merge yok.