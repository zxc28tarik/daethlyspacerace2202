# NEXT-11C6 — Sanayi büyük silüet / üç katmanlı derinlik kadrajı

**Durum:** İlk 07/08/09 gerçek Chromium/WebGL A/B teknik testi PASS (CI #44063426264); **ilk görsel denetim yetersiz**, düzeltme commitleri yazıldı ve yeni CI/görsel kanıt henüz açık. Kullanıcı 7–8/10 estetik onayı ve native GPU FPS/VRAM açık.

## Tasarım gerekçesi

NEXT-11C5'te PBR aşınma ve ışık değişti, ancak 07 giriş ve 08 fabrika kadrajında yeni detayın görsel etkisi zayıf kaldı. Sorun sadece mikro-yüzey ayrıntısı değil: uzak ve orta mesafede birbirinden ayırt edilen **üç sanayi silüeti**, katmanlı kompozisyon ve negatif boşluk.

## Kaynak değişiklikleri

- `index.html`: yeni `h4Gfx11c6SkylineGeometry(family)` fonksiyonunda **üç ayrı özel 3B biçim ailesi**. Rafineride yüksek asimetrik kraking kolonu / dış boru ızgarası; montajda içi açık vinç ve farklı yükseklikte servis yapıları; enerjide kademeli trafo direkleri, servis köprüsü ve farklı yükseklikte baca. Yalnız boya/metin tekrarı değil: gerçek model silüeti ve boşluklar değişir.
- Mesh başına tüm parçalar önce BufferGeometry içine pişirilir; aile başına tek `InstancedMesh(geometry, material, 4)`; toplam **3 batch / 12 instance**; üç aile altı sanayi noktasında iki derinlikte konumlanır.
- Yeni kompozisyon hattı `h4Gfx11c6BuildSkyline(zone)`, yeniden kurulum yok, harici asset/network yok, per-frame geometri tahsisi yok.
- `h4Gfx11c6SetLook(true|false)` aynı build'de aynı kamera WebGL eski/yeni kadraj karşılaştırmasını mümkün kılar; normalde açık.
- High / Balanced aktif phase-3; Low'da ilave büyük mimari gizlenir. Map1 ve Map4 diğer fazlarda ilave yapı çizilmez.
- **Sıfır yeni collider, sıfır yeni ışık.** `H4_GFX11C_SITES`, W05 `BEACON`/`HIGH_MARKER`, 6 kanyon /36 sanayi /200 yapı collider, 5 rakip, 8 avcı, 60 s av kilidi, 300 s yarış, 850 m yörünge, ekonomi/hasar ve iki kamera kodları değişmez.
- Geçmiş `h4Gfx11c4` authored hero ve `h4Gfx11c5` PBR/gölge/ışık kodu **korunmuştur**. Sahne değişimi ayrı bayrakla eski/yeni karşılaştırılabilir.

## QA ve kapılar

- [x] Üç farklı mimari ailenin gerçek kodu ve 3×4 instancing entegrasyonu yazıldı.
- [x] Yeni gerçek Chromium WebGL test dosyası `tests/map4-gfx11c6-silhouette-depth.cjs` yazıldı, workflow'a `NEXT11C6` işi eklendi.
- [x] **07/08/09 gerçek WebGL sabit kamera A/B PASS** — son onarım HEAD `6caec39`, [hızlı CI #44065387823](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44065387823). **Tam regresyon CI #44065388118 hâlâ ayrı açık**.
- [ ] High / Balanced / Low profil bütçesi, 0 collider değişimi ve Map1 / diğer fazlar tam CI PASS.
- [ ] Gerçek ekran görüntüleri **gözle** karşılaştırıldı; büyük silüetin rota okuyabilirliğini artırdığı estetik olarak değerlendirildi.
- [ ] Native GPU 720/1080p FPS, p95, VRAM ve 5 dakikalık gerçek pilot uçuşu yapıldı.
- [ ] Kullanıcı 7–8/10 kalite ve 3/6 oynanabilir yayıncı haritası kabulü verdi.

**Merge kuralı:** Bu PR, NEXT-11C5 PR #50 üzerine stacked DRAFT olacaktır; hiçbir PR açık kullanıcı onayı olmadan `main` ile birleştirilmez.

**Başarısız QA'da:** Aynı dalda düzelt, yeniden CI başlat, olumsuz görüntü varsa art borcu olarak açık tut. `PASS` demek insan estetik onayı değildir.


## 17 Kasım — İlk gerçek görsel denetimi ve takip onarımı

**Kaynak:** [Actions #44063426264](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44063426264) / artifact `map4-browser-smoke-images`, `map4-gfx11c6-07-entry-before/after`, `08-factory-before/after`, `09-exit-before/after`. 1600×900 gerçek Chromium/WebGL aynı-kamera A/B, yalnız `h4Gfx11c6SetLook` aç-kapa, geçmiş sürüm tarihsel karşılaştırması değildir.

- İlk geçişte değişen alan: **07 %17,01**, **08 %9,88**, **09 %3,60** (ortalama RGB farkı >1/255 eşiği; estetik kalite puanı değildir).
- **Görsel sorun:** 07 ön planda büyük düz bloklar, 08 sağ tarafta aşırı büyük açık renkli kutu/sundurma, 09'da çok az etki. Bu nedenle otomatik A/B PASS olsa bile **estetik KABUL VERİLMEDİ**.
- **Düzeltme:** Büyük boş levhalar küçültülüp metalik açık iskelet/kolonlara çevrildi; yeni modellerin konumu uçuş hattından biraz daha dışa/ileriye taşındı, boyutlar daraltıldı, koyu soğuk metal/pas paleti kullanıldı; yeni düz malzeme yerine **mevcut NEXT-11C5 256² PBR atlas/bump UV ile paylaşıldı**, yeni texture yok.
- Yeni gerçek ekran görüntülerinin incelenmesi ve yeni CI HEAD için PASS **AÇIK**; önceki ilk geçişin teknik PASS'ı düzeltilmiş sürümün kabulü sayılmaz.
- Sadece PR #51'de işlem yapıldı; PR #50 ve diğer stacked PR'lar **merge edilmedi**.


## 17 Kasım — Onarılmış gerçek görsellerin ikinci incelemesi

**Onarım HEAD:** `6caec393` (kod `ea0342d`, test `5cb4be2`), [hızlı WebGL visual QA #44065387823](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44065387823) **PASS**; artifact `map4-next11c6-fast-07-08-09`. Aynı kamerada yeni görseller önce/sonra doğrulandı. Tam CI [#44065388118](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44065388118) **devam ediyor**; ilk büyük sürümün tam CI #44063534231 PASS olması yeni onarım HEAD'i için tam PASS değildir.

| Kadraj | İlk geçiş değişen alan | Onarım değişen alan | Gözlem |
|---|---:|---:|---|
| 07 giriş | %17,01 | **%7,80** | Ön planın üstünü örten geniş levha azaldı; solda hâlâ belirgin yeni blok/kolon var |
| 08 fabrika | %9,88 | **%4,13** | Sağdaki düz, beyazımsı dev kutu kaldırılmış; daha ince, daha uzaktaki gantry görülüyor |
| 09 çıkış | %3,60 | **%1,97** | Artık baskın kütle eklemiyor; fakat silüet değişimi **yetersiz** |

**Ölçü tanımı:** Ortalama RGB farkı 1/255'i aşan piksel yüzdesi; **kalite puanı değildir**. Yeni kodun etkisi azaldı çünkü estetiği bozan oversized parçalar azaltıldı; daha küçük değişim her zaman daha iyi kalite anlamına gelmez.

**İkinci sanatsal karar:** İlk sürüme göre 07/08 kadrajları **iyileşti**, fakat bütün sahne hâlâ istenen **7–8/10** seviyesinde değil; 09 çıkış, mevcut eski endüstri foreground blokları, fazla parlak güneş, yinelenen dekoratif halkalar ve zayıf arazi görsel kimliği **açık**. İnsan kullanıcı kalite onayı verilmedi.

**NEXT-11C7 önerisi (henüz uygulanmadı):** Yeni geometri eklemekten ziyade 07/08/09 ve uçuş hattında mevcut **yalnız visual-only** legacy yer tutucuları ayıkla/yeniden biçimlendir; gerçek uçuşun navigasyon BEACON/HIGH_MARKER işaretlerine ve 36 fiziksel sanayi collider'a dokunma. Düşük ön plan blok sayısı, ayırt edici işlevsel makine silüetleri, daha doğal malzeme/zemin, yönlendirmeyi bozmayan ışık/güneş düzeni ve 3-kadraj A/B üzerinden kabul et. Native FPS/VRAM ve 5dk uçuş halen açık.

**İleriye taşınan açık kapılar:** Tam onarım HEAD CI, 7–8/10 kullanıcı estetik kararı, gerçek GPU 720/1080p FPS/VRAM, 5dk uçuş, yayıncı 3/6 oynanabilir harita. **PR merge yok.**
