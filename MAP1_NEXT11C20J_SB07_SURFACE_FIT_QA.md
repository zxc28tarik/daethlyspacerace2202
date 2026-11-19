# NEXT11C20J — SB-07 ZENİT Birleşik Yüzeylerde Kenetlenme / Çizgi QA

**Tarih: 19 Kasım 2026.** Kullanıcının "." talimatı ile bir sonraki aşama başlatıldı. NEXT11C20I'nin kesin kararı devam ediyor: **yeni mikrodetay/parça eklemek yerine ayrık parçaları birleştir ve çizgileri temizle**.

## Somut düzeltilen iki hata — oyundaki gerçek 3D model

1. **Burun kırmızı yarış şeridi gövdeye tam oturmuyordu.** C20I 3 bağımsız şeridi tek ribbon yaptığında, beş z istasyonuna y-koordinatları el ile yazılmıştı. Örneğin burun z=-8.76 civarında şerit yüksekliği .126 iken 14-gen gövdenin üst kenarı x=±.06'da yaklaşık .0635'ti; boşluk .0625 model birimiydi. Öndeki fazla yüksek/kartondan ayrılmış şerit uzaktan kenar titremesi ve geçersiz şasi katmanı gibi görünme riski taşıyordu.
   - **Çözüm:** Gövdenin 9 `[z,width,height]` istasyonu `hullRows` olarak TEK kaynağa dönüştürüldü. `customHull()` aynı veriyi kullanıyor, karakteristik gövde silueti değişmiyor.
   - Tek kırmızı ribbonun her uzunlamasına 5 kesiti artık yalnız iki genişlik ucu değil **sol/merkez/sağ olmak üzere 3 gerçek surface vertex** içeriyor. `hullRoofY(z,x)` 14 kenarlı kesiti ve lineer z enterpolasyonunu kullanıp gerçek 14-gon üst yüzeyine **.018 birim kontrollü açıklıkla** oturtuyor. Center eksi-kaplama z-fighting ve floating gibi riskler azaltıldı.
   - Değişiklik başka oyuncu hitbox'ı, uçak sınıfı veya görsel dekor parçası oluşturmaz; **aynı 1 ribbon parçası** biraz daha fazla üçgenle doğru gövde yüzeyine oturur.
2. **Kanat üstü uzun metal kapak havada kalıyordu:** İki taraftaki SECOND shroud merkez `y=-.02`, boy `.12` olduğunda alt yüzeyi `-.08` idi. Kanat üstü yaklaşık `-.13` olduğundan **~.05 birim boşluk** vardı. Kapak y konumu `-.07` yapıldı; alt yüzey artık `-.13`. Üstündeki kırmızı şerit de `.066→.016` indirildi; metal kapağa tam oturması korundu. Sağ/sol gerçek dış uç/kanat silueti değişmedi.

## Kalite ve performans çerçevesi
- C20I'nin **354→191 (−163, −46.05%)** kaynak builder sadeleştirmesi korunur. Yeni C20J'de parçaların sayısı artırılmadı. 7 ana materyal mesh draw batch + 2 paylaşılan küçük 128px motor sprite.
- Yuvarlak line radial 16, motor barrel 32, torus ring 40, wing/fin bevel4, glass11 enine nokta; PBR mikrofinish mipmap/aniso4 ve hız/boost aydınlatma korunur.
- Sadece Harita1 SB-07 modelinin `h4Ship20ZenitBuild()` işlenmiştir. Harita1 yarış fiziği/AI/boost/enerji/HUD/kamera ve Harita4 B-04 oyun kuralları/modeli hiçbir şekilde değiştirilmez.

## QA/ölçülebilir kabul
- [x] Güncellenmiş gerçek HTML'in tamamındaki JS statik parse PASS.
- [x] Playwright gerçek Chrome WebGL testine beş ayrı z istasyonunda **her biri üç bağımsız sol/merkez/sağ şerit vertex** kontrolü eklendi. Test, önden arkaya beklenen gerçek 14-gon yüzey yüksekliği ile +/- 0.004 toleranslı karşılaştırma yapıyor.
- [x] Kanat shroud'unun y≈-.13 zeminine temas eden gerçek SECOND materyal mesh vertex'leri ölçülüyor.
- [x] Stüdyo normal/boost PNG kanıtı, WebGL gerçek renderCalls (7 opaque +2 glow), GL render triangles ve geometry memory ölçümüne gerçek sahne (test dosyası) kabul kapısı eklendi.
- [x] Ayrı C20J görüntü testi ve tam Map1/4 browser-smoke branch tetikleyicisi kaydedildi.
- [ ] Yeni commit'in gerçek Chrome/WebGL CI **PASS** sonucu doğrulandı.
- [ ] Yan yana normal/boost/ön-çapraz görüntüleri indirilip gözle incelendi; z-fighting ve kenar titremesi insani kalite kabulü verildi.
- [ ] Native GPU 720p/1080p FPS/p95 ve 300 saniye insan oynanış testleri kabul edildi.
- [ ] Kullanıcı açık MERGE kararı verdi. **DRAFT / NO MERGE**.

## Sonraki NEXT11C20K
Önce QA workflow sonucunu ve gerçek üç PNG'yi görerek clipping/titreşme kalmış mı değerlendir. Gerekirse yalnız gezinen/kırpılan render geometrisini düzelt; yeni dekoratif parça oluşturma, tek parça şerit/kanat/motor halkası sadeliğini bozma.

[Önceki birleşik geometri kararı](MAP1_NEXT11C20I_SB07_UNIFIED_SURFACE_ACCEPTANCE.md).
