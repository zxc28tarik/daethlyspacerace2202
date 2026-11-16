# Harita 4 — GFX-06D / NEXT-05: Materyal + Performans, İki Adım

**Tarih:** 16 Kasım 2026.  
**Kaynak:** [Kilit kararlar ve görev panosu](ROADMAP_DECISIONS_PROGRESS.md), [grafik master planı](MAP4_GRAPHICS_MASTERPLAN_VQ04_PLUS.md).  
**Bağlı dal:** [GFX06C PR #35](https://github.com/zxc28tarik/daethlyspacerace2202/pull/35) (onun altında VIS02 #34, GFX06B #33, GFX06A #32). Bu kod **ana sürüme henüz alınmamıştır**.

## GFX-06D-A — Paylaşımlı endüstriyel PBR mikro yüzey

- `h4Gfx06dBuildMicroMaps()` gerçek `THREE.CanvasTexture` ile ortak, deterministic, tekrarlanabilir **512×512 normal + 512×512 roughness** haritasını oyun başlangıcında bir defa üretir.
- GFX06M'nin daha önce yapılmış **512×512 koyu/kirli çelik albedo atlası korunur**. Bir arada boya, mikro metal kabartısı, değişen pürüzlülük ve sınırlı oksit yüzey hikâyesi elde edilir. Aynı gövdeye birden fazla katman mesh / ekstra drawcall eklenmez.
- 18 paylaşılan GFX06A, GFX06B, GFX06C, GFX06M ve VIS02 panel malzemesi haritalara bağlanır; aynı `CanvasTexture` nesneleri referans edilir, her parçaya bir atlas kopyalanmaz.
- Renk tonları koyu çelik, işlevsel bakır, aşınmış ve açık boyalı metal farklı kalacak şekilde korunur; sıcak ikaz/soğutucu emissive malzemeleri gereksiz metal kabartı almaz.
- **Güvenlik:** VIS02'nin `h4Vis02Kits` ile birleşen 3D geometrilerinde UV yoktur; UV normal/roughness haritaları bu malzemelere bağlanmaz. Harita 1'in orijinal render malzemelerine dokunulmaz.
- Bu doku üretimi **procedural teknik atlas**tır. Master plandaki nihai el boyaması / baked 1k–2k hero materyalleri **YAPILMADI** kabulünde kalır.

## GFX-06D-B — Gerçek üç kademeli görsel LOD ve mikrodetay bütçesi

- `h4Gfx06dInitializeLod()` ile yalnızca **58 collider bulunmayan W02/VIS02 uzak-yakın sanayi dekoru** LOD sistemi alır. Eski güzelim 4 özgün silüet ailelerinin her birine `LOD0` (mevcut VIS02 tam model), `LOD1` (daha az destek/aksesuar ama ayırt edilir ana biçim), `LOD2` (temel okunan ana silüet) eklenir.
- Paylaşılan **8 düşük detay geometri** tek defa oluşturulur; yeni `Mesh` veya çizim çağrısı yaratmadan, oyuncunun bulunduğu kameranın gerçek dünya mesafesine göre aynı görsel mesh'in `.geometry` referansı değiştirilir.
- Geçiş: 0→1 yaklaşık 2.9 km, 1→2 6.1 km; 2.5/5.55 km geri dönüş eşikleri ile titreşim önlenir. Büyük kamera sıçramalarında tek çağrıda doğrudan en uygun LOD'a geçilir.
- 6 sanayi tesisinin GFX06A/B/C görsel gruplarındaki küçük bant/işaret/vanalar sınıflandırılarak **6 km üzerinde gizlenir, 5.5 km altına gelindiğinde geri yüklenir**. Büyük rafineri, vinç, soğutma kulesi, reaktör ve bina silüetleri asla mesafeyle silinmez.
- **34 fiziksel W02 ve 36 W05 collider gövdesi** LOD'a girmez. Harita 4 faz/AI/rota/hasar/hız/puan, Harita 1 ve restart kuralları değiştirilmez.
- Mesafe ve LOD sayaçları `h4Gfx06dStats` ile test/durum raporuna çıkar; normal bir kare için gereksiz model/texture dosya yüklemesi eklenmez.

## Testler ve kabul

`tests/map4-browser-smoke.cjs`:
- 2 gerçek 512 px atlas; 18 malzemenin **aynı iki haritayı** paylaşması; yeterli roughness varyasyonu, UV olmayan modellerde shader güvenliği;
- 58 yalnız dekorun yakın/orta/uzak mesafede 0/1/2 geometri düzeyine geçtiği ve üçgen/vertex sayısının azaldığı;
- küçük detayın uzak kamera konumunda kapandığı ve yakınken geri geldiği;
- **34 fiziksel W02, 36 W05 collider, sıfır yeni collider ve Map1 izolasyonu**.

`tests/map4-art-baseline.cjs`:
- Eski **12 sabit temel kamera** ve diğer GFX06A/B/C + VIS02 kareleri korunur;
- aynı endüstri sanat nesnesi yakın/orta/uzak üç gerçek motor içi kamerada yakalanır, geometri vertex sayıları ve gerçek render verileri `metrics.json` içine yazılır.

`.github/workflows/map-browser-smoke.yml`: yeni branch üzerinde offline GLB, Harita 1/4 browser smoke, sanat kareleri ve **indirilebilir tek HTML** artifact'ını çalıştırır.

### Açık kabul kapıları

- [ ] Yeni dalın gerçek GitHub Actions CI sonucu **PASS** doğrulanacak.
- [ ] Gerçek 3 kadrajda LOD geçişi, gölgelenme, zemin yakın/uzak davranışı görsel olarak değerlendirilecek.
- [ ] Gerçek hedef GPU'da 1080p FPS / p95 kare zamanı / VRAM ölçülecek; SwiftShader CI sonucu gerçek GPU performansı değildir.
- [ ] Kullanıcı hedefi 7–8/10 için estetik kabul; profesyonel GLB, atlas ve aydınlatma borcu ayrıca açık.
- [ ] PR #32 → #33 → #34 → #35 → GFX06D sırası doğrulanmadan main merge yapılmayacak.

**Aşama durumu:** Kod/JS sözdizimi işlemleri var, **CI/estetik/GPU onayı ayrı** takip edilecek.

## Test sonucu / görsel düzeltme kaydı (16 Kasım)

- [GitHub Actions #43893083267](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43893083267) **SUCCESS**: 14 CI iş adımının tamamı PASS, offline GLB, iki harita Chromium smoke, mevcut 12 sabit kadraj, A/B ve üç ayrı gerçek mesafe LOD görüntüsü. Yeni metal normal+roughness paylaşımı, LOD geometri değişimi ve 34+36 fizik koruması tarayıcıdan doğrulandı.
- İlk CI'de eski VIS-02 testinin dört **temel model ailesi** yerine anlık LOD0/1/2 geometri adlarını sayması 8 gibi fazladan sayı üretmişti. [73a8566](https://github.com/zxc28tarik/daethlyspacerace2202/commit/73a85667c213106f9fa7a98ead7c1112f39a49f0) ile gerçek temel model aileleri sayılıyor. Oyun kodunun fiziği değiştirilmedi.
- **Gerçek geometri kanıtı:** aynı model için LOD0 **396**, LOD1 **180**, LOD2 **108** vertex; düşük mesafe maliyeti açık bir azalma. Ancak örnek üç kamera **farklı konumlar** olduğundan toplam renderer.drawcall karşılaştırması LOD maliyetini saf biçimde ölçmez: yakın 104 / orta 184 / uzak 298 çağrı, kameralar başka objeleri de kapsar.
- Bu karelerde uzak kamera önüne başka yapı girdiği için, görsel kıyasın güvenilir olması adına üç **aynı sabit kamera, sabit ışık, yalnız modelin LOD geometrisi değişen DEBUG görüntüsü** eklendi. Bunlar doğal uzak mesafe oyun görüntüsü diye gösterilmeyecek; gerçek mesafe LOD otomasyonu ayrı zaten PASS. [CI #43894428714](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43894428714) **PASS**: üç adil 1600×900 gerçek renderer screenshot ve model geometrisi 396→180→108 vertex, sabit kamerada 104 drawcall, toplam sahne üçgeni 30.392→30.320→30.296. Bu delta tüm sahnenin değil yalnız seçilen modelin geometri değişimini izole ediyor.
- Testin SwiftShader yazılım render metriği median yaklaşık **1.9 ms**, p95 **2.4 ms**, 18 ölçüm. Bu donanımda oyuncu FPS'sini kanıtlamaz.
- Offline test HTML: tek dosya 5.424.996 bayt. Kaynak model art ve görsel kalite 7–8/10 onayı **hâlâ açık**.

## Sonraki ana görev

**ÖNCE NEXT-05C (açık eksik, atlanmayacak):** Sanayi tesisi decal'leri, servis numaraları, gerçek yüzey aşınma/kurum ve fiziksel temas izi. Paylaşımlı atlas + LOD ile uyumlu olmalı; CI ve önce/sonra estetik kabul gerekir. Bu iş GFX06D ana paketinde henüz yapılmadı.

**SONRA NEXT-06**: 34.000–50.000 arası Harita 4 son bölgede üç büyük sanat odağı: hudut karakolu (LM10), askerî uzay limanı (LM11), yörünge fırlatma kompleksi (LM12). Sözleşme: mevcut 850 irtifa, 5 rakip, 8 avcı, 300 saniye deadline ve önceden kararlaştırılan harita kimliği korunacak.

