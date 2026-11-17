# NEXT-11C7 — Sanayi dekoratif öğe, zemin ve güneş dengesi

**Durum:** `index.html` kodu ayrı stacked dalda; ilk gerçek Chromium/WebGL ve tam CI kabul kapıları doğrulanacak. **Estetik 7–8/10 onayı verilmedi.**

## Neden?

[NEXT-11C6](MAP4_GFX11C6_SILHOUETTE_DEPTH_ACCEPTANCE.md) onarımı ardından gerçek 1600×900 sanayi kadrajları hâlâ fazla düz, parlak, tekrar eden servis halkaları/platformları ve 09 çıkışında zayıf atmosfer/odak taşıyor. Yeni kutu/geometri eklemeden mevcut sanayi görsellerini daha fiziksel ve sakin bir malzeme diline taşıyoruz.

## Uygulama

- **Yalnız 12 görsel-only W05** `SERVICE_DECK` ve `CARGO_PLATFORM` malzemesi; UV'li mevcut geometri ve mevcut NEXT11C5 256² PBR atlas yeniden kullanılır. Fiziksel W05 SUPPORT / OVERHEAD_PIPE / TRANSFER_BRIDGE / HUNTER_SIDE_TOWER **dokunulmaz**.
- **Yalnız iki GFX11C dekoratif çizim grubu** `SERVICE_COLLARS` ve `SIGNAL_CORES`: cyan unlit + aşırı parlak renk yerine gölgelenen mat metal; instancing/pozisyon/3D geometri korunur. Bunlar **W05 BEACON/HIGH_MARKER değildir**.
- **Sanayi W02 görsel-only terrain:** `normalMap` ve `roughnessMap`in yüksek frekanslı yüzey deseni klon malzemeyle kapatılır; konum, tepe geometrisi, renk/UV ve zemin çarpışma kuralları hiç değiştirilmez.
- **Yalnız phase3 + High/Balanced:** bir miktar sis yoğunluğu, güneş halosu ölçeği/opacity ve exposure azaltılır; Low ve diğer fazlarda stil uygulanmaz.
- **A/B `h4Gfx11c7SetLook(true|false)`:** bütün önce/sonra aynı build ve aynı kamera; 15 kayıtlı malzeme işaretçisi eski/yeni arasında yer değiştirir. Per-frame yeni mesh/texture/geometry üretimi yok.

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
