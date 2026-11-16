# Harita 4 — GFX-06B / NEXT-03: Ağır Pres ve Soğutma Kompleksi

**16 Kasım 2026.** Stacked base: `codex/map4-gfx06a-refinery-transfer-art` ([GFX-06A, PR #32](https://github.com/zxc28tarik/daethlyspacerace2202/pull/32)).
Bu iş `IN-03` (21.850) ve `IN-04` (24.950) ile sınırlıdır. [Karar/ilerleme kaydı](ROADMAP_DECISIONS_PROGRESS.md) ve [master grafik planı](MAP4_GRAPHICS_MASTERPLAN_VQ04_PLUS.md) korunur.

## Gerçekten oyun koduna eklenen

### IN-03 — Ağır pres ve montaj

- `MAP4_GFX06B_IN03_HEAVY_PRESS_ASSEMBLY` adlı yalnızca görsel art grubu.
- İki büyük **gerçek boşluklu, kalın ekstrüzyonlu pres kemeri** (`THREE.Shape` + `THREE.Path` deliği + `ExtrudeGeometry`), birbirinden farklı yükseklik ve açıklık.
- Her presin büyük üst traversi, hidrolik piston kolonu, kalıp/tabla, yanal ana taşıyıcılar ve zırh-kilit halkası.
- Presleri bağlayan geniş montaj güvertesi, üstten servis/vinç traversi, kablo ve askı, dört konveyör makarası, ikaz lambaları.
- Büyük işlevsel okuma: iki ayrı ağır makinenin üretim kapısı, altta preslenen yük, ortada taşıma/gantry; sadece rastgele bina yığını değil.

### IN-04 — Enerji kazanımı ve soğutma

- `MAP4_GFX06B_IN04_COOLING_RECLAMATION` adlı yalnızca görsel art grubu.
- **İki farklı yükseklikte açık üstlü hiperbolik soğutma kulesi**, 24 dilimli özgün `LatheGeometry` profili (tek/çok parçalı basit kutu formu değil).
- Üst baca halkası, servis/termal bantlar, koruma ve fan halkası, üst ikaz lambaları.
- Altta ağır türbin/jeneratör salonu, üç kondenser çekirdeği ve soğutucu hatlar.
- Beyaz-krem kule, koyu çelik, oksitli bakır, cyan soğutma ve amber uyarı materyalleri.

### Ortak sistem / performans

- `H4_GFX06B_GEO` ve `H4_GFX06B_MAT` katalogları kod başlangıcında **tek kez** hazırlanır, istasyonlar oluşturulurken yeniden kullanılır.
- Yeni mesh'ler `h4Gfx06bStation` ile yalnızca **istasyon 3 ve 4** içinde kuruluyor; istasyon 1/2'nin GFX-06A sanatları ve 5/6'nın mevcut görünümü bozulmuyor.
- Rastgele dekor, ek gölge haritası, framebuffer/volumetric pass veya per-frame texture yaratılmadı. Son GPU profilinde draw-call optimizasyonu değerlendirilmelidir.
- Eski tekrar edilen `SILO/BEACON/REFINERY` kozmetik mesh'leri yalnız kendi `h4Collider` kaydı yoksa gizleniyor; fiziksel köprü, boru ve kuleler aynı.
- Yeni modeller sanayi savaş/yarış hatlarının doğu dış panoramasındadır; **yeni hiç collider yok**.

## Değişmez sözleşme

- **36 mevcut W05 collider ve 6 W03 kaya collider**, +%12 hızlı düşük boru, güvenli üst, doğu avcı hattı aynı.
- 5 rakip, 8 avcı, 60 saniyelik arena kilidi, 300 saniye toplam görev ve 850 yükselme şartı aynı.
- Harita 1'in görsel dili, kamera, hız, fizik, HUD ve yarış kuralları değişmedi.
- Yeni mesh'ler `visualOnly`; herhangi bir silah hedefi, yapay görünmez duvar veya puan yok.
- Bu paket **son artist-made GLB, baked PBR 2K, fiziksel gölge veya yayıncı grafiği kabulü değildir**.

## Testler ve kabul kapısı

- `tests/map4-browser-smoke.cjs`: iki ayrık grup, iki `ExtrudeGeometry` pres kemeri, iki `LatheGeometry` soğutma kulesi, en az 20 parça/tesis, farklı materyaller, eski kozmetiklerin gizlenmesi, sıfır GFX-06B collider ve mevcut 36 W05 collider. GFX-06A'nın 1/2 tesisleri de korunacak.
- `tests/map4-art-baseline.cjs`: aynı 12 orijinal kadraja **dokunmadan**, üçüncü ve dördüncü tesis için 4 adet HUD açık/kapalı gerçek oyun ekran görüntüsü ve renderer.info istatistikleri.
- `.github/workflows/map-browser-smoke.yml`: bu stacked branch üstünde Chromium smoke/offline/art testleri. Runner Ubuntu 24.04.
- Sadece JavaScript sözdizim doğrulaması yerel kod kontrolünden geçti; **CI ve gerçek PC FPS doğrulanmadan birleşmeyecek.**

## Kayda geçmiş öncelikli hata

GFX-06A'daki ilk CI [run #43875886124](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43875886124) **FAIL**. `map4-gfx01-offline.cjs` PASS, fakat browser smoke satır 667'deki 'six ships start in wider formation' iddiası, gerçek **başlangıç** yerine önceki testler sırasında hareket etmiş AI pilotlarının konumunu ölçüyordu. Bu hata GFX-06A ve GFX-06B dallarında, rakiplerin mesafesini başlangıç düğmesine tıklanır tıklanmaz kaydetme ve daha sonraki hareket için finite lane kontrolüyle değiştirildi. **Yeni CI PASS ayrı doğrulanacak.**

## VIS-01 / GFX-06M — gerçek oyun kareleriyle belirlenen ortak kalite onarımı

[GFX-06A Chromium kanıtları](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43880186485) ve [GFX-06B ilk başarılı Chromium kanıtları](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43880399850) incelendi. Kod testleri PASS olmasına rağmen ilk gerçek oyun karelerinde zeminde yoğun kareli desen ve pek çok parlak tekrarlı mavi-gri metal kutu, özgün yapıların büyük/orta/ufak ölçek hiyerarşisini bastırıyordu. Bu nedenle art kalitesi **ONAYLANMADI**; yalnız yeni yapı eklemek yerine ortak kök malzeme sorunu ele alındı.

- Yalnız `Map4` sanayi bölgesine özel iki adet paylaşılan **512×512 yeni albedo atlası**: yumuşak aşınmış zemin ve metal çizgisi/kareli panel içermeyen kirli çelik. Deterministik ve tekrar edilebilir düşük kontrastlı dalga/noise; ayrı her binaya texture üretilmez.
- Sanayi zemininin mevcut orijinal vertex konumları korunur, yalnız albedo atlası, normal kabartma ölçeği ve endüstriye özel vertex renk bantlaması daha doğal hâle gelir. **Yeni toprak collider yoktur.**
- Yalnız endüstri grubunda eski malzeme nesneleri, GFX06A ve GFX06B'deki seçili ağır metal materyalleri `Map` referansı üzerinden ortak yeni boya/koyu zırh/sıcak çelik varyantlarına bağlanır. Mesh konumu, geometri, ölçek ve eski collider referansları **aynen kalır**. Harita 1'e/diğer fazlara global malzeme değişikliği uygulanmaz.
- `tests/map4-browser-smoke.cjs` ortak atlas sayısı, yeniden materyallenmiş mesh sayısı, 36 mevcut collider, endüstri-only izolasyon, açık hedef koridoru ve renkli zeminin normal ölçeğini test eder.
- **Bu düzeltme henüz yeni Chromium görsel/performans kabulünden geçmemiştir.** Üçüncü/dördüncü tesis, sonraki screenshot karşılaştırmasında yeni ortak malzeme ile yeniden değerlendirilecektir. Nihai el boyaması 2K texture ve 3D model kalitesi hâlâ açık.

Bu alt işin takibi: `VIS-01`. Grafik master planındaki GFX-06 materyal kalemi **kısmi** kalmaya devam eder.

## Sonraki sıralama

1. GFX-06A testlerini tamamlayıp görselleri değerlendirerek PR #32'yi kapat; bu belge baz dal birleşmesine hazır olacak.
2. GFX-06B'yi kendi browser/art/offline CI ve görsel inceleme kapısından geçir.
3. **NEXT-04 / GFX-06C / IN-05–06:** Lojistik-vinç alanı ve son jeneratör/güvenlik santrali, farklı özgün silüetlerle.
4. **NEXT-05 / GFX-06D:** yüzey atlasları, decal, LOD ve gerçek GPU optimizasyonu.
5. Tam sanayi görsel kabulü, ardından üs/yörünge alanı ve GFX-07 ışık/atmosfer işleri.

**Durum:** Ayrı dalda kod + test hazır, henüz görsel kalite ve performans olarak kabul edilmemiştir.
