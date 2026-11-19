# NEXT-11C20N — SB-07 Zenit 720p / 1080p gerçek WebGL kaynak bütçesi ve CI güvenilirliği

**19 Kasım 2026.** Kullanıcının "." komutu NEXT-11C20N aşamasına geçiştir. Daha önce kesinleşen kalite kuralı: **ayrık dekor objelerini birleştir; 189 parçalık SB-07'ye yeni süs ekleme, çizgi kalitesini bozmadan denetle**.

## İncelenen kesin CI kanıtı

1. NEXT11C20M'de [GitHub Actions #44520110027](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44520110027), gerçek Chromium/SwiftShader **PASS**, 189 SB-07 parça, 7 birleşik materyal mesh + 2 plazma sprite, `renderCalls=9`, `triangleCount=36156`, 1600×900 8 panel raycast y farkları .012 ve .016, Map4 B-04 249 model parça, fizik [6,36,200], gerçek boost animasyonu doğrulandı.
2. Sonraki C20M HEAD `1e19ef0...` için [özel QA #44520195239](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44520195239) **FAIL**. Ancak C20M gerçek render scripti nedeniyle değil: Playwright `npx playwright install --with-deps chromium` Ubuntu APT indirmede çok sayıda **HTTP 503 Service Unavailable** nedeniyle exit 100 ile durdu. Native GPU testi gibi yorumlanmamalı.
3. Tam Map1/4 smoke [#44520195269](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44520195269) ilk kontrol sırasında hâlâ `in_progress`. Bu dosya sonuçtan önce oluşturulmuştur; kesin nihai durum ayrı incelenmeli.

## N aşamasında yapılan gerçek işler

- **Yeni ayrık performans testi:** `tests/map1-next11c20n-gpu-budget.cjs`. GitHub Ubuntu Chromium + SwiftShader üzerinde mevcut gerçek `index.html` oyununu açıp Map1 ve Map4'te **1280×720 / 1920×1080** örnekleri toplar.
- Ölçüm `renderer.render(scene,camera)` + **`gl.finish()`** ile GPU kuyruğunun tamamlanmasını bekleyerek her çözünürlük/harita için 3 ısınma + 10 senkron kare alır. Medyan ve p95 (10 örnekten en kötü), `renderer.info.render.calls`, drawn triangles, `renderer.info.memory.geometries/textures`, framebuffer boyutu, MSAA ve pixel ratio kaydeder.
- Harita1 gerçekten `#start-btn` ile başlatılır, Harita4 `selectMap(MAP_MODES.MAP4)` + `startGame()` üzerinden açılır. Her iki haritada SB-07 `parts=189`, B-04 `parts=249` koruma assertion'ları bulunur. Ekran görüntüleri doğrudan `gl.readPixels` ile **iki 720p gerçek render PNG** olarak alınır, yalnız compositor screenshot'una güvenilmez.
- Sonuçlar `tests/next11c20n-perf/perf-report.json` ve gerçek 720p PNG'lere yazılır. **SwiftShader CPU üzerindeki WebGL süresi; bir oyuncunun NVIDIA/AMD/iGPU'lu gerçek bilgisayarında FPS tahmini değildir.** Bu sınır raporda açıklanır.
- **CI onarımı:** Yeni özel benchmark workflow ve mevcut tam Map1/4 smoke workflow'da `npx playwright install --with-deps chromium` yerine `npx playwright install chromium` kullanıldı. GitHub'ın Ubuntu 24.04 runner'ında kurulu tarayıcı kitaplıklarını kullanır, tekrar eden hatalı APT fonts/mesa mirror 503 taleplerini engeller. Playwright 1.56.1 / Three.js r128 pinleri ve gerçek WebGL testleri korunur.
- Çalışma ortamında yerel `file://` ve `http://127.0.0.1` Chromium erişimi `ERR_BLOCKED_BY_ADMINISTRATOR` ile engellendi. Yerel FPS sonucu sunulmaz; bu kısıt nedeniyle runner üzerinde ölçüm yapılıyor.

## Gerçek WebGL performans ölçümleri (GitHub Actions başarılı run #44521687724)

*Metod: 3 ısınma + 10 senkron `renderer.render + gl.finish` kare/harita/çözünürlük, DPR=1, pause edilmiş gerçek sahne. Sayılar SwiftShader **software render elapsed time**, oynanabilir frame-budget veya fiziksel GPU FPS'i DEĞİL.*

| Harita | Fiziksel çözünürlük | Draw calls | Render triangles | Geometry/Text. resources | Medyan render+gl.finish | 10 örnekte en yavaş (yaklaşık p95) |
| --- | --- | --- | --- | --- | --- | --- |
| Harita 1 | 1280×720 | 257 | 62.026 | 272 / 2 | 1,70 ms | 4,60 ms |
| Harita 1 | 1920×1080 | 257 | 62.026 | 272 / 2 | 1,85 ms | 7,30 ms |
| Harita 4 | 1280×720 | 284 | 177.591 | 342 / 30 | 3,35 ms | 9,90 ms |
| Harita 4 | 1920×1080 | 284 | 177.591 | 342 / 30 | 2,55 ms | 2,90 ms |

1080p Harita 4 sonuçlarının 720p'den daha kısa görünmesi 10 kısa örnek, shader/driver ısınması, farklı oyun zamanlaması ve CPU SwiftShader gürültüsü nedenleriyle **1080p'de daha hızlıdır** şeklinde okunamaz. Test ekranı fiziksel 1280×720/1920×1080, WebGL MSAA açık. Otomatik oyun güncellemesini pause edip yalnız render işini ölçtüğünden oyun mantığının FPS maliyetini kapsamaz.

**Gerçek screenshot gözlemi:** 720p Map1 PNG'de onaylı SB-07 çift motoru ve yüksek wingtip fin görünür; kamera yarış koridoruna dönük. Harita 4 PNG'ye geçişte B-04 + arazi/gökyüzü gerçek render verilmiş ve framebuffer siyah/boş değil; kamera eğik açıda olabilir (otomatik test snapshot), estetik oyuncu onayı ayrıca gerekir.

**Artifakt:** `sb07-next11c20n-native-budget-artifacts`: `MAP1-actual-720p.png`, `MAP4-actual-720p.png`, `perf-report.json`.

## Kullanıcı silueti ve oyun korumaları

**Oyun `index.html` değiştirilmedi.** Onaylı SB-07: uzun sivri burun, iki geniş düz/swept yatay kanat, dış uçlarda dikey yükselen stabilizatörler, mavi cam, kırmızı-gümüş yüzey, iki mavi plazma motoru. Harita1 saf yarış; B-04 Harita4 aynen. 189 kaynak primitif, 7 birleşik ana mesh + 2 motor sprite, 16/32/40 çizgi/motor/halka kesit kalitesi, 128px mipmapped dokular korunur. Yeni collider, silah veya süs objesi eklenmez.

## Kabul kapıları

- [x] Playwright benchmark JavaScript statik parse PASS.
- [x] Özel 720/1080 test workflow ve Map1/4 tam regresyon için yeni dal tetikleyicisi kaydedildi.
- [x] Ubuntu mirror kaynaklı gerçek önceki CI FAIL sebebi loglardan tespit edilip her iki workflow içinde APT bağımlılığını zorunlu kılan install azaltıldı.
- [x] **Gerçek GitHub Actions** [#44521687724](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44521687724) tamamlandı: `success`, dört Map1/Map4 720p/1080p gerçek SwiftShader örneği, sıfır JavaScript pageError, iki `gl.readPixels` PNG. [Artifact #14528171226](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44521687724/artifacts/14528171226) indirildi ve JSON/PNG kontrol edildi. Bu sonuç ölçüm kodu/ilgili commit içindir; daha sonraki doküman commit'inin tüm workflow durumunu kendiliğinden PASS ilan etmez.
- [ ] **Yeni C20N HEAD** tam Map1+4 browser smoke PASS.
- [ ] **Gerçek cihazda** GPU FPS/p95, en az 5 dk yarış ve görsel kalite kullanıcı onayı.
- [ ] Kullanıcı **açık merge izni** verdi. DRAFT / NO MERGE.

**NEXT11C20O:** Gerçek C20N benchmark/test run sonuçlarını ve 2 PNG'yi incele; varsa render bottleneck / boş ekran / ekran boyutu regresyonunu yalnız hedefli düzelt. Yüksek maliyetli global AA veya yeni mikrodetay ekleme.
