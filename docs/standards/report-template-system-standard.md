# STD-RPT-001: Standar Sistem Template Report Rumper

## Kontrol Dokumen

| Item | Definisi |
|---|---|
| ID dokumen | STD-RPT-001 |
| Pemilik standar | Product Lead |
| Pihak pemberi persetujuan | Admin |
| Berlaku untuk | Template, report, export, dan workflow review Rumper |
| Effective stage | Controlled platform pilot dan assisted self-service |
| Bahasa utama | Bahasa Indonesia |
| Bahasa pendukung | English mirror bila dibutuhkan |
| Frekuensi review | Bulanan selama MVP; kuartalan setelah proses stabil |

## 1. Tujuan

Standar ini menjadi sumber acuan untuk mengelompokkan, membuat, menggunakan, menyetujui, mengubah, dan menghentikan template report Rumper.

Standar ini melengkapi SOP concierge yang aktif. Penerapan jalur tanpa analyst dimulai hanya setelah controlled platform pilot disetujui.

Standar ini menjaga keseimbangan antara:

- fleksibilitas customer dan tim dalam menulis analisis;
- konsistensi output dan pengalaman pengguna;
- kontrol evidence, confidence, disclaimer, akses, dan versi;
- kemampuan menghasilkan report tanpa keterlibatan analyst;
- persetujuan Admin sebelum report mendapat status `Final`.

## 2. Prinsip Standar

1. Isi analisis boleh fleksibel, tetapi kontrol wajib tidak boleh dilewati.
2. Fakta, interpretasi, rekomendasi, dan kekurangan evidence harus dapat dibedakan.
3. Report boleh disusun tanpa analyst, tetapi hanya Admin yang dapat menetapkan status `Final`.
4. Setiap report harus terhubung ke satu versi template yang telah disetujui.
5. Perubahan template tidak mengubah report lama secara otomatis.
6. Draft dan final harus dapat dibedakan secara visual dan melalui status sistem.
7. Klaim absolut, jaminan keamanan, dan jaminan investasi tidak diperbolehkan.
8. Data customer hanya boleh diakses, disimpan, dibagikan, dan dihapus sesuai consent dan kebutuhan layanan.

## 3. Model Klasifikasi Template

Setiap template diklasifikasikan menggunakan tiga dimensi berikut.

### 3.1 Dimensi Produk Report

| Kode | Produk | Tujuan |
|---|---|---|
| `MINI` | Mini Check | Pemeriksaan ringkas satu lokasi dengan input terbatas |
| `FULL` | Full Location Risk Report | Evaluasi lengkap satu lokasi |
| `COMPARE` | Compare Report | Perbandingan dua atau lebih kandidat lokasi |

### 3.2 Dimensi Tahap Workflow

| Kode | Tahap | Output utama |
|---|---|---|
| `INTAKE` | Pengumpulan input | Konteks pembelian, lokasi, prioritas, consent |
| `DRAFT` | Penyusunan report | Temuan, evidence, risiko, dan rekomendasi awal |
| `REVIEW` | Pemeriksaan | Catatan koreksi dan keputusan kelayakan final |
| `FINAL` | Persetujuan dan publikasi | Report terkunci, PDF, dan share link |
| `FOLLOWUP` | Tindak lanjut | Feedback, revisi, dan dampak keputusan |

### 3.3 Dimensi Peran

| Kode | Peran utama | Hak utama |
|---|---|---|
| `CUSTOMER` | Customer | Mengisi input, evidence, concern, dan next step |
| `COLLABORATOR` | Pasangan atau keluarga | Melihat dan memberi komentar |
| `ANALYST` | Rumper Analyst | Menambah analisis dan rekomendasi bila ditugaskan |
| `ADMIN` | Rumper Admin | Mengelola template dan menyetujui final |
| `SYSTEM` | Sistem | Validasi, version stamp, warning, dan export |

### 3.4 Aturan Penamaan

Gunakan pola:

```text
TPL-{PRODUCT}-{STAGE}-{ROLE}-{MAJOR_VERSION}
```

Contoh:

- `TPL-MINI-INTAKE-CUSTOMER-V1`
- `TPL-FULL-DRAFT-ANALYST-V1`
- `TPL-COMPARE-FINAL-SYSTEM-V2`

## 4. Tingkat Kontrol Isi

### 4.1 Elemen Wajib dan Terkunci

Elemen berikut wajib tersedia dan tidak dapat dihapus dari template aktif:

- identitas report dan property;
- report type dan template version;
- tujuan evaluasi;
- minimal satu finding, risk, recommendation, dan next step;
- source atau alasan bila evidence tidak tersedia;
- confidence label untuk setiap finding penting;
- overall status dan decision required;
- disclaimer dan consent acknowledgement;
- document version, export date, dan approval record.

### 4.2 Elemen Fleksibel

Elemen berikut dapat disesuaikan berdasarkan produk dan konteks customer:

- jumlah dan urutan subbagian;
- panjang narasi;
- kategori finding tambahan;
- tabel pendukung;
- visual, peta, foto, dan appendix;
- wording rekomendasi selama memenuhi content-safety rules.

### 4.3 Sepuluh Core Section

Template report final menggunakan sepuluh section sebagai struktur dasar:

1. Report Information
2. Executive Summary
3. Objectives
4. Progress and Results
5. Key Findings
6. Issues and Risks
7. Recommendations
8. Next Steps
9. Conclusion
10. Appendices

Mini Check boleh menyembunyikan section yang tidak relevan dari tampilan customer, tetapi sistem tetap menyimpan elemen kontrol wajib.

## 5. Status dan Approval Gate

| Status | Makna | Siapa yang dapat memindahkan |
|---|---|---|
| `draft` | Report masih dapat diubah | Customer, Analyst, Admin |
| `submitted` | Input customer selesai | Customer, Admin |
| `under_review` | Pemeriksaan aktif; analyst bersifat opsional | Analyst, Admin |
| `need_input` | Informasi tambahan dibutuhkan | Analyst, Admin |
| `ready_for_admin_approval` | Seluruh kontrol wajib lolos | System, Analyst, Admin |
| `final` | Disetujui Admin dan terkunci | Admin saja |
| `exported` | Final report telah diekspor atau dibagikan | System |
| `revision_requested` | Perubahan pasca-final diminta | Customer, Analyst, Admin |
| `archived` | Tidak aktif dan read-only | Admin |

### Jalur Tanpa Analyst

```text
Customer completes report
→ System validation passes
→ ready_for_admin_approval
→ Admin reviews and approves
→ final
```

### Jalur Dengan Analyst

```text
Customer submits
→ Analyst reviews or enriches report
→ ready_for_admin_approval
→ Admin reviews and approves
→ final
```

## 6. Governance Template

### 6.1 Peran Governance

| Peran | Tanggung jawab |
|---|---|
| Product Lead | Menentukan kebutuhan dan dampak perubahan |
| Operations Lead | Memastikan template dapat dijalankan secara operasional |
| Admin | Menyetujui, menerbitkan, menonaktifkan, dan memulihkan versi |
| Privacy owner | Menilai perubahan data pribadi, consent, retensi, dan sharing |
| Template author | Menyiapkan draft dan change note |

Satu orang boleh memegang beberapa peran selama MVP, tetapi approval Admin harus tercatat.

### 6.2 Lifecycle Template

| Status template | Aturan |
|---|---|
| `draft` | Masih disusun; tidak dapat digunakan customer |
| `in_review` | Sedang diuji dan diperiksa |
| `approved` | Disetujui Admin tetapi belum aktif |
| `active` | Dapat digunakan untuk membuat report baru |
| `deprecated` | Tidak untuk report baru; report lama tetap dapat dibuka |
| `retired` | Tidak tersedia untuk penggunaan normal |

### 6.3 Perubahan dan Versi

| Jenis perubahan | Contoh | Versi |
|---|---|---|
| Patch | Helper text, typo, contoh | `v1.0.1` |
| Minor | Field opsional, pilihan baru, aturan non-breaking | `v1.1.0` |
| Major | Field wajib baru, perubahan struktur atau approval | `v2.0.0` |

Setiap perubahan harus memiliki:

- alasan perubahan;
- pemilik perubahan;
- dampak pada customer, operasi, data, dan export;
- hasil pengujian;
- tanggal persetujuan;
- Admin approver;
- rencana migrasi bila diperlukan.

## 7. Standar Data, Privacy, dan Retensi

1. Consent untuk pemrosesan data dan sharing tidak boleh dipilih otomatis.
2. Report share link harus view-only secara default.
3. Share link harus dapat dicabut; expiry dan password menjadi kontrol yang disarankan.
4. Data pribadi, lokasi spesifik, file customer, dan report final tidak boleh disimpan dalam repository Git.
5. Analytics tidak boleh berisi nomor WhatsApp, alamat lengkap, koordinat, atau isi report.
6. Akses internal menggunakan prinsip least privilege dan harus tercatat.
7. Permintaan akses, koreksi, export, atau penghapusan data harus dicatat dan diproses Admin.
8. Retensi default MVP adalah selama layanan aktif ditambah 12 bulan, kemudian dihapus atau dianonimkan, kecuali ada kewajiban hukum atau persetujuan lain.
9. Evidence publik tetap harus menyimpan sumber dan tanggal observasi; salinan lokal mengikuti aturan retensi report.

## 8. Standar Bahasa dan Content Safety

### Wording yang Diperbolehkan

- `ada indikasi`
- `berdasarkan data yang tersedia`
- `confidence terbatas`
- `perlu validasi lapangan`
- `disarankan melakukan pengecekan tambahan`

### Wording yang Harus Ditolak atau Direvisi

- `pasti aman`
- `pasti banjir`
- `bebas risiko`
- `dijamin`
- `100% akurat`
- `pasti untung`

Label keputusan utama:

- `Lanjut dengan catatan / Proceed with notes`
- `Hati-hati / Caution`
- `Validasi lebih lanjut / Verify further`

## 9. Definition of Done

Sebuah template siap diaktifkan bila:

- klasifikasi, owner, tujuan, dan target user jelas;
- field wajib, validation rule, dan permission telah didefinisikan;
- jalur dengan dan tanpa analyst telah diuji;
- Admin approval gate tidak dapat dilewati;
- draft, final, export, revision, dan archive telah diuji;
- disclaimer, consent, privacy, retention, dan sharing telah diperiksa;
- contoh anonim tersedia;
- perubahan tercatat pada version history.
