import { Compass } from "lucide-react"
import ScenarioView, { type ScenarioData } from "./ScenarioView"
import {
  useWizardState,
  type ScenarioChoice,
} from "@/features/onboarding/useWizardStore"

const SCENARIO_3_DATA: ScenarioData = {
  id: "established-vs-quiet",
  stepNumber: 3,
  totalScenarios: 3,
  weatherTag: "Sabtu, 19:00 • Suasana Malam Akhir Pekan",
  weatherIcon: Compass,
  title: "Lingkungan Matang & Hidup vs Cluster Baru Hening",
  narrative:
    "Malam akhir pekan tiba. Kamu butuh beli obat anak, bahan dapur mendadak, atau pengen jajan santai tanpa harus ngeluarin mobil dan nembus macetnya jalan arteri.",
  whyItMatters:
    "Kawasan yang sudah matang punya fasilitas harian yang bisa kamu capai jalan kaki. Kalau cluster baru di pelosok, butuh bertahun-tahun sampai fasilitas sekitarnya terbentuk.",
  optionA: {
    key: "A",
    badgeLabel: "PILIHAN A",
    title: "Lingkungan Matang (Established)",
    corridor: "Kawasan Perumahan Matang (e.g. Bintaro Sektor / Depok Timur)",
    price: "Rp 1.1 Miliar",
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80",
    imageTag: "🛒 Radius 500m Fasilitas Komplit",
    metrics: [
      {
        label: "FASILITAS SEKITAR",
        value: "Sangat Lengkap",
        subValue: "Radius 500m jalan kaki",
      },
      {
        label: "SUASANA HUNIAN",
        value: "Aktif & Hidup",
        subValue: "Komunitas guyub rukun",
      },
      {
        label: "HARGA PENAWARAN",
        value: "Rp 1.1 M",
        subValue: "Kawasan established",
      },
      {
        label: "AKSES JALAN",
        value: "2 Mobil Pas",
        subValue: "Row 6 meter tertata",
      },
    ],
    akses: "Row jalan 6m, warung sayur & minimarket 2 menit jalan kaki",
    fasilitas: "Klinik 24 jam, sekolah, pasar tradisional radius 1 km",
    kompromiNyata:
      "Lalu lintas lingkungan lebih ramai & suara aktivitas warga terasa.",
  },
  optionB: {
    key: "B",
    badgeLabel: "PILIHAN B",
    title: "Cluster Baru Hening Eksklusif",
    corridor: "Kantung Hunian Tenang (e.g. Curug / Bojongsari Baru)",
    price: "Rp 1.05 Miliar",
    imageUrl:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80",
    imageTag: "🛡️ 1-Gate System · Row Jalan 8m",
    metrics: [
      {
        label: "FASILITAS SEKITAR",
        value: "Perlu Berkendara",
        subValue: "3–4 km ke pusat retail",
      },
      {
        label: "SUASANA HUNIAN",
        value: "Sangat Tenang",
        subValue: "Privasi maksimal",
      },
      {
        label: "HARGA PENAWARAN",
        value: "Rp 1.05 M",
        subValue: "Cluster baru rapi",
      },
      {
        label: "AKSES JALAN",
        value: "Row 8 Meter",
        subValue: "Paving block mulus",
      },
    ],
    akses: "One-gate system, keamanan 24 jam, jalan aspal mulus row 8m",
    fasilitas: "Toko kelontong & pusat komersial butuh 3–4 km keluar gerbang",
    kompromiNyata: "Ketergantungan penuh pada ojol & minimarket agak jauh.",
  },
  feedbackMap: {
    A: "✓ Prioritas dicatat: Kemudahan fasilitas jalan kaki (Siap lingkungan lebih ramai).",
    B: "✓ Prioritas dicatat: Privasi & ketenangan maksimal (Siap berkendara buat belanja).",
    neither:
      "✓ Preferensi: Mau cluster privat tapi akses minimarket tetap dekat.",
    reject:
      "⚠️ Toleransi isolasi: Ketat (Akan memfilter perumahan yang terlalu pelosok).",
  },
}

export default function Stage4Comparison() {
  const { formData, setScenarioResponse, skipToParameterSetup } =
    useWizardState()
  const currentChoice = formData.scenarioResponses["established-vs-quiet"]

  const handleSelect = (choice: ScenarioChoice) => {
    setScenarioResponse("established-vs-quiet", choice)
  }

  return (
    <ScenarioView
      data={SCENARIO_3_DATA}
      selectedChoice={currentChoice}
      selectedFriction={formData.selectedFriction}
      onSelectChoice={handleSelect}
      onSkip={skipToParameterSetup}
    />
  )
}
