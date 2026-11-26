# NEXT11C20V — SB-07 ZENİT gövde–kanat kökünde gerçek tek parça fillet geçişi

**19 Kasım 2026 · Öncelik görsel kalite; orijinal 1× MSAA aynen korunur.**
C20U / PR #86 üzerine stacked DRAFT dal. Ana dala kullanıcı açık onayı olmadan merge yapılmaz.

## Gerçek model değişikliği
- Kullanıcının onayladığı geniş iki kanat, ince uzun gövde, ön kama burun, dik kanat uçları ve çift motor **aynı kalır**.
- Daha önce her kanat gövde kökünde çizilen ve fiziksel yüzey yerine ince/ayrık bir SECOND çubuk gibi okunan birer `line('SECOND',...)`, her tarafta **tek birleşik HULL geometri** ile değiştirilir.
- Yeni `buildUnifiedWingRoot(side)` 5 uzunlamasına istasyon × 6 enine kontrol çizgisi üzerinden mevcut 14 yönlü **gerçek gövde hullRoofY** değerinden başlar; gövde merkezine yakın üst deri gerçek yüzeye otururken kanat yüzeyine doğru düzenli bir loft halinde alçalır. Üst ve alt skin ile uç/yan kapamalar kapalı bir bağlantı hacmi oluşturur. Kanat dış silueti taşmaz; dekoratif panel sayısı artmaz.
- Orijinal metal/kırmızı kanat boyaları, burun, cam, motorlar ve C20U kaportaları bozulmaz. 1/1.25/1.5/2x AA testleri geçmişte tanısal kalır; **canlı oyunda yalnız 1x MSAA**.
- İki eski SECOND seam line yerine iki gerçek HULL fillet emit: kaynak primitif **189**, 7 ana malzeme batch + iki glow sprite korunur. 192 koridor halkası, 6960 ray segmenti, orijinal camera / AI / fizik / Harita4 B-04 (249) korunur.

## Gerçek kabul kanıtları
- `tests/map1-next11c20v-wing-root-fillet.cjs`: 2 yan ×5 istasyon ×6 kolon = **60 gerçek vertex eşleştirmesi** (HULL birleştirilmiş GPU geometri attribute'undan), 0.0001 altında hata; gerçek gövde–kanat kenar yüksekliği farkı en az .12 birim. İki yeni fillet ve iki kaldırılmış çizgi, unchanged 189 parçalık build, normal UV/AA, orijinal oyun 30 C20U motor boya açıklığı, Map4 [6,36,200] kontrolü.
- **Dört gerçek 1600×900 WebGL gemi stüdyosu**, GL readPixels/render counts ve normal Map1 playable + Map4 B-04 QA (C20U testinin başarı koruması). Biriktirilen kanıt orijinal 1× çözünürlükte; oyuncunun estetik incelemesine açıktır, sentetik ImageGen resim değildir.
- Özel `.github/workflows/map1-next11c20v-wing-root.yml` ayrıca C20U, özgün SB-07 ve C20R 304/304 birleşim testlerini çalıştırır. Tam browser smoke yeni V testini de içerir.
- Son HEAD özel ve tüm browser smoke CI bitmeden PASS sayılmaz. SwiftShader ve otomatik çizim ölçümü, oyuncu gerçek GPU/uzun oynanış FPS kanıtı değildir.

## NEXT11C20W
Görüntü kabulünden sonra üst kanat boya ve bağlantı hatlarını *yeni küçük parça üretmeden* yüzeye oturtarak optimize et; çizgi titremesi varsa gerçek z-fighting / geometri çöz. İzinsiz merge yok.
