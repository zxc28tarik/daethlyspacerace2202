# NEXT-11C12 — Özgün endüstriyel mimari ölçek ve derinlik

**Durum:** `index.html` oyun koduna işlevsel yakın–orta–uzak tesis silüeti eklendi; gerçek WebGL A/B testi + hızlı/tam CI eklendi. Yeni C12 CI sonucu ve insan görsel kabulü henüz açık. Önceki C11 tam regresyon [#44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) ayrıca devam ediyor; C12 testinin PASS sonucuyla karıştırılmamalı.

## Tasarım sorunu

C11 gerçek 1600×900 07/08 görüntülerinde duvar paneli farkı 07 %7,35/08 %6,70 idi. Ancak art arda benzer yükseklikte W02 bina ve gökyüzündeki iri işlevsiz halkalar sayesinde sahne hâlâ yapay görünüyor. Yeni kapalı blok bina eklemek, görsel kimliği daha da tekrar ettirecek. C12 **iki yeni özgün açık iskelet silüeti** ve **derinlik kademesi** kullanır; navigasyona dokunmadan dekoratif sky ornament karşıtlığını geriye iter.

## Uygulanan kod

- İki yeni programatik BufferGeometry (Three.js primitive kaynaklarıyla kodlanmış, herhangi bir hazır Unreal/CGTrader paketinden alınmamış):
  1. **Ayırma bacaları silüeti:** birbiriyle aynı olmayan üç distilasyon/ayırma kolonu, flared scrubber, yatay basınç header, açık sıcaklık değişim paneli ve servis iskeleti; dekoratif halkasız.
  2. **Açık malzeme aktarma iskeleti:** eğimli destekler, taşıyıcı asma mekanizması, 5 malzeme kaseti, diagonal açık makas kafes ve servis transferi; ring/portal formu yok.
- Altı örnek (üç farklı ölçek kademesi, her 07/08 yaklaşımında üç istasyon): route progression `18850/20350/21650` ve `25350/27050/28650`; dış yan koordinatlar ±1190–1660; görsel iskelet altı -433 birimlik sanayi zeminine matematiksel olarak oturtuluyor. **2 instanced mesh drawcall**, paylaşımlı C5 256² çelik-kir atlası, yeni mesh/material/atlas her karede üretilmiyor.
- Yalnız daha önce C5 tarafından `H4_DETAIL_GEO.ring` ve `!h4Collider && !w05Kind && !markerMaterial` şartıyla **dekoratif olduğu doğrulanan** W01 gökyüzü halkaları daha mat ve %9,5 opacity ile arka plana alınır. Kaynak geometri/kılavuz konumu sabit kalır; eski C5 materyali saklanır. **W05 HIGH_MARKER/BEACON ve güzergâh gösterimleri değişmez.**
- `h4Gfx11c12SetLook(true|false)`: gerçek WebGL aynı kamera A/B, eski malzeme ve C12 silüetleri temiz biçimde geri gelir. High/Balanced ve Map4 faz3 dışında C12 kapalı. **0 yeni collider, 0 ışık, 0 doku, 0 dış varlık**.
- Her gerçek fiziksel W02 kabuk `mesh.geometry` ve `userData.h4Collider` orijinal kimliği korunur. 6 kanyon/36 sanayi/200 bina collider, 5 rakip/8 avcı, arena 60s, yarış 300s, yörünge 850m ve altı harita / yayıncı pitch en az 3 playable kararı korunur.

## Kullanıcının özgünlük kararı

**Her tür kaliteli örnekten yalnız teknik, atmosferik ve yapısal ilham almak serbest; ayırt edici ticari model, silüet, yerleşim, doku veya sahneyi birebir/çok yakın kopyalamak yasak.** C12'nin bütün silüet geometrisi bu oyunun kodunda tasarlandı; CGTrader dosyaları veya harici model ithali yok.

## Kabul listesi

- [x] C12 gerçek oyun kodu ve `new Function()` JavaScript sözdizimi denetimi PASS.
- [x] Gerçek 1600×900 Chromium/WebGL 07/08/09 A/B, korunan 24 rota işareti/34 W02 kabuk, 6/36/200 collider, drawcall/tris/texture/geometry + quality/faz kontrolü yazıldı.
- [x] Tarihsel C4–C11 bağımsız görsel A/B testlerinden C12 gizlendi; hızlı ve tam GitHub CI eklendi.
- [ ] C12 **güncel HEAD** hızlı CI PASS, altı ekran görüntüsünün gerçek görsel denetimi.
- [ ] C12 **güncel HEAD** tam Map1/Map4 browser smoke regresyonu PASS.
- [ ] C11 üst PR [tam #44079786517](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/44079786517) PASS doğrulama.
- [ ] 720p/1080p yerel GPU FPS/p95/VRAM, gerçek 5 dakika uçuş.
- [ ] 07/08/09 estetik kullanıcı 7–8/10 onayı ve ilk publisher pitch 3/6 playable kabulü.
- [ ] Kullanıcının açık PR merge/onay izni. Bütün stacked PR'lar Draft ve unmerged.

**Teknik CI PASS, kullanıcı estetik onayı veya telif değerlendirmesi değildir.**
