# NEXT-11C8 — Korunan W02 binalar için işlevsel cepheler ve sanayi zemini

**Durum:** Oyun kodu, gerçek Chromium/WebGL 07/08/09 A/B testi ve ayrı hızlı/tam CI dosyaları GitHub'a işlendi; **güncel HEAD test sonuçları ve görsel kabul henüz açık**.

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
- [ ] **Güncel C8 HEAD** hızlı WebGL CI PASS.
- [ ] 07/08/09 aynı kamera görüntüleri gerçek render artifact'tan incelendi; gerektiği kadar kod düzeltmesi yapıldı.
- [ ] **Güncel C8 HEAD** full browser-smoke, 11C3/4/5/6/7 regresyonları PASS.
- [ ] Yerel GPU 720/1080p FPS/p95/VRAM, 5dk gerçek uçuş ve oynanabilir 3/6 harita kabulü.
- [ ] Kullanıcının 7–8/10 görsel kabulü ve merge onayı.

**Estetik uyarısı:** PASS sayısal teknik doğrulamadır; 7–8/10 kalite notu değildir. Kullanıcı açık izni olmadan main'e veya diğer stack PR'lara merge yok.
