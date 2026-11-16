# Geliştirme kontrol formu — hiçbir adım kaybolmasın

> Ana kayıt: [Kararlar ve gelişim durumu](../ROADMAP_DECISIONS_PROGRESS.md) • [Grafik master planı](../MAP4_GRAPHICS_MASTERPLAN_VQ04_PLUS.md)
>
> Bu şablon yeni açılan PR'lar içindir. Var olan PR #31'in açıklaması kendiliğinden güncellenmez.

## Görev
- Takip kimliği (NEXT-xx / GFX-xx / IN-xx / LM-xx):
- Başlangıç durumu:
- Bu PR sonunda hedeflenen durum:
- Kapsam (hangi harita/bölge, hangi modeller):
- Kapsam dışı / korunan kararlar:
- Bu PR ile **yapılmayan** işler (sonraki görev ID'siyle):

## Kontrol listesi
- [ ] Değişiklik gerçek oyun koduna / asset'e işlendi (yalnız plan/doküman değil).
- [ ] 4 evre / 60 sn arena kilidi / 300 sn sınır / 850 irtifa / +1/+3 puan korunuyor (etkilenmiyorsa N/A gerekçesi var).
- [ ] 5 rakip + 8 avcı / 6 kaya + 36 sanayi collider / gerçek isabet korunuyor (etkilenmiyorsa N/A).
- [ ] Harita 1'in oyun, kamera, HUD ve görüntüsü değişmedi.
- [ ] Restart/sahne değişimi kaynak sızıntısı, tekrar üretilen GPU asset ve görünmez çarpışma yaratmıyor.
- [ ] İlgili otomatik test çalıştırıldı: komut, çalışma kaydı ve sonuç bağlantısı eklendi.
- [ ] A/B aynı kamera oyun içi görüntüsü eklendi (görsel değişiklikte zorunlu).
- [ ] Draw call/üçgen/bellek ve gerçek GPU FPS ölçümü kaydedildi veya açık eksik olarak işaretlendi.
- [ ] Tek HTML release/offline build etkisi değerlendirildi.
- [ ] İlgili sanat varlıklarının özgünlük/lisans/LOD/materyal durumu açık.
- [ ] "Kod PASS" ile "görsel 8/10" karıştırılmadı; kullanıcı görsel onayı ayrı kapı.

## Kanıt
- Kaynak commit(ler):
- CI linki ve sonucu:
- Aynı kare önce/sonra:
- FPS/donanım:
- Görsel onay:
- Riskler:

## Birleşme sonrası kayıt
- [ ] [ROADMAP_DECISIONS_PROGRESS.md](../ROADMAP_DECISIONS_PROGRESS.md) güncellendi: ID, durum, commit/PR, test, görsel/FPS ve açık eksikler.
- [ ] Sıradaki NEXT-ID işaretlendi. Önceki açık görevler silinmedi.

**Not:** Her kutuyu işaretlemek mecburi başarı iddiası değildir; yapılamayan kabul, gerekçesiyle açık tutulur.