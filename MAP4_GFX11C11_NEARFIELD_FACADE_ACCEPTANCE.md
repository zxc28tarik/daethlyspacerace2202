# NEXT-11C11 — 07/08 Yakın Sanayi Cephelerinin Makro Okunurluğu

**Durum:** NEXT-11C10 üst katmanının tam browser CI çalışması [#44077131964](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44077131964) **PASS (33/33)**. C11 gerçek `index.html` kodu, bağımsız gerçek WebGL 07/08/09 testi ve hızlı/tam workflow dosyaları işlendi. **C11 güncel CI, gerçek ekran incelemesi ve estetik kabul henüz doğrulanmadı.**

## Neden yeni geliştirme?

Önceki gerçek C10 ekran görüntülerinde 07/08 sanayi kütleleri aşırı düz/tekrarlı, yeni uzak tesisler görünür fotoğrafta küçük. Yeni daha fazla uzak fabrika/kutu koymak yerine, kameranın zaten gördüğü **eski ve fiziksel olan W02 sanayi binalarının görsel duvarları** üzerinde büyük, işlevsel panel/çerçeve üretmek öncelik.

## Kod — tamamlanan işler

- `h4Gfx11c11BuildRelief(zone)`: önceki 34 korunan fiziksel kabuğu **referans kimliği, geometri, collider AABB** ile aynı tutarak yalnız sanayi giriş/üretim kısmındaki kabukları seçer (collider `progress<29200`). İki özgün, matematiksel model:
  - **Dört duvarlı blokların görünür havalandırma cephesi:** üç geniş kömür tonu servis havalandırma boşluğu, gerçek yatay metal louver, dikey korozyonlu taşıyıcı, geniş yan ızgaralar ve ince açık çatı kenarları; fazla yeni dekoratif halka veya kapalı beton blok yok.
  - **Yedi kenarlı kulelerin ısı transfer cephesi:** yedi geniş geri çekilmiş panel, yatay ısı değiştirici louver şeritleri, çatı metal bağlayıcıları. Görsel yüzeyler mevcut fiziksel silüetle ölçeklenir.
- Yalnız **iki InstancedMesh batch**, her eski fiziksel binanın `matrix` dönüşümüne bağlanır; önceden üretilmiş `NEXT11C5` çelik-kir PBR atlası paylaşılır. **Yeni texture, dış model, ışık, collider yok**.
- Her seçili fiziksel objenin **yalnız render material** kimliği bir C11 malzeme ailesiyle değiştirilebilir. `h4Gfx11c11SetLook(false)` tüm bu materyalleri eski hâline geri getirir, fiziksel geometri ve collider pointer'ı başından sonuna aynı kalır. Ara katman C3–C10 ayrı test edilebilir.
- High/Balanced ve yalnız Harita4 phase3; Low, Harita1, arena, kanyon ve orbit fazı: kapalı. `updatePlanetaryWorld()` anlık görünüm günceller, yeni mesh/texture üretmez.

## Değişmez kararlar

6 harita, ilk yayıncı sunumunda en az 3 oynanabilir; Map1 saf yarış/yerinde; Map4 4 faz, 60s arena, 300s toplam, 850m yükseliş, 5 rakip, 8 avcı, üç sanayi uçuş hattı, **6 kanyon/36 sanayi/200 bina collider**, **24 W05 BEACON/HIGH_MARKER**. Bütün korunan 34 W02 bina fiziksel geometri/collider referansları sabit. C3–C10 grafik katmanları geri döndürülebilir. Kullanıcı açık onayı olmadan PR merge yok.

## Özgünlük ilkesi

Kullanıcının kararı: farklı oyun/model portföylerinden **atmosfer, malzeme seviyesi ve teknik kalite ilhamı** alınabilir, fakat bir kaynağın tanınabilir silüeti/yerleşimi veya varlık dosyası **kopyalanamaz ya da aşırı yakından taklit edilemez**. CGTrader örneği veya başka ticari paket bu C11 sahnesine yüklenmedi. C11 geometri kendi kaynak koduyla matematiksel olarak oluşturuldu.

## Gerçek kabul kapıları

- [x] `index.html` kaynak kodu yazıldı, JS syntax check PASS.
- [x] Gerçek 1600×900 Chromium/WebGL test: 07/08/09 sabit kamera gerçek A/B; 34 fiziksel shell kimliği, 24 yönlendirme işareti, 6/36/200, 5/8, 60/300/850; materyal geri alma; drawcall/tris/texture/geometry ve High/Balanced/Low/phase izolasyon kontrolleri kodlandı.
- [x] Tarihsel C4–C10 bağımsız görsel A/B testleri C11 yeni katmanı pasifleştirecek şekilde güncellendi, full ve hızlı GitHub CI eklendi.
- [x] **C11 oyun kodu** hızlı Chromium/WebGL [#44079786753 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786753). 07/08/09 gerçek ekran artifact incelendi. Yeni sanatsal değişim var, kullanıcı estetik kabulü hâlâ açık.
- [ ] **Güncel C11 HEAD** Map1+Map4 tam browser-smoke CI PASS.
- [ ] 720/1080p native GPU FPS/p95/VRAM ve 300s gerçek pilot uçuş.
- [ ] Kullanıcı tarafından görsel kalite 7–8/10 **estetik kabulü**.
- [ ] Yayıncı için üç oynanabilir harita ve PR merge kullanıcı onayı.

**Test PASS, 7–8/10 kalite veya telif hukuku sertifikası değildir.** Açık estetik kalite borcunu varsayılan olarak kapanmış sayma.


## 17 Kasım 2026 — Gerçek C11 kod ve sanatsal doğrulama

- **Son hızlı Chromium/WebGL [#44079786753](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786753) PASS** — 9/9 başarı adımı; artifact `map4-next11c11-07-08-09-review`; gerçek 1600×900 07/08/09 A/B önce/sonra PNG.
- Yalnız **26 erken sanayi fiziksel W02 kabuğu** (17 kutu + 9 yedi yüzlü kule) için, **2 InstancedMesh drawcall, 22.308 yeni visual-only üçgen**. Toplam 34 W02 korunmuş kabuk, 24 W05 navigasyon işareti, 6/36/200 collider, 5 rakip/8 avcı, 60/300sn, 850m **değişmedi**. Yeni texture/light/collider/external asset **0**.
- Aynı kamera piksel farkı (ortalama RGB değişimi >1/255; HUD dahil): **07 %7,35**, **08 %6,70**, **09 %0,00**. Bu değişim oranı *estetik kalite puanı değildir*. 09 başka site için değişmeden tutuldu.
- **Gözle inceleme:** 07 ve 08'de ön plandaki kule ve geniş bina yüzeylerinde panel/vent/çerçeve ayrıntıları gerçekten okunuyor. Bununla birlikte gökyüzündeki ışıklı navigasyon halkaları, büyük düz endüstri zemini, tekrar eden basit binalar ve uçuş derinliği nedeniyle sahne **henüz 7–8/10 estetik seviyesine ulaşmış sayılmıyor**. Kullanıcı estetik onayı **ALINMADI**.
- **Güncel full Map1/Map4 suite:** [#44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) **sonuç açık**; eski C3–C10 bağımsız A/B testleri, Map1, 300s kaynak/fizik doğrulaması PASS olana kadar C11 full done yazılmaz.
- **Bir sonraki aday / YAPILMADI:** İçerikçe dolu ama silüetçe tekrar eden uzak sanayi binaları ve arazi ölçeği sorununu, fiziksel görünen ama çarpışmasız yeni büyük kutular eklemeden ele almak. Uçuşta merkez 3 hattı ve W05 navigasyon görsel işaretleri korunmalı; 7–8/10 kalite kullanıcı kararı bekler.
