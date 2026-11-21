# NEXT11C21T — SB07 mevcut kırmızı kanat boyasında kareli pürüz izlerini temizleme

**Taban:** C21S / PR #115. Stacked **DRAFT**, kullanıcı açık onay vermeden `main` merge **yok**.

## Görsel hedef ve sınır
Bir süredir kullanıcının istediği “ayrık parçaları birleştir, çizgi kalitesini yükselt” kalite yönü: yeni gemi yaratmadan mevcut **SB07 racing-red ön ve dış kanat şeridinin yüzeyindeki 32×32 piksellik kareli çizgi düzenini** kaldırarak tek sürekli saten kaplama hâline getirmek. Aşırı parlak neon, yeni kaplama levhaları, dış hat, wing parçaları, ring veya glow eklenmez.

## Tam değişiklik
- Orijinal SB07'nin 7 render/mesh/malzeme batch'i, 189 model parçası ve bütün gerçek vertex/normal/UV/paint-lift değerleri birebir aynı.
- Mevcut tek `fineFinish` = **128×128 CanvasTexture** yalnızca `SB07_RACING_RED` materyalinde `roughnessMap` olarak kullanılır; ayrı texture, draw call, material, shader **eklenmez**.
- Önceki red texture `216 + gritty +/-8 + 32px x/y "-7" seam + 7px y "+3" lines` gibi kareli/yatay sert bir desen üretiyordu. C21T aynı **her pixel için bir kez** işlem gören eski LCG `seed=0x07a11ce` sırasını ve tek map'i korur; artık `base=202`, `grit×.45`, `3.1*sin(y*.43)+1.2*sin(x*.13+y*.09)` ile sürekli, düşük kontrastlı saten elyaf dokusu üretir. Grid `x%32` ve `y%32` ifadesi kaldırıldı. Aynı 128px, mipmaps, repeat, anisotropy=4 ve filter düzeni.
- Kullanıcı onaylı SB07 malzeme ana hex kodları aynen: kırmızı `0xc43838`, emissive `0x631717/.29`, roughness `.47`, metalness `.43`; mavi/koyu/seramik/gunmetal/amber/plasma değişmez. C21C kırmızı pigment akışı ve C20K fiziksel yüzey boşlukları korunur.
- 49 eski mor ödül kutusu, 320 meteor, 97 turuncu bariyer, 8 enkaz, 192 halka/10 grup, 2600 yıldız ve 38 bulutsu, 5 yol sektörü; Map4 249 parça/6-36-200 collider/AI/fizik aynı.

## QA
- `tests/map1-next11c21t-red-coat.cjs`: **gerçek 1600×900 Chromium/WebGL**, normal Map1 yarış kamerasında *aynı SB07 gemisi* ve sahnede **hiç obje taşınmadan** eski kırmızı 128px roughness bitmap'ini matematiksel olarak yeniden üretir ve **aynı texture'ın Canvas içine geçici yükler**, eski WebGL ekran görüntüsünü alır, yeni C21T pixel bitmap'ini geri koyup yine render eder. Gerçek piksel farkını, drawcall/GPU memory/GL error, gerçek gemi parça sayısı, eski renk/malzeme/texture parametreleri, bütün öz malzeme referanslarının korunması ve Map4 izolasyonunu denetler. Test sonunda C21T texture tüm pikselleriyle geri yüklenir. Görsel delta kullanıcı estetik onayı veya native GPU FPS kanıtı değildir.
- Özel GitHub Actions C21S/R/Q/P/O/N/M/L/K/J/I/H/G6 + C21A/B/C/D/E/F + C20O/P/Q/R+SB07, tam HTML bundle; ayrıca çok kapsamlı Map1/Map4 smoke. Uzun testlerden bağımsız **hızlı tam çevrimdışı oynanabilir HTML** artifact akışı.
- İlk testte oyun init tamamlanmadan `h4Ship19Race` değişkenine bakma durumu QA'yı bozdu; `289fc07` ile `startGame`/49 orijinal item yüklenene dek beklenir. Oyun kodu değiştirilmedi.

## Kabul
Kaynak ve test geçmeden PASS denmez. Gerçek piksel farkı azsa bu görüntünün ölçülebilir fakat sınırlı bir saten dokusu cilası olduğu açıkça belirtilir; devasa kalite sıçraması iddia edilmez. Son görsel karar kullanıcıda. Kapsamı genişletme veya `main` merge için izne ihtiyaç var.
