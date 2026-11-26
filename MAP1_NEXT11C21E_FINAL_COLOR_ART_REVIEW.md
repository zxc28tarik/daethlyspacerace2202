# NEXT11C21E — SB-07 ZENİT Balanced palet son kalite paketi

**20 Kasım 2026 | Karar: Stable visual freeze candidate, renklerin aşırı değiştirilmesine son.**

## Kullanıcı hedefi

SB-07 tasarımını yeniden yapmak değil; premium, hızlı, okunaklı yarış prototipi elde etmek:
- Açık soğuk saten seramik, koyu mavi çelik alt yapı
- Ön/dış kanadın hareket yönünü ifade eden doygun ama az yarış kırmızısı
- Koyu mavi cam, mavi plazma, küçük amber teknik ışık
- Parça, siluet, malzeme hex, fizik, native 1× MSAA ve performans görüntü modunda ek değişiklik yok

## Üç tasarım katmanının nihai kod durumu

- C21B / PR #93: HULL, SECOND, RED, DARK dört mevcut mesh RGB buffer'ında Balanced temel pigment. C21A seramik/brushed PBR ve yedi malzeme hex aynen.
- C21C / PR #94: aynı RED yüzeyde, burun/dış kanat boyunca kontrollü yarış akışı. Yeni decal yok.
- C21D / PR #95: mevcut SECOND ve DARK motor şasesi daha soğuk işlenmiş metal, enerji ayrı. ORANGE/PLASMA/GLASS aynen.

**C21E yeni estetik renk değeri eklemez.** Son dengeleme için rasgele oynama yerine *gerçek dört açılı art review + regresyon* eşiği uygulanır. Bozuk veya kötü görüntü bulunursa ilgili tek renk parametresinde yeniden revizyon yapılır. Böylece yüzey kimliği korunur.

## Gerçek son kabul

`tests/map1-next11c21e-final-color-review.cjs` aynı WebGL render'da gerçek h4Ship19Race SB-07 modeliyle `rear`, `front`, `rear-quarter`, `top` 4 adet 1600×900 native 1× MSAA görünüm üretir ve dört açılı 2×2 montaj kaydeder. JSON raporu:
- 189 parça, yedi sabit material batch, 2 glow (toplam 9 render call)
- 74.700 gerçek pigmentli vertex ve orijinal 7 ana HEX
- Gerçek WebGL framebuffer, gl errors 0, orijinal AA
- Siluet kapsama kutuları, parlaklık taşması, kırmızı/mavi/amber görünür pikseller
- Önceki C21C/D 1600×900 aynı model A/B görüntülerine bağlantı

`.github/workflows/map1-next11c21e-final-art.yml` tüm C21A/B/C/D testlerini, SB-07 normal/boost ve Map4 korumasını, 304 rail seam testini ve C21E contact sheet'i koşar. `map-browser-smoke.yml` de aynı C21E kapısını tam oyuna ekler.

## Kabul hükmü

Teknik test PASS olsa dahi **estetik beğeni otomatik onaylanmış sayılmaz**. Son HEAD özel CI ve kapsamlı smoke tamamlanmadan teknik final PASS yazılmaz. Galerinin görsel incelemesinden sonra kullanıcı isterse ince ayar yapılabilir. İzin olmadan ana dala merge yok. Dallar / PR'lar stacked ve DRAFT kalır; nihai oyun sürümüne ayrı onay gerekir.
