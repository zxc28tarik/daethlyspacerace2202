# Harita 4 — GFX-05B: Gemilerin PBR Boya, Normal ve Yüzey Detayı

Tarih: 21 Ekim 2026. Başlangıç: `ee409b0ae118cd6c80b9354eb1c6516b6c6329fe` (GFX-05 tamamlanmış güncel ana dal).

## Bu üretim dalgası

- Oyuncu GeoSword, beş rakip ve sekiz avcı için daha önce GFX05'te üretilmiş, hasar/yarış fiziklerini değiştirmeyen **14 adet özgün 3D gemi** aynen korunur. GFX-05B bu sanat tabanının yüzeyine odaklanır, yeniden şekil kopyası eklemez.
- **Bir adet 256x256 tileable boyalı metal albedo atlası, bir stamped normal atlası, bir bağımsız metal yıpranma/pürüzlülük atlası** CanvasTexture'larla yalnız bir defa oluşturulur. Sekiz materyal paleti aynı üç GPU doku nesnesini paylaşır, bireysel renklerine göre çarpar. sRGB yalnız albedo, veri haritaları linear olur.
- Kaplamada hafif boyalı yüzey dalgalanması, rastgele noktalı aşınma, süreksiz eklem çizgileri ve fırçalanmış metal etkisi; normal haritada mikro kabartı vardır. Yüzeyin kendisi hâlâ prosedürel; profesyonel PBR bake değildir.
- Her gemide iki kanat kökü zırh şeridi, iki turbo motor muhafaza detayı. Mevcut ortak `BufferGeometry` nesneleri üzerinden 4 ilave Mesh çizim isteği/gemi, toplam teorik +56 draw call; tüm uçaklar görünür değilse gerçek sahne çizimi daha düşük olur.
- Oyuncu ve 5 rakibin seçilebilir renkleri, hareketli çift egzozlar, hasar göstergesi ve kamera davranışı korunur. Avcı hit radius/HP/atış hızı/AI değişmez.
- **Harita 1 etkilenmez:** grafik atlası yalnız harita 4 gemi materyallerinde kullanılır. Eski Map1 craft görünümü, neon materyalleri ve HUD kaldığı gibi kalır.

## Doğrulama / kabul

`tests/map4-browser-smoke.cjs` GFX05B'ye 14 gemi, 8 palet, üç ortak atlas, UV'li hull/wing materyal bağı, normal/roughness linear encoding, görsel-only parçalar, her gemide tam 4 yeni parça, piksel farklılığı ve tekrar başlatmada doku kaynaklarının çoğalmaması kontrollerini ekler. Mevcut Harita1/4, arena 60sn, 300sn limit, puan ve 6 kaya / 36 sanayi collider testi aynı şekilde çalışır.

`tests/map4-art-baseline.cjs`: 12 sabit kadraj, önceki arena/kanyon kıyasları + üç farklı gemi için gerçek Chromium grafik kareleri, HUD açık/kapalı. Yeni işin gerçek estetik etkisi bu karelerde değerlendirilmeli. Draw call/üçgen çıktıları SwiftShader'dır, gerçek kullanıcı GPU'sunda ölçülmüş FPS değildir.

## Sonraki işler

GFX05-C için seçici pilot GLB/PBR ORM bake, gerçek sanatçı kontrollü albedo/normal/roughness atlası, engine exhaust hareketi; daha sonra endüstri/sanayi GFX04→GFX06 büyük çevre modeli ve daha güçlü gün ışığı/kontrast kompozisyonu. Kullanıcının onaylamadığı bir kalite puanı veya AA/AAA hazır olduğu iddiası üretilmemelidir.
