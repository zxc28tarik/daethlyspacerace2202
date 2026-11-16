# NEXT-11C3 — Endüstri Sanatsal Kompozisyonu / Açık Tesis Silüetleri

**Durum:** Gerçek oyun kodu, ekran A/B ve fizik testleri bağlandı. Önceki [NEXT11C2 PR #47](https://github.com/zxc28tarik/daethlyspacerace2202/pull/47) üzerine stacked; bu sürüm ana dala merge edilmedi. Son CI ve sanatsal onay için aşağıdaki açık kapılar geçerlidir.

## Gerekçe

[NEXT11C2 gerçek motor screenshotları](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43980216770) 1600×900 07/08 kadrajlarında ton ayrımı ile görünürlüğün arttığını ancak tekrar eden eski W05 siloları/rafineri kutularını ve W02 fiziksel kolonların parlaklığını gösteriyor. Düzensiz nesne yoğunluğu ve düz aydınlatma estetik hedefi 7–8/10 olarak kabul ettirmiyor.

## Oyuna uygulanan NEXT11C3

- **Sadece 18 eski non-collider W05 obje gizlendi**: her 6 istasyonda iki silo + bir eski rafineri. Bu nesneler silinmedi; `h4Gfx11c3LegacyVisuals` üzerinden gerçek öncesi/sonrası QA için geri açılabiliyor.
- **6 adet tek GPU batch'te açık iç boşluklu yeni sanayi yük aktarma portalı**: önceden oyunda mevcut **H4_GFX06C_GEO.cargoCrane** üzerinden yapılan gerçek ExtrudeGeometry (orta boşluk/negative-space); yeni obje **yalnız dekoratif** ve rota kenarında (yaklaşık ±1250 side) konumlanıyor. Tek yeni InstancedMesh, mevcut shader/texture altyapısı, 6 instance, 3 aile rengi, **0 yeni geometry/çarpışma**.
- **VIS02 korumalı fiziksel sütunların materyal derecelendirilmesi**: mevcudun collider referansı/mesh ID/geometry/dünya transformu değiştirilmeden, NEXT11C2 üç aile paletinden koyu mavi, sıcak oksit ve lacivert yapı malzemelerine yönlendirme. Hiçbir görünür fiziksel mesh gizlenmiyor.
- **Yalnız stage 3 için atmosferik kontrast**: `h4UpdateCinematicAtmosphere` içinde endüstri ağırlığına bağlı hafif fog rengi tonlaması, ortam/ana ışık, güneş halosu ve exposure azaltma. Harita1, kanyon, **60sn arena** ve yörünge finalini etkilemez. Per-frame yeni geometri, texture, ışık veya JS array oluşturulmaz.
- **Oynanış korunur:** 5 adil rakip, 8 avcı, kanyon 6/sanayi 36/bina 200 collider, üç rota seçimi, 60 saniye progression-locked arena, toplam 300 saniye, final 850m, çarpışma/AI/hasar/score, üç High/Balanced/Low kalite profili, GFX11B 09 kamera kolon fade.

## Gerçek oyun motoru kabul testi

`tests/map4-gfx11c3-industrial-scene.cjs` ile 1600×900 Chromium/SwiftShader:
- [ ] 18 eski dekorun nonphysical olduğu ve gizlendiği; fiziksel dekor/rota işaretlerinin korunması.
- [ ] VIS02 fiziksel sütunların geometry ve collider object identity'sinin, görünürlüğünün korunması.
- [ ] 6 sanat portalı / 1 InstancedMesh batch / önceden mevcut authored negative-space geometry / 0 collider.
- [ ] 07 giriş, 08 fabrika, 09 çıkış için gerçekten aynı kamera eski/yeni PNG ve render bütçesi. Değişen görsel ve tonal derinlik; yeni silhouette sahnede.
- [ ] 09'da NEXT11B occlusion-mask düzeltmesi, arena aşamasında ileri fabrikaların gizlenmesi, finalde bölge izolasyonu.
- [ ] Eski tüm Chromium Map1 + Map4, offline GLB, GFX09–11C2, 300s VFX, 12 sabit kadraj + 62 tarihi/feature karşılaştırma CI PASS.

## Açık kapılar

**GFX11C3 teknik CI ve görsel inceleme:** devam ediyor. SwiftShader statik görüntü kendi başına 7–8/10 estetik veya **gerçek GPU FPS/VRAM** sertifikası değildir. Native GPU'da 720/1080p test, tam 5 dakika oynanış ve kullanıcının estetik onayı ayrıca gereklidir. Yayıncı sunumu 6 harita ve en az 3 oynanabilir harita hedefi değişmedi; kontrol açık.

**Sıradaki `.`:** Son CI FAIL ise mevcut PR'da kök nedenle düzelt. PASS ise 07/08/09 screenshot görsel kompozisyonunu değerlendirme ve ilerleme kaydı; zorlanmadan 7/10 ilan etme.
