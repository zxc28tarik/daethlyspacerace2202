# NEXT11C21J — Harita 1 meteor/bariyer sıyırma ve çarpışma görsel geri bildirimi

Kullanıcı kararı doğrultusunda eski tüm objeler aynen korunur. Bu aşama yeni bir pickup modeli, engel, parçacık yağmuru veya oynanış mekaniği eklemez.

- Var olan `fx-canvas` üzerinde **kenarla sınırlı** ve **kısa süreli** 2D görsel belirtiler: meteor sıyırmada hafif amber, meteor çarpışmasında sıcak turuncu, bariyer temasında sarı/turuncu, kalkanla karşılamada sönük turkuaz. Nişangah ortası kapanmaz.
- Gerçek tehlikenin `laneX` konumuna göre sol/sağ uyarı belirir. Aynı anda sıyırma ve çarpışma olursa çarpışma bir an öncelikli. Sıyırma spam önleme 0.22sn.
- Ödül sayısı, RNG, +300 puan/+5 enerji, sıyırma hesapları, gerçek hasar, kalkan ve hız cezaları değişmedi. Yalnız mevcut `updatePlayerNearMisses`, `applyStaticObstacleContact` ve asteroid temas noktalarında çizim tetiklenir.
- `Map4`'te bu görsel ipuçları **kapalı**. Oyun tekrar başlatıldığında bütün görsel sayaçları sıfırlanır.
- Yeni 3D mesh, GL draw call, geometri, shader, materyal, parçacık veya enerji toplama halkası yok; eski 49 mor kutu, 320 meteor, bariyer ve 8 enkaz kapısı devam.

## Doğrulama
- `tests/map1-next11c21j-contact-cues.cjs`: Gerçek Chromium/Three WebGL 1600x900; 4 kısa kenar-görsel ekran görüntüsü. Gerçek near-miss olayının ödül hesaplarını değişmeden koruyarak tetiklemesi, grafik işaretleri sırasında tüm sayısal oyun alanlarının değişmemesi, Map4'te uyarı tetiklenmemesi.
- Eski C21G6/C21H/C21I testleri yeniden koşulur. Offline playable HTML iş akışı CI çıktısı.
- Stacked DRAFT #105 üzerine. Main'e merge için açık kullanıcı onayı gerekir.