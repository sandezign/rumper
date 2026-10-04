# STD-CNT-001: Standar Product Knowledge, Voice, dan Terminologi Rumper

## Kontrol Dokumen

| Item | Definisi |
|---|---|
| **ID Dokumen** | STD-CNT-001 |
| **Judul** | Standar Product Knowledge, Voice, dan Terminologi Rumper |
| **Pemilik Standar** | Product Lead & Head of Content/UX |
| **Pihak Pemberi Persetujuan** | Lead Architect & Brand Guardian |
| **Berlaku Untuk** | Seluruh landing page, onboarding wizard, core workspace, report PDF, prompt engineering AI, dan materi komunikasi Rumper |
| **Status** | Active / Living Source of Truth |
| **Tanggal Efektif** | 2026-10-02 |
| **Terkait** | `docs/prd/landing-and-access/landing-v2-gap-analysis.md`, `docs/standards/report-template-system-standard.md`, `docs/07-scoring-and-confidence.md`, `frontend/docs/design/foundations/tokens.md` |

---

## 1. Latar Belakang & Tujuan

Dokumen ini dibentuk menyusul temuan audit gap antara materi akuisisi (Landing Page) dan kenyataan sistem analitik (Core Workspace). Perbedaan istilah, pergeseran taksonomi kategori, dan over-promise fitur teknis dapat merusak kredibilitas Rumper sebagai auditor independen.

**Tujuan Standar Ini:**
1. **Mencegah Drift Terminologi:** Memastikan satu konsep memiliki satu nama kanonikal yang sama dari landing page hingga laporan PDF.
2. **Menjaga Batasan Fakta Produk (Product Truth):** Menjadi batas tegas mengenai apa yang sistem Rumper bisa dan tidak bisa sediakan hari ini.
3. **Membakukan Nada Bicara (Tone of Voice):** Menjaga karakter suara Rumper sebagai *pelindung keputusan pembeli rumah* yang objektif, tenang, dan berbasis data.
4. **Membasmi Jargon Teknis:** Menerjemahkan istilah spasial/geospasial mentah menjadi bahasa yang dapat dipahami pembeli rumah pertama (*first-time homebuyers*).

---

## 2. Prinsip Komunikasi Rumper

1. **Buyer-Side Protector (Bukan Agen Penjual):** Rumper melayani kepentingan pembeli sebelum komitmen booking fee/DP. Rumper bukan cheerleader perumahan, bukan penasihat investasi spekulatif, dan bukan portal listing yang bergantung pada komisi developer.
2. **Ketenangan Berbasis Bukti (Evidence-Grounded Calm):** Rumper tidak menggunakan gaya bahasa *fear-mongering* (menakut-nakuti secara berlebihan) ataupun *false reassurance* (memberikan rasa aman palsu). Fakta disajikan dingin, jelas, dan proporsional.
3. **Prinsip "No Data != Low Risk":** Ketiadaan data sensor tidak pernah diartikan sebagai "wilayah aman". Setiap celah data dinyatakan secara jujur sebagai *Evidence Gap* dengan instruksi konfirmasi lapangan.
4. **AI Berada di Bawah Bukti Deterministik:** Asisten AI (`report_qa`) bertindak sebagai pemandu tanya-jawab yang terikat (*grounded*) pada fakta laporan, bukan pembuat skor halusinatif.
5. **Bahasa Manusiawi di Atas Jargon Teknik:** Angka koordinat, model elevasi, dan data poligon selalu diterjemahkan ke dalam implikasi nyata sehari-hari bagi penghuni rumah.

---

## 3. Product Feature Truth Matrix (Batas Kemampuan Produk)

Tabel ini adalah acuan mutlak bagi tim copywriting, marketing, PRD, dan UI. **Dilarang keras menjanjikan fitur di luar status 'Aktif Hari Ini'.**

| Kemampuan / Fitur | Status Hari Ini | Implementasi Teknis | Aturan Komunikasi & Copy |
|---|:---:|---|---|
| **Audit Risiko 5 Faktor** | ✅ **Aktif Hari Ini** | `backend/app/services/scoring.py` (`STD-SCR-001`) | Selalu sebutkan **5 Kategori Standar**: Banjir, Commute, Akses, Fasilitas, Lingkungan. Jangan dikurangi jadi 4 atau dilebihkan jadi 6. |
| **Deteksi Zona Rawan Banjir** | ✅ **Aktif Hari Ini** | InaRISK BNPB + DEM elevasi tanah + poligon kelurahan BIG | Jelaskan sebagai potensi genangan berkala dan posisi kontur tanah relatif rendah. Hindari klaim prediksi cuaca real-time. |
| **Simulasi Jam Sibuk Commute** | ✅ **Aktif Hari Ini** | Google Routes API (07.00–08.30 WIB vs off-peak) | Nyatakan sebagai rasio kemacetan komuter terukur saat jam kerja menuju gerbang tol dan stasiun terdekat. |
| **Deteksi Bahaya Fisik (Red Flag)** | ✅ **Aktif Hari Ini** | Radius OSM: SUTET (≤250m), TPA (≤1.5km), Rel KA, Kawasan Industri | Jelaskan sebagai perimeter jarak aman infrastruktur fisik yang dapat mempengaruhi kenyamanan dan kesehatan jangka panjang. |
| **Pemetaan Fasilitas Esensial** | ✅ **Aktif Hari Ini** | OSM POI dalam radius 3 km (Kesehatan, Sekolah, Retail) | Nyatakan jumlah fasilitas aktif terdekat untuk kebutuhan darurat dan harian keluarga. |
| **Celah Bukti (Evidence Gap)** | ✅ **Aktif Hari Ini** | Tahap 02 accordion fallback & confidence level | Tonjolkan sebagai keunggulan transparansi Rumper: data yang belum ada sensornya tidak dianggap aman semu. |
| **Contekan Investigasi Lapangan** | ✅ **Aktif Hari Ini** | Tahap 04 checklist investigasi satpam/warga | Posisikan sebagai alat bantu fisik saat survei lapangan sebelum keluar uang DP. |
| **Komparasi Koridor Wilayah** | 🟡 **Beta / Terbatas** | `AreasHubV2.tsx` (shortlist koridor Jabodetabek) | Komparasi saat ini berlaku untuk koridor wilayah makro. Jangan janjikan matriks komparasi 2 rumah mikro side-by-side dalam satu workspace sebelum fiturnya live. |
| **Paket Multi-Properti (30 Hari)** | 🟡 **Roadmap Komersial** | Kuota profil/intake (`GAP-12`) | Dapat dipromosikan sebagai paket pencarian aktif, namun pengoperasiannya bertahap per audit lokasi. |
| **Data Kriminalitas / Kejahatan** | ❌ **NON-GOAL / TIDAK ADA** | Tidak ada pipeline data | **DILARANG MENGKLAIM DATA KRIMINALITAS.** Hapus seluruh sebutan angka/riwayat kriminalitas dari landing page dan materi promosi. |
| **Data Gempa Bumi Mikro** | ❌ **NON-GOAL / TIDAK ADA** | Tidak masuk model skor aktif | **DILARANG MENGKLAIM SENSOR GEMPA.** Fokuskan bahaya alam pada banjir dan kontur tanah. |
| **Legalitas Tanah & Izin Developer** | ❌ **NON-GOAL / TIDAK ADA** | Di luar yurisdiksi layanan | **DILARANG MENGKLAIM VERIFIKASI HUKUM/SENGKETA.** Rumper adalah auditor spasial fisik, bukan penasihat hukum/notaris. |
| **Proyeksi Hidup 3–5 Tahun Spekulatif** | ❌ **NON-GOAL / TIDAK ADA** | Tidak ada algoritma futuristik | Audit Rumper adalah evaluasi faktual titik waktu saat ini (*point-in-time assessment*). |

---

## 4. Kamus Terminologi Resmi (Canonical Glossary)

Gunakan istilah resmi di kolom **Wajib Digunakan**. Hindari sinonim liar di kolom **Dilarang / Usang**.

| Konsep Produk | Istilah Wajib (Canonical) | Istilah Dilarang / Usang | Definisi Konsumen (User-Facing) |
|---|---|---|---|
| **Nilai Skor Keseluruhan** | **Indeks Risiko Lokasi** *(atau Skor Lokasi Rumper)* | ~~Location Risk Index~~, ~~Skor Kelayakan Personal~~, ~~Indeks Keselarasan Hidup~~ | Angka 0–100 yang merangkum tingkat keamanan dan kenyamanan lokasi berdasarkan data objektif. |
| **Dimensi 1: Banjir** | **Ketahanan Banjir** | ~~Risiko Bencana~~, ~~Banjir & Alam~~, ~~Hazard Zone~~ | Evaluasi potensi genangan musiman, batas kerawanan InaRISK BNPB, dan posisi kontur tanah perumahan. |
| **Dimensi 2: Komuter** | **Efisiensi Commute** | ~~Waktu Tempuh & Mobilitas~~, ~~Akses Jalan & Prospek~~ | Perbandingan waktu tempuh berkendara dan angkutan umum antara jam sibuk pagi vs waktu normal. |
| **Dimensi 3: Jalan** | **Akses Fisik & Jalan** | ~~Konektivitas Jalanan~~, ~~Aksesibilitas Fisik~~ | Akses ke gerbang tol terdekat, lebar jalan lingkungan, dan potensi penyempitan (*bottleneck*) keluar perumahan. |
| **Dimensi 4: Fasilitas** | **Fasilitas Esensial** | ~~Kelayakan Sekitar~~, ~~Sekitar~~, ~~POI Amenities~~ | Ketersediaan fasilitas harian krusial (rumah sakit darurat, klinik, sekolah, pasar) dalam radius 3 km. |
| **Dimensi 5: Lingkungan** | **Lingkungan & Red Flag** | ~~Bahaya Fisik Sekitar~~, ~~Kondisi Lingkungan~~ | Pemeriksaan jarak aman dari menara SUTET, tempat pembuangan sampah (TPA), kawasan industri, dan rel kereta. |
| **Celah Data** | **Evidence Gap** *(atau Celah Bukti)* | ~~Data Kosong~~, ~~Missing Data~~, ~~Data Error~~, ~~Belum Terisi~~ | Penanda jujur bahwa titik lokasi belum memiliki riwayat sensor resmi, sehingga wajib ditanyakan langsung ke warga sekitar. |
| **Validitas Bukti** | **Tingkat Bukti** *(Tinggi / Sedang / Rendah)* | ~~Tingkat Akurasi~~, ~~Confidence Level API~~, ~~Skor Validitas~~ | Derajat kelengkapan sensor dan ketepatan koordinat yang mendasari suatu temuan. |
| **Panduan Survei** | **Contekan Investigasi Lapangan** | ~~Field Checklist~~, ~~Panduan Mandiri~~, ~~Daftar Periksa Lapangan~~ | Daftar pertanyaan taktis yang dibekalkan kepada pembeli untuk ditanyakan langsung kepada satpam, tetangga, atau pengurus RT/RW. |
| **Temuan Bahaya** | **Peringatan Kritis** *(atau Red Flag)* | ~~Zona Bahaya Mutlak~~, ~~Fatal Flaw~~, ~~Danger Warning~~ | Temuan lokasi berjarak dekat dengan bahaya fisik (misal: SUTET < 250m) yang wajib diketahui sebelum bayar DP. |
| **Janji Merek Utama** | **Lebih Yakin Sebelum DP** | ~~Beli Rumah Tanpa Ragu~~, ~~100% Aman Berinvestasi~~ | Janji perlindungan keputusan rasional agar pembeli terhindar dari penyesalan finansial puluhan tahun. |

---

## 5. Kamus Penerjemahan Jargon Spasial ke Bahasa Konsumen

| Jargon Teknis / Singkatan Developer | Terjemahan Bahasa Konsumen yang Ramah | Contoh Penggunaan yang Benar |
|---|---|---|
| **mdpl / DEM (Digital Elevation Model)** | Kontur elevasi tanah / posisi tanah relatif terhadap sekitar | *"Posisi tanah perumahan relatif rendah dibanding area sekitar, berpotensi menampung air limpasan."* |
| **POI (Point of Interest)** | Fasilitas esensial / fasilitas harian | *"18 fasilitas esensial (rumah sakit darurat, sekolah, pasar) dalam radius 3 km."* |
| **Polder / Pompa Drainase** | Sistem pompa air klaster perumahan | *"Cek riwayat perawatan pompa air klaster dan kesiapan genset darurat ke pengurus lingkungan."* |
| **Bottleneck** | Titik penyempitan jalan keluar-masuk | *"Titik penyempitan pada jembatan akses utama berpotensi memperlambat keluar perumahan saat jam sibuk."* |
| **STD-SCR-001** | Metodologi audit spasial terverifikasi | *"Dianalisis menggunakan metodologi audit spasial terverifikasi berbasis 4 sumber geospasial resmi."* |
| **Radial Halo / Buffer Radius** | Radius jangkauan / perimeter aman | *"Berada di luar perimeter aman jalur transmisi tegangan tinggi (SUTET terdekat >550 m)."* |

---

## 6. Tone of Voice & Gaya Bahasa

### 4 Pilar Suara Rumper:
1. **Objektif & Tenang (Sober & Rational):** Menyampaikan data apa adanya tanpa melebih-lebihkan atau menakut-nakuti pembeli.
2. **Empatik terhadap Taruhan Finansial Pembeli:** Menyadari bahwa uang DP dan komitmen KPR adalah hasil kerja keras bertahun-tahun.
3. **Skeptis terhadap Klaim Pemasaran:** Mewakili rasa curiga yang sehat terhadap jargon "lokasi strategis, bebas banjir, 15 menit ke Jakarta".
4. **Terbuka & Tidak Menjual Kepalsuan:** Berani berkata *"Data kami belum cukup untuk titik ini, mohon cek warga"* daripada memalsukan rasa aman.

### Panduan Do & Don't per Situasi:

```
┌─────────────────────────────────┬────────────────────────────────────────────────────────────┬────────────────────────────────────────────────────────────┐
│ Situasi                         │ JANGAN (Don't)                                             │ LAKUKAN (Do)                                               │
├─────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Menemukan risiko genangan       │ "Lokasi ini tenggelam dan berbahaya, batalkan sekarang!"   │ "Titik lokasi berada di cekungan elevasi rendah. Verifikasi│
│                                 │ (Alarmist / menakut-nakuti)                                │ kapasitas pompa klaster ke pengurus RT sebelum booking."   │
├─────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Data resmi tidak lengkap        │ "Tidak ada catatan banjir di database kami, lokasi aman." │ "Belum ada sensor resmi untuk saluran air klaster ini.     │
│ (Evidence Gap)                  │ (Rasa aman palsu / bahaya)                                 │ Masukkan poin ini ke daftar tanya saat survei lapangan."   │
├─────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Lokasi mendapat skor tinggi     │ "Perumahan idaman 100% sempurna tanpa cela, segera beli!"  │ "Indeks risiko menunjukkan keselarasan tinggi (88/100).    │
│ (80-100)                        │ (Cheerleader / terafiliasi sales)                          │ Tetap uji rute jam 07.15 WIB untuk memastikan kenyamanan." │
├─────────────────────────────────┼────────────────────────────────────────────────────────────┼────────────────────────────────────────────────────────────┤
│ Respon AI di Workspace Chat     │ Memberikan kepastian spekulatif atau nasihat legal KPR.    │ Merujuk langsung ke fakta temuan laporan dan menyarankan   │
│                                 │                                                            │ pertanyaan spesifik untuk diverifikasi ke lapangan.        │
└─────────────────────────────────┴────────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────────┘
```

---

## 7. Aturan UX Writing untuk Tombol (CTA) & Input Form

1. **CTA Utama (Primary Actions):**
   * Gunakan kata kerja aktif spesifik hasil:
     * ✅ `Cek Lokasi Rumah →`
     * ✅ `Unduh Laporan PDF`
     * ✅ `Mulai Riset Lokasi`
     * ❌ `Submit`, `Kirim`, `Klik di Sini`, `Proses`.
2. **Input Alamat (Search Input):**
   * Sertakan contoh nama perumahan Jabodetabek nyata sebagai placeholder:
     * ✅ `Contoh: Grand Galaxy Bekasi atau Kota Wisata Cibubur`
     * ❌ `Cari sesuatu...` atau `Ketik alamat di sini`.
3. **Badge Status & Label Tingkat Bukti:**
   * Jangan gunakan warna hijau merek (`#00ED64`) untuk menyatakan "lokasi aman". Warna hijau merek hanya untuk identitas brand dan tombol aksi.
   * Gunakan palet semantik sistem (`tokens.md`):
     * Merah (`#D32F2F` / `#FFEAEE`): Perlu Validasi Kritis / Alert
     * Kuning/Amber (`#D79A2B` / `#FFF8E0`): Perhatian / Warning / Celah Bukti
     * Hijau Redup Semantik (`#00684A` / `#EAF5EF`): Risiko Rendah / Selaras
     * Biru Netral (`#2D7FF9` / `#EAF2FF`): Informasi / Info

---

## 8. Tata Kelola & Siklus Pemeliharaan (Governance)

* **Pemilik Dokumen:** Perubahan terhadap definisi kategori atau daftar istilah wajib disetujui bersama oleh Product Lead dan UX/Content Specialist.
* **Audit Kepatuhan:** Setiap rilis antarmuka baru (`/v2`, `/app/c/:threadId`, `/app/areas`) wajib melalui pengecekan silang terhadap dokumen ini untuk mencegah timbulnya drift baru.
* **Deprecations:** Apabila suatu dataset baru aktif (misalnya integrasi data stasiun BMKG resmi di masa depan), matriks fitur di Seksi 3 diperbarui secara formal sebelum copy pemasaran dibuat.
