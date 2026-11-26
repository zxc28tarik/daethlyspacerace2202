# NEXT11C21F — SB-07 ZENİT gerçek yarış kamerası / parlama doğrulaması

**20 Kasım 2026.** Dördüncü stüdyo kamerası (üst) üzerinde %52,1 beyaza doygun gemi pikseli ölçüldü. Bu görüntü güçlü stüdyo ışığı altında alındığından, oyunun kendi yarış kamerası için aynı sonuç varsayılmaz.

## Karar

Gemiye yeni ışık/renk, parça, postprocess veya AA eklemiyoruz. C21B ana Balanced boya, C21C kırmızı yarış akışı, C21D mavi çelik motor kimliği ve C21E dört açı incelemesi korunur. Önce gerçek Map1 normal/boost oyun kamerasının WebGL kareleri test edilsin.

## Teknik uygulama

- `tests/map1-next11c21f-game-camera.cjs` gerçek `index.html` sayfasını Chromium/Three r128 altında çalıştırır; start butonuyla gerçek Map1 yarış durumuna geçer.
- Aktif oyun `scene` ve `camera` ile 1600×900 framebuffer normal + boost kareleri ve HUD dâhil ekran görüntüleri alınır.
- Mevcut `h4Ship20ZenitVisualTick` yalnız QA içinde gerçek boost koşuluyla çağrılır; motor `PLASMA` ve `ORANGE` orijinal normal/boost tepkileri denetlenir.
- Aktif SB-07'nin 3D world-box köşeleri projeksiyonla ekrana taşınır; çerçeve içindeki parlak ve RGB doygun piksel sayıları raporlanır. Bu kapsama alanı **yalnız gemiye ait maske değildir**: arka planı da içerebilir, bu nedenle sonuçlar uyarı/teşhis niteliğindedir.
- Map1 189 parça, gerçek 1× native MSAA, Map4 249 parça ve [6,36,200] fizik alanı korunur.

## Kabul kapısı

Dedicated `.github/workflows/map1-next11c21f-game-camera.yml`, geniş `map-browser-smoke.yml` ve önceki C21C–C21E testleri gerçek Chromium üzerinden kontrol edilir. CI başarılı olmadan PASS yazılmaz. Eğer oyun kamerasında da kaybolan seramik ayrıntıları görülürse yalnız tespit edilen kamera/ışık alanında minimal revizyon planlanır; stüdyo fotoğrafı için gemi baştan boyanmaz.

PR önceki C21E üstünde DRAFT; kullanıcı açık onayı olmadan merge yok.
