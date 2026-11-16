# Harita 4 — GFX-05C: Paylaşımlı Motor Egzozu ve Hız Okunurluğu

Tarih: 16 Kasım 2026. Başlangıç ana dal: `16cabc4fd0ff92d9901a9b611fa14a8287fdb751`.

## Mevcut duruma göre yapılan gerçek geliştirme

GFX-05 ve GFX-05B zaten `main` dalında tamamlanmıştı: oyuncu GeoSword + 5 rakip + 8 avcı için 14 gerçek 3D gemi silüeti ve paylaşılan albedo/normal/yıpranma atlasları. Aynı geometrileri tekrar üretmedik. Bu dalga doğrudan **hız ve egzoz görüntüsü** sorununu ele alır.

1. `MAP4_GFX05C_INSTANCED_ENGINE_HEAT`: **tek Three.js `InstancedMesh`**, 14 uzay gemisi için en fazla 28 gerçek 3D konik motor izi. Her nozzle için ayrı GPU draw call/geometry oluşturmak yerine tek paylaşımlı geometri ve atlas kullanılır.
2. **128 × 128 alfayla uçlara doğru seyrekleşen ısı atlası** yalnız bir kez oluşturulur. Renkler mevcut 8 gemi paletindeki motor rengine göre `setColorAt` ile seçilir; `AdditiveBlending`, `depthWrite:false` ve saydamlık kullanılır.
3. Motorlar geminin gerçek 3D matrisini ve yönelimini takip eder: **bank/roll/yerel +Z egzoz ekseni**. `state.currentSpeed`, geminin `isBoosting` ve turbo süresiyle motor uzunluğu/kesiti değişir; yalancı hız veya yapay yavaşlatma eklenmez.
4. Harita 4'ün eski **17 m uzunlukta dikdörtgen rakip hız izleri** gizlenir. Bu görsel artık konik egzozla değiştirilir. Harita 1 için bu kod değiştirilmemiştir; eski hız izi, kamera, gemi ve yarış kuralları aynen korunur.
5. Birim tam 28 instance'lık dinamik matris/renk buffer'ını kullanır, per-frame yeni `Mesh`, `Texture`, `BufferGeometry` veya `Material` yaratmaz. Turret görünümündeki oyuncunun kendi egzozu gösterilmez; ölü avcı veya DNF gemilerinin egzozları atlanır.
6. `startGame` yeniden başlatması sırasında instance sayısı sıfırlanır; tek sahne mesh'i ve paylaşılan dokular yeniden oluşturulmaz. Egzoz ana `planetaryWorldGroup` altında olduğundan Harita 1'de görünmez.

## Test ve kalite sınırları

- `tests/map4-browser-smoke.cjs`: sabit 28 matris kapasitesi, gerçek `InstancedMesh`, bir GPU draw call, ayrı palette instance renkleri, saydam alfa atlası, boost sırasında matris değişimi, Map4 eski kare hız izi sıfır, kaynaklar restart boyunca yeniden kullanılıyor; Map1 dünya izolasyonu.
- `tests/map4-art-baseline.cjs`: aynı kamerada, yeni egzoz **açık / kapalı** iki oyun içi görsel. Eski 12 kıyas kadrajı, arena ve craft yakın planları korunur.
- Herhangi bir yeni silah, avcı, uçuş fiziği, AI, çarpışma, 300 sn toplam görev, 60 sn arena, +1/+3 puan veya 850 irtifa kuralı yoktur.
- Yeni egzoz yalnızca render sanatıdır. Yüksek çözünürlüklü sanatçı GLB/Blender gövdeleri, true refraction heat distortion, ışık kümeleri ve profesyonel Vulkan/DirectX FPS profili bu dalgada tamamlanmaz.
- CI için **Ubuntu 24.04** sabitlenmiştir: GitHub'ın güncel Ubuntu 26.04 image'ı, mevcut Playwright 1.56.1 paketinin Chromium `--with-deps` kurulumuyla uyumlu değildir. Bu düzeltme testlerin yeniden çalışabilmesi içindir; oynanış davranışını değiştirmez.

## Sonraki büyük görsel aşama

**GFX-06 endüstriyel bölge** özgün büyük makine/tesis silüetleri ve malzeme grupları, ardından GFX-07 ışık/fog ve seçici yakın gölgeler. Harita 4'ün yayıncı estetiği kullanıcıdan gelen gerçek oyun ekran görüntüsü değerlendirmesiyle puanlanmalı; otomatik testler yalnız doğruluğu kanıtlar.
