# Harita 4 — GFX-04E: Savaş Alanı Işık, Duman ve Zemin Temas Geçişi

Tarih: 21 Ekim 2026. Önceki ana sürüm: `0bd1e4b93ac05009f468e47c332d5f9a6c65bef3`.

## Gerçek oyun içi değişiklik
GFX-04D'deki dört duman kaynağını ve 72 fizik-dışı GPU noktasını koruyarak görsel katmanlama yapıldı. Eski sabit boyutlu `PointsMaterial` yerine Three.js r128 ile çalışan tek `ShaderMaterial` kullanılır. Her duman noktasında gerçek GPU vertex attribute'ları `aSize`, `aFade`, `aTint` vardır. Ateş kaynağında daha yoğun/kahverengi, yükseldikçe genişleyip soğuyan ve seyrekleşen duman hesaplanır. Var olan `h4SmokeAtlas` yeniden kullanılır; her karede yeni CanvasTexture, geometri veya materyal yaratılmaz.

GFX-04C'nin paylaşılan 128 px yanık alfa atlası artık daha düzensiz bir kontur ve kurum yoğunluğu içerir. Düşmüş kruvazör ve merkez savaş sahasına üç yeni yerel geniş zemin izi eklenmiştir. Bunlar aynı plane geometrisi ve materyali paylaşır; yalnız dekoratiftir.

İki yerel, düşük yoğunluklu sıcak `THREE.PointLight` kaynağı kruvazör ve savunma yanında gerçek metal materyallere ışık verir. Onları tamamlayan iki küçük, ışık kaynağı ölçeğinde additive sprite aynı mevcut yumuşak alfa atlasını kullanır. Şiddet yavaş titreşir, yalnız **arena fazı 2** etkinleşir; diğer fazlarda ve yeniden başlatmada sıfırlanır. Yeni yüksek maliyetli shadow map, global post processing veya sahte lazer kaynağı eklenmedi.

## Teknik bütçe ve kabul sınırı
- Duman: 4 kaynak × 18 = 72 nokta, 1 draw call. Kaynak 96 noktalı kıvılcım havuzu değişmedi.
- 3 yeni zemin decal, 2 yerel point light, 2 küçük sıcak çekirdek sprite. GFX-04C'nin 2 savunma altı decali korunur.
- Tüm yeni modeller, ışıklar, görünür kaynaklar **yalnız Map4 arena group** altında bulunur.
- Efektlerin gerçek volumetrik ışık/hacim simülasyonu olduğu iddia edilmez: duman sprite tabanlı shader billboard yaklaşımıdır.
- 60s arena, 300s yarış sınırı, 8 avcı/5 rakip, imha puanları, gemi/engel fizik, Harita 1, kayıt/yeniden başlatma değişmemiştir. Hasar hala `damageHunterTarget` içinde doğrulanmış gerçek isabetle olur.
- Lokal ışık eklemek GPU maliyeti doğurabilir. CI'nin SwiftShader renderer.info sonucu gerçek kullanıcı FPS'si değildir; kullanıcı makinesindeki performans ayrıca incelenmelidir.

## Kanıt
`tests/map4-browser-smoke.cjs`: tek shader, gerçek boyut/alpha/tint vertex attribute'ları; 72 nokta, dinamik duman, 3 zemine bağlı scorch, 2 sıcak ışık ve glow, savaş dışında ışıkların sıfırlanması, restart hafızası, gerçek isabet kıvılcımı, 60s/300s ve Map1 regresyon.

`tests/map4-art-baseline.cjs`: 12 sabit görüntü, önceki kanyon ve arena HUD açık/kapalı sahneleri; yeni kruvazör ve elit savunma için eş kamera ile **sıcak ışık açık / kapalı** karşılaştırma görüntüleri. CI ekran görüntüleri estetik onay için kanıttır, kalite puanı değildir.

Sıradaki öncelikler: daha ayrıntılı güvenilir sanatçı GLB'leri, gerçek baked normal/ORM, dumanın hedef okunurluğu ve gerçek kullanıcı GPU profillemesi, ardından GFX-05 gemi ana silüetleri.
