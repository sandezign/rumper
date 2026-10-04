import LegalLayout from "./LegalLayout";
import { ShieldAlert, AlertTriangle, Scale, Mail, MessageCircle, CheckCircle2 } from "lucide-react";

export default function TermsPage() {
  const tocItems = [
    { id: "ringkasan", label: "Ringkasan Singkat (3 Poin Utama)" },
    { id: "definisi", label: "1. Apa itu Layanan Rumper?" },
    { id: "independensi", label: "2. Komitmen Independen (Tanpa Komisi)" },
    { id: "disclaimer", label: "3. Yang Kami Lakukan & Tidak Kami Lakukan" },
    { id: "survei", label: "4. Tips Penting Survei Lapangan" },
    { id: "akun", label: "5. Akun & Keamanan Akses" },
    { id: "larangan", label: "6. Aturan Penggunaan yang Wajar" },
    { id: "berbayar-refund", label: "7. Pembayaran & Garansi Sistem" },
    { id: "haki", label: "8. Hak Cipta Konten Laporan" },
    { id: "kontak", label: "9. Hubungi Tim Legal" },
  ];

  return (
    <LegalLayout
      title="Syarat dan Ketentuan Layanan"
      badge="Panduan Penggunaan"
      subtitle="Panduan jelas mengenai cara kerja Rumper, batas tanggung jawab analisis kami, dan komitmen independen untuk membantu Anda memilih rumah pertama dengan tenang."
      lastUpdated="4 Oktober 2026"
      tocItems={tocItems}
    >
      {/* Intro Summary Card — Plain Indonesian for Homebuyers */}
      <section id="ringkasan" className="legal-paper-card space-y-4">
        <div className="flex items-center gap-2.5 font-bold text-sm text-[#00684a]">
          <Scale className="w-5 h-5 flex-shrink-0 text-[#00ed64]" />
          <span>3 Hal Paling Penting yang Perlu Anda Ketahui</span>
        </div>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Kami menyusun ketentuan ini dalam bahasa yang sederhana agar Anda tahu persis apa yang Anda dapatkan saat menggunakan Rumper:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-[#f8faf8] border border-[#d7e1e5] space-y-1.5">
            <div className="font-bold text-xs text-[#001e2b]">1. Bukan Agen Properti</div>
            <p className="text-xs text-[#5c6c7a] leading-relaxed">
              Kami tidak menjual rumah dan tidak menerima komisi dari pengembang. Penilaian kami murni berdasarkan data.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f8faf8] border border-[#d7e1e5] space-y-1.5">
            <div className="font-bold text-xs text-[#001e2b]">2. Alat Bantu Keputusan</div>
            <p className="text-xs text-[#5c6c7a] leading-relaxed">
              Laporan Rumper membantu memetakan risiko awal (banjir, macet, fasilitas), bukan pengganti survei fisik langsung.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#f8faf8] border border-[#d7e1e5] space-y-1.5">
            <div className="font-bold text-xs text-[#001e2b]">3. Verifikasi Sebelum DP</div>
            <p className="text-xs text-[#5c6c7a] leading-relaxed">
              Selalu tinjau lokasi langsung dan pastikan surat legalitas tanah ke notaris sebelum membayar uang muka (DP).
            </p>
          </div>
        </div>
      </section>

      {/* Section 1 */}
      <section id="definisi" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          1. Apa itu Layanan Rumper?
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Rumper adalah platform digital yang membantu calon pembeli rumah pertama di wilayah Jabodetabek memeriksa risiko lingkungan di sekitar lokasi hunian incaran.
        </p>
        <div className="space-y-3 pt-1">
          <div className="text-xs font-bold uppercase tracking-wider text-[#5c6c7a]">
            Layanan yang Kami Sediakan:
          </div>
          <ul className="space-y-2 text-sm text-[#3d4f5b] leading-relaxed">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#008c34] mt-0.5 flex-shrink-0" />
              <span><strong>Deteksi Potensi Banjir:</strong> Memeriksa riwayat genangan dan ketinggian tanah dari data resmi kebencanaan (InaRISK BNPB).</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#008c34] mt-0.5 flex-shrink-0" />
              <span><strong>Simulasi Waktu Tempuh Jam Kerja:</strong> Menghitung perkiraan macet perjalanan dari calon rumah ke kantor Anda saat jam sibuk pagi hari.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#008c34] mt-0.5 flex-shrink-0" />
              <span><strong>Peta Fasilitas Penting:</strong> Menampilkan jarak ke rumah sakit darurat, sekolah, pasar, dan transportasi umum terdekat.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#008c34] mt-0.5 flex-shrink-0" />
              <span><strong>Peringatan Lingkungan Sekitar:</strong> Mendeteksi keberadaan tiang listrik tegangan tinggi (SUTET), rel kereta, atau tempat pembuangan sampah dalam radius pantau.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: Dark Statement Card */}
      <section id="independensi" className="legal-dark-card space-y-4">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#00ed64]">
          <ShieldAlert className="w-4 h-4" />
          <span>Komitmen Utama Rumper</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          2. Rumper Berpihak 100% pada Anda (Bukan Pengembang)
        </h2>
        <p className="text-sm text-[#d0dde0] leading-relaxed">
          Rumper <strong>tidak pernah menerima komisi penjualan</strong> atau imbalan promosi dari pengembang perumahan mana pun. Jika suatu perumahan memiliki catatan banjir musiman atau akses jalan yang sempit, sistem kami akan menampilkannya apa adanya.
        </p>
        <p className="text-xs text-[#a2b5bc] leading-relaxed">
          Tujuan kami satu: memastikan Anda tidak menyesal setelah terlanjur mengikat komitmen KPR belasan hingga puluhan tahun.
        </p>
      </section>

      {/* Section 3: Disclaimer Made Easy */}
      <section id="disclaimer" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          3. Yang Kami Lakukan & Yang Tidak Kami Lakukan
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Agar tidak terjadi salah paham, berikut adalah batasan jelas ruang lingkup laporan Rumper:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-[#eaf5ef] border border-[#00684a]/20 space-y-2">
            <div className="font-bold text-xs sm:text-sm text-[#00684a] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Yang Dilakukan Rumper:</span>
            </div>
            <ul className="text-xs text-[#2b4c3e] space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Menyajikan data objektif posisi tanah dan potensi genangan air.</li>
              <li>Menghitung simulasi macet rute kantor saat jam berangkat kerja.</li>
              <li>Memberikan daftar pertanyaan untuk ditanyakan ke warga sekitar.</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#fff8e0] border border-[#d79a2b]/30 space-y-2">
            <div className="font-bold text-xs sm:text-sm text-[#714900] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Yang TIDAK Dilakukan Rumper:</span>
            </div>
            <ul className="text-xs text-[#714900]/90 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li>Kami <strong>tidak memeriksa sertifikat tanah</strong> atau sengketa hukum (ini wewenang Notaris/PPAT dan BPN).</li>
              <li>Kami <strong>tidak menguji kualitas bangunan</strong>, fondasi, atau ketahanan dinding rumah.</li>
              <li>Kami <strong>bukan penasihat keuangan</strong> atau penentu persetujuan pinjaman KPR bank.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Ground Check Advice */}
      <section id="survei" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          4. Kewajiban Anda: Selalu Survei Langsung ke Lapangan
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Laporan Rumper dirancang sebagai panduan awal sebelum Anda meluangkan waktu survei. Namun, <strong>tidak ada yang menggantikan kehadiran langsung di lapangan</strong>.
        </p>
        <div className="p-4 rounded-xl bg-[#f8faf8] border border-[#d7e1e5] space-y-2 text-xs sm:text-sm text-[#3d4f5b] leading-relaxed">
          <strong>Langkah survei yang kami sarankan sebelum membayar DP:</strong>
          <ul className="list-disc pl-5 space-y-1 text-xs text-[#5c6c7a]">
            <li>Kunjungi perumahan di jam sibuk pagi (07.00 WIB) atau sore hari untuk melihat kepadatan jalan yang sebenarnya.</li>
            <li>Tinjau saluran air dan parit perumahan saat hujan deras.</li>
            <li>Mengobrol santai dengan satpam, penjual warung, atau warga yang sudah lama tinggal di sana.</li>
            <li>Periksa keabsahan Sertifikat Hak Milik (SHM) atau HGB induk ke kantor notaris rekanan.</li>
          </ul>
        </div>
      </section>

      {/* Section 5 */}
      <section id="akun" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          5. Akun Pengguna & Keamanan Akses
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Untuk menyimpan riwayat rumah yang pernah Anda cek, Anda dapat masuk menggunakan Akun Google resmi. Anda bertanggung jawab menjaga keamanan perangkat HP atau laptop Anda sendiri. Jangan pernah membagikan akses akun Anda kepada orang yang tidak dikenal.
        </p>
      </section>

      {/* Section 6 */}
      <section id="larangan" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          6. Aturan Penggunaan yang Wajar
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Platform Rumper disediakan untuk penggunaan pribadi pencari hunian. Pengguna dilarang untuk:
        </p>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#3d4f5b]">
          <li>Menyedot data atau isi laporan secara massal menggunakan perangkat lunak otomatis (*bot/scraper*).</li>
          <li>Menjual kembali hasil laporan Rumper kepada pihak ketiga demi keuntungan komersial tanpa izin tertulis.</li>
          <li>Mencoba mengganggu stabilitas server atau meretas sistem kami.</li>
          <li>Menggunakan laporan kami untuk memanipulasi atau menipu pihak lain dalam transaksi properti.</li>
        </ul>
      </section>

      {/* Section 7 */}
      <section id="berbayar-refund" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          7. Pembayaran & Garansi Gangguan Sistem
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Rumper menyediakan fitur cek lokasi awal gratis serta laporan mendalam berbayar. Seluruh transaksi pembayaran ditangani secara aman oleh penyedia gerbang pembayaran resmi berizin Bank Indonesia.
        </p>
        <div className="p-4 rounded-xl bg-[#f2f6f4] text-xs sm:text-sm text-[#3d4f5b] leading-relaxed border border-[#d7e1e5] space-y-2">
          <div className="font-bold text-[#001e2b]">Kebijakan Pengembalian Dana (Refund):</div>
          <p>
            Karena dokumen laporan langsung dibuat dan dapat diunduh secara instan ke perangkat Anda, pembayaran yang sudah berhasil <strong>tidak dapat dibatalkan</strong> jika laporan sudah terkirim dengan benar.
          </p>
          <p className="text-xs text-[#00684a] font-semibold">
            ✓ Namun, jika terjadi gangguan teknis di server kami yang menyebabkan laporan Anda gagal diproses dan tidak dapat kami selesaikan dalam 1x24 jam kerja, kami akan mengembalikan dana Anda 100% tanpa potongan.
          </p>
        </div>
      </section>

      {/* Section 8 */}
      <section id="haki" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          8. Hak Cipta Konten Laporan
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Seluruh format laporan, visualisasi peta risiko, ikon, dan teks panduan adalah karya intelektual yang dilindungi hak cipta Rumper. Anda berhak penuh menyimpan dan membagikan laporan yang Anda beli kepada keluarga, pasangan, atau penasihat keuangan pribadi Anda untuk keperluan evaluasi rumah.
        </p>
      </section>

      {/* Section 9 */}
      <section id="kontak" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          9. Butuh Bantuan atau Penjelasan Tambahan?
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Jika ada kalimat dalam ketentuan ini yang membingungkan atau Anda memiliki pertanyaan seputar cara kerja sistem kami, tim kami siap menjawab dengan senang hati:
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="space-y-0.5">
            <div className="font-bold text-sm text-[#001e2b]">Bantuan Pengguna Rumper</div>
            <div className="text-xs text-[#5c6c7a]">Senin – Jumat, pukul 09.00 – 17.00 WIB</div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <a
              href="mailto:legal@rumper.id"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f2f6f4] hover:bg-[#e3fcef] text-[#001e2b] font-semibold transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>legal@rumper.id</span>
            </a>
            <a
              href="https://wa.me/6281289000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00ed64] hover:bg-[#00b545] text-[#001e2b] font-bold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat WhatsApp</span>
            </a>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
