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
