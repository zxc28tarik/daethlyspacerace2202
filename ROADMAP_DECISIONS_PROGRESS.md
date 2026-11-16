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
- **Kısa devam komutu:** Kullanıcı sonraki mesajda yalnız `.` yazarsa **bir sıradaki açık alt görevi** uygula; `..` veya `. .` gibi birden fazla nokta aynı sayıda ardışık geliştirme adımı demektir. Önceki işte hata varsa **önce hata giderilip test edilir**, sonra yeni adıma geçilir. Gerçek CI/estetik onayı olmadan yapılmış iş otomatik tamamlanmaz. Bu komut **arkada/otomatik zamanlanmış iş değildir**; kullanıcı yeni mesaj gönderdiğinde uygulanır.

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
| GFX-05C | Paylaşımlı konik çift motor egzozları | **YAPILDI-MAIN / CI DOĞRULAMA** | [PR #31](https://github.com/zxc28tarik/daethlyspacerace2202/pull/31) 16.11.2026 tarihinde **MERGED**; merge SHA [d92830c](https://github.com/zxc28tarik/daethlyspacerace2202/commit/d92830cffe8aed40bc32a1ca44ae3ad7ef824779). CI PASS/gerçek GPU FPS ayrı açık kapılar. |
| GFX-06 | Tam ölçekli PBR, atlas, endüstri modeli/decal | **KISMEN / 6 TESİS KODU, MALZEME + LOD TASLAK PR** | [#32 GFX06A](https://github.com/zxc28tarik/daethlyspacerace2202/pull/32) IN01/02, [#33 GFX06B/VIS01](https://github.com/zxc28tarik/daethlyspacerace2202/pull/33) IN03/04, [#34 VIS02](https://github.com/zxc28tarik/daethlyspacerace2202/pull/34) 58 özgün dekor +34 fiziksel cephe, [#35 GFX06C](https://github.com/zxc28tarik/daethlyspacerace2202/pull/35) IN05/06, [#36 GFX06D](https://github.com/zxc28tarik/daethlyspacerace2202/pull/36) iki 512px mikro atlas + 3 LOD. Bağımlı PR zinciri açık; gerçek GPU, el yapımı PBR/GLB ve son estetik kabul **AÇIK**. |
| GFX-07 | Dinamik seçili gölgeler, ana ışık, atmosfer | **KISMEN / PR #39 / GFX07 CI PASS** | NEXT07 GFX07'de son bölümün 86 dekoru 5 çok parçalı geometriye geçirildi, koyu 512px zemin, 3 lokal ışık/3 soft contact decal, progresif sis geçişi. [CI #43941405657](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43941405657) PASS. Fiziksel güneş shadowMap, gerçek GPU ve profesyonel materyal/7–8 estetik kapanışı hâlâ açık. |
| GFX-08 (= VQ05) | Motor/silah/darbe/patlama VFX | **KISMEN** | Kıvılcım, duman, motor egzozu geliştirme dalı var; nihai lazer/patlama/hasar VFX kabulü açık |
| GFX-09 (= VQ06) | Chase/Turret kamera, HUD, post | **KISMEN** | GFX03B HUD sadeleştirme; iki kamerada clipping/720p/1080p/post mastering açık |
| GFX-10 | GPU optimizasyon, kalite profilleri, bundle | **KISMEN** | GLB LOD, paylaşımlı geometri ve offline build temel var; gerçek GPU FPS ve High/Balanced/Low profilleri açık |
| GFX-11 | Görsel kalite kabulü, 12+ kanıt kadrajı, yayın | **KISMEN** | Kadraj/test otomasyonu var; kullanıcı estetik onayı, uçtan uca yayıncı kapısı ve doğrulanmış nihai release açık |

### GFX-05C ana dala birleşme kaydı (NEXT-01)
- [x] [GFX-05C](https://github.com/zxc28tarik/daethlyspacerace2202/blob/codex/map4-gfx05c-instanced-exhaust/MAP4_GFX05C_INSTANCED_EXHAUST.md) dalında gerçek kod, yeni 3D egzoz ve smoke/art test değişiklikleri var.
- [x] [PR #31](https://github.com/zxc28tarik/daethlyspacerace2202/pull/31) açıldı; 16 Kasım'da **OPEN**, **8 commit ahead / 0 behind**, ana dal **GFX05B**.
- [ ] CI'nin ilgili işleri gerçekten PASS olarak doğrulansın (mevcut connector checks sonucu boş; bu, PASS anlamına gelmez).
- [ ] 28 instance / tek draw call / boost değişimi / restart & Map1 izolasyonu gerçek test çıktıları incelensin.
- [ ] Egzoz açık/kapalı aynı kamera karşılaştırması ve gerçek GPU FPS notu alınsın.
- [x] PR #31 ana dala **merge** edilmiş; SHA `d92830cffe8aed40bc32a1ca44ae3ad7ef824779`. GitHub'dan 16 Kasım'da doğrulandı. CI PASS ve kullanıcı estetik onayı birleşmeden ayrı açık kapılardır.

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
| LM-10 | 36.200 | Hudut Karakolu | **KISMEN / PR #38 CI PASS**: 27 art Mesh ile özgün komuta kalesi, 2 kule, açık giriş, savunma/radar; son görsel kabul açık |
| LM-11 | 42.600 | Askerî Uzay Limanı | **KISMEN / PR #38 CI PASS**: 2 gerçek boşluklu hangar, 3 platform, kontrol kulesi, 35 art Mesh; mevcut GLB gemi korunuyor; son sanat açık |
| LM-12 | 48.300 | Yörünge Fırlatma Kompleksi | **KISMEN / PR #38 CI PASS**: 33 art Mesh, dev roket, 2 boşluklu gantry, 5 transfer katı, uplink; 850+ irtifa açık; son sanat kabulü açık |

## 5) Sanayi özgün sanat işleri — eksiksiz 6 düğüm (IN)

Görsel içerik için önce **büyük silüet**, sonra **oynanabilir orta ölçek**, sonra **yakın detay ve malzeme**. Oyunda bulunan erken W05 yapıları bu sanat kabulünün yerine geçmez.

| ID | İlerleme | Gerekli karakter ve içerik | Durum |
|---|---:|---|---|
| IN-01 | 15.750 | Giriş rafinerisi: ayırma tesisi, tank, baca, boru, kontrol kulesi | **KISMEN — GFX06A / PR #32**, son GLB/PBR ve görsel kabul açık |
| IN-02 | 18.750 | Yüksek basınç transferi: alçak boru köprüsü, vanalar, destekler | **KISMEN — GFX06A / PR #32**, son GLB/PBR ve görsel kabul açık |
| IN-03 | 21.850 | Ağır pres ve montaj: asimetrik makine kulesi, gantry, servis platformu | **KISMEN — GFX06B / PR #33**, iki pres kemeri + hidrolik/vinç; son GLB/PBR/FPS onayı açık |
| IN-04 | 24.950 | Enerji kazanımı: soğutma kuleleri, ısı değiştiriciler, türbin | **KISMEN — GFX06B / PR #33**, iki hiperbolik kule + kondenser/türbin; son GLB/PBR/FPS onayı açık |
| IN-05 | 28.150 | Lojistik ve yükleme: depo, raylı vinç, konteyner, nakliye alanı | **KISMEN / GFX06C PR #35** — 2 özgün delikli vinç, yük/depo/ray ve konteynerler kodlandı; gerçek görsel/FPS ve son GLB/PBR açık |
| IN-06 | 31.500 | Son enerji santrali: jeneratör halkaları, güvenlik kontrol, enerji hatları | **KISMEN / GFX06C PR #35** — 2 büyük reaktör toroid, çekirdek, pilon, 3 transformatör ve transfer hatları kodlandı; gerçek görsel/FPS ve son GLB/PBR açık |

Her düğümün kabulü: (1) uzaktan farklı silüet, (2) alt hızlı / üst güvenli / sağ avcı hattı okunabilir, (3) işlevsel yakın makine düzeni, (4) mevcut 36 collider hizası, (5) aynı kamera HUD açık/kapalı görüntü, (6) Map1+restart/arena regresyon ve performans.

## 6) Sıradaki uygulanacak işler (NEXT) — kesin sıralama

| Sıra | ID | Görev | Durum | Bir sonraki kanıt |
|---|---|---|---|---|
| 01 | NEXT-01 | **GFX-05C PR #31 merge kaydı** | **YAPILDI-MAIN; CI/FPS KAPILARI AÇIK** | [PR #31](https://github.com/zxc28tarik/daethlyspacerace2202/pull/31) / `d92830c`; CI ve gerçek GPU FPS doğrulaması açık |
| 02 | NEXT-02 | **GFX-06A** sanayi 1–2: rafineri ve basınç borusu, büyük özgün silüetler | **GELİŞTİRME-PR / CI PASS / GÖRSEL RED** | [PR #32](https://github.com/zxc28tarik/daethlyspacerace2202/pull/32) DRAFT; [yeniden koşulan CI PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43880186485). Gerçek karelerde kutu/zemin tekrarları çok belirgin: VIS-01 altında yeniden sanat ve kabul açık. |
| 03 | NEXT-03 | **GFX-06B** sanayi 3–4: ağır pres / soğutma-enerji | **GELİŞTİRME-PR / TEMEL CI PASS / GÖRSEL RED** | [PR #33](https://github.com/zxc28tarik/daethlyspacerace2202/pull/33) DRAFT: [temel CI PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43880399850). Yeni GFX06M materyal düzeltmesinin güncel CI/ekran kabulü açık. |
| 03a | VIS-01 | **GFX-06M** sanayi ortak renk/doku ve gökyüzü bant temizliği | **GELİŞTİRME-PR / CI PASS / ESTETİK KISMİ** | [Son malzeme/sky CI PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43882920153): 2 adet 512px atlas, endüstri materyal remap, bölgesel cirrus azaltma; görüntüde tekrar deseni azaltıldı ama fabrikaların nihai estetiği halen reddedildi (VIS-02 ve GFX06D açık). |
| 03b | VIS-02 | **Sanayi eski sahne kütlelerini özgün formlara dönüştürme**: tekrar eden W02/W05 kutuları ve gerçek collider-görsel eşleşmesi | **GELİŞTİRME-PR / CI PASS / ESTETİK KISMİ** | [PR #34](https://github.com/zxc28tarik/daethlyspacerace2202/pull/34) DRAFT; [tam offline+browser+art CI PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43886981925). 58 özgün W02 silüeti, 34 korunmuş fiziksel gövde, 4 instanced grup ve VQ02 metadata düzeltmesi. İki eski/yeni gerçek kamera görüntüsünde görünür iyileşme var, fakat nihai PBR/ışık ve gerçek GPU FPS **kabul edilmedi**. |
| 04 | NEXT-04 | **GFX-06C** sanayi 5–6: lojistik / enerji istasyonu | **GELİŞTİRME-PR / CI PASS / ESTETİK KISMİ** | [PR #35](https://github.com/zxc28tarik/daethlyspacerace2202/pull/35) DRAFT; [tam offline/browser/art CI PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43888729100), IN05 2 vinç+5 yük, IN06 2 reaktör halkası+3 trafo; 36 W05 collider korunuyor. [Çevrimdışı oynanabilir HTML artefaktı](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43888729100/artifacts/14235259166) var. Gerçek GPU, son PBR/LOD ve kullanıcı estetik kabulü açık. |
| 05 | NEXT-05 | **GFX-06D** sanayi PBR atlas, aşınma, decals, paylaşılan LOD/instancing | **KISMEN / PR #36 / İKİ TEKNİK ADIM CI PASS** | [PR #36](https://github.com/zxc28tarik/daethlyspacerace2202/pull/36) 2 paylaşımlı 512px mikro atlas, 18 metal malzeme, 58 modelde 3 LOD ve 6km uzak aksesuar culling. [CI #43893083267](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43893083267) ve [aynı-kamera #43894428714](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43894428714) **PASS**. Görsel karşılaştırma 396→180→108 vertex ve sabit kamerada 104 drawcall; bu donanım FPS kanıtı değil. NEXT05C decal/yüzey hikâyesi, profesyonel baked atlas/GLB ve gerçek GPU/estetik açık. |
| 05a | NEXT-05A | **GFX-06D-A** ortak metal mikro-normal/roughness yüzey | **GELİŞTİRME-PR / CI PASS / SON SANAT AÇIK** | [CI #43893083267](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43893083267) PASS: normal+roughness iki paylaşımlı 512px harita, 18 metal malzeme; UV'siz birleşik VIS02 mesh korunuyor. El yapımı 1–2k baked texture ve estetik onay açık. |
| 05b | NEXT-05B | **GFX-06D-B** üç kademeli uzak/orta/yakın LOD ve mikrodetay | **GELİŞTİRME-PR / CI + AYNI-KAMERA TESTİ PASS** | [CI #43894428714](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43894428714): 58 render-only modelde 3 LOD, tek örnekte 396→180→108 vertex; sabit kamera tüm üç durumda 104 drawcall, toplam scene üçgeni 30.392→30.320→30.296. 34 W02+36 W05 collider korunur. Gerçek GPU FPS ve nihai kalite açık. |
| 05c | NEXT-05C | **GFX-06D-C** sanayi fiziksel temas izleri, aşınma/kurum, servis numaraları, özgün decal yüzey hikâyesi (PBR/LOD ile uyumlu) | **GELİŞTİRME-PR / CI PASS / GÖRSEL KISMEN** | [PR #37](https://github.com/zxc28tarik/daethlyspacerace2202/pull/37) taslak, [CI #43919072541 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43919072541): tek ortak 1024px/9 UV hücresi atlas, 6 servis kimliği, 66 decal/24 instanced batch, 6.1/5.4km culling, 36 W05+34 W02 collider korunuyor. [3 istasyon A/B görüntüsü](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43919072541/artifacts/14254560598) decal başına +4 drawcall/+22 üçgen; IN01/04 kısmi kolon örtüşmesi ve gerçek GPU/estetik kapısı **AÇIK**. |
| 06 | NEXT-06 | Üs/hangar/uzay limanı/yörünge fırlatma büyük sanat dönüşümü (LM-10..12) | **GELİŞTİRME-PR / TAM CI PASS / GÖRSEL KISMEN** | [PR #38](https://github.com/zxc28tarik/daethlyspacerace2202/pull/38) DRAFT, [başarılı offline/browser/art CI #43925320985](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43925320985). LM10 kale+27 mesh, LM11 2 boşluklu hangar+3 pad+35 mesh, LM12 büyük roket+2 gantry+33 mesh. 3 aynı-kamera eski/yeni çiftinde gerçek piksel değişimi, 6 canyon+36 sanayi collider, GFX01 patrol GLB ve laneY=1.050 yükseliş hattı doğrulandı. 28 tekrar arka plan yapısı, gölge/zemin/sis, gerçek GPU ve son GLB/estetik **AÇIK**, main'e birleşmedi. |
| 07 | NEXT-07 | GFX-07: sektörler arası seçici ışık, gölge, sis, atmosfer geçişleri **ve son bölgenin 28 tekrar eden silüet/zemin temizliği** | **GELİŞTİRME-PR #39 / TAM CI PASS / ESTETİK KISMEN** | [PR #39](https://github.com/zxc28tarik/daethlyspacerace2202/pull/39) DRAFT; [güncel offline/browser/art CI #43941405657 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43941405657). 28 W01 koridor +30 W02 yakın +28 W02 uzak =86 dekoratif silüet, 5 özgün geometri; özel 512px mat zemin atlası, 3 sınırlı yerel ışık, 3 soft temas gölgesi ve son bölge yumuşak sis. İlk aşırı parlak zemin gerçek foto üzerinden düzeltildi, 12 eski+3 çevre aynı-kamera A/B kaydedildi; 6 canyon+36 industry collider, Map1 izolasyonu korundu. Gerçek GPU, yüksek kalite GLB/PBR/dinamik shadow ve 7–8/10 estetik **AÇIK**; main'e alınmadı. |
| 08 | NEXT-08 | GFX-08: efekt, mühimmat, hasar ve motor görünümü finalizasyonu | **GELİŞTİRME-PR #40 / TAM CI PASS / ESTETİK KISMEN** | [PR #40](https://github.com/zxc28tarik/daethlyspacerace2202/pull/40) taslak ve GFX07 #39'a bağımlı. [Son CI #43945991830 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43945991830): gerçek oyuncu/rakip MUZZLE, hunter IMPACT, büyük patlama SHOCK/SMOKE, boost ENGINE; **5 ortak InstancedMesh havuzu /160 hard cap** ve reset. İlk sert beyaz halka görüntüsü görsel incelemede reddedildi; **128px ortak feathered atlas** + alpha/normal blend sonrası [CI #43945940554 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43945940554), 3 same-camera A/B foto: her sahnede +5 drawcall/+72 üçgen. VQ03/GFX05C ve 6+36 collider/Map1 korunuyor. Gerçek GPU FPS, büyük patlamaların nihai estetiği ve GLB/VFX cilası **AÇIK**, main'e birleşmedi. |
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

- **2026-11-16 NEXT08/GFX08 teknik kabul:** [PR #40](https://github.com/zxc28tarik/daethlyspacerace2202/pull/40) altında ilk [CI #43944845546](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43944845546) başarıyla geçti: 5 yeni ortak instanced VFX havuzu, 160 instance sınırı, gerçek ikiz namlu/avcı isabeti/patlama/boost kaynakları, spam cap/expiry/reset ve çevrimdışı Map1/Map4 tarayıcı/sabit galeri PASS. Gerçek görüntüdeki sert beyaz Torus halkalar sorun sayıldı ve [763ced0](https://github.com/zxc28tarik/daethlyspacerace2202/commit/763ced0d21c48cbbe1d34eca9dd2eb7938b77751) 128px ortak soft ring atlası / saydamlık düzeltmesine geçirildi; [206be79](https://github.com/zxc28tarik/daethlyspacerace2202/commit/206be79e4a40474c23a3a975121ddad259f9720f) görsel shader regresyon testi ile [son CI #43945991830](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43945991830) **SUCCESS**. 3 in-engine A/B (arena/sanayi/yörünge) sabit kamerada, etkiler teknik kadraja yerleştirilmiş; gerçek oyun olay bağı tarayıcı smoke testinde kanıtlandı. Soft atlas sonrası +5 drawcall / +72 sahne üçgeni ve önceki VQ03/VFX korunuyor. [Oynanabilir offline HTML #43945940554](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43945940554) 5.473.410 byte. **Nihai 7–8/10 estetik, gerçek GPU ve PR main merge açık**; sonraki · **NEXT09/GFX09 kamera-HUD-post**.


- **2026-11-16, kullanıcı tek nokta NEXT08/GFX08:** [PR #40](https://github.com/zxc28tarik/daethlyspacerace2202/pull/40) taslak, GFX07 #39'a bağımlı. Harita 4 silah namlu, gerçek hunter isabeti, imha şok/duman ve boost motor halkaları için **5 paylaşılan instanced GPU havuzu** oluşturuldu; 28+36+18+48+30=160 kapasite, aşırı akışta eski efekt çıkarma, ömür süresi ve restart reseti var. Mevcut VQ03/GFX05C efektleri ve tüm oyun mekaniği korunarak ekleniyor. Browser smoke gerçek oyun fonksiyonlarıyla 5 havuz/cap/reset; 3 sektör için gerçek aynı-kamera VFX önce/sonra PNG testleri eklendi. [CI #43944845546](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43944845546) **bekleniyor**; PASS/estetik/GPU iddiası yok. Bir sonraki · görevi NEXT09 kamera/HUD, ancak hata varsa öncelikle GFX08 düzeltilecek.


- **2026-11-16 NEXT07/GFX07 teknik kapanış:** [PR #39](https://github.com/zxc28tarik/daethlyspacerace2202/pull/39) altında [CI #43940280465](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43940280465) ilk PASS, ilk gerçek foto incelemesinde mat zemin ve silüetlerin aşırı açık kaldığı görülünce [311ef7d](https://github.com/zxc28tarik/daethlyspacerace2202/commit/311ef7d1897b05eaf4c42f7cf03f1cad558279f0) koyu tint/daha az sert normal/cirrus band düzeltmesi uygulandı, [525d235](https://github.com/zxc28tarik/daethlyspacerace2202/commit/525d235489aec097d7fa6b8e7d46e31ac131bdec) regresyon testi eklendi; [CI #43941405657](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43941405657) **SUCCESS**. Toplam 86 dekoratik 3D silüet değiştirilirken fizik modeli sıfır; 512px zemin, 3 lokal ışık, 3 soft temas gölgesi. A/B LM10 123→124 drawcall, LM11 119→119, LM12 66→67. Gerçek GPU/nihai GLB/PBR/estetik **KISMEN/AÇIK**. Bir sonraki `.` **NEXT08 GFX08 VFX**; başka işler kaybolmaz ve PR zinciri main'e birleşmedi.


- **2026-11-16, tek nokta NEXT07 / GFX07:** [PR #39](https://github.com/zxc28tarik/daethlyspacerace2202/pull/39) dalında 28 koridor W01 +30 yakın W02 +28 uzak W02 toplam **86 mevcut görsel-only Mesh** 5 farklı ortak bileşik endüstriyel/askerî geometriye geçirildi; fizik/mesh referansları korundu. Son bölge zeminine deterministik 512px matte texture, üç LM10–12 kompozisyonuna paylaşımlı temas gölgesi + yakın aktif 3 PointLight eklendi. 3 gerçek aynı-kamera önce/sonra screenshot ve Map1/4/6+36 collider denetimleri eklendi. [CI #43940280465](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43940280465) çalışıyor; **PASS ve grafik kabul henüz verilmedi**. Sonraki iş NEXT08 VFX, ancak kırık test önce düzeltilecek.


- **2026-11-16 NEXT06 teknik kabul:** [CI #43925320985](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43925320985) **SUCCESS**: çevrimdışı HTML + GLB cache, Map1/Map4 browser, 12 sabit kamera, LM10/11/12 üç adet gerçek aynı-kamera eski/yeni foto çifti ve 1.050 irtifa merkezi yükseliş koridoru. LM10 126→127 drawcall/29.068→30.860 üçgen; LM11 123→129/8.968→13.722; LM12 71→65/8.414→13.378. Başlangıçta erken texture atlası kullanımının açılış hatası [2725c42](https://github.com/zxc28tarik/daethlyspacerace2202/commit/2725c4212799741241c9cb3a612e3e8cc6e085fc) ile düzeldi; sahne çizim maliyeti mutlaka artmalı diyen hatalı foto test şartı [d67b54a](https://github.com/zxc28tarik/daethlyspacerace2202/commit/d67b54a34616fff046498550dad3bb634f61b89b) ile gerçek piksel farkına taşındı. [Oynanabilir offline artefakt](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43925320985/artifacts/14255304244) 5.451.677 byte. **Görsel estetik hala kısmi**: 28 tekrarlı final arka plan yapısı, düz zemin/gölge/atmosfer ve gerçek GPU FPS açık. Bir sonraki nokta **NEXT07/GFX07 çevre sanat temizliği + ışıklandırma**; PR #38 taslak, `main` birleşmedi.


- **2026-11-16 · tek nokta NEXT-06:** Son sektörün LM10/LM11/LM12 noktalarına üç ayrı özgün 3D mimari [taslak PR #38](https://github.com/zxc28tarik/daethlyspacerace2202/pull/38) dalında eklendi. Eski üç W01/VQ02 görünür kopyası kapatıldı; GFX01 devriye gemisi korunuyor. Kod, 3x aynı kamera A/B screenshot ve 850 irtifa görsel testi eklendi. **İlk CI #43923379247 ve #43923534416 FAIL**: henüz yaratılmamış GFX06M/D doku atlası referansı oyun başlangıcını bozuyordu; [2725c42](https://github.com/zxc28tarik/daethlyspacerace2202/commit/2725c4212799741241c9cb3a612e3e8cc6e085fc) ile önceden oluşturulan H4 shared map'lere geçildi. [Yeni CI #43924211454](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43924211454) gözleniyor. Gerçek CI PASS/estetik/GPU olmadan ana dala birleştirilmeyecek.


- **2026-11-16 GFX06D-C teknik test tamam:** [CI #43919072541](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43919072541) **SUCCESS** (offline HTML, Map1/Map4 Chromium smoke, atlas/66 decal ve collider testi, üç tesisin 6 sabit-kamera A/B resmi). Decal görünür farkı üç karede +4 drawcall ve +22 üçgen: 403→407 / 279→283 / 239→243. IN06 etiketi okunur, IN01/04 etiketleri bazı açılarda büyük yapıların arkasında kısmen kalıyor; **görsel kapanış yapılmadı**. [Yeni offline HTML artefaktı #14253885996](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43919072541/artifacts/14253885996), 5.437.030 byte. Bir sonraki kullanıcı · komutunda **NEXT-06 LM10–12** başlamalı; açık estetik ve GPU borcu korunacak. [PR #37](https://github.com/zxc28tarik/daethlyspacerace2202/pull/37) taslak ve `main` birleşimi yok.


- **2026-11-16 · tek nokta NEXT-05C:** GFX-06D-C sanayi altı tesisin işlevsel servis kodu, kurum, pas ve uyarı işaretleri [PR #37](https://github.com/zxc28tarik/daethlyspacerace2202/pull/37) dalına işlendi. 1024px atlas/9 UV hücresi; 66 dekoratif instance/24 batch; yakın 6.1 km gizleme/5.4 km geri açma. Kod + JS syntax başarılı, gerçek [CI](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43919072541), sabit kamera A/B screenshot, FPS ve oyuncu estetik onayı bekliyor. Fizik/Harita1/AI değiştirilmedi. Sonraki nokta görevi **NEXT-06 / LM10–12**, ancak önce varsa GFX06DC testi hataları kapatılacak.


- **2026-11-16 GFX06D-A/B iki noktanın doğrulaması:** [CI #43894428714](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43894428714) **PASS**: sabit kamera / sabit sahnede LOD0=396, LOD1=180, LOD2=108 vertex ve 104 toplam sahne drawcall; ekran kadrajı adil, LOD farkı görünür. Önceki üç farklı-mesafe görüntüsü ön plan örtüşmesi nedeniyle tek başına kalite karşılaştırması sayılamaz. Kullanıcı nokta protokolünde **sıradaki alt görev NEXT05C (decals)**, tamamlandıktan sonra NEXT06 LM10-12. Görsel 7–8/10 ve gerçek GPU FPS onayı verilmedi. [PR #36](https://github.com/zxc28tarik/daethlyspacerace2202/pull/36) taslak kalır.


- **2026-11-16 GFX06D test kapısı:** [CI #43893083267](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43893083267) **SUCCESS**: offline GLB/tek HTML, Harita1/4 Chromium smoke, 2 paylaşımlı yüzey atlası, 58 görsel-only 3 LOD, mikrodetay gizleme/geri açma, 34 W02+36 W05 fizik koruma, eski 12 kamera ve LOD screenshot. İlk 2 CI'de VIS02'nin 4 silüet ailesi sayımı LOD varyantlarını 8 sanarak hata verdi; [73a8566](https://github.com/zxc28tarik/daethlyspacerace2202/commit/73a85667c213106f9fa7a98ead7c1112f39a49f0) ile temel LOD0 kimliğinden sayım düzeltilip PASS sağlandı. Farklı mesafe karelerinde başka objelerin öne girmesi görsel kıyası bozdu; [c64d2a1](https://github.com/zxc28tarik/daethlyspacerace2202/commit/c64d2a11448539eab8a4024c867f44698e64b3f9) aynı-kamera yalnız geometri LOD0/1/2 debug kıyası ekledi (CI sonucu açık). **Gerçek GPU FPS ve estetik kabul verilmedi.**


- **2026-11-16, kullanıcının iki nokta ile ilerleme komutu:** `NEXT-05A / GFX06D-A` ve `NEXT-05B / GFX06D-B` ayrı kod commitleriyle işlendi: ortak 512px normal+roughness, 18 metal malzeme, 58 VIS02 render-only model için 3 geometri LOD, küçük aksesuarlar için mesafe culling. [PR #36](https://github.com/zxc28tarik/daethlyspacerace2202/pull/36) taslak, GFX06C #35'e bağımlı. Yeni CI/3 screenshot/hardware FPS/estetik sonucu olmadan 'tamamlandı' işareti verilemez. Bir sonraki ana iş: NEXT-06 LM10–12 son bölge sanatları.


- **2026-11-16 GFX06C ilk teknik kabul:** [CI #43888729100](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43888729100) **PASS**: Map1 + Map4 Chromium, offline GLB/tek HTML, önceki VIS02 ekranları, yeni IN05/06 iki ayrı HUD açık/kapalı görüntü ve artifact upload başarıyla tamamlandı. Tek HTML artefakt [#14235259166](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43888729100/artifacts/14235259166), **5.413.076 bayt**; kod **PR #35 taslak**ta, ana dal birleşimi yok. Gerçek görseller incelendi, 2 vinç ve 2 reaktör halkası görsel kimlik kazandırıyor; ancak ışık, mikrodetay ve son materyal estetiği **ONAYLANMADI**. `NEXT-05 GFX06D` ilk sıradaki sanat/LOD optimizasyonudur.


- **2026-11-16:** VIS-02 [CI #43886981925](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43886981925) başarıyla tamamlandı. İlk CI testi GFX04 iç içe sanayi grup referansını `zone.children.find` ile aradığı için FAIL verdi, iki test `getObjectByName`/recursive traverse ile düzeltildi; oyun fiziği değiştirilmedi. İki gerçek aynı-kamera A/B kare ve SwiftShader render metrikleri üretildi; görünür silüet ilerlemesi var, ama estetik ve gerçek GPU kabulü **açık**.
- **2026-11-16:** NEXT-04 / GFX06C IN05–06 ilk oyun kodu, fizik regresyonu ve 4 yeni görsel kadraj [PR #35](https://github.com/zxc28tarik/daethlyspacerace2202/pull/35) taslakta. PR zinciri `#32 → #33 → #34 → #35`. Yeni testlerin sonucuna göre durum güncellenecek. Oynanabilir offline HTML artefaktı CI'ye eklendi, `main` henüz değişmedi.


- **2026-11-16 VIS-02:** Gerçek kareler sonrası 58 eski collider'sız W02 sanayi silüeti dört ayrı birleşik 3D kit ile, 34 çarpışmalı W02 yapısı ise dört instanced dış cephe grubuyla iyileştirildi. PR #34 [taslak](https://github.com/zxc28tarik/daethlyspacerace2202/pull/34) ve PR #33'e, o da PR #32'ye bağlıdır. Yeni kod + JS sözdizimi kontrolü PASS; Chromium CI/görsel/FPS onayı ve ana dal merge **henüz yapılmadı**. İki sabit kamera eski/yeni A/B fotoğrafı CI çıktısı beklenir. VQ02 çifte `w05VisualOnly/h4Collider` etiket hatası fiziği değiştirmeden giderildi.


- **2026-11-16 VIS-01 ara görsel inceleme:** [CI #43882296512](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43882296512) PASS; 4 tesisin gerçek 1600×900 Chromium kareleri karşılaştırıldı: yeni zemin/çelik atlasları aşırı tekrar desenlerini azalttı, ancak basit dikdörtgen yapı silüetleri ve dikey cirrus bantları hâlâ yayıncı kabulüne uygun değil. Sky-band düzeltmesi ve `VIS-02` yapı sanatı borcu açıldı. **Nihai görsel kabul = HAYIR.**

- **2026-11-16 VIS-01 karar değişikliği:** [GFX-06A PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43880186485) ve [GFX-06B PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43880399850) tarayıcı kanıtları gerçek in-engine screenshot içeriyor. **Teknik PASS = görsel kabul değil:** endüstrinin kareli zemini, mavi tekrarlı kutu binaları ve yetersiz silüet hiyerarşisi yüzünden görsel kabul verilmedi. IN05/06 öncesinde GFX-06M iki paylaşımlı 512px atlas ve yalnız industrial sektör materyal dönüşümüne geçildi. Bu yeni alt görev kapanmadan 4 tesis final kabulü verilemez.


- **2026-11-16:** GFX-06A [CI #43875886124](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43875886124) **FAIL**: Browser testinde `openSpace.firstPositions` artık başlangıç yerine ilerleyen AI konumunu ölçüyordu; [PR #32 düzeltmesi f1d7348](https://github.com/zxc28tarik/daethlyspacerace2202/commit/f1d7348bb2b9467d000baf73decf04ab90e19e2d) ile oyun başlangıcında anlık örnek almaya geçildi. Yeni CI sonucu bekleniyor. **Bu hata fizik/AI değişikliği yapılarak maskelenmedi.**
- **2026-11-16:** NEXT-03 GFX06B IN03/IN04: 2 açılı pres kemeri, 2 açık üstlü hiperbolik soğutma kulesi, bağlı makine detayları ve 4 görüntü/test kodu [taslak PR #33](https://github.com/zxc28tarik/daethlyspacerace2202/pull/33) içinde. **GFX06A'nın PR #32'si üzerine bağımlı**, ana sürümde değil.


- **2026-10-18:** Harita 4'ün geniş 4 aşamalı gezegensel dünya kararı, W02-W05 kapsamı; büyük başlangıç alanı, çevresel doluluk ve üç rota.
- **2026-10-19:** Görsel kalite 3/10 değerlendirmesi; yalnız prosedürel kutu/efekt eklemek yerine özgün sanat üretimine odaklanma.
- **2026-10-20:** [Kapsamlı 12 GFX paketli plan](MAP4_GRAPHICS_MASTERPLAN_VQ04_PLUS.md); GFX00/01/01B/02/03/03B/04/04B/04C/04D/04E uygulama kanıtları.
- **2026-10-21:** GFX-05 ve GFX-05B ana dalda; son doğrulanmış ana dal commit'i [16cabc4fd](https://github.com/zxc28tarik/daethlyspacerace2202/commit/16cabc4fd0ff92d9901a9b611fa14a8287fdb751).
- **2026-11-16:** GFX-05C [PR #31](https://github.com/zxc28tarik/daethlyspacerace2202/pull/31) 13:10 UTC'de **MERGED**; ana dal merge commit [d92830c](https://github.com/zxc28tarik/daethlyspacerace2202/commit/d92830cffe8aed40bc32a1ca44ae3ad7ef824779). CI PASS/FPS görüntü onayı ayrı kapı.
- **2026-11-16:** Bu takip dosyası açıldı; bundan sonraki her geliştirmede ID, durum, kanıt ve sıradaki görev burada korunacak.
- **2026-11-16:** **NEXT-02 / GFX-06A / IN01–02** ilk görsel 3D modeller ve Chromium regresyon/görsel testleri ayrı dalda işlendi. [PR #32](https://github.com/zxc28tarik/daethlyspacerace2202/pull/32) **DRAFT**, CI PASS ve gerçek görüntü/FPS incelemesi bekliyor; **main'e birleşmedi**. Ayrıntı [GFX06A raporu](https://github.com/zxc28tarik/daethlyspacerace2202/blob/codex/map4-gfx06a-refinery-transfer-art/MAP4_GFX06A_REFINERY_TRANSFER_ART.md).


### Her güncellemenin kısa şablonu

`YYYY-AA-GG | ID | ÖNCEKİ DURUM -> YENİ DURUM | Commit/PR | Test/CI | Ekran/FPS | Açık eksiği | NEXT-ID`

**Bu belgenin amacı tamamlanmamışları gizlemek değil, kaybetmemektir.**
