# Design System: Rumper
**Project ID:** rumper-launch/rumper-app

## 1. Visual Theme & Atmosphere
Airy, calm, structured, and evidence-led. The aesthetic philosophy emphasizes a dual-mode surface strategy: predominantly white and soft pale-green canvases paired with striking deep-teal regions for heroes and major calls to action. The interface focuses on B2C property decision-support, presenting risk and evidence clearly without being overly decorative. It protects rather than frightens, favoring flat surfaces and subtle, border-driven elevation to maintain structural clarity.

## 2. Color Palette & Roles
* **Vibrant Mint Green** (`#00ed64`) - *Used for primary actions, buttons, and restrained brand accents.*
* **Deep Teal / Navy** (`#001e2b`) - *Used as a dominant surface for heroes, major CTAs, footer regions, and as the primary text color (ink) on light backgrounds.*
* **White Canvas** (`#ffffff`) - *Used as the primary background for long-form reading, evidence tables, cards, and forms.*
* **Soft Recessed Gray** (`#f9fbfa` to `#f4f7f6`) - *Used for quiet section backgrounds, secondary groupings, and recessed control areas.*
* **Pale Mint Feature** (`#e3fcef`) - *Used for non-semantic feature emphasis (never for semantic success/validation).*
* **Muted Slate Gray** (`#5c6c7a`) - *Used for tertiary text, metadata, and indicating unknown/missing evidence.*
* **Semantic Positive Pine** (`#318266`) - *Used specifically to denote verified supporting evidence only.*
* **Semantic Warning Gold** (`#d79a2b`) - *Used for areas requiring validation or caution.*
* **Semantic Danger Terracotta** (`#c95746`) - *Used to indicate confirmed high risk or destructive actions.*
* **Hairline Border Gray** (`#e1e5e8`) - *Used for default card borders, dividers, and quiet controls.*

## 3. Typography Rules
The primary font family is **DM Sans**, used comprehensively for display, body, labels, and controls. The design relies heavily on weight and size contrasts to establish hierarchy, using sentence case for most elements, and reserving uppercase for micro-labels (eyebrows/categories).
* **Headings:** Range from `500` (Medium) to `600` (Semi-bold), with tight line heights (1.10 - 1.30) to feel solid and balanced. 
* **Body:** Typically `400` (Regular) at 16px with comfortable line heights (1.50 - 1.55) to enhance legibility on reading surfaces.
* **Technical Data:** A system monospace font is strictly reserved for evidence IDs, timestamps, and aligned technical values.

## 4. Component Stylings
* **Buttons:** Pill-shaped (fully rounded corners, `rounded-full`), generously padded (min 44px target). Primary buttons use Vibrant Mint Green (`#00ed64`) with Deep Teal (`#001e2b`) text.
* **Cards/Containers:** Flat, border-driven aesthetic. Standard cards feature subtly rounded corners (`12px`), a hairline gray border (`#e1e5e8`), a white background, and no default shadow. Feature panels use slightly larger rounded corners (`16px`) with pale-green or deep-teal backgrounds. Shadows are strictly reserved for raised previews, popovers, and dialogs.
* **Inputs/Forms:** Compact with slightly rounded corners (`8px`). They feature a white background, strong gray borders (`#c1ccd6`), and a prominent dark-green focus ring (`#00684a`) when active. Labels are persistently visible.

## 5. Layout Principles
The layout strategy prioritizes readability and structural flow from mobile-first. 
* **Whitespace & Rhythm:** Utilizes a 4px base unit, strongly preferring 8px increments (e.g., 20px, 24px, 32px for padding). Sections are separated by generous spacing (48px, 64px, 96px) to let content breathe without introducing unnecessary decoration.
* **Alignment & Grids:** Content is rigidly aligned to shared grids, shifting from single-column on mobile to selective two/three-column layouts on wider screens (up to a 1280px max container). 
* **Hierarchy:** One dominant action per decision point. Evidence and limitations are grouped closely with their relevant findings rather than isolated at the bottom of the page. Horizontal scrolling is completely avoided.
