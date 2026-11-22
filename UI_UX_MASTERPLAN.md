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
| UIUX-01 | Ana menü, harita kartları, kontrol metin hiyerarşisi, duraklatma ve sonuç ekranı için ortak stil; HUD okunurluğu, Map4 özel yerleşim | Oynanabilir iki harita, pause, sonuç ve mod geçişi; 1600×900, 1366×768, 390×844 + ekran görüntüleri | **YAPILDI-PR / CI PASS; insan estetik onayı AÇIK** |
| UIUX-02 | Harita 1 yarış HUD'u: hız/sıra/mesafe; item/boost/kalkan birincil, combo/telemetri ikincil | Dört viewport canlı WebGL, ödül HUD, Map4 dönüş; önceki UIUX-01 ve Map1/Map4 smoke | **YAPILDI-PR / TAM CI PASS / insan estetik ve native GPU FPS açık** |
| UIUX-03 | Harita 4 dört faza göre değişen görev HUD'u: vadi rota, arena avcı skoru, endüstri engel+rota, yörünge irtifa | Kaynağı mevcut görev kuralları, dört faz/4 viewport WebGL, öncül HUD ve gameplay regresyonu | **YAPILDI-PR / TAM CI PASS; estetik ve native GPU FPS açık** |
| UIUX-04 | Görev brifingi: 10 saniyede okunur hedef/denetim, gerektiğinde ayrıntılı rehber; ilk tur onboarding | 2 görev brifingi, açılır tüm rehber, oyun saatiyle mini ipuçları, 4 viewport WebGL ve geri uyumluluk | **YAPILDI-PR / TAM CI PASS; insan estetik ve GPU FPS açık** |
| UIUX-05 | Pause seçenekleri: ses, görüntü profilleri, erişilebilirlik, kontroller; gerçek state ve kalıcı tercih | Ana ses GainNode, grafik profili, HUD yazısı, kontrast, hareket, kalıcılık ve sıfırlama; 4 viewport Chromium+oynanış regresyonu | **YAPILDI-PR / TAM CI PASS; insan estetik ve native GPU FPS açık** |
| UIUX-06 | Harita 1 yarış süresi/leader farkı, Harita 4 avcı skoru/gerçek varış sonuç hiyerarşisi ve 6 kartlı görev seçici | 2 oynanabilir + 4 kilitli slot, DNF/valid/late/win ve retry/menu, dört Chromium viewport + önceki regresyon | **YAPILDI-PR / TAM CI PASS; insan estetik ve native GPU FPS açık** |
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

## UIUX-01 kabul kaydı — 22.11.2026
- İş kolu `codex/uiux-01-screen-hud-system`, [taslak PR #131](https://github.com/zxc28tarik/daethlyspacerace2202/pull/131); stacked base PR #130; `main` birleştirilmedi.
- [GitHub Actions run #45035030729](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45035030729): **SUCCESS**. JavaScript parse, yeni `tests/uiux01-screen-regression.cjs`, eski `tests/map4-browser-smoke.cjs` tamamen geçti.
- UI testinde 3 çözünürlük × 7 kadraj = **21 gerçek Chromium/WebGL PNG** üretildi; artefakt [uiux01-screen-evidence](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45035030729/artifacts/14759151824). Grafik iyileştirmelerinin sanatsal onayı ayrıca açık.
- 1600×900 / 1366×768 / 390×844 menu/H1-H4 HUD/pause/sonuç, ekranda menü içi taşma, harita seçimi, restart ve sonuç ekranı doğrulandı.
- Testin ilk çalışmasında kök `scrollWidth` eski `#shield-ring` dekorunun bilerek 4vw ekran dışına taşmasını kapsıyordu. HUD FX korunarak, test yalnız gerçek menü yüzeyinin taşmasına odaklandı.
- Mevcut bu paket 1280×720 ekran kaydını içermez; bu çözünürlük ve gerçek GPU FPS/UI sanatsal onayı sonraki UIUX-07 kabulünde yapılacak.


## UIUX-02 uygulama kaydı — 22.11.2026
- [Taslak PR #132](https://github.com/zxc28tarik/daethlyspacerace2202/pull/132); stacked base PR #131; `main` değişmedi.
- `index.html`: Map1 için ayrı top-left yarış göstergesi (sıra, kalan mesafe, süre), ayrı hız, aktif ödül/boost durumu, alt kalkan/enerji/score/lazer kartları. Sürekli tekrarlanan kontroller/radar/combo verileri ikincil konuma alındı. Orijinal DOM ID, oyun fonksiyonları ve Map4 oynanış kuralları korunur.
- Görsel durum için yalnız `dataset.uiActive` bayrakları eklendi; skor, çarpışma, gemi, AI, ödül miktarı veya hız hesabına dokunulmadı.
- Dört gerçek Chromium/WebGL ekranı: 1600×900, 1366×768, 1280×720, 390×844. İlk UIUX-02 viewport ve Map4 geçiş testleri `run #45036308389` içinde PASS.
- Otomatik iş akışı: [UIUX-02 ekran ve oynanış kabulü](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45036308389); eski UIUX-01 ekran ve bütün Map1/4 smoke testleri de PASS. Native GPU FPS ve kullanıcı estetik onayı **açık**.
- **Sonraki iş:** UIUX-03 — Harita 4'te vadi, arena, sanayi ve yörünge HUD içeriğini faza göre değiştiren bilgi önceliklendirmesi. Başlıca görev süreleri, 60 saniyelik arena kilidi, 300 sn toplam limit ve en az 850 irtifa fizik sistemi aynen korunacak.

### UIUX-02 final kabul denetimi
- [Run #45036308389](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45036308389) **SUCCESS**: syntax, dört viewport live Map1 HUD/aktif ödül/Map4 geçişi, UIUX-01 menü/pause/sonuç ve Map1/Map4 gameplay smoke adımları tamamı başarılı.
- [UIUX02 Chromium/WebGL ekran görüntüsü arşivi](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45036308389/artifacts/14760420068) (Map1 ve Map4; eski UIUX01 ekranları dahil).
- İki görünür kalite kapısı **açık**: insan tarafından estetik/kadraj onayı ve gerçek GPU donanımında FPS kontrolü. `main` birleştirilmedi.


## UIUX-03 uygulama kaydı — 22.11.2026
- [Taslak PR #133](https://github.com/zxc28tarik/daethlyspacerace2202/pull/133), stacked base #132; `main` birleştirilmedi.
- Harita 4'ün 4 aşamalı görev çubuğu, sahne aşaması ve görev ilerleme oranı; vadi rota/çıkış mesafesi, arena süresi ve avcı skoru, sanayi rota/çıkış mesafesi, yörünge gerçek irtifa/850m hedefi ve son çıkış mesafesi.
- Mevcut `planetary-zone-hud` ve `hunter-competition-hud` içine yeni yardımcı göstergeler; ilk 25 saniyelik değil, **son 25 saniyelik toplam süre** ve görev sınırı risk uyarıları. Ayrı Map4 düzen kuralları; Map1 HUD değişmedi.
- `updateMap4MissionHUD`: yalnızca DOM / `body.dataset.uiPhase` / salt okunur debug telemetrisi. 60 saniye, 300 saniye ve 850 metre rakamları oyun sabitlerinden okunur; fizik, hız, skor, avcı kuralları, harita grafikleri veya çarpışma koduna dokunulmadı.
- Test: [UIUX-03 GitHub Actions](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45037998839), `tests/uiux03-map4-phase-hud.cjs` ile 4 viewport/4 faz; **faz 2–4 HUD durumları test içinde sentetik oluşturulur ve gerçek oynanış görüntüsü oldukları iddia edilmez**.
- Kontrol kapısı: [Run #45038335370](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45038335370) **SUCCESS**, sentetik dört faz UI ve önceki bütün oyun smoke testleri PASS; insan estetik onayı ve native GPU FPS açık.


## UIUX-04 uygulama kaydı — 22.11.2026
- [Taslak PR #134](https://github.com/zxc28tarik/daethlyspacerace2202/pull/134), stacked base PR #133; `main` birleştirilmedi.
- İki görev için **10 saniyelik brifing**: Map1 50 km / 5 rakip / mor kutu; Map4 60sn arena / 300sn limit / 850m yükseliş ve oynanışa uygun kontrol etiketleri.
- Önceki tüm kural metni korunur; `map1-instructions` / `map4-instructions` yerli `<details>` açılır içerik (ID ve seçim davranışı korunur), odak klavyeyle mümkündür. Tek satır temel kontroller ve kısa görev hedefi varsayılan görünüm.
- Oyunun ilk turunda **üç adet üç saniyelik ipucu**, sonra Map4 arena/sanayi/yörüngeye ilk geçişte 4,5 saniyelik kısa bilgi; `P/H` kontrollerine yönlendirme. Rehber kapatılabilir, pause esnasında gizlenir, oyun zamanı üzerinden işlenir, oyun mekaniğine veya tuş eşlemelerine dokunmaz.
- Ekran tasarımı dört çözünürlük ve 720p menü için sıkıştırıldı; varsayılan uzun rehberler gizlenebilir. Model, puanlama, çarpışma, kontroller, grafik ve arena süreleri aynı.
- Kanıt: [UIUX-04 Chromium/WebGL kabul iş akışı](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45039216610) (**SUCCESS, tüm adımlar PASS**): 4 viewport, iki brifing, native details, ilk uçuş 3 adım, Map4 faz bilgileri, pause/resume, restart, dismiss ve UIUX-01..03 + gameplay smoke.
- Açık kalite kapıları: gerçek oyuncu tarafından anlaşılabilirlik, görsel estetik ve native GPU FPS.


### UIUX-04 final otomatik kabul — 22.11.2026
- [GitHub Actions run #45039381784](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45039381784) **SUCCESS**; HTML inline JS parse, 4 viewport canlı UIUX04 brifing + ilk uçuş/onboarding, önceki UIUX-03 dört etap, UIUX-02 Harita 1 HUD, UIUX-01 menü/pause/sonuç ve eski Map1/4 tam smoke regresyonları **tamamı PASS**.
- [Gerçek Chromium/WebGL ekran görüntüsü arşivi](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45039381784/artifacts/14761228232), UIUX04 + UIUX03 kadrajları (menü kısa brifing, açılmış ayrıntı, ilk uçuş, pause, etap ipuçları).
- İlk testte pause → resume sonrasında `state.paused` değişimini hemen okuyup sonraki çizim karesini beklemeyen test kontrolü düzeltilmiştir; oyun mantığına/tuşlara müdahale olmadan son test çalışması PASS.
- Map4 arena/sanayi/yörünge **ipucu gösterimi** ve önceki HUD testlerinde sentetik faz durumu kullanıldı; bütün 4 etap baştan sona oynanmış gibi gösterilmez.
- **Açık:** insan sanatsal/kullanılabilirlik onayı ve fiziksel GPU üzerinde FPS. `main` birleştirilmedi. Sonraki hedef **UIUX-05**: çalışan ses/grafik/erişilebilirlik ayarları.


## UIUX-05 uygulama kaydı — 22.11.2026
- [Taslak PR #135](https://github.com/zxc28tarik/daethlyspacerace2202/pull/135), önceki PR #134 temel alınarak açıldı. `main` merge edilmedi.
- Duraklatma içine klavye/erişilebilirlik destekli yerli `details` ayar paneli eklendi: master ses %0–100, Harita 4 HIGH/BALANCED/LOW kalite, HUD yazı normal/büyük, yüksek kontrast, arayüz geçiş hareketlerini azalt ve varsayılana sıfırla.
- **Ses gerçek:** Mevcut WebAudio osilatör, efekt gain ve buffer ses yolları ortak `masterGain` çıkışına bağlandı; tek cihaz çıkışıyla motor/laser/hit/explosion/EMP topluca ses ayarına uyar. Osilatör sayısı/savaş fiziği değişmez.
- **Grafik gerçek:** Aynı `h4Gfx10SetProfile` fonksiyonu, pause kalite menüsü, ana menü seçicisi ve F7 arasında senkron. Yalnız Harita 4 render budget değiştirilir; Harita 1 performans/oynanış tercihleri korunur.
- `localStorage` içinde sürümlü, tür doğrulamalı 5 tercih; bozuk/depolama kapalı durumlarında güvenli varsayılanlar veya geçici ayar bildirimi; tercihler yenilemede geri yüklenir. Ses cihazına erişim yalnız oyun başlatıldığında, kullanıcı etkileşimiyle sağlanır.
- **Görsel:** Büyük HUD yazısı yalnız önemli metinler, yüksek kontrast yalnız HUD/önbrifing panelleri, azaltılmış hareket yalnız UI animasyonlarına uygulanır. Dünya, kamera, kontroller ve çarpışmalar etkilenmez.
- **Test:** [GitHub Actions UIUX05 gerçek Chromium/WebGL](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45044155836) 1600×900 / 1366×768 / 1280×720 / 390×844; tüm ayarlar+storage reload+reset+F7+Map1 izolasyonu+pause/resume ve önceki UIUX01–04/Map1/Map4 gameplay smoke (nihai durum izleniyor).
- **Kalite kapıları:** otomatik CI tam PASS; kullanıcı görsel/kullanılabilirlik onayı ve native GPU FPS ayrı.


### UIUX-05 final otomatik kabul — 22.11.2026
- [GitHub Actions run #45044155836](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45044155836) **SUCCESS**: canlı Chromium/WebGL UIUX-05 (1600×900, 1366×768, 1280×720, 390×844), UIUX-04/03/02/01 regresyonları, orijinal Map1/Map4 tarayıcı smoke ve ekran arşivi; **bütün adımlar PASS**.
- Dört viewport test çıktısı: ses master bus `audioBus=true`, kalıcı depolama/yeniden yükleme `persistence=true`, LOW Harita 4 piksel ölçeği `0.67`, `pauseHeld=true`, `reset=true`, `f7Sync=true`, `map1Safe=true` — dört çözünürlükte ayrı ayrı doğrulandı.
- [UIUX05 gerçek ekran görüntüleri](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45044155836/artifacts/14763486457): varsayılan ve değiştirilmiş duraklatma ayarları, sıfırlama ve önceki UIUX-04 kadrajları.
- **Önemli kapsam:** Testte Chrome/SwiftShader WebGL kullanıldı; gerçek GPU FPS/performans ve insan estetik kabulü yerine geçmez. Mevcut oyun dosyası değiştirilmiş ama taslak PR'dadır; `main` birleştirilmedi.
- **Sonraki paket UIUX-06:** mod bazlı yarış/avcı sonuç ekranları, 6 haritalı seçici (1 ve 4 oynanabilir; diğerleri açıkça kilitli).


## UIUX-06 uygulama kaydı — 22.11.2026
- [Taslak PR #136](https://github.com/zxc28tarik/daethlyspacerace2202/pull/136), stacked base PR #135; ana dala birleştirme yok.
- **Altı kartlı gerçek seçici:** Harita 1 ve 4 mevcut `MAP_AVAILABLE` ile oynanabilir; 2, 3, 5, 6 yerli HTML `disabled` ve `aria-disabled` ile kilitli. Harita 3'te önce üsse ulaşma/üs yıkma, Harita 6'da 10 tur/3 can niyeti doğru; Harita 2/5 için kanıtlanmamış görev tanımı yok.
- **Harita 1 sonuçları:** gerçek sıra/DNF, bitiş süresi, geçerli lider farkı, toplanan kutu ve önceki sektör/laser/çarpışma verilerinin ayrı hiyerarşisi.
- **Harita 4 sonuçları:** geçerli sıra/DNF, imha puanı, avcı imha sayısı, gerçekten yetişilmiş/geç varış ayrımı, mevcut normal+elit skor tablosu ve gerçek süre; 300 sn yarış geçerliliği ve hesaplama algoritmasına dokunulmadı.
- **Korunan arayüz:** sonuç ekranının orijinal DOM kimlikleri, tekrar oyna/harita seçimi tuşları, map seçimi, oyun fizik/AI/3D dünya/gemi ödülleri ve ayar paneli aynı.
- **Düzen:** masaüstü 3×2, orta/mobil 2 sütunlu altı kart; sonuç üst bilgisi/4 metrik/telemetri/6 pilot ve sabit alt CTA; mobil taşma ve görünürlük testi.
- **Doğrulama:** [UIUX06 GitHub Actions](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45047917896), gerçek Chromium/WebGL dört çözünürlükte iki görev başlatılır. Win/finish/DNF/late sonuç vakaları **sentetik oyun sonuç durumu** üzerinden test edilir; tam parkurun gerçek bitişini ispatlamaz. Önceki UIUX05/04/03/02/01 ve Map1/Map4 gameplay smoke ayrıca çalıştırılır.
- **Açık:** insan estetik onayı ve native GPU FPS. Otomatik CI tam PASS. İlk yayıncı pitch için en az 3 oynanabilir harita hedefi hâlâ açık: mevcut oynanabilir 2 haritadır.


### UIUX-06 final otomatik kabul — 22.11.2026
- [GitHub Actions run #45047917896](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45047917896) **SUCCESS**: JS parse, yeni UIUX06 altı harita + Map1/Map4 DNF/finisher/win/late acceptance, UIUX05 ayarlar, UIUX04 onboarding, UIUX03 faz HUD, UIUX02 yarış HUD, UIUX01 menü/pause/sonuç ve orijinal Map1+Map4 oynanış smoke; **tüm adımlar PASS**.
- [Gerçek Chromium/WebGL ekran görüntüleri](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/45047917896/artifacts/14765201522): 6 haritalı seçici, 2 oynanabilir / 4 kilitli görünümü; Map1 DNF / 2. sıra / galibiyet; Map4 DNF / galibiyet / 300sn geç varış; eski ayarlar. **Sonuç testleri sentetik skor/zaman durumlarıyla uygulanır**.
- Dört viewport ayrı log: desktop 1600×900, laptop 1280×720, compact 760×720, mobile 390×844: hepsinde kilitli=4, oynanabilir=2, sonuç yatay taşma=0, menü taşma=0. Tarayıcıda gerçek başlangıç ve navigation kullanıldı.
- **Yayım sınırı:** draft PR #136, `main` merge edilmedi; insan görsel kabulü + fiziksel GPU FPS ve ilk yayıncı için asgari 3 oynanabilir harita şartı açık.
- Sonraki adım **UIUX-07**: son kadraj, kontrast/ölçek, klavye erişilebilirliği, screenshot ve publisher capture QA; sahici 8–12 dk dikey demo için gereken en az 3 oynanabilir harita ayrı içerik iş kalemidir.
