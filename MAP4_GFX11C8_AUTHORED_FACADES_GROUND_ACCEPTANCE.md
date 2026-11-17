# NEXT-11C8 — Korunan W02 binalar için işlevsel cepheler ve sanayi zemini

**Durum:** Gerçek Chromium/WebGL 07/08/09 A/B hızlı CI [#44069920712](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44069920712) **PASS** (kod+ilk test düzeltme SHA `3477de6`). **Tam regresyon**, önceki C7 testinin C8 zemin override'ıyla etkileşimi nedeniyle [#44069920780](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44069920780) **FAIL**; C7 A/B izolasyonu `b76c148` ile düzeltildi, yeni hızlı [#44070620158](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44070620158) ve full CI sonucu bekleniyor. Kullanıcı 7–8/10 estetik onayı **AÇIK**.

## Kaynak ve öncelik

NEXT-11C7 [PR #52](https://github.com/zxc28tarik/daethlyspacerace2202/pull/52) 09 girişindeki aşırı büyük C4 görsel enerji halkalarını küçülttü. Ancak ekran görüntülerinde büyük W02 binalar tek renkli boş hacimler olarak kalıyor, zemin de yapay düz alan hissi veriyor. C8, fazladan fiziksel bina üretmez: var olan **VIS02 tarafından korunan fiziksel kabukların görünür yüzlerine** tasarlanmış, **çarpışmasız** bina cephesi bindirmeleri ekler.

## Uygulanan tasarım

- `h4Gfx11c8FacadeGeometry(false)`: blok bina kabuğu için iki yönlü (ön/arka) gerçek **bakım paneli ve boşluk hissi taşıyan havalandırma ızgarası**, yatay louver, dikey taşıyıcı, küçük bakım paneli; tüm parçalar tek BufferGeometry olarak birleştirilir.
- `h4Gfx11c8FacadeGeometry(true)`: yedi kenarlı kulelere ait **ısı eşanjörü dikey şeritleri**, bağlantılar ve küçük çatı servis elemanları; neon/torus eklenmez.
- Bir orijinal fiziksel mesh başına aynı dönüşüm matrisiyle **yalnız visual-only instance**. Çizim yalnız iki ailede InstancedMesh ile toplu; mevcut `mesh.geometry`, `mesh.material`, `mesh.userData.h4Collider` ve çarpışma kayıtları değiştirilmez; yeni görünen çıkıntılar orijinal kabuk yüzüne yakın tutulur.
- Malzeme `NEXT11C5` 256² eski PBR metali paylaşır; normal ve UV mevcut, **yeni çarpışma veya ışık yok**.
- Sanayi görsel zemini için **tek adet yerel 256×256, çok ölçekli aşınmış beton/silt albedo**: deterministik tane, lekeler ve ince düzensiz çatlaklar; yer geometrisi ve renk attribute'ları değiştirilmez. C7 mat ground malzemesinden türetilir, C7 kapatma/geri alma hâlâ mümkündür.
- `h4Gfx11c8SetLook(true|false)` aynı-kamera eski/yeni A/B; High/Balanced ve yalnız Map4 faz 3 açık; Low, Harita1 ve diğer fazlarda yeni cepheler görünmez ve zemin eski halini korur.
- Bütün nesneler **bir kez** hazırlanır; her karede atlas/bellek/mesh üretilmez.

## Değişmeyen kararlar

Altı harita; ilk yayıncı sunumuna üç oynanabilir harita; Harita1 yarış görsel/oynanış; Harita4 40/60/85/95 sn faz yapısı, 300 sn yarış, 850 m çıkış; 5 rakip, 8 avcı, 60 sn arena; 6 kanyon, 36 sanayi ve 200 fiziksel yapı collider; W05 BEACON/HIGH_MARKER ve tüm harita yönlendirmeleri. GFX11C3–C7 sahne bileşenleri korunur. PR #50–52 kullanıcı izni olmadan birleştirilmez.

## QA — doğru kanıt açıkça ayrılır

- [x] `index.html` gerçek oyun kodu eklendi ve JS sözdizimi kontrolü PASS.
- [x] `tests/map4-gfx11c8-authored-facades-ground.cjs` gerçek 1600×900 Chromium/WebGL 07/08/09 A/B ve eski harita/fizik/profil şartlarıyla yazıldı.
- [x] Hızlı görsel artifact workflow + tam regresyon workflow eklendi.
- [x] Gerçek C8 A/B hızlı CI [#44069920712 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44069920712), 34 kabuk/20.760 ek üçgen/2 draw-call; yeni C7 izolasyonunu da kapsayan hızlı QA henüz ayrı açık.
- [x] 07/08/09 aynı kamera gerçek render artifact'ı **gözle incelendi**; 7–8/10 onayı verilmedi.
- [ ] **Güncel C8 HEAD** full browser-smoke, 11C3/4/5/6/7 regresyonları PASS.
- [ ] Yerel GPU 720/1080p FPS/p95/VRAM, 5dk gerçek uçuş ve oynanabilir 3/6 harita kabulü.
- [ ] Kullanıcının 7–8/10 görsel kabulü ve merge onayı.

**Estetik uyarısı:** PASS sayısal teknik doğrulamadır; 7–8/10 kalite notu değildir. Kullanıcı açık izni olmadan main'e veya diğer stack PR'lara merge yok.


## 17 Kasım — Gerçek ekran, kesin üçgen bütçesi ve regresyon hatası

- **Hızlı C8 art QA PASS:** [#44069920712](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44069920712), `map4-next11c8-07-08-09-review` 1600×900 gerçek Chromium/WebGL A/B. `C8 TEST` 34 eski W02 fiziksel kabuk (22 blok + 12 kule), **2 InstancedMesh drawcall, 20.760 render üçgeni**, **1** yerel 256² zemin atlası, **0 collider ve 0 ışık** eklediğini doğruladı. 24 BEACON/HIGH_MARKER fiziksel rehber işaretleri korundu.
- **Piksel farkları** (ortalama RGB farkı >1/255): 07 giriş **%22,20**, 08 fabrika **%11,89**, 09 çıkış **%6,83**. Sayılar yeni dokunun render'a etkisidir; **görsel kalite puanı değildir**.
- **İlk görsel inceleme:** 07/08'de zemin daha malzemeli, fiziksel kabuklara servis/ızgara ayrıntısı eklendi; fakat 07/08 yakın yapılar hâlâ düz algılanıyor, 09 çok az değişti. Fazla tekrar eden havada asılı dekoratif halkalar ve büyük basit platformlar 7–8/10 hedefini önlüyor. Sanat onayı **VERİLMEDİ**.
- **İlk tam CI #44069920780 FAIL:** C8 ground malzemesi eski C7 testinde 17 kayıtlı görsel malzemeden biri olan GROUND'u override etti; test 16 gördü. Oyun çarpışması veya render crash değil, **A/B test izolasyon çatışması**. Önceki yedek C7 A/B testini C8 `SetLook(false)` ile başlatacak `b76c148` düzeltmesi yapıldı; C8 kendisi ayrı testte yeni sahne kompozisyonunu doğrulamaya devam eder.
- **Yeni hızlı workflow `e31c9ca`:** hem C8 hem izolasyonu yapılmış eski C7 A/B'yi birlikte zorunlu kılar. [Hızlı #44070620158](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44070620158) ve yeni full C3–C8 testleri **sonuç bekleniyor**; ilk koda PASS yazıp düzeltme HEAD'ini otomatik PASS sayma.
- **NEXT-11C9 adayı / YAPILMADI:** Fiziksel kabuklara dokunmadan 07/08'de büyük düz çatılar, 09'da tekrar eden havada asılı dekoratif (non-nav) halkalar, sanayi ön plan kompozisyonu; arazi doku frekansının ve mimari ölçek algısının dengelenmesi. Görsel karar gerçek ileri-yön kamera ve 5 dakika uçuşta ayrıca incelenmeli. Low ve Map1 korunmalı.

**Yayıncı/merge:** 6 harita, ilk pitch 3 playable hedefi; bu C8 teknik görselleştirme hepsi hazır veya 7–8/10 onaylı anlamına gelmez. PR #53 stacked draft, PR #50–52 dahil kullanıcı açık onayı olmadan merge yok.
