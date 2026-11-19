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

## Kullanıcı silueti ve oyun korumaları

**Oyun `index.html` değiştirilmedi.** Onaylı SB-07: uzun sivri burun, iki geniş düz/swept yatay kanat, dış uçlarda dikey yükselen stabilizatörler, mavi cam, kırmızı-gümüş yüzey, iki mavi plazma motoru. Harita1 saf yarış; B-04 Harita4 aynen. 189 kaynak primitif, 7 birleşik ana mesh + 2 motor sprite, 16/32/40 çizgi/motor/halka kesit kalitesi, 128px mipmapped dokular korunur. Yeni collider, silah veya süs objesi eklenmez.

## Kabul kapıları

- [x] Playwright benchmark JavaScript statik parse PASS.
- [x] Özel 720/1080 test workflow ve Map1/4 tam regresyon için yeni dal tetikleyicisi kaydedildi.
- [x] Ubuntu mirror kaynaklı gerçek önceki CI FAIL sebebi loglardan tespit edilip her iki workflow içinde APT bağımlılığını zorunlu kılan install azaltıldı.
- [ ] **Yeni C20N HEAD** gerçek 720p/1080p benchmark PASS, 4 sayısal bütçe ölçümü ve 2 PNG sonucu incelenip onaylandı.
- [ ] **Yeni C20N HEAD** tam Map1+4 browser smoke PASS.
- [ ] **Gerçek cihazda** GPU FPS/p95, en az 5 dk yarış ve görsel kalite kullanıcı onayı.
- [ ] Kullanıcı **açık merge izni** verdi. DRAFT / NO MERGE.

**NEXT11C20O:** Gerçek C20N benchmark/test run sonuçlarını ve 2 PNG'yi incele; varsa render bottleneck / boş ekran / ekran boyutu regresyonunu yalnız hedefli düzelt. Yüksek maliyetli global AA veya yeni mikrodetay ekleme.
