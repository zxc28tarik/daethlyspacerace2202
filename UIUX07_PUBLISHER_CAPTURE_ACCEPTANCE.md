# UIUX-07 — Son Kadraj / Yayıncı Yakalama Kabul Protokolü
Tarih: 22.11.2026 · Kaynak: PR #136 üzerine yeni stacked draft.
Çalışma kolu: `codex/uiux-07-final-framing-publisher-qa`.

## UIUX-07 teslim kapsamı
- Altı harita menüsü: küçük/kapalı kartlarda metin kontrastı, 10–11px minimum kart yardımcı yazısı; kilitli modlar hâlâ `disabled` ve `aria-disabled=true`.
- DNF ve diğer sonuçlar: metrik etiketi, tablo yardımcı yazıları, durum açıklamaları daha okunur; skor algoritmaları değişmez.
- Menü rehberi, duraklatma ayarları, sonuç butonlarında belirgin klavye odak çerçevesi; mevcut native `details` ve Enter aktivasyonu korunur.
- 5 viewport: 1600×900, 1366×768, 1280×720, 760×720, 390×844.
- Her viewport 8 kanıt kadrajı (toplam **40 PNG**): 6 haritalı seçici, Harita 4 brifing/başlat, Harita 4 canlı WebGL, pause yüksek kontrast+büyük yazı, H4 gerçek DNF, H1 canlı WebGL, H1 gerçek pause, H1 gerçek DNF.
- Gerçek aksiyonlarla Enter harita seçimi/başlatma/yeniden başlatma/menü, klavye ile görev rehberi aç/kapat, ayarlar paneli, duraklat/devam; ekran kırpılma ve yatay taşma denetimi.
- `tests/uiux07-evidence/report.json` otomatik durum envanteri ve önceki UIUX01–06 + Map1/Map4 smoke regresyonu.

## Otomasyonun kanıtladığı / kanıtlamadığı
**Kanıt:** Chromium/SwiftShader üzerinde gerçek iki harita başlangıcı, HUD, pause, gerçek `endGame(false)` DNF, retry, menü; görünür metrik/buton kadrajı ve CSS okunabilirlik eşiği.

**Kanıt değil:** Harita 1 parkurunu veya Harita 4 dört bölümünü uçtan uca bitirmiş oyuncu kaydı; Harita 3 oynanışı; kullanıcının estetik onayı; native ekran kartında FPS. Önceki UIUX03 sentetik faz görüntüleri yalnız HUD düzen testidir, gerçek 2–4. bölüm uçuş görseli değildir.

## Yayıncı sunumu için koşullu 8–12 dakika dikey oynanış taslağı
- **0:00–0:40:** marka/başlangıç ekranı, altı görev kartı, iki oynanabilir görev.
- **0:40–4:20:** Harita 1 gemi/koridor akışı, mor orijinal ödül kutuları, hız ve rakip sırası, bitiş/ara kesit.
- **4:20–8:50:** Harita 4 vadi → 60sn arena → sanayi → yörünge; gerçek kayıtta bu dört bölümün tamamı doğrulanmalı.
- **8:50–11:20:** üçüncü oynanabilir harita, daha sonra üretilecek görev; şu an **yok**, yerine sahte oynanış konulmaz.
- **11:20–12:00:** oyun sonucu, tekrar oynama, yapım/gelecek haritalar.
Süreler yalnız hedef kadraj aralıklarıdır, gerçek görev süresini değiştirmez. Üçüncü harita gelmeden bu plan `publisher-ready` olarak işaretlenmeyecek. Hedef üçüncü oynanabilir görev için Harita 3'ün üs imha tasarımı değerlendirilebilir; önceki kurallarını uygulamadan yeni görev kuralı uydurulmaz.

## Sanatsal kabul listesi
İnsan incelemesi: menu/kilitli kartların hiyerarşisi, 720p renk/kontrast, HUD'un sahneyi örtmemesi, 390px mobile metin kırılması, Map4 sağ/orta/sol ölçü dengesi, sonuç CTA hiyerarşisi; 40 PNG üzerinden kayda geçir.

## GitHub teslim sınırı
Bu PR taslak; tüm önceki PR'lar stacked, `main` merge edilmez. Kapsam yalnız görünüm ve kalite testi; gemiler, radar/AI, mükâfat kutuları, çekirdek oynanış, fizik, skor ve görev sınırları aynen kalır. Native GPU FPS çalışması kullanıcı isteği gereği daha sonraya bırakıldı.
