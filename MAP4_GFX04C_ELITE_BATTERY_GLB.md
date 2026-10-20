# Harita 4 — GFX-04C: Elit Savunma Hattı GLB ve Yerel Hasar
Tarih: 20 Ekim 2026
Baz sürüm: `18f24eb76777c215b3dcf539a1f17a6bd194af96`

## Gerçek kod değişiklikleri
- GFX-04 ile tasarlanan iki elit savunma kulesinin büyük görünür modelleri, yeni `elite_battery` GLB varlığı üzerinden yerini alır. `elite_battery`, `elite_battery_lod1`, `elite_battery_lod2` ile üç farklı geometri bütçesi ve mesafeye göre LOD. Mevcut `Map4ArtAssets` ve `h4Gfx01LODGroups` sistemi tekrar kullanılır.
- GLB geometri formu: çok yüzlü kesik zırh gövdesi, yan zırh etekleri, çift gerçek 3D uçaksavar namlusu, mekanik dönüş tablası, arka soğutma kanatları, eğimli radar çanağı, hidrolik bağlantılar, bakım merdiveni ve kırmızı ikaz odakları. LOD0/1/2 arasında gerçek detay farkı vardır.
- 512x512 deterministik **mavi-gri askeri çelik kaplama atlası** GLB'nin binary içine gömülür. Panel birleşim çizgileri, hafif sıyrıklar ve yağ/saha kirleri vardır. Sıcak renkli ışık lenslerinde glTF emissiveFactor kullanılır.
- İki batarya dünya içinde yaklaşık `pocket.side±445` koordinatlarına aynı yüklenen/parse edilen üç geometriyi **paylaşarak** yerleşir; LOD görünürlüğü ayrı izlenir. GFX-04 eski iki kule gövdesi, üst platform, radar çanağı ve ışık halkası (toplam 8 parça) **ancak iki yeni GLB başarıyla yüklenirse** gizlenir. Kaynak HTML veya GLB hatasında önceki sağlam sanat modelleri görünür kalır.
- İki batarya ayağına ortak 128x128 alpha dokusunu kullanan **iki zemin yanık/temas izi** yerleştirilir. Bunlar yalnız görseldir; collider veya oyun hasarı değiştirmez.
- Halen korunmuş olan kırık kruvazör, diğer arena dekorları, sanayi ve vadi modelleri, 12 landmark, hava parçacıkları ve Map4 atmosfer paletleri durur.

## Kod/asset sınırlaması
- Sanat modeli **Blender'dan üretilmiş profesyonel satın alınmış veya elle heykellenmiş model değildir**: özgün deterministik geometri üretim kodunun glTF2/GLB çıktısıdır. Hedeflenen yayıncı grafik seviyesi henüz doğrulanmadı.
- Yer izi gerçek zamanlı mermi/krater simülasyonu değildir; iki statik decal'dir. Dinamik VFX/fizik ayrı geliştirme.
- Üç LOD baştan yüklenir; her karede geometry/texture yaratılmaz. Model ailelerinin dokuları glTF içine gömülür ve indirilen tek HTML çevrimdışı çalışır.

## Değişmez oynanış ve testler
- 60 saniye ileri ilerleme kilitli savaş, 300 saniyelik görev, bitişte ≥850 yerel irtifa; üç açık, üç enkaz ve iki elit avcı; normal +1/elit +3 puan; 5 rakip pilot; altı kaya ve 36 sanayi collider aynıdır.
- Yeni görünmez engel, yapay hedef, gemi AI, ateş ya da puan sistemi eklenmez. Map1'in neon/oynanış/HUD görünümü ve yeniden başlatma korunur.
- `tests/map4-gfx01-offline.cjs`: artık 5 sanat ailesi × 3 LOD = **15 GLB**; 2 bataryanın başarılı yüklenmesi ve aynı GPU geometry'yi paylaşması; eski 8 parça gizlenmesi; 2 decal, sıfır collider, Map1 izolasyonu ve sıfır dış ağ.
- `tests/map4-browser-smoke.cjs`: kaynak HTML'de kaplamalar yokken eski sanatın görünür kalması; tüm oyun bölümleri ve fizik regresyonu.
- `tests/map4-art-baseline.cjs`: sabit 12+3+3 kıyas fotoğrafları, iki yeni savunma hattı yakın kadrajı (HUD açık/kapalı) ve renderer.info ölçümü. Gerçek kullanıcı donanımında FPS ve görsel kalite onayı henüz beklenir.

## Gelecek iş
GFX-04D savaş sahnesi: aktif hasar/kıvılcım/duman, büyük yapıların topoloji zeminle birleşimi, seçici gerçek sahne gölgesi, gerçek PBR normal/ORM bake ve sanatçı GLB modelleri; önce görünür kalite, sonra efekt zenginliği.
