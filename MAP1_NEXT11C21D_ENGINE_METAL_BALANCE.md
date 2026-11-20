# NEXT11C21D — SB-07 ZENİT motor metali / ışık ayrımı

**20 Kasım 2026.** Baz: [NEXT11C21C](MAP1_NEXT11C21C_RED_RACE_FLOW.md), PR #94.

## Estetik karar

Motor çevresindeki mevcut `SECOND` gunmetal ve `DARK` iç mekanizma boyası daha derin **soğuk mavi işlenmiş metal** olarak görünür. Plazma mavi, amber servis ayrıntısı ve cam mevcut renklerinde kesin olarak kalır. Motorun teknik katmanları enerji ışığından ayrışır; “daha parlak olmak” değil, “daha iyi malzeme okuması” hedeflenir.

## Gerçek oyun kodu

`index.html` içindeki mevcut `balancedTint` fonksiyonunda sürekli `engineSmooth = engine*engine*(3-2*engine)` hesaplanır. Bu değer motor çevresinde yüksek, geminin önünde sıfırdır. Yalnız `SECOND` ve `DARK` için pigment çarpanları değişti; RED, HULL, GLASS, ORANGE ve PLASMA aynı.

SECOND güncel çarpanları:
- R: `.870 + .040*roof + .018*wing - .068*engineSmooth`
- G: `.925 + .035*roof - .045*engineSmooth`
- B: `1.040 + .018*roof + .010*engineSmooth`

DARK güncel çarpanları:
- R: `.925 + .035*roof - .030*engineSmooth`
- G: `.975 + .020*engineSmooth`
- B: `1.035 + .024*engineSmooth`

Bütün yedi malzemenin ana HEX değerleri, metal/seramik roughness, metalness, clearcoat ve atlaslar; motor ışığı/emissive, geometri, görüntü performans ayarları ve gerçek yarış fiziği değişmedi. 189 parçalı geminin silueti ile orijinal native 1× MSAA korunur.

## Test ve geri alma

`tests/map1-next11c21d-engine-tone.cjs`: gerçek Chromium/Three r128 modelinin SECOND/DARK RGB vertex buffer’ları üzerinde her renk matematiğini doğrular. Aynı motor gövdesi ve ışığında önce C21C metal formülleri, sonra C21D koyu çelik tonları takılarak **gerçek 1600×900 WebGL** rear ve rear-quarter kareleri, piksel farkı ve draw-call sayısı ölçülür. ORANGE/PLASMA/GLASS/RED/HULL matrisleri korunur. C21A/C21B/C21C ve SB07 normal/boost/Map4/304 ray testleri regresyondur.

CI: `.github/workflows/map1-next11c21d-engine-tone.yml` ve kapsamlı smoke. Final HEAD sonuçları tamamlanmadan PASS denmez; farkın estetik etkisi bağımsız olarak incelenir. C21D PR, C21C üstüne taslak kalır; kullanıcı açık onayı olmadan merge yapılmaz.

**Sırada NEXT11C21E:** tüm renklerin estetik dengesi ve final kalite kapısı.
