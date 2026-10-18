# GEMINI — HARİTA 4 / H4-01: GÜVENLİ HARİTA MODU AYIRMA

**Başlangıç girdisi:** Sana verilen mevcut, onaylı oynanabilir `index.html` (Harita 1 AI-35). Lütfen YALNIZCA bunun üzerinde işlem yap; sıfırdan oyun yazma, mevcut kodu özetleyerek kısaltma.

**Bu görevde yalnızca şu küçük işi yap:**
1. Var olan `#start-screen` başlangıç ekranına, **Harita 1 (Saf Hız Yarışı)** ve **Harita 4 (Avcı İmha Yarışı)** isimli iki seçenekli, mevcut tasarımla uyumlu harita seçimi ekle.
2. HTML'deki oyun `state` yapısına `activeMap` kimliği ve modları ayıran küçük, anlaşılır yapı ekle. Çalışan tüm mevcut Harita 1 kodu varsayılan davranış olarak kalsın.
3. H4 henüz oynanabilir olmadığı için **H4 seçilince Harita 1 yarışı H4 adıyla BAŞLATILMAMALI**. Arayüzde "Geliştiriliyor" durumu görünür, başlatma güvenli biçimde engellenir. H4 gerçek oynanışını daha sonraki küçük görevlerde etkinleştireceğiz.
4. Harita 1 seçilince `startGame()`, `updateGame()`, bitiş, sonuç, restart, lazer, boost, asteroidler, 5 rakip AI ve eski kayıtlı kurallar aynen çalışmalı.
5. Harita 4 için henüz hedef avcı, puan, süre veya silah mekanikleri kodlama. Harita 3, 2, 5 ve 6'ya hiç dokunma.

**Yasaklar:** GitHub, commit, branch, yedek, dosya yeniden adlandırma, dokümantasyon, planlama, kapsamlı refaktör, başka görevlere geçiş. Kullanıcının mevcut görsel estetiğini, kontrollerini, temel hızlarını, koridor geometrisini değiştirme.

**İstenen çıktı:** Kullanıcının açıp oynayabildiği, mevcut dosyanın bütün içeriğini taşıyan **tek tam `index.html`**. Ek olarak kısa bir cümleyle "H1 sağlam, H4 seçim altyapısı hazır, H4 oynanış henüz kapalı" belirt. Kodu parça olarak değil tam dosya halinde ver.

**Başarı denetimi:** Açılışta H1 varsayılan, H1 normal yarış başlatır, H4 seçilince yanlışlıkla H1 başlamaz; H1'e geri dönünce oynanır, restart çalışır, tarayıcı console hatası yok.
