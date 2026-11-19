# NEXT11C20Z — ZENİT ön gövde ve iki motor üstünde gerçek yüzey normal düzeltmesi

**19 Kasım 2026. Kullanıcı tercihi:** Orijinal 1,00× WebGL MSAA en iyi görünüyor. Öncelik FPS değil; birleşik, iyi çizilmiş, net gemi hatları.

## Oyun modelindeki gerçek değişiklik
- `customHull()` içindeki 14 köşeli, **kullanıcının onayladığı uzun kama burun** üzerindeki yan yüzlerin üçgen indeksi dışarı yönlenir hale getirildi. Öncesinde hull yan üçgenlerinin sıralaması içe bakıyordu; `THREE.DoubleSide` ile görünür olmasına rağmen yüzey/ışık yönleri ters kalıyordu. **Gövdenin 9 istasyonunun hiçbir x/y/z koordinatı, burnun uzunluğu veya silueti değişmedi.** Ön ve arka kapağın üçgen indeksleri değiştirilmedi.
- Aynı 9 halka istasyonunun üst tarafındaki **6 roof noktası ×9 =54** adet vertex normal, gerçek komşu yüzey teğetinden hesaplanarak sivri gövdenin üst ışık bandını daha sürekli hale getirir. Alt kanat/yan yüz keskinliği korunur.
- İki `buildIntegratedEngineSpine(side)` kaportası, mevcut **6 uzunluk istasyonu ×11 kesit noktasından sadece üst 7 profil noktasında ×2 =84** adet çatı normali yeniden hesaplar. Motor kaportalarının eski indeks sırası da tıpkı burun gibi içe bakıyordu; aynı mevcut çizgiler için iki tarafta dışa bakan topolojiye çevrildi (ön/arka kapak yönleri buna bağlı düzelir). C20U'nun kavisli metal ve kırmızı üst boya şeridi olduğu gibi kalır.
- **Toplam 138 güncellenmiş gerçek roof normal**, 4 yönde gerçek WebGL yüz üçgen orientation kontrolü; yeni vertex/emit, uçak parçası, motor, reflektör, texture, metal/roughness, shader, FXAA/blur, AA örnekleme seçeneği veya FPS kontrolü yok.
- **Korumalar:** SB-07 **189 original builder primitive**, 7 material batch+2 engine halo, yarışta silahsız, orijinal kanat ve dik kanat uçları, C20W boya, C20V kanat kökleri, C20X ön/arka shoulder, C20Y 180 upper normal, Map4 B-04 249 ve [6,36,200] colliders, koridor 192 ring/6960 rail segments/304 seamless joints.

## Gerçek WebGL kabul prosedürü
- `tests/map1-next11c20z-nose-engine-roof-normals.cjs`: sabit 14-gon/engine kesit verilerinden bağımsız olarak üretilen 54+84=**138** üst vertex `position` ve `normal` değerini **görüntülenen, birleştirilmiş HULL WebGL buffer** üzerinden okuyup komşu analitik yüzey teğetiyle dot>0.985 doğrular. Dört ayrı gerçek GPU üçgeninde (burun sağ/sol dış, iki motor roof) normal yönü fiziksel dışa/up olmalı.
- 4 açıdan gerçek **1600×900** native 1× MSAA SB-07 stüdyosu: ön/arka/üst/arka-çapraz. Sadece X/Y eski görüntüleriyle aynı kamera ve aydınlatma karşılaştırması güvenilir; generative görsel değildir.
- Özel workflow: `map1-next11c20z-nose-engine-normals.yml`. SB-07 eski playable/boost, U30 motor boya, W154 kanat, X174+6, Y180, R304 ve Map4 savaş/fizik testleri ile birlikte; full `map-browser-smoke.yml` de Z testini içerir.
- Test başarısı teknik doğrulama olup **kullanıcının estetik onayı değildir**. Native GPU FPS artışı iddia edilmez. Özel son HEAD ve full smoke ayrı sonuçlanmadan tüm sistemi PASS ilan etme.

## Sıradaki NEXT11C21A
Yeni Z ön gövde ışık bandını, X/Y görsellerindeki gibi gerçek WebGL ile yan yana incele. Yalnız gerçek kusur kalmışsa orijinal silueti koruyan yerel normal/kenar iyileştirmesini uygula; ekstra dekor veya kör performans optimizasyonu yok. Kullanıcı açıkça onaylamadan hiçbir stacked DRAFT PR ana dala birleştirilmez.
