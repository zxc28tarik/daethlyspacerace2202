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

## Sıradaki nokta

Sıradaki `.` **NEXT-09 / GFX-09** (kamera, HUD, post-processing ve okunabilirlik) ama bu GFX08'de bir hata çıkarsa **önce mevcut işin hatası düzeltilecek**, test kapanmadan işi atlamayacağız.

