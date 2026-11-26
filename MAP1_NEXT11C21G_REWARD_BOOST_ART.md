# NEXT11C21G — Mor ödül kutusu ve yalnızca kazanılan HYPER TURBO görseli

## Kullanıcının açık düzeltmesi
Bu paket **Shift/W ile kullanılan normal boostu geliştirmez**. Kullanıcının istediği, Harita 1'de toplanan **ödül boostu** ve ödül objeleri görselidir. Normal boost, SB-07'nin ana şekli/renkleri, meteorler ve engeller bu PR'da **değişmez**.

## Gerçek oynanışın korunması
- Mor kutu rastgele HYPER_TURBO / SHIELD / ENERGY verir; kutuya önceden HYPER simgesi koyulmaz.
- Mevcut ödül oranları, 1.25 saniyelik HYPER süresi, hız, skor, enerji ve oyuncuya verilen 12 saniyelik lazer değiştirilmez.
- Kutu sweep collision radius=49, pozisyonları ve dağılımı değişmez. Rakipler aynı RNG algoritmasına tabidir.
- Eski 189 parçalık SB-07, yedi malzeme geometrisi, iki motor sprite'ı olduğu gibi korunur.

## Görsel uygulama
1. **Tüm mor ödül kapsülleri:** daha kontrollü yarı saydam violet-metal panel, daha okunur mor kenar, mavi parlak çekirdek ve eski 49'luk çarpışma sınırının içinde dönen **tek ortak geometrili mor orbital halka**. Bu, boostu önceden işaretlemez; her ödül için geçerlidir.
2. **Yalnız HYPER_TURBO kazanıldığında:** geminin mevcut iki motoru arkasında iki kısa mor plazma izi + iki mor-beyaz motor rim halkası görünür. Dört görsel mesh **SB-07 root altında değil**, ayrı ve collision'sız sibling'dir. Normal W/Shift boostu bu efekti **asla** açamaz.
3. Kısa süreli düşük opaklık animasyonu, depthWrite=false; postprocessing, yeni spot ışığı, kamera FOV, motion blur, oyun fiziği eklenmez. HYPER süresi dolduğu anda efekt görünmez.

## Gerçek kabul
Dedicated [NEXT11C21G CI](.github/workflows/map1-next11c21g-reward-hyper.yml) ve [full Map1/Map4 smoke](.github/workflows/map-browser-smoke.yml). Test gerçek Chromium/Three r128 ve 1600×900 1× native MSAA üzerinde **manual** (efekt KAPALI) / ödül (AÇIK) / ödül süresi bitmiş (KAPALI) ekranlarını, GPU draw-call farkını, gerçek HYPER ödül algoritmasını, lazeri, Map4 fizik muhafazasını karşılaştırır.

CI bitmeden PASS iddia edilmez. PR draft ve önceki #97 üzerine stacked; kullanıcı açık onayı olmadan main'e merge yok.

## Sonraki etaplar
NEXT11C21H meteorit yüzey/siluet/ışık; NEXT11C21I çarpışmalı engel-vs-dekor okunurluğu; NEXT11C21J hit/near-miss.
