# NEXT11C21S — Harita 1, özgün yıldız ve bulutsu görsel bütünlüğü

**Temel:** C21R / [PR #114](https://github.com/zxc28tarik/daethlyspacerace2202/pull/114), stacked DRAFT; `main` MERGE YOK.

## Neden
Önceki C21R geçit yüzeylerine yapılan tonal düzenleme 1600×900 oyun kamerasında test için öne alınan 3 geçitte yalnız **1.674 piksel, peak delta 3** fark oluşturdu. Bu kez arka planın önemli bir bölgesini dolduran **zaten var olan 2.600 yıldız ve 38 orijinal bulutsu** renk bütünlüğünü hedefliyoruz: daha sakin soğuk beyaz, mavi, menekşe ve amber; parlayan neon konfeti veya ekstra halka/oyuncak görünümü değil.

## Gerçek kod farkı
- `MAP1_C21S_ORIGINAL_SPACE_GRADE`: dört eski yıldız palet hücresi `[0xffffff,0x88ffff,0xff99dd,0xffcc77]` yerine `[0xf2f6ff,0x9ec6e5,0xd1b3d9,0xe8c39b]`.
- **2.600 mevcut yıldızın `BufferGeometry.position` koordinatları aynen kalır.** Dört eski `Math.random` çağrısı her yıldız için aynen korunur (X/Y/Z ve eski dört-sınıf seçim). Mevcut noktaların renginde yalnızca indekse bağlı deterministik hafif parlaklık ayrımı `1.0/.89/.73`; büyük/yeni yıldız, spawn, shader, texture, light, point-size veya opacity artışı yok.
- **38 mevcut `SphereGeometry` bulutsu**, konum/yarıçap/segment ve C21K `.062` additive materyal opacity aynı. Yalnız beş eski bulutsu paleti `[0x881177,0xff4477,0xff8833,0x2244aa,0x551199]` → `[0x75315f,0xb75178,0xc77b54,0x345b91,0x4c3492]`. Nebula procedural `Math.random` çağrı sayısı aynı kalır.
- **C21L yıldız noktası `size=2.5/opacity=.78` aynen**, C21K fog `0x0d0e21/.00044` aynı. Geometri, materyal tipi, çizim grubu, drawcalls ve GL memory aynı.
- 49 eski mor kutu, 320 eski meteor, 97 bariyer, 8 enkaz geçidi, 192 koridor halkası/10 batch, beş yol bölgesi, SB07 189 parça, Map4 249 parça ve 6/36/200 fizik aynı. Map4'te yıldızlar/bulutsular eski şekilde görünmez.
- Kullanıcının özgün tasarımı koruma, kopya dış kaynak kullanmama, abartılı model eklememe kısıtları kilitli.

## Teknik kabul
- `tests/map1-next11c21s-space-color.cjs` gerçek Chromium/SwiftShader WebGL, **1600×900 normal oynanan yarış kamerasında** hiç obje sahneye taşımadan eski palet / yeni palet yan yana screenshot A/B, piksel kanal farkı, 0 GL error, eşit drawcall ve renderer memory, **bütün 2.600 palette bin ve renk buffer testi**, 38 orijinal bulutsu geometrisi/opacity. Test önce eski pigmentleri geçici uygular sonra yeni pigmentleri geri yükler; yıldız pozisyonları değişmez.
- Özel workflow C21R/Q/P/O/N/M/L/K/J/I/H/G6, C20O/P/Q/R, SB07 eski browser regresyonlarını ve tam offline HTML derlemesini çalıştırır. Kapsamlı Map1+Map4 smoke (78+ test adımı) ayrı.
- Pixel farkı kalite/estetik onayı veya donanım FPS ölçümü değildir. Hedef daha sade ve tutarlı uzay derinliği. Kullanıcı beğenmezse sabit palet tek satırla geri alınabilir.
- İlk browser testinde `THREE.Color` bileşenleri yanlış `x/y/z` okununca QA FAIL çıktı, uygulama hatası değildi. `d8d9cc7` ile doğru `r/g/b` kanallarına göre düzeltildi; son CI sonucu ayrıca doğrulanacaktır.

## İşletme
- PR stacked DRAFT. Kullanıcının açık `main` merge onayı olmadan birleştirme YOK.
- Önceki C21R full smoke [#44908124589](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44908124589) sonucu ayrıca kontrol edilir.
