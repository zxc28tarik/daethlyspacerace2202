# NEXT11C21K — Map1 uzak görünürlük ve renk bütünlüğü (eski modeller aynen)

Harita 1'deki orijinal 49 mor ödül kutusu, 320 meteor, 97 bariyer ve 8 enkaz kapısı yerleşimleri/boyutları/mevcut mesh sayıları ve oyun mekaniği kesinlikle değişmez.

- Sahnedeki uzak nesneleri fazla karartan Map1 FogExp2 yoğunluğu 0.00055 → **0.00044**. Sis rengindeki mor baskınlığı azaltıp soğuk laciverte çekildi (0x09051D → **0x0D0E21**). Sadece Harita 1'e uygulanır.
- Yaklaşık 1500 mesafede atmosfer geçirgenliği 0.507 → 0.647; 2400'de 0.175 → 0.328. Önemli tehlikeler daha erken fark edilir, tamamen sis kaldırılmaz.
- Üç orijinal meteor sınıfında hafif mineral-midtone dengesi ve daha uyumlu soluk konturlar yapıldı. Vertex/geometri, roughness/metalness, hareket, sınıf ve collision yok.
- Eski **38 bulutsu küresinin** aynı şekil/pozisyon/sayı bilgileri korunuyor; yalnız katmanlarının opaklığı **0.09 → 0.062** düşürüldü. Ön planı kapatan büyük mor lekeler seyreltiliyor. Yeni ışık, shader, 3D obje, draw call veya parçacık eklenmez.
- Eski mor pickup, bariyer/enkaz ve koridor renkleri aynıdır.
- Map4 farklı fog rengi/density ve ACES exposure kullanmaya devam eder; Map4'ten Map1'e geri dönünce Map1 paleti doğru şekilde geri yüklenir.

## QA
- Gerçek Chromium 1600×900/WebGL: aynı oyuncu kamerası, 3 eski meteor ve orijinal bariyer geçici olarak 720/1360/1510/2120 mesafelerine konur; eski C21J sis/renkler ve yeni C21K aynı geometriyi render eder, sonra bütün transformlar geri alınır.
- GL hatası sıfır, old/new draw calls birebir aynı. 5 meteorda vertex bazında orijinal geometrisi ile fark sıfır.
- Map4 atmosfer/249 savaş gemisi/[6,36,200] collider/haritaya geri dönüş ve C21J/I/H/G6 + SB07 + corridor regresyonları.
- Full offline HTML ve ekte gerçek eski/yeni görüntüleri. GitHub stacked DRAFT; main'e açık kullanıcı onayı olmadan birleştirme yok.