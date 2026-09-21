import { type ComponentMeta } from "./meta.types";

export const buttonMeta: ComponentMeta = {
  component: {
    name: "Button",
    category: "atoms",
    type: "interactive",
    description: "Primary user action component for confirming, submitting, or navigating.",
    path: "@/components/ui/button",
  },

  props: {
    variant: {
      type: "'primary' | 'default' | 'secondary' | 'outline' | 'ghost' | 'outlineOnDark' | 'destructive' | 'link'",
      required: false,
      default: "'default'",
      description: "Visual style reflecting the button's priority on the page.",
    },
    size: {
      type: "'default' | 'sm' | 'lg' | 'icon' | 'iconSm'",
      required: false,
      default: "'default'",
      description: "Dimensions and padding of the button.",
    },
    asChild: {
      type: "boolean",
      required: false,
      default: false,
      description: "If true, renders as its child element (useful for Next.js/React Router Links).",
    }
  },

  variants: {
    axes: {
      variant: ["primary", "default", "secondary", "outline", "ghost", "outlineOnDark", "destructive", "link"],
      size: ["default", "sm", "lg", "icon", "iconSm"]
    },
    purpose: {
      "variant.primary": "The main call to action on a page or section (uses brand green).",
      "variant.default": "Alias for primary.",
      "variant.secondary": "Alternative actions that shouldn't compete with the primary button.",
      "variant.outline": "Alias for secondary.",
      "variant.ghost": "Low-priority actions, often used for generic tertiary links or tools.",
      "variant.outlineOnDark": "Secondary action placed on deep-teal/dark surfaces.",
      "variant.destructive": "Actions that delete data or have severe consequences.",
      "variant.link": "Actions that navigate away or act like a hyperlink.",
      "size.default": "Standard hit target (min-h-11) used for most forms and CTAs.",
      "size.sm": "Compact tables or dense interfaces.",
      "size.lg": "Hero sections or major marketing decisions.",
      "size.icon": "Square hit target (44x44px) for standalone icons.",
      "size.iconSm": "Small square hit target (36x36px) for compact icon-only actions.",
    },
    invalidCombinations: [
      {
        axes: { variant: "link", size: "icon" },
        reason: "Link variants should wrap text, not standalone icons."
      },
      {
        axes: { variant: "primary", size: "iconSm" },
        reason: "Primary actions must always be highly visible and accessible; iconSm is too small."
      }
    ]
  },

  relationships: {
    role: "button",
    keyboardSupport: "Focusable via Tab. Activates on Space or Enter.",
    screenReader: "Announces as 'button'. Requires an aria-label if size='icon' or 'iconSm' and no text is provided.",
  },

  tokens: {
    color: {
      "button-bg-primary": "var(--brand-green)",
      "button-text-primary": "var(--text-on-primary)",
      "button-bg-hover": "var(--brand-green-hover)",
    },
    border: {
      "button-radius": "var(--radius-full)"
    }
  },

  aiHints: {
    priority: "high",
    keywords: ["cta", "submit", "action", "click"],
    selectionCriteria: {
      "isPrimaryAction": "Use variant='primary'. Limit to one per view/section.",
      "isSecondaryAction": "Use variant='secondary' next to a primary button.",
      "isDestructive": "Use variant='destructive' for deletions."
    },
    usage: {
      useCases: ["Form submission", "Dialog confirmation", "Navigation triggers"],
      commonPatterns: [
        {
          name: "Action Bar",
          composition: "<Button variant='secondary'>Cancel</Button> <Button variant='primary'>Save</Button>"
        }
      ],
      antiPatterns: [
        {
          scenario: "Two primary buttons side-by-side.",
          reason: "Creates conflicting visual hierarchy and confuses the user.",
          alternative: "Use one variant='primary' and one variant='secondary'."
        },
        {
          scenario: "Using a bright green button to mean 'safe' or 'verified'.",
          reason: "Bright green is strictly a brand/action color, not a semantic success color.",
          alternative: "Use semantic badges for verification status."
        },
        {
          scenario: "Placing an icon in size='default' without text.",
          reason: "It will look unbalanced because padding expects text.",
          alternative: "Use size='icon' for icon-only buttons."
        }
      ]
    }
  }
};
