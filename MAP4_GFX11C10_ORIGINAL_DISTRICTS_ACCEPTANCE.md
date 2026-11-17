# NEXT-11C10 — Özgün üç sanayi bölgesi ve görsel intihal önleme sözleşmesi

**Durum:** Oynanabilir Harita 4 HTML koduna üç tasarlanmış sanayi aile ve altı görsel-only tesis eklendi; tam CI ve Chromium A/B sonucu henüz doğrulanıyor. Bu aşama PR #54 üzerindeki yeni stacked taslak PR'dır; merge yok.

## Özgünlük ve referans kullanımı — kullanıcı kararı

Kullanıcı, farklı oyunlardan, 3D model pazarlarından ve endüstriyel kavramlardan **kalite düzeyi/atmosfer/teknik çözümler için ilham alınabileceğini** onayladı. Ancak **aşırı yakın, birebir veya çalıntı tasarım İSTEMİYOR**.

Uygulama kuralı:

- Üçüncü taraf sahne paketleri, Unreal proje dosyaları, mesh/GLB/FBX modelleri, dokular veya hazır materyalleri **indirme/oyuna aktarma/koddan çıkarıp kopyalama yok**. Özellikle kullanıcının konuştuğu CGTrader örneğini kesinlikle oyun içi varlık olarak kullanma.
- Referansın tanınabilir bina düzenini, karakteristik ana silüetini, özel dekorunu, renk kompozisyonunu veya yerleşimini yeniden oluşturma yok; ayırt edici kombinasyonu taklit etme.
- **Özgün görünüm için** önce sanayi tesisinin işlevini belirle, sonra rota güvenliğine uygun kendine ait ölçü/asimetri/negatif boşluk/işlevsel makine çeşitliliği tasarla; geometrileri game-specific matematik/primitive ile üret.
- Kullanıcı tarafından onaylanmadıkça dış paket lisansı gerektiren varlık kullanılmaz. Kodda herhangi bir dış hazır model veya harici ağ doku bağımlılığı **eklenmedi**.
- Gözle estetik kalite (7–8/10 hedefi) ve özgünlük ilkesi ayrı kabuller: CI PASS ne kalite notu ne de telif yönünden resmî hukuki incelemedir.

## C10 gerçek oyun geliştirmesi

Three.js kaynak kodunda, `h4Gfx11c10DistrictGeometry(family)` üç matematiksel özgün model üretir (yeni GLB/asset fetch yok):

1. **Açık ısı geri kazanım tesisi:** asimetrik siklon kolonlar, altı bölmeli ısı eşanjörü, açık boru ve servis rafı; kapalı duvar değil fonksiyonel negatif alan.
2. **Yük aktarma sahası:** eğimli kaldırma kirişi, askı mekanizması, beş bağımsız malzeme kaseti, servis rayı.
3. **Kademeli geri kazanım tesisi:** pres/ayıklama modülleri, hava emiş bacası, çıkış şutları ve farklı yükseklikte mekanik üniteler.

- İki farklı instancelı 3 family = **6 farklı konum, 3 InstancedMesh drawcall**; mevcut 256² NEXT-11C5 PBR metal atlası kullanılır. Özgün adlar, farklı yan/ileri konumlar, yinelenen tek tip binalardan ayrışır.
- **İkinci kompozisyon turu C10-B:** İlk gerçek 07/08/09 ekran A/B testinde 07 **%1,76**, 08 **%0,60**, 09 **%9,42** değişen piksel alanı görüldü (ortalama RGB >1/255; **kalite puanı değil**). 07/08'de büyük açık zemin hâlâ sanayi bağlamını taşımadığı için, `bd016e3` ile **tamamen özgün altı görsel-only servis yolu/çalışma zemin şeridi** eklendi. Yol yüzeyi yerel matematiksel düzleme oturur, düzensiz aşınmış asfalt kenarları ve çalışma apronlarından oluşur, **1 ek Mesh drawcall**, texture/collider/light yok. C10 böylece **3 tesis + 1 servis zemin drawcall** olur. Güncel WebGL testi `074625d` bu yolların sayı/tri/asset/fizik bütçesini de doğrulamak üzere genişletildi.
- Konumlar yalnız Harita 4 sanayi 14.000–34.000 progres aralığında, üç gerçek kamera kadrajının 07 (17.200), 08 (23.800), 09 (31.600) ilerisinde, rota yan ekseninde en az 1.100 birim uzak. Fiziksel W05 şeritleri ve marker geometrileri **değişmez**.
- `h4Gfx11c10SetLook` ile gerçek A/B; High/Balanced phase3 etkin, Low ve tüm diğer fazlar kapalı. Bir kez build; animasyon sırasında yeni mesh/texture/ışık üretilmez.
- **Sözleşme:** C3–C9 eski sahneler, W05 BEACON/HIGH_MARKER 24 işaretin kimliği, 6 kanyon/36 sanayi/200 bina collider, 5 rakip, 8 avcı, arena 60s, toplam 300s, orbit 850m, Map 1 yarış-only, toplam 6 harita ve yayıncı ilk pitch 3 oynanabilir harita korunur.

## Test ve kabul

- [x] `index.html` oyun kaynağı yazıldı, JavaScript parser PASS.
- [x] Gerçek 1600×900 Chromium/WebGL 07/08/09 sabit-kamera eski/yeni testi eklendi; fiziksel mesh/navigasyon/çizim üçgen ve GPU kaynak sayısı kontrolü yazıldı.
- [x] C4–C9 tarihsel A/B'lerin C10 yeni görünümünden bağımsız çalışması sağlandı.
- [x] Hızlı screenshot ve tam browser smoke CI iş akışı eklendi.
- [ ] Güncel C10-B HEAD hızlı Chromium/WebGL PASS, servis yolu içeren gerçek ekran PNG artifact ve sanatsal inceleme. İlk C10-A [#44076017106 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44076017106), fakat son servis yolunu kapsamıyor; güncel [#44076681861](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44076681861) açık.
- [ ] Güncel tam Map1/Map4 CI ve tarihsel grafik/oyun regresyonları PASS.
- [ ] 720/1080p native GPU FPS/p95/VRAM, 5dk gerçek pilot uçuşu.
- [ ] 07/08/09 hareketli kamera/estetik kalite ve **7–8/10 kullanıcı onayı**.
- [ ] Yayıncı için 3/6 oynanabilir harita ve merge kullanıcı açık onayı.

**Önceki C9 tam CI [#44073322882 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44073322882) — 32 başarılı workflow adımı.** Yeni C10 otomatik olarak PASS sayılmaz.


## İlk gerçek görüntü sonrası not

- C10-A gerçek görüntüler [#44076017106 PASS](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44076017106). 07 ve 08'de özgün fabrika kompozisyonları uzakta kaldığından değişim **%1,76 / %0,60**, 09'da **%9,42**. 7–8/10 kullanıcı estetik onayı **VERİLMEDİ**.
- C10-B `bd016e3` ve test `074625d`: Bölge 07/08/09 zemininin mevcut sanayi mimarisiyle bağlantısı için altı ayrı **çarpışmasız** açık bakım yolu ve platform apronu. Aynı kumaş gibi sonsuz döşeme yerine düzensiz ve kısmi aşınmış kenarlar. 1 statik BufferGeometry, shader/dış varlık/yeni atlas yok.
- Bu tasarım bir ticari 3D sahne referansından model çıkarmıyor veya belli bir örneğin yerleşimini yeniden üretmiyor; işlevsel sanayi altyapısını oyun rotasına **kendi geometrisiyle** bağlıyor. Özellikle CGTrader modelini/assets asla aktarılmadı.
- Yeni sonuçlar doğrulanmadan C10-B PASS veya 7–8/10 estetik tamamlandı yazılmayacak. Kullanıcı son sözü ve bütün merge kapıları açık.
