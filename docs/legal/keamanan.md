# Keamanan Sistem & Data (Security Overview) — Rumper

**Terakhir Diperbarui:** 4 Oktober 2026  
**Mulai Berlaku:** 4 Oktober 2026  
**Dokumen Terkait:** [Kebijakan Privasi](/privacy) · [Syarat Layanan](/terms)

---

### Komitmen Keamanan Kami

Kepercayaan Anda adalah fondasi utama layanan **Rumper**. Sebagai platform penasihat risiko lokasi independen bagi pembeli rumah pertama di Jabodetabek, kami memahami bahwa data preferensi hunian, rute komuter harian ke kantor, serta nomor kontak Anda merupakan informasi penting yang harus dilindungi secara ketat.

Kami menerapkan prinsip **Defense in Depth** dan standar keamanan industri digital modern untuk memastikan seluruh interaksi dan data Anda tersimpan aman, terlindungi dari ancaman siber, dan terjamin kerahasiaannya.

---

### 6 Pilar Keamanan Data di Rumper

#### 1. Enkripsi Data Saat Transit (In-Transit Encryption)
- **Protokol:** Seluruh komunikasi antara peramban (*browser*) Anda dan peladen (*server*) Rumper diwajibkan menggunakan protokol **HTTPS dengan enkripsi TLS 1.3 / SSL 256-bit**.
- **Perlindungan:** Mencegah pihak ketiga mencegat, mengintip (*eavesdropping*), atau memanipulasi data pencarian dan kredensial Anda saat melewati jaringan internet publik atau Wi-Fi terbuka.
- **HSTS:** Kami menerapkan *HTTP Strict Transport Security* (HSTS) untuk mencegah serangan *downgrade protocol*.

#### 2. Enkripsi Data Saat Tersimpan (At-Rest Encryption)
- **Standar Industri:** Seluruh basis data, cadangan data (*backups*), dan dokumen laporan analisis yang tersimpan di lingkungan *cloud* kami dienkripsi menggunakan algoritma standar **AES-256**.
- **Kunci Enkripsi:** Manajemen kunci enkripsi dikelola secara terisolasi dengan kontrol rotasi kunci berkala menggunakan *Cloud Key Management Service* (KMS).

#### 3. Infrastruktur Cloud & Isolasi Jaringan
- **Penyedia Terpercaya:** Rumper dihosting di atas infrastruktur **Google Cloud Platform (GCP)** dengan pusat data bersertifikasi internasional (ISO/IEC 27001, SOC 1/2/3).
- **Isolasi Jaringan:** Layanan inti kami berada dalam jaringan privat (*Virtual Private Cloud / VPC*) dengan konfigurasi *firewall* ketat. Hanya port dan API resmi yang dapat diakses publik.
- **Mitigasi Serangan (DDoS):** Dilindungi dengan mitigasi serangan DDoS dan *Web Application Firewall* (WAF) untuk menjamin keandalan platform saat terjadi lonjakan trafik.

#### 4. Autentikasi Akun & Kontrol Akses
- **Protokol OAuth 2.0:** Kami memanfaatkan autentikasi terpadu Google OAuth 2.0, sehingga Anda tidak perlu membuat atau mengingat kata sandi baru yang rentan terhadap kebocoran kata sandi.
- **Token Sesi Aman:** Sesi pengguna menggunakan token bertanda tangan kriptografis (*JSON Web Token*) yang disimpan secara aman dengan atribut `HttpOnly`, `SameSite=Lax`, dan `Secure` untuk menangkal serangan *Cross-Site Scripting* (XSS) dan *CSRF*.
- **Prinsip Akses Terendah (*Least Privilege*):** Akses internal tim teknis terhadap basis data produksi dibatasi secara ketat, memerlukan autentikasi dua faktor (2FA/MFA), dan seluruh aktivitas dicatat dalam log audit yang tidak dapat diubah (*immutable audit trail*).

#### 5. Transaksi Finansial Tanpa Penyimpanan Data Kartu
- **Kepatuhan PCI-DSS:** Saat Anda membeli Laporan Risiko Premium atau Kuota Riset, transaksi diarahkan langsung ke gerbang pembayaran berlisensi Bank Indonesia (seperti Midtrans / Xendit).
- **Zero Card Storage:** Server Rumper **tidak pernah menerima, memproses, ataupun menyimpan nomor kartu kredit/debit, tanggal kadaluarsa, maupun kode CVV Anda**. Keamanan transaksi dijamin sepenuhnya oleh mitra gerbang pembayaran yang telah tersertifikasi PCI-DSS Level 1.

#### 6. Pencadangan Otomatis & Pemulihan Bencana (Backup & Disaster Recovery)
- **Pencadangan Harian:** Sistem kami melakukan pencadangan data (*automated snapshot & backup*) secara otomatis setiap hari.
- **Lokasi Geografis Terpisah:** Salinan cadangan data disimpan di zona penyimpanan terpisah (*geo-redundant storage*) untuk mengantisipasi kegagalan infrastruktur fisik.
- **Uji Pemulihan Berkala:** Kami melakukan simulasi pemulihan data (*disaster recovery drill*) secara berkala untuk memastikan waktu pemulihan layanan (*Recovery Time Objective*) dan batas kehilangan data (*Recovery Point Objective*) berada pada tingkat minimal.

---

### Ringkasan Teknis Praktik Keamanan

| Parameter Keamanan | Standar yang Diterapkan di Rumper |
|---|---|
| **Enkripsi Transit** | TLS 1.3 / SSL 256-bit (HSTS Enforced) |
| **Enkripsi Database** | AES-256 Encryption at Rest |
| **Autentikasi Pengguna** | Google OAuth 2.0 & Secure Session Token |
| **Mitigasi Serangan Siber** | WAF, DDoS Shield, Rate Limiting per IP |
| **Penyimpanan Kartu Kredit** | Nihil (100% diproses oleh Payment Gateway bersertifikasi PCI-DSS) |
| **Jadwal Pencadangan** | Otomatis 24 Jam sekali dengan retensi bergilir |
| **Kepatuhan Data Pribadi** | UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP) |

---

### Program Pelaporan Kerentanan (Responsible Disclosure)

Kami sangat mengapresiasi kontribusi peneliti keamanan (*security researchers*), pengembang komunitas, dan pengguna yang membantu menjaga keamanan ekosistem Rumper.

Jika Anda menemukan indikasi celah keamanan atau kerentanan (*security vulnerability*) pada situs atau API kami, kami meminta Anda untuk melaporkannya kepada kami secara bertanggung jawab:

1. **Saluran Pelaporan Resmi:** Kirimkan temuan Anda ke alamat email **`security@rumper.id`** dengan subjek: `[Vulnerability Report] - [Ringkasan Isu]`.
2. **Detail Laporan:** Sertakan langkah-langkah reproduksi yang jelas, *proof of concept* (PoC), serta dampak potensial dari temuan tersebut.
3. **Prinsip Tanggung Jawab:**
   - Mohon tidak mengeksploitasi celah keamanan untuk mengakses atau memodifikasi data pengguna lain.
   - Mohon tidak melakukan serangan yang dapat merusak ketersediaan layanan (*Denial of Service / DoS*).
   - Berikan kami waktu kerja yang wajar (minimal 14 hari kerja) untuk memperbaiki celah tersebut sebelum mempublikasikannya ke ranah publik.
4. **Komitmen Kami:** Tim rekayasa kami akan mengonfirmasi laporan Anda dalam waktu maksimal 2x24 jam kerja dan terus memberikan pembaruan status perbaikan. Kami berkomitmen untuk tidak mengambil tindakan hukum terhadap peneliti yang bertindak dengan itikad baik sesuai pedoman ini.

---

### Kontak Tim Keamanan

Apabila Anda memiliki pertanyaan lebih lanjut seputar arsitektur keamanan, kepatuhan, atau memiliki kendala teknis darurat, hubungi kami di:
- **Email Keamanan:** `security@rumper.id`
- **Email Layanan Umum:** `halo@rumper.id`
- **WhatsApp Bantuan:** `+62 812-8900-0000` (atau tautan resmi di navigasi footer)
