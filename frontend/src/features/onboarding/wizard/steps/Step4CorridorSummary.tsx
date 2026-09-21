import { Compass, CheckCircle2, Check } from "lucide-react"
import type { WizardFormData } from "@/features/onboarding/useWizardStore"

interface Step4Props {
  formData: WizardFormData
  onToggleCorridor: (corridor: string) => void
}

const CORRIDOR_OPTIONS = [
  "Tangerang Selatan (Bintaro, BSD, Serpong)",
  "Depok (Margonda, Sawangan, GDC)",
  "Bekasi (Barat, Summarecon, Timur)",
  "Bogor & Cibubur (Cibinong, Sentul, LRT)",
  "Jakarta Timur / Perbatasan",
  "Jakarta Barat / Tangerang Kota",
]

export default function Step4CorridorSummary({
  formData,
  onToggleCorridor,
}: Step4Props) {
  const formatRupiah = (valInMillions: number) => {
    if (valInMillions >= 1000) {
      return `Rp ${(valInMillions / 1000).toFixed(1).replace(".0", "")} Miliar`
    }
    return `Rp ${valInMillions} Juta`
  }

  const householdLabelMap = {
    single: "Lajang / Mandiri",
    pasangan: "Pasangan",
    "keluarga-muda": "Keluarga dengan Anak",
  }

  const workLabelMap = {
    wfo: "WFO Penuh",
    hybrid: "Hybrid (2–3 Hari)",
    remote: "Remote Penuh",
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#00684A] mb-2 flex items-center gap-1.5">
          <span>Langkah 04</span>
          <span className="text-[#A8B3BC]">/</span>
          <span>Ringkasan Profil</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#001E2B] tracking-tight">
          Koridor Incaran & Ringkasan Profilmu
        </h2>
        <p className="text-sm md:text-base text-[#5C6C7A] mt-1">
          Pilih koridor Jabodetabek yang lagi kamu lirik dan cek ringkasan
          preferensimu sebelum mulai riset.
        </p>
      </div>

      {/* Main Container Card: Corridor Selectors */}
      <div className="bg-white rounded-3xl p-5 md:p-8 border border-[#D7E1E5] shadow-sm space-y-4">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C6C7A]">
          <Compass size={16} className="text-[#001E2B]" />
          <span>Pilih Koridor Wilayah Incaran (Bisa Lebih Dari Satu):</span>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {CORRIDOR_OPTIONS.map((corridor) => {
            const isChecked = formData.selectedCorridors.includes(corridor)

            return (
              <div
                key={corridor}
                onClick={() => onToggleCorridor(corridor)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between min-h-[56px] select-none ${
                  isChecked
                    ? "border-[#001E2B] bg-white text-[#001E2B] shadow-xs font-bold ring-2 ring-[#001E2B]/5"
                    : "border-[#D7E1E5] bg-white text-[#3D4F5B] hover:border-[#C1CCD6] font-semibold"
                }`}
              >
                <span className="text-xs md:text-sm leading-snug">
                  {corridor}
                </span>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? "bg-[#00ED64] border-[#00ED64] text-[#001E2B]"
                      : "border-[#D7E1E5] bg-[#F4F7F6]"
                  }`}
                >
                  {isChecked && <Check size={14} className="stroke-[3]" />}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Summary Card: Deep Teal Container */}
      <div className="bg-[#001E2B] rounded-3xl p-6 md:p-7 text-white shadow-xl space-y-5 border border-[#003D4F]">
        <div className="flex items-center justify-between border-b border-[#003D4F] pb-4">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-[#00ED64]" />
            <h3 className="text-sm md:text-base font-bold text-white tracking-wide">
              Ringkasan Profil Pencarianmu
            </h3>
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#00ED64] bg-[#003D4F] px-2.5 py-1 rounded-md border border-[#00475B]">
            PROFIL TERCATAT
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs md:text-sm">
          <div>
            <span className="text-[#A8B3BC] font-medium block">
              Rumah Tangga & Pola Kerja:
            </span>
            <span className="font-bold text-white mt-0.5 block">
              {householdLabelMap[formData.householdType]} ·{" "}
              {workLabelMap[formData.workPattern]}
            </span>
          </div>

          <div>
            <span className="text-[#A8B3BC] font-medium block">
              Rentang Budget:
            </span>
            <span className="font-extrabold text-[#00ED64] mt-0.5 block">
              {formatRupiah(formData.budgetMin)} —{" "}
              {formatRupiah(formData.budgetMax)}
            </span>
          </div>

          <div>
            <span className="text-[#A8B3BC] font-medium block">
              Titik Gravitasi Utama (Kantor):
            </span>
            <span className="font-bold text-white mt-0.5 block truncate">
              {formData.mainAnchor || "-"}
            </span>
          </div>

          <div>
            <span className="text-[#A8B3BC] font-medium block">
              Titik Gravitasi Kedua:
            </span>
            <span className="font-bold text-white mt-0.5 block truncate">
              {formData.secondAnchor || "-"}
            </span>
          </div>
        </div>

        {/* Calibrated Scenario Preferences (Toleransi Kompromi) */}
        {Object.keys(formData.scenarioResponses).length > 0 && (
          <div className="pt-3 border-t border-[#003D4F] space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A8B3BC] block">
              Kalibrasi Toleransi Kompromi (Hasil Simulasi Skenario):
            </span>
            <div className="flex flex-wrap gap-2">
              {formData.scenarioResponses["transit-vs-space"] === "A" && (
                <span className="text-xs font-bold text-[#00ED64] bg-[#003D4F] px-3 py-1 rounded-full border border-[#00475B]">
                  🚆 Prioritas Transit KRL
                </span>
              )}
              {formData.scenarioResponses["transit-vs-space"] === "B" && (
                <span className="text-xs font-bold text-[#E1E5E8] bg-[#003D4F] px-3 py-1 rounded-full border border-[#00475B]">
                  🏡 Prioritas Luas Ruang
                </span>
              )}
              {formData.scenarioResponses["flood-vs-aesthetic"] === "A" && (
                <span className="text-xs font-bold text-[#00ED64] bg-[#003D4F] px-3 py-1 rounded-full border border-[#00475B]">
                  🛡️ Toleransi Banjir: Nol (Topografi Aman)
                </span>
              )}
              {formData.scenarioResponses["flood-vs-aesthetic"] === "B" && (
                <span className="text-xs font-bold text-[#E1E5E8] bg-[#003D4F] px-3 py-1 rounded-full border border-[#00475B]">
                  ✨ Prioritas Estetika & Fasilitas
                </span>
              )}
              {formData.scenarioResponses["flood-vs-aesthetic"] ===
                "reject" && (
                <span className="text-xs font-bold text-[#FF8E7A] bg-[#381612] px-3 py-1 rounded-full border border-[#5C231D]">
                  ⚠️ Filter Keras: Anti-Banjir Kritis
                </span>
              )}
              {formData.scenarioResponses["established-vs-quiet"] === "A" && (
                <span className="text-xs font-bold text-[#00ED64] bg-[#003D4F] px-3 py-1 rounded-full border border-[#00475B]">
                  🚶 Akses Fasilitas Jalan Kaki
                </span>
              )}
              {formData.scenarioResponses["established-vs-quiet"] === "B" && (
                <span className="text-xs font-bold text-[#E1E5E8] bg-[#003D4F] px-3 py-1 rounded-full border border-[#00475B]">
                  🌿 Prioritas Ketenangan & Privasi
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
