# Harita 4 — GFX-01 / Gerçek GLB İçerik Hattı ve Çevrimdışı HTML

20 Ekim 2026 — VQ04+ grafik planının **GFX-01 teknik uygulama dalgası**.

## Ne gerçekten hazır?
- Üç **geçerli glTF 2.0 binary / GLB** içeren model kataloğu: `canyon_arch` (kaya kemeri), `observatory_module` (metal radar başlığı), `patrol_fighter` (statik liman avcısı).
- Katalog `assets/gfx01/catalog.json`. Gerçek sanatçı modellerinin daha sonra `assets/gfx01/models/<id>.glb` yoluna yerleştirilmesini destekleyen replacementPath alanları var.
- `tools/gfx01-assets.cjs` glTF binary paketler, temel glTF/GLB başlığını ve aksesuar geometrisini doğrular, SHA-256 üretir. Ön tanımlı üç varlık **kodla oluşturulmuş özgün teknik örnektir**, profesyonel sanatçıların ürettiği son model değildir.
- `tools/build-gfx01-bundle.cjs` pinned Three.js **r128** + aynı sürümün GLTFLoader'ını + Tailwind CSS çıktısını + üç GLB'nin base64 verisini birlikte **tek indirilebilir HTML** içine koyar. Dış Google Fonts çağrısı çıkartılıp yerel sistem fontu fallback'i kullanılır.
- Oyunun `index.html` kaynak sürümü mevcut CDN biçimini ve tüm oyun fizik sistemlerini korur. Gerçek offline release'te `window.Map4ArtAssets.load(id)` ile model yüklenir; GLB parse sonucunun geometri/materyal payload'u cache içinde tutulur, kullanımda scene clone edilir.
- Harita 4'ün üç landmark'ı, ilgili GLB başarılı yüklendiğinde sahnede görünür; eski model yükleme başarısız olursa fallback kalır. Kaya kemerinin eski ana geometri mesh'i yalnız başarılı yüklendikten sonra gizlenir.
- Statik uzay limanı avcısının yeni mesh'i **oynanabilir AI/düşman değil**; görsel varlıktır. Bu dalgada oyun kuralları/ateş/AI/fizik değişmez.
- Oyun zaten bir kez yapılan `buildPlanetaryWorld` üzerinden işlendiğinden tekrar başlatma, üç art modelin ikinci kez yüklenmesini tetiklemez.

## Üretim ve test
CI ya da lokal Node 20+ ortamında:
```bash
npm install --no-save three@0.128.0 tailwindcss@3.4.17 playwright@1.56.1
npx playwright install --with-deps chromium
node tools/build-gfx01-bundle.cjs
node tests/map4-gfx01-offline.cjs
node tests/map4-browser-smoke.cjs
GFX01_HTML_PATH=dist/Uzay_Yarisi_Guncel_Oynanabilir.html node tests/map4-art-baseline.cjs
```

Paket: `dist/Uzay_Yarisi_Guncel_Oynanabilir.html`.
Build doğrulama verisi: `dist/gfx01-build-manifest.json` (SHA-256, GLB kaynak türü, model checksum, boyut).
Her bağımsız GLB'yi geliştirme için `node tools/gfx01-assets.cjs` ile `dist/gfx01/*.glb` olarak da üretmek mümkündür. **Resmî kullanıcı teslimi** tek HTML'dir.

Test, haricî HTTP isteği gerçekleşmesine izin vermeden HTML dosyasını Chromium'da `file://` üzerinden açar; 3 GLB'nin parse edilmesi/üç ayrı mesafede mount olması, önbelleğe yalnız birer kez alınması, Harita 1 izolasyonu, shader/tonemap, kaynak HTML'nin fallback davranışı ve mevcut oyun dengesini kontrol eder.

## Güvenlik / sanat varlığı standardı
Dışarıdan sağlanacak GLB yalnız güvenilir kaynaklardan alınmalı; model lisansı kataloğa yazılmalı, boyut/vertex/accessor sayısı ve materyal/texture bütçesi doğrulanmalıdır. Bu ilk validatör tam glTF schema güvenlik denetiminin yerine geçmez; sonraki aşamada glTF-Validator ve texture budget ile güçlendirilmelidir. HTML içine gömülen GLB'ler güvenilir kullanıcı/kaynak kapsamıyla sınırlıdır.

## Henüz yapılmayan
- Profesyonel elle modellenmiş Blender asset'leri, normal/albedo/roughness profesyonel atlasları, animasyonlu modeller ve gerçek sanatçı kaynak dosyaları.
- LOD0/LOD1/LOD2 mesh pipeline; doku sıkıştırması; megabayt boyutlarda model için streaming/asset paging.
- Gerçek donanımda ölçülmüş FPS; estetik 7/10 veya 8/10 iddiası.
- Oyundaki bütün GFX03 modellerinin GLB'ye taşınması; bu turda 3 proof-of-concept varlık yeterli kabul edilir.

**Sıradaki görsel iş:** Onaylanmış importer üzerine kaya kemeri ve gözleme başlığının gerçek kaliteli GLB modelleri/atlası, ardından 3 rota ve yakın/uzak LOD senaryoları. GFX-01 bu dalgada teknolojiyi kanıtlar; büyük sanat dönüşümü GFX-03/GFX-04 ile sürer.
