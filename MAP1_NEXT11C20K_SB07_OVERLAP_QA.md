# NEXT-11C20K — SB-07 Zenit z-fighting / yüzey derinliği / motor halka sadeleştirme

**19 Kasım 2026.** Kullanıcının "." komutuyla bir sonraki aşamaya geçildi. Kesin kullanıcı yaklaşımı: **yeni küçük dekoratif parçalar eklemek yerine, ayrık parçaları birleştirip gerçek çizgi kalitesini yükselt**.

## Kökeni kanıta dayalı hata analizi

Önceki `wingDeckPlate(key,side,outline)`, tüm panel poligonlarını y=-.116 düzlemine yerleştiriyordu. Oysa gerçekten üst üste gelen yüzey bölgeleri vardı. Model geometrisindeki belirli poligonların 2D kesişim alanlarından doğrulanabilen örnekler:
- **Ön beyaz kanat kaplaması / kırmızı yarış boyası**: yaklaşık 0.4065 kare model birimi üst üste.
- **Ön gri metal kaplama / kırmızı yarış boyası**: yaklaşık 0.0645 kare birim.
- **Arka beyaz kanat kaplaması / tek birleşik gri flap**: yaklaşık 0.5040 kare birim.
- **Kök DARK hava kanalı / SECOND metal üst dudak**: yaklaşık 0.1339 kare birim.

Aynı düzlemde üst üste gelen üçgenler gerçek render sırasında coplanar depth fighting ve titreyen yarım piksel çizgileri yaratabilir. MSAA bu derinlik kararsızlığını düzeltmez. Global FXAA/blur veya yeni dekor parçası eklenmedi.

## Kodda uygulanan C20K

- `wingDeckPlate(key,side,outline,lift=0)`: gerçek örtüşen panelin katmanını küçük, **açıkça bildirilmiş y-offset** ile ayarlar; mevcut geometri yerleşimi/silueti değişmez.
- Mevcut tek kırmızı yarış boya paneli: `lift=+0.016`. Hem beyaz hem gunmetal ön kaplama üstünde daha net görünür.
- Her kanatta tek büyük arka SECOND flap: `lift=+0.012`; mevcut HULL arka güverte yüzeyiyle coplanar değildir.
- Her kanatta ikinci root SECOND kaplama: `lift=+0.012`; DARK hava kanalı içine gömülüp kaybolmaz.
- **Çift motor çıkışı:** C20I sırasında eklenen z6.02/r1.07 ORANGE halkası, zaten z5.97/r1.15 olan aynı renkli mevcut halkayla neredeyse çakışıyordu. Fazladan halkanın iki motordaki örneği **kaldırıldı**. Birbirini kesen kalın torus parçaları ve gereksiz üçgenler azalır; çift motor, normal/boost halo, 20 stator, büyük nozzle korunur.
- `integratedAnnularBands:8→6` ve QA metadatası güncellendi; mükerrer yorum düzenlendi. Yeni silah/collider/external model yok.

## Gerçek parça sayısı ve çizgi kalitesi

Aynı `h4Ship20ZenitBuild()` fonksiyonları kontrollü minimum Three.js kaynak-builder ortamında çalıştırılarak doğrulandı:
- C20H **354** primitif
- C20I/J **191** primitif
- C20K **189** primitif
- Toplam **165 daha az primitif (~%46,61)**; C20J’ye göre ilave 2 redundant motor halka temizlendi.
- Önceki gibi **7 birleştirilmiş fiziksel materyal mesh batch** + 2 küçük additive glow sprite. Bu oran draw-call/FPS yükseldi anlamına gelmez; farklı segment sayısı ve kesit kalitesi GPU maliyetini değiştirebilir.
- Çizgi yüzeyleri 16 radyal segment, motor 32, halkalar 40, bevel 4, cam 11; 128px mipmapped atlas/4× anisotropy korunur.

## Browser QA / kabul kapıları

- [x] Orijinal oyun `index.html` ana inline JavaScript syntax PASS.
- [x] Orijinal builder'ı iki branch üzerinden çalıştıran kontrol: 191→189 primitif, 7 ana batch.
- [x] Gerçek Playwright WebGL scriptine **4 farklı üst üste gelen polygon çifti, iki tarafta toplam 8 ayrı raycast** eklendi. Her gerçek birleştirilmiş `RED/HULL/SECOND/DARK` mesh raycast ile `upperY - lowerY` ölçülür. Yerleşimler için **0.008..0.05 birim** derinlik aralığı şart.
- [x] Eski 15 gerçek kırmızı burun vertex/hull-skin testi, bütünleşik metal shroud kontrolü, 189 hard gate, 7 batch, gerçek GL üçgen/draw ölçümü, stüdyo normal/boost PNG ve Harita1/4 oyun koruma testleri tutuldu.
- [x] Özel `.github/workflows/map1-next11c20k-zenit-panel-overlap.yml` ve full Map1+4 browser smoke trigger eklendi.
- [ ] GitHub Actions'in bu HEAD commit için **gerçek PASS ve PNG artifaktları** doğrulandı.
- [ ] Gerçek üretim WebGL görüntülerinde z-fighting gözle incelenerek yokluğu onaylandı.
- [ ] Fiziksel GPU FPS/p95 ve 5 dakika oyuncu yarış doğrulandı.
- [ ] Kullanıcı açık MERGE onayı verdi.

## Tasarım kilitleri

SB-07'nin **uzun sivri ön burun**, **iki düz/swept geniş yatay kanat ve UÇLARDA DİKEY yükselen stabilizatörler**, gümüş/gunmetal ve kırmızı çizgiler, lacivert cam ve çift mavi motor tasarımı değişmez. Harita1 saf silahsız yarış, kamera/enerji/AI/fizik korunur; Harita4 B-04 249 parça/6 batch ve 6+36+200 collision/arena görev/AI kuralları untouched.

**DRAFT / NO MERGE**. Önceki [C20J](MAP1_NEXT11C20J_SB07_SURFACE_FIT_QA.md).

**NEXT-11C20L:** Gerçek WebGL screenshot ve raycast sonuçlarını incele; iç içe motor halka derinliği veya yetersiz yüzey clearance kalmışsa *yalnızca hedefli 3D düzeltme*, yeni minik dekor objeleri eklemek yok.
