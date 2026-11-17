# Harita 4 — NEXT-11C15: Gerçek Fizikle Şerit Geçişi Risk Matrisi

**Durum:** Yalnız analiz + test. Fiziksel fabrika, W01/W05 collider, rakip AI, rota bonusları, navigasyon işaretleri veya oynanış kuralları **değiştirilemez**. PR Draft, merge yok. Kullanıcının 18 Kasım talimatı: **C15'i yalnız analiz ve testlerle ilerlet.**

## Amaç ve yöntem

C14 gerçek 236 fiziksel collider üzerinde 4 **sabit** şerit taradı. C15 sabit hattan çıkan varsayımsal manevra örneklerinde *çizgi boyunca gerçek süpürülmüş çarpışma* var mı sorusunu yanıtlar. İş gerçek oyun `h4SegmentBoxHit(previous,current,volume,12)` fonksiyonunu **aynen** çağırır. Aynı canlı `planetaryBuildingColliders[200]` + `h4IndustrialColliders[36]`, gerçek player padding 12 ve oyun broadphase `±25` kullanılır. Tam tarama ile her segmentin broadphase sonucu çapraz kontrol edilir.

**ÖNEMLİ SINIRLAMA:** Bu testler gerçek pilot kontrol komutları, araç kinematiği, tepki süresi, hız bonusu, AI yönlendirmesi veya 300 saniye süreyle kesintisiz oynanış değildir. Farklı şeride lineer geçen hipotezler, *geometrik engel haritalaması* sağlar; "çarpışmasız" çıkan hipotez otomatik olarak **oynanabilir/güvenli** rota ilan edilmez. `SAFE_UPPER` bir örnek profil adıdır, güvenlik taahhüdü değildir.

## 13 deterministik yol (22.000–25.200, 40 birim adım / 80 süpürülmüş segment)

- **4 sabit kontrol:** FAST_LOW(-800,-100), CENTRAL(0,350), HUNTER_FLANK(900,310), SAFE_UPPER(0,760).
- **5 hızlı şeritten çıkış:** merkeze erken (22.600–23.200), orta (23.000–23.600), geç (23.500–24.100); avcıya erken (22.200–23.500); üst irtifaya erken (22.200–23.500).
- **2 merkez çıkışı:** avcıya (22.900–23.600); üst irtifaya (23.000–23.600).
- **2 karşıt/geç senaryo:** merkezden hızlıya 08 üzerinden geçiş (23.400–24.000); hızlıdan merkeze 08 sonrası (24.000–24.600).

İstenen karşılaştırmalar: riskli segment sayısı, risk aralıklarının başlangıç-bitişi, fiziksel collider ID/mesh sahipliği, 23.800 anlık delil, sabit 4 rota için **C14'le birebir** çarpışan kesit sayısı, brüt `Δx/Δprogress` ve `Δy/Δprogress` (simüle edilmiş gemi performansı değil).

## Koruyucu koşullar

- Test bütün 236 collider sahibini oyunun **tüm planetaryWorldGroup** ağacından arar; sahipsiz/görünmez duvar iddiası otomatik yaratmaz.
- 23.800 FAST_LOW testinde 2 gerçek W01 fabrika hacmi beklenir; diğer 3 sabit örnek noktada 0.
- Test öncesi/sonrası 24 W05 yön objesinin geometri/materyal/transform kimliği, 34 korunan W02 fiziksel yapı, bütün collider konum ve yarıçapları ve kurallar aynıdır.
- Map4 5 rakip/8 avcı, arena 60s, limit 300s, çıkış 850m; canyon 6, W05 36, W01 200 korunur.
- Üretim `index.html` **değiştirilmedi**; test dışında geçiş yönlendirmesi veya rota seçme fonksiyonu eklenmedi. Üçüncü taraf ticari mesh/sahne/özel silüet kopyalanmaz.

## Kabul kapıları

- [x] C14 [son hızlı WebGL #44093556723](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093556723) 9/9 PASS ve [son tam browser #44093556645](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44093556645) başarılı.
- [x] C15 test kodu ve hızlı + full QA workflow'ları yazıldı.
- [ ] C15 **son oyun/test HEAD** hızlı gerçek Chromium/WebGL PASS ve JSON'dan 13 geçiş risk raporu doğrulandı.
- [ ] C15 son HEAD Map1/Map4 full browser regresyon PASS.
- [ ] Raporun gerçek pilot uçuşu olmadığının ve net risk aralıklarının değerlendirilmesi.
- [ ] Kullanıcının açık fiziksel rota/fabrika ve AI kararı. **Bu aşamada uygulama YOK.**
- [ ] 300s sürekli pilot uçuşu, native GPU 720/1080 FPS/p95/VRAM ve kullanıcı 7–8/10 görsel değerlendirmesi.
- [ ] PR merge onayı. **DRAFT, MERGE YOK.**

Çıktı: `tests/map4-next11c15-lane-transition-matrix.json` GitHub Actions artifact olarak korunur; hipotez ve sınırlamalar dahil edilir.
