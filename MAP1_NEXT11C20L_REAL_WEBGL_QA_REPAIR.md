# NEXT11C20L — SB-07 Zenit gerçek browser QA onarımı

**Tarih: 19 Kasım 2026 | Taslak, merge yok.**

## Gerçek GitHub Actions tanısı

Önceki NEXT11C20K PR #76 HEAD `96e0b96a4b73f1eb38f93de858fbe76eedf1c3c3` için GitHub push tabanlı iki workflow **GERÇEKTEN çalışmış ve başarısız olmuş**:
- [Kısa WebGL QA #44509601434](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44509601434): Chromium ve pinned Three.js indirme başarılı. Çalışma `tests/map1-next11c20-sb07-zenit.cjs:314` satırında `ReferenceError: THREE is not defined` ile durdu.
- [Map1/Map4 tam smoke #44509601442](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44509601442): Çevrimdışı oyun + GLB paketlemesi ve Chromium ile offline yükleme başarılı; SB-07 bağımsız test adımı aynı Node-scope `THREE` hatasında durduğu için sonraki koruma testleri atlandı. Bu **oyunun başarısız olduğu anlamına gelmez**, fakat tam QA PASS de demek değildir.
- Tam smoke, **`map4-current-branch-playable-html`** adında gerçek oynanabilir HTML artifact `14520499229` yükledi. Artifact ZIP içindeki `Uzay_Yarisi_Guncel_Oynanabilir.html` 5,734,682 bayt; bütün harici script/css bağımlılıkları gömülü. Bu dosyadan **doğrudan oynanabilir HTML** çıkarılıp kullanıcıya sağlandı. Node `new Function` ile 4 inline script syntax PASS. Gerçek yarış başarı durumu ayrıca test edilmedi.

## Gerçek düzeltme

Sorun renderer/oyuncu değil test kodundaki çalıştırma ortamı ayrımıydı. `page.evaluate(() => { ... })` içindeki Three.js yalnız Chromium pencere kapsamında mevcuttur. Ancak test script Node.js kısmında `geometry.haloSprites.every(s => s.minFilter === THREE.LinearMipmapLinearFilter)` ifadesi kullanılıyordu ve Node tarafında `THREE` tanımlı değildi.

- Gerçek sprite materyalini okuyup `hasTrilinearMinFilter:s.material.map?.minFilter===THREE.LinearMipmapLinearFilter` boolean değerini **tarayıcı içinde** hesaplıyoruz.
- Node testinde bu gerçek sonuç `s.hasTrilinearMinFilter===true` olarak doğrulanıyor; sahte sabit / statik PASS yapılmıyor.
- Oyun `index.html` **değişmedi**; SB-07 189 parça, 7 materyal mesh + 2 halo sprite, Harita1 yarış / Harita4 B-04 combat kuralları korunuyor.
- Önceden eklenen 8 sol/sağ kanat panel Raycaster yüzey aralığı, 15 burun ribbon vertex, 189 parça ve gerçek oyun stüdyo PNG render / 2 motor glow boost / Map4 anti-regresyon doğrulamaları korunuyor.

## Güncel test kanıtı
- [x] Test dosyası JS syntax PASS; `THREE` Node-scope hatası giderildi.
- [x] Özel NEXT11C20L browser QA workflow ve tam Map1/4 smoke trigger eklendi.
- [x] Eski HEAD'in gerçek önceki başarısızlık logları incelendi; eski "CI doğrulanmadı" notu artık yukarıdaki kesin sonuçla güncellenmiştir.
- [ ] C20L yeni dalındaki **güncel** GitHub Actions PASS ile sonuçlandı ve PNG'leri insan gözünden kabul edildi.
- [ ] Gerçek native GPU FPS/p95, 720p/1080p en az 5 dk oyun testi tamamlandı.
- [ ] Kullanıcıdan merge yetkisi alındı. **DRAFT, NO MERGE.**

**NEXT11C20M:** Yeni çalışmanın gerçek hata/başarı loglarını incele; testte takip eden başka yanlış koordinat/bekleme/renderer kontratı varsa kodu düzelterek testleri yeşile al. Ardından oyun deneyimini ve kamera görüntülerini kabul et. Yeni gemi parçası ekleme.

[Önceki K](MAP1_NEXT11C20K_SB07_OVERLAP_QA.md).
