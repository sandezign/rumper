// Playground-only mock: structured desk-research findings keyed by map marker kind.
// Feeds the map detail dialog (claim · confidence · limitation · field action).

export interface MockFindingDetails {
  claim: string;
  evidence: { source_title: string; url: string | null; accessed_at: string; kind: string }[];
  confidence: "data_kuat" | "data_sedang" | "perlu_validasi";
  limitation: string;
  validation_action: string;
  is_red_flag: boolean;
  is_critical: boolean;
}

export const MOCK_FINDINGS_LOOKUP: Record<string, MockFindingDetails> = {
  sutet_tower: {
    claim: "Terdeteksi jalur SUTET 150kV berjarak ~350 meter dari properti kandidat.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: "https://www.openstreetmap.org", accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Akurasi data OpenStreetMap berasal dari kontribusi komunitas dan koordinat tiang SUTET sekunder.",
    validation_action: "Lakukan pengecekan visual jarak bebas kabel transmisi teratas dari atap rumah kandidat.",
    is_red_flag: true,
    is_critical: false,
  },
  industrial: {
    claim: "Pabrik Tekstil Pekayon berjarak ~850 meter di sebelah utara properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "perlu_validasi",
    limitation: "Kondisi polusi udara, asap, dan kebisingan bergantung pada arah angin serta jam operasional aktif pabrik.",
    validation_action: "Tanyakan kepada tetangga terdekat atau pengurus RT setempat mengenai aroma bau limbah/asap di malam hari.",
    is_red_flag: true,
    is_critical: false,
  },
  hospital: {
    claim: "Akses cepat ke RS Hermina Galaxy yang berjarak ~0.48 km.",
    evidence: [{ source_title: "Database Foursquare & OSM", url: null, accessed_at: "2026-06", kind: "database" }],
    confidence: "data_kuat",
    limitation: "Skor hanya menghitung keberadaan fisik bangunan, bukan kualitas layanan medis nyata atau ketersediaan dokter spesialis.",
    validation_action: "Kunjungi UGD RS Hermina Galaxy untuk memastikan layanan gawat darurat beroperasi 24 jam penuh.",
    is_red_flag: false,
    is_critical: false,
  },
  station: {
    claim: "Stasiun Bekasi terdekat berjarak ~2.05 km dari lokasi properti.",
    evidence: [{ source_title: "Google Maps Routing API", url: null, accessed_at: "2026-06", kind: "api" }],
    confidence: "perlu_validasi",
    limitation: "Jarak garis lurus tidak memperhitungkan macet total di persimpangan jalan penghubung pada jam sibuk pagi.",
    validation_action: "Lakukan uji jalan dari rumah ke stasiun pada hari kerja (Senin-Jumat) antara pukul 07.30 - 08.15 WIB.",
    is_red_flag: false,
    is_critical: false,
  },
  toll_gate: {
    claim: "Gerbang Tol Bekasi Barat 1 berjarak ~1.88 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Akses menuju gerbang tol sering mengalami kemacetan parah pada sore hari jam pulang kantor.",
    validation_action: "Uji waktu tempuh nyata dari lokasi rumah kandidat menuju gerbang tol pada jam sibuk.",
    is_red_flag: false,
    is_critical: false,
  },
  home: {
    claim: "Skor kelayakan lokasi 54/100 (Hati-hati). Berada di area cekungan elevasi mikro (-0.6 m vs sekitar).",
    evidence: [{ source_title: "InaRISK BNPB & ASTER GDEM", url: "https://inarisk.bnpb.go.id", accessed_at: "2026-06", kind: "government" }],
    confidence: "data_sedang",
    limitation: "Model elevasi digital memiliki grid resolusi 30 meter horisontal yang tidak merekam tanggul lokal buatan pengembang.",
    validation_action: "Pastikan fondasi bangunan utama ditinggikan minimal 60 cm dari ketinggian aspal jalan depan rumah.",
    is_red_flag: false,
    is_critical: true,
  },
  clinic: {
    claim: "Klinik Pratama Galaxy berjarak ~0.19 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Klinik pratama biasanya memiliki fasilitas terbatas dan tidak selalu memiliki dokter jaga 24 jam.",
    validation_action: "Verifikasi jam operasional klinik terdekat untuk pertolongan pertama.",
    is_red_flag: false,
    is_critical: false,
  },
  pharmacy: {
    claim: "Apotek K-24 Galaxy berjarak ~0.22 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Meskipun jaringan waralaba K-24 terkenal buka 24 jam, persediaan obat spesifik bisa kosong.",
    validation_action: "Pastikan apotek terdekat ini beroperasi penuh 24 jam untuk kebutuhan obat darurat.",
    is_red_flag: false,
    is_critical: false,
  },
  school: {
    claim: "SMA Negeri 12 Bekasi berjarak ~1.62 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Sistem zonasi sekolah negeri dapat berubah setiap tahun ajaran baru.",
    validation_action: "Cek aturan zonasi terbaru untuk memastikan kelayakan pendaftaran sekolah anak Anda.",
    is_red_flag: false,
    is_critical: false,
  },
  market: {
    claim: "Pasar Fresh Market Galaxy berjarak ~0.67 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Akses jalan menuju pasar di pagi hari sering mengalami hambatan lalu lintas lokal.",
    validation_action: "Cek kemudahan parkir dan akses jalan di sekitar pasar pada jam sibuk pagi.",
    is_red_flag: false,
    is_critical: false,
  },
  supermarket: {
    claim: "Superindo Grand Galaxy berjarak ~0.04 km dari lokasi properti.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Sangat dekat sehingga ada potensi kebisingan parkir kendaraan pengunjung bagi rumah di blok terdepan.",
    validation_action: "Cek apakah ada kebisingan atau getaran bongkar muat barang di supermarket di malam hari.",
    is_red_flag: false,
    is_critical: false,
  },
  landfill: {
    claim: "Terdeteksi area pengolahan sampah/TPS liar dalam radius ~550 meter.",
    evidence: [{ source_title: "Laporan Pengaduan Warga", url: null, accessed_at: "2026-06", kind: "social" }],
    confidence: "data_sedang",
    limitation: "Tingkat bau tidak sedap bertambah parah pada musim hujan dengan arah angin ke arah barat properti.",
    validation_action: "Verifikasi aroma udara komplek di sore hari saat musim hujan.",
    is_red_flag: true,
    is_critical: false,
  },
  cemetery: {
    claim: "Terdapat area pemakaman berjarak ~300 meter.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "data_kuat",
    limitation: "Estetika lingkungan sekitar bisa terpengaruh bagi calon pembeli tertentu.",
    validation_action: "Cek apakah jalur akses utama menuju rumah melewati depan pemakaman.",
    is_red_flag: true,
    is_critical: false,
  },
  rail_point: {
    claim: "Terdeteksi rel kereta api aktif dalam radius ~800 meter.",
    evidence: [{ source_title: "OpenStreetMap Warehouse", url: null, accessed_at: "2026-06", kind: "warehouse" }],
    confidence: "perlu_validasi",
    limitation: "Kebisingan dan getaran kereta bervariasi tergantung pada frekuensi perjalanan dan kepadatan bangunan sekitar.",
    validation_action: "Cek tingkat kebisingan di dalam rumah saat kereta KRL/Logistik melintas.",
    is_red_flag: true,
    is_critical: false,
  },
};
