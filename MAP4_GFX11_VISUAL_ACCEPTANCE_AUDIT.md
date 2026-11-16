# NEXT11 / GFX11 — Gerçek oyun görüntüsü görsel kabul incelemesi

**Durum:** KOD/PAKET GELİŞTİRİLDİ; **nihai estetik kabul VERİLMEDİ**. Üst dal: [NEXT10B PR #43](https://github.com/zxc28tarik/daethlyspacerace2202/pull/43).

## Kaynak / kanıt

- Gerçek en son [NEXT10B CI #43954482993](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43954482993) sabit Chromium/WebGL galeri çıktısı ve oynanabilir [offline HTML](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43954482993/artifacts/14271232046) incelendi.
- **12 gerçek tarihsel sürüm A/B çifti**: 20 Ekim 2026 [GFX00 Actions #39392177682](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/39392177682) ile 16 Kasım 2026 [NEXT10B #43954482993](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43954482993). 1600×900, progress/laneX/laneY/phase **12/12 birebir eşleşen** kamera parametresi ve değişmeyen başlangıç FOV/aynı saha. Bu 24 kare **gerçek farklı kod sürümleridir**; sabit sahne görüntüleri AI ile üretilmedi veya rötuşlanmadı.
- Önceki GFX00 kanıtı ayrı bir GitHub Actions artefaktından (14 MB, 12 sabit PNG+metrics) yeniden indirilir, kaynak SHA'ları manifesto eklenir. CI `actions/download-artifact@v4` + `run-id:39392177682` kullanır.
- 15 orijinal *aynı-kamera* karşılaştırma çifti, 30 PNG: VIS02 2, GFX06DC 3, GFX06E 3, GFX07 3, GFX08 3, GFX05C 1. Her A/B, **tek çalışan oyun build'inde görsel özelliğin kapalı/açık halini** karşılaştırır. İki ayrı commit / gerçek önce-sonra oyun sürümü değil. Yalnız teknik render farkını ispatlar.
- 4 CHASE/TURRET × 720p/1080p HUD kare, 3 High/Balanced/Low kare, 1 canlı Map4 kare: **62 gerçek kaynak PNG** (30 özellik A/B + 12 eski GFX00 + 12 güncel sabit + 8 HUD/profil).
- [scripts/map4-gfx11-audit.cjs](scripts/map4-gfx11-audit.cjs) 62 resmin PNG imzasını, boyutlarını, SHA256 değerlerini, **12 farklı sürüm aynı-kamera vaka** ve 15 bağımsız özellik çifti ile her A/B için birbirinden farklı gerçek çıktı olmasını doğrular; çevrimdışı HTML review paketi ve `manifest.json` üretir.
- Kaynak test: [tests/map4-art-baseline.cjs](tests/map4-art-baseline.cjs), [GFX09 kamera](tests/map4-gfx09-camera-hud.cjs), [GFX10 profil](tests/map4-gfx10-profiles.cjs). Yeni galeri GitHub Actions artefaktı `map4-gfx11-visual-review-gallery`.
- Sadece screenshots + tanı paketi eklenmiştir; oyun fiziği, collider, silah, mevcut 300s/60s/850m/5 rakip/8 avcı ve tek HTML değişmez.

## İnsan gözüyle tespit edilen açık sorunlar

| Öncelik | Görüntü | Açık sorun | Kabul için gerekli |
|---|---|---|---|
| **BLOKER** | `09-industry-exit.png` | Yakındaki büyük mavi/gri yüzey sabit çıkış kadrajının neredeyse tamamını kapatıyor | Kamera görüntüsünün nesneye girmediği, CHASE/TURRET gerçek akışla ve 720/1080 oynanışta doğrulanmalı. Bunun *canlı oynanış hatası* olduğu henüz ispatlanmadı. |
| **BLOKER / GERİLEME** | `04-arena-center.png`, `05-arena-wreck.png`, `06-arena-defense.png` | Eski gerçek GFX00 sürümünde görünür sanayi/arena silüetleri çok daha dolu; güncel 04–06 kadrajları neredeyse tamamen boş. Draw call 443→44, 440→24, 439→20. Çağrı düşüşü tek başına neden değil; görüntüde kompozisyon kaybı var. | Bölge 2 görsel culling/regionVisible/atmosferik art gruplarını geri incele; 60 saniyelik gerçek savaş uçuşunda da kaybı test et, fizik/puanı değiştirmeden görüntü düzelt. |
| **YÜKSEK** | `07-industry-entry.png`, `08-industry-factory.png` | 6 tesis görünse de modeller fazla kutumsu/pürüzsüz; geniş alan ikna edici gerçekçilikte değil | Uzak silüet/orta ölçek işlevsel makine düzeni/artist-made materyal kalite düzeltmeleri |
| **ORTA** | GFX09 720/1080, 01–12 | HUD kalabalıklığı, yoğun açık tonlar ve sis yüzünden nişangâh/rota okunabilirliği değişken | Gerçek ekran ve cihazda gözle kontrol; kontrast/ışık/mastering |

**Yorum:** Bunlar gerçek dosyaların gözle incelemesi, otomatik estetik puanı değildir. Kullanıcının hedeflediği 7–8/10 hâlâ açık, oyun finali onaylanmış değildir.

## Kabul kapıları

- [x] **12/12 gerçek farklı kod sürümü aynı-kamera tarihsel A/B** + 15 true same-build feature-toggle A/B ve 8 ek screenshot kaynakları bulundu/gözle incelendi.
- [x] Görsel blokaj / arena boşluğu / endüstri materyal borcu ayrı ID ile sınıflandırıldı.
- [ ] Yeni GFX11 gallery build/CI **62 kaynak PNG + 12 historical comparison** ve provenance PASS.
- [ ] Gerçek **beş dakikalık** uçtan uca Map4 oyun oturumu kayıt altına alınsın. Daha önceki 300 saniyelik **simüle VFX dayanıklılığı bunun yerine geçmez**.
- [ ] 720/1080p gerçek cihaz GPU p95/frame time, VRAM, FPS kabulü (geliştirme hedefi >=60 FPS / p95 <=25ms; gerçek veri henüz yok).
- [ ] 09 kamera görsel blokajının gerçek oyun akışında kök nedeni çözülsün ve insan gözüyle kontrol edilsin.
- [ ] Öncelikle **gerilemiş arena sahne görünürlüğü** (04–06) 20 Ekim seviyesi ve üstüne getirilsin; 6 sanayi yapısı daha kuvvetli özgün sanatla iyileştirilsin.
- [ ] Kullanıcı görsel kalite 7–8/10 hedefini **oynanır build üzerinde kendisi** kabul etsin.
- [ ] Önceki tüm stacked draft PR zinciri kontrollü şekilde merge; yayıncı için ≥3 gerçek oynanabilir harita doğrulansın.

**Bir sonraki `.`:** Önce GFX11 tarihsel karşılaştırma galeri CI hatası varsa düzelt; CI tam başarılıysa **GFX11-B / QA-VIS-ARENA eski sürüme göre kaybolmuş bölge 2 görünürlüğü** ve **QA-VIS-09 sanayi çıkışı kamera/geometry klip** kök nedenlerinden yüksek etkilisini araştırıp düzelt; gerçek canlı test olmadan final estetik onayı verme. NEXT12 yayıncı kapısına erken geçme.
