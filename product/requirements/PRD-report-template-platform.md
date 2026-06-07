# PRD: Rumper Report Template Platform

**Status:** Draft untuk validasi dan perencanaan pengembangan  
**Bahasa utama:** Bahasa Indonesia  
**Target tahap:** Assisted self-service setelah kebutuhan concierge tervalidasi  
**Standar utama:** `STD-RPT-001`  

## 1. Summary

Rumper membutuhkan platform template report yang memungkinkan customer membuat dokumentasi evaluasi risiko lokasi secara fleksibel, dengan atau tanpa bantuan analyst. Platform harus memastikan setiap report memakai template yang terkontrol, memenuhi aturan evidence dan privacy, serta hanya menjadi final setelah disetujui Admin.

## 2. Contacts

| Peran | Owner | Tanggung jawab |
|---|---|---|
| Product owner | Product Lead | Scope, outcome, dan prioritas |
| Operations owner | Operations Lead | Workflow dan SLA |
| Template owner | Product/Operations | Katalog, field, dan versioning |
| Approval owner | Admin | Aktivasi template dan final report approval |
| Privacy owner | Ditunjuk sebelum launch | Consent, akses, retensi, dan data request |
| Engineering owner | Engineering Lead | Implementasi, security, auditability |

## 3. Background

Draft awal Rumper telah mendefinisikan sepuluh core section, report status, evidence, risk, recommendation, export, dan workflow review. Kebutuhan operasional yang telah diklarifikasi adalah:

- dokumentasi harus tersedia untuk customer, internal operations, dan product development;
- template diklasifikasikan berdasarkan produk report, tahap workflow, dan peran;
- report dapat selesai tanpa analyst;
- Admin merupakan satu-satunya approver status `Final`;
- isi report sebagian besar fleksibel;
- template membutuhkan governance formal;
- privacy, consent, retention, dan disclaimer termasuk scope;
- Bahasa Indonesia menjadi bahasa utama dengan dukungan English.

### Product Boundary

Platform adalah report workspace dan governance system. Platform bukan jaminan keamanan lokasi, legal due diligence, inspeksi bangunan, atau mesin prediksi investasi.

## 4. Objective

### Objective Statement

Memungkinkan customer dan tim Rumper menghasilkan report risiko lokasi yang fleksibel, dapat diaudit, dan konsisten tanpa mewajibkan analyst pada setiap report.

### Customer Benefit

- Memilih template sesuai tahap keputusan.
- Mengisi report secara bertahap.
- Menyimpan evidence dan concern dalam satu tempat.
- Memahami confidence dan tindakan berikutnya.
- Membagikan final report yang telah disetujui.

### Company Benefit

- Mengurangi pekerjaan manual yang berulang.
- Menjaga kualitas minimum meskipun analyst tidak terlibat.
- Mengontrol template, versi, approval, privacy, dan export.
- Menghasilkan data proses untuk meningkatkan layanan.

### Key Results Awal

| Key result | Target awal |
|---|---:|
| Submit berhasil disimpan | >= 99% |
| Report final dengan approval record lengkap | 100% |
| Final report yang melewati Admin gate | 100% |
| Report dengan finding penting ber-confidence label | 100% |
| Mini Check yang dapat masuk approval tanpa analyst | >= 50% |
| Report final yang membutuhkan revisi setelah delivery | < 10% |
| Privacy atau consent violation | 0 |

## 5. Market Segments

### Primary

First-time homebuyer yang memiliki kandidat lokasi dan membutuhkan second opinion sebelum booking fee atau DP.

### Secondary

- pasangan atau keluarga yang ikut berdiskusi;
- customer yang membandingkan beberapa kandidat;
- Rumper Analyst dan Admin yang memproses report;
- partner atau advisor pada fase berikutnya.

## 6. Value Proposition

### Core Value Proposition

Dokumentasikan risiko lokasi, evidence, dan langkah validasi dalam format yang mudah digunakan, lalu terima final report yang konsisten dan telah disetujui.

### Pain Reduced

- input dan evidence tersebar;
- report manual tidak konsisten;
- customer tidak tahu data apa yang masih kurang;
- analyst menjadi bottleneck;
- perubahan template dan final report sulit diaudit.

## 7. Solution

### 7.1 Information Architecture

| Area | Fungsi |
|---|---|
| Template Catalog | Memilih Mini, Full, atau Compare |
| Report Workspace | Mengisi section, evidence, risk, dan next step |
| Review Queue | Menangani analyst review bila dibutuhkan |
| Admin Approval Queue | Menyetujui atau mengembalikan report |
| Template Governance | Membuat, menguji, menyetujui, dan menghentikan template |
| Export and Sharing | PDF, share link, version, dan access control |
| Audit and Privacy | Activity log, consent, retention, dan data request |

### 7.2 Primary Flows

#### Flow Tanpa Analyst

```text
Customer memilih template
→ Mengisi report dan consent
→ Sistem memvalidasi kelengkapan, wording, dan evidence
→ Report masuk Admin approval queue
→ Admin approve atau meminta revisi
→ Sistem mengunci final dan menyediakan export/share
```

#### Flow Dengan Analyst

```text
Customer submit
→ Sistem atau Admin menentukan analyst dibutuhkan
→ Analyst review dan enrichment
→ Report masuk Admin approval queue
→ Admin approve atau meminta revisi
→ Sistem mengunci final dan menyediakan export/share
```

### 7.3 Functional Requirements

#### P0: Template dan Report

- Menampilkan katalog Mini, Full, dan Compare.
- Membuat report dari template aktif.
- Menyimpan Template Version ID pada setiap report.
- Mendukung sepuluh core section dengan tampilan fleksibel.
- Menyimpan draft otomatis dan menampilkan progress.
- Menyediakan field, list, table, URL, file, note, dan consent input.
- Mengelola findings, risks, recommendations, next steps, dan evidence.

#### P0: Routing dan Approval

- Menentukan jalur dengan atau tanpa analyst berdasarkan aturan.
- Memberi Admin kemampuan mengubah routing dengan alasan.
- Menyediakan Admin approval queue.
- Membatasi status `Final` hanya untuk Admin.
- Mengunci final report dan membuat revision copy bila ada perubahan.

#### P0: Quality dan Safety

- Memvalidasi field wajib dan format.
- Mewajibkan confidence label untuk finding penting.
- Memberi warning dan memblokir klaim absolut sebelum final.
- Mencatat konflik evidence dan data gap.
- Menjalankan checklist Admin approval.

#### P0: Privacy dan Audit

- Merekam consent tanpa preselection.
- Menerapkan role-based access.
- Menyediakan activity log untuk status, approval, export, dan sharing.
- Mendukung revoke share link.
- Mendukung permintaan akses, koreksi, export, dan penghapusan data oleh Admin.
- Menerapkan aturan retensi yang dapat dikonfigurasi.

#### P0: Export dan Sharing

- Menghasilkan Draft PDF dengan watermark.
- Menghasilkan Final PDF setelah Admin approval.
- Menyimpan version stamp dan export metadata.
- Membuat share link view-only.

#### P1

- Password dan expiry untuk share link.
- Commenting antara customer, collaborator, analyst, dan Admin.
- Evidence linking ke finding tertentu.
- Compare Report lebih dari dua lokasi.
- English mirror untuk label dan export.
- Dashboard SLA dan quality metrics.

### 7.4 Routing Rules Awal

Report dapat melewati analyst bila seluruh kondisi berikut terpenuhi:

- template mengizinkan no-analyst path;
- semua required field dan consent lengkap;
- tidak ada konflik evidence;
- tidak ada klaim sensitif atau absolut;
- finding penting memiliki confidence label;
- tidak ada exception yang diwajibkan Operations Lead.

Jika salah satu kondisi gagal, report diarahkan ke `need_input` atau `under_review`.

### 7.5 Permissions

| Action | Customer | Collaborator | Analyst | Admin |
|---|---|---|---|---|
| Membuat report | Ya | Tidak | Ya | Ya |
| Mengubah draft customer | Ya | Comment | Bila ditugaskan | Ya |
| Menambah findings | Terbatas | Comment | Ya | Ya |
| Mengirim ke approval | Ya | Tidak | Ya | Ya |
| Menetapkan Final | Tidak | Tidak | Tidak | Ya |
| Mengelola template | Tidak | Tidak | Tidak | Ya |
| Membuat revision request | Ya | Comment | Ya | Ya |
| Menghapus atau anonymize data | Request | Tidak | Tidak | Ya |

### 7.6 Data Model Utama

- `users`
- `roles_and_permissions`
- `template_definitions`
- `template_versions`
- `template_change_requests`
- `reports`
- `report_sections`
- `findings`
- `risks`
- `recommendations`
- `next_steps`
- `evidence`
- `consents`
- `approval_records`
- `exports`
- `share_links`
- `activity_logs`
- `privacy_requests`

### 7.7 Non-Functional Requirements

- Autosave tidak boleh menghilangkan input yang telah dikonfirmasi.
- Status, approval, dan export harus dapat diaudit.
- Final report tidak dapat diubah langsung.
- File dan share link hanya dapat diakses oleh pihak berizin.
- Sistem harus tetap menyimpan draft bila upload atau export gagal.
- Bahasa Indonesia harus menjadi default.
- Interface penting memenuhi WCAG AA.

## 8. Release

### Release 1: Controlled Internal Pilot

- Mini Check dan Full Report
- customer draft workspace;
- no-analyst routing;
- Admin approval;
- PDF export;
- consent, disclaimer, dan audit log dasar.

### Release 2: Assisted Self-Service

- Compare Report;
- analyst review queue;
- share link;
- revision workflow;
- template governance UI;
- privacy request workflow.

### Future

- English mirror penuh;
- workflow partner;
- aturan routing yang lebih canggih;
- automation untuk evidence enrichment;
- analytics kualitas dan SLA.

### Out of Scope Awal

- fully automated final recommendation;
- public GIS risk database;
- legal certificate verification;
- investment-return prediction;
- final report tanpa Admin approval.

## 9. Acceptance Criteria Utama

1. Customer dapat memilih template dan menyimpan draft.
2. Sistem menyimpan template version pada report.
3. Mini Check yang memenuhi aturan dapat masuk approval tanpa analyst.
4. Hanya Admin dapat menetapkan report menjadi `Final`.
5. Sistem memblokir finalisasi bila consent, disclaimer, confidence, atau data wajib belum lengkap.
6. Report final terkunci dan revision menghasilkan versi baru.
7. Draft dan final export dapat dibedakan.
8. Seluruh approval, export, sharing, dan perubahan status tercatat.
9. Template lama tidak berubah saat template baru diaktifkan.
10. Customer dapat meminta akses, koreksi, export, atau penghapusan data.

## 10. Assumptions dan Keputusan Terbuka

### Assumptions

- Admin approval dapat dilakukan oleh satu orang pada MVP.
- Retensi default adalah masa layanan aktif ditambah 12 bulan.
- Mini Check menjadi jalur utama untuk menguji finalisasi tanpa analyst.
- Bahasa Inggris pada tahap awal berupa mirror label dan export, bukan workflow terpisah.

### Keputusan yang Perlu Divalidasi Sebelum Build

- kondisi routing yang cukup aman untuk no-analyst path;
- kapasitas Admin dan SLA approval;
- legal basis dan masa retensi final;
- batas ukuran serta tipe file evidence;
- apakah score digunakan pada semua jenis report;
- kapan customer dikenakan biaya dalam workflow.

