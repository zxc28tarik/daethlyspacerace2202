# NEXT11C20 — Harita 1: Kullanıcının onayladığı SB-07 “Zenit” oyuncu gemisi

**Tarih:** 18 Kasım 2026 · **Kullanıcı kararı:** Kullanıcı tarafından bizzat gönderilen “Harita 1 — Yarış Gemisi, Konsept SB-07 ‘Zenit’” panosu **referans tasarım olarak onaylandı** (“bu iyidir”, ardından “oyuna adapte et işte”). Görseldeki hazır render gerçek 3D oyun modeli değildir; burada kendi Three.js geometrimizle **kaynak görseli temel alan özgün bir oyun içi uyarlama** üretilmiştir. Bu aşama yalnız Harita 1 oyuncusunun görsel modelini değiştirir.

## Tasarımın kaynak görüntüdeki ayırt edici özellikleri

- Uzun sivri/çok köşeli ön burun, dengeli ve geniş orta gövde; hafif gövde üstünde koyu şeffaf mavi-siyah kokpit.
- Geniş, geriye süpürülmüş ve **düz ana kanat panelleri**; **sol ve sağ dış kanat ucunda yükselen uzun köşeli dikey stabilizatör**. Bu SB-07 referansının belirgin silüetidir; daha önceki R-02/R-03 kıvrımlı kanat denemeleri **kullanılmıyor**.
- İki detaylı silindirik arka itici, katmanlı metal ısı halkaları, turuncu mekanik ızgaralar ve **mavi plazma itici çekirdeği**.
- Beyaz/gümüş ana zırh kaplaması, kırmızı yarış şeritleri, içerde koyu metal, duman renkli kokpit ve turuncu motor aksesuarları. Erken-2000'ler arcade bilimkurgu estetiğine yakın, fakat ticari model/gemi/mesh kopyası olmadan.
- **Sadece yarış:** yeni silah, top/taret, hasar, hedef kilidi, sınıf yeteneği veya AI eklenmedi; Harita 1'in yarış odağı korunuyor.

## Uygulama

- Yeni `h4Ship20ZenitBuild()` sistemi `index.html` dosyasında gerçek 3D şekillerden gemiyi tek sefer oluşturur. İstenmeyen önceki **R-01 artık üretilmiyor**; `h4Ship19Race` değişkeni geriye dönük diğer test/görünürlük sistemleriyle uyum için yeni **SB-07** nesnesine bağlanır.
- Fuselage: çok kademeli değişken kesitli polygon geometry, ince burun. Ana kanatlar: yeni 3D extrude swept wing. Dikey iki dış fin: yükseltilmiş, ayrı 3D extrude geometri. Ayrıntılı çift motor, yan vent panelleri, motor halka/ızgara/kanat şeritleri ve kokpit farklı 3D parçalardan.
- **7 birleştirilmiş materyal/draw batch**: gümüş seramik, alt metal, kırmızı yarış kaplama, karanlık mekanik, kokpit camı, turuncu motor, mavi plazma. Eski Harita 4 **B-04 Bastion 6 batch/249 parça** değişmez; birlikte 13 batch. Yeni varlık için üçüncü taraf GLB/doku/ışık gerekmiyor.
- Kamera kullanıcının daha önce seçtiği gibi **normal #1 Cinematic Chase / boost anında #2 Tight Chase'e yaklaşma**; C kamera değiştirme devam. Oyuncu fiziği/çarpışma gövdesi veya hız değerleri değişmez.

## Korumalar ve QA

- **Kesin değişmeyecekler:** Harita 1 yarış; Harita 4 5 rakip, 8 avcı, 60 s arena / 300 s limit / 850 irtifa, +%18 kanyon/+%12 sanayi bonus, 6 kanyon+36 sanayi+200 fabrika collider, 24 nav işareti, 34 fiziksel W02, mevcut C18 motor/silah/kalkan enerji yönetimi, Harita 4 oyuncusu B-04.
- `tests/map1-next11c20-sb07-zenit.cjs`: gerçek Chromium/WebGL'de SB-07 kimliği, eski R-01'in hiç oluşmaması, geometri boyutları, sol/sağ dikey uç stabilizatörlerinin yükseltilmiş köşe noktaları, çift arka itici, renkler, 7 batch, normal/boost ve 3/4 görsel PNG ve Map4 korumalarını test eder.
- Eski `tests/map4-next11c19-two-player-ships.cjs` iki-gemi testindeki Map1 kimlik ve batch sayısı yeni 7+6 düzenine uyarlandı; Harita 4 diğer bütün sözleşmeleri aynen.
- [x] NEXT11C20 gerçek Chromium/WebGL hızlı PASS: [run #44303505125](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44303505125).
- [ ] Tam Map1/Map4 regresyon PASS — sonuç kontrol edilmeli.
- [ ] Kullanıcının **gerçek render edilmiş yeni oyun modelini** beğenme/onay; konsepti onaylamak kaynak görselin birebir eşleştiği anlamına gelmez.
- [ ] Native GPU 720p/1080p FPS/p95, kesintisiz insan sürüş testi, son paket QA.

**GitHub entegrasyon kararı:** PR Draft, **MERGE YOK**; ana dal ve diğer birikmiş tasarım kararları değiştirilmez. Görsel onayı kullanıcıya ait.


## Gerçek ilk oyun içi QA sonucu (18 Kasım 2026)

- [SB-07 Zenit gerçek Chromium/WebGL hızlı run #44303505125](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44303505125) **9/9 başarı**. Oyun üretim dosyasında eski **R-01 instance sayısı: 0**, yeni SB-07 **143 özgün geometri parçası/6.584 üçgen/7 materyal batch**.
- 3D geometri ölçüleri yaklaşık **15,64 × 4,67 × 15,27 oyun birimi**. İki yükselen dış stabilizatörün her biri **68** geometri tepe noktasıyla kanıtlandı; iki bağımsız motorun arka plazma yüzeyinde sağ/sol başına **870** tepe noktası örneği doğrulandı.
- Harita 1 gerçek kamera mesafesi normal **18,9568**, boost **13,2517**. Görüş açısı normal **72,694°**, boost **82,916°**: #1'den #2'ye dinamik kamera hedefi çalışıyor. Üç test görüntüsü (normal, boost, 3/4 render) [Actions artefaktı #14427041853](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44303505125/artifacts/14427041853).
- Harita4 B-04 **249 parça/6 batch**, 5 rakip/8 avcı, **6+36+200** fiziki collider, 24 rota işareti, 34 W02, 60/300/850 ve %18/%12 aynı. Yeni SB-07 modelinde silah montajı **0**.
- **Estetik sınır:** Bu model görsel referansı baz alan **ilk gerçek Three.js geometri uyarlamasıdır**. Konsept panosundaki sinematik materyal/çizim ayrıntısı henüz birebir eşlenmedi; gerçek oyun ekranında kullanıcı değerlendirmesi ve PBR kalite geliştirmesi açık.
- [Tam regresyon #44303505052](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44303505052) son kontrolde **in_progress**; tamamlanmadan tam PASS sayılmaz. Draft/no merge.
