# HARİTA 4 — KAPSAMLI GRAFİK GELİŞTİRME MASTER PLANI
Tarih: 20 Ekim 2026
Durum: UYGULANMAMIŞ PLAN / GRAFİK ÜRETİM PROGRAMI
Kaynak: main @ 97120a3a309bd222ba1a4f47c2f9086f6674b078 (VQ04)
Hedef: Var olan dört aşamalı gezegensel haritanın üzerinde, mevcut oynanışı değiştirmeden yayıncıya sunulabilir özgün görsel kalite üretmek.

## 0. Tasarım ilkesi ve dürüst başlangıç noktası

Bu plan, yeni bir oyun veya harita yaratmaz. Mevcut Harita 4 kodu ve oyun akışı korunur. Kullanıcı 19 Ekim'de haritayı yaklaşık 3/10 bulmuştu; VQ04 testlerinin geçmesi son estetik puanın arttığını ispatlamaz.

Kaynakta gerçekten bulunanlar:
- Tek kök index.html: yaklaşık 412 KB; yaklaşık 7.497 satır. Three.js r128, HTML/CSS/JavaScript; Three.js, Tailwind ve fontlar hâlen CDN üzerinden çağrılıyor. Bu nedenle “tek HTML” şu an “tüm bağımlılıkları çevrimdışı içinde barındırıyor” anlamına gelmez.
- Harita 4: dört bağlı bölge, geniş uçuş alanı (yaklaşık 3700 / 4100 / 3350 / 3550 yarıçap), 50.000 ilerleme, 300 saniyelik limit; ikinci evrede 60 saniyelik ileri ilerleme kilidi; yörünge için >=850 yerel irtifa.
- 12 adlandırılmış özel mekân (bölge başına 3); 6 sanayi düğümü; 226 W02 yakın/uzak çevre modeli; 36 W05 endüstri çarpışma hacmi; 6 W03 kaya çarpışma hacmi.
- Prosedürel PBR normal/roughness ve kaplamalar, VQ03 detaylı gemi kanatları/patlama, VQ04 sky shader / 36 bulut / 1540 hava parçacığı / 12 yumuşak temas gölgesi / irtifaya göre sis ve ışık.
- Arazi halen bölge başına yaklaşık 80 x 16 yüzey hücresine dayanan, geniş alanda nispeten kaba, flat-shaded görsel zemin; büyük çevre kütlelerinin önemli kısmı kutu, silindir ve basit procedural mesh. Haritanın özgün detaylı sanat varlığı henüz tamamlanmadı.
- renderer.shadowMap için etkin dinamik gölge sistemi yok; VQ04 gölgeleri düzlemsel radial decal'dir. Geliştirme planı gerçek gölge/açısal aydınlatmayı ölçerek seçmeli uygulamalıdır.
- Testler görev kuralları ve kod regresyonunu ölçer. Genel grafik estetiğini, FPS'yi ve kamera kompozisyonunu bağımsız olarak onaylamaz.

ANA KARAR: Görsel sıçrama için sahneye daha çok tekdüze mesh eklemek değil, özgün sanat tasarımı + büyük/orta/küçük form hiyerarşisi + tutarlı malzemeler + bilinçli kadraj gerekir. Parçacık/bloom/ışık tek başına bu eksikliği kapatamaz.

## 1. Değişmez ürün ve oyun sözleşmesi

- Harita 1'in onaylanan neon uzay görünümü, fizik, kamera, yarış akışı, HUD ve sonuç ekranı aynen çalışmalıdır. Harita 4'e özel her kaynak/bayrak ayrı tutulmalıdır.
- Harita 4: tek dünyada 4 evre. 1) Yaklaşık 40 sn vadiler 0–12500, 2) kesin 60 sn avcı arenası, 3) 14000–34000 sanayi + avcı + bina kaçınma, 4) 34000–50000 üs ve yükseliş. İkinci evrenin ilerleme kilidi kaldırılmaz.
- 300 sn üst limit, >=850 yörünge irtifası, normal avcı +1 ve elit +3, gerçek vuruş gereksinimi, 5 rakip pilot, gerçek fizik/çarpışma, puan ve DNF değiştirilmez.
- Üç rotalı vadi: güvenli orta / gerçek +%18 hızlı batı / avcıya dönük doğu. Sanayi: +%12 hızlı alçak boru / güvenli üst / doğu avcı hattı.
- Görünen fiziksel katı eleman ve collider birebir kabul edilebilir şekilde eşleşmelidir. Saf görsel set dressing için yeni, görünmez veya haksız kollizyon yaratılmaz. Oyun kamerasındaki oynanabilir açıklıklar korunur.
- Tek indirilebilir, açılabilir HTML çıktısı ana teslimdir. Kaynak kod modüler hâle getirilebilir, fakat dağıtımda aynı oynanabilir tek HTML korunur. Haricî bağımlılıklar varsa dürüstçe belirtilir; bağımsız/offline hedefi ayrı kabul kapısıdır.
- Toplam altı harita hedefi değişmez. Burada Harita 4'ün üretim kalitesini artırırken ortak üretim araçlarının diğer haritalara aktarılabilmesine dikkat edilir. İlk yayıncı görüşmesine en az üç oynanabilir harita sağlama ürün şartı korunur.

## 2. Görsel kimlik: ayrıcalıklı ve tutarlı bilimkurgu

İstenen stil: “sinematik, fiziksel ağırlığı hissedilen, askeri-endüstriyel gezegen bilimkurgusu”; ne basit parlak neon, ne de teknik bütçeyi boğan saf fotogerçekçilik. Detaylı ama okuması kolay gerçek zamanlı 3D.

Beş tasarım kuralı:
1. Silüet uzaktan tanınmalı: bir mekân 1500–3000 yerel birim uzaktan kendine özgü biçimle ayırt edilmeli.
2. Üç ölçekli işleme: mega yapı / oynanabilir orta ölçek / yüzeye yakın küçük parça ve decal. Her ölçek ayrı yakınlık bütçesinde ortaya çıkmalı.
3. Malzemelerin davranışı fiziksel: kaya mat ve katmanlı; açıkta metal oksitli ve çizikli; pas ve kir su/ısı/kenar mantığına göre; cam seçici ve kontrollü parıltılı.
4. Renklerin anlamı var: sıcak doğal güneş/kaya; soğuk endüstri; tehlikede amber-kırmızı; dost gemi ve navigasyonda cyan/beyaz. Her yüzey neon değildir.
5. Hızda okunabilirlik: 1 saniyenin altında fark edilen rota, hedef, çarpışma kütlesi, kalkan etkisi ve yörünge yönü. Düşmanlar arka plandan ayrılmalı.

Bölgesel look hedefleri:
- Vadi: yanık turuncu/kızıl katmanlar, desatüre mavi gökyüzü, ince altın kum sisi, taş yüzeyi sert güneş gölgesi.
- Arena: daha düşük saturasyon, kırılmış karbon/siyah çelik, dumanın arkasında okunur hedef konturu; cepheye göre farklı kütle.
- Sanayi: koyu soğuk çelik/bakır, yeşilimsi kir-gri, boru ikaz amberi, lokal ısı/parlama; yapıların mekanik işlevi açık.
- Üs ve yörünge: askeri beyaz-gri kompozit / lacivert, soğuk terminal ışıkları, dev ölçek ve derin perspektif; yükseldikçe mavi/siyah, seyrek bulutlar ve yıldızlar.

Özgün model hedefi: Referans oyunların doğrudan varlıklarını kopyalama yok. Kullanılan üçüncü taraf malzeme/model lisansları doğrulanır, atıf dosyasına işlenir.

## 3. Üretim omurgası — ayrı, test edilebilir işler

Eski etiketleri değiştirmiyoruz: VQ05 motor/atış VFX ve VQ06 kamera/HUD olarak kalır. Yeni GFX iş paketleri, uygulanma sırasını tarif eder; VQ05/VQ06 daha doğru zamanda tamamlanır.

### GFX-00 — Referans, ekran görüntüsü ve performans tabanı [P0, 1–3 kişi-günü]
Görev: Mevcut main için gerçek ekran, açılış, GPU ve oyun içi baseline oluştur.
- 1920x1080 / 1600x900 / 1280x720, CHASE ve TURRET kameraları.
- Her fazda giriş–orta–çıkış; oynanabilir 40/60/85/95 sn hedefleri çevresinde kadraj.
- Aynı seed, aynı pilot, aynı laneX/laneY/progress, aynı çözünürlük ile A/B karşılaştırma noktaları.
- renderer.info.render.calls / triangles; renderer.info.memory.geometries, textures; kare-zamanı p50/p95 ve mümkünse GPU zamanı; aşama değiştirme ve restart heap eğrisi; cold/warm load.
- Geniş alan ve gemi çapını sahnede ölç; set-piece görüntü içindeki görünür piksel yüksekliğini çıkar.
Kabul: Önceki grafiklerle doğrudan karşılaştırılabilir 12–16 referans kadraj + baz FPS/log; regressions PASS. Bu yapılmadan hedef estetiği veya performans yüzdesi ilan edilmez.

### GFX-01 — Sanat üretim hattı ve 3D kaynak standartları [P0, 3–5 kişi-günü]
Görev: Gerçek model/texture paketini koda alabilecek ama oyun HTML'ini kırmayacak pipeline.
- Kaynak proje içi geometri/texture/material/region/LOD/FX modüllerine bölünebilir. Build sonunda tek index.html üretilir.
- Blender/başka modelleme yazılımından GLB/glTF dışa aktarımı; loader Three.js r128 ile uyumlu pinlenir, sürüm yükseltmesi istenirse ayrı iş olur.
- Her asset: ad, ölçü, local axis, pivot, 0-2 LOD, materyal/atlas, çarpışma proxy, görünür mesafe, lisans, bellek tahmini ve beklenen referans kare.
- Asset source / exported GLB / atlas / runtime mapping net olmalı. Yerel asset'ler gerekiyorsa build aşamasında data URI/asset bundle olarak gömülür; base64 şişmesi ve ilk açılış süresi ölçülür.
- CDN Three.js/Tailwind/font bağımlılıklarını tek-file dağıtımda paketleme veya kontrollü hazır yükleme kararı ile ayrı doğrula. Şu anki HTML çevrimdışı olarak kesin garanti edilmemeli.
- model-loading hataları için fallback mesh; model bulunamadığında fizik ve görev devam etmeli.
- QA preview: model döndürücü, wireframe, normals, collider outline, materyal kanalları, LOD switch.
Kabul: 1 özgün kaya, 1 özgün sanayi bloğu, 1 özgün gemi modeli ve texture atlası aynı test build'inde çalışır; önceki HTML/GitHub testleri PASS.

### GFX-02 — Büyük ölçekli kompozisyon ve araziyi yeniden sanatlandırma [P0, 5–9 kişi-günü]
- h4GroundStrip için 80x16 coarse zemin görünümü yerine çok katmanlı terrain: uzak/orta/yakın mesh LOD, kesintisiz birleşim, fizik ve görsel zemin ayrımı.
- Değerli alanlarda yerel adaptive tessellation; çok uzakta ucuz silhouette mesh. Geniş zemin komple her kare subdivide edilmez.
- Mevcut ±5850 genişlik ve uçuş envelope'u aynı kalır. Üç rota açık olduğu sürece geçidin kenarlarına erozyon duvarları, basamaklı kaya terasları, negatif alanlar eklenir.
- UV/world-space ölçek tutarlı; tekrarlanan doku moire ve büyük bantlar düzeltilecek. Distant parallax ve gerçek perspektif katmanları.
- Kaya kitini en az 12 özgün ana form + 6 küçük varyant olarak kur: dikey fay sütunları, aşınmış tabakalı yüzey, dev kırık mesa, doğal köprü, yığma blok, şist plakası, ufalanmış kaya tabanı vb.
- Deniz gibi düz sonsuz yüzey hissi kırılacak; ama okunur, alçaktan uçulabilir açıklıklar kalacak.
Kabul: 3 vadi rotasında yön bulma arttı; geçitlerin fiziksel taş collider sınırı değişmez; sahnedeki kaya kopyası izlenimi manuel incelemede azalır. Görsel arazi üzerinden sahte çarpışma beklenmez.

### GFX-03 — 12 özel mekânın “hero asset” üretimi [P0, 7–13 kişi-günü]
Herinin 3 katmanlı modeli: 1) uzaktan silüet, 2) mesafede büyük mimari, 3) yakında panel/hasar/işaret:
- 1) 1950 Kızıl Kaya Kapısı: tabakalı doğal kemer ve aşınma; rotanın ağzı boş.
- 2) 6100 Kırık Mesa Sırtı: kesik kaya platoları, düşmüş parça ve çatlaklar.
- 3) 10100 Kanyon Gözleme: kaya üstüne bağlı gözetleme anteni, temel, iskelenin gerçek mühendislik dili.
- 4) 12640 Düşmüş Kruvazör: orta büyüklükte sandığa benzeyen kütle yerine büyük kırık omurga, kaburgalar, motor ayrımı ve yanık metal.
- 5) 13220 Hava Savunma Hattı: iki ayrı top/anten bataryası, platform ve tahkimat.
- 6) 13770 Savaş Alanı Yıkıntısı: gövde parçaları, açık enkaz iskeleti, noktasal duman.
- 7) 17200 Tasfiye Rafinerisi: birbirine bağlı tank, baca, kondansatör, vanalar ve hatlar.
- 8) 23800 Makine Kuleleri: asimetrik üretim kulesi, vinç rayı ve servis platformları.
- 9) 31600 Enerji Aktarım İstasyonu: teknik bağlantılı ana jeneratör ve enerji halkaları.
- 10) 36200 Hudut Karakolu: katmanlı savunma kütlesi, radar ve küçük hangarlar.
- 11) 42600 Askerî Uzay Limanı: üç iniş alanı ve hangar/terminal/bakım yolları.
- 12) 48300 Yörünge Fırlatma Kompleksi: en güçlü dev dikey silüet; merdiven, hat, fırlatma kolları ve irtifa referansları.
Kabul: 12/12 mekân silüet testi ve her bölgede 3 ayırt edilen hedef. Her sitenin kendine özgü orta ölçek detayları; kullanıcı navigasyon/HUD okunabilirliği gerilemez.

### GFX-04 — Savaş ovası ve 6 sanayi düğümünün ayrı karakteri [P0, 6–10 kişi-günü]
Arena (60 sn, ilerleme kilidi korunur):
- Açık merkez: geniş 3D alan hissi; kontrollü kütle ve hedef temiz görüşü.
- Batı enkaz: “dev kruvazör düşmüş” duygusu; tekrar eden hurda objeleri değil, kırılmış yönlü ana omurga.
- Doğu elit: batarya kuleleri, tahkimat, antenler, savunma silüeti; özel kırmızı-amber tehlike dili.
- 3 normal + 3 normal + 2 elit gerçek havuz; görseller avcı hedeflemesini sisle örtemez.

Sanayi altı düğüm için işlev ayrımı:
1. 15750 giriş rafinerisi ve ayırma tesisi,
2. 18750 yüksek basınçlı transfer/boru köprüsü,
3. 21850 ağır pres ve makine montajı,
4. 24950 enerji kazanımı ve soğutma kuleleri,
5. 28150 yükleme-lojistik/depo ve raylı vinç,
6. 31500 son enerji santrali/güvenlik kontrol hattı.

Kit: 8–12 tür boru dirseği/bağlantısı, 6–8 baca/tank, 8–12 panel/çatı/hangar/gantry modülü, 5 çeşit mekanik bileşen, 6 çeşit ikaz/servis küçük prop. Katı mekanik gövde ile sadece görsel küçük detay ayrı.
Kabul: Mevcut 36 W05 collider ve yerleri kontrol edilir; alçak +%12 rota, üst güvenli rota, doğu avcı rotası korunur. Temas gizli kutu algısı vermemeli. Altı kompleks ekran görüntüsünde birbirine karışmamalı.

### GFX-05 — Gemilerin profesyonel silüeti ve animasyon anatomisi [P0, 4–8 kişi-günü]
- Oyuncu GeoSword: gerçek gövde kesiti, hava girişleri, önden/arkadan okunan kanatlar, motor nozul ve kokpit camı.
- 5 rakip: toplam 5 farklı taktik profilin silüet farkı; silah/ekran işaretleri renk ve materyalle anlaşılır.
- Normal ve elit avcı: iki düşman sınıfı arasındaki form/fanül/kanat farkları; elit yalnızca daha parlak renge boyanmış normal model olmayacak.
- Bank/yaw/pitch sırasında kanat ve gövde doğru pivotla davranmalı; boost'ta nozul animasyonu; hasarda kısa kütle/ışık gerilimi.
- Her model LOD0/LOD1/LOD2 + uzak ufuk için basit billboard seçeneği; hit radius, hedef hesaplaması ve kontrollere dokunulmaz.
Kabul: oyuncu ve hedef ekran boyutu/nişangâh okunaklı, 5 rakip ve 2 düşman sınıfı en az iki yönden ayırt edilebilir, Map1 gemisi aynı kalır.

### GFX-06 — Materyal, atlas, decal ve yüzey hikâyesi [P1, 4–8 kişi-günü]
- PBR şablonları: kızıl kumtaşı, koyu bazalt/erozyon, normal/roughness kaya; kırçıllı kompozit, boyalı çelik, aşınmış karbon çelik, bakır, sıcak metal, kontrollü cam.
- Albedo/normal/roughness/metalness/ao kanalları teknik olarak doğrulanmalı; r128 renk uzayı ile yeni Three sürümü API'leri karıştırılmamalı.
- 1k–2k birkaç paylaşılmış atlas; 4k her binaya ayrı atlas yok. Yakın ekrana giren tekil hero asset için 2k seçmeli; düşük kalite profilinde düşük çözünürlük.
- World scale'e bağlı texel density; UV stretching/dokunun tekrar etmesi ve fırça izi gibi procedural gürültü düzeltilir.
- Çizik, yağ, yanık, çatlak, kurum, sızdırma, panel uyarısı, zemin yol izi: tutarlı yüzey mantığıyla.
- Büyük nesne kenarlarında normal/geometri bevel; speküler highlight gerçek şekli okumaya hizmet eder.
Kabul: aynı malzeme her sektörde tutarlı tepki verir; yakın/orta kamera testi, nötr ışık testi, parlama aşırı doygunluk testi PASS.

### GFX-07 — Gölge, fiziksel ışık ve atmosfer [P1, 4–7 kişi-günü]
- VQ04 sky/fog/renk sistemi bir taban kabul edilir; ikinci paralel gökyüzü yazılmaz.
- Temas decal'i kalır; ana büyük objelerde düşük maliyetli baked AO + seçilmiş kısa menzilli dynamic shadow map prototipi. Tam sahne 5 ışıklı gerçek zamanlı gölge üretmeyiz.
- Key/fill/rim oranı faz başına kontrollü; arena hedefler karanlıkta yutulmamalı.
- Hafif atmosfer derinlikleri, volumetric taklidi light shaft mesh, heat haze gibi teknikler yalnız ölçümde uygunsa etkinleştirilir. Gerçek fiziksel volumetric renderer zorunlu değil.
- Orbital sahne: irtifayla bulut, horizon, sis, gölge ve gemi kontrastının değişimi.
- Gün doğumu/sis yalnız görsel; oynanışta kritik okunurluğa müdahale etmez.
Kabul: 12 sabit kadrajda, ana objenin zemine oturduğu ve mesafenin anlaşıldığı görülür; p95 kare süresi hedef bütçeyi aşmamalı.

### GFX-08 — Mevcut VQ05: motor, silah, temas ve savaş VFX [P1, 3–6 kişi-günü]
- Boost/normal motor için iki kademeli nozul, kısa/uzun motor izi, yön/hız ile ilişkili tek temiz trail.
- Lazer: ateş anında muzzle/namlu ışığı, rotaya göre kontrollü iz ve kısa isabet flaşı; hedefi örtmeyen renklendirme.
- Normal avcı vs elit avcı patlaması; şok halkası ve altı duman katmanı VQ03 tek başına yeterli değil. Metal/enkaz parçaları, sıcak çekirdek, kısa ölçekli flash, kalan dumanın zamanlaması.
- Kaya/metal temasında malzemeye uygun toz/kıvılcım ve hasar çarpma yönü; gerçek fizik olaylarına bağlanır.
- Geçici GPU buffer / pooled sprite kullan; çakışan çoklu patlamalarda global bütçe ve otomatik fade; restart temizliği.
- Binalarda kozmetik yanık izi sadece fiziksel isabet/temas olayında, görsel olarak yeri doğru tutarsa.
Kabul: 60 saniyelik savaş arenasında eşzamanlı lazer ve patlamada hedef kaybolmaz; herhangi bir VFX oynanış hasarını/puanını doğrudan değiştirmez.

### GFX-09 — Mevcut VQ06: kamera, hareket okunabilirliği, HUD ve post [P1, 3–6 kişi-günü]
- CHASE kamera üçüncü şahıs gemi ölçeği / FOV / smoothing; savaşta kamera vs yarışta kamera davranışını görsel stabiliteyle kalibre et.
- TURRET ve CHASE'de hedef görünürlüğü, hız hissi, yerleştirme; camera clipping veya horizon kırılması olmamalı.
- Hafif color grading ve sadece anlamlı emissive yüzeyde ölçülü bloom; büyük per-frame tam ekran efekt zinciri zorunlu değil.
- Hız çizgileri/screen-space impact feedback kısmi ekran, motion blur/DOF hedef okunurluğunu düşürüyorsa kapalı.
- HUD: bölge/rota/puan/60 sn geri sayım/850 yükseklik, ekranın merkez sahasını tıkamaz. Kontrast ve nişangâh vurgusu.
- Foto modu/debug toggle yalnız geliştirme sürümünde: HUD'siz screenshot, sahne/hitbox/LOD profilini görmek için.
Kabul: 1080p ve 720p, ekran kenarında uyarı kırpılması yok; 2 kamera modunda da rekabetçi oynanabilirlik bozulmuyor.

### GFX-10 — Büyük sahne optimizasyonu, kalite profilleri, paketleme [P0/P1, 4–8 kişi-günü]
- Objeleri yakın/orta/uzak olarak grupla; yalnızca aktüel görünür bölgeyi detaylı çiz. Region visibility yanında frustum/distance culling, instancing ve gerektiğinde merge geometry.
- Bir geometri+malzemeyi çok kullanan kaya/boru/panel varlıkları için InstancedMesh (r128 uyumlu) ve gerektikçe atlas; 12 hero ana modeli zorla tek instanced forma sokulmaz.
- LOD mesafeleri hız ve ekran piksel boyutuna göre; pop etkisi azaltmak için görüntü temelli kalite kabulü.
- GPU kaynak bütçesi; uzun görev boyunca per-frame artan geometri/material/texture yok. Kaybolan parçacıklar pooled/disposed; yeniden başlatmada leak yok.
- Üç preset: High (ana hedef), Balanced (orta), Low (gerekirse 720p/iGPU). Preset; render scale, gölge, atlas seviyesi, smoke sayısı, LOD ile oynar. Oyun kurallarına dokunmaz.
- Tek HTML build: build boyutu, decompress, startup, CDN isteği, cache ve offline açılma ayrı ölçülür.
Kabul: 4 faz ve 60 sn çok hedefli arena için FPS/stat bütçesi karşılanıyor; Map1 regresyonu PASS.

### GFX-11 — Görsel kabul, yayıncı kareleri ve sürüm kapısı [P0/P1, 2–4 kişi-günü]
- 4 faz x (giriş, orta, çıkış) = en az 12 karşılaştırılabilir oyun karesi; CHASE ve TURRET ek örnekleri, alt yükseklik/yörünge varyantı.
- Her karede hedef/rota okunurluğu, gölge ve geometri, malzeme, sıkışma, pop-in, clipping ve HUD kontrol listesi.
- Yaşayan örnek: başlamadan önceki VQ04 baseline / yeni sahne yan yana; yalnız test PASS'e dayanarak 7/10–8/10 açıklanmaz.
- İnsan kullanıcı onayı: ilk VQ07 sanat bloğu ve son mastering bölümü için özel ekran görüntüsü ve oynanış puanı.
- Kod testleri: 300s, arena tam 60, 8 avcı ve doğru 3/3/2, 36/6 collider, +%18/+%12 rotalar, >=850, 5 rakip, normal +1 elit +3, real hit, restart kaynak sayısı, Map1 tonemap/fog/camera görünümü.
- GitHub CI Chromium + ekran görüntüsü artifact + performance log + gerçek oynanabilir HTML Release.

## 4. Dört bölgede sahne kompozisyonu: oyuncunun sırayla görmesi gerekenler

### Faz 1, 0–12500: yaklaşık 40 saniye
Açılış 0–2500: filonun tam genişliği, uzak kızıl dağ duvarı, Kızıl Kaya Kapısı ana silüet; güvenli merkez tamamen açık.
2500–7000: üç rota aynı sahnede okunur; batı dar geçit riskli ama temiz, doğu avcı hattı hedefe açık; Kırık Mesa Sırtı iki tarafta katmanlı.
7000–12500: yüksek kaya/çöl panoraması; Gözleme anteni göründükten sonra açık savaş ovasına yumuşak görsel geçiş.
Detay kümeleri: 12 ana kaya kit formu, ufuk mesa, kırıntı kümeleri, uzun katman izleri, rüzgâr aşınma hatları ve seçici ikaz işaretleri.
Görsel yasaklar: düz açık kahverengi dev plane; üç defa aynen kullanılan şeritli kule; sahte kaya duvarı; oyuncunun geçeceği alanı kapatan dekor.

### Faz 2, 12500–14000: kesin 60 saniye
Bir sahnede üç farklı cephe okunur: merkez geniş savaş/temiz hedefler, solda uçak gemisi enkazı ve yükselen parçalar, sağda iri savunma anteni/bataryası. Duman ve kıvılcım canlı savaş anını ifade eder ama hedeflerin önüne perdelenmez.
60 sn süresince ufuk sabit kalmış gibi hissettirmeyen yerel parçacık/parallax/ateşli temaslar; ileri uçuş kilidi gizlenmez, oyuncunun kontrolü açık.
Görsel yasaklar: aynı kutu bina sırası, kesintisiz siyah duman perde, rastgele kırmızı/neon spamlama.

### Faz 3, 14000–34000: yaklaşık 85 saniye hedef
Alt boru + üst güvenli + sağ avcı ceplerinin her birinde ayrı silüetler. 6 istasyonun girişinde bir görsel imza, içinde üretim mantığı ve çıkışta bir dönüm noktası. Ana üretim binalarının bağlantısı; “binalardan kaçarak uçuyorum” deneyimi görsel olarak doğru.
Her düğümde en az 1 benzersiz büyük modül, 3–5 varyant orta prop, tekrar kullanılabilir endüstriyel kit. Boru/köprü görünür fiziği açık.
Görsel yasaklar: tavanın/hitbox'ın yerini gizleyen ağır ışık, her düğümde kopya sıralama, binanın içinden görünmez engel nedeniyle hasar.

### Faz 4, 34000–50000: yaklaşık 95 saniye hedef
Karakol → geniş liman / hangar / pist → dev fırlatma kulesi → üst atmosfere çıkış. Yörünge kapısı yaklaştıkça oyuncu 850 yerel irtifaya yükselmesi gerektiğini manzaradan ve HUD'dan anlar.
Kamera zemin geride kalırken yükselişi görür: bulut üstleri, sıcak ufuk incelmesi, karanlık mavi ve yıldızlar, dev kule silüetinin aşağıda kalması. Bilinçli son kahraman kare; yalnız sky shader renginin değişmesi yeterli sayılmaz.
Görsel yasaklar: boş hava, merdiven gibi kalan uzay seviyesi hissi, ufuk aniden kopuyor izlenimi.

## 5. Üretim adetleri ve yaklaşık varlık bütçesi — HEDEF, MEVCUT DURUM DEĞİL

| Paket | Planlanan sanat üretimi | Not |
|---|---:|---|
| Büyük hero yer işaretleri | 12 | Her biri özgün kompozisyon, ortak modüller mümkün |
| Kaya/erozyon ana modülleri | 12–18 | İnstans/LOD ile varyasyon |
| Küçük taş/moloz/zemin varyantı | 15–25 | Atlas ve instancing |
| Endüstri mimarisi/boru/mekanik | 30–50 | 6 düğüm, 36 collider korunur |
| Üs/hangar/fırlatma kitleri | 12–20 | Son faz ana silüetleri |
| Gemi ana sanat aileleri | 8 | GeoSword + 5 rakip silüeti + 2 düşman sınıfı |
| Malzeme aileleri | 10–14 | Atlas alt varyantları hariç |
| Dekal/işaret/hasar varyantı | 20–30 | Kontrollü yerleşim |
| Ana görsel efekt olay türü | 10–14 | Muzzle, impact, burn, explosion, exhaust vb |

Mesh sayısı başarı ölçütü değildir. 1 etkileyici büyük çevre formu 100 küçük tekrar objesinden daha değerli olabilir. Adetler prototip kabulüne göre optimize edilecektir.

LOD başlangıç deneme bütçesi (asset başına, garanti değil):
- Hero çevre LOD0: yaklaşık 12k–40k üçgen; LOD1: yaklaşık 3k–12k; LOD2: yaklaşık 500–2k.
- Genel modüler bina: yaklaşık 1k–8k üçgen; yakın fiziksel objelerde kritik form korunur.
- Oyuncu/orta mesafe gemisi: yaklaşık 8k–25k üçgen LOD0; bot ve avcılarda 2–12k yakın LOD.
- Uzak tekrar eden objelerde atlas/instancing; tek sahnede toplam görünür üçgen bütçesi ölçülecek.

## 6. Performans hedefleri, otomatik kanıt ve eşikler

Hedef cihaz şartı kesin değil; şu değerler ilk optimizasyon denemesi için geçici hedefler:
- 1080p / dengeli masaüstü GPU: medyan 60 FPS (yaklaşık 16,7ms), p95 frame time hedef <= 25ms. Sabit 60 FPS garantisi verilmez.
- Daha zayıf/integrated GPU için Balanced/Low ile hedef 30 FPS ve oynanış kararlılığı.
- Harita 4 High için tek kare örnek hedefi: 300–500 draw call, 0.6–1.2 milyon görünür üçgen; asıl sınırlar GFX-00 profilinde ve ekran/görünüş ile kararlaştırılır.
- Paylaşılan texture atlasları için başlangıç GPU texture budget 128–256 MB; donanım farklılıklarına ve platform hedefine göre yeniden ayarlanır.
- Ağ/ilk yükleme/HTML toplam boyutu performans log'unda ayrı gösterilir; “tek HTML” için paketleme sonrası dosya boyutu kontrollü büyür. Asset'leri binlerce bağımsız base64 dize olarak saklamayız.
- 5 dakikalık tam görev + tekrar başlatma 3 kez: renderer.info ve JS heap kalıcı olarak çizgisel büyümez. Nokta parçacık, patlama ve decal havuzları bounded.
- Screenshot otomasyonunda shader derleme, WebGL görünümü, ışık eşleme ve default Map1 karşılaştırma doğrulanır. Pixel diff toleranslıdır; estetik kararın yerine geçmez.

En önemli kırmızı çizgi: FPS düşüşünü görsel parçacık sayısını gizlice dörde katlayarak veya uzaktaki her şeyi çizerek kabul etmeyiz. Önce silüet sonra detay, ardından ölçüm.

## 7. İş sırası ve teslimat dalgaları

Öncelik sırası:
1. GFX-00 baseline ve referans kareler.
2. GFX-01 build/asset pipeline + 1 kaynak-model kabulü.
3. GFX-02 kanyon/terrain ilk büyük görsel dönüşüm.
4. GFX-03 ilk 3–4 hero landmark ile görünür kalite kapısı, sonra 12'ye tamamla.
5. GFX-04 savaş arenası ve 6 sanayi düğümü.
6. GFX-05 gemi aileleri.
7. GFX-06 malzeme/atlas/decals.
8. GFX-07 ışık/gölge/atmosfer son görünüşü.
9. GFX-08 (eski VQ05) motor/çatışma efektleri.
10. GFX-09 (eski VQ06) kamera/HUD/post.
11. GFX-10 optimizasyon/bundle.
12. GFX-11 nihai kalite ve yayıncı kareleri.

Paralellik: GFX-03 ve GFX-05 sanat üretimi birbirine bağımlı değil; üretim paralel olabilir. Ancak tüm kod değişiklikleri sahne entegrasyonu ve testleri geçerek birleştirilir. GFX-10 profiling her aşamada küçük ölçümlerle uygulanır, yalnız sona atılmaz.

Somut ilk 4 PR önerisi:
- PR-01: baseline screenshots + renderer.info frame statistics + bir sahne seed/debug aracı + harita1 snapshot; yalnız ölçüm.
- PR-02: GLB import + asset register/cache/fallback + tek HTML pack prototipi; yalnız 3 küçük kaynak varlık.
- PR-03: kanyon 0–12500 için yeni terrain LOD, 12 özgün kaya sınıfı ilk 4'ü, ilk 3 landmark; fizikte değişiklik yok.
- PR-04: arena 3 cephe için dev kruvazör/elit batarya özgün silhouette upgrade ve ilk seçili materyal.
Ardından sanayi, üs, gemi ve tam VFX dalgaları küçük PR'larla ilerler.

Kişi-günü tahmini (tam zamanlı, deneyimli üretici varsayımı; üretilecek modellerin özgünlük düzeyine çok bağlı): ana GFX-00..11 toplamı yaklaşık 46–87 kişi-günü. Otomasyon ve mevcut modeller kullanılırsa alt sınıra inebilir; özgün AAA ölçüsünde asset yapılırsa üst sınırı aşabilir. Kesin teslim tarihi değil, planlama bandıdır.

## 8. Teslimat ve iş bölümü

- ChatGPT: GitHub, branch/commit/PR/test, kaynak sistem entegrasyonu, performans ve rapor, yeni tek HTML sürümünün release doğrulaması.
- Gemini: yalnız mevcut HTML'nin **dar kapsamlı oyun içi** değişiklikleri; bir görevde bir sistem. GitHub, commit, backup, dokümantasyon veya bütün büyük işi Gemini'ye devretme yok.
- Dış asset üreticisi/Blender: lisanslı veya özgün GLB/texture varlıkları, kaynak dosya, asset sayfası ve pivot/LOD standardına göre teslim.
- Kullanıcı: ekran görüntüsü üzerinden yön onayı; özellikle kanyon ilk büyük dönüşüm ve nihai mastering geçişi.

Her kilometre taşının kanıt paketi: GitHub diff/PR + CI sonucu + önce/sonra aynı kamera screenshot + cihaz/FPS notu + doğrulanmış oynanabilir HTML bağlantısı. Kısmi grafik başarı oyun motoru/publisher demo tamamlandı anlamına gelmez.

## 9. Risk kayıtları ve önleyici tasarım

- Kaliteyi efektle maskeleme: saf geometri yerini tutmaz => önce kanyon/hero silüeti.
- Aşırı çizim çağrısı: her küçük parçayı mesh yapmak => instancing/atlas/LOD.
- Çok ağır dinamik gölgeler: büyük scene yeniden çizimi => baked AO + seçici yakındaki birkaç shadow caster.
- Arazi görsel ile fizik ayrımı: sahte duvara çarpışma => collateral hitbox değişikliği yasak, collider overlay karşılaştırması.
- Duman/atmosferde kaybolan avcılar: arena yarışının okunurluğu düşer => ekran merkezinde opaklık ve VFX limitleri.
- HTML dosya şişmesi: 100MB+ data URI paketleme => atlas sıkıştırma ve varlık boyutu metriği, iki build profili değerlendirme.
- Three.js sürüm uyumsuzluğu: yeni dokümanlardaki API'yi r128'e doğrudan kopyalama => önce sürümle uyumlu loader/post pass araştır, ayrı spike.
- Copy/paste çevre tekrarı: 226 objenin sayısı artar ama görünüş aynı => site bazlı art brief ve unique read test.
- Eski Map1'e malzeme/gölge sızıntısı => her PR otomatik Map1 switch/restart/tonemap testi.
- Yalnız browser testinden “8/10 grafik oldu” iddiası => kullanıcının karşılaştırmalı görsel değerlendirmesi ve FPS onayı şart.

## 10. Tamamlandı ölçütü: onay kapıları

G0 Baseline: en az 12 karşılaştırılabilir screenshot, performans ölçümü, o anki commit ve cihaz bilgisi.
G1 Pipeline: 3 tür özgün asset içeren sorunsuz runtime, güvenilir build.
G2 Görünüş: kanyon ve 3 hero site, yalnız parçacık değil gerçekten farklı silüet; kullanıcı yön onayı.
G3 Dünya: 12 özel alan, 6 ayrı sanayi tesisi, üs/yörünge kadrajları tutarlı.
G4 Gemi: 1+5+2 silüet, 2 kamera okunaklı.
G5 Final: materyaller, kontrollü gölgeler, geçiş atmosferi, savaş VFX, HUD, performans, Map1 ve dört faz regresyonları PASS.
G6 Yayın: gerçek oynanabilir tek HTML, hash/commit eşleşmesi, 12 kare karşılaştırmalı kanıt, kullanıcı estetik kabulü.

Açıkça kapsam dışı: Harita 1 yeniden sanat tasarımı, altı haritayı bir seferde bitirme, oyun kuralları/AI/puan sistemini yeniden yazma, tam 6DOF uçuş simülasyonuna geçme, offline tek HTML kanıtlanmadan offline olduğu iddiası, fotogerçekçi AAA garanti.

## 11. Teknoloji referansları
- Three.js resmi materyal/instance referansı: https://threejs.org/docs/pages/InstancedMesh.html
- Çok nesneli sahne optimizasyonu: https://threejs.org/manual/pages/optimize-lots-of-objects.html
- Three.js glTF iş akışı: https://threejs.org/manual/pages/loading-3d-models.html
- Dinamik gölge maliyetleri: https://threejs.org/manual/pages/shadows.html

Not: Resmi dokümanların bugünkü API'si proje tarafından kullanılan r128 sürümüyle birebir aynı olmayabilir. Adaptasyon kodu proje sürümünde test edilmelidir.
