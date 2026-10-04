export type FitCategory = "strong-fit" | "interesting-tradeoff" | "challenge-assumptions"

export interface CuratedArea {
  id: string
  name: string
  region: string // e.g. 'Tangerang Selatan', 'Kota Depok', 'Kota Bekasi'
  category: FitCategory
  categoryLabel: string // e.g. 'Kompromi Menarik'
  commuteTime: string // e.g. '~38 Menit'
  commuteMinutes: number // 38
  commuteMode: string // e.g. 'KRL Green Line'
  priceRange: string // e.g. 'Rp 950 Jt – 2,8 M'
  priceMin: number // 950
  priceMax: number // 2800
  elevationDpl: string // e.g. '28 mdpl'
  elevationScore: "Aman" | "Waspada" | "Tinggi"
  isShortlisted?: boolean
  latLng: [number, number] // Real GIS Latitude & Longitude
  latLngRoute: [number, number][] // Geographic Transit Waypoints to Sudirman
  mapCoordinates: {
    x: number // Percentage 0..100 across Jabodetabek canvas fallback
    y: number // Percentage 0..100 across Jabodetabek canvas fallback
  }
  routePoints: { x: number; y: number }[] // Fallback vector points
  summaryNarrative: string
  cocokReason: string // 'Mengapa Selaras'
  tradeoffReason: string // 'Kompromi Nyata'
  registeredPropertiesCount: number
  checkpointsCount: number
  transitOptions: {
    type: "krl" | "tol" | "mrt" | "lrt"
    label: string
    distance: string
    interval: string
  }[]
  essentialFacilities: {
    hospital: string
    school: string
    market: string
    transitKm: string
  }
}

export const SUDIRMAN_GRAVITY_CENTER = {
  name: "Sudirman (Pusat Aktivitas Utama)",
  sublabel: "Lokasi Kerja & Mobilitas Harian",
  latLng: [-6.215, 106.82] as [number, number],
  mapCoordinates: { x: 55, y: 38 },
}

export const initialCuratedAreas: CuratedArea[] = [
  {
    id: "area-bintaro",
    name: "Bintaro & Pondok Aren",
    region: "Tangerang Selatan",
    category: "interesting-tradeoff",
    categoryLabel: "Kompromi Menarik",
    commuteTime: "~38 Menit",
    commuteMinutes: 38,
    commuteMode: "KRL Lin Rangkasbitung ke Tanah Abang / Sudirman",
    priceRange: "Rp 950 Jt – 2,8 M",
    priceMin: 950,
    priceMax: 2800,
    elevationDpl: "28 mdpl",
    elevationScore: "Aman",
    isShortlisted: true,
    latLng: [-6.288, 106.726],
    latLngRoute: [
      [-6.288, 106.726],
      [-6.265, 106.745],
      [-6.244, 106.782],
      [-6.215, 106.82],
    ],
    mapCoordinates: { x: 42, y: 48 },
    routePoints: [
      { x: 42, y: 48 },
      { x: 48, y: 43 },
      { x: 55, y: 38 },
    ],
    summaryNarrative:
      "Akses KRL langsung ke pusat Jakarta via Stasiun Jurang Mangu & Pondok Ranji, didukung fasilitas komersial mapan.",
    cocokReason:
      "Akses KRL langsung ke Stasiun Sudirman / Tanah Abang dalam 38 menit, dekat Stasiun Jurang Mangu dan Gerbang Tol Pondok Aren (JORR).",
    tradeoffReason:
      "Dengan budget yang sama, ukuran tanah 20–30% lebih padat (compact) dibandingkan koridor Sawangan atau Cisauk.",
    registeredPropertiesCount: 3,
    checkpointsCount: 3,
    transitOptions: [
      {
        type: "krl",
        label: "Stasiun Jurang Mangu",
        distance: "600 m jalan kaki",
        interval: "Setiap 8–10 menit",
      },
      {
        type: "tol",
        label: "Gerbang Tol Pondok Aren",
        distance: "1,8 km",
        interval: "Akses JORR / Bandara",
      },
    ],
    essentialFacilities: {
      hospital: "RS Premier Bintaro (1,8 km)",
      school: "BPK Penabur & HighScope (1,2 km)",
      market: "Pasar Modern Bintaro Sektor 7 (900 m)",
      transitKm: "0,6 km ke Stasiun",
    },
  },
  {
    id: "area-serpong",
    name: "Serpong & BSD Fringe",
    region: "Kab. Tangerang / Tangsel Border",
    category: "interesting-tradeoff",
    categoryLabel: "Kompromi Menarik",
    commuteTime: "~48 Menit",
    commuteMinutes: 48,
    commuteMode: "KRL Intermoda Cisauk / Rawa Buntu",
    priceRange: "Rp 800 Jt – 2,4 M",
    priceMin: 800,
    priceMax: 2400,
    elevationDpl: "34 mdpl",
    elevationScore: "Aman",
    isShortlisted: false,
    latLng: [-6.319, 106.663],
    latLngRoute: [
      [-6.319, 106.663],
      [-6.288, 106.726],
      [-6.244, 106.782],
      [-6.215, 106.82],
    ],
    mapCoordinates: { x: 30, y: 55 },
    routePoints: [
      { x: 30, y: 55 },
      { x: 38, y: 50 },
      { x: 48, y: 43 },
      { x: 55, y: 38 },
    ],
    summaryNarrative:
      "Konektivitas terpadu skybridge Intermoda ke Stasiun Cisauk dengan akses Tol Serpong-Balaraja.",
    cocokReason:
      "Integrasi skybridge pejalan kaki ke Stasiun Cisauk (Intermoda) serta kemudahan akses Tol Serbaraja seksi 1B.",
    tradeoffReason:
      "Perjalanan mobil via tol di jam sibuk pagi rawan tersendat di gerbang tol Ulujami (waktu tempuh mobil bisa 70+ menit).",
    registeredPropertiesCount: 2,
    checkpointsCount: 4,
    transitOptions: [
      {
        type: "krl",
        label: "Stasiun Cisauk (Intermoda)",
        distance: "850 m",
        interval: "Setiap 10 menit",
      },
      {
        type: "tol",
        label: "Tol Serbaraja Pintu 2",
        distance: "2,5 km",
        interval: "Koneksi Tol Jakarta-Serpong",
      },
    ],
    essentialFacilities: {
      hospital: "Eka Hospital BSD (3,5 km)",
      school: "Prasetiya Mulya & Stella Maris (2,2 km)",
      market: "Pasar Modern Intermoda BSD (850 m)",
      transitKm: "0,8 km ke Stasiun",
    },
  },
  {
    id: "area-sawangan",
    name: "Sawangan & Bojongsari",
    region: "Kota Depok / Tangsel Border",
    category: "strong-fit",
    categoryLabel: "Kesesuaian Kuat",
    commuteTime: "~55 Menit",
    commuteMinutes: 55,
    commuteMode: "Tol Desari (Depok-Antasari) / Feeder KRL",
    priceRange: "Rp 600 Jt – 1,65 M",
    priceMin: 600,
    priceMax: 1650,
    elevationDpl: "62 mdpl",
    elevationScore: "Tinggi",
    isShortlisted: true,
    latLng: [-6.415, 106.762],
    latLngRoute: [
      [-6.415, 106.762],
      [-6.335, 106.79],
      [-6.27, 106.805],
      [-6.215, 106.82],
    ],
    mapCoordinates: { x: 50, y: 74 },
    routePoints: [
      { x: 50, y: 74 },
      { x: 52, y: 60 },
      { x: 54, y: 48 },
      { x: 55, y: 38 },
    ],
    summaryNarrative:
      "Memberikan luas tanah dan bangunan tertinggi per rupiah (Rp 7,5 Jt/m²) dengan elevasi alami 62 mdpl (risiko genangan rendah).",
    cocokReason:
      "Rasio luas tanah per rupiah tertinggi di selatan Jakarta, kontur tanah tinggi bebas genangan, dan akses tol Desari.",
    tradeoffReason:
      "Waktu tempuh komuter 55–65 menit ke pusat kota membutuhkan toleransi mobilitas atau pola kerja hybrid.",
    registeredPropertiesCount: 4,
    checkpointsCount: 3,
    transitOptions: [
      {
        type: "tol",
        label: "Gerbang Tol Sawangan 4 (Desari)",
        distance: "1,5 km",
        interval: "Akses TB Simatupang",
      },
      {
        type: "krl",
        label: "Stasiun Citayam / Depok",
        distance: "5,8 km",
        interval: "Feeder angkot / ojol",
      },
    ],
    essentialFacilities: {
      hospital: "RSUD KiSA Kota Depok (1,4 km)",
      school: "Sekolah Cita Persada (1,8 km)",
      market: "The Park Sawangan Mall (2,1 km)",
      transitKm: "1,5 km ke Tol Desari",
    },
  },
  {
    id: "area-margonda",
    name: "Margonda & Beji",
    region: "Kota Depok",
    category: "strong-fit",
    categoryLabel: "Kesesuaian Kuat",
    commuteTime: "~42 Menit",
    commuteMinutes: 42,
    commuteMode: "KRL Lin Bogor (Pondok Cina / Depok Baru)",
    priceRange: "Rp 650 Jt – 1,8 M",
    priceMin: 650,
    priceMax: 1800,
    elevationDpl: "52 mdpl",
    elevationScore: "Tinggi",
    isShortlisted: true,
    latLng: [-6.372, 106.833],
    latLngRoute: [
      [-6.372, 106.833],
      [-6.308, 106.84],
      [-6.255, 106.852],
      [-6.215, 106.82],
    ],
    mapCoordinates: { x: 58, y: 64 },
    routePoints: [
      { x: 58, y: 64 },
      { x: 57, y: 50 },
      { x: 55, y: 38 },
    ],
    summaryNarrative:
      "Kawasan mapan dengan fasilitas pendidikan dan kesehatan terlengkap serta akses 3 stasiun KRL utama.",
    cocokReason:
      "Akses langsung Stasiun Pondok Cina dan Depok Baru dengan waktu tempuh ~42 menit ke Manggarai / Sudirman.",
    tradeoffReason:
      "Arteri Margonda padat pada akhir pekan dan lebar jalan lingkungan di sekitar stasiun relatif terbatas.",
    registeredPropertiesCount: 2,
    checkpointsCount: 3,
    transitOptions: [
      {
        type: "krl",
        label: "Stasiun Pondok Cina",
        distance: "700 m",
        interval: "Setiap 5–7 menit",
      },
      {
        type: "tol",
        label: "Gerbang Tol Margonda (Cijago)",
        distance: "1,2 km",
        interval: "Koneksi Jagorawi & JORR 2",
      },
    ],
    essentialFacilities: {
      hospital: "RSUI & RS Mitra Keluarga Depok (900 m)",
      school: "Kampus UI & Pribadi Bilingual (1,5 km)",
      market: "Margo City Mall (800 m)",
      transitKm: "0,7 km ke Stasiun",
    },
  },
  {
    id: "area-pamulang",
    name: "Pamulang & Ciputat",
    region: "Tangerang Selatan",
    category: "strong-fit",
    categoryLabel: "Kesesuaian Kuat",
    commuteTime: "~45 Menit",
    commuteMinutes: 45,
    commuteMode: "Feeder MRT Lebak Bulus / Tol Cinere-Serpong",
    priceRange: "Rp 700 Jt – 1,9 M",
    priceMin: 700,
    priceMax: 1900,
    elevationDpl: "38 mdpl",
    elevationScore: "Aman",
    isShortlisted: false,
    latLng: [-6.345, 106.745],
    latLngRoute: [
      [-6.345, 106.745],
      [-6.29, 106.775],
      [-6.245, 106.8],
      [-6.215, 106.82],
    ],
    mapCoordinates: { x: 44, y: 60 },
    routePoints: [
      { x: 44, y: 60 },
      { x: 49, y: 48 },
      { x: 55, y: 38 },
    ],
    summaryNarrative:
      "Pilihan klaster perumahan terjangkau di Tangsel dengan akses cepat Tol Serpong-Cinere dan feeder MRT.",
    cocokReason:
      "Dekat pusat Kota Tangsel, lingkungan klaster mandiri, dan kemudahan akses Gerbang Tol Pamulang (JORR 2).",
    tradeoffReason:
      "Persimpangan Gaplek dan ruas Ciputat Raya rawan padat kendaraan pada jam pulang kerja.",
    registeredPropertiesCount: 3,
    checkpointsCount: 3,
    transitOptions: [
      {
        type: "tol",
        label: "Gerbang Tol Pamulang",
        distance: "1,1 km",
        interval: "Tol Serpong-Cinere",
      },
      {
        type: "mrt",
        label: "Feeder TransJakarta MRT Lebak Bulus",
        distance: "6,5 km",
        interval: "Setiap 15 menit",
      },
    ],
    essentialFacilities: {
      hospital: "RS Permata Pamulang (800 m)",
      school: "Al-Azhar Pamulang (1,2 km)",
      market: "Pasar Kita Pamulang (1,0 km)",
      transitKm: "1,1 km ke Gerbang Tol",
    },
  },
  {
    id: "area-cibubur",
    name: "Cibubur & Cipayung",
    region: "Depok / Jakarta Timur Border",
    category: "strong-fit",
    categoryLabel: "Kesesuaian Kuat",
    commuteTime: "~46 Menit",
    commuteMinutes: 46,
    commuteMode: "LRT Jabodebek Harjamukti / Tol Jagorawi",
    priceRange: "Rp 750 Jt – 2,2 M",
    priceMin: 750,
    priceMax: 2200,
    elevationDpl: "45 mdpl",
    elevationScore: "Aman",
    isShortlisted: false,
    latLng: [-6.368, 106.905],
    latLngRoute: [
      [-6.368, 106.905],
      [-6.32, 106.875],
      [-6.245, 106.865],
      [-6.215, 106.82],
    ],
    mapCoordinates: { x: 70, y: 62 },
    routePoints: [
      { x: 70, y: 62 },
      { x: 64, y: 50 },
      { x: 55, y: 38 },
    ],
    summaryNarrative:
      "LRT Jabodebek Stasiun Harjamukti memberikan kepastian komuter bebas macet langsung ke Dukuh Atas / Rasuna Said.",
    cocokReason:
      "Transit modern LRT Jabodebek langsung ke Kuningan / Dukuh Atas dalam 35 menit serta akses Tol Jagorawi.",
    tradeoffReason:
      "Jalur arteri Transyogi sering tersendat pada jam pulang kerja sore dan akhir pekan.",
    registeredPropertiesCount: 2,
    checkpointsCount: 3,
    transitOptions: [
      {
        type: "lrt",
        label: "Stasiun LRT Harjamukti",
        distance: "1,8 km",
        interval: "Setiap 6–10 menit",
      },
      {
        type: "tol",
        label: "Gerbang Tol Cibubur (Jagorawi)",
        distance: "2,2 km",
        interval: "Tol Dalam Kota",
      },
    ],
    essentialFacilities: {
      hospital: "RS Meilia & RS Mitra Keluarga Cibubur (1,5 km)",
      school: "Sekolah Islam Al-Azhar Cibubur (2,0 km)",
      market: "Trans Studio Mall Cibubur (1,4 km)",
      transitKm: "1,8 km ke LRT Harjamukti",
    },
  },
  {
    id: "area-bekasi",
    name: "Bekasi Barat & Kranji",
    region: "Kota Bekasi",
    category: "strong-fit",
    categoryLabel: "Kesesuaian Kuat",
    commuteTime: "~50 Menit",
    commuteMinutes: 50,
    commuteMode: "KRL Lin Cikarang (Kranji / Stasiun Bekasi)",
    priceRange: "Rp 600 Jt – 1,75 M",
    priceMin: 600,
    priceMax: 1750,
    elevationDpl: "22 mdpl",
    elevationScore: "Aman",
    isShortlisted: false,
    latLng: [-6.235, 106.985],
    latLngRoute: [
      [-6.235, 106.985],
      [-6.22, 106.94],
      [-6.216, 106.868],
      [-6.215, 106.82],
    ],
    mapCoordinates: { x: 80, y: 44 },
    routePoints: [
      { x: 80, y: 44 },
      { x: 68, y: 40 },
      { x: 55, y: 38 },
    ],
    summaryNarrative:
      "Jalur KRL Double-Double Track ke Manggarai dengan frekuensi padat dan pusat komersial Summarecon yang lengkap.",
    cocokReason:
      "Frekuensi KRL Lin Cikarang sangat tinggi ke Manggarai / Sudirman serta opsi cepat Tol Becakayu.",
    tradeoffReason:
      "Perumahan non-developer besar di cekungan lama memerlukan verifikasi pompa dan saluran drainase makro.",
    registeredPropertiesCount: 2,
    checkpointsCount: 3,
    transitOptions: [
      {
        type: "krl",
        label: "Stasiun Kranji & Bekasi",
        distance: "1,2 km",
        interval: "Setiap 5 menit",
      },
      {
        type: "tol",
        label: "Tol Becakayu / Jakarta-Cikampek",
        distance: "1,5 km",
        interval: "Akses Cawang",
      },
    ],
    essentialFacilities: {
      hospital: "RS Primaya Bekasi Barat (1,3 km)",
      school: "Al-Azhar Summarecon Bekasi (2,5 km)",
      market: "Summarecon Mall & Pasar Kranji (1,1 km)",
      transitKm: "1,2 km ke Stasiun Kranji",
    },
  },
  {
    id: "area-cikarang",
    name: "Cikarang Transit Corridor",
    region: "Kabupaten Bekasi",
    category: "challenge-assumptions",
    categoryLabel: "Opsi Alternatif",
    commuteTime: "~65 Menit",
    commuteMinutes: 65,
    commuteMode: "KRL Cikarang Ekspres / Tol Layang MBZ",
    priceRange: "Rp 450 Jt – 1,2 M",
    priceMin: 450,
    priceMax: 1200,
    elevationDpl: "18 mdpl",
    elevationScore: "Aman",
    isShortlisted: false,
    latLng: [-6.262, 107.135],
    latLngRoute: [
      [-6.262, 107.135],
      [-6.25, 107.055],
      [-6.235, 106.985],
      [-6.215, 106.82],
    ],
    mapCoordinates: { x: 92, y: 52 },
    routePoints: [
      { x: 92, y: 52 },
      { x: 80, y: 44 },
      { x: 68, y: 40 },
      { x: 55, y: 38 },
    ],
    summaryNarrative:
      "Opsi alternatif untuk mendapatkan luas tanah 2x lebih besar dengan budget separuh kawasan penyangga utama.",
    cocokReason:
      "Rumah 2 lantai baru dengan luas tanah 90–120 m² di bawah Rp 800 Juta, sangat efisien untuk alokasi cicilan KPR.",
    tradeoffReason:
      "Jarak fisik 35+ km ke Sudirman mewajibkan komitmen waktu komuter 65–80 menit setiap hari kerja.",
    registeredPropertiesCount: 1,
    checkpointsCount: 4,
    transitOptions: [
      {
        type: "krl",
        label: "Stasiun Cikarang",
        distance: "2,5 km",
        interval: "Setiap 15 menit",
      },
      {
        type: "tol",
        label: "Gerbang Tol Cikarang Barat (MBZ)",
        distance: "3,0 km",
        interval: "Tol Layang Jakarta",
      },
    ],
    essentialFacilities: {
      hospital: "RS Siloam Lippo Cikarang (4,0 km)",
      school: "Sekolah Dian Harapan (3,8 km)",
      market: "Mall Lippo Cikarang (3,5 km)",
      transitKm: "2,5 km ke Stasiun",
    },
  },
]
