# HARİTA 4 — DÜNYA VE İÇERİK ÜRETİM PLANI
Sürüm: 18.10.2026 — 4 aşamalı gezegen görevi / 4–5 dakika
Başlangıç commit: `fae3ff161a53e4081f3c1b69d92c62c9a0de3299`.
Harita 1 korunacak. Toplam 6 harita hedefi değişmez.

## Oyuncunun değişmez görev akışı
1. **Vadiler:** Ortalama yaklaşık 40 saniye; başlangıç/serbest geçiş.
2. **Açık savaş alanı:** Kesin 60 saniye; ilerleme kilidi fakat yatay/dikey manevra ve avcı savaşı serbest.
3. **Endüstri:** Avcı vurma + binalardan/tesislerden kaçınarak ileri geçiş.
4. **Üs + uzay katmanı:** Savaş + yolculuk; son kapı için irtifa >=850. Toplam üst sınır 300 saniye.
Normal avcı 1, elit 3 puan; geçerli bitiş yapanlar puana göre, eşitlikte süreye göre sıralanır.

## İçerik üretim dalgaları (küçük, bağımsız ve regresyonlu)
| Dalga | Mekân / içerik hedefi | Ölçülebilir kabul |
|---|---|---|
| W01 | **Dünya kimliği / referans noktaları**: Dört bölgeye özel anıt/enkaz/kanyon/sanayi/orbit platformu; uzak–yakın silüet ve HUD | Her bölgede en az 3 ayırt edilir set-piece; tümü oyun içinde görünür; içerik tek sefer oluşturulur; Map1'e sızmaz |
| W02 | **Vadiler**: alçak uçuş, kaya kemerleri, yükselti farkları, güvenli açık hat, seçmeli tehlikeli geçit | İki üç ayrı geçiş opsiyonu; görünür kayayla eşleşen çarpışma, 40 saniye ortalama |
| W03 | **60s savaş arenası**: dairesel/devriye sahaları, yıkılmış savunma mevzileri, dalgalar ve farklı avcı rotaları | İleri ilerleme kilitli; 60s boyunca erişilebilir hedefler; oyuncu ve AI için adil puan |
| W04 | **Sanayi bölgesi**: kule kümeleri, tesisler, borular, köprüler, mekanik geçitler | Nesneyle uyumlu hızlı hareket çarpışması, güvenli alternatif yükseklikler ve AI kaçınması |
| W05 | **Askerî üs**: kontrol noktaları, savunma kulesi/pist/tahkimat ve saldıran avcı cepleri | Silüet, risk-ödül hedefleri, geçişin açık olması |
| W06 | **Uzaya yükselme**: yeryüzünden üst atmosfere görsel geçiş, bulut/sis/ışık, irtifa işaretleri ve kapı | 850 irtifa şartı; 300s gerçek sınır; eksiksiz bitiş/sonuç |
| W07 | **Taktik rotalar**: kısa düz hat / uzun avcı cepleri / tehlikeli kestirmeler | Oyuncu gerçek seçim yapar; alternatif yol mesafe-zaman-ödül dengesi vardır |
| W08 | **Düşman dağılımı / beş AI tarzı** | Evre bazlı yoğunluk; biten/elenenlerin puan kazanamaması; gerçek imha/isabet |
| W09 | **Atmosfer / etkiler / ses / HUD** | Her bölgenin farkı anında anlaşılır; hedef-bölge-yörünge bilgisi okunabilir |
| W10 | **Oynanabilirlik, test ve kalite kapısı** | Chromium açılış/120→300 güncellemesi/arena/endüstri/yörünge/restart/H1 kontrolü PASS; oyuncu onayı ayrı |

## Mimari kararlar
- Tek dosya `index.html`; mevcut Three.js/Canvas ses-kamera-fizik sistemi korunacak.
- Bölge içerikleri **deterministik sabit konumlu ve ortak mesh/geometry/material** kullanmalı; restart'ta yeniden yaratılmamalı.
- Çok uzaktaki nesneler görünür tutulmamalı; bölüm temelli gizleme ve gerektiğinde yakın/uzak alt gruplar.
- W01 yalnızca tanımlanabilir çevre, anıt ve dekor üretir. Sahte fizik/etkileşim iddiası yok; bina çarpışmaları sadece mevcut gerçekten kollizyonu tanımlı nesnelere özgü.
- Grafik kaynağı değişimi H1'i bozmamalı. `main` ancak tarayıcı testi doğrulandıktan sonra güncellenmeli.
- Her kullanıcıya bildirim gibi arkaplan teslimatı değil; her tamamlanan dalgada güncel **indirilebilir .html dosyası** aynı yanıt içinde verilecek. GitHub Release dağıtım bağlantısı doğrulanmalı.

## W01 hedef ve parçalar
- [x] Kod: 4 bölgede ayrı geometrik landmark kümeleri (sabit yapılar, çevresel kompozisyon)
- [x] HUD: bölgedeki sonraki belirgin landmark
- [x] Kaynak: düşük poligon paylaşılan geometri/materyal, tekrar başlatmada birikme yok
- [x] Test: 4 bölgede içerik sayıları/Map1 izolasyonu ve tarayıcı ekran görüntüsü
- [x] GitHub: çalışma dalı commit; başarılı CI'den sonra main ve indirilebilir HTML

## W01 uygulama sonucu
- 12 benzersiz isme sahip kompozisyon: 3 vadi + 3 arena + 3 endüstri + 3 üs.
- Paylaşılan 6 basit geometri + 9 paylaşılan malzeme; her cluster tek sefer oluşturulur ve uzak olduğunda kapatılır.
- Yaklaşan içerik adı bir HUD satırında gösterilir; Map1'de world parent/HUD gizlenir.
- Chromium doğrulama: [PASS run 39165985256](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/39165985256) — dört bölge içeriği, arena, çarpışma, yörünge, restart, Harita 1 regresyonu.
- Bu dalgada yeni dekorlar **etkileşimli görev** değildir; W02+ sonrası fizik/rota/avcı anlamı eklenecek.

## W02 — Ölçek ve sınır sistemi (uygulanan kod)
- [x] Harita 4 için bölgesel zarf: başlangıç 3700, arena 4100, endüstri 3350, çıkış 3550 yarıçap; bölgeler arası yumuşak geçiş
- [x] 4 katmanlı yalnız Harita 4'e özgü sınır: %82 altında serbest, %82–91 uyarı, %91–100 kademeli fren, dış kuşakta yumuşak baskı
- [x] Başlangıç rakip filonun formasyonu büyütüldü, avcı kovalamada AI yanal hedefleri genişledi
- [x] Gezegen zemin genişliği ±5850; deterministik yükselti, renk bantları ve kabartı
- [x] 226 yeni uzaktan/yakından görünür çevre geometrisi, 4 çevre tipi; uzak geometri çarpışmasız görseldir
- [x] Harita 4 görüş derinliği 11500, sıcak aydınlatma; Harita 1'e dönüşte 4500/neon geri yüklenir
- [x] HUD görev saha çapı, sınır uyarısı ve mesafe
- [ ] Oyuncu oynanış/performans onayı bekleniyor; W03 kaya kemeri/topoloji ve gerçek kaya çarpışmalarına başlanacak

Tam teknik spesifikasyon: `MAP4_WORLD_W02_IMPLEMENTATION.md`.

## W03 — Kayalık vadi oynanabilir rota çatalları

### Üç gerçek yol seçimi
| Rota | Yanal merkez | Ödül | Tehlike |
|---|---:|---|---|
| Orta / güvenli hat | X ≈ 0 | Genel ilerleme; kaza olmadan geçiş | Ana merkez koridoru kasıtlı açık |
| Batı / dar kaya kapıları | X ≈ −1150 | Bölüm 1 içinde yolu takip ederken **%18 gerçek ilerleme kazancı** | Üç fiziksel kaya boğazında sütun çarpışması |
| Doğu / avcı hattı | X ≈ +1250 | Normal avcıların çoğu erken safhada doğu tarafında görünür | Daha az saf hız avantajı; savaş için yoldan sapma ve zaman kaybı |

Bu seçenekler fiziksel olarak aynı geniş vadinin farklı x bölümlerindedir, ayrı yükleme ekranları veya teleport değil. Oyuncu oyun esnasında rotasını değiştirebilir. Mesafe bonusu yalnız batı hattı merkezine yaklaşık ±360 yakın uçan aktif pilotlara uygulanır. Doğuda avcı biriktirmek garantili otomatik puan vermez; gerçek lazer vuruşu gerekir.

### Fiziksel W03 set-piece
- Üç boğaz konumu: yerel ilerleme ~3150, 6150 ve 9150.
- Her boğaz iki gerçek kaya sütunundan oluşur (toplam **6 çarpışma hacmi**) ve orta açıklık uçulabilir bırakılmıştır.
- Sütunların fiziksel hitbox'ı **görünür kaya mesh'i oluşturulurken** aynı yerel boyutlardan hesaplanır; dekoratif dağ/zemine sahte invisible hitbox eklenmez.
- Önceki/yeni konum arasında ileri + sağ/sol + irtifa **süpürmeli slab testi**; 0,75sn hasar cooldown; oyuncuda −11 kalkan ve hızın ×0,71'e düşmesi; botta eşit hasar ve hız cezası.
- Üç geçit öncesinde mavi hız işaretleri, doğu hattında turuncu avcı beacons, başlangıçta üç yanal rota işaretleyicisi.
- HUD oyuncunun **ana / hızlı / avcı** hattında olduğunu anlık gösterir.

### Yapay zekâ ve uçuş sistemi
- H1'i etkilemeden H4-Sprinter batıya ve H4-Hunter/Elite doğu hattına yönelmeye çalışır; geri kalan pilotlar güvenli merkezde kalır.
- Gerçek bot ve oyuncu ilerlemesi tek bir H4 fonksiyonda ve pilotun kendi X pozisyonuna göre hesaplanır; diğer etapların 60sn kilidi ve uzay çıkışı korunur.
- Erken avcı spawn'larının çoğu doğu hattına dağıtılır; 60sn avcı arenasında mevcut arena devriye kuralı korunur.
- W03 açık sınırlama: mevcut yönlendirme hâlâ ana ileri yolculuk boyunca sağ/sol/irtifa hareketidir; ayrı geometrik kısa mesafe şeritleri ve tam bağımsız 6DOF dünya henüz yoktur. Batı hız kazancı geometrik kısayolun oyun mekaniği karşılığıdır.
- Aynı zamanda endüstri bina çarpışması (aşama 3), bitişte zorunlu 850 irtifa ve H1 fizik görünümü değişmemelidir.

### Kabul kapıları
- [x] Üç rota ayırt edilebilir, oyun içinde görünen işaretlere sahip.
- [x] Batı hattında gerçekten daha yüksek ilerleme; ana ve avcı hatları aynı temel ilerleme.
- [x] Gerçek görünen üç dar kaya geçidinde süpürmeli çarpışma; merkez hat çarpışmasız.
- [x] Doğu hattında gerçek avcı spawn fırsatı; imha puanı gerçek atışta verilir.
- [x] H4 AI stilleri başlangıç rota tercihi yapar.
- [ ] Gerçek oyuncu denge/hız/çarpışma hissi onayı.
- [ ] Görsel kalite için kayalardaki benzeşimli köprü kemerleri ve genişlemiş canyon wall'ların son cilası (W09).

Detaylı W03 teknik uygulama bu bölümde kayıtlıdır. Sıradaki W04 60 saniyelik savaş alanının gerçek çok-cepli dizaynıdır.

## W04 — Tam 60 saniyelik üç cepheli savaş ovası

### Fiziksel konum ve görsel içerik
Üç cephe **aynı gezegen arenası içinde** bulunur; oyuncu veya rakiplerin farklı haritalara ışınlanması gerekmez. Oyuncu alanın ortasında sabit ileri ilerleme düzleminde manevra yapar; sağ/sol ve irtifa özgürlüğü devam eder.

| Cephe | Yerel X | Hedef havuzu | Görsel/oynanış kimliği |
|---|---:|---|---|
| AÇIK MERKEZ | 0 | 3 normal avcı (3×24 HP) | Açık görüş; alçak ikaz direkleri, merkez ışık işaretleri; en erişilebilir savaş |
| KRUVAZÖR ENKAZI | −1250 | 3 normal avcı (3×24 HP) | Büyük düşmüş gemi gövdesi, kırık kanatlar, motor kalıntıları; farklı yükseklikte devriyeler |
| ELİT SAVUNMA HATTI | +1250 | 2 elit avcı (2×48 HP) | Zırhlı hatlar, iki savunma kulesi ve kırmızı ikazlar; yüksek HP, yüksek puan |

- Başlangıçtaki **8 gerçek avcı havuzu** korunur; görünmez yeni avcı veya sahte imha yok.
- Normal düşman +1, elit +3 puan. Ödül ancak gerçek silah isabeti ile ölümcül darbeyi veren pilota gider.
- Avcıların cepheye bağlanmış ayrı **ileri/geri devriye bantları** ve x/y süzülme menzilleri vardır. İmha edilen hedef, 1,6sn sonra aynı cephede tekrar doğar (farklı konuma sıçrama yerine yerel devriye).
- Alan başında mevcut avcı havuzu yeni sahaya taşınır. Maç içinde yeni düşman mesh'leri oluşturulmaz; tekrar başlatma hâli temizlenir.
- **Oyun süresi:** aşama 2 tam 60 saniye; ileri ilerleme kilidi korunur. Yan ve dikey manevra engellenmez.
- AI profilleri kendi cephe stratejileriyle savaşır: Elite yüksek değerli sağ hattan, Hunter sol enkazdan; Sprinter/Cautious açık merkezden, Balanced enkaz tarafından hedef arar.
- Oyuncuya açık/enkaz/savunma ayrımı HUD'da, her cephedeki **gerçek imha sayıları** ile sunulur. Oyun durumu telemetrisi her cephe için canlı hedef ve pilot imhalarını taşır.
- Yeni dekorlar ilk W04'te **görsel kompozisyondur**: yeni oluşturulmuş 3D batarya/yıkıntı yüzeyleri için görünmez hasar kutusu iddia edilmez. Bu arena etkileşiminin ana fiziksel unsuru **vuruş alanı ve hareketli uçak hedefleri**dir.

### Kabul ve regresyon
- [x] Üç ayrı adlandırılmış, statik kompozisyon ve mesafe yönetimli tek sahne.
- [x] Gerçek 3+3+2 havuz dağılımı, iki elit yalnız savunma kanadında.
- [x] Her cephe için kendi hız/yükseklik/genişlik karakterinde avcı devriyeleri.
- [x] Oyuncu ve AI için aynı vuruş/hasar/puan koşulları; cepheye özel imha sayaçları.
- [x] Tam 60sn ilerleme kilidi, ardından endüstriye devam.
- [x] Yeniden başlatmada cephe/mesh ve sayaç birikmemesi, Harita 1 izolasyonu.
- [ ] Oyuncu hedef erişilebilirliği / savaş temposu / hedef yoğunluğu son onayı.
- [ ] Görsel kaplama, çevresel hasar etkileri, ek ses ve devriye dalgalarının final dengesi (W09).

**Sıradaki W05:** sanayi binalarını üç boyutlu gerçek alternatif geçitlere bağlayacak boru, köprü ve fabrika çatışma sistemi.
