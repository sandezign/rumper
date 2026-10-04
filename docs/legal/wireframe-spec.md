# Wireframe & Layout Specification: Legal & Trust Hub
**Project:** Rumper (`rumper.id`) — Location Risk Advisor  
**Target Routes:** `/terms`, `/privacy`, `/security`  
**Version:** 1.0 (Annotated Mid-Fi Specification)  
**Author:** Product & UX Design Team  
**Date:** 2026-10-04  

---

## 1. Arsitektur Layout Global (`LegalLayout`)

Ketiga halaman legal menggunakan arsitektur *layout shell* terpadu untuk memastikan kenyamanan membaca dokumen panjang (*long-form readability*), navigasi instan antar-pasal (*sticky table of contents*), dan konsistensi identitas merek Rumper.

### 1.1 Diagram ASCII Wireframe: Global Shell (Desktop >= 1024px)

```
+-----------------------------------------------------------------------------------+
| [1] STICKY TOPBAR / HEADER (Height: 64px, z-index: 50, backdrop-blur)             |
| [Logo + Brand]    [Breadcrumb: Beranda > Legal > {PageTitle}]  [Theme Toggle] [CTA] |
+-----------------------------------------------------------------------------------+
| [2] READING PROGRESS BAR (Height: 3px, Teal/Accent line based on scroll %)       |
+-----------------------------------------------------------------------------------+
|                                                                                   |
|  [3] HERO BANNER SECTION (Centered or Left-Aligned, Container: max-w-5xl)        |
|      [Badge: Kategori Hukum / Keamanan]                                           |
|      H1: {Judul Halaman} (e.g., "Kebijakan Privasi", "Syarat Layanan", "Keamanan")|
|      Lead Text: (1–2 kalimat ringkasan ramah pengguna / plain-language)           |
|      Meta Info: [Terakhir Diperbarui: 4 Oktober 2026] · [Kepatuhan: UU PDP]       |
|                                                                                   |
+-----------------------------------------------------------------------------------+
| MAIN CONTENT AREA (Grid 12-Kolom, Gap: 32px, max-w-6xl mx-auto)                  |
|                                                                                   |
|  LEFT / ASIDE (3 Kolom)           |  RIGHT / ARTICLE CONTENT (9 Kolom / max-w-3xl) |
|  [Sticky Top: 96px]               |                                               |
|  +------------------------------+ |  [4] QUICK SUMMARY CARD (Callout Box)          |
|  | [5] TABLE OF CONTENTS (TOC)  | |      "Inti Ringkasan Pasal / Komitmen"        |
|  | - 1. Definisi & Ruang Lingkup| |                                               |
|  | - 2. Prinsip Independensi    | |  [6] SECTION 1 (H2 + Paragraf Isi)            |
|  | - 3. Batasan Tanggung Jawab  | |      - Teks reguler, bullet point, link       |
|  | - 4. Akun & Tanggung Jawab   | |                                               |
|  | - 5. Larangan Penggunaan     | |  [7] SECTION 2 (Data Tables / Visual Cards)   |
|  | - 6. Layanan Berbayar        | |      - Format tabel sub-pemroses / pilar card |
|  | ... (Active state indicator) | |                                               |
|  |                              | |  [8] DPO / RESPONSIBLE DISCLOSURE BOX         |
|  | [Dokumen Lainnya]            | |      - Card kontak resmi, email & WA          |
|  | - Syarat Layanan             | |                                               |
|  | - Kebijakan Privasi          | |  [9] BOTTOM NAVIGATION                        |
|  | - Keamanan Sistem            | |      [<- Kembali ke Beranda]  [Cek Risiko ->] |
|  +------------------------------+ |                                               |
+-----------------------------------------------------------------------------------+
| [10] GLOBAL FOOTER BAR (Compact Utility Footer, matches LandingV2)                |
| (C) 2026 Rumper · Jabodetabek · [Harga] [Syarat] [Privasi] [Keamanan] [Kontak WA] |
+-----------------------------------------------------------------------------------+
```

### 1.2 Diagram ASCII Wireframe: Mobile Layout (< 768px)

```
+---------------------------------------------------+
| [Logo]                    [TOC Pill] [Theme] [Menu]|
+---------------------------------------------------+
| [Reading Progress Bar: 2px]                       |
+---------------------------------------------------+
| [Badge]                                           |
| H1: {Judul Halaman}                               |
| Subtitle / Lead Paragraf                          |
| Tanggal Pembaruan                                 |
+---------------------------------------------------+
| [DROPDOWN / ACCORDION TOC: "Lompat ke Pasal v"]   |
+---------------------------------------------------+
| [Quick Summary Callout Box]                       |
|                                                   |
| [H2 Section Content]                              |
| Paragraf (line-height: 1.7, font-size: 16px)      |
|                                                   |
| [Visual Cards / Horizontal Scroll Table]          |
|                                                   |
| [DPO / Kontak Box]                                |
|                                                   |
| [Bottom CTA Button]                               |
+---------------------------------------------------+
| [Mobile Footer]                                   |
+---------------------------------------------------+
```

---

## 2. Layout Konsep 1: Syarat Layanan (`/terms`)

Halaman ini berfokus pada **kejelasan legalitas, independensi, dan batasan tanggung jawab** dengan gaya pembacaan editorial modern.

### 2.1 Spesifikasi Komponen & Prioritas Konten

| Prioritas | Komponen | Tipe Elemen | Keterangan & Karakter |
|---|---|---|---|
| **P1** | Sticky Header & Breadcrumbs | Navigation | Menjaga konteks navigasi; user bisa kembali ke Home setiap saat. |
| **P2** | Hero Title & Last Updated | Header (`H1`) | Judul jelas dengan tanggal revisi untuk kepastian hukum. |
| **P3** | *Independence Callout Banner* | Blockquote Alert | Box dengan border aksen: *"Rumper 100% Independen, Tanpa Komisi Pengembang"*. |
| **P4** | Sticky Table of Contents | Aside Nav | Memungkinkan lompatan langsung ke pasal spesifik (misal: *Refund* atau *Disclaimer*). |
| **P5** | Content Sections (Pasal 1–10) | Typography (`H2`, `p`, `ul`) | Jarak antar paragraf lega (`space-y-4`), penomoran terstruktur. |
| **P6** | Saluran Kontak & Aduan | Card Contact | Box email `legal@rumper.id` dan WhatsApp resmi. |

### 2.2 Wireframe Rinci `/terms`

```
================================================================================
BREADCRUMB: Beranda / Legalitas / Syarat Layanan
--------------------------------------------------------------------------------
[BADGE: KETENTUAN PENGGUNAAN]
H1: Syarat dan Ketentuan Layanan
Sub: "Pedoman transparansi hak, batasan analisis data, dan prinsip independensi Rumper."
Tanggal Berlaku: 4 Oktober 2026 | Estimasi Baca: 5 Menit
================================================================================

+------------------------------------------------------------------------------+
| [!] KOTAK INDEPENDENSI RUMPER                                                |
| "Rumper tidak menerima komisi developer atau bertindak sebagai agen properti.|
| Evaluasi kami disusun 100% independen berbasis data geospasial aktual."      |
+------------------------------------------------------------------------------+

TOC JUMP-LINKS (Mobile: Dropdown | Desktop: Sticky Sidebar):
1. Definisi & Ruang Lingkup       5. Larangan Penggunaan (Anti-Scraping)
2. Prinsip Independensi            6. Layanan Berbayar & Kebijakan Refund
3. Batasan Tanggung Jawab          7. Hak Kekayaan Intelektual
4. Akun & Tanggung Jawab Akses    8. Penyelesaian Sengketa & Kontak

--------------------------------------------------------------------------------
H2: 1. Definisi dan Ruang Lingkup Layanan
    P: Rumper ("Kami", "Platform") menyediakan data geospasial pendukung keputusan...
    P: Layanan mencakup skor banjir, kalkulasi jam sibuk, dan laporan digital...

--------------------------------------------------------------------------------
H2: 2. Prinsip Independensi (Tanpa Afiliasi Pengembang)
    P: Menegaskan bahwa rekomendasi dan scoring tidak dipengaruhi sponsorship...

--------------------------------------------------------------------------------
H2: 3. Batasan Tanggung Jawab & Sifat Informasi (Disclaimer)
    +--------------------------------------------------------------------------+
    | PENTING: Sifat Pendukung Keputusan (Decision Support Only)               |
    | - Bukan jaminan legalitas sertifikat tanah BPN/PTSL                      |
    | - Bukan nasihat notaris / perbankan KPR                                  |
    | - Wajib lakukan Ground Check & verifikasi fisik sebelum bayar DP         |
    +--------------------------------------------------------------------------+

--------------------------------------------------------------------------------
H2: 5. Larangan Penggunaan (Acceptable Use Policy)
    - Dilarang web scraping otomatis atau ekstraksi database geospasial
    - Dilarang menjual ulang laporan untuk entitas komersial kompetitor

--------------------------------------------------------------------------------
H2: 6. Layanan Berbayar & Kebijakan Pengembalian (Refund)
    P: Pengiriman instan barang digital (instant delivery) non-refundable kecuali...

--------------------------------------------------------------------------------
[KARTU KONTAK BANTUAN HUKUM]
Pertanyaan seputar ketentuan ini? Hubungi legal@rumper.id | WA: +62 812-8900-0000
```

---

## 3. Layout Konsep 2: Kebijakan Privasi (`/privacy`)

Halaman ini berfokus pada **kepatuhan UU PDP No. 27/2022**, transparansi pengumpulan data komuter, dan penegasan bahwa Rumper **tidak menjual data ke broker**.

### 3.1 Spesifikasi Komponen & Prioritas Konten

| Prioritas | Komponen | Tipe Elemen | Keterangan & Karakter |
|---|---|---|---|
| **P1** | Zero-Sale Anti-Spam Pledge | Hero Callout | Box berlatar halus: *"Rumper TIDAK PERNAH menjual data pencarian atau kontak ke broker/developer"*. |
| **P2** | UU PDP Compliance Tag | Chip / Badge | Menampilkan status kepatuhan UU No. 27/2022. |
| **P3** | Taksonomi Data Koleksi | Grid 3 Kolom | Membagi data: (1) Diberikan Langsung, (2) Otomatis/Log, (3) Transaksi. |
| **P4** | Matriks Pihak Ketiga (Sub-Pemroses) | Responsive Table | Tabel transparan mitra cloud (GCP, Google Routes, Midtrans). |
| **P5** | 7 Hak Subjek Data (UU PDP) | Icon Checklist Grid | Daftar hak akses, koreksi, dan penghapusan data (*Right to Erasure*). |
| **P6** | Kotak DPO & Form Email | Interactive Card | Email resmi Pejabat Perlindungan Data: `privasi@rumper.id`. |

### 3.2 Wireframe Rinci `/privacy`

```
================================================================================
BREADCRUMB: Beranda / Legalitas / Kebijakan Privasi
--------------------------------------------------------------------------------
[BADGE: PELINDUNGAN DATA PRIBADI (UU PDP NO. 27/2022)]
H1: Kebijakan Privasi Rumper
Sub: "Bagaimana kami menjaga kerahasiaan rute komuter, preferensi hunian, dan data akun Anda."
Terakhir Diperbarui: 4 Oktober 2026
================================================================================

+------------------------------------------------------------------------------+
| [SHIELD ICON] IKRAR PERLINDUNGAN KONSUMEN:                                  |
| "Kami TIDAK MENJUAL atau menyewakan nomor telepon, rute kerja, atau lokasi    |
| rumah incaran Anda kepada pihak sales, agen broker, maupun pengembang."      |
+------------------------------------------------------------------------------+

H2: 1. Data yang Kami Kumpulkan
+-------------------------+-------------------------+--------------------------+
| DATA LANGSUNG           | DATA OTOMATIS           | DATA TRANSAKSI           |
| - Akun Google (Nama/Email)| - IP Address & Perangkat| - Status Pembayaran      |
| - Lokasi Kantor & Hunian | - Waktu Akses & Browser | - Referensi Gateway      |
| - Jam Berangkat Kerja   | - Token Sesi (HttpOnly) | (Tanpa simpan No Kartu!) |
+-------------------------+-------------------------+--------------------------+

H2: 2. Mitra Sub-Pemroses Data (Data Processors)
+------------------------+-------------------------------+---------------------+
| Kategori Mitra         | Nama Layanan                  | Tujuan              |
+------------------------+-------------------------------+---------------------+
| Cloud & Database       | Google Cloud Platform (GCP)   | Hosting & Storage   |
| Kalkulasi Macet        | Google Maps Routes API        | Simulasi Jam Sibuk  |
| Peta Kebencanaan       | InaRISK BNPB / BIG            | Zona Rawan Banjir   |
| Payment Gateway        | Mitra Berlisensi Bank Indo    | Pembayaran Digital  |
+------------------------+-------------------------------+---------------------+

H2: 3. Hak Anda Menurut UU PDP (Bab VI)
[✓] 1. Hak Akses & Salinan Data       [✓] 5. Hak Penarikan Persetujuan
[✓] 2. Hak Koreksi & Pembaruan         [✓] 6. Hak Pembatasan Pemrosesan
[✓] 3. Hak Penghapusan (Erasure)      [✓] 7. Hak Portabilitas Data
[✓] 4. Hak Kejelasan Identitas

+------------------------------------------------------------------------------+
| [DPO CARD] INGIN MENGAJUKAN HAK AKSES ATAU PENGHAPUSAN DATA?                |
| Kirimkan permohonan ke Pejabat Pelindungan Data: privasi@rumper.id           |
| Waktu respons: Maksimal 3x24 jam kerja (Verifikasi identitas diperlukan)    |
+------------------------------------------------------------------------------+
```

---

## 4. Layout Konsep 3: Keamanan Sistem (`/security`)

Mengadopsi pendekatan **Memverr (`/security`)** dengan kartu modular visual interaktif berstandar enterprise untuk membangun kepercayaan teknis tertinggi.

### 4.1 Spesifikasi Komponen & Prioritas Konten

| Prioritas | Komponen | Tipe Elemen | Keterangan & Karakter |
|---|---|---|---|
| **P1** | Security Hero Header | Centered Header | Headline bergaya enterprise: *"Keamanan Data Anda Adalah Prioritas Utama Kami"*. |
| **P2** | 6 Pilar Keamanan Visual | 2x3 Grid Cards (Desktop) | Kartu berbingkai (Border tebal elegan, ikon SVG, Heading + Deskripsi padat). |
| **P3** | Technical Benchmark Matrix | Quick Specs Table | Ringkasan standar: TLS 1.3, AES-256, Zero Card Storage, Backup 24 Jam. |
| **P4** | Responsible Disclosure Card | Callout Box | Prosedur bagi peneliti keamanan melaporkan *bug/vulnerability*. |
| **P5** | Direct WhatsApp & Action Bar | Dual Button CTA | Tombol: `[Laporkan Masalah Keamanan]` dan `[Baca Kebijakan Privasi]`. |

### 4.2 Wireframe Rinci `/security`

```
================================================================================
[BADGE: KEAMANAN TINGKAT ENTERPRISE]
H1: Security & Data Protection
Sub: "Infrastruktur cloud berlapis, enkripsi mutakhir, dan komitmen keamanan tanpa kompromi."
Terakhir Diperbarui: 4 Oktober 2026
================================================================================

GRID 6 PILAR KEAMANAN (2 Kolom di Desktop / 1 Kolom di Mobile):
+------------------------------------+-----------------------------------------+
| [IKON LOCK]                        | [IKON SHIELD-CHECK]                     |
| 1. Enkripsi SSL/TLS 256-bit        | 2. Enkripsi Data Tersimpan (At-Rest)    |
| Seluruh transit data peramban ke   | Database dan backup dienkripsi dengan   |
| server diamankan dengan TLS 1.3    | standar industri AES-256 menggunakan    |
| dan HSTS untuk cegah penyadapan.   | isolasi Cloud KMS.                      |
+------------------------------------+-----------------------------------------+
| [IKON SERVER]                      | [IKON KEY]                              |
| 3. Infrastruktur Cloud GCP         | 4. Autentikasi Google OAuth 2.0         |
| Dihosting di pusat data Google     | Login tanpa password rawan bocor. Sesi  |
| bersertifikasi ISO 27001 & SOC 2/3 | dilindungi token JWT aman berbendera    |
| dengan proteksi firewall VPC & WAF.| HttpOnly dan perlindungan CSRF.         |
+------------------------------------+-----------------------------------------+
| [IKON CREDIT-CARD-OFF]             | [IKON REFRESH-CW]                       |
| 5. Zero Financial Data Storage     | 6. Pencadangan Otomatis & DR            |
| Pembayaran diproses 100% oleh mitra| Snapshot harian otomatis disimpan di    |
| gerbang berlisensi BI (PCI-DSS L1).| zona terpisah untuk kesiapan pemulihan  |
| Kami tak pernah simpan nomor kartu.| bencana (Disaster Recovery).            |
+------------------------------------+-----------------------------------------+

--------------------------------------------------------------------------------
TABEL SPESIFIKASI TEKNIS SINGKAT
+----------------------------+-------------------------------------------------+
| Enkripsi In-Transit        | TLS 1.3 / SSL 256-bit (HSTS Enforced)           |
| Enkripsi At-Rest           | AES-256 Cloud Encrypted Storage                 |
| Kepatuhan Transaksi        | PCI-DSS Level 1 via Licensed Payment Gateway    |
| Pemulihan Cadangan         | Otomatis setiap 24 Jam (Geo-redundant)          |
| Audit Aktivitas Server     | 24/7 Monitoring & Automated Threat Detection    |
+----------------------------+-------------------------------------------------+

--------------------------------------------------------------------------------
+------------------------------------------------------------------------------+
| [BUG BOUNTY / RESPONSIBLE DISCLOSURE BANNER]                                 |
| Menemukan celah keamanan pada sistem Rumper?                                 |
| Laporkan secara bertanggung jawab ke: security@rumper.id                      |
| Tim kami merespons dalam 2x24 jam dan menjamin perlindungan bagi pelapor.    |
|                                                                              |
| [Button: Laporkan via Email]          [Button: Hubungi via WhatsApp]         |
+------------------------------------------------------------------------------+
```

---

## 5. Pertimbangan UX, Aksesibilitas (A11y), & Responsivitas

1. **Optimal Reading Length (Ukuran Baris):**
   - Kolom teks dibatasi maksimal `65ch` hingga `75ch` (`max-w-3xl`, ~780px) untuk mencegah kelelahan mata saat membaca dokumen pasal panjang.
2. **Scroll Spy & Active Anchor Highlighting:**
   - TOC di sisi kiri desktop secara otomatis memberikan tanda visual (*active highlight teal/blue*) pada pasal yang sedang berada di viewport layar.
3. **Contrast Ratio (WCAG 2.2 AA Compliance):**
   - Warna teks body: kontras minimal 4.5:1 terhadap latar belakang (baik pada Light Mode krem/putih maupun Dark Mode).
   - Tautan navigasi dan link pasal memiliki indikator visual yang jelas (*underline* atau *focus-visible ring* saat diakses via keyboard Tab).
4. **Print Stylesheet (`@media print`):**
   - Sembunyikan sticky header, sidebar TOC, dan tombol CTA saat pengguna mencetak atau menyimpan halaman ke file PDF (Ctrl+P / Cmd+P).
5. **SEO & Social Share (OpenGraph):**
   - Metadata lengkap per halaman:
     - `/terms` → *"Syarat dan Ketentuan Layanan Rumper: Ketentuan Penggunaan dan Batasan"*
     - `/privacy` → *"Kebijakan Privasi Rumper: Pelindungan Data dan Privasi Konsumen"*
     - `/security` → *"Keamanan Sistem & Data Rumper: Proteksi Infrastruktur dan Enkripsi"*
