# Harita 4 NEXT-11C14 — Gerçek Çarpışmaya Göre Uçuş Şeridi Güvenliği

**Durum (17 Kasım 2026):** NEXT-11C13 tam regresyon [37/37 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44087813180). C14 kod/test/CI dosyaları hazırlandı; yeni sonuç henüz doğrulanmadı. Bu aşama **read-only analiz**, yeni fizik/AI/navigasyon değişikliği içermez.

## Neden?

18 gerçek kamera pozu ve 08 FAST_LOW raycast incelemesi 23800 ilerleme noktasında belirgin mavi yüzey gösterdi. Kaynağın W01/VQ02 mevcut fabrika **fiziksel çarpışma alanları** olduğu saptandı. Kullanıcı 08'deki fiziksel fabrikaların taşınmasına açık izin **vermedi**. Nokta mesajı önemli onay yerine geçmez.

## Gerçek yeni iş

- `index.html` içine `h4Gfx11c14ScanCorridors` — gerçek üretim `h4SegmentBoxHit` ve oyuncu `padding=12` ile **aynı** W01 200 + W05 36 hacmi, aynı `routeProgress ±25` ön elemesi, 4 rota.
- `FAST_LOW x=-800 y=-100`, `CENTRAL 0,350`, `HUNTER_FLANK 900,310`, `SAFE_UPPER 0,760`. Sonuncusu **olası karşılaştırma rotasıdır**, ölçüm yapılmadan güvenli ilan edilmeyecek.
- 14.080–33.920 aralığında 75 rota birimi/sweep basamağı: her profil için çarpışan segment sayısı, gerçek çarpışma aralıkları ve aralığı oluşturan collider kimlikleri/parent sahipleri; 23.800 anlık noktası da aynı gerçek kontrolle doğrulanır.
- Objelerin mesh/geometry/materyal/collider referansını değiştirmez; `h4Gfx11c14Stats.modifiedPhysics/modifiedRoutes/modifiedModels=0`. Gelecekte önemli rota-yerleşim değişikliği ancak kullanıcının açık onayıyla yapılır.
- `tests/map4-gfx11c14-collider-lane-survey.cjs`: gerçek Chromium WebGL üzerinde dört rotanın aynı üretim çarpışma algoritmasını çağırdığını, 08 fiziksel fabrika riskini ve **24 W05 marker (12+12), 34 W02 korunmuş fiziksel yapı, 6/36/200 collider, 5 rakip/8 avcı, 60/300/850 kuralları** değişmediğini kontrol eder. JSON yükü `map4-next11c14-flight-lane-collision-map.json`.
- Hızlı `.github/workflows/map4-next11c14-collider-lane-audit.yml` ve mevcut Map1/Map4 tam browser-smoke güncellendi.

## Görsel/telif tasarım sözleşmesi

Kullanıcının kararı: CGTrader veya diğer ticari model/sahne/doku/ayırt edici silüetler **kopyalanmayacak**. Genel atmosfer, teknik kalite ve fiziksel dünyaya özgü sanayi konseptlerinden bağımsız ilham alınabilir. C14 yalnız mevcut veri/işlevi okur ve hiç yeni model/doku eklemez.

## Yapıldı / yapılmadı

- [x] [C13 tam 37/37 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44087813180).
- [x] C14 read-only oyun kaynak tarayıcısı, syntax PASS.
- [x] C14 gerçek Chromium QA, 4 şerit, 08 point collision ve sahiplik/koruma test dosyası yazıldı.
- [x] C14 hızlı + full browser workflow dosyaları güncellendi.
- [ ] Yeni C14 HEAD hızlı WebGL PASS ve gerçek JSON analizinden güvenli/riskli aralıklar.
- [ ] Yeni C14 HEAD Map1+Map4 full CI PASS.
- [ ] Kullanıcının 08 fiziksel yapı yerleşimi veya bilinçli riskli rota **açık kararı**.
- [ ] Tam 300 saniye gerçek pilot seansı, native 720/1080p GPU FPS/p95/VRAM, kullanıcı 7–8/10 estetik onayı, ilk yayıncı pitch 3/6 oynanabilir harita.
- [ ] PR merge açık onayı; bütün stacked PR Draft/unmerged.

**Sabit:** 6 harita; Map1 yalnız yarış; Map4 dört faz, 5 rakip/8 avcı, 60s arena, 300s üst süre, 850m çıkış, endüstri 3 ana şerit; 24 navigasyon işareti, 34 W02 fiziksel kabuk, 6/36/200 collision korunur.


## İlk gerçek rota sonuçları ve görünürlük metodolojisi — 17 Kasım

**Gerçek Chromium/WebGL ilk PASS:** [#44090749918](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44090749918) **9/9 adım**. JSON: `map4-next11c14-flight-lane-collision-map.json`. 14.080–33.920'de sabit izlenmiş 265 ilerleme kesiti; gerçek oyuncu `h4SegmentBoxHit` ve `padding=12`.

| Şerit | Çarpışan kesit | Tekil kesitlerin yüzdesi | Risk aralığı sayısı |
|---|---:|---:|---:|
| FAST_LOW (x=-800,y=-100) | 19 / 265 | %7,17 | 6 |
| CENTRAL (0,350) | 15 / 265 | %5,66 | 6 |
| HUNTER_FLANK (900,310) | 7 / 265 | %2,64 | 2 |
| SAFE_UPPER (0,760) | 15 / 265 | %5,66 | 6 |

Bu **kesintisiz pilot uçuşu veya zorunlu çarpışma sayısı değildir**; pilotlar şerit/yükseklik değiştirebilir. `SAFE_UPPER` adı fiziksel engel yok anlamına gelmez.

**08 FAST_LOW fabrika:** yaklaşık **23.663–24.037** aralığı; tam `progress=23800` anlık kontrolünde **iki** mevcut W01 fiziksel collider: `MAP4_LEGACY_W01_FACTORY` ve `VQ02_SIGNATURE_FACTORY`. Aynı ilerleme noktasında CENTRAL/HUNTER_FLANK/SAFE_UPPER konumlarında **0** çarpışma. Başka riskler 07/08/09 sahasında devam eder.

**AI kaçınma açık bulgusu:** `h4IndustrialAvoidance({routeProgress:23000},-800,-100)` çıktısı `avoiding:false`; kaynak `h4IndustrialColliders` (36 W05) tarar ama W01 200 collider taramaz. Henüz AI veya fizik değişmedi.

**Visibility QA uyarısı:** İlk `6b860a0` kaynak raporu oyunun başlangıç kamerasıyla (phase1, uzaktaki sanayi görünmez) üretildiği için ***236 çarpışma hacminin tamamını görünmez*** olarak işaretledi; **bu sonuç GEÇERSİZDİR** ve "görünmez duvar" kanıtı sayılamaz. `bf93607` visibility çıkarımını yalnız mevcut kamera pozuyla etiketliyor; `9824bf9` test kamerasını `phase3,progress23800,x=-800,y=-100` konumuna getirip `updatePlanetaryWorld()` çalıştırıyor. **En son hızlı [#44091991885](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44091991885) sonucu bekleniyor.** Bu yeni rapor doğrulanmadan görünmeyen collider iddiası yapılmayacak.

**Sabit kalır:** 200 W01, 36 W05, 6 kanyon çarpışması; 34 korunan W02 fiziksel mesh; 24 BEACON/HIGH_MARKER; rota bonusu ve yarış kuralları. Kullanıcı açık onayı olmadan fiziksel fabrika/rota/AI değişmez. Bütün PR'lar Draft, merge yok.


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


## 18 Kasım — C14 CI kapanış doğrulaması

- [x] [Son kod HEAD hızlı Chromium/WebGL #44093556723](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093556723): **completed/success; 9/9 PASS**.
- [x] [Son kod HEAD Map1/Map4 tam browser regresyonu #44093556645](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093556645): **completed/success**, browser-smoke job'un bütün adımları başarılı.
- [x] 236/236 fiziksel collider sahne sahibi ve 08'de görünür iki gerçek fabrika engeli, koruyucu WebGL testiyle doğrulandı.
- Son PR HEAD `01d50c0` yalnızca dokümantasyon commitidir (`[skip ci]`); yukarıdaki CI son oyun/test kodu `6d32a2e` için doğrulanmıştır.
- [ ] **Kullanıcı açık kararı**: 08'de fiziki fabrika taşıma mı, bilinçli riskli alt hat mı; rakip W01 avoidance dahil oynanış ve denge uygulamaları.
- [ ] Native GPU 720/1080 fps/p95/VRAM, gerçek kesintisiz 300s pilot seansı, 7–8/10 estetik ve yayıncı 3/6 playable kapıları.
- [ ] PR merge. **DRAFT/NO MERGE** kuralı sürüyor.
