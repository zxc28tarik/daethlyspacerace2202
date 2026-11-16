# MAP4 NEXT09 / GFX09 — Kamera, HUD, post-processing

Tarih: 2026-11-16. **Tek noktalık geliştirme adımı** — NEXT08 / [PR #40](https://github.com/zxc28tarik/daethlyspacerace2202/pull/40) üzerine yığılmıştır; alt PR zinciri değişmez.

## Oyuna eklenenler

1. **Harita 4 TURRET/CHASE:** GFX09'a özel FOV aralığı, yumuşak CHASE hız/mesafe ayrımı ve sanayi bölgesinde gerçek fiziksel collider AABB'lerine göre kameranın gemiye yaklaşması. Sadece görsel kamera konumu değişir, oyuncu pozisyonu/fizik ve yeni collider değişmez.
2. **Renk ve ekran kompozisyonu:** ekstra WebGL drawcall ve Composer gerektirmeyen, merkezin temiz kaldığı düşük opaklıklı çevresel kadraj/renk gradyanı; hız durumuyla sınırlı değişim. Ağır motion blur, DOF ve bloom yok; avcı/hedef kontrastı öncelikli. Var olan ACES tonemapping ve GFX07 atmosferi korunur.
3. **HUD:** 1280×720 ve 1920×1080 için Harita 4'e özel kompakt üst-paneller, saha/avcı sayacı ve kamera/yarış bilgisi; Harita1 CSS ve kamera/ışık profili korunur.
4. **Geliştirici foto modu:** sadece `?gfx09debug=1` ile açılan oturumda `F8` HUD gizleme/geri getirme. Kullanıcı sürümünde kapalı; herhangi bir sonuç/puan etkisi yok.
5. **QA:** `tests/map4-gfx09-camera-hud.cjs` ile her iki kamera × iki ekran boyutu gerçek Chromium screenshot, ekranda taşmama/çakışmama, fiziksel kutu kamera kısa mesafesi ve Map1 geri-dönüş; mevcut offline, Map1/4 smoke ve 12 landmark art baseline sürer.

## Sınırlamalar ve kabul kapıları

- Bu çalışma **profesyonel sanat kalitesini 7–8/10 olarak kabul etmez**. GFX-02/03/05/06 önceki görsel borçları sürer.
- Sanayi kamerası fiziksel rota-uzayı AABB temasını yumuşatır; bütün görsel-only sahneler için kusursuz occlusion çözümü iddiası yok.
- CI, 720p/1080p karelerin gerçek görsel incelemesi ve cihaz üstünde GPU p95 kare süresi **ayrı kanıtlardır**. SwiftShader FPS gerçek PC GPU FPS değildir.
- Harita 1 saf yarış/5 pilot; Harita 4 dört faz, 60sn arena, 300sn toplam, 850 irtifa, 5 rakip+8 avcı, gerçek +1/+3 hit, 6 canyon+36 W05 fizik ve %12/%18 hız rotaları kesinlikle değişmez.
- Kullanıcı estetik değerlendirmesi ve ana dala sırayla PR merge **açık**.

## Sonraki

CI hatası varsa **önce NEXT09 düzeltmesi**. Teknik ve ekran QA sonrası NEXT10/GFX10: High/Balanced/Low profilleri, gerçek GPU/VRAM bütçesi ve offline release optimizasyonu.
