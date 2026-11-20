# NEXT11C21G3 — Metal iskelet kaldirildi

Kullanici, onceki Violet Core modelini abartili buldu ve metal iskeletin kaldirilmasini istedi. Gercek oyun kodundan tum cage / beam / metal frame geometrisi ve materyali tamamen silindi.

Yeni form: yaris oyununda 49 adet odulun her birinde sadece sari olmayan turkuaz kristal, soluk mavi merkez isigi ve ince, dusuk opaklikli mor halka vardir. Ana kristalde metalness sifirdir. Halka yaricapi 24, kalinligi 0.52, opakligi 0.36. Hafif donme ve salinim devam eder.

Eski dort mesh yerine uc mesh, ortak geometri ve materyaller kullanilir. Fizik yaricapi 49, kutularin yerleri, rastgele HYPER_TURBO / SHIELD / ENERGY odulleri, 12sn lazer, hiz ve guc dengesi, normal boost, SB-07 ve Map4 korunur.

Dedicated real Chromium/WebGL test, onceki old/new 1600x900 screenshot QA, Map4 collision, full smoke ve guncel tek dosya offline oynanabilir HTML ayni bransta. CI PASS rapor edilmedikce tamamlandi sayilmaz. Ana dala merge onayi yok.
