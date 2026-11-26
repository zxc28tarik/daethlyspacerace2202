# NEXT11C20Y — Gerçek SB-07 gövde–kanat–motor birleşimlerinde üst yüzey normallerinin iyileştirilmesi

**19 Kasım 2026. Kullanıcı görsel kararı: orijinal 1.00× native MSAA en iyi. Öncelik FPS değil, mevcut geminin yüzey/çizgi kalitesi.**

## Kod değişikliği — yeni geometri, süs, filtre veya FPS optimizasyonu yok
- `polishLoftTopNormals(geometry,rows,cols)`: aynı polygon vertex'lerinden hesaplanan **gerçek üst yüzey boyuna ve enine teğet vektörleri** ile, yan kapak/alt yüzeyin tepe normaline karışmasını önleyecek şekilde 3 kritik geometrik bölgede gerçek vertex normal attr güncellendi:
  1. İki `HULL` gövde→kanat kökü loft: 2×5×6 = **60** gerçek üst vertex normal.
  2. İki `SECOND` kavisli ön kanat kaportası: 2×5×7 = **70** gerçek üst vertex normal.
  3. İki `SECOND` arka motor→kanat bağlantısı: 2×5×5 = **50** gerçek üst vertex normal.
- Toplam **180 üst yüzey normal vektörü**, orijinal 14 yönlü ana gövde/yatay kanat dış konturu, pozisyon, rengin malzemesi, UV ve fizik değişmeden güncellendi. İki tarafta y-up yönü normalize edilir. Alta/yana ait orijinal normaller aynı kalır. Önceki `computeVertexNormals()` yan yüzey ve kapak üçgenlerini üst yüzey uçlarına karıştırarak sert highlight şeritleri oluşturabiliyordu.
- Arka bağlantıda ayrıca bir yüzey oluşturma **winding hatası** bulundu: X boyunca artan satır ve Z boyunca artan sütun eski üst üçgeni aşağı bakacak sırada oluşturuyordu. Yalnız **2 arka loft'un triangle index sırası** düzeltildi; yeni vertex, obje veya collider yok. Gerçek üst yüzey artık motor ışığını doğru yönde karşılar.
- Onaylı SB-07 yarış silueti, iki motor, dik uç stabilizör, kırmızı yarış çizgisi, normal/boost itki ve nişangâhsız Harita1; Map4 B-04, 189/249 toplam parçalar, 7 ana malzeme batch+2 glow, 192 corridor ring/6960 rail korunur. **Renderer, FOV, pixelRatio, MSAA, PBR metal/roughness ve doku aynıdır.** Supersampling/FXAA/global blur/ek geometri yok.

## Gerçek WebGL kabul ölçümü
- `tests/map1-next11c20y-smooth-loft-normals.cjs`: render edilen gerçek HULL+SECOND birleşmiş GPU buffer'ından **180** noktanın koordinatı ve `normal` vektörünü bulur; komşu gerçek üst yüzey örneklerinden `cross(tangentRow,tangentCol)` ile hesaplanan yön ile dot ≥0.985. İki arka bağlantının gerçek **THREE.Raycaster.face.normal.y > 0.25** koşulunu da denetler.
- Önceki X **174 vertex ve 6 red/metal yüzey raycast**, W **154**, V **60**, U **30** ve R **304/304** koruma, özgün SB-07 normal/boost ve Map4 249/[6,36,200] testi, 4 ayrı 1600×900 WebGL görüntüsü aynı workflow içinde. Son HEAD testleri sonuçlanmadan tüm sistemi PASS ilan etme.
- Görsel A/B öncesi X stüdyo 1600×900 görüntülerine karşı **aynı kamera/ışık/native MSAA** ile incelenir; teknik normal testi sanat onayı değildir. Fiziksel GPU performans iddiası yok.

## Sıradaki NEXT11C20Z
Y'den sonraki görsel kalite adımı seçilmiş gemi yüzeylerinin (merkez gövde/ön burnun parlama normal geçişleri, motor üst kavisleri) dikkatli görsel incelemesi ve gerçek kusur varsa **yalnızca geometri veya vertex normal düzeltmesi**. Yeni dekor, ağır filtre veya FPS odaklı iş yok. Ana dala kullanıcı izni olmadan merge yapılmaz.
