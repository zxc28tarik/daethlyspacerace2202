# Harita 4 — Görsel Kalite Dönüşümü / Art Direction

## Kullanıcı değerlendirmesi
19 Ekim 2026: Mevcut Harita 4 görsel kalitesi kullanıcı tarafından **yaklaşık 3/10** olarak değerlendirildi. Bundan sonraki aşamalarda sadece nesne sayısını artırmak yerine silüet, malzeme, ışık, atmosfer, gemi ve çevre estetiği bağımsız kabul ölçütleri olacaktır.

## VQ01 — Bu dalgada uygulanmış görsel altyapı
- [x] Kaya sütunları eski 5 kenarlı basit koni yerine **9 kenarlı, 6 katmanlı, düzensiz çok kademeli kaya geometrisi** kullanıyor; W03 çarpışma AABB ölçeği korunur.
- [x] Taş, kum/zemin, çelik, zırh, koyu metal için **7 prosedürel CanvasTexture** haritası; tek kez oluşturulup tekrar kullanılır, haricî ağ bağlantısı gerektirmez.
- [x] Yatay/dikey boyunca tekrar eden UV'li dokulu arazi; mevcut renk bantları ve topoğrafya korunur.
- [x] Gezegenin dört evresine göre paleti değişen custom GLSL gökyüzü kubbesi (gün ışığı, sıcak ufuk, üst atmosferde koyu gökyüzü), güneş halesi.
- [x] **36 ayrı** katmanlı, yumuşak bulut silüeti; yörünge yüksekliğinde görüntüyü boğmamak için culling.
- [x] MeshStandard PBR/roughness/metalness ile doğal kaya/metal ayırımı; **Map4-only filmic tonemapping + exposure**.
- [x] Büyük yapıların kendi mesh çocukları olarak çatı/pencere/enerji panelleri ve kabartma metal çizgileri; ebeveyn çarpışma hacmi değişmez.
- [x] Oyuncu üçüncü şahıs GeoSword detay paketi; rakip ve düşman gemilerinde cam kokpit/kanat/motor silüeti. **Harita 1 görseli değiştirilmez.**
- [x] Gerçek Chromium oyunu: doku, shader, bulut, gelişmiş 3D gemiler, Map1 görünüş izolasyonu; CI PASS.
- [ ] Kullanıcının yeni görselleri oynayarak kaliteyi tekrar değerlendirmesi.

## Daha yüksek görsel kalite için sıradaki üretim işleri

### VQ02 — Özgün 3D model dili (ikinci grafik geçişi kodlandı)
Kaya/dağ kitleri için doğal erozyon, özgün kaya kümeleri ve gerçek geçit formu; endüstri için tekrar etmeyen fabrika modülleri ve rafinerinin okunur silüetleri. Tekrarlı küp + silindir yaklaşımı azaltılacak. Silah/gemi modeli için tutarlı orta detay ana gövde, kanat kesitleri ve exhaust anatomisi. Collider'lar görünür katı elemanlarla eşlenmeli.

### VQ03 — Malzeme ve yüzey kütüphanesi
Özel taş, metal, pas, boya, kir, ikaz boyası ve cam dokuları; gerekirse profesyonel hazırlanmış tiling texture atlas. Renk/roughness/metalness varyasyonları bölge başına. Modellerde anlamsız rastgele neon kullanılmayacak.

### VQ04 — Atmosferin sinematografik geçişleri
Vadi: kuru sıcak ufuk/toz; savaş arenası: toz/siyah duman/enkaz; sanayi: soğuk çelik/ışıltı; üs ve yörünge: atmosfer incelmesi, görünür ufuk ve açık uzay. Görev akışı bozulmadan görsel hedefler daha belirgin olacak.

### VQ05 — Efektler ve VFX performansı
İtiş izi ve motor parlama tasarımı; lazer isabetleri ve fiziksel çarpışmalar için çok katmanlı ama düşük maliyetli patlama/şarapnel/duman efektleri; GPU upload ve draw-call bütçesi.

### VQ06 — Kamera, UI ve tutarlılık
Üçüncü şahıs gemi ölçeği, sinematik ama okunur kamera, net cephe/rota/irtifa HUD, arayüz–dünya renk bütünlüğü. Her faz başlangıç/orta/final ekran görüntüsü ile gözle kontrol edilir.

## Teknik ve kalite kabulü
- Görsel kalite iddiası **otomatik testle puanlanamaz**. Başarılı Chromium testi sadece shader, geometri, çarpışma ve regresyonu kanıtlar. 7/10 veya 8/10 ilanı ancak gerçek görüntüler ve kullanıcı geri bildirimiyle yapılır.
- Harita 1 görsel/fizik kuralları ayrı ve onaylı kalır; restart sonrası Map4 mesh/texture sızıntısı olmamalı.
- Tek oynanabilir HTML çıktısı sürdürülür; uzaktan PNG/GLTF gerekirse kendi içinde paketleme veya açıkça belirtilmiş bağımlılıklar gerekir.
- Mevcut 4–5 dakika görev, 60s savaş arenası, 300s bitiş ve 850 yerel irtifa kuralı değişmez.

## VQ02 — Mevcut değişikliğin tam dökümü
- [x] 12 ana çevre işaretinin **her birine ayrı model kompozisyonu**. Kaya kemeri, katmanlı mesa, gözlemevi anteni, düşmüş kruvazörün üçgen gövdesi, savunma dish/radar antenleri, yıkılmış gemi parçaları, rafineri tankları, fabrika kuleleri, yüksek enerji halkaları, sınır karakolu, üçlü iniş platformu, dev yörünge fırlatma kulesi.
- [x] Özel **ExtrudeGeometry poligon gövde**, mesa/erozyon sekizgenleri, geniş güneş diski ve silüeti okunur çok-katmanlı modüler form kütüphanesi.
- [x] Altı sanayi düğümünün her birine çelik vinç/truss, bakır borular, yükseltilmiş bakım platformları, enerji halkaları ve sinyal tepe lambaları. Aynı malzeme ve geometri yeniden kullanılır.
- [x] 12 hero grup × ilk kayıttan sonra tekrar yapılmayan üretim; restart sistemi değişmez.
- [x] Var olan fizik çarpışması 36 endüstri hacmi, alt geçit bonusu, kaya boğazları, 60s arena ve dört faz **değişmedi**.
- [ ] Oyuncu görsel puanlaması ve perspektif içi görüntü kontrolü.
- [ ] VQ03 profesyonel texture atlas/normal yüzey detayı, VQ04 hacimli atmosfer, VQ05 parçacık patlama/far VFX, VQ06 son kamera ve HUD cilası.

Bu aşamada 12 büyük yapıya özgün silüetler eklense de modeller hâlâ Three.js geometrilerinden procedural olarak üretilen düşük/orta detaylı gerçek zamanlı placeholder çalışmasıdır. 8/10 grafik standardı veya tam bitmiş sanat hedefi ilanı yoktur.
