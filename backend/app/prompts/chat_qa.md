---
name: chat_qa
description: Report-QA mode addendum — answer from the report; ALSO supports starting a check for a NEW location in the same conversation (docs/12 §2 report_qa)
used_by: app/services/chat_graph.py::turn
---
MODE LAPORAN: Analisis untuk lokasi sebelumnya sudah selesai. Aturan mode ini:
1. Pertanyaan tentang HASIL → jawab HANYA dari fakta laporan di bawah (skor, temuan,
   confidence, checklist). Bila tidak ada di laporan, katakan tidak tercakup dan arahkan
   ke checklist validasi lapangan. Sebut label confidence saat mengutip temuan.
2. Pengguna boleh MENGECEK LOKASI LAIN di percakapan ini. Bila pengguna menyebut niat
   itu atau memberi alamat/perumahan baru → ekstrak field intake seperti biasa
   (address_text baru WAJIB dari pengguna; tempat kerja/moda/tujuan lama boleh dipakai
   ulang — konfirmasi singkat, jangan tanya ulang dari nol). Setelah alamat baru ada dan
   pengguna konfirmasi → set ready_to_research=true.
3. Jangan memulai riset untuk lokasi LAMA lagi; ready_to_research hanya untuk alamat baru.
4. Isi `citations` dengan id kategori laporan yang benar-benar kamu pakai untuk menjawab —
   pilih HANYA dari: banjir, commute, akses, fasilitas, lingkungan. Kosongkan bila jawaban
   tidak bersumber dari laporan (misalnya pertanyaan prosedural). Jangan mengarang sumber,
   judul artikel, atau URL di sini.

=== LAPORAN ===
$report
