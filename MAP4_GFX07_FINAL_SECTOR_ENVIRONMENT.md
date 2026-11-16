# Harita 4 — GFX-07 / NEXT-07 | Son Sektör Çevre Silüeti, Atmosfer ve Seçici Işık

**16 Kasım 2026** · Kullanıcının **tek `.` komutunun** bir sonraki gelişim adımı.  
**Bağımlılık:** [NEXT-06 PR #38](https://github.com/zxc28tarik/daethlyspacerace2202/pull/38) üzerine yeni geliştirme dalı. Alttaki PR #37→#36→#35→#34→#33→#32 zinciri korunur. Çalışma **ana dalda değildir**.

## Uygulanan kod

### GFX-07A — 86 tekrarlı çevre silüetini değiştir

NEXT-06 gerçek Chromium kareleri üzerinde son bölümdeki koridor ve W02 ufuk hattında tekrar eden düz kutu/silindirler önemli görsel borç olarak tespit edildi. **28 adet W01 koridor binası**, **30 yakın W02 dekor** ve **28 uzak W02 dekor**, aynı Mesh/transform ve görünürlük bağlamları korunarak özgün beş paylaşımlı `BufferGeometry` ailesiyle değiştirilir:

- `0`: Kademeli askerî depo/perimetre sığınağı.
- `1`: Açık iç mekân boşluğuna sahip `ExtrudeGeometry` hangar.
- `2`: Radar gövdesi, platform ve üst radom.
- `3`: Boşluklu servis gantrisi.
- `4`: Haberleşme/komuta spiri ve disk anten.

**5 paylaşımlı geometri, tek ortak vertex-color StandardMaterial.** Her eski dekoratif Mesh'in referansı korunur; hem eski `geometry` hem eski `material` yalnız aynı kameradan A/B kanıtı için `userData` içinde durur. Kod hareketli savaş sistemine, 6 kanyon / 36 endüstri collider'ına ve Harita 1'e yeni obje eklemez. Eski W01 ek beacon/geçit objeleri aynen kalır.

### GFX-07B — Sadece son bölge zemin sanatını iyileştir

512×512 bir defa üretilen deterministic mat metal-toprak atlası (`MAP4_GFX07_512_FINAL_GROUND_MATTE_ATLAS`), yalnız `def.type==='fortress'` zemininde kullanılır. Daha yumuşak vertex-color kontur ve büyük ölçekli düşük kontrast lekelerle ağır checkerboard bantları azaltılır. Kanyon, arena ve endüstri zemin map/terrain ve normal ayarları değiştirilmez. Zemin **yalnız görüntü**, çarpışma değil.

### GFX-07C — Ölçülü yerel ışık, temas gölgesi ve geçiş

- LM10 karakol, LM11 liman, LM12 fırlatma için mevcut soft `h4ShadowPlane` / `h4ShadowMat` dokusundan **3 adet dekoratif yer temas gölgesi**. Renderer global shadowMap kapıları değiştirilmez, yeni görsel hitbox yok.
- Üç büyük nokta için **3 PointLight** yalnız Harita 4'ün son fazında ve progress uzaklığı 3.500'ün altına indiğinde etkinleşir. Harita 1'de ana grup zaten görünmez; önceki bölgelerde bu ışıklar kapanır. Bu geniş sahneye üç sürekli dinamik shadowMap değil, yakın kompozisyona sınırlı yüzey vurgusudur.
- Atmosferde son bölgenin 34.000–38.200 ilerleme arasında ek yumuşak sis azaltımı ve anahtar/kenar ışığı renk ayrımı; yükselişte 850+ irtifa ve atmosfer sönümü önceki VQ04 geçişleriyle devam eder. Diğer üç bölgenin atmosferi korunur.

## Korunan kararlar / oynanış

- Harita 4: **0–50.000, dört bölüm, 60 sn arena kilidi, toplam 300 sn, son bölüm 850+ irtifa**.
- Aynı 5 yarışçı ve 8 avcı, gerçek +1/+3 imha puanı, +%12 sanayi hızlı boru, +%18 vadi hızlı rota.
- Aynı 12 landmark kimliği, LM10/LM11/LM12 NEXT06 sanat grupları, GFX01 GLB `patrol_fighter`, 6 W03 kaya / 36 W05 endüstri collider / 34 fiziksel W02 gövde.
- Tüm GFX07 yeni Mesh'ler `visualOnly`, mevcut referanslar korunur; **yeni fizik hacmi sıfır**. Restart'ta dünya bir kere kurulur, yeni tekrarlı instantiate yok.
- Harita 1 oyuncu fizik/kamera/HUD/tonemap ve kendi ışıkları hiç değiştirilmez. Ortak dünya yalnız Map4 görünür ve GFX07 sektör 4'te sınırlıdır.

## Test/Kabul

- `tests/map4-browser-smoke.cjs`: **28+30+28=86** görsel değişim; 5 benzersiz geometri; 512px final zemin, Canyon/Industry eski atlası korunması; **3 bounce light + 3 paylaşılan soft shadow**; sanayide sıfır yeni yerel ışık, sonda yalnız yakın 1–2 ışık; 6 canyon + 36 sanayi collider ve Map1 regresyonu.
- `tests/map4-art-baseline.cjs`: önceki **12 sabit kamera** ve NEXT06 üç landmark A/B korunarak, LM10 / LM11 / LM12 için **3 yeni gerçek sabit-kamera çevre önce/sonra çifti** (toplam 6 PNG). Testte yalnız GFX07 dekor geometrileri/zemin atlası/yerel ışık ve temas gölgeleri toggle edilir. `metrics.json` aynı kamera drawcall/üçgen ve gerçek PNG değişim kontrolü içerir.
- GitHub Actions: Ubuntu24.04 Chromium, offline GLB ve **oynanabilir tek HTML** artefaktı. **CI sonucu görülmeden PASS yazılmaz**.
- Son görsel estetik hedef **7–8/10**, artist-made GLB/baked textures, yüksek kalite gerçek fizik gölgeleri, GPU FPS/p95/VRAM **ayrı açık kapılar**. Bu PR yaratıldığında son kabul verilmez.

## Gerçek test ve ilk görüntü incelemesi — 16 Kasım

- İlk tam [GitHub Actions #43940280465](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43940280465) **PASS**; çevrimdışı tek HTML ve GLB yükleme, Harita 1/4 Chromium smoke, eski 12 sabit kare ve üç son bölge eski/yeni kare çifti başarıyla oluşturuldu.
- İlk aynı-kamera görüntülerin ölçümü: LM10 karakol **123→124 drawcall, 30.656→36.810 üçgen**; LM11 liman **119→119 drawcall, 13.430→18.040 üçgen**; LM12 fırlatma **66→67 drawcall, 13.390→14.968 üçgen**. Her karşılaştırmada kamera sabit, 86 orijinal decorative Mesh nesnesi korunuyor, 36 sanayi collider değişmedi; PNG gerçek piksel değişimi doğrulandı. Bunlar SwiftShader toplam sahne sayılarıdır, gerçek GPU FPS değil.
- **Görsel incelemede onaylanmayan nokta:** İlk GFX07 pass görüntülerinde aşırı aydınlık/gri-beyaz son bölge zemini ve açık beton askeri silüetler, alt hedefteki gerçek sinematik derinliği zayıflatıyordu. Bu nedenle “ilk CI PASS = estetik tamamlandı” kabul edilmedi.
- [311ef7d](https://github.com/zxc28tarik/daethlyspacerace2202/commit/311ef7d1897b05eaf4c42f7cf03f1cad558279f0) ile final-bölge matte atlası 191–199 RGB'den 165–180 aralığına çekildi, zemin vertex tint ve metal kit malzeme tonu koyulaştırıldı, dev kayalık normalMap'i son askerî zemininden kaldırıldı, son bölümde gökyüzü cirrus bandı azaltıldı ve ortam ışığı daha kontrollü hale getirildi. Önceki sektör ve Map1 bu değişiklikte korunur.
- [525d235](https://github.com/zxc28tarik/daethlyspacerace2202/commit/525d235489aec097d7fa6b8e7d46e31ac131bdec) ile **yıkanmış zemin rengi, koyu silüet ve sert kaya normalMap kapalı** regresyon assert'leri eklendi. Güncel [CI #43941405657](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43941405657) sonucunu görmeden son teknik düzeltmeye PASS yazma.
- Yüksek nitelikli çok yakın endüstri PBR/GLB, son ışık mastering, gerçek GPU ve kullanıcı estetik kabulü hâlâ açık. Üç yerel PointLight gerçek fizik gölgesi üretmez; mevcut soft contact-shadow sanatının yerine donanım shadowMap varmış gibi gösterilmemeli.

## GFX07 renk düzeltmesi sonrası test kapanışı

- **Son kod ve smoke kontrolü başarılı:** [CI #43941405657](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43941405657) **SUCCESS**: offline GLB/tek HTML, Harita 1/4 Chromium, 86 mevcut dekoratif Mesh / beş orijinal silüet ailesi / 512px zemin atlası / 3 yakın yerel ışık / 3 yumuşak temas gölgesi / sıfır yeni collider ve önceki sabit foto testleri. Aşırı açık zemin tekrarını engelleyen `0x757d87` zemin tint, `0x677482` silüet tint ve son bölge sert kaya normalMap kapalı testleri de dahil.
- **Üç gerçek aynı kamera eski/yeni ekran** ve metrikler: LM10 123→124 drawcall, 30.656→36.810 üçgen; LM11 119→119, 13.430→18.040; LM12 66→67, 13.390→14.968. Tüm sahne içinde 86 görsel modelin referansı korunuyor ve 36 sanayi collider değişmiyor. Kaynak: gerçek Chromium/SwiftShader screenshot ve `metrics.json`, donanım FPS değildir.
- İlk CI görselini gözle inceledim: eski düz kütle tekrarları azalırken **zemin/duvarlar fazla açık** kalmıştı. Yeni `311ef7d` renk/doku değişimi sonrası gerçek görüntülerde zemin **daha koyu ve düşük frekanslı**, silüet ayrımı daha okunur, önceki çok beyaz mikro-rock aydınlanması azalmış. Ancak materyal hâlâ profesyonel baked GLB düzeyinde değil, renk/kompozisyon nihai estetik **KISMEN**.
- Nihai görsel kabul kapısı halen açık: soft temas decal'leri fiziksel dinamik shadowMap yerine geçmez; yüksek detay GLB, görsel kompozisyon, gerçek hedef GPU 1080p p95 FPS/VRAM ve 7–8/10 kullanıcı kabulü ayrıca ölçülecek.
- [Başarılı CI görsel artefaktları](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43941352110) (düzeltilmiş art ilk PASS), [güncel test #43941405657](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43941405657). Bu değişiklikler üst PR #39'da, `main` henüz birleşmedi.

## Sonraki sıra

1. GFX07 otomatik testlerini gerçek CI'de doğrula, sorun çıkarsa düzelt.
2. Gerçek üç sahnenin eski/yeni PNG'lerini incele; silüet ve ışık gerçekten iyileşmiyorsa sanat geliştirmesini açık tut.
3. Track dosyasında PR, test sonucu, açık estetik/GPU borcu ve sonraki iş **NEXT-08 / GFX-08 silah, isabet, duman, patlama ve motor VFX** olarak güncellenecek. Hatalı test varsa nokta komutu önce bunu çözer.

