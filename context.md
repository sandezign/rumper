# Rumper — Location Risk Advisor for First-Time Home Buyers
## Project Context & Product Requirements Document

> **Status:** Draft v1.1 — PM Review  
> **Last Updated:** June 2026  
> **Scope:** Jabodetabek, Web-first  
> **Stage:** Pre-MVP Definition  
> **Architecture & Feasibility:** [ARCHITECTURE.md](ARCHITECTURE.md) — canonical technical spec

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem & Opportunity](#2-problem--opportunity)
3. [Target Audience & Personas](#3-target-audience--personas)
4. [User Journey](#4-user-journey)
5. [Risk Categories](#5-risk-categories)
6. [Feature Set & Prioritization](#6-feature-set--prioritization)
7. [MVP Scope](#7-mvp-scope)
8. [Success Metrics](#8-success-metrics)
9. [Data Sources & Technical Assumptions](#9-data-sources--technical-assumptions)
10. [Competitive Landscape](#10-competitive-landscape)
11. [Product Risks & Mitigations](#11-product-risks--mitigations)
12. [Monetization Direction](#12-monetization-direction)
13. [Open Questions](#13-open-questions)
14. [Assumptions Log](#14-assumptions-log)

---

## 1. Product Overview

### Product Name
**Rumper** *(working title: Location Risk Advisor for First-Time Home Buyers)*

### Tagline
> Sebelum beli rumah, kenali risikonya.

### One-liner
Web service yang membantu pembeli rumah pertama di Jabodetabek mengevaluasi dan membandingkan risiko lokasi rumah sebelum membeli — mulai dari banjir, mobilitas harian, fasilitas sekitar, hingga prospek jangka panjang.

### Core Value Proposition
Platform listing properti menjual **rumah**. Rumper menjual **kepercayaan diri untuk memilih lokasi yang tepat**.

Kami fokus pada **location risk insight** — bukan harga, bukan foto, bukan promosi developer.

---

## 2. Problem & Opportunity

### 2.1 Problem Statement

Pembeli rumah pertama di Indonesia, khususnya Jabodetabek, menghadapi tantangan besar saat menilai kualitas dan risiko **lokasi** rumah:

- Platform properti (Rumah123, OLX, Lamudi, dll.) fokus pada **harga, foto, dan spesifikasi bangunan** — bukan risiko lokasi.
- Developer dan agen memiliki **insentif untuk menjual**, bukan untuk mendidik pembeli.
- Data lokasi (banjir, kemacetan, fasilitas) **tersebar di berbagai sumber** yang sulit diakses dan diinterpretasikan awam.
- Pembeli sering baru sadar risikonya **setelah DP dibayar** — padahal itu keputusan finansial terbesar dalam hidup mereka.

### 2.2 Root Cause

Tidak ada tool yang **mengkonsolidasi informasi risiko lokasi** menjadi insight yang mudah dipahami oleh pembeli rumah non-ahli.

### 2.3 Opportunity Size

- Jabodetabek: ~35 juta penduduk, salah satu pasar properti terbesar di Asia Tenggara.
- Rata-rata 200.000+ transaksi properti residensial per tahun di Jabodetabek (data BPS & Bank Indonesia).
- Mayoritas pembeli pertama: usia 25–40 tahun, digital-native, terbiasa riset online sebelum beli.
- **Gap pasar jelas:** tidak ada decision-support tool yang fokus pada location risk untuk pasar Indonesia.

### 2.4 Goal Produk

**Primary Goal:**
> Membantu pembeli rumah pertama menghindari risiko salah pilih lokasi sebelum mereka berkomitmen secara finansial.

**Supporting Goals:**
- Membantu user menemukan area yang sesuai dengan profil kebutuhan mereka.
- Membantu user membandingkan beberapa kandidat lokasi secara objektif.
- Meningkatkan literasi pembeli rumah pertama tentang cara menilai lokasi.

---

## 3. Target Audience & Personas

### 3.1 Primary Audience

> **Pembeli rumah pertama di Jabodetabek**, usia 25–40 tahun, berpenghasilan stabil (kelas menengah), membeli untuk **ditinggali sendiri** (bukan investasi), dengan budget terbatas yang mendorong mereka ke area pinggiran.

### 3.2 Persona Detail

#### Persona A: "Si Commuter" — Karyawan Muda (Single / Couple tanpa Anak)
| Atribut | Detail |
|---|---|
| Usia | 25–32 tahun |
| Status | Single atau baru menikah, belum punya anak |
| Pekerjaan | Karyawan swasta di pusat kota (Jakarta Pusat/Selatan/Barat) |
| Budget | Rp 500jt – 900jt |
| Area bidik | Bekasi, Depok, Tangerang Kota, Serpong |
| Kebutuhan utama | Waktu tempuh, transportasi, harga, gaya hidup |
| Pain point | "Takut rumah murah tapi tiap hari capek di jalan 3–4 jam." |
| Trigger produk | Setelah lihat listing tapi bingung akses kerjanya seperti apa |

#### Persona B: "Si Perencana" — Pasangan Muda Baru Menikah
| Atribut | Detail |
|---|---|
| Usia | 28–36 tahun |
| Status | Menikah, belum punya anak tapi merencanakan |
| Pekerjaan | Dual income, satu atau dua bekerja |
| Budget | Rp 700jt – 1.5M |
| Area bidik | Depok, Bogor, BSD, Cikarang |
| Kebutuhan utama | Keamanan, kenyamanan jangka panjang, fasilitas, prospek area |
| Pain point | "Apakah lokasi ini masih cocok kalau nanti kami punya anak?" |
| Trigger produk | Sebelum survei fisik, ingin validasi kandidat lokasi |

#### Persona C: "Si Pelindung" — Keluarga Muda dengan Anak Kecil
| Atribut | Detail |
|---|---|
| Usia | 30–40 tahun |
| Status | Menikah, punya anak 1–2 |
| Pekerjaan | Karyawan atau wiraswasta |
| Budget | Rp 800jt – 2M |
| Area bidik | Seluruh Jabodetabek, prioritas keamanan dan fasilitas |
| Kebutuhan utama | Sekolah, klinik, keamanan, risiko banjir, kenyamanan harian |
| Pain point | "Apakah lokasi ini aman dan nyaman untuk tumbuh kembang anak?" |
| Trigger produk | Saat shortlist lokasi sudah ada, butuh validasi mendalam |

### 3.3 Benang Merah: Shared Core Fear

> **Semua persona takut satu hal yang sama: membuat keputusan finansial terbesar dalam hidupnya tanpa informasi yang cukup tentang lokasi.**

### 3.4 Profil Kebutuhan User (Input untuk Personalisasi)

Data yang perlu dikumpulkan saat onboarding:

| Dimensi | Pertanyaan |
|---|---|
| Status keluarga | Single / Couple / Keluarga dengan anak |
| Rencana keluarga | Apakah berencana punya anak dalam 3 tahun? |
| Lokasi kerja | Alamat / area kantor utama |
| Moda transportasi | Kendaraan pribadi / transportasi umum / kombinasi |
| Toleransi waktu tempuh | Maks berapa menit per hari? |
| Prioritas fasilitas | Sekolah / RS / transportasi / pusat perbelanjaan |
| Budget | Range harga rumah |
| Area yang dipertimbangkan | Nama area / kecamatan / kota |

---

## 4. User Journey

### 4.1 Three Key Moments

Produk digunakan di **tiga momen kritis** dalam proses pembelian rumah:

```
[MOMEN 1]              [MOMEN 2]               [MOMEN 3]
Eksplorasi Awal   →   Evaluasi Kandidat   →   Validasi Akhir
"Area mana yang       "Dari beberapa            "Apa yang perlu
 masuk akal           ini, mana yang            saya cek sebelum
 untuk saya?"         terbaik?"                 bayar DP?"
```

### 4.2 Detail Per Momen

#### Momen 1: Eksplorasi Awal
**Konteks:** User baru mulai riset, belum punya kandidat lokasi spesifik.  
**Pertanyaan user:** *"Dengan budget saya, area mana yang relatif aman dan cocok untuk rutinitas saya?"*

**Kebutuhan:**
- Peta risiko umum Jabodetabek
- Filter berdasarkan profil user (budget, kantor, kebutuhan keluarga)
- Rekomendasi area berdasarkan profil
- Pemahaman awal risiko per area

**Output ideal:** Daftar area kandidat yang relevan + skor awal

---

#### Momen 2: Evaluasi Kandidat
**Konteks:** User sudah punya 2–5 lokasi kandidat dari listing atau rekomendasi.  
**Pertanyaan user:** *"Dari beberapa pilihan ini, mana yang risikonya paling bisa saya terima?"*

**Kebutuhan:**
- Skor risiko per lokasi (ringkas, mudah dipahami)
- Perbandingan side-by-side antar lokasi
- Estimasi waktu tempuh ke titik penting user
- Red flag alert per lokasi
- Plus-minus yang jujur

**Output ideal:** Ranking kandidat + laporan risiko per lokasi

---

#### Momen 3: Validasi Akhir (Pre-DP)
**Konteks:** User hampir memutuskan, mau booking atau bayar DP.  
**Pertanyaan user:** *"Apa yang perlu saya cek sebelum bayar?"*

**Kebutuhan:**
- Checklist survei lapangan
- Pertanyaan kritis untuk agen / developer
- Pertanyaan untuk warga sekitar
- Laporan yang bisa disimpan dan dibagikan ke pasangan / keluarga

**Output ideal:** Checklist survei + laporan shareable

---

### 4.3 Konteks Penggunaan

| Konteks | Lokasi User | Kebutuhan Utama |
|---|---|---|
| Riset online malam hari | Di rumah, desktop/laptop | Peta, perbandingan, shortlist |
| Survei fisik | Di lapangan, mobile | Checklist, red flag, catatan |
| Diskusi keputusan | Bersama pasangan/keluarga | Laporan ringkas, share |
| Negosiasi dengan agen | Bertemu agen/developer | Daftar pertanyaan, bukti data |

---

## 5. Risk Categories

Lima kategori risiko yang dinilai dan ditampilkan kepada user:

### 5.1 Risiko Alam & Lingkungan
| Sub-kategori | Indikator |
|---|---|
| Banjir | Zona rawan BNPB, kedekatan DAS, riwayat genangan |
| Polusi udara | Proximity industri, kepadatan lalu lintas, ISPU historis |
| Kebisingan | Proximity jalan tol, rel kereta, bandara, industri |
| Kepadatan | Kepadatan penduduk, density bangunan |

> **Prioritas MVP:** Risiko banjir — paling ditakuti pembeli dan datanya paling tersedia.

### 5.2 Risiko Mobilitas
| Sub-kategori | Indikator |
|---|---|
| Waktu tempuh | Estimasi ke lokasi kerja user, jam sibuk |
| Kemacetan | TomTom/Google Traffic index, pola historis |
| Transportasi umum | Jarak ke stasiun KRL, halte TransJakarta, rute |
| Akses keluar area | Single access point vs multiple, kondisi jalan utama |

### 5.3 Risiko Fasilitas Harian
| Sub-kategori | Indikator |
|---|---|
| Pendidikan | Jarak ke SD/SMP negeri berkualitas, TK, playgroup |
| Kesehatan | Jarak ke RS, klinik, apotek |
| Belanja harian | Jarak ke minimarket, pasar tradisional, supermarket |
| Hiburan & gaya hidup | Mall, restoran, co-working space (relevan untuk Persona A) |

### 5.4 Risiko Pertumbuhan Area
| Sub-kategori | Indikator |
|---|---|
| Rencana infrastruktur | Proyek jalan tol, MRT, LRT, tol baru |
| Tren harga | Historis kenaikan harga per area (data sekunder) |
| Pengembangan kawasan | Proyek developer besar, kawasan industri baru |
| Risiko stagnan | Area tanpa pertumbuhan signifikan dalam 5 tahun |

### 5.5 Risiko Akses Fisik
| Sub-kategori | Indikator |
|---|---|
| Lebar jalan | Akses kendaraan roda 4, dua arah atau tidak |
| Kondisi jalan | Beton, aspal, tanah; kondisi saat hujan |
| Akses cluster | Pintu masuk tunggal atau ganda, gerbang tol terdekat |
| Bottleneck | Jembatan sempit, perlintasan kereta, titik macet tetap |

---

## 6. Feature Set & Prioritization

### 6.1 Framework Prioritisasi

Menggunakan **RICE Score** (Reach × Impact × Confidence ÷ Effort) dan **MoSCoW** untuk MVP.

### 6.2 Feature Map

| # | Fitur | Cluster | MoSCoW | Notes |
|---|---|---|---|---|
| F01 | **Skor Kelayakan Lokasi** | Evaluation | Must | Inti produk — satu angka + breakdown per kategori |
| F02 | **Peta Risiko Banjir** | Discovery | Must | Paling dicari, data BNPB/BPBD tersedia |
| F03 | **Red Flag Alert** | Evaluation | Must | Peringatan langsung jika lokasi berisiko tinggi |
| F04 | **Profil Kebutuhan User (Onboarding)** | Personalization | Must | Tanpa ini skor tidak personal, tidak relevan |
| F05 | **Estimasi Waktu Tempuh** | Evaluation | Must | Integrasi Google Maps / HERE API |
| F06 | **Bandingkan Lokasi (2–5)** | Comparison | Should | High value tapi kompleks, bisa Phase 2 jika perlu |
| F07 | **Checklist Survei Lapangan** | Field Validation | Should | Low effort, high utility saat survei fisik |
| F08 | **Laporan Risiko (Shareable PDF/Link)** | Evaluation | Should | Dibutuhkan untuk diskusi pasangan/keluarga |
| F09 | **Rekomendasi Pertanyaan untuk Agen** | Field Validation | Should | Membantu user lebih percaya diri |
| F10 | **Layer Peta per Kategori** | Discovery | Could | Canggih tapi bisa overwhelming di MVP |
| F11 | **Simpan Shortlist Lokasi** | Comparison | Could | Perlu auth — tunda ke Phase 2 |
| F12 | **Rekomendasi Area Alternatif** | Discovery | Could | Nice to have, butuh algoritma recommendation |
| F13 | **Catatan Survei Lapangan** | Field Validation | Could | Bisa digantikan checklist dulu |
| F14 | **Confidence Score Data** | Evaluation | Should | Penting untuk kepercayaan, bisa sederhana |
| F15 | **Edukasi Pembeli Rumah Pertama** | Education | Could | Konten, tidak teknis, bisa ditambah kapan saja |

---

## 7. MVP Scope

### 7.1 MVP Core Hypothesis

> Jika pembeli rumah pertama diberi skor risiko lokasi yang jelas dan personal, mereka akan lebih percaya diri dalam mengevaluasi lokasi dan lebih sedikit membuat keputusan yang disesali.

### 7.2 MVP Feature Set

MVP fokus pada **Momen 2: Evaluasi Kandidat** — dimana user sudah punya alamat spesifik dan butuh evaluasi mendalam.

**MVP Must-Have (Phase 1):**

1. **Onboarding Profil** — User mengisi profil kebutuhan (5–7 pertanyaan) agar hasil personal
2. **Input Lokasi** — User masukkan alamat atau pin di peta
3. **Location Risk Score** — Skor 0–100 dengan breakdown 5 kategori risiko
4. **Banjir Map Layer** — Visual peta zona banjir di sekitar lokasi
5. **Waktu Tempuh ke Kantor** — Estimasi berdasarkan input lokasi kerja user
6. **Red Flag Alert** — Banner jelas jika ada risiko tinggi
7. **Confidence Label** — Label "Data Kuat / Sedang / Perlu Validasi" per data point
8. **Checklist Survei Lapangan** — Daftar yang bisa dicentang saat survei fisik

**MVP Should-Have (Phase 1 jika resource cukup):**
- Perbandingan 2 lokasi (basic)
- Laporan ringkas shareable (link atau PDF sederhana)
- Rekomendasi pertanyaan untuk agen

**Out of Scope MVP:**
- Auth / akun user (simpan shortlist)
- Rekomendasi area alternatif (butuh algoritma)
- Layer peta lengkap semua kategori
- Edukasi konten

### 7.3 MVP Primary User Flow

```
Landing Page
     │
     ▼
Onboarding (Profil User)
  - Status keluarga
  - Lokasi kerja
  - Moda transportasi
  - Fasilitas prioritas
     │
     ▼
Input Lokasi Rumah
  - Ketik alamat ATAU pin di peta
     │
     ▼
Location Risk Dashboard
  ┌─────────────────────────────────────┐
  │  Skor Kelayakan: 74/100            │
  │  ⚠️ RED FLAG: Risiko Banjir Tinggi  │
  ├─────────────────────────────────────┤
  │  🌊 Banjir         ██░░░░  Tinggi   │
  │  🚗 Mobilitas      ████░░  Sedang   │
  │  🏥 Fasilitas      █████░  Baik     │
  │  📈 Prospek Area   ████░░  Sedang   │
  │  🛣️ Akses Fisik   █████░  Baik     │
  ├─────────────────────────────────────┤
  │  Estimasi tempuh kantor: 55 menit  │
  │  [Lihat Peta] [Checklist] [Bagikan]│
  └─────────────────────────────────────┘
     │
     ├── [Tambah Lokasi Lain → Bandingkan]
     │
     └── [Download / Share Laporan]
```

### 7.4 MVP Success Condition

MVP dinyatakan berhasil jika:
- User dapat mengevaluasi 1 lokasi dari input hingga melihat skor dalam < 3 menit
- User menyatakan "informasi ini membantu keputusan saya" (via survey post-use)
- < 20% bounce rate di halaman hasil (indikator informasi dipahami)

---

## 8. Success Metrics

### 8.1 North Star Metric

> **Jumlah lokasi yang dievaluasi per bulan** (Location Evaluations per Month)

Metrik ini mencerminkan apakah produk benar-benar digunakan untuk keputusan nyata.

### 8.2 Product Metrics

| Layer | Metrik | Target Awal (3 bulan post-launch) |
|---|---|---|
| **Acquisition** | Monthly Unique Visitors | 5,000 |
| **Activation** | % User yang selesai onboarding | > 60% |
| **Activation** | % User yang lihat hasil skor | > 50% dari yang onboarding |
| **Engagement** | Avg. lokasi yang dievaluasi per sesi | > 1.5 |
| **Engagement** | % User yang buka checklist survei | > 30% |
| **Retention** | Return visit rate (7 hari) | > 25% |
| **Satisfaction** | NPS / Post-use survey score | > 40 |
| **Satisfaction** | % User bilang "sangat membantu" | > 70% |

### 8.3 Leading Indicators (Early Signal)

Indikator awal bahwa produk menuju arah benar:
- Waktu di halaman hasil > 3 menit (user membaca, bukan bounce)
- Klik "Bandingkan Lokasi Lain" > 40% user (engagement tinggi)
- Share laporan > 15% user (produk digunakan untuk diskusi nyata)

### 8.4 Anti-Metrics (Hindari)

- **Jangan optimize pageviews** — bisa dicapai dengan konten clickbait
- **Jangan optimize waktu di site** tanpa melihat apakah user tersesat atau engaged

---

## 9. Data Sources & Technical Assumptions

### 9.1 Data yang Dibutuhkan per Kategori Risiko

| Kategori | Sumber Data Kandidat | Ketersediaan | Kompleksitas |
|---|---|---|---|
| Risiko Banjir | BNPB (Geospasial), BPBD DKI/Jabar/Banten, OpenStreetMap | Tersedia (open) | Sedang |
| Waktu Tempuh | Google Maps Distance Matrix API / HERE Routing API | API berbayar | Rendah |
| Transportasi Umum | GTFS data KCI (KRL), TransJakarta open data | Tersedia (open) | Sedang |
| Fasilitas Sekitar | Google Places API, OpenStreetMap (Overpass) | API berbayar / open | Rendah |
| Kepadatan | BPS Sensus Penduduk (per kelurahan) | Tersedia | Rendah |
| Kualitas Udara | KLHK ISPU, OpenAQ | Tersedia | Rendah |
| Prospek Area | Harga historis (web scraping properti — legal risk), laporan JLL/Colliers | Kompleks | Tinggi |
| Rencana Infrastruktur | Dokumen pemerintah (RTRW), berita — semi-manual | Partial | Tinggi |

### 9.2 Tech Stack Rekomendasi (Awal)

| Layer | Pilihan Rekomendasi | Alasan |
|---|---|---|
| Frontend | Next.js + React | SSR untuk SEO, ecosystem matang |
| Map | Mapbox GL JS atau Leaflet.js + OSM | Mapbox lebih visual premium, Leaflet lebih murah |
| Backend | Node.js (Express/Fastify) atau Python (FastAPI) | Python lebih kuat untuk data processing |
| Database | PostgreSQL + PostGIS | Wajib untuk spatial data |
| Data Pipeline | Python (Pandas/GeoPandas) | Standar industri untuk geospatial ETL |
| Hosting | Vercel (frontend) + Railway/Render (backend) | Cepat untuk MVP |
| Map Tiles | OpenStreetMap / Mapbox | OSM gratis, Mapbox premium |

### 9.3 Confidence Score Framework

Karena data tidak selalu sempurna, setiap data point harus diberi label:

| Label | Kriteria |
|---|---|
| ✅ Data Kuat | Data dari sumber resmi, diperbarui < 1 tahun, resolusi kelurahan atau lebih baik |
| ⚠️ Data Sedang | Data dari sumber terpercaya tapi kurang terkini, atau resolusi kecamatan |
| 🔍 Perlu Validasi | Data estimasi, proxy, atau dari sumber tidak resmi — wajib cek lapangan |

> **Prinsip:** Lebih baik jujur tentang keterbatasan data daripada tampak absolut dan salah.

---

## 10. Competitive Landscape

### 10.1 Direct Competitors

Saat ini **tidak ada direct competitor** yang fokus pada location risk insight untuk pembeli rumah pertama di Indonesia. Ini adalah whitespace.

### 10.2 Indirect Competitors & Alternatives

| Kompetitor | Pendekatan | Gap |
|---|---|---|
| **Rumah123, OLX Properti, Lamudi** | Listing-first, fokus harga & foto | Tidak ada location risk, informasi dari developer/agen |
| **Google Maps** | Navigasi & POI | Tidak ada aggregated risk score, butuh interpretasi sendiri |
| **PetaJakarta.org / BPBD Map** | Peta banjir khusus | Hanya banjir, tidak ada UX untuk pembeli rumah |
| **Komunitas di Medsos (Facebook Group, Reddit)** | Tanya-jawab peer-to-peer | Tidak objektif, tergantung pengalaman individual |
| **Konsultan / Agen Properti** | Personal consultation | Mahal, ada bias, tidak scalable |

### 10.3 Competitive Advantage

1. **Fokus** — Satu-satunya yang fokus pada location risk untuk pembeli pertama
2. **Personalisasi** — Skor disesuaikan dengan profil hidup user, bukan generic
3. **Objektivitas** — Berbasis data, bukan opini developer atau agen
4. **Aksesibilitas** — Gratis, mudah diakses, tidak perlu expertise

---

## 11. Product Risks & Mitigations

| Risiko | Probabilitas | Dampak | Mitigasi |
|---|---|---|---|
| **Data tidak akurat** menyebabkan user salah keputusan | Sedang | Tinggi | Confidence score, disclaimer jelas, dorong validasi lapangan |
| **Produk terlalu kompleks** untuk pembeli pertama | Sedang | Tinggi | Progressive disclosure, skor ringkas dulu, detail di-expand |
| **User tidak percaya data** — skeptis terhadap skor | Sedang | Tinggi | Tampilkan sumber data, explain metodologi, label confidence |
| **Bias rekomendasi** — dianggap memihak area/developer | Rendah | Tinggi | Jelas pisahkan data vs opini, no paid placement di MVP |
| **User over-reliance** — tidak survei fisik sama sekali | Sedang | Sedang | CTA checklist survei di setiap hasil, disclaimer prominent |
| **Data stale** — banjir atau kondisi berubah | Sedang | Sedang | Tampilkan timestamp data, refresh schedule regular |
| **Low trust first visit** — user tidak percaya tool baru | Tinggi | Sedang | Social proof, partner dengan komunitas, transparansi metodologi |
| **Monetisasi mengkompromikan netralitas** | Rendah | Tinggi | Clear editorial policy sejak awal, no pay-to-play scoring |

---

## 12. Monetization Direction

### 12.1 Prinsip Monetisasi

> **Netralitas adalah aset terbesar Rumper.** Monetisasi tidak boleh mengkompromikan kepercayaan user terhadap objektivitas data.

### 12.2 Jalur Monetisasi yang Dipertimbangkan

| Model | Timing | Potensi | Risiko Netralitas |
|---|---|---|---|
| **Freemium** — Report lengkap berbayar | Post-MVP | Sedang | Rendah |
| **Subscription** — Akses penuh untuk multiple lokasi | Phase 2 | Sedang | Rendah |
| **Lead gen ke agen/broker** — User opt-in connect ke agen | Phase 2 | Tinggi | Sedang — perlu transparan |
| **B2B API** — Jual data/API ke platform properti, bank, developer | Phase 3 | Tinggi | Rendah (B2B, tidak terlihat user) |
| **Branded content** — Edukasi artikel bersponsor | Phase 2 | Rendah | Sedang — harus jelas "sponsored" |
| **Mortgage / KPR referral** — Partnership bank/multifinance | Phase 3 | Tinggi | Rendah jika transparan |

### 12.3 Prioritas Monetisasi MVP

Untuk MVP: **tidak ada monetisasi.** Fokus pada validasi produk dan kepercayaan user.

---

## 13. Open Questions

Pertanyaan yang perlu dijawab sebelum atau selama pengembangan:

| # | Pertanyaan | Prioritas | Owner |
|---|---|---|---|
| Q1 | Apa metode scoring risiko yang akan digunakan? (weighted average? ML?) | Tinggi | Product + Data |
| Q2 | Data banjir resolusi berapa yang tersedia dari BNPB/BPBD? Kelurahan? Grid? | Tinggi | Data |
| Q3 | Apakah produk hanya untuk rumah tapak atau juga apartemen? | Sedang | Product |
| Q4 | Bagaimana menangani lokasi yang datanya sangat terbatas? | Sedang | Data |
| Q5 | Apakah user perlu akun untuk menyimpan hasil? (friction vs utility) | Sedang | Product |
| Q6 | Format laporan apa yang paling mudah dishare — PDF, link, atau WhatsApp preview? | Sedang | Product |
| Q7 | Siapa yang update data rencana infrastruktur? Manual atau ada sumber API? | Tinggi | Data |
| Q8 | Bahasa produk: Bahasa Indonesia murni atau ada elemen Inggris? | Rendah | Product |
| Q9 | Apa metrik paling penting untuk menentukan MVP sukses (gating metric)? | Tinggi | Product |
| Q10 | Channel akuisisi user pertama: komunitas, SEO, atau partnership? | Tinggi | Growth |

---

## 14. Assumptions Log

Catatan asumsi yang diambil dalam dokumen ini — perlu divalidasi:

| ID | Asumsi | Cara Validasi |
|---|---|---|
| A1 | Pembeli rumah pertama mau meluangkan 5–10 menit untuk onboarding profil | User interview / usability test |
| A2 | Data banjir dari BNPB cukup akurat dan tersedia untuk seluruh Jabodetabek | Riset data awal |
| A3 | Google Maps API cukup akurat untuk estimasi waktu tempuh Jabodetabek | Pilot test beberapa rute |
| A4 | User akan datang kembali saat evaluasi kandidat baru (return behavior) | Analisis 30 hari post-launch |
| A5 | User lebih percaya data dengan label sumber daripada skor tanpa penjelasan | A/B test atau user interview |
| A6 | Risiko banjir adalah kategori paling dicari dan paling memengaruhi keputusan | Survey user pre-launch |
| A7 | User tidak keberatan menggunakan web (bukan app) untuk riset properti | Analytics device usage |

---

*Dokumen ini adalah living document. Update setiap sprint seiring validasi asumsi dan progress pengembangan.*

---

**Next Steps:**
- [x] Arsitektur & feasibility spec — lihat [ARCHITECTURE.md](ARCHITECTURE.md)
- [ ] Jalankan gate DF-1 s/d DF-4 (data feasibility) — detail di ARCHITECTURE.md §6.1
- [ ] Validasi Q1 (metode scoring) — default PoC: RLS V1 rule-based (ARCHITECTURE.md §4.3)
- [ ] Pilot data banjir BNPB — cek ketersediaan dan resolusi data
- [ ] User interview 5–10 calon pembeli rumah pertama untuk validasi persona dan pain point
- [ ] Wireframe low-fidelity flow utama: Onboarding → Input Lokasi → Risk Dashboard
- [ ] Konversi keputusan terbuka ke ADR saat implementasi dimulai (ARCHITECTURE.md §9)
