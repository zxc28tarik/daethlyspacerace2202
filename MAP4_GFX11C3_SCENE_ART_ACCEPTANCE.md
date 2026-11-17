# NEXT-11C3 — Endüstri Sanatsal Kompozisyonu / Açık Tesis Silüetleri

**Durum:** **NEXT11C3 gerçek oyun kodu FULL CI PASS** — [GitHub Actions #43983613354](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43983613354), commit `9cdfdce`. Gerçek 07/08/09 görüntülerine bakıldı; **7–8/10 estetik onayı yok**. Önceki [NEXT11C2 PR #47](https://github.com/zxc28tarik/daethlyspacerace2202/pull/47) üzerine stacked; bu sürüm ana dala merge edilmedi. Son CI ve sanatsal onay için aşağıdaki açık kapılar geçerlidir.

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
- [x] 18 eski W05 dekorun kesin nonphysical olduğu ve gizlendiği; fiziksel dekor/rota işaretleri korunuyor.
- [x] **34 VIS02 fiziksel sütun** geometry/collider object identity korunuyor; yalnız material değişiyor.
- [x] **6 açık portal / 1 InstancedMesh batch**, önceden mevcut gerçek negatif boşluklu geometry, 0 yeni collider.
- [x] 07/08/09 gerçek 1600×900 aynı-kamera eski/yeni PNG farklı. 07 drawcall **549→506** (tri 66.276→66.340), 08 **387→366** (tri 56.100→56.492), 09 **299→300** (tri 56.248→56.968). GPU geometry sayıları sırasıyla **355/359/372 değişmedi**. 09 GFX11B kamera fade aktif.
- [x] NEXT11B 09 kamerada pillar fade aktif; arena sırasında ileri sanayi render grubu gizli, finalde bölge culling aynı.
- [x] **TAM CI PASS:** offline GLB, Map1/4, GFX09–11C2, GFX10B simüle 300s, 12 sabit sanat kadrajı ve 62 tarihsel/özellik resmi [Actions #43983613354](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43983613354).

## Açık kapılar

**GFX11C3 teknik CI ve görsel inceleme:** devam ediyor. SwiftShader statik görüntü kendi başına 7–8/10 estetik veya **gerçek GPU FPS/VRAM** sertifikası değildir. Native GPU'da 720/1080p test, tam 5 dakika oynanış ve kullanıcının estetik onayı ayrıca gereklidir. Yayıncı sunumu 6 harita ve en az 3 oynanabilir harita hedefi değişmedi; kontrol açık.

**Sıradaki `.`:** Son CI FAIL ise mevcut PR'da kök nedenle düzelt. PASS ise 07/08/09 screenshot görsel kompozisyonunu değerlendirme ve ilerleme kaydı; zorlanmadan 7/10 ilan etme.

## Gözle sanatsal QA — teknik başarı estetik kabul değildir

[07/08/09 gerçek aynı-kamera A/B görüntüsü](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43983613354/artifacts/14284577716) incelendi. 07'de tekrar eden soldaki silolar azaltıldı ve büyük açık endüstri formu görünür; 08'de eski açık yapıların bir kısmı temizlenerek orta plan boşluğu iyileştirildi; 09'daki önceki kamera düzeltmesi sağlam. **Ancak yeni açık portal karelerin yalnız bir kısmında belirgin**, geri kalan fon hâlâ parlak, tekrar eden düşük ayrıntılı kutu/kolon/dairesel işaretlerle dolu. Projenin hedefi **7–8/10** olduğundan NEXT11C3 "sanatsal kabul" olarak işaretlenmez. Sonraki adım **NEXT11C4 — yüksek kaliteli büyük mimari hero meshler, ön-orta plan kompozisyonu ve güçlü sahne ışık/fog ayrımı** olarak açık kalır. Native GPU FPS/VRAM, gerçek 5dk uçuş, insan estetik onayı ve 3 oynanabilir harita yayıncı kapısı henüz açık.
