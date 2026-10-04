import { ArrowRight, Check } from "lucide-react";

interface CircularProgressCTAProps {
  currentStep: number;
  totalSteps: number;
  isComplete?: boolean;
  disabled?: boolean;
  onNext: () => void;
}

export default function CircularProgressCTA({
  currentStep,
  totalSteps,
  isComplete,
  disabled,
  onNext,
}: CircularProgressCTAProps) {
  const size = 68;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressFraction = Math.min(1, Math.max(0, currentStep / totalSteps));
  const strokeDashoffset = circumference - progressFraction * circumference;

  return (
    <div className="relative inline-flex items-center justify-center select-none">
      {/* SVG Progress Ring */}
      <svg width={size} height={size} className="transform -rotate-90 pointer-events-none">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E1E5E8"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Active Animated Progress Stroke */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#00ED64"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>

      {/* Inner Push Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        aria-label={isComplete ? "Selesai" : "Lanjut ke langkah berikutnya"}
        className="absolute inset-[6px] rounded-full bg-[#001E2B] hover:bg-[#0F2B38] text-white flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {isComplete ? (
          <Check size={20} className="text-[#00ED64] stroke-[3]" />
        ) : (
          <ArrowRight
            size={20}
            className="text-[#00ED64] group-hover:translate-x-0.5 transition-transform"
          />
        )}
      </button>
    </div>
  );
}
