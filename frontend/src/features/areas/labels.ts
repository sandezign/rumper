// Fit-category vocabulary, in one place.
//
// The areas API also returns `category_label`, but the Indonesian wording is a front-end
// concern — the contract is the category *key*. Keeping the labels here means the map rail,
// the filter chips, the cards and the adapter cannot drift apart.
import type { FitCategory as ApiFitCategory } from "./api";
import type { FitCategory as ViewFitCategory } from "./data/mockCuratedAreas";

export const CATEGORY_LABEL: Record<ApiFitCategory, string> = {
  strong_fit: "Paling Sesuai",
  interesting_tradeoff: "Moderate",
  challenge_assumptions: "Alternatif",
};

/** The view components use kebab-case ids (inherited from the reference), the API snake. */
export const TO_VIEW_CATEGORY: Record<ApiFitCategory, ViewFitCategory> = {
  strong_fit: "strong-fit",
  interesting_tradeoff: "interesting-tradeoff",
  challenge_assumptions: "challenge-assumptions",
};

export const TO_API_CATEGORY: Record<ViewFitCategory, ApiFitCategory> = {
  "strong-fit": "strong_fit",
  "interesting-tradeoff": "interesting_tradeoff",
  "challenge-assumptions": "challenge_assumptions",
};
