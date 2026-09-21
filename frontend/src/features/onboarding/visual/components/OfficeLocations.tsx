import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Check, ChevronDown, ChevronUp } from "lucide-react";

export const OFFICE_GROUPS = [
  {
    label: "JAKARTA SELATAN & PUSAT",
    options: [
      "Sudirman / SCBD (Jaksel)",
      "Mega Kuningan / Rasuna Said (Jaksel)",
      "Gatot Subroto / Slipi (Jaksel/Jakbar)",
      "TB Simatupang / Cilandak (Jaksel)",
      "Kuningan / Setiabudi (Jaksel)",
      "Thamrin / Monas (Jakpus)"
    ]
  },
  {
    label: "JAKARTA BARAT & UTARA",
    options: [
      "Kebon Jeruk / Puri (Jakbar)",
      "Pluit / PIK (Jakut)",
      "Kelapa Gading / Sunter (Jakut)"
    ]
  },
  {
    label: "TANGERANG SELATAN",
    options: [
      "Serpong / BSD City (Tangerang Selatan)",
      "Bintaro Jaya (Tangerang Selatan)",
      "Alam Sutera (Tangerang)"
    ]
  },
  {
    label: "DEPOK & BOGOR",
    options: [
      "Margonda / UI (Depok)",
      "Sentul & Cibinong (Bogor)"
    ]
  },
  {
    label: "BEKASI",
    options: [
      "Bekasi Barat / Summarecon",
      "Cikarang / Karawang"
    ]
  }
];

interface LocationComboboxProps {
  label: string;
  optional?: boolean;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
}

function LocationCombobox({ label, optional, value, onChange, placeholder = "Pilih area kantor...", isOpen, onToggle }: LocationComboboxProps) {
  const [search, setSearch] = useState("");
  
  const filteredGroups = OFFICE_GROUPS.map(g => ({
    ...g,
    options: g.options.filter(o => o.toLowerCase().includes(search.toLowerCase()))
  })).filter(g => g.options.length > 0);

  return (
    <div className="relative w-full text-left">
      <div className="flex items-center gap-2 mb-2 px-1">
        <MapPin size={14} className="text-[#5C6C7A]" />
        <span className="text-[11px] font-black uppercase tracking-[0.08em] text-[#5C6C7A]">
          {label}
        </span>
        {optional && (
          <span className="text-[11px] font-medium text-[#7D8C9A] ml-auto">
            (Opsional)
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={`w-full h-14 px-4 bg-white border ${isOpen ? 'border-[#001E2B] rounded-t-xl rounded-b-none' : 'border-[#D7E1E5] rounded-xl hover:border-[#A4B3BC]'} flex items-center justify-between transition-colors focus:outline-none`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-[#001E2B] flex items-center justify-center shrink-0">
            <MapPin size={14} className="text-white" />
          </div>
          <span className={`text-[15px] font-bold truncate ${value ? 'text-[#001E2B]' : 'text-[#7D8C9A]'}`}>
            {value || placeholder}
          </span>
        </div>
        {isOpen ? <ChevronUp size={20} className="text-[#001E2B]" /> : <ChevronDown size={20} className="text-[#7D8C9A]" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 bg-white border border-t-0 border-[#001E2B] rounded-b-xl shadow-xl max-h-[280px] overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-[#E1E5E8]">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D8C9A]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ketik area atau kota..."
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-[#D7E1E5] text-[14px] focus:outline-none focus:border-[#00684A]"
                />
              </div>
            </div>
            <div className="overflow-y-auto p-2 pb-4">
              {filteredGroups.length === 0 ? (
                <div className="p-4 text-center text-sm text-[#7D8C9A]">Tidak ditemukan</div>
              ) : (
                filteredGroups.map((group, idx) => (
                  <div key={idx} className="mb-2 last:mb-0">
                    <div className="px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[#7D8C9A]">
                      {group.label}
                    </div>
                    {group.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => { onChange(opt); onToggle(); setSearch(''); }}
                        className={`w-full text-left px-3 py-3 rounded-lg text-[14px] flex items-center justify-between ${value === opt ? 'bg-[#E3FCEF] font-bold text-[#00684A]' : 'hover:bg-[#F9FBFA] text-[#001E2B]'}`}
                      >
                        {opt}
                        {value === opt && <Check size={16} className="text-[#00B545]" />}
                      </button>
                    ))}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface OfficeLocationsProps {
  primaryOffice: string;
  partnerOffice: string;
  onPrimaryChange: (val: string) => void;
  onPartnerChange: (val: string) => void;
}

export default function OfficeLocations({ primaryOffice, partnerOffice, onPrimaryChange, onPartnerChange }: OfficeLocationsProps) {
  const [openDropdown, setOpenDropdown] = useState<'primary' | 'partner' | null>(null);

  return (
    <div className="w-full bg-white border border-[#E1E5E8] rounded-[24px] p-5 shadow-sm space-y-6">
      <LocationCombobox
        label="LOKASI KANTOR UTAMA:"
        value={primaryOffice}
        onChange={onPrimaryChange}
        isOpen={openDropdown === 'primary'}
        onToggle={() => setOpenDropdown(prev => prev === 'primary' ? null : 'primary')}
      />

      <div className="h-px bg-[#E1E5E8] w-full" />

      <LocationCombobox
        label="LOKASI KANTOR PASANGAN / LAINNYA:"
        optional
        value={partnerOffice}
        onChange={onPartnerChange}
        placeholder="Pilih area kantor pasangan..."
        isOpen={openDropdown === 'partner'}
        onToggle={() => setOpenDropdown(prev => prev === 'partner' ? null : 'partner')}
      />
    </div>
  );
}
