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
