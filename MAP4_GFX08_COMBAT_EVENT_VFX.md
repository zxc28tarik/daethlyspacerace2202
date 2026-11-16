# Harita 4 — NEXT-08 / GFX-08 | Olay Tetiklemeli Silah, İmha, Duman ve Motor VFX

**Tarih:** 16 Kasım 2026. **Komut:** kullanıcı `.` — bir gelişim adımı.  
**Bağımlılık:** [NEXT07 GFX07 / PR #39](https://github.com/zxc28tarik/daethlyspacerace2202/pull/39) üzerinde bir üst dal. Aşağıdaki #38→#37→#36→#35→#34→#33→#32 PR zinciri ve Harita 1 izolasyonu korunur. **Ana dal birleştirmesi yok.**

## Gerçek oyun kodu

GFX08, önceki GFX05C (tek InstancedMesh'te en fazla 28 motor egzozu), GFX04D statik savaş-duman alanları ve VQ03'nin katmanlı dinamik patlamalarını **silmez**. Bu kod gerçek olaylara eklenen *kapasiteli, süresi sınırlı GPU işaret/enerji parlaması sistemi*dir. VQ03 olaylarını bir gecede değiştirip eski test/oyun görünümünü kırmayız.

`MAP4_GFX08_TRANSIENT_POOLED_FX` altında **5 adet paylaşılan InstancedMesh çizim havuzu**:

| Tür | Üst sınır | Ömür | Gerçek oyun olayı |
|---|---:|---:|---|
| MUZZLE | 28 | 0,19 sn | `firePlayerLasers` ve `fireHunterRivalVolley`: ikiz namluda atış başladığında kısa koni parlama |
| IMPACT | 36 | 0,30 sn | `damageHunterTarget` başarılı gerçek hunter isabeti ve küçük patlama akısı; hakiki vurulmayan atış hit efekti oluşturmaz |
| SHOCK | 18 | 0,54 sn | `createExplosion` içinde sadece Map4, yeterince büyük gerçek patlamalarda genişleyen şok halkası |
| SMOKE | 48 | 0,88 sn | Büyük Map4 patlamalarında 3 kısa duman püskürtüsü; zaten var olan **128 px VQ03 smoke atlası tekrar kullanılır** |
| ENGINE | 30 | 0,35 sn | GFX05C motor egzozundaki gerçek oyuncu/rakip/avcı boost anında, craft başına en az 0,22 sn aralıkla kısa iyon halkası |

**Toplam GPU örnek bütçesi en fazla 160**; bir havuz dolunca en eski efekt silinir, yeni `Mesh` yaratılmaz. Her çeşidin `BufferGeometry` ve `Material`i yalnız oyun açılışında bir kez oluşturulur; `instanceMatrix` ve `instanceColor` her kare yeniden kullanılır. `h4Gfx08Emit`, `h4Gfx08Update`, `h4Gfx08Reset` sahne dışında kendi etkisini değiştirmez. Oyuncu, skor, hasar, silah hızı veya düşman HP'si üzerinde yan etki yapılmaz.

**Görsel anlatım:** cyan/yeşil oyuncu laser mürekkebi, mavi/turuncu hedef isabeti, sıcak şok halkası, gürültülü mevcut VQ03 gri duman atlası ve mavi booster halkası. Kısa ömürlü efekt büyüme ve parlaklık azalması kullanır; efektler fizik ya da kilit hedefi değildir.

## Korunması gereken sözleşmeler

- **Map1 saf yarış:** Map4 dışında emit reddedilir, Map4 görsel grup zaten gizlenir, önceki Map1 silah açma sistemi / obje lazeri aynı kalır.
- **Map4 gerçek vurma:** 8 avcı / 5 rakip, 60 sn arena kilidi ve +1 normal / +3 elite puan; gerçek `damageHunterTarget` kontrolleri, sahiplik ve öldürme skorları değişmez. `tryFirePlayerLasers` enerji/ateş cooldown'unun *sonrasında* görsel olay bağlanır; bedava lazerle ihlal oluşmaz.
- 300 sn son süre, +12% sanayi rota, +18% kanyon rota, 850 irtifa, 6 kanyon + 36 sanayi collider ve 34 fiziksel W02 mesafe izleri değişmez.
- Çevrimdışı tek HTML, GLB yükleme, mevcut 12 sabit kamera ve tüm GFX07 A/B görüntüleri korunur.
- Restart `startGame` sırasında GFX08 havuzları temizlenir ve yeniden oluşturulmaz. `planetaryWorldGroup` içinde diğer haritalarda görünürlük kapısı devam eder.

## QA / ne zaman bitti denebilir?

1. `tests/map4-browser-smoke.cjs`: gerçek oyuncu ikiz lazer tetikleyicisi → 2 muzzle, gerçek hedef `damageHunterTarget` → impact, `createExplosion` → shock+3 smoke; beş instanced havuz, ortak atlas, hiçbir yeni collider, 55 hızlı etki altında 36'lık hard cap ve drop/eviction, ömür bitince sıfırlama, restart/Map1 izolasyonu.
2. `tests/map4-art-baseline.cjs`: 3 bölgede **aynı kamera, aynı dünya, VFX kapalı/açık** toplam 6 gerçek 1600×900 fotoğraf: arena, sanayi, yörünge; gerçek GPU renderer drawcall + üçgen kaydı. Görüntülerin çekiminde VFX, karşılaştırmayı temiz tutmak için **aynı gerçek motorun sahnesinde konumu sabitlenmiş teknik kanıt** olarak tetiklenir; gerçek oyuncu olay bağlantıları üstteki smoke testte kontrol edilir.
3. `.github/workflows/map-browser-smoke.yml`: dal üzerine her push'ta Ubuntu24.04 Chromium, offline asset+tek HTML ve screenshot artifact.
4. **CI PASS gerçek run sonucuyla teyit edilmeden bu iş tamamlandı sayılmaz.** SwiftShader süreleri desktop GPU FPS değildir. Yayıncı 7–8/10 son estetik / GLB, PBR, büyük patlama ses ve ışık cilası / gerçek hedef GPU p95 FPS, VRAM ve screenshot kullanıcının kabulü ayrıca açık kalır.

## 16 Kasım — Gerçek ilk CI ve görsel kalite düzeltmesi

- İlk [GitHub Actions #43944845546](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43944845546) ve [#43944704632](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43944704632) **SUCCESS**: offline tek HTML + GLB, Harita 1/4 Chromium, gerçek oyuncu ikiz namlu/avcı hasarı/büyük patlama olay bağları, beş bounded pool, 55 arka arkaya darbede cap+eviction, reset, mevcut VQ03 ve GFX05C, 12 sabit kamera + üç yeni GFX08 aynı kamera ekran çifti.
- Gerçek render karşılaştırmaları (aynı kamera, BEFORE→AFTER, tüm sahne):
  - Arena: **24→29 drawcall, 22.006→23.240 üçgen**
  - Sanayi: **439→444 drawcall, 51.762→52.996 üçgen**
  - Yörünge: **56→61 drawcall, 16.936→18.170 üçgen**
  - Her kadrajda sadece 5 ortak çizim grubu eklenmiştir, 5 türün aktif sayısı [2 muzzle,1 impact,1 shock,3 smoke,1 engine], 36 sanayi collider korunuyor. Bunlar SwiftShader/WebGL renderer değerleridir, gerçek oyuncu GPU FPS değildir.
- **Görsel sorunu tespit edildi:** İlk in-engine fotoğraflarda daha önceden kullanılan klasik düz TorusGeometry halkalar ve additive blend, patlamanın ortasında sert, çok beyaz üst üste halkalar oluşturuyordu. Teknik PASS **nihai estetik PASS** değildir.
- [763ced0](https://github.com/zxc28tarik/daethlyspacerace2202/commit/763ced0d21c48cbbe1d34eca9dd2eb7938b77751) ile gerçek shared **128px feathered alpha ring atlası** eklendi, hit/shock/engine **üçü aynı texture/PlaneGeometry** kullandı; hit/shock NormalBlending ve ölçülü opacity ile gölgeli alanda renk korumaya yöneldi. [206be79](https://github.com/zxc28tarik/daethlyspacerace2202/commit/206be79e4a40474c23a3a975121ddad259f9720f) bu değişimin regresyon koşullarını ekledi. [Güncel CI #43945991830](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43945991830) **SUCCESS**; soft-ring materyal ve doku paylaşımı, Map1/4/çevrimdışı ve art görüntü testleri tekrar geçti. Önceki beyaz halkalar gerçek fotoğrafta daha yumuşak ve düşük parlaklıkta.
- Son görseller ve gerçek hedef donanım p95 FPS/VRAM, son VFX/3D/ışık estetiği, yayıncı 7–8/10 kabulü halen açık; GFX08 taslak PR #40 `main` ile birleştirilmedi.

## Son soft-ring sürümünün sabit kamera ölçümleri

- Arena **24→29 drawcall, 22.006→22.078 üçgen**; Sanayi **439→444, 51.762→51.834**; Yörünge **56→61, 16.936→17.008**. Her karede **2 muzzle +1 impact +1 shock +3 smoke +1 engine** teknik görsel örnek, toplam 5 GPU havuzu, ilave **72** üçgen. İlk sert torus karelerinde bu fark **1.234** üçgendi. Beş ayrı çizim havuzundan fazla yeni drawcall yoktur.
- [Güncellenmiş gerçek Chromium ekran görüntüleri](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43945940554), [güncel tam test #43945991830](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43945991830) **PASS**. Aynı kamera eski/yeni karede fotoğraflar gerçekten farklı; VFX kadrajları son kullanıcı animasyon oynanış kaydı değil, gerçek motorda sahnelenen görsel teknik kanıttır.
- [Tek HTML oynanabilir artefakt](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43945940554) boyutu **5.473.410 byte**. Bu sadece **PR #40 taslak geliştirme sürümüdür**; son estetik veya masaüstü GPU/FPS kabulü verilmedi.

## Sıradaki nokta

Sıradaki `.` **NEXT-09 / GFX-09** (kamera, HUD, post-processing ve okunabilirlik) ama bu GFX08'de bir hata çıkarsa **önce mevcut işin hatası düzeltilecek**, test kapanmadan işi atlamayacağız.

