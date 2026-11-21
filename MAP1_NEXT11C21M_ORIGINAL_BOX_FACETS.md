# NEXT11C21M — Orijinal mor ödül kutusunda yüzey derinliği

**Taban:** NEXT11C21L [PR #108](https://github.com/zxc28tarik/daethlyspacerace2202/pull/108). Bu paket başka bir ödül kutusu tasarımı değil; oyuncunun seçtiği **eski kutu** aynı geometri ve işlevle kalır.

## Neden?
C21G6 eski kutuya dönüldü, C21L yıldız/bariyer/ödül ışığı dengelendi. Hâlâ 34×34×34 mor küpün bütün yüzleri aynı yekpare tonda kalabiliyor. C21M sınırlı pigment farkıyla altı **mevcut** yüzü daha okunabilir hâle getirir. Ek atom halkası, yeni kristal, metal çerçeve, hareket, partikül, decal, ışık veya mesh yok.

## Tam kod farkı
- Orijinal **BoxGeometry(34,34,34)**: yalnız 24 mevcut vertex için deterministic `color` attribute (RGB) eklendi; `position`, `normal`, `uv`, indeksler ve 12 üçgen **aynı**. Materyalde `vertexColors:true` kullanılıyor, mevcut `MeshStandardMaterial` ve alpha/.82 korunuyor.
- Var olan **altı yüz** için birbirinden hafif farklı, bilinçli mor ışık profilleri (+X,-X,+Y,-Y,+Z,-Z). Tepede az daha aydınlık, alt yüzde az daha koyu. Altı yüzden bağımsız bir parça yok, geometri ya da fiziksel kabartma yok.
- Mevcut `0x583895` mor yüzey rengi, C21L roughness/emissive, kenar `EdgesGeometry(BoxGeometry(36,36,36))`, iç `OctahedronGeometry(9)` ve rotasyon/pulse olduğu gibi durur.
- 49 kutu aynı **paylaşımlı BoxGeometry + material** kullanır. **49 ödül, 320 meteor, 97 bariyer, 8 enkaz**, 2600 yıldız, SB07 189 parça ve Map4 249 parça korunur.
- Hiçbir RNG, toplama mesafesi `radius=49`, `HYPER_TURBO`/`SHIELD`/`ENERGY`, turbo/manuel boost/lazer, gemi yönlendirme, AI, collider, fiziksel rota değiştirilmez.

## Gerçek QA
- `tests/map1-next11c21m-box-facets.cjs`: Real Chromium/WebGL 1600×900; aynı oyun kamerasında geçici konumlanan **aynı eski kutu**. Solda tüm var olan yüz vertex tonları nötr (C21L görseli), sağda altı yüzün pigmenti aktif. İki karede oyun kamera/gemi/obje pozisyonları eşit; test sonunda eski konum ve yeni renk attribute yüklenmesi geri alınır.
- A/B `gl.readPixels` piksel farkı, GL hata sıfır ve aynı drawcall zorunlu. 24 position/normal, 36 index, mor kutu 34×34×34 / 49 `radius`, 6 ayrı yüz tonu, aynı paylaşılmış GPU obje, Map4 izolasyonu ve Map1 dönüşü assert edilir.
- C21L/K/J/I/H/G6 + SB07 + C20R regresyonları ayrı CI adımlarında. Güncel tam çevrimdışı oynanabilir HTML + eski/yeni aynı kamera screenshot ZIP içinde.
- Kapsamlı `map-browser-smoke` testi ayrıca tetiklenecek; reddedilmiş C21G–G5 atom/kristal beklentileri **C21M'de de atlanır**.
- PR ana dala **kullanıcının açık onayı olmadan birleştirilmeyecek**. CI başarı sonucu veya piksel farkı, kullanıcının 7–8/10 estetik onayı ya da donanım FPS kanıtı değildir.

**Sonraki:** Gerçek A/B fotoğrafını kontrol et; fazla katmanlı veya tek renkli duruyorsa yalnız bu pakette yüzey tonunu ayarla; başka şekil/model üretme.
