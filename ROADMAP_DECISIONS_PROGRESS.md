# UZAY YARIŞI / SAVAŞ OYUNU — KARARLAR VE GELİŞTİRME TAKİBİ

**Güncelleme:** 16 Kasım 2026  
**Sahiplik:** Kullanıcı oyun/tasarım kararlarının korunmasını istedi; geliştirme sırası, teknik uygulama ve kayıt takibi ChatGPT tarafından yürütülecek.  
**Ana kaynak:** [Harita 4 grafik master planı](MAP4_GRAPHICS_MASTERPLAN_VQ04_PLUS.md). Bu dosya master planı **değiştirmez**; eski kararları, kanıtı ve güncel yapıldı/yapılmadı durumunu tek yerde tutar.

## 0) Nasıl kullanılacak? (Adım kaybetmeme sözleşmesi)

- Her görev eşsiz **ID** alır. Karar / tasarım şartı silinmez; kapsam değişirse değişiklik tarihi ve eski kararın gerekçesi kaydedilir.
- Durumlar: **YAPILDI-MAIN** (kod ana dalda, doğrulanabilir commit var); **GELİŞTİRME-PR** (kod ayrı dalda/PR açık, yayımlanmış değil); **KISMEN** (bir kısmı uygulandı); **YAPILMADI** (işlenmiş kod kanıtı yok); **DOĞRULAMA** (uygulama var ama belirli kabul kanıtı eksik); **BİLİNMİYOR** (mevcut kaynaklarla doğrulanamadı).
- 'Yapıldı' demek **otomatik olarak** 'CI geçti', 'oyuncu test etti', '1080p 60 FPS' veya 'görsel kalite 8/10' demek değildir. Bunlar ayrı kabul kapılarıdır.
- Sıradaki göreve geçmeden önce: görev hedefi, korunan kurallar, kod/PR, otomatik testler, ekran görüntüsü, performans, kullanıcı estetik onayı ve durum kaydı güncellenir. İlgili kategorilerden uygulanmayanlar açıkça belirtilir.
- Bir geliştirme konuşmasının sonunda bu dosyanın **Durum / Kanıt / Sonraki adım / Günlük** alanları güncellenir. Açık işler atlanmaz; öncekinin eksikleri kayıt altında tutulur.
- **Sohbetten alınan kararlar** ile **GitHub'dan doğrulanan uygulamalar** birbirine karıştırılmaz.

## 1) Kilitlenmiş ürün kararları (KD)

| ID | Karar | Durum | Kaynak / not |
|---|---|---|---|
| KD-01 | Nihai oyun **6 harita** içerir. | KARAR | Önceki oyun tasarımı sohbetleri |
| KD-02 | **İlk yayıncı sunumunda en az 3 harita oynanabilir** olacaktır; hızlı prototip + ikna gücü, ardından tam üretim. | KARAR / SUNUM HEDEFİ AÇIK | Önceki yayıncı stratejisi |
| KD-03 | Öncelikli prototip ekseni **Harita 1, 3 ve 4**; hazır oldukları varsayılmaz. | KARAR / DOĞRULAMA | Önceki tasarım bağlamı |
| KD-04 | Gemini yalnızca mevcut HTML üzerinde dar kapsamlı **oyun içi** geliştirme yapar. GitHub, commit, yedekleme, plan, büyük toplu iş Gemini'ye verilmez. | KARAR | Önceki iş bölümü |
| KD-05 | Her çalışma mevcut oyuna eklenir; **oynanış, çarpışma, AI, hasar, puan ve Harita 1 görünümü yanlışlıkla değişmez**. | KARAR / HER PR KABULÜ | Grafik master planı §1 |
| KD-06 | Temel teslim **oynanabilir tek HTML**; çevrimdışı çalışması ayrı test edilir; kaynak kodun tek dosya olması kendi başına offline kanıtı değildir. | KARAR / TEKNİK ALT YAPI VAR | Grafik master planı §1, GFX-01 |
| KD-07 | 'StarBlade benzeri' bir görsel/oynanış zorunluluğu yok. Gezegen atmosferi, yüksek hız, yarış + savaş ile kısa serbest hareket birleşimi kendi kimliğini taşımalı. | KARAR | Oyun tasarımı sohbetleri |
| KD-08 | Görsel hedef: **özgün, sinematik, fiziksel ağırlığı hissedilen askeri-endüstriyel 3D**. Yalnız kutu sayısı, duman, neon veya bloom artırmak kaliteyi çözmez. | KARAR / ESTETİK ONAY AÇIK | Grafik master planı §2 |
| KD-09 | 19 Ekim'de mevcut görüntü yaklaşık **3/10** değerlendirilmişti; otomatik testten 7–8/10 kalite sonucu çıkarılmaz. Kullanıcının gerçek oyun kadrajı onayı gereklidir. | KARAR / GÖRSEL KABUL AÇIK | Grafik master planı giriş/GFX-11 |
| KD-10 | Geliştirmelerde *silüet > orta ölçek yapı > mikro detay*, doğal materyal dili, rota/engel/avcı okunabilirliği ve performans birlikte korunur. | KARAR | Grafik master planı §2 |
| KD-11 | Sanayi, arena, kanyon, üs/yörünge **birbirinden farklı görsel kimlikte** olacaktır. | KARAR / UYGULAMA KISMİ | Grafik master planı §2, §4 |

### Altı haritalı tasarım özeti (UH)

| Harita | Kabul edilmiş niyet | Uygulama kanıtı / sonraki kapı |
|---|---|---|
| UH-01 / Harita 1 | Saf hız yarışı; savaş kapalı; eşit hız ve adil başlangıç; 5 rakip, 10.000 mesafe, eğrisel rota/asteroitler | **KISMEN/DOĞRULAMA**: ana HTML ve Harita 1 regresyon testleri mevcut; son oynanabilir kalite kullanıcıdan doğrulanmalı |
| UH-02 / Harita 2 | **Bu depoda tasarım ve uygulama durumu doğrulanmadı**; geçmişten kesin tanım bulunmadan yeni kural uydurulmaz | **BİLİNMİYOR** |
| UH-03 / Harita 3 | İlk olarak ana üsse ulaşıp yok etme; engelleme görevi yok | **KARAR; UYGULAMA BİLİNMİYOR** |
| UH-04 / Harita 4 | 4 bölümlü dev gezegensel yarış/av/engelden kaçınma/yörünge yükselişi | **KISMEN UYGULANDI**: kapsamlı harita, GFX05B main, GFX05C PR |
| UH-05 / Harita 5 | Önceki sohbette 'ilk öneri' seçilmişti; **önerinin ayrıntısı bu belgelerde henüz doğrulanmadı**, tahminle yeniden yazılmaz | **KARAR İZİ; AYRINTI BİLİNMİYOR** |
| UH-06 / Harita 6 | 10 tur hayatta kalma; tur bazlı sıralı başlatma, 3 can | **KARAR; UYGULAMA BİLİNMİYOR** |

## 2) Harita 4 — kesin oyun ve dünya kuralları (H4-K)

| ID | Kilit kural | Uygulama / test durumu |
|---|---|---|
| H4-K01 | Tek bağlantılı dünya, dört bölüm; toplam ilerleme **0–50.000**, üst zaman **300 sn**. | **KODDA VAR** — master plan / smoke testler |
| H4-K02 | 1. bölüm: yaklaşık **40 sn**, 0–12.500, geniş vadi ve 3 anlamlı rota. | **KODDA VAR; GÖRSEL KALİTE KISMİ** |
| H4-K03 | 2. bölüm: **tam 60 sn**, büyük serbest av arenası; ileri yön ilerleme **kilitli**, yanal/dikey uçuş ve düşman avı açık. | **KODDA VAR; KORUNACAK** |
| H4-K04 | 3. bölüm: yaklaşık **85 sn**, 14.000–34.000, avcı + bina/engel geçişi ve sanayi. | **KODDA VAR; SANAT DÖNÜŞÜMÜ EKSİK** |
| H4-K05 | 4. bölüm: yaklaşık **95 sn**, 34.000–50.000, üs/liman/av ve **en az 850 irtifayla** atmosferden çıkış. | **KODDA VAR; SİNEMATİK KALİTE EKSİK** |
| H4-K06 | Bölge alanı baştan **çok geniş ve dolu** olmalı; yumuşak sınırlar; yarıçaplar yaklaşık 3700 / 4100 / 3350 / 3550. | **KODDA VAR** — W02 genişleme |
| H4-K07 | Kanyon: güvenli orta hat, **+%18 hızlı batı**, avcı odaklı doğu. | **KODDA VAR; KORUNACAK** |
| H4-K08 | Sanayi: **+%12 hızlı alçak boru**, güvenli üst, doğu avcı hattı. | **KODDA VAR; KORUNACAK** |
| H4-K09 | 5 rakip pilot ve gerçek yarış sıralaması; 8 avcı **3 normal + 3 normal + 2 elit**, gerçek imha için **+1/+3 puan**. | **KODDA VAR; KORUNACAK** |
| H4-K10 | Mevcut **6 kaya + 36 sanayi fizik collider** korunacak; sadece görsel objeler görünmez duvar eklemeyecek. | **KODDA VAR; HER PR KONTROL** |
| H4-K11 | Harita 1'in onaylı yarış, görüntü, kamera, HUD, puan ve gemi yapısı ayrı tutulur. | **KODDA VAR; HER PR KONTROL** |

## 3) Harita 4 grafik master planı — durum panosu (GFX)

**Önemli:** İlk master plandaki GFX-04 arena+sanayi, GFX-06 materyaller tanımı geçerlidir. 16 Kasım GFX-05C raporu sonrasında operasyonel GFX-06 dalgası **kalan sanayi büyük sanatları + malzeme çalışması** olarak gruplanacaktır; eski eksik işler silinmez.

| ID | Paket | Gerçek durum (16.11.2026) | Kanıt ve açık kabul |
|---|---|---|---|
| GFX-00 | 12+ kamera screenshot/renderer temel çizgisi | **YAPILDI-MAIN (ölçüm altyapısı)** | [GFX00+GFX02](MAP4_GFX00_GFX02_FIRST_WAVE.md); gerçek GPU FPS açık |
| GFX-01 | GLB katalog/loader/LOD/tek offline HTML | **YAPILDI-MAIN (teknik temel)** | [GFX01](MAP4_GFX01_ASSET_PIPELINE.md), [GFX01B](MAP4_GFX01B_SCULPTED_MODELS_AND_LOD.md); profesyonel asset üretimi ayrı |
| GFX-02 | Çok ölçekli terrain/kaya formu/3 rota | **KISMEN** | 160×40 kanyon, 28 büyük kaya, 8 form; kapsamlı adaptif LOD, arazi sanat kalitesi ve gerçek FPS açık |
| GFX-03 | 12 özel mekânın özgün kahraman 3D sanatı | **KISMEN** | 3 kanyon anıtı + arena sanat geçişleri; geriye kalan 12/12 profesyonel özgün landmark kabulü açık |
| GFX-04 | Savaş arenası + 6 farklı sanayi tesisi | **KISMEN** | [GFX04](MAP4_GFX04_ARENA_VISUAL_PASS.md), [04B](MAP4_GFX04B_CARRIER_GLB.md), [04C](MAP4_GFX04C_ELITE_BATTERY_GLB.md), [04D](MAP4_GFX04D_BATTLE_VFX.md), [04E](MAP4_GFX04E_ATMOSPHERE_LIGHTING.md); **sanayi 6 tesis sanat dönüşümü açık** |
| GFX-05 | 1 oyuncu + 5 rakip + 2 avcı ailesi; model/renk/anatomi | **KISMEN / ANA KOD VAR** | [GFX05](MAP4_GFX05_CRAFT_ART.md), [GFX05B](MAP4_GFX05B_AIRCRAFT_SURFACES.md); ortak prosedürel geometri/atlas var, profesyonel ayrı GLB/LOD/silüet kabulü açık |
| GFX-05C | Paylaşımlı konik çift motor egzozları | **GELİŞTİRME-PR / DOĞRULAMA** | [PR #31](https://github.com/zxc28tarik/daethlyspacerace2202/pull/31), 8 commit ana dalın önünde; CI PASS ve merge teyit edilmedi |
| GFX-06 | Tam ölçekli PBR, atlas, endüstri modeli/decal | **KISMEN** | Gemi yüzeyinde 256² prosedürel atlas var; **6 sanayi düğümü ve dünya geneli artist-made atlaslar YAPILMADI** |
| GFX-07 | Dinamik seçili gölgeler, ana ışık, atmosfer | **KISMEN** | VQ04 sky/fog/bulut ve arenada 2 lokal ışık var; tüm sahne ışık/gölge mastering açık |
| GFX-08 (= VQ05) | Motor/silah/darbe/patlama VFX | **KISMEN** | Kıvılcım, duman, motor egzozu geliştirme dalı var; nihai lazer/patlama/hasar VFX kabulü açık |
| GFX-09 (= VQ06) | Chase/Turret kamera, HUD, post | **KISMEN** | GFX03B HUD sadeleştirme; iki kamerada clipping/720p/1080p/post mastering açık |
| GFX-10 | GPU optimizasyon, kalite profilleri, bundle | **KISMEN** | GLB LOD, paylaşımlı geometri ve offline build temel var; gerçek GPU FPS ve High/Balanced/Low profilleri açık |
| GFX-11 | Görsel kalite kabulü, 12+ kanıt kadrajı, yayın | **KISMEN** | Kadraj/test otomasyonu var; kullanıcı estetik onayı, uçtan uca yayıncı kapısı ve doğrulanmış nihai release açık |

### GFX-05C açık PR'ın kapanış şartları (ÖNCE BU)
- [x] [GFX-05C](https://github.com/zxc28tarik/daethlyspacerace2202/blob/codex/map4-gfx05c-instanced-exhaust/MAP4_GFX05C_INSTANCED_EXHAUST.md) dalında gerçek kod, yeni 3D egzoz ve smoke/art test değişiklikleri var.
- [x] [PR #31](https://github.com/zxc28tarik/daethlyspacerace2202/pull/31) açıldı; 16 Kasım'da **OPEN**, **8 commit ahead / 0 behind**, ana dal **GFX05B**.
- [ ] CI'nin ilgili işleri gerçekten PASS olarak doğrulansın (mevcut connector checks sonucu boş; bu, PASS anlamına gelmez).
- [ ] 28 instance / tek draw call / boost değişimi / restart & Map1 izolasyonu gerçek test çıktıları incelensin.
- [ ] Egzoz açık/kapalı aynı kamera karşılaştırması ve gerçek GPU FPS notu alınsın.
- [ ] Ancak kontroller sonrası PR merge; merge SHA ve tracker güncellemesi işlensin.

## 4) Korunan 12 görsel landmark (LM)

Bunlar master planda tanımlı; **isimli landmark'ın kodda bulunması 'profesyonel 3D sanatı tamam' demek değildir**.

| ID | Yaklaşık ilerleme | Landmark | Sanat kabulü |
|---|---:|---|---|
| LM-01 | 1.950 | Kızıl Kaya Kapısı | **KISMEN**: heykelsi + GLB/LOD, final artist-made model açık |
| LM-02 | 6.100 | Kırık Mesa Sırtı | **KISMEN**: procedural şekil, son detay açık |
| LM-03 | 10.100 | Kanyon Gözleme | **KISMEN**: radar GLB/LOD, son sanat açık |
| LM-04 | 12.640 | Düşmüş Kruvazör | **KISMEN**: hasarlı kruvazör GLB + VFX, profesyonel bake açık |
| LM-05 | 13.220 | Hava Savunma Hattı | **KISMEN**: 2 elit batarya GLB, sahne son ışığı açık |
| LM-06 | 13.770 | Savaş Alanı Yıkıntısı | **KISMEN**: arena model/VFX var, final sanat açık |
| LM-07 | 17.200 | Tasfiye Rafinerisi | **YAPILMADI**: özgün büyük makine/materyal sanat kabulü |
| LM-08 | 23.800 | Makine Kuleleri | **YAPILMADI**: özgün büyük sanayi sanat kabulü |
| LM-09 | 31.600 | Enerji Aktarım İstasyonu | **YAPILMADI**: son 3D mimari sanat kabulü |
| LM-10 | 36.200 | Hudut Karakolu | **YAPILMADI**: son büyük üs modeli sanat kabulü |
| LM-11 | 42.600 | Askerî Uzay Limanı | **KISMEN**: statik gemi örnek GLB, limanın bütün mimari sanatı açık |
| LM-12 | 48.300 | Yörünge Fırlatma Kompleksi | **YAPILMADI**: nihai dev silüet ve yukarı çıkış kadrajı |

## 5) Sanayi özgün sanat işleri — eksiksiz 6 düğüm (IN)

Görsel içerik için önce **büyük silüet**, sonra **oynanabilir orta ölçek**, sonra **yakın detay ve malzeme**. Oyunda bulunan erken W05 yapıları bu sanat kabulünün yerine geçmez.

| ID | İlerleme | Gerekli karakter ve içerik | Durum |
|---|---:|---|---|
| IN-01 | 15.750 | Giriş rafinerisi: ayırma tesisi, tank, baca, boru, kontrol kulesi | **YAPILMADI — son sanat** |
| IN-02 | 18.750 | Yüksek basınç transferi: alçak boru köprüsü, vanalar, destekler | **YAPILMADI — son sanat** |
| IN-03 | 21.850 | Ağır pres ve montaj: asimetrik makine kulesi, gantry, servis platformu | **YAPILMADI — son sanat** |
| IN-04 | 24.950 | Enerji kazanımı: soğutma kuleleri, ısı değiştiriciler, türbin | **YAPILMADI — son sanat** |
| IN-05 | 28.150 | Lojistik ve yükleme: depo, raylı vinç, konteyner, nakliye alanı | **YAPILMADI — son sanat** |
| IN-06 | 31.500 | Son enerji santrali: jeneratör halkaları, güvenlik kontrol, enerji hatları | **YAPILMADI — son sanat** |

Her düğümün kabulü: (1) uzaktan farklı silüet, (2) alt hızlı / üst güvenli / sağ avcı hattı okunabilir, (3) işlevsel yakın makine düzeni, (4) mevcut 36 collider hizası, (5) aynı kamera HUD açık/kapalı görüntü, (6) Map1+restart/arena regresyon ve performans.

## 6) Sıradaki uygulanacak işler (NEXT) — kesin sıralama

| Sıra | ID | Görev | Durum | Bir sonraki kanıt |
|---|---|---|---|---|
| 01 | NEXT-01 | **GFX-05C PR #31 son doğrulama / güvenli merge** | **DOĞRULAMA** | CI + gerçek diff/test + merge SHA |
| 02 | NEXT-02 | **GFX-06A** sanayi 1–2: rafineri ve basınç borusu, büyük özgün silüetler | **YAPILMADI** | gerçek motor içi görüntü, model+test |
| 03 | NEXT-03 | **GFX-06B** sanayi 3–4: ağır pres / soğutma-enerji | **YAPILMADI** | farklı fabrikalar, modeller, collider testi |
| 04 | NEXT-04 | **GFX-06C** sanayi 5–6: lojistik / enerji istasyonu | **YAPILMADI** | altı düğüm karşılaştırmalı galeri |
| 05 | NEXT-05 | **GFX-06D** sanayi PBR atlas, aşınma, decals, paylaşılan LOD/instancing | **YAPILMADI** | malzeme atlas testleri + GPU maliyeti |
| 06 | NEXT-06 | Üs/hangar/uzay limanı/yörünge fırlatma büyük sanat dönüşümü (LM-10..12) | **YAPILMADI** | 3 özgün dev sahne + yükseliş kadrajı |
| 07 | NEXT-07 | GFX-07: sektörler arası seçici ışık, gölge, sis, atmosfer geçişleri | **YAPILMADI** | gün/ışık A/B, performans |
| 08 | NEXT-08 | GFX-08: efekt, mühimmat, hasar ve motor görünümü finalizasyonu | **YAPILMADI** | gerçek olay VFX testi |
| 09 | NEXT-09 | GFX-09: 2 kamera, HUD, post-processing ve okunabilirlik | **YAPILMADI** | 720p+1080p / clipping / savaş |
| 10 | NEXT-10 | GFX-10: LOD, render bütçesi, High/Balanced/Low, offline release | **YAPILMADI** | gerçek donanım FPS + bellek |
| 11 | NEXT-11 | GFX-11: 12+ önce/sonra kare, 5 dk oyun, kullanıcı estetik kararı | **YAPILMADI** | görsel kabul ve sürüm kapısı |
| 12 | NEXT-12 | 6 harita / en az 3 oynanabilir yayıncı prototipi denetimi ve pitch | **YAPILMADI** | harita bazlı gerçek uçtan uca test + demo |

GFX-02 adaptif terrain/LOD, GFX-03'nin kalan hero sanatları, gemi sınıflarında profesyonel LOD/ORM **silinmiş işler değildir**: NEXT-02..11 sırasında art borcu olarak taşınır ve GFX/LM tablosundan kapanış kanıtı gelmeden 'yapıldı' yazılmaz.

## 7) Kalite kapıları (QA)

- [ ] QA-01: İlgili çalışmanın tasarımsal hedefi ve önce/sonra aynı kamera görüntüsü mevcut.
- [ ] QA-02: Gerçek oyun kodu / branch / commit / diff veya PR kaydedildi.
- [ ] QA-03: Harita 1 izolasyonu, 60 sn av kilidi, 300 sn görev, 5 rakip, 8 avcı, +1/+3, 850 irtifa, 6 kaya/36 sanayi collider, restart regresyonu PASS.
- [ ] QA-04: Tek HTML (gerekiyorsa offline) açılıyor, eksik asset fallback çalışıyor.
- [ ] QA-05: Draw call / üçgen / bellek ve gerçek 1080p hedefi: uygun masaüstü GPU'da **60 FPS hedef**, p95 kare süresi <=25ms **planlama hedefi**, başarı garantisi değil. Low/Balanced başlangıç hedefi 30 FPS.
- [ ] QA-06: Gerçek oyun ekranı üzerinden kullanıcı estetik onayı (7–8/10 hedef; otomatik test skoru değil).
- [ ] QA-07: GitHub main birleşimi, sürüm SHA ve belgenin durum güncellemesi.

Bu kutular **bütün proje için evrensel final kapılarıdır**, GFX00 gibi daha önceki işler mevcut olsa da final kabul verilmiş gibi işaretlenmez.

## 8) Değişiklik günlüğü / son durum

- **2026-10-18:** Harita 4'ün geniş 4 aşamalı gezegensel dünya kararı, W02-W05 kapsamı; büyük başlangıç alanı, çevresel doluluk ve üç rota.
- **2026-10-19:** Görsel kalite 3/10 değerlendirmesi; yalnız prosedürel kutu/efekt eklemek yerine özgün sanat üretimine odaklanma.
- **2026-10-20:** [Kapsamlı 12 GFX paketli plan](MAP4_GRAPHICS_MASTERPLAN_VQ04_PLUS.md); GFX00/01/01B/02/03/03B/04/04B/04C/04D/04E uygulama kanıtları.
- **2026-10-21:** GFX-05 ve GFX-05B ana dalda; son doğrulanmış ana dal commit'i [16cabc4fd](https://github.com/zxc28tarik/daethlyspacerace2202/commit/16cabc4fd0ff92d9901a9b611fa14a8287fdb751).
- **2026-11-16:** GFX-05C yeni egzoz sistemi [PR #31](https://github.com/zxc28tarik/daethlyspacerace2202/pull/31) açık; head `4ed2bf502e00839025b14aa136e6b41c5904bcb4`, main gerisinde 0 / ilerisinde 8 commit. **CI PASS veya merge doğrulanmadı.**
- **2026-11-16:** Bu takip dosyası açıldı; bundan sonraki her geliştirmede ID, durum, kanıt ve sıradaki görev burada korunacak.

### Her güncellemenin kısa şablonu

`YYYY-AA-GG | ID | ÖNCEKİ DURUM -> YENİ DURUM | Commit/PR | Test/CI | Ekran/FPS | Açık eksiği | NEXT-ID`

**Bu belgenin amacı tamamlanmamışları gizlemek değil, kaybetmemektir.**


## 9) 17 Kasım 2026 — NEXT-11C5 güncel takip kaydı (önceki tablolar tarihsel snapshot)

**Aktif dal:** `codex/map4-gfx11c5-weathered-pbr-lighting` · [PR #50](https://github.com/zxc28tarik/daethlyspacerace2202/pull/50), **OPEN/DRAFT/UNMERGED** · kod HEAD `316f7ca` (belge commit'i hariç) · [tam CI PASS #44056983930](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44056983930).

- **NEXT-11C5 / GFX-06D + GFX-07 sanayi kısmi yüzey/ışık:** **GELİŞTİRME-PR / CI PASS / İLK GÖRSEL İNCELEME YAPILDI / ESTETİK ONAY AÇIK**. 3 hero UV+shared weathered PBR, 12 nonphysical contact-shadow instance, Map4 phase3 ışık kontrolü; 0 yeni collider; High/Balanced/Low korunuyor.
- **A/B 07, 08, 09:** `map4-browser-smoke-images` artifact'ındaki aynı gerçek Chromium/WebGL build'i 1600×900 görünüm toggle eski/yeni; görselde özellikle **09** iyileşti, **07 ve 08** farkı sınırlı. Sahne kompozisyonu, biçim çeşitliliği, halo ve bazı halka/görsel tekrar sorunları **açık**. [Kanıt ve ayrıntı](MAP4_GFX11C5_PBR_SHADOW_LIGHT_ACCEPTANCE.md).
- **NEXT-11C6 / sahne kompozisyonu, büyük silüet ve kamera okunabilirliği:** **ÖNERİ / YAPILMADI**; mevcut grafik sınırlamalarını, oyun/fizik/navigasyon/Harita1 korumalarını değiştirmeden ele al. 07–09 gerçek WebGL A/B şart.
- **Mutlaka açık:** Kullanıcı 7–8/10 estetik onayı, gerçek GPU 720/1080p FPS/VRAM ve 5 dk uçuş, en az 3/6 oynanabilir yayıncı haritası.
- **Birleşim:** Kullanıcı açık onayı olmadan **PR #50 dahil stacked merge yok**. Main'deki durum ile taslak PR'daki iş asla aynı statüye indirgenmez.

**Günlük:** `2026-11-17 | NEXT-11C5 | GELİŞTİRME-PR/CI PASS -> GÖRSEL İNCELEME YAPILDI; ESTETİK BLOKER AÇIK | PR #50 / 316f7ca / CI #44056983930 PASS | 07-09 A/B denetlendi, native GPU YOK | kullanıcı onayı YOK | NEXT-11C6 önerisi`.


## 10) 17 Kasım 2026 — NEXT-11C6: büyük silüet ve kadraj derinliği

- **NEXT-11C5:** [PR #50](https://github.com/zxc28tarik/daethlyspacerace2202/pull/50) üzerinde teknik CI PASS, ilk gerçek A/B görsel incelemesi yapıldı; kullanıcı 7–8/10 kalite onayı ve native GPU kabulü **açık**. Merge **yapılmadı**.
- **NEXT-11C6:** [kabul belgesi](MAP4_GFX11C6_SILHOUETTE_DEPTH_ACCEPTANCE.md) · **GELİŞTİRME-PR / CI VE GÖRSEL KABUL BEKLİYOR**. Altı tesisin çevresine eklenen **3 özgün mimari aile / 12 görsel-only instanced kompozisyon**. Yeni collider ve ışık yok. GFX11C4/C5 malzeme, işaret ve orijinal navigasyon korunur. Gerçek 07/08/09 WebGL önce/sonra QA testleri yeni workflow adımıdır.
- **Sıradaki kapı:** CI son HEAD PASS → artifact 07/08/09 görsel denetimi → sınırlı estetik düzeltme → kullanıcı onayı. Teknik başarıyı estetik onay yerine yazma.
- **Yayıncı kapsamı:** 6 harita, ilk sunumda 3 oynanabilir hedefi değişmedi. NEXT-12 bitmedi. Tam oyun / gerçek cihaz / 5 dk uçuş gereksinimleri açık.
- **Merge kuralı:** NEXT-11C6, önceki NEXT-11C5 üzerine stacked PR'dır; açık kullanıcı onayı olmadan merge yok.

**Günlük:** `2026-11-17 | NEXT-11C6 | YAPILMADI -> GELİŞTİRME-PR | 3 özel 3D silüet/12 instance | CI ve 07-09 görsel kanıt açık | yeni fizik yok | kullanıcı kabulü açık | NEXT-11C6 CI ve görsel inceleme`.


## 11) 17 Kasım — NEXT-11C6 ilk estetik reddi ve onarılmış kanıt

- **PR:** [#51 NEXT-11C6](https://github.com/zxc28tarik/daethlyspacerace2202/pull/51) **DRAFT**, stacked [PR #50](https://github.com/zxc28tarik/daethlyspacerace2202/pull/50) üzerine; merge yok.
- **İlk sürüm:** Chromium 07/08/09 A/B, 3 batch/12 instance, fizik/grafik profilleri PASS; tam CI [#44063534231](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44063534231) **PASS**. Ama görüntüden 07 büyük slab, 08 açık renkli blok, 09 zayıf etki nedeniyle **ESTETİK YETERSİZ**.
- **Kod onarımı:** `ea0342d` — dev levhalar daraltıldı, pozisyon/ölçek ayarı, açık iskelet, soğuk PBR shared metal atlas/UV (yeni texture yok). Yeni test `5cb4be2` 3 aile UV/PBR paylaşımını denetler.
- **Son gerçek 07/08/09 A/B:** onarım HEAD `6caec39`, [hızlı CI #44065387823 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44065387823). Alanı değişen pikseller: 07 **%7,80**, 08 **%4,13**, 09 **%1,97** (ilk aşamada %17,01/%9,88/%3,60). Görselde 07/08 fazla büyük kutu etkisi azaltıldı; 09 hâlâ zayıf.
- **Onarım HEAD tam CI:** [#44065388118](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44065388118) **BEKLEMEDE / SONUÇ DOĞRULANMADI**. Önceki PASS'i bu commit'in tam PASS'i gibi yazma.
- **NEXT-11C6 statü:** **GELİŞTİRME-PR / DÜZELTİLMİŞ WEBGL A/B PASS / ESTETİK ONAY YOK**. Hedef 7–8/10 açık.
- **NEXT-11C7 önerisi, henüz YAPILMADI:** 07/08/09'ta yığılan eski **görsel-only** nesnelerin yeniden biçimlendirilmesi/sadeleştirilmesi, işlevsel fabrika kimliği, derinlik ve doğal çevresel ışık. BEACON/HIGH_MARKER, 6/36/200 collider ve oynanış kuralları kesin korunacak.
- **Diğer açık kapılar:** native GPU FPS/p95/VRAM, 5 dk gerçek uçuş, 3/6 oynanabilir yayıncı haritası ve açık kullanıcı merge/onay kararı.

**Günlük:** `2026-11-17 | NEXT-11C6 | GÖRSEL PROTOTİP -> İLK ESTETİK RED -> ONARIM WEBGL PASS | PR #51, ea0342d/5cb4be2/6caec39 | hızlı CI #44065387823 PASS, tam CI #44065388118 açık | 07/08 iyileşti, 09 ve genel 7-8/10 açık | NEXT-11C7 önerisi`.


## 12) 17 Kasım 2026 — NEXT-11C7 sanayi malzeme/kompozisyon kalite turu

- **Önceki:** [NEXT-11C6 PR #51](https://github.com/zxc28tarik/daethlyspacerace2202/pull/51) DRAFT, eski tam CI [#44065388118](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44065388118) **PASS**. Gerçek estetik 7–8/10 onayı henüz yok.
- **Aktif:** [NEXT-11C7 PR #52](https://github.com/zxc28tarik/daethlyspacerace2202/pull/52) **DRAFT/STACKED**, main merge yok. Kod `5efc90a`: 12 W05 nonphysical deck, 2 GFX11C dekoratif instanced grup, görsel-only industrial ground mat normal, phase3 High/Balanced güneş/sis ayarı; 0 yeni collider/mesh/texture/light, BEACON/HIGH_MARKER korunacak.
- **İlk gerçek ekran A/B:** [hızlı CI #44067126151 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44067126151); 07 ve 08'de renk/dekor sadeleşmesi, 09 hâlâ fazla baskın ve büyük IN06 halka silüetleri. **Kullanıcı estetik onayı verilmedi.**
- **Hedefli 09 onarım:** `c4a1944` IN06 iki visual-only power toroid PBR koyulaştırma, 0.76 scale (toggle orijinal ölçekleri kayıpsız geri yükler); test `4eb8643` 17 style ve ölçek A/B koruması. [Yeni hızlı CI #44067601417](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44067601417) **sonuç ve ekran görseli henüz açık**.
- **Korunan ürün sözleşmesi:** 6 harita, ilk yayıncı sunumuna ≥3 oynanabilir; Harita 4 4 bölüm/60s arena/300s/850m, 5 rakip/8 avcı, 6/36/200 collider. Bu görev oynanış değil yalnızca görsel kalite.
- **Kapanmayan kabul:** onarım HEAD tam CI, gerçek WebGL 07/08/09 göz incelemesi, native GPU 720/1080p FPS/p95/VRAM, gerçek 5dk oyun, kullanıcı görsel 7–8/10 onayı, 3/6 playable publisher.
- **Sıradaki karar:** Yeni gerçek görüntüleri denetle. Sorun sürüyorsa görsel-only mimariyi ve 09 çıkış kadrajını yeniden ele al, korunan fizik/navigasyona dokunma. Birleşim için kullanıcı açık onayı şart.

**Günlük:** `2026-11-17 | NEXT-11C7 | YAPILMADI→GELİŞTİRME-PR | PR#52 / 5efc90a / c4a1944 / 4eb8643 | İlk A/B CI PASS, onarım QA açık | görsel puan açık | NEXT11C7 HEAD kalite kapıları`.


### NEXT-11C7 devam — 09 ekranındaki baskın gerçek geometri

- IN06 nonphysical power toroid düzenlemesi `c4a1944` hızlı WebGL `4eb8643` [#44067601417 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44067601417); **09 sabit kadrajda etkisi %0** olduğu görüldü. Yanlış etki varsayımı bırakılmadı.
- Sabit 09'daki yakın halka yapıları için NEXT11C4 ENERGY ailesindeki yalnız **index 2 ve 3** visual-only instance **%22 küçültüldü**, cached original matrices ile geri alınabilir (`838a630`). 10 diğer C4 instance, W05 navigasyon ve bütün collider korunuyor.
- `3c60510` test başına 2 hero instance geri dönüşünü ekledi. [Hızlı #44068083063](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44068083063) ve [tam #44068083006](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44068083006) **güncel HEAD sonucu açık**.
- **NEXT:** Ekranları gözle karşılaştır; 7–8/10 kullanıcı onayı olmadan estetiki kapatma, PR merge yok.


### NEXT-11C7 gerçek 09 görsel incelemesi — 17 Kasım sonuç

- `838a630` / `3c60510`: yalnız iki C4 ENERGY visual-only site6 instance %22 küçültüldü; original matrix A/B geri yüklenebiliyor.
- **Tekrarlanabilir Chromium/WebGL art QA:** [hızlı #44068083063 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44068083063). Gerçek 1600×900 07/08/09 görüntüleri 3 A/B çift; 15+2 = 17 curated material slotu ve 2 nonphysical C4 matrix geri dönüşü PASS.
- **Fark ölçüsü:** 07 %35,37; 08 %27,13; 09 %32,80 önce/sonra changed pixels. 09'un önceki C7 son görseline kıyasla **%18,38** ek görüntü değişimi oldu. Bunlar **estetik kalite puanı değildir**.
- **Sanat kararı:** 09 ön plan halkaları fiziksel oyun yönlendirmesi olmadıkları için küçültüldü; görüş açıldı. Fakat görüntü hâlâ yaklaşık hedef 7–8/10 seviyesine **onaylı değil**, geniş kutu/zemin/orta mesafe makine detayları çözülmedi.
- **Güncel kod tam CI** [#44068083006](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44068083006) **SONUCU BEKLENİYOR**; hızlı CI ile karıştırma.
- **NEXT-11C8** **ÖNERİ / YAPILMADI:** Büyük fiziksel W02 kütlelerin collider kimliği değişmeden daha inandırıcı sanayi cephesi/işlevi, bölgesel tekrar/ışık/zemin çözümleri, gerçek 07/08/09 + hareketli kamera görsel QA. Bütün eski karar, harita ve fizik testleri devam eder.
- **Hiçbir merge yok:** PR #50/#51/#52 DRAFT, main birleştirmesi kullanıcı açık onayına bağlı.


## 13) 17 Kasım 2026 — NEXT-11C8 korunan kabukların endüstriyel cephe/zemin turu

- **Önceki bağımlılık:** [NEXT-11C7 PR #52](https://github.com/zxc28tarik/daethlyspacerace2202/pull/52) DRAFT; tam kod regresyonu [#44068083006](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44068083006) **PASS**. Kullanıcı 7–8/10 estetik kabulü ve gerçek native GPU ölçümleri açık.
- **Aktif:** [NEXT-11C8 PR #53](https://github.com/zxc28tarik/daethlyspacerace2202/pull/53) **DRAFT / STACKED**, PR #52 üzerine; main'e merge **yok**. [Kabul dokümanı](MAP4_GFX11C8_AUTHORED_FACADES_GROUND_ACCEPTANCE.md).
- **Kod:** `117b7af` — eski 34 W02 korunan fiziksel kabuğun üzerine **22 blok/12 kule** için yerel UV'li, havalandırma louver'lı, dikey ısı tahliye flütlü yeni orijinal BufferGeometry'ler; **2 InstancedMesh / 20.760 visual-only üçgen**. `h4Gfx11c8SetLook(true/false)` ile AB. Tek 256² deterministik endüstriyel aşınmış beton/zemin atlası. C7 ground matını koruyup yalnız phase3 High/Balanced'ta değiştir; Low ve diğer fazlarda gizli.
- **Koruma:** 6 kanyon +36 sanayi +200 yapı collider, orijinal 34 W02 mesh geometri + collider referansları, 24 W05 BEACON/HIGH_MARKER, 5 rakip/8 avcı, arena 60s, yarış 300s, yörünge 850m; Map1 ve önceki C3–C7 içerik. **0 yeni collider, 0 ışık**.
- **İlk gerçek QA:** [C8 hızlı #44069920712](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44069920712) **PASS**, gerçek 07/08/09 1600×900 A/B PNG. Piksel farkı 07 %22,20 / 08 %11,89 / 09 %6,83 (ortalama RGB >1/255 eşik; **sanatsal puan değil**). 07/08 zemini daha malzemeli, ancak dev kutu/sanayi topografyası ve 09 dekor tekrarları sürüyor. **KULLANICI 7–8/10 ONAYI YOK**.
- **Hata kaydı:** [İlk full #44069920780](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44069920780) **FAIL** çünkü C8 ground overlay, eski C7 tek başına testte 17/17 yerine 16/17 style gösterdi. Bağımsız C7 A/B testi C8 katmanı kapatılarak `b76c148` düzeltildi; hızlı workflow'da C7 + C8 birlikte zorunlu (`e31c9ca`). [Hızlı #44070620158](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44070620158) **yeni sonucu kontrol edilecek**; tam CI yeni SHA PASS ise sonradan işaretle.
- **Kalan kapılar:** C7+C8 hızlı test PASS, güncel tam regresyon PASS, 07/08/09'da insan estetik kalite değerlendirmesi (hedef 7–8/10), native 720/1080p GPU FPS/p95/VRAM, 5 dk gerçek uçuş, yayıncı 3/6 playable harita.
- **NEXT-11C9 (öneri / YAPILMADI):** İri W02 ön plan yüzeylerinin fonksiyonel okunurluğu, 09 fabrikada aşırı tekrarlı non-nav halkaların ve dev çatının özgün endüstriyel kimliğe kavuşması; rota BEACON/HIGH_MARKER'a, fiziksel AABB'ye ve Map1'e dokunma.

**Günlük:** `2026-11-17 | NEXT-11C8 | YAPILMADI -> GERÇEK KOD + İLK WEBGL PASS + C7 REGRESYON FIX | PR#53/117b7af/3477de6/b76c148/e31c9ca | hızlı C8 PASS, yeni C7/Full kontrol açık | estetik 7-8/10 AÇIK | merge YOK`.

### NEXT-11C8 hızlandırılmış regresyon doğrulaması

- [C8+C7 hızlı CI #44070620158](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44070620158) **PASS**. C8 34 VIS02 protected facades ve gerçek WebGL 07/08/09 + eski C7'nin 17 malzemelik A/B izolasyonu bir arada geçti. Düzeltme `b76c148` önceki C7 smoke hatasını giderdi.
- [Güncel tam smoke #44070620169](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44070620169) **devam ediyor; PASS doğrulanmadı**. Bu teste önceki dalın tam PASS'i aktarılmaz.
- **Sıradaki:** tam CI PASS durumunu kontrol et, gerekirse regresyon düzelt, NEXT-11C9 sanat borcuna ancak sonra geç. Native GPU ve 7–8/10 kullanıcı estetiği açık. **PR #53 DRAFT, merge YOK**.


## 14) 17 Kasım 2026 — NEXT-11C9 işlevsel fabrikalar ve 09 enerji görsel düzeltmesi

- **Ana kayıt:** [NEXT-11C9 PR #54](https://github.com/zxc28tarik/daethlyspacerace2202/pull/54) **DRAFT / STACKED**, [önceki PR #53](https://github.com/zxc28tarik/daethlyspacerace2202/pull/53) üzerine. **Hiçbir merge yok.**
- **Üst basamak CI:** C8 eski tam [#44070620169](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44070620169) **FAIL**: eski GFX06M testinde yeni C8 zemin atlasını tanımayan sert beklenti. `3490618` test düzeltmesi C8 aktifte **eski atlasın fallback olarak kaldığını** ve C8 atlasının **yalnız görünüm katmanı** olduğunu denetler. [C8 yeni tam #44071695510](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44071695510) sonucu henüz doğrulanmadı.
- **C9 oyun kodu `678da1d`:** 34 korunan W02 kabuğa (22 box + 12 tower) fonksiyonel fabrika teçhizatı, 2 visual-only batch. 09'daki C4 ENERGY family yalnız site6 **index2/3** oyuncak gibi concentric halkalı instanceları, orijinal matrisleri cache'leyerek gizleyen A/B; yerine **2 farklı konumda halkasız sanayi güç dağıtım tesisi**, 1 batch. C4 siteleri 4/5 ve 6/36/200 collider kesin korunur. Üç uçuş hattı/W05 navigasyonu değişmez.
- **İlk C9 WebGL QA:** [hızlı #44072695410](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44072695410) **PASS**, gerçek 07/08/09 1600×900 aynı kamera screenshot. **09 halkalarından bacalı/borulu sanayi tesisi silüetine belirgin geçiş** görülüyor. 07/08 çatı düzlüğü yalnız kısmen etkileniyor, hâlâ zayıf; **7–8/10 estetik onayı YOK**.
- **İkinci C9 kompozisyon işi `096f46f`:** 12 W05 gerçek fiziksel `OVERHEAD_PIPE` ve `TRANSFER_BRIDGE` objesine **visual-only** mekanik truss, bakım hattı, üçlü servis borusu/metal çapraz kafes; 1 ilave InstancedMesh, 0 yeni collider/texture/light, kaynak `collider.mesh` kontrolü. Böylece C9 **toplam 4 batch** (2 roof + 1 protected-truss + 1 ring-free power).
- **İkinci QA `900ae30`:** 12 kiriş / 4 drawcall sayımı. Hızlı [#44073322862](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322862) **sonuç bekleniyor**; tam eski C4/5/6/7/8 + yeni C9 browser suite **ayrıca açık**.
- **Korunan kararlar:** 6 harita, ilk publisher pitch için ≥3 playable, Map1 yarışa dokunma, Map4 4 bölüm/60s arena/300s toplam/850m orbit, 5 rakip/8 avcı, sanayi 3 uçuş hattı, 24 W05 BEACON/HIGH_MARKER, 6+36+200 collider, no merged PR.
- **Açık kapılar:** Yeni C9 HEAD hızlı+tam PASS, gerçek görüntü kullanıcı estetik 7–8/10 onayı, 720/1080p gerçek GPU FPS/p95/VRAM, 5 dakika pilot uçuş ve 3/6 playable yayıncı paketi.
- **NEXT-11D veya 11C10 (henüz YAPILMADI):** 07/08 ve 09 gerçek görüntü/hareketli kamera incelemesi sonrasında kalan çevre kalitesi borcuna göre karar; görsel iyileştirmelerin oynanış sözleşmesine sızmamasını sağla.

**Günlük:** `2026-11-17 | NEXT-11C9 | KOD+PR YAPILDI, İLK WEBGL PASS, İKİNCİ KİRİŞ QA AÇIK | PR#54 678da1d 096f46f 900ae30 | ilk 09 estetik belirgin iyileşti fakat 7-8/10 kullanıcı onayı yok | main merge yok`.


### NEXT-11C9 — Son gerçek hızlı WebGL QA, 17 Kasım

- **C8 üst taban:** eski GFX06M atlas ile C8 görüntü katmanı çift sözleşmesi `3490618` sonrası [tam CI #44071695510](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44071695510) **PASS, 31/31 workflow adımı**. PR #53 DRAFT/merge YOK.
- **C9 son kod `900ae30`:** 34 W02 roof birimi, 12 orijinal W05 fiziksel kirişe bağlı **yalnızca görsel çapraz truss** birimi ve 09'daki C4 site6 iki dekoratif halkayı gizleyen iki yeni halkasız endüstriyel manifold tesisi. **4 InstancedMesh batch**, eski fizik ve rota işaretleri değişmedi.
- **Son C9 hızlı QA [#44073322862 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322862)**, 07/08/09 1600×900 gerçek Chromium/WebGL aynı-kamera PNG A/B. Değişen piksel alanı (ortalama RGB >1/255): 07 **%1,21**, 08 **%1,89**, 09 **%18,74**; bunlar **sanatsal puan değildir**.
- **Gözle inceleme:** 09 renkli dev halka yerine tanımlanabilir güç işleme ve egzoz kulesi; belirgin iyileşme. 07/08 kiriş cephelerinde gerçek detay var fakat sahne düzlemine göre hâlâ küçük kalıyor. 09 ön plan büyük düz platform ve atmosfer ışığı sorunu sürüyor; **7–8/10 estetik ONAYI VERİLMEDİ**.
- **C9 tam CI:** [#44073322882](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322882) henüz tamamlanmadı, PASS yazma; son HEAD docs `[skip ci]` içerir, code SHA `900ae30`.
- **NEXT-11C10 / YAPILMADI:** 07/08 için açık okunabilir geniş sanayi görsel kompozisyonu; 09 boş dev ön plan platformunu ve tekrarlanan non-nav dekoratif halkaları işlevsel tesis cephesine dönüştürmek; değişken/moving kamera testleri. Korunan 6/36/200 collider ve BEACON/HIGH_MARKER **değişmeyecek**.
- **Açık QA:** gerçek GPU FPS/p95/VRAM (720p/1080p), 5 dk uçuş, yayıncı ilk pitch 3/6 playable, kullanıcı estetik ve PR merge onayı.

**Günlük:** `2026-11-17 | NEXT-11C9 | C8 FULL PASS, C9 KOD+HIZLI WEBGL PASS, C9 FULL AÇIK | PR#54 / 900ae30 / 0073698 | 07-08 zayıf, 09 belirgin düzeldi | 7-8/10 onay YOK | merge YOK`.


## 16) 17 Kasım 2026 — Özgünlük koruması + NEXT-11C10

**Yeni ve geçerli kullanıcı tasarım kararı:** Örnek oyunlardan ve 3D varlık galerilerinden atmosfer, üretim tekniği ve hedef kalite düzeyine göre **ilham alınabilir**. Ancak tasarım **birebir veya aşırı yakın kopya** olamaz; ürün, harita yerleşimi, özgün ayırt edici model/doku/silüetleri çalınmaz. CGTrader gibi ticari kaynaklardan kaynak asset indirilmez, kod/mesh/doku kopyalanmaz. Kaynakların yalnız **genel görsel kalite kıyasına** izin var. Özgünlük ve 7–8/10 estetik kalite ayrı kabullerdir. [C10 özgünlük sözleşmesi](MAP4_GFX11C10_ORIGINAL_DISTRICTS_ACCEPTANCE.md).

- **Önceki sabit:** NEXT-11C9 [PR #54](https://github.com/zxc28tarik/daethlyspacerace2202/pull/54) DRAFT, tam [CI #44073322882](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322882) **32/32 PASS**. Önceki kullanıcı görsel 7–8/10 onayı **yok**. C9 code 09'da hakiki halkasız enerji silüeti, 07/08'de fonksiyonel çatı/kiriş art; görsel fark 07 %1,21/08 %1,89/09 %18,74; kalite puanı değil.
- **Aktif kod / PR:** [NEXT-11C10 PR #55](https://github.com/zxc28tarik/daethlyspacerace2202/pull/55), DRAFT/STACKED #54 üzerinde, merge yok. Kod `cc75b42` oyun özelinde **3 farklı özgün model geometrisi**: açık ısı geri kazanımı, askılı malzeme transfer gantry'si, basamaklı geri dönüşüm/ayırma. Önceki bir modele benzemek için dış varlık kullanılmadı. 6 konumda 3 batched InstancedMesh, paylaşılmış NEXT11C5 PBR atlas; **0 yeni collider, light, external asset**. Yalnız Map4 sanayi phase3 High/Balanced, Low ve diğer fazlar kapalı.
- **Yönlendirme/fizik:** W05 24 BEACON/HIGH_MARKER kimlik, materyal ve matris değiştirilmedi; 6 kanyon/36 sanayi/200 bina collider korunur. Map1 yarış-only; 5 rakip/8 avcı, arena 60s, yarış 300s, orbit 850m, 6 harita ve ilk pitch ≥3 playable kararı aynen.
- **QA:** `tests/map4-gfx11c10-original-districts.cjs`, 07/08/09 gerçek 1600×900 Chromium/WebGL A/B, 3 drawcalls ve üçgen bütçesi, Low + 1/2/4 phase, gameplay ve korunan fizik. C4–C9 tarihselleri bağımsız A/B için C10 katmanını kapatır. Hızlı CI ve full smoke eklendi. İlk hızlı [#44075783370](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44075783370) **test eşiği FAIL**: gerçek 3.800 görsel üçgene rağmen gereksiz minimum 5.000. `4d24372` test gereksiz eşiği 3.000'e düzeltti; yeni [hızlı #44076017106](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44076017106) **sonuç henüz doğrulanmadı**. Geometri değiştirilmedi.
- **Açık kabul:** C10 güncel hızlı CI, 07/08/09 screenshot görsel incelemesi, güncel full CI, native GPU 720/1080p FPS/p95/VRAM, gerçek 5 dk uçuş, kullanıcı 7–8/10 estetik ve yayıncı ilk pitch 3/6 playable onayı. Main veya herhangi stacked PR merge için kullanıcı açık izni şart.
- **NEXT:** C10 görsel çıktısını kontrol et, çok uzakta veya yapay duruyorsa aynı PR içinde düzelt; gerçek kalite kapanmadan NEXT11C11'e geçme.

**Günlük:** `2026-11-17 | NEXT-11C10 | ÖZGÜNLÜK KARARI ONAYLI, PR#55 KOD+TEST+CI DOSYALARI YAPILDI | HIZLI TEST EŞİK DÜZELTMESİ 4d24372, GÜNCEL QA AÇIK | 7–8/10 ONAY YOK | MERGE YOK`.


### 17 Kasım — NEXT-11C10-B ilk ekran görüşü ve zemin bağlamı düzeltmesi

- [İlk C10-A gerçek WebGL #44076017106](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44076017106) **PASS**, 07/08/09 aynı-kamera screenshot. Değişen RGB ortalama piksel alanı eşik >1/255: **07 %1,76; 08 %0,60; 09 %9,42**. Sayılar **kalite puanı değil**; 07/08 üretim silüetleri uzakta, büyük açık zemin hâlâ yapay. **7–8/10 kabul yok**.
- C10-B kod `bd016e3`: oyuna özel ve dış kaynak kullanmayan **6 açık bakım yolu/servis alanı** (07/08/09 üç bölge × iki taraf) statik mesh ile düz sanayi arazisini bağlar; materyal kendi vertex-color geometrisi, yeni texture, collider, ışık **yok**. Eski 3 sanayi aile batch + 1 statik servis zemini drawcall. Eski W05 BEACON/HIGH_MARKER, 6/36/200 collider değişmez.
- Yeni `074625d` gerçek Chromium/WebGL testi 4 drawcall, altı nonphysical servis alanı, bütçe, High/Balanced/Low ve phase 1/2/4 izolasyonu denetler. [Son hızlı #44076681861](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44076681861) **henüz sonuç bekleniyor**. [C10-A ilk QA PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44076017106) güncel C10-B QA yerine geçmez.
- Özgünlük ilkesi **devam ediyor**: CGTrader veya başka bir üçüncü taraf hazır modelin ayırt edici mimarisi, geometri/doku/yerleşimi kopyalanmadı; görsel araştırma yalnız ilham. Kullanıcı açık merge onayı olmadan main'e PR alınmaz.
- **Kalan kabul:** güncel C10-B hızlı ve full CI, 07/08/09 gerçek ekran göz incelemesi, GPU FPS/p95/VRAM native, beş dakikalık uçuş, yayıncı 3/6 playable, kullanıcı estetik 7–8/10.

**Günlük:** `NEXT11C10-B | KOD/QA GEOMETRİ EKLENDİ | bd016e3/074625d | HIZLI CI/SCREEN AÇIK | 7-8 ESTETİK ONAY YOK | PR55 DRAFT, MERGE YOK`.


### NEXT-11C10-B son hızlı görsel kontrolü — 17 Kasım

- **Güncel C10-B renk onarımı `7a37470`:** eski açık renkli servis şeritleri, yeni koyu tonemapping'e girmeyen matte vertex-colors malzemesiyle giderildi.
- [Hızlı Chromium/WebGL QA #44077131958](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44077131958) **PASS 9/9 job adımı**, güncel oyun kodu + 07/08/09 aynı-kamera görüntü arşivi `map4-next11c10-07-08-09`. 3 özgün sanayi aile batch + 1 servis-yol Mesh drawcall; 6/36/200 collider ve 24 W05 BEACON/HIGH_MARKER değişmedi.
- **Son gerçek ekran görsel incelemesi:** aşırı açık beyaz şeritler kalktı. Önce/sonra değişen RGB alanı (eşik ortalama 1/255, HUD dahil) 07 **%2,72**, 08 **%1,14**, 09 **%9,62**. Sayılar yeni çizimin gözlenen değişimi, **7–8/10 estetik puanı değildir**. 07/08'in büyük düz mimari ve uzak ufuk kompozisyonu hâlâ yeterli değil.
- **Güncel full regression:** [#44077131964](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44077131964) sonucu **henüz tamamlanmadı**; geçtiği teyit edilmeden 'full PASS' yazılmaz.
- **Açık:** özgünlük yaklaşımı sürdürülür; CGTrader referansını kopyalama / dış mesh alma yok. Native GPU FPS/p95/VRAM, 5dk gerçek uçuş, 3/6 yayıncı haritası ve kullanıcının 7–8/10 onayı; açık izin olmadan merge yok.


## 17) 17 Kasım 2026 — NEXT-11C11 yakın görünür fabrika cephesi

- **Bağımlılık tamam:** [NEXT-11C10 PR #55](https://github.com/zxc28tarik/daethlyspacerace2202/pull/55) DRAFT; [full Map1/Map4 CI #44077131964](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44077131964) **33/33 PASS**, fizik ve performans olmayan eski testleri doğruladı. C10 07/08 görsel kalite hâlâ yetersiz.
- **YENİ PR:** [NEXT-11C11 #56](https://github.com/zxc28tarik/daethlyspacerace2202/pull/56) **DRAFT STACKED** #55 üstünde. Main veya PR50–55 birleştirilmedi, kullanıcı onayı beklenecek.
- **Kod `0aeaddf`:** eski W02 34 fiziksel kabuğun 07/08 kamera yakın alanına dahil olan `progress<29200` altkümesi, iki özgün matematiksel görsel-only instanced panel ailesiyle işlevsel görünür cepheye kavuşuyor. Bloklarda büyük servis-havalandırma karanlık bay'leri, üst metal sabitleyiciler ve geniş çapraz olmayan louver; kulelerde 7 açık bölmeli ısı değiştirme ızgarası. Görsel materyal eski 256² C5 PBR atlasıyla değişir, `h4Gfx11c11SetLook(false)` önceki tüm fiziksel mesh malzemelerini geri verir. Mesh geometry/collider AABB pointer'ları **asla değişmez**.
- **Performans/yol:** 2 batched InstancedMesh ile geometri, 0 yeni collider/light/texture, sıfır dış model; 24 W05 BEACON/HIGH_MARKER; 6/36/200 collider, 5 rakip/8 avcı, 60s arena/300s yarış/850m orbit, Map1 saf yarış ve yayıncı ilk pitch minimum 3/6 playable. High/Balanced Map4 phase3 açık, Low ve 1/2/4 phase kapalı.
- **QA:** `tests/map4-gfx11c11-nearfield-facade-relief.cjs` gerçek Chromium/WebGL 07/08/09 1600×900 A/B, eski geometri kimlikleri/physics/markers, drawcall/tri/memory ve toggle/Low/phase kapıları. C4–C10 bağımsız eski A/B'ler C11 yeni katmanını kapatarak test edilir. `.github/workflows/map4-next11c11-visual-preview.yml` ve tam browser smoke eklendi.
- **İlk QA hata:** ilk C11 [hızlı #44079550403](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079550403) **FAIL**: başlatılan oyunun phase1 olması nedeniyle doğru biçimde henüz aktif olmayan C11 materyali, ilk testte yanlışlıkla açık beklenmiş. `3894441` test gereksiz beklentiyi **başlangıçta eski materyal** olacak şekilde düzeltir. Oyun kodu arızası saptanmadı. [Güncel hızlı #44079786753](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786753) ve [full #44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) **sonuç henüz açık**. PASS onaysız yazma.
- **Özgünlük: kalıcı kesin karar:** CGTrader dahil ticari 3D paketinden mesh, doku, karakteristik bina ve ayırt edici yerleşim kopyalama yok. Genel endüstriyel atmosfer/teknik kalite ilham alınabilir. [C11 kabul sözleşmesi](MAP4_GFX11C11_NEARFIELD_FACADE_ACCEPTANCE.md).
- **Açık:** Güncel hızlı/son full CI, gerçek 07/08/09 screenshot göz incelemesi; 720/1080 native GPU FPS/p95/VRAM, tam 300s pilot uçuş, kullanıcı 7–8/10 estetik onayı, yayıncı 3 playable ve merge açık izni.

**Günlük:** `2026-11-17 | C11 YAPILDI KOD + TEST DOSYASI + DRAFT PR56 | 0aeaddf/3894441 | GÜNCEL HIZLI/FULL CI AÇIK | SÜRÜMÜ EKRANDAN GÖR KALİTE KARARI | GÜNCEL MERGE YOK`.


### NEXT-11C11 — Son hızlı CI ve gerçek ekran incelemesi

- [C11 güncel hızlı WebGL #44079786753 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786753), 9/9 job adımı. 07/08/09 gerçek 1600×900 aynı-kamera A/B render artifact `map4-next11c11-07-08-09-review` incelendi.
- **Gerçek kod bütçesi:** 26 fiziksel W02 kabuk (17 blok, 9 yedi yüzlü kule) görsel makro cephesi, **2 batched InstancedMesh**, **22.308 visual-only üçgen**; 34/34 eski fiziksel shell geometry/AABB, 24 W05 BEACON/HIGH_MARKER, 6/36/200 collider, 5 rakip/8 avcı, 60s arena/300s total/850m orbit korunur. **0 yeni collider, light, texture, external asset**.
- Görsel değişen alan (HUD dahil; piksel başına ortalama RGB >1/255): **07 %7,35 / 08 %6,70 / 09 %0,00**. 07/08 kule cepheleri daha ayrıntılı; 09 **bilinçli olarak sabit**. Bu yüzdeler kalite puanı değildir, 7–8/10 kullanıcı kabulü **YOK**. Hâlâ büyük boş ve düz zemin, tekrarlı kütle algısı, sınırlı derinlik/sanayi ölçeği var.
- Test güvenliği: ilk hızlı [#44079550403 FAIL](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079550403) yalnız başlangıç Map4 phase1'de **C11 materyalinin kapalı olmasını yanlışlıkla hata sayan** test varsayımıydı; `38944413` bunu düzeltti. C11 hızlı PASS onaylandı.
- [C11 tam Map1+Map4 #44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) **sonucu henüz açık**. Tam PASS teyit edilmeden sonraki C12 aşaması bitmiş gösterilmez.
- Kullanıcı kararı: referanslardan yaratıcı/teknik ilham serbest, fakat CGTrader ve diğer ticari model paketinden ayırt edici silüet, mesh, doku, yerleşim kopyalamak yasak. C11 özgün matematiksel tasarım; fiziksel kabuklar mevcut kendi oyunumuzun önceden var olan binaları. **PR #56 DRAFT / merge YOK**.


## 18) 17 Kasım 2026 — NEXT-11C12 özgün sanayi ölçeği / derinlik PASS (görsel hedef hâlâ açık)

- **Önceki tam kabul:** [NEXT-11C11 PR #56](https://github.com/zxc28tarik/daethlyspacerace2202/pull/56) DRAFT; [Map1/Map4 full #44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) **34/34 workflow adımı PASS**. Önceki 07/08 mimari derinlik/estetik hedefi kullanıcı onayı olmadan tamamlanmış sayılmaz.
- **C12 kod işi `8544b95`:** [PR #57](https://github.com/zxc28tarik/daethlyspacerace2202/pull/57) DRAFT STACKED PR56. İki matematiksel, hiçbir hazır 3D modelden kopya olmayan işlevsel endüstri silüeti: asimetrik üç kolonlu ayırma/ısı tesisi ve açık transfer malzeme gantry. 07/08 derinlik profiline göre **6 ayrı ölçek/konum** (18850/20350/21650 ve 25350/27050/28650), **2 InstancedMesh**, 4.524 render üçgen, 0 yeni collider, 0 light, 0 texture, 0 GLB/üçüncü taraf asset.
- **Kesin korunanlar:** 34 eski W02 fiziksel geometri/AABB referansı, 24 W05 BEACON/HIGH_MARKER route işareti, 6 kanyon+36 sanayi+200 bina collider, 5 rakip/8 avcı, 60s arena, 300s bütün oyun, 850m çıkış, 3 sanayi uçuş hattı, Map1 saf yarış, toplam 6 map ve yayıncı pitch en az 3 playable. HIGH/BALANCED Map4 phase3 açık, LOW/diğer fazlar kapalı; `h4Gfx11c12SetLook` A/B geri dönüşü.
- **WebGL denetim:** [C12 hızlı #44081480486](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44081480486) **9/9 PASS**, gerçek 1600×900 Chromium/WebGL 07/08/09 aynı-kamera ekran. Değişen görüntü alanı (ortalama RGB >1/255 piksel): **07 %9,53**, **08 %11,84**, **09 %0**. Bu değer kalite puanı değildir. 07 ve 08'de önceki düz profilden açık okunabilir ayırma/gantry silüetine geçiş var; 09 bilinçli olarak etkilenmedi.
- **Önemli YAPILMADI kaydı:** C5'in güvenli non-nav `h4Gfx11c5DecorRings` listesi gerçek çalıştırmada **0** öğe içeriyor. C12'nin geri alınabilir dekor-pasifleştirme kodu bu nedenle görsel değişiklik yapmadı; fotoğraftaki dev gökyüzü halkaları **aynen kaldı**. Bunların BEACON/HIGH_MARKER veya başka yönlendirme rolü kanıtlanmadan gizleme yok. Sonraki adımlarda bu “tamamlandı” işaretlenmez.
- **Son C12 tam CI:** [#44081573533](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44081573533) **sonuç bekleniyor**, hızlı PASS tüm geçmiş suite'i otomatik doğrulamaz. Eski 11C4–C11 A/B'ler yeni C12 katmanını kapatarak test edilir.
- **Özgünlük kuralı (kullanıcı):** ticari CGTrader örneklerinin ayırt edici mesh/doku/silüet/sahne yerleşimi **kopyalanamaz**; genel atmosfer/kalite referansı kullanılabilir. C12 varlıklarının tamamı oyun kodunda kendi matematiksel geometri tasarımıdır.
- **Açık görsel borcu:** 07/08 büyüklük/derinlik gelişti ama tek renkli büyük kütleler, yapay halkalar ve ışık dengesi nedeniyle kullanıcı **7–8/10 estetik onayını vermedi**. Gerçek native 720/1080p GPU FPS/p95/VRAM, tam 5dk uçuş, sahne harita 3/6 oynanabilir yayıncı paketi ve tüm PR'ların merge onayı açık.
- **NEXT-11C13 ÖNERİ / YAPILMADI:** aynı 07/08 canlı hareketli kamerada yeni altı tesisin uçuş hattı çevresindeki algısal güvenliği ve ölçek kalitesini denetle; gökyüzündeki büyük halkaların tam kaynak/işlevini keşfet; yalnız kesin dekor olduğu kanıtlananları kompozisyona göre kürate et. Önemli navigasyon/görsel/fizik entegrasyon kararları kullanıcının onayına sunulur.

**Günlük:** `2026-11-17 | NEXT11C12 | 07/08 ÖZGÜN MİMARİ KOD+TEST HIZLI PASS | PR57 / 8544b95 / #44081480486 | C11 FULL 34/34 PASS | C12 FULL AÇIK | HALKA DEKOR 0 YAPILMADI | 7-8/10 KABUL YOK | MERGE YOK`.


### NEXT-11C12-B — Görsel uçuş şeridi güvenliği (17 Kasım)

- İlk C12-A [gerçek WebGL #44081480486 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44081480486), 07 %9,53 ve 08 %11,84 ekran etkisi. **Ancak** bazı geniş ve fiziksel olmayan sanayi iskeletleri H4_INDUSTRY şeritlerinin x aralığına yaklaşabildi. **Collider sayısı sabit diye görünürdeki sahte engel riskini kabul etme.**
- **Kod `9f910c6`:** Yanal sanayi profilleri `size*.92` yerine **`size*.65`** ölçeklenerek daha ince ve gerçek zemine oturur; altı yan konum ±1550–1900'e güvenli biçimde dışarı çekilir. Dikey mimari derinlik ve ölçek çeşitliliği korunur. İlk C12-A görüntüsü güncel sürüm için yeterli kalite kanıtı değildir.
- **Test `55fad1d`:** Konservatif iç silüet sınırı `abs(side)-.65*.55*size` için fast-low şeritte **≥1140**, hunter-flank şeritte **≥1430** zorunlu. Aktif 3 uçuş çizgisinin fiziksel kolliderları ve W05 rehberleri hâlâ değişmez, görsel çakışma da önlenir.
- **C12-B gerçek Chromium hızlı QA:** [#44082222325](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082222325) sonuç ve yeni PNG karşılaştırması **AÇIK**. C12 tam browser suite güncel HEAD sonucu **AÇIK**. C11 [full #44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) **34/34 PASS**.
- **YAPILMADI:** Görünür büyük gökyüzü halkalarının kökeni kesin değil; C5 nonnav dekor listesi gerçek motorda 0. Kullanıcı uçuş/estetik 7–8/10 onayı, yerel GPU FPS/p95/VRAM, 5dk uçuş, yayıncı 3/6 playable, merge açık.

**Günlük:** `2026-11-17 | NEXT11C12-B | GÖRSEL-KORİDOR GÜVENLİĞİ KOD/TEST YAPILDI | 9f910c6/55fad1d | YENİ WEBGL PNG ve FULL CI AÇIK | HALKA KURATÖRLÜĞÜ YAPILMADI | PR57 DRAFT, MERGE YOK`.


### NEXT11C12-C — güvenli 07/08 silüet kompozisyonunun son QA kaydı

- **Son kod `6b0c31f`:** C12-B güvenceli dış-yan kapasiteli iskeletleri 08 kamerasında daha iyi çerçevelemek için tek ayırma tesisi `progress:27050 -> 25550` çekildi. `side=-1550, size=1040, scaleX=.65*size` **aynı**; uçuş şeridi açıklığı, fizik, W05 işaretleri değişmedi. Kod harici ticari model/doku kullanmıyor.
- **Nihai güncel hızlı test:** [#44082591667 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082591667), 07/08/09 gerçek 1600×900 WebGL art A/B, 2 çizim grubu, 6 özgün tesis, **4.524** render üçgen, **0** yeni collider/ışık/doku/dış model. 6/36/200 ve 24 W05, 34 W02 identity ve yeni iki uçuş şeridi görsel envelope güvenlik testi geçti.
- **Güncel gerçek ekran A/B oranı:** 07 **%5,44**, 08 **%4,32**, 09 **%0**. İlk C12-A 9,53/11,84 görüntü farkı daha önce görsel-şerit sıkışması içerdiğinden **eski/nihai olmayan** sayı; sonucun daha düşük olması güvenli tercih. Bu sayılar hâlâ bir grafik kalite puanı **değildir**.
- **Kalan:** C12 son tam [#44082591388](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082591388) **henüz PASS kontrol edilmedi**. 07/08/09 hareketli kamera ve tam 300s pilot uçuş, yerel 720/1080 native GPU FPS/p95/VRAM, kullanıcı **7–8/10 görsel onayı**, yayıncı ilk pitch 3/6 playable ve merge kararı **açık**.
- **Dekoratif halkalar:** C5'nin sınıflandırılmış nonnav listesi **0**. Dev gökyüzü halkaları **değişmedi**; kaynağı ve işlevi kesinleşmeden dokunma.
- **Özgünlük kuralı:** atmosfer/kalite referansı serbest ama kopya/çok yakın ayırt edici tasarım yasak, CGTrader ticari model veya doku kullanılmadı.

**Günlük:** `2026-11-17 | NEXT11C12-C | SON KOD 6b0c31f, HIZLI WEBGL #44082591667 PASS | 07 %5.44 08 %4.32 09 %0 | ŞERİT GÜVENLİĞİ PASS | C12 FULL AÇIK | 7-8/10 ONAY YOK | PR57 DRAFT/NO MERGE`.


## 19) 17 Kasım 2026 — NEXT-11C13 hareketli kamera ve halka kaynak denetimi

- **Önceki durum doğrulandı:** C12 [PR #57](https://github.com/zxc28tarik/daethlyspacerace2202/pull/57) DRAFT; [tam Map1/Map4 #44082591388](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082591388) **35/35 PASS**. Son güvenli C12 07/08 gerçek görüntü farkı %5,44/%4,32, 09 %0; 7–8/10 estetik kabulü açık.
- **Yeni C13 DRAFT PR #58:** [PR](https://github.com/zxc28tarik/daethlyspacerace2202/pull/58) stacked on C12 #57, kullanıcı onaysız merge YOK. Bu tur **sadece denetim/QA**: önceki fiziksel ve görsel nesnelerin değişimi yok.
- **Denetim kodu `d07276f`:** `h4Gfx11c13RingProvenance()` mevcut Map4 sanayi 3D sahnesinde TorusGeometry, adı ring/energy/portal/toroid ve açık W05 marker adaylarını kaynak/ata, geometri, görünürlük, ekran NDC, dünya konumu ve korunmuş çarpışma ile sınıflandırır. **Bütün adaylar `safeToAutoHide:false`**; hiçbir materyal, geometri veya navigasyon kapatılmaz. W05 **12 BEACON + 12 HIGH_MARKER** fiziksel olmayan kritik yön işaretidir. Baked makine/C4 güç halkaları tek BufferGeometry içinde olabilir: basit torus listesi “bütün halkalar güvenli dekor” demek değildir.
- **C13 test `25b394d`:** 07/08'de 6 ilerleme × 3 rota `FAST_LOW,CENTRAL,HUNTER_FLANK` = **18 gerçek Chromium WebGL kamera pozu**, 6 yüksek çözünürlük PNG + tüm örnekleri içeren kaynak/konum/gpu JSON. C12 altı instancenın ekran yansıması kamerayla hareket etmelidir; W05 24 exact marker geometry/material/matrix ve W02 fizik ile 6/36/200 collider test boyunca sabittir; texture/geometry sayısı büyümez. Bu gerçek **kamera pozlarının ardışık örneklemesidir**, tam 300 saniye canlı pilot seansı veya gerçek GPU FPS ölçümü değildir.
- **Hızlı ve tam CI:** `.github/workflows/map4-next11c13-motion-ring-provenance.yml` ve full `map-browser-smoke.yml` genişletildi. Yeni [hızlı #44085621759](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44085621759) ve [full #44085621702](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44085621702) **sonuç bekleniyor**; henüz C13 PASS iddiası yok.
- **Özgünlük kararı kalıcı:** CGTrader vb üçüncü tarafın ayırt edici 3D bina düzeni/mesh/doku/silüet kopyalanmaz; genel atmosfer/kalite/teknik ilham alınabilir. C13 harici model kullanmıyor.
- **Kalan onaylar:** Hızlı JSON'da büyük görünen halkaların kesin kaynak ve navigasyon sınıfını bul; yalnız açıkça non-nav olduğu kanıtlananlar için estetik aday hazırla, önemli karar kullanıcıya sor; native 720/1080p GPU p95 FPS/VRAM, tam 300s pilot uçuş, 3/6 yayıncı playable, kullanıcı 7–8/10 görsel onayı ve merge izni **AÇIK**.

**Günlük:** `2026-11-17 | NEXT11C13 | KOD + 18 POZ GERÇEK TEST + DRAFT PR58 | 35/35 C12 PASS | C13 HIZLI/TAM CI BEKLİYOR | YÖN HALKALARINI SAKLAMA YAPILMADI | 7-8/10 VE MERGE YOK`.


### 17 Kasım — 08 FAST_LOW görsel engel bulgusu ve GPU test düzeltmeleri

- **Gerçek 6 ekran görüntüsünde yeni keşif:** 07'nin FAST_LOW, CENTRAL, HUNTER_FLANK kadrajları ve 08'in CENTRAL/HUNTER_FLANK kadrajları sanayi sahnesini gösteriyor. Fakat **08 FAST_LOW (progress 23.800, x=-800, y=-100)** ekranı neredeyse tamamen **mavi kütle/kapalı yüzey** ile kapanıyor. Bu durum, collider sayısı ve C12 lateral safety geometrisi doğru olsa bile **görsel geçiş sorunu** olabileceğini gösterdi. Fiziksel/oynanış açısından gerçek hata kaynağı **henüz kanıtlanmadı**, otomatik nesne silinmeyecek.
- **C13 yakın yüzey kaynağı denetimi `ee5973e`:** `tests/map4-gfx11c13-fast-low-occlusion.cjs` üç pozda (07 FAST_LOW, 08 FAST_LOW, 08 CENTRAL) yerel/büyük görsel mesh AABB yakınlık ve 3 yönlü kameradan raycast ile engel kaynağı, parent, geometri/materyal ve çarpışma varlığını JSON'a kaydeder. C13 hızlı ve full CI'da çalışır; dosya `map4-next11c13-08-fast-low-occlusion.json`.
- **Önceki test iki yanlış sabit varsayım:** [İlk hızlı #44085547381](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44085547381) 30→31 GPU texture artışını sızıntı sandı; bu geç gelen **tek seferlik atlas ilk yüklemesi** olabilir, `dfe5722` test sınırını ve aynı kameraya geri dönme kontrolünü ekledi. [İkinci hızlı #44085996959](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44085996959) 409→388 GPU geometry düşüşünü hata sandı; uzaktan LOD geometry serbest bırakılmasıdır, sızıntı anlamına gelmez. `5aa62f5` sabit mutlak sayım yerine ilk/son/tekrar eden pozlarda **bellek sınırını ve yeniden kullanım kararlılığını** kontrol eder.
- **Güncel C13 hızlı #44086517708** [GitHub Actions](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44086517708) sonuç **henüz açık**. Fiziksel 6/36/200 çarpışma, 34 W02, 24 W05, 3 uçuş şeridi, eski C12 sanat/oynanış herhangi bir kodla değiştirilmedi; kaynak kodu denetleyici read-only.
- **YAPILMADI / açık:** 08 mavi görüş engelinin kesin mesh kaynağı ve güvenli düzeltmesi; dev sky ring kaynak matrisi; sürekli 300s gerçek pilot uçuş, native GPU fps/p95/VRAM, 7–8/10 kullanıcı görsel kabulü ve PR merge izni.


## C13 — Gerçek 08 FAST_LOW Görüş/Tasarım Blokajı (kaynak kesinleştirildi)

- **Bağımsız tanı kodu:** `ee5973e`, GitHub Actions [#44086880676](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44086880676) **occlusion-audit işi 9/9 PASS**. `map4-next11c13-08-fast-low-occlusion.json` ham motor raporu. 07 FAST_LOW ve 08 CENTRAL kontrol görüntüleriyle karşılaştırıldı.
- **08 FAST_LOW test konumu:** `progress=23800, laneX=-800, laneY=-100` (gerçek W05 hızlı şerit koşulu). Kamera **iki var olan collider taşıyan W01/VQ02 fabrika yapısının axis-aligned kutu hacminin içinde**: `MAP4_LEGACY_W01_FACTORY` ve `VQ02_SIGNATURE_FACTORY`, ikisi de `MAP4_FACTORY_23800` altında. Kamera ileri/yan rays: VQ02 signature `CylinderGeometry` yüzeyi **76–102** oyun biriminde; eski W01 fabrikası `BoxGeometry` **151–175** birimde. Nesneler **h4Collider=true, visualOnly=false**; büyük mavi yüzey gerçek fiziksel geometri kaynaklıdır, C12 yeni uzak render dekorundan değil.
- **Karşıt kontrol:** 07 FAST_LOW pozunda aynı mavi örtü yok (ileriye ışın isabeti yok); 08 CENTRAL `x=0,y=350` pozunda da benzer yakın engel ışını yok. Bu nedenle problem 08 hızlı-alt görüş/rota ile mevcut fabrika yerleşimi etkileşimidir. Kamera tek seçili pozdan alınan raycast, **tam 300s uçuş testi değildir**; gerçek pilot çarpışma davranışı ayrıca doğrulanmalı.
- **Kritik karar / henüz YAPILMADI:** İlgili eski fabrika meshlerini taşımak, ölçeklemek veya collider kayıtlarını silmek, önceki **200 bina fiziksel kimliği** sözleşmesini ve oyun dengesini değiştirebilir. **Kullanıcıdan açık onay olmadan** bu fiziksel / oyunsal değişiklik uygulanmayacak. Sadece görsel-only materyal aç-kapa ile asıl fiziksel çarpışma çözülemez.
- **C13 güvenlik:** Gerçek mevcut fiziksel engel kaynakları tespit edildi, hiçbir render mesh / collider / route indicator değiştirilmedi. W05 `12 BEACON + 12 HIGH_MARKER` korunur. Yeni görünür mavi blokaj açık konular ve en yüksek P1 görüntü/oynanış incelemesi olarak işaretli.

**Karar sorusu (önemli entegrasyon, kullanıcıya sorulmalı):** 08'de bu iki var olan fiziksel fabrika yapısı hız bonuslu alt şeridin dışına fiziksel olarak yeniden yerleştirilsin mi, yoksa alt şeridin bu kısımda gerçek alternatifli riskli rota olması mı isteniyor? Mevcut kısıtları korumak adına şimdilik **YAPILMADI**.


## NEXT11C13 — 18 gerçek pozun tamamı, halka kökeni ve güvenli görsel inceleme sonucu

- **GÜNCEL HIZLI CI PASS:** [#44086989056](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44086989056) **2 bağımsız job, her biri 9/9 başarılı**: 18 WebGL kamera pozu, 6 gerçek PNG, JSON ring+LOD kaynak raporu; ayrıca 08 FAST_LOW yakın fiziksel engel raycast. Üretim kodunda **0 görünüm/oynanış değişikliği**; W05 24 nesnenin geometri/material/matrix kimliği korunuyor.
- **Halka raporunun gözlenen kaynak dağılımı:** sanayi bölgesinde **93 aday nesne**: **24** `W05_PROTECTED_NAVIGATION` (12 BEACON + 12 HIGH_MARKER); **45** W05/GFX06 istasyon ve makine sanatı (bazıları fiziksel collider nesnesi); **17** W01 sanayi landmark objesi (bazıları fiziksel); **6** henüz `UNCLASSIFIED_DO_NOT_EDIT`; **1** C4 birleşik mimari/enerji mesh. Gökyüzünde görünen iri halka sayısını bu 93 rakamıyla özdeşleştirmeyin: "aday" ad/torus denetimi, baked tek BufferGeometry içindeki diğer halkaları tamamen saymaz; NDC ekranda olma denetimi tam piksel örtülülüğü değildir.
- **18 pozun gerçek sonuçları:** alt hızlı `x=-800,y=-100`, merkez `0,350`, avcı kanadı `900,310` × 07 `16550,17200,18000`, 08 `22400,23800,25350`. C12 altı mimari instance'nin kamera projeksiyonu yol boyunca hareket ediyor. **0 otomatik gizlenen halka.** JSON `map4-next11c13-motion-provenance.json` [hızlı Actions artifact](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44086989056).
- **08 FAST_LOW kaynağı:** `MAP4_LEGACY_W01_FACTORY` ve `VQ02_SIGNATURE_FACTORY` **h4Collider taşıyan iki mevcut fiziksel fabrika grubu**, ikisi de `MAP4_FACTORY_23800` altında, kameranın içinden geçtiği fiziksel/geometrik hacimler. Bu, C13’de yeni grafik eklenmesinden kaynaklanmıyor. [Bağımsız GPU raycast artifact](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44086880676) ile doğrulandı. **KULLANICI ONAYI BEKLENEN önemli tasarım kararı:** fabrika fiziksel objelerini hızlı şeridin dışına taşıyıp çarpışma hacmini güncellemek mi, yoksa bu geçişi kasıtlı riskli alternatif yapıp rehberi değiştirmek mi?
- **GPU QA düzeltmesi:** Doku 30→31 ilk yüklemesi ve farklı bölgelerde distance-LOD geometri 388↔409 görünmesi sızıntı değildir. `b78203d` ile aynı kamera pozunda arka arkaya render'ın kaynak kararlılığı test edildi ve **PASS**. Full tarayıcı paketi eşzamanlı ağır çalışırken altı PNG screenshot birinin 30s timeout'a takılması üzerine testin screenshot süresi uzatıldı; `59b3afa` ve `78b92be` ile **sadece hızlı QA altı PNG üretir**, tam regresyonun 18 poz/rota/JSON doğrulaması görüntüyü tekrar yazmaz.
- **Güncel tam Map1/Map4 CI:** [#44087813180](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44087813180) **sonuç hâlâ AÇIK**; önceki C12 full 35/35 PASS, ancak C13 full henüz PASS sayılamaz.
- **YAPILMADI:** önemli W05 navigasyon halkalarını veya mevcut çarpışma hacimlerini azaltma/taşıma; 08 hızlı şerit kaynaklı fiziksel çakışmayı değiştirme; native GPU FPS/p95/VRAM, 300s gerçek pilot uçuş, kullanıcı 7–8/10 estetik, en az 3/6 yayıncı playable ve merge onayı.

**Günlük:** `2026-11-17 | NEXT11C13 | HIZLI WEBGL 2/2 JOB 9/9 PASS | HALKA ADAYI 93 (24 NAV) | 08 FAST_LOW FİZİKSEL W01+VQ02 ÇAKIŞMASI TANILANDI | FİZİK DEĞİŞİMİ KULLANICI ONAYI BEKLİYOR | FULL CI AÇIK | PR58 DRAFT / NO MERGE`.


### NEXT-11C13 — Bağlantı kesintisi kurtarma, gerçek halka kökeni ve 08 FAST_LOW kritik blocker

- **Mevcut taslak:** [PR #58](https://github.com/zxc28tarik/daethlyspacerace2202/pull/58), C12 PR #57 üzerine; tüm PR'lar DRAFT, merge yapılmadı. Önceki C12 [full 35/35 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082591388).
- **Kopukluk nedeni:** [C13 full #44086988965](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44086988965) önce farklı kamera LOD geometri/texture sayaçlarında yanlış sabit eşitlik ve sonra Chromium screenshot 30s timeout ile durdu. `b78203d` no-leak'i aynı kamera tekrarı olarak ölçer; `2179e57` uzun WebGL screenshot için 120s timeout. Başlangıç sürümünde motorun çöktüğü kanıtı **yok**. [Son hızlı #44087711363](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44087711363) ve [son full #44087710943](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44087710943) **sonuç ayrıca doğrulanacak**.
- **Köken manifesti, önceki hızlı #44086989056 PASS:** 18 hareketli kamera pozisyonunda toplam **93** halka/enerji aday kaydı: **24 W05_PROTECTED_NAVIGATION**, **45 W05_OR_GFX06_STATION_ART**, **17 W01_INDUSTRIAL_LANDMARK**, **1 GFX11C4_BAKED_ARCHITECTURAL_HERO**, **6 UNCLASSIFIED_DO_NOT_EDIT**. C5 non-navigation kesin dekor listesi 0; **işaretler ve görünür halkalar değiştirilmedi.**
- **GERÇEK OYNANIŞ RISKI:** 08 FAST_LOW screenshot `23800/-800/-100` mavi tek parça fabrika içinden bakıyor. Bağımsız [occlusion test #44086880676 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44086880676) yakın raycast içinde 82 birimde `VQ02_SIGNATURE_FACTORY` cylinder, 170 birimde `MAP4_LEGACY_W01_FACTORY` box tespit etti; ikisi de **h4Collider=true**. Çünkü `H4_LANDMARK_PLANS[2].factory` **23800/-770** hızlı şerit merkezine **-800** çok yakın. Gerçek `planetaryBuildingColliders` çarpışma rutini bu collider'ları kullanıyor. **YAPILMADI:** özel fiziksel fabrika yerleşimi/FAST_LOW rota değişimi; önce kullanıcı önemli entegrasyon onayı al, sonra 200 ve 36 collider kimliği/adedi, W05 24 yön işareti, üç rota ve 5 rakip/8 avcı ile gerçek 5 dakika uçuşu yeniden doğrula.
- **YAPILAN iş:** C13 programatik okuma denetimi, 18 poz gerçek kamera, altı screenshot, köken JSON, bağımsız 3-poz yakın AABB+raycast testi, hızlı/tam CI akışı, bu kalıcı kayıt. **YAPILMAYAN:** otomatik halka gizleme, rotanın fiziksel değiştirilmesi, native GPU performans, estetik 7–8/10 onayı, PR merge.
- **Özgünlük:** CGTrader veya benzeri kaynaktan ayırt edici tasarım, geometri, doku kopyalama YOK; sadece genel atmosfer/kalite ilhamı.

**Günlük:** `2026-11-17 | C13 BAĞLANTI KURTARMA | 18-POZ RAPOR 93 ADAY KAYDEDİLDİ | 08 FAST_LOW KAMERA VE FİZİK BLOCKER TESPİT EDİLDİ | SON CI AÇIK | ROTA/FİZİK KARARI ONAY BEKLİYOR | PR58 DRAFT MERGE YOK`.

### Son hızlı doğrulama (PR58)

- **Kopukluk sonrası C13 son hızlı CI** [#44087711363](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44087711363) **2/2 bağımsız job PASS** (18-poz motion+ring JSON ve 3 poz raycast occlusion). `2179e57` screenshot timeout düzeltmesinin test sonucu teyit edildi. [Son full Map1/Map4 #44087710943](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44087710943) **henüz çalışıyor, PASS ilan edilmedi**. Kamera köken raporu C13'ün yeni halka/görünürlük sınıflandırmasını doğruladı; 08 FAST_LOW fabrika konum problemi oyun/çarpışma değişmeden açık kaldı.

## 20) 17 Kasım 2026 — NEXT-11C14 fiziksel çarpışmaya göre şerit taraması

- **Bağımlılık:** C13 [PR #58](https://github.com/zxc28tarik/daethlyspacerace2202/pull/58) DRAFT ve [tam Map1/Map4 CI #44087813180](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44087813180) **37/37 PASS**.
- **Yeni PR:** [NEXT-11C14 #59](https://github.com/zxc28tarik/daethlyspacerace2202/pull/59), DRAFT/STACKED #58 üzerinde; main'e merge yok. Kullanıcı `.` mesajı önceki fiziksel fabrika yer değiştirme kararına **ONAY DEĞİLDİR**; fiziksel taşınma, görünmez çarpışma silme, AI/bonus yolu değişikliği yapılmadı.
- **Oyun kodu `a1e0bf5`:** `h4Gfx11c14ScanCorridors` read-only; oyundaki **gerçek `h4SegmentBoxHit`**, 12 birim player padding ve `±25` broadphase kullanarak W01 200 + W05 36 collider üzerinde 14.080–33.920 arası `step:75` (her profilde **265** swept-kesit) tarar. 4 karşılaştırma profili: FAST_LOW(-800,-100), CENTRAL(0,350), HUNTER_FLANK(900,310), SAFE_UPPER(0,760).
- **İlk gerçek Chromium/WebGL PASS [#44090749918](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44090749918):** **9/9 CI adımı**; HTML oyundan üretilen raw JSON artifact `map4-next11c14-flight-lane-collision-map.json`. Riskli swept-kesit sayıları (kesintisiz pilot çarpışma sayısı **değil**): **FAST_LOW 19/265 (%7,17; 6 risk aralığı), CENTRAL 15/265 (%5,66; 6), HUNTER_FLANK 7/265 (%2,64; 2), SAFE_UPPER 15/265 (%5,66; 6)**. "SAFE_UPPER" yazısı otomatik engel yok garantisi **değil**.
- **Tam 23.800 testi:** FAST_LOW örnek noktasında **2** mevcut W01 fiziksel fabrika colliderı: `MAP4_LEGACY_W01_FACTORY`, `VQ02_SIGNATURE_FACTORY` (her ikisi `MAP4_FACTORY_23800` parent). Aynı noktada CENTRAL, HUNTER_FLANK ve SAFE_UPPER **0** çarpışma. Hızlı alt şeridin tıkanıklık aralığı yaklaşık **23.663–24.037**. Test ayrı doğrudan `h4SegmentBoxHit(point,point)` kontrolüyle çaprazlandı.
- **Ek güvenlik bulgusu:** `h4IndustrialAvoidance({routeProgress:23000},-800,-100)` **`avoiding:false`** döndürdü; bu fonksiyonun kodu yalnız `h4IndustrialColliders` (36 W05) inceliyor, W01 200 fabrika colliderını incelemiyor. Bu gerçek AI planlama eksikliği olabilir; oyun davranışını değiştirmek için kullanıcı önemli entegrasyon kararı **bekleniyor**.
- **Geliştirilen koruma `6b860a0`/`6689944`:** collider adayının kendisi veya üst grubu görünür mü (`visiblyRendered`, `hiddenBy`) kayda giriyor. Gizli fiziksel mesh varsa kaynak açıklanacak; **gizli collider otomatik kaldırılmayacak**. Yeni hızlı [#44091283701](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44091283701) **sonucu bekleniyor**, eski hızlı PASS yeni test değişikliklerinin PASS kanıtı değildir.
- **Güncel tam regresyon** [#44090849276](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44090849276) eski C14 HEAD'de devam ediyordu; **en son HEAD** tam test sonucu ayrıca doğrulanmalı. 34 W02 fiziksel mesh ve 24 W05 route işareti (12+12), 6/36/200 collider, 5 rakip/8 avcı, 60s arena/300s race/850m ascent ve Map1 saf yarış korunur.
- **Kopya yasağı:** Genel örneklerden ilham olabilir, ticari CGTrader vb mesh/sahne/doku/ayırt edici silüet kopyalama yok. C14 hiçbir asset ithal etmez.
- **Açık:** Kullanıcının 08 hızlı şeritte mevcut 2 fiziksel fabrikanın taşınması **ya da** gerçekten riskli alternatif rota olması yönündeki açık seçimi; diğer 07/08/09 fiziksel çarpışma yeniden tasarımı; 720/1080 native GPU FPS/p95/VRAM, gerçek kesintisiz 300s uçuş, yayıncı 3/6 playable ve kullanıcı 7–8/10 görsel kalite onayı.

**Günlük:** `2026-11-17 | NEXT11C14 | GERÇEK PLAYER COLLIDER QA 9/9 PASS (İLK HEAD) | 19/15/7/15 RİSKLİ KESİT | 23800 FAST_LOW 2 FABRİKA | GİZLİ FİZİKSEL GEOMETRİ RAPORU SON HEAD QA AÇIK | PR59 DRAFT | FİZİĞE ONAYSIZ DOKUNMA YOK`.


### Son gerçek C14 görsel/mesh sahipliği doğrulaması — 17 Kasım

- **Güncel gerçek HEAD hızlı WebGL [#44092482617](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44092482617) 9/9 PASS.** Son üretim kodu `e0ba729`, son test `3f8afa1`, faz3/08 kamerada render ederek `map4-next11c14-flight-lane-collision-map.json` arşivi üretti. Önceki hatalı phase1 görünürlük analizini **geçersiz** say.
- **Güncel görünürlük durumu:** Gerçek `routeProgress=23800,x=-800,y=-100,phase3`, `activeRegionVisible=true`. Çarpışma veren `MAP4_LEGACY_W01_FACTORY` (collider index64) ve `VQ02_SIGNATURE_FACTORY` (index73) **ikisi de görünür** (`visiblyRendered:true`, `hiddenBy:null`). Dolayısıyla **08 engeli gizli/geçersiz collider değil, gerçek görünür fiziksel fabrika hacimleri**.
- **Eski mesh sahipliği eksik olan 2 fiziksel kayıt:** `planetaryBuildingColliders` index **0** (`progress14010,side-807,altitude-213`) ve index **1** (`progress14130,side-225,altitude-185`) için sahnede birebir `mesh.userData.h4Collider===record` eşleşmesi bulunamadı. Bu **sahipsiz referans eşleştirmesi**, `invisible wall` kanıtı değildir. Otomatik silinmedi.
- **08 kamerasında gizli görünen 31 fiziksel mesh** olabilir fakat görünürlük sorgusu **yalnız o andaki kameraya/phase/LOD'a özeldir**; bölge dışındayken normal mesafe/LOD nedeniyle saklı olan objeler vardır. `hiddenAtCurrentCamera` global “oyunda görünmez collider” iddiasına dönüşmez; şüpheli kayıtlar ancak ilgili progresste poz kurularak ayrı doğrulanır.
- **Güncel C14 full CI:** [#44092482563](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44092482563) hâlen sonuç bekliyor; en son hızlı PASS tüm suite PASS anlamına gelmez.
- **Fizik ve UI sözleşmesi:** Hiçbir `h4Collider` veya gerçek `h4SegmentBoxHit` davranışı, AI, W05 route marker'ı, rota bonusu, mevcut 200+36+6 collider veya görsel mesh taşınmadı/değişmedi. Kullanıcı önemli entegrasyon kararı ve Draft merge izni hâlâ açık. Bu C14 **yalnız analiz ve QA**.


### NEXT11C14 kaynak sahipliği nihai düzeltme (17 Kasım)

- **Düzeltme:** Önceki **2 sahipsiz collider** ifadesi **GEÇERSİZDİR**. İlk arama yalnız `planetaryWorldRegions[2]` ile sanayi grubu içine bakıyordu, ancak progress 14.010 ve 14.130 kapsamındaki yapılar arena/sanayi sınırında **başka bölgenin** child mesh'leri. `e980c30` aramayı bütün `planetaryWorldGroup` sahnesinde çalıştırıyor. [Güncel hızlı #44093039324](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093039324) **9/9 PASS**: **236/236 orijinal collider'ın nesne sahibi çözüldü, unresolved=0**.
- **08 gerçek kamera/phase3:** `progress 23800,x -800,y -100`; W01 legacy fabrika index64 ve VQ02 signature fabrika index73 **görünür durumda, gerçek collider**. Hızlı şerit tıkanma aralığı ve dört rotanın 19/15/7/15 riskli kesiti aynı kalıyor. Sadece bilgilerin kaynağı/denetim doğruluğu düzeltildi; **oyun fiziği ve model görünüşü değişmedi**.
- Görünürlük anlık/LOD odaklı: bir kamerada 33 collider sahibi gizliyse bu **genel phantom-wall iddiası değildir**; sınırdaki uzak bölgeler normal görünürlük filtrelerine tabidir. İki fabrika ilgili kamerada görünür, fiziksel yerleşim/AI/rota kararı kullanıcı onayı bekliyor.
- `6d32a2e` ile bu bulgu test sözleşmesine yazıldı: **236/236 owner resolution** ve 08 fast fabrikalarının **görünür** olması artık zorunlu regresyon kapısı. [Bu son kod testi hızlı CI](https://github.com/zxc28tarik/daethlyspacerace2202/actions/workflows/map4-next11c14-collider-lane-audit.yml) sonucu ayrıca doğrulanacak. Güncel [Map1/Map4 full](https://github.com/zxc28tarik/daethlyspacerace2202/actions/workflows/map-browser-smoke.yml) sonucu açık.
- Halen **YAPILMADI:** kullanıcı onaysız fiziksel fabrika taşıma, AI kaçınma güncellemesi, oyun hat/bariyer değişikliği, native GPU ve kesintisiz 300s uçuş, yayıncı üç oynanabilir harita onayı, 7–8/10 görsel kalite ve PR merge.


### 18 Kasım — C14 son tam CI sonucu doğrulandı (oyun kodu değişmedi)

- **C14 son kod HEAD** `6d32a2e` için [hızlı WebGL #44093556723](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093556723) **completed/success, 9/9 PASS** ve [Map1/Map4 full #44093556645](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093556645) **completed/success** (browser-smoke job tüm adımları başarılı) GitHub'dan yeniden doğrulandı.
- PR #59 son HEAD `01d50c0` yalnızca ROADMAP dokümanını değiştirir (`[skip ci]`); test sonrası **oyun/QA kodu değişmedi**. Bu nedenle C14 kod testleri geçerli, son doküman commitine ayrı test koşusu atfedilmiyor.
- **C14 read-only analiz QA kabulü tamam**: 236/236 collider sahibi çözüldü, 08'de iki fabrika görünür fiziksel engel, riskli sabit şerit kesitleri 19/15/7/15. Kesintisiz pilot uçuşu veya şerit güvenliği garanti edilmiş değildir.
- **AÇIK / kullanıcının önemli kararına bağlı:** iki fabrikanın fiziksel taşınması ya da bilinçli riskli rota olarak bırakılması; rakip W01 kaçınma değişikliği; 300s gerçek pilot uçuşu, native GPU fps/p95/VRAM, 7–8/10 estetik kabul ve PR merge. Bu konularda açık onay alınmadı; hiçbir değişiklik ve merge yapılmadı.
- **Sıradaki güvenli iş:** fizik/AI/bonus/rotayı değiştirmeden C14 çarpışma raporunu rotaya özgü alternatif geçiş ve 300s uçuş senaryosu için hazırlamak; fiziki uygulama ancak kullanıcı kararıyla.


## 21) 18 Kasım 2026 — NEXT-11C15 yalnız analiz ve test (kullanıcı onaylı kapsam)

- **Kullanıcı talimatı:** “NEXT-11C15'e yalnız analiz ve testlerle devam et. Fiziksel fabrikaları, AI'ı ve rota bonuslarını değiştirme; hiçbir PR birleştirme.” Önemli fizik/entegrasyon kararları için ayrıca açık onay şart. Bu talimat PR merge veya fabrika taşıma onayı değildir.
- **C14 tamam:** [Hızlı #44093556723](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093556723) 9/9 PASS, [full #44093556645](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093556645) başarılı. 236/236 sahip, 08'de 2 görünür gerçek fabrika çarpışması; 4 sabit profil 19/15/7/15 riskli kesit.
- **C15 yeni dal:** `codex/map4-gfx11c15-transition-clearance-audit`, C14 PR #59 üzerine stacked; `index.html` değişikliği **YOK**. 13 deterministik şerit geçişi hipotezi, 22.000–25.200 arasında 40 birim/80 segment; her segmentte aynı üretim `h4SegmentBoxHit` ve `padding=12`. Oyun ±25 broadphase ve tam 236 collider taraması birbirine karşı test edilir. C14 sabit dört profil kesitiyle birebir tutarlılık kapısı var.
- **Yeni dosyalar:** `tests/map4-gfx11c15-transition-clearance.cjs`, `.github/workflows/map4-next11c15-transition-clearance.yml`, `MAP4_GFX11C15_TRANSITION_CLEARANCE_ACCEPTANCE.md`. Mevcut full browser smoke akışına C15 testi eklendi. Ham JSON `map4-next11c15-lane-transition-matrix.json` Actions artifact olarak tutulacak.
- **Kısıt:** Gerçek 300s pilot uçuşu, direksiyon/ivme/rota bonusu/AI simülasyonu değildir; çarpışmasız geometrik örnekler oynanabilir/güvenli rota ilan edilmez. Hipotez irtifalarının fiziksel uygulanabilirliği henüz doğrulanmadı.
- **Korunanlar:** W01 200/W05 36/kanyon 6 collider, 34 fiziksel W02 mesh, 24 W05 navigasyon objesi, 5 rakip/8 avcı, arena 60s/yarış 300s/çıkış 850m, fabrikalar, AI ve bonuslar. Yeni fizik, görünüm veya dış 3D asset sıfır.
- **Yapıldı:** Analiz testi, yeni workflow ve tam regresyon bağlantısı yazıldı; **C15 CI henüz doğrulanmadı**. PR yalnız Draft açılacak, merge YOK.
- **Bekleyen:** C15 gerçek hızlı ve tam CI PASS/JSON bulguları; önemli fizik/AI kararları, gerçek kesintisiz pilot ve native GPU testleri, kullanıcı kalite/estetik kabulü.

**Günlük:** `2026-11-18 | NEXT11C15 | 13 TRANSITION PATH READ-ONLY QA YAZILDI | C14 GERÇEK PHYSICS CROSScHECK | FAST/FULL CI BEKLİYOR | FABRİKA/AI/BONUS DEĞİŞMEDİ | NO MERGE`.


### NEXT-11C15 — İlk gerçek 13-senaryo matrisi PASS (18 Kasım)

- [Hızlı Chromium/WebGL #44182747206](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44182747206) **completed/success**, 13 senaryo × 80 süpürülmüş kesit (22.000–25.200). İlk bulgular `MAP4_GFX11C15_TRANSITION_CLEARANCE_ACCEPTANCE.md` dosyasında. Son test kodu çalıştırıldı; oyun `index.html` değişmedi.
- 4 sabit şerit FAST_LOW/CENTRAL/HUNTER_FLANK/SAFE_UPPER **13/5/2/5 riskli kesit**; C14 bu **dar aralıkta** birebir aynı. Çarpışma broadphase ve eksiksiz 236 hacim taraması aynı; 08 hızlı alt şerit 2 gerçek görünür fabrika; 3 karşıt nokta 0.
- 9 dönüşüm senaryosu: hızlı→merkez erken/orta/geç **4/4/8**; hızlı→avcı erken **0**; hızlı→üst erken **4**; merkez→avcı **1**; merkez→üst **5**; merkez→hızlı 08 **14**; hızlı→merkez 08 sonrası **12**. Bu sonuçlar **pilot kinematiği** veya **gerçek 300s oynanış** kanıtı değildir. Hızlı→avcı örneği fiziksel hacimlerden geçmiyor ama x:-800→900 manevrasının uygulanabilirliği hâlâ bilinmiyor.
- Önce-sonra 24 marker, 34 W02, 236 collider ve 5 rakip/8 avcı, 60/300/850 **PASS**. Oyun, AI, bonus, fiziksel fabrika, rota geometry veya PR birleşimi **YOK**. En son tam Map1/Map4 CI ve tam HEAD hızlı CI sonuçları ayrıca bekleniyor.

**Günlük:** `2026-11-18 | C15 13 GEOMETRİ SENARYOSU FAST QA PASS | 0/80 FAST_TO_HUNTER_EARLY YALNIZ GEOMETRİK | SABİT C14 CROSSCHECK PASS | FULL REGRESYON BEKLİYOR | NO PHYSICS/AI/BONUS/MERGE`.


### C15 tam regresyon nihai doğrulama — 18 Kasım

- [Son hızlı #44182868970](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44182868970) PASS, [son tam Map1/Map4 #44182869011](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44182869011) **PASS** (39 success). Önceki full #44182747329 başarısız olmuştu; son run yeşil. Başarılı HEAD `48ec8cd` oyun ve test kodu, sonraki commitler doküman. C15 analiz aşaması **TEST KABUL**, gerçek pilot kinematiği henüz doğrulanmadı.
- Sonraki C16 yalnızca oyun kaynak `updateGame(dt)` çağrılarının kontrollü test harness'i olacak; `index.html`/fizik/AI/bonus/mesh değiştirilmeyecek ve PR merge yapılmayacak.


## 22) 18 Kasım — NEXT-11C16 orijinal oyuncu güncelleme fonksiyonuyla scriptli manevra QA

- C15 son hızlı [#44182868970](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44182868970) **PASS**, tam Map1/Map4 [#44182869011](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44182869011) **PASS**. C15 geometrik 0/80 `FAST_TO_HUNTER_EARLY` manevrası hâlâ gerçek oynanabilirlik kanıtı **değildir**.
- C16 yeni dal `codex/map4-gfx11c16-scripted-pilot-feasibility` C15 Draft PR üzerine açıldı. Oyun `index.html` **değişmedi**; yalnız `tests/map4-gfx11c16-scripted-pilot-controls.cjs` gerçek oyun `updateGame(dt)` 30Hz tuş simülasyonu, yeni hızlı CI workflow ve full regression bağlantısı eklendi. Sahnede mevcut fabrika, AI, bonus, 200/36/6 collider, 34 W02, 24 marker korunur.
- Üç bağımsız pose deneyi: sabit hızlı alt, 22.200'de avcıya kaçış, 23.500'de avcıya geç kaçış. Oyun kendi hareket, boundary, cooldown çarpışmasını hesaplar; ham JSON ham state/traces Actions artifact'tır. Dinamik kesintisiz 300s/human/native GPU değildir.
- **YAPILDI:** C16 analitik test + workflow + kabul sözleşmesi yazıldı. **AÇIK:** gerçek Chromium PASS ve risk gözlemleri, full CI, gerçek uzun pilot ve native GPU, önemli fizik/AI kullanıcı kararı ve merge. Bu kapsam kullanıcı onaysız fiziksel uygulamaya izin vermez.

**Günlük:** `2026-11-18 | NEXT11C16 | REAL updateGame KEY-DRIVEN 3-SCENARIO TEST CODE | CI PENDING | INDEX/FACTORY/AI/BONUS NO CHANGE | DRAFT / NO MERGE`.


### C16 dinamik scriptli gerçek oyuncu API testi — ilk PASS (18 Kasım)

- [Gerçek Chromium #44191236356](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44191236356) **PASS**: mevcut oyun `updateGame(dt)` ve `KeyD/ArrowUp` ile 30Hz kontrollü hareket. 22.000–25.200 penceresinde sabit FAST_LOW **3 gerçek collider cooldown olayı** (70 isabetli swept frame), **erken 22.200 avcı geçişi 0 olay/0 isabetli frame**, **geç 23.500 avcı geçişi 0 olay/0 isabetli frame**. Her üçü 25.200'e DNF olmadan ulaştı, boundary level hep 0. Orijinal 236 collider, 24 nav, 34 fiziksel W02 ve 60/300/850 sabit kurallar değişmedi.
- Avcı hedefi `x≈900,y≈310` erken denemede progress **22.744,39**, geç denemede **24.043,59**; erken/orta/sonuçlar C15'in yalnız geometrik hipotezlerini **gerçek oyun adımları açısından** güçlendirir. **İnsan oyuncunun, tüm bölümün, AI'nın veya 300s görevin güvenliği henüz kanıtlanmış değil.**
- C16 full Map1/Map4 güncel CI sonucu hâlâ doğrulanacak; PR #61 Draft/no merge; fabrika/AI/bonus değişikliği YOK. Kalan işler dokümantasyon ve simülasyon/sürekli oynanış QA; önemli oyun tasarım kararları kullanıcı açık onayı bekliyor.

**Günlük:** `2026-11-18 | C16 ACTUAL UPDATEGAME CHROMIUM PASS | FIXED_FAST 3 HITS | EARLY_HUNTER 0 | LATE_HUNTER 0 | 236/24/34 PROTECTED | FULL CI PENDING | NO GAMEPLAY EDITS OR MERGE`.


## 23) 18 Kasım — NEXT-11C17 Harita 4 yüksek yoğunluk / yüksek detay sanat turu

- **Kullanıcı yeni önceliği:** Harita 4'e daha çok eşya, bina, yüksek detaylı ve daha kaliteli büyük yapı. **Zor ve tehlikeli oyun** olarak kalacak; çarpışma normal, kaza azaltma otomatik hedef değil.
- **C16 tam CI artık doğrulandı:** [C16 hızlı #44191236356](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44191236356) PASS ve [tam Map1/Map4 #44191236376](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44191236376) **40/40 PASS**. Kod vs estetik karar ayrıdır.
- **C17 yeni dal:** `codex/map4-gfx11c17-dense-industrial-machinery` C16 Draft üzerine stacked. Gerçek `index.html` içine **6 sanayi tesisi çevresinde 24 büyük özgün 3D makine/bina grubu +72 küçük servis/kargo/panel/basınç ünitesi =96 yeni yerleşim** eklendi. Dört büyük ve üç küçük farklı çok-parçalı mimari aile/7 `InstancedMesh` draw batch. Shared aşınmış metal PBR atlası; 0 yeni ışık/doku/collider/dış model. LOW'da yüksek detay kapalı, büyük silüetler korunuyor.
- Uçuş koridorlarından dışta yan fabrika servis sahalarında. **236 mevcut collider, 24 W05 marker, 34 fiziksel W02 mesh, 5 rakip/8 avcı, 60/300/850 ve +18/+12 bonus değişmez.** Riskli yollar, fabrikalar ve gerçek kaza ihtimali korunur.
- **YAPILDI:** C17 üretim kodu, 4 kamera eski/yeni WebGL screenshot QA testi, hızlı workflow + full regresyon bağı. **AÇIK:** yeni test run PASS, gerçek görüntülerin kullanıcı estetiği, son çevre/üst faz görsel kalitesi, native GPU ve 5 dakika, en az 3 playable publisher. **DRAFT/NO MERGE**.
- Kabul: [C17 detay belgesi](MAP4_GFX11C17_DENSE_INDUSTRIAL_MACHINERY_ACCEPTANCE.md). Sonraki yüksek yoğunluk turu, ilk kamera/üçgen/performance sonuçlarına göre hazırlanır; estetik puan test sonucundan türetilmez.

**Günlük:** `2026-11-18 | NEXT11C17 | 96 NEW VISUAL-ONLY INDUSTRIAL UNITS / 7 BATCH CODED | REAL WEBGL CI PENDING | COLLISION/AI/BONUS UNCHANGED | DRAFT/NO MERGE`.


### NEXT-11C17 — ilk gerçek yüksek yoğunluk sanat QA kaydı

- [C17 WebGL #44206367310](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44206367310) **9/9 PASS** ve [hızlı tekrar #44206497301](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44206497301) **success**. 24 büyük + 72 küçük **96 yeni original industrial unit**, yalnız 7 drawcall, ek **49.320 tris**, 4 gerçek 1600×900 önce/sonra görüntü çifti: hepsi kare farkı üretti. HIGH/BALANCED tüm detay; LOW yalnız büyük model. **Fizik 6/36/200, 24 rota işareti, 34 W02, 5/8, 60/300/850, +18/+12 aynı**.
- **KALAN:** [C17 full #44206497307](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44206497307) CI hâlen in_progress; kullanıcı 7–8/10 onayı, gerçek native GPU 720/1080 FPS/VRAM, gerçek kesintisiz 300s oynanış ve yayıncı 3/6 playable, PR Draft/merge izni. Bu görsel yoğunluk turu **kaza zorluğunu azaltmadı**.


### C17 — Kullanıcı onaylı sınırlı iç varlık tekrar kullanımı (18 Kasım)

- **Yeni tasarım kararı:** Harita 4'e daha fazla yapı ve obje eklerken, daha önce **bu oyun için özgün olarak ürettiğimiz** binalar/modeller **sınırlı sayıda yeniden kullanılabilir**. Tamamen yeni, tek kullanımlık varlık zorunluluğu yoktur; fakat tekrarlı hazır-kutu kent hissi oluşturmak yasak.
- **Uygulama ilkesi:** Ayırt edici büyük/hero yapılar ağırlıklı olarak özgün ve bölgeye özel kalır. Tekrarlar ağırlıklı olarak yardımcı depo, teknik servis, kule/boru alt birimi gibi ikincil öğelerde; yön, ebat, kısmi renk/malzeme, çevre modülleri, detay seti ve konum varyasyonuyla yapılır. Aynı çok belirgin bina silüetinin arka arkaya sıra halinde çoğaltılması önlenir.
- **Özgünlük sınırı:** Yalnız **projenin kendi ürettiği** varlıkların kontrollü yeniden kullanımı için izin verildi. Dış ticari 3D modellerin veya başkalarının özgün bina silüetlerinin kopyalanmasına izin değildir.
- **Oynanış:** Bu görsel izin fiziksel collider, AI, rota bonusu, riskli geçit, hasar, zorluk veya PR birleştirme izni **değildir**. Mevcut binalar ve tehlikeler korunur; yeni gerçek fiziksel yapı eklemek ayrı bir karar gerektirir.
- **Sonraki görsel işler:** Sanayiye ek olarak 36.200 karakol, 42.600 askerî liman, 48.300 yörünge tesisi. Her alanda yeni özgün ana silüetlerin yanında sınırlı sayıda mevcut yardımcı mimari tekrar kullanılabilir; tekrarlanan nesneler kalite testinde ayrıca sayılır.


## 24) 18 Kasım — NEXT-11C18 / Squadrons 2–3. bölüm adaptasyonu: pilot kontrolleri ve enerji

- **Kullanıcı yeni açık karar:** Star Wars: Squadrons'ın **uçuş sistemini (2)** ve **enerji yönetimini (3)** projeye uygula; özellikle enerji önemli. **Gemi modelleri/sınıfları/özelleştirme ileride**, şimdi gemilere dokunma.
- **Güvenli uygulama:** Harita 4'e özgü 4 güç önceliği (1–4), motor/silah/kalkan **ayrı rezervleri ve dolum oranları**, yeni üçlü HUD. Motor önceliğinde boost hedefi ×1,05; silah odağı lazer rezervini hızla yeniler; kalkan odağı hasardan 6s sonra, yavaş ve enerji tüketerek onarım yapar. Harita 4 lazeri artık her çift atışta 5 silah gücü harcar. Yeni **X boost-drift**, **Alt free look**; eski Q/E barrel roll ve C kamera korunur.
- **Kesin koruma:** Harita 1 yarış, eski ortak enerji/lazer bedeli ve kontrol mekanikleri değişmez. Harita 4 mevcut 4 evre, 60s arena / 300s bitiş / 850 çıkış, 5 rakip/8 avcı, +18/+12 bonus, 6/36/200 collider, 24 marker, 34 W02, GFX11C17 96 obje. Gemi sınıfı/modeli eklenmez. Riskli kaza parkurları kolaylaştırılmaz.
- **İlk denge parametreleri test değeridir**, otomatik kesin ürün kararı sayılmaz. Gerçek pilot deneyi, AI karşılaştırması, 300s + native FPS ve kullanıcı onayı ayrı kapı.
- **GELİŞTİRME-PR (Draft/no merge):** `codex/map4-next11c18-power-flight-controls`, [NEXT11C18 sözleşmesi](MAP4_NEXT11C18_POWER_FLIGHT_ACCEPTANCE.md); bağımsız Chromium + tam regression test kodu. İlk hızlı testte test dosyasındaki geçersiz sayısal anahtar düzeltildi; son HEAD sonuçları kontrol edilmeli.

### C18 gerçek test kabul kaydı

- [C18 hızlı Chromium/WebGL #44217012072](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44217012072) **SUCCESS**. Gerçek klavye 1–4 güç modları, ayrı motor/silah/kalkan kapasitör, enerji harcayan avcı lazeri, kalkan gecikme/onarımı, son boost sonrası X drift, Map1 motor/lazer izolasyonu ve 236/6 collider koruması test edildi. İlk iki test FAIL yalnız test dosyası sözdizimi/snapshot adlandırma hataları nedeniyle; düzeltildi.
- **AÇIK:** [tam C18 Map1/Map4 #44217011963](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44217011963) sonuç bekleniyor; gerçek insan 300s uçuş/AI dengesi, native GPU, kullanıcı güç oranı ve manevra onayı, kullanıcı merge izni. Gemi sınıfları ertelendi.

### C18 son hızlı test ve kalıcı oyun kararının korunması

- Son C18 HUD iyileştirmesi `05fd631`: lazerin **HAZIR** göstergesi ve `-5 silah gücü` maliyeti birlikte okunur. [Son hızlı Chromium/WebGL #44217575698](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44217575698) **9/9 PASS**. Son [tam Map1/Map4 #44217575808](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44217575808) sonucu açık; önceki hızlı sonucu tam PASS sanma.
- PR **#63 DRAFT / STACKED / NO MERGE**, kullanıcı güç/oynanış onayı gerek; yeni gemiler ve gemi sınıfları hâlâ ertelendi.


## 25) 18 Kasım — NEXT-11C19: Harita 1/4 için birer özgün oyuncu gemisi + onaylanmış kamera

- **Kullanıcı açık kararı:** Şimdilik oynanabilir **iki haritaya birer farklı oyuncu gemisi**. Önceki kamera seçim kararı: normal **#1 Cinematic Chase**, boost anında **#2 Tight Chase'e yumuşak yaklaşma**, boost bitince normale dönme. Gemi sınıfları/özelleştirme ve diğer gemiler yine sonraya.
- **YAPILDI:** Harita1 özgün ince yarışçı **R-01 VEKTÖR**, Harita4 özgün zırhlı savaş uçağı **B-04 BASTİON**. Baştan üretilmiş 3D değişken kesitli gövde, farklı kanat extrude şekilleri, zırh/servis panelleri ve motor/kanat/namlu/ışık detayları. Map4 mevcut GFX05 iç animasyon gövdesiyle aynı oyuncu gemisi olarak birleşir; eski basit Map1 meshleri arşiv amaçlı tutulur ama görünmez. Her gemi 6 bake GPU materyal grubu, 3. parti asset yok.
- Oyun iki haritada da Cinematic Chase kamera ile başlar, C ile kokpit/taret alternatifine dönülebilir. Normal kamera hafif çapraz arkadan ve yukarıdan; boostta arka mesafe **azalır**, FOV artar, fren/bırakmada yumuşak dönüş. Map4 kamera collider güvenlik sistemi korunur, oyuncu pozisyonuna müdahale yok.
- **DEĞİŞMEDİ:** 6/36/200 collider, AI ve savaş/bonus, 5 rakip/8 avcı, 60/300/850, +18/+12, Map1 yarış ve C18 enerji sistemi. Zorlu çarpışmalı güzergâhlar aynen.
- Yeni testler: `tests/map4-next11c19-two-player-ships.cjs` gerçek Chromium/WebGL dört normal/boost kare, model görünürlüğü, kamera mesafesi, Map1/4 seçim ve fizik bütünlüğü. [Teknik kabul](MAP1_MAP4_NEXT11C19_PLAYER_SHIPS_ACCEPTANCE.md). **AÇIK:** yeni test run PASS, tam regresyon, görsel insan onayı ve native GPU. **DRAFT / NO MERGE**.

### C19B — Önceki örnek görsel tarzı iki gerçek oyuncu gemisine entegre edildi (18 Kasım)

- **Kullanıcı isteği:** "TARZ OLARAK OYUNA ADAPTE ET". İki temsili referansın tasarım dili, Harita1 R-01 açık beyaz/turkuaz ince yarış gemisine ve Harita4 B-04 koyu çelik/turuncu zırhlı savaş gemisine uygulandı. Yalnız renk düzeni değil; kamera yakınında görülecek ilave 3D panel, kanat, motor halkası, radyatör, bolt ve namlu yüzeyleri de üretim `index.html` geometrilerine bake edildi. **Dış model/kopya yok; gemi kimliği orijinal.**
- Normal #1 takip kamera/boost #2 yakın takip değişmiyor. Yeni görsel detaylar önceki 6 materyal batch/gemi sisteminde kalır; tüm fizik/AI/bonus, Harita 1 yarışı, C18 güç yönetimi ve Map4 60/300/850 korunur.
- **AÇIK:** Son C19B gerçek WebGL görünüm ve eski regresyon PASS, kullanıcı görsel onayı, native GPU. PR #64 Draft; merge için açık onay şart.


### C19B — İlk oyun içi gerçek görsel ve kamera QA PASS

- [Güncel C19B hızlı WebGL run #44226228254](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44226228254) **9/9 PASS**. Beyaz/turkuaz R-01 (**181** detaylı alt parça) + koyu çelik/turuncu B-04 (**249** detaylı alt parça), 12 draw batch toplam. Başlangıçta normal 3. şahıs takip, boostta yumuşak zoom: Map1 kamera mesafesi **18,957→13,267**, Map4 **19,3707→13,3943**, iki model de gerçek 3D sahnede görünür. 4 gerçek normal/boost PNG ve JSON QA [artifact #14393625147](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44226228254/artifacts/14393625147) üzerinden incelenebilir.
- C19 ilk test FAIL'leri sonunda **fabrika/collider hatası değil**, test yükleme sırası ve kamera dünya uzayı gecikmesi olarak düzeltildi. Fizik/AI/enerji/bonuslar dokunulmadı: **6/36/200 collider** korundu. [Son tam Map1/4 CI #44226228256](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44226228256) sonucu ayrıca kabul edilecek. Native GPU, insan 300s ve kullanıcı 7–8/10 görsel onayı hâlâ açık. PR #64 DRAFT/NO MERGE.


### C19B — Son görsel düzeltme gerçekten test edildi

- Harita1'de R-01'in beyaz/turkuaz tasarımı ilk gerçek screenshotta çok karanlık görüldüğünden `212f1b15` ile yarış gövdesine kontrollü emissive görünürlük ve atlas ayrımı eklendi; Harita4 B-04'te koyu çelik kaplama ile turuncu motor/trim kontrastı güçlendirildi. Yalnız renk değil yeni gerçek 3D parça (R-01 **181**, B-04 **249**) vardır.
- **Son üretim materyali + test koduyla** [C19B hızlı Chromium/WebGL #44227015001](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44227015001) **9/9 PASS**. Dört gerçek normal/boost PNG ve QA JSON [artifact #14392084668](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44227015001/artifacts/14392084668). Kamera yakınlaşma örnekleri R-01 **15,42→13,23**, B-04 **19,37→13,39**. 12 draw batch, 6/36/200 collider, 24 marker, 34 W02, 5/8 AI, 60/300/850 +18/+12 korunur. Kullanıcı estetik 7–8/10 onayı ve native GPU/300s insan pilot **AÇIK**.
- [Son tam Map1/Map4 #44227014835](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44227014835) henüz bitmedi. PR #64 **DRAFT / NO MERGE**; C18 güç sistemi ve önceki Harita4 görsellerinin üzerine konumlandı.


## 26) 18 Kasım — NEXT11C20 / Harita 1 SB-07 ZENİT onaylı kaynak görselini gerçekten oyuna uyarlama

- Kullanıcı daha önceki R-01/R-02/R-03 kavisi, aşırı kaba/aşırı ince ve yanlış jet silüeti denemelerini reddetti; **kendi yüklediği “SB-07 ‘Zenit’” konsept panosunu “bu iyidir” diyerek onayladı** ve ardından “oyuna adapte et işte” dedi. Kaynak görselin gerçek 3D'ye çevrilmesi şimdi öncelikli.
- **YAPILDI/KOD:** `h4Ship20ZenitBuild` ile Harita 1'e **yeni SB-07 oyuncu gemisi**: kaynak görselin uzun keskin burnu, 2 ayrı geniş geriye süpürülmüş ana kanadı, **iki uç dikey fin**, gümüş-beyaz gövde + kırmızı yarış şeritleri, mavi-koyu kokpit, 2 ayrı karmaşık halka/ventli motor + turuncu mekanik/ mavi plazma. **Eski R-01 üretimden çıkarıldı**; SB-07 eski görünürlük değişkenine bağlandı. Gerçek geometrik nesne, sadece çizim/PNG/HUD resmi değil.
- **KORUNDU:** Harita1 sadece yarış odağı; fizik/AI/bonus/çarpışma/boost ve normal#1→boost#2 kamera değişmez. Harita4 **B-04 Bastion** değişmez; C18 güç sistemi/arena/hunter/36+200 fabrikalar ve 6 kanyon collision korunur. 0 dış ticari mesh, 0 yeni collider, 0 yeni silah. 7 materyal batch SB-07 + 6 batch B-04.
- **Test dosyası:** `tests/map1-next11c20-sb07-zenit.cjs` gerçek browser WebGL'de detay silüet, sol/sağ dikey uç, çift motor, kamera ve Map4 bütünlük, 3 ekran görüntüsü; eski C19 2-gemi testi yeni Map1 referansına göre güncellendi. `MAP1_NEXT11C20_SB07_ZENIT_ACCEPTANCE.md` kalite kapıları. **AÇIK:** hızlı PASS, tam Map1/4 regression, görsel gerçek render estetiği, native GPU, 300s insan pilot. **PR DRAFT / NO MERGE**.


### NEXT11C20 — Gerçek oyun içi SB-07 QA sonucu

- [C20 gerçek Chromium/WebGL hızlı run #44303505125](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44303505125) **9/9 PASS**. Kullanıcının **onayladığı “SB-07 Zenit”** kaynak görselini Harita1'e oyun içinde uyarladık: **143 gerçek 3D parça, 6.584 üçgen, 7 batch**, iki büyük dikey kanat ucu ve iki katmanlı plazma motoru; **R-01 artık hiç oluşturulmuyor**. Kamera mesafesi normal **18,9568→boost 13,2517**, FOV **72,694→82,916**. [3 gerçek oyun görüntüsü + JSON](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44303505125/artifacts/14427041853). Harita4 B-04 **249 parça** aynı, collider **6/36/200**, 5 rakip/8 avcı, 60/300/850 ve +18/+12 aynı.
- Sinematik referans panosuyla ilk prosedürel 3D uyarlama **birebir materyal/ince işçilik eşdeğerliği değildir**; kullanıcı gerçek render kalite onayı, 300s insan sürüşü ve native GPU açık. [C20 tam Map1/4 regresyon #44303505052](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44303505052) sonucu ayrıca kabul edilir. PR #65 **DRAFT/NO MERGE**.


## 27) 18 Kasım 2026 — NEXT11C20B: onaylı SB-07 Zenit görsel işçilik geliştirmesi

- **Kullanıcı isteği:** "GEMİ GÖRSELİ İYİLEŞTİMELERİNE DEVQM". Onaylanan SB-07 Zenit formu ve Harita 1'e entegre edilmiş gerçek 3D gemi **korunur**; yeni alternatif gemi, eski kıvrımlı kanatlar veya R-01 geri getirilmez.
- **GELİŞTİRME-PR (yeni stacked dal):** `codex/map1-sb07-zenit-visual-polish`, C20/PR #65 üzerine. **UYGULANDI:** kanatlara 8 ince custom extruded panel, uzatılmış küre yerine 7-istasyonlu fasetli mavi cam kokpit ve metal çerçevesi, 2 geriye açılan içi açık motor nozulu, 2 yeni plazma halka, 12 dış soğutma kaburgası, 16 kapak/taç, tek 128x128 kendi ürettiğimiz paylaşılan roughness/bump PBR mikro yüzeyi. Önceki beyaz-gümüş/kırmızı silüet korunur.
- **PERFORMANS / FİZİK SINIRI:** SB-07 hâlâ **7 batch** ve B-04 **6 batch**, yeni gameplay collider **0**, yeni silah **0**; kamera normal Cinematic #1/boost Tight #2, C18, Map1 yarış ve B-04 gameplay/AI/60/300/850/6+36+200 korunur. Gerçek FPS/VRAM henüz ölçülmedi.
- **DOĞRULAMA KAPILARI:** Yeni WebGL geometri ve metal/engine testleri + hızlı Chromium workflow eklendi; tam Map1+Map4 CI tetiklemesi eklendi. **CI PASS, ekran görüntülerinin insan incelemesi, estetik onay, native GPU ve pilot testi henüz iddia edilmez.**
- **Belge:** [NEXT11C20B teknik ve estetik kabul](MAP1_NEXT11C20B_SB07_ZENIT_POLISH_ACCEPTANCE.md). **DRAFT / NO MERGE**, önceki stacked PR'lar otomatik birleştirilmez.
- **NEXT11C20C (öneri):** yeni 3 gerçek oynanış screenshotunun estetik incelemesi; gerekirse sadece malzeme/parlama ve kadraj rötuşu, kullanıcı kabulü beklenir.

**Günlük:** `2026-11-18 | NEXT11C20B | C20 ilk model -> geometrik/PBR detay dalı | kod+webgl test+workflow | CI BEKLİYOR | kullanıcı onayı AÇIK | native GPU AÇIK | NO MERGE | NEXT11C20C`.


## 28) 18 Kasım 2026 — NEXT11C20C: SB-07 gerçek boost ışığı, canopy clearcoat ve art okunabilirliği

- **YAPILDI / GELİŞTİRME DALINDA:** `codex/map1-sb07-zenit-visual-glow-pass`, önceki NEXT11C20B PR #67 üzerine. İki burun intake çukuru ve burun dikişleri, iki dış dikey kanat ucunda spar/vent detayı, kanat ucunda mavi konum ışıkları, `MeshPhysicalMaterial` cam clearcoat, tek büyük yeri değiştirmeden 7 materyal SB-07 batch içinde.
- **BOOST'A DUYARLI GERÇEK KOD:** `h4Ship20ZenitVisualTick(dt)` yalnız Map1 race active olduğunda gerçek hız/boost durumuna göre plazma/amber/gölgeli cam rengini yumuşak değiştirir. Sadece görseldir, ekstra ışık, collider, silah ve oyuncu statı yok; B-04 249 parça / 6 batch korunuyor.
- **KOD TESTİ:** C20 WebGL testine çift hava girişi, kokpit gerçek clearcoat, gerçek normal/boost engine color kontrolü ve birebir göreli kadraj ile iki ek screenshot eklendi. CI workflow yeni branch için ayrı; tam Map1/4 smoke yeni branch'te çalışacak.
- **AÇIK QA:** hızlı/tam CI sonuçlarını görmeden PASS denmeyecek. Yeni 2 aynı açılı motor görüntüsünü incelemek, olası fazla parlama/renk uyuşmazlığı düzeltmek, gerçek GPU 60 FPS ve kullanıcı estetik kabulü açık. Onaylanmış SB-07 siluetini bozma, reddedilen kıvrımları geri getirme.
- **NO MERGE:** Önceki #65 ve #67 stacked PR'larının hiçbirisi kullanıcının açık izni olmadan main'e geçirilmez.
- **Kabul:** [NEXT11C20C](MAP1_NEXT11C20C_SB07_ZENIT_BOOST_VISUAL_QA.md). **NEXT11C20D:** önce gerçek QA görüntü incelemesi, ardından gerekiyorsa hedefli art rötuşu.

**Günlük:** `2026-11-18 | NEXT11C20C | NEW | yeni original geo+cam PBR+state-driven neon | CI BEKLİYOR | görüntü/kullanıcı onayı YOK | native GPU YOK | DRAFT/NO MERGE | NEXT11C20D`.


## 29) 19 Kasım 2026 — NEXT11C20D SB-07 ikinci mekanik detay paketi

- **KULLANICI YÖNLENDİRMESİ:** 'gemi detay ekleme devam'. Onaylı Zenit gövdesi değil, mevcut oyun içi modelin mikro/orta ölçek mekanik işçiliği geliştirilir.
- **KOD VAR — GELİŞTİRME-PR:** `codex/map1-sb07-zenit-detail-wave2` stacked C20C PR #68 üzerine. SB-07 için 4 ayrık kanat kontrol yüzeyi, 4 alt spar, 10 çift motor servis ızgarası, 20 stator kanadı ve 2 termal manifold eklendi. Kanat uçlarının boyu/yönü ve uzun burun değişmez; tüm parça var olan 7 materyal batch'inde.
- **KORUNAN:** Harita1 yarış fiziği/AI/kamera, speed boost ve C18; Harita4 B-04/arena, 6+36+200 collider, 5 rakip/8 avcı, 60/300/850, +18/+12. Yeni weapon/collider/external model yok.
- **TEST DURUMU:** HTML JS parse PASS; WebGL gerçek geometri stator/assertion test ve Chromium workflow eklendi, tam Map1/4 regresyon dalı yeni branch'e eklendi. **CI PASS ve native GPU/estetik onay henüz iddia edilmez**.
- **Sonraki:** NEXT11C20E gerçek WebGL screenshot 3/4/chase görsel incelemesi ve hedefli rötuş; kullanıcı izni olmadan MERGE YOK.
- **Belge:** [NEXT11C20D](MAP1_NEXT11C20D_SB07_MECHANICAL_DETAIL_ACCEPTANCE.md).

**Günlük:** `2026-11-19 | NEXT11C20D | DRAFT CODED | 4 kontrol paneli+20 stator+ızgara+kanal | JS PARSE PASS / CI AÇIK | NO MERGE | NEXT11C20E`.

## 30) 19 Kasım — NEXT11C20E SB-07 yüzeye oturtma ve twin-engine art kalite

- **KULLANICI:** "detay ve kalite arttırma devam". Kod/mevcut oyun kalitesine yönelik ve önceki onaylı SB-07 siluetini koruyan aşama.
- **GELİŞTİRME KODU:** `codex/map1-sb07-zenit-surface-art-e` dalında C20D PR #69 üstüne: 8 kanat kökü hava kanalı, 2 ince spar çizgisi, fasetli cam ön/arka conta ve üst cam derzi, her motor için 3 iç 3D halka (toplam 6), 12 iç ısı kalkanı. Önceki kanat üst kaplama/yarış şeritleri ve kontrol derzleri y-offset hatası azaltılarak gerçek aerofoil üstüne indirildi; yeni uç veya şekil yok.
- **KORUMALAR:** 7 SB-07 / 6 B-04 materyal grubu, 0 external asset/collider/weapon, normal Cinematic Chase ve boost Tight geçişi, C18, Harita1 adil yarış, Harita4 6/36/200, 5 rakip 8 hunter, 60/300/850 +%18/+%12.
- **QA:** Bütün HTML script JS syntax PASS; WebGL C20E gerçek iki motor boğazı ve yeni meta kontrol eklendi; hızlı/full workflow. V3 ayrı HTML önizleme dosyası mevcut; **üretim oyunu WebGL başarı, FPS ve kullanıcı görsel onayı yok**.
- **GitHub:** [Kabul belgesi](MAP1_NEXT11C20E_SB07_SURFACE_QUALITY_ACCEPTANCE.md). Draft stacked branch; kullanıcının açık kararı olmadan **NO MERGE**.
- **NEXT11C20F:** Önce görüntü ve motor boğazı/kanat paneli clipping testleri, sonra çok hedefli art düzeltme.

**Günlük:** `2026-11-19 | NEXT11C20E | GÖRSEL KALİTE KODLANDI | FLOATING PANEL FIX + ENGINE DEPTH | SYNTAX PASS / CI AÇIK | ESTETİK AÇIK | NO MERGE | NEXT11C20F`.


## 31) 19 Kasım 2026 — NEXT11C20F SB-07 motor glow ve kanat birleşimi son katman

- **KULLANICI DEVAM KARARI:** Önceki onaylı SB-07 Zenit'in kodda kalite/detail geliştirmesi, şekil değiştirmeden.
- **UYGULANDI:** `codex/map1-sb07-zenit-lighting-f` stacked NEXT11C20E PR #70 üzerine. Her büyük motorun ucuna 1'er gerçek 64² Canvas radial halo Sprite eklendi; iki sprite ortak bir texture kullanır, hız/boostta .18→.48 opacity ve 1.85→2.27 boyutla yumuşak glow. Mevcut 7 ana batch aynen; **iki ek saydam sprite çizimi**, 0 yeni shadow/light physics/collider/silah/external model. 12 nozzle dark recessed işaret ve 6 kanat kökü flush panel derzi eklendi. Harita 4 B-04 korunur.
- **KONTROL:** Tam oyun JavaScript inline parse PASS. WebGL hızlı testine iki halo, sağ/sol pozisyon, tek 64² atlas, additive/depthWrite false, gerçek boosttaki opacity/çap ve Harita 4 koruma kontrolleri eklendi. Yeni branch'te özel + full Map1/4 smoke workflow hazır. **CI PASS ve gerçek GPU gözlemi henüz doğrulanmadı**.
- **PREVIEW:** Kullanıcıya ayrı SB07_Zenit_Detay_V4_Motor_Isik_Onizleme.html 360° browser inceleme dosyası (3. taraf CDN Three.js gerektirir; asıl oyun değil).
- **MİMARİ SINIR:** Onaylı düz/swept kanatlar, iki yükselebilen dikey uç, sivri burun, 7 ana batch, race-only Harita1, untouched Harita4. GitHub stacked PR **taslak**; açık izin olmadan NO MERGE.
- **KABUL:** [C20F](MAP1_NEXT11C20F_SB07_PLASMA_LIGHTING_ACCEPTANCE.md). Sonraki **NEXT11C20G** gerçek screenshots üzerinden bloom/opacity tuning + renderer perf validation.

**Günlük:** `2026-11-19 | NEXT11C20F | GAME-CODED & HTML V4 | procedural soft glow+paired nozzle details | SYNTAX PASS / CI UNCONFIRMED | NO MERGE | NEXT11C20G`.


## 32) 19 Kasım 2026 — NEXT11C20G SB-07 çizgi kalitesi / art netliği

- **KULLANICI İSTEĞİ:** "kalite arrtırmaya devam çizgi kalitesi vb". Odak yeni gemi biçimi değil gerçek oyun çizgi silüeti, low-poly kenarlar ve uzaktan doku titreşmesi.
- **KODLANDI / YENİ STACKED DAL:** `codex/map1-sb07-zenit-edge-quality-g`, NEXT11C20F PR #71 üzerine. Renderer mevcut MSAA ve DPR<=2 korunuyor. SB-07 gerçek modelindeki square beam yerine 12-yüzlü cylinder seam; engine barrel 14→24, torus 7×18→10×32; yatay ana kanat bevel 1→3 ve iki dikey fin bevel 1→3, güverte panel 2 bevel; kokpit enine 7→9 örneklem. Siluet ana ölçüleri bozulmaz.
- **DOKU VE IŞIK:** Roughness bump texture 4× anisotropic + trilinear mipmaps; grid seam kontrastı düşürüldü; gümüş emissive .38→.20. Twin halo atlas 64²→128², daha pürüzsüz gradyan ve mipmap. Önceki actual-speed boost shader ve 2 sprites aynen.
- **KORUMALAR:** R01 geri yok; SB07 Map1 race-only 7 mesh material batches +2 opacity sprite, 0 new collision/weapon/downloaded model; Map4 B04 6 batches, physics/AI/camera/mapping untouched. No merge.
- **TEST:** Inline game JS statik parse PASS; WebGL test updated with nine cockpit columns, AA geometry detail meta and 128px mipmapped paired halos; dedicated + full Map1/Map4 smoke workflows. **WebGL CI SUCCESS, screenshots ve native GPU FPS henüz doğrulanmadı**.
- **KABUL:** [NEXT11C20G](MAP1_NEXT11C20G_SB07_LINE_QUALITY_ACCEPTANCE.md). **SIRADA NEXT11C20H:** ekran görüntüsünde kenar/pixel ve glow histogram/artefact incelemesi, teknik gereksinim varsa hedefli FXAA prototipi.

**Günlük:** `2026-11-19 | NEXT11C20G | KODLANDI | 12-segment round lines /24 barrel/32 rim /3 bevel /128 mipmap | JS PASS CI UNCONFIRMED | NO MERGE | NEXT11C20H`.


## 33) 19 Kasım 2026 — NEXT-11C20H gerçek SB-07 modelinden aynı kadraj ekran görüntüsü QA

- **TETİK:** Kullanıcı "." ile bir sonraki geliştirme aşamasına geçme talimatı verdi. Önceki NEXT11C20G PR #72 üzerine `codex/map1-sb07-zenit-review-h` ayrı stacked dalı.
- **KALİTE KODU:** Mevcut renderer MSAA açık; global shader/Fxaa blur yok. `lineTube` min machining seam çapı .056 yapıldı, iki motor glow 128² atlas ve boost ışığı artık opacity `.14→.38` ve çap `1.68→2.06` sınırında; nozül iç 20 stator ve halkaları daha görünür kılma hedefi. Yedi batch + iki sprite; Map1 ve Map4 oyun mekaniği korunur.
- **GERÇEK WEBGL GÖRSEL KANIT TESTİ:** Oyun içindeki SB-07 model `clone(true)` ile aynı gerçek mesh/matürler stüdyo ışığına alındı; sabit 1600×900 çizim, normal/boost **aynı kamera**, ön ve arka ayrı 3 PNG; `gl.readPixels`→Canvas PNG ile `preserveDrawingBuffer=false` boş resim riski giderildi. Her motor için 40×40 RGB parlaklık/beyaz clipping/cyan oranları, gl antialias ve draw calls raporlandı.
- **GERÇEK BAŞARI IDDİASI YOK:** JS parse PASS; özel WebGL ve Map1+4 regresyon workflow tanımları kaydedildi. Github Actions run sonuçları ve resimleri **henüz incelenmedi**; bu yüzden render ve estetik PASS yazılmaz. Native GPU/FPS/p95 ve kullanıcı kararı açık.
- **KORUMALAR:** SB-07 uzun burun/yatay düz geniş ana kanat/dikey dış uçlar, race-only Harita1; B-04 Harita4 ve tüm collider/AI/boost/harita amaçları değişmez. DRAFT/NO MERGE.
- **KABUL:** [NEXT11C20H](MAP1_NEXT11C20H_SB07_RENDER_EVIDENCE_ACCEPTANCE.md). **SIRADA NEXT11C20I:** gerçek PNG ve ölçüm analizi, seçici kusur düzeltmesi, gerçek GPU perf.

**Günlük:** `2026-11-19 | NEXT11C20H | CODED + 3 STUDIO WebGL PNG QA | script syntax PASS, CI UNCONFIRMED | rendering images not reviewed | DRAFT | NO MERGE`.


## 34) 19 Kasım 2026 — NEXT-11C20I entegre SB-07 yüzey tasarımı / ayrık parçaları birleştirme

- **KULLANICI KESİN KARARI:** "şimdi fazla parça eklemek yerine ayrık parçaları birleştir ve çizgi kalitesini yükselt" ve ardından "." = sonraki aşamaya geç. Bu turda **yeni görsel küçük dekor değil, gerçek primitif azaltma ve temiz uzun çizgiler**.
- **KAYITLI UYGULAMA:** `codex/map1-sb07-zenit-unified-surfaces-i` branch, NEXT11C20H PR #73 üstüne stacked. 3 burun red box → tek gerçek hull-conformal ribbon, kokpit yatay 4×2 bağımsız rod → iki sürekli tube; kanat kökü kutuları → birleşik deck inlet; iki kanatta tek flap; 16×2 kanat arkası kutu → dört uzun rail; motor üstü louver dizileri → 2 continuous groove; her motorda 26 ufak thermal/petal blok+6 notch → 4 sürekli halka; motor yan 7×2 kutular → 2 metal skin; 2 soğutma çift çubuk → 2 curved conduits; gövde arkası exchanger sadeleştirildi.
- **ÖLÇÜLEN DEĞİŞİM:** Önceki gerçek model fonksiyonu mock Three.js kaynak builder çalıştırması `parts=354`, yeni gerçek fonksiyon `parts=191` => **−163 (%46.05)**, ikisi de `batches=7`. Bu draw-call veya native GPU FPS iddiası DEĞİL.
- **NET ÇİZGİLER:** `lineTube` radial 12→16, cylinder radial 24→32, torus ring 32→40, wing/fin bevel 3→4, kokpit enine 9→11, 128px mipmap/plasma korunur.
- **SINIR:** Aynı onaylı SB-07 uzun burun + düz geniş kanat + iki dikey uç stabilizatörü; Harita1 saf yarış; Harita4 B-04 249 parçalık model/6 batch ve combat/AI/kamera/hitbox değişmez. 7+2 çizim bütçesi korunur. PR **taslak**, izin olmadan merge yok.
- **QA:** Tam oyun inline JS parse PASS. Gerçek kaynak builder primitif sayım PASS, Chromium WebGL testinde exact 191 assertion + kaliteli geometri ölçüleri; branch için hızlı ve tam Map1/4 workflow. **CI screenshot/GPU PASS henüz doğrulanmadı**.
- **KABUL BELGESİ:** [NEXT11C20I](MAP1_NEXT11C20I_SB07_UNIFIED_SURFACE_ACCEPTANCE.md). **NEXT11C20J** gerçek artifakt görüntüleri incele, fazla parlama/z-fighting, yüksek segment GPU yükü ve UX sorunu varsa düzelt; gereksiz dekor parçası ekleme.

**Günlük:** `2026-11-19 | NEXT11C20I | REAL MODEL 354->191 (−46%) | CHASE-SAFE 16/32/40 CURVES | JS PASS / WEBGL CI UNVERIFIED | DRAFT NO MERGE | NEXT11C20J`.


## 35) 19 Kasım 2026 — NEXT11C20J SB-07 bütünleşik yüzey oturtma / z-fight risk onarımı

- **SEVK:** Kullanıcının "." mesajı = sıradaki geliştirme adımına geç. C20I "parça eklemek yerine birleştir" kararı KESİN, C20H/C20I onaylı SB-07 silueti değişmez.
- **GERÇEK KOD:** `codex/map1-sb07-zenit-surface-fit-j`, PR #74 üstüne ayrı stacked draft. C20I tek parça burun kırmızı şeridi eski sabit yüksekliklerden bağımsız `hullRows` 14-gen gövde istasyonlarına göre yeniden hesaplandı: 5 z istasyonu x 3 genişlik örneği ve yalnız .018 düzgün surface clearance; 1 ribbon parçası korunur. Sağ/sol wing shroud CENTER -0.02→-0.07, alt yüzey -0.08→-0.13 gerçek kanat üstüne indirildi; iki üst kırmızı şerit de .066→.016. Yeni dekoratif geometri ve yeni collider yok.
- **KALİTE:** 354→191 gerçek kaynak-builder parça azalışı, 7 materyal mesh +2 plume sprite bütçesi; line16/motor32/torus40/bevel4/glass11 ve 128² trilinear/aniso4 materyal korunuyor.
- **TEST:** Tam oyun JS parse PASS; Chrome testinde 5×3 gerçek kırmızı burun vertex + ±.004 14-gen yüzey koordinat check, shroud skin samples, studio gerçek RenderTriangles/geometries budget, Map1 race/Map4 arena korunma check ve PNG taraması eklendi. Yalnız test kodu hazır, **webGL CI PASS/görsel ve native GPU FPS başarısı henüz teyit edilmedi**.
- **BELGE:** [NEXT11C20J](MAP1_NEXT11C20J_SB07_SURFACE_FIT_QA.md). **SIRADA NEXT11C20K:** Gerçek CI ve screenshot kanıtını incele, gereksiz parça eklemeden hedefli kusur düzelt.
- **KORUMA:** Harita4 B-04 ve 6/36/200 colliders, combat/AI/timer, Harita1 kamera/physics/HUD/boost untouched. **DRAFT / NO MERGE**.

**Günlük:** `2026-11-19 | NEXT11C20J | SINGLE NOSE STRIPE HULL SKIN FIT + WING SHROUD FLUSH | 191 PARTS / 7 BATCH | JS SYNTAX PASS CI AÇIK | NO MERGE | NEXT11C20K`.


## 36) 19 Kasım 2026 — NEXT11C20K coplanar kanat boya / flap depth-fight onarımı

- **KULLANICI TETİĞİ:** '.' ile bir sonraki aşamaya geç. Kesin "yeni küçük parça ekleme, ayrık parçaları birleştir ve çizgileri netleştir" kararı korunur.
- **GERÇEK KOD:** `codex/map1-sb07-zenit-overlap-fix-k` C20J PR #75 üstüne stacked. Aynı y=-.116 düzleminde kısmen örtüşen RED/HULL, RED/SECOND, SECOND/HULL ve SECOND/DARK güverte kaplamaları belirlendi. `wingDeckPlate(...,lift)`: kırmızı boya +.016, arka tek flap +.012, root metal dudağı +.012. Kanat ana şekli/siluet değişmez; 0 yeni dekor parçası.
- **MOTOR KALİTESİ:** Z5.97 turuncu motor collar'una yakın z6.02 ORANGE redundant torus birer adet iki motordan kaldırıldı. İki canlı motor ve 20 stator korunur, `integratedAnnularBands=6`.
- **SAYIM KAYNAKTAN ÇALIŞTIRILDI:** C20H 354 → C20I/J 191 → C20K **189** = toplam 165 düşük (%46.61). 7 SB07 opaque batch +2 plume sprite bütçesi korunur. Bu gözlemlenmiş GPU/FPS artışı olarak yorumlanmaz.
- **BROWSER QA:** Gerçek THREE.Mesh raycaster ile 4 kanat panel çakışma bölgesi x2 sides = 8 örnekte .008..05 yüzey derinliği aranıyor. Mevcut 15 nokta hull-fitting, 189 hard count, actual GL triangles and studio A/B PNG + Map4 B-04/physics/AI invariants, özel ve tam regression workflow yeni dalda.
- **TEST DURUMU:** Inline game JS ve QA script parse PASS. **Gerçek WebGL CI PASS, screenshot ve native GPU FPS doğrulanmadı**.
- **BELGE:** [NEXT11C20K](MAP1_NEXT11C20K_SB07_OVERLAP_QA.md). **SIRADA NEXT11C20L:** WebGL görsel kanıt ve 8 raycast sonucu üzerinden hedefli düzeltme, yeni dekor ve kamera/oyun kuralı değişikliği YOK.
- **GİTHUB:** stacked draft branch, kullanıcı açık izni olmadan **NO MERGE**.

**Günlük:** `2026-11-19 | NEXT11C20K | REAL OVERLAP CORRECTION / 191->189 | RED +.016, FLAP & ROOT +.012 | JS PASS, CI UNVERIFIED | NO MERGE | NEXT11C20L`.


## 37) 19 Kasım 2026 — NEXT11C20L gerçek GitHub Actions test hata giderme + tam oyun HTML

- **YENİ DAL:** `codex/map1-sb07-zenit-webgl-qa-fix-l` üst üste taslak, C20K PR #76 tabanlı. Kullanıcının '.' komutu mevcut C20L kalite/doğrulama basamağına ilerleme anlamında uygulandı.
- **GERÇEK CI BULGUSU:** Önceki C20K commit `96e0b96...` için GitHub push bazlı Actions çıktısı kontrol edildi. `#44509601434` hızlı Chrome SB07 QA = **FAIL**; `#44509601442` bütün Map1/4 smoke = **FAIL**. Kök: `tests/map1-next11c20-sb07-zenit.cjs:314` Node.js tarafında `THREE.LinearMipmapLinearFilter` kullanıyor, ancak Three.js yalnız `page.evaluate` browser tarafında var: `ReferenceError: THREE is not defined`. Offline GLB/oyun paketleme ve offline HTML Chromium kontrolü **başarılıydı**. Önceki "CI durumuna erişemiyoruz" kaydı yerine bu **doğrulanmış FAIL** esas alınacak.
- **KOD DÜZELTMESİ:** browser `page.evaluate` içinde gerçek materyal `map.minFilter===THREE.LinearMipmapLinearFilter` boolean okunuyor; Node tarafında `s.hasTrilinearMinFilter===true` kontrol ediliyor. Sahte bypass yok, gerçek WebGL/material assert korunur. `index.html` aynı, 189 parça / 7 opaque material batch +2 halo Sprite, onaylı düz kanat/dikey uçlar, Map1 racing-only ve Map4 B-04 aynen.
- **İNDİRİLEBİLİR TAM OYUN:** Actions full smoke `#44509601442` ile `map4-current-branch-playable-html` artifact ID `14520499229` çıktı. Bu ZIP Github bağlayıcısıyla indirildi; `Uzay_Yarisi_Guncel_Oynanabilir.html` dosyası (5,734,682 bayt) çıkarılıp `Starblade_Tekken5_Overdrive_PR76_Tam_Oyun.html` olarak konuşmaya doğrudan eklendi. Gerçek çevrimdışı oyun paketi; basit 3D önizleme veya indirici DEĞİL. Bundle içinde 4 inline JavaScript script `new Function` ile parse PASS. **Oynanış donanım testinin tümü başarıyla bitmedi.**
- **GÜNCEL TEST:** Özel `.github/workflows/map1-next11c20l-zenit-qa.yml` ve tam `map-browser-smoke.yml` dal tetiklemesi kondu; GitHub yeni testleri tetikledi. Yeni çalışmanın sonuç raporu ayrı doğrulanmadan PASS iddiası yok.
- **KABUL BELGESİ:** [C20L gerçek QA onarımı](MAP1_NEXT11C20L_REAL_WEBGL_QA_REPAIR.md). NEXT11C20M: son canlı QA run sonuçlarına göre gerekli gerçek 3D yüzey/koordinat düzeltmeleri ve gözle görüntü kabulü; yeni dekoratif küçük parça yok.
- **KORUMA:** Kullanıcı açık onayı olmadan PR merge yok.

**Günlük:** `2026-11-19 | NEXT11C20L | FOUND REAL CI FAIL NODE THREE | FIXED TEST REAL BROWSER FILTER | EXTRACTED DIRECT OFFLINE GAME HTML | CI RE-RUN IN PROGRESS/UNVERIFIED | DRAFT NO MERGE | NEXT11C20M`.


## 38) 19 Kasım 2026 — NEXT11C20M gerçek WebGL QA PASS bulgusu ve zaman zaman çıkan stüdyo boost tutarsızlığının onarımı

- **TETİK:** Kullanıcının "." komutu = sonraki NEXT11C20M. "Yeni küçük dekor parçası ekleme; mevcut parçaları birleştir, daha temiz çizgi" kararı değişmez.
- **GERÇEK KANIT:** Başarılı GitHub Actions run [#44516951852](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44516951852) **WebGL PASS**. Gerçek 1600×900 studio 3 açı + playable chase PNG artifact #14526193120 indirildi; ön/arka normal/boost ekran görüntüleri incelendi. 189 gerçek model parçası, 7 ana +2 Sprite draw calls, 36.156 gerçek WebGL triangle, 8× sağ/sol panel açıklığı .012–.016, 15 burun vertex ve Map4 B-04 249/6, collider [6,36,200] doğrulandı.
- **SONRAKİ FAIL'İN GERÇEK SEBEBİ:** C20L farklı GitHub run #44517397511 / full smoke #44517397400 `AssertionError: review images must show an actual game-state boost difference`. İlk playable chase normal/boost testi geçti; ikinci `fly(false/true)` full `updateGame` tekrarları bazen fizik/engel/bitiş durumu nedeniyle gerçek model ışık tick'ini durduruyordu. Bu game rendering bug kanıtı değil, **stüdyo sanat QA senaryosunun oyun fiziğine bağlanması**.
- **FIX:** `codex/map1-sb07-zenit-boost-qa-determinism-m` branşında ikinci stüdyo testini gerçek `h4Ship20ZenitVisualTick(1/30)` + gerçek ShiftLeft / RACE_SPEEDS.NORMAL girdisiyle, geçici state save-restore ve `finally` cleanup yaparak izole ettik. Oyun ana `index.html` ve gerçek playable `updateGame` chase kanıtı değişmedi; görsel assert devre dışı bırakılmadı. Normal/boost `studioDiagnostics` JSON da artifakta alındı. Test JS parse PASS. Yeni dal özel Chromium WebGL ve full Map1/4 workflow'a eklendi.
- **KORUMA:** 189 parça, 7 ana batch +2 share texture halo, orijinal geniş düz kanatlar/dikey wingtip, Map1 saf yarış, Map4 B04 249/6 korunur. Hiçbir PR izin olmadan merge edilmedi.
- **KABUL:** [C20M](MAP1_NEXT11C20M_SB07_DETERMINISTIC_BOOST_QA.md).
- **AÇIK:** Yeni run gerçek final PASS, native 720/1080 GPU FPS/p95, 5dk kullanıcı oynayarak kontrol ve açık merge kararı. **NEXT11C20N:** CI final loglarını/PNG kanıtını tekrar oku; gerekirse net hata fix, yeni parça ekleme.

**Günlük:** `2026-11-19 | NEXT11C20M | ACTUAL C20L SINGLE WEBGL PASS AND SUBSEQUENT STUDIO FLAKE FOUND | REAL VISUAL TICK ISOLATED; CHASE STILL GAMEPLAY-REAL | 189/7+2 | NEW CI PENDING | DRAFT NO MERGE`.


## 39) 19 Kasım 2026 — NEXT11C20N ölçülmüş 720p / 1080p WebGL bütçesi; runner APT 503 sorununa çözüm

- **KULLANICI TETİĞİ:** "." = NEXT11C20N aşaması. Kullanıcının kesin kararı: **fazla parça ekleme; SB-07 üzerinde ayrık parçaları birleştir ve çizgi kalitesini yükselt**. Bu aşamada oyun HTML kodu değiştirilmedi.
- **CI GERÇEK BULGUSU:** C20M bazı özel WebGL QA run'ları PASS (#44520110027), en son bazı koşuların kurulumu FAIL (#44520195239). Kök `npx playwright install --with-deps chromium` sırasında Ubuntu apt/font/Mesa mirror sunucularının HTTP 503 vermesi; oyun çizimi hatası değil. C20N özel ölçüm ve tam smoke workflow'larında apt üzerinden tüm bağımlılıkları tekrar indirme kaldırıldı, pinned `npx playwright install chromium` korundu.
- **ÖLÇÜM ARACI KAYDEDİLDİ:** `tests/map1-next11c20n-gpu-budget.cjs`, gerçek oyun Map1 + Map4 1280×720 ve 1920×1080, DPR=1, Chromium SwiftShader, 3 warmup +10 ölçüm `renderer.render(scene,camera);gl.finish()`, gerçek GL calls/triangles/textures/geometry resources, medyan ve 10 örnek max, 720p gerçek framebuffer PNG. Native GPU veya uzun süreli oynanış performansı DEĞİLDİR.
- **DOĞRULANMIŞ BAŞARILI RUN:** [#44521687724](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44521687724) gerçekten **success**. İndirilen [ZIP artifact #14528171226](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44521687724/artifacts/14528171226) içindeki `perf-report.json`, MAP1/MAP4 720p PNG görüntüleri gözden geçirildi. **4 durak:** Map1 720 257 draw calls/62026 triangles/median 1.70ms/max 4.60ms; Map1 1080 aynı calls/tris/median1.85/max7.30ms; Map4 720 284 calls/177591 tris/median3.35/max9.90; Map4 1080 aynı calls/tris/median2.55/max2.90. Hepsi SwiftShader CPU'lu, fiziksel kullanıcı GPU FPS ve 5dk gameplay doğrulanmadı. Test JS pageError: 0.
- **GÖRSEL KORUMA:** 189 gerçek SB-07 builder parçası, onaylı uzun burun/düz geniş yatay kanat/iki dikey wingtip/çift motor; 7 birleşik gemi mesh + 2 halo; Map1 saf yarış, Map4 B-04 249 model parça. Render budget testinde tümü assertion ile doğrulandı. Yeni dekoratif parça, yeni collider/silah, gameplay, Map4 ve game `index.html` değişikliği yok.
- **FULL SMOKE:** yeni dal için tüm Map1/Map4 43-step regression başlatıldı; **bu kayıt sırasında final PASS teyit edilmedi**. Eski full smoke'ları başarılı ilan etme.
- **YEREL ENGEL:** Sandbox Chromium ile lokal `file://` ve localhost erişimi `ERR_BLOCKED_BY_ADMINISTRATOR`. Yerel native GPU FPS iddiası yok; gerçek benchmark Github Actions üzerinde çalıştı.
- **KABUL:** [C20N](MAP1_NEXT11C20N_SB07_RESOLUTION_PERF_QA.md). **SIRADA NEXT11C20O:** yeni dalın tüm regression finalini ve gerçek PNG'leri doğrula; seçici performans/çizgi problemi varsa *yeni süs objesi olmadan* düzelt.
- **MERGE:** Kullanıcının açık onayı yok, stacked taslaklar **NO MERGE**.

**Günlük:** `2026-11-19 | NEXT11C20N | REAL CHROMIUM MAP1+MAP4 720/1080 WEBGL PERF PASS | 257/284 DRAW CALLS | 62k/177k TRIANGLES | APT503 CI MITIGATED | NATIVE GPU & FULL SMOKE PENDING | DRAFT NO MERGE`.


## 40) 19 Kasım 2026 — NEXT11C20O Harita1 uzak hatlarını 5 sektör/10 birleşik halka grubuna indirme

- **KULLANICI TALİMATI:** "." = sonraki basamağa geç. Kalıcı kısıt: yeni gereksiz parçalar yerine bütünleşik geometri ve pürüzsüz/az titreşen çizgiler.
- **GERÇEK KOD:** `codex/map1-sb07-zenit-corridor-clarity-o` branch. `index.html` Harita1 `buildVisibleCorridor` fonksiyonundaki 192 `LineLoop` arka plan ring **192→10** `LineSegments` (5 adet 10km sektör ×2 malzeme) olarak gerçek 3D birleşik buffer'a alındı. 192 ring koordinatı, 48 segment çevre, 39 major / 153 minor ve statik race route 50km aynen. Böylece 182 ayrı çizim nesnesi azaldı; tam sahne draw calls ve native FPS bu sayıyla eşit değildir.
- **İNCE ÇİZGİ KALİTESİ:** İnce ring opacity başlangıç .43→.30; dinamik pulse .33+.17p→.24+.12p. Major rings/güçlü yönlendirme ve çarpışma sınırları aynen. 16 boylam ışığı+16 sınır rayı korunur; Guide Group 42 çocuk çizgi nesnesi.
- **OYNANIŞ KORUMA:** Onaylı SB-07 189 parça ve dikey dış wingtip, Map1 saf yarış, Map4 B-04 249 parça/6+36+200 collider/AI ve tüm fizikler değişmez. Global blur/FXAA ve yeni model/parça/kolay kazanma yok.
- **QA:** game full inline JS parse PASS; Chrome özel gerçek WebGL QA `tests/map1-next11c20o-corridor-clarity.cjs` 192/10, vertex+3D point exact, Map4 protected, 2×720p PNG ve GL draw calls raporu üretecek şekilde kodlandı. Özel + full smoke workflow yeni dala eklendi. Gerçek CI sonucu finalde ayrı teyit edilmeli.
- **C20N TARİHSEL:** [C20N gerçek başarı #44522289298](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44522289298) SwiftShader 720/1080 PASS, Map1 257 calls/62026 tri, Map4 284 calls/177591 tri; CPU software render FPS olarak yazılmaz.
- **KABUL:** [C20O](MAP1_NEXT11C20O_CORRIDOR_CLARITY_ACCEPTANCE.md). **SIRADA C20P:** gerçek C20O görselleri/drawCalls karşılaştırması, sektörel görünürlük ve performans doğrulaması, gerekirse minimal düzeltme; kullanıcı onaysız merge yok.

**Günlük:** `2026-11-19 | NEXT11C20O | MAP1 CORRIDOR 192 separate rings -> 10 sector batches | SUBDUED MINOR LINE CONTRAST | ORIGINAL ROUTE/PHYSICS | CI PENDING | DRAFT/NO MERGE`.


### NEXT11C20O gerçek QA güncellemesi — 19 Kasım 2026, aynı aşama
- **KÖK TEST HATASI ONARILDI:** İlk hızlı test Map1 içindeyken fizik `[6,36,200]` bekledi; Map4 henüz seçilmediğinden gerçek durum `[0,0,0]` idi. Harita1 için `[0,0,0]`, Harita4 başladıktan sonra `[6,36,200]` kontrol edildi. Oyun kodu değişmeden QA düzeldi.
- **GERÇEK SUCCESS:** [GitHub Actions #44524333490](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44524333490) `success`; halka gerçek geometri: **192→10** batch, `ringVertexError=0.00000974`, 189 SB-07, Map1 `renderer.info.render.calls=252` ve Map4 `262`; gerçek Chromium 720p iki PNG artifact [#14528678746](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44524333490/artifacts/14528678746) indirildi. C20N Map1 257 çağrıyla bağımsız test bağlamında görülen fark 5. **Çıkarım sınırı:** C20O nesne azalması, aynı karede 182 gerçek draw-call kazancı anlamına gelmez (frustum culling).
- **AÇIK:** yeni final commit/PR ve tam 43 basamak smoke testi bitişi, native GPU FPS ve kullanıcı görsel kabulü. Testin başarılı olduğunu iddia etmek için kullanılan HEAD `4f7c304...`; sonraki yalnız MD commit'leri kod değiştirmedi.


## 41) 19 Kasım 2026 — NEXT11C20P mesafesel GPU fade ve gruplanan uzun raylar

- **KOD:** C20O PR #80 dalı üzerine stacked codex/map1-sb07-zenit-distance-clarity-p. Orijinal 16 adet 50km boyuna ray, aynı 115m ölçüm/3D koordinatlarla 20×2500m yerel çizim batch'ine alınmıştır: 6960 segment. 192 halka aynı 10 ring batch, 39 major/153 minor korunur.
- **YENİ GÖRSEL NETLİK:** GPU fragment shader, vertex rota mesafesi ile oyuncu routeProgress arasını ölçer. Ray 900–4600m, ince mavi halka 600–3000m aralığında yumuşak solar; önemli 39 major yön halkası ve 16 çarpışma sınırı değişmez. Dekor veya gemi parçası ekleme yok.
- **PERFORMANS:** Rehber çizim nesnesi sayısı 42→46; bu artış render draw calls artışı iddiası değildir. Yerel frustum bütçe etkisi testte ölçülür; native GPU FPS açık.
- **KORUNAN SİSTEMLER:** SB-07 189 parça 7 opaque+2 sprite, Map1 saf yarış, Map4 B-04 249 parça, 6+36+200 collider, oyun kuralları.
- **TEST:** Eski halka geometri testi, yeni gerçek WebGL P testi ve tüm browser smoke tetikleyicisi eklendi. Son commit testleri sonuçlanmadan PASS yazılmaz. [Kabul kriterleri](MAP1_NEXT11C20P_DISTANCE_FADE_ACCEPTANCE.md).
- **SIRADAKİ C20Q:** Son QA, screenshot ve draw-call sonuçlarını kontrol et; gerekirse küçük seçici düzeltme. **PR DRAFT / MERGE YOK.**

**Günlük:** 2026-11-19 | NEXT11C20P | 16 rails / 20 local batches | 192 rings kept | progress GPU fade | 189/249 ships protected | CI pending | no merge.


## 42) 19 Kasım 2026 — NEXT11C20Q kılavuz/sınır çizgilerinde uzak görüntü kontrastı

- **ÖNCEKİ KANIT:** C20P gerçek 720p Chromium görüntülerinde uzak turkuaz/mavi çevre çizgileri hâlâ yoğun. C20P özel tam SHA 29723d5e86.. WebGL PASS; C20P tam browser smoke'nun ayrıca sonuç kaydı gerekir. Eski ekran görüntüleri farklı anları gösterdiğinden doğrudan pixel A/B sayılmaz.
- **KOD:** `codex/map1-sb07-zenit-guide-contrast-q` — 39 ana ring (48 segment/halka) ve 16 warning boundary (8 amber+8 red; 235m özgün sample) geometri koordinatları aynen, `routeDistance` eklenerek GPU'da oyuncu ilerlemesine göre kontrast fade. Major 1700–5400m floor .35; hint 1400–5500m floor .22; danger 1500–6200m floor .24. Yakındaki alarm opasitesi/renk/pulse değişmez.
- **SABİT KORUMA:** 192 halka, 10 ring batch, 16 orijinal ray / 20 batch /6960 segment, toplam 46 guide nesnesi; SB-07 189 parça, Harita1 saf yarış, Harita4 B-04 249 parça ve [6,36,200] collider, AI/fizik/HUD korunur. Yeni dekor yok.
- **TEST:** Q özel gerçek Chromium aynı-kamera ve aynı-frame Q-shader açık/kapalı A/B, 2 PNG, renk-parlaklık farkı, geometri attribute ve Map4/ships regresyonu; ayrıca O/P ve tam browser smoke. Sonuç doğrulanana dek Q CI **BEKLİYOR**. Ekran kartı native FPS ve 5dk estetik kabul açık.
- **BELGE:** [NEXT11C20Q kabul](MAP1_NEXT11C20Q_GUIDE_CONTRAST_ACCEPTANCE.md). **SIRADAKİ NEXT11C20R:** görünüm ve same-camera Q A/B delilleri sonrası 2.5km ray batch sınır çizgilerindeki pop/titreme analizi. Taslak stacked PR; explicit izin olmadan merge yok.

**Günlük:** 2026-11-19 | NEXT11C20Q | major+boundary selective distance fade | original geometry, game, Map4 protected | fixed-camera WebGL A-B triggered | DRAFT / NO MERGE.
