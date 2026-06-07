# Rumper

Rumper membantu pembeli rumah pertama mengevaluasi risiko lokasi sebelum membayar booking fee atau DP.

Repository ini mengikuti pendekatan **hybrid, operations-first**:

1. Validasi bisnis melalui layanan concierge dan laporan audit lokasi semi-manual.
2. Gunakan website custom sebagai landing page Bahasa Indonesia dengan CTA ke Typeform.
3. Otomatiskan proses dan bangun platform interaktif hanya setelah validation gates tercapai.

## Struktur Repository

- `apps/website`: landing page Next.js + Tailwind.
- `operations`: SOP dan template untuk memproduksi laporan audit.
- `business`: validation sprint, marketing, dan pricing.
- `product`: requirements, roadmap, dan keputusan penting.
- `data`: registry sumber, schema, dan data contoh anonim.
- `docs/superpowers`: design spec dan implementation plan.

## Prinsip Data

Jangan commit data pelanggan, alamat kandidat rumah, data pembayaran, laporan pelanggan, atau secret. Gunakan data anonim untuk contoh dan dokumentasi.

## Fokus Milestone Pertama

Prioritas pertama adalah menyiapkan operations kit lengkap. Website hanya berfungsi sebagai marketing site dengan Typeform sebagai alur pemesanan utama.
# rumper
