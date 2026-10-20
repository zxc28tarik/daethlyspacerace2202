# Harita 4 — GFX-05 İlk Dalga: GeoSword, Rakipler ve Avcı Uçakları
Tarih: 21 Ekim 2026
Taban: `c989e3c12ee212b5fb755701c313477d5ce06749`.

## Oyuna işlenen görsel geliştirme
- Savaş/yarış boyunca görülen **14 gemi** için paylaşılan bir THREE r128 3D sanat kiti: oyuncu GeoSword, 5 rakip pilot ve 8 avcı. Bu kite özel burun-omuz-kuyruk kesitli, halka bölümlü ana gövde, farklı açılı iki gerçek extruded kanat, iki motor muhafazası ve iki parlak nozül, pilot kokpit camı, stabilize eden dikey fins, uç ışıkları, dorsal hat ve servis rayı eklendi.
- Birbirinden bağımsız **5 rakip boyama/renk şeması** ile oyuncu, normal avcı ve elit avcıya ayrılmış ayrı metal/uyarı paleti. Map4'te önceki koni/box gemi parçaları sahne ağacında kalır ancak gizlenir; yeni ayrıntılı gemi tek görünen silüet olur.
- Gövde ve kanat geometresi **bir kere** oluşturulur. 14 gemi aynı GPU BufferGeometry/ExtrudeGeometry varlıklarını ve palet başına paylaşılan PBR materyalleri kullanır. Her yeniden başlatmada ortak GPU varlıkları yanlışlıkla silinmez; yeni rakip/avcı mesh'leri bu havuzdan oluşur.
- Motorlarda `h4Gfx05AnimateCraft` ile turbo ve ritmik titreşim ölçek animasyonu. Hasar/yıpranma gösterge parçası mevcut kalkan/HP eşiği üzerinden açılır; bu, gerçek HP/hasar veya puan hesaplamasını **değiştirmez**.
- Oyuncu GeoSword'un Map1 ilk silüeti `applyPlanetaryEnvironment` sırasında yalnız Map4 aktifken gizlenir ve Map1'e geri dönüşte eski parçalar görünür hâle gelir. Kamera geçişi, otomatik kilit ve lazer mekaniği aynı kalır.

## Korunan oynanış
- Oyuncu/avcı/rakip collider yarıçapları, pilot HP, lazer hasar ve ateş algısı aynıdır.
- Harita 4 arena 60s, 300s toplam limit, 3/3/2 normal/elit avcı, +1/+3 puan, bitiş >850 irtifa, 5 rakip ve sanayi/kaya collider'ları değiştirilmemiştir.
- Modeller kozmetik; yeni hedef veya görünmez duvar oluşturulmaz. Yeniden başlatmada paylaşılan materyal ve geometri atık/toplanma/bozulma yaşamaz.

## Doğrulama ve mevcut sanat sınırı
- `tests/map4-browser-smoke.cjs`: 14 aktif görsel model, 5 farklı pilot paleti, iki sweep wing/motor, gerçek kalkan/HP geri bildirimi, ortak GPU geometri, restart ve Map1 orijinal art görünürlüğü; tüm eski performans/fizik/arena testleri.
- `tests/map4-art-baseline.cjs`: 12 GFX00 sabit kare ve devamında player/racer/elite için 3 ekstra in-engine yakından görüntü, HUD açık/kapalı. Yalnız prosedürel 3D gemi gösterilir, haricen üretilmiş görsel kurgulanmaz.
- Düşman model ve boyama malzemeleri profesyonel Blender/GLB veya baked 2K texture atlas değildir. Bu kalite dalgası gerçek 3D yüzey/palete geçiştir; kaliteli sanat varlığı üretiminin tamamlandığı anlamına gelmez.
- Ekran kartı FPS, performans kalitesi, kullanıcı 7–8/10 görsel hedefi SwiftShader yazılımsal testlerle doğrulanamaz. Görseller ve draw call metrikleri incelenerek optimize edilmeli.

## Sıradaki üretim
- GFX05-B: Birinci taraf veya lisanslı gerçek yüksek kaliteli GeoSword/player ve 2 avcı sınıfı glTF/GLB varlıkları, profesyonel ORM/normal bake atlası, tercihen üç gerçek mesafe LOD ile yeni render sanat geçişi.
- GFX05-C: Yakın plan motor ısı izi ve kıvılcım VFX, 2.5D gölgeler, kamera FOV pilot/avcı okunurluğu, GPU instancing ve draw-call bütçesi.
