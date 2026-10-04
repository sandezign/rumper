import { CloudRain } from "lucide-react"
import ScenarioView, { type ScenarioData } from "./ScenarioView"
import {
  useWizardState,
  type ScenarioChoice,
} from "@/features/onboarding/useWizardStore"

const SCENARIO_1_DATA: ScenarioData = {
  id: "transit-vs-space",
  stepNumber: 1,
  totalScenarios: 3,
  weatherTag: "Senin, 07:00 • Hujan Deras di Jam Sibuk",
  weatherIcon: CloudRain,
  title: "Transit Cepat vs Luas Tanah",
  narrative:
    "Hujan deras mengguyur dari subuh di awal pekan. Kamu harus tiba di kantor tepat pukul 08:30 buat meeting penting. Jalan arteri utama mulai macet total dan genangan muncul, tapi jadwal KRL tetap on-time.",
  whyItMatters:
    "Riset komuter membuktikan waktu perjalanan >75 menit per hari adalah pemicu utama kelelahan fisik dan stres harian pekerja di Jabodetabek.",
  optionA: {
    key: "A",
    badgeLabel: "PILIHAN A",
    title: "Rumah Kompak Dekat Stasiun KRL",
    corridor: "Koridor Transit Oriented (e.g. Jurangmangu / Rawa Buntu)",
    price: "Rp 950 Juta",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    imageTag: "📍 600m ke Stasiun · 7 Min Jalan Kaki",
    metrics: [
      {
        label: "WAKTU KOMUTER",
        value: "30–40 Menit",
        subValue: "KRL anti macet & on-time",
      },
      {
        label: "LUAS TANAH/BANGUNAN",
        value: "50m² / 48m²",
        subValue: "Kompak 2 Lantai efisien",
      },
      {
        label: "HARGA PENAWARAN",
        value: "Rp 950 Jt",
        subValue: "Cicilan ~Rp 6.8 Jt/bln",
      },
      {
        label: "AKSES HARIAN",
        value: "600m ke Stasiun",
        subValue: "Jalan kaki santai",
      },
    ],
    akses: "Jalan lingkungan row 6 meter, 600m jalan kaki ke stasiun",
    fasilitas: "Minimarket, apotek, dan kedai kopi bisa jalan kaki",
    kompromiNyata: "Ukuran kamar tidur kompak, tidak ada sisa tanah belakang.",
  },
  optionB: {
    key: "B",
    badgeLabel: "PILIHAN B",
    title: "Rumah Lapang Sub-Urban",
    corridor: "Koridor Hijau Luar (e.g. Parung Panjang / Sawangan Barat)",
    price: "Rp 920 Juta",
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=800&q=80",
    imageTag: "🏡 Kavling 90m² · 5.2 km ke Kota",
    metrics: [
      {
        label: "WAKTU KOMUTER",
        value: "70–85 Menit",
        subValue: "Jalan arteri padat merayap",
      },
      {
        label: "LUAS TANAH/BANGUNAN",
        value: "90m² / 60m²",
        subValue: "Halaman belakang lega",
      },
      {
        label: "HARGA PENAWARAN",
        value: "Rp 920 Jt",
        subValue: "Cicilan ~Rp 6.5 Jt/bln",
      },
      {
        label: "AKSES HARIAN",
        value: "5.2 km ke Stasiun",
        subValue: "Wajib motor / mobil",
      },
    ],
    akses: "Cluster satu gerbang asri, 5 km ke stasiun / pintu tol",
    fasilitas: "Taman cluster lapang, pusat kuliner butuh 10 menit motor",
    kompromiNyata:
      "Waktu perjalanan harian 2.5 – 3 jam pulang-pergi (siap capek di jalan).",
  },
  feedbackMap: {
    A: "✓ Prioritas dicatat: Efisiensi waktu komuter (Siap dengan ruang kompak).",
    B: "✓ Prioritas dicatat: Ruang lega & nyaman (Siap waktu komuter lebih panjang).",
    neither:
      "✓ Preferensi: Mau jalan tengah antara luas bangunan dan waktu tempuh moderat.",
    reject:
      "⚠️ Toleransi komuter: Ketat (Akan memfilter perumahan dengan akses komuter buruk).",
  },
}

export default function Stage2ValueProof() {
  const {
    formData,
    setScenarioResponse,
    clearScenarioResponse,
    skipToParameterSetup,
  } = useWizardState()
  const currentChoice = formData.scenarioResponses["transit-vs-space"]

  const handleSelect = (choice: ScenarioChoice) => {
    setScenarioResponse("transit-vs-space", choice)
  }

  const handleClear = () => {
    clearScenarioResponse("transit-vs-space")
  }

  return (
    <ScenarioView
      data={SCENARIO_1_DATA}
      selectedChoice={currentChoice}
      selectedFriction={formData.selectedFriction}
      onSelectChoice={handleSelect}
      onClearChoice={handleClear}
      onSkip={skipToParameterSetup}
    />
  )
}
