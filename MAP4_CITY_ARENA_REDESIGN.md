# Harita 4 — CITY01 Şehir Küresi / Avcı Savaşı

Tarih: 23 Kasım 2026
Geliştirme dalı: `codex/map4-city-sphere-fighter-scale-lock`
Üst taslak: UIUX-08, PR #138. Bu dal üstüne PR #139 açıldı; `main` birleştirilmedi.

## Kullanıcının istediği değişiklikler

1. **Avcı uçakları çok küçük ve aşırı uzaktan kilitlenip vuruluyor.** Savaşın yakın, taktiksel ve hedefi gerçekten seçmeyi gerektiren bir deneyim olması gerekiyor.
2. **İkinci aşamada ileri hareket durdurulmamalı.** Yaklaşık 60 saniyelik çatışma, şehrin içinde görünmez bir kürenin sınırlandırdığı üç boyutlu alanda gerçekleşmeli; gemi tek noktada sabit kalmamalı.

## CITY01 uygulaması

- `map4Advance` arena döneminde 12.500 metrede çakılı kalmaz. Oyuncu **W ileri, S geri**, fare/A–D yatay ve yön tuşlarıyla dikey manevra yapabilir. SHIFT arena boost; diğer aşamalarda önceki W/SHIFT boost ve S fren korunur. Boştayken hafif ileri seyir sürer. Var olan 300 saniyelik tüm görev üst limiti ve 60 saniyelik çatışma süresi değiştirilmez.
- **Üç boyutlu fizik sınırı:** `MAP4_CITY_ARENA` merkez ~13.250 rota birimi, yarıçap 1.850 birim. Oyuncu ve yarışçı gemileri yerel rota/x/y mesafesine göre küresel hacmin içinde tutulur; dünya içinde görünür neon küre çizilmez. Sınıra yaklaşınca HUD uyarısı vardır.
- **Gerçek şehir:** `SAVAŞ ŞEHRİ` adı, 36 yeni yapılı bina, yapı ile eşleştirilmiş swept AABB hasar/çarpışma hacimleri. Binanın arkasındaki avcılar otomatik nişana girmez; lazerler de şehir yapılarından geçip avcıyı vuramaz.
- **Uçak okunabilirliği:** Var olan 8 avcı uçağı aynı modellerle 1,7× fiziksel ölçekte; isabet yarıçapları da aynı oranda güncellenir. Önceki HP, +1/+3 avcı puanı ve hedef sayısı korunur.
- **Gerçek silah menzili:** Otomatik kilitlenmede en fazla **760 birim**; işaretleyici fareye en fazla 52 piksel yakın; fiziksel oyuncu lazeri yaklaşık **980 birimde** söner. Rakip yapay zekâsı da 3B mesafeyi ve bina görüş hattını denetler; mermi ömrü yaklaşık 0,50 saniye.
- **Bölümler arası devamlılık:** 60 saniye tamamlanınca 3. aşama açılır ve ileri hareketi durduran kilit kalkar. Oyuncu şehrin sınırından henüz çıkmadıysa şehir görselleri aniden yok edilmez; sanayiye gerçek uçuşla devam eder.
- Harita 1, mevcut UIUX-08 kart menüsü, gemi/ödül sanat varlıkları, yarış botları ve orijinal Map4'ün 4 safha puan/çıkış kuralları başka haritalarda değiştirilmez.

## Kanıt ve açık kabul kapıları

- `tests/map4-city01-sphere-hunters.cjs`: gerçek Chromium/WebGL, oyuncu W ileri ve S geri hareketi, 36 collider, 1,7x görsel ve isabet hacmi, 3B küre içi kısıtı, uzaktaki avcıların gerçek kilit reddi, 60 saniye sonrası 3. safha.
- Test **gerçek tarayıcı** kullanır, ama arena girişi ve bitiş zamanını kontrollü olarak hızlandırır. Tam dört aşama 4–5 dakika gerçek oynanış, uzun süreli doğal bot karşılaşması, hareketli engellerden kaçınma ve fiziksel GPU FPS için ayrı manuel kabul gerekir.
- `.github/workflows/map4-city01-gameplay-qa.yml`: yeni test + UIUX-03 HUD + eski Map1/Map4 smoke; son çalışma sonucu GitHub Actions üzerinden kontrol edilir.
- `.github/workflows/map4-city01-download.yml`: tek dosyalık çevrimdışı oynanabilir HTML; `main` sürümünü veya mevcut yayımlı HTML release'ini değiştirmez.
- **Açık tasarım değerlendirmesi:** kullanıcı şehir yapı yoğunluğunu, hedeflerin yakınlık hissini ve görünmez küre büyüklüğünü oyun üzerinde kabul etmeli. Bu görsel kalite ve denge onayı otomatik testlerle tamamlanmış sayılmaz.
