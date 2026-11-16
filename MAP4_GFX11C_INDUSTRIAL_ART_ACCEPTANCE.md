# NEXT-11C — Endüstriyel sahnelerde tesis kimliği ve arena materyal ayrımı

**Durum:** Gerçek oyun kodu ve Chromium QA testi oluşturuldu; GitHub Actions sonucu ayrıca doğrulanacak. [PR #45 NEXT11B](https://github.com/zxc28tarik/daethlyspacerace2202/pull/45) temel alınır, eski draft PR zinciri korunur.

## Gerçek görüntüde görülen kalite borcu

12 sabit kadrajın **07 Endüstriye giriş** ve **08 Fabrika** ekranları (progress 17200/23800, 1600×900) yüksek nesne sayısına rağmen birbirine benzeyen açık tonlu kolon, silindir, kutu silüetleri ile dolu. Özellikle merkez koridorun arka planında "burası rafineri mi, dökümhane mi, enerji tesisi mi?" okunamıyor. NEXT11B arena 04–06'da büyük siyah tek tip spire tekrarları var. Bu adım **sayı eklemekten çok büyük-orta ölçekte anlamlı farklı form ve malzeme** getirmeyi hedefler.

## GFX11C gerçek oyun değişiklikleri

- **Altı gerçek tesise üç özgün endüstriyel aile:** IN-01/02 **ayırma-rafineri kuleleri**, IN-03/04 **içe kıvrılan soğutma bacaları**, IN-05/06 **enerji akümülatörleri**. Her aile tekrar eden kare prizmalar yerine özgün **LatheGeometry profiline** sahip.
- Her istasyonda bacalar, yatay gantriler, hizmet halkaları, kırık ısı kalkanları ve küçük sinyal çekirdekleri. Tonlama: koyu çelik/mavi, eskitilmiş sıcak bakır, ışıklı mavi ve sıcak sinyal.
- **Toplam 60 yalnız görsel instance, 8 GPU batch:** 5 büyük form grubu + 3 küçük detay grubu. Üç ana silüet ailesi. Tüm 6 endüstriyel istasyona `MAP4_GFX11C_SIX_FACTORY_IDENTITIES` altında tek kez monte edilir; `frustumCulled=false` ile deterministik, üst bölge görünürlüğü korunur.
- Görsellerin tamamı `visualOnly=true`; **yeni engel, AABB veya collider kesinlikle yok**. Motor şekilleri değişmez, 36 sanayi + 6 kanyon + 200 diğer authored bina collider sabit kalmalı.
- High / Balanced profilde her 8 batch; Low profilde büyük mimari 5 batch sabit, küçük hizmet halkası/kanat/sinyal 3 batch gizlenir. 60 saniyelik arena sırasında endüstri yapıları GFX11B kararı gereği tamamen gizli kalır.
- **Arena renk ayrımı:** NEXT11B'nin mevcut 74 art-only instanced parçaları gri/metal/bakır/ışıklı renklerle farklılaştırıldı. Mesh veya çizim sayısı değişmez.
- Yeni ağ kaynağı, GLB download, physics, memory-leaking per-frame instantiation yok. Tek seferlik sabit geometri ve örnek matrisleri.
- Harita 1 eşit hız yarış ve Harita 4 dört faz, süre, skor/atış/avcı, 850m final, fizik dokunulmaz.

## Kabul testleri

Yeni [tests/map4-gfx11c-industrial-identity.cjs](tests/map4-gfx11c-industrial-identity.cjs) gerçek offline-webgl kodundan:
- [ ] 07 Endüstri giriş, 08 Fabrika ve 09 Çıkış için **aynı kamera, GFX11C kapalı/açık** gerçek PNG ve değişen piksel/triangle/draw-call kanıtı.
- [ ] 6 adet site / 3 özgün profilli geometrik aile / 60 instance / 8 batch / 0 collider.
- [ ] Harita 4 High, Balanced, Low profilleri doğru silüet ve seçmeli microdetail görünürlüğü.
- [ ] Arena 74 orijinal görsel instance üzerinde farklı renk bilgisi, 60 saniyede gizli endüstri kararı.
- [ ] 5 yarışçı, 8 avcı, 6 kanyon + 36 sanayi + 200 mimari collider, 300s limit, 60s arena, 850m orbit ve skor/atış tamamen aynı.
- [ ] Eski tüm offline HTML, Harita1/4, GFX09 kamera, GFX10 grafik, GFX10B VFX/bellek, GFX11B kamera/art, GFX11 tarihsel 62 görüntü QA CI PASS.

**Açık kabul:** Otomatik ekran görüntüsü **insan tarafından 7–8/10 estetik onay** veya native GPU/VRAM/FPS kanıtı değildir. Gerçek 5dk oynanış, oyuncu kabulü ve yayıncı 3 oynanabilir harita da tamamlanmış sayılmayacak.

**Sonraki `.`:** CI hatası varsa önce GFX11C aynı PR'da düzelt; CI başarıyla biterse ekran görüntülerine göre art tuning yap ve ardından gerçek cihaz GPU ve görsel insan kabul aşamasını önceliklendir.
