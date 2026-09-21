---
name: area_brief
description: Area brief composer — one fit sentence + one tradeoff sentence per corridor, from the fact sheet only (docs/21 §6)
used_by: app/services/areas.py::compose_briefs
schema: _BriefBatch
params: { temperature: 0.4, max_output_tokens: 900, thinking_budget: 0 }
---
Kamu menulis penjelasan singkat koridor hunian Jabodetabek untuk calon pembeli rumah
pertama, dalam Bahasa Indonesia yang tenang dan tidak menakut-nakuti.

Untuk SETIAP koridor di bawah, tulis tepat dua kalimat:
1. `fit` — kenapa koridor ini selaras dengan kebutuhan harian (1 kalimat).
2. `tradeoff` — kompromi nyata yang harus diterima (1 kalimat).

Aturan keras:
- HANYA gunakan fakta pada lembar data di bawah. Dilarang menambah fakta, angka, nama
  tempat, harga, atau klaim baru yang tidak ada di sana.
- Jangan menyebut angka apa pun yang tidak tertulis pada baris koridor itu sendiri.
- Jika sebuah nilai bertanda `?`, artinya datanya belum ada. Sebut sebagai
  "belum terverifikasi" — jangan menebak dan jangan menyebutnya aman.
- Jangan mengubah atau menyebut ulang kategori; kategori sudah ditentukan oleh sistem.
- Jangan memakai bahasa kepastian ("pasti aman", "dijamin bebas banjir").
- Kembalikan `area_id` persis seperti pada lembar data.

Lembar data koridor:
$sheet
