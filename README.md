# Fleur & Artisan 💐 — 3D İnteraktif Buket ve Hediye Tasarımcısı

Next.js (App Router), TypeScript, Tailwind CSS, Three.js, React Three Fiber (R3F) ve Zustand kullanılarak geliştirilmiş, küresel pazara hitap eden yeni nesil **3D İnteraktif Buket Tasarımcısı** web uygulaması.

---

## ✨ Öne Çıkan Özellikler

1. **Procedural Çiçek Yerleşim Algoritması (Fibonacci Spiral Packing)**
   - Vogel's phyllotaxis & Dutch spiral floristry matematiği ile çiçekler 3D uzayda doğal kubbe formunda, birbirinin içine girmeden parametrik olarak yerleşir.
   - Kubbe (Dome), Spiral, Kır Bahçesi (Wild Meadow) ve Sunum Yelpazesi (Fan) form seçenekleri.
   - Buket sıkılığı, sap açılma açısı ve doğal yükseklik farkı (jitter) ayarları.

2. **Dinamik 3D Çiçek Modelleri (Procedural Meshes)**
   - **Gül (Rose):** Katmerli gonca yaprakları, çanak yapraklar (sepals) ve gövde yaprakları ile zengin renk varyasyonları.
   - **Lale (Tulip):** Kadeh formunda 6 taç yaprak, iç stamen/pistil ve gövdeyi saran geniş lale yaprağı.
   - **Papatya (Daisy):** 24 taç yapraklı, sarı göbekli zarif kır papatyası.
   - **Okaliptüs (Eucalyptus):** Gümüşi adaçayı yeşili yuvarlak yaprakları (silver dollar) ile derinlik katan dal.
   - **Cipso / Bahar Yıldızı (Baby's Breath):** Araları dolduran bulut gibi minik beyaz çiçek kümesi.
   - **Lavanta (Lavender):** Provence vadilerinden ilham alan mor başak çiçekleri.

3. **Dinamik Gazete Kağıdı ve Ambalaj Giydirme (Wrapping Mesh)**
   - **Vintage Gazete (1894 Paris Edition):** HTML5 Canvas üzerinde procedural olarak üretilen yüksek çözünürlüklü (2048x2048) otantik Fransızca makaleler, botanik gravür çizimleri, mühürler ve masthead banner.
   - **Artisanal Kraft Kağıdı:** Doğal kağıt lifleri ve el yapımı zanaatkar damgaları.
   - **Şeffaf Jelatin (Cellophane):** Kristal parlaklık ve zarif yansımalı fiziksel materyal.
   - **Pastel İpek / Saten:** Yumuşak kumaş pırıltısı.
   - **İç Astar Tülü:** Buket üstünden taşan ikinci katman astar.
   - **Dekoratif Kurdele & Düğüm:** Saten, kadife veya rustik kınnap ip seçenekleri ile 3D fiyonk ve süzülen kurdele kuyrukları.

4. **3D Kişiye Özel Hediye Not Kartı**
   - Buket ambalajına iliştirilmiş altın klipsli 3D kart.
   - Kullanıcının yazdığı alıcı, özel mesaj ve gönderen imzası anında 3D kart üzerinde render edilir.

5. **Profesyonel Sahne Ambiyansı & Kamera Kontrolleri**
   - 4 Farklı Işıklandırma Ön-Ayarı: Stüdyo, Gün Batımı (Golden Hour), Pastel İskandinav, Dramatik Noir.
   - 360° Otomatik Döndürme modu.
   - Yüksek çözünürlüklü 3D buket fotoğrafı çekme (.PNG).
   - Link Paylaşımı: Tasarlanan buketi URL query parametresi (`?b=...`) olarak anında paylaşabilme.

---

## 🛠️ Teknoloji Yığını

- **Framework:** Next.js 14 (App Router)
- **Dil:** TypeScript
- **Stil & Arayüz:** Tailwind CSS, Glassmorphism, Lucide Icons, Canvas Confetti
- **3D Motoru:** Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`)
- **State Yönetimi:** Zustand

---

## 🚀 Kurulum ve Çalıştırma

Geliştirme sunucusunu başlatmak için:

```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresine gidin.
