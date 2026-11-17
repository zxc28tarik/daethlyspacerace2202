# NEXT-11C12 — Özgün endüstriyel mimari ölçek ve derinlik

**Durum:** C12 WebGL [hızlı #44081480486 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44081480486); gerçek 07/08/09 1600×900 Chromium A/B görüntüleri alındı ve incelendi. **Tam C12 CI ve 7–8/10 kullanıcı kabulü açık**. Üst C11 full CI sonucu ayrıca kontrol edilecek. Önceki C11 tam regresyon [#44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) ayrıca devam ediyor; C12 testinin PASS sonucuyla karıştırılmamalı.

## Tasarım sorunu

C11 gerçek 1600×900 07/08 görüntülerinde duvar paneli farkı 07 %7,35/08 %6,70 idi. Ancak art arda benzer yükseklikte W02 bina ve gökyüzündeki iri işlevsiz halkalar sayesinde sahne hâlâ yapay görünüyor. Yeni kapalı blok bina eklemek, görsel kimliği daha da tekrar ettirecek. C12 **iki yeni özgün açık iskelet silüeti** ve **derinlik kademesi** kullanır; navigasyona dokunmadan dekoratif sky ornament karşıtlığını geriye iter.

## Uygulanan kod

- İki yeni programatik BufferGeometry (Three.js primitive kaynaklarıyla kodlanmış, herhangi bir hazır Unreal/CGTrader paketinden alınmamış):
  1. **Ayırma bacaları silüeti:** birbiriyle aynı olmayan üç distilasyon/ayırma kolonu, flared scrubber, yatay basınç header, açık sıcaklık değişim paneli ve servis iskeleti; dekoratif halkasız.
  2. **Açık malzeme aktarma iskeleti:** eğimli destekler, taşıyıcı asma mekanizması, 5 malzeme kaseti, diagonal açık makas kafes ve servis transferi; ring/portal formu yok.
- Altı örnek (üç farklı ölçek kademesi, her 07/08 yaklaşımında üç istasyon): route progression `18850/20350/21650` ve `25850/27050/28650`; dış yan koordinatlar ±1550–1900; görsel iskelet altı -433 birimlik sanayi zeminine matematiksel olarak oturtuluyor. **2 instanced mesh drawcall**, paylaşımlı C5 256² çelik-kir atlası, yeni mesh/material/atlas her karede üretilmiyor.
- Yalnız C5 tarafından önceden kesin dekoratif olarak sınıflandırılmış halka nesnelerine dokunulabilmesi için geri alınabilir, yalnızca görünüm kodu hazırlandı. **Gerçek Chromium testinde eşleşen dekoratif halka sayısı sıfır çıktı. Dolayısıyla gökyüzündeki görünür büyük halkalar değiştirilmedi**; bunlar rota işaretleri olabilir. W05 HIGH_MARKER/BEACON ve güzergâh gösterimleri aynen korunur. Kaynakları belirlenmeden hiçbir halka gizlenmeyecek.
- `h4Gfx11c12SetLook(true|false)`: gerçek WebGL aynı kamera A/B, eski malzeme ve C12 silüetleri temiz biçimde geri gelir. High/Balanced ve Map4 faz3 dışında C12 kapalı. **0 yeni collider, 0 ışık, 0 doku, 0 dış varlık**.
- Her gerçek fiziksel W02 kabuk `mesh.geometry` ve `userData.h4Collider` orijinal kimliği korunur. 6 kanyon/36 sanayi/200 bina collider, 5 rakip/8 avcı, arena 60s, yarış 300s, yörünge 850m ve altı harita / yayıncı pitch en az 3 playable kararı korunur.

## Kullanıcının özgünlük kararı

**Her tür kaliteli örnekten yalnız teknik, atmosferik ve yapısal ilham almak serbest; ayırt edici ticari model, silüet, yerleşim, doku veya sahneyi birebir/çok yakın kopyalamak yasak.** C12'nin bütün silüet geometrisi bu oyunun kodunda tasarlandı; CGTrader dosyaları veya harici model ithali yok.

## Kabul listesi

- [x] C12 gerçek oyun kodu ve `new Function()` JavaScript sözdizimi denetimi PASS.
- [x] Gerçek 1600×900 Chromium/WebGL 07/08/09 A/B, korunan 24 rota işareti/34 W02 kabuk, 6/36/200 collider, drawcall/tris/texture/geometry + quality/faz kontrolü yazıldı.
- [x] Tarihsel C4–C11 bağımsız görsel A/B testlerinden C12 gizlendi; hızlı ve tam GitHub CI eklendi.
- [x] C12 hızlı gerçek Chromium/WebGL [#44081480486 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44081480486) ve altı 07/08/09 görüntüsü incelendi. 2 batch/6 instance/**4.524 tris**, 34 fiziksel shell/24 W05 işaret/6-36-200 collider korundu.
- [ ] C12 **güncel HEAD** tam Map1/Map4 browser smoke regresyonu PASS.
- [ ] C11 üst PR [tam #44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) PASS doğrulama.
- [ ] 720p/1080p yerel GPU FPS/p95/VRAM, gerçek 5 dakika uçuş.
- [ ] 07/08/09 estetik kullanıcı 7–8/10 onayı ve ilk publisher pitch 3/6 playable kabulü.
- [ ] Kullanıcının açık PR merge/onay izni. Bütün stacked PR'lar Draft ve unmerged.

**Teknik CI PASS, kullanıcı estetik onayı veya telif değerlendirmesi değildir.**

## İlk gerçek görsel kabul incelemesi — 17 Kasım 2026

- Görüntü kaynağı: `map4-next11c12-07-08-09-review` [Actions #44081480486 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44081480486). 07 eski/yeni RGB değişimi **%9,53**, 08 **%11,84**, 09 **%0,00** (ortalama kanal farkı >1/255 piksel; **estetik puan değildir**).
- 07 girişte asimetrik bacalı ayırma tesisi sahnenin sol-orta silüetini, 08 fabrikada açılır transfer gantrysi sağ-orta silüetini somut ve okunur biçimde değiştirdi. Üretim iskeletleri yerle temas ediyor, yeni parlak süs halkaları eklenmedi. **Önceki karelere göre daha derin**, fakat ışık/atmosfer, tekrar eden dev gökyüzü halkaları ve bazı koyu blokların monotonluğu nedeniyle hâlâ 7–8/10 kullanıcı kalitesine ulaşmış/onaylanmış kabul edilmez.
- Testin raporu **0** adet `h4Gfx11c5DecorRings` öğesi gösterdi. Bu nedenle C12'de **halkaların görünür görünümü hiç değişmedi**; gökyüzündeki halkaların navigasyon olup olmadığı ayrıca denetlenmeden saklama/konum değiştirme yok. Planlanan “dekoru geriye alma” görsel etkisi **YAPILMADI / kesin kaynağı bilinmiyor** olarak tutulur.
- **Teknik bütçe:** 2 statik InstancedMesh batch, 6 visual-only instance, **4.524** ek üçgen, yeni texture/collider/light/dış varlık **0**. HIGH/BALANCED phase3 açık; LOW/phase1/2/4 kapalı; geriye çevrilebilir A/B. Statik WebGL, gerçek 720/1080p GPU FPS/p95/VRAM veya 300s pilot oynanış sertifikası değildir.
- [C12 tam regression #44081573533](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44081573533) **sonucu ayrıca doğrulanacak**; kendi hızlı PASS'i tüm tarihsel PASS demek değildir.


## Yakın uçuş şeridi güvenliği düzeltmesi — C12-B

İlk C12 gerçek ekran PASS sonrası, görüntüsü büyük ama çarpışmasız yeni sanayi iskeletlerinin yan açıklığı bazı uçuş şeritlerini **görsel olarak** daraltma riski taşıdı. Bu, 6/36/200 fiziksel collider sayısının sabit olmasıyla tek başına yakalanamayan bir algısal/gameplay sorunudur; bu yüzden ayrıca düzeltilmiştir.

- `9f910c6`: Altı tesisin yan koordinatı ve asimetrik merkezleri **hızlı düşük şerit (-800 ±310)** ve **avcı kanadı (+900 ±480)** koridorlarının dışına çekildi. Görsel dış kolon/gantry genişliği `size*.92` yerine `size*.65` olurken **dikey yükseklik aynen kalır**. Yakın/mid/far sanayi yoğunluğu amaçlanır, oyuncunun içinden geçeceği sahte fiziksel duvar amaçlanmaz.
- `55fad1d`: Her altı sahne konumu için yanal silüetin iç sınırını `abs(side)-size*.65*.55` olarak konservatif hesaplar. Eşik negatif tarafta 1140, pozitif tarafta 1430; gerçek uçuş şeritlerinin kenarları olan 1110 ve 1380'e görünür güvenlik payı bırakır.
- Bu kısıtlar **önceki C12 ilk görsel QA %9,53/%11,84 sayılarından daha sonra** eklendi; ilk screenshot ve ilk PASS, yeni güvenli yerleşim için **güncel kanıt değildir**. Yeni [hızlı WebGL #44082222325](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082222325) ve güncel full CI sonucu bekleniyor. Önceki tam C11 CI **34/34 PASS**.
- 07/08 yeni görüntüleri gerçek motor çıktısı olarak tekrar incelenip gerekiyorsa daha görsel iyileştirme yapılacak; 7–8/10 kabul hâlâ açık.


## NEXT11C12-C nihai görsel yerleşim denetimi — 17 Kasım

- **Son kompozisyon `6b0c31f`:** 08’in sol ön/orta planında eksik kalan açık ayırma tesisi `at:27050` yerine **`at:25550`** konumuna alındı. Altı yapının x/y ölçekleri ve uçuş şeridi güvenlik marjı değiştirilmedi. Yalnız görsel kompozisyon ayarı, yeni collision/oynanış kuralı yok.
- [GÜNCEL son hızlı Chromium/WebGL QA #44082591667 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082591667): 07/08/09 gerçek 1600×900 aynı kamera A/B, altı PNG, 2 InstancedMesh, 4.524 üçgen, 24 W05 + 34 W02 + 6/36/200 collider ve yanal güvenlik eşiği doğrulandı. Yüksek/dengeli/düşük profil ve diğer fazlar ayrı ayrı test edildi.
- **Nihai görüntü farkı:** 07 **%5,44**, 08 **%4,32**, 09 **%0** (ortalama RGB piksel farkı >1/255). Başlangıçtaki 07 %9,53 / 08 %11,84 **artık geçerli nihai değerler değil**, çünkü o eski konumlar görsel şerit güvenliğini yeterince gözetmiyordu. İkinci güvenli deneme 07 %5,39 / 08 %1,77 idi. Son C12-C bu güvenliği koruyarak 08 silüetini yükseltti.
- **Görsel inceleme:** 07’de sol arka silüete yeni ayırma bacaları, 08’de sol arka/planda bacalar ve sağdaki yük iskeleti eklenmiş. Orta uçuş koridoru kapalı dev bir kütle gibi algılanmıyor. **7–8/10 görsel hedefi hâlâ KULLANICI TARAFINDAN ONAYLANMADI**; yoğun yapay halkalar, tekrarlanan düz platformlar ve ışık kompozisyonu çözülmedi.
- **Dürüst yapılmadı:** Büyük gökyüzü halkalarının kesin kaynak/işlev haritası henüz çıkarılmadı; C5 dekor listesi 0 eşleşme, mevcut büyük halkalara dokunulmadı. Moving camera gerçek uçuş, native GPU p95 FPS/VRAM ve yayıncı pitch 3/6 playable doğrulaması hâlâ açık.
- **C12 güncel full CI:** [#44082591388](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44082591388) sonuç **bekleniyor**, C11 üst [full #44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) 34/34 PASS. Draft stacked PR57, hiçbir merge yok.
