# PRD: Rumper Landing Page Content & Design Overhaul

## Metadata

| Field | Value |
|-------|-------|
| **Author** | [TODO — PRD author name] |
| **Status** | Approved |
| **Created** | 2026-06-28 |
| **Last Updated** | 2026-06-28 |
| **Version** | 1.0 |
| **Related Docs** | `PRD rumah pertama.md`, `context.md`, [landing_page_exact_structure_content_plan.md](file:///Users/arisandy/.gemini/antigravity/brain/4df77635-4893-4cf8-b22b-0d922ecbff95/landing_page_exact_structure_content_plan.md) |

---

## 1. Problem Statement

**Who** is affected and **what need** is unmet?

> First-time home buyers in Jabodetabek are making high-stakes, long-term housing decisions without access to unbiased location risk data. Traditional property marketplaces act as marketing agents for developers, highlighting promotions while concealing critical risks such as flood exposure, traffic bottlenecks, and lack of nearby facilities. Buyers need an independent, objective advisory interface that helps them identify location red flags *before* paying down payments.

**Evidence:**
- Property search portals (Rumah123, Lamudi) emphasize pricing, home photos, and floor plans, completely omitting independent environmental and infrastructure data.
- Jabodetabek buyers face severe "information asymmetry" where developers push verbal claims ("100% bebas banjir") that are historically inaccurate.
- Competitors like Hometrix.ai in Australia validate that home buyers convert highly when presented with clean, structured report previews and a clear positioning of developer-independence.

**Key Insight:**
To convert anxious home buyers, the landing page must first validate their hidden fears (Common Pitfalls) and present an empathetic reality check (Real Regrets) before introducing Rumper's technical solution. Trust is established by demonstrating complete neutrality (no developer commission) and showing a visual preview of our geo-data report.

---

## 2. Goals

| # | Goal | Metric | Target |
|---|------|--------|--------|
| G1 | Drive user acquisition | Landing page conversion rate | > 30% of visitors complete the onboarding search |
| G2 | Maximize landing engagement | Average scroll depth | > 70% of visitors scroll past the Report Preview section |
| G3 | Establish platform trust | Bounce rate | < 45% bounce rate |

---

## 3. Non-Goals

- **Not building:** A property listing marketplace. We do not sell houses.
- **Not solving for:** Real estate investors. We focus exclusively on primary residence buyers.
- **Not changing:** We are not providing financial or legal advice (mortgage rates, contract reviews).

---

## 4. Target Users

### Primary Persona
- **Who:** "Si Commuter" & "Si Perencana" (Young professionals / young couples in Jabodetabek, 25-36 years old).
- **Context:** They have a shortlist of properties but are anxious about making the wrong choice regarding commute times or flood risks.
- **Motivation:** To validate if a property location is safe, convenient, and suitable for their long-term plans.
- **Current workaround:** Asking on Facebook groups, Reddit, or trusting the real estate agent blindly.
- **Jobs to be done:** "As a first-time home buyer, I want to see the objective risks of a neighborhood so that I don't regret my purchase and get stuck with a 15-year mortgage on a bad house."

---

## 5. Master Landing Page Sequence & Content Structure

To maximize trust and conversion, the landing page is structured in this specific sequence:

### Section 1: Navigation Header
- **Brand Identity:** `Rumper` Logo (Teal House + Location pin)
- **Menu Links:**
  - `Jebakan Lokasi` (Scrolls to Pitfalls)
  - `Contoh Laporan` (Scrolls to Report Preview)
  - `Fitur Analisis` (Scrolls to Concerns Grid)
  - `Independensi` (Scrolls to "I'm On Your Side")
- **CTA:** `Cek Lokasi (Gratis)` (Teal Button)

### Section 2: Hero Section (The Hook)
- **Badge:** `📍 Location Risk Advisor — Jabodetabek`
- **Headline:** **"Jangan Beli Rumah Sebelum Cek Risikonya"**
- **Sub-headline:** "Evaluasi risiko banjir, beban kemacetan harian, dan jangkauan fasilitas umum secara independen sebelum Anda membayar DP atau Booking Fee."
- **Search Bar:**
  - *Placeholder:* "Ketik nama perumahan, cluster, atau area (contoh: Grand Galaxy Bekasi)..."
  - *Button:* `Cek Risiko`
- **Trust Elements:** "✓ 100% Independen • ✓ Tanpa Komisi Developer • ✓ Data Geospasial Aktual"

### Section 3: Common Pitfalls ("Jebakan Lokasi")
*Establishes the pain immediately by calling out common blindspots in Jabodetabek.*
- **Badge:** `Pelajaran Pahit`
- **Headline:** **Jebakan Lokasi yang Sering Disesali**
- **Sub-headline:** "Kisah nyata dari pembeli rumah. Setiap masalah di bawah ini adalah hal yang kami bantu Anda periksa sebelum membeli."
- **8 Pitfall Cards:**
  1. 🚗 **Kebisingan Tol:** "Ternyata persis di samping Tol." Baru sadar bising saat malam hari, tidak bisa tidur.
  2. 🌊 **Banjir Musiman:** "Katanya Bebas Banjir." Survei di musim kemarau, musim hujan jalanan depan rumah jadi danau.
  3. 🎒 **Zonasi Sekolah:** "Mengira masuk zonasi sekolah negeri unggulan, ternyata batas kelurahannya berbeda."
  4. 📈 **Harga Jatuh/Stagnan:** "Membeli di puncak harga (peak price) tanpa tahu prospek wilayah sepi."
  5. 📄 **IMB & Sertifikat:** "Developer belum pecah sertifikat, akad KPR tertunda bertahun-tahun."
  6. 🗑️ **Masalah Lingkungan:** "Samping perumahan ternyata tempat pembuangan sampah liar tersembunyi."
  7. ⏰ **Commute Brutal:** "Survei hari Sabtu lancar, hari kerja perjalanan ke kantor memakan waktu 2 jam."
  8. 💸 **Biaya IPL Bengkak:** "Biaya keamanan dan sampah membengkak tiba-tiba tanpa transparansi."

### Section 4: Real Stories, Real Regrets ("Cerita Nyata. Penyesalan Nyata.")
*Social proof showing empathy for the pitfalls, emphasizing Rumper's detection capabilities.*
- **Headline:** **Cerita Nyata. Penyesalan Nyata.**
- **Sub-headline:** "Semua hal yang mereka harap sudah ketahui sebelum menandatangani surat pemesanan rumah."
- **Testimonial Cards Layout:**
  - **Card 1: Jebakan Banjir**
    - *Quote:* "Beli rumah cluster baru di Bekasi. Sales bilang 100% aman bebas banjir. Pas musim hujan pertama, air masuk semata kaki ke ruang tamu dan akses jalan komplek terputus total."
    - *Apa yang salah:* Percaya klaim verbal sales tanpa memverifikasi data elevasi tanah.
    - *Deteksi Rumper:* Sistem mendeteksi titik elevasi rendah (depression zone) dan riwayat banjir kelurahan.
  - **Card 2: Biaya IPL & Fasilitas**
    - *Quote:* "Beli rumah pinggiran dengan harga murah. Ternyata iuran pengelolaan lingkungan (IPL) mencapai 1 juta per bulan karena pengelolaan air bersih dikuasai pihak swasta secara monopoli."
    - *Apa yang salah:* Tidak menanyakan ketersediaan air bersih PAM dan detail biaya maintenance bulanan.
    - *Deteksi Rumper:* Analisis ketersediaan jaringan air bersih PDAM dan biaya overhead rata-rata area sekitar.
  - **Card 3: Commute Menguras Fisik**
    - *Quote:* "Survei rumah hari Sabtu rasanya dekat, cuma 30 menit ke Jakarta Selatan. Pas mulai kerja, macet di gerbang tol dan bottleneck jalan luar cluster bikin saya habis 4 jam di jalan setiap hari."
    - *Apa yang salah:* Hanya melakukan simulasi perjalanan di akhir pekan (weekend).
    - *Deteksi Rumper:* Simulasi rute perjalanan berbasis jam sibuk (rush hour) hari kerja menggunakan data Google Traffic.

### Section 5: The Process ("3 Menit untuk Hindari Salah Pilih Lokasi")
- **Section Title:** **Cara Kerja Rumper**
- **Steps:**
  1. **Masukkan Lokasi:** Ketik nama cluster/area atau pin titik koordinat lokasi di peta.
  2. **Tentukan Prioritas:** Masukkan alamat kantor Anda, moda transportasi, dan prioritas fasilitas keluarga.
  3. **Pengumpulan Data:** Rumper mengumpulkan data real-time seputar banjir, kemacetan, stasiun, dan fasilitas umum.
  4. **Terima Laporan:** Dapatkan Skor Kelayakan personal (0-100), Red Flags, dan Checklist Survei Lapangan.

### Section 6: Visual Report Preview & Six Dimensions Breakdown
*Shows a screenshot/mockup of the Rumper analysis output alongside the 6 core dimensions.*
- **Headline:** **Satu Laporan, Enam Dimensi Utama**
- **Sub-headline:** "Setiap bagian menjawab pertanyaan paling kritis Anda sebelum membeli rumah."
- **Left Column (Report Card Mockup):**
  - Displays property details, "Perhatikan Baik-Baik" warning boxes, "Kecocokan Hidup (Life Fit)" percentages (Now: 90%, 3 Yrs: 80%, 5 Yrs: 70%), and the final verdict summary.
- **Right Column (Enam Dimensi Rumper):**
  1. **Skor Kelayakan Personal** (Personalisasi AI) - Dihitung berdasarkan kesesuaian rute harian, budget, dan preferensi hidup Anda.
  2. **Risiko Banjir & Alam** (Data Geospasial) - Rekaman historis banjir, kedekatan sungai, drainase jalan, serta kualitas udara sekitar.
  3. **Waktu Tempuh & Mobilitas** (Estimasi Realistis) - Perjalanan jam sibuk menuju kantor Anda dan jarak stasiun KRL/LRT terdekat.
  4. **Aksesibilitas Fasilitas** (Data Fasilitas Publik) - Radius aktual ke rumah sakit, puskesmas, sekolah unggulan, dan minimarket terdekat.
  5. **Akses Jalan & Prospek** (Analisis Fisik) - Lebar jalan masuk perumahan, kemacetan bottleneck lokal, dan rencana proyek tol baru.
  6. **Legalitas & Risiko Area** (Alert Risiko) - Catatan sengketa wilayah, batas zonasi komersial, dan keabsahan izin developer.

### Section 7: Detailed Concerns Grid ("Kami Paham Kekhawatiran Anda")
*Detailed 2x4 grid illustrating the depth of geospasial data checks.*
- **Headline:** **Kami Paham Kekhawatiran Anda**
- **Sub-headline:** "Setiap keraguan Anda dijawab secara transparan dengan data geospasial Jabodetabek."
- **Grid items:** Identical to the 8 cards in Section 4c (Flood risk maps, Road widths, Noise boundaries, School zones, Medical centers, Rush hour travel, Train transits, Future Tol planning charts).

### Section 8: I'm On Your Side ("Kami di Pihak Anda")
*Builds strong alignment and credibility with the buyer by positioning Rumper as a pure advisor.*
- **Badge:** `Posisi Kami`
- **Headline:** **Kami di Pihak Anda**
- **Sub-headline:** "Bukan pramuniaga (sales). Bukan agen. Bukan developer. Kami adalah pelindung keputusan Anda."
- **4 Core Pillars:**
  1. 🛡️ **Tanpa Komisi Developer:** Kami tidak menerima komisi penjualan rumah. Kami murni bekerja atas nama Anda.
  2. 👥 **Pernah di Posisi Anda:** Kami memahami betapa sulitnya mencari rumah pertama dengan informasi yang minim.
  3. 💬 **Menyajikan Fakta Jujur:** Kami tidak menyembunyikan risiko apa pun hanya demi memuluskan transaksi penjualan.
  4. 🎯 **Fokus Kepentingan Anda:** Menyajikan informasi berharga yang sengaja ditutupi oleh pihak developer/agen.
- **Quote Banner:** *"Tugas Rumper bukan menentukan rumah mana yang harus Anda beli, melainkan memastikan Anda tidak membelinya dalam kondisi buta informasi."*

### Section 9: Who This Report Is For ("Untuk Siapa Rumper Dibuat?")
*Helps users self-identify with the target audience segments.*
- **Badge:** `Dibuat Untuk Anda`
- **Headline:** **Untuk Siapa Rumper Dibuat?**
- **Sub-headline:** "Apa pun situasi Anda, jika Anda ingin melangkah dengan yakin tanpa penyesalan, Rumper siap membantu."
- **5 Audience Cards:**
  1. 🏡 **Pembeli Rumah Pertama:** Merasa overwhelmed dengan puluhan klaim sales? Kami pecah semuanya secara objektif.
  2. 🔍 **Pembeli Sadar Risiko:** Khawatir dengan masalah tersembunyi yang baru ketahuan setelah akad? Kami bongkar risikonya.
  3. 🚗 **Komuter Aktif:** Ingin memastikan waktu tempuh ke kantor masuk akal di hari kerja, bukan hanya di akhir pekan.
  4. 👨‍👩‍👧‍👦 **Keluarga Muda:** Memikirkan kenyamanan tumbuh kembang anak, akses sekolah terdekat, dan rumah sakit darurat.
  5. 🧭 **Pencari Rumah yang Lelah:** Sudah membandingkan belasan lokasi dan masih bingung memutuskan? Kami beri perbandingan matang.

### Section 10: FAQ & Bottom CTA
- **FAQ:** 4 details accordions addressing: Property sales (No), Risk guarantees (No), Score calculation (Personalized), and Pricing (100% Free for Pre-MVP).
- **CTA:** `Mulai Analisis Gratis` button routing to onboarding workspace.

---

## 6. Design & Aesthetic Guidelines

1. **Brand Aesthetic:** Rich, premium, and reliable theme matching Rumper's primary green/teal scheme.
2. **Visual Hierarchy:** Use clear contrasting typography (`DM Sans` font with sizes clamp-scaled dynamically). Highlight key text in green gradient fills.
3. **No Placeholders / Custom Visualizers:** Recreate spatial diagrams, roads, heatmaps, and charts using pure React SVG / CSS styling instead of static images.
4. **Micro-animations:** Hover transitions on card boxes, pulse rings around warning markers, and clean CSS progress loaders to elevate interactivity.

### V3 experimental implementation boundary (2026-09-26)

- **Route:** `/v3` is an isolated, unauthenticated landing-page experiment. It must not replace `/`, `/v2`, or `/v2-alt` while it is under review.
- **Content:** Preserve the Section 1–10 sequence and the established Indonesian messaging. V3 may consolidate repeated card presentation, but must not add unsupported product claims, pricing, audiences, or readiness promises.
- **Interaction thesis:** Motion must reveal or compare location evidence (for example, flood, commute, and access signals). Decorative looping animation is secondary. All nonessential movement must respect `prefers-reduced-motion`.
- **Validation:** Evaluate comprehension of the evidence scanner and the onboarding-search CTA before promoting V3 to a primary route.

---

## 7. Success Metrics & Validation

### Primary KPIs
- **Onboarding Search Rate:** > 30% conversion.
- **Scroll Engagement:** > 70% past the Report Preview mockup.
- **Time on Page:** > 2.5 minutes average session duration.

### User Validation Method
- User interviews post-onboarding asking: *"Apakah tampilan pratinjau laporan meningkatkan ekspektasi Anda terhadap akurasi Rumper?"*

---

## 8. Stakeholder Sign-Off

| Role | Name | Status |
|------|------|--------|
| PM | [TODO] | [ ] Approved |
| Eng Lead | [TODO] | [ ] Approved |
| Design | [TODO] | [ ] Approved |
