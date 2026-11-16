# NEXT11 / GFX11 — Gerçek oyun görüntüsü görsel kabul incelemesi

**Durum:** KOD/PAKET GELİŞTİRİLDİ; **nihai estetik kabul VERİLMEDİ**. Üst dal: [NEXT10B PR #43](https://github.com/zxc28tarik/daethlyspacerace2202/pull/43).

## Kaynak / kanıt

- Gerçek en son [NEXT10B CI #43954482993](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43954482993) sabit Chromium/WebGL galeri çıktısı ve oynanabilir [offline HTML](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43954482993/artifacts/14271232046) incelendi.
- 12 sabit 1600x900 bölge kadrajı; sahnelerin hiçbiri AI ile üretilmedi veya rötuşlanmadı.
- 15 orijinal *aynı-kamera* karşılaştırma çifti, 30 PNG: VIS02 2, GFX06DC 3, GFX06E 3, GFX07 3, GFX08 3, GFX05C 1. Her A/B, **tek çalışan oyun build'inde görsel özelliğin kapalı/açık halini** karşılaştırır. İki ayrı commit / gerçek önce-sonra oyun sürümü değil. Yalnız teknik render farkını ispatlar.
- 4 CHASE/TURRET × 720p/1080p HUD kare, 3 High/Balanced/Low kare, 1 canlı Map4 kare: toplam **50 gerçek kaynak PNG**.
- [scripts/map4-gfx11-audit.cjs](scripts/map4-gfx11-audit.cjs) 50 resmin PNG imzasını, boyutlarını, SHA256 değerlerini, 12 vaka/15 bağımsız çifti ve her A/B için birbirinden farklı gerçek çıktı olmasını doğrular; çevrimdışı HTML review paketi ve `manifest.json` üretir.
- Kaynak test: [tests/map4-art-baseline.cjs](tests/map4-art-baseline.cjs), [GFX09 kamera](tests/map4-gfx09-camera-hud.cjs), [GFX10 profil](tests/map4-gfx10-profiles.cjs). Yeni galeri GitHub Actions artefaktı `map4-gfx11-visual-review-gallery`.
- Sadece screenshots + tanı paketi eklenmiştir; oyun fiziği, collider, silah, mevcut 300s/60s/850m/5 rakip/8 avcı ve tek HTML değişmez.

## İnsan gözüyle tespit edilen açık sorunlar

| Öncelik | Görüntü | Açık sorun | Kabul için gerekli |
|---|---|---|---|
| **BLOKER** | `09-industry-exit.png` | Yakındaki büyük mavi/gri yüzey sabit çıkış kadrajının neredeyse tamamını kapatıyor | Kamera görüntüsünün nesneye girmediği, CHASE/TURRET gerçek akışla ve 720/1080 oynanışta doğrulanmalı. Bunun *canlı oynanış hatası* olduğu henüz ispatlanmadı. |
| **YÜKSEK** | `04-arena-center.png`, `05-arena-wreck.png`, `06-arena-defense.png` | Sabit kareler çok boş; avcı ve alan okunabilirliği ikna edici değil | 60 saniyelik gerçek avcı safhasında hedef, enkaz, tehdit, gölge ve alan doluluğu karşılaştırması |
| **YÜKSEK** | `07-industry-entry.png`, `08-industry-factory.png` | 6 tesis görünse de modeller fazla kutumsu/pürüzsüz; geniş alan ikna edici gerçekçilikte değil | Uzak silüet/orta ölçek işlevsel makine düzeni/artist-made materyal kalite düzeltmeleri |
| **ORTA** | GFX09 720/1080, 01–12 | HUD kalabalıklığı, yoğun açık tonlar ve sis yüzünden nişangâh/rota okunabilirliği değişken | Gerçek ekran ve cihazda gözle kontrol; kontrast/ışık/mastering |

**Yorum:** Bunlar gerçek dosyaların gözle incelemesi, otomatik estetik puanı değildir. Kullanıcının hedeflediği 7–8/10 hâlâ açık, oyun finali onaylanmış değildir.

## Kabul kapıları

- [x] 12+ gerçek kadraj ve 15 true same-camera A/B çift kaynaklardan bulundu, gözle incelendi.
- [x] Görsel blokaj / arena boşluğu / endüstri materyal borcu ayrı ID ile sınıflandırıldı.
- [ ] Yeni GFX11 gallery build/CI 50 görsel ve provenance PASS.
- [ ] Gerçek **beş dakikalık** uçtan uca Map4 oyun oturumu kayıt altına alınsın. Daha önceki 300 saniyelik **simüle VFX dayanıklılığı bunun yerine geçmez**.
- [ ] 720/1080p gerçek cihaz GPU p95/frame time, VRAM, FPS kabulü (geliştirme hedefi >=60 FPS / p95 <=25ms; gerçek veri henüz yok).
- [ ] 09 kamera görsel blokajının gerçek oyun akışında kök nedeni çözülsün ve insan gözüyle kontrol edilsin.
- [ ] Üç arena kadrajı ve 6 sanayi yapısı daha kuvvetli özgün sanatla iyileştirilsin.
- [ ] Kullanıcı görsel kalite 7–8/10 hedefini **oynanır build üzerinde kendisi** kabul etsin.
- [ ] Önceki tüm stacked draft PR zinciri kontrollü şekilde merge; yayıncı için ≥3 gerçek oynanabilir harita doğrulansın.

**Bir sonraki `.`:** Önce GFX11 galeri CI hatası varsa düzelt; CI tam başarılıysa **GFX11-B / QA-VIS-09 sanayi çıkışı kamera/geometry klip** kök nedeni ve gerçek canlı testini düzelt. NEXT12 yayıncı kapısına erken geçme.
