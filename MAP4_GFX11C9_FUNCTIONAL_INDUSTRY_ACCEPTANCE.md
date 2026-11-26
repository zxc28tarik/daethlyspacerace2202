# NEXT-11C9 — İşlevsel sanayi silüeti, açık çatı makinaları ve halka içermeyen enerji çıkışı

**Durum:** Gerçek HTML oyun kodu, Chromium/WebGL 07/08/09 A/B testi ve hızlı/tam GitHub Actions iş akışları kaydedildi. **Güncel CI kanıtı ve sanatsal kabul test sonrasında doğrulanacak.**

## Gözlem ve tasarım kararı

Son C8 gerçek ekranında 07/08 blok bina çatılarının büyük ve işlevsiz düz yüzeyler olduğu, 09 çıkışının iki çok büyük turkuaz/mor/altın dekoratif enerji halkası tarafından kaplandığı gözlendi. Hedef yalnızca piksel farkı yaratmak değil, sahneyi üretim tesisi olarak daha gerçekçi ve okunur göstermek.

### Kodla yapılanlar

- Mevcut **34 fiziksel W02** kabuk **aynı geometri ve collider AABB referanslarıyla korunur**: 22 blok çatı için fan/ısı eşanjörü, açık louver, soğutma boruları, küçük bakım üniteleri; 12 kule için kapalı gaz egzozları, soğutma ağızları ve mekanik bağlantılar.
- 34 bina için **2 InstancedMesh**, 6 fabrikanın 12 orijinal W05 `OVERHEAD_PIPE` / `TRANSFER_BRIDGE` fiziksel kirişine açık destek kafesleri/servis boruları için **1 InstancedMesh**; çarpışma kaydı oluşturulmaz. Bu 12 kirişin collider referansları ve gerçek mesh geometrileri değişmez.
- 09'daki baskın halkaların gerçek kaynağı olan **C4 ENERGY hero** ailesinin yalnız **6. tesis / index2–3** görsel-only örnekleri, C9 açıkken render açısından gizlenir. Bunun yerine **tek InstancedMesh içinde 2 orijinal halkasız güç dağıtımı/manifold tesisi** çizilir: egzoz kuleleri, servis gantry, enerji dağıtım boruları. C4 ailesinin diğer iki örneği ve bütün fiziksel nesneler aynen kalır. W05 `BEACON` / `HIGH_MARKER` hiç değişmez.
- Kapatılabilir **`h4Gfx11c9SetLook(true|false)`** ile aynı build/sabit kamera A/B; C7'nin orijinal/styled instance matrisleri kayıpsız geri yüklenebilir; High/Balanced, yalnız Map4 phase3 açık; Low ve diğer fazlarda kapanır.
- Her 3D parça ilk sahne oluşturulurken bir kez baked BufferGeometry'ye dönüştürülür, normal/UV/vertex color + eski NEXT11C5 256² PBR metal atlasını paylaşır. **Yeni ışık veya texture yok**, per-frame yeni mesh/atlas/texture yok.

## Değişmeyen kurallar

Harita 1'in oynanışı/görünümü; 6 harita ve ilk yayımcı pitch'inde 3 oynanabilir; Map4 dört faz, 60 saniyelik arena, 300 saniyelik toplam yarış ve 850 m yörünge çıkışı; 5 rakip + 8 avcı; 6 kanyon / 36 sanayi / 200 bina collider; 24 W05 rota işareti, üç sanayi uçuş hattı, C3–C8 sanayi sanatı.

Önceki [PR #53](https://github.com/zxc28tarik/daethlyspacerace2202/pull/53) üzerinde C8'nin tam CI eski GFX06M zemin atlası testi yüzünden durdu; `3490618` eski atlasın fallback olduğunu ve yeni C8 atlasının yalnız görsel malzeme olduğunu aynı testte doğrulayacak şekilde düzeltildi. Güncel C8 [full CI #44071695510](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44071695510) **PASS, tam C8 regresyon doğrulandı**; C9 bu HEAD üzerine kuruldu.

## CI / estetik kabul kapıları

- [x] C9 gerçek `index.html` geliştirildi ve JavaScript parser PASS.
- [x] `tests/map4-gfx11c9-functional-factories.cjs` ile 1600×900 WebGL 07/08/09 gerçek A/B, drawcall/tri/texture/geometry bütçesi, korunmuş fizik ve kalite profili/diğer faz kontrolleri yazıldı.
- [x] Hızlı screenshot workflow, full browser smoke workflow ve bağımsız C4–C8 tarihi A/B test izolasyonu GitHub'a kaydedildi.
- [x] **Son C9** 12 W05 kafes eklemeli hızlı Chromium/WebGL CI [#44073322862 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322862); altı gerçek PNG incelendi.
- [ ] C9 full eski+yeniler GitHub browser smoke CI **PASS**.
- [ ] 07/08/09 sahnelerinde yeni mimari büyük düz/portal etkisini sanatsal olarak anlamlı biçimde düşürüyor mu? *Sanatçı/human* incelemesi.
- [ ] Gerçek native GPU 720p/1080p FPS/p95/VRAM ve 5 dakika uçuş doğrulaması.
- [ ] 7–8/10 görsel kalite için **kullanıcı açık kabulü**, yayıncı için 3/6 oynanabilir harita.
- [ ] Kullanıcı açık **merge** onayı. Bütün stacked PR'lar draft ve unmerged.

**PASS teknik çalışabilirliktir; estetik kabul değildir.**


## 17 Kasım — Gerçek WebGL ilk görsel denetimi ve ikinci tesis turu

- **İlk yeni C9 QA:** [Actions #44072695410](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44072695410), gerçek Chromium/WebGL 1600×900 sabit 07/08/09 A/B **PASS**, screenshot artifact `map4-next11c9-07-08-09`. 09'da önce büyük turkuaz/mor altın enerji halkaları varken C9 açıkken halkasız bacalı/servis gantrili endüstriyel dağıtım tesisleri var; **gözle bariz iyileşme**. 07/08 orijinal korunan çatılardaki yeni makine ayrıntıları çok uzakta/örtülü olduğu için **ilk fark zayıf**. Dolayısıyla 7–8/10 estetik kabulü yine **AÇIK**.
- **İkinci uygulama:** `096f46f` 6 fabrika başına mevcut W05 fiziksel `OVERHEAD_PIPE` ve `TRANSFER_BRIDGE` üzerine **12 visual-only metal mekanik truss/boru iskeleti** ekledi. Sadece 1 ilave InstancedMesh; W05 navigasyon `BEACON`/`HIGH_MARKER` değiştirilmez. Gerçek collider mesh ve `collider.mesh` referansı doğrulanır. GFX11C9 toplam **4 batch** (2 roof + 1 truss + 1 09 halkasız manifold).
- **İkinci test:** `900ae30` 12 kiriş ve 4 draw batch beklentisini test ediyor; [güncel hızlı CI #44073322862](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322862) **PASS**, 07/08/09 gerçek screenshot incelendi.
- **Üst C8 base:** `3490618` GFX06M/C8 ground atlas tarihsel test sözleşmesini düzeltti. [C8 full #44071695510](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44071695510) son doğrulamada devam ediyordu, PASS tamamlanmadıkça C9'e aktarılmayacak.
- **Ek açık kapılar:** C9 HEAD tam CI ve eski C4–C8 testleri, native GPU FPS/p95/VRAM, 5 dk gerçek pilot oynanışı, yayıncı için 3/6 playable map, kullanıcı estetik 7–8/10 ve main merge onayı.


## İkinci gerçek görüntü incelemesi — kısa nicel karşılaştırma

**Son C9 kod `900ae30`:** [GitHub Actions #44073322862](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322862) **PASS**; artifact `map4-next11c9-07-08-09`. Aynı 1600×900 sabit kamera WebGL A/B (C9 kapalı/açık) karşılaştırmasında ortalama RGB kanal farkı >1/255 olan piksel yüzdeleri: **07 giriş %1,21; 08 fabrika %1,89; 09 çıkış %18,74**. Bu değerler sanatsal puan değildir.

**Gözle karar:** 07/08'de kiriş ön yüzü çapraz taşıyıcıyla daha mekanik görünüyor, fakat etki alanı **çok küçük**; yüzen dekoratif halkalar, ön planın büyük düz kütleleri ve arazi mimarisi eksikliği hâlâ var. 09 çıkışında büyük renkli dekoratif C4 ENERGY halkalarının yerine tanınabilir bacalı/gaz işleme/servis platformlu tesisler görünmesi **belirgin**. Fakat 09 kadrajındaki koca düz ön plan çatısı ve gökyüzü dengesi hâlâ gerçekçi değil. **7–8/10 görsel kalite için kullanıcı onayı verilmedi.**

**Önceki C8'nin tam teknik CI'si:** [#44071695510 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44071695510), 31/31 başarılı workflow adımı. C9 güncel full browser smoke [#44073322882](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322882) henüz sürüyor; eski C8 PASS C9 full PASS anlamına gelmez.

**NEXT-11C10 aday işi, YAPILMADI:** 07/08 ön planı boyunca daha büyük/okunabilir işlevsel makina grupları ve 09 ön planda büyük boş platform/dekoratif halkaların yerine gerçek fabrika cephe kurgusu; hareketli kamera/5dk sürüş, native GPU ve kullanıcı estetik değerlendirmesi. Tüm fizik ve navigasyon sözleşmesi korunacak.
