# NEXT-11C20H — SB-07 Zenit Gerçek 3D Görsel Kontrolü ve Aşırı Parlama Sınırı

**Tarih:** 19 Kasım 2026. **Durum:** oyun kodu/test ve GitHub test iş akışları yazıldı; Chromium/WebGL çalıştırma sonucu doğrulanmadı, oyuncu/native GPU estetik QA açık.

## Sorunun teknik kökü ve görsel strateji

Önceki NEXT-11C20G aşamasında, oyun renderer'ında `antialias:true` zaten açıktı, cihaz DPR max2 ve Map4 çözünürlüğü bağımsız. Yeniden global FXAA/TAA/blurlu shader uygulamak oyun haritalarının görüntüsünü ve performansını korumazdı.

Bu aşamada kullanıcı onaylı **SB-07 Zenit**, sivri burun, **geniş düz kanatlar + her iki dış uçta yukarı yönelen DİKEY uç stabilizatörleri**, gümüş/kırmızı yüzey, koyu kokpit ve çift motor aynen. Kullanıcının reddettiği dışa/içe parantez siluetleri, başka gemiye dönüş veya bir ticari 3D modeli kopyalama kesinlikle yok.

## Gerçek oyun kodu

- **İnce metal çizgiler:** Yuvarlak 12 segmentli `lineTube` çizgi yardımcısının çapına `Math.max(thick,.056)` alt sınırı getirildi. Normal Cinematic Chase görüşünde 0.038–0.049 genişlikli mekanik bağlantıların görünmez/titreşir hâle gelmesi azaltılmak isteniyor. Temel çizgi uç koordinatları ve geometri dış profili aynı.
- **İki motor glow:** 128px atlas, trilinear ve anisotropy4 korunur; haleler çapını bazda **1.85→1.68**, boostta **max 2.27→2.06**, opacity bazda **.18→.14**, boostta **max .48→.38** olarak sınırlar. Sprite merkezlerini z6.69→6.65 çekerek 20 stator ve nozzle iç halkalarına daha az engel çıkarırlar. Bu tasarım kararı gerçek görüntü ve kullanıcı kabulünden sonra ayarlanabilir.
- 7 SB07 opaque material draw batches + 2 additive sprites, 0 yeni hitbox/weapon/dinamik light/harici model. Harita 1 yarış, 5 yarışçı, 2 kamera ve C18 güç yönetimi değişmez. Harita 4 B-04 model ve 6/36/200 collider, 5 rakip/8 hunter/60-300-850/bonuslar korunur.

## Önemli QA iyileştirmesi: modelden gerçek, aynı kadraj PNG

`tests/map1-next11c20-sb07-zenit.cjs` artık mevcut **gerçek oyun h4Ship19Race 3D geometri ve malzemelerini doğrudan clone** ederek tarafsız bir stüdyo sahnesinde görünmesini sağlar. Başka bir yapay model/temsil değildir; stüdyo *oynanabilir kamera* değil, tarafsız **sanat kontrolü** için kullanılır. Üç resim üretir:

1. `map1-next11c20-zenit-studio-h-front.png`: burun/kanat konturunu gösteren ön çapraz stüdyo açı
2. `map1-next11c20-zenit-studio-h-rear-normal.png`: motorlar ve kanat alt/üst birleşimlerinin normal uçuş parlaması
3. `map1-next11c20-zenit-studio-h-rear-boost.png`: **aynı kamera, aynı ışık, aynı 1600×900 viewport**, gerçek oyun boost kontrolüyle yükselen parlaması

Render sonrasında WebGL tamponundan **hemen `gl.readPixels`** ve dikey satırları ters çevirme ile **PNG** üretilir; `preserveDrawingBuffer:false` tarayıcı siyah/boş ekran görüntüsü riskine karşı yalnız screenshot API'sine güvenilmez. Ek teşhis:
- İki motorun çevresinde 40×40 RGBA renk örneği: ortalama parlaklık, beyaz clipping payı, cyan payı.
- Canvas fiziksel çözünürlüğü, gerçek WebGL antialias desteği, modellenen gemi kimliği, gerçek 7 material + 2 sprite draw budget.
- Normal/boost canlı state ve A/B stüdyo dosyası rapora kaydedilir. **Çıktıların ESTETİK PASS olduğu otomatik ilan edilmez**; ölçümler gerçek PNG'leri değerlendirmeye yardımcı olur.

## Test durumu

- [x] Asıl 865 KB `index.html` tam inline JS syntax PASS.
- [x] Browser test dosyası JS syntax PASS.
- [x] 3 yeni gerçek materyal stüdyosu PNG screenshot üretecek QA yolu kaydedildi.
- [x] Hızlı ve tam Map1/4 smoke iş akışları yeni dal `codex/map1-sb07-zenit-review-h` için eklendi.
- [ ] Yeni commit'e ait gerçek GitHub Actions tamamlanmış **PASS** doğrulandı.
- [ ] PNG'ler indirilip insan tarafından karşılaştırıldı; normal/boost clipping gözlemleri.
- [ ] Native GPU 720p/1080p FPS/p95 ve 5 dk kesintisiz yarış.
- [ ] Kullanıcı estetik model onayı ve **açık MERGE onayı**.

**Draft PR, no merge.**

## NEXT-11C20I

İlk iş yeni PNG ve QA raporunu incele; çizgi titreşmesi/kanat paneli clipping veya aşırı plasma beyazlığı gözlemlenirse yalnız hedefli art tuning. Perf p95 ölçümü olmadan 4× supersampling gibi pahalı global GPU çözümleri ekleme.

[Önceki NEXT-11C20G](MAP1_NEXT11C20G_SB07_LINE_QUALITY_ACCEPTANCE.md).
