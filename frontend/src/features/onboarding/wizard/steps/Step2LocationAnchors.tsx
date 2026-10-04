import { useState, useRef, useEffect } from "react"
import { MapPin, ChevronDown, Search, Check, X, Loader2 } from "lucide-react"
import { ApiError, placesAutocomplete } from "@/lib/api"

interface Step2Props {
  mainAnchor: string
  secondAnchor: string
  onChange: (fields: {
    mainAnchor?: string
    secondAnchor?: string
    mainAnchorPlaceId?: string
    secondAnchorPlaceId?: string
  }) => void
}

/** Server contract (backend `places_autocomplete`): returns [] below 4 chars, ≤5
 *  suggestions, auth required, rate-limited 60/min. We mirror the 4-char floor so we
 *  never spend a call the server would reject anyway. */
const MIN_QUERY = 4
const DEBOUNCE_MS = 300

interface LocationDropdownProps {
  value: string
  placeholder: string
  isPrimary?: boolean
  allowClear?: boolean
  onSelect: (val: string, placeId?: string) => void
}

interface Suggestion {
  description: string
  place_id: string
}

function CustomLocationSelect({
  value,
  placeholder,
  isPrimary = true,
  allowClear = false,
  onSelect,
}: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  const [results, setResults] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const seq = useRef(0) // guards against a slow earlier response overwriting a newer one

  const query = searchQuery.trim()
  const tooShort = query.length > 0 && query.length < MIN_QUERY

  useEffect(() => {
    if (!isOpen) return
    if (query.length < MIN_QUERY) {
      setResults([])
      setLoading(false)
      setError(null)
      return
    }
    const mine = ++seq.current
    setLoading(true)
    const t = window.setTimeout(() => {
      placesAutocomplete(query)
        .then((r) => {
          if (mine !== seq.current) return // a newer keystroke already won
          setResults(r as Suggestion[])
          setError(null)
        })
        .catch((e) => {
          if (mine !== seq.current) return
          setResults([])
          setError(
            e instanceof ApiError && e.status === 401
              ? "Sesi berakhir. Silakan masuk lagi."
              : "Pencarian lokasi sedang bermasalah. Coba lagi sebentar.",
          )
        })
        .finally(() => {
          if (mine === seq.current) setLoading(false)
        })
    }, DEBOUNCE_MS)
    return () => window.clearTimeout(t)
  }, [query, isOpen])

  const handleChoose = (item: string, placeId?: string) => {
    onSelect(item, placeId)
    setIsOpen(false)
    setSearchQuery("")
    setResults([])
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onSelect("")
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full h-14 pl-14 pr-4 rounded-2xl border text-sm md:text-base font-bold text-left flex items-center justify-between transition-all cursor-pointer ${
          isOpen
            ? "bg-white border-[#001E2B] ring-2 ring-[#001E2B]/10 shadow-sm text-[#001E2B]"
            : "bg-[#F4F7F6] border-[#D7E1E5] text-[#001E2B] hover:bg-[#EEF2F0] hover:border-[#C1CCD6]"
        }`}
      >
        {/* Left Icon Pill */}
        <div
          className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center pointer-events-none transition-colors ${
            isPrimary
              ? "bg-[#001E2B] text-white"
              : value
                ? "bg-[#003D4F] text-white"
                : "bg-[#E1E5E8] text-[#7C8C9A]"
          }`}
        >
          <MapPin size={16} />
        </div>

        {/* Display Text */}
        <span
          className={`truncate mr-2 ${
            value ? "text-[#001E2B]" : "text-[#7C8C9A] font-medium"
          }`}
        >
          {value || placeholder}
        </span>

        {/* Right Icon Actions */}
        <div className="flex items-center gap-1.5 shrink-0 text-[#7C8C9A]">
          {allowClear && value && (
            <div
              onClick={handleClear}
              className="p-1 rounded-full hover:bg-[#E1E5E8] text-[#5C6C7A] transition-colors"
              title="Hapus pilihan"
            >
              <X size={14} />
            </div>
          )}
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#001E2B]" : ""
            }`}
          />
        </div>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white rounded-2xl border border-[#D7E1E5] shadow-xl overflow-hidden py-2 animate-fadeIn flex flex-col max-h-80">
          {/* Quick Search Bar */}
          <div className="px-3 pb-2 pt-1 border-b border-[#E1E5E8]">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F4F7F6] rounded-xl border border-[#D7E1E5] focus-within:border-[#001E2B] focus-within:bg-white transition-all">
              <Search size={14} className="text-[#7C8C9A] shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kantor, gedung, atau area…"
                className="w-full text-xs font-semibold bg-transparent text-[#001E2B] placeholder-[#7C8C9A] outline-none"
                autoFocus
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-[#7C8C9A] hover:text-[#001E2B]"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Grouped Options List */}
          <div className="overflow-y-auto max-h-60 py-1 space-y-2">
            {allowClear && (
              <div
                onClick={() => handleChoose("", undefined)}
                className={`px-4 py-2.5 mx-2 rounded-xl text-xs md:text-sm font-semibold cursor-pointer transition-colors flex items-center justify-between ${
                  !value
                    ? "bg-[#E9F5EF] text-[#004F38] font-bold"
                    : "text-[#5C6C7A] hover:bg-[#F4F7F6]"
                }`}
              >
                <span>-- Tidak ada / Opsional --</span>
                {!value && (
                  <Check size={16} className="text-[#00ED64] stroke-[3]" />
                )}
              </div>
            )}

            {/* keep the current pick visible even when it isn't in the live results */}
            {value && !results.some((r) => r.description === value) && (
              <div className="px-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7C8C9A]">
                  Pilihan saat ini
                </div>
                <div className="px-3 py-2.5 rounded-xl text-xs md:text-sm flex items-center justify-between select-none bg-[#E9F5EF] text-[#004F38] font-bold">
                  <span className="truncate pr-2">{value}</span>
                  <Check size={16} className="text-[#00ED64] stroke-[3] shrink-0" />
                </div>
              </div>
            )}

            {error ? (
              <div className="p-4 text-center text-xs text-[#C95746] font-semibold">
                {error}
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center gap-2 p-4 text-xs text-[#7C8C9A] font-medium">
                <Loader2 size={14} className="animate-spin" />
                <span>Mencari lokasi…</span>
              </div>
            ) : query.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#7C8C9A] font-medium">
                Ketik nama kantor, gedung, atau area — misalnya “Sudirman” atau “BSD”.
              </div>
            ) : tooShort ? (
              <div className="p-4 text-center text-xs text-[#7C8C9A] font-medium">
                Ketik minimal {MIN_QUERY} huruf.
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#7C8C9A] font-medium">
                Lokasi &quot;{query}&quot; tidak ditemukan.
              </div>
            ) : (
              <div className="px-2">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7C8C9A]">
                  Hasil pencarian
                </div>
                {results.map((item) => {
                  const isSelected = value === item.description
                  return (
                    <button
                      type="button"
                      key={item.place_id}
                      onClick={() => handleChoose(item.description, item.place_id)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-xs md:text-sm cursor-pointer transition-all flex items-center justify-between select-none ${
                        isSelected
                          ? "bg-[#E9F5EF] text-[#004F38] font-bold"
                          : "text-[#001E2B] hover:bg-[#F4F7F6] font-medium"
                      }`}
                    >
                      <span className="truncate pr-2">{item.description}</span>
                      {isSelected && (
                        <Check size={16} className="text-[#00ED64] stroke-[3] shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function Step2LocationAnchors({
  mainAnchor,
  secondAnchor,
  onChange,
}: Step2Props) {
  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Step Header */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-[#00684A] mb-2 flex items-center gap-1.5">
          <span>Langkah 02</span>
          <span className="text-[#A8B3BC]">/</span>
          <span>Titik Gravitasi</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#001E2B] tracking-tight">
          Titik Gravitasi & Lokasi Kerjamu
        </h2>
        <p className="text-sm md:text-base text-[#5C6C7A] mt-1">
          Kunci lokasi yang wajib kamu datengin tiap hari biar simulasi komut
          jam sibuk akurat.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-3xl p-5 md:p-8 border border-[#D7E1E5] shadow-sm space-y-6">
        {/* Titik Aktivitas Utama */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C6C7A]">
            <MapPin size={15} className="text-[#001E2B]" />
            <span>Titik Gravitasi Utama (Kantor / Tempat Rutinmu):</span>
          </label>

          <CustomLocationSelect
            value={mainAnchor}
            placeholder="Pilih lokasi kantor / aktivitas utama..."
            isPrimary={true}
            allowClear={false}
            onSelect={(val, placeId) => onChange({ mainAnchor: val, mainAnchorPlaceId: placeId })}
          />
        </div>

        <hr className="border-[#E1E5E8]" />

        {/* Titik Aktivitas Kedua */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C6C7A]">
              <MapPin size={15} className="text-[#7C8C9A]" />
              <span>Titik Gravitasi Kedua (Kantor Pasangan / Kampus):</span>
            </label>
            <span className="text-xs text-[#7C8C9A] font-medium">
              (Opsional)
            </span>
          </div>

          <CustomLocationSelect
            value={secondAnchor}
            placeholder="Pilih lokasi kedua jika ada (opsional)..."
            isPrimary={false}
            allowClear={true}
            onSelect={(val, placeId) => onChange({ secondAnchor: val, secondAnchorPlaceId: placeId })}
          />
        </div>
      </div>
    </div>
  )
}
