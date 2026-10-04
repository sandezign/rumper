# Rumper Voice & Tone Guidelines (Design Foundations)

> **Companion Document:** [STD-CNT-001: Standar Product Knowledge, Voice, dan Terminologi Rumper](file:///Users/arisandy/Documents/Sandz%20Assistant/rumper-launch/rumper-app/docs/standards/STD-CNT-001-product-voice-and-terminology.md)  
> **Target Audience:** Product Designers, Frontend Engineers, Prompt Engineers, and AI Agents building UI components.

---

## 1. Brand Character in the Interface

Rumper is the **independent buyer-side decision protector**. In every screen, modal, and tooltip:

* **We are:** Objective, calm, evidence-grounded, empathetic, and protective.
* **We are NOT:** Sales agents, cheerleaders for developers, fear-mongers, or bureaucratic GIS software.

```text
Bad:  "Perumahan mewah 100% bebas banjir, unit terbatas segera booking!" (Salesy/Fake)
Bad:  "BAHAYA TINGGI! Lokasi ini rentan bencana dan harus dihindari!" (Alarmist)
Good: "Titik lokasi berada di cekungan elevasi rendah. Verifikasi kapasitas pompa air klaster ke warga sebelum membayar booking fee." (Objective & Actionable)
```

---

## 2. Canonical UI Terminology

To prevent interface drift between marketing, onboarding, and workspace reports, always use these exact terms:

| UI Component / Concept | Canonical Name | Prohibited Aliases (Do NOT use) |
|---|---|---|
| Main Overall Score | **Indeks Risiko Lokasi** *(or Skor Lokasi Rumper)* | ~~Location Risk Index~~, ~~Skor Kelayakan~~, ~~Indeks Keselarasan~~ |
| Risk Category 1 | **Ketahanan Banjir** | ~~Risiko Bencana~~, ~~Banjir & Alam~~ |
| Risk Category 2 | **Efisiensi Commute** | ~~Waktu Tempuh & Mobilitas~~, ~~Akses Jalan & Prospek~~ |
| Risk Category 3 | **Akses Fisik & Jalan** | ~~Konektivitas Jalan~~, ~~Aksesibilitas Fisik~~ |
| Risk Category 4 | **Fasilitas Esensial** | ~~Kelayakan Sekitar~~, ~~Sekitar~~, ~~POI Amenities~~ |
| Risk Category 5 | **Lingkungan & Red Flag** | ~~Bahaya Fisik Sekitar~~, ~~Kondisi Lingkungan~~ |
| Data Absence Flag | **Evidence Gap** *(or Celah Bukti)* | ~~Data Kosong~~, ~~Missing Data~~, ~~Error Data~~ |
| Source Reliability | **Tingkat Bukti** *(Tinggi / Sedang / Rendah)* | ~~Akurasi Sensor~~, ~~Confidence Level~~ |
| On-site Survey Guide | **Contekan Investigasi Lapangan** | ~~Field Checklist~~, ~~Panduan Mandiri~~ |
| Critical Alert | **Peringatan Kritis** *(or Red Flag)* | ~~Zona Bahaya~~, ~~Fatal Warning~~ |

---

## 3. The 4 Tone Registers in UI

| Context | Tone Goal | UI Copy Rule |
|---|---|---|
| **Finding Cards (Tahap 02)** | Factual & Transparent | State the observation, state the source, highlight any *Evidence Gap*, and prescribe a survey step. |
| **Score Displays (Tahap 01)** | Neutral & Sober | Never use the brand accent green (`#00ED64`) for high scores. Use semantic band tints (`tokens.md`). Score is always subordinate to findings. |
| **Empty / Missing Data States** | Honest & Proactive | Apply *"No Data != Low Risk"*. Never say "No floods reported, area is safe". State: *"Belum ada data sensor resmi → Wajib konfirmasi warga."* |
| **Buttons & Primary CTAs** | Actionable & Clear | Begin with an active verb describing the tangible outcome: `Cek Lokasi Rumah →`, `Mulai Riset Lokasi`, `Unduh Laporan PDF`. |

---

## 4. Jargon Translation Rules for Component Designers

* Instead of **"DEM / mdpl"** $\rightarrow$ use **"kontur elevasi tanah / posisi tanah relatif rendah"**.
* Instead of **"POI"** $\rightarrow$ use **"fasilitas esensial (RS, sekolah, pasar)"**.
* Instead of **"Polder / Drainase Makro"** $\rightarrow$ use **"pompa air klaster & saluran pembuangan"**.
* Instead of **"Bottleneck"** $\rightarrow$ use **"titik penyempitan jalan keluar-masuk"**.
* Instead of **"STD-SCR-001"** $\rightarrow$ use **"metodologi audit risiko spasial terverifikasi"**.
