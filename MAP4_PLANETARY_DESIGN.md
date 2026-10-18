# Harita 4 — Gezegen Geçiş Operasyonu (yeni tasarım, 18 Ekim 2026)

## Kesinleşen kullanıcı hedefi
Harita 1'den **fiziksel olarak farklı**, tek çizgiye hapsedilmeyen ve gezegenin bir bölümünden öbür bölümüne **zamanında ulaşma zorunluluğu** olan bir savaş yarışı. Pilot hızlı yol seçimi ile yol boyunca mümkün olduğunca çok düşman avcısı öldürme arasında karar vermeli. Dört bölge birbirine bağlı **tek dünya**; dört bağımsız harita/arena değil.

## 18 Ekim 2026 — Kullanıcının yeni ve öncelikli dört aşama kararı
Yeni tasarım **tek bir 4–5 dakikalık göreve** dönüştürüldü. Eski 120 saniyelik yarış sınırı **300 saniye** yapıldı. Kullanıcının bölümlendirmesi tüm önceki 120 saniye açıklamalarının yerine geçer.

1. **Kayalık vadi başlangıcı**: Yaklaşık 40 saniyelik doğal geçiş. Süre sabit değil; ortalama oyuncu hızına göre kalibre edilmiş başlangıç parkuru. 0–12.500 ilerleme.
2. **Açık savaş arenası**: Birinci bölümün sonunda **60 saniyelik zorunlu avcı çatışması**. İleri ilerleme kilitli; oyuncu yatay/dikey manevra yapıp avcı öldürüyor. AI ve oyuncu aynı alanda kalıyor.
3. **Endüstriyel geçiş**: Arenadan çıkışta uçuş serbest kalıyor; düşman avı sürerken bina/kule geometrisiyle gerçek çarpışma kontrolü kalkan ve hız kaybına neden oluyor. 12.500–34.000.
4. **Askerî üs / uzaya çıkış**: Son ~16.000 yol boyunca savaş devam ediyor. Hedefe ulaşmanın yanında **en az 850 yerel irtifa** gereklidir; alçaktan bitişe gelen gemi geçerli bitirmiş sayılmaz. Beş AI da yüksekliğe tırmanıyor.

### Süre ve skor
- İkinci aşama kesin 60 saniye; diğer aşamaların hedef süreleri ortalama yaklaşık **40 + 60 + 85 + 95 = 280 saniye**. Gerçek süre hız ve savaş kararlarıyla değişir.
- Üst sınır **300 saniye**. Yetişemeyen pilot DNF.
- Zamanında yörünge kapısına ulaşanlar arasında **avcı puanı** yüksek olan kazanır (normal +1, elit +3); beraberlikte daha hızlı varış.
- Dört ayrı harita değil, **aynı gezegende bağlantılı dört çevre**. Kullanıcı onayı ve denge testi hâlâ gerekli.

### Uygulanan ve bekleyenler
- [x] Dört farklı çevre görünümü, aşamalı ileri hızlar, süre limiti, arena kilidi ve geri açılması
- [x] Arenada sürekli hareket eden hedef avcılar, gerçek atış isabeti ve rakip avcı skoru
- [x] Bina çarpışması/hasar ve kaçınma gerekliliği
- [x] Yörüngeye yükselme gerekliliği ve HUD yönlendirmesi
- [x] Chromium tarayıcı regresyonları: dört aşama, arena, bina, yörünge, DNF, yeniden başlatma, Harita 1
- [ ] Oyuncunun binalar arasındaki gerçek tercihlerini artıran dallanan yollar / yükseklik kestirmeleri
- [ ] Çevre modellerinin ve atmosferin daha fazla cilalanması; kullanıcı onayı

## Emniyet ve kapsam
- Onaylı Harita 1'e özgü uçuş sınırı/asteroitler/enkaz geçitleri/bitirme mantığı korunur; H4 kendi görünümü ve kurallarıyla çalışır.
- H4 sahnesi düşük-poligon **kodla oluşturulmuş placeholder görsellerdir**. Dört farklı atmosfer sunar, bitmiş çevre sanatı değildir.
- GitHub ve dosya sürüm yönetimini ChatGPT yapar, Gemini yalnızca sınırlı oyun içi görevler alır.
