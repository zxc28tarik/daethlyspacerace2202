# Harita 4 — Gezegen Geçiş Operasyonu (yeni tasarım, 18 Ekim 2026)

## Kesinleşen kullanıcı hedefi
Harita 1'den **fiziksel olarak farklı**, tek çizgiye hapsedilmeyen ve gezegenin bir bölümünden öbür bölümüne **zamanında ulaşma zorunluluğu** olan bir savaş yarışı. Pilot hızlı yol seçimi ile yol boyunca mümkün olduğunca çok düşman avcısı öldürme arasında karar vermeli. Dört bölge birbirine bağlı **tek dünya**; dört bağımsız harita/arena değil.

## Kazanma kuralı
- 120 saniye **gerçek** zaman sınırı, hedefe varamayan DNF.
- Geçerli ulaşanlar arasında **en yüksek avcı puanı** kazanır.
- Eşit puanda **gerçek bitiş süresi daha kısa** olan kazanır.
- Normal avcı: 1 puan. Elit avcı: 3 puan. Ağır hedef bu haritada şimdilik yok; Harita 5 ile karışmasın.
- Altı pilot aynı havuzdaki avcıları gerçek lazer isabetleriyle öldürür; rakipler birbirine ateş etmez.
- Önceki **öldürme başına −2 saniye** kuralı, bu yeni tasarım için bırakıldı. Zaman sadece eleme / beraberlik ölçütü; skor avcı puanından gelir.

## Tek dünya içindeki dört bölge
1. **Kayalık vadiler (0–12,5 km):** vadiler, yüksek kaya konileri, alçak irtifa kayalık geçişleri, başlangıç. Beklenen oyun kararı: biraz dolambaçlı avcı cepleri ya da hızlı çıkış.
2. **Açık savaş ovası (12,5–25 km):** geniş uçuş sahası, düşmüş araçlar ve dağınık enkaz. Beklenen oyun kararı: fırsat hedefleri arasında avcı avı ya da bölgeyi kısa sürede geçme.
3. **Endüstri bölgesi (25–37,5 km):** kuleler, fabrika blokları ve farklı yüksekliklerde geçişler. Beklenen oyun kararı: güvenli yüksek uçuş ya da riskli alt geçit/elit avcı.
4. **Askerî üs ve tahliye (37,5–50 km):** askerî tahkimat, üs yaklaşması ve zorunlu bitiş. Beklenen oyun kararı: son çatışmalar / süreye yetişme.

## Pilot stratejileri
- Sprinter: hız öncelikli, avcı kovalamayı az tercih eder.
- Hunter: avcıları aktif kovalar, daha sık ateşler.
- Balanced: ortalama rota/savaş.
- Elite: elit avcılara pozitif hedef önceliği.
- Cautious: riskten daha çok kaçınır, daha az yanal sapma.

## Uygulama aşamaları
- [x] **P01:** Dört bölgeye ait tek scene içinde ayrı 3D low-poly saha geometrisi, gezegensel arka plan/sis, HUD bölge/mesafe.
- [x] **P02:** Harita 4'te koridor neon görsellerini ve uzay objelerini saklama; Harita 1'e dönünce tekrar açma.
- [x] **P03:** Harita 4 uçuş yarıçapını ~1340'a çıkarma; Harita 1'in ~360 değerini koruma.
- [x] **P04:** 120 sn koşullu avcı puanı (normal 1, elit 3), süre indirimi yerine puan/süre eşitlik bozucu.
- [x] **P05:** H4'e özgü beş ayrı AI avlama stratejisi ve hedef avına sapma kararı.
- [x] **P06:** Playwright/Chromium smoke: bölgeler/önceki koridorun gizlenmesi/puan/kazanma ekranı/restart/H1 regresyonu.
- [ ] **P07:** Gerçek **alternatif rota/topolojik kestirme** ve oyuncuya seçilebilen farklı yörüngeler; mevcut uygulama geniş, 3D ve tek sürekli ileri güzergâhlı bir alan; tam 360 derece açık dünya değildir.
- [ ] **P08:** Gezegen kaya/kule/tesis gövdelerine geometrileriyle uyumlu fiziksel çarpışma, zarar ve güvenli geçiş. İlk görsel geometriler henüz dekoratiftir.
- [ ] **P09:** Bölgelere özgü düşman devriyeleri, avcı yoğunluğu ve oyuncu/AI karar dengesinin saha testi.
- [ ] **P10:** Gezegensel çevre görsel cilası ve gerçek oyuncu onayı.

## Emniyet ve kapsam
- Onaylı Harita 1'e özgü uçuş sınırı/asteroitler/enkaz geçitleri/bitirme mantığı korunur; H4 kendi görünümü ve kurallarıyla çalışır.
- H4 sahnesi düşük-poligon **kodla oluşturulmuş placeholder görsellerdir**. Dört farklı atmosfer sunar, bitmiş çevre sanatı değildir.
- GitHub ve dosya sürüm yönetimini ChatGPT yapar, Gemini yalnızca sınırlı oyun içi görevler alır.
