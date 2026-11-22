# DEATHLY SPACE RACE — UI/UX YENİLEME MASTER PLANI
Tarih: 22 Kasım 2026 · UIUX-01 başlangıcı
Kaynak: PR #130 / `codex/map4-warfront-material-hierarchy-22m`.
İş kolu: `codex/uiux-01-screen-hud-system` (stacked draft, main'e birleştirilmez).

## Ürün hedefi
Hız yarışı + gezegensel hava savaşı için profesyonel, tek bakışta anlaşılır, oynanışı örtmeyen, erişilebilir oyun arayüzü. Mevcut HTML oyun motoru, fizik, kamera, Harita 1/4 grafikleri, puan, çarpışma, rakip AI ve kontrol eşlemeleri KORUNACAK. Oyun başlığında kullanılan marka UI geçici çalışma adıdır; nihai ticari isim ayrıca seçilecektir.

## Sorun envanteri
- İlk ekranda uzun teknik paragraflar; ana seçim ve başlatma CTA'sı görsel açıdan ayrışmıyor.
- HUD aynı anda puan, combo, kalkan, güç, rota, timer, skor, bonus, hız, leaderboard ve ipucunu gösteriyor; yarış yolu örtülebilir.
- Harita 1 ve 4 aynı veri panelini paylaşırken göreve özgü öncelik hiyerarşisi net değil.
- Sağ/sol alt paneller ile radar dar ekranlarda çakışma riski taşıyor; eski CSS çok küçük fontlar (9px).
- Pause ekranında Harita 1 kutu/lazer açıklaması Harita 4 için de görünüyor.
- Sonuç ekranı bilgi açısından yeterli ama tek bakışta statü ve yeniden oynama akışı zayıf.
- Ürün kimliği için eski Starblade/Tekken referansları menü başlığında görünüyor.

## Sanat sistemi
- Koyu lacivert/yumuşak kömür ana katmanlar, doygunluğu kontrollü cam paneller; her yere bloom eklenmeyecek.
- İkincil okunurluk rengi soğuk cyan; enerji yeşili; tehlike amber; hasar/kaybetme kırmızı.
- İki tipografik kullanım: büyük başlıklar, sayısal veriler için monospaced yoğun okunurluk.
- Minimum 12px desktop oynanış HUD, kritik rakamlar daha büyük; 900p/720p ve mobil kısıtlı viewport için ayrı ölçüler.
- 3 bilgi seviyesi: (a) görev/tehlike, (b) yarış metrikleri ve enerji, (c) isteğe bağlı detay/öğretici.
- Oyun görüntüsünün merkezini boş tut; harita arası panellerin görünürlük kurallarını koru.

## Uygulama paketleri
| Paket | Kapsam | Kabul | Durum |
| --- | --- | --- | --- |
| UIUX-01 | Ana menü, harita kartları, kontrol metin hiyerarşisi, duraklatma ve sonuç ekranı için ortak stil; HUD okunurluğu, Map4 özel yerleşim | Kaybolan ID/düğme yok; Map1/Map4 açılış, pause, restart, sonuç, harita seçimi; 1600x900/1366x768/1280x720 taşma kontrolü | UYGULANIYOR |
| UIUX-02 | Harita 1 yarış HUD'u: hız/sıra/mesafe; item/boost/kalkan birincil, combo/telemetri ikincil | Mevcut yarış datası, sayaç, etkileşim korunur | BEKLİYOR |
| UIUX-03 | Harita 4 dört faza göre değişen görev HUD'u: vadi rota, arena avcı skoru, endüstri engel+rota, yörünge irtifa | 60 sn arena, 300 sn DNF, 850 irtifa ile birebir veri, görünürlük regresyonu | BEKLİYOR |
| UIUX-04 | Görev brifingi: 10 saniyede okunur hedef/denetim, gerektiğinde ayrıntılı rehber; ilk tur onboarding | İlk başlayan oyuncu kuralları anlayabilir, kontrol atamalarına dokunulmaz | BEKLİYOR |
| UIUX-05 | Pause seçenekleri: ses, görüntü profilleri, erişilebilirlik, kontroller; gerçek state ve kalıcı tercih | Hiçbir buton sahte değil, pause state bozulmaz | BEKLİYOR |
| UIUX-06 | Skor sonuç ekranı: Map1 yarış split/gap ve Map4 avcı skoruna özgü hiyerarşi; 6 haritalı seçici 1+4 açık, diğerleri kilitli | DNF ve retry/selector tüm durumlarda çalışır | BEKLİYOR |
| UIUX-07 | Ekran kadrajı, çözünürlük/ölçek, kontrast, klavye ve runtime regresyonu; 8–12 dakikalık yayıncı capture akışı | Gerçek Chrome WebGL screenshot + kritik fonksiyon testi, insan onayı ve native GPU FPS ayrı | BEKLİYOR |

## UIUX-01 uygulama sınırı
HTML/CSS değişiklikleri mevcut DOM id'lerini, oyunun arayüzü beslediği iç span'leri, map seçim düğmelerini, pause/resume ve restart handler'larını silmeyecek. İlk paket yalnız arayüz görünümü ve doğru bilgi bağlamını düzeltecek; Map1 onaylı 3D sahne ve tüm grafikler aynen kalacak. Şüpheli büyük oynanış değişikliği yapılmayacak.

## Ölçüm ve kalite kapıları
1. En az 1600×900, 1366×768, 1280×720 ve 390×844 screenshot; başlangıç, H1 HUD, H4 HUD, pause, sonuç.
2. DOM akış: H1/H4 seç, başlat, duraklat-devam et, sonuç, yeniden başlat ve menüye dön.
3. Her oynanabilir harita için hedef ve bilgi okunurluğu; kritik statusların hiçbiri `display:none` nedeniyle kaybolmuyor.
4. Tarayıcı konsol hatası ve HTML JS parse hatası sıfır; orijinal Map1/Map4 smoke/regresyon korunur.
5. Otomatik PASS, sanatsal beğeni ve gerçek ekran kartında FPS onayı yerine geçmez. UIUX-01 kabulü ekran görüntüsüyle ayrıca yapılacak.

## Merge / çalışma kuralları
- Her paket bir stacked DRAFT PR; PR #130'u bozma, main'i otomatik birleştirme.
- Harita 1 sahne kodu ve ödül kutuları kesinlikle değişmez.
- Sonuçları tamamlandı ilan etmeden önce CI sonucunu kaydet; ispat yoksa DOĞRULAMA durumunda bırak.
