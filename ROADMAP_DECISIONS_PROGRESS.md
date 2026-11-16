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
| GFX-05C | Paylaşımlı konik çift motor egzozları | **YAPILDI-MAIN / CI DOĞRULAMA** | [PR #31](https://github.com/zxc28tarik/daethlyspacerace2202/pull/31) 16.11.2026 tarihinde **MERGED**; merge SHA [d92830c](https://github.com/zxc28tarik/daethlyspacerace2202/commit/d92830cffe8aed40bc32a1ca44ae3ad7ef824779). CI PASS/gerçek GPU FPS ayrı açık kapılar. |
| GFX-06 | Tam ölçekli PBR, atlas, endüstri modeli/decal | **KISMEN / 6 TESİS KODU, MALZEME + LOD TASLAK PR** | [#32 GFX06A](https://github.com/zxc28tarik/daethlyspacerace2202/pull/32) IN01/02, [#33 GFX06B/VIS01](https://github.com/zxc28tarik/daethlyspacerace2202/pull/33) IN03/04, [#34 VIS02](https://github.com/zxc28tarik/daethlyspacerace2202/pull/34) 58 özgün dekor +34 fiziksel cephe, [#35 GFX06C](https://github.com/zxc28tarik/daethlyspacerace2202/pull/35) IN05/06, [#36 GFX06D](https://github.com/zxc28tarik/daethlyspacerace2202/pull/36) iki 512px mikro atlas + 3 LOD. Bağımlı PR zinciri açık; gerçek GPU, el yapımı PBR/GLB ve son estetik kabul **AÇIK**. |
| GFX-07 | Dinamik seçili gölgeler, ana ışık, atmosfer | **KISMEN** | VQ04 sky/fog/bulut ve arenada 2 lokal ışık var; tüm sahne ışık/gölge mastering açık |
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
| LM-10 | 36.200 | Hudut Karakolu | **YAPILMADI**: son büyük üs modeli sanat kabulü |
| LM-11 | 42.600 | Askerî Uzay Limanı | **KISMEN**: statik gemi örnek GLB, limanın bütün mimari sanatı açık |
| LM-12 | 48.300 | Yörünge Fırlatma Kompleksi | **YAPILMADI**: nihai dev silüet ve yukarı çıkış kadrajı |

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
| 05 | NEXT-05 | **GFX-06D** sanayi PBR atlas, aşınma, decals, paylaşılan LOD/instancing | **KISMEN / PR #36 TASLAK / CI BEKLENİYOR** | [PR #36](https://github.com/zxc28tarik/daethlyspacerace2202/pull/36) GFX06D-A iki paylaşımlı 512px normal+roughness atlası, 18 metal malzeme; GFX06D-B 58 dekor için 3 geometri LOD'u + uzak mikrodetay culling. Kod/test yazıldı; CI/gerçek GPU/profesyonel baked materyal/estetik açık. |
| 05a | NEXT-05A | **GFX-06D-A** ortak metal mikro-normal/roughness yüzey | **GELİŞTİRME-PR / DOĞRULAMA** | 512px normal+roughness (iki ortak harita), 18 UV'li metal malzeme. UV'siz VIS02 birleştirilmiş mesh korunur. Profesyonel baked 1–2k atlas ayrı açık. |
| 05b | NEXT-05B | **GFX-06D-B** üç kademeli uzak/orta/yakın LOD ve mikrodetay | **GELİŞTİRME-PR / DOĞRULAMA** | 58 görsel-only dekorun 0/1/2 LOD'u, 2.5/2.9 ve 5.55/6.1 km geçiş sınırları, 5.5/6 km mikrodetay culling. 34 W02 +36 W05 fizik mesh değişmez; 3 yeni CI screenshot. |
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
