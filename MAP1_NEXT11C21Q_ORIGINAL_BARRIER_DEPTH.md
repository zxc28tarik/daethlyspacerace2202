# NEXT11C21Q — Orijinal 97 bariyerin çekirdek yüzey kalitesi

**Taban:** C21P / [PR #112](https://github.com/zxc28tarik/daethlyspacerace2202/pull/112). Yeni bariyer tasarımı değil. Map1'in orijinal 97 bariyeri aynı yerinde durur.

## Görsel hedef
C21P ile orijinal meteorların doğal taş tonları gelişti. Şimdi aynı yarış kadrajında bariyerin **mevcut tek koyu merkez çekirdeği** daha iyi 3D yüzey derinliği kazansın; dıştaki iki turuncu uyarı çemberi ve çapraz çizgiler eski görsel kimliğini korusun. Amaç neon yoğunluğunu artırmak değil, riskli engel gövdesini tek renkli karanlık yüzeyden çıkarıp okunurluğu artırmak.

## Sınırlı kod farkı
- **97 mevcut barrier:** çekirdek `OctahedronGeometry(radius×.85,0)` veya `IcosahedronGeometry(radius×.82,0)` olarak kalır, bütün orijinal üçgen ve `position` vertex koordinatları birebir aynı.
- Orijinal çekirdeklerin mevcut triangle centroid yönlerinden deterministik pigment hesaplanır. `MAP1_C21Q_BARRIER_CORE_DEPTH` tek sabiti: `base=.91`, `directional=.19`, normal ağırlıklar `(.18,.78,.56)`, çok hafif sıcak materyal çarpanı `(1.018,.996,.975)`. Sadece `geometry.color` vertex attribute, yeni poligon yok.
- Aynı C21I `64×64` deterministik metal-yıpranma texture, `MeshStandardMaterial` `color=0x807b82,metalness=.48,roughness=.74`, flat shading, paylaşılan **tek** materyal; `vertexColors:true` etkinleştirilir.
- **Aynı dört çocuk:** 1 mevcut octa/icosa çekirdek, 2 mevcut torus uyarı, 1 mevcut çapraz çizgi. C21L amber renk `0xf4a667/.74`, kenar `0xf1c58d/.74`, torus geometrisi ve yönelim, `durability=3`, `radius` ve yerleştirme korunur.
- `Math.random` tüketimi, engel planı, gemi kontrolü/boost, AI, fizik/çarpışma, harita, road palette, 320 meteor, 49 orijinal mor kutu, 8 enkaz, 192 halka/10 batch, SB07 189 ve Map4 249 parça değişmez.
- Yeni mesh, halkalı ödül, shader, metal çerçeve, glow, ışık veya render call eklenmez.

## Gerçek QA ve teslim
1. `tests/map1-next11c21q-barrier-core-depth.cjs`: gerçek Chromium/WebGL **1600×900 normal Map1 yarış kamerası**. Sahnedeki **3 orijinal bariyer**, yalnız karşılaştırma için 190/315/460 birim öne taşınır. Önce eski C21P düz çekirdek tonu (`color` multiplier=1), sonra aynı üçgenlere C21Q tonlaması uygulanır; iki PNG ve side-by-side rapor kaydedilir.
2. Test sonunda bütün `color` attribute verileri, pozisyon, quaternion ve görünürlük geri alınır. GL 0, aynı drawcalls ve ölçülebilir piksel farkı.
3. 97 barrier çekirdeğinin bütün geometri pozisyonları **birebir yeniden üretilen özgün** THREE geometrisiyle karşılaştırılır. Torus/çizgi, C21I texture, orijinal dayanıklılık, Map4 fizik 6/36/200 ve dönüş PASS olmak zorunda.
4. C21P/O/N/M/L/K/J/I/H/G6 + C20O/P/Q/R + SB07 geriye dönük Chromium testleri, tam Map1/Map4 browser smoke ve tek çevrimdışı oynanabilir HTML.
5. Native GPU FPS, kullanıcı estetik değerlendirmesi ve yayıncı için ≥3 oynanabilir harita ayrı iş; **ana dal merge izni yok**.

**Stacked DRAFT, kullanıcı açıkça söylemeden `main` üzerine birleştirme YOK.**
