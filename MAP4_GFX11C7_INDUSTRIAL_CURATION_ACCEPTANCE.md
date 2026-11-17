# NEXT-11C7 — Sanayi dekoratif öğe, zemin ve güneş dengesi

**Durum:** `index.html` kodu ayrı stacked dalda; ilk gerçek Chromium/WebGL ve tam CI kabul kapıları doğrulanacak. **Estetik 7–8/10 onayı verilmedi.**

## Neden?

[NEXT-11C6](MAP4_GFX11C6_SILHOUETTE_DEPTH_ACCEPTANCE.md) onarımı ardından gerçek 1600×900 sanayi kadrajları hâlâ fazla düz, parlak, tekrar eden servis halkaları/platformları ve 09 çıkışında zayıf atmosfer/odak taşıyor. Yeni kutu/geometri eklemeden mevcut sanayi görsellerini daha fiziksel ve sakin bir malzeme diline taşıyoruz.

## Uygulama

- **Yalnız 12 görsel-only W05** `SERVICE_DECK` ve `CARGO_PLATFORM` malzemesi; UV'li mevcut geometri ve mevcut NEXT11C5 256² PBR atlas yeniden kullanılır. Fiziksel W05 SUPPORT / OVERHEAD_PIPE / TRANSFER_BRIDGE / HUNTER_SIDE_TOWER **dokunulmaz**.
- **Yalnız iki GFX11C dekoratif çizim grubu** `SERVICE_COLLARS` ve `SIGNAL_CORES`: cyan unlit + aşırı parlak renk yerine gölgelenen mat metal; instancing/pozisyon/3D geometri korunur. Bunlar **W05 BEACON/HIGH_MARKER değildir**.
- **IN06 enerji tesisinin iki görsel-only power toroid'i:** `IN06_CENTRAL_POWER_TOROID_0/1` W05 uçuş rehberi değildir; çapları %24 küçültülür, parlak kaplama mevcut PBR atlasına/mat metal yüzeye çekilir. `h4Gfx11c7SetLook` eski mesh scale değerlerini kayıpsız geri yükler. Gerçek `BEACON/HIGH_MARKER` rotası değişmez.
- **Sanayi W02 görsel-only terrain:** `normalMap` ve `roughnessMap`in yüksek frekanslı yüzey deseni klon malzemeyle kapatılır; konum, tepe geometrisi, renk/UV ve zemin çarpışma kuralları hiç değiştirilmez.
- **Yalnız phase3 + High/Balanced:** bir miktar sis yoğunluğu, güneş halosu ölçeği/opacity ve exposure azaltılır; Low ve diğer fazlarda stil uygulanmaz.
- **A/B `h4Gfx11c7SetLook(true|false)`:** bütün önce/sonra aynı build ve aynı kamera; 17 kayıtlı malzeme işaretçisi (iki IN06 toroid ölçek dahil) eski/yeni arasında yer değiştirir. Per-frame yeni mesh/texture/geometry üretimi yok.

## Zorunlu korunacaklar

- Harita 1 yarış sistemi ve görünümü; Harita 4 dört aşama; 5 rakip, 8 avcı, 60 sn av kilidi, 300 sn toplam süre, 850m çıkış.
- 6 kanyon + 36 sanayi + 200 authored yapı collider ve fiziksel mesh identity; W05 bütün BEACON/HIGH_MARKER yönlendirmeleri.
- Önceki C3, C4, C5, C6 authored model ve kabul kanıtları; stacked PR'lar **merge edilmez**.

## Doğrulama kapıları

- [x] Gerçek `index.html` kodu yazıldı ve JavaScript parser PASS.
- [x] C7 gerçek Chromium/WebGL `tests/map4-gfx11c7-industrial-curation.cjs` eklendi; 07 giriş / 08 fabrika / 09 çıkış aynı 1600×900 kamera eski/yeni. Korumalar, High/Balanced/Low ve diğer fazları test eder.
- [x] Hızlı görsel workflow ve tam smoke/regresyon workflow'a bağlandı.
- [ ] Yeni branch **güncel HEAD** hızlı Chromium CI PASS, görüntü arşivi yüklenmesi.
- [ ] Tam eski+yeniler CI PASS ve 62 kare sanat galerisi.
- [ ] 07/08/09 gerçek görüntüler insan gözüyle incelendi; estetik düzeltme gerekiyorsa PR'da yapılacak.
- [ ] Native GPU 720p/1080p FPS/p95/VRAM + gerçek 5 dakika uçuş.
- [ ] Kullanıcı 7–8/10 estetik ve 3/6 playable yayıncı haritası kabulü.

**Birleştirme:** Kullanıcı açık onayı olmadan bu veya önceki PR'lar main'e merge edilmez. **NEXT-11C7 kod değişiklikleri CI PASS veya kullanıcı estetik onayı sayılmaz.**


## 17 Kasım — Gerçek ekran görüntüsü ve IN06 düzeltme notu

- **İlk C7 gerçek WebGL 07/08/09:** [hızlı CI #44067126151](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44067126151) **PASS**; artifact `map4-next11c7-07-08-09-review` (1600×900 aynı kamera `h4Gfx11c7SetLook` A/B).
- **İlk görsel yargı:** 07/08'in yüzeyleri daha mat ve sakin, fakat 09 çıkışında **büyük renkli reaktör halkaları** çok baskın; bu nedenle ilk C7 koduna **7–8/10 estetik kabul verilmedi**.
- **İkinci hedefli düzeltme:** `c4a1944` iki `IN06_CENTRAL_POWER_TOROID` görsel-only meshinin malzemelerini mat PBR yaptı; scale 1.0→0.76, orijinal ölçek A/B bayrağıyla geri yüklenir. `4eb8643` testi 17 görsel malzeme kaydını ve iki ölçeğin doğru geri dönüşünü denetler.
- **Yeni son kod CI ve ikinci 07/08/09 görüntü incelemesi:** Henüz açık; [hızlı test #44067601417](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44067601417) ve ayrıca tam Smoke workflow sonucu doğrulanmadan PASS veya nihai estetik karar yazılmayacak.
- Gerçek GPU FPS/VRAM, 5 dakikalık oynanış ve yayıncı için 3/6 playable kabulü hâlâ açık. Main merge yok.
