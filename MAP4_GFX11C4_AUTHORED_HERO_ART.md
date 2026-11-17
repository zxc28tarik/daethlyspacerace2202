# NEXT-11C4 — Özgün büyük sanayi 3D modelleri ve sahne kabulü

**Durum:** Gerçek oyun `index.html` kaynak kodu, Chromium görsel A/B / GPU renderer bütçesi / fizik testi ve CI workflow hazır. [NEXT11C3 PR #48](https://github.com/zxc28tarik/daethlyspacerace2202/pull/48) üzerine stacked; eski kararlar ve main değişmez. **Son HEAD GitHub CI ve gerçek ekran sanatsal onayı başlangıçta açıktır.**

## Önceki gerçek ekran değerlendirmesi

[NEXT11C3 07–08–09 önce/sonra gerçek WebGL ekranları](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43983613354/artifacts/14284577716): malzeme ve dekor fazlalığı azaldı ancak sahnede çok sayıda basit kutu/kolon/havada parlayan halka var. Önceki 6 open-frame portali **tek başına** hedeflenen 7–8/10 görsel okunurluğu sağlamıyor. Bu aşama sadece daha fazla dekor veya tek renk boyama değil; üç fonksiyonel tesisin **fiziksel olarak farklı, çok bileşenli ama verimli ve nonphysical özgün 3D modellenmesi**.

## Kodda fiilen yapılanlar

- `h4Gfx11c4AuthoredGeometry(family)` üç bağımsız çok parçalı gerçek **THREE.BufferGeometry** oluşturur. İçeride farklı primitive kombinasyonları bir kez transformlanıp gerçek geometry tek `position+normal+color` bufferına bake edilir. Sonrasında geçici şekiller dispose edilir; render sırasında yeni geometri üretilmez.
- **Family 0 / rafineri:** basamaklı ayırma drumları, flared cracking column, iki uzun baca, açık geçişli boru galerisi, servis iskelesi, koruyucu çapraz bağlantılar, kaynak/işaret halkaları.
- **Family 1 / soğutma:** iki gerçek içbükey hyperboloid soğutma gövdesi, yatay fan ve kapakları, döner kanat formu, açık havalandırma köprüsü, drenaj boruları.
- **Family 2 / enerji:** büyük içi açık halka çekirdek, içeride üç ayrı halka ve lens çekirdeği, sekiz radyal fin/indüksiyon bağlantısı, üç boyutlu güç ayakları ve üst voltaj köprüsü.
- Her aile tek özel **InstancedMesh**. Altı W05 sanayi alanına iki tarafta ikişer örnek: **12 örnek / 3 art draw batch**. Üç modelin geometry tasarımları ve `vertexColors` farklıdır, ailelerin renkleri sanayi kimliğiyle uyumlu. Modeller mevcut W05 malzeme, renk, basit desteklerden geometrik olarak ayrışır.
- **Uçuş koridorunu fiziksel olarak değiştirmez:** bütün yeni mimari `visualOnly=true`, `noCollider=true`; **0 yeni collider, 0 silinen eski fiziksel nesne**, 5 rakip/8 avcı, 6+36+200 collider, 60s arena, 300s sınır, 850m final, faz/silah/skor korunur.
- High/Balanced: 3 özgün ağır model görünür. **Low:** bu 3 özgün ağır model gizlenir, GFX11C'deki zaten mevcut 6-site/72 görsel instance korunur. Low cihazlarda gereksiz yeni GPU üçgenleri üretmez.
- NEXT11B kamera sütun fade, NEXT11C2 114 malzeme regrade, NEXT11C3 18 eski nonphysical dekorun gizli olması/34 fiziksel W02 yapının korunması ve fabrika gizleme kararı aynen sürer.

## Gerçek motor teknik kabul

Yeni `tests/map4-gfx11c4-authored-hero-art.cjs`:
- [ ] 3 **farklı vertex sayılarına sahip** authored model; min 500 gerçek üçgen/model, gerçek `position, normal, color` vertex buffer ve instance color.
- [ ] **12 model örneği**, 3 render batch, hiçbir yeni collider veya eski collider kimliği değişikliği yok.
- [ ] 07 giriş / 08 fabrika için 1600×900 sabit aynı-kamera `NEXT11C4 kapalı/açık` gerçek PNG **görünür farkı**; 09 çıkış sütun maskesi korunsun.
- [ ] Görsel açık/kapalı durumda **en fazla +3 draw call**, GPU resident geometry/textures sabit, ek mimari üçgenleri <140000; gerçek performans kabulü değildir.
- [ ] HIGH/BALANCED üç model görünür, LOW üç yeni model gizlenir; LOW üçgen sayısı BALANCED'dan düşük.
- [ ] Arena (phase2)/orbit (phase4) yeni hero art gizli; arena gelecekteki fabrikalar gizli.
- [ ] Eski full offline HTML/Map1–4/GFX09-11C3/tarihsel 62 foto GitHub Actions CI PASS.

## Açık kalite/teslim kapıları

**İnsan estetik 7–8/10**, gerçek 720/1080p native GPU FPS/p95/VRAM, Map4 tamamı 5dk gerçek uçuş ve yayıncı için altı haritadan en az üç oynanabilir map **açık**. Sabit SwiftShader fotoğrafları veya 300s VFX simülasyonu bu kapıları asla otomatik kapatmaz. Görsel kalite kararları gerçek önce/sonra fotoğraflarla güncellenir; kullanıcı onayı olmadan stacked PR zinciri merge edilmez.

**Sıradaki `.`:** CI fail ederse aynı PR içinde kök nedeniyle düzelt, PASS ise 07/08/09 gerçek screenshot gözüyle kabul ve kadraj tuning'ine geç; kalite hedefi karşılanmazsa yeni sanat kalite borcunu açık tut.
