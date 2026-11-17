# Harita 4 — NEXT-11C16: Orijinal Oyuncu Girdileri ile Gerçek Oyun Adımı Denetimi

**Kapsam (18 Kasım):** C15'teki 0/80 erken hızlı→avcı geometrik hipotezinin gerçek `updateGame(dt)` tuş kontrolüyle uygulanabilirliğini analiz et. **SADECE TEST ve ANALİZ.** Fabrikaları, AI, rota bonusu, collider, model, oynanış `index.html`, navigasyon işaretleri değiştirilmez; merge olmaz.

## C15 kapandı

- [C15 hızlı son kod #44182868970](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44182868970) PASS; [C15 tam Map1/Map4 #44182869011](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44182869011) PASS. Bir önceki #44182747329 full başarısızdı ama son HEAD full başarılı. Kapsamlı C15 risk matrisi C15 belgesinde.
- Sadece `FAST_TO_HUNTER_EARLY` 22.000–25.200 geometrik taramada 0/80 riske sahip; bu **henüz oyunla uçulabilir veya güvenli yol değildir**.

## C16 gerçek fonksiyon/girdi testi

- Yeni `tests/map4-gfx11c16-scripted-pilot-controls.cjs` gerçek Chromium/Three.js ortamında oyunu Harita 4 olarak başlatır.
- Canlı oyunu duraklatır ve bağımsız senaryolar için endüstride aynı `progress=22000,x=-800,y=-100` pozuna geri konumlandırır. Her senaryo **orijinal** `updateGame(1/30)`, `map4Advance`, `applyBoundaryFriction`, `h4SegmentBoxHit` ve `updatePlanetaryBuildingContacts` fonksiyonlarıyla ilerler. Kod dışarıdan oynanış fonksiyonu kopyalamaz.
- Normal oyuncu tuşları `KeyD` ve `ArrowUp`, yani yatay/dikey itiş, fare orta pozisyonuyla uygulanır. Normal hız, 100 enerji/kalkan; boost, hiper ve lazer yok. Başlangıç `raceTime=125` yalnız bölüm pozunu örneklemek için kullanılır.
- Üç yol: **FIXED_FAST_LOW** (tuş yok), **EARLY_HUNTER_KEYS** (22.200 itibarıyla avcı `x≈900,y≈310` hedefi), **LATE_HUNTER_KEYS** (23.500 itibarıyla aynı hedef).
- Gerçek state pozları, ilerleme, kontrol basımları, fiziksel temas swept segmentleri, oyunun collider cooldown olayı, sınır dereceleri, DNF ve hedefe yetişme ilerlemesi ham JSON `tests/map4-next11c16-scripted-pilot-input-traces.json` içinde.
- Oyun modelini değiştirmeyen koruma: `200 W01 + 36 W05` fiziksel hacmin birebir koordinatı; `24` W05 işareti geometri/materyal/matrix; `34` W02 fiziksel yapı; `6` kanyon collider; 5 rakip/8 avcı, 60s arena, 300s limit, 850 çıkış, 1.12 hızlı rota bonusu önce/sonra eşit.
- Gerçek oyuncu fonksiyonlarıyla 30 FPS **scripted tick** yalnızca kısmi örneklemedir. **İnsan oynanış testi, gerçek zamanlı kesintisiz 300s görev, native GPU benchmark veya bütün rota güvenliği değildir.** Düşman hareketi, ekran görünürlüğü ve farklı oyuncu refleksleri kapsam dışındadır.

## Test kabul kapıları

- [x] Oyun `index.html` değiştirilmedi; C16 kodu test/CI ve bu dokümanla sınırlıdır.
- [x] Hızlı C16 Chromium QA + tam Map1/Map4 browser suite eklendi.
- [ ] Gerçek C16 hızlı test çalışması completed/success ve 3 gerçek input senaryosu ham JSON değerlendirildi.
- [ ] C16 güncel tam Map1/Map4 browser suite completed/success.
- [ ] Fabrika yerleştirme, AI veya bonus değişikliği önemli karar onayı **bekliyor**.
- [ ] Kesintisiz 300s insan/pilot gameplay testi, native GPU, 7–8/10 görsel kabul, 3/6 yayıncı haritası, PR merge izni bekliyor.

**DRAFT / MERGE YOK.**
