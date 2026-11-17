# NEXT-11C5 — Eskitilmiş PBR metal, yumuşak temas gölgesi ve sanayi ışığı

**Durum:** Gerçek `index.html` oyununun model yüzeyleri, ışık/atmosfer aşaması ve görsel kalite profili kodu değiştirildi. `tests/map4-gfx11c5-weathered-pbr-lighting.cjs` Chromium WebGL A/B testi CI'ya bağlandı. **Son HEAD CI, insan estetik onayı ve gerçek GPU kabulü ayrı doğrulanacak.**

## Kaynak görüntüye göre problem
[NEXT11C4 sabit 07/08/09 ekranları](https://github.com/zxc28tarik/daethlyspacerace2202/actions/runs/43986212927/artifacts/14285458143) modellerin eklendiğini gösteriyor; ancak malzemeler düz, parlak güneş halosu yüzey gölgesini yıkıyor, gövdeler zeminden kopuk görünüyor ve bazı **dekoratif** halka öğeleri gökyüzüne fazla dikkat çekiyor. Geometri/AI/rota kurallarını bozmadan **yüzey ve ışık değerlerini** düzeltme aşaması.

## Uygulanan teknik tasarım
- **Gerçek yerel prosedürel PBR dokusu:** Tek defa Canvas'ta 256×256 deterministik çelik boya/kir/çizik/ek yeri/perçin örüntüsü üretilip paylaşılan THREE.CanvasTexture olarak tüm üç NEXT11C4 hero model materyaline (`map+bumpMap`) bağlanır. Var olan `position/normal/color` authored BufferGeometry'ye **UV** eklenir. Yeni geometri veya collider yok.
- **3 farklı aile rengi / fiziksel malzeme:** rafineri sıcak oksitli, soğutma soğuk çelik, enerji mor-grafit; MeshStandardMaterial roughness/metalness ayarları (roughness .75 / metalness .47) ve çok parçalı model geometrisinin orijinal normalleri kullanılır; büyütülmüş düz kutu yerine önceki gerçek modeller korunur.
- **Zemine oturan gölge hissi:** Ayrı 128×128 radial alfa Atlas; 12 sanayi modelinin altına **tek InstancedMesh/12 adet açıkça nonphysical zemine yakın saydam temas gölgesi**. Bunlar *real-time GPU gölge haritası, ışık kaynaklı dinamik gerçek gölge veya fizik yüzeyi değildir.* **+1 draw call**, **iki üçgen**, **0 ek collider**. Low profilde ağır 3D modelle birlikte kapalı.
- **Phase3 sanayi atmosferi:** Koyu mavi-sıcak değer dengesi, fog ton/density hafif değişikliği, ambient ışığı daha az, directional key daha yüksek, halonun opacity/scale azaltılması ve exposure ayarı. Yalnız `state.map4Phase===3`. Kanyon (1), 60s arena (2), orbital (4), Harita1 **asla** değişmez.
- **Uçuş işaretlerine dokunma:** W05 `HIGH_MARKER`/`BEACON`, H4_MESHES.beacon rehberleri aynen. Yalnız H4_DETAIL_GEO.ring geometriye sahip, fizik ve W05 kullanım etiketleri *olmayan* dekoratif 3D halkaların malzemeleri hafif saydamlaştırılır. Gerçek rotanın işaretleri gizlenmez.
- **QA toggle:** `h4Gfx11c5SetLook(true|false)` yalnız ekran A/B için orijinal malzeme, temas gölgesi ve sanayi atmosferi arasında seçim yapar. Üretim sürümünde Look açık. Per-frame geometri/texture/array tahsisi yok.

## Kesin korumalar
Harita1 adil yarış, Map4 5 rakip + 8 avcı, 6 kanyon +36 sanayi +200 authored yapı collider, 300sn toplam, 60sn ilerleme kilitli arena, 850m yörünge çıkışı, orijinal skor/hasar/AI, H4GFX11B 09 yakın kollizyon kolonu fade, NEXT11C3 18 eski nonphysical sadeleştirme/34 physical W02, NEXT11C4 12 büyük hero model/3 batch High+Balanced ve Low görünmezlik korunur. Oyun dışına ışık, collider veya fizik taşmaz.

## Kabul tablosu
- [ ] 3 hero `MeshStandardMaterial` + 3 UV geometry + tek paylaşılan PBR weather atlas/bump + 12 adet tek batch temas gölgesi, 0 ek ışık, 0 collider doğrulanacak.
- [ ] 1600×900 sabit kamerada 07 giriş, 08 fabrika, 09 çıkış için **gerçek WebGL eski/yeni PNG** farklı; **en fazla +1 draw call/+2 üçgen** ve resident geometri/texture sabit.
- [ ] Stage3 güneş parlaması/ambient/exposure azalır, directional key daha güçlü; 1/2/4 fazlarının ışığı *tamamen* aynıdır.
- [ ] High/Balanced tam gölge+metal; Low ağır model/gölge kapalı, düşük üçgen; navigasyon halkaları korunmuş.
- [ ] Eski bütün offline HTML/Map1+4, GFX09–11C4, simüle 300sn endurance, 12 kadraj+62 PNG galeri CI PASS.
- [ ] Gerçek 7–8/10 insan estetik değerlendirmesi **AÇIK**, native GPU FPS/p95/VRAM ve tam 5dk gerçek uçuş **AÇIK**, en az 3 oynanabilir yayıncı haritası **AÇIK**.

**Sıradaki `.`:** CI fail ise mevcut PR'da kök neden onarılır. PASS ise 07–09 görüntüleri *gözle* incelenir; hâlâ yetersizse yeni görsel kalite borcu açılır. Kullanıcı onayı olmadan stacked PR merge yapılmaz.
