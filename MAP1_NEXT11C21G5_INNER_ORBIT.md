# NEXT-11C21G5 — İç halkanın dik duruşunu ve soğuk mavi rengini düzelt

**20 Kasım 2026 kullanıcı geri bildirimi:** Üç halkalı ödül kristalinin neredeyse dik duran halkasının rengi ve açısı kötü. Gerçek C21G4 karşılaştırma ekranında bu halkanın **dış halka değil, 19 yarıçaplı iç mavi halka** olduğu görüldü.

## Uygulanan
- İç halka rengi **0x6B90D6 buz mavisi → 0xA17BCB yumuşak orkide moru**; mevcut iki mor halkanın paleti ile uyumlandı.
- Eski `rotation.set(.24,1.14,-.62)` neredeyse kenardan görülen dik yüzeydi. Yeni `rotation.set(.72,-.32,-.25)`, daha yatık ve dengeli bir görünüm verir.
- Eski sürekli x-axis dönüşü haritanın ilerleyen aşamalarında halkanın yeniden dikleşmesine yol açardı. Yeni pitch **.72 ± .12**, yaw **-.32 ± .09** sınırlarında yavaş salınır. Ring Z dönüşü düşük hızda korunur. Böylece uzun yarışta da aşırı dik/çizgi görünümü oluşmaz.
- Kalan ana ve dış halka **değişmedi**. Üç halka sayısı, çapları [24,28,19], kalınlıkları, opaklıkları, metal yok ilkesi ve kristal korunuyor.
- 49 ödül, çarpışma r49, rota, RNG, HYPER/normal boost davranışı, lazer süresi, SB-07 ve Map4 değişmez.

## QA
- Özel test `tests/map1-next11c21g5-inner-orbit.cjs`: gerçek Chromium/Three r128 WebGL 1600×900 (solda eski dik mavi, sağda yeni yatık mor); 300 saniye boyunca örneklenmiş pitch/yaw alt sınırları ve kenardan görünmeme doğrulaması.
- Gerçek yarış kamera görüntüsü (bir ödül yalnız görsel test için 185m ileriye sahnelenir, sonra yerine konur); Map4 fizik regresyonu.
- C21G4 / C21G3 / C21G Hyper ödül / gemi / koridor regresyonları. Güncel tek dosya OFFLINE oynanabilir HTML workflow çıktısı.
- Dedicated `.github/workflows/map1-next11c21g5-inner-orbit.yml`, genel oyun smoke. Main'e kullanıcı onayı olmadan merge yok.
