# Altı Haritalı Uzay Yarışı / Çatışma Oyunu

## Değişmeyen kararlar
- Toplam tam **6 oynanabilir harita** tamamlanacak. Tek haritayla yayıncı sunumu yapılmayacak.
- Haritalar **tek tek** geliştirilecek; sonraki haritanın mekanikleri erkenden aktif edilmeyecek.
- Tamamlanmış **Harita 1 kullanıcı tarafından 18 Ekim 2026'da onaylandı**. Onaylı kaynak commit: `7bc3b75905b369f417384136e5a384ecbb567dd3`. Güvenli kilometre taşı: `milestone/map1-approved-2026-10-18`.
- İş sırası: **Harita 4 → Harita 3 → Harita 2 → Harita 5 → Harita 6**.
- Başlangıç oyunu tek dosya `index.html` ve mevcut oyun sistemleri korunacak. Her yeni harita bağımsız geliştirilecek; Harita 1'in yarış mekaniği değiştirilmemeli.
- **Görev ayrımı:** Gemini sadece mevcut HTML prototipine küçük, sınırları belirlenmiş oyun-içi görevleri uygular; Gemini GitHub, commit, yedek, dokümantasyon veya proje planı yönetmez. ChatGPT GitHub sürüm kontrolü, entegrasyon, denetleme ve Gemini'ye küçük görev hazırlama işlerini üstlenir.

## Haritalar
| Harita | Mod | Kazanma koşulu | Durum |
|---|---|---|---|
| 1 | Saf hız yarışı | Aynı temel motor hızına sahip 6 yarışçı ile virajlı/engelli pistte ilk bitiren olma; rakiplere saldırma yok | **TAMAMLANDI — kullanıcı onaylı** |
| 4 | Gezegen geçişi / avcı puanı | Tek gezegende 4 bağlı bölge; gerçek bitiş ≤120s zorunlu. Varanlar arasında avcı puanı yüksek olan kazanır (normal 1, elit 3); eşitse daha hızlı varış. | **GEZEGEN SÜRÜMÜ P01–P06 KODLANDI / fiziki kestirme, çarpışma, devriye ve oyuncu onayı bekliyor** |
| 3 | Ana üs imhası | Ana çekirdeğe son ölümcül darbeyi indiren kazanır; yarışçılar birbirlerini vuramaz veya engelleyemez | Sırada |
| 2 | Tehlikeli yarış | Alternatif rota/kestirme, hareketli engel ve sınırlı yavaşlatmayla yarışı kazanma | Sırada |
| 5 | Ağır hedef avı | Süre içinde küçük avcılar ve ağır/dev hedefleri imha ederek en yüksek puanı toplama | Sırada |
| 6 | Hayatta kalma turnuvası | Önce silahsız sıralama turu, sıralamaya göre mesafeli başlangıç, her oyuncuya 3 can ve 10 turluk hayatta kalma yarışı | Sırada |

## Harita 4 için küçük ve doğrulanabilir görevler
1. **H4-01 (menü/ayırma):** Başlangıç ekranına Harita 1 veya Harita 4 seçimi için güvenli mod ayrımı; ilk haritanın mevcut davranışı ve sonucu birebir korunmalı. H4 kodunu henüz tamamlandı gibi sunma.
2. **H4-02 (hedef avcılar):** Var olan uçuş/nişan/atış kaynaklarıyla oyuncunun vurabildiği, yarışçı olmayan hedef avcılar; spawn/temizleme. Yarışçılara hasar yasağı mevcut H1'de devam etmeli.
3. **H4-03 (adil rekabet):** Oyuncu ve 5 rakip için izole avcı imha sayacı ve aynı hedefleme/puan kuralları; rakipler yalnız oyuncuya veya yalnız tek bir hedefe kitlenmemeli.
4. **H4-04 (zaman):** 120 saniye gerçek sınır, finish + öldürme indirimi, gerçek süre aşımının diskalifiye edilmesi, skor ve sıralama. İndirim saniyesi daha önce kesinleştirilmedi; sayısal değer tasarım onayına kadar açıkça parametre olmalı.
5. **H4-05 (kalite):** Restart, DNF, timer, hedef temizleme, H1/H4 mod geçişi ve performans; gerçek tarayıcı oynanış testi.

## Kabul kapıları
- Hiçbir harita `index.html` içinde çalışır/test edilir hale gelmeden TAMAMLANDI işaretlenmez.
- Her yeni harita, kendi kurallarına uygun oynanabilir mücadele, rakip yapay zekâsı, kazanma/kaybetme koşulu, yeniden başlatma, sonuç ekranı ve hata/performans kontrolüne sahip olmalı.
- Harita 1'e dönüşte AI-35 onaylı özelliklerin hiçbiri kaybolmamalı.
- Yayıncı için ilk oynanabilir üçlü: **Harita 1 + Harita 4 + Harita 3**; nihai hedef **6/6**.

## Harita 4 uygulama/kalite raporu (18.10.2026)
- H4-01/02/03/04/05 uygulandı; oyunun `index.html` menüsünden iki mod arasında seçim, yeniden başlatma ve sonuç ekranından harita seçimine dönüş çalışıyor.
- Harita 4: 6 pilot, 8 ortak avcı, gerçek mermi/isabet/imha, 120 saniye gerçek bitiş limiti, geçerli bitirişe avcı başına **geçici 2 saniye** net-zaman indirimi, DNF ve altı kişilik sonuç tablosu.
- **Playwright/Chromium tarayıcı testi başarılı:** 18 Ekim 2026, GitHub Actions run `39156789498`. Harita 4 açılış/8 avcı/5 AI, 120s DNF, 6 sonuç, restart, Harita 1'e geri dönüş, Map1 sonuç başlığı kontrol edildi; runtime JS hatası yok.
- Görsel/denge konusunda otomatik duman testi nihai kalite veya oyuncu onayı değildir. Oyuncu geri bildirimiyle H4 denge ve içerik cilası ayrıca yapılabilir.
- Otomatik test: `tests/map4-browser-smoke.cjs`; sonraki haritalar için `main` dalında da GitHub Actions regresyon kontrolü çalışır.
- Sonraki geliştirilecek harita: **Harita 3 — Ana üs imhası**. Harita 4 sistemlerini geri bozmadan ayrı geliştirme dalında ilerlet.

## Map4 yeni gezegen tasarımı
Bu turdaki fiziksel alan/saha çalışma notları ve sonraki görevlerin doğrusu `MAP4_PLANETARY_DESIGN.md` dosyasındadır. Önceki −2 saniye/avcı kuralı yeni tasarımda geçersizdir; artık puan önceliklidir. Dört low-poly bölgenin bulunması tam serbest dünya / üretim-kalitesi harita sanatı tamamlandı anlamına gelmez.
