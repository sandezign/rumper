import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Semantic badges always pair color with text (and an icon at the call site).
// Brand-green is NEVER used to imply positive / safe / verified.
const badgeVariants = cva(
  "inline-flex items-center gap-xxs rounded-full px-sm py-xxs text-caption-bold leading-none",
  {
    variants: {
      variant: {
        neutral: "bg-border-neutral text-text-secondary",
        outline: "border border-border-strong text-text-secondary",
        positive: "bg-semantic-positive-bg text-semantic-positive-text",
        warning: "bg-semantic-warning-bg text-semantic-warning-text",
        danger: "bg-semantic-danger-bg text-semantic-danger-text",
        unknown: "bg-semantic-unknown-bg text-semantic-unknown-text",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
