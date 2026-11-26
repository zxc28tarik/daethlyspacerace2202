# NEXT11C21C — SB-07 ZENİT yarış kırmızısı akış sonlandırması

**20 Kasım 2026.** Temel: [C21B Balanced](MAP1_NEXT11C21B_BALANCED_COLOR_IDENTITY.md), PR #93 `codex/map1-sb07-zenit-balanced-colors-21b`.

## Sınırlar

Kullanıcının seçtiği Balanced tasarımda **aynı SB-07 gövdesi**, özgün 1× MSAA, eski 189 parça / 7 merge batch + 2 glow, yarış fiziği, B-04 Map4 ve 304 rail birleşimi korunur. Yalnız mevcut **RED geometry vertexColor** katsayıları revize edilir; parça, decal, mesh, material, ışık, yeni texture, postprocess, AA ve FPS optimizasyonu eklenmez. RED base renk `#C43838`, malzemenin roughness/metalness/emissive değerleri ve diğer 6 malzeme ailesi değiştirilmez.

## Renk akışı

C21B RED tonu tüm şeritte neredeyse aynıyken, C21C mevcut şeridin **ön/dış kanat doğrultusunu** daha okunaklı yapar. Mevcut `wingEdge` softstep ağırlığı, `sweep = wingEdge × clamp((3-z)/7)` ile öne doğru sönümlenir. Yeşil/mavi pigment çarpanları dış/ön kanatlarda küçük miktar azalır: kırmızı daha temiz yarış boyası olur. İç bağlantı, burun ve daha arkadaki bölümler ağır kırmızı bloklara dönüşmez; kademeler sürekli, keskin boya sınırı yoktur.

`index.html` içindeki yalnız **RED** formülü:
- R: `.985 + .010*nose + .009*sweep`
- G: `.755 - .034*nose - .058*sweep + .008*roof`
- B: `.780 - .032*nose - .058*sweep + .006*roof`

Eski C21B rengini geri getirmek için yalnız bu üç formülü C21B seviyesine döndürmek yeterlidir. C21B kimlik sürümü korunmuş; ek doğrulama için `raceRedFlowVersion=NEXT11C21C` eklendi.

## Doğrulama

`tests/map1-next11c21c-red-flow.cjs` gerçek Chromium/Three r128 GPU `color` attribute verisinde hesaplanan pigmenti doğrular. Aynı **orijinal RED vertex buffer** üzerinde önce C21B renkleri yeniden kurulur, sonra C21C verisi geri yüklenir. Aynı ışık, kamera ve 1600×900 native WebGL framebuffer ile `rear-quarter` ve `top` A/B görüntüleri, farklı piksel metrikleri ve JSON rapor kaydedilir. Ölçülebilir RGB farkı estetik onayın yerine geçmez.

Ayrı CI: `.github/workflows/map1-next11c21c-red-flow.yml`. Kapsamlı `map-browser-smoke.yml` içinden C21C kontrolü de çalışır. C21A PBR, C21B renk hiyerarşisi, SB-07 yarış/boost, B-04 fizik ve ray bağlantıları regresyonları korunur.

**Kabul kuralı:** Son HEAD CI sonucu SUCCESS olmadan test PASS denmez; ekran görüntüleri incelenmeden estetik başarı kesinleşmez. C21C yeni dalı PR #93 üstüne taslak PR olarak ilerler; hiçbir ana dal birleştirmesi kullanıcı açık onayı olmadan yapılmaz.

**Sıradaki:** NEXT11C21D — koyu motor metalinin, mavi plazmanın ve küçük amber işaretlerin son denge kontrolü. Sonra NEXT11C21E son sanat/renk kilidi.
