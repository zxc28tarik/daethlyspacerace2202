# NEXT11C21G6 — Eski kutuya dönüş: yalnız görsel iyileştirme

Kullanıcının kesin kararı: eski mor ödül kutusu kullanılmaya devam edilecek. Atom yörüngeleri, kristal obje ve metal kafes oyun için reddedildi. Bu dal, en güncel C21G5 kodundan yalnız pickup render değişikliğini geri alır; diğer bütün sistemleri korur.

## Uygulanan
- 49 adet eski kutu: aynı BoxGeometry(34,34,34), EdgesGeometry(BoxGeometry(36,36,36)), içeride OctahedronGeometry(9,0).
- Atom halkalarının tamamı gerçek koddan çıkarıldı. Yeni particle, geometry türü, postprocess, halo, ışık veya model yok.
- Hafif malzeme ve renk kalibrasyonu: koyu mor kutu, düşük emissive, daha açık kenar çizgisi, turkuaz çekirdek. Küp dönüşü, küçük nabız devam ediyor.
- Önceden üç çizim nesnesi olan kutu hâlâ üç: Box Mesh, Lines, Core Mesh. 49 pickup ortak geometry ve material kaynaklarını paylaşıyor.
- Hiçbir ödül konumu, swept collision (radius49), RNG HYPER/SHIELD/ENERGY, 12sn lazer, hız, oyuncu/AI veya Map4 değişmedi.

## QA / release
- 1600x900 orijinal C21F kutu vs rafine kutu gerçek native WebGL A/B ve gerçek Map1 oyuncu kamerasında staged görünüm.
- 49 adet eski geometri ve bağımsız rota/collider, aynı rastgele ödül, Map4 249 parça ve [6,36,200] collider.
- Dedicated CI ve bütün Map1/Map4 smoke. Tarihi C21G–C21G5 atom model testleri bu dalda koşullu skip edilir, eski branchlarda korunur.
- Aynı workflow ile internetsiz çalışan tek HTML üretilecek.
- Onaysız main merge yok.