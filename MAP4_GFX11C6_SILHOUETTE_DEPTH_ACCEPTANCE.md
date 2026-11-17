# NEXT-11C6 — Sanayi büyük silüet / üç katmanlı derinlik kadrajı

**Durum:** KOD GELİŞTİRME DALINDA; CI / 07-08-09 gerçek Chromium görsel kabulü **sonraki test çalışmasında doğrulanacak**. Kullanıcı 7–8/10 estetik onayı ve native GPU FPS/VRAM açık.

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
