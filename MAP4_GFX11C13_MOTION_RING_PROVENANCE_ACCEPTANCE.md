# NEXT-11C13 — Hareketli Kamera ve Halka Kökeni Teknik Denetimi

**Aktif aşama:** Harita 4 sanayi 07/08, PR #58 Draft stacked on PR #57. Önceki C12 tam Map1/Map4 [#44082591388](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082591388) **35/35 PASS**; görsel kalite 7–8/10 kabulü yine açık.

## Neden?

Önceki C12 gerçek 1600×900 karelerinde ilerideki sanayi mimarisi daha belirgin, fakat büyük gökyüzü halkalarının kaynakları belirsiz. C5'nin varsayımsal güvenli dekor listesi **0** öğeydi. Aynı halka şekli kritik W05 uçuş BEACON/HIGH_MARKER, W01 landmark enerjisi, 3D makine parçası veya instanced/tek geometride baked C4 güç mimarisi olabilir. Bunları ayırt etmeden saklamak navigasyon kararımızı ihlal eder.

## Kod ve gerçek test

- `h4Gfx11c13RingProvenance()` — **yalnız okuyan**, oyun sahnesi kurulunca çağrılabilir 3D kaynak denetimi; TorusGeometry, W05 işaretleri ve adı ring/energy/portal/toroid içeren adayları bulur.
- Her adayın referansı, geometri tipi/adı, `w05Kind`, çarpışma varlığı, nesne/parent görünürlüğü, dünya konumu, güncel kamera projeksiyonu (NDC) ve ekranda olup olmadığı raporlanır. Nesne soy ağacına göre ayrımlar: `W05_PROTECTED_NAVIGATION`, `W01_INDUSTRIAL_LANDMARK`, `GFX11C4_BAKED_ARCHITECTURAL_HERO`, `W05_OR_GFX06_STATION_ART`, `UNCLASSIFIED_DO_NOT_EDIT`.
- **Yönetim kuralı:** Bütün adaylarda `safeToAutoHide:false`; sıfır `material/mesh/visibility` değişikliği, sıfır yeni collider/light/texture. Bu sınıflandırma tek başına otomatik güvenli silme izni değildir. Baked torus, sadece geometri tipi üzerinden tanınamayabilir; ad/ata/sahne ilişkisiyle ayrıca incelenir.
- `tests/map4-gfx11c13-motion-ring-provenance.cjs`: gerçek 1600×900 Chromium/WebGL motorunda Map4 faz3, altı ilerleme noktası `16550,17200,18000,22400,23800,25350` × üç gerçek W05 uçuş çizgisi `FAST_LOW(-800,-100)`, `CENTRAL(0,350)`, `HUNTER_FLANK(900,310)` = **18 ardışık kamera örneği**. Aynı 07/08 kamera altı PNG, tüm 18 durum için JSON manifest.
- Koruma testleri: 24 W05 işareti 12 BEACON+12 HIGH_MARKER; her birinde orijinal geometri UUID, material UUID, matrix, id birebir; 34 fiziksel W02 gövde; 6/36/200 collider; route key doğru; C12 6 instance projektif koordinatları uçuş boyunca hareket ediyor; WebGL kaynak sayısı sabit; hiç material/visibility değiştirilmedi.
- **Sınır:** Bu bir gerçek *motor içi kamera örnekleme dizisi* ve WebGL regresyonudur; 5 dakika kesintisiz gerçek kullanıcı uçuşu / native GPU p95 FPS değildir. Ekran projekisyonuna bakarak ön planın oynanış algısını değerlendirmeyi mümkün kılar.

## Özgünlük ve korunacak kararlar

- CGTrader veya başka ticari 3D varlık paketinden model/doku/silüet/yerleşim kopyalama yok. Başka örneklerden genel görsel kalite/teknik ilham alınabilir.
- 6 toplam harita, yayıncı ilk pitch en az 3 oynanabilir; Map1 yarış-only; Map4 dört faz, arena 60s, yarış üst sınırı 300s, orbit 850m, 5 rakip, 8 avcı, 3 endüstri uçuş hattı.
- W05 BEACON/HIGH_MARKER **önemli yön işareti**, kullanıcı onayı olmadan kaldırılmaz/değiştirilmez. C4–C12 önceki görsel katman ve 34 W02 fiziksel mesh'in collider kimlikleri korunur.
- PR #50–57 dahil bütün stacked PR'lar kullanıcı açık onayı olmadan merge edilmez.

## Yapıldı / yapılmadı

- [x] C12 tam regresyon [35/35 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082591388).
- [x] C13 kaynak kökeni gözlem fonksiyonu yazıldı ve JS parser PASS.
- [x] 18 gerçek hareketli rota kamera noktası, 6 screenshot + kaynak JSON testi yazıldı; hızlı ve tam CI eklendi.
- [ ] **Güncel C13 hızlı CI PASS** ve JSON'dan büyük görünen halkaların kaynak grupları belirlendi.
- [ ] 07/08 üç uçuş şeridinde gerçek ekran görüntüleri gözle incelendi; engel veya yanlış rota izlenimi değerlendirmesi.
- [ ] **Güncel C13 tam CI PASS**.
- [ ] Kesin dekor olduğu kanıtlanan halka varsa (yoksa **YAPILMADI**), kullanıcı kararı gerektiren navigasyon/önemli görünüm değişikliklerini önceden sor.
- [ ] Native GPU 720p/1080p FPS/p95/VRAM, kesintisiz 300s pilot uçuş, kullanıcı 7–8/10 estetik onayı, yayıncı 3/6 playable ve merge açık izni.

**CI PASS görsel puan veya telif sertifikası değildir. Bilgi yeterli değilse görüntüyü değiştirme.**


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
