# Harita 4 — VIS-02 | Eski Sanayi Silüetlerinin Değiştirilmesi ve Fizik Koruması

**Tarih:** 16 Kasım 2026.  
**Görev:** `VIS-02`, GFX-06 görsel kalite borcu.  
**Üst dal:** `codex/map4-gfx06b-press-cooling-art` / [PR #33](https://github.com/zxc28tarik/daethlyspacerace2202/pull/33); bunun üstünde [GFX-06A / PR #32](https://github.com/zxc28tarik/daethlyspacerace2202/pull/32) bulunur.  
**Ana kayıt:** [Karar ve durum takip dosyası](ROADMAP_DECISIONS_PROGRESS.md).

## Neden yapıldı?

Önceki GFX-06A/B testlerinin 1600×900 oyun içi Chromium görüntüleri gerçek anlamda incelendi: yeni 4 büyük tesis görünür olmasına rağmen arkadaki tekrar eden düz silindirler, tek tip kutular ve düzensiz dekor kalabalığı görsel kaliteyi baskılıyordu. VIS-01 malzeme düzeltmesi ve gökyüzü bandı azaltması teknik olarak geçti, ancak **bu görsel kalite kapısını kapatmadı**.

## Kod değişiklikleri

### (A) 58 collider içermeyen W02 dekor yapısı: dört ayrı gerçek 3D aile

- Eski W02 `NEAR_TERRAIN_AND_SETTLEMENT` altındaki **30** ve `HORIZON_SILHOUETTE` altındaki **28** görsel mesh **aynı Mesh nesneleri ve dünya pozisyonları korunarak** değiştirilir.
- Yeni dört `BufferGeometry` kataloğu sahne öncesinde bir kez oluşturulur. Her model birden çok geometri parçasının **tek çizilebilir geometriye** birleştirilmesiyle elde edilir: kare kutu/silindirlerin yerine ayrıştırma tankı + takviye halkaları, açık gantry/montaj, çift soğutma bacası ve transformatör/türbin enerji kompleksi.
- Birleştirilmiş özgün geometriler `MAP4_VIS02_ONE_DRAW_KIT_0..3` biçiminde adlandırılır. Bir model tek `Mesh`, tek malzeme; ayrı per-frame çalışma ve yeni çarpışma hacmi bulunmaz.
- Geometri yüzeylerine işlevsel malzeme ayrımı veren verteks renkleri kullanılır. İşlenmiş çelik, koyu taşıyıcı, oksitlenmiş bakır, beton ve yerel sıcak ikaz vurgu tonları ayrıdır.
- Orijinal W02 geometri/malzeme referansları, **yalnız karşılaştırmalı test amacıyla** `userData` altında korunur; gerçek oyun normal akışta hep yeni 3D sanatını gösterir.

### (B) 34 mevcut fiziksel W02 yapısı: collider korunarak dış kaplama

- 34 mevcut W02 yapının **Mesh, mevcut geometri ve h4Collider bağlantısına dokunulmaz**.
- Tekrarlı açık metal kütleleri daha koyu endüstriyel malzeme ile yeniden ayrıştırılır; gövdelerin mevcut sınırlarına göre zırh yüzeyleri, servis kolonları, basınç yakaları ve konum ışıkları eklenir.
- Yeni örtüler toplam **4 InstancedMesh çizim grubu** altında toplanır; her dekor ayrı `Mesh` ve ayrı çizim değildir.
- Bunlar `visualOnly` ve `noCollider` etiketlidir; yeni sahte fizik yüzeyi açılmaz. **Eski çarpışma sınırları değişmez.**
- Daha önce `h4IndustrialModelDetail` ile yaratılan VQ02 endüstri süslerinin hem `h4Collider` taşıyıp hem `w05VisualOnly=true` yazılması yanlıştı. **Fizik davranışı değişmeden** işaret artık `!mesh.userData.h4Collider` olarak atanır. Böylece ileride collider bulunan görsel silinip görünmez engel yaratma riski azaltılır.

## Korunan kararlar ve oyun kuralları

- Altı sanayi tesisi, **36 W05 fizik collider**, mevcut başka `planetaryBuildingColliders` öğeleri, 6 kanyon kayası ve üç sanayi rota seçimi korunur.
- `+12%` hızlı boru, `+18%` batı kanyonu, 5 rakip / 8 avcı, 60 saniye arena kilidi, 300 saniye görev ve 850 irtifa şartı değişmez.
- Harita 1 dünya/oyuncu HUD/kamera/gemi fiziği değiştirilmez. Çevrimdışı tek HTML çıktı sözleşmesi devam eder.
- Görünür dekor sanat mesh'leri gölge veya patlama hasarı için yeni hedef olarak sayılmaz.
- Yeni doku atlası veya 3D dosya dış kaynağı eklenmedi. Sonraki profesyonel GLB/baked atlas, ışık ve nihai grafik onayı **ayrı açık iş**.

## Kanıt ve kabul kapısı

- `tests/map4-browser-smoke.cjs`: 58 değişmiş W02 görseli, 4 özgün geometri, 34 korunmuş fiziksel W02 Mesh, değişmemiş geometri/hitbox referansları, 4 instanced facade grubu, 36 W05 collider, VQ02 dual-tag düzeltmesi ve sektör izolasyonunu doğrulamayı amaçlar.
- `tests/map4-art-baseline.cjs`: GFX00'ın eski **12 sabit kamerayı değiştirmeden** iki yeni W02 bölgesi için aynı kamerada **önce/sonra** dört screenshot üretir. Test anında sadece render geometrisi/malzeme görünürlüğü değiştirilir, fizik veya oyun akışı değil.
- `.github/workflows/map-browser-smoke.yml` yeni branch üzerinde Chromium browser smoke + offline bundle + ekran fotoğrafları CI işini tetikler.
- Javascript sözdizimi kontrolü yapılmıştır; **bu belge oluşturulurken oyun içi CI PASS, gerçek GPU FPS ve kullanıcı estetik onayı henüz doğrulanmadı.**
- Gerçek screenshot karşılaştırması ve p95/drawcalls sonuçları görülmeden **VIS-02 tamamlandı sayılmaz**.

## Sonraki adım

1. VIS-02 CI'yi doğrula. Hata varsa fizik kodunu değil test/yalnız görsel modelleri düzelt.
2. Yeni/önce ekran görüntülerini karşılaştır, model silüeti okunuyorsa daha fazla kamera denetimi yap; gerçek donanım FPS ayrı.
3. PR #32 → PR #33 → VIS-02 üst dalını güvenli sıra ve güncel branch bazlarıyla değerlendir; CI ve görsel kabul olmadan `main`e zorla birleştirme.
4. `GFX-06C / IN05+IN06` (lojistik vinç ve son enerji santrali), ardından GFX06D profesyonel materyal/LOD, üs/yörünge ve GFX07–11.

**Uygulandı ≠ CI geçti ≠ görsel onay verildi.** Bu üç ayrı statü olarak kaydedilecektir.
