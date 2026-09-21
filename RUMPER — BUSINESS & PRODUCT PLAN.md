## **RUMPER — BUSINESS & PRODUCT** 

## **PLAN** 

**Subjudul:** Layanan Evaluasi Risiko Lokasi Rumah untuk Pembeli Pertama di Jabodetabek **Versi:** 1.0 | **Tanggal:** 6 Juni 2026 | **Penyusun:** Founder & Core Team 

**Status:** 🟡 Draft Validasi | **Konfidensialitas:** Internal & Investor Preview 

**Architecture & Feasibility:** [ARCHITECTURE.md](ARCHITECTURE.md) — canonical technical spec (system architecture, data sources, feasibility gates, AI strategy, PoC scope)

## **DAFTAR ISI** 📑 

1. 

## Executive Summary 

2. Founder Profile 

3. Problem Statement 

4. Target Customer 

5. Value Proposition 

6. Product Concept 

7. MVP Scope 

8. Scoring Framework V1 

9. Pricing Strategy 

10. Go-To-Market Strategy 

11. Conversion Funnel & North Star Metric 

12. 30-Day Launch Plan 

13. Weekly Execution Plan 

14. Budget Plan 

15. Validation Gates 

16. Operations & SOP 

17. Tech Stack Roadmap 

18. Growth Roadmap 

19. Funding Path 

20. Long-Term Vision 

21. Immediate Next Actions 

22. Final Recommendation 

## **1. EXECUTIVE SUMMARY** 

Rumper adalah layanan evaluasi risiko lokasi rumah yang dirancang khusus untuk membantu pembeli rumah pertama (first-time homebuyers) di wilayah metropolitan Jabodetabek (Jakarta, Bogor, Depok, Tangerang, Bekasi). Pembelian rumah adalah keputusan finansial terbesar dalam hidup mayoritas orang, namun keputusan ini sering kali diambil dalam kondisi buta informasi (information asymmetry). Rumper hadir untuk memecahkan masalah ini dengan menyediakan analisis risiko lokasi yang komprehensif, objektif, dan independen sebelum calon pembeli berkomitmen membayar booking fee atau Down Payment (DP). 

Fokus evaluasi risiko Rumper meliputi beberapa dimensi krusial: 

- **Risiko Banjir:** Analisis historis banjir, ketinggian genangan, frekuensi kejadian, serta status sistem drainase sekitar lokasi dalam 10 tahun terakhir. 

- **Commute Harian:** Estimasi realistis waktu tempuh, jarak, pilihan moda transportasi (KRL, LRT, MRT, TransJakarta, tol), serta simulasi kemacetan pada jam sibuk pagi dan sore hari. 

- **Akses Fisik:** Lebar jalan akses utama, kualitas permukaan jalan, kemudahan papasan kendaraan roda empat, titik kemacetan mikro, hingga aksesibilitas darurat (mobil pemadam kebakaran & ambulans). 

- **Fasilitas Sekitar:** Kedekatan riil (bukan jarak udara) dengan fasilitas esensial seperti rumah sakit, sekolah, pusat perbelanjaan, pasar tradisional, dan akses transportasi umum. 

- **Red Flag Lokasi:** Identifikasi potensi gangguan lingkungan seperti kedekatan dengan tempat pembuangan sampah (TPA), kabel listrik tegangan tinggi (SUTET), area pabrik 

bising/berpolusi, kuburan, rel kereta api, hingga isu keamanan wilayah. 

- **Checklist Survei:** Panduan pertanyaan spesifik dan taktis yang dipersonalisasi untuk diajukan oleh calon pembeli kepada warga sekitar, ketua RT/RW, atau tokoh masyarakat setempat saat melakukan survei langsung. 

- **Confidence Label Data:** Indikator tingkat kepercayaan terhadap data yang disajikan berdasarkan kualitas, kebaruan, dan jumlah sumber verifikasi yang berhasil didapatkan. 

**Catatan Strategis:** Versi awal Rumper akan dimulai sebagai concierge MVP berupa layanan penyusunan laporan semi-manual yang dipersonalisasi. Rumper tidak akan langsung membangun aplikasi penuh berbasis web/mobile, melainkan mengoptimalkan proses operasional manual untuk memvalidasi permintaan pasar dan kesediaan membayar (willingness to pay) secara cepat dan efisien. 

## **2. FOUNDER PROFILE** 

Untuk memastikan eksekusi bisnis berjalan dengan lincah dan terukur dalam keterbatasan sumber daya awal, berikut adalah profil pendiri yang memimpin proyek Rumper: 

|**Atribut**|**Detail Operasional & Strategis**|
|---|---|
|**Peran**|Founder & UX Designer|
|**Pengalaman**|10+ tahun di berbagai industri teknologi, desain<br>produk, dan digital transformasi (termasuk<br>pengalaman di Telkom Indonesia, Radio Cloud,<br>dan startup digital lainnya). Memiliki pemahaman<br>mendalam tentang user research, rapid<br>prototyping, dan service design.|



|**Atribut**|**Detail Operasional & Strategis**|
|---|---|
|**Budget Awal**|Rp10.000.000 (Direkomendasikan sepenuhnya<br>untuk validation sprint selama 30 hari pertama).|
|**Waktu Tersedia**|10 jam per minggu (Fokus pada manajemen<br>produk, validasi pasar, dan penyusunan laporan<br>awal).|
|**Fokus Industri**|Properti & Real Estate Tech (PropTech) dengan<br>pendekatan consumer-centric.|
|**Target Outcome**|Membangun startup skala modal ventura<br>(VC-scale startup) atau mempersiapkan opsi exit<br>strategis ke korporasi properti/teknologi yang<br>lebih besar dalam waktu 3-5 tahun.|
|**Risk Tolerance**|Sedang (Mengutamakan validasi data yang ketat<br>sebelum melakukan ekspansi modal yang<br>agresif).|
|**Track Record**|Pernah membangun dan mengoperasikan<br>software company skala kecil secara mandiri<br>saat masa kuliah, memberikan landasan kuat<br>dalam manajemen operasional dan finansial<br>dasar.|



## **3. PROBLEM STATEMENT** 

Membeli rumah pertama di Jabodetabek saat ini dihadapkan pada ketidakpastian informasi yang sangat tinggi. Pembeli sering kali harus menandatangani komitmen utang puluhan tahun (KPR) atau menyetorkan tabungan hidup mereka berdasarkan informasi sepihak yang bias. Berikut adalah jabaran dari lima masalah utama yang dihadapi calon pembeli: 

1. **Listing Properti Bias Penjualan:** Portal properti, developer, dan agen penjualan didesain secara insentif untuk menampilkan kelebihan fisik bangunan dan interior rumah. Mereka tidak memiliki kepentingan atau kewajiban untuk menjelaskan risiko lingkungan atau kelemahan lokasi yang dapat menurunkan nilai kenyamanan dan investasi properti tersebut. 

2. **Klaim Bebas Banjir & Strategis Sulit Diverifikasi:** Istilah seperti "bebas banjir", "hanya 15 menit ke Jakarta", atau "lokasi super strategis" digunakan secara seragam pada hampir seluruh materi promosi. Tanpa data historis yang objektif, pembeli kesulitan memverifikasi kebenaran klaim tersebut sebelum mereka benar-benar tinggal di sana. 

3. **Fragmentasi Data Lokasi yang Parah:** Informasi mengenai suatu wilayah saat ini tersebar secara acak di berbagai platform: ulasan Google Maps, dokumen banjir pemerintah daerah, obrolan forum komunitas (seperti Kaskus, Twitter/X, Facebook), video liputan berita, hingga testimoni verbal dari warga lokal. Mengumpulkan dan mensintesis data ini membutuhkan waktu, tenaga, dan keterampilan riset yang tidak dimiliki semua orang. 

4. **Ketiadaan Framework Objektif:** Pembeli tidak memiliki alat ukur atau framework yang objektif dan terstandarisasi untuk membandingkan opsi rumah kandidat A, B, dan C. Keputusan akhir sering kali didasarkan pada intuisi sesaat atau tekanan psikologis dari agen properti (FOMO - Fear of Missing Out). 

5. **Konsekuensi Salah Pilih yang Fatal:** Salah memilih lokasi rumah memberikan dampak negatif yang masif secara finansial (biaya perbaikan banjir, penurunan nilai aset, biaya transportasi membengkak) serta dampak psikologis yang berkepanjangan (stres akibat kemacetan, kurang tidur, kecemasan setiap kali hujan deras turun). 

## **4. TARGET CUSTOMER** 

Segmentasi pelanggan Rumper didefinisikan secara tajam untuk memastikan efisiensi akuisisi 

pada tahap awal bisnis: 

## 🎯 **Primary Segment** 

Pembeli rumah pertama (first-time homebuyers) di wilayah Jabodetabek yang berada dalam fase akhir pencarian properti. Mereka dicirikan dengan kriteria: 

- Sudah melakukan survei fisik ke beberapa lokasi. 

- Memiliki 1 hingga 3 kandidat rumah yang sedang dipertimbangkan secara serius. 

- Akan mengambil keputusan final dan melakukan pembayaran Booking Fee atau DP dalam jangka waktu 30 hari ke depan. 

- Memiliki rentang usia 25–40 tahun, melek teknologi, dan terbiasa menggunakan layanan digital. 

## 👥 **Main Personas** 

Berdasarkan riset perilaku awal, pelanggan utama Rumper dibagi menjadi dua persona berikut: 

|**Nama Persona**|**Profil Ringkas**|**Pain Points Utama (Masalah**<br>**Terbesar)**|
|---|---|---|
|**Almost-DP Couple**|Pasangan muda yang baru<br>menikah atau merencanakan<br>pernikahan. Mereka aktif<br>mencari rumah komuter<br>pertama mereka di pinggiran<br>Jakarta dan sudah berada di<br>ambang keputusan membayar<br>uang muka.|●Sangat cemas akan<br>risiko banjir yang dapat<br>merusak aset baru<br>mereka.<br>●Khawatir commute<br>harian akan menguras<br>energi dan mengganggu<br>keharmonisan keluarga<br>baru.<br>●Membutuhkan data|



||**Nama Persona**<br>**Profil Ringkas**<br>**Pain Points Utama (Masalah**<br>**Terbesar)**<br>hitam-di-atas-putih yang<br>objektif sebagai bahan<br>diskusi dengan keluarga<br>besar/orang tua.<br>●Bingung bagaimana cara<br>memvalidasi klaim manis<br>dari agen properti yang<br>terus mendesak<br>pembayaran DP.<br>**Commuter First Buyer**<br>Pekerja kantoran di pusat<br>bisnis Jakarta (SCBD,<br>Sudirman, Kuningan) yang<br>mencari rumah dengan harga<br>terjangkau di area satelit<br>(Bogor, Depok, Tangerang,<br>Bekasi).<br>●Memiliki ketakutan<br>mendalam bahwa<br>perjalanan harian ke<br>kantor akan menjadi<br>"neraka commute" yang<br>menguras waktu<br>produktif mereka.<br>●Ragu apakah opsi<br>transportasi umum<br>(seperti stasiun KRL<br>terdekat atau halte<br>TransJakarta)<br>benar-benar realistis dan<br>nyaman digunakan<br>setiap hari.<br>●Sadar bahwa brosur|
|---|---|



|**Nama Persona**|**Profil Ringkas**|**Pain Points Utama (Masalah**<br>**Terbesar)**|
|---|---|---|
|||properti tidak pernah<br>menggambarkan realitas<br>kemacetan jalan akses<br>utama pada jam 7 pagi.|



## **5. VALUE PROPOSITION** 

Rumper memposisikan dirinya bukan sebagai kompetitor portal listing properti, melainkan sebagai **mitra independen pembeli** . Value proposition utama Rumper dirumuskan sebagai berikut: 

- **Independensi Total (No-Conflict of Interest):** Rumper tidak menerima komisi penjualan dari developer atau agen properti. Pendapatan Rumper 100% berasal dari biaya laporan yang dibayar oleh konsumen. Ini menjamin bahwa laporan evaluasi risiko yang disajikan sepenuhnya jujur, objektif, dan berpihak pada kepentingan pembeli. 

- **Keamanan Finansial Sebelum Komitmen Besar:** Dengan biaya yang sangat terjangkau, pembeli mendapatkan jaminan keamanan informasi sebelum mengikatkan diri pada cicilan KPR puluhan tahun senilai ratusan juta hingga miliaran rupiah. 

- **Sintesis Data Tersebar Menjadi Informasi Praktis:** Mengubah puluhan jam riset mandiri yang melelahkan menjadi satu dokumen laporan ringkas berformat PDF yang mudah dipahami dalam waktu kurang dari 48 jam. 

- **Simulasi Commute Sesuai Realita:** Memberikan kejelasan mengenai rute commute harian berdasarkan data historis navigasi real-time, bukan jarak garis lurus yang menyesatkan pada brosur developer. 

## **6. PRODUCT CONCEPT** 

Produk inti Rumper pada fase awal adalah **Rumper Location Risk Audit Report** (Laporan Audit Risiko Lokasi Rumper). Setiap laporan disusun secara semi-manual dengan mengintegrasikan data geografis, sejarah lingkungan, dan verifikasi lapangan mikro. Struktur isi laporan dirancang sangat visual dan informatif, mencakup modul-modul berikut: 

- **Dashboard Penilaian Risiko (The Rumper Score):** Rangkuman visual berupa skor keseluruhan dari skala 1-100 dan status klasifikasi risiko (Rendah, Sedang, Tinggi) beserta visualisasi radar chart untuk lima dimensi utama. 

- **Peta & Analisis Risiko Banjir Komprehensif:** 

   - Peta kontur elevasi tanah sekitar rumah kandidat. 

   - Sejarah titik banjir terdekat dalam radius 500 meter dan 1 kilometer. 

   - Verifikasi titik genangan air saat curah hujan ekstrem berdasarkan laporan BPBD dan rekaman digital warga lokal. 

- **Real-Commute & Transit Mapping:** 

   - Rute terbaik menuju pusat kantor pengguna (disesuaikan dengan kebutuhan personal). 

   - Estimasi waktu tempuh menggunakan transportasi umum pada jam masuk dan pulang kantor (termasuk waktu transit/menunggu). 

   - Estimasi biaya transportasi bulanan (bensin, tol, tarif KRL/LRT, parkir). 

- **Analisis Aksesibilitas Fisik & Infrastruktur Jalan:** 

   - Lebar jalan di depan rumah dan jalan akses keluar kluster menuju jalan raya utama (dinyatakan dalam kapasitas mobil). 

   - Kondisi pencahayaan jalan di malam hari dan keberadaan CCTV lingkungan. 

   - Kerawanan kemacetan di persimpangan jalan keluar-masuk utama. 

- **Deteksi Red Flags & Gangguan Lingkungan:** 

   - Pemetaan objek-objek sensitif dalam radius terdampak bau, suara, atau visual (TPA, TPS liar, pabrik aktif, instalasi listrik tegangan tinggi SUTET, area pekuburan, tempat hiburan bising). 

   - Informasi mengenai sengketa tanah yang marak di area tersebut atau status zonasi tata kota (apakah area tersebut merupakan zona hijau terlindung). 

- **Lembar Panduan Survei Mandiri (Custom Checklist):** 

   - Daftar pertanyaan khusus untuk diajukan kepada tetangga kiri-kanan dan pengurus RT setempat guna mendeteksi masalah sosial (seperti sengketa air bersih, iuran lingkungan ilegal, atau riwayat pencurian). 

## **7. MVP SCOPE** 

Guna menjaga biaya tetap efisien di bawah anggaran Rp10.000.000, MVP Rumper akan dioperasikan secara penuh menggunakan metode **Concierge MVP** . Di bawah ini adalah batasan operasional dan alur pengiriman MVP Rumper: 

## **Batasan Cakupan Layanan MVP** 

- **Wilayah Geografis:** Terbatas pada area Jabodetabek. Prioritas utama adalah area pertumbuhan perumahan baru seperti Tangerang Selatan, Kabupaten Tangerang (Cisauk, Parung Panjang), Depok (Sawangan, Citayam), Bekasi (Tambun, Cibubur), dan Bogor Barat/Selatan. 

- **Waktu Pembuatan Laporan (Turn-Around Time):** Maksimal 48 jam kerja setelah formulir pemesanan dan pembayaran diverifikasi. 

- **Format Pengiriman:** File PDF statis interaktif yang dikirimkan secara instan melalui WhatsApp Business dan email pelanggan. 

## **Alur Kerja Operasional Concierge MVP (Tanpa Kode)** 

1. **Landing Page Sederhana:** Calon pelanggan mengunjungi website sederhana (landing page) yang dibangun menggunakan platform no-code (seperti Carrd atau Webflow). Landing page ini menjelaskan masalah, solusi, contoh isi laporan, dan testimoni awal. 

2. **Formulir Pemesanan:** Pengguna mengklik tombol "Pesan Audit Sekarang" yang mengarah ke formulir interaktif (menggunakan Typeform atau Google Forms). Pengguna memasukkan 

koordinat Google Maps rumah kandidat, link listing iklan properti, lokasi kantor mereka, serta preferensi transportasi harian. 

3. **Pembayaran Manual:** Pengguna diarahkan ke gateway pembayaran sederhana atau transfer bank langsung untuk memvalidasi transaksi secara instan. 

4. **Riset & Penyusunan Laporan (Manual):** Founder menggunakan waktu 10 jam/minggu untuk mengumpulkan data banjir dari portal BPBD, simulasi commute dari Google Maps API (menggunakan fitur perkiraan keberangkatan masa depan), analisis visual Google Street View, riset forum komunitas lokal, dan analisis visual lingkungan. 

5. **Dokumentasi Laporan:** Laporan disusun menggunakan template Google Slides yang didesain secara profesional (oleh founder yang berlatar belakang UX Designer) lalu diekspor menjadi PDF berkualitas tinggi. 

6. **Pengiriman & Feedback:** Laporan PDF dikirim ke WhatsApp pengguna dengan pesan personal. Pengguna ditawari sesi konsultasi/tanya jawab singkat selama 15 menit via Google Meet atau WhatsApp Call untuk menggali feedback lebih mendalam. 

## **8. SCORING FRAMEWORK V1** 

Untuk menjaga objektivitas laporan, Rumper mengembangkan framework penilaian terstandarisasi yang disebut **Rumper Location Score (RLS) V1** . Framework ini mengkuantifikasi risiko lokasi ke dalam skor numerik dari rentang 1-100. Berikut adalah matriks pembobotan parameter Rumper: 

|**Dimensi Evaluasi**|**Bobot (%)**|**Kriteria Skor**<br>**Maksimal (Skor 5)**|**Kriteria Skor Minimal**<br>**(Skor 1)**|
|---|---|---|---|
|**Ketahanan Banjir**<br>**(Flood Resilience)**|30%|Tidak ada riwayat<br>genangan atau banjir<br>dalam 10 tahun|Lokasi rumah atau<br>jalan akses utama<br>rutin tergenang air >30|



||**Dimensi Evaluasi**<br>**Bobot (%)**<br>**Kriteria Skor**<br>**Maksimal (Skor 5)**<br>**Kriteria Skor Minimal**<br>**(Skor 1)**<br>terakhir di lokasi<br>rumah maupun jalan<br>akses utama radius 1<br>km. Elevasi tanah<br>tinggi.<br>cm setiap kali curah<br>hujan tinggi atau<br>mendapatkan banjir<br>kiriman tahunan.<br>**Efisiensi Commute**<br>**(Commute**<br>**Efficiency)**<br>25%<br>Waktu tempuh ke<br>pusat bisnis (kantor<br>pengguna) <45 menit<br>menggunakan satu<br>moda transportasi<br>umum langsung<br>(misal: KRL tanpa<br>transit).<br>Waktu tempuh >90<br>menit sekali jalan,<br>memerlukan lebih dari<br>3 kali ganti moda<br>transportasi, atau<br>melewati jalur macet<br>parah tanpa opsi<br>alternatif.<br>**Akses Fisik & Jalan**<br>**(Physical Access)**<br>15%<br>Jalan depan rumah<br>memiliki lebar >6<br>meter (bisa papasan 2<br>mobil lega),<br>aspal/paving blok<br>mulus, dekat akses<br>pintu masuk tol (<10<br>menit).<br>Jalan sempit (<3<br>meter), hanya muat 1<br>mobil, kualitas jalan<br>tanah/rusak parah,<br>rawan tertutup parkir<br>liar tetangga, tidak<br>bisa dilewati truk<br>pemadam.<br>**Fasilitas Esensial**<br>**(Essential Amenities)**<br>15%<br>Terdapat Rumah Sakit<br>Tipe B/C, sekolah<br>dasar/menengah<br>Fasilitas esensial<br>sangat jauh (>30 menit<br>perjalanan), tidak ada|
|---|---|



|**Dimensi Evaluasi**|**Bobot (%)**|**Kriteria Skor**<br>**Maksimal (Skor 5)**|**Kriteria Skor Minimal**<br>**(Skor 1)**|
|---|---|---|---|
|||berkualitas,<br>stasiun/halte utama,<br>dan<br>pasar/supermarket<br>dalam radius <10<br>menit perjalanan.|akses medis darurat<br>yang cepat di sekitar<br>lokasi.|
|**Bebas Red Flag**<br>**(Environmental**<br>**Quality)**|15%|Lingkungan bersih,<br>asri, bebas bau<br>industri, tidak<br>berdekatan dengan<br>instalasi tegangan<br>tinggi (SUTET),<br>pemakaman, atau<br>tempat pembuangan<br>sampah.|Berada dalam radius<br><200 meter dari<br>TPA/TPS ilegal,<br>berada langsung di<br>bawah kabel SUTET,<br>bersebelahan dengan<br>pabrik bising, atau<br>area konflik sengketa.|



Formula penghitungan skor akhir adalah sebagai berikut: 

Skor RLS = (Skor Banjir x 6) + (Skor Commute x 5) + (Skor Akses Fisik x 3) + (Skor Fasilitas x 3) + (Skor Red Flag x 3) 

Skor akhir akan dikelompokkan ke dalam tiga kategori label kenyamanan: 

- **Skor 80 - 100:** 🟢 Green Label (Sangat Direkomendasikan / Risiko Rendah) 

- **Skor 55 - 79:** 🟡 Yellow Label (Direkomendasikan dengan Catatan / Risiko Sedang) 

- **Skor < 55:** 🔴 Red Label (Perlu Evaluasi Mendalam / Risiko Tinggi) 

## **9. PRICING STRATEGY** 

Pricing strategy Rumper dirancang untuk memberikan nilai ekonomis yang sangat tinggi bagi pembeli rumah pertama jika dibandingkan dengan nilai transaksi rumah yang berkisar antara Rp400 juta hingga Rp1,5 miliar. Pada masa validasi MVP, skema harga yang diterapkan adalah sebagai berikut: 

|**Paket Layanan**|**Harga Penawaran**|**Fitur & Output Laporan yang**<br>**Didapat**|
|---|---|---|
|**Basic Location Check**<br>**(Single)**|Rp149.000|●Analisis Risiko Banjir<br>(Sejarah 5 tahun<br>terakhir)<br>●Simulasi Commute (1<br>Rute Kantor)<br>●Peringatan Red Flags<br>Lingkungan (Sekitar<br>radius 500m)<br>●Format PDF via<br>WhatsApp|
|**Comprehensive Audit (Single**<br>**- Recommended)**|Rp299.000|●Seluruh fitur paket Basic<br>●Sejarah Banjir<br>mendalam (10 tahun<br>terakhir + zonasi pemda)<br>●Simulasi Commute<br>Multi-Moda (KRL, Mobil,|



||**Paket Layanan**<br>**Harga Penawaran**<br>**Fitur & Output Laporan yang**<br>**Didapat**<br>Motor)<br>●Analisis Akses Fisik &<br>Kondisi Jalan Malam<br>Hari<br>●Custom Checklist<br>Pertanyaan Survei<br>Warga<br>●Sesi Konsultasi via<br>WhatsApp Chat (15<br>Menit)<br>**Dual-Location Compare (Best**<br>**Value)**<br>Rp499.000<br>●Laporan audit<br>komprehensif lengkap<br>untuk 2 kandidat lokasi<br>rumah yang berbeda<br>●Tabel komparasi matriks<br>head-to-head yang<br>objektif<br>●Rekomendasi prioritas<br>pilihan dari analis<br>Rumper<br>●Sesi Konsultasi Eksklusif<br>via Google Meet (20<br>Menit)|
|---|---|



## **10. GO-TO-MARKET STRATEGY** 

Dengan anggaran pemasaran yang sangat terbatas (Rp4.000.000 alokasi iklan dari total budget), GTM Rumper akan mengandalkan kombinasi taktik pemasaran konten organik yang sangat terarah (Highly Targeted Organic Content Marketing) dan keterlibatan komunitas: 

- **Pilar Pemasaran Konten Organik (TikTok & Instagram Reels):** 

   - Membuat konten video edukasi berdurasi pendek yang membahas kesalahan fatal pembeli rumah pertama di Jabodetabek (misal: "Membeli rumah di musim kemarau, kebanjiran di musim hujan"). 

   - Mendokumentasikan studi kasus nyata tanpa menyebutkan nama perumahan (misal: menganalisis sebuah wilayah komuter yang jalan aksesnya macet parah setiap jam berangkat kerja). 

   - Menawarkan tips-tips praktis saat melakukan survei fisik rumah. 

- **Keterlibatan Komunitas (Community Guerilla Marketing):** 

   - Mencari dan memantau diskusi aktif terkait pencarian rumah di Jabodetabek di platform Kaskus, Reddit Indonesia, grup Facebook properti daerah, dan base Twitter (seperti menanggapi tweet menanyakan rekomendasi rumah daerah Sawangan atau Cisauk). 

   - Memberikan masukan analisis awal yang gratis dan objektif secara publik di kolom komentar, lalu mengarahkan mereka ke landing page Rumper untuk mendapatkan laporan lengkap terstruktur. 

- **Program Kemitraan Mikro (Micro-Partnerships):** 

   - Menjalin kemitraan dengan penyedia jasa pelengkap seperti Agen KPR Independen atau Jasa Inspeksi Bangunan (Home Inspector). Rumper bertindak sebagai auditor aspek luar/lingkungan, sementara mitra mengaudit aspek dalam fisik bangunan atau legalitas keuangan. 

## **11. CONVERSION FUNNEL & NORTH STAR METRIC** 

Untuk mengukur kesehatan pertumbuhan bisnis Rumper secara objektif, kami menetapkan corong konversi dan metrik utama yang harus dipantau ketat setiap minggu: 

## **A. Corong Konversi (The Rumper Funnel)** 

1. **Awareness (Kesadaran):** Jumlah tayangan video organik di media sosial dan jumlah kunjungan unik ke landing page Rumper. 

2. **Interest (Ketertarikan):** Jumlah pengunjung yang mengklik tombol pemesanan atau menggunakan alat kalkulator risiko gratis (jika ada) di website. 

3. **Consideration (Pertimbangan):** Jumlah pengguna yang mengisi formulir detail lokasi rumah kandidat di Typeform namun belum menyelesaikan pembayaran. 

4. **Conversion (Pembelian):** Jumlah pengguna yang menyelesaikan pembayaran dan menerima laporan PDF audit lokasi. 

5. **Retention & Referral (Rekomendasi):** Persentase pengguna yang memberikan ulasan 

positif (NPS > 8) dan merekomendasikan layanan Rumper ke teman atau komunitas mereka melalui tautan rujukan khusus. 

## **B. North Star Metric** 

Metrik utama keberhasilan Rumper adalah: **"Jumlah Laporan Audit Lokasi Berbayar yang Dikirimkan dengan Tingkat Kepuasan Pelanggan (NPS) Minimal 8 dari 10"** . 

Metrik ini memastikan bahwa tim tidak hanya mengejar pertumbuhan penjualan, tetapi juga secara konsisten menjaga kualitas analisis data lingkungan yang dikirimkan kepada konsumen. 

## **12. 30-DAY LAUNCH PLAN** 

Rencana peluncuran 30 hari ini dirancang sebagai sprint validasi intensif untuk membuktikan model bisnis Rumper dengan risiko finansial seminimal mungkin: 

||**Fase Kerja**<br>**Rentang Hari**<br>**Target Utama & Milestone**<br>**Yang Harus Dicapai**<br>**Fase 1: Infrastruktur Dasar &**<br>**Template**<br>Hari 1 - 7<br>●Membeli domain resmi<br>(rumper.id atau<br>rumper.co)<br>●Membangun landing<br>page satu halaman<br>menggunakan Carrd<br>●Membuat formulir<br>pemesanan terintegrasi<br>di Typeform<br>●Mendesain template<br>visual master laporan di<br>Google Slides<br>●Menyiapkan akun bisnis<br>WhatsApp dan email<br>profesional<br>**Fase 2: Alpha Testing & Studi**<br>**Kasus**<br>Hari 8 - 14<br>●Mencari 3 pengguna uji<br>coba (alpha users) dari<br>komunitas properti lokal<br>secara gratis<br>●Memproses riset dan<br>menyusun laporan untuk<br>ketiga pengguna<br>tersebut<br>●Menggali umpan balik<br>mendalam mengenai|
|---|---|



||**Fase Kerja**<br>**Rentang Hari**<br>**Target Utama & Milestone**<br>**Yang Harus Dicapai**<br>format dan kegunaan<br>laporan<br>●Mendapatkan testimoni<br>tertulis dan izin<br>menampilkan studi<br>kasus di landing page<br>**Fase 3: Peluncuran Resmi &**<br>**Iklan Berbayar**<br>Hari 15 - 21<br>●Memasang testimoni<br>alpha users di landing<br>page<br>●Mulai mempublikasikan<br>konten edukasi organik<br>di TikTok/IG<br>●Meluncurkan kampanye<br>iklan berbayar mikro<br>(Meta Ads) dengan<br>anggaran Rp200.000 per<br>hari<br>●Menargetkan kata kunci<br>pencarian properti<br>Jabodetabek<br>**Fase 4: Evaluasi & Rencana**<br>**Skala Bisnis**<br>Hari 22 - 30<br>●Melayani pesanan<br>pelanggan berbayar<br>pertama<br>●Mengukur rasio konversi|
|---|---|



|**Fase Kerja**|**Rentang Hari**|**Target Utama & Milestone**<br>**Yang Harus Dicapai**|
|---|---|---|
|||landing page dan<br>efisiensi biaya iklan per<br>akuisisi pelanggan<br>(CAC)<br>●Menilai apakah proses<br>riset manual 48 jam<br>dapat dipertahankan<br>●Membuat keputusan<br>strategis untuk lanjut,<br>pivot rute operasional,<br>atau menghentikan<br>proyek|



## **13. WEEKLY EXECUTION PLAN** 

Mengingat keterbatasan waktu pendiri (10 jam per minggu), alokasi waktu mingguan harus didefinisikan secara ketat agar tidak terjadi kegagalan operasional: 

## **Rencana Pembagian Waktu Mingguan (10 Jam):** 

- **Pemasaran & Konten (3 Jam):** 

   - Menulis naskah video pendek (1 jam). 

   - Merekam dan mengedit 2 konten video untuk TikTok/Reels (1,5 jam). 

   - Merespons komentar dan melacak tren diskusi di komunitas online (0,5 jam). 

- **Operasional & Riset Laporan (5 Jam):** 

   - Melakukan desk research banjir, commute, akses jalan, dan fasilitas untuk pesanan 

yang masuk (3,5 jam). 

   - Menyusun laporan PDF dan mengirimkannya kepada konsumen (1,5 jam). *Catatan: Jika pesanan melebihi kapasitas waktu, waktu pembuatan laporan akan disesuaikan menggunakan sistem antrean preorder.* 

- **Strategi, Keuangan & Iterasi Produk (2 Jam):** 

   - Menganalisis performa konversi landing page dan iklan berbayar (1 jam). 

   - Melakukan wawancara singkat via chat dengan pembeli untuk mengoptimalkan isi laporan berikutnya (1 jam). 

## **14. BUDGET PLAN** 

Alokasi anggaran awal sebesar Rp10.000.000 difokuskan sepenuhnya untuk pengujian pasar secara cepat tanpa menyisakan pengeluaran sia-sia: 

|**Kategori Pengeluaran**|**Rincian Kebutuhan**|**Estimasi Biaya (IDR)**|
|---|---|---|
|**Teknologi & Domain**|Pembelian domain (.id / .co) +<br>Langganan Platform Landing<br>Page Pro (Carrd/Webflow)<br>untuk 1 tahun pertama.|Rp1.500.000|
|**Alat Pendukung Operasional**|Langganan Typeform Pro (1<br>bulan) & Canva Pro/Google<br>Workspace basic untuk<br>kemudahan ekspor dokumen.|Rp800.000|
|**Pemasaran Digital (Meta Ads)**|Anggaran kampanye iklan<br>bertarget di Instagram &<br>Facebook selama 15 hari|Rp3.000.000|



|**Kategori Pengeluaran**|**Rincian Kebutuhan**|**Estimasi Biaya (IDR)**|
|---|---|---|
||dengan rata-rata<br>Rp200.000/hari.||
|**Dana Riset Lapangan**<br>**(Scouting Fund)**|Anggaran kas kecil untuk<br>membayar pelari lokal (runner)<br>guna memverifikasi foto jalan<br>atau mewawancarai warga<br>setempat dalam kasus risiko<br>banjir kritis.|Rp2.500.000|
|**Dana Darurat & Kontingensi**|Cadangan biaya operasional<br>tak terduga selama masa<br>validasi sprint awal.|Rp2.200.000|
|**TOTAL ANGGARAN**<br>**VALIDASI**|**Optimasi penuh untuk siklus**<br>**validasi 30 hari pertama.**|**Rp10.000.000**|



## **15. VALIDATION GATES** 

Untuk menghindari jebakan investasi emosional pada ide bisnis yang belum tentu memiliki kecocokan pasar (Product-Market Fit), Rumper menetapkan empat gerbang validasi (validation gates) objektif di akhir hari ke-30: 

## 1. **Gerbang 1: Permintaan Pasar Berbayar (Willingness to Pay)** 

- _Metrik Keberhasilan:_ Berhasil menjual minimal 10 Laporan Audit Lokasi Berbayar (Paket Comprehensive/Dual-Location) dalam periode 15 hari peluncuran resmi. 

- _Keputusan:_ Jika tercapai, lanjut ke pengembangan template semi-otomatis. Jika gagal, 

ubah penawaran harga atau lakukan pivot segmentasi geografis. 

## 2. **Gerbang 2: Efisiensi Akuisisi Pelanggan (CAC < LTV)** 

- _Metrik Keberhasilan:_ Biaya akuisisi per satu pelanggan berbayar melalui iklan digital (CAC) berada di bawah Rp150.000, dengan nilai rata-rata pesanan (AOV) minimal Rp300.000. 

- _Keputusan:_ Jika tidak tercapai, matikan iklan berbayar dan beralih sepenuhnya ke strategi konten organik murni atau kemitraan komisi. 

## 3. **Gerbang 3: Kecepatan Produksi Dokumen (Delivery Speed)** 

   - _Metrik Keberhasilan:_ Waktu rata-rata yang dihabiskan founder untuk memproses dan menyusun satu laporan komprehensif adalah di bawah 2,5 jam kerja tanpa menurunkan standar kualitas data. 

   - _Keputusan:_ Jika proses memakan waktu lebih dari 4 jam per laporan, cari bantuan asisten riset lepasan (freelance researcher) untuk membantu pengumpulan data dasar. 

4. **Gerbang 4: Kepuasan & Rekomendasi (Net Promoter Score)** 

   - _Metrik Keberhasilan:_ Minimal 80% dari total pelanggan berbayar memberikan nilai kepuasan di atas 8 dari 10 ketika dimintai umpan balik pasca pengiriman laporan. 

   - _Keputusan:_ Jika kepuasan rendah, perbaiki visualisasi data dan tambahkan informasi yang paling sering ditanyakan oleh konsumen namun belum terakomodasi dalam laporan V1. 

## **16. OPERATIONS & SOP** 

Untuk memastikan konsistensi kualitas laporan yang dikirimkan, berikut adalah panduan operasional standar (Standard Operating Procedure) yang harus diikuti dalam menyusun setiap laporan: 

## **SOP Pembuatan Laporan Rumper:** 

## 1. **Langkah 1: Verifikasi Data Masuk** 

- Periksa notifikasi pembayaran dari formulir Typeform. 

- Unduh koordinat GPS, alamat properti kandidat, dan parameter kantor pengguna. 

- Kirim pesan WhatsApp sambutan terstandarisasi untuk menginformasikan bahwa laporan sedang diproses dan akan dikirimkan dalam waktu maksimal 48 jam. 

## 2. **Langkah 2: Pengumpulan Data Banjir & Geografis** 

- Buka peta zonasi rawan banjir resmi BPBD setempat. 

- Lakukan penelusuran media sosial (Twitter/X, Facebook, YouTube) menggunakan kata kunci kombinasi nama perumahan/daerah dan kata kunci "banjir", "genangan", "hujan deras". 

- Periksa kontur elevasi tanah di wilayah sekitar lokasi rumah menggunakan Google Earth untuk melihat potensi limpasan air dari area yang lebih tinggi. 

## 3. **Langkah 3: Simulasi Perjalanan (Commute Test)** 

- Gunakan aplikasi navigasi Google Maps untuk mengatur keberangkatan pada hari kerja (Selasa/Rabu) pada pukul 07:00 pagi ke kantor pengguna. 

- Catat estimasi waktu berkendara rute tol dan non-tol. 

- Petakan rute stasiun kereta api terdekat (jarak kilometer, waktu tempuh berkendara ke stasiun, ketersediaan lahan parkir, serta frekuensi keberangkatan kereta pada jam sibuk). 

## 4. **Langkah 4: Audit Akses & Lingkungan Sekitar (Virtual Tour)** 

- Telusuri jalan utama menggunakan visualisasi Google Street View. 

- Ukur lebar jalan masuk depan rumah secara visual (apakah muat papasan dua mobil tanpa melindas bahu jalan). 

- Periksa keberadaan objek red flag (tempat pembuangan sampah liar, kuburan, kabel SUTET besar) dalam jarak radius 1 kilometer. 

## 5. **Langkah 5: Kompilasi Dokumen & Quality Control** 

- Masukkan seluruh data ke template Google Slides Rumper. 

- Tulis catatan rekomendasi spesifik yang disesuaikan dengan kondisi pembeli. 

- Lakukan pemeriksaan akurasi data sebelum mengekspor file ke format PDF dengan nama: [Rumper Report_Nama Konsumen_Nama Perumahan].pdf. 

## 6. **Langkah 6: Pengiriman & Penutupan Transaksi** 

- Kirim dokumen laporan PDF melalui WhatsApp dan email pelanggan. 

- Ingatkan mengenai akses konsultasi gratis (jika memilih paket 

   - Comprehensive/Dual-Location). 

- Kirimkan link penilaian umpan balik (feedback form) 3 hari setelah laporan diterima. 

## **17. TECH STACK ROADMAP** 

Arsitektur teknologi Rumper dirancang untuk berevolusi seiring dengan pertumbuhan volume transaksi bisnis: 

|**Tahap Pertumbuhan**|**Tingkat Volume Transaksi**|**Kombinasi Teknologi (Tech**<br>**Stack) yang Digunakan**|
|---|---|---|
|**Tahap 1: Concierge MVP**|0 - 20 pesanan per bulan|●Landing Page: Carrd.co<br>●Form & Pembayaran:<br>Typeform + Midtrans<br>(atau transfer manual)<br>●Database Internal:<br>Google Sheets<br>●Penyusunan Laporan:<br>Google Slides & Canva<br>●Komunikasi Pelanggan:<br>WhatsApp Business|
|**Tahap 2: Semi-Automated**<br>**System**|21 - 100 pesanan per bulan|●Landing Page: Webflow<br>●Form & Database:<br>Airtable<br>●Integrasi & Otomasi:<br>Zapier / Make.com|



|**Tahap Pertumbuhan**|**Tingkat Volume Transaksi**|**Kombinasi Teknologi (Tech**<br>**Stack) yang Digunakan**|
|---|---|---|
|||●Otomasi Pembuatan<br>Dokumen: PDF.co atau<br>Documint (mengisi data<br>otomatis dari Airtable ke<br>template PDF)<br>●WhatsApp Automation:<br>WATI / Jatis API|
|**Tahap 3: Custom Web**<br>**Platform**|>100 pesanan per bulan|●Frontend & Web App:<br>Next.js / React<br>●Backend & Database:<br>Firebase / PostgreSQL<br>●Integrasi Geografis:<br>Google Maps Platform<br>API & QGIS database<br>integration<br>●Sistem Manajemen<br>Surveyor: Custom portal<br>web untuk surveyor<br>lapangan lokal|



## **18. GROWTH ROADMAP** 

Setelah model bisnis dasar tervalidasi pada tahap MVP, Rumper akan mengekspansi 

layanannya melalui peta jalan pertumbuhan berikut: 

- **Kuartal 1 (Bulan 1-3): Validasi & Konsolidasi Pasar** 

   - Memantapkan operasi di wilayah Tangerang Raya dan Jakarta Barat sebagai basis pengujian awal. 

   - Membangun database riwayat banjir internal berdasarkan laporan yang berhasil diverifikasi. 

- **Kuartal 2 (Bulan 4-6): Otomasi & Skala Layanan** 

   - Mengintegrasikan sistem semi-otomatis untuk memangkas waktu pengerjaan laporan menjadi di bawah 1 jam. 

   - Mulai melatih dan mempekerjakan analis riset paruh waktu (part-time researcher) untuk menangani pesanan harian. 

   - Memperluas cakupan geografis secara agresif ke seluruh wilayah Jabodetabek. 

- **Kuartal 3 (Bulan 7-9): Aliansi Layanan Pendukung** 

   - Meluncurkan fitur bundling layanan: "Audit Lokasi Rumper + Jasa Inspeksi Fisik Rumah" melalui kerja sama dengan jaringan arsitek/kontraktor lokal independen. 

   - Menawarkan opsi pengecekan legalitas sertifikat tanah (bekerja sama dengan notaris/PPAT). 

- **Kuartal 4 (Bulan 10-12): Transformasi Platform Data** 

   - Meluncurkan platform web interaktif berbayar langganan (SaaS) di mana pengguna dapat memasukkan koordinat lokasi properti dan mendapatkan skor risiko instan (instant location risk rating) berbasis algoritma GIS. 

## **19. FUNDING PATH** 

Rumper akan dikembangkan dengan prinsip modal efisien (capital-efficient) dengan jalur pendanaan sebagai berikut: 

1. **Tahap Bootstrap (Hari 1 - 90):** Didanai sepenuhnya dari kantong pribadi pendiri sebesar Rp10.000.000 untuk membuktikan permintaan pasar nyata dan meraih pendapatan pertama 

(revenue-generating). 

2. **Tahap Pre-Seed / Angel Round (Bulan 4 - 6):** Menargetkan pendanaan awal sebesar Rp300.000.000 - Rp500.000.000 dari investor malaikat (angel investors) di jaringan properti atau sindikat teknologi lokal. Dana ini akan digunakan untuk merekrut 1 Software Engineer purnawaktu untuk membangun platform web otomatisasi awal dan memperbesar anggaran pemasaran Meta Ads. 

3. **Tahap Seed Round (Bulan 12+):** Menghubungi perusahaan modal ventura (Venture Capital) tahap awal untuk penggalangan dana skala besar guna melakukan ekspansi pasar ke kota-kota besar lain di Indonesia yang memiliki karakteristik masalah serupa (seperti Surabaya, Bandung, Medan, dan Semarang). 

## **20. LONG-TERM VISION** 

Visi jangka panjang Rumper adalah menjadi **"Mesin Kebenaran Utama untuk Real Estate di Asia Tenggara"** (The Ultimate Truth-Engine for Southeast Asian Real Estate). Rumper berambisi mengikis habis asimetri informasi yang merugikan jutaan keluarga kelas menengah saat membeli rumah pertama mereka. 

Dalam 5 tahun ke depan, Rumper bercita-cita agar setiap transaksi jual-beli rumah di Indonesia mewajibkan adanya sertifikat kelayakan lokasi (Rumper Location Risk Certificate) sebagai syarat wajib pengajuan KPR di perbankan nasional, layaknya laporan kelayakan kendaraan (Carfax) di industri otomotif global. 

## **21. IMMEDIATE NEXT ACTIONS** 

> Gate validasi teknis (DF-1 s/d DF-4) dan keputusan arsitektur: lihat [ARCHITECTURE.md](ARCHITECTURE.md) §6–§9.

Aksi nyata yang harus segera dijalankan oleh founder dalam waktu 48 jam ke depan adalah: 

1. **Action 1:** Membeli domain nama bisnis resmi (misal: rumper.co atau rumper.id) melalui registrasi domain lokal terpercaya. 

2. **Action 2:** Mendesain struktur visual template laporan 15 halaman di Google Slides dengan palet warna korporat yang bersih (biru tua, abu-abu muda, hijau/merah indikator risiko). 

3. **Action 3:** Membangun landing page responsif di platform Carrd dengan fokus mengarahkan pengunjung untuk mengisi form pre-order. 

4. **Action 4:** Menulis 3 naskah video pendek edukatif bertema "Kesalahan Terbesar Pembeli Rumah Pertama" untuk persiapan produksi konten media sosial organik pertama. 

## **22. FINAL RECOMMENDATION** 

Ide bisnis Rumper memiliki keunggulan kompetitif yang sangat besar pada aspek **kecepatan eksekusi, modal awal yang rendah, dan relevansi masalah yang tinggi** . Dengan modal Rp10.000.000 dan komitmen waktu 10 jam per minggu, founder yang memiliki keahlian dalam UX Design sangat direkomendasikan untuk langsung mengeksekusi rencana validasi ini tanpa keraguan. 

Fokus utama 30 hari pertama bukanlah membangun teknologi yang canggih, melainkan membuktikan secara empiris bahwa ada calon pembeli rumah di Jabodetabek yang bersedia membayar sejumlah uang untuk mendapatkan ketenangan pikiran (peace of mind) sebelum mengambil keputusan finansial terbesar dalam hidup mereka. 

