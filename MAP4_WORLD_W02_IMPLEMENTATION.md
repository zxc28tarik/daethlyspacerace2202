# Harita 4 — W02: Geniş Gezegen, Serbest Uçuş ve Dört Katmanlı Sınır

## Neden önce W02?
W01'de 12 büyük yer işareti vardı ama bütün harita eski 1.340 yarıçaplı uçuş alanı ve ±1.800 genişlikteki düz zemin üstünde duruyordu. Kaya ve kuleleri erken aşamada bu dar ölçekte arttırmak, sonraki büyütmede yerleşim ve çarpışmaları yeniden yapmayı gerektirirdi. W02 önce fiziksel genişliği, atmosferi ve açılış kadrajını sabitler.

## W02 tam uygulama kapsamı

| Bölge | Yeni merkez hattı uçuş yarıçapı (yaklaşık) | Oyuncuya hissettireceği |
|---|---:|---|
| 1. Kayalık vadi açılışı | **3.700** | Hemen başlangıçta geniş alan, filonun yayılmış doğuşu, merkezde engelsiz geçiş |
| 2. 60 saniyelik avcı sahası | **4.100** | Uzun mesafe boyunca ileri gidilemese bile sağa/sola/yukarı/aşağı büyük taktik manevra sahası |
| 3. Endüstriyel geçiş | **3.350** | Yükseklik ve yanal rotalar; büyük fabrika silüetleri |
| 4. Askerî üs ve yörünge | **3.550** | İrtifa kazanma, uzak üs yapıları ve üst atmosfer |

Önemli: Bunlar **yarıçap** ve merkez hatta göre yerel dünyadaki değerlerdir, çap veya gerçek kilometre ölçümü değildir. Bölümler arasında ani sert çap değişimi yerine yaklaşık 2.600 ilerleme boyunca yumuşak interpolasyon uygulanır.

### Sınır profili (Harita 4'e özel)
- **0–%82 nominal yarıçap:** tamamen serbest; 0 fren, 0 hasar.
- **%82–%91:** HUD/radar uyarısı, hâlâ 0 fren ve 0 hasar.
- **%91–%100:** yumuşak hız düşüşü (1.00× → 0.86×); can azalmaz.
- **%100–%108:** daha ciddi baskı (0.86× → 0.64×) ve düşük kalkan maliyeti.
- **%108–%118:** dış sınır, 0.64× → 0.36× ve yüksek kalkan maliyeti.
- **>%118:** uçuş merkezinin son sınırda yumuşakça sınırlandırılması (oyuncuyu merkezde hiçbir aşamada dondurmaz).

**Harita 1**'deki 360 çevresi görünmez boru, neon raylar, mevcut sınır hesabı ve rakip başlangıcı aynen korunur.

### Geometri ve görsel kalite
- Zemin yaklaşık **±5.850** yan birime uzatıldı; yeni uçuş hacmi büyük düzlemin içine oturuyor.
- Her bölgeye **yakın çevre + uzak ufuk** görünürlük grupları eklendi.
- Bölge başına yakındaki 16–30 yeni çevre formu ve ufukta 28 büyük silüet: toplam **226 statik, paylaşılan mesh**.
- Vadi açılışına ek **8 büyük kaya/mesa** eklendi; merkez doğuş yolu kasıtlı olarak açık tutuldu.
- Farklı bölge silüetleri:
  - **Vadi:** büyük kaya zincirleri, kırmızı/koyu kaya örtüsü; ileride oyuna etki eden kaya kemerleri W03'te.
  - **Arena:** enkaz/gövde silüetleri; 60 saniye dalga ve savunmalar W04'te.
  - **Sanayi:** uzak kule ve fabrika kütleleri; boru/köprü/kollizyon doğruluğu W05'te.
  - **Üs:** askerî bloklar/kurulumlar; üs ve yükseliş kompozisyonları W06'da.
- Kamera uzak görüşü Harita 4 için **11.500**, Harita 1 için yeniden **4.500**.
- Gezegen ışığı soğuk neon yerine sıcak ana güneş + mavi dolgu; üst atmosfer/uzay renkleri dördüncü bölümde irtifayla değişir.
- Faz/bölge/yaklaşan landmark'ın yanında yeni HUD satırında mevcut göreceli saha çapı ve güvenli alandaki mesafe görüntülenir.
- Şu an eklenen uzak silüetler **görsel dekor**; görünmez çarpışma kutuları yaratılmaz.

### Başlangıç ve 60s arena
- Harita 4'te beş AI daha geniş dairesel bir ilk formasyona yerleştirilir; Harita 1'in rastlantısal dar başlangıcı değişmez.
- AI'nın harita 4 için yanal avcılık hedefleri büyütülür. Normal avcı / elit avcı ve isabet-ödül kuralları değişmez.
- 60 saniye **ileri ilerleme kilidi** korunur. Oyuncunun yanal/dikey hareket kapasitesi büyür. Henüz tam 6DOF bağımsız 3D serbest dolaşım varmış gibi sunulmaz.
- 300 saniye üst sınır ve 850 çıkış irtifası aynen kalır.

### W02 kabul / test kapıları
- [x] Dört faz için değişken yarıçap ve kesintisiz geçiş uygulanır.
- [x] Radar uyarı halkasında sıfır hız cezası ve sıfır hasar.
- [x] Daha dış kuşakta kademeli yavaşlama; en dış sınıra kadar geniş sahada kontrol.
- [x] ±5.850 zemin, 226 yakın/uzak kompozisyon ve 11.500 uzak görüş.
- [x] Zemin 80×16 sabit hücrelik yerel mesh ve verteks renk bantlarıyla yükseltilir; dekoratif relief, şu an fiziksel arazi çarpışması değildir.
- [x] Başlangıç formasyonu yayılır; Map1 formasyonu yerinde.
- [x] Gezegensel gün ışığı/üst atmosfer korunur; Map1 neon ışığına geri döner.
- [ ] Gerçek oyuncunun fiziksel kontrol, FPS, kaçınma ve sınır hissi onayı.
- [ ] W03 gerçek kaya kemeri çarpışması ve üç farklı yol ayrımı.

## W03–W10 aşama içeriği ve teslim tanımları

### W03 — Vadi topolojisi
- Kızıl Kaya Kapısı ve Mesa çevresine gerçek kaya duvarları/kemerler; düşük/geçiş/yüksek alternatif güzergâhlar.
- Ana hat: geniş güvenli, yan kısa hat: dar tehlikeli, üçüncü rota: avcı puanı.
- İleri hız ve çarpışma süpürme testi; görünen objeye uygun konveks/temel fizik.
- Ortalama 40 saniyelik başlangıç ritmi korunmalı, hiçbir rota zorunlu duvara dönmemeli.

### W04 — Savaş ovası
- Düşmüş Kruvazör, Hava Savunma Hattı ve Enkaz Halkası etrafında **üç ayrı savaş cebi**.
- 60 saniye içinde açık merkez ve tehlikeli elit rota; respawn göze batmayan yerlerden.
- Düşman dalgaları oyuncu + 5 AI için aynı kurala göre sayılır; "hep oyuncuya kilitlenme" yok.
- 8 hedeflik başlangıç havuzunun üstündeki yoğunluk kararı ancak test sonrası kalibre edilecek.

### W05 — Sanayi
- Rafineri / fabrika kuleleri / enerji istasyonu bağlantıları, fiziksel borular, üst-alt geçişler.
- Gerçek çarpışma eşleşmesi, hasar/hız kaybı, ışıklı risk uyarıları.
- Güvenli üst koridor, hızlı alt açıklık ve düşmanlı yan rota.

### W06 — Askerî üs ve yörünge
- Karakol → hangar/pist → radar kuşağı → yörünge fırlatma platformu.
- Gökyüzü renk ve sis geçişleri, uzağa çekilen gezegen, kamera ufku.
- ≥850 yerel irtifa bitiş şartı fiziksel/optik olarak anlaşılmalı.

### W07 — Gerçek dallanma/serbestlik
- Sadece sahne genişliği değil, farklı geçiş uzunlukları, hız/enerji/puan maliyetleri.
- Oyuncu tercihleri sonuçlara etki etmeli; AI profilleri de tercihler yapmalı.

### W08 — Bölgesel AI ve denge
- Sprinter/Hunter/Balanced/Elite/Cautious profillerinin 4 fazdaki farklı davranışları.
- Radar menzili/avcı hedef izleme ve yarış süresi parametreleri; geçerli bitiş ve imha puanı adil.

### W09 — Son görsel kalite
- Malzeme/katman varyasyonu, çevre sesleri ve motor/çatışma miksajı.
- Bölgesel sis/güneş/ışık/duman, daha özgün binalar ve tutarlı atmosfer.

### W10 — Yayıncı demosu kalite kapısı
- 300s fiziksel sınır, 60s arena, 6 pilot, 850 irtifa, yeniden başlatma, Map1 izolasyonu.
- Kötü FPS/çarpışma/spawn ve kararsız ekranlar düzeltilecek.
- Oynanış hissi **kullanıcı onayı** olmadan tamamlama ilan edilmeyecek.

Tüm dalgalarda tek dosya HTML + GitHub commit/test + doğrulanmış doğrudan indirme bağlantısı verilecek.
