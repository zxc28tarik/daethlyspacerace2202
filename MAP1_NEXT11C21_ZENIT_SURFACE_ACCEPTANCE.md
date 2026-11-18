# NEXT-11C21 — SB-07 Zenit ilk gerçek görüntü sonrası işçilik geliştirmesi

**18 Kasım 2026 — Harita 1 oyuncu gemisi için görsel işçilik aşaması.**

## Kaynak ve izin

Kullanıcı daha önce kendi gönderdiği SB-07 **“Zenit”** oyun tasarım panosunu açıkça onayladı ve oyuna uyarlamamızı istedi. C20 ile gerçek Three.js modeli oluşturuldu, [WebGL QA PASS #44303505125](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44303505125). Gerçek ilk görüntüde modelin ana geometrisi ve iki uç dikey stabilizatörü görünse de, kanat yüzeyleri fazla düz ve motorlar büyük düz turkuaz disk gibi göründü. Bu çalışma onaylı tasarıma sadık kalarak **ekran görüntüsünde tespit edilmiş** malzeme/derinlik eksiklerini iyileştirir. **Bu bir yeni tasarım seçimi değil; seçilen SB-07'nin uygulanmasıdır.**

## Gerçekten uygulananlar

- **Referans silüeti korundu:** SB-07'nin uzun burnu, 2 geniş süpürülmüş yatay kanadı ve **2 bağımsız yükselen dikey uç stabilizatörü**. Yeni kavis, model ölçek değişimi, AI veya fizik yok.
- **Kanat üstü:** 3D extruded kırmızı-sivri yarış şeridi, köşeli koyu çelik servis panelleri, açık gümüş üst kaplama yaması; alt kanat destek kirişleri ve iki yanda mekanik bağlantılar. Kırmızı-beyaz çizgi eski C20'nin rastgele küçük blok görünümünü azaltmaya odaklı.
- **Uç stabilizatörleri:** Dik ve köşeli kontur değiştirilmedi. Yükseltilmiş kırmızı yarış panelinin etrafına iki kenar çizgisi, koyu damarlı iç plaka ve görünür turuncu uç sinyal ışığı konuldu.
- **Motorlar:** İki ayrı arka nacelle'de 4 ilave katmanlı ısı halkası, derinlik oluşturan koyu iç çıkış diski, daha küçük plazma iç çekirdeği, metal/nozul petalleri, çember servis plakaları ve motor ışığı.
- **Kokpit/gövde:** Mavi-koyu kokpit kenarı, bağlantı iskeletleri, üst omurga plakaları, burun boyunca kırmızı merkez hattı; yüzey detayları kademe/ölçek uyumlu.
- **Yine sadece 7 GPU material/draw batch**; hiçbir harici model, texture CDN, yeni ışık, physics collider, silah, bonus veya AI uygulanmadı. Temel C20 geometrisinden doğrudan ilerlenir; Harita 4 B-04 sahnesi ve C18 enerji yönetimi aynı kalır.

## Kontrol ve kalite

- Yeni `tests/map1-next11c21-zenit-details.cjs` gerçek Chromium/WebGL'de **SB-07** kimliği, ek parça sayısı, kanat ucu ve çift motor geometri tespiti, **Map1 normal/boost/3D oblique** ekran görüntüleri, 3D kamera mesafesi ve Harita4 6/36/200 fizik/5 rakip/8 avcı/60-300-850 sözleşmesini denetler.
- CI `.github/workflows/map1-next11c21-zenit-details.yml`; tam Map1/Map4 regresyonu `map-browser-smoke.yml` içine bağlanır.
- [ ] Son C21 hızlı gerçek WebGL QA PASS.
- [ ] Son C21 tam Map1/Map4 regression PASS.
- [ ] Görsel kullanıcının yeni oyun ekranı onayı.
- [ ] Native GPU FPS/p95, gerçek tam insan 300s uçuş, 720p/1080p performans.

**Durum:** Draft stacked PR, **merge için açık kullanıcı onayı şart**. Herhangi bir beğeni/kalite yüzdesi varsayılmadı. Bu ilk render hâlâ sinematik konseptle birebir eşit değildir.
