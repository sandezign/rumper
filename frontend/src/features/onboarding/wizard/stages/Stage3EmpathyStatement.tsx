import { ShieldCheck } from "lucide-react"
import ScenarioView, { type ScenarioData } from "./ScenarioView"
import {
  useWizardState,
  type ScenarioChoice,
} from "@/features/onboarding/useWizardStore"

const SCENARIO_2_DATA: ScenarioData = {
  id: "flood-vs-aesthetic",
  stepNumber: 2,
  totalScenarios: 3,
  weatherTag: "Februari • Puncak Musim Hujan Jabodetabek",
  weatherIcon: ShieldCheck,
  title: "Ketahanan Banjir Alami vs Desain Rumah Estetik di Lembah",
  narrative:
    "Curah hujan ekstrem mengguyur Jabodetabek selama 3 hari beruntun. Beberapa titik cekungan jalan arteri tergenang 40 cm, bikin ratusan warga perumahan lembah terjebak macet berjam-jam.",
  whyItMatters:
    "Elevasi tanah dan drainase gravitasi alami gak bisa diubah setelah rumah kamu beli. Sistem pompa buatan developer butuh iuran IPL mahal dan rentan mati kalau listrik padam.",
  optionA: {
    key: "A",
    badgeLabel: "PILIHAN A",
    title: "Topografi Tinggi Alami",
    corridor: "Kawasan Kontur Bukit (e.g. Cisauk Perbukitan / Depok Selatan)",
    price: "Rp 980 Juta",
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    imageTag: "⛰️ Dataran Tinggi (+48 mdpl) · Drainase Alami",
    metrics: [
      {
        label: "RISIKO GENANGAN",
        value: "Nol Riwayat",
        subValue: "Posisi tanah tinggi & aman",
      },
      {
        label: "DRAINASE",
        value: "Gravitasi Alami",
        subValue: "Air lancar tanpa pompa",
      },
      {
        label: "DESAIN RUMAH",
        value: "Standar Sederhana",
        subValue: "Bisa dicicil renovasi",
      },
      {
        label: "AKSES HUJAN",
        value: "100% Lolos Mobil",
        subValue: "Jalan bebas genangan",
      },
    ],
    akses: "Kawasan berbukit (±48 mdpl), air mengalir lancar, jalan bebas genangan",
    fasilitas: "Drainase gravitasi alami mengalir lancar ke lembah",
    kompromiNyata:
      "Fasad standar bawaan developer, ada kontur tanjakan menuju rumah.",
  },
  optionB: {
    key: "B",
    badgeLabel: "PILIHAN B",
    title: "Desain Tropis Mewah di Lembah Tertata",
    corridor: "Kawasan Dataran Rendah Polder (e.g. Cluster Pinggir Sungai)",
    price: "Rp 1.05 Miliar",
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    imageTag: "✨ High Ceiling Estetik · Dataran Polder",
    metrics: [
      {
        label: "RISIKO GENANGAN",
        value: "Tergantung Pompa",
        subValue: "Akses luar rawan genang",
      },
      {
        label: "DRAINASE",
        value: "Sistem Pompa Cluster",
        subValue: "Iuran IPL lebih tinggi",
      },
      {
        label: "DESAIN RUMAH",
        value: "High Ceiling Mewah",
        subValue: "Estetik siap huni",
      },
      {
        label: "AKSES HUJAN",
        value: "Terkadang Terjebak",
        subValue: "Titik cekungan jalan luar",
      },
    ],
    akses: "Tanggul polder & pompa internal developer dalam cluster",
    fasilitas: "Clubhouse megah, kolam renang, finishing material premium",
    kompromiNyata:
      "Jalan akses utama di luar gerbang cluster rawan tergenang pas hujan ekstrem.",
  },
  feedbackMap: {
    A: "✓ Prioritas dicatat: Ketahanan banjir alami & posisi tanah tinggi (Siap fasad standar).",
    B: "✓ Prioritas dicatat: Estetika bangunan & fasilitas mewah (Siap risiko tanggul/akses).",
    neither: "✓ Preferensi: Mau hunian di posisi tanah aman dengan desain modern.",
    reject:
      "⚠️ Toleransi banjir: Nol mutlak (Blacklist seluruh zona cekungan air).",
  },
}

export default function Stage3EmpathyStatement() {
  const {
    formData,
    setScenarioResponse,
    clearScenarioResponse,
    skipToParameterSetup,
  } = useWizardState()
  const currentChoice = formData.scenarioResponses["flood-vs-aesthetic"]

  const handleSelect = (choice: ScenarioChoice) => {
    setScenarioResponse("flood-vs-aesthetic", choice)
  }

  const handleClear = () => {
    clearScenarioResponse("flood-vs-aesthetic")
  }

  return (
    <ScenarioView
      data={SCENARIO_2_DATA}
      selectedChoice={currentChoice}
      selectedFriction={formData.selectedFriction}
      onSelectChoice={handleSelect}
      onClearChoice={handleClear}
      onSkip={skipToParameterSetup}
    />
  )
}
