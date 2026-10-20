# Harita 4 — GFX-01B: Üç Detaylı GLB, Doku Atlası ve Mesafe LOD Sistemi

Tarih: 20 Ekim 2026
Başlangıç: GFX-01 ana dal commit'i `18fd9a80be0f0c376711ef7dd3b1b7a94048e883`

## Oyun içinde gerçekten değişenler
- Kızıl Kaya Kapısı'nın içi açık, kalın taş destekleri olan GLB çekirdeği 3 LOD seviyesinde yeniden modellenmiştir; yüksek LOD'da aşınmış kemer kenarları ve taş çizgileri bulunur.
- Gözleme anteni: daha fazla yüzlü gerçek eğimli çanak, kenar bileşenleri ve bağlantı/tutucu parçaları.
- Askerî uzay limanındaki **statik** avcı: farklı kesitlerle model edilmiş gövde, süpürülmüş kanatlar, kuyruk dengeleyici, kokpit ve çift motor nozul detayı. Bu model oynanabilir/AI gemisine dönüşmemiştir.
- Her model için LOD0 (yakın), LOD1 (orta) ve LOD2 (uzak) glTF 2.0 GLB. Katalog ana kimlikleri korunur; iki uzak sürüm `_lod1` / `_lod2` olarak gelir.
- Deterministik 256² **kaya ve metal albedo PNG atlasları**, glTF modelin içindeki binary image bufferView olarak saklanır. GLB texture/buffer/UV içerir, ağdan görüntü çekmez.
- İçerik kayıt/parse önbelleği GLB başına bir defa; `scene.clone` ile kullanılan kopyalar geometri ve materyali paylaşır.
- Kullanıcının kamerasına bağlı sahici üç seviye LOD geçişi, mesafe bandı histerezisi; her anda tek seviye görünür. Per-frame yeni mesh/geometri/atlas üretilmez.
- Her modelin eski procedural fallback'i yalnız üç GLB başarıyla yüklenirse gizlenir. Yükleme hatasında eski geometri korunur.
- Harita 4 dışına yayılan hiçbir gemi/terrain materyal değişikliği yok.

## Kesin sınırlar
- Bu modeller **kodla oluşturulmuş özgün sanat prototipleridir**, elle modellenmiş profesyonel Blender/FBX veya satın alınmış lisanslı modeller değildir.
- LOD sisteminde her seviye oyun açıldığında önceden yüklenir; düzeyler arası geçişin maliyeti mesh görünürlük değişimidir. Yükleme süresi ve HTML boyutu artabilir; ölçüm gerekli.
- GLB'nin kabul ettiği UV, albedo PNG ve fiziksel materyal glTF PBR kanalları vardır; normal/AO/metallicRoughness atlası henüz profesyonel dış kaynak olarak hazırlanmamıştır.
- Artefaktın estetik puanı kullanıcı görselleriyle belirlenir; otomatik test 7/10 grafik kalitesi iddia edemez.
- Oluşturulan 9 GLB (3 model × 3 LOD) art varlığıdır; 12 landmark'ın tamamı veya oynanabilir tüm gemiler henüz bu sisteme geçirilmedi.

## Testler
1. `node tools/build-gfx01-bundle.cjs` — tüm modeller ve CDN içermeyen tek HTML paketini üretir.
2. `node tests/map4-gfx01-offline.cjs` — offline Chromium içinde 9 GLB parse, 3 world mount, UV/texture kontrolü, detay geometrisi azalan LOD0 > LOD1 > LOD2, yakın/orta/uzak geçiş, cache, tekrar eski Map1'e geçiş ve 0 HTTP isteği.
3. `node tests/map4-browser-smoke.cjs` — 60 saniyelik arena, oyun bitişi, 8 avcı, 5 rakip, 36 sanayi + 6 kaya fizik collider, restart ve Map1 görünüş regresyonu.
4. `node tests/map4-art-baseline.cjs` — aynı 12 kamera kadrajı ve 3 yakın hero görünümü, kare bazlı renderer.info performans verileri ve karşılaştırma çıktısı.
5. Başarılı CI üzerine güncel HTML Release'in SHA ve source commit eşleşmesi.

## Sıradaki gerçek görsel kalite dalgası
- Her 3 model için artist-made glTF/GLB ile değiştirme ve 2K civarında gerçek PBR texture atlas (baseColor, normal, orm), sanat stilinin kontrolü.
- GFX-03/04 için Kırık Mesa'nın kendi GLB ana gövdesi ve savaş arenasının düşmüş kruvazör/savunma modeli; daha büyük sahne formunda okunabilir sanat.
- Kullanıcının görsel puanı + gerçek PC GPU FPS sonuçları, ardından LOD eşikleri ve atlas sıkıştırma.
