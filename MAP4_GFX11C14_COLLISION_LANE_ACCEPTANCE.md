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
