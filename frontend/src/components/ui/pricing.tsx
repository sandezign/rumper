import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingColumn, PricingColumnProps } from "@/components/ui/pricing-utils/pricing-column";
import { Section } from "@/components/ui/pricing-utils/section";

export interface PricingProps {
  title?: string | false;
  description?: string | false;
  plans?: PricingColumnProps[] | false;
  className?: string;
}

const DEFAULT_PRICING_PLANS: PricingColumnProps[] = [
  {
    name: "Cek Awal",
    description: "Untuk melihat apakah lokasi layak diperiksa lebih lanjut.",
    price: 0,
    priceNote: "",
    cta: {
      variant: "outline",
      label: "Mulai gratis",
      href: "#cek",
    },
    features: [
      "1 pengecekan lokasi",
      "Peringatan keselamatan utama",
      "Ringkasan faktor lokasi",
    ],
    variant: "default",
  },
  {
    name: "Laporan Lengkap",
    badge: "Untuk 1 properti",
    icon: <User className="size-4" />,
    description: "Untuk properti yang sudah masuk shortlist serius.",
    price: 49000,
    priceNote: "",
    cta: {
      variant: "glow-brand",
      label: "Cek lokasi lengkap",
      href: "#cek",
    },
    features: [
      "Laporan bukti lebih dalam",
      "Panduan validasi lapangan",
      "Checklist pasca-kunjungan",
    ],
    variant: "glow-brand",
  },
  {
    name: "Akses 30 Hari",
    icon: <Users className="size-4" />,
    description: "Untuk masa pencarian aktif dan perbandingan beberapa rumah.",
    price: 129000,
    priceNote: "/ 30 hari",
    cta: {
      variant: "outline",
      label: "Pilih pass",
      href: "#cek",
    },
    features: [
      "Hingga 5 properti",
      "Perbandingan lokasi",
      "Multi-commute & matriks perbandingan",
    ],
    variant: "default",
  },
];

export default function Pricing({
  title = "Pilih sesuai fase pencarian rumah Anda.",
  description = "Mulai dari satu pengecekan, lalu naik ke paket pencarian aktif ketika Anda membandingkan beberapa properti.",
  plans = DEFAULT_PRICING_PLANS,
  className = "",
}: PricingProps) {
  return (
    <Section className={cn("bg-[#f1f6f3]", className)} id="harga">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-12 px-4 sm:px-6">
        {(title || description) && (
          <div className="flex flex-col items-center gap-4 text-center sm:gap-6">
            <span className="inline-flex items-center gap-2 text-xs font-extrabold tracking-widest text-[#00684a] uppercase">
              <span className="size-2 rounded-full bg-[#00ed64] shadow-[0_0_0_4px_rgba(25,231,127,0.14)]" />
              Harga
            </span>
            {title && (
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#001e2b] leading-tight max-w-[700px]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-base sm:text-lg text-[#5c6c7a] max-w-[620px] font-normal leading-relaxed">
                {description}
              </p>
            )}
          </div>
        )}
        {plans !== false && plans.length > 0 && (
          <div className="w-full grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {plans.map((plan) => (
              <PricingColumn
                key={plan.name}
                name={plan.name}
                icon={plan.icon}
                badge={plan.badge}
                description={plan.description}
                price={plan.price}
                originalPrice={plan.originalPrice}
                promotionText={plan.promotionText}
                priceNote={plan.priceNote}
                cta={plan.cta}
                features={plan.features}
                variant={plan.variant}
                className={plan.className}
              />
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
