# NEXT11C20G — SB-07 Zenit çizgi / poligon / doku örnekleme kalitesi

**19 Kasım 2026.** Bu adım, daha fazla gürültülü parça eklemek yerine onaylı SB-07 gerçek modelinin **çizgi kalitesini** yükseltir. Harita 1 yalnız yarış; Harita 4 B-04 ve oyun mekanikleri koruma altında.

## Teknik teşhis
- Orijinal oyun renderer zaten `new THREE.WebGLRenderer({antialias:true})`, `devicePixelRatio <= 2` ve Map4 bağımsız GFX profil sistemine sahip. Bunları ikinci kez açma, Harita 4 çözünürlüğüne veya fizik/AI kontrollerine müdahale etme.
- SB-07 detay/çizgilerinin bazıları kare kesitli 12-üçgen kutu olarak çiziliyordu; torus ve silindirlerde düşük kesit kullanılıyordu. Geometrik segmentler düşük olduğundan MSAA tek başına köşe/silüet sorununu tamamen çözemez.
- Mikro-grit dokusundaki eski güçlü 32×32 çizgi taraması uzaktan tekrar örüntüsü ve parıldama riski taşıyordu; glow 64² ve minFilter=Linear idi.

## NEXT11C20G gerçek oyun kodu
- Çizgi `line()` yardımcı elemanı: önce kare kesitli kutu, şimdi **12 segmentli yuvarlak kesitli** fiziksel çizgi. Aynı 7 materyal batch içinde; kalınlık ve çizgi uç noktaları aynı kalır.
- Motor silindirleri: **14 → 24** çevresel segment. Torus halkaları: **7×18 → 10×32** (tüpsel/çevresel). Büyük motorların dizilimi ve rengi sabit.
- Ana kanat bevelSegments **1 → 3**, iki dış dikey fin bevelSegments **1 → 3**, gömülü güverte panel kenarları **2 ince bevel aşaması**. Ana kanat, dış uç geometrisi ve motor ölçüleri korunur.
- Kokpit enine örnekleme **7 → 9**: önceki 7 uzunlamasına segmentin profili ve fiziksel clearcoat korunarak yumuşak yüzey geçişi.
- Ortak 128² PBR mikro-roughness atlasındaki kare-grid kırışıklığı azaltıldı; `LinearMipmapLinearFilter` ve 4× anisotropy yapıldı. Gümüş seramik emissive .38→.20; aşırı düz parlaklık yerine sahnedeki gerçek ışıklara tepki.
- İki prosedürel yumuşak motor halesi tek ortak atlas **64²→128²**, yeni yumuşak merkez-kenar gradyanı, trilinear mipmap, anisotropy4. Boost tepki formülü, 2 saydam sprite sayısı, 7 ana SB-07 materyal draw batch ve bütün oyun kontrolleri **değişmedi**.

## QA kapıları ve bütçe
- [x] Asıl oyun `index.html` tüm JavaScript statik sözdizimi PASS.
- [x] Mevcut Playwright WebGL testi yeni sayısal geometri kimliklerini, en az 288 glass triangles*vertex, 128² mipmap ve 4× anisotropy değerlerini kontrol eder.
- [x] Ayrı Chromium/WebGL ve tam Map1/4 regresyon workflow yeni dalda tanımlandı.
- [ ] Otomatik GitHub Actions'in gerçek PASS ve PNG artifaktları sonuç olarak incelendi. Yalnız workflow tanımlamak PASS değildir.
- [ ] Gerçek native GPU 720/1080p FPS/p95 ve yeni segmentlerin performans maliyeti ölçüldü.
- [ ] Kullanıcı yeni art / çizgi kalitesini kabul etti.
- [ ] Kullanıcı açıkça MERGE izni verdi. **Hayır, hiçbir stacked PR main'e birleştirilmedi.**

## Onaylanmış tasarım
Gümüş/beyaz + kırmızı SB-07 Zenit, uzun sivri burun, **düz süpürülmüş iki geniş yatay ana kanat ve kanat uçlarında yükselen ayrı dikey stabilizatörler**, tek koyu mavi kokpit ve arka çift plazma motoru korunur. Reddedilen kıvrımlar yok. StarBlade veya üçüncü taraf CGTrader modeli kopyalanmaz.

Sıradaki **NEXT11C20H**: Gerçek screenshot QA ve gerekirse seçici FXAA/TAA seçenekleri için ölçüme dayalı prototip, sahne geneli blur yok; kullanıcıdan habersiz global shader değişikliği ve yeni parlak parçalar yok.

Önceki: [NEXT11C20F](MAP1_NEXT11C20F_SB07_PLASMA_LIGHTING_ACCEPTANCE.md).
