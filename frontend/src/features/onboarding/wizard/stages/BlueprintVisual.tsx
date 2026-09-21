
interface BlueprintVisualProps {
  scenarioId: string
  option: "A" | "B"
  className?: string
}

export default function BlueprintVisual({
  scenarioId,
  option,
  className = "",
}: BlueprintVisualProps) {
  // Render specific SVG schematics based on scenarioId and option
  return (
    <div
      className={`w-full h-28 md:h-32 rounded-2xl bg-[#001E2B] border border-[#003D4F] overflow-hidden relative shadow-inner flex items-center justify-center select-none ${className}`}
    >
      {/* CAD Blueprint Background Grid */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #38BDF8 1px, transparent 1px),
            linear-gradient(to bottom, #38BDF8 1px, transparent 1px)
          `,
          backgroundSize: "16px 16px",
        }}
      />

      {/* --- SCENARIO 1: TRANSIT VS SPACE --- */}
      {scenarioId === "transit-vs-space" && option === "A" && (
        <div className="w-full h-full p-2.5 relative flex items-center justify-between z-10">
          <svg
            viewBox="0 0 320 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* House Outline (Isometric 2-Story) */}
            <path
              d="M40 70 L70 55 L100 70 L70 85 Z"
              fill="#003D4F"
              stroke="#00ED64"
              strokeWidth="1.5"
            />
            <path
              d="M40 70 L40 45 L70 30 L70 55 Z"
              fill="#002B38"
              stroke="#00ED64"
              strokeWidth="1.5"
            />
            <path
              d="M70 55 L70 30 L100 45 L100 70 Z"
              fill="#003545"
              stroke="#00ED64"
              strokeWidth="1.5"
            />
            {/* Roof Peak */}
            <path
              d="M70 30 L70 18 L100 33 L100 45 Z"
              fill="#00475B"
              stroke="#00ED64"
              strokeWidth="1.2"
            />
            <path
              d="M70 30 L70 18 L40 33 L40 45 Z"
              fill="#003D4F"
              stroke="#00ED64"
              strokeWidth="1.2"
            />

            {/* Pedestrian Transit Pathway */}
            <path
              d="M100 75 C140 75, 170 50, 210 50"
              stroke="#38BDF8"
              strokeWidth="2"
              strokeDasharray="4 3"
            />
            <circle cx="100" cy="75" r="3.5" fill="#00ED64" />

            {/* Walking Distance Metric Marker */}
            <rect
              x="125"
              y="42"
              width="76"
              height="18"
              rx="9"
              fill="#002838"
              stroke="#38BDF8"
              strokeWidth="1"
            />
            <text
              x="163"
              y="55"
              fill="#38BDF8"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              600m (7 Min Walk)
            </text>

            {/* Station Icon & KRL Node */}
            <rect
              x="215"
              y="32"
              width="75"
              height="38"
              rx="8"
              fill="#003D4F"
              stroke="#00ED64"
              strokeWidth="1.5"
            />
            <text
              x="252"
              y="47"
              fill="#FFFFFF"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
            >
              STASIUN KRL
            </text>
            <text
              x="252"
              y="60"
              fill="#00ED64"
              fontSize="8"
              fontWeight="600"
              textAnchor="middle"
            >
              • Anti-Macet •
            </text>
          </svg>

          {/* Technical Tag Badge */}
          <span className="absolute top-2 right-2.5 text-[9px] font-extrabold tracking-wider uppercase text-[#00ED64] bg-[#003D4F]/90 px-2 py-0.5 rounded border border-[#00475B]">
            📐 ISOMETRIK TRANSIT
          </span>
        </div>
      )}

      {scenarioId === "transit-vs-space" && option === "B" && (
        <div className="w-full h-full p-2.5 relative flex items-center justify-between z-10">
          <svg
            viewBox="0 0 320 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Large Land Boundary */}
            <rect
              x="25"
              y="20"
              width="130"
              height="65"
              rx="10"
              fill="#002D3B"
              stroke="#00ED64"
              strokeWidth="1.5"
              strokeDasharray="5 3"
            />
            <text x="35" y="34" fill="#00ED64" fontSize="8" fontWeight="bold">
              KAVLING LUAS 90m²
            </text>

            {/* House Footprint */}
            <rect
              x="35"
              y="40"
              width="60"
              height="38"
              rx="6"
              fill="#00475B"
              stroke="#38BDF8"
              strokeWidth="1.2"
            />
            <text
              x="65"
              y="62"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              RUMAH 60m²
            </text>

            {/* Green Garden Area */}
            <rect
              x="100"
              y="40"
              width="48"
              height="38"
              rx="6"
              fill="#003D4F"
              stroke="#00ED64"
              strokeWidth="1"
            />
            <text
              x="124"
              y="58"
              fill="#00ED64"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
            >
              TAMAN
            </text>
            <text
              x="124"
              y="68"
              fill="#A8B3BC"
              fontSize="7"
              textAnchor="middle"
            >
              BELAKANG
            </text>

            {/* Long Commute Highway Road */}
            <path
              d="M160 55 L285 55"
              stroke="#E1E5E8"
              strokeWidth="3"
              strokeDasharray="6 4"
            />
            <rect
              x="180"
              y="38"
              width="90"
              height="34"
              rx="8"
              fill="#002838"
              stroke="#E1E5E8"
              strokeWidth="1"
            />
            <text
              x="225"
              y="52"
              fill="#A8B3BC"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              JARAK KE KOTA
            </text>
            <text
              x="225"
              y="64"
              fill="#FFC72C"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              5.2 km (Arteri 75+ Min)
            </text>
          </svg>

          <span className="absolute top-2 right-2.5 text-[9px] font-extrabold tracking-wider uppercase text-[#38BDF8] bg-[#003D4F]/90 px-2 py-0.5 rounded border border-[#00475B]">
            📐 ISOMETRIK KAVLING
          </span>
        </div>
      )}

      {/* --- SCENARIO 2: FLOOD VS AESTHETIC --- */}
      {scenarioId === "flood-vs-aesthetic" && option === "A" && (
        <div className="w-full h-full p-2.5 relative flex items-center justify-between z-10">
          <svg
            viewBox="0 0 320 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Elevated Hill Slope Cross-Section */}
            <path
              d="M20 85 Q110 80, 200 45 L300 25 L300 95 L20 95 Z"
              fill="#002B38"
              stroke="#00ED64"
              strokeWidth="1.5"
            />

            {/* Elevated House on Hilltop */}
            <rect
              x="190"
              y="15"
              width="45"
              height="28"
              rx="4"
              fill="#00475B"
              stroke="#00ED64"
              strokeWidth="1.2"
            />
            <path
              d="M185 15 L212 5 L240 15 Z"
              fill="#003D4F"
              stroke="#00ED64"
              strokeWidth="1.2"
            />
            <text
              x="212"
              y="32"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              RUMAH
            </text>

            {/* Height Elevation Marker */}
            <line
              x1="250"
              y1="20"
              x2="250"
              y2="85"
              stroke="#38BDF8"
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <text x="278" y="55" fill="#38BDF8" fontSize="9" fontWeight="bold">
              +48m dpl
            </text>

            {/* Natural Gravity Drainage Flow Arrow */}
            <path
              d="M180 50 Q120 70, 40 82"
              stroke="#00ED64"
              strokeWidth="2"
              markerEnd="url(#arrow)"
            />
            <text x="85" y="68" fill="#00ED64" fontSize="8" fontWeight="bold">
              Drainase Gravitasi Bebas Genangan ➔
            </text>
          </svg>

          <span className="absolute top-2 right-2.5 text-[9px] font-extrabold tracking-wider uppercase text-[#00ED64] bg-[#003D4F]/90 px-2 py-0.5 rounded border border-[#00475B]">
            📐 POTONGAN ELEVASI
          </span>
        </div>
      )}

      {scenarioId === "flood-vs-aesthetic" && option === "B" && (
        <div className="w-full h-full p-2.5 relative flex items-center justify-between z-10">
          <svg
            viewBox="0 0 320 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Lowland Basin Valley Profile */}
            <path
              d="M20 35 L70 35 Q120 75, 180 75 L260 75 Q280 50, 300 45 L300 95 L20 95 Z"
              fill="#002838"
              stroke="#38BDF8"
              strokeWidth="1.5"
            />

            {/* Luxury High Ceiling Villa in Basin */}
            <rect
              x="140"
              y="42"
              width="60"
              height="32"
              rx="4"
              fill="#00475B"
              stroke="#00ED64"
              strokeWidth="1.2"
            />
            <text
              x="170"
              y="58"
              fill="#FFFFFF"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
            >
              VILLA ESTETIK
            </text>
            <text
              x="170"
              y="68"
              fill="#00ED64"
              fontSize="7"
              textAnchor="middle"
            >
              High Ceiling
            </text>

            {/* Polder Dyke & Electric Pump Schematic */}
            <rect
              x="65"
              y="45"
              width="22"
              height="28"
              rx="3"
              fill="#3D1E1A"
              stroke="#FF7E67"
              strokeWidth="1.2"
            />
            <text
              x="76"
              y="58"
              fill="#FF7E67"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
            >
              POMPA
            </text>
            <text x="76" y="68" fill="#FF7E67" fontSize="6" textAnchor="middle">
              POLDER
            </text>

            {/* Lowland Elevation Marker */}
            <text x="215" y="70" fill="#FFC72C" fontSize="8" fontWeight="bold">
              Elevasi +8m dpl (Rawan Luapan)
            </text>
          </svg>

          <span className="absolute top-2 right-2.5 text-[9px] font-extrabold tracking-wider uppercase text-[#FF7E67] bg-[#381612]/90 px-2 py-0.5 rounded border border-[#5C231D]">
            📐 SKETSA POLDER
          </span>
        </div>
      )}

      {/* --- SCENARIO 3: ESTABLISHED VS QUIET CLUSTER --- */}
      {scenarioId === "established-vs-quiet" && option === "A" && (
        <div className="w-full h-full p-2.5 relative flex items-center justify-between z-10">
          <svg
            viewBox="0 0 320 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* 500m Walkable Radius Circle */}
            <circle
              cx="150"
              cy="50"
              r="42"
              fill="#002F3F"
              stroke="#00ED64"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />

            {/* Center Home */}
            <circle cx="150" cy="50" r="8" fill="#00ED64" />
            <text
              x="150"
              y="53"
              fill="#001E2B"
              fontSize="8"
              fontWeight="900"
              textAnchor="middle"
            >
              H
            </text>

            {/* Walkable Nodes in 500m Grid */}
            <rect
              x="175"
              y="20"
              width="55"
              height="18"
              rx="6"
              fill="#003D4F"
              stroke="#38BDF8"
              strokeWidth="1"
            />
            <text
              x="202"
              y="32"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
            >
              🛒 Minimarket
            </text>

            <rect
              x="65"
              y="30"
              width="55"
              height="18"
              rx="6"
              fill="#003D4F"
              stroke="#38BDF8"
              strokeWidth="1"
            />
            <text
              x="92"
              y="42"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
            >
              🏥 Klinik 24 Jam
            </text>

            <rect
              x="160"
              y="70"
              width="55"
              height="18"
              rx="6"
              fill="#003D4F"
              stroke="#38BDF8"
              strokeWidth="1"
            />
            <text
              x="187"
              y="82"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="bold"
              textAnchor="middle"
            >
              🏫 Sekolah / Kuliner
            </text>

            <text x="240" y="60" fill="#00ED64" fontSize="8" fontWeight="bold">
              Radius 500m Jalan Kaki Hidup
            </text>
          </svg>

          <span className="absolute top-2 right-2.5 text-[9px] font-extrabold tracking-wider uppercase text-[#00ED64] bg-[#003D4F]/90 px-2 py-0.5 rounded border border-[#00475B]">
            📐 PETA RADIUS JALAN
          </span>
        </div>
      )}

      {scenarioId === "established-vs-quiet" && option === "B" && (
        <div className="w-full h-full p-2.5 relative flex items-center justify-between z-10">
          <svg
            viewBox="0 0 320 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Gated Cluster Perimeter Wall */}
            <rect
              x="30"
              y="18"
              width="160"
              height="68"
              rx="10"
              fill="#002D3B"
              stroke="#38BDF8"
              strokeWidth="1.5"
            />

            {/* 8m Wide Boulevard Road */}
            <rect x="85" y="18" width="40" height="68" fill="#001E2B" />
            <line
              x1="105"
              y1="20"
              x2="105"
              y2="84"
              stroke="#E1E5E8"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <text
              x="105"
              y="55"
              fill="#38BDF8"
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
              transform="rotate(-90 105 55)"
            >
              ROW 8 METER
            </text>

            {/* Gated Security Gate */}
            <rect
              x="25"
              y="44"
              width="22"
              height="16"
              rx="4"
              fill="#00475B"
              stroke="#00ED64"
              strokeWidth="1.2"
            />
            <text
              x="36"
              y="55"
              fill="#00ED64"
              fontSize="6"
              fontWeight="bold"
              textAnchor="middle"
            >
              1-GATE
            </text>

            {/* Homes along quiet boulevard */}
            <rect
              x="42"
              y="24"
              width="36"
              height="22"
              rx="4"
              fill="#003D4F"
              stroke="#38BDF8"
              strokeWidth="1"
            />
            <text x="60" y="38" fill="#FFFFFF" fontSize="7" textAnchor="middle">
              Privasi A
            </text>

            <rect
              x="135"
              y="24"
              width="45"
              height="22"
              rx="4"
              fill="#003D4F"
              stroke="#38BDF8"
              strokeWidth="1"
            />
            <text
              x="157"
              y="38"
              fill="#FFFFFF"
              fontSize="7"
              textAnchor="middle"
            >
              Privasi B
            </text>

            {/* Distance to Outpost */}
            <text x="205" y="50" fill="#A8B3BC" fontSize="8" fontWeight="bold">
              Kantung Hening
            </text>
            <text x="205" y="62" fill="#FFC72C" fontSize="7" textAnchor="start">
              Minimarket 3.5 km
            </text>
          </svg>

          <span className="absolute top-2 right-2.5 text-[9px] font-extrabold tracking-wider uppercase text-[#38BDF8] bg-[#003D4F]/90 px-2 py-0.5 rounded border border-[#00475B]">
            📐 DENAH ONE-GATE
          </span>
        </div>
      )}
    </div>
  )
}
