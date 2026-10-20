# Harita 4 — GFX-04D: Bağlı Savaş Efektleri ve Enkaz Atmosferi

Tarih: 20 Ekim 2026
Başlangıç ana dal: `462f8f3328630c3cea46595aac27410d6571a1b6`
Kapsam: Harita 4'te GFX-04 savaş arenasına çevresel derinlik ve gerçek vuruşa bağlı mikro VFX; oyun fizik/puan mantığına dokunulmaz.

## Çalışan kod
- Arena savaş ceplerinde **4 konuma sabitlenmiş duman kaynak noktası**: batı kruvazörün iki yarası, doğu savunma bölgesi ve merkezde alçak bir yanık nokta. Bunlar bölge rotasına bağlı dünya koordinatlarında yerleştirilir. Kanyon, sanayi ve Map1 sahnesi etkilenmez.
- Duman görünümü mevcut `h4SmokeAtlas` dokusunu yeniden kullanır, **4 kaynak × 18 = 72 dinamik nokta, 1 Points mesh / 1 draw call**. Hareketler zaman, farklı periyodik yanal savrulma ve yerel gezegen yukarı yönüyle hesaplanır; döngüde mesh, geometri ve malzeme oluşturulmaz. Bölgesel culling ile görüntülenir.
- Avcı isabetinde `damageHunterTarget` onaylandıktan sonra **gerçek çarpma noktasına** `h4EmitGfx04DSparks` çağrılır. Mevcut `createExplosion`, gerçek imha, HP, puan, atış mekaniği değişmedi.
- Kıvılcım **96 önceden ayrılmış GPU verteksi** ve tek `Points` mesh üzerinden yönetilir. Normal isabet 6, elit isabet 9 parçacık tetikler. Ömür .22–.385 saniye; ömrü biten noktalar görünmez uzaktaki koordinata taşınır. Yeni parçacıklar kapasite dolunca halka tamponundaki eskilerin yerini alır, yeni GPU varlığı yaratılmaz. Vertex renklendirme normalde cyan, elitte sıcak kıvılcım tonu taşır.
- Yeniden başlatmada `h4ResetGfx04D` tek havuzu temizler; aynı dünya/atlas objeleri tekrar kurulmaz. Harita 1'de tüm VFX gezegensel ana gruba bağlıdır ve görünmez.
- GFX-04B ve GFX-04C'nin GLB modelleri, 15 asset, 3 LOD, ikili elit savunma bataryası, mevcut statik yanık decal ve eski W04 fallback'leri korunur.

## Performans ve estetik dürüstlüğü
- 4 duman grubu ayrı material/sprite düzenine dönüştürülmedi: tek materyal ve dinamik Float32 BufferAttribute tercih edildi.
- Harita 4'e ek kaynak bütçesi 72 duman noktası + 96 kıvılcım kapasitesi, 2 renderer draw call. Aktif kıvılcım yokken spark field visibility=false.
- Duman çizimi gerçek volumetric 3D ışık hesaplaması değildir: mevcut alfa atlas kullanan GPU Points efektidir. Kamera açısı, görünürlük ve 1080p GPU FPS doğrulaması ayrıca gereklidir. Hedef avcıların görüşünü kapatmamak için opaklık .44 ile sınırlanmıştır.
- GLB PBR metal/doku üretimi ve çevre heykeli bu dalgada değiştirilmedi.

## Kabul ölçümleri
- Chromium kaynak HTML: 4 plumes / 72 dynamic points / tek duman field; hareket kanıtı; 96 spark pool; normal+elit gerçek ölüm vuruşlarından spark artışı; 30 yapay **yalnızca görsel test** çağrısıyla kapasite sınırı; yaşam süresi bitince 0 aktif, restart'ta temiz.
- Oyun kuralları: arena 60 sn, toplam 300s, 8 gerçek avcı (3/3/2), +1/+3, gerçek bitiş ≥850 irtifa, 5 bot ve Map1 regresyonu.
- Offline GLB/LOD model yüklemeleri, 12+3+3 standart screenshot ve yeni smoke/spark kamera kanıtı; kaynak / CI / release commit eşleşmesi.
- Test başarılı olmadan `main`'e birleştirilmez.

## Sıradaki adımlar
- GFX-04E: Etkilerin derinliği, ışık şiddeti ve görsel kompozisyonu için ekran görüntüsü incelemesi; selektif volumetrik sahte ışık, yakın plan duman atlası ve çatışma okunabilirliği.
- GFX-05: Gemilerin özgün ana model/normal/ORM atlasları ve geçiş/yanlış hitbox silüetlerinin düzeltmesi.
