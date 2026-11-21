# NEXT11C21L — Harita 1 orijinal sahne ışığı ve görsel hiyerarşi

**Kaynak:** C21K (PR #107, commit `eea9393`). **Durum:** ayrı stacked dal üzerinde kod/QA hazır; yeni gerçek CI sonucu ayrıca doğrulanır.

## Hedef ve estetik karar
Görseli aşırı neon ve parıltıyla doldurmadan, Harita 1'de orijinal **mor kutu ödüllerinin** bariyer uyarılarından ve yıldız arka planından temiz ayrışmasını sağla. Kullanıcının reddettiği kristal/atom halkaları, yeni ödül modeli, metal çember veya başka dekor **geri gelmeyecek**. Bu, yüzey/renk düzenlemesidir; yeni gemi, engel veya harita yapılmaz.

## Gerçek kod değişiklikleri
- **2600 mevcut yıldız:** `PointsMaterial.size` **3.2 → 2.5**, opaklık **.90 → .78**. Nokta konumu, renk dağıtımı, RNG, toplam sayısı değişmedi.
- **97 eski bariyer:** mevcut ön/arka turuncu çerçevede `0xff9c53/.83 → 0xf4a667/.74` ve çizgi `0xffd18a/.84 → 0xf1c58d/.74`. Mevcut Octa/Icosa gövde, torus sayısı, yıpranmış gövde dokusu, 3 vuruş dayanıklılık, konum ve boyut sabit.
- **49 eski mor ödül kutusu:** mor gövde **aynı `0x583895`**, aynı 34×34×34 kutu, 36-kenar çerçeve, 9 yarıçaplı iç sekiz yüzlü çekirdek, aynı dönüş/pulse; yalnız `roughness .42→.48`, `emissiveIntensity .50→.44`, mevcut kenar `0xdac3ff/.87→0xd7c9ff/.82`, çekirdek `0x83e4f2/.82→0x95dcea/.78`. Ödül tipleri ve RNG, `radius=49`, HYPER/SHIELD/ENERGY aynen.
- Değerlerin tek bir `MAP1_C21L_LIGHT_BALANCE` sabitinde bulunması, eski–yeni görsel QA geri dönüşünü kolaylaştırır.
- **Yeni mesh / collider / particle / shader / draw call / ışık / geometri / lazer / rota / mekanik yok.** Mevcut SB07 189 parçalı gemi, Map4 249 parçalı gemi ve 6/36/200 Map4 collider değişmedi.
- Harita 4 yıldızları zaten kapatıyor, Harita 4 ışığı/fog/tonemapping ayrı kalıyor. Map1'e geri dönünce C21K fog tonu/yoğunluğu aynen.

## Kabul kapıları
1. `tests/map1-next11c21l-light-balance.cjs`: Gerçek Chromium/WebGL 1600×900; orijinal mevcut 1 ödül+1 bariyeri kamera önüne geçici yerleştirerek **C21K → C21L** aynı kamera PNG A/B; iki çekim sonrası konum/rotation/visibility/material geri alma; hiç ekstra drawcall veya GL error yok; sayım/mesafe/geometri/Map4 izolasyonu.
2. Eski C21K/J/I/H/G6 + SB07 + C20R regresyonlarının tamamı, tek dosya **offline** HTML artifact.
3. Sonuçları ve ekran görüntülerini görmeden "test PASS" veya "görsel 8/10" denilmez.
4. **GitHub DRAFT PR**; kullanıcı açık onayı olmadan **main merge YOK**.

## Açık kalanlar
Gerçek oyuncu ekranında uzun süreli gözle değerlendirme, native GPU 720p/1080p FPS ve tam oyun/kullanıcı estetik onayı; yayıncı sunumu için en az üç haritanın oynanabilirliği ayrı hedef olmaya devam ediyor.

## Sonraki öneri
C21L artıları/eksileri gerçek ekran PNG'lerinde değerlendirilir; görsel aşırı sönükse yalnız bu dalda ayarlanır. Sıradaki geliştirme C21M ancak C21L QA ve estetik etki kontrolünden sonra seçilir.
