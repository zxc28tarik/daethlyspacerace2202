# NEXT-11C17 — Yoğun, yüksek ayrıntılı özgün sanayi mimarisi

**18 Kasım 2026 / İlk sanat üretim turu** — Kullanıcının yeni önceliği: Harita 4'e daha çok eşya, bina, sanayi makinesi, servis detayları ve yüksek görsel kalite ekle. Oyun **zor kalacak**: yalnız görsel içerik genişler; mevcut kaza olasılığı, engeller, rotalar, AI, hız bonusları ve fiziksel fabrika konumu değişmez.

## Gerçekten üretilen içerik

- Altı sanayi bölgesi `15.750, 18.750, 21.850, 24.950, 28.150, 31.500` çevresinde **24 yeni büyük çok parçalı sanayi/makine kompleksi**: 4 orijinal mimari aile, her biri 6 konumda. Her birinde çok sayıda boru, kaynak/bağlantı elemanı, kademeli silo, sıcak hava bacası, üretim ayağı, çapraz bracing, platform ve panel detayları.
- Dört büyük aile: (1) kademeli ayrıştırma/basınç kuleleri ve servis iskeleleri; (2) asimetrik soğutma/ısı eşanjörleri, ızgara ve döner hava transfer panelleri; (3) açık yükleme gantrysi, asılı vinç, 9 kargo modülü ve kafes taşıyıcıları; (4) enerji şartlandırıcı, transformatör, ızgara, güç hatları.
- **72 küçük işlevsel servis ünitesi**: boru/valf skid'i, havalandırmalı elektrik kontrol kutusu, plaka kaplı küçük yükleme/servis podları. Üç ayrıntılı alt aile; konumlar büyük kütlelerin etrafına dağıtılır.
- **Toplam 96 yeni statik görsel yerleşim**. Herinin içine birden çok geometrik parça bake edilir; sadece 7 `InstancedMesh` batch hedefi, 4 büyük+3 küçük aile, PBR `MeshStandardMaterial` ve mevcut **GFX11C5** çizik/kir metal atlası kullanılır. Yeni doku, ışık, collider, CDN, dış GLB / ticari asset kopyası sıfır.
- Farklı boylar/renkler/rotasyonlar ve altı fabrika çevresinde iki yan/uzak kademe sayesinde düz tekrarlı blok sırası yerine işleve göre endüstriyel bir skyline. Yalnız 3. faz görselleri; HIGH/BALANCED tüm detaylar, LOW yalnız büyük modeller.
- Uçuş için önceden kabul edilmiş `FAST_LOW`, `HUNTER_FLANK`, `CENTRAL`, `SAFE_UPPER` koridorlarına yeni çarpışma veya yakın temassız büyük görsel duvar eklenmez. Her parça yan taraftaki fabrika sahasında; etkin oyuncu rotasından geometri mesafesi otomatik test edilir.

## Mutlak korumalar

- Oyundaki **200 W01 + 36 W05 fabrika/sanayi collider**, **6 kanyon collider**, 24 BEACON/HIGH_MARKER ve 34 fiziksel W02 bina geometri + materyal/collider pointer kimliği aynı kalır.
- 5 rakip/8 avcı; 60s arena/300s limit/850m yörünge; kanyon **+%18** ve sanayi hızlı hat **+%12**; Map1 yarış.
- **Gerçek kazalar ve riskli rotalar korunacak**. 23.800'de görünür iki fiziksel fabrika engeli aynen duruyor. C16'nın 3/0/0 gerçek oyun çarpışma olayları bir zorluk azaltma gerekçesi değildir.
- Fabrika, AI, fizik, rota bonusu, navigasyon geometrisi veya PR merge için kullanıcı açık onayı şart. Bu PR yalnız kullanıcı tarafından istenen **görsel yoğunluk** talebini işler.

## Test ve kabul

- [x] Üretim `index.html` içine bağımsız görünüm anahtarlı `h4Gfx11c17BuildDensity`, `SetLook`, `UpdateQuality` eklendi; başka oyun dosyası modifiye edilmedi.
- [x] Gerçek Chromium/WebGL 1600x900 dört sanayi kadrajı eski/yeni PNG karşılaştırmalı test kodu yazıldı. Beklenen içerik 96 instance/7 batch ve 236 collider/24 marker/34 W02 before-after checksum.
- [x] Bağımsız hızlı CI ve mevcut tam Map1/Map4 regresyonuna C17 testi eklendi.
- [ ] **Güncel C17 gerçek WebGL hızlı PASS** ve 07/08/09 A/B görüntüleri doğrulandı.
- [ ] **Güncel C17 tam Map1/Map4 browser regression PASS**.
- [ ] Daha çok eşya ve parçanın **gerçek estetik kazanç** sağladığı kullanıcının görüşünde doğrulandı (7–8/10 hedef).
- [ ] Oyuncu tarafından gerçek uçuş, 300s kesintisiz görev, native GPU 720p/1080p FPS/p95/VRAM.
- [ ] Son bölge/üs/liman gibi Harita 4'ün diğer bölgelerinde benzer görsel yoğunluk çalışmaları.
- [ ] Kullanıcının açık merge/onay kararı. **DRAFT, MERGE YOK.**

Test artefaktı: `map4-next11c17-96-detailed-objects-review`, gerçek 4 eski/yeni kare çifti ve üçgen/drawcall/koruma raporu.

**Üretilen nesne sayısı, kalite puanı değildir.** İnsanın görmesi, performans ölçümü ve devamlı oynanış hâlâ gereklidir.


## İlk gerçek Chromium/WebGL kabul sonucu — 18 Kasım 2026

- [C17 hızlı WebGL #44206367310](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44206367310) **completed/success, 9/9 job step PASS**. Aynı C17 oyun/test koduyla [sonraki hızlı #44206497301](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44206497301) **completed/success**. Son iki commit yalnız dokümandır, `index.html` ve test kodu değişmemiştir.
- Tam **24 büyük + 72 servis = 96 yerleşim; 7 drawcall**, gerçek Chromium/Three.js ile üçgen hesabı **49.320**. High ve Balanced'da büyük/küçük tüm üniteler görünür, Low'da yalnız büyük üniteler.
- Aynı oyuncu/kamera sabitlenerek dört görünüm **eski/yeni JPEG değil gerçek PNG** olarak arşivlendi: `07-approach`, `07-machinery`, `08-plant`, `09-exit`; dört kadrajda da **piksel değişimi true**. Bu yalnız etki kanıtıdır; güzel görünme veya 7–8/10 puan otomatik kanıtlanmaz.
- **236/236 fiziksel collider (6 kanyon + 36 sanayi + 200 yapı), 24 W05 rota işareti, 34 korunmuş W02 fiziksel mesh**, 5 rakip/8 avcı, 60/300/850, %18/%12 güzergah avantajı ve bütün eski hasar/AI fonksiyonları korunur. C17 yalnız yeni sanat ünitelerinin yanal sahasını kullanır.
- **Açık:** [Tam Map1/Map4 test #44206497307](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44206497307) son kontrol anında **in_progress**; başarısını ayrıca kontrol etmeden PASS ilan etme. Gerçek 300s kesintisiz pilot, native 720/1080 GPU performansı, kullanıcının özgün görsel kalite onayı ve mevcut tüm Draft PR merge onayı açık.


## Kullanıcı kararı — sınırlı kendi bina/model tekrar kullanımı

Harita 4'te kalabalık ve yüksek detaylı çevre üretiminde **daha önce projenin kendisi için üretilmiş binaları sınırlı sayıda yeniden yerleştirmek serbest**. Bu, her binanın benzersiz olmak zorunda olmadığı anlamına gelir; ancak karmaşık hero fabrika/liman/karakol silüetlerinde görünür seri kopya oluşturmak amaç dışıdır.

Tekrar kullanılacak ikincil yapıların ölçek, rotasyon, malzeme, servis donanımı, çevre yerleşimi ve gerekli durumda kısmi geometri varyasyonları farklılaştırılır. Yeniden kullanılan varlığın kaynak ailesi ve sayısı test/raporda izlenir. Ticari veya harici modelin kopyalanması bu iznin kapsamına girmez. Kullanıcı hâlâ sert/zor oyun, gerçek kaza riski, AI/rota/fizik koruması ve **merge için açık onay** şartını koruyor.

**Not:** Bu kayıt yeni bir fiziksel bina veya varlık yaratıldığı iddiası değildir; sonraki içerik üretimini yönlendiren kabul edilmiş tasarım kuralıdır.
