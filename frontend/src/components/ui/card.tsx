import * as React from "react";
import { cn } from "@/lib/utils";

// Standard card: white canvas, hairline border, 12px radius, no default shadow.
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-lg border border-border bg-card p-xl text-card-foreground", className)}
      {...props}
    />
  ),
);
Card.displayName = "Card";

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-xxs", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-heading-5 text-foreground", className)} {...props} />;
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-body-sm text-text-secondary", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardContent };
