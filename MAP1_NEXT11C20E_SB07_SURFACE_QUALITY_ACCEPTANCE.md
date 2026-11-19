# NEXT11C20E — SB-07 Zenit kalite geçişi: yüzeye oturtma, ikili motor boğazı ve dengeli kaplama

**19 Kasım 2026 · Hazırlanan kod ayrı stacked PR içindedir; main'e geçirilmemiştir.**

## Kullanıcı tasarımı kilitli
SB-07 Zenit önceki kullanıcı onaylı uzun sivri burun + geniş geriye süpürülmüş DÜZ kanatlar, **iki dışta yükselen dikey kanat ucu**, ince ama gövdesi belirgin profile sahiptir. Çift motor, gümüş-beyaz/kırmızı kaplama, mavi cam korunur. Daha önce reddedilen parantez/kavisli şekillere ya da hazır ticari gemilere dönülmez. Harita 1 yarışçı tek model; Harita 4 B-04 Bastion'a dokunulmadı.

## Uygulanan gerçek oyun iyileştirmeleri
- **Yüzeye oturtma, yapısal iyileştirme:** Önceki dalda kanadın yaklaşık y=-.13 konumundaki bevel üstünde yüzdüğü görülen ince paneller artık `wingDeckPlate` y=-.116 ile gövdeye oturuyor. Menteşe derzleri ve kırmızı yarış şeritleri bunlarla uyumlu olarak aşağıya indirildi. Önceden havada duran dış metal renk plakası alt yüzeyiyle kanada daha iyi kenetlendi. Tasarımın ana konturu **DEĞİŞMEDİ**.
- **Kanat kökü hava akışı:** İki tarafta 4'er birim, toplam **8 gömülü servis hava geçidi seti** ve iki ince yapısal çizgi. Dış biçim değişmez.
- **Kokpit:** Fasetli 7 kesitli camın ön/arka kenarlarında iki ince conta çizgisi ve üst derz; mevcut `MeshPhysicalMaterial` clearcoat korunur.
- **Motor derinliği:** Her bir motorun gerisinde 3 birbirine geçen gerçek 3D halka, toplam **6 nozül boğazı halkası**; iç mavi plazma çerçevesi. Her motorda 6 parça, toplam **12** iç ısı kalkanı parçası. Önceki 20 stator, servis louvers, çift termal manifold korunur.
- **Sınırlar:** Eklenen geometri mevcut 7 SB-07 GPU batch'e merge edilir. 0 yeni silah, gameplay collider, dış model veya üçüncü taraf kaplama. Mevcut fizik, AI, kamera, boost, C18 güç yönetimi, Harita 4'ün 5 rakip/8 avcı/60-300-850 ve 6+36+200 collider'ına hiçbir değişiklik yapılmaz.

## Doğrulama
- [x] Asıl oyun `index.html` tek JS script bloğu **sözdizimi PASS**.
- [x] Gerçek Chromium/WebGL testi iki ayrı motor boğazının mesh tepe noktalarını ve yeni sayısal QA alanlarını denetleyecek şekilde güncellendi.
- [x] Hızlı WebGL workflow ve geniş Map1/4 CI'nin yeni dal tetiklemesi kaydedildi.
- [x] Önceki 360° bağımsız HTML önizlemenin V3 sürümü üretildi ve iç JS syntax kontrol edildi (bu önizleme **tam oyun kodunun birebir çalıştırılması değil**).
- [ ] Son HEAD'in GitHub Actions hızlı ve geniş testleri **PASS** olarak kanıtlandı.
- [ ] Üretim oyun modelinin aynı kamera (normal/boost/3/4) **gerçek render** görseli incelendi.
- [ ] Fiziksel 720/1080p GPU FPS/p95, 5 dakika gerçek uçuş ve kullanıcının son estetik onayı.
- [ ] Kullanıcının açık merge kararı; **DRAFT / NO MERGE**.

## Sıradaki NEXT11C20F
Gerçek WebGL görsellerinin teknik ve insan incelemesi; renk aşırılıkları, eklenen kanat kaplamalarının clipping'i veya yanlış tarafa normal yönleri fark edilirse yalnız hedefli düzeltme. Yeni büyük gemi tasarımı YOK.

Önceki ayrıntılar: [C20D](MAP1_NEXT11C20D_SB07_MECHANICAL_DETAIL_ACCEPTANCE.md).
