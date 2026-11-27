# MAP2-47 — Harita 2 şehir prefabriklerini ayrıştırma

Durum: İlk dilim. Harita 4 tamamen bağımsızlaştırılmadı.

## Uygulanan
- Harita 2 şehir panoramasının 48 orijinal CITY02 bina ölçüsü, Harita 2 içinde matematiksel olarak tekrar oluşturuluyor.
- Geniş teknik koridorun 48 bina tipi aynı kutu geometrisi, aynı 6 gövde rengi/malzeme ayarı ve aynı çatı malzemesini Harita 2 kaynaklarından kullanıyor.
- Harita 2'nin MAP2-41 dünya şehir cephesi ile MAP2-42 geniş teknik koridoru doğrudan canlı h4City02DistrictGroup grubunu okumuyor.
- Harita 1 ve Harita 4 kodu korunuyor. Geçit ve fiziksel çarpışma kuralları değiştirilmedi.

## Kalan doğrudan bağımlılıklar
1. MAP2-13: h4IndustrialGroups içinden altı sanayi istasyonu.
2. MAP2-15: h4City02DistrictGroup içinde ayrıntılı tam şehir bölgesi kopyası.
3. MAP2-16: h4WorldLandmarks içindeki simgesel yapılar ve planetaryWorldRegions[3] koridor parçaları.
4. MAP2-17: planetaryWorldRegions[2] sanayi görsel kiti (985 mesh).
5. applyPlanetaryEnvironment içinde Harita 2 seçildiğinde gizlice buildPlanetaryWorld() çağrısı ve dönüşüm için Map4 koordinat/çerçeve yardımcıları.
6. H4_MESHES/H4_MATERIALS ve ortak yardımcılar için kaynak modül sınırı henüz yok.

## Kabul koşulları
- Harita 2 seçimi Map4 dünya kurucusunu çağırmayacak.
- Görsel, doku/cephe, çarpışma hacimleri, çoklu geçitler ve bot rotaları korunacak.
- Harita 1 ve 4 regresyon testleri, gerçek tarayıcı/WebGL ekran görüntüleri, FPS/RAM ölçümü geçecek.
- Sadece statik metin testiyle tam bağımsızlık ilan edilmez.
