# NEXT11C20B — SB-07 Zenit görsel işçilik iyileştirmesi

**18 Kasım 2026 · Statü: GELİŞTİRME-PR; görsel/oynanış kabulü bekleniyor.**

## Korumalı kullanıcı tasarımı
Kullanıcının onayladığı SB-07 Zenit **aynı gemidir**. Uzun sivri burun, geniş ve düz/süpürülmüş ana kanatlar, **iki dış kanat ucundaki dikey stabilizatör**, iki motor, gümüş/beyaz + kırmızı ve mavi cam karakteri korunur. Önce reddedilen kıvrımlı kanat veya kaba/çok ince alternatifler geri getirilmez. Harita 4 B-04 Bastion değişmez.

## Gerçek oyun koduna eklenen kalite
- **8 özgün ince 3D kanat üst paneli:** sağ/sol beyaz, gunmetal ve kırmızı aerofoil yüzeyleri, gerçek extrude geometri; kanat sınırı değiştirilmez.
- **Çok kesitli köşeli kokpit:** uzatılmış hazır küre yerine özel 7 istasyonlu yarım kemer cam kabuğu, 2 yan hat ve 3 çift ince köprü takviyesi.
- **İki gerçek motorun arka detayları:** her motor için içi açık konik nozul, yeni plazma dudak halkası, altı uzun metal soğutma kaburgası ve sekiz parçalı dış taç (toplam 16 taç parçası).
- **Paylaşılan deterministik mikro PBR:** sadece programatik üretilen 128² roughness/bump haritası; metal/gövde/kırmızı yüzeylerde ince fırçalı malzeme ayrımı. Yeni indirme, üçüncü taraf model veya silah yok.
- 7 mevcut SB-07 materyal batch korunur; B-04 mevcut 6 batch ile toplam 13. 0 yeni oyun çarpışma gövdesi; model tamamen visualOnly/noCollider.

## Doğrulama (bağımsız kabul kapıları)
- [x] Kod ayrı geliştirme dalında kaydedildi: `codex/map1-sb07-zenit-visual-polish`.
- [x] Yeni geometri, stil ve donanım korumalarını kapsayan tarayıcı testi eklendi; JS statik sözdizimi kontrol edildi.
- [ ] NEXT11C20B hızlı gerçek Chromium/WebGL PASS ve 3 kare (normal chase/boost/3-4 görünüş) elde edildi.
- [ ] Tam Map1/Map4 browser regresyon PASS.
- [ ] Gerçek oyun içi görüntüler üzerinden kullanıcı **model estetik** onayı (konsept görseli onayı yeterli değildir).
- [ ] Fiziki masaüstü GPU 720/1080p FPS/p95/VRAM ve kesintisiz pilot uçuşu.
- [ ] Kullanıcı açıkça izin verirse merge. **DRAFT / NO MERGE**.

Referans önceki uygulama: [NEXT11C20](MAP1_NEXT11C20_SB07_ZENIT_ACCEPTANCE.md). Bu aşamada Harita 1 yarış AI/yarış kuralları, kamera, boost, C18 güç sistemi, fizik, Harita 4 av/arena ve B-04 korunmuştur.
