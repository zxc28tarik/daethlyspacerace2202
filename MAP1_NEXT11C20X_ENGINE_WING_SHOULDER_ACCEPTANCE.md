# NEXT11C20X — SB-07 ZENİT ön kanat omuzları ve arka motor–kanat bağlantılarında tek parça 3B yüzey

**19 Kasım 2026. Kullanıcının kesin seçimi: orijinal 1.00× MSAA. Amaç FPS artırmak değil, gerçek geometri ve görsel bütünlük.**

## Uygulanan gerçek oyun değişikliği
- Her iki ön kanatta eski **SECOND düz/kutu omuz kaplaması** + yanında/üstünde bağımsız kalıp gibi görünen **RED kutu şerit** birer emit yerine birer emit olarak **5 boylam × 7 enine kapalı, incelen kanat omuzu SECOND loft** ve gerçek kıvrımlı üst yüzeyi takip eden **9×3 RED boya filmi** ile değiştirildi.
- Omuz metali alttaki gerçek kanat y≈-.112 üzerine y=-.106 kenarlarda; orta bölgede önceki kaporta yaklaşık y=-.01 yüksekliğini koruyup dışta incelir. RED boya metal y değerini aynı analitik eğriden hesaplar, **.012 birim** z-fighting önleyici küçük boya açıklığı; bağımsız kalın/kısmen taşan blok değildir.
- İki arka motor–kanat bağlantısındaki eski dikdörtgen **SECOND box** yerine her biri **5 x-istasyon ×5 enine örnekli, altı kapalı ve uca doğru incelen aero bridge**, yine tek eski emit karşılığı bir yeni emit. Kanadın dış konturu, kalın/ince tasarımı, dik kanat uçları, motor çiftleri ve savaş dışı kimliği aynıdır.
- **Altı eski authored nesne = altı yeni geometrik karşılığı:** Her iki yandaki ön SECOND/RED ve arka SECOND değiştirilir; **SB-07 189 parça**, yedi malzeme grubu +2 motor halo korunur. Sonradan dekor, silah, shader, ışık, postprocess, blur, FXAA, süpersampling, FPS bütçe modu yok.
- B-04 Map4 modelinin **249** parçası, [6,36,200] fizik ve silah/AI/oyuncu/harita mantığı değiştirilmedi. C20U motor üstü, C20V gövde-kanat kökü, C20W ana kanat RED film/flap inlay da bozulmadan korunur.

## Gerçek WebGL kabul ve kısıtlar
- `tests/map1-next11c20x-shoulder-aft-skins.cjs`: gerçek GPU'ya yüklenmiş, birleştirilmiş SECOND/RED buffer içinden iki yan **70 SECOND ön omuz tepe köşesi +54 RED film köşesi +50 SECOND arka bağlantı köşesi =174 gerçek 3B nokta**, xyz hata <0.0001. İki tarafta 3'er gerçek WebGL raycast ile boyanın metalden z-fighting yapmayacak kadar ayrılması ve floating görünmemesi 0.004–0.028 birim kabul.
- Önceki W **154**, V **60**, U **30**, R **304** gerçek geometri ve Map4 QA testleri aynı özel Chromium/Three r128 akışında tekrarlanır. Gerçek oyuncu SB-07 normal/boost uçuşu, 8 adet eski kanat boya raycast, son gece gözden geçirme ve 4× 1600×900 **gerçek 1× MSAA** gemi stüdyo PNG (ön, arka, çapraz, üst) üretilir.
- `.github/workflows/map1-next11c20x-shoulder-skin.yml` özel QA; full `map-browser-smoke.yml` X testini de çalıştırır. Son HEAD özel CI tamamlanana kadar PASS denmez; full smoke ayrı kontrol edilir. Grafik farkı kullanıcı estetik onayına açıktır.
- Render 1× orijinal MSAA kalır, 1.25x/1.5x/2x geçmiş deneyler sadece tarihî kanıttır. Native ekran kartı FPS iddiası yok.

## Sıradaki NEXT11C20Y
Gerçek 1600×900 ön, üst ve arka-çapraz ekranları önceki W ile aynı kamera karşılaştır; gövde/kanat/motor birleşiminde üst üste binen son sert normal/parlama alanlarının daha rafine aydınlık-gölge sürekliliğini test et. **Görsel kalite ve gerçek yüzey birleşimi**, yeni dekor parçası değil. Kullanıcının açık onayı olmadan PR merge yok.
