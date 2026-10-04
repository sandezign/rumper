import LegalLayout from "./LegalLayout";
import { ShieldCheck, UserCheck, Lock, Mail, Server, Eye, Trash2, Edit3, BellOff } from "lucide-react";

export default function PrivacyPage() {
  const tocItems = [
    { id: "komitmen", label: "Komitmen Bebas Spam" },
    { id: "data-dikumpulkan", label: "1. Data yang Kami Butuhkan" },
    { id: "tujuan", label: "2. Untuk Apa Data Digunakan?" },
    { id: "mitra-teknologi", label: "3. Mitra Teknologi Terpercaya" },
    { id: "retensi", label: "4. Berapa Lama Data Disimpan?" },
    { id: "hak-anda", label: "5. Hak Anda atas Data Pribadi" },
    { id: "anak", label: "6. Kebijakan Usia Pengguna" },
    { id: "kontak-dpo", label: "7. Permohonan Hapus Data" },
  ];

  const subProcessors = [
    {
      category: "Penyimpanan Server & Database",
      name: "Google Cloud Platform (GCP)",
      location: "Jakarta (Indonesia)",
      purpose: "Menyimpan data akun dan laporan Anda dalam lingkungan server terkunci standar bank.",
    },
    {
      category: "Simulasi Macet Jam Kerja",
      name: "Google Maps Platform (Routes)",
      location: "Server Global",
      purpose: "Menghitung durasi perjalanan ke kantor Anda (hanya koordinat asal-tujuan, tanpa nama Anda).",
    },
    {
      category: "Peta Banjir Resmi Pemerintah",
      name: "InaRISK BNPB & Badan Informasi Geospasial",
      location: "Indonesia",
      purpose: "Mengambil data batas genangan banjir dan kontur elevasi tanah publik.",
    },
    {
      category: "Pembayaran Aman",
      name: "Mitra Payment Gateway Resmi",
      location: "Indonesia",
      purpose: "Memproses pembayaran QRIS, Virtual Account, dan Kartu dengan lisensi Bank Indonesia.",
    },
  ];

  return (
    <LegalLayout
      title="Kebijakan Privasi"
      badge="Perlindungan Data Pribadi"
      subtitle="Kami menjaga kerahasiaan rute kerja, rumah incaran, dan data akun Anda. Tanpa spam promosi, tanpa bagi-bagi data ke marketing pengembang."
      lastUpdated="4 Oktober 2026"
      tocItems={tocItems}
    >
      {/* Signature Dark Statement Card: Anti-Spam Pledge */}
      <section id="komitmen" className="legal-dark-card space-y-3">
        <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-[#00ed64]">
          <ShieldCheck className="w-4 h-4 flex-shrink-0" />
          <span>Komitmen Privasi Nomor 1</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Data Anda Murni untuk Evaluasi (Bukan Dijual ke Broker Properti)
        </h2>
        <p className="text-sm text-[#d0dde0] leading-relaxed">
          Kami sangat memahami betapa menyebalkannya menerima telepon sales perumahan bertubi-tubi setelah survei rumah. Karena itu, Rumper berkomitmen tegas: <strong>kami TIDAK PERNAH dan TIDAK AKAN PERNAH menjual, menyewakan, atau membocorkan nomor kontak Anda kepada marketing perumahan atau agen mana pun.</strong>
        </p>
        <p className="text-xs text-[#a2b5bc] leading-relaxed">
          Semua data pencarian Anda di Rumper dijamin sesuai ketentuan Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP).
        </p>
      </section>

      {/* Section 1 */}
      <section id="data-dikumpulkan" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          1. Data Apa Saja yang Kami Butuhkan?
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Kami hanya mengumpulkan data yang benar-benar diperlukan untuk menghitung skor lokasi dan menyajikan laporan yang akurat untuk Anda:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm pt-1">
          <div className="p-4 rounded-xl border border-[#d7e1e5] bg-[#f8faf8] space-y-2">
            <div className="font-bold text-[#001e2b] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#008c34]" />
              <span>Data yang Anda Masukkan</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[#3d4f5b] leading-relaxed">
              <li>Nama & email akun Google Anda.</li>
              <li>Lokasi rumah yang ingin Anda cek.</li>
              <li>Alamat kantor Anda untuk hitung macet.</li>
              <li>Nomor WhatsApp (opsional untuk kirim laporan).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-[#d7e1e5] bg-[#f8faf8] space-y-2">
            <div className="font-bold text-[#001e2b] flex items-center gap-1.5">
              <Server className="w-4 h-4 text-[#00684a]" />
              <span>Data Perangkat Browser</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[#3d4f5b] leading-relaxed">
              <li>Jenis perangkat (HP atau laptop).</li>
              <li>Ukuran layar agar peta tampil pas.</li>
              <li>Alamat IP internet untuk keamanan akun.</li>
              <li>Sesi login aman (cookie terenkripsi).</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl border border-[#d7e1e5] bg-[#f8faf8] space-y-2">
            <div className="font-bold text-[#001e2b] flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-[#d79a2b]" />
              <span>Data Pembayaran</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[#3d4f5b] leading-relaxed">
              <li>Bukti verifikasi bahwa pembayaran sukses.</li>
              <li>Nomor faktur digital untuk bukti Anda.</li>
              <li><strong>Penting:</strong> Kami <em>tidak pernah</em> melihat atau menyimpan nomor kartu kredit/CVV Anda.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 2 */}
      <section id="tujuan" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          2. Untuk Apa Data Tersebut Digunakan?
        </h2>
        <ul className="space-y-2.5 text-sm text-[#3d4f5b] leading-relaxed">
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#eaf5ef] text-[#00684a] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</span>
            <span><strong>Menghitung Waktu Tempuh Kerja:</strong> Memperkirakan waktu tempuh harian saat jam sibuk pagi (07.00–08.30 WIB) dari rumah incaran menuju kantor Anda.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#eaf5ef] text-[#00684a] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</span>
            <span><strong>Menyimpan Riwayat Pencarian:</strong> Menyimpan daftar perumahan yang pernah Anda cek agar tidak hilang saat Anda membuka kembali Rumper di HP atau laptop.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#eaf5ef] text-[#00684a] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</span>
            <span><strong>Mengirimkan Salinan Laporan:</strong> Mengirimkan rangkuman hasil cek lokasi ke email atau WhatsApp Anda jika Anda menginginkannya.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-[#eaf5ef] text-[#00684a] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">4</span>
            <span><strong>Mencegah Penyalahgunaan:</strong> Menjaga platform dari upaya peretasan atau pencurian data massal oleh bot liar.</span>
          </li>
        </ul>
      </section>

      {/* Section 3 */}
      <section id="mitra-teknologi" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          3. Mitra Teknologi Terpercaya
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Rumper hanya bekerja sama dengan penyedia teknologi berstandar tinggi yang terikat perjanjian kerahasiaan data yang ketat:
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#d7e1e5]">
          <table className="w-full text-left text-xs text-[#3d4f5b]">
            <thead className="bg-[#f0f5f2] text-[#001e2b] font-bold border-b border-[#d7e1e5]">
              <tr>
                <th className="p-3">Kebutuhan</th>
                <th className="p-3">Mitra Teknologi</th>
                <th className="p-3">Peran & Keamanan Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceff1]">
              {subProcessors.map((row, idx) => (
                <tr key={idx} className="hover:bg-[#f8faf8]">
                  <td className="p-3 font-semibold text-[#001e2b]">{row.category}</td>
                  <td className="p-3 font-medium">{row.name}</td>
                  <td className="p-3">{row.purpose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4 */}
      <section id="retensi" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          4. Berapa Lama Kami Menyimpan Data Anda?
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Data riwayat rumah incaran Anda tersimpan selama akun Anda aktif agar Anda bisa terus membandingkan properti. Bukti pembayaran disimpan selama 5 tahun sesuai aturan perpajakan nasional. Jika Anda ingin berhenti dan meminta penghapusan akun, semua data pribadi Anda akan kami hapus bersih secara permanen dalam waktu maksimal 14 hari kerja.
        </p>
      </section>

      {/* Section 5: User Rights */}
      <section id="hak-anda" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          5. Hak Penuh Anda atas Data Pribadi
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Sesuai amanat UU Perlindungan Data Pribadi (UU PDP), Anda memegang kendali penuh atas data Anda sendiri:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm pt-1">
          <div className="p-3.5 rounded-xl border border-[#d7e1e5] bg-[#f8faf8] space-y-1">
            <div className="font-bold text-[#001e2b] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#00684a]" />
              <span>1. Hak Melihat Data</span>
            </div>
            <p className="text-xs text-[#5c6c7a] leading-relaxed">
              Anda berhak meminta salinan data apa saja yang tersimpan di sistem Rumper.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-[#d7e1e5] bg-[#f8faf8] space-y-1">
            <div className="font-bold text-[#001e2b] flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[#00684a]" />
              <span>2. Hak Mengoreksi</span>
            </div>
            <p className="text-xs text-[#5c6c7a] leading-relaxed">
              Anda bisa memperbarui nama atau nomor kontak Anda kapan pun jika ada yang keliru.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-[#d7e1e5] bg-[#f8faf8] space-y-1">
            <div className="font-bold text-[#001e2b] flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#d32f2f]" />
              <span>3. Hak Menghapus (Lupakan Saya)</span>
            </div>
            <p className="text-xs text-[#5c6c7a] leading-relaxed">
              Anda berhak meminta kami menghapus seluruh riwayat pencarian dan akun Anda secara permanen.
            </p>
          </div>

          <div className="p-3.5 rounded-xl border border-[#d7e1e5] bg-[#f8faf8] space-y-1">
            <div className="font-bold text-[#001e2b] flex items-center gap-2">
              <BellOff className="w-4 h-4 text-[#d79a2b]" />
              <span>4. Hak Berhenti Terima Pesan</span>
            </div>
            <p className="text-xs text-[#5c6c7a] leading-relaxed">
              Anda bebas memilih untuk tidak menerima notifikasi WhatsApp atau email pembaruan dari kami.
            </p>
          </div>
        </div>
      </section>

      {/* Section 6 */}
      <section id="anak" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          6. Kebijakan Usia Pengguna
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Layanan evaluasi rumah Rumper ditujukan bagi pengguna dewasa berusia minimal 18 tahun (atau yang sudah cakap secara hukum untuk membeli rumah). Kami tidak dengan sengaja memproses data anak di bawah umur.
        </p>
      </section>

      {/* Section 7 */}
      <section id="kontak-dpo" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          7. Cara Mengajukan Permohonan Hapus Data
        </h2>
        <p className="text-sm text-[#3d4f5b] leading-relaxed">
          Jika Anda ingin menghapus akun, mengunduh salinan data, atau memiliki pertanyaan seputar privasi, kirimkan pesan kepada Pejabat Perlindungan Data kami:
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2">
          <a
            href="mailto:privasi@rumper.id"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00ed64] text-[#001e2b] text-xs font-bold shadow-sm hover:bg-[#00b545] transition-all"
          >
            <Mail className="w-4 h-4" />
            <span>Kirim Email ke privasi@rumper.id</span>
          </a>
          <span className="text-xs text-[#5c6c7a]">
            Permohonan Anda akan kami proses maksimal dalam 3 hari kerja.
          </span>
        </div>
      </section>
    </LegalLayout>
  );
}
