# NEXT10 / GFX10 — High, Balanced, Low GPU bütçesi (ilk teknik dilim)

**Tarih:** 16 Kasım 2026. [NEXT09 PR #41](https://github.com/zxc28tarik/daethlyspacerace2202/pull/41) üzerine bağımlı ayrı dal; `main` değişmez.

## Gerçek oyun kodu

Harita 4'e özgü üç profil var:

| Parametre | High | Balanced | Low |
|---|---:|---:|---:|
| Ekran piksel oranı çarpanı (DPR <=2) | 1.00 | 0.84 | 0.67 |
| Sanayi 3 LOD mesafe ölçeği | 1.00 | 0.86 | 0.68 |
| Son bölge/kahraman ince detay mesafesi | 1.00 | 0.84 | 0.66 |
| SMOKE/ENGINE kozmetik GPU instance görüntü bütçesi | %100 | %75 | %50 |
| Son bölgede 3 seçici ışık | açık | açık | kapalı |

- High önceki kabul edilmiş render davranışının eşdeğeridir; Harita1 kendi önceki DPR, ışık/tonemap, HUD ve FOV değerlerine her geçişte geri döner.
- Harita4 başlangıç menüsünde erişilebilir HTML seçici ve oyun sırasında **F7** profil döngüsü.
- Harita4 FX gözle görülürlük için MUZZLE/IMPACT/SHOCK havuzlarına dokunulmadı. Kozmetik SMOKE/ENGINE listesi aynı kapasitede; çizimde sınırlı miktarda en yeni efektler gösterilir. Hasar, atış, ses, enerji ve puan *değişmez*.
- Sanayi dekoratif LOD ve hero fine detail eşikleri parametrik hale getirildi; 36 sanayi / 6 kaya + diğer collider kayıtları, yol sınırı, ayrık saf yarış Harita1 değişmez.
- Her 240 (en çok) Chromium rAF örneği ve 30-kare periyodunda p95/median kare süresi; renderer drawcall, triangle, geometry, texture sayaçları tutulur. **Bu örnekler gerçek GPU benchmark değildir.** `hardwareGpuFpsVerified=false` sabit.
- Test: `tests/map4-gfx10-profiles.cjs` ile üç profilde gerçek WebGL piksel buffer farkı, duman kotası, 5 yarışçı /8 avcı /36 collider /60sn /300sn /850m ve Harita1 render DPR reseti; mevcut GFX09 720p/1080p kamera, 12 sabit sanat kadrajı, offline GLB tek-HTML testleri korunur.

## Açık kalite kapıları

- [ ] Github Actions'ta üç profil+Map1/4+offline+baseline tüm testlerin sonuçları **gerçek PASS**.
- [ ] Low/Balanced ile savaş yoğunluğunda kullanıcı gözle kontrol; hedef okunabilirliği ve popping.
- [ ] Native masaüstü GPU'da 720p, 1080p sahne başına p95 FPS / frame time ve VRAM ölçümü. rAF, SwiftShader ve render sayacı bunu kapatmaz.
- [ ] 5dk boyunca birikmeyen kaynak kontrolü ve end-user GPU bellek raporu.
- [ ] Arşiv boyutu, başlangıç süresi ve offline açılış kabulü (CI bundle kanıtı olmadan tamam sayılmaz).
- [ ] Profesyonel 7–8/10 görsel sanat ve ana dala yığılmış PR zinciri sırayla birleştirme kabulü.

## Sonraki

CI hatası varsa önce NEXT10 profilleri düzeltilir. PASS sonrası NEXT10 kalan gerçek GPU/memory/kalite onayı, ardından NEXT11 screenshot ve yayıncı sunum kadrajı. Toplam 6 harita / ilk sunum 3 oynanabilir hedefi ayrıca NEXT12 altında.
