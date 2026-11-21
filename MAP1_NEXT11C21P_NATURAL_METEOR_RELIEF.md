# NEXT11C21P — Harita 1, orijinal meteor yüzeylerinde doğal ışık derinliği

**Taban:** C21O / [PR #111](https://github.com/zxc28tarik/daethlyspacerace2202/pull/111). Yeni bir meteor modeli yapılmaz, fizik değişmez.

## Neden bu aşama?
C21O'da yol paleti yakın bakışta görünse de normal yarış kamerasında yalnız **63 piksel** fark üretti. Bu sefer oyuncunun kaçındığı **320 mevcut meteorun** kendisine odaklanıyoruz. Fazla metalik/neon/kristal görünüm değil, hafif doğal kayalık yüzey gölgelemesi.

## Kaynak kodu ve sıkı sınır
- **320 mevcut `DodecahedronGeometry(radius,1)`**; SMALL 128, MEDIUM 128, LARGE 64. Her kayanın orijinal vertex `position` buffer'ı, yarıçapı, rotasyonu, başlangıç RNG'si ve çarpışma sistemi aynı.
- `tintAsteroidFacets` C21H'nin eski deterministik yüz pigmentlerini hesaplamaya devam eder. C21P, aynı üçgenin mevcut vertex konumundan **object-space üçgen yüz normal yönünü** okur ve sadece zaten var olan `color` vertex buffer pigmentini `1 + 0.19 × clamp(0.25*nx+0.89*ny+0.38*nz, -1, 1)` kadar açık/koyu yapar.
- Söz konusu yön, fiziksel normal veya ışık yönü güncellemesi **değil**, kayaya ait stabil **pigment ton varyasyonu**. Dönen kayada sabit taş şeridi hissi verir.
- Malzemelerin `MeshStandardMaterial`, doğal stone roughness `.91–.94`, metalness `.035–.055`, eski soft edges `<=.18`, emissive değerleri aynı. Parçacık, doku, outline, ışık, geometri, shader, drawcall veya collider **eklenmez**.
- Kullanıcı tarafından eski hâline döndürülen **49 orijinal mor ödül kutusu**, 97 bariyer, 8 enkaz, 192 koridor halkası/10 batch, 5 sektörlü yol, SB07 189 ve Map4 249 parça, performans ve oynanış kuralları korunur.
- Daha önceki kullanıcı tercihi gereği başka bir modelden/haricî kaynaktan tasarım kopyası alınmaz.

## Kabul
1. `tests/map1-next11c21p-meteor-facet-relief.cjs`: gerçek Chromium/WebGL 1600×900 **mevcut yarış kamerası** ve aynı sahne. Sadece dört ORİJİNAL büyük meteoru 240/330/440/555 mesafede 3D kadraja geçici yerleştirerek eski C21H pigmentlerini **matematiksel olarak C21P çarpanını kaldırıp** yeniden kurar. Aynı kamera ve objelerle iki PNG çekilir, `gl.readPixels` piksel farkı, çizim çağrısı, GL hatası assert edilir. Test sonunda renk buffer ve transformlar geri alınır.
2. 320 asteroidin orijinal geometrisi 5 örnek üzerinden birebir karşılaştırılır, bütün taşlar için class, mevcut `vertexColors`, pürüz/metal/kenar sınırları doğrulanır.
3. Harita 4'te 249 parçalı gemi/6-36-200 collider ve Map1'e geri dönüş test edilir.
4. C21O/N/M/L/K/J/I/H/G6 + C20O/P/Q/R + SB07 regresyonları; 74+ aşamalı büyük Map1/Map4 smoke; tam çevrimdışı HTML artifact.
5. PASS kullanıcı estetik onayı veya native GPU FPS garantisi **değil**. Kullanıcının açık onayı olmadan `main` merge **yok**.

## Sonraki
Kadroda meteor görünümü gerçekten okunaklı mı A/B PNG ile değerlendirilir. Yeterince fark yoksa yeni mesh, halo veya metal parça yerine pigment dengesi ayarlanır.
