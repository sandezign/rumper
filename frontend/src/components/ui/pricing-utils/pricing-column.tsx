import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PricingColumnProps {
  name: string;
  icon?: ReactNode;
  badge?: string;
  description?: string;
  price: number | string;
  originalPrice?: number | string;
  promotionText?: string;
  priceNote?: string;
  cta: {
    variant?: "default" | "glow" | "glow-brand" | "outline" | "secondary";
    label: string;
    href?: string;
    onClick?: () => void;
  };
  features: string[];
  variant?: "default" | "glow" | "glow-brand" | "featured" | string;
  className?: string;
}

export function PricingColumn({
  name,
  icon,
  badge,
  description,
  price,
  promotionText,
  priceNote,
  cta,
  features,
  variant = "default",
  className,
}: PricingColumnProps) {
  const isFeatured = variant === "glow-brand" || variant === "featured" || cta.variant === "glow-brand";
  const displayBadge = badge || promotionText;

  const formattedPrice =
    typeof price === "number"
      ? price === 0
        ? "Rp0"
        : `Rp${price.toLocaleString("id-ID")}`
      : price;

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-[28px] bg-white p-8 sm:p-9 transition-all duration-200",
        isFeatured
          ? "border-[1.5px] border-[#00ed64] shadow-[0_20px_48px_-12px_rgba(0,237,100,0.22),0_0_0_1px_#00ed64]"
          : "border border-[rgba(7,38,58,0.08)] shadow-[0_4px_20px_-2px_rgba(0,30,43,0.03)] hover:-translate-y-1 hover:shadow-[0_16px_36px_-6px_rgba(0,30,43,0.08)]",
        className
      )}
    >
      {displayBadge && (
        <span className="absolute top-6 right-6 inline-flex items-center rounded-full bg-[#dcfce7] px-3 py-1 text-[11.5px] font-bold text-[#15803d]">
          {displayBadge}
        </span>
      )}

      <div className="mb-1 flex items-center gap-2">
        <h3 className="text-xl font-extrabold tracking-tight text-[#001e2b]">{name}</h3>
        {icon && <span className="text-[#5c6c7a]">{icon}</span>}
      </div>

      {description && (
        <p className="min-h-[38px] text-[13.5px] leading-relaxed text-[#5c6c7a]">
          {description}
        </p>
      )}

      <div className="my-5 flex items-baseline gap-1.5 font-['DM_Sans',sans-serif] text-[44px] font-extrabold leading-none tracking-[-0.04em] text-[#001e2b]">
        <span>{formattedPrice}</span>
        {priceNote && (
          <small className="font-['DM_Sans',sans-serif] text-sm font-semibold tracking-normal text-[#5c6c7a]">
            {priceNote}
          </small>
        )}
      </div>

      <ul className="my-6 flex-grow space-y-2.5">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2.5 text-sm text-[#536b75]">
            <Check className="size-4 shrink-0 text-[#00ed64] stroke-[3]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-2">
        {cta.href ? (
          <Button
            asChild
            className={cn(
              "w-fit rounded-xl px-6 py-3 text-sm font-bold transition-all",
              isFeatured
                ? "bg-[#00ed64] text-[#001e2b] shadow-[0_4px_14px_rgba(0,237,100,0.35)] hover:bg-[#00df5b] hover:shadow-[0_6px_18px_rgba(0,237,100,0.45)]"
                : "border border-[#d7e1e5] bg-white text-[#001e2b] shadow-xs hover:border-[#c1ccd6] hover:bg-[#f8faf9]"
            )}
          >
            <a href={cta.href}>{cta.label}</a>
          </Button>
        ) : (
          <Button
            onClick={cta.onClick}
            className={cn(
              "w-fit rounded-xl px-6 py-3 text-sm font-bold transition-all",
              isFeatured
                ? "bg-[#00ed64] text-[#001e2b] shadow-[0_4px_14px_rgba(0,237,100,0.35)] hover:bg-[#00df5b] hover:shadow-[0_6px_18px_rgba(0,237,100,0.45)]"
                : "border border-[#d7e1e5] bg-white text-[#001e2b] shadow-xs hover:border-[#c1ccd6] hover:bg-[#f8faf9]"
            )}
          >
            {cta.label}
          </Button>
        )}
      </div>
    </div>
  );
}
