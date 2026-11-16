# Harita 4 — GFX-06C / NEXT-04 | IN-05 Lojistik ve IN-06 Enerji-Güvenlik

**Güncelleme:** 16 Kasım 2026. **Durum:** Kod + test otomasyonu **geliştirme dalında**, CI ve gerçek görsel kabul kontrolü açık.  
**Bağlantılı iş:** [VIS-02 / PR #34](https://github.com/zxc28tarik/daethlyspacerace2202/pull/34) üzerine bağımlı; onun altındaki [GFX-06B / PR #33](https://github.com/zxc28tarik/daethlyspacerace2202/pull/33) ve [GFX-06A / PR #32](https://github.com/zxc28tarik/daethlyspacerace2202/pull/32) devamlılığı korunuyor. Ana sürümün içeriğiyle karıştırılmamalıdır.

## Uygulanan orijinal görsel tasarım

### IN-05 / ilerleme 28.150 — Intermodal kargo limanı

- Dış silüette **iki büyük içi boş, trapez taşıyıcılı vinç kemeri**; `THREE.Shape` + iç delikli `THREE.Path` ile gerçek `ExtrudeGeometry`, normal düz kutu değil.
- İki portal vinç için yatay üst kiriş, makaralı taşıyıcı, askı kablosu, konteyner taşıma yayıcı barları ve havada asılı gerçek yük blokları.
- Uzun yükleme güvertesi, iki paralel servis rayı, dört destek/servis bağlantısı ve **beş istif konteyner** + kenar takviyeleri.
- Koyu çelik, oksitli pirinç, açık kargo boya ve sıcak ikaz vurgusu; önceki fabrika silüetlerinden belirgin şekilde yatay ve lojistik.
- Oyun sahnesindeki grup adı: `MAP4_GFX06C_IN05_INTERMODAL_LOGISTICS`.

### IN-06 / ilerleme 31.500 — Reaktör ve güvenlik güç hattı

- **İki farklı açılı büyük enerji halkası**, her birinin içinde bağımsız 3D `IcosahedronGeometry` çekirdek. Bu halkalar kozmetik sanayi işaretleridir; geçilmesi gereken gerçek yarışı bitirme kapısı değildir.
- Her reaktörü taşıyan çift büyük destek pilonu, hizmet başlıkları, ağır santral güvertesi.
- Son hat üzerinde üç ayrı transformatör, halkalı izolasyon bobinleri, paralel enerji/soğutucu transfer boruları ve güvenlik ikaz işaretleri.
- GFX-06C önceden oluşturulan paylaşılmış 3D geometri ve metal materyal kataloğunu kullanır; sınırlı mavi ışık ve bakır-koyu çelik kontrastıyla aşırı neon kirliliği engellenir.
- Grup adı: `MAP4_GFX06C_IN06_REACTOR_SECURITY_POWER`.

## Fizik ve süreklilik sözleşmesi

- Yeni modeller `h4BuildGfx06cStation(station,at,index)` ile **yalnız 5. ve 6. kompleks** içinde, dış panorama x koordinatlarında oluşturulur. `userData.visualOnly` ve `w05VisualOnly` doğru işaretlenir.
- `h4IndustrialColliders` **36 adet**, diğer `planetaryBuildingColliders` ve **6 kanyon kayası** kayıtları korunur; yeni `h4Collider` yoktur.
- Eski W05 `SILO/BEACON/REFINERY` görsellerinden **fizik bağlantısı olmayanlar** gizlenebilir, ama `h4Collider` bulunan herhangi bir model asla gizlenmez.
- İlk dört GFX06A/B tesisi, 58 VIS02 yeni silüeti ve 34 fiziksel W02 yapının görsel-çarpışma eşleşmesi aynen korunur.
- Harita 1 yarış/gemi/kamera, Harita 4'ün 60 saniyelik avcı arenası, 300 saniye üst süresi, 5 rakip+8 avcı, 850 irtifa ve kısa yol bonusları değiştirilmez.
- Ek web/CDN bağımlılığı yok; mevcut offline tek HTML oluşturma betiği geçerli kalır.

## Testlerin hedefi

- `tests/map4-browser-smoke.cjs`: 2 yeni istasyon grubu, 2 özgün `ExtrudeGeometry` kargo vinci, 5 yük konteyneri, 2 reaktör toroid, 3 transformatör; gerçek farklı geometriler, yalnız dekor, fizik hacimleri aynen 36, IN01–04 korunuyor.
- `tests/map4-art-baseline.cjs`: eski 12 sabit görüntü ve önceki A/B kareleri korunarak **IN05 + IN06 için dört ek gerçek 1600×900 oyun içi ekran** (HUD açık/kapalı) alınır.
- CI: Ubuntu 24.04 üzerinde Chromium smoke + offline paket + görsel artefakt. **Yeni CI sonucu doğrulanmadan PASS yazılmayacak.**
- Gerçek GPU FPS / bellek / oyuncu estetik onayı **ayrı açık kabul kapılarıdır**.

## 16 Kasım son doğrulama — kod/CI PASS, görsel final RED

- **Gerçek GitHub Actions CI PASS:** [#43888729100](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43888729100): `GFX01 OFFLINE`, Harita 1/4 browser smoke, GFX06C 2 yeni istasyon assert'leri, bütün önceki VIS02 A/B ve sanat baseline kareleri, tek HTML build ve artifact upload adımları başarılı.
- İn-engine [sanat artefaktları](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43888729100): `gfx06c-in05-freight-gantries*.png` ve `gfx06c-in06-power-reactor*.png`, her biri HUD açık/kapalı gerçek 1600×900.
- Kamera kanıtı: IN05 **34 görsel mesh**, **82 draw call / 37.550 üçgen**; IN06 **26 görsel mesh**, **58 draw call / 39.390 üçgen** (bu sayılar kamera/kadrajın **toplam render değeridir**, sadece yeni modellerin maliyeti değildir).
- Genel sabit sanayi örnek kadrajlarında `07` ~505 draw call /84.178 üçgen, `08` ~368 /63.588, `09` ~286 /33.486. Bu rakamların desktop GPU FPS olduğu iddia edilmez.
- 18 örnekli SwiftShader yazılım render süreleri yaklaşık median **1,5 ms**, p95 **2,0 ms**; gerçek kullanıcı GPU / VRAM / sürüş sırasında p95 FPS ayrı ölçülmeli.
- **Gerçek görsel inceleme:** IN05 montaj lojistik kapısı ve IN06 çift enerji halkası ayırt edilebilir; fakat zemin tekrarları, küçük sanat modellerinin basitliği, atmosferik ışık ve yakın mikrodoku halen yayıncı 7–8/10 hedefi için yetersiz. **Nihai görsel onay verilmedi.**
- **Oynanabilir dal önizlemesi:** CI artifact `map4-current-branch-playable-html`, [artefakt #14235259166](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43888729100/artifacts/14235259166); tek HTML **5.413.076 bayt**, çevrimdışı GLB testinden geçti. Bu ana dal sürümü değildir.
- PR #35 **DRAFT** kalır. Alt PR #34, #33, #32 sırası korunur, görsel/performans borçları kaybolmaz.

## Burada kapatılmayan işler

- IN-01..06 artık temel özgün görsel denemeleri bakımından kodlanmış olabilir; **profesyonel el işlenmiş GLB modeller, nihai PBR/normal/ORM bake, detay LOD, kurgu ışığı ve 7–8/10 kullanıcı estetik kabulü tamamlanmış değildir**.
- GFX06D materyal/LOD/optimizasyon, üs/uzay limanı/yörünge dev yapı, GFX07–11 ve yayıncı üç oynanabilir harita standardı halen açık.
- VIS02 toplu kaplama çiziminde görünür sahnede üçgen sayısı yükselmiştir; yeni birimler için gerçek GPU ölçümü ve kademeli LOD gerekli.

**Sonraki sıra:** CI ve görselleri gerçek olarak incele, sorunları düzelt, tracker üzerinde kod/test/estetik ayrı statüleri güncelle; sonra GFX06D ve üs/yörünge sanatları.
