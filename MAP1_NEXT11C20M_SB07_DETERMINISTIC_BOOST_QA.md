# NEXT11C20M — SB-07 gerçek boost normal/boost QA deterministik karşılaştırma

**19 Kasım 2026 — kullanıcı "." ile sonraki adım.** Kullanıcının "ayrık parçaları birleştir, çizgi kalitesini yükselt, fazla parça ekleme" kararı korunur.

## Gerçek kayıtlardan bulgular

- Önceki NEXT11C20L denemelerinin birinde **gerçek GitHub Actions WebGL QA PASS** elde edildi: [Run #44516951852](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44516951852).
- Pass raporu: SB-07 189 oluşturucu primitifi, 7 birleşik materyal mesh + 2 transparan plume (gerçek studio 9 calls), **36.156 render üçgeni**, x2 kanatta 8 raycast panel boşluğu .012 veya .016, burun 15 vertex oturma testi PASS, kokpit 11 enine bölüm, line16 / motor32 / torus40, Map4 B-04 model 249, fizik collider [6,36,200]. Gerçek 1600x900 studio front/rear normal/boost ve playable chase PNG'leri de oluşturuldu (artifact #14526193120).
- Takip eden sürüm aynı oyun sürümüyle [#44517397511](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44517397511) ve [tam smoke #44517397400](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44517397400) **FAIL** oldu: `AssertionError: review images must show an actual game-state boost difference`. **Önceki tüm gerçek yarış boost/camera assertions geçti; hata yalnız ikinci turda tekrarlanan stüdyo normal/boost kontrolünde**.
- Kod araştırması: Eski test, önce 35 frame normal + 35 boost gerçek updateGame() ile kontrol edip daha sonra stüdyo ön/arka resimleri için yeniden 35+35 tam yarış frame'i simüle ediyordu. İkinci tekrarda test fizik ilerlemesi, engel çarpışmaları ve bitiş/DNF durumu gibi randımanlı bağlamdan etkilenecek şekilde tasarlanmıştı. `h4Ship20ZenitVisualTick` yalnız `state.running && !state.paused && !state.finished` iken ışığı günceller. Bu, oyun hatası kanıtı değil **stüdyo QA bağımsızlığı** hatasıdır.
- Başarılı koşuda motor 40×40 ölçümleri normalde iki nozul %10.13 ve %12.0 clipped-white, boostta %11.13 ve %13.88. GPU SwiftShader olduğu için native FPS değerlendirmesi yapılamaz. Sprite normal opacity .14, boost .3791; kameralı boost mesafesi 18.96→13.25.

## C20M gerçek test düzeltmesi (oyun kodu değişmedi)

- Normal/boost **oynanabilir chase testi ve gerçek `updateGame` input/physical assertions aynen** korundu; kolay PASS için bunlar atlanmadı.
- Yalnız bağımsız sabit kamera **stüdyo sanat testi** değişti. Stüdyo, 35 fizik tick'i çalıştırmak yerine gerçek `h4Ship20ZenitVisualTick(1/30)` fonksiyonunu 35 kez, gerçek `ShiftLeft` boost tuşunu ve `RACE_SPEEDS.NORMAL` hız girişini kullanarak çalıştırıyor. Bu **oyundaki gerçek renk/opacity animasyon kodudur**, materyal sonuçları testte elle ayarlanmıyor.
- Yarış `running`, `finished`, `paused`, `currentSpeed`, `energy`, `itemTurboTimer`, ShiftLeft/Right/KeyW state'leri yalnız art testi boyunca kontrollü olarak ayarlanıyor, `finally` bloğunda eski hâline dönüyor. Fizik/çarpışma ilerlemediğinden rastgele asteroit, DNF ve bitiş yarış kontrolünü kesemiyor.
- Her stüdyo kanıtı gerçek `h4Ship19Race.clone(true)` 3D sahnesinden 1600×900 PNG üretiyor. `studioNormalDrive`, `studioBoostDrive` ve `studioDiagnostics` değerleri `tests/map1-next11c20-zenit-studio-drive-diagnostics.json` olarak da kaydediliyor. Normal/boost farkı gerçek canlı render `thrustGlow` değerinden kontrol ediliyor, **assert kaldırılmadı**. Görüntüler özel/normal yarış kamerası olmadığı dürüstçe belirtiliyor.
- Geometri 189, gerçek 7 opaque +2 sprite, oyun mekaniği/AI/Harita 1/4 aynı. **Oyunun `index.html` dosyası değiştirilmedi**.

## QA ve karar
- [x] Gerçek önceki PASS ve FAIL GitHub logları okundu; spesifik hängesti test hatası belirlendi.
- [x] İlk çalışan WebGL PNG artifaktları indirildi; ön, arka-normal, arka-boost ve playable chase gerçekten incelendi. Onaylı SB-07 geniş yatay kanat ve dikey wingtip silueti mevcut; büyük kopma/siyah ekran görülmedi.
- [x] İlk test stüdyo karşılaştırmasında iki mod piksel farkı hesaplandı ve görsel kontroller sunuldu (SwiftShader).
- [x] Playwright test kodu JavaScript syntax PASS; C20M dedicated workflow ve Map1/Map4 full smoke branch trigger eklendi.
- [ ] **Yeni C20M HEAD özel QA ve tam smoke GitHub Actions sonuçları** başarıyla tamamlandı.
- [ ] Gerçek native GPU FPS/p95 (720p/1080p) ve kullanıcı oynanış/görsel son kabulü verildi.
- [ ] Kullanıcı merge açık izni verdi. **DRAFT/NO MERGE**.

## Sıradaki NEXT11C20N
Güncel C20M GitHub Actions final PASS/failure raporlarını doğrula, varsa sonraki spesifik test kökünü düzelt; hepsi geçince kullanıcıya QA ve gerçek screenshot dosyalarını açıkça sun. Uzun süreli native GPU oyun testi ve performans profilini yalnız kanıtla tamamla. Parça ekleme/siluet değiştirme yok.

Önceki: [NEXT11C20L](MAP1_NEXT11C20L_REAL_WEBGL_QA_REPAIR.md).
