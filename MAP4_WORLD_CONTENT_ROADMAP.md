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
