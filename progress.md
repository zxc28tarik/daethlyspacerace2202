Original prompt: TAMAM, PLANI UYGULAMAYA BAŞLA. ÖNCE HARİTA 2’NİN 35–45 KM ARASINI YAP. BİNALAR ROTAYI BELİRLESİN, İKİ GEÇİDİ DE OYUNCU VE BOTLAR GERÇEKTEN KULLANABİLSİN. OYUN İÇİNDE TEST ET.

35–45 km giriş kesiminde beş yapının açıklıkları fiziksel duvarları, oyuncu rotasını ve bot yaklaşma hedeflerini belirliyor. 40,1 km basınç aktarım tesisinde alçak boru ve dış servis geçidi bulunuyor.

Chromium/WebGL ile iki oyuncu koşusu, beş botun her iki kola dağılımı, merkez kolona çarpışma ve ayrı bir 175 km bot yarışı doğrulandı. Bölüm regresyonu için `node tests/map2-transfer-district.cjs` kullanılabilir. Test, isteğe bağlı `MAP2_GAME_URL` ile çevrimdışı paketi açar. Şehir yerleşiminin oyuncu tarafından görsel değerlendirmesi için giriş karesi ve tek dosyalık oyun dist klasöründe.


45–96,25 km uzantısında taş ocağı, yük terminali, soğutma tesisi, dövmehane, savaklar ve enerji tesisi boyunca 25 geçiş bulunuyor. 52,55 / 60,30 / 77,20 / 89,10 km noktalarında iki rota var. Yük terminalinde alçak ve yüksek yolları yükleme platformu ayırıyor.

Çevrimdışı pakette iki fare kontrollü oyuncu sürüşü ve beş botla tüm geçişler doğrulandı. Dört ayrımın iki kolu da kullanıldı. İki sürüşte geçit kaçırma ve bariyer teması sıfırdı. Ayrı tam yarışta beş bot da 175 km'yi bitirdi. Tekrar testi: node tests/map2-industrial-works.cjs. Altı bölgenin yarış kamerası görüntüleri dist/Harita2_Teknik_Bolum_45_96.png dosyasında.

96,25–113,75 km hız bölümünde cepheler geri çekiliyor. Kullanılabilir yatay genişlik 2,3 km içinde yüzde 50 artıyor, son 3,5 km içinde eski genişliğe dönüyor. Apron kenarında camgöbeği ışıklar, yaklaşımda kehribar ışıklar ve ilk iki geçidi gösteren zemin işaretleri bulunuyor.

node tests/map2-speedway.cjs çevrimdışı pakette iki ayrı oyuncu sürüşü ve beş botla 94,65 km'den ikinci teknik bölümün 114,80 km'deki ilk geçidinin çıkışına kadar doğrulandı. Oyuncu iki açıklığı da kullandı, beş bot her iki sürüşte iki kola dağıldı. Altı gemi 5.000 km/sa hıza ulaştı ve bu koşularda bariyer teması görülmedi. Oyuncu dış sollama hattını sınır cezası almadan kullandı. Görüntüler dist/Harita2_Hiz_Bolumu.png dosyasında.

113,75–175 km finalinde 29 geçit, taş viyadükler, arşiv galerileri, asma bahçeler, gözlemevi köprüleri ve tribün şikanından geçiyor. 114,80 / 132,75 / 154,95 km ayrımlarında iki açıklık var. 174,18 km son balkondan sonra hat finiş halkasında merkezleniyor. Botlar galerilerde hem mevcut hem öngörülen konumları açıklığa sığıyorsa yalnızca ayrılmış şeridin merkezine uzak oldukları için fren yapmıyor.

Çevrimdışı oyunda node tests/map2-final-city.cjs ile iki fare kontrollü sürüşte oyuncu ve beş bot bütün geçitleri bariyer teması olmadan geçip 175 km'de bitirdi. Arşivin merkez kolonu ayrı çarpışma testinde kalkandan 13 puan düşürdü. Hız bölümü bağlantısı ve beş botla tam tur da doğrulandı. Görüntüler dist/Harita2_Ikinci_Teknik_Bolum.png dosyasında.

Harita 2 boyunca tek bir 2048×512 şehir panoraması kullanılıyor. Ufuk dünya yönüne bağlı ve dokunun uçları kısa bir geçişle birleşiyor. Oyun açıldığında Harita 2 için tek kez yükleniyor, çevrimdışı pakete gömülü. Öndeki gerçek 3B modeller derinlik testiyle fonu örtüyor.

Intel UHD ve Chromium'da 1280×720 çözünürlükte iki teknik dönüş ve boost bölümünde fon açık/kapalı karşılaştırıldı. Her durumda 1.080 ölçümde ortalama 54,0 → 53,2 FPS, p95 kare süresi 33,4 → 33,3 ms, ortalama GPU çizim süresi 8,27 → 8,55 ms ölçüldü. Fon kare başına bir çizim çağrısı ekledi. Başlangıç, dönüşler ve finiş görüntüleri incelendi ve ikinci teknik bölümün iki rotası oyuncu ve beş botla finişe kadar tekrar doğrulandı. Önce/sonra görüntüsü dist/Harita2_360_Sehir_Oyun_Ici.png dosyasında.

Şehir panoraması uzay limanı olarak yeniden çizildi. Yanaşma halkaları, katlı terminaller, yörünge kuleleri ve hilal eklendi. Tek doku 2048×1024 ve 297 KB. Gökyüzüne yerleşim oranı kulelerin ve gezegenin daha doğal görünmesi için ayarlandı. Hız düzlüğü, teknik dönüşler ve finiş görüntüleri dist/Harita2_360_Sehir_Oyun_Ici.png dosyasında önceki siluetle karşılaştırılıyor.

Son sürümde Intel UHD, Chromium ve 1280×720 ile aynı iki teknik dönüş ve boost senaryosunda 720 kare/durum ölçüldü. Fon kapalı 59,9 FPS, açık 60,0 FPS. p95 kare süresi iki durumda 16,9 ms. Ortalama GPU çizim süresi 7,00 ms → 7,18 ms. Panorama kare başına bir çizim çağrısı kullanıyor.

Onaylanan 2 numaralı mor-kehribar panoramada halkalı gezegen ve uzak metropol yer alıyor. Yola göre sol sırada ince 3B kule çiftleri ve bağlantı köprüleri, sağ sırada alçak yuvarlak yanaşma terasları var. Parçalar iki hazır geometride birleştirildi ve pist bölümleri bazında toplu çiziliyor. Önceki ve yeni sürümlerde geçit ve fiziksel engel sayıları eşit.

Chromium ve Intel UHD ile 1280×720'de aynı iki dönüş ve boost senaryosu için her sürümden 720 kare toplandı. Önceki paket 56,1 FPS ve 17,4 ms p95, yeni paket 60,0 FPS ve 16,8 ms p95 verdi. Ortalama GPU süresi 8,60 → 8,52 ms, kare başına ortalama çizim çağrısı 159 → 131. Başlangıç, hız bölümü, teknik dönüş ve finiş kareleri dist/Harita2_Uzay_Metropolu.png dosyasında.

Harita 2'nin yol kenarındaki iki eski bina geometrisi sekiz ayrı modüler 3B modelle yenilendi. Sol tarafta kontrol kulesi, aktarma kuleleri, haberleşme istasyonu ve servis çekirdeği, sağ tarafta yanaşma terminali, bakım hangarı, kargo dağıtım yapısı ve aktarma salonu var. Cephelerde ortak metal panel dokusu, koyu cam bantları ve bronz detaylar bulunuyor. Teknik geçitlerin uygun duvarlarına, çarpışma yüzeylerini değiştirmeyen servis panelleri eklendi.

Güncel çevrimdışı pakette iki hız bölümü koşusu ve iki ikinci teknik bölüm koşusu geçti. Son iki koşuda oyuncu ve beş bot 29 açıklığı kaçırmadan ve bariyere temas etmeden 175 km'ye ulaştı. Önce/sonra karşılaştırması dist/Harita2_Bina_Tasarimlari.png dosyasında.

Yoğun eşzamanlı tarayıcı ölçümü iki sürümde de yüzlerce milisaniyelik takılmalar içerdiği için kısa, tek tarayıcılı koşular da alındı. Intel UHD'de 1280×720 çözünürlükte yeni paket hız bölümünde 59,0 FPS, ikinci teknik dönüşte 46,8 FPS verdi. Aynı kısa koşularda önceki paket 52,9 ve 32,1 FPS verdi. Bu sonuçlar örneklenen iki sahneyi kapsıyor.

Harita 2'de uzay limanı binaları, dekoratif şehir sıraları, teknik virajların yakın cepheleri ve geçit içleri ortak bir malzeme diline alındı. Yakın kent sıralarında camlı katlar ve gerçek kaplama profilleri var. Aktarma, sanayi, arşiv, gözlemevi ve finiş yapılarında malzeme ve servis detayları bölgeye göre değişiyor. Yapı parçaları pist bölümü bazında toplu çiziliyor. Harita 2 ortamında parlak yüzeyler ACES ton eşlemeyle dengelendi.

Güncel paketten başlangıç, iki hız kesimi, aktarma tesisi, teknik dönüşler, arşiv, gözlemevi ve finiş kareleri Intel UHD ile Chromium'da alındı. dist/Harita2_Mimari_Yenileme.png dosyasında aynı virajın önce/sonra karşılaştırması ve diğer bölgeler yer alıyor.

Intel UHD, Chromium ve 1280×720'de önceki ve yeni paket iki teknik viraj ve boost kesiminde aynı girdiyle karşılaştırıldı. Her paketten 180 ölçümde ortalama 59,0 → 56,8 FPS, p95 kare süresi 16,8 → 31,2 ms ve ortalama GPU süresi 8,27 → 9,29 ms oldu. Bu değerler kısa örneklemde yeni cephelerin maliyetini gösteriyor.

Harita 2 için geçici hız çarpanı 3. Normal 9.000, boost 15.000, Hyper 16.500 ve fren 4.500 km/sa. Oyuncu ve botların simülasyondaki ilerleme farkı ile hız göstergesi birlikte doğrulandı. Yarış saati ile enerji süreleri gerçek saniye kullanıyor. Harita 1 başlangıç hızı 3.000 km/sa. Aktarma, ilk teknik bölüm, hız düzlüğü, ikinci teknik bölüm ve beş bot ile 175 km tam yarış testleri geçti.

Harita 2 bina cepheleri 2600 uzay limanı temasıyla yenilendi. Açılı zırh plakaları ve yaşam destek kasetleri yakın cepheleri kaplıyor. Gözlemevi ve arşiv optik modüller, sanayi soğutma kanatları, yük ve aktarma yapıları eğimli koruyucular ve kehribar ışık çizgileri kullanıyor. Dekoratif şehir sıralarındaki pencere bantları sensör vizörlerine dönüştürüldü ve hangarlar ile kontrol kulelerine gerçek 3B servis kapakları eklendi. Görsel parçalar bölüm başına aynı toplu çizim düzenini kullanıyor.

3× hızda Intel UHD ve Chromium ile 1280×720'de üç kısa sahnede yeni paket 58,1 FPS verdi. Ortalama GPU çizim süresi 9,79 → 10,81 ms, ortalama çizim çağrısı yaklaşık 163 olarak kaldı. Aynı kamera ve girişlerle alınan önce/sonra kareleri dist/Harita2_2600_Cepheleri.png dosyasında.


Harita 2 yol kenarlarındaki sekiz 3B yapı, kesik köşeli ve eğimli kütlelerle yeniden kuruldu. Sol tarafta açık taşıyıcılar, köprülü kuleler ve halka antenler, sağ tarafta dışa uzanan hangar çatıları ve gömük yükleme boşlukları var. Şehir cepheleri mat zırh, koyu gövde ve sensör şeritleri kullanıyor. Teknik geçitlerin koruyucu plakaları ve yüksek kulelerin çatı profilleri yeni 3B geometrilerle şekillendirildi. Çarpışma yüzeyleri ve geçit genişlikleri korundu.

Yeni çevrimdışı pakette 3× hızla iki teknik bölümün alternatif açıklıkları oyuncu ve beş botla sınandı. İlk bölümde 25, ikinci bölümde 29 geçit kaçırılmadan ve bariyer teması olmadan geçildi. İkinci bölüm testlerinde altı gemi de 175 km finişe ulaştı. Intel UHD, Chrome ve 1280×720 ile iki teknik viraj ve hız düzlüğü karşılaştırmasında sürüm başına 180 kare ölçüldü. Ortalama 58,1 → 60,0 FPS, p95 kare süresi 16,8 → 16,8 ms, GPU süresi 8,07 → 8,05 ms ve kare başına çizim çağrısı yaklaşık 163 → 184 oldu. Önce/sonra kareleri dist/Harita2_2600_Bina_Formlari.png dosyasında.


Harita 2'nin teknik bölümlerindeki 12 tesis için özgün kütle profilleri yapıldı. Aktarma tesisinde eğimli çıkmalar, madende geri çekilen basamaklar, kargoda asılı katlar, soğutma tesisinde boğumlu gövdeler, pres bölümünde bacalı ocak kütleleri, kilitlerde kapak benzeri kuleler ve enerji bölümünde çatallı direkler var. Finalde viyadük ayakları, kademeli veri arşivi, bitkili teraslar, optik kubbeler ve tribün kanopileri kullanılıyor. Yakın yol cepheleri de her tesisin kalın zırh, servis bölmesi, optik başlık ve ışık düzenini taşıyor. Geçitlerin fiziksel hacimleri korundu. Cepheler sahne bölümü başına birleştirildi.

Son çevrimdışı paket oyunda 3× hızla doğrulandı. Aktarma çatalında oyuncu iki rotayı ayrı koşularda kullandı ve beş bot her iki açıklığa dağıldı. İlk teknik bölümdeki 25 ve ikinci bölümdeki 29 geçit, oyuncu ve beş botla iki koşuda da kaçırılmadan ve bina teması olmadan geçildi. İkinci bölümde her iki koşuda da altı gemi 175 km'ye ulaştı. Bilinçli kolon temasında kalkan 100'den 87'ye indi. Yarış kamerası ve üst inceleme açıları dist/Harita2_12_Uzay_Tesisi.png dosyasında.


Intel UHD ve Chrome'da 1280×720 çözünürlükte, 3× hızda aynı girdilerle 12 teknik sahnede paket başına 1.080 kare ölçüldü. Ortalama 33,0 → 50,8 FPS, p95 kare süresi 33,6 → 33,4 ms, ortalama GPU çizim süresi 15,79 → 10,91 ms ve çizim çağrısı 186,5 → 165,6 oldu. Yeni sürümde sahne ortalamaları 44,6 ile 58,1 FPS arasında. Önceki paketteki tekil uzun kareler ortalamayı aşağı çektiği için karşılaştırmada p95 ve çizim çağrısı da kaydedildi.


Harita 2 teknik tesislerinin renkleri yeniden dengelendi. Geniş yüzeylerdeki açık bej, krem ve pembe tonları mat çelik, grafit ve mavi-gri tonlarına çekildi. Maden teraslarındaki ahşap görünümlü kaplama ve soğutma kulelerinin krem yüzeyi metal panel malzemesine alındı. Kehribar, turkuaz ve soluk mavi geçit detaylarında kullanılıyor. Dört bölgenin renk karşılaştırması dist/Harita2_Renk_Karsilastirmasi.png dosyasında.

Chrome ve Intel UHD ile 720p'de dört teknik sahnenin her sürümünden 360 kare ölçüldü. 3× hızda iki sürüm de 60 FPS ve 16,8 ms p95 verdi. Çizim çağrısı ortalaması 171,72, üçgen sayısı, 59 geçit ve 598 fiziksel engel sayısı eşit. Güncel pakette tarayıcı hatası kaydedilmedi.


Harita 2 görsel çalışması beş rota parçasına ayrıldı.
1. 0–45 km — Şehir girişi ve basınç aktarma tesisi.
2. 45–96,25 km — Maden, kargo, soğutma, pres, kilit ve enerji tesisleri.
3. 96,25–113,75 km — Açık hız koridoru.
4. 113,75–149 km — Viyadükler, veri arşivi ve teraslar.
5. 149–175 km — Gözlemevi, tribün ve finiş.

Birinci parçada dört özgün 3B şehir modeli kullanıldı. Solda köprülü kuleler ve halka röleleri, sağda çıkmalı yanaşma hangarları ve katlı servis blokları var. 0–45 km arasında 430 örnek doğrulandı. Kaplamalarda mat çelik, koyu mavi ve sınırlı kehribar-turkuaz detaylar kullanıldı. Basınç tesisinin üst kütlesi, tankları ve giriş cepheleri yeniden şekillendi. 40,1 km'deki alçak rota kehribar, dış rota turkuaz ışıklarla işaretlendi.

Son çevrimdışı pakette 3× hızda oyuncu iki rotayı ayrı koşularda kullandı. Beş bot iki açıklığa dağıldı. Oyuncu ve botlar 45 km sınırını bina teması olmadan geçti. Bilinçli merkez kolon teması kalkandan 13 puan düşürdü. Yarış kamerasından kareler dist/Harita2_1_Sehir_Girisi.png dosyasında.


3× hızda, Intel UHD ve Chrome ile 1280×720 çözünürlükte dört sahnenin her sürümünden 360 kare ölçüldü. Ortalama 56,1 → 58,9 FPS, p95 kare süresi 16,8 → 16,9 ms, GPU çizim süresi 10,10 → 9,72 ms ve ortalama çizim çağrısı 146,38 → 129,25 oldu. Basınç tesisi sahne ortalaması 59,3 → 55,7 FPS. Yol geometrisi açısından 59 geçit ve 598 fiziksel engel sayısı doğrulandı.


İkinci parça 45–96,25 km arasında tamamlandı. Maden tesisine kademeli cevher ekranları ve eğik payandalar, kargoya asılı katlar ve kehribar şeritler, soğutmaya köşeli eşanjörler ve turkuaz radyatörler, prese katmanlı ısı kalkanları, kilitlere vana cephesi ve mavi göstergeler, enerji tesisine konik direkler ve hafifletilmiş bobinler kondu. Avludaki servis binaları da yaklaştıkları tesisin şekil ve kaplama renklerini kullanıyor. Dört ayrımın iki rotası farklı ışık tonlarıyla işaretlendi.

Güncel çevrimdışı pakette 3× hızda iki ayrı sürüşte oyuncu ve beş bot 25 geçidin tamamını kaçırmadan, bina teması olmadan geçti. Botlar 52,55, 60,30, 77,20 ve 89,10 km'deki ayrımlarda iki kola dağıldı. Yarış ve üst inceleme kameralarının önce/sonra kareleri dist/Harita2_2_Sanayi_Tesisleri.png dosyasında.


Altı sanayi sahnesi için Intel UHD ve Chrome'da 720p'de, 3× hızda sürüm başına 540 kare ölçüldü. Güncel sürüm 59,1 FPS ortalama, 16,8 ms p95 ve 152 ortalama çizim çağrısı verdi. En düşük sahne ortalaması enerji tesisinde 55,7 FPS. Önceki sürümün 53,7 FPS ortalamasını enerji sahnesindeki uzun kareler düşürdü. Aynı testte 59 geçit ve 598 fiziksel engel doğrulandı.


Üçüncü parça 96,25–113,75 km arasında tamamlandı. Açık hız koridorunun soluna alçak sensör galerileri ve gerideki köprülü kontrol kuleleri, sağına çıkmalı pit hangarları ve servis yapıları yerleştirildi. Dört 3B modelin 166 örneği bu kesimde doğrulandı. Apronun mavi-gri merkez yüzeyi ve omuz şeritleri koridorun açılıp daralmasını gösteriyor. Yan işaretler açık bölümde turkuaz, yaklaşımda kehribar. 114,80 km'deki ilk iki teknik açıklığın yer işaretleri ayrı renklerde. Apron donanımı sahne parçası başına toplu çiziliyor.

Oyuncu ve beş bot 3× hızda iki koşuda da boost ile 15.000 km/sa değerine ulaştı. Oyuncu dış sollama hattını sınır cezası almadan kullandı ve 114,80 km'deki iki açıklığı ayrı koşularda geçti. Beş bot iki açıklığa dağıldı ve altı gemi de bina teması olmadan geçidin çıkışına ulaştı. Açık bölüm boyunca geçit ve fiziksel engel sayısı sıfır. Önce/sonra kareleri dist/Harita2_3_Hiz_Koridoru.png dosyasında.


Intel UHD ve Chrome ile 720p'de, 3× hızda dört koridor sahnesinin sürüm başına 360 karesi ölçüldü. Ortalama FPS 55,7 → 59,3, p95 kare süresi 16,9 → 16,9 ms ve ortalama çizim çağrısı 176,5 → 140,3 oldu. Yeni pakette açılış, boost ve dış hat yaklaşık 60 FPS, teknik yaklaşım 57,5 FPS verdi.


Dördüncü parça 113,75–149 km arasında tamamlandı. Viyadüklerde kesintisiz çelik kemerler ve yeni taşıyıcı cepheleri, veri arşivinde konsollu 3B katlar ve tavan kasetleri, teraslarda yeşil tonlu sera kabukları ve asılı balkonlar var. Bu üç tesisin 336 şehir cephesi örneği bölüm sınırları içinde doğrulandı. 114,80 km'deki viyadük giriş renkleri hız koridorundan devam ediyor. 132,75 km'deki arşiv ayrımı kehribar ve açık mavi. Arşiv tavan şeritlerinin yüzeyle çakışması giderildi.

Son çevrimdışı paket 3× hızda oyuncu ve beş botla hız koridorundan ilk viyadük geçidine kadar iki koşuda, ardından finalin 29 geçidi boyunca iki koşuda doğrulandı. Yenilenen 16 geçit dahil geçit kaçırılmadı ve bina teması oluşmadı. Altı gemi iki koşuda da 175 km'yi tamamladı. Bilinçli arşiv kolonu teması kalkandan 13 puan düşürdü. Görüntüler dist/Harita2_4_Viyaduk_Arsiv_Teraslar.png dosyasında.


Intel UHD ve Chrome'da 720p ile 3× hızda giriş, viyadük, arşiv ve teras sahnelerinde sürüm başına 360 kare ölçüldü. İki paket de 60 FPS ve 16,8 ms p95 verdi. Kare başına ortalama çizim çağrısı 187,8 → 149,9 ve GPU çizim süresi 9,62 → 9,40 ms oldu.


Beşinci parça 149–175 km arasında tamamlandı. Gözlemevine çatallı taşıyıcılı optik kuleler, laboratuvar gövdeleri ve katlı gözlem köprüleri eklendi. 154,95 km çatalının iki geçidi açık mavi ve kehribarla ayrıldı. Tribünlerde eğimli kanopiler, basamaklı gövdeler ve çelik payandalar kullanıldı. 174,18 km'deki balkon iki sıralı damalı işaret taşıyor. 175 km'ye çelik finiş takı ve dört parçalı ışık işareti eklendi. Açılışta finiş takı görünmüyor. Gözlemevi ve tribünlerin 248 uzak cephe örneği kesim sınırları içinde doğrulandı.

Son oyunda 3× hızda iki final sürüşünde oyuncu ve beş bot 29 geçidi temassız geçti. Ayrı tam turda oyuncu ve beş bot 59 geçidin tamamından bina teması olmadan geçip 175 km finişine ulaştı. Geçiş doğrulamasına gözlemevi çatalının iki kolu dahil. Önce/sonra görüntüleri dist/Harita2_5_Gozlemevi_Tribun_Finis.png dosyasında. Harita 2'nin beş görsel parçası tamamlandı.


Intel UHD ve Chrome'da 720p'de, 3× hızla dört final sahnesinde sürüm başına 360 kare ölçüldü. Ortalama 44,4 → 52,8 FPS, p95 kare süresi 16,8 → 16,8 ms, çizim çağrısı 136,8 → 113,0 ve GPU süresi 9,33 → 10,03 ms oldu. Güncel pakette sahne ortalamaları 45,8–59,3 FPS arasında. Her iki pakette de tekil uzun kareler ortalamayı etkiledi. Son pakette 59 geçit ve 598 fiziksel engel doğrulandı.


Harita 2 bütünleme turunda 45, 96,25, 113,75 ve 149 km sınırlarına kademeli geçiş uygulandı. Yakın ve uzak sıralar tasarım değişimini farklı mesafelerde alıyor. Dış sıraların renk tonu iki tesis arasında yaklaşık 1,46 km boyunca yumuşak geçiyor. Maden, kargo, soğutma, pres, kilit ve enerji için uzak bina siluetleri yakındaki tesislerin profillerinden üretildi. Çevrim birleşiminde tribün ve şehir girişi de bu düzeni kullanıyor.

Yakın ve uzak bina grupları ile hız bölümü yapılarının dünya konumundaki sınırları hesaplandı. Kamera dışında kalan grupların çizimi atlanıyor. Altı ayrı kamera örneğinde bu işlem açık ve kapalıyken görüntüler piksel düzeyinde aynı kaldı. Örnek başına 12–28 çizim çağrısı atlandı. 3× hızdaki tam turda oyuncu ve beş bot 59 geçidin tamamını bina teması olmadan geçti ve 175 km'ye ulaştı. Final için iki ayrı kol denemesi de geçti. Kareler dist/Harita2_Bolum_Gecisleri.png dosyasında.

Son paketi önceki sürümle kıyaslamak için Intel UHD ve Chrome'da 720p'de 3× hızla altı kesit, iki zıt çalışma sırasıyla ölçüldü. Her çalışmada sürüm başına 540 kare alındı. Önceki sürümün ortalamaları 54,9 ve 58,8 FPS, son paketin ortalamaları 59,7 ve 52,1 FPS çıktı. Son pakette finiş iki çalışmada yaklaşık 60 FPS ölçüldü. Çizim çağrısı ortalaması 119,61'den 99,43'e, üçgen ortalaması 137.085'ten 118.200'e indi. Önceki ve son paketin p95 kare süreleri 16,8–16,9 ms aralığında kaldı. Tekil takılmalar nedeniyle ortalama FPS artışı doğrulanmadı.

Sert dönüş profili Harita 2 sırasında Three.js'in gizli sahne dallarında da dünya matrislerini güncellediğini ve bazı malzemelerin ilk kullanımlarında yeni GPU programlarının oluşturulduğunu gösterdi. Harita 2 çizimi görünür sahne köklerinin ve görünür pist parçalarının matrislerini güncelliyor. Pist ve finiş malzemeleri ilk yarış öncesinde devriye ışığı açık ve kapalı olarak 1 piksellik hedefe çizilerek hazırlanıyor. Hazırlık yarış süresine dahil edilmiyor. Ayrı başlangıç testinde GPU hazırlığı 4,52 saniye, yeniden başlatma 4 ms sürdü.

Chrome ve Intel UHD ile 720p'de 3× hızdaki 7 kesitte ikişer geçiş ve sürüm başına 1.442 kare ölçüldü. Kare süresinin 95. yüzdelik değeri 66,7 ms'den 33,2 ms'ye indi. Finiş öncesi zikzakta ortalama 26,0'dan 58,6 FPS'e çıktı ve 45 ms'yi aşan kare sayısı 38'den 0'a düştü. Tüm kesitler birlikte değerlendirildiğinde 45 ms'yi aşan kare sayısı 299'dan 9'a indi. Yeni ölçümde yarış sırasında yeni GPU programı açılmadı. 3× tam turda oyuncu ve beş botun her biri 59 geçitten temas olmadan geçti ve 175 km'ye ulaştı.

Aynı kamera, gemi konumları ve ışık koşullarıyla karşılaştırılan dokuz oyun karesi piksel düzeyinde aynı çıktı. Üç ayrı çatalda iki kol da oyuncu ve botlarla doğrulandı. Arşivdeki orta bloğa yapılan ayrı temas denemesinde çarpışma algılandı ve kalkan 87'ye indi. Güncel çevrimdışı paket derlendi ve doğrulandı.

Girişteki eski görsel yol platformlarının üst yüzeyi -256, uçuş tabanı ise -394,62 idi. 3× sürüşte 4 km civarında bunun platform altına inişe izin verdiği doğrulandı. Girişteki 56 eski parça, hız platformuyla ortak olan -428,62 üst yüzey yüksekliğine alındı. Giriş, hız bölümü ve hız bölümü yaklaşımındaki üç dalışta gemi ve takip kamerası yüzey üstünde kaldı. 3× tam turda oyuncu ve beş bot 59 geçitten temassız geçip 175 km'ye ulaştı.

Girişteki üç örnek karede eski yol seviyesinin tamamen altında 1–5 çizim çağrısı ölçüldü. Bu kategori yol hizasında biten ve altına uzanan temelleri kapsamıyor. Temeller ve bina geometrisi korundu. Açık teknik koridor ile iki yanda uzun kuleler, sonraki yol tasarımı için önerildi.

96,25–100 km arasındaki hız platformu üç farklı yüksekliğe yerleştirilen 3B yük hangarıyla değiştirildi. Alçak bir bakım bağlantısı, bakır yanaşma ışıkları, alt servis yapıları ve çatı radyatörleri aynı pist parçalarına bağlı. Çatı sınırları genişleyen rota eğrisini izliyor ve 100 km'de kalan hız platformuna ulaşıyor. Kenetlenen plan biçimleri arasındaki yarıklar açık. En yüksek çatı kabuğu mevcut alt uçuş sınırının 34 birim altında. Uçuş fiziği ve bot rotası görsel yapıdan bağımsız kaldı.

Beş boşluk örneğinde aşağı yönlü ışın çatıya veya hız platformuna çarpmadı. 100 km'den sonra aynı sorgu hız platformuna çarptı. 3× tam turda üç ortak rastgele başlangıçla önceki ve güncel oyunun sonuçları birebir aynı çıktı. İki turda altı sürücü de 59 geçidin tamamını binaya temas etmeden tamamladı. Üçüncü turda CYBER-7 her iki sürümde de terminali ve tüm geçitleri geçtikten sonra 174,37 km'de elendi. Intel UHD ve Chrome'da 720p'de sürüm başına 231 kare ölçüldü. Önce 58,48 FPS ve 16,8 ms p95, sonra 60,00 FPS ve 16,9 ms p95 ölçüldü. Oyundaki üst açı dist/Harita2_Yorunge_Yuk_Terminali.png dosyasında.

Terminal 100–113,75 km arasında sekiz yeni 3B çatıyla uzatıldı. Yük ayırmada üç asimetrik çatı çapraz açıklıklarla ayrılıyor. Bakımda tekil kuru havuz, servis tepsisi ve soğutma çatısı enine boşluk bırakıyor. Sevkte iki uzun rıhtım, ikinci teknik bölüme açılan kesintisiz bir orta kanal oluşturuyor. Hız bölümündeki eski düz platform kaldırıldı. Derindeki küçük servis yapıları ve ışıklar aynı bölüm gruplarında birlikte çiziliyor. Önceki üç çatı aynı plan ve malzemeyle korunuyor.

13 çatı ve 11 boşluk örneğine aşağı yönlü ışın atıldı. Boşluk örneklerinin tamamında ilk kesişim derindeki şehir tabanı oldu. 100 km birleşiminin iki yanı ve 113,75 km teknik giriş yaklaşımı doğrulandı. Alt uçuş sınırı en yüksek çatı kabuğundan 34 birim yukarıda. 3× hızdaki üç sabit rastgele başlangıçta önceki ve yeni paketin tur sonuçları aynı çıktı. İki tam turda altı gemi 59 geçidi bina teması olmadan tamamladı. Diğer turda CYBER-7'nin mevcut finişten önce elenmesi iki sürümde de 174,37 km'de görüldü. Üst açı dist/Harita2_Yorunge_Terminali_100_11375.png dosyasında.

Intel UHD ve Chrome'da 720p'de dört terminal yaklaşımı için iki zıt ölçüm sırası kullanıldı. Sürüm başına ve ölçüm başına 293 kare alındı. Önceki paket 58,79 ve 60 FPS, yeni paket 55,99 ve 60 FPS verdi. İlk ölçümde p95 kare süresi 16,9'dan 33,3 ms'ye çıktı. Ters sıradaki ölçümde bu sonuç 16,8 ve 16,9 ms oldu. Her iki ölçümde ortalama çizim çağrısı 98,35'ten 95,04'e, üçgen ortalaması 104.364'ten 106.515'e değişti.

İlk açık bölüm kalkıştan 35 km'deki teknik girişe kadar aynı 3B terminal düzenini iki kez kullanıyor. Çatılar önceki giriş genişliğine göre yerleştiriliyor. 8,75 km civarında çatı dizisi kademeli olarak genişliyor. Eski giriş plakaları kaldırıldı ve iki terminal kopyasının gerçek açıklıkları alttaki şehir tabanına uzanıyor.

0–35 km arasında 22 çatı sayıldı ve 16 açıklık örneği doğrulandı. 35 km sonrasında giriş terminaline ait çatı görülmedi. Dalışta en yüksek çatıyla uçuş sınırı arasında 34 birim kaldı. 3× hızda üç eş koşullu tam turun oyuncu ve bot sonuçları önceki sürümle birebir aynı çıktı. Oyundaki giriş görünümü dist/Harita2_Ilk_Acik_Alan_Terminali.png dosyasında.
