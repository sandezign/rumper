import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export function clamp(s: string, n = 140) {
  const t = (s ?? "").trim();
  return t.length > n ? t.slice(0, n).trimEnd() + "…" : t;
}

/** Truncated text with a tooltip carrying the full value when clamped. Keeps long claims/
 *  limitations from becoming walls of text while the full text stays one hover/focus away. */
export function Clamped({
  text,
  max = 140,
  className,
}: {
  text: string;
  max?: number;
  className?: string;
}) {
  const short = clamp(text, max);
  if (short === (text ?? "").trim()) return <span className={className}>{text}</span>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className} tabIndex={0}>
          {short}
        </span>
      </TooltipTrigger>
      <TooltipContent>{text}</TooltipContent>
    </Tooltip>
  );
}
