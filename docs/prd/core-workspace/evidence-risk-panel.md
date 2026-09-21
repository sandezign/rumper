# PRD: Analysis Region - Bukti (Evidence Risk) Panel

## Metadata

| Field | Value |
|-------|-------|
| **Author** | Antigravity AI |
| **Status** | Draft |
| **Created** | 2026-07-12 |
| **Last Updated** | 2026-07-18 |
| **Version** | 1.1 |
| **Related Docs** | `docs/16-workspace-shell-and-analysis.md`, `docs/07-scoring-and-confidence.md`, `docs/prd/core-workspace/unified-implementation-blueprint.md` |

---

## 1. Problem Statement

The initial UI mockup contains irrelevant risk categories (e.g., Bushfire, Mine subsidence, Council flood mapping, EPA notices) that do not align with Rumper's target market (first-time homebuyers in Jabodetabek). The presentation of these risks needs to be highly relevant and build trust through structured, transparent evidence. 

Toggle switches are included as **Map Layer Visibility Controls**, defaulting to `ON`. Toggling a switch `OFF` does not "remove" the risk, but simply hides its visualization from the Map Panel to reduce visual noise, allowing users to isolate specific issues. The interface must clearly present the **Claim, Confidence, Severity, Data Limitations, and Actionable Validation steps**.

> **Checklist Absorption (v1.1):** The standalone "Field Validation Checklist" tab has been removed. All actionable field checklist items ("Langkah Validasi") are now embedded **inline within each evidence accordion row's expanded state**, directly below the limitation text. This ensures users see validation steps in the context of the specific risk evidence, rather than in a disconnected tab.

---

## 2. Content Strategy (The 5 Rumper Categories)

Based on the scoring engine (`STD-SCR-001`), the "Bukti" panel must strictly map to Rumper's 5 core categories, rejecting extraneous categories (like Landlord insurance or Mine subsidence):

1. **Banjir (Flood Resilience)**
   - *Metrics:* Zona Rawan Banjir (InaRISK), Elevasi Lahan (Low-lying ≤ -2m).
2. **Lingkungan & Red Flags (Environment)**
   - *Metrics:* SUTET (≤ 250m), TPA (≤ 1.5km), Kawasan Industri (≤ 1km), Rel Kereta Api (≤ 200m), TPU.
3. **Commute (Commute Efficiency)**
   - *Metrics:* Waktu Tempuh Puncak, Rasio Kemacetan Ekstrem (> 1.8x), Kompleksitas Transit.
4. **Akses (Physical Access)**
   - *Metrics:* Akses gerbang Tol, Akses stasiun KRL/MRT.
5. **Fasilitas Esensial (Essential Facilities)**
   - *Metrics:* Radius ke Rumah Sakit/Klinik, Pasar/Supermarket, Sekolah.

---

## 3. Wireframe Specification

### 3.1 Global Layout & Navigation

**[Tab Navigation Bar]**
`[ Ringkasan ]`  `[ Bukti (5) ]` *(Active)*  `[ Checklist ]`
*Annotation:* The active tab has a deep-teal underline indicator. The number (5) indicates the total number of findings (gaps or risks) identified for this property.

### 3.2 Content Section (List Layout)

The panel consists of a vertically scrolling list. Each finding is represented as a collapsible row (accordion) using a chevron `>`.

#### Row 1: Lingkungan (SUTET) - *Expanded State*
```text
[Icon: Power Tower]  SUTET & Jaringan Listrik              [DATA SEDANG] [CRITICAL] [Toggle (ON)] [ v ]
                     Berjarak ~150m
-----------------------------------------------------------------------------------------
                     SUTET & Jaringan Listrik
                     Terdapat jalur SUTET berjarak ~150m dari lokasi properti. Hal ini 
                     dapat mempengaruhi estetika dan persepsi kesehatan. 
                     
                     ⚠️ Limitasi: Jarak diukur dari jalan utama, bukan titik akurat rumah.
                     
                     ☐ Langkah validasi:
                       ☐ Pastikan kabel SUTET tidak melintang tepat di atas rumah
                       ☐ Cek area bermain anak saat survei fisik
                       ☐ Foto menara SUTET terdekat dari halaman rumah
```
*Annotations:*
- **Content Priority:** Critical red flags (like SUTET) always appear at the top of the list.
- **Badges:** Right-aligned before the chevron. Uses semantic colors (e.g., Red/Danger for `CRITICAL`, Amber/Warning for `DATA SEDANG`).
- **Interaction:** Clicking the row toggles the expanded state (chevron points down `v`).

#### Row 2: Banjir (Flood Resilience) - *Expanded State*
```text
[Icon: Waves]        Risiko Banjir Zona                    [DATA KUAT] [WARNING] [Toggle (ON)] [ v ]
                     Zona Sedang (InaRISK) - 6% of area
-----------------------------------------------------------------------------------------
                     Risiko Banjir Zona
                     Berdasarkan pemetaan InaRISK, area ini berada di Zona Sedang.
                     Selain itu, elevasi tanah cenderung rendah (≤ -2 mdpl) yang 
                     meningkatkan potensi genangan saat curah hujan tinggi.
                     
                     ⚠️ Limitasi: Data elevasi adalah estimasi DEM regional, bukan 
                     pengukuran topografi presisi di lokasi kavling.
                     
                     ☐ Langkah validasi:
                       ☐ Cek riwayat banjir dengan warga sekitar
                       ☐ Perhatikan ketinggian fondasi rumah
                       ☐ Cari jejak air di dinding rumah-rumah sekitar
```

#### Row 3: Commute (Efficiency) - *Expanded State*
```text
[Icon: Car/Clock]    Waktu Tempuh Jam Sibuk                [DATA KUAT] [WARNING] [Toggle (ON)] [ v ]
                     > 90 menit (1.8x delay)
-----------------------------------------------------------------------------------------
                     Waktu Tempuh Jam Sibuk
                     Estimasi waktu tempuh menuju lokasi kerja Anda saat jam 
                     berangkat (07:00 WIB) melebihi 90 menit satu arah. Rasio 
                     kemacetan mencapai 1.8x dibanding kondisi jalan lancar.
                     
                     ⚠️ Limitasi: Waktu tempuh adalah rata-rata historis rute mobil, 
                     belum memperhitungkan penggunaan motor atau jalur tikus.
                     
                     ☐ Langkah validasi:
                       ☐ Lakukan tes simulasi berkendara pada hari kerja
                       ☐ Coba rute alternatif via motor atau ojek online
                       ☐ Cek waktu tempuh di berbagai jam (pagi, sore)
```

#### Row 4: Fasilitas Esensial - *Expanded State*
```text
[Icon: Hospital]     Akses Rumah Sakit                     [DATA SEDANG] [WARNING] [Toggle (ON)] [ v ]
                     0 RS dalam radius 5 km
-----------------------------------------------------------------------------------------
                     Akses Rumah Sakit
                     Kami tidak menemukan Rumah Sakit Umum atau Klinik 24 jam 
                     berskala menengah ke atas dalam radius 5 km dari properti. 
                     
                     ⚠️ Limitasi: Database peta mungkin belum memuat klinik swasta 
                     baru yang dibangun di sekitar atau di dalam kompleks.
                     
                     ☐ Langkah validasi:
                       ☐ Pastikan ketersediaan klinik terdekat untuk kebutuhan darurat
                       ☐ Tanyakan ke warga soal fasilitas kesehatan baru
                       ☐ Cek jam operasional klinik/apotek terdekat
```

#### Row 5: Akses (KRL/Tol) - *Expanded State*
```text
[Icon: Train]        Akses Transportasi Publik             [DATA KUAT] [POSITIVE] [Toggle (ON)] [ v ]
                     Stasiun terdekat 2.5 km
-----------------------------------------------------------------------------------------
                     Akses Transportasi Publik
                     Stasiun KRL/MRT terdekat berada dalam jarak 2.5 km (masuk 
                     radius ideal ≤ 3 km). Sangat mendukung untuk mobilitas harian 
                     berbasis angkutan umum/transit.
                     
                     ⚠️ Limitasi: Jarak ditarik lurus (radius), jarak rute aktual 
                     bisa lebih jauh tergantung jalur akses keluar perumahan.
                     
                     ☐ Langkah validasi:
                       ☐ Cek ketersediaan parkir inap di stasiun
                       ☐ Cek aksesibilitas ojek online dari lokasi rumah
                       ☐ Ukur waktu jalan kaki ke stasiun terdekat
```

---

## 4. Responsive Considerations & UX Notes

1. **Touch Targets:** The entire row acts as a touch target (min 44px height) to expand the accordion on mobile. The chevron `>` is a visual affordance, not the only clickable area.
2. **Text Truncation:** On narrow screens (mobile), the Subtitle truncates with an ellipsis (`...`) if it exceeds the column width to prevent pushing the badges out of the viewport.
3. **Badge Wrapping:** On mobile devices `< 375px`, the `[Confidence]` and `[Severity]` badges may stack vertically or shift below the title to maintain readability.
4. **Validation Action (Langkah Validasi):** In the expanded state, each evidence row now contains an **inline checklist** of field validation steps. These are visual checkboxes (display-only in prototype). Each item describes a specific action the user should take during their physical site visit. This replaces the former standalone "Checklist" tab — validation steps are now shown in the context of the specific risk they relate to.
5. **Toggle Switches as Map Filters:** Toggle switches default to `ON`. They do not "turn off" risks (which are immutable), but rather control the visibility of the corresponding data layer on the Map Workspace to help users reduce clutter.
6. **Empty State:** If a category has no data (`score === null`), the row shows `[Data Belum Cukup]` badge and the expanded state explains the evidence gap.
7. **Cross-panel sync:** Clicking an evidence row updates `selectedEvidence` in the global `ReportState`, causing the Map to highlight the corresponding marker/polygon and open a popup. Conversely, clicking a Map marker updates `selectedEvidence`, causing the Evidence panel to expand and scroll to that row.
