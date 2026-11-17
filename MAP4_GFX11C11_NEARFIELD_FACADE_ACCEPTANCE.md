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
- [ ] **Güncel C11 HEAD** hızlı Chromium/WebGL PASS ve 07/08/09 gerçek ekran artifact incelemesi.
- [ ] **Güncel C11 HEAD** Map1+Map4 tam browser-smoke CI PASS.
- [ ] 720/1080p native GPU FPS/p95/VRAM ve 300s gerçek pilot uçuş.
- [ ] Kullanıcı tarafından görsel kalite 7–8/10 **estetik kabulü**.
- [ ] Yayıncı için üç oynanabilir harita ve PR merge kullanıcı onayı.

**Test PASS, 7–8/10 kalite veya telif hukuku sertifikası değildir.** Açık estetik kalite borcunu varsayılan olarak kapanmış sayma.
