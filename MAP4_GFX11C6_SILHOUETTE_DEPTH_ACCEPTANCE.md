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
- [ ] **CI PASS** ve 07/08/09 sabit kamerada before/after PNG farkı doğrulandı (çalışma sonucu bekleniyor).
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
