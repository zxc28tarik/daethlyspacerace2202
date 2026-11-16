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

## Sonraki sıra

1. GFX07 otomatik testlerini gerçek CI'de doğrula, sorun çıkarsa düzelt.
2. Gerçek üç sahnenin eski/yeni PNG'lerini incele; silüet ve ışık gerçekten iyileşmiyorsa sanat geliştirmesini açık tut.
3. Track dosyasında PR, test sonucu, açık estetik/GPU borcu ve sonraki iş **NEXT-08 / GFX-08 silah, isabet, duman, patlama ve motor VFX** olarak güncellenecek. Hatalı test varsa nokta komutu önce bunu çözer.

