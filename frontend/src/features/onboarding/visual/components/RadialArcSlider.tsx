import React, { useCallback, useRef, useState } from "react";
import { TrainFront } from "lucide-react";

interface RadialArcSliderProps {
  value: number; // in minutes (e.g. 15 to 90)
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export default function RadialArcSlider({
  value,
  min = 15,
  max = 90,
  onChange,
}: RadialArcSliderProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Angle ranges from -180 (left) to 0 (right) -> 180° semi-circle arc
  const angleFromValue = (v: number) => {
    const fraction = (v - min) / (max - min);
    return Math.PI + fraction * Math.PI; // from π (180°) to 2π (360°/0°)
  };

  const valueFromAngle = (angleRad: number) => {
    let normalized = angleRad;
    if (normalized > 0) normalized = -Math.PI;
    const fraction = (normalized + Math.PI) / Math.PI;
    const clampedFraction = Math.max(0, Math.min(1, fraction));
    const rawVal = min + clampedFraction * (max - min);
    return Math.round(rawVal / 5) * 5;
  };

  const handlePointer = useCallback(
    (e: React.PointerEvent<SVGSVGElement> | PointerEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height * 0.85;

      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      const angle = Math.atan2(dy, dx);
      if (dy <= 40) {
        const newVal = valueFromAngle(angle);
        onChange(newVal);
      }
    },
    [min, max, onChange]
  );

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    handlePointer(e);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isDragging) {
      handlePointer(e);
    }
  };

  const onPointerUp = (e: React.PointerEvent<SVGSVGElement>) => {
    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const size = 300;
  const cx = size / 2;
  const cy = size * 0.78;
  const r = 110;

  const trackPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const currentAngle = angleFromValue(value);
  const thumbX = cx + r * Math.cos(currentAngle);
  const thumbY = cy + r * Math.sin(currentAngle);
  const activeArcPath = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${thumbX} ${thumbY}`;

  const getTone = () => {
    if (value <= 35) return { color: "#00ED64", label: "Santai & Dekat", bg: "bg-[#E9F5EF]", text: "text-[#004F38]" };
    if (value <= 55) return { color: "#00B545", label: "Ideal & Populer", bg: "bg-[#E9F5EF]", text: "text-[#004F38]" };
    if (value <= 70) return { color: "#D4A017", label: "Kompromi Wajar", bg: "bg-[#FFF9E6]", text: "text-[#6E4E00]" };
    return { color: "#7C8C9A", label: "Jangkauan Jauh", bg: "bg-[#F4F7F8]", text: "text-[#5C6C7A]" };
  };

  const tone = getTone();

  return (
    <div className="flex flex-col items-center select-none w-full mx-auto rounded-2xl border border-[#E1E5E8] bg-[#F9FBFA] px-4 py-5">
      {/* Dynamic Central Readout */}
      <div className="text-center mb-1">
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="text-4xl sm:text-5xl font-black text-[#001E2B] tabular-nums tracking-tight">
            ~{value}
          </span>
          <span className="text-lg font-extrabold text-[#5C6C7A]">Menit</span>
        </div>
        <div className="mt-1.5 flex justify-center">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${tone.bg} ${tone.text} border-current/20 shadow-2xs`}
          >
            {tone.label}
          </span>
        </div>
      </div>

      {/* SVG Arc Gauge */}
      <div className="relative w-full aspect-[1.4/1] max-w-[300px]">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${size} ${size * 0.9}`}
          className="w-full h-full cursor-pointer touch-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Background Inactive Arc Track */}
          <path
            d={trackPath}
            fill="none"
            stroke="#E1E5E8"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Active Colored Arc Track */}
          <path
            d={activeArcPath}
            fill="none"
            stroke={tone.color}
            strokeWidth="16"
            strokeLinecap="round"
            className="transition-colors duration-200"
          />

          {/* Drag Thumb Handle */}
          <g transform={`translate(${thumbX}, ${thumbY})`}>
            <circle r="18" fill="white" filter="drop-shadow(0 4px 8px rgba(0,30,43,0.18))" />
            <circle r="10" fill="#001E2B" />
            <circle r="4" fill={tone.color} />
          </g>
        </svg>

        <span className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-white border border-[#E1E5E8] text-[#003D4F] flex items-center justify-center">
          <TrainFront size={21} strokeWidth={2.1} aria-hidden="true" />
        </span>

        {/* Tick labels */}
        <div className="absolute inset-x-2 bottom-4 flex justify-between text-[11px] font-bold text-[#7C8C9A]">
          <span>15 m</span>
          <span>45 m</span>
          <span>90 m</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="grid grid-cols-4 gap-2 mt-2 w-full">
        {[20, 35, 50, 65].map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            className={`min-h-[40px] px-2 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#00684A]/20 ${
              value === preset
                ? "bg-[#001E2B] text-white shadow-2xs"
                : "bg-white border border-[#D7E1E5] text-[#3D4F5B] hover:bg-[#F4F7F6]"
            }`}
          >
            {preset} m
          </button>
        ))}
      </div>
    </div>
  );
}
