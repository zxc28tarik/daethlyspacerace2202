# Harita 4 — GFX-03B: Çakışan Sanat Katmanlarını Temizleme ve Görünürlük

Tarih: 20 Ekim 2026. Taban commit: `9cfa7526d09e3b28e41d6c96ec1847c204e06a20`.

## Gerçek üretim
GFX-03 ve GFX-01B tamamlandığında üç ilk vadi anıtında birbirinden bağımsız şu sahne katmanları aynı anda çiziliyordu: W01 erken basit dekor, VQ02 eski signature silhouette, GFX03 heykelsi büyük geometri, GFX01B GLB üç LOD. Bu görsel parazit ve tekrar eden sütun/üst üste binen radar üretiyordu.

- **GFX03B W01 izolasyonu:** Her landmark'ın eski W01 geometri parçaları artık `MAP4_LEGACY_W01_*` adlandırılmış parent'a alınır. Yalnız Canyon'daki 3 hero mekânda bu parent görünmezdir; 9 diğer landmark'ta korunur. Önceki source-level asset'ler ve sayaçları silinmez.
- **GFX03B VQ02 izolasyonu:** Üç canyon hero'nun VQ02 signature parent'ı görünmezdir; GFX03 heykelsi parent kalır. 12 VQ02 signature sayacı ve görsel kontratı korunur.
- **Gerçek GLB radar uyumu:** Gözleme anteninin GFX03 çanak, rim ve lensi, yalnız `observatory_module` GLB başarıyla yüklendikten sonra görünmez olur. Yükleme hatasında eski çanak görünür kalır. Kızıl Kaya'da daha önce uygulanan GLB portal değişimi aynı ilkedir.
- **Görüş koridoru:** W02 yakın çevrede ilk üç landmark'ı kısa mesafede kapatan birkaç kozmetik kaya görünmezleştirilir. 226 yakın/uzak çevre nesnesi ve collider haritaları değişmez. Fiziksel kaya geçitlerine dokunulmaz.
- **Temas gölgeleri:** 3 canyon hero'nun yumuşak zemine oturma gölgesi, eski W01 merkezinden GFX03 gerçek büyük kütle koordinatlarına taşındı. Dışarıdaki 9 sitede gölgeler aynı kalır.
- **Harita 4 HUD:** Merkez üstte küçük bölge/rota paneli, sol üstte daraltılmış hız/sıra, sağ üstte eski tam genişlikli sıralama bandı yerine sağa yaslanan dar avcı sıralaması; alt sağlık/skor daha hafif; açık gökyüzünü kaplayan cyan shield ring daha düşük opaklıkta. Uçuşta 300 sn, 60 sn avcı, puan, rota ve uyarılar gizlenmez.
- **Harita 1 izolasyonu:** Bu CSS yalnız `body.map4-composition` durumunda etkin. Harita 1'e dönüşte class kaldırılır, hiçbir Map1 üst paneli değişmez.

## Test / delil
- `tests/map4-gfx01-offline.cjs`: 3 hide legacy, 3 hide VQ02, 3 loaded radar primitive, LOD/cache/GLB, iki harita için arayüz class izolasyonu ve HUD boundingbox.
- `tests/map4-browser-smoke.cjs`: 60 saniye savaş, 300s limit, fizik/puan/AI ve Harita 1 regresyonu.
- `tests/map4-art-baseline.cjs`: Mevcut 12 sabit screenshot + 3 HUD-on canyon hero + 3 fotoğraf modunda HUD'siz heykel görüntüsü; renderer.info karşılaştırması.
- CI/Release: tüm Chromium kontrolleri başarılı olmadan `main` merge yok. İndirilebilir tek offline HTML commit'e bağlı release üzerinden verilir.

## Sınırlar ve sonraki iş
Bu dalga profesyonel sanat modellerini sıfırdan üretmez. Kodla oluşturulmuş GFX01B GLB'lerin çok yüzeyli görünümü hâlâ placeholder sanat standardındadır. Sonraki paketler: daha özgün kaya kütle biçimleri ve uçuş yönüne uygun gerçek büyük forma sahip Kızıl Kaya Kapısı; Düşmüş Kruvazör ve savunma hattı GFX04 hero model dönüşümü; tam PBR texture/normal/ORM sanat varlıkları; kamera ve radar nişangâhının son kullanıcı oynanış incelemesi.

Performans hedefi yalnız sentetik Chromium ölçümüyle onaylanamaz. Bu dalganın amacı ekran içi okunabilirlik ve tekrarları azaltmaktır.
