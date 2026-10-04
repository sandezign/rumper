import { useState } from "react";
import { X } from "lucide-react";
import AppShellV2 from "@/components/AppShellV2";
import AssistantRailV2 from "@/components/AssistantRailV2";
import { AnalysisWorkspaceV2 } from "@/components/analysis/AnalysisWorkspaceV2";
import MapPanelV3 from "@/components/MapPanelV3";
import type { ChatMessage, Convo, MapData, LegacyReport, User, LegacyFinding } from "@/lib/api";

const MOCK_USER: User = {
  id: "user-1",
  email: "arisandy@rumper.co",
  name: "Arisandy",
  picture: "https://lh3.googleusercontent.com/a/ACg8ocL-Z-105-mock",
  tokens_used_today: 12,
  token_limit: 100,
};

const MOCK_CONVOS: Convo[] = [
  {
    id: "convo-1",
    title: "Grand Galaxy City, Bekasi",
    state: "report_qa",
    project_id: null,
    intake_id: "intake-galaxy",
    updated_at: new Date().toISOString(),
    property_name: "Grand Galaxy City",
    rls_score: 54,
    band: "hati_hati",
    band_label: "Hati-hati",
  },
  {
    id: "convo-2",
    title: "Cluster Mawar, Grand Wisata",
    state: "report_qa",
    project_id: null,
    intake_id: "intake-wisata",
    updated_at: new Date().toISOString(),
    property_name: "Grand Wisata",
    rls_score: 72,
    band: "layak_dengan_catatan",
    band_label: "Layak dengan Catatan",
  }
];

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    content: "Tolong cek risiko lokasi di Grand Galaxy City, RT.009/RW.012, Pekayon Jaya, Bekasi Selatan.",
  },
  {
    id: "m2",
    role: "assistant",
    content: "Saya telah memindai data spasial untuk lokasi ini. Hasil awal menunjukkan skor kelayakan lokasi adalah **54/100 (Hati-hati)**. Kekhawatiran utama adalah riwayat banjir di kawasan ini yang cukup sering terjadi.",
  },
  {
    id: "m3",
    role: "user",
    content: "Apakah dekat dengan rumah sakit atau stasiun?",
  },
  {
    id: "m4",
    role: "assistant",
    content: "Ya, lokasi ini memiliki akses fasilitas yang sangat baik (Skor 100/100). RS Hermina Galaxy berjarak sekitar 480 meter, dan Stasiun Bekasi terdekat berjarak sekitar 2 km.",
  },
];

const MOCK_REPORT: LegacyReport = {
  report_type: "mini_check",
  sources: [],
  property: {
    name: "Grand Galaxy City, RT.009/RW.012",
    formatted_address: "Grand Galaxy City, RT.009/RW.012, Pekayon Jaya, Kec. Bekasi Sel, Kota Bks, Jawa Barat 17148, Indonesia",
    lat: -6.2698,
    lng: 106.9749,
    in_jabodetabek: true,
  },
  rls_score: 54,
  band: "hati_hati",
  band_label: "Hati-hati",
  recommendation: "perlu_validasi",
  recommendation_label: "Validasi lebih lanjut sebelum memutuskan",
  summary: "Lokasi ini memiliki beberapa keunggulan, terutama akses ke fasilitas esensial seperti rumah sakit, klinik, apotek, dan pasar yang sangat dekat. Namun, kekhawatiran utama adalah potensi banjir, mengingat riwayat banjir di Grand Galaxy City yang mencapai ketinggian signifikan dan posisi tanah yang sedikit lebih rendah dari rata-rata sekitar. Selain itu, ada isu pencemaran udara/kebisingan rel kereta api di sekitar yang perlu diperhatikan.",
  categories: [
    {
      category: "banjir",
      label: "Ketahanan Banjir",
      weight: 30,
      score: 24,
      confidence: "perlu_validasi",
      rationale: "Kawasan Pekayon Jaya dan komplek perumahan Galaxy memiliki riwayat genangan berulang saat hujan intensitas tinggi.",
      findings: [
        {
          claim: "Pada Maret 2025, banjir di Grand Galaxy City mencapai ketinggian air 1.2 meter hingga 1.5 meter di area ruko dan jalan utama seperti Jalan Bulevar Raya.",
          evidence: [
            {
              source_title: "Laporan BMKG & Media Lokal",
              url: "https://www.bmkg.go.id",
              accessed_at: "2026-06",
              kind: "media",
            }
          ],
          confidence: "data_kuat",
          limitation: "Ketinggian banjir bervariasi bergantung pada elevasi spesifik blok rumah.",
          validation_action: "Cek elevasi titik rumah dan bandingkan dengan ketinggian banjir yang dilaporkan di area terdekat.",
          is_red_flag: true,
          is_critical: true,
          is_evidence_gap: false,
        },
        {
          claim: "Pekayon Jaya, termasuk Grand Galaxy City, rentan terhadap banjir karena beberapa aspek seperti penyumbatan saluran air dan luapan Kali Bekasi.",
          evidence: [
            {
              source_title: "Peta InaRISK BNPB",
              url: "https://inarisk.bnpb.go.id",
              accessed_at: "2026-06",
              kind: "government",
            }
          ],
          confidence: "data_kuat",
          limitation: "Model InaRISK menggunakan grid resolusi menengah.",
          validation_action: "Lakukan pengecekan lapangan untuk melihat kondisi saluran air, proyek pembangunan drainase terdekat, dan kondisi tanggul.",
          is_red_flag: false,
          is_critical: false,
          is_evidence_gap: false,
        }
      ],
    },
    {
      category: "commute",
      label: "Keandalan Commute",
      weight: 25,
      score: 50,
      confidence: "data_sedang",
      rationale: "Perjalanan ke pusat kota Jakarta membutuhkan waktu sekitar 45-60 menit dengan moda KRL Commuter Line atau kendaraan pribadi.",
      findings: [
        {
          claim: "Estimasi waktu perjalanan ke tempat kerja (Sudirman/SCBD) adalah sekitar 47-55 menit menggunakan satu kali transit via KRL Stasiun Bekasi.",
          evidence: [
            {
              source_title: "Google Maps Routing API",
              url: null,
              accessed_at: "2026-06",
              kind: "api",
            }
          ],
          confidence: "data_sedang",
          limitation: "Waktu tempuh dapat melonjak signifikan pada jam sibuk pagi (07.00 - 08.30).",
          validation_action: "Uji coba perjalanan langsung pada hari kerja di jam keberangkatan kantor.",
          is_red_flag: false,
          is_critical: false,
          is_evidence_gap: false,
        }
      ],
    },
    {
      category: "akses",
      label: "Aksesibilitas Jalan",
      weight: 20,
      score: 64,
      confidence: "data_kuat",
      rationale: "Lebar jalan utama memadai, namun akses menuju gerbang tol sering mengalami kemacetan.",
      findings: [
        {
          claim: "Pintu tol terdekat (Gerbang Tol Bekasi Barat 1) berjarak sekitar 1.88 km dari lokasi properti.",
          evidence: [
            {
              source_title: "Peta Navigasi OpenStreetMap",
              url: null,
              accessed_at: "2026-06",
              kind: "osm",
            }
          ],
          confidence: "data_kuat",
          limitation: "Jarak ukur garis lurus berbeda dengan rute jalan berkelok.",
          validation_action: "Verifikasi kemudahan putar balik dan waktu tempuh nyata ke pintu tol terdekat.",
          is_red_flag: false,
          is_critical: false,
          is_evidence_gap: false,
        }
      ],
    },
    {
      category: "fasilitas",
      label: "Fasilitas Sekitar",
      weight: 15,
      score: 100,
      confidence: "data_kuat",
      rationale: "Kawasan ini sangat matang dengan ketersediaan rumah sakit, apotek, sekolah, dan supermarket dalam radius sangat dekat.",
      findings: [
        {
          claim: "Terdapat RS Hermina Galaxy (0.48 km), Klinik Pratama (0.19 km), Apotek K-24 (0.22 km), sekolah (1.62 km), dan Superindo (0.04 km).",
          evidence: [
            {
              source_title: "Database Foursquare & OSM",
              url: null,
              accessed_at: "2026-06",
              kind: "database",
            }
          ],
          confidence: "data_kuat",
          limitation: "Kualitas pelayanan masing-masing fasilitas tidak diukur dalam skor ini.",
          validation_action: "Kunjungi fasilitas medis terdekat untuk memastikan tersedianya layanan UGD 24 jam.",
          is_red_flag: false,
          is_critical: false,
          is_evidence_gap: false,
        }
      ],
    },
    {
      category: "lingkungan",
      label: "Kondisi Lingkungan",
      weight: 10,
      score: 64,
      confidence: "data_sedang",
      rationale: "Adanya isu polusi suara dari jalur kereta api dan TPS ilegal di sekitar Bekasi Selatan.",
      findings: [
        {
          claim: "Ditemukan TPS liar dalam radius 550 meter yang berpotensi menimbulkan bau tidak sedap saat musim hujan.",
          evidence: [
            {
              source_title: "Laporan Pengaduan Warga DKI/Bekasi",
              url: null,
              accessed_at: "2026-06",
              kind: "social",
            }
          ],
          confidence: "data_sedang",
          limitation: "Status pembersihan TPS liar oleh dinas kebersihan setempat belum dipastikan.",
          validation_action: "Cek aroma udara dan kebersihan parit di sekitar radius 500m dari rumah kandidat.",
          is_red_flag: true,
          is_critical: false,
          is_evidence_gap: false,
        }
      ],
    }
  ],
  red_flags: [
    {
      claim: "Lokasi ini rentan banjir bandang/genangan tinggi hingga 1.5 meter.",
      evidence: [],
      confidence: "perlu_validasi",
      limitation: "",
      validation_action: "",
      is_red_flag: true,
      is_critical: true,
      is_evidence_gap: false,
    },
    {
      claim: "Adanya TPS liar berjarak 550m dari kandidat rumah.",
      evidence: [],
      confidence: "data_sedang",
      limitation: "",
      validation_action: "",
      is_red_flag: true,
      is_critical: false,
      is_evidence_gap: false,
    }
  ],
  evidence_gaps: [],
  checklist: [
    {
      item: "Periksa ketinggian fondasi bangunan dari jalan",
      category: "banjir",
      reason: "Galaxy rentan banjir, pastikan rumah kandidat ditinggikan minimal 60cm dari aspal."
    },
    {
      item: "Tanyakan warga sekitar tentang riwayat banjir terdahsyat",
      category: "banjir",
      reason: "Banjir Maret 2025 mencapai ruko Galaxy, konfirmasi apakah air masuk ke area rumah ini."
    },
    {
      item: "Kunjungi lokasi pada jam pulang kerja (17.30 - 19.30)",
      category: "commute",
      reason: "Jalan utama Galaxy kerap macet parah saat jam pulang kantor."
    },
    {
      item: "Periksa aroma sekitar komplek di siang hari",
      category: "lingkungan",
      reason: "Memastikan bau dari TPS liar radius 550m tidak bertiup ke komplek."
    }
  ],
  disclaimer: "Analisis ini disusun otomatis berdasarkan agregasi data sekunder (OSM, InaRISK, Google). Hasil check ini adalah opini kedua awal dan bukan jaminan lokasi aman dari banjir atau kerusakan lainnya. Harap lakukan verifikasi fisik sebelum melakukan DP.",
};

const MOCK_MAP_DATA: MapData = {
  property: {
    name: "Grand Galaxy City, RT.009/RW.012",
    formatted_address: "Grand Galaxy City, RT.009/RW.012, Pekayon Jaya, Kec. Bekasi Sel, Kota Bks, Jawa Barat 17148, Indonesia",
    lat: -6.2698,
    lng: 106.9749,
  },
  rls: {
    score: 54,
    band: "hati_hati",
    band_label: "Hati-hati",
    recommendation_label: "Validasi lebih lanjut sebelum memutuskan",
  },
  category_scores: {
    banjir: 24,
    commute: 50,
    akses: 64,
    fasilitas: 100,
    lingkungan: 64,
  },
  flood: {
    index: 2,
    class: "sedang",
  },
  elevation: {
    elevation_m: 20.4,
    relative_m: -0.6,
    low_lying: true,
  },
  nearest_toll: {
    kind: "toll_gate",
    name: "Gerbang Tol Bekasi Barat 1",
    lat: -6.2558,
    lng: 106.9859,
    distance_km: 1.88,
    ingested_at: "2026-06",
  },
  nearest_station: {
    kind: "station",
    name: "Stasiun Bekasi",
    lat: -6.2361,
    lng: 106.9994,
    distance_km: 2.05,
    ingested_at: "2026-06",
  },
  facilities: [
    {
      kind: "hospital",
      name: "RS Hermina Galaxy",
      lat: -6.2735,
      lng: 106.9721,
      distance_km: 0.48,
      ingested_at: "2026-06",
    },
    {
      kind: "clinic",
      name: "Klinik Pratama Galaxy",
      lat: -6.2711,
      lng: 106.9735,
      distance_km: 0.19,
      ingested_at: "2026-06",
    },
    {
      kind: "pharmacy",
      name: "Apotek K-24 Galaxy",
      lat: -6.2685,
      lng: 106.9765,
      distance_km: 0.22,
      ingested_at: "2026-06",
    },
    {
      kind: "school",
      name: "SMA Negeri 12 Bekasi",
      lat: -6.2745,
      lng: 106.9801,
      distance_km: 1.62,
      ingested_at: "2026-06",
    },
    {
      kind: "market",
      name: "Pasar Fresh Market Galaxy",
      lat: -6.2730,
      lng: 106.9712,
      distance_km: 0.67,
      ingested_at: "2026-06",
    },
    {
      kind: "supermarket",
      name: "Superindo Grand Galaxy",
      lat: -6.2690,
      lng: 106.9745,
      distance_km: 0.04,
      ingested_at: "2026-06",
    },
  ],
  red_flags: [
    {
      kind: "sutet_tower",
      label: "SUTET",
      name: "SUTET 150kV Galaxy",
      lat: -6.2675,
      lng: 106.9712,
      distance_km: 0.35,
      critical: false,
      ingested_at: "2026-06",
    },
    {
      kind: "industrial",
      label: "Area Industri",
      name: "Pabrik Tekstil Pekayon",
      lat: -6.2650,
      lng: 106.9780,
      distance_km: 0.85,
      critical: false,
      ingested_at: "2026-06",
    },
    {
      kind: "cemetery",
      label: "Pemakaman",
      name: "TPU Pekayon",
      lat: -6.2750,
      lng: 106.9730,
      distance_km: 0.65,
      critical: false,
      ingested_at: "2026-06",
    },
    {
      kind: "landfill",
      label: "Pembuangan Sampah",
      name: "TPS Liar Galaxy",
      lat: -6.2710,
      lng: 106.9785,
      distance_km: 0.55,
      critical: true,
      ingested_at: "2026-06",
    },
  ],
  gaps: [
    {
      kind: "sertifikat_legalitas",
      label: "Legalitas Lahan",
      name: "Status Legalitas (IMB/SHM)",
      lat: -6.2690,
      lng: 106.9762,
      distance_km: 0.12,
      critical: false,
      ingested_at: "2026-06",
    },
    {
      kind: "ipl_utilitas",
      label: "IPL & Utilitas",
      name: "Iuran IPL & Monopoli Air",
      lat: -6.2708,
      lng: 106.9735,
      distance_km: 0.15,
      critical: false,
      ingested_at: "2026-06",
    },
    {
      kind: "kualitas_udara",
      label: "Polusi Udara (AQI)",
      name: "Kualitas Udara Real-Time",
      lat: -6.2692,
      lng: 106.9725,
      distance_km: 0.20,
      critical: false,
      ingested_at: "2026-06",
    },
    {
      kind: "ppdb_zonasi",
      label: "Zonasi PPDB",
      name: "Batas PPDB Sekolah Negeri",
      lat: -6.2740,
      lng: 106.9780,
      distance_km: 0.45,
      critical: false,
      ingested_at: "2026-06",
    },
    {
      kind: "future_infra",
      label: "Proyek Masa Depan",
      name: "Rencana Jalur MRT/Tol",
      lat: -6.2575,
      lng: 106.9880,
      distance_km: 1.45,
      critical: false,
      ingested_at: "2026-06",
    }
  ]
};

export default function DevMapPlaygroundV2() {
  const [railOpen, setRailOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [thinking, setThinking] = useState<string | null>(null);

  // Redesign state: active layers state synchronization (Module B)
  const [activeLayers, setActiveLayers] = useState({
    flood: false,
    transit: false,
    akses: false,
    kebisingan: false,
    gaps: false,
  });

  // State to hold the current selected finding for the sliding sidebar drawer (Module A)
  const [drawerFinding, setDrawerFinding] = useState<LegacyFinding | null>(null);

  const handleToggleLayer = (key: "flood" | "transit" | "akses" | "kebisingan" | "gaps") => {
    setActiveLayers((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSend = (text: string) => {
    setMessages((ms) => [...ms, { role: "user", content: text }]);
    setThinking("Rumper sedang memproses tanggapan...");
    setTimeout(() => {
      setThinking(null);
      setMessages((ms) => [
        ...ms,
        {
          role: "assistant",
          content: `Tanggapan simulasi untuk pertanyaan: "${text}". Ini adalah playground offline dengan data yang ter-mock penuh.`,
          suggestions: ["Coba lihat peta", "Berapa jarak stasiun?"],
        },
      ]);
    }, 1500);
  };

  const rail = (
    <AssistantRailV2
      convos={MOCK_CONVOS}
      activeId="convo-1"
      expectsAddress={false}
      messages={messages}
      thinking={thinking}
      research={null}
      report={MOCK_REPORT}
      userPicture={MOCK_USER.picture}
      onSend={handleSend}
      onOpenConvo={() => {}}
      onNewChat={() => {
        setMessages([
          {
            role: "assistant",
            content: "Ini adalah percakapan baru di playground.",
          },
        ]);
      }}
      onViewReport={() => setRailOpen(false)}
      disabled={!!thinking}
    />
  );

  return (
    <div className="h-screen w-screen overflow-hidden relative">
      <AppShellV2
        meta={`Analisis properti - diperbarui 28 Jun 2026`}
        railOpen={railOpen}
        onRailOpenChange={setRailOpen}
        user={MOCK_USER}
        rail={rail}
        analysis={
          <AnalysisWorkspaceV2 
            report={MOCK_REPORT} 
            activeLayers={activeLayers as any}
            onToggleLayer={handleToggleLayer as any}
            onOpenDrawer={setDrawerFinding}
          />
        }
        map={
          // @ts-ignore - MapPanelV3 props were updated for V3
          // @ts-ignore - MapPanelV3 props were updated for V3
          <MapPanelV3 
            data={MOCK_MAP_DATA as any} 
          />
        }
        onExpertReview={() => window.open("https://wa.me", "_blank")}
        onShare={() => alert("Simulasi unduh laporan PDF")}
        shareLabel="Unduh laporan"
        sharing={false}
      />

      {/* Sliding Sidebar Drawer overlaying Left Panel on click (Chevron logic) */}
      {drawerFinding && (
        <div className="absolute inset-y-0 left-0 z-50 w-96 bg-white shadow-overlay border-r border-border flex flex-col transition-all duration-300 animate-in slide-in-from-left duration-200">
          <div className="p-md border-b border-border flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-body-medium font-bold text-text-primary">Detail Temuan</h3>
              <p className="text-[10px] text-text-tertiary font-sans mt-0.5 uppercase tracking-wide">
                Validasi Desk Research
              </p>
            </div>
            <button 
              onClick={() => setDrawerFinding(null)} 
              className="p-2 rounded-xl hover:bg-slate-200 text-text-tertiary transition-colors flex h-11 w-11 items-center justify-center border border-border/40 bg-white"
              aria-label="Tutup detail"
            >
              <X className="size-5" />
            </button>
          </div>
          
          <div className="p-md flex-1 overflow-y-auto flex flex-col gap-lg font-sans">
            <div className="flex flex-col gap-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Pernyataan Temuan</span>
              <p className="text-body-sm text-text-primary leading-relaxed font-semibold">{drawerFinding.claim}</p>
            </div>
            
            <div className="flex flex-col gap-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Keterbatasan Data</span>
              <p className="text-body-sm text-text-secondary leading-relaxed bg-slate-50 border border-slate-100 p-sm rounded-lg">
                {drawerFinding.limitation || "Tidak ada keterbatasan data spesifik yang dilaporkan untuk temuan ini."}
              </p>
            </div>

            <div className="flex flex-col gap-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-teal-deep">Saran Validasi Lapangan</span>
              <div className="bg-brand-green-soft/30 border border-brand-green/30 p-sm rounded-lg flex items-start gap-2">
                <span className="text-brand-green-dark mt-0.5 text-base font-bold">✓</span>
                <p className="text-body-sm text-brand-green-dark leading-relaxed font-semibold">
                  {drawerFinding.validation_action || "Lakukan pengecekan fisik secara mandiri di lokasi."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-xs border-t border-border/40 pt-md">
              <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Link Referensi Sumber</span>
              {drawerFinding.evidence && drawerFinding.evidence.length > 0 ? (
                <div className="flex flex-col gap-xs">
                  {drawerFinding.evidence.map((ev, idx) => (
                    <div key={idx} className="flex items-center justify-between text-body-sm bg-slate-50 border border-slate-200/60 p-2 rounded-lg">
                      <span className="font-semibold text-text-primary truncate mr-2">{ev.source_title}</span>
                      {ev.url ? (
                        <a 
                          href={ev.url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-brand-teal hover:underline text-micro font-bold shrink-0 inline-flex items-center gap-0.5 min-h-[44px]"
                        >
                          Buka Link ↗
                        </a>
                      ) : (
                        <span className="text-text-muted text-[10px]">OSM Secondary</span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-tertiary">Tidak ada link eksternal.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
