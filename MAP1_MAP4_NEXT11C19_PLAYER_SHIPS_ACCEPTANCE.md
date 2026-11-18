# NEXT-11C19 — İki oynanabilir haritaya birer özgün oyuncu gemisi

**Kullanıcı kararı (18 Kasım 2026):** "2 HARİTA İÇİNDE ŞİMDİLİK BİRER GEMİ YAP". Önceki kamera kararı: normal uçuşta **1 Cinematic Chase**, boost sırasında yumuşakça **2 Tight Chase'e yaklaşan**, boost bitince başlangıca dönen açı. Önceki Squadrons çalışmasındaki motor/silah/kalkan güç yönetimi korunacak. Diğer gemi sınıfları, özelleştirme ve filolar sonraya bırakılacak.

## Gerçekten kodlanan içerik

- **Harita 1: R-01 VEKTÖR.** Özgün sivri ve inceltilmiş değişken kesitli gövde; geniş geriye süpürülmüş iki 3D kanat, çift iyon itici, hafif yarış zırhı, yan aerodinamik finler, çok sayıda havalandırma yarığı, seri kanat şeritleri, kokpit camı, karanlık alt gövde ve mavimsi itici ışığı. Yarış odaklı; mevcut Map1 saf yarış, kutudan açılan lazer ve 3 ortak enerji bedeli korunur. Eski ilk sürüm çok basit GeoSword prototip gövde primitive'leri **silinmeden gizlendi**.
- **Harita 4: B-04 BASTİON.** Özgün daha dolgun değişken kesitli gövde, ikinci farklı 3D kanat topolojisi; çift büyük motor, ilave orta itici, köşeli zırh tabakaları, iki tarafta ikişer uzun silah namlusu, mekanik kanat sırtları, yan servis ızgaraları, zırhlı kokpit ve turuncu/çelik mavisi tanımlayıcı detaylar. **Yeni çarpışma veya oyuncu silahı eklenmez.** Önceki GFX05 oyuncu fighter modeli, test edilmiş motor/hasar animasyonu ve ortak malzemeler korunur; B-04 özgün görsel zırh kiti aynı oyuncu gövdesine eklenerek **bir** birleşik oyuncu gemisi görünümü oluşturur.
- Modeller **üçüncü taraf GLB veya ticari asset kopyası olmadan** oyun içinde özgün parametrik 3D geometriyle oluşturuldu: 12-yüzeyli değişken kesitli tapered hull, özgün extrude kanatlar, kokpit, yapısal zırh, tüpler ve makine detayları. Ayrı `MeshStandardMaterial` yüzey ailesi ve kaynakları birleştiren **6 materyal/draw batch/gemi**; sistem toplam 12 batch ve sınırlı GPU çağrısı hedefler.
- Kendi oyunumuza ait varlıkların sınırlı tekrar kullanımı kararı geçerlidir. Eski GFX05 altyapısının korunması bu kapsamdadır.
- **Kamera:** Her iki haritada oyun başlangıcında `state.cameraMode='CHASE'` (C ile eski TURRET/CHASE arasında geçiş devam). Oyuncu gövdesi görünür. Normalde arkadan hafif sol offset / üstten takip. Boost enerjisiyle artan hız oranına göre kamera **geri kaçmak yerine arkadan gemiye yaklaşır**, hafif alçalır ve mevcut hızlı FOV açılır; bıraktığında eski takip mesafesine yumuşak döner. GFX09 Map4 mevcut `h4Gfx09SafeChase` fiziksel engel arkasında kamerayı güvenli tutar, **gemiyi asla yerinden oynatmaz**.
- Kamera pozisyonu değişirken motor/AI/görev/çarpışma/rota bonusu değişmez. R-01 ve B-04 model oluşturulması **tek seferliktir**; yeniden yarış başlatıldığında duplicate mesh veya geometri üretilmez.

## Korunan sınırlar

- Map1 saf yarış. Map4 dört faz, 5 rakip + 8 avcı, arena 60s, limit 300s, yörünge 850m, +18% kanyon / +12% sanayi, riskli hızlı güzergâhların kazaları.
- 6/36/200 fiziksel collider, 24 sanayi nav işareti ve 34 fiziksel W02 mesh; köprüler ve gerçek fabrikalar kaldırılmadı.
- Harita 4 NEXT11C18 güç odakları (1–4), ücretli lazer, enerji rezervleri, drift ve ALT kamera modu devam.
- **Yapılmayanlar:** Yeni AI gemisi, yeni gemi türü/sınıf seçimi, yeni silah hasarı/ateş oranı, uçuş fiziğini kolaylaştırma, PR birleştirme.
- Game HUD ve oyun içi gemi kimliği, mevcut GeoSword isimlerinden tamamen kurtulma gibi marka/ürün işleri ayrı geliştirilecek.

## QA kapıları

- [x] Üretim `index.html` iki özgün oyuncu gemisi ve camera #1→#2 boost davranışı kodlandı.
- [x] `tests/map4-next11c19-two-player-ships.cjs`: gerçek Chromium + WebGL, 2 gemi parça ve çizim grupları, normal/boost ekran görüntüleri, kamera yaklaşımı/FOV, Map1/4 izolasyonu, kamera C toggle, 6/36/200 collider ve 5/8 hedef sözleşmesi.
- [x] Hızlı Actions workflow + tam Map1/Map4 regresyon bağlantısı.
- [ ] **Hızlı C19 Chromium 4 ekran QA PASS** (kontrol edilmeli).
- [ ] **Tam Map1/Map4 Chromium regresyon PASS** (kontrol edilmeli).
- [ ] Kullanıcının gerçek görsel kabulü; geminin ekran kaplama oranı ve özgün kimlik; native 720/1080p GPU FPS/p95/VRAM; 300s gerçek insan pilot.
- [ ] PR Draft olarak kalmalı; **açık kullanıcı izni olmadan merge yok**.

Sadece model sayısı ve test PASS, estetik 7–8/10 veya yeterli performans garantisi **değildir**.

## NEXT11C19B — Kullanıcı referans tarzını **oyunun modellerine uyarlama**

- Yeni doğrudan talep: **"TARZ OLARAK OYUNA ADAPTE ET"**. Son gösterilen iki referans birer birebir model, görsel dosyası veya telifli asset olarak alınmıyor; mevcut R-01 ve B-04 özgün oyuncu gemilerinin **oyun-içi render edilen** malzeme/kanat/motor/kaplama tasarımları buna göre genişletiliyor.
- **R-01 Vektör — yarışçı:** açık beyazımsı çelik üst gövde, daha belirgin turkuaz/petrol mavisi gövde altı, cam kabin, keskin uzun burun, 3D kanat üst plakaları, çift iyon iticide yeni iç/dış halka, art arda gerçek aerodinamik havalandırmalar, küçük kabin işaretleri, gövde üzerinde tekrar eden ince üretim detayları. Tek bir modelde ayrıntılar 6 GPU materyal grubuna bake edilir.
- **B-04 Bastion — zırhlı savaşçı:** daha koyu kömür/çelik ana renk, sıcak turuncu/amber trim + motorlar, iç ve dış kanatları ayıran yükseltilmiş zırh plakaları, çift namlunun uçlarında halka/ısı detayları, iki büyük motorun dış metal halkaları, radyatör kanalları, kanat bolt/servis teçhizatı, dikey zırhlı gövde ve ayırt edici üst tabaka. Silah görselleri mekanik, gerçek hasar/atış/aim değişmiyor.
- Teknik: `THREE.ExtrudeGeometry` ve özgün tapered fuselage devam eder; yeni `BoxGeometry` (segmentli), `IcosahedronGeometry`, `TorusGeometry`, `SphereGeometry` ek parçaları yeni dış kaynak olmadan aynı mevcut 6 GPU batch'e dahil edilir. Yeni collider / fizik / bonus / AI / silah / enerji değişikliği **sıfır**. Paylaşılan animasyon taşıyıcıları korunur.
- İki haritanın normal #1 kamera, boostta #2'ye yaklaşması, tuşla C kamera değiştirme kararı **aynen**.
- **Kabul ölçümü:** gerçek Chromium ekranından R-01/B-04 net ayrışması, normal ve boost açıları, görünürlük, geometri/VRAM-draw bütçesi, mevcut 6/36/200 fizik ve 5/8 görev korunması, eski testler. Kullanıcı estetik onayı ve native GPU ölçümü hâlâ açık; test PASS öznel görsel kaliteyi garanti etmez.
- **Merge/onay:** PR #64 Draft kalır; kullanıcı açıkça izin vermeden hiçbir stacked PR birleştirilmez.


## İlk C19B gerçek WebGL kabulü — başarılı (18 Kasım 2026)

- Güncel üretim kodunda [NEXT11C19 hızlı #44226228254](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44226228254) **9/9 PASS**: **R-01 181 alt parça, B-04 249 alt parça** tek seferlik 3D üretildi, iki gemi toplam **12 materyal/draw batch**. Modellerin renk ve ayrıntıları *oyun içi 3D geometriye* entegredir; dış GLB/sahneden aktarım yok.
- Gerçek oyun kamerasında **Harita 1 normal 18,957 → boost 13,267** ve **Harita 4 normal 19,3707 → boost 13,3943**. Kamera doğrudan oyuncu dünya konumunun yerel ekseninde izliyor, boostta yakınlaşıyor. Mevcut kamera occlusion / duvar koruması korunur.
- Gerçek **1600×900 Chromium/Three.js** screenshotları: `map1-normal`, `map1-boost`, `map4-normal`, `map4-boost`. [QA görsel paketi ve JSON raporu](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44226228254/artifacts/14393625147). Kullanıcı estetik/nihai kalite onayı yerine geçmez.
- **Mevcut fizik 6 kanyon + 36 sanayi + 200 yapı collider**; 24 navigasyon işareti, 34 fiziksel W02 mesh, 5 rakip/8 avcı, 60s/300s/850m, +18/+12 ve kamera C geçişi doğrulandı.
- Önceki test run'ları: ilk sürümde harita yüklenmeden collider assertion, ardından eksik ayrıntı üçgen eşiği, sonra yüksek hızda dünya uzayı kamera gecikmesi FAIL çıktı. Bunlar gerçek model geometri geliştirmesi ve yerel kamera takip hesabı düzeltmesiyle giderildi. **Sadece #44226228254 başarılı son sürüm kabulüdür.**
- **Güncel tam Map1/Map4 regresyon** [#44226228256](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44226228256) ayrıca doğrulanacak; bu belge hızlı PASS'i tam PASS diye göstermiyor.


### C19B oyun görüntüsü kalite kontrolü — düşük aydınlatma düzeltmesi

- İlk dört gerçek screenshot incelendi; **R-01'in beyaz/turkuaz tasarımı Harita1'in düşük ışıklı uzay ortamında siyaha yakın çıkıyordu**, bu yüzden sırf renk paleti yazmak yeterli değildi. Koyu görünüş ve B-04 motorlarının solgun çıkması tespit edilerek **render materyali** ayrıca düzeltildi (`212f1b15`).
- R-01: `MeshStandardMaterial` gövde/map ayrımı ve ayarlanabilir yumuşak `emissive` doldurma ile açık renkli aerodinamik kaplama karanlık fonda görünür. Canlı PBR ve kanat yönü korunur. 
- B-04: mevcut GFX05 player's unique palette koyu çelik/turuncu yapıldı (`6eaaeb18`); yeni B-04 zırh modelinin kaplaması koyulaştırıldı, enerji/motor detaylarında daha belirgin amber emissive ve glow kullanıldı. **Racer/hunter AI palette 1..7 değişmez**.
- Yeni ışık, dünya pozisyonu, fizik gövdesi, silah veya doku/GLB eklenmedi; 6 ayrı materyal draw batch/gemi sınırı aynı.
- [Final materyal sonrası hızlı WebGL run #44226729705](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44226729705) ve [tam regresyon #44226729821](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44226729821) sonuçları esas alınmalı. Önceki #44226228254 **9/9 PASS** ancak daha eski materyal sürümüne aittir.
