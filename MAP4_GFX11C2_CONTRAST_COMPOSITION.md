# NEXT-11C2 — Endüstriyel kontrast ve malzeme kompozisyonu

**Durum:** Oyun koduna işlendi; [NEXT11C PR #46](https://github.com/zxc28tarik/daethlyspacerace2202/pull/46) üstüne stacked DRAFT. Gerçek 7–8/10 insan estetik onayı ve native GPU performansı **açık**.

## Mevcut görüntüde tespit edilen sorun

GFX11C'nin 07/08 aynı-kamera screenshot'larında yeni üç farklı endüstri modeli görünüyor. Ancak eski W05 destekleri, hava köprüleri, silolar ve servis güverteleri çok açık tonda; ön ve orta plan tek renk "kutu/kolon ormanı" gibi algılanıyor. Daha fazla sahne geometri eklemek, bu problemin ilk çözümü değil.

## Bu adımın uygulaması

- `h4Gfx11c2CurateIndustry()` yeni `MAP4` endüstri sahnesi **bir kez** oluşturulurken mevcut `W05` Mesh'lerinin malzemelerini düzenler.
- Üç mekânsal renk kimliği (her 2 istasyon bir aile): (i) oksitlenmiş bakır/füme rafineri, (ii) mavi soğuk çelik/turkuaz soğutma, (iii) koyu lacivert/mor enerji. Her aile için ayrı shell/structure/signal materyali: **9 statik PBR/Basic malzeme**, sahneye bağlı yeni ağ/texture isteği yok.
- Sadece `userData.w05Kind` listesinde orijinal olarak bulunan **SILO, REFINERY, SERVICE_DECK, CARGO_PLATFORM, SUPPORT, OVERHEAD_PIPE, TRANSFER_BRIDGE, HUNTER_SIDE_TOWER, BEACON, SIGNAL, ALARM, HIGH_MARKER** malzemeleri değişir. Önceden kurulmuş bütün `THREE.Mesh`, vertex buffers, boyut, sahne hiyerarşisi ve collider metadata'sı korunur.
- `h4Gfx11c2SetPalette(enabled)` yalnız **görsel QA için** malzeme eski/yeni A/B yapar. Üretim sürümünde yeni kontrast materyali açıktır ve frame-loop içinde tahsisat yoktur.
- GFX11C'deki **6 tesis / 72 art-only instance / 8 draw batch**, GFX11B 74 arena art-only instance, 60s arena fabrika gizleme kararı, Harita1 eşit hız, GFX10 High/Balanced/Low profili korunur.
- H4GFX11B 09 kamera çok-yakın kolon materyali hedeflenmez; görüş düzeltmesinin ve 6 kanyon/36 sanayi/200 bina collider'ının korunması zorunludur.

## Kabul kanıtı ve sınırları

Yeni `tests/map4-gfx11c2-industrial-composition.cjs` gerçek WebGL/Chromium ile:

- [ ] En az 80 mevcut W05 yapı materyali yeniden sınıflandırılır; **3 istasyon ailesi, her ailede 3 malzeme**, hem fiziksel hem dekoratif mesh materyali görünür.
- [ ] 07 ve 08'de sabit **aynı kamera** eski/yeni PNG farkı; yeni/eskide **draw calls, triangles, renderer geometry eşit**, çünkü geometri değişmiyor.
- [ ] 09'da NEXT11B sütun kamerası materyali `MAP4_GFX11B_CAMERA_NEAR_FADE` hâlâ aktif; aynı-kamera testi ancak görüntü farkı görüldüğü kadrajlarda zorunludur.
- [ ] Fiziksel AABB'lerin **aynı object identity**'si, 6/36/200 engel, 5 rakip, 8 avcı, 300s/60s/850m; GFX11C'nin 72 art-only instance'ı/8 batch'i korunur.
- [ ] Tüm geçmiş offline GLB, Map1/4, GFX09-10, 300s simüle GFX10B, GFX11A/B/C ve 62 tarihsel screenshot full CI PASS.
- [ ] Yeni ekranların insan gözüyle kabulü; **profesyonel 7–8/10 estetik hedefi açık**.
- [ ] Masaüstü native GPU FPS/p95/VRAM, gerçek 5 dakika oyun ve yayıncı ilk sunumda >=3 oynanabilir harita kabulü **açık**.

**Önceki teknik kabul:** [GFX11C CI #43973921520](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43973921520) SUCCESS; bu belge GFX11C2'nin CI sonucunu teyit etmez.

**Sonraki `.`:** CI FAIL ise aynı PR'da hata çözülür. PASS ise yeni görsel kompozisyon ve insan estetik borcu (NEXT11C3) gözle değerlendirilir; gerçek native GPU/5dk kapısı erken tamamlandı olarak işaretlenmez.
