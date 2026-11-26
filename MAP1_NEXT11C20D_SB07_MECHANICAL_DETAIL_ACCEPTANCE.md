# NEXT11C20D — SB-07 Zenit makine işçiliği ve kanat kontrol yüzeyleri

**19 Kasım 2026.** SB-07 kullanıcının daha önce onayladığı özgün görsel silueti KORUNARAK oyun içi 3D modelin detay işçiliği arttırıldı.

## Korunan SB-07 tasarımı ve oyun sözleşmesi
- Harita 1 saf yarış. Çok sivri burun, geniş düz süpürülmüş iki ana kanat, **iki dikey dış kanat ucu**, beyaz/gümüş + kırmızı yarış çizgisi, koyu mavi kokpit ve çift büyük plazma motoru aynen.
- Önce reddedilen kıvrımlı kanat, R-01, aşırı kalın/aşırı ince yeni uçak denemeleri GERİ GELMEZ.
- Kamera normal #1 Cinematic Chase / boostta #2'ye yaklaşma, rota, rakip AI, hız ve enerji bozulmaz. Harita 4 B-04 Bastion 249 parça ve 6 batch değişmez.
- Üçüncü taraf GLB/model/texture, yeni silah, yeni oyuncu hitbox, yeni fizik collider yok. Tüm yeni objeler var olan 7 *visualOnly/noCollider* geometri batch'inde birleşir.

## İşlenen yeni sanat detayları
| Detay | Gerçek oyun kodunda |
|---|---|
| İç kanat kontrol yüzeyleri | İki kanatta toplam **4 extrude panel**, ayrı menteşe çizgileri ve kırmızı servis işareti |
| Kanat alt taşıyıcıları | Sağ/sol kanat altında **4 ince metal taşıyıcı**; kanat dış konturu aynı |
| Motor gövdesi | **10 çift servis ızgarası** (her motor üzerinde beş kademeli metal ve oyuk yüzey) |
| Çift motor iç türbinleri | Her motorda **10 radial stator kanadı**, merkez hub ve iç muhafaza; toplam **20** |
| Motor üst termal bağlantılar | Merkez soğutma bölgesine giden **2 geometrik termal manifold** |
| Malzeme ve görsel motor | Önceki C20B 128² PBR mikro doku, C20C clearcoat ve hız/boost ışık geçişi korunur |

## QA / onay
- [x] Gerçek `index.html` güncellendi; yeni parçalar 7 SB-07 materyal grubunun içine katıldı.
- [x] Tam HTML içindeki asıl JS bloğu statik olarak parse edildi.
- [x] Gerçek Chromium WebGL testine **20 motor statoru ve detay kimliği** kontrolleri eklendi.
- [x] Ayrı hızlı CI ve tam Map1/4 smoke workflow dal tetiklemesi kaydedildi.
- [ ] Yeni commit'e ait Github Actions **gerçek PASS** sonucu ve artifakt ekranları teyit edildi.
- [ ] Fiziksel GPU 720/1080p performans, 300 s insan oynanış, kullanıcının gerçek gemi estetik onayı.
- [ ] Kullanıcı açık merge izni. **Taslak PR / NO MERGE**.

## Sonraki sanat adımı
NEXT11C20E: Testten gelen gerçek normal/boost ve 3/4 kadrajlarını dikkatle inceleyip mikrodetayın okunabilirliğini değerlendirmek. Ortaya çıkan art sorunlarını hedefli düzeltmek, rastgele yeni büyük şekiller eklememek.

İlgili önceki çalışma: [C20C](MAP1_NEXT11C20C_SB07_ZENIT_BOOST_VISUAL_QA.md).
