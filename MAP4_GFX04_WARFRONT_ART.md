# Harita 4 — GFX-04 Savaş Arenası Görsel Yükseltmesi
Tarih: 20 Ekim 2026. Taban: `da85d1d2d8b8c353445b351ccf8df6935c5a7a82`.

## Kodlanan görüntü
- Merkez açık savaş cebi: hedefleri kapatmadan yanlara çekilmiş yıkıntı dizileri, iki navigasyon direği ve boş merkez.
- Batı kruvazör enkazı: birbirinden ayrılmış büyük ana omurga gövdeleri, geniş iki kanat, iki yan motor nozulu, kopan gövde levhaları, sıcak yanık metal, parçalanmış antenler.
- Doğu elit savunma: iki büyük savunma kulesi, iki radar çanağı, uyarı başlıkları, çevre bunkerları ve merkez zırhlı set.
- Sanat varlıkları mevcut Three.js prosedürel geometrisidir; profesyonel dış GLB üretimi değildir. Mevcut 12 özgün yer işareti ve önceki W04 warfront setleri silinmedi. Görsel kalite nihai değildir.

## Oynanış korunur
- İkinci faz kesin 60 saniye; 3 açık + 3 enkaz + 2 elit avcı, normal +1 elit +3 gerçek imha puanı.
- Yeni objeler tamamen `visualOnly`; görünmez fizik çarpışması, AI engeli veya hasar eklenmedi.
- Harita 1'in görünümü değiştirilmedi. Tek sefer scene yaratımı ve restart sızıntısına karşı test var.

## Kontrol
- `tests/map4-browser-smoke.cjs`: üç GFX04 görsel cep, materyal/form çeşitliliği, collider sayısı, testler, yeniden başlatma ve Map1.
- `tests/map4-art-baseline.cjs`: eski 12 sabit kadraj + 3 canyon yakın + 3 Hud'siz canyon + 6 yeni savaş görüntüsü.
- GitHub CI ve indirilebilir çevrimdışı tek HTML release.
- Son kullanıcı kalite puanı ve donanım FPS ölçümü hâlâ açık.

## Sonraki üretim
- Kruvazör için Blender/GLB ana modeli ve gerçek PBR hasar atlası.
- Üç savaş cebi için benzersiz gerçek enkaz kümeleri ve aktif patlama/metal hasar izi.
- GFX04 savaş VFX ile performans bütçesi; oyuncu/AI hedefleri sis ve yapılar arkasına gizlenmemeli.
