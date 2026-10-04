import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Our composite typography classes (text-heading-1, text-button, …) set font-size/weight/
// line-height, NOT color. Register them in the `font-size` group so tailwind-merge treats
// them as size-like (a later one overrides an earlier one) but does NOT strip a `text-<color>`
// utility applied alongside them (e.g. `text-button text-text-on-dark`).
const TYPOGRAPHY = [
  "hero-display", "display-lg",
  "heading-1", "heading-2", "heading-3", "heading-4", "heading-5",
  "subtitle", "body", "body-medium", "body-sm", "body-sm-medium",
  "caption", "caption-bold", "micro", "micro-uppercase", "button", "code",
];

const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: TYPOGRAPHY }] } },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
