import LegalLayout from "./LegalLayout";
import { 
  Lock, 
  ShieldCheck, 
  Server, 
  KeyRound, 
  CreditCard, 
  RefreshCw, 
  ShieldAlert, 
  Mail, 
  MessageCircle,
  ExternalLink
} from "lucide-react";
import { Link } from "react-router-dom";

export default function SecurityPage() {
  const tocItems = [
    { id: "komitmen", label: "Komitmen Keamanan" },
    { id: "pilar-keamanan", label: "6 Lapisan Perlindungan Data" },
    { id: "spesifikasi", label: "Tabel Standar Keamanan" },
    { id: "responsible-disclosure", label: "Pelaporan Celah Keamanan" },
    { id: "kontak", label: "Tanya Tim Keamanan" },
  ];

  const pillars = [
    {
      title: "1. Jalur Akses Terkunci (Bebas Sadapan)",
      badge: "Enkripsi Transit TLS 1.3",
      icon: Lock,
      description:
        "Saat Anda mengetik alamat rumah atau membuka laporan di HP, seluruh koneksi langsung dikunci menggunakan standar enkripsi bank. Siapa pun di jaringan Wi-Fi publik tidak bisa mengintip apa yang sedang Anda cari.",
    },
    {
      title: "2. Data Tersimpan Terkunci Rapat",
      badge: "Standar Enkripsi AES-256",
      icon: ShieldCheck,
      description:
        "Catatan perumahan incaran dan hasil analisis Anda disimpan dalam kondisi terkunci otomatis. Data Anda aman tersimpan dan tidak dapat dibaca oleh pihak luar tanpa kunci keamanan khusus.",
    },
    {
      title: "3. Server Andal Kelas Dunia (Google Cloud)",
      badge: "Sertifikasi ISO 27001 & SOC 2",
      icon: Server,
      description:
        "Rumper beroperasi di atas infrastruktur Google Cloud Platform yang dijaga 24 jam. Dilengkapi dinding pengaman otomatis (firewall) untuk mencegah serangan peretas dan menjaga platform tetap stabil diakses.",
    },
    {
      title: "4. Masuk Aman via Google (Tanpa Password Baru)",
      badge: "Google OAuth 2.0 Resmi",
      icon: KeyRound,
      description:
        "Anda masuk dengan akun Google resmi Anda. Anda tidak perlu membuat kata sandi baru di Rumper yang berisiko mudah ditebak atau lupa. Akses login Anda terlindungi oleh sistem keamanan Google.",
    },
    {
      title: "5. Bebas Risiko Kartu Kredit",
      badge: "Mitra Resmi Berizin Bank Indonesia",
      icon: CreditCard,
      description:
        "Pembayaran laporan diproses langsung oleh gerbang pembayaran resmi berstandar PCI-DSS. Server Rumper sama sekali tidak pernah melihat atau menyimpan nomor kartu kredit atau PIN perbankan Anda.",
    },
    {
      title: "6. Salinan Data Otomatis Setiap 24 Jam",
      badge: "Backup Harian Terpisah",
      icon: RefreshCw,
      description:
        "Sistem kami membuat salinan cadangan (backup) otomatis setiap hari di lokasi server yang terpisah. Jika suatu saat terjadi gangguan teknis pada server utama, riwayat laporan Anda tetap utuh dan terselamatkan.",
    },
  ];

  return (
    <LegalLayout
      title="Keamanan Sistem & Data"
      badge="Pusat Keamanan & Kepercayaan"
      subtitle="Keamanan data Anda adalah prioritas kami. Inilah cara Rumper menjaga rute kantor, rumah incaran, dan akun Anda tetap aman dari risiko kebocoran data."
      lastUpdated="4 Oktober 2026"
      tocItems={tocItems}
    >
      {/* Signature Dark Statement Card: Security Commitment */}
      <section id="komitmen" className="legal-dark-card space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#00ed64]">
          <ShieldCheck className="w-4 h-4" />
          <span>Keamanan Berlapis Sejak Hari Pertama</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Data Pencarian Anda Dijaga dengan Standar Terbaik
        </h2>
        <p className="text-sm leading-relaxed text-[#d0dde0]">
          Kami menyadari bahwa informasi lokasi kantor, rutinitas berangkat kerja, dan pilihan rumah incaran adalah hal yang sangat pribadi. Di Rumper, keamanan bukan fitur tambahan, melainkan komitmen utama kami agar Anda bisa mengevaluasi rumah masa depan dengan rasa tenang.
        </p>
      </section>

      {/* 6 Visual Pillars Grid (Easy to Understand Cards) */}
      <section id="pilar-keamanan" className="space-y-5 pt-2">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
            6 Lapisan Perlindungan Data Rumper
          </h2>
          <p className="text-xs sm:text-sm text-[#5c6c7a]">
            Inilah langkah nyata yang kami terapkan untuk memastikan akun dan data Anda terlindungi setiap saat.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="security-pillar-card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="security-pillar-icon-box">
                    <pillar.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-[#001e2b]">
                      {pillar.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#00684a] bg-[#eaf5ef] px-2 py-0.5 rounded-md">
                      {pillar.badge}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#3d4f5b] leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Parameter Summary Table — With "Manfaat untuk Anda" */}
      <section id="spesifikasi" className="legal-paper-card space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#001e2b]">
          Ringkasan Standar Keamanan Kami
        </h2>
        <p className="text-xs sm:text-sm text-[#5c6c7a]">
          Bagi Anda yang ingin mengetahui detail teknis perlindungan yang kami gunakan:
        </p>
        <div className="overflow-x-auto rounded-xl border border-[#d7e1e5]">
          <table className="w-full text-left text-xs text-[#3d4f5b]">
            <thead className="bg-[#f0f5f2] text-[#001e2b] font-bold border-b border-[#d7e1e5]">
              <tr>
                <th className="p-3">Aspek Keamanan</th>
                <th className="p-3">Teknologi yang Digunakan</th>
                <th className="p-3">Manfaat untuk Anda</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceff1]">
              <tr className="hover:bg-[#f8faf8]">
                <td className="p-3 font-semibold text-[#001e2b]">Koneksi Internet</td>
                <td className="p-3">Enkripsi TLS 1.3 / SSL 256-bit</td>
                <td className="p-3">Pencarian rumah tidak bisa disadap di Wi-Fi mana pun.</td>
              </tr>
              <tr className="hover:bg-[#f8faf8]">
                <td className="p-3 font-semibold text-[#001e2b]">Penyimpanan Data</td>
                <td className="p-3">Enkripsi AES-256 Storage</td>
                <td className="p-3">Data tersimpan terkunci rapat di cloud Google.</td>
              </tr>
              <tr className="hover:bg-[#f8faf8]">
                <td className="p-3 font-semibold text-[#001e2b]">Masuk Akun</td>
                <td className="p-3">Google OAuth 2.0 Resmi</td>
                <td className="p-3">Praktis tanpa password baru, terbebas dari lupa sandi.</td>
              </tr>
              <tr className="hover:bg-[#f8faf8]">
                <td className="p-3 font-semibold text-[#001e2b]">Data Kartu Kredit</td>
                <td className="p-3">Nihil Simpanan di Server Rumper</td>
                <td className="p-3">Aman 100% dari kebocoran kartu kredit di pihak kami.</td>
              </tr>
              <tr className="hover:bg-[#f8faf8]">
                <td className="p-3 font-semibold text-[#001e2b]">Pencadangan Data</td>
                <td className="p-3">Backup Otomatis Harian (24 Jam)</td>
                <td className="p-3">Laporan yang pernah Anda beli tidak akan hilang.</td>
              </tr>
              <tr className="hover:bg-[#f8faf8]">
                <td className="p-3 font-semibold text-[#001e2b]">Payung Hukum</td>
                <td className="p-3">UU No. 27/2022 (UU PDP)</td>
                <td className="p-3">Hak privasi Anda dilindungi secara hukum nasional.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Responsible Disclosure Section */}
      <section id="responsible-disclosure" className="legal-paper-card space-y-4">
        <div className="flex items-center gap-2 font-bold text-sm text-[#00684a]">
          <ShieldAlert className="w-5 h-5 flex-shrink-0 text-[#00ed64]" />
          <span>Program Pelaporan Celah Keamanan (Responsible Disclosure)</span>
        </div>
        <p className="text-sm leading-relaxed text-[#3d4f5b]">
          Kami menyambut baik bantuan dari peneliti keamanan siber dan komunitas teknologi untuk menjaga ekosistem Rumper tetap aman. Jika Anda menemukan potensi celah keamanan di platform kami, mohon laporkan secara bertanggung jawab kepada tim teknis kami:
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
          <a
            href="mailto:security@rumper.id"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#001e2b] text-white text-xs font-bold shadow-sm hover:bg-[#003d4f] transition-all"
          >
            <Mail className="w-4 h-4 text-[#00ed64]" />
            <span>Kirim Laporan ke security@rumper.id</span>
          </a>
          <span className="text-xs text-[#5c6c7a]">
            Tim kami akan membalas maksimal dalam 2 hari kerja.
          </span>
        </div>
      </section>

      {/* Bottom Contact Section */}
      <section id="kontak" className="legal-paper-card space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="font-bold text-sm text-[#001e2b]">Punya Pertanyaan Seputar Keamanan Data?</div>
            <div className="text-xs text-[#5c6c7a]">Tim kami siap memberikan penjelasan lengkap dengan senang hati.</div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href="https://wa.me/6281289000000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00ed64] hover:bg-[#00b545] text-[#001e2b] font-bold text-xs transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Resmi</span>
            </a>
            <Link
              to="/privacy"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#f2f6f4] text-[#001e2b] text-xs font-semibold hover:bg-[#e3fcef] transition-colors"
            >
              <span>Baca Kebijakan Privasi</span>
              <ExternalLink className="w-3 h-3 text-[#00684a]" />
            </Link>
          </div>
        </div>
      </section>
    </LegalLayout>
  );
}
