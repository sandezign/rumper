# Landing Page V3 (Grupy-Inspired SaaS Architecture) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the experimental `/v3` landing page (`frontend/src/pages/v3/LandingV3.tsx` & `LandingV3.css`) combining Rumper's exact proven **Hero Banner** (KineticGrid, search bar, 3D card stack carousel, tabs, micro-interactions) with an 8-part modern SaaS content structure inspired by **`grupy.chat`** for all sections below the fold.

**Architecture:**
- **Hero Banner (Preserved 1:1):** Retains the centered dark hero wrapped in `KineticGrid`, the eyebrow pill, headline, search box with action button, 3 microcopy checks, 4-location segmented tabs, interactive 3D tossable card stack with simulated GIS maps, and tactile card cycling.
- **Post-Hero Sections (Grupy.chat SaaS Structure):**
  1. *Sebelum & Sesudah (The Contrast Section)* — Brosur Marketing Developer vs. Audit Geospasial Rumper.
  2. *Cara Kerja (3 Langkah Cepat)* — 01 Cari Alamat → 02 Pindai 5 Data Spasial → 03 Bawa Contekan Lapangan.
  3. *Bento Grid Fitur Unggulan* — 5 Dimensi Risiko Spasial, Simulasi Jam Sibuk, Checklist Lapangan Satpam & Warga.
  4. *Independensi & Integritas Data (Trust Pillars)* — 100% Data Resmi, Bebas Komisi Developer, Prinsip No Data != Low Risk.
  5. *Tabel Harga Transparan* — 3 Paket (Cek Awal Rp0, Laporan Lengkap Rp49rb, Akses 30 Hari Rp149rb).
  6. *FAQ Accordion* — Menjawab keraguan hukum, akurasi, dan waktu penggunaan.
  7. *Final Banner CTA & Mobile Sticky Action Bar* — CTA penutup dan bar melayang di mobile.

**Tech Stack:** React 19, TypeScript, CSS Variables, Lucide/Inline SVG icons, KineticGrid, IntersectionObserver for animations and sticky CTA.

---

### File Structure Map

| File Path | Role & Responsibility |
|---|---|
| `frontend/src/pages/v3/LandingV3.tsx` | Main experimental V3 page: hosts the preserved Hero Banner + the new Grupy-structured content sections + interactive states. |
| `frontend/src/pages/v3/LandingV3.css` | V3-specific styling: inherits Hero styles from `LandingV2.css` while introducing clean SaaS bento layout, before-after contrast cards, and mobile sticky bar. |
| `frontend/src/main.tsx` | Verifies `/v3` route routing to `LandingV3.tsx`. |

---

### Task 1: Port and Preserve Hero Banner 1:1 into LandingV3

**Files:**
- Modify: `frontend/src/pages/v3/LandingV3.tsx`
- Modify: `frontend/src/pages/v3/LandingV3.css`

- [ ] **Step 1: Import and wire the exact Hero components**
  - Mount `KineticGrid` with `transparentBg={true}` and `globalColor="default"` in dark container `#001e2b`.
  - Include the exact top navbar (`#top`, brandmark SVG, links, Masuk button).
  - Include the exact `hero-centered` markup:
    - Pill: `Audit Risiko Lokasi Sebelum DP · Jabodetabek →`
    - H1: `Sudah suka rumahnya? Cek dulu risiko lokasinya.`
    - Lead: `Banjir musiman, macet jam kerja, tiang SUTET, atau minimnya faskes darurat sering luput saat survei akhir pekan...`
    - Search bar: `Contoh: Grand Galaxy Bekasi` + `Cek Lokasi →`
    - 3 micro checks: `4 Sumber geospasial resmi`, `100% Independen tanpa komisi`, `1 Cek lokasi awal gratis`.
    - Report tabs: `Grand Galaxy`, `Kota Wisata`, `BSD City`, `PIK 2`.
    - 3D Card Stack: 4 floating stacked cards with maps, markers, halos, and scores.

- [ ] **Step 2: Port the exact Hero CSS and card-toss JS interactions**
  - Copy Hero & card-stack CSS from `LandingV2.css` into `LandingV3.css`.
  - Wire the card stack cycling (`cycleNextCard`, `selectCard`, tab switching, toss animation) inside `useEffect`.

- [ ] **Step 3: Verify Hero matches the screenshot exactly**
  - Verify visually and structurally against `media_1791100338977.png`.

- [ ] **Step 4: Commit preserved Hero Banner**
  ```bash
  git add frontend/src/pages/v3/
  git commit -m "feat(v3): port exact interactive hero banner with 3D card stack and kinetic grid"
  ```

---

### Task 2: Implement "Sebelum & Sesudah" (The Contrast Section)

**Files:**
- Modify: `frontend/src/pages/v3/LandingV3.tsx`
- Modify: `frontend/src/pages/v3/LandingV3.css`

- [ ] **Step 1: Build the Side-by-Side Comparison Markup**
  - Section intro:
    - Eyebrow: `Sebelum & Sesudah`
    - H2: `Dari janji manis brosur sales jadi audit bukti geospasial.`
    - Lead: `Jangan pertaruhkan tabungan belasan tahun pada klaim verbal marketing.`
  - Comparison Container (`.v3-ba-grid`):
    - **Before Card (`.v3-ba-before`)**:
      - Header: `Klaim Brosur Developer`
      - Points:
        - ❌ *"100% Bebas Banjir"* (Klaim sepihak tanpa data elevasi)
        - ❌ *"Hanya 10 Menit ke Pintu Tol"* (Diukur saat tengah malam/lancar)
        - ❌ *"Kawasan Hijau & Asri"* (Luput mendeteksi tiang SUTET 180m di belakang klaster)
    - **Center Divider (`.v3-ba-mid`)**:
      - Badge: `Dipindai Mesin Rumper` with animated pulse indicator.
    - **After Card (`.v3-ba-after`)**:
      - Header: `Temuan Spasial Objektif Rumper`
      - Points:
        - ⚠ **InaRISK BNPB:** Zona Sedang (Elevasi tanah 1.2m di bawah bibir kali terdekat).
        - ◉ **Google Routes:** Puncak macet pagi (07.15 WIB) butuh 34 menit ke tol.
        - ⚠ **OSM Warehouse:** Terdeteksi kabel transmisi SUTET 210m (standar aman >250m).
        - ℹ **Evidence Gap:** Wajib verifikasi langsung fungsi pompa klaster ke satpam.

- [ ] **Step 3: Style the Before-After Component**
  - Apply clean borders, soft tinted backgrounds (warning peach for Before, mint white for After), and high-contrast typography.

- [ ] **Step 4: Commit Contrast Section**
  ```bash
  git add frontend/src/pages/v3/
  git commit -m "feat(v3): add before-after contrast section comparing developer claims to spatial evidence"
  ```

---

### Task 3: Implement Streamlined "Cara Kerja" (3-Step Quick Process)

**Files:**
- Modify: `frontend/src/pages/v3/LandingV3.tsx`
- Modify: `frontend/src/pages/v3/LandingV3.css`

- [ ] **Step 1: Build 3-step structured cards**
  - Section intro:
    - Eyebrow: `Cara Kerja`
    - H2: `3 langkah sebelum Anda bayar tanda jadi.`
    - Lead: `Tanpa harus mengerti GIS atau membaca peta kontur mentah.`
  - Step 1: **Cari Alamat Incaran** — Nama cluster, perumahan, atau titik koordinat di Jabodetabek.
  - Step 2: **Pindai 5 Pilar Spasial** — Rumper mengaudit batas InaRISK BNPB, BIG 1:10.000, Google Routes, dan fasilitas OSM.
  - Step 3: **Bawa Contekan Lapangan** — Dapatkan skor kelayakan dan daftar pertanyaan investigasi untuk satpam dan warga sekitar.

- [ ] **Step 2: Add micro-widgets for each step**
  - Compact search chip, 5-badge data check tags, and checklist item.
  - Ensure zero trapped whitespace on mobile (`min-height: auto`).

- [ ] **Step 3: Commit Cara Kerja section**
  ```bash
  git add frontend/src/pages/v3/
  git commit -m "feat(v3): implement streamlined 3-step how-it-works section"
  ```

---

### Task 4: Bento Grid Fitur Utama & 4 Pilar Integritas Data

**Files:**
- Modify: `frontend/src/pages/v3/LandingV3.tsx`
- Modify: `frontend/src/pages/v3/LandingV3.css`

- [ ] **Step 1: Build Bento Feature Grid**
  - Card 1 (Large): **5 Dimensi Risiko Lokasi** (Banjir, Akses Jalan, Commute Jam Sibuk, Fasilitas Esensial, Lingkungan).
  - Card 2 (Medium): **Simulasi Macet Jam Sibuk** (Perbandingan Google Routes jam 07.15 WIB vs waktu lancar).
  - Card 3 (Medium): **Contekan Investigasi Lapangan** (Daftar tanya satpam & warga yang sering disembunyikan marketing).

- [ ] **Step 2: Build the Trust & Integrity Section**
  - Eyebrow: `Independensi & Integritas`
  - H2: `Kami di pihak pembeli rumah. 100% independen.`
  - 4 Trust Pillars:
    1. *Bebas Komisi Developer* — Tidak menerima komisi penjualan unit perumahan.
    2. *Data Resmi Pemerintah & Geospasial* — InaRISK BNPB, BIG, dan Google Routes.
    3. *Prinsip No Data != Low Risk* — Data minim ditandai sebagai celah bukti, bukan aman palsu.
    4. *Verifikasi Lapangan Nyata* — Dilengkapi panduan cek fisik langsung.

- [ ] **Step 3: Commit Bento and Trust sections**
  ```bash
  git add frontend/src/pages/v3/
  git commit -m "feat(v3): add bento feature grid and 4-pillar data integrity section"
  ```

---

### Task 5: Transparent Pricing, FAQ Accordion, & Mobile Sticky CTA Bar

**Files:**
- Modify: `frontend/src/pages/v3/LandingV3.tsx`
- Modify: `frontend/src/pages/v3/LandingV3.css`

- [ ] **Step 1: Build 3-Tier Pricing Table (Grupy Style)**
  - Paket Cek Awal (Rp0)
  - Paket Laporan Lengkap (Rp49.000) — *Badge: Paling Populer / 1 Properti*
  - Paket Akses 30 Hari (Rp149.000) — *Untuk Pencarian Aktif & Perbandingan Koridor*
  - Mobile horizontal scroll with dot indicators.

- [ ] **Step 2: Build Accordion FAQ with objection handling**
  - 5 pertanyaan krusial terkait independensi, akurasi banjir, dan kapan waktu terbaik menggunakan Rumper.

- [ ] **Step 3: Implement Mobile Sticky CTA Bar**
  - Sticky bottom bar appearing after scrolling past Hero (`window.scrollY > 500`).
  - Button: `Cek Lokasi Rumah Gratis →` linking to `/app/start`.

- [ ] **Step 4: Commit Pricing, FAQ, and Sticky CTA**
  ```bash
  git add frontend/src/pages/v3/
  git commit -m "feat(v3): add transparent pricing, FAQ accordion, and mobile sticky CTA bar"
  ```

---

### Task 6: Final Verification & QA Checkpoint

**Files:**
- Review: `frontend/src/pages/v3/LandingV3.tsx`
- Review: `frontend/src/pages/v3/LandingV3.css`

- [ ] **Step 1: Verify Hero visual parity against screenshot**
  - Verify colors, fonts, card stack toss animation, tabs, search bar, and KineticGrid.
- [ ] **Step 2: Verify responsive behavior on desktop and mobile**
  - Verify desktop 2-column layout and mobile touch friendliness.
- [ ] **Step 3: Final confirmation commit**
  ```bash
  git add frontend/src/pages/v3/
  git commit -m "chore(v3): complete experimental landing page v3 with preserved hero and saas content"
  ```
