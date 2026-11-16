# Harita 4 — NEXT-06 / LM10–LM12 Son Bölge Üç Büyük 3D Mimari

**Tarih:** 16 Kasım 2026. **Bu iş:** Kullanıcının tek `.` komutuna karşılık NEXT-06. **Geliştirme dalı:** `codex/map4-next06-final-sector-hero-art`, tabanı [GFX-06D-C PR #37](https://github.com/zxc28tarik/daethlyspacerace2202/pull/37); üstte yeni bağımlı draft PR. **Ana dal ve daha önce verilen altı fabrika kararları korunur.**

## Ne gerçekten yapıldı?

Oyun motorunun kendi Three.js sahnesinde, Harita 4'ün son bölgesinde daha önce W01/VQ02 ile temsil edilen üç farklı **görsel-only** önemli noktaya büyük ölçekli 3D mimari katmanı geldi.

| ID | İlerleme | Yeni tasarım ve okunurluk |
|---|---:|---|
| LM-10 — Hudut karakolu | 36.200 | Kademeli zırhlı komuta kalesi, iki yüksek bastion gözetleme kulesi, hizmet rampartları, açık kontrol giriş kemeri, uzak savunma taretleri, radar/ikaz direkleri ve uzun savunma duvarları. Genel kimlik: alçak-geniş **askeri tahkimat** |
| LM-11 — Askerî uzay limanı | 42.600 | İki gerçek boşluklu **ExtrudeGeometry** hangar kemeri, üç geniş iniş platformu ve çevresel ışık halkası, hangar servis vinci, taksi yolu, yüksek hava trafik kulesi/radar ve park edilmiş keşif gemisi silüeti. GFX01 mevcut `patrol_fighter` **GLB modelinin bağımsız yüklemesi korunur**. Genel kimlik: uzun-yatay hava/uzay altyapısı |
| LM-12 — Yörünge fırlatma kompleksi | 48.300 | Uzun ana roket, konik burun, iki yardımcı booster, iki büyük **boşluklu** servis gantrisi, 5 seviyeli transfer katı, yüksekliği azalan halkalı servis izleri, bağlantı pilonları, kontrol anteni/ikaz işaretleri. Genel kimlik: yüksek ve dikey **roket + asansör kulesi** |

Yeni varlıklar `h4BuildGfx06eFinalHero(group,plan)` fonksiyonunda **yalnız Harita 4 bölge 4'teki** üç tasarım için kurulur. Önceki VQ02 signature ve W01 basit tekrar dekorları yalnız bu üç landmark grubunda **gizlenir**, silinmez; böylece rollback referansları kalır. GFX01 devriye gemisi GLB'sine dokunulmaz. Yeni geometri/malzeme katalogları ortak; yeni modellerin gövdeleri bir defa sahne kurulurken yaratılır, restart boyunca aynı kalır. 7.8 km uzaktaki küçük ışık ve ring detayları geçici gizlenir; 6.95 km'ye dönünce geri açılır. Ana yapı silüetleri mesafeyle gizlenmez (yalnız landmark bölgesel görüş yönetimi uygulanır).

### Sözleşme / gerçek fizik

- Yeni modellerin her biri `visualOnly` / `h4Gfx06e` olup **sıfır yeni `h4Collider`** ve sıfır puan/yarış hedefidir.
- Büyük tesis kütleleri merkezi gemi yükseliş hattından dış yan panorama tarafına kaydırıldı: hudut merkezi yaklaşık **side -1.910**, liman **+1.760**, fırlatma **-1.720**. Böylece 850 ve üzeri irtifalı gerçek oyuncu koridoruna sahte engel eklenmez.
- 6 W03 canyon ve 36 W05 industrial fizik hacmi, 34 fiziksel W02 sanayi gövdesi, skor/+1/+3, +%12 sanayi rota bonusu, 5 rakip ve 8 avcı, 60sn arena ve 300sn görev kapısı aynen kalır.
- Harita 1 yarış/geometri/HUD ve GFX01 model yükleme kodu değiştirilmez.
- İlerleme noktaları **36.200 / 42.600 / 48.300** ve 12 landmark sayısı değişmedi. Stage 4 başlangıç 34.000, bitiş 50.000; 850 irtifa şartı sürer.
- Oyunun tek HTML offline derleme ve mevcut cache GLB gereksinimleri aynı.

## Test ve görsel kabul

- `tests/map4-browser-smoke.cjs`: üç farklı büyük model grubunu, isim/id/progress, yeni gerçek açık `ExtrudeGeometry` giriş/hangar/gantry sayılarını, kapalı eski modelleri, korunan imported patrol fighter GLB isteğini, teknik/mesafe görünürlüğünü, 6 canyon + 36 industry collider ve eski dünya çarpışmalarını denetler.
- `tests/map4-art-baseline.cjs`: eski **12 sabit perspektifi değiştirmeden**, LM10/LM11/LM12 için her birinde aynı gerçek oyunun aynı kamera ve ışığıyla **önce/sonra** toplam 6 screenshot; ayrıca oyuncu `laneX=0` / `laneY=1050` yükseliş hattından ayrı bir sahne ekran görüntüsü ve renderer metrikleri.
- `.github/workflows/map-browser-smoke.yml`: yeni branch için Ubuntu24.04 Chromium tarayıcı+offline paket+sanat kareleri, indirilebilir oynanabilir tek HTML artifact'ı.
- **JS parse testi dışında GitHub Actions CI sonucunu teyit etmeden PASS yazılmayacak**; test başarısızsa oyun fiziğiyle oynanmadan düzeltilir.
- 7–8/10 yayıncı görsel kalite hedefi, artist-made GLB/LODs, yakın tekstür detayları, ışık/post ve gerçek desktop GPU FPS/VRAM hâlâ ayrı açık kabul kapılarıdır. İlk büyük silüetin oluşturulması nihai sanat onayı değildir.

## 16 Kasım — Gerçek CI ve görsel A/B kanıtı

- **Final çalışan kod commit'i** [d67b54a](https://github.com/zxc28tarik/daethlyspacerace2202/commit/d67b54a34616fff046498550dad3bb634f61b89b), [GitHub Actions #43925320985](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43925320985): **SUCCESS**. Çevrimdışı tek HTML, GLB cache, iki haritanın tarayıcı regresyonu, 12 sabit orijinal galeri karesi, 3 yeni LM10–12 sabit kamera önce/sonra çifti ve 850 üzeri yükseliş hattı kanıtı.
- **Başlangıç hatası çözüldü:** ilk iki CI çalışması yeni `H4_GFX06E_MAT` katalogunda henüz oluşturulmamış `h4Gfx06mSteelMap / h4Gfx06dMaps` sabitlerine erişildiği için başlatılamıyordu. [2725c42](https://github.com/zxc28tarik/daethlyspacerace2202/commit/2725c4212799741241c9cb3a612e3e8cc6e085fc) ile dosyada daha önce var olan `h4SurfaceMaps` ve `h4MicroMaps` ortak metal haritalarına geçilerek **GLB yükleme+startup PASS** sağlandı.
- **Yanlış kabul önermesi düzeltildi:** görsel screenshot testinin “yeni model mutlaka daha fazla drawcall/üçgen harcamalı” varsayımı yanlıştı. LM12'de yeni modelin **71→65 drawcall'a düştüğü** görüldü. [d67b54a](https://github.com/zxc28tarik/daethlyspacerace2202/commit/d67b54a34616fff046498550dad3bb634f61b89b) ile **aynı kamerada gerçek PNG piksel farkı, işaretli görünür Mesh varlığı, collider ve açılış doğrulaması** esas oldu; kaynak maliyetler ayrıca raporlanıyor.
- **Üç nokta gerçek renderer ölçümleri** (aynı kamera, önce → sonra; kaynak yalnız Chromium/SwiftShader):
  - LM10 Hudut: **126→127 drawcall**, **29.068→30.860 üçgen**, 27 yeni art Mesh.
  - LM11 Liman: **123→129 drawcall**, **8.968→13.722 üçgen**, 35 yeni art Mesh.
  - LM12 Fırlatma: **71→65 drawcall**, **8.414→13.378 üçgen**, 33 yeni art Mesh.
- Yükseliş denetimi: oyuncu `routeProgress=47.900 / laneX=0 / laneY=1.050`, 36 W05 fizik collider değişmeden, son landmark ve açık merkezi koridor. Bu bir performans veya uçuş oynanışı tamamlanmış kalite sertifikası değildir.
- `metrics.json` içinde SwiftShader median ~**1,1 ms**, p95 ~**2,1 ms** (18 yazılım render örneklemesi). Bu gerçek masaüstü ekran kartı FPS değeri olarak yorumlanamaz.
- **Görsel inceleme:** üç yeni silüet eskilerinden daha okunur ama yüzeylerde ve çevrede **28 tekrarlı, basit final-sektör arka plan objesi, sert gökyüzü bantları, düz zemin ve sınırlı gölge/kontrast** hâlâ bariz. 7–8/10 hedefi ve son artist-made GLB/PBR/LOD **kabul edilmedi**.
- [Tam screenshot/JSON artifact](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43925320985/artifacts/14255697420); [çevrimdışı oynanabilir tek HTML](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43925320985/artifacts/14255304244), **5.451.677 bayt**. Bu sürüm **taslak PR #38**'dedir, `main` değildir.

## Sonraki adım

CI testleri ve aynı kamera eski/yeni karelerin incelemesi ile kapı tamamlanır. Geometriler çok bloklu görünürse revize edilir; GPU sürüş testleri ayrı ele alınır. Sonraki tek `.` komutu takip dosyasındaki açık sonraki alt adıma ilerlemelidir: **GFX-07 sinematik ışık/atmosfer ve final-sektör gölge/derinlik geliştirmesi**; ancak NEXT-06 hatası kalırsa önce düzelt. Önceki altı fabrika ve decal'lerde kısmen açık estetik/FPS kalemleri unutulmayacak.
