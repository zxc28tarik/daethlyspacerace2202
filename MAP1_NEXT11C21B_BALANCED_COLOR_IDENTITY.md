# NEXT11C21B — SB-07 ZENİT BALANCED Renk Kimliği / Gerçek WebGL Estetik Kabulü

**20 Kasım 2026 — Kullanıcı kendi kararlarımızla doğrudan renklendirme geliştirmesine başlamamızı istedi.**
Kullanıcı onaylı SB-07 dış siluet, geminin orijinal **1× MSAA** görüntüsü, Map1 yarış ve Map4 savaş korunur. FPS veya yeni parça sayısı hedeflenmez.

## Tasarım kararı: Balanced — "premium yarış prototipi + teknik metal"

Sabit kullanıcının sevdiği orijinal renklere müdahale etmeden, dört mevcut mesh-malzemesi için **konumsal pigment katmanı**:
1. **HULL, ana beyaz-gümüş seramik (base `#DBE4EA` korunur):** uzun ön kama burun daha temiz seramik, motor yakınındaki açık yüzeyler çok hafif soğur. Çatı pigmenti kademeli akar, sert sınır olmaz. C21A'nın farklı satin fiziksel kaplaması ve original emissive=.20 aynen.
2. **SECOND, koyu mavi işlenmiş metal (`#566675` korunur):** metal daha tok ve mavi-çelik karakterli; dikey metalde ve açık kanat köklerinde yumuşak kontrast. C21A brushed 128×128 atlas/physical PBR korunur.
3. **RED, yarış kırmızısı (`#C43838` korunur):** kırmızı artık yeni alanlara yayılmaz; mevcut şeritlerin renk karışımında G/B hafif azaltılarak daha okunur, daha tok yarış kırmızısı vurgusu sağlanır. Burun/kanat uçlarında geometrik akışa bağlı küçük değişim. Kırmızı geometri değişmez.
4. **DARK, iç mekanizma (`#15202C` korunur):** donuk siyah yerine koyu soğuk metal derinliği, motor çevresinde gövdeyle ayrım net kalır.

**GLASS `#18394F`, ORANGE `#FAA15D` ve PLASMA `#6DD9FF` orijinal tutulan üç renktir.** Aşırı enerji parlaması veya amber/kırmızı kalabalığı yok; mevcut RGB ve halo aynen.

## Gerçek HTML üretim mantığı

`h4Ship20ZenitBuild` içinde `balancedTint(key,x,y,z)`: 3D vertex koordinatından `nose`, `wing`, `engine`, `roof` süreklilik ağırlıklarını hesaplar. Yalnız mevcut **HULL / SECOND / RED / DARK** malzemelerinde `vertexColors=true`; aynı birleştirilmiş non-indexed geometride `color Float32BufferAttribute` açılır. **Yeni mesh veya çizim komutu, shader, doku, geometri, decal, silah veya additional light yok**. Malzemelerin hex ana renkleri, tüm PBR roughness/clearcoat değerleri, 7 mevcut render batch, toplam 189 kaynak parça ve engine glow sayısı değişmez.

Bu renklendirme işlemi malzeme bazında değil, gerçek modelin her vertex koordinatında süreklidir: komşu yüzeyler aynı koordinatta aynı tint'i alır; tesadüfi panel/kare moiré yaratmaz. Kullanıcının seçtiği native 1× MSAA varsayılanı korunur. Ufak renk attribute belleği doğar, ekran kartı FPS artışı iddia edilmez.

## Test kabul kapıları

- Yeni `tests/map1-next11c21b-balanced-colors.cjs`: gerçek Chromium/Three r128 GPU geometrisinde **dört orijinal batch'in renk attr'ı**, color count=position count, her kanalda güvenli 0.77–1.11 arası pigment çarpanları, yüzlerce gerçek pigmentli vertex, orijinal yedi materyal base HEX, üç korunan GLASS/ORANGE/PLASMA `vertexColors=false`, 189 SB-07, B04 Map4 249, [6,36,200] fizik, 7 mesh+2 halo, orijinal WebGL MSAA ve 4×1600×900 gerçek stüdyo ekranı.
- Önceki `map1-next11c21a-native-pbr-finishes.cjs` seramik/gunmetal atlas verisi ve RED/GLASS material, özgün `map1-next11c20-sb07-zenit.cjs` uçuş/boost; C20R 304/304 ray seam tests.
- Tam Map1/Map4 browser smoke yeni C21B testini çalıştırır; dedicated git workflow özel görsel/araç testini tekrarlar.
- Gerçek 1600×900 A/B eski C21A baseline ile aynı kamera/ışık/MSAA'da karşılaştırılmalıdır. **Teknik piksel farkı estetik üstünlüğün otomatik kanıtı değildir**; fazla koyu, aşırı oyuncak veya görüşü bozucu etki varsa pigment aralığını küçült. Kullanıcı açık onayı olmadan PR merge yok.

## Sonraki geliştirme

**NEXT11C21C:** C21B gerçek görüntü farkına bakarak kırmızı stripe okunurluğunun estetik son kontrolü; gerekiyorsa yalnız mevcut renk maskesi azalt/artır, yeni decal veya parça yaratma. Ardından teknik/motor renklerinin aşırı enerjiye dönüşmemesini kontrol (C21D), son renk kilidi (C21E). Tam oyun regresyonu ve kullanıcı görsel tercihi temel kapıdır.
