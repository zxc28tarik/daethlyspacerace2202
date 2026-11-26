# NEXT11C20W — Kanat üstü kırmızı boya ve kontrol yüzeyi konturunun 3B yüzeye oturtulması

**19 Kasım 2026. SB-07 kullanıcı tarafından onaylanan orijinal siluet. Asıl hedef görsel kalite; FPS/1.25x-2x AA optimizasyonu değil.**

## Tamamlanan gerçek oyun kodu
- Eski her kanat `wingDeckPlate('RED',..., .016)` ile çizilen, 0.027 kalın bevel extrude kutu/levha görünümüne sahip yarış şeridi **aynı dört sınır koordinatı** korunarak 17 uzunlamasına ×3 enine gerçek üçgenli, tek ve ince **RED boya yüzeyine** dönüştürüldü. İki tarafta her biri tek `emit` olarak 189 parça bütçesine sayılıyor.
- Üst yüzey yeni y değeri **-.096**: eski ekstrüde boya levhasının ölçülen tepe konumunu korur ve altında mevcut HULL/SECOND panellerinin ölçülen üst y=-.112 yüzeyinden **.016** öndedir. Böylece z-fighting azaltılır; ekstra boya katmanı, alttaki düz panelin üzerinde yüzen kalın fiziksel kutu olarak görünmez.
- Eski her `line('DARK',[side*3.34,-.095,2.43],[side*5.95,-.095,1.70],.056)` yuvarlak ve gölgede ayrık duran kontrol yüzeyi çubuğu yerine **aynı bitiş/başlangıçta tek 13×2 şerit 3D inlay** oluşturuldu: y=-.087, uçlar ince ve ortası dar kavisli; mevcut kanat levhasına yapışık/düşük profilli bir DARK eklem çizgisi.
- Kırmızı şeritler **iki yeni değil, iki eskisinin yerine**; DARK eklemler de **iki yeni değil, iki eskisinin yerine**. Dolayısıyla **189 parça, 7 ana malzeme batch + iki halo**, motor çiftleri, kanat kökünde C20V loft, dik stabilizörler, şerit renginin hex kodu, glass/metal doku, kamera/HUD/race-only oyuncu ve B-04 Map4 fiziği korunuyor.
- Kullanıcının seçtiği **orijinal native 1.00× WebGL MSAA** dokunulmadı. Global FXAA/blur/supersampling yok.

## Gerçek WebGL kabul protokolü
- `tests/map1-next11c20w-paint-and-inlays.cjs`: gerçek SB-07'nin birleşmiş `NEXT11C20_SB07_RED` GPU buffer içinden **2×17×3 = 102** üst boya istasyon ve `DARK` GPU buffer içinden **2×13×2 = 52** gömülü flap eklemi istasyonu, 0.0001 altı real vertex koordinat hata eşiği. Toplam **154/154** gerçek yüzey örneği.
- Kullanıcının onayladığı eski `tests/map1-next11c20-sb07-zenit.cjs` 8 kanat paneli boya/metal örneğinde gerçek raycast 0.008–0.05 yükseklik aralığı; C20U 30 motor kaporta boya örneği, C20V 60 gerçek gövde-kanat loft örneği ve C20R 304 rail seam.
- 4 ayrı 1600×900 WebGL stüdyo gemi fotoğrafı: ön, arka, çapraz, üst. Aynı gerçek Three.js r128 oyun geometry mesh/texture, aynı orijinal MSAA. Birlikte önceki C20V fotoğraflarıyla A/B incelenebilir. **Test görsel sanat onayı değil; gerçek görüntü kullanıcı incelemesine açık.**
- Harita1 normal hız/boost uçuşu ve B-04 Map4 savaş gemisinin **249 parça, [6,36,200] collider** koruması ayrıca test edilir. Genel `Map 1 / Map 4 Browser Smoke` ile son HEAD özel WebGL testinin her ikisi sonuçlanmadan tüm sistem PASS denmez.

## Sonraki NEXT11C20X
Sıradaki görsel kalite adımı: motor–kanat kökü ve ön gövde birleşiminde açık duran son konturları gerçek yüzey normaline göre düzeltmek; **geometrik kalite artır, dekor/gereksiz FPS ayarı ekleme**. Yalnızca kullanıcı açık izniyle merge; bütün geliştirmeler taslak PR.
